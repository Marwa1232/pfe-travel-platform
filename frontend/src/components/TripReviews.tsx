import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Rating,
  Paper,
  Avatar,
  Button,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  LinearProgress,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Star,
  StarBorder,
  Delete,
  Send,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { reviewAPI } from '../services/api';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  marginTop: theme.spacing(2),
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
}));

const RatingBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

const ReviewItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1),
  backgroundColor: '#f8f9fa',
}));

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  status: string;
  created_at: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

interface TripReviewsProps {
  tripId: number;
  tripTitle?: string;
}

const TripReviews: React.FC<TripReviewsProps> = ({ tripId, tripTitle }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());
  
  // Auth check
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadReviews();
  }, [tripId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewAPI.getTripReviews(tripId);
      setReviews(response.data.reviews);
      setAvgRating(response.data.avg_rating);
      setTotal(response.data.total);
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating) {
      setError('Veuillez sélectionner une note');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await reviewAPI.createReview({
        trip_id: tripId,
        rating,
        comment: comment.trim() || undefined,
      });
      
      setSuccess('Votre avis a été soumis et est en attente de validation.');
      setRating(null);
      setComment('');
      loadReviews();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erreur lors de la soumission';
      const errorCode = err.response?.data?.code;
      
      if (errorCode === 'NO_BOOKING') {
        setError('Vous devez avoir réservé ce voyage pour laisser un avis');
      } else {
        setError(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre avis?')) {
      return;
    }

    try {
      await reviewAPI.deleteReview(reviewId);
      loadReviews();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  const toggleExpand = (reviewId: number) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: total > 0 ? (reviews.filter(r => r.rating === star).length / total) * 100 : 0,
  }));

  const userReview = token ? reviews.find(r => {
    const userId = JSON.parse(atob(token.split('.')[1])).id;
    return r.user.id === userId;
  }) : null;

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <StyledPaper>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#0D47A1' }}>
        Avis et notes
      </Typography>

      {/* Rating Summary */}
      {total > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#0D47A1' }}>
              {avgRating}
            </Typography>
            <Rating value={avgRating} precision={0.5} readOnly size="large" />
            <Typography variant="body2" color="text.secondary">
              ({total} avis)
            </Typography>
          </Box>

          {/* Rating Distribution */}
          <Box sx={{ mt: 2 }}>
            {ratingDistribution.map(({ star, count, percentage }) => (
              <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="body2" sx={{ width: 20 }}>{star}</Typography>
                <Star sx={{ fontSize: 16, color: '#FFC107' }} />
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{ flex: 1, height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ width: 30 }}>
                  {count}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* No Reviews Yet */}
      {total === 0 && (
        <Box sx={{ textAlign: 'center', py: 4, mb: 3 }}>
          <StarBorder sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            Aucun avis pour ce voyage. Soyez le premier à laisser un avis!
          </Typography>
        </Box>
      )}

      {/* Review Form */}
      {token && !userReview && (
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Laisser un avis</Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          <RatingBox>
            <Typography variant="body2">Note:</Typography>
            <Rating
              value={rating}
              onChange={(_, newValue) => setRating(newValue)}
              size="large"
            />
            {rating && (
              <Chip 
                label={`${rating}/5`} 
                color="primary" 
                size="small" 
                icon={<Star />}
              />
            )}
          </RatingBox>

          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Partagez votre expérience (optionnel)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={!rating || submitting}
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
            sx={{
              background: 'linear-gradient(90deg, #00BFA5, #0D47A1)',
              borderRadius: 2,
              px: 3,
            }}
          >
            {submitting ? 'Envoi...' : 'Soumettre'}
          </Button>
        </Box>
      )}

        {token && userReview && (
        <Alert severity={userReview.status === 'approved' ? 'success' : 'warning'} sx={{ mb: 3 }}>
          {userReview.status === 'approved' 
            ? 'Merci pour votre avis!' 
            : 'Votre avis est en attente de validation par l\'organisateur.'}
        </Alert>
      )}

      {!token && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Connectez-vous pour laisser un avis.
        </Alert>
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Tous les avis ({total})
          </Typography>

          {reviews.map((review) => (
            <ReviewItem key={review.id}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#0D47A1' }}>
                    {getInitials(review.user.first_name, review.user.last_name)}
                  </Avatar>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {review.user.first_name} {review.user.last_name}
                      </Typography>
                      <Rating value={review.rating} readOnly size="small" />
                    </Box>
                    
                    {review.comment ? (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {expandedReviews.has(review.id) 
                            ? review.comment 
                            : review.comment.length > 150 
                              ? review.comment.substring(0, 150) + '...'
                              : review.comment
                          }
                        </Typography>
                        {review.comment.length > 150 && (
                          <Button
                            size="small"
                            onClick={() => toggleExpand(review.id)}
                            startIcon={expandedReviews.has(review.id) ? <ExpandLess /> : <ExpandMore />}
                          >
                            {expandedReviews.has(review.id) ? 'Réduire' : 'Lire plus'}
                          </Button>
                        )}
                      </>
                    ) : null}
                    
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {formatDate(review.created_at)}
                    </Typography>
                  </Box>
                </Box>

                {/* Delete button - only for own review */}
                {token && JSON.parse(atob(token.split('.')[1])).id === review.user.id && (
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(review.id)}
                    sx={{ color: '#FF6B6B' }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </ReviewItem>
          ))}
        </Box>
      )}
    </StyledPaper>
  );
};

export default TripReviews;