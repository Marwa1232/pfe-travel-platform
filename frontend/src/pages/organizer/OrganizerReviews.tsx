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
  Fade,
  Zoom,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Snackbar,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { styled, alpha, keyframes } from '@mui/material/styles';
import {
  StarBorder,
  CheckCircle,
  Reply,
  Search,
  HourglassEmpty,
  Star,
  ArrowBack,
  KeyboardArrowDown,
  Flag,
} from '@mui/icons-material';
import { organizerReviewAPI } from '../../services/api';
import { RootState } from '../../store';

// ─── 4 COULEURS UNIQUEMENT ──────────────────────────────────────
const COLORS = {
  teal: '#0EA5A0',
  navy: '#0F2D5C',
  amber: '#D97706',
  white: '#FFFFFF',
};

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Styled Components ───────────────────────────────────────────
const StyledTableContainer = styled(TableContainer)({
  borderRadius: 12,
  boxShadow: `0 4px 20px ${alpha(COLORS.navy, 0.06)}`,
  border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
  overflow: 'hidden',
  '& .MuiTableHead-root .MuiTableCell-root': {
    backgroundColor: alpha(COLORS.teal, 0.03),
    fontWeight: 700,
    color: COLORS.navy,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottom: `2px solid ${alpha(COLORS.teal, 0.2)}`,
    padding: '14px 16px',
  },
  '& .MuiTableBody-root .MuiTableRow-root': {
    transition: 'background 0.2s ease',
    '&:hover': { backgroundColor: alpha(COLORS.teal, 0.02) },
    '&:last-child td': { borderBottom: 0 },
  },
  '& .MuiTableCell-root': {
    padding: '12px 16px',
    borderBottom: `1px solid ${alpha(COLORS.teal, 0.08)}`,
  },
});

const StatsCard = styled(Card)({
  borderRadius: 12,
  border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
  boxShadow: `0 2px 8px ${alpha(COLORS.navy, 0.04)}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 20px ${alpha(COLORS.teal, 0.12)}`,
  },
});

const GradientButton = styled(Button)({
  background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navy})`,
  borderRadius: 10,
  padding: '8px 20px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.85rem',
  color: COLORS.white,
  '&:hover': {
    background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.teal})`,
    transform: 'translateY(-1px)',
  },
});

const OutlineButton = styled(Button)({
  borderRadius: 10,
  padding: '8px 20px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.85rem',
  borderColor: COLORS.teal,
  color: COLORS.teal,
  '&:hover': {
    borderColor: COLORS.navy,
    backgroundColor: alpha(COLORS.teal, 0.05),
  },
});

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  status: string;
  flagged?: boolean;
  organizer_response: string | null;
  response_date: string | null;
  created_at: string;
  trip: { id: number; title: string };
  user: { id: number; first_name: string; last_name: string };
}

const getStatusMeta = (status: string, flagged?: boolean) => {
  if (flagged) {
    return { label: 'Signalé', color: '#DC2626', bg: alpha('#DC2626', 0.1), icon: <Flag sx={{ fontSize: 11 }} /> };
  }
  const map: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    pending:  { label: 'En attente', color: COLORS.amber, bg: alpha(COLORS.amber, 0.1), icon: <HourglassEmpty sx={{ fontSize: 11 }} /> },
    approved: { label: 'Approuvé',   color: COLORS.teal,  bg: alpha(COLORS.teal, 0.1),  icon: <CheckCircle sx={{ fontSize: 11 }} /> },
    rejected: { label: 'Rejeté',     color: COLORS.amber, bg: alpha(COLORS.amber, 0.1), icon: null },
  };
  return map[status] || { label: status, color: COLORS.navy, bg: alpha(COLORS.navy, 0.08), icon: null };
};

const StatusChip = ({ status, flagged }: { status: string; flagged?: boolean }) => {
  const meta = getStatusMeta(status, flagged);
  return (
    <Chip
      size="small"
      icon={meta.icon as any}
      label={meta.label}
      sx={{
        bgcolor: meta.bg,
        color: meta.color,
        fontWeight: 700,
        fontSize: 11,
        height: 24,
        borderRadius: 6,
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
      '& .MuiRating-iconFilled': { color: COLORS.amber },
      '& .MuiRating-iconEmpty': { color: alpha(COLORS.navy, 0.2) },
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
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [responseText, setResponseText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  // Menu dropdown state
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, id: number) => {
    setMenuAnchor(e.currentTarget);
    setOpenMenuId(id);
  };
  const handleMenuClose = () => {
    setMenuAnchor(null);
    setOpenMenuId(null);
  };

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
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
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
      showSnackbar('Réponse envoyée avec succès');
    } catch {
      showSnackbar('Erreur lors de l\'envoi de la réponse', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenFlag = (review: Review) => {
    setSelectedReview(review);
    setFlagReason('');
    setFlagDialogOpen(true);
  };

  const handleSubmitFlag = async () => {
    if (!selectedReview) return;
    try {
      setActionLoading(true);
      await organizerReviewAPI.flag(selectedReview.id, flagReason || 'Contenu inapproprié');
      setFlagDialogOpen(false);
      setFlagReason('');
      setSelectedReview(null);
      loadReviews();
      showSnackbar('Avis signalé à l\'administration');
    } catch {
      showSnackbar('Erreur lors du signalement', 'error');
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

  const counts = {
    all:      reviews.length,
    approved: reviews.filter(r => r.status === 'approved').length,
    flagged:  reviews.filter(r => r.flagged).length,
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: alpha(COLORS.navy, 0.02), py: 4 }}>
      <Container maxWidth="xl">

        {/* Header */}
        <Fade in timeout={500}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <IconButton
              onClick={() => navigate('/organizer/dashboard')}
              sx={{
                bgcolor: COLORS.white,
                borderRadius: 10,
                border: `1px solid ${alpha(COLORS.teal, 0.2)}`,
                '&:hover': { bgcolor: alpha(COLORS.teal, 0.05), borderColor: COLORS.teal },
              }}
            >
              <ArrowBack sx={{ color: COLORS.navy }} />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ color: COLORS.navy, letterSpacing: '-0.02em' }}>
                Avis clients
              </Typography>
              <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6) }}>
                Répondez aux avis et signalez les contenus inappropriés à l'administration
              </Typography>
            </Box>

          </Box>
        </Fade>

        {/* Alert avis signalés */}
        {counts.flagged > 0 && (
          <Fade in>
            <Alert
              severity="error"
              icon={<Flag />}
              sx={{
                mb: 3,
                borderRadius: 10,
                bgcolor: alpha('#DC2626', 0.06),
                color: '#DC2626',
                '& .MuiAlert-icon': { color: '#DC2626' },
              }}
            >
              {counts.flagged} avis signalé{counts.flagged > 1 ? 's' : ''} — en attente de traitement par l'administration
            </Alert>
          </Fade>
        )}

        {/* Cartes statistiques */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid xs={12} sm={6} md={6}>
            <Zoom in timeout={300}>
              <StatsCard>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 10, bgcolor: alpha(COLORS.navy, 0.1), color: COLORS.navy, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <StarBorder />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={800} sx={{ color: COLORS.navy, lineHeight: 1 }}>{counts.all}</Typography>
                    <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6) }}>Tous les avis</Typography>
                  </Box>
                </CardContent>
              </StatsCard>
            </Zoom>
          </Grid>
          <Grid xs={12} sm={6} md={6}>
            <Zoom in timeout={500}>
              <StatsCard>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 10, bgcolor: alpha('#DC2626', 0.1), color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Flag />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={800} sx={{ color: '#DC2626', lineHeight: 1 }}>{counts.flagged}</Typography>
                    <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6) }}>Signalés</Typography>
                  </Box>
                </CardContent>
              </StatsCard>
            </Zoom>
          </Grid>
        </Grid>

        {/* Search */}
        <Paper sx={{ borderRadius: 12, mb: 2.5, overflow: 'hidden', boxShadow: `0 2px 8px ${alpha(COLORS.navy, 0.04)}`, border: `1px solid ${alpha(COLORS.teal, 0.1)}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, py: 1.5 }}>
            <TextField
              placeholder="Rechercher..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              size="small"
              sx={{
                width: 280,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2, fontSize: 13,
                  '&:hover fieldset': { borderColor: COLORS.teal },
                  '&.Mui-focused fieldset': { borderColor: COLORS.teal },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: alpha(COLORS.navy, 0.4), fontSize: 16 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Paper>

        {/* Tableau */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress size={40} sx={{ color: COLORS.teal }} />
          </Box>
        ) : filtered.length === 0 ? (
          <Fade in>
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 12 }}>
              <StarBorder sx={{ fontSize: 48, color: alpha(COLORS.navy, 0.2), mb: 1 }} />
              <Typography variant="body1" sx={{ color: alpha(COLORS.navy, 0.6) }}>Aucun avis trouvé</Typography>
            </Paper>
          </Fade>
        ) : (
          <Fade in timeout={500}>
            <Box>
              <StyledTableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Client</TableCell>
                      <TableCell>Voyage</TableCell>
                      <TableCell>Note</TableCell>
                      <TableCell>Commentaire</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginated.map((review, idx) => (
                      <TableRow
                        key={review.id}
                        sx={{
                          animation: `${fadeUp} 0.3s ease ${idx * 0.03}s both`,
                          bgcolor: review.flagged ? alpha('#DC2626', 0.02) : 'transparent',
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: COLORS.navy, fontSize: 11, color: COLORS.white }}>
                              {getInitials(review.user.first_name, review.user.last_name)}
                            </Avatar>
                            <Typography variant="body2" fontWeight={600} sx={{ color: COLORS.navy }}>
                              {review.user.first_name} {review.user.last_name}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ color: COLORS.teal, fontWeight: 600, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {review.trip.title}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <StarRating value={review.rating} />
                            <Typography variant="caption" fontWeight={700} sx={{ color: COLORS.amber }}>{review.rating}</Typography>
                          </Box>
                        </TableCell>

                        <TableCell sx={{ maxWidth: 280 }}>
                          {review.comment ? (
                            <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.7), lineHeight: 1.5 }}>
                              {review.comment.length > 80 ? `${review.comment.substring(0, 80)}...` : review.comment}
                            </Typography>
                          ) : (
                            <Typography variant="caption" sx={{ color: alpha(COLORS.navy, 0.4), fontStyle: 'italic' }}>
                              Aucun commentaire
                            </Typography>
                          )}
                          {review.organizer_response && (
                            <Box sx={{ mt: 1, p: 1, borderRadius: 8, bgcolor: alpha(COLORS.teal, 0.05), borderLeft: `3px solid ${COLORS.teal}` }}>
                              <Typography variant="caption" sx={{ color: alpha(COLORS.navy, 0.6) }}>
                                <strong style={{ color: COLORS.teal }}>Votre réponse: </strong>
                                {review.organizer_response.length > 60
                                  ? `${review.organizer_response.substring(0, 60)}...`
                                  : review.organizer_response}
                              </Typography>
                            </Box>
                          )}
                        </TableCell>

                        <TableCell>
                          <Typography variant="caption" sx={{ color: alpha(COLORS.navy, 0.5) }}>
                            {formatDate(review.created_at)}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            endIcon={<KeyboardArrowDown sx={{ fontSize: 14 }} />}
                            onClick={(e) => handleMenuOpen(e, review.id)}
                            sx={{
                              borderRadius: 2, textTransform: 'none', fontSize: 12, fontWeight: 500,
                              borderColor: alpha(COLORS.navy, 0.2), color: COLORS.navy,
                              px: 1.5, py: 0.5,
                              '&:hover': { borderColor: COLORS.teal, color: COLORS.teal, bgcolor: alpha(COLORS.teal, 0.04) },
                            }}
                          >
                            Actions
                          </Button>
                          <Menu
                            anchorEl={openMenuId === review.id ? menuAnchor : null}
                            open={openMenuId === review.id}
                            onClose={handleMenuClose}
                            elevation={2}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            PaperProps={{
                              sx: { borderRadius: 2, border: `0.5px solid ${alpha(COLORS.navy, 0.1)}`, boxShadow: `0 8px 24px ${alpha(COLORS.navy, 0.1)}`, minWidth: 180, mt: 0.5 }
                            }}
                          >
                            {/* ── RÉPONDRE (seule action de modération) */}
                            <MenuItem
                              onClick={() => { handleOpenResponse(review); handleMenuClose(); }}
                              sx={{ fontSize: 13, py: 1, '&:hover': { bgcolor: alpha(COLORS.navy, 0.04) } }}
                            >
                              <ListItemIcon sx={{ minWidth: 28 }}>
                                <Reply sx={{ fontSize: 16, color: alpha(COLORS.navy, 0.5) }} />
                              </ListItemIcon>
                              <ListItemText primaryTypographyProps={{ fontSize: 13 }}>
                                {review.organizer_response ? 'Modifier réponse' : 'Répondre'}
                              </ListItemText>
                            </MenuItem>

                            {/* ── SIGNALER À L'ADMIN */}
                            {!review.flagged && (
                              <>
                                <Divider sx={{ my: 0.5 }} />
                                <MenuItem
                                  onClick={() => { handleOpenFlag(review); handleMenuClose(); }}
                                  disabled={actionLoading}
                                  sx={{ fontSize: 13, color: '#DC2626', py: 1, '&:hover': { bgcolor: alpha('#DC2626', 0.06) } }}
                                >
                                  <ListItemIcon sx={{ minWidth: 28 }}>
                                    <Flag sx={{ fontSize: 16, color: '#DC2626' }} />
                                  </ListItemIcon>
                                  <ListItemText primaryTypographyProps={{ fontSize: 13 }}>Signaler à l'admin</ListItemText>
                                </MenuItem>
                              </>
                            )}

                            {review.flagged && (
                              <MenuItem disabled sx={{ fontSize: 13, py: 1 }}>
                                <ListItemIcon sx={{ minWidth: 28 }}>
                                  <Flag sx={{ fontSize: 16, color: '#DC2626' }} />
                                </ListItemIcon>
                                <ListItemText primaryTypographyProps={{ fontSize: 12, color: '#DC2626' }}>
                                  Déjà signalé
                                </ListItemText>
                              </MenuItem>
                            )}
                          </Menu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </StyledTableContainer>

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, v) => setPage(v)}
                    size="medium"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        borderRadius: 8,
                        '&.Mui-selected': { bgcolor: COLORS.teal, color: COLORS.white, '&:hover': { bgcolor: alpha(COLORS.teal, 0.85) } },
                        '&:hover': { bgcolor: alpha(COLORS.teal, 0.1) },
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
          </Fade>
        )}

        {/* ── Dialog Répondre */}
        <Dialog
          open={responseDialogOpen}
          onClose={() => setResponseDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 2, boxShadow: `0 20px 60px ${alpha(COLORS.navy, 0.15)}`, border: `1px solid ${alpha(COLORS.teal, 0.1)}` } }}
        >
          <DialogTitle sx={{ fontWeight: 700, color: COLORS.navy, borderBottom: `1px solid ${alpha(COLORS.teal, 0.1)}`, pb: 2 }}>
            {selectedReview?.organizer_response ? 'Modifier la réponse' : 'Répondre à l\'avis'}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {selectedReview && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: COLORS.navy, fontSize: 14, color: COLORS.white }}>
                    {getInitials(selectedReview.user.first_name, selectedReview.user.last_name)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ color: COLORS.navy }}>
                      {selectedReview.user.first_name} {selectedReview.user.last_name}
                    </Typography>
                    <StarRating value={selectedReview.rating} />
                  </Box>
                </Box>
                {selectedReview.comment && (
                  <Paper sx={{ p: 2, bgcolor: alpha(COLORS.teal, 0.03), borderRadius: 10, border: `1px solid ${alpha(COLORS.teal, 0.1)}` }}>
                    <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.7), fontStyle: 'italic' }}>
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
              placeholder="Merci pour votre retour ! Nous sommes ravis que..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': { borderColor: COLORS.teal },
                  '&.Mui-focused fieldset': { borderColor: COLORS.teal },
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <OutlineButton onClick={() => setResponseDialogOpen(false)}>Annuler</OutlineButton>
            <GradientButton onClick={handleSubmitResponse} disabled={!responseText.trim() || actionLoading}>
              {actionLoading ? 'Envoi...' : 'Envoyer'}
            </GradientButton>
          </DialogActions>
        </Dialog>

        {/* ── Dialog Signalement */}
        <Dialog
          open={flagDialogOpen}
          onClose={() => setFlagDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 2, boxShadow: `0 20px 60px ${alpha(COLORS.navy, 0.15)}`, border: `1px solid ${alpha('#DC2626', 0.2)}` } }}
        >
          <DialogTitle sx={{ fontWeight: 700, color: '#DC2626', borderBottom: `1px solid ${alpha('#DC2626', 0.1)}`, pb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Flag sx={{ fontSize: 20 }} /> Signaler cet avis à l'administration
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
              L'admin recevra une notification et pourra supprimer l'avis s'il juge le signalement valide.
            </Alert>
            {selectedReview?.comment && (
              <Paper sx={{ p: 2, mb: 2, bgcolor: alpha('#DC2626', 0.03), borderRadius: 2, border: `1px solid ${alpha('#DC2626', 0.1)}` }}>
                <Typography variant="caption" sx={{ color: alpha(COLORS.navy, 0.5) }}>Avis concerné :</Typography>
                <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.7), fontStyle: 'italic', mt: 0.5 }}>
                  "{selectedReview.comment}"
                </Typography>
              </Paper>
            )}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Raison du signalement"
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="Ex: Contenu offensant, faux avis, propos inappropriés..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': { borderColor: '#DC2626' },
                  '&.Mui-focused fieldset': { borderColor: '#DC2626' },
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <OutlineButton onClick={() => setFlagDialogOpen(false)}>Annuler</OutlineButton>
            <Button
              variant="contained"
              onClick={handleSubmitFlag}
              disabled={actionLoading}
              sx={{ bgcolor: '#DC2626', borderRadius: 10, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#B91C1C' } }}
              startIcon={<Flag sx={{ fontSize: 16 }} />}
            >
              {actionLoading ? 'Envoi...' : 'Signaler'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
            {snackbar.message}
          </Alert>
        </Snackbar>

      </Container>
    </Box>
  );
};

export default OrganizerReviews;