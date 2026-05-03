import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Avatar,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  Fade,
  Zoom,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  CheckCircle,
  Block,
  Refresh,
  Search,
  Business,
  Email,
  LocationOn,
  Phone,
  Verified,
  Warning,
  Cancel,
  ArrowBack,
  Visibility,
  InsertDriveFile,
  PictureAsPdf,
  Download,
  People,
  Person,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { adminAPI } from '../../services/api';

// ─── 4 COULEURS UNIQUEMENT ──────────────────────────────────────
const COLORS = {
  teal: '#0EA5A0',
  navy: '#0F2D5C',
  amber: '#D97706',
  white: '#FFFFFF',
};

// ─── STYLED COMPONENTS ──────────────────────────────────────────
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: COLORS.white,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(COLORS.teal, 0.15)}`,
  boxShadow: `0 8px 24px ${alpha(COLORS.navy, 0.06)}`,
  borderRadius: 12,
  padding: theme.spacing(3),
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 12,
  border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
  overflow: 'hidden',
  '& .MuiTableHead-root': {
    backgroundColor: alpha(COLORS.navy, 0.03),
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  '&.MuiTableCell-head': {
    backgroundColor: alpha(COLORS.navy, 0.03),
    fontWeight: 700,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: COLORS.navy,
    borderBottom: `2px solid ${alpha(COLORS.teal, 0.2)}`,
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  borderRadius: 8,
  fontWeight: 600,
  fontSize: '0.7rem',
  height: 26,
  '&.approved': {
    backgroundColor: alpha(COLORS.teal, 0.1),
    color: COLORS.teal,
    border: `1px solid ${alpha(COLORS.teal, 0.3)}`,
  },
  '&.pending': {
    backgroundColor: alpha(COLORS.amber, 0.1),
    color: COLORS.amber,
    border: `1px solid ${alpha(COLORS.amber, 0.3)}`,
  },
  '&.blocked': {
    backgroundColor: alpha(COLORS.amber, 0.1),
    color: COLORS.amber,
    border: `1px solid ${alpha(COLORS.amber, 0.3)}`,
  },
}));

const DocumentCard = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1),
  backgroundColor: alpha(COLORS.teal, 0.03),
  border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
  borderRadius: 10,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(COLORS.teal, 0.08),
    transform: 'translateX(4px)',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.7rem',
  padding: theme.spacing(0.5, 1.5),
  minWidth: 'auto',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-1px)',
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  background: COLORS.white,
  border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
  boxShadow: `0 4px 16px ${alpha(COLORS.navy, 0.05)}`,
  borderRadius: 12,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 12px 24px ${alpha(COLORS.navy, 0.1)}`,
    borderColor: alpha(COLORS.teal, 0.3),
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navy})`,
  borderRadius: 12,
  padding: theme.spacing(0.8, 2.5),
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
  borderRadius: 12,
  padding: theme.spacing(0.8, 2.5),
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

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    '&:hover fieldset': {
      borderColor: COLORS.teal,
    },
    '&.Mui-focused fieldset': {
      borderColor: COLORS.teal,
    },
  },
}));

const AdminOrganizers: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [organizers, setOrganizers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    organizer: any | null;
    action: 'approve' | 'block' | null;
  }>({
    open: false,
    organizer: null,
    action: null,
  });

  const organizerId = id ? parseInt(id) : null;
  const showDetailView = !!organizerId;
  const selectedOrganizer = organizerId ? organizers.find(o => o.id === organizerId) : null;

  useEffect(() => {
    const fetchOrganizers = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getOrganizers();
        setOrganizers(response.data);
      } catch (error) {
        console.error('Error loading organizers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizers();
  }, []);

  const loadOrganizers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getOrganizers();
      setOrganizers(response.data);
    } catch (err: any) {
      console.error('Error loading organizers:', err);
      setError('Erreur lors du chargement des organisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!actionDialog.organizer || !actionDialog.action) return;

    try {
      if (actionDialog.action === 'approve') {
        await adminAPI.approveOrganizer(actionDialog.organizer.id);
      } else if (actionDialog.action === 'block') {
        await adminAPI.blockOrganizer(actionDialog.organizer.id);
      }
      setActionDialog({ open: false, organizer: null, action: null });
      loadOrganizers();
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      APPROVED: 'Approuvé',
      PENDING: 'En attente',
      REJECTED: 'Rejeté',
      BLOCKED: 'Bloqué',
    };
    return labels[status] || status;
  };

  const getStatusClass = (status: string) => {
    if (status === 'APPROVED') return 'approved';
    if (status === 'PENDING') return 'pending';
    return 'blocked';
  };

  const filteredOrganizers = organizers.filter(org => 
    org.agency_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${org.user?.first_name} ${org.user?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: organizers.length,
    approved: organizers.filter(o => o.status === 'APPROVED').length,
    pending: organizers.filter(o => o.status === 'PENDING').length,
    blocked: organizers.filter(o => o.status === 'BLOCKED').length,
  };

  // Detail View
  if (showDetailView) {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress sx={{ color: COLORS.teal }} />
        </Box>
      );
    }
    
    if (!selectedOrganizer) {
      return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert 
            severity="error" 
            sx={{ borderRadius: 12, bgcolor: alpha(COLORS.amber, 0.05) }}
          >
            Organisateur non trouvé. 
            <Button onClick={() => navigate('/admin/organizers')} sx={{ ml: 2, color: COLORS.teal }}>
              Retour
            </Button>
          </Alert>
        </Container>
      );
    }
    
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: alpha(COLORS.navy, 0.02), py: 4 }}>
        <Container maxWidth="lg">
          <Fade in timeout={500}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton 
                  onClick={() => navigate('/admin/organizers')}
                  sx={{ 
                    bgcolor: COLORS.white, 
                    borderRadius: 12,
                    border: `1px solid ${alpha(COLORS.teal, 0.2)}`,
                    '&:hover': { bgcolor: alpha(COLORS.teal, 0.05), borderColor: COLORS.teal }
                  }}
                >
                  <ArrowBack sx={{ color: COLORS.navy }} />
                </IconButton>
                <Box>
                  <Typography variant="h4" fontWeight={800} sx={{ color: COLORS.navy, letterSpacing: '-0.02em' }}>
                    Détails de la demande
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6) }}>
                    Demande d'organisation de {selectedOrganizer.agency_name}
                  </Typography>
                </Box>
              </Box>
              <StatusChip
                label={getStatusLabel(selectedOrganizer.status)}
                className={getStatusClass(selectedOrganizer.status)}
              />
            </Box>
          </Fade>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <GlassPaper>
                <Typography variant="h6" fontWeight={700} sx={{ color: COLORS.navy, mb: 2 }}>
                  <Business sx={{ mr: 1, fontSize: 20, color: COLORS.teal, verticalAlign: 'middle' }} />
                  Informations de l'agence
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6), mb: 0.5 }}>Nom de l'agence</Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ color: COLORS.navy, mb: 2 }}>
                    {selectedOrganizer.agency_name}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6), mb: 0.5 }}>Numéro de licence</Typography>
                  <Typography variant="body1" sx={{ color: COLORS.navy, mb: 2 }}>
                    {selectedOrganizer.license_number || 'Non fourni'}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6), mb: 0.5 }}>Description</Typography>
                  <Typography variant="body1" sx={{ color: COLORS.navy }}>
                    {selectedOrganizer.description || 'Non fourni'}
                  </Typography>
                </Box>
              </GlassPaper>
            </Grid>

            <Grid item xs={12} md={6}>
              <GlassPaper>
                <Typography variant="h6" fontWeight={700} sx={{ color: COLORS.navy, mb: 2 }}>
                  <Verified sx={{ mr: 1, fontSize: 20, color: COLORS.teal, verticalAlign: 'middle' }} />
                  Informations du contact
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6), mb: 0.5 }}>Nom complet</Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ color: COLORS.navy, mb: 2 }}>
                    {selectedOrganizer.user?.first_name} {selectedOrganizer.user?.last_name}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6), mb: 0.5 }}>Email</Typography>
                  <Typography variant="body1" sx={{ color: COLORS.navy, mb: 2 }}>{selectedOrganizer.user?.email}</Typography>
                  
                  <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6), mb: 0.5 }}>Téléphone</Typography>
                  <Typography variant="body1" sx={{ color: COLORS.navy }}>{selectedOrganizer.user?.phone || 'Non fourni'}</Typography>
                </Box>
              </GlassPaper>
            </Grid>

            <Grid item xs={12} md={6}>
              <GlassPaper>
                <Typography variant="h6" fontWeight={700} sx={{ color: COLORS.navy, mb: 2 }}>
                  <LocationOn sx={{ mr: 1, fontSize: 20, color: COLORS.teal, verticalAlign: 'middle' }} />
                  Localisation
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6), mb: 0.5 }}>Adresse</Typography>
                  <Typography variant="body1" sx={{ color: COLORS.navy, mb: 2 }}>
                    {selectedOrganizer.address || 'Non fournie'}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6), mb: 0.5 }}>Pays</Typography>
                  <Typography variant="body1" sx={{ color: COLORS.navy }}>
                    {selectedOrganizer.country || 'Non fourni'}
                  </Typography>
                </Box>
              </GlassPaper>
            </Grid>

            <Grid item xs={12} md={6}>
              <GlassPaper>
                <Typography variant="h6" fontWeight={700} sx={{ color: COLORS.navy, mb: 2 }}>
                  <People sx={{ mr: 1, fontSize: 20, color: COLORS.teal, verticalAlign: 'middle' }} />
                  Expérience
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1" sx={{ color: COLORS.navy }}>
                    {selectedOrganizer.experience || 'Non fournie'}
                  </Typography>
                </Box>
              </GlassPaper>
            </Grid>

            <Grid item xs={12} md={6}>
              <GlassPaper>
                <Typography variant="h6" fontWeight={700} sx={{ color: COLORS.navy, mb: 2 }}>
                  🌐 Réseaux sociaux
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6), mb: 0.5 }}>Site web</Typography>
                  <Typography variant="body1" sx={{ color: COLORS.navy, mb: 2 }}>
                    {selectedOrganizer.website ? (
                      <a href={selectedOrganizer.website} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.teal }}>
                        {selectedOrganizer.website}
                      </a>
                    ) : 'Non fourni'}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6), mb: 0.5 }}>Facebook</Typography>
                  <Typography variant="body1" sx={{ color: COLORS.navy, mb: 2 }}>{selectedOrganizer.facebook || 'Non fourni'}</Typography>
                  
                  <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6), mb: 0.5 }}>Instagram</Typography>
                  <Typography variant="body1" sx={{ color: COLORS.navy }}>{selectedOrganizer.instagram || 'Non fourni'}</Typography>
                </Box>
              </GlassPaper>
            </Grid>

            <Grid item xs={12} md={6}>
              <GlassPaper>
                <Typography variant="h6" fontWeight={700} sx={{ color: COLORS.navy, mb: 2 }}>
                  📎 Documents
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {selectedOrganizer.documents && selectedOrganizer.documents.length > 0 ? (
                    selectedOrganizer.documents.map((doc: string, index: number) => {
                      const fileName = doc.split('/').pop() || 'Document';
                      const isPdf = doc.toLowerCase().includes('.pdf');
                      return (
                        <DocumentCard key={index}>
                          {isPdf ? 
                            <PictureAsPdf sx={{ color: COLORS.amber, mr: 2 }} /> : 
                            <InsertDriveFile sx={{ color: COLORS.teal, mr: 2 }} />
                          }
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={600} sx={{ color: COLORS.navy }}>
                              {fileName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: alpha(COLORS.navy, 0.5) }}>
                              {isPdf ? 'Document PDF' : 'Fichier image'}
                            </Typography>
                          </Box>
                          <IconButton 
                            component="a" 
                            href={`http://localhost:8000${doc}`} 
                            target="_blank"
                            size="small"
                            sx={{ color: COLORS.teal }}
                          >
                            <Download />
                          </IconButton>
                        </DocumentCard>
                      );
                    })
                  ) : (
                    <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6) }}>
                      Aucun document téléchargé.
                    </Typography>
                  )}
                </Box>
              </GlassPaper>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                {selectedOrganizer.status === 'PENDING' && (
                  <>
                    <GradientButton
                      startIcon={<CheckCircle />}
                      onClick={() => setActionDialog({ open: true, organizer: selectedOrganizer, action: 'approve' })}
                    >
                      Approuver
                    </GradientButton>
                    <OutlineButton
                      startIcon={<Block />}
                      onClick={() => setActionDialog({ open: true, organizer: selectedOrganizer, action: 'block' })}
                      sx={{ borderColor: COLORS.amber, color: COLORS.amber }}
                    >
                      Rejeter
                    </OutlineButton>
                  </>
                )}
                <OutlineButton onClick={() => navigate('/admin/organizers')}>
                  Retour
                </OutlineButton>
              </Box>
            </Grid>
          </Grid>
        </Container>

        {/* Action Dialog */}
        <Dialog
          open={actionDialog.open}
          onClose={() => setActionDialog({ open: false, organizer: null, action: null })}
          PaperProps={{ sx: { borderRadius:1, minWidth: 400 } }}
        >
          <DialogTitle sx={{ 
            background: actionDialog.action === 'approve' ? COLORS.teal : COLORS.amber,
            color: COLORS.white,
            py: 2,
            fontWeight: 700,
          }}>
            {actionDialog.action === 'approve' ? '✓ Approuver' : '✗ Rejeter'} la demande
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body1" gutterBottom sx={{ color: COLORS.navy }}>
              Êtes-vous sûr de vouloir <strong>{actionDialog.action === 'approve' ? 'approuver' : 'rejeter'}</strong> 
              {' '}{actionDialog.organizer?.agency_name} ?
            </Typography>
            <Alert 
              severity={actionDialog.action === 'approve' ? 'success' : 'error'} 
              sx={{ mt: 2, borderRadius: 2 }}
            >
              {actionDialog.action === 'approve' 
                ? 'Cette personne pourra créer des voyages et gérer des réservations.'
                : 'Cette personne ne pourra pas créer de voyages.'}
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <OutlineButton onClick={() => setActionDialog({ open: false, organizer: null, action: null })}>
              Annuler
            </OutlineButton>
            <GradientButton
              onClick={() => {
                handleAction();
                setActionDialog({ open: false, organizer: null, action: null });
              }}
              sx={{ bgcolor: actionDialog.action === 'approve' ? COLORS.teal : COLORS.amber }}
            >
              Confirmer
            </GradientButton>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // Main List View
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: alpha(COLORS.navy, 0.02), py: 4 }}>
      <Container maxWidth="xl">
        <Fade in timeout={500}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton 
                onClick={() => navigate('/admin')}
                sx={{ 
                  bgcolor: COLORS.white, 
                  borderRadius: 12,
                  border: `1px solid ${alpha(COLORS.teal, 0.2)}`,
                  '&:hover': { bgcolor: alpha(COLORS.teal, 0.05), borderColor: COLORS.teal }
                }}
              >
                <ArrowBack sx={{ color: COLORS.navy }} />
              </IconButton>
              <Box>
                <Typography variant="h4" fontWeight={800} sx={{ color: COLORS.navy, letterSpacing: '-0.02em' }}>
                  Gestion des organisateurs
                </Typography>
                <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6) }}>
                  Gérez les demandes d'organisation et les comptes organisateurs
                </Typography>
              </Box>
            </Box>
            <GradientButton startIcon={<Refresh />} onClick={loadOrganizers}>
              Actualiser
            </GradientButton>
          </Box>
        </Fade>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={300}>
              <StatsCard>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
                  <Avatar sx={{ bgcolor: alpha(COLORS.navy, 0.1), color: COLORS.navy, width: 48, height: 48, borderRadius: 12 }}>
                    <Business />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ color: alpha(COLORS.navy, 0.6) }}>Total</Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ color: COLORS.navy }}>{stats.total}</Typography>
                  </Box>
                </CardContent>
              </StatsCard>
            </Zoom>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={400}>
              <StatsCard>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
                  <Avatar sx={{ bgcolor: alpha(COLORS.teal, 0.1), color: COLORS.teal, width: 48, height: 48, borderRadius: 12 }}>
                    <CheckCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ color: alpha(COLORS.navy, 0.6) }}>Approuvés</Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ color: COLORS.teal }}>{stats.approved}</Typography>
                  </Box>
                </CardContent>
              </StatsCard>
            </Zoom>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={500}>
              <StatsCard>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
                  <Avatar sx={{ bgcolor: alpha(COLORS.amber, 0.1), color: COLORS.amber, width: 48, height: 48, borderRadius: 12 }}>
                    <Warning />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ color: alpha(COLORS.navy, 0.6) }}>En attente</Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ color: COLORS.amber }}>{stats.pending}</Typography>
                  </Box>
                </CardContent>
              </StatsCard>
            </Zoom>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={600}>
              <StatsCard>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
                  <Avatar sx={{ bgcolor: alpha(COLORS.amber, 0.1), color: COLORS.amber, width: 48, height: 48, borderRadius: 12 }}>
                    <Block />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ color: alpha(COLORS.navy, 0.6) }}>Bloqués</Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ color: COLORS.amber }}>{stats.blocked}</Typography>
                  </Box>
                </CardContent>
              </StatsCard>
            </Zoom>
          </Grid>
        </Grid>

        {/* Search Bar */}
        <GlassPaper sx={{ mb: 3, p: 2 }}>
          <SearchField
            fullWidth
            size="small"
            placeholder="Rechercher par nom d'agence, email ou nom d'utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: COLORS.teal, fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
        </GlassPaper>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 12 }}
            action={
              <Button color="inherit" size="small" onClick={loadOrganizers} sx={{ color: COLORS.amber }}>
                Réessayer
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Box textAlign="center" sx={{ py: 8 }}>
            <CircularProgress size={50} sx={{ color: COLORS.teal }} />
            <Typography variant="body1" sx={{ color: alpha(COLORS.navy, 0.6), mt: 2 }}>
              Chargement des organisateurs...
            </Typography>
          </Box>
        ) : filteredOrganizers.length === 0 ? (
          <GlassPaper sx={{ textAlign: 'center', py: 6 }}>
            <Business sx={{ fontSize: 60, color: alpha(COLORS.navy, 0.3), mb: 2 }} />
            <Typography variant="h6" fontWeight={600} sx={{ color: COLORS.navy, mb: 1 }}>
              {searchTerm ? 'Aucun organisateur trouvé' : 'Aucun organisateur'}
            </Typography>
            <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6), mb: 2 }}>
              {searchTerm ? 'Essayez d\'autres termes de recherche' : 'Aucun organisateur pour le moment'}
            </Typography>
            {searchTerm && (
              <OutlineButton onClick={() => setSearchTerm('')}>
                Effacer la recherche
              </OutlineButton>
            )}
          </GlassPaper>
        ) : (
          <Fade in timeout={500}>
            <StyledTableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Agence</StyledTableCell>
                    <StyledTableCell>Contact</StyledTableCell>
                    <StyledTableCell>Email</StyledTableCell>
                    <StyledTableCell>Pays</StyledTableCell>
                    <StyledTableCell>Statut</StyledTableCell>
                    <StyledTableCell align="center">Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrganizers.map((organizer, idx) => (
                    <TableRow 
                      key={organizer.id} 
                      sx={{ 
                        '&:hover': { bgcolor: alpha(COLORS.teal, 0.02) },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar 
                            sx={{ 
                              width: 42, 
                              height: 42, 
                              background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navy})`,
                              fontWeight: 'bold',
                              fontSize: '1rem',
                              color: COLORS.white,
                            }}
                          >
                            {organizer.agency_name?.[0]?.toUpperCase() || 'A'}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight={600} sx={{ color: COLORS.navy }}>
                              {organizer.agency_name}
                            </Typography>
                            {organizer.license_number && (
                              <Typography variant="caption" sx={{ color: alpha(COLORS.navy, 0.5), display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Verified sx={{ fontSize: 12 }} />
                                Lic: {organizer.license_number}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ color: COLORS.navy, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Person sx={{ fontSize: 14, color: alpha(COLORS.navy, 0.5) }} />
                            {organizer.user?.first_name} {organizer.user?.last_name}
                          </Typography>
                          {organizer.user?.phone && (
                            <Typography variant="caption" sx={{ color: alpha(COLORS.navy, 0.5), display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                              <Phone sx={{ fontSize: 12 }} />
                              {organizer.user?.phone}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Email sx={{ fontSize: 14, color: alpha(COLORS.navy, 0.5) }} />
                          <Typography variant="body2" sx={{ color: COLORS.navy, wordBreak: 'break-word' }}>
                            {organizer.user?.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <LocationOn sx={{ fontSize: 14, color: alpha(COLORS.navy, 0.5) }} />
                          <Typography variant="body2" sx={{ color: COLORS.navy, fontWeight: 500 }}>
                            {organizer.country || 'Non spécifié'}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip 
                          label={getStatusLabel(organizer.status)}
                          size="small"
                          sx={{ 
                            borderRadius: 8,
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            height: 26,
                            bgcolor: organizer.status === 'APPROVED' ? alpha(COLORS.teal, 0.12) 
                                   : organizer.status === 'PENDING' ? alpha(COLORS.amber, 0.12) 
                                   : alpha(COLORS.amber, 0.12),
                            color: organizer.status === 'APPROVED' ? COLORS.teal 
                                   : organizer.status === 'PENDING' ? COLORS.amber 
                                   : COLORS.amber,
                            border: `1px solid ${organizer.status === 'APPROVED' ? alpha(COLORS.teal, 0.3) 
                                   : organizer.status === 'PENDING' ? alpha(COLORS.amber, 0.3) 
                                   : alpha(COLORS.amber, 0.3)}`,
                          }}
                        />
                      </TableCell>
                      
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                          
                          {/* Bouton Voir Détails */}
                          <ActionButton
                            variant="text"
                            onClick={() => navigate(`/admin/organizers/${organizer.id}`)}
                            startIcon={<Visibility sx={{ fontSize: 15 }} />}
                            sx={{ color: COLORS.navy }}
                          >
                            Voir
                          </ActionButton>
                          
                          {/* Bouton Approuver - pour statut PENDING */}
                          {organizer.status === 'PENDING' && (
                            <ActionButton
                              variant="contained"
                              onClick={() => setActionDialog({ open: true, organizer, action: 'approve' })}
                              startIcon={<CheckCircle sx={{ fontSize: 14 }} />}
                              sx={{ bgcolor: COLORS.teal, color: COLORS.white }}
                            >
                              Approuver
                            </ActionButton>
                          )}
                          
                          {/* Bouton Bloquer/Débloquer */}
                          <ActionButton
                            variant="outlined"
                            onClick={() => setActionDialog({ open: true, organizer, action: 'block' })}
                            startIcon={<Block sx={{ fontSize: 14 }} />}
                            sx={{ 
                              borderColor: organizer.status !== 'BLOCKED' ? COLORS.amber : COLORS.teal,
                              color: organizer.status !== 'BLOCKED' ? COLORS.amber : COLORS.teal,
                            }}
                          >
                            {organizer.status !== 'BLOCKED' ? 'Bloquer' : 'Débloquer'}
                          </ActionButton>
                          
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </StyledTableContainer>
          </Fade>
        )}

        {/* Action Dialog pour la liste */}
        <Dialog
          open={actionDialog.open}
          onClose={() => setActionDialog({ open: false, organizer: null, action: null })}
          PaperProps={{ sx: { borderRadius: 16, minWidth: 400 } }}
        >
          <DialogTitle sx={{ 
            background: actionDialog.action === 'approve' ? COLORS.teal : COLORS.amber,
            color: COLORS.white,
            py: 2,
            fontWeight: 700,
          }}>
            {actionDialog.action === 'approve' ? '✓ Approuver' : '✗ Bloquer'} l'organisateur
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body1" gutterBottom sx={{ color: COLORS.navy }}>
              Êtes-vous sûr de vouloir <strong>{actionDialog.action === 'approve' ? 'approuver' : 'bloquer'}</strong> 
              {' '}{actionDialog.organizer?.agency_name} ?
            </Typography>
            {actionDialog.action === 'block' && (
              <Alert severity="warning" sx={{ mt: 2, borderRadius: 10, bgcolor: alpha(COLORS.amber, 0.05) }}>
                L'organisateur ne pourra plus publier de voyages ni recevoir de réservations.
              </Alert>
            )}
            {actionDialog.action === 'approve' && actionDialog.organizer?.status === 'BLOCKED' && (
              <Alert severity="info" sx={{ mt: 2, borderRadius: 10, bgcolor: alpha(COLORS.teal, 0.05) }}>
                L'organisateur pourra à nouveau publier des voyages.
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <OutlineButton onClick={() => setActionDialog({ open: false, organizer: null, action: null })}>
              Annuler
            </OutlineButton>
            <GradientButton
              onClick={() => {
                handleAction();
              }}
              sx={{ bgcolor: actionDialog.action === 'approve' ? COLORS.teal : COLORS.amber }}
            >
              Confirmer
            </GradientButton>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default AdminOrganizers;