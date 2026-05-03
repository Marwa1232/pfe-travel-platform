import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  AccountCircle,
  AdminPanelSettings,
  ArrowRightAlt,
  BusinessCenter,
  Delete,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  Language as LanguageIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  SwapHoriz as SwapHorizIcon,
  VpnKey,
  Notifications as NotificationsIcon,
  Twitter as TwitterIcon,
  Email,
  Phone,
  Public,
} from '@mui/icons-material';
import { RootState } from '../store';
import { userAPI, organizerAPI, fixImageUrl } from '../services/api';

// ─── Couleurs uniquement ─────────────────────────────────────────
const COLORS = {
  teal: '#0EA5A0',
  navy: '#0F2D5C',
  amber: '#D97706',
  white: '#FFFFFF',
  grey50: '#F8FAFC',
  grey100: '#F1F5F9',
  grey200: '#E2E8F0',
  grey400: '#94A3B8',
  grey600: '#475569',
  grey700: '#334155',
  grey800: '#1E293B',
  red: '#EF4444',
  green: '#10B981',
};

type RoleType = 'ADMIN' | 'ORGANIZER' | 'USER';

// ─── Styled Components ───────────────────────────────────────────
const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navy})`,
  borderRadius: 12,
  padding: theme.spacing(1.2, 3),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.85rem',
  color: COLORS.white,
  '&:hover': {
    background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.teal})`,
    transform: 'translateY(-1px)',
  },
}));

const OutlinedButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.2, 3),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.85rem',
  borderColor: COLORS.navy,
  color: COLORS.navy,
  '&:hover': {
    borderColor: COLORS.teal,
    backgroundColor: alpha(COLORS.teal, 0.05),
  },
}));

const DangerButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.2, 3),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.85rem',
  backgroundColor: COLORS.red,
  color: COLORS.white,
  '&:hover': {
    backgroundColor: alpha(COLORS.red, 0.8),
  },
}));

const SidebarCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  position: 'sticky',
  top: 24,
  overflow: 'hidden',
  border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
  boxShadow: `0 4px 20px ${alpha(COLORS.navy, 0.06)}`,
}));

const SectionCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: 'none',
  border: `1px solid ${alpha(COLORS.grey200, 0.8)}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: alpha(COLORS.teal, 0.3),
  },
}));

const StyledInput = styled(TextField)(({ theme }) => ({
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

const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: 12,
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: COLORS.teal,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: COLORS.teal,
  },
}));

const InstagramGradient = () => (
  <InstagramIcon
    sx={{
      mr: 1,
      fontSize: 22,
      background: `linear-gradient(45deg, #E1306C 0%, #F56040 25%, #F77737 50%, #FCAF45 75%, #FCF3A4 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: 'transparent',
    }}
  />
);

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const userAny = user as any;
  const organizerProfile = userAny?.organizerProfile ?? null;

  React.useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  const currentRole: RoleType = React.useMemo(() => {
    if (user?.roles?.includes('ROLE_ADMIN')) return 'ADMIN';
    if (user?.roles?.includes('ROLE_ORGANIZER')) return 'ORGANIZER';
    return 'USER';
  }, [user?.roles]);

  const sectionRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const setSectionRef = React.useCallback((id: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el;
  }, []);

  const scrollToSection = React.useCallback((id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity?: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [saving, setSaving] = React.useState(false);
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const showMessage = (message: string, severity: 'success' | 'error' = 'success') => setSnackbar({ open: true, message, severity });

  // Personal Information
  const [firstName, setFirstName] = React.useState<string>(userAny?.first_name ?? '');
  const [lastName, setLastName] = React.useState<string>(userAny?.last_name ?? '');
  const [email, setEmail] = React.useState<string>(userAny?.email ?? '');
  const [phone, setPhone] = React.useState<string>(userAny?.phone ?? '');
  const [country, setCountry] = React.useState<string>(userAny?.country ?? 'Tunisia');
  const [preferredLanguage, setPreferredLanguage] = React.useState<string>(userAny?.preferred_language ?? 'fr');
  const [preferredCurrency, setPreferredCurrency] = React.useState<string>(userAny?.preferred_currency ?? 'TND');
  const [profilePhotoPreview, setProfilePhotoPreview] = React.useState<string | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = React.useState<string | null>(userAny?.profile_photo_url ? fixImageUrl(userAny.profile_photo_url) : null);

  React.useEffect(() => {
    setFirstName(userAny?.first_name ?? '');
    setLastName(userAny?.last_name ?? '');
    setEmail(userAny?.email ?? '');
    setPhone(userAny?.phone ?? '');
    setCountry(userAny?.country ?? 'Tunisia');
    setPreferredLanguage(userAny?.preferred_language ?? 'fr');
    setPreferredCurrency(userAny?.preferred_currency ?? 'TND');
    setProfilePhotoUrl(userAny?.profile_photo_url ? fixImageUrl(userAny.profile_photo_url) : null);
    setPhotoFile(null);
  }, [userAny]);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      let photoUrl = profilePhotoUrl;
      if (photoFile) {
        const photoRes = await userAPI.uploadProfilePhoto(photoFile);
        photoUrl = fixImageUrl(photoRes.data.profile_photo_url);
      }
      await userAPI.updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        country: country,
        preferred_language: preferredLanguage,
        preferred_currency: preferredCurrency,
        ...(photoUrl && { profile_photo_url: photoUrl }),
      });
      setProfilePhotoPreview(null);
      setPhotoFile(null);
      if (photoUrl) setProfilePhotoUrl(photoUrl);
      showMessage('Profil mis à jour avec succès!');
    } catch (error: any) {
      showMessage(error.response?.data?.error || 'Erreur lors de la mise à jour', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCompanyInfo = async () => {
    try {
      setSaving(true);
      await organizerAPI.updateProfile({
        agency_name: agencyName,
        license_number: licenseNumber,
        address: address,
        country: companyCountry,
        description: description,
        experience: experience,
      });
      showMessage('Informations mises à jour avec succès!');
    } catch (error: any) {
      showMessage(error.response?.data?.error || 'Erreur lors de la mise à jour', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSocialLinks = async () => {
    try {
      setSaving(true);
      await userAPI.updateSocialLinks({
        facebook,
        instagram,
        website,
        linkedin,
        x_link: xLink,
      });
      showMessage('Liens sociaux mis à jour avec succès!');
    } catch (error: any) {
      showMessage(error.response?.data?.error || 'Erreur lors de la mise à jour', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      await userAPI.updatePreferences({
        interests: travelInterests,
      });
      showMessage('Préférences mises à jour avec succès!');
    } catch (error: any) {
      showMessage(error.response?.data?.error || 'Erreur lors de la mise à jour', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showMessage('Les mots de passe ne correspondent pas', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showMessage('Le mot de passe doit contenir au moins 6 caractères', 'error');
      return;
    }
    try {
      setSaving(true);
      await userAPI.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showMessage('Mot de passe changé avec succès!');
    } catch (error: any) {
      showMessage(error.response?.data?.error || 'Erreur lors du changement', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setSaving(true);
      await userAPI.deleteAccount(deletePassword);
      showMessage('Compte supprimé avec succès!');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error: any) {
      showMessage(error.response?.data?.error || 'Erreur lors de la suppression', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDisableAccount = async () => {
    try {
      setSaving(true);
      await userAPI.disableAccount(deletePassword);
      showMessage('Agence désactivée avec succès!');
    } catch (error: any) {
      showMessage(error.response?.data?.error || 'Erreur lors de la désactivation', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Company Info
  const [agencyName, setAgencyName] = React.useState<string>(organizerProfile?.agency_name ?? '');
  const [licenseNumber, setLicenseNumber] = React.useState<string>(organizerProfile?.license_number ?? '');
  const [address, setAddress] = React.useState<string>(organizerProfile?.address ?? '');
  const [companyCountry, setCompanyCountry] = React.useState<string>(organizerProfile?.country ?? 'Tunisia');
  const [description, setDescription] = React.useState<string>(organizerProfile?.description ?? '');
  const [experience, setExperience] = React.useState<string>(organizerProfile?.experience ?? '');
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    setAgencyName(organizerProfile?.agency_name ?? '');
    setLicenseNumber(organizerProfile?.license_number ?? '');
    setAddress(organizerProfile?.address ?? '');
    setCompanyCountry(organizerProfile?.country ?? 'Tunisia');
    setDescription(organizerProfile?.description ?? '');
    setExperience(organizerProfile?.experience ?? '');
    setLogoPreview(null);
  }, [organizerProfile]);

  // Admin Platform Info
  const [platformName, setPlatformName] = React.useState<string>(userAny?.platform_name ?? '');
  const [supportEmail, setSupportEmail] = React.useState<string>(userAny?.support_email ?? '');
  const [commissionPercent, setCommissionPercent] = React.useState<string>(userAny?.commission_percent ?? '');
  const [adminDefaultCurrency, setAdminDefaultCurrency] = React.useState<string>(userAny?.preferred_currency ?? 'TND');

  // Social Links
  const [facebook, setFacebook] = React.useState<string>(organizerProfile?.facebook ?? '');
  const [instagram, setInstagram] = React.useState<string>(organizerProfile?.instagram ?? '');
  const [linkedin, setLinkedin] = React.useState<string>('');
  const [website, setWebsite] = React.useState<string>(organizerProfile?.website ?? '');
  const [xLink, setXLink] = React.useState<string>('');

  React.useEffect(() => {
    setFacebook(organizerProfile?.facebook ?? '');
    setInstagram(organizerProfile?.instagram ?? '');
    setWebsite(organizerProfile?.website ?? '');
    setLinkedin('');
    setXLink('');
  }, [organizerProfile]);

  // Change Password
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  // Preferences
  const [emailNotifications, setEmailNotifications] = React.useState<boolean>(true);
  const [promotions, setPromotions] = React.useState<boolean>(true);
  const interestOptions = React.useMemo(
    () => ['Plage', 'Montagne', 'Ville', 'Culture', 'Aventure', 'Luxe', 'Économique'],
    []
  );
  const [travelInterests, setTravelInterests] = React.useState<string[]>(userAny?.interests ?? []);

  React.useEffect(() => {
    setTravelInterests(userAny?.interests ?? []);
  }, [userAny]);

  // Ownership Transfer
  const [newOwnerEmail, setNewOwnerEmail] = React.useState('');
  const [transferConfirmation, setTransferConfirmation] = React.useState('');

  // Account Deletion
  const [deletePassword, setDeletePassword] = React.useState('');

  const sidebarItems: Array<{ id: string; label: string; icon: React.ReactNode; show?: boolean }> = [
    { id: 'personal-info', label: 'Informations personnelles', icon: <PersonIcon /> },
    { id: 'company-info', label: 'Informations société', icon: <BusinessCenter />, show: currentRole !== 'USER' },
    { id: 'social', label: 'Réseaux sociaux', icon: <NotificationsIcon /> },
    { id: 'preferences', label: 'Préférences', icon: <SecurityIcon />, show: currentRole === 'USER' || currentRole === 'ORGANIZER' },
    { id: 'change-password', label: 'Sécurité', icon: <LockIcon /> },
    { id: 'ownership', label: 'Transfert', icon: <SwapHorizIcon />, show: currentRole === 'ORGANIZER' || currentRole === 'ADMIN' },
    { id: 'account-deletion', label: 'Zone dangereuse', icon: <Delete /> },
  ];

  const headerAvatarSrc = profilePhotoPreview || profilePhotoUrl || null;
  const companyLogoAvatarSrc = logoPreview ?? organizerProfile?.logo ?? null;

  const getRoleColor = () => {
    if (currentRole === 'ADMIN') return COLORS.amber;
    if (currentRole === 'ORGANIZER') return COLORS.teal;
    return COLORS.navy;
  };

  const getRoleLabel = () => {
    if (currentRole === 'ADMIN') return 'Administrateur';
    if (currentRole === 'ORGANIZER') return 'Organisateur';
    return 'Voyageur';
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 5, bgcolor: COLORS.grey50 }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          {/* Header */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h4" fontWeight={800} sx={{ color: COLORS.navy, letterSpacing: '-0.02em' }}>
              Paramètres
            </Typography>
            <Typography variant="body2" sx={{ color: COLORS.grey600, mt: 0.5 }}>
              Gérez vos informations personnelles, sécurité et préférences
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Sidebar */}
            <Grid item xs={12} md={4} lg={3}>
              <SidebarCard>
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar
                      src={headerAvatarSrc ? headerAvatarSrc : undefined}
                      sx={{ width: 50, height: 50, bgcolor: COLORS.teal }}
                    >
                      <AccountCircle fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography fontWeight={700} sx={{ color: COLORS.navy }}>
                        {`${firstName || userAny?.first_name || ''} ${lastName || userAny?.last_name || ''}`.trim() || 'Utilisateur'}
                      </Typography>
                      <Chip
                        label={getRoleLabel()}
                        size="small"
                        sx={{
                          bgcolor: alpha(getRoleColor(), 0.1),
                          color: getRoleColor(),
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 22,
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 1.5 }} />

                  <List disablePadding>
                    {sidebarItems
                      .filter((x) => x.show !== false)
                      .map((item) => (
                        <ListItemButton
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          sx={{ borderRadius: 1, mb: 0.5 }}
                        >
                          <ListItemIcon sx={{ minWidth: 36, color: COLORS.grey600 }}>{item.icon}</ListItemIcon>
                          <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.85rem' }} />
                          <ArrowRightAlt sx={{ fontSize: 16, color: COLORS.grey400 }} />
                        </ListItemButton>
                      ))}
                  </List>
                </CardContent>
              </SidebarCard>
            </Grid>

            {/* Main Content */}
            <Grid item xs={12} md={8} lg={9}>
              <Stack spacing={3}>
                {/* Personal Information */}
                <Box id="personal-info" ref={setSectionRef('personal-info')}>
                  <SectionCard>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                        <Avatar sx={{ bgcolor: alpha(COLORS.teal, 0.1), color: COLORS.teal, width: 36, height: 36 }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={700} sx={{ color: COLORS.navy }}>
                            Informations personnelles
                          </Typography>
                          <Typography variant="body2" sx={{ color: COLORS.grey600 }}>
                            Gérez votre profil et vos coordonnées
                          </Typography>
                        </Box>
                      </Stack>

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <StyledInput
                            fullWidth
                            label="Prénom"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <StyledInput
                            fullWidth
                            label="Nom"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <StyledInput
                            fullWidth
                            label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            size="small"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Email sx={{ fontSize: 18, color: COLORS.grey400 }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <StyledInput
                            fullWidth
                            label="Téléphone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            size="small"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Phone sx={{ fontSize: 18, color: COLORS.grey400 }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Pays</InputLabel>
                            <StyledSelect
                              value={country}
                              label="Pays"
                              onChange={(e) => setCountry(e.target.value as string)}
                            >
                              <MenuItem value="Tunisia">Tunisie</MenuItem>
                              <MenuItem value="France">France</MenuItem>
                              <MenuItem value="Germany">Allemagne</MenuItem>
                              <MenuItem value="Canada">Canada</MenuItem>
                              <MenuItem value="United States">États-Unis</MenuItem>
                            </StyledSelect>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Langue préférée</InputLabel>
                            <StyledSelect
                              value={preferredLanguage}
                              label="Langue préférée"
                              onChange={(e) => setPreferredLanguage(e.target.value as string)}
                            >
                              <MenuItem value="fr">Français</MenuItem>
                              <MenuItem value="en">English</MenuItem>
                              <MenuItem value="ar">العربية</MenuItem>
                            </StyledSelect>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar
                              src={headerAvatarSrc ? headerAvatarSrc : undefined}
                              sx={{ width: 56, height: 56, bgcolor: alpha(COLORS.teal, 0.1) }}
                            />
                            <Button
                              variant="outlined"
                              component="label"
                              sx={{ borderRadius: 1, textTransform: 'none', borderColor: COLORS.grey200 }}
                            >
                              Changer la photo
                              <input
                                hidden
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  setPhotoFile(file);
                                  const url = URL.createObjectURL(file);
                                  setProfilePhotoPreview(url);
                                }}
                              />
                            </Button>
                          </Stack>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <GradientButton onClick={handleSaveProfile} disabled={saving}>
                              {saving ? 'Enregistrement...' : 'Enregistrer'}
                            </GradientButton>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </SectionCard>
                </Box>

                {/* Company Info */}
                {currentRole !== 'USER' && (
                  <Box id="company-info" ref={setSectionRef('company-info')}>
                    <SectionCard>
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                          <Avatar sx={{ bgcolor: alpha(COLORS.amber, 0.1), color: COLORS.amber, width: 36, height: 36 }}>
                            <BusinessCenter />
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight={700} sx={{ color: COLORS.navy }}>
                              Informations société
                            </Typography>
                            <Typography variant="body2" sx={{ color: COLORS.grey600 }}>
                              {currentRole === 'ADMIN' ? 'Configuration de la plateforme' : 'Informations de votre agence'}
                            </Typography>
                          </Box>
                        </Stack>

                        <Grid container spacing={2}>
                          {currentRole === 'ADMIN' ? (
                            <>
                              <Grid item xs={12} md={6}>
                                <StyledInput fullWidth label="Nom de la plateforme" value={platformName} onChange={(e) => setPlatformName(e.target.value)} size="small" />
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <StyledInput fullWidth label="Email support" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} size="small" />
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <StyledInput fullWidth label="Commission (%)" value={commissionPercent} onChange={(e) => setCommissionPercent(e.target.value)} size="small" />
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <FormControl fullWidth size="small">
                                  <InputLabel>Devise par défaut</InputLabel>
                                  <StyledSelect value={adminDefaultCurrency} label="Devise par défaut" onChange={(e) => setAdminDefaultCurrency(e.target.value as string)}>
                                    <MenuItem value="TND">TND</MenuItem>
                                    <MenuItem value="EUR">EUR</MenuItem>
                                    <MenuItem value="USD">USD</MenuItem>
                                    <MenuItem value="GBP">GBP</MenuItem>
                                  </StyledSelect>
                                </FormControl>
                              </Grid>
                            </>
                          ) : (
                            <>
                              <Grid item xs={12} md={6}>
                                <StyledInput fullWidth label="Nom de l'agence" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} size="small" />
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <StyledInput fullWidth label="Numéro de licence" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} size="small" />
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <StyledInput fullWidth label="Adresse" value={address} onChange={(e) => setAddress(e.target.value)} size="small" />
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <FormControl fullWidth size="small">
                                  <InputLabel>Pays</InputLabel>
                                  <StyledSelect value={companyCountry} label="Pays" onChange={(e) => setCompanyCountry(e.target.value as string)}>
                                    <MenuItem value="Tunisia">Tunisie</MenuItem>
                                    <MenuItem value="France">France</MenuItem>
                                    <MenuItem value="Germany">Allemagne</MenuItem>
                                    <MenuItem value="Canada">Canada</MenuItem>
                                  </StyledSelect>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12}>
                                <StyledInput fullWidth label="Description" value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={2} size="small" />
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <StyledInput fullWidth label="Années d'expérience" value={experience} onChange={(e) => setExperience(e.target.value)} size="small" />
                              </Grid>
                            </>
                          )}
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <GradientButton onClick={currentRole === 'ADMIN' ? handleSaveProfile : handleSaveCompanyInfo} disabled={saving}>
                                {saving ? 'Enregistrement...' : 'Enregistrer'}
                              </GradientButton>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </SectionCard>
                  </Box>
                )}

                {/* Social Links */}
                <Box id="social" ref={setSectionRef('social')}>
                  <SectionCard>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                        <Avatar sx={{ bgcolor: alpha(COLORS.teal, 0.1), color: COLORS.teal, width: 36, height: 36 }}>
                          <Public />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={700} sx={{ color: COLORS.navy }}>
                            Réseaux sociaux
                          </Typography>
                          <Typography variant="body2" sx={{ color: COLORS.grey600 }}>
                            Liez vos comptes professionnels
                          </Typography>
                        </Box>
                      </Stack>

                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <StyledInput
                            fullWidth
                            label="Facebook"
                            value={facebook}
                            onChange={(e) => setFacebook(e.target.value)}
                            placeholder="https://facebook.com/yourpage"
                            size="small"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <FacebookIcon sx={{ color: '#1877F2', fontSize: 20 }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <StyledInput
                            fullWidth
                            label="Instagram"
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            placeholder="@youraccount"
                            size="small"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <InstagramGradient />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <StyledInput
                            fullWidth
                            label="Site web"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://youragency.com"
                            size="small"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LanguageIcon sx={{ color: COLORS.grey400, fontSize: 20 }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <GradientButton onClick={handleSaveSocialLinks} disabled={saving}>
                              {saving ? 'Enregistrement...' : 'Enregistrer'}
                            </GradientButton>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </SectionCard>
                </Box>

                {/* Preferences */}
                {(currentRole === 'USER' || currentRole === 'ORGANIZER') && (
                  <Box id="preferences" ref={setSectionRef('preferences')}>
                    <SectionCard>
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                          <Avatar sx={{ bgcolor: alpha(COLORS.amber, 0.1), color: COLORS.amber, width: 36, height: 36 }}>
                            <SettingsIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight={700} sx={{ color: COLORS.navy }}>
                              Préférences
                            </Typography>
                            <Typography variant="body2" sx={{ color: COLORS.grey600 }}>
                              Centres d'intérêt et notifications
                            </Typography>
                          </Box>
                        </Stack>

                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <FormControlLabel
                              control={<Switch checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: COLORS.teal } }} />}
                              label="Notifications email"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <FormControlLabel
                              control={<Switch checked={promotions} onChange={(e) => setPromotions(e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: COLORS.teal } }} />}
                              label="Offres promotionnelles"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Centres d'intérêt</InputLabel>
                              <StyledSelect
                                multiple
                                value={travelInterests}
                                onChange={(e) => setTravelInterests(e.target.value as string[])}
                                label="Centres d'intérêt"
                                renderValue={(selected) => (selected as string[]).join(', ')}
                              >
                                {interestOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </StyledSelect>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <GradientButton onClick={handleSavePreferences} disabled={saving}>
                                {saving ? 'Enregistrement...' : 'Enregistrer'}
                              </GradientButton>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </SectionCard>
                  </Box>
                )}

                {/* Security - Change Password */}
                <Box id="change-password" ref={setSectionRef('change-password')}>
                  <SectionCard>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                        <Avatar sx={{ bgcolor: alpha(COLORS.teal, 0.1), color: COLORS.teal, width: 36, height: 36 }}>
                          <VpnKey />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={700} sx={{ color: COLORS.navy }}>
                            Sécurité
                          </Typography>
                          <Typography variant="body2" sx={{ color: COLORS.grey600 }}>
                            Changez votre mot de passe
                          </Typography>
                        </Box>
                      </Stack>

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <StyledInput fullWidth type="password" label="Mot de passe actuel" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} size="small" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <StyledInput fullWidth type="password" label="Nouveau mot de passe" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} size="small" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <StyledInput fullWidth type="password" label="Confirmation" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} size="small" />
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <GradientButton onClick={handleChangePassword} disabled={saving}>
                              {saving ? 'Mise à jour...' : 'Changer le mot de passe'}
                            </GradientButton>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </SectionCard>
                </Box>

                {/* Danger Zone */}
                <Box id="account-deletion" ref={setSectionRef('account-deletion')}>
                  <SectionCard>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                        <Avatar sx={{ bgcolor: alpha(COLORS.red, 0.1), color: COLORS.red, width: 36, height: 36 }}>
                          <Delete />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={700} sx={{ color: COLORS.red }}>
                            Zone dangereuse
                          </Typography>
                          <Typography variant="body2" sx={{ color: COLORS.grey600 }}>
                            Actions irréversibles
                          </Typography>
                        </Box>
                      </Stack>

                      {currentRole !== 'ADMIN' ? (
                        <>
                          <Alert severity="error" sx={{ borderRadius: 1, mb: 2, bgcolor: alpha(COLORS.red, 0.05) }}>
                            <Typography variant="body2" fontWeight={600}>
                              {currentRole === 'ORGANIZER' ? 'Désactiver votre agence' : 'Supprimer votre compte'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: COLORS.grey600, fontSize: '0.75rem' }}>
                              {currentRole === 'ORGANIZER'
                                ? 'Cette action désactivera votre agence et tous vos voyages.'
                                : 'Cette action supprimera définitivement votre compte et toutes vos données.'}
                            </Typography>
                          </Alert>

                          <Grid container spacing={2}>
                            <Grid item xs={12} md={8}>
                              <StyledInput fullWidth type="password" label="Confirmation par mot de passe" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} size="small" />
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <DangerButton fullWidth onClick={currentRole === 'ORGANIZER' ? handleDisableAccount : handleDeleteAccount}>
                                {currentRole === 'ORGANIZER' ? 'Désactiver l\'agence' : 'Supprimer le compte'}
                              </DangerButton>
                            </Grid>
                          </Grid>
                        </>
                      ) : (
                        <Alert severity="warning" sx={{ borderRadius: 1, bgcolor: alpha(COLORS.amber, 0.05) }}>
                          <Typography variant="body2">
                            Les comptes administrateur ne peuvent pas être supprimés via cette interface.
                          </Typography>
                        </Alert>
                      )}
                    </CardContent>
                  </SectionCard>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity || 'info'} sx={{ borderRadius: 1, bgcolor: snackbar.severity === 'success' ? COLORS.green : COLORS.red, color: COLORS.white }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;