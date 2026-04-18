import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Rating,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Star,
  StarBorder,
  CheckCircle,
  Cancel,
  Reply,
  MoreVert,
  FilterList,
} from '@mui/icons-material';
import { organizerReviewAPI } from '../../services/api';
import { RootState } from '../../store';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
}));

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  status: string;
  organizer_response: string | null;
  response_date: string | null;
  created_at: string;
  trip: {
    id: number;
    title: string;
  };
  user: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

const OrganizerReviews: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState('all');
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuReview, setMenuReview] = useState<Review | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!user?.roles?.includes('ROLE_ORGANIZER')) {
      navigate('/dashboard');
      return;
    }
    loadReviews();
  }, [token, user, tabValue]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const status = tabValue === 'all' ? undefined : tabValue;
      const response = await organizerReviewAPI.getAll(status);
      setReviews(response.data.reviews);
      setPendingCount(response.data.pending_count);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: number) => {
    try {
      setActionLoading(true);
      await organizerReviewAPI.approve(reviewId);
      loadReviews();
    } catch (error) {
      console.error('Error approving review:', error);
    } finally {
      setActionLoading(false);
      setMenuAnchor(null);
    }
  };

  const handleReject = async (reviewId: number) => {
    try {
      setActionLoading(true);
      await organizerReviewAPI.reject(reviewId);
      loadReviews();
    } catch (error) {
      console.error('Error rejecting review:', error);
    } finally {
      setActionLoading(false);
      setMenuAnchor(null);
    }
  };

  const handleOpenResponse = (review: Review) => {
    setSelectedReview(review);
    setResponseText(review.organizer_response || '');
    setResponseDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleSubmitResponse = async () => {
    if (!selectedReview || !responseText.trim()) return;
    
    try {
      setActionLoading(true);
      await organizerReviewAPI.respond(selectedReview.id, responseText);
      setResponseDialogOpen(false);
      setResponseText('');
      setSelectedReview(null);
      loadReviews();
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, review: Review) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuReview(review);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuReview(null);
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'pending':
        return <Chip label="En attente" color="warning" size="small" />;
      case 'approved':
        return <Chip label="Approuvé" color="success" size="small" icon={<CheckCircle />} />;
      case 'rejected':
        return <Chip label="Rejeté" color="error" size="small" icon={<Cancel />} />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0D47A1', mb: 1 }}>
          Gestion des avis
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gérez les avis de vos clients et répondez à leurs commentaires
        </Typography>
      </Box>

      {pendingCount > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {pendingCount} avis en attente de traitement
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Tous" value="all" />
          <Tab label="En attente" value="pending" />
          <Tab label="Approuvés" value="approved" />
          <Tab label="Rejetés" value="rejected" />
        </Tabs>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : reviews.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <StarBorder sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            Aucun avis trouvé
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {reviews.map((review) => (
            <StyledCard key={review.id}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid xs={12} md={9}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#0D47A1' }}>
                        {getInitials(review.user.first_name, review.user.last_name)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {review.user.first_name} {review.user.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(review.created_at)}
                        </Typography>
                      </Box>
                      <Rating value={review.rating} readOnly size="small" />
                      {getStatusChip(review.status)}
                    </Box>

                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Voyage:</strong> {review.trip.title}
                    </Typography>

                    {review.comment && (
                      <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, mb: 2 }}>
                        <Typography variant="body2">{review.comment}</Typography>
                      </Paper>
                    )}

                    {review.organizer_response && (
                      <Paper sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Réponse de l'organisateur:
                        </Typography>
                        <Typography variant="body2">{review.organizer_response}</Typography>
                        {review.response_date && (
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(review.response_date)}
                          </Typography>
                        )}
                      </Paper>
                    )}
                  </Grid>

                  <Grid xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    {review.status === 'pending' && (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={() => handleApprove(review.id)}
                          sx={{ mb: 1 }}
                        >
                          Approuver
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => handleReject(review.id)}
                          sx={{ mb: 1 }}
                        >
                          Rejeter
                        </Button>
                      </>
                    )}
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Reply />}
                      onClick={() => handleOpenResponse(review)}
                    >
                      {review.organizer_response ? 'Modifier' : 'Répondre'}
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </StyledCard>
          ))}
        </Stack>
      )}

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onClose={() => setResponseDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Répondre à l'avis</DialogTitle>
        <DialogContent>
          {selectedReview && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Avis de {selectedReview.user.first_name} {selectedReview.user.last_name}:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                <Typography variant="body2">{selectedReview.comment}</Typography>
              </Paper>
            </Box>
          )}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Votre réponse"
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Merci de votre retour! Nous sommes ravis que..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResponseDialogOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleSubmitResponse}
            disabled={!responseText.trim() || actionLoading}
          >
            {actionLoading ? 'Envoi...' : 'Envoyer la réponse'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrganizerReviews;