import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Rating, Avatar, Button, TextField,
  Paper, Stack, Divider, Chip, CircularProgress, Alert,
  LinearProgress, Fade, Collapse, IconButton, alpha,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Star, StarBorder, ThumbUp, Edit, Delete, Send,
  ExpandMore, ExpandLess, FormatQuote,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

// ─── Styled ────────────────────────────────────────────────────────────────

const ReviewCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  border: '1px solid',
  borderColor: theme.palette.divider,
  transition: 'all 0.25s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
    transform: 'translateY(-2px)',
  },
}));

const RatingBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(0.75),
}));

const StarsInput = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
  '& .star-btn': {
    cursor: 'pointer',
    transition: 'transform 0.15s ease',
    '&:hover': { transform: 'scale(1.2)' },
  },
}));

// ─── Types ─────────────────────────────────────────────────────────────────

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  user: { id: number; first_name: string; last_name: string };
}

interface Props {
  tripId: number;
  tripTitle?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const API = 'http://localhost:8000';

const ratingLabels: Record<number, string> = {
  1: 'Très décevant',
  2: 'Décevant',
  3: 'Correct',
  4: 'Bien',
  5: 'Excellent !',
};

// ─── Component ─────────────────────────────────────────────────────────────

const TripReviews: React.FC<Props> = ({ tripId, tripTitle }) => {
  const { token, user } = useSelector((state: RootState) => state.auth);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    loadReviews();
  }, [tripId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/reviews/trip/${tripId}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setAvgRating(data.avg_rating || 0);
    } catch {
      setError('Impossible de charger les avis.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!token) { setError('Connectez-vous pour laisser un avis.'); return; }
    if (rating === 0) { setError('Veuillez sélectionner une note.'); return; }

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ trip_id: tripId, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la soumission');

      setSuccess('Merci pour votre avis ! Il a été publié.');
      setRating(0);
      setComment('');
      setShowForm(false);
      await loadReviews();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!token || !window.confirm('Supprimer cet avis ?')) return;
    try {
      await fetch(`${API}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadReviews();
    } catch {
      setError('Impossible de supprimer l\'avis.');
    }
  };

  // Compute distribution
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  const alreadyReviewed = reviews.some((r) => r.user.id === user?.id);

  return (
    <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
      {/* ── Header ── */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Avis des voyageurs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {reviews.length} avis pour ce voyage
          </Typography>
        </Box>
        {token && !alreadyReviewed && (
          <Button
            variant={showForm ? 'outlined' : 'contained'}
            startIcon={showForm ? <ExpandLess /> : <Edit />}
            onClick={() => setShowForm(!showForm)}
            sx={{ borderRadius: 3 }}
          >
            {showForm ? 'Annuler' : 'Donner mon avis'}
          </Button>
        )}
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {/* ── Summary ── */}
      {reviews.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} alignItems="center">
            {/* Big number */}
            <Box sx={{ textAlign: 'center', minWidth: 120 }}>
              <Typography variant="h2" fontWeight="bold" color="primary">
                {avgRating.toFixed(1)}
              </Typography>
              <Rating value={avgRating} precision={0.1} readOnly size="medium" />
              <Typography variant="caption" color="text.secondary">
                sur 5
              </Typography>
            </Box>

            {/* Distribution bars */}
            <Box sx={{ flex: 1, width: '100%' }}>
              {dist.map(({ star, count, pct }) => (
                <RatingBar key={star}>
                  <Typography variant="body2" sx={{ minWidth: 16 }}>
                    {star}
                  </Typography>
                  <Star sx={{ fontSize: 16, color: '#FFB400' }} />
                  <Box sx={{ flex: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: star >= 4 ? '#00BFA5' : star === 3 ? '#FFA726' : '#EF5350',
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 24 }}>
                    {count}
                  </Typography>
                </RatingBar>
              ))}
            </Box>

            {/* Tags */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {avgRating >= 4.5 && <Chip label="⭐ Recommandé" color="success" size="small" />}
              {avgRating >= 4 && <Chip label="👍 Très apprécié" color="primary" size="small" />}
              {reviews.length >= 10 && <Chip label="💬 Populaire" color="secondary" size="small" />}
            </Box>
          </Stack>
        </Box>
      )}

      {/* ── Alerts ── */}
      {error && (
        <Fade in>
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Fade>
      )}
      {success && (
        <Fade in>
          <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
            {success}
          </Alert>
        </Fade>
      )}

      {/* ── Review Form ── */}
      <Collapse in={showForm}>
        <Paper
          variant="outlined"
          sx={{ p: 3, mb: 4, borderRadius: 2, bgcolor: alpha('#00BFA5', 0.03), borderColor: 'primary.light' }}
        >
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Votre expérience
          </Typography>

          {/* Star selector */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Note globale *
            </Typography>
            <StarsInput>
              {[1, 2, 3, 4, 5].map((star) => (
                <Box
                  key={star}
                  className="star-btn"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  {star <= (hoverRating || rating) ? (
                    <Star sx={{ fontSize: 36, color: '#FFB400' }} />
                  ) : (
                    <StarBorder sx={{ fontSize: 36, color: '#FFB400' }} />
                  )}
                </Box>
              ))}
            </StarsInput>
            {(hoverRating || rating) > 0 && (
              <Typography variant="body2" color="primary" sx={{ mt: 0.5, fontWeight: 600 }}>
                {ratingLabels[hoverRating || rating]}
              </Typography>
            )}
          </Box>

          {/* Comment */}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Partagez votre expérience (optionnel)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Que pensez-vous de ce voyage ? Guide, hébergement, activités..."
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            endIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <Send />}
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            sx={{ borderRadius: 3, px: 3 }}
          >
            {submitting ? 'Publication...' : 'Publier mon avis'}
          </Button>
        </Paper>
      </Collapse>

      {/* ── Reviews List ── */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : reviews.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <FormatQuote sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Aucun avis pour le moment
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Soyez le premier à partager votre expérience !
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {reviews.map((review) => {
            const isExpanded = expandedId === review.id;
            const isLong = (review.comment?.length || 0) > 200;
            const isOwn = review.user.id === user?.id;

            return (
              <Fade in key={review.id}>
                <ReviewCard elevation={0}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: isOwn ? 'primary.main' : 'grey.400',
                          width: 44,
                          height: 44,
                          fontWeight: 700,
                        }}
                      >
                        {review.user.first_name[0]}{review.user.last_name[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {review.user.first_name} {review.user.last_name}
                          {isOwn && (
                            <Chip label="Vous" size="small" color="primary" sx={{ ml: 1, height: 18, fontSize: '0.65rem' }} />
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(review.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'long', year: 'numeric',
                          })}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Rating value={review.rating} readOnly size="small" />
                      {isOwn && (
                        <IconButton size="small" color="error" onClick={() => handleDelete(review.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  </Stack>

                  {review.comment && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          lineHeight: 1.7,
                          display: '-webkit-box',
                          WebkitLineClamp: isExpanded || !isLong ? 'unset' : 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: isExpanded || !isLong ? 'visible' : 'hidden',
                        }}
                      >
                        {review.comment}
                      </Typography>
                      {isLong && (
                        <Button
                          size="small"
                          endIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
                          onClick={() => setExpandedId(isExpanded ? null : review.id)}
                          sx={{ mt: 0.5, px: 0, color: 'primary.main' }}
                        >
                          {isExpanded ? 'Voir moins' : 'Lire la suite'}
                        </Button>
                      )}
                    </Box>
                  )}

                  {/* Rating badge */}
                  <Box sx={{ mt: 1.5 }}>
                    <Chip
                      size="small"
                      label={ratingLabels[review.rating]}
                      sx={{
                        bgcolor: review.rating >= 4
                          ? alpha('#00BFA5', 0.12)
                          : review.rating === 3
                          ? alpha('#FFA726', 0.12)
                          : alpha('#EF5350', 0.12),
                        color: review.rating >= 4 ? '#00BFA5' : review.rating === 3 ? '#FFA726' : '#EF5350',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    />
                  </Box>
                </ReviewCard>
              </Fade>
            );
          })}
        </Stack>
      )}

      {/* Already reviewed notice */}
      {token && alreadyReviewed && (
        <Alert severity="info" sx={{ mt: 3 }}>
          Vous avez déjà soumis un avis pour ce voyage.
        </Alert>
      )}
      {!token && (
        <Alert severity="info" sx={{ mt: 3 }}>
          <strong>Connectez-vous</strong> pour laisser un avis sur ce voyage.
        </Alert>
      )}
    </Paper>
  );
};

export default TripReviews;