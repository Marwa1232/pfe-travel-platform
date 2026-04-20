import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
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
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  InputAdornment,
  Pagination,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  StarBorder,
  CheckCircle,
  Cancel,
  Reply,
  Search,
  MoreHoriz,
  HourglassEmpty,
  Star,
} from '@mui/icons-material';
import { organizerReviewAPI } from '../../services/api';
import { RootState } from '../../store';

const PRIMARY = '#00BFA5';
const SECONDARY = '#0D47A1';

const StyledTableContainer = styled(TableContainer)({
  borderRadius: 16,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  border: `1px solid ${alpha(PRIMARY, 0.12)}`,
  overflow: 'hidden',
  '& .MuiTableHead-root .MuiTableCell-root': {
    backgroundColor: '#f8fafc',
    fontWeight: 700,
    color: SECONDARY,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottom: `2px solid ${alpha(PRIMARY, 0.15)}`,
  },
  '& .MuiTableBody-root .MuiTableRow-root': {
    transition: 'background 0.15s',
    '&:hover': { backgroundColor: alpha(PRIMARY, 0.025) },
    '&:last-child td': { borderBottom: 0 },
  },
});

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  status: string;
  organizer_response: string | null;
  response_date: string | null;
  created_at: string;
  trip: { id: number; title: string };
  user: { id: number; first_name: string; last_name: string };
}

const getStatusMeta = (status: string) => {
  const map: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    pending:  { label: 'En attente', color: '#FF9800', bg: alpha('#FF9800', 0.1), icon: <HourglassEmpty sx={{ fontSize: 11 }} /> },
    approved: { label: 'Approuvé',   color: PRIMARY,   bg: alpha(PRIMARY, 0.1),   icon: <CheckCircle sx={{ fontSize: 11 }} /> },
    rejected: { label: 'Rejeté',     color: '#F44336', bg: alpha('#F44336', 0.1), icon: <Cancel sx={{ fontSize: 11 }} /> },
  };
  return map[status] || { label: status, color: '#999', bg: '#f5f5f5', icon: null };
};

const StatusChip = ({ status }: { status: string }) => {
  const meta = getStatusMeta(status);
  return (
    <Chip
      size="small"
      icon={meta.icon as any}
      label={meta.label}
      sx={{
        bgcolor: meta.bg, color: meta.color, fontWeight: 700, fontSize: 11, height: 24,
        '& .MuiChip-icon': { color: meta.color },
      }}
    />
  );
};

const StarRating = ({ value }: { value: number }) => (
  <Rating
    value={value}
    readOnly
    size="small"
    sx={{
      '& .MuiRating-iconFilled': { color: '#FBBF24' },
      '& .MuiRating-iconEmpty': { color: '#E5E7EB' },
      fontSize: 16,
    }}
  />
);

const ROWS_PER_PAGE = 8;

const OrganizerReviews: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState('all');
  const [pendingCount, setPendingCount] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    if (!user?.roles?.includes('ROLE_ORGANIZER')) { navigate('/dashboard'); return; }
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
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reviewId: number) => {
    try {
      setActionLoading(true);
      await organizerReviewAPI.reject(reviewId);
      loadReviews();
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenResponse = (review: Review) => {
    setSelectedReview(review);
    setResponseText(review.organizer_response || '');
    setResponseDialogOpen(true);
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
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = reviews.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.user?.first_name?.toLowerCase().includes(q) ||
      r.user?.last_name?.toLowerCase().includes(q) ||
      r.trip?.title?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' });

  const getInitials = (f?: string, l?: string) =>
    `${f?.[0] || ''}${l?.[0] || ''}`.toUpperCase();

  // Stats summary
  const counts = {
    all: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ color: SECONDARY }}>
            Avis clients
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Modérez les avis et répondez à vos clients
          </Typography>
        </Box>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5,
          px: 2.5, py: 1.2, borderRadius: 3,
          bgcolor: alpha('#FBBF24', 0.1), border: `1px solid ${alpha('#FBBF24', 0.25)}`,
        }}>
          <Star sx={{ color: '#FBBF24', fontSize: 20 }} />
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: SECONDARY, lineHeight: 1 }}>{avgRating}</Typography>
            <Typography variant="caption" color="text.secondary">Note moy.</Typography>
          </Box>
        </Box>
      </Box>

      {pendingCount > 0 && (
        <Alert
          severity="warning"
          icon={<HourglassEmpty />}
          sx={{ mb: 3, borderRadius: 2, fontWeight: 500 }}
        >
          {pendingCount} avis en attente de modération
        </Alert>
      )}

      {/* Summary chips */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Tous', count: counts.all, color: SECONDARY, bg: alpha(SECONDARY, 0.08) },
          { label: 'En attente', count: counts.pending, color: '#FF9800', bg: alpha('#FF9800', 0.1) },
          { label: 'Approuvés', count: counts.approved, color: PRIMARY, bg: alpha(PRIMARY, 0.1) },
          { label: 'Rejetés', count: counts.rejected, color: '#F44336', bg: alpha('#F44336', 0.1) },
        ].map(item => (
          <Box key={item.label} sx={{
            px: 2, py: 0.8, borderRadius: 3, bgcolor: item.bg,
            display: 'flex', alignItems: 'center', gap: 1,
          }}>
            <Typography variant="body2" fontWeight={700} sx={{ color: item.color }}>{item.count}</Typography>
            <Typography variant="body2" sx={{ color: item.color }}>{item.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Tabs + Search */}
      <Paper sx={{ borderRadius: 3, mb: 2.5, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, borderBottom: `1px solid #f0f0f0` }}>
          <Tabs
            value={tabValue}
            onChange={(_, v) => { setTabValue(v); setPage(1); }}
            sx={{
              '& .MuiTabs-indicator': { bgcolor: PRIMARY, height: 3 },
              '& .Mui-selected': { color: `${PRIMARY} !important`, fontWeight: 700 },
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, fontSize: 13 },
            }}
          >
            <Tab label="Tous" value="all" />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  En attente
                  {counts.pending > 0 && (
                    <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#FF9800', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {counts.pending}
                    </Box>
                  )}
                </Box>
              }
              value="pending"
            />
            <Tab label="Approuvés" value="approved" />
            <Tab label="Rejetés" value="rejected" />
          </Tabs>

          <TextField
            placeholder="Rechercher..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            size="small"
            sx={{ width: 220, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#bbb', fontSize: 16 }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Paper>

      {/* Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: PRIMARY }} />
        </Box>
      ) : filtered.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <StarBorder sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
          <Typography variant="body1" color="text.secondary">Aucun avis trouvé</Typography>
        </Paper>
      ) : (
        <>
          <StyledTableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Client</TableCell>
                  <TableCell>Voyage</TableCell>
                  <TableCell>Note</TableCell>
                  <TableCell>Commentaire</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map((review) => (
                  <TableRow key={review.id}>
                    {/* Client */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: SECONDARY, fontSize: 11 }}>
                          {getInitials(review.user.first_name, review.user.last_name)}
                        </Avatar>
                        <Typography variant="body2" fontWeight={600}>
                          {review.user.first_name} {review.user.last_name}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Voyage */}
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ color: PRIMARY, fontWeight: 600, maxWidth: 140,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {review.trip.title}
                      </Typography>
                    </TableCell>

                    {/* Note */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <StarRating value={review.rating} />
                        <Typography variant="caption" fontWeight={700} sx={{ color: '#FBBF24' }}>
                          {review.rating}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Commentaire */}
                    <TableCell sx={{ maxWidth: 220 }}>
                      {review.comment ? (
                        <Typography variant="body2" color="text.secondary" sx={{
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {review.comment}
                          {review.comment.length > 80 && (
                            <Typography component="span" variant="caption" sx={{ color: PRIMARY, fontWeight: 600 }}>
                              {' '}...Voir plus
                            </Typography>
                          )}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.disabled" fontStyle="italic">
                          Aucun commentaire
                        </Typography>
                      )}
                      {review.organizer_response && (
                        <Box sx={{ mt: 0.8, p: 1, borderRadius: 1.5, bgcolor: alpha(PRIMARY, 0.05), borderLeft: `3px solid ${PRIMARY}` }}>
                          <Typography variant="caption" color="text.secondary">
                            <strong style={{ color: PRIMARY }}>Votre réponse: </strong>
                            {review.organizer_response.substring(0, 60)}
                            {review.organizer_response.length > 60 ? '…' : ''}
                          </Typography>
                        </Box>
                      )}
                    </TableCell>

                    {/* Statut */}
                    <TableCell>
                      <StatusChip status={review.status} />
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(review.created_at)}
                      </Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        {review.status === 'pending' && (
                          <>
                            <Tooltip title="Approuver">
                              <IconButton
                                size="small"
                                onClick={() => handleApprove(review.id)}
                                disabled={actionLoading}
                                sx={{ color: PRIMARY, '&:hover': { bgcolor: alpha(PRIMARY, 0.1) } }}
                              >
                                <CheckCircle fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Rejeter">
                              <IconButton
                                size="small"
                                onClick={() => handleReject(review.id)}
                                disabled={actionLoading}
                                sx={{ color: '#F44336', '&:hover': { bgcolor: alpha('#F44336', 0.08) } }}
                              >
                                <Cancel fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        <Tooltip title={review.organizer_response ? 'Modifier la réponse' : 'Répondre'}>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenResponse(review)}
                            sx={{ color: SECONDARY, '&:hover': { bgcolor: alpha(SECONDARY, 0.08) } }}
                          >
                            <Reply fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, v) => setPage(v)}
                size="small"
                sx={{
                  '& .MuiPaginationItem-root.Mui-selected': {
                    bgcolor: PRIMARY, color: '#fff', '&:hover': { bgcolor: PRIMARY },
                  },
                }}
              />
            </Box>
          )}
        </>
      )}

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onClose={() => setResponseDialogOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: SECONDARY }}>
          {selectedReview?.organizer_response ? 'Modifier la réponse' : 'Répondre à l\'avis'}
        </DialogTitle>
        <DialogContent>
          {selectedReview && (
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: SECONDARY, fontSize: 13 }}>
                  {getInitials(selectedReview.user.first_name, selectedReview.user.last_name)}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {selectedReview.user.first_name} {selectedReview.user.last_name}
                  </Typography>
                  <StarRating value={selectedReview.rating} />
                </Box>
              </Box>
              {selectedReview.comment && (
                <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    "{selectedReview.comment}"
                  </Typography>
                </Paper>
              )}
            </Box>
          )}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Votre réponse"
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Merci pour votre retour! Nous sommes ravis que..."
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setResponseDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none', borderColor: alpha(PRIMARY, 0.4), color: PRIMARY }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitResponse}
            disabled={!responseText.trim() || actionLoading}
            sx={{
              borderRadius: 2, textTransform: 'none',
              background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
              '&:hover': { background: `linear-gradient(135deg, ${SECONDARY}, ${PRIMARY})` },
            }}
          >
            {actionLoading ? 'Envoi...' : 'Envoyer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrganizerReviews;