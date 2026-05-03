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
  Fade,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Star,
  StarBorder,
  Delete,
  Send,
  ExpandMore,
  ExpandLess,
  Verified,
} from '@mui/icons-material';
import { reviewAPI } from '../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

// ─── 4 COULEURS UNIQUEMENT ──────────────────────────────────────
const COLORS = {
  teal: '#0EA5A0',
  navy: '#0F2D5C',
  amber: '#D97706',
  white: '#FFFFFF',
};

// ─── Styled Components ──────────────────────────────────────────
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 4,
  marginTop: theme.spacing(2),
  border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
  backgroundColor: COLORS.white,
  boxShadow: `0 2px 12px ${alpha(COLORS.navy, 0.08)}`,
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
  borderRadius: 12,
  border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
  backgroundColor: COLORS.white,
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: alpha(COLORS.teal, 0.3),
    boxShadow: `0 4px 12px ${alpha(COLORS.navy, 0.08)}`,
  },
}));

const GradientButton = styled(Button)({
  background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navy})`,
  borderRadius: 10,
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.85rem',
  color: COLORS.white,
  padding: '8px 20px',
  '&:hover': {
    background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.teal})`,
    transform: 'translateY(-1px)',
  },
  '&:disabled': {
    background: alpha(COLORS.navy, 0.4),
  },
});

const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.7rem',
  height: 22,
  borderRadius: 8,
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
  const { token, user } = useSelector((state: RootState) => state.auth);
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());

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

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: total > 0 ? (reviews.filter(r => r.rating === star).length / total) * 100 : 0,
  }));

  const userReview = token ? reviews.find(r => r.user.id === user?.id) : null;

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return COLORS.teal;
      case 'pending': return COLORS.amber;
      default: return COLORS.navy;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Approuvé';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={40} sx={{ color: COLORS.teal }} />
      </Box>
    );
  }

  return (
    <StyledPaper>
      <Typography variant="h5" fontWeight={800} sx={{ color: COLORS.navy, mb: 3, letterSpacing: '-0.02em' }}>
        Avis et notes
      </Typography>

      {/* Rating Summary */}
      {total > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Typography variant="h2" fontWeight={800} sx={{ color: COLORS.teal }}>
              {avgRating.toFixed(1)}
            </Typography>
            <Rating value={avgRating} precision={0.5} readOnly size="large" sx={{ '& .MuiRating-iconFilled': { color: COLORS.amber } }} />
            <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6) }}>
              ({total} avis)
            </Typography>
          </Box>

          {/* Rating Distribution */}
          <Box sx={{ mt: 2 }}>
            {ratingDistribution.map(({ star, count, percentage }) => (
              <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="body2" sx={{ width: 20, color: COLORS.navy }}>{star}</Typography>
                <Star sx={{ fontSize: 16, color: COLORS.amber }} />
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{ 
                    flex: 1, 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: alpha(COLORS.teal, 0.1),
                    '& .MuiLinearProgress-bar': { backgroundColor: COLORS.teal, borderRadius: 4 }
                  }}
                />
                <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.5), width: 30 }}>
                  {count}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* No Reviews Yet */}
      {total === 0 && (
        <Fade in>
          <Box sx={{ textAlign: 'center', py: 4, mb: 3 }}>
            <StarBorder sx={{ fontSize: 48, color: alpha(COLORS.navy, 0.2), mb: 1 }} />
            <Typography variant="body1" sx={{ color: alpha(COLORS.navy, 0.6) }}>
              Aucun avis pour ce voyage. Soyez le premier à laisser un avis!
            </Typography>
          </Box>
        </Fade>
      )}

      {/* Review Form */}
      {token && !userReview && (
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: COLORS.navy, mb: 2 }}>
            Laisser un avis
          </Typography>
          
          {error && (
            <Fade in>
              <Alert severity="error" sx={{ mb: 2, borderRadius: 1, bgcolor: alpha(COLORS.amber, 0.05), borderLeft: `4px solid ${COLORS.amber}` }} onClose={() => setError(null)}>
                {error}
              </Alert>
            </Fade>
          )}
          
          {success && (
            <Fade in>
              <Alert severity="success" sx={{ mb: 2, borderRadius: 1, bgcolor: alpha(COLORS.teal, 0.05), borderLeft: `4px solid ${COLORS.teal}` }} onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            </Fade>
          )}

          <RatingBox>
            <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6) }}>Note:</Typography>
            <Rating
              value={rating}
              onChange={(_, newValue) => setRating(newValue)}
              size="large"
              sx={{ '& .MuiRating-iconFilled': { color: COLORS.amber } }}
            />
            {rating && (
              <Chip 
                label={`${rating}/5`} 
                size="small"
                sx={{ 
                  bgcolor: alpha(COLORS.amber, 0.1), 
                  color: COLORS.amber, 
                  fontWeight: 600, 
                  borderRadius: 8 
                }} 
                icon={<Star sx={{ color: COLORS.amber }} />}
              />
            )}
          </RatingBox>

          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Partagez votre expérience ..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': { borderColor: COLORS.teal },
                '&.Mui-focused fieldset': { borderColor: COLORS.teal },
              },
            }}
          />

          <GradientButton
            type="submit"
            disabled={!rating || submitting}
            startIcon={submitting ? <CircularProgress size={20} sx={{ color: COLORS.white }} /> : <Send />}
          >
            {submitting ? 'Envoi...' : 'Soumettre'}
          </GradientButton>
        </Box>
      )}

      {/* User review status alert */}
      {token && userReview && (
        <Fade in>
          <Alert 
            severity={userReview.status === 'approved' ? 'success' : 'warning'} 
            sx={{ 
              mb: 3, 
              borderRadius: 10,
              bgcolor: userReview.status === 'approved' ? alpha(COLORS.teal, 0.05) : alpha(COLORS.amber, 0.05),
              borderLeft: `4px solid ${userReview.status === 'approved' ? COLORS.teal : COLORS.amber}`,
            }}
          >
            {userReview.status === 'approved' 
              ? 'Merci pour votre avis!' 
              : 'Votre avis est en attente de validation par l\'organisateur.'}
          </Alert>
        </Fade>
      )}

      {!token && (
        <Fade in>
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 1, bgcolor: alpha(COLORS.amber, 0.05), borderLeft: `4px solid ${COLORS.amber}` }}>
            Connectez-vous pour laisser un avis.
          </Alert>
        </Fade>
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: COLORS.navy, mb: 2 }}>
            Tous les avis ({total})
          </Typography>

          {reviews.map((review) => {
            const isOwn = token && review.user.id === user?.id;
            return (
              <Fade in key={review.id} timeout={300}>
                <ReviewItem>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar sx={{ bgcolor: isOwn ? COLORS.teal : alpha(COLORS.navy, 0.7), color: COLORS.white }}>
                        {getInitials(review.user.first_name, review.user.last_name)}
                      </Avatar>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                          <Typography variant="subtitle1" fontWeight={700} sx={{ color: COLORS.navy }}>
                            {review.user.first_name} {review.user.last_name}
                          </Typography>
                          <Rating value={review.rating} readOnly size="small" sx={{ '& .MuiRating-iconFilled': { color: COLORS.amber } }} />
                          {isOwn && (
                            <StatusChip 
                              label={getStatusLabel(review.status)} 
                              size="small"
                              sx={{ bgcolor: alpha(getStatusColor(review.status), 0.1), color: getStatusColor(review.status) }}
                            />
                          )}
                        </Box>
                        
                        {review.comment ? (
                          <>
                            <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.7), lineHeight: 1.6 }}>
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
                                sx={{ color: COLORS.teal, textTransform: 'none', '&:hover': { bgcolor: 'transparent' } }}
                              >
                                {expandedReviews.has(review.id) ? 'Réduire' : 'Lire plus'}
                              </Button>
                            )}
                          </>
                        ) : null}
                        
                        <Typography variant="caption" sx={{ color: alpha(COLORS.navy, 0.5), mt: 1, display: 'block' }}>
                          {formatDate(review.created_at)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Delete button - only for own review */}
                    {token && review.user.id === user?.id && (
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(review.id)}
                        sx={{ color: COLORS.amber, '&:hover': { bgcolor: alpha(COLORS.amber, 0.1) } }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </ReviewItem>
              </Fade>
            );
          })}
        </Box>
      )}
    </StyledPaper>
  );
};

export default TripReviews;