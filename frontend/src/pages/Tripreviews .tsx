import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Rating, Avatar, Button, TextField,
  Paper, Stack, Divider, Chip, CircularProgress, Alert,
  LinearProgress, Fade, Collapse, IconButton,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Star, StarBorder, ThumbUp, Edit, Delete, Send,
  ExpandMore, ExpandLess, FormatQuote, Verified,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

// ─── 4 COULEURS UNIQUEMENT ──────────────────────────────────────
const COLORS = {
  teal: '#0EA5A0',
  navy: '#0F2D5C',
  amber: '#D97706',
  white: '#FFFFFF',
};

// ─── Styled ──────────────────────────────────────────────────────
const ReviewCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
  transition: 'all 0.25s ease',
  backgroundColor: COLORS.white,
  '&:hover': {
    borderColor: COLORS.teal,
    boxShadow: `0 4px 20px ${alpha(COLORS.teal, 0.1)}`,
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

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navy})`,
  borderRadius: 10,
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.85rem',
  color: COLORS.white,
  '&:hover': {
    background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.teal})`,
    transform: 'translateY(-1px)',
  },
}));

const OutlineButton = styled(Button)(({ theme }) => ({
  borderRadius: 10,
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.85rem',
  borderColor: COLORS.teal,
  color: COLORS.teal,
  '&:hover': {
    borderColor: COLORS.navy,
    backgroundColor: alpha(COLORS.teal, 0.05),
  },
}));

// ─── Types ───────────────────────────────────────────────────────
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

// ─── Helpers ─────────────────────────────────────────────────────
const API = 'http://localhost:8000';

const ratingLabels: Record<number, string> = {
  1: 'Très décevant',
  2: 'Décevant',
  3: 'Correct',
  4: 'Bien',
  5: 'Excellent !',
};

// ─── Component ───────────────────────────────────────────────────
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

  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  const alreadyReviewed = reviews.some((r) => r.user.id === user?.id);

  return (
    <Paper elevation={0} sx={{ p: 4, borderRadius: 16, border: `1px solid ${alpha(COLORS.teal, 0.1)}`, bgcolor: COLORS.white }}>
      
      {/* ── Header ── */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: COLORS.navy, letterSpacing: '-0.02em' }}>
            Avis des voyageurs
          </Typography>
          <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6) }}>
            {reviews.length} avis pour ce voyage
          </Typography>
        </Box>
        {token && !alreadyReviewed && (
          showForm ? (
            <OutlineButton startIcon={<ExpandLess />} onClick={() => setShowForm(false)}>
              Annuler
            </OutlineButton>
          ) : (
            <GradientButton startIcon={<Edit />} onClick={() => setShowForm(true)}>
              Donner mon avis
            </GradientButton>
          )
        )}
      </Stack>

      <Divider sx={{ mb: 3, borderColor: alpha(COLORS.teal, 0.15) }} />

      {/* ── Summary ── */}
      {reviews.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} alignItems="center">
            <Box sx={{ textAlign: 'center', minWidth: 120 }}>
              <Typography variant="h2" fontWeight={800} sx={{ color: COLORS.teal }}>
                {avgRating.toFixed(1)}
              </Typography>
              <Rating value={avgRating} precision={0.1} readOnly size="medium" sx={{ '& .MuiRating-iconFilled': { color: COLORS.amber } }} />
              <Typography variant="caption" sx={{ color: alpha(COLORS.navy, 0.5) }}>
                sur 5
              </Typography>
            </Box>

            <Box sx={{ flex: 1, width: '100%' }}>
              {dist.map(({ star, count, pct }) => (
                <RatingBar key={star}>
                  <Typography variant="body2" sx={{ minWidth: 16, color: COLORS.navy }}>
                    {star}
                  </Typography>
                  <Star sx={{ fontSize: 16, color: COLORS.amber }} />
                  <Box sx={{ flex: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(COLORS.teal, 0.1),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: star >= 4 ? COLORS.teal : star === 3 ? COLORS.amber : COLORS.amber,
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: alpha(COLORS.navy, 0.5), minWidth: 24 }}>
                    {count}
                  </Typography>
                </RatingBar>
              ))}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {avgRating >= 4.5 && <Chip label=" Recommandé" sx={{ bgcolor: alpha(COLORS.teal, 0.1), color: COLORS.teal, fontWeight: 600, borderRadius: 8 }} />}
              {avgRating >= 4 && <Chip label=" Très apprécié" sx={{ bgcolor: alpha(COLORS.teal, 0.1), color: COLORS.teal, fontWeight: 600, borderRadius: 8 }} />}
              {reviews.length >= 10 && <Chip label="Populaire" sx={{ bgcolor: alpha(COLORS.amber, 0.1), color: COLORS.amber, fontWeight: 600, borderRadius: 8 }} />}
            </Box>
          </Stack>
        </Box>
      )}

      {/* ── Alerts ── */}
      {error && (
        <Fade in>
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2, borderRadius: 10, bgcolor: alpha(COLORS.amber, 0.05), borderLeft: `4px solid ${COLORS.amber}` }}>
            {error}
          </Alert>
        </Fade>
      )}
      {success && (
        <Fade in>
          <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2, borderRadius: 10, bgcolor: alpha(COLORS.teal, 0.05), borderLeft: `4px solid ${COLORS.teal}` }}>
            {success}
          </Alert>
        </Fade>
      )}

      {/* ── Review Form ── */}
      <Collapse in={showForm}>
        <Paper
          variant="outlined"
          sx={{ p: 3, mb: 4, borderRadius: 12, bgcolor: alpha(COLORS.teal, 0.02), borderColor: alpha(COLORS.teal, 0.2) }}
        >
          <Typography variant="h6" fontWeight={700} sx={{ color: COLORS.navy, mb: 2 }}>
            Votre expérience
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6), mb: 1 }}>
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
                    <Star sx={{ fontSize: 36, color: COLORS.amber }} />
                  ) : (
                    <StarBorder sx={{ fontSize: 36, color: COLORS.amber }} />
                  )}
                </Box>
              ))}
            </StarsInput>
            {(hoverRating || rating) > 0 && (
              <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600, color: COLORS.teal }}>
                {ratingLabels[hoverRating || rating]}
              </Typography>
            )}
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Partagez votre expérience (optionnel)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Que pensez-vous de ce voyage ? Guide, hébergement, activités..."
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 10,
                '&:hover fieldset': { borderColor: COLORS.teal },
                '&.Mui-focused fieldset': { borderColor: COLORS.teal },
              },
            }}
          />

          <GradientButton
            endIcon={submitting ? <CircularProgress size={16} sx={{ color: COLORS.white }} /> : <Send />}
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            sx={{ px: 3 }}
          >
            {submitting ? 'Publication...' : 'Publier mon avis'}
          </GradientButton>
        </Paper>
      </Collapse>

      {/* ── Reviews List ── */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={40} sx={{ color: COLORS.teal }} />
        </Box>
      ) : reviews.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <FormatQuote sx={{ fontSize: 64, color: alpha(COLORS.navy, 0.2), mb: 2 }} />
          <Typography variant="h6" sx={{ color: COLORS.navy, fontWeight: 600 }}>
            Aucun avis pour le moment
          </Typography>
          <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.5) }}>
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
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: isOwn ? COLORS.teal : alpha(COLORS.navy, 0.7),
                          width: 44,
                          height: 44,
                          fontWeight: 700,
                          color: COLORS.white,
                        }}
                      >
                        {review.user.first_name[0]}{review.user.last_name[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ color: COLORS.navy }}>
                          {review.user.first_name} {review.user.last_name}
                          {isOwn && (
                            <Chip label="Vous" size="small" sx={{ ml: 1, height: 18, fontSize: '0.65rem', bgcolor: alpha(COLORS.teal, 0.1), color: COLORS.teal, fontWeight: 600, borderRadius: 6 }} />
                          )}
                        </Typography>
                        <Typography variant="caption" sx={{ color: alpha(COLORS.navy, 0.5) }}>
                          {new Date(review.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'long', year: 'numeric',
                          })}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Rating value={review.rating} readOnly size="small" sx={{ '& .MuiRating-iconFilled': { color: COLORS.amber } }} />
                      {isOwn && (
                        <IconButton size="small" onClick={() => handleDelete(review.id)} sx={{ color: COLORS.amber, '&:hover': { bgcolor: alpha(COLORS.amber, 0.1) } }}>
                          <Delete fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  </Stack>

                  {review.comment && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          lineHeight: 1.7,
                          color: alpha(COLORS.navy, 0.75),
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
                          sx={{ mt: 0.5, px: 0, color: COLORS.teal, '&:hover': { bgcolor: 'transparent' } }}
                        >
                          {isExpanded ? 'Voir moins' : 'Lire la suite'}
                        </Button>
                      )}
                    </Box>
                  )}

                  <Box sx={{ mt: 1.5 }}>
                    <Chip
                      size="small"
                      label={ratingLabels[review.rating]}
                      sx={{
                        bgcolor: review.rating >= 4 ? alpha(COLORS.teal, 0.1) : review.rating === 3 ? alpha(COLORS.amber, 0.1) : alpha(COLORS.amber, 0.1),
                        color: review.rating >= 4 ? COLORS.teal : review.rating === 3 ? COLORS.amber : COLORS.amber,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        borderRadius: 6,
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
        <Alert severity="info" sx={{ mt: 3, borderRadius: 10, bgcolor: alpha(COLORS.teal, 0.05), color: COLORS.navy, borderLeft: `4px solid ${COLORS.teal}` }}>
          Vous avez déjà soumis un avis pour ce voyage.
        </Alert>
      )}
      {!token && (
        <Alert severity="info" sx={{ mt: 3, borderRadius: 10, bgcolor: alpha(COLORS.teal, 0.05), color: COLORS.navy, borderLeft: `4px solid ${COLORS.teal}` }}>
          <strong>Connectez-vous</strong> pour laisser un avis sur ce voyage.
        </Alert>
      )}
    </Paper>
  );
};

export default TripReviews;