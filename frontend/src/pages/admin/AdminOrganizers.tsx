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
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { adminAPI } from '../../services/api';

// Styled components (même thème que AdminDashboard)
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  '& .MuiTableHead-root': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  '&.MuiTableCell-head': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    fontWeight: 700,
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  fontWeight: 600,
  fontSize: '0.8rem',
  '&.approved': {
    backgroundColor: alpha(theme.palette.success.main, 0.1),
    color: theme.palette.success.main,
    border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
  },
  '&.pending': {
    backgroundColor: alpha(theme.palette.warning.main, 0.1),
    color: theme.palette.warning.main,
    border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
  },
  '&.blocked': {
    backgroundColor: alpha(theme.palette.error.main, 0.1),
    color: theme.palette.error.main,
    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
  },
}));

const DocumentCard = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1),
  backgroundColor: alpha(theme.palette.primary.main, 0.03),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  borderRadius: theme.spacing(1),
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateX(4px)',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.85rem',
  padding: theme.spacing(0.75, 1.5),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 32px rgba(0,191,165,0.15)',
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

  // Get selected organizer for detail view
  const organizerId = id ? parseInt(id) : null;
  
  // Show detail view if we have an ID, regardless of whether data is loaded yet
  const showDetailView = !!organizerId;
  
  // Try to find the organizer from loaded data
  const selectedOrganizer = organizerId ? organizers.find(o => o.id === organizerId) : null;

  useEffect(() => {
    loadOrganizers();
  }, []);

  // Render detail view BEFORE the main table if we have an ID
  if (showDetailView) {
    // Show loading while data is being fetched
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      );
    }
    
    // If no organizer found, show error
    if (!selectedOrganizer) {
      return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">
            Organisateur non trouvé. <Button onClick={() => navigate('/admin/organizers')}>Retour</Button>
          </Alert>
        </Container>
      );
    }
    
    // Show the detail view...
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
        py: 4,
      }}>
        <Container maxWidth="lg">
          <Fade in timeout={500}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton 
                  onClick={() => navigate('/admin/organizers')}
                  sx={{ 
                    bgcolor: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    '&:hover': { bgcolor: 'white', transform: 'translateX(-2px)' },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <ArrowBack />
                </IconButton>
                <Box>
                  <Typography variant="h4" fontWeight={700}>Détails de la demande</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Demande d'organisation de {selectedOrganizer.agency_name}
                  </Typography>
                </Box>
              </Box>
              <StatusChip
                label={selectedOrganizer.status === 'APPROVED' ? 'Approuvé' : selectedOrganizer.status === 'PENDING' ? 'En attente' : selectedOrganizer.status === 'REJECTED' ? 'Rejeté' : 'Bloqué'}
                className={selectedOrganizer.status === 'APPROVED' ? 'approved' : selectedOrganizer.status === 'PENDING' ? 'pending' : selectedOrganizer.status === 'BLOCKED' ? 'blocked' : ''}
                size="small"
              />
            </Box>
          </Fade>

          <Grid container spacing={3}>
            {/* Agency Information */}
            <Grid item xs={12} md={6}>
              <GlassPaper>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  🏢 Informations de l'agence
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">Nom de l'agence</Typography>
                  <Typography variant="body1" fontWeight={600}>{selectedOrganizer.agency_name}</Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Numéro de licence</Typography>
                  <Typography variant="body1">{selectedOrganizer.license_number || 'Non fourni'}</Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Description</Typography>
                  <Typography variant="body1">{selectedOrganizer.description || 'Non fourni'}</Typography>
                </Box>
              </GlassPaper>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12} md={6}>
              <GlassPaper>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  👤 Informations du contact
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">Nom complet</Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedOrganizer.user?.first_name} {selectedOrganizer.user?.last_name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Email</Typography>
                  <Typography variant="body1">{selectedOrganizer.user?.email}</Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Téléphone</Typography>
                  <Typography variant="body1">{selectedOrganizer.user?.phone || 'Non fourni'}</Typography>
                </Box>
              </GlassPaper>
            </Grid>

            {/* Location */}
            <Grid item xs={12} md={6}>
              <GlassPaper>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  📍 Localisation
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">Adresse</Typography>
                  <Typography variant="body1">{selectedOrganizer.address || 'Non fournie'}</Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Pays</Typography>
                  <Typography variant="body1">{selectedOrganizer.country || 'Non fourni'}</Typography>
                </Box>
              </GlassPaper>
            </Grid>

            {/* Experience */}
            <Grid item xs={12} md={6}>
              <GlassPaper>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  💼 Expérience
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1">{selectedOrganizer.experience || 'Non fournie'}</Typography>
                </Box>
              </GlassPaper>
            </Grid>

            {/* Social Media */}
            <Grid item xs={12} md={6}>
              <GlassPaper>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  🔗 Réseaux sociaux
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">Site web</Typography>
                  <Typography variant="body1">
                    {selectedOrganizer.website ? (
                      <a href={selectedOrganizer.website} target="_blank" rel="noopener noreferrer">
                        {selectedOrganizer.website}
                      </a>
                    ) : 'Non fourni'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Facebook</Typography>
                  <Typography variant="body1">{selectedOrganizer.facebook || 'Non fourni'}</Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Instagram</Typography>
                  <Typography variant="body1">{selectedOrganizer.instagram || 'Non fourni'}</Typography>
                </Box>
              </GlassPaper>
            </Grid>

            {/* Documents */}
            <Grid item xs={12} md={6}>
              <GlassPaper>
                <Typography variant="h6" fontWeight={700} gutterBottom>
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
                            <PictureAsPdf sx={{ color: '#ef5350', mr: 2 }} /> : 
                            <InsertDriveFile sx={{ color: '#1976d2', mr: 2 }} />
                          }
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {fileName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {isPdf ? 'Document PDF' : 'Fichier'}
                            </Typography>
                          </Box>
                          <IconButton 
                            component="a" 
                            href={`http://localhost:8000${doc}`} 
                            target="_blank"
                            size="small"
                            sx={{ color: 'primary.main' }}
                          >
                            <Download />
                          </IconButton>
                        </DocumentCard>
                      );
                    })
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Aucun document téléchargé.
                    </Typography>
                  )}
                </Box>
              </GlassPaper>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                {selectedOrganizer.status === 'PENDING' && (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      size="large"
                      startIcon={<CheckCircle />}
                      onClick={() => {
                        setActionDialog({
                          open: true,
                          organizer: selectedOrganizer,
                          action: 'approve',
                        });
                      }}
                      sx={{ borderRadius: 2 }}
                    >
                      Approuver
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="large"
                      startIcon={<Block />}
                      onClick={() => {
                        setActionDialog({
                          open: true,
                          organizer: selectedOrganizer,
                          action: 'block',
                        });
                      }}
                      sx={{ borderRadius: 2 }}
                    >
                      Rejeter
                    </Button>
                  </>
                )}
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/admin/organizers')}
                  sx={{ borderRadius: 2 }}
                >
                  Retour
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>

        {/* Action Dialog */}
        <Dialog
          open={actionDialog.open}
          onClose={() => setActionDialog({ open: false, organizer: null, action: null })}
          PaperProps={{
            sx: {
              borderRadius: 3,
              minWidth: 400,
            }
          }}
        >
          <DialogTitle sx={{ 
            background: actionDialog.action === 'approve' 
              ? 'linear-gradient(135deg, #4CAF50, #2E7D32)'
              : 'linear-gradient(135deg, #F44336, #D32F2F)',
            color: 'white',
            py: 2,
          }}>
            {actionDialog.action === 'approve' ? '✅ Approuver' : '⛔ Rejeter'} la demande
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body1" gutterBottom>
              Êtes-vous sûr de vouloir <strong>{actionDialog.action === 'approve' ? 'approuver' : 'rejeter'}</strong> 
              {' '}{actionDialog.organizer?.agency_name} ?
            </Typography>
            {actionDialog.action === 'approve' ? (
              <Alert severity="success" sx={{ mt: 2 }}>
                Cette personne pourra créer des voyages et gérer des réservations.
              </Alert>
            ) : (
              <Alert severity="error" sx={{ mt: 2 }}>
                Cette personne ne pourra pas créer de voyages.
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setActionDialog({ open: false, organizer: null, action: null })}>
              Annuler
            </Button>
            <Button
              variant="contained"
              color={actionDialog.action === 'approve' ? 'success' : 'error'}
              onClick={async () => {
                try {
                  if (actionDialog.action === 'approve') {
                    await adminAPI.approveOrganizer(actionDialog.organizer.id);
                  } else if (actionDialog.action === 'block') {
                    await adminAPI.blockOrganizer(actionDialog.organizer.id);
                  }
                  setActionDialog({ open: false, organizer: null, action: null });
                  navigate('/admin/organizers');
                } catch (error) {
                  console.error('Error performing action:', error);
                }
              }}
            >
              Confirmer
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  const loadOrganizers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getOrganizers();
      console.log('Organizers response:', response.data);
      setOrganizers(response.data);
    } catch (err: any) {
      console.error('Error loading organizers:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Erreur lors du chargement des organisateurs');
      }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REJECTED':
      case 'BLOCKED':
        return 'error';
      default:
        return 'default';
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
    switch (status) {
      case 'APPROVED': return 'approved';
      case 'PENDING': return 'pending';
      case 'BLOCKED': return 'blocked';
      default: return '';
    }
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

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
      py: 4,
    }}>
      <Container maxWidth="xl">
        {/* Header avec bouton retour */}
        <Fade in timeout={500}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton 
                onClick={() => navigate('/admin')}
                sx={{ 
                  bgcolor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  '&:hover': { bgcolor: 'white', transform: 'translateX(-2px)' },
                  transition: 'all 0.3s ease',
                }}
              >
                <ArrowBack />
              </IconButton>
              <Box>
                <Typography variant="h4" fontWeight="700">Gestion des organisateurs</Typography>
                <Typography variant="body2" color="text.secondary">
                  Gérez les demandes d'organisation et les comptes organisateurs
                </Typography>
              </Box>
            </Box>
            <Button
              startIcon={<Refresh />}
              onClick={loadOrganizers}
              variant="contained"
              sx={{ 
                borderRadius: 2,
                background: 'linear-gradient(90deg, #00BFA5, #0D47A1)',
              }}
            >
              Actualiser
            </Button>
          </Box>
        </Fade>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={500}>
              <StatsCard>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: alpha('#00BFA5', 0.1), color: '#00BFA5', width: 48, height: 48 }}>
                    <Business />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total</Typography>
                    <Typography variant="h5" fontWeight="700">{stats.total}</Typography>
                  </Box>
                </CardContent>
              </StatsCard>
            </Zoom>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={600}>
              <StatsCard>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: alpha('#4CAF50', 0.1), color: '#4CAF50', width: 48, height: 48 }}>
                    <CheckCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Approuvés</Typography>
                    <Typography variant="h5" fontWeight="700" color="success.main">{stats.approved}</Typography>
                  </Box>
                </CardContent>
              </StatsCard>
            </Zoom>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={700}>
              <StatsCard>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: alpha('#FF9800', 0.1), color: '#FF9800', width: 48, height: 48 }}>
                    <Warning />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">En attente</Typography>
                    <Typography variant="h5" fontWeight="700" color="warning.main">{stats.pending}</Typography>
                  </Box>
                </CardContent>
              </StatsCard>
            </Zoom>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={800}>
              <StatsCard>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: alpha('#F44336', 0.1), color: '#F44336', width: 48, height: 48 }}>
                    <Block />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Bloqués</Typography>
                    <Typography variant="h5" fontWeight="700" color="error.main">{stats.blocked}</Typography>
                  </Box>
                </CardContent>
              </StatsCard>
            </Zoom>
          </Grid>
        </Grid>

        {/* Barre de recherche */}
        <GlassPaper sx={{ mb: 3, p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Rechercher par nom d'agence, email ou nom d'utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" sx={{ color: '#00BFA5' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 }
            }}
          />
        </GlassPaper>

        {error && (
          <Fade in>
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: 2 }}
              action={
                <Button color="inherit" size="small" onClick={loadOrganizers}>
                  Réessayer
                </Button>
              }
            >
              {error}
            </Alert>
          </Fade>
        )}

        {loading ? (
          <Box textAlign="center" sx={{ py: 8 }}>
            <CircularProgress size={50} thickness={4} sx={{ color: '#00BFA5' }} />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Chargement des organisateurs...
            </Typography>
          </Box>
        ) : filteredOrganizers.length === 0 ? (
          <GlassPaper sx={{ textAlign: 'center', py: 6 }}>
            <Business sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchTerm ? 'Aucun organisateur trouvé' : 'Aucun organisateur'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {searchTerm ? 'Essayez d\'autres termes de recherche' : 'Aucun organisateur pour le moment'}
            </Typography>
            {searchTerm && (
              <Button variant="outlined" onClick={() => setSearchTerm('')}>
                Effacer la recherche
              </Button>
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
                    <StyledTableCell>Description</StyledTableCell>
                    <StyledTableCell>Expérience</StyledTableCell>
                    <StyledTableCell>Pays</StyledTableCell>
                    <StyledTableCell>Statut</StyledTableCell>
                    <StyledTableCell align="center">Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrganizers.map((organizer) => (
                    <TableRow key={organizer.id} sx={{ '&:hover': { bgcolor: alpha('#00BFA5', 0.02) } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar 
                            src={organizer.logo} 
                            sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
                          >
                            {organizer.agency_name?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight="600">
                              {organizer.agency_name}
                            </Typography>
                            {organizer.license_number && (
                              <Typography variant="caption" color="text.secondary">
                                License: {organizer.license_number}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {organizer.user?.first_name} {organizer.user?.last_name}
                        </Typography>
                        {organizer.phone && (
                          <Typography variant="caption" color="text.secondary">
                            {organizer.phone}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">{organizer.user?.email}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                          {organizer.description || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {organizer.experience || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">{organizer.country}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <StatusChip
                          label={getStatusLabel(organizer.status)}
                          className={getStatusClass(organizer.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Voir détails">
                            <IconButton 
                              size="small"
                              onClick={() => navigate(`/admin/organizers/${organizer.id}`)}
                              sx={{ color: '#00BFA5' }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {organizer.status === 'PENDING' && (
                            <Tooltip title="Approuver">
                              <ActionButton
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircle />}
                                onClick={() =>
                                  setActionDialog({
                                    open: true,
                                    organizer,
                                    action: 'approve',
                                  })
                                }
                              >
                                Approuver
                              </ActionButton>
                            </Tooltip>
                          )}
                          
                          {organizer.status !== 'BLOCKED' ? (
                            <Tooltip title="Bloquer">
                              <ActionButton
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<Block />}
                                onClick={() =>
                                  setActionDialog({
                                    open: true,
                                    organizer,
                                    action: 'block',
                                  })
                                }
                              >
                                Bloquer
                              </ActionButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Débloquer">
                              <ActionButton
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircle />}
                                onClick={() =>
                                  setActionDialog({
                                    open: true,
                                    organizer,
                                    action: 'approve',
                                  })
                                }
                              >
                                Débloquer
                              </ActionButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </StyledTableContainer>
          </Fade>
        )}

        {/* Action Dialog */}
        <Dialog
          open={actionDialog.open}
          onClose={() => setActionDialog({ open: false, organizer: null, action: null })}
          PaperProps={{
            sx: {
              borderRadius: 3,
              minWidth: 400,
            }
          }}
        >
          <DialogTitle sx={{ 
            background: actionDialog.action === 'approve' 
              ? 'linear-gradient(135deg, #4CAF50, #2E7D32)'
              : 'linear-gradient(135deg, #F44336, #D32F2F)',
            color: 'white',
            py: 2,
          }}>
            {actionDialog.action === 'approve' ? '✅ Approuver' : '⛔ Bloquer'} l'organisateur
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body1" gutterBottom>
              Êtes-vous sûr de vouloir <strong>{actionDialog.action === 'approve' ? 'approuver' : 'bloquer'}</strong> 
              {' '}{actionDialog.organizer?.agency_name} ?
            </Typography>
            {actionDialog.action === 'block' && (
              <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                L'organisateur ne pourra plus publier de voyages ni recevoir de réservations.
              </Alert>
            )}
            {actionDialog.action === 'approve' && actionDialog.organizer?.status === 'BLOCKED' && (
              <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                L'organisateur pourra à nouveau publier des voyages.
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button 
              onClick={() => setActionDialog({ open: false, organizer: null, action: null })}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleAction}
              variant="contained"
              color={actionDialog.action === 'approve' ? 'success' : 'error'}
              sx={{ 
                borderRadius: 2,
                background: actionDialog.action === 'approve' 
                  ? 'linear-gradient(90deg, #4CAF50, #2E7D32)'
                  : 'linear-gradient(90deg, #F44336, #D32F2F)',
              }}
            >
              Confirmer
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default AdminOrganizers;