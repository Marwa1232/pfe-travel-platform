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
} from '@mui/icons-material';
import { RootState } from '../store';
import { userAPI, organizerAPI, fixImageUrl } from '../services/api';

type RoleType = 'ADMIN' | 'ORGANIZER' | 'USER';

const InstagramGradient = () => (
  <InstagramIcon
    sx={{
      mr: 1,
      fontSize: 22,
      background: 'linear-gradient(45deg, #E1306C 0%, #F56040 25%, #F77737 50%, #FCAF45 75%, #FCF3A4 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: 'transparent',
    }}
  />
);

const SocialInputProps = {
  sx: { borderRadius: 2 },
};

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

  const roleChipColor = currentRole === 'ADMIN' ? 'error' : currentRole === 'ORGANIZER' ? 'warning' : 'primary';

  const sectionRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const setSectionRef = React.useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      sectionRefs.current[id] = el;
    },
    []
  );

  const scrollToSection = React.useCallback((id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity?: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [saving, setSaving] = React.useState(false);
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const showMessage = (message: string, severity: 'success' | 'error' = 'success') => setSnackbar({ open: true, message, severity });
  const showComingSoon = (action: string) => showMessage(`${action} - coming soon (API not wired).`);

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
      showMessage('Profile saved successfully!');
    } catch (error: any) {
      showMessage(error.response?.data?.error || 'Failed to save profile', 'error');
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
      showMessage('Company info saved successfully!');
    } catch (error: any) {
      showMessage(error.response?.data?.error || 'Failed to save company info', 'error');
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
      showMessage('Social links saved successfully!');
    } catch (error: any) {
      showMessage(error.response?.data?.error || 'Failed to save social links', 'error');
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
      showMessage('Preferences saved successfully!');
    } catch (error: any) {
      showMessage(error.response?.data?.error || 'Failed to save preferences', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showMessage('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showMessage('Password must be at least 6 characters', 'error');
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
      showMessage('Password changed successfully!');
    } catch (error: any) {
      showMessage(error.response?.data?.error || 'Failed to change password', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setSaving(true);
      await userAPI.deleteAccount(deletePassword);
      showMessage('Account deactivated successfully!');
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error: any) {
      showMessage(error.response?.data?.error || 'Failed to delete account', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDisableAccount = async () => {
    try {
      setSaving(true);
      await userAPI.disableAccount(deletePassword);
      showMessage('Agency account disabled successfully!');
    } catch (error: any) {
      showMessage(error.response?.data?.error || 'Failed to disable account', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Company / Platform Info
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

  const [platformName, setPlatformName] = React.useState<string>(userAny?.platform_name ?? '');
  const [supportEmail, setSupportEmail] = React.useState<string>(userAny?.support_email ?? '');
  const [commissionPercent, setCommissionPercent] = React.useState<string>(userAny?.commission_percent ?? '');
  const [adminDefaultCurrency, setAdminDefaultCurrency] = React.useState<string>(userAny?.preferred_currency ?? 'TND');

  // Social Links
  const [facebook, setFacebook] = React.useState<string>(organizerProfile?.facebook ?? '');
  const [instagram, setInstagram] = React.useState<string>(organizerProfile?.instagram ?? '');
  const [linkedin, setLinkedin] = React.useState<string>(''); // UI field (backend may not persist it yet)
  const [website, setWebsite] = React.useState<string>(organizerProfile?.website ?? '');
  const [xLink, setXLink] = React.useState<string>(''); // UI field

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
    () => ['Beach', 'Mountains', 'City Breaks', 'Culture', 'Adventure', 'Luxury', 'Budget'],
    []
  );
  const [travelInterests, setTravelInterests] = React.useState<string[]>(userAny?.interests ?? []);

  React.useEffect(() => {
    setTravelInterests(userAny?.interests ?? []);
  }, [userAny]);

  // Ownership Transfer
  const [newOwnerEmail, setNewOwnerEmail] = React.useState('');
  const [transferConfirmation, setTransferConfirmation] = React.useState('');

  // Account Deletion / Disable
  const [deletePassword, setDeletePassword] = React.useState('');

  const sidebarItems: Array<{ id: string; label: string; icon: React.ReactNode; show?: boolean }> = [
    { id: 'personal-info', label: 'Personal Information', icon: <PersonIcon /> },
    { id: 'company-info', label: currentRole !== 'USER' ? 'Company Info' : 'Company Info', icon: <BusinessCenter />, show: currentRole !== 'USER' },
    { id: 'social', label: 'Social', icon: <NotificationsIcon />, show: true },
    { id: 'preferences', label: 'Preferences', icon: <SecurityIcon />, show: currentRole === 'USER' || currentRole === 'ORGANIZER' },
    { id: 'change-password', label: 'Security', icon: <LockIcon />, show: true },
    { id: 'ownership', label: 'Ownership', icon: <SwapHorizIcon />, show: currentRole === 'ORGANIZER' || currentRole === 'ADMIN' },
    { id: 'account-deletion', label: 'Danger Zone', icon: <Delete />, show: true },
  ];

  const SidebarCard = styled(Card)(({ theme }) => ({
    borderRadius: 20,
    position: 'sticky',
    top: 24,
    overflow: 'hidden',
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
  }));

  const SectionCard = styled(Card)(({ theme }) => ({
    borderRadius: 20,
    boxShadow: 'none',
    border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
  }));

  const headerAvatarSrc = profilePhotoPreview || profilePhotoUrl || null;
  const companyLogoAvatarSrc = logoPreview ?? organizerProfile?.logo ?? null;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 5,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #edf1f7 100%)',
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 'none' }}>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                <Box>
                  <Typography variant="h4" fontWeight={800}>
                    /settings
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                    Parametres professionnels selon votre role.
                  </Typography>
                </Box>
                <Chip icon={<SettingsIcon />} label={`Role: ${currentRole}`} color={roleChipColor as any} variant="filled" />
              </Stack>
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4} lg={3}>
              <SidebarCard>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      src={headerAvatarSrc ? headerAvatarSrc : undefined}
                      sx={{ width: 54, height: 54, bgcolor: 'primary.light' }}
                    >
                      <AccountCircle fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography fontWeight={800} lineHeight={1.1}>
                        {currentRole === 'ADMIN'
                          ? `${firstName || userAny?.first_name || 'Admin'} ${lastName || userAny?.last_name || ''}`.trim()
                          : `${userAny?.first_name ?? ''} ${userAny?.last_name ?? ''}`.trim()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {userAny?.email ?? ''}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <List disablePadding>
                    {sidebarItems
                      .filter((x) => x.show !== false)
                      .map((item) => (
                        <ListItemButton key={item.id} onClick={() => scrollToSection(item.id)}>
                          <ListItemIcon>{item.icon}</ListItemIcon>
                          <ListItemText primary={item.label} />
                          <ArrowRightAlt fontSize="small" />
                        </ListItemButton>
                      ))}
                  </List>

                  <Divider sx={{ my: 2 }} />

                  <Alert severity={currentRole === 'ADMIN' ? 'info' : 'warning'} variant="outlined" sx={{ borderRadius: 2 }}>
                    <Typography variant="body2" fontWeight={700}>
                      {currentRole === 'USER'
                        ? 'Voyageur : gerez vos infos & preferences.'
                        : currentRole === 'ORGANIZER'
                          ? 'Organisateur : infos business + securite.'
                          : 'Admin : options plateforme (actions sensibles).'}
                    </Typography>
                  </Alert>
                </CardContent>
              </SidebarCard>
            </Grid>

            <Grid item xs={12} md={8} lg={9}>
              <Stack spacing={3}>
                {/* Personal Information */}
                <Box id="personal-info" ref={setSectionRef('personal-info')}>
                  <SectionCard>
                    <CardContent>
                      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={900}>
                            Personal Information
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {currentRole === 'ADMIN'
                              ? 'Nom, email et options de securite.'
                              : 'Votre profil voyageur / organisateur.'}
                          </Typography>
                        </Box>
                      </Stack>

                      {currentRole === 'ADMIN' ? (
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Name"
                              value={`${firstName} ${lastName}`.trim()}
                              onChange={(e) => {
                                const parts = e.target.value.trim().split(/\s+/);
                                setFirstName(parts.slice(0, -1).join(' ') || '');
                                setLastName(parts.slice(-1)[0] || '');
                              }}
                              placeholder="Admin Name"
                              sx={SocialInputProps.sx}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="name@example.com"
                              sx={SocialInputProps.sx}
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
                              <Stack spacing={1}>
                                <Typography variant="body2" fontWeight={800}>
                                  Security options
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  UI seulement. En production, reliez a l'API admin security.
                                </Typography>
                                <Grid container spacing={1.5}>
                                  <Grid item xs={12} md={4}>
                                    <FormControlLabel control={<Switch defaultChecked />} label="2FA enabled" />
                                  </Grid>
                                  <Grid item xs={12} md={4}>
                                    <FormControlLabel control={<Switch defaultChecked />} label="Login alerts" />
                                  </Grid>
                                  <Grid item xs={12} md={4}>
                                    <FormControlLabel control={<Switch />} label="Session lock" />
                                  </Grid>
                                </Grid>
                              </Stack>
                            </Alert>
                          </Grid>

                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <Button variant="contained" onClick={handleSaveProfile} disabled={saving} sx={{ borderRadius: 2 }}>
                                {saving ? 'Saving...' : 'Save changes'}
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      ) : (
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="First Name"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              placeholder="John"
                              sx={SocialInputProps.sx}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Last Name"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              placeholder="Doe"
                              sx={SocialInputProps.sx}
                            />
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="name@example.com"
                              sx={SocialInputProps.sx}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Phone"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="+216..."
                              sx={SocialInputProps.sx}
                            />
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth sx={SocialInputProps.sx}>
                              <InputLabel>Country</InputLabel>
                              <Select value={country} label="Country" onChange={(e) => setCountry(e.target.value as string)}>
                                <MenuItem value="Tunisia">Tunisia</MenuItem>
                                <MenuItem value="France">France</MenuItem>
                                <MenuItem value="Germany">Germany</MenuItem>
                                <MenuItem value="Canada">Canada</MenuItem>
                                <MenuItem value="United States">United States</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth sx={SocialInputProps.sx}>
                              <InputLabel>Preferred Language</InputLabel>
                              <Select
                                value={preferredLanguage}
                                label="Preferred Language"
                                onChange={(e) => setPreferredLanguage(e.target.value as string)}
                              >
                                <MenuItem value="fr">Francais</MenuItem>
                                <MenuItem value="en">English</MenuItem>
                                <MenuItem value="ar">Arabic</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth sx={SocialInputProps.sx}>
                              <InputLabel>Preferred Currency</InputLabel>
                              <Select
                                value={preferredCurrency}
                                label="Preferred Currency"
                                onChange={(e) => setPreferredCurrency(e.target.value as string)}
                              >
                                <MenuItem value="TND">TND</MenuItem>
                                <MenuItem value="EUR">EUR</MenuItem>
                                <MenuItem value="USD">USD</MenuItem>
                                <MenuItem value="GBP">GBP</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Stack spacing={1}>
                              <Typography variant="body2" color="text.secondary" fontWeight={800}>
                                Profile Photo
                              </Typography>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar
                                  src={headerAvatarSrc ? headerAvatarSrc : undefined}
                                  sx={{ width: 56, height: 56, bgcolor: 'grey.100', border: '1px solid', borderColor: 'divider' }}
                                />
                                <Box>
                                  <Button
                                    variant="outlined"
                                    component="label"
                                    sx={{ borderRadius: 2, textTransform: 'none' }}
                                  >
                                    Upload
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
                                </Box>
                              </Stack>
                            </Stack>
                          </Grid>

                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <Button variant="contained" onClick={handleSaveProfile} disabled={saving} sx={{ borderRadius: 2 }}>
                                {saving ? 'Saving...' : 'Save changes'}
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      )}
                    </CardContent>
                  </SectionCard>
                </Box>

                {/* Company / Platform Info */}
                {currentRole !== 'USER' && (
                  <Box id="company-info" ref={setSectionRef('company-info')}>
                    <SectionCard>
                      <CardContent>
                        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
                          <Avatar sx={{ bgcolor: currentRole === 'ADMIN' ? 'error.main' : 'warning.main', width: 40, height: 40 }}>
                            {currentRole === 'ADMIN' ? <AdminPanelSettings /> : <BusinessCenter />}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight={900}>
                              {currentRole === 'ADMIN' ? 'Company / Platform Info' : 'Company Info'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {currentRole === 'ADMIN'
                                ? 'Configuration plateforme (UI only).'
                                : 'Informations publiques business de votre agence.'}
                            </Typography>
                          </Box>
                        </Stack>

                        {currentRole === 'ADMIN' ? (
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Platform Name"
                                value={platformName}
                                onChange={(e) => setPlatformName(e.target.value)}
                                placeholder="AppFe Platform"
                                sx={SocialInputProps.sx}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Support Email"
                                type="email"
                                value={supportEmail}
                                onChange={(e) => setSupportEmail(e.target.value)}
                                placeholder="support@platform.com"
                                sx={SocialInputProps.sx}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Commission %"
                                value={commissionPercent}
                                onChange={(e) => setCommissionPercent(e.target.value)}
                                placeholder="10"
                                sx={SocialInputProps.sx}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <FormControl fullWidth sx={SocialInputProps.sx}>
                                <InputLabel>Default Currency</InputLabel>
                                <Select
                                  value={adminDefaultCurrency}
                                  label="Default Currency"
                                  onChange={(e) => setAdminDefaultCurrency(e.target.value as string)}
                                >
                                  <MenuItem value="TND">TND</MenuItem>
                                  <MenuItem value="EUR">EUR</MenuItem>
                                  <MenuItem value="USD">USD</MenuItem>
                                  <MenuItem value="GBP">GBP</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>

<Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <Button variant="contained" onClick={handleSaveProfile} disabled={saving} sx={{ borderRadius: 2 }}>
                                {saving ? 'Saving...' : 'Save changes'}
                              </Button>
                            </Box>
                          </Grid>
                          </Grid>
                        ) : (
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Agency Name"
                                value={agencyName}
                                onChange={(e) => setAgencyName(e.target.value)}
                                placeholder="My Travel Agency"
                                sx={SocialInputProps.sx}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="License Number"
                                value={licenseNumber}
                                onChange={(e) => setLicenseNumber(e.target.value)}
                                placeholder="LIC-12345"
                                sx={SocialInputProps.sx}
                              />
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Street, City"
                                sx={SocialInputProps.sx}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <FormControl fullWidth sx={SocialInputProps.sx}>
                                <InputLabel>Country</InputLabel>
                                <Select
                                  value={companyCountry}
                                  label="Country"
                                  onChange={(e) => setCompanyCountry(e.target.value as string)}
                                >
                                  <MenuItem value="Tunisia">Tunisia</MenuItem>
                                  <MenuItem value="France">France</MenuItem>
                                  <MenuItem value="Germany">Germany</MenuItem>
                                  <MenuItem value="Canada">Canada</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Tell travelers about your agency..."
                                multiline
                                rows={3}
                                sx={SocialInputProps.sx}
                              />
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Years of Experience"
                                value={experience}
                                onChange={(e) => setExperience(e.target.value)}
                                placeholder="5"
                                sx={SocialInputProps.sx}
                              />
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <Stack spacing={1}>
                                <Typography variant="body2" color="text.secondary" fontWeight={800}>
                                  Logo Upload
                                </Typography>
                                <Stack direction="row" spacing={2} alignItems="center">
                                  <Avatar
                                    src={companyLogoAvatarSrc ? companyLogoAvatarSrc : undefined}
                                    sx={{ width: 56, height: 56, bgcolor: 'grey.100', border: '1px solid', borderColor: 'divider' }}
                                  />
                                  <Button variant="outlined" component="label" sx={{ borderRadius: 2, textTransform: 'none' }}>
                                    Upload
                                    <input
                                      hidden
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const url = URL.createObjectURL(file);
                                        setLogoPreview(url);
                                      }}
                                    />
                                  </Button>
                                </Stack>
                              </Stack>
                            </Grid>

                            <Grid item xs={12}>
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="contained" onClick={handleSaveCompanyInfo} disabled={saving} sx={{ borderRadius: 2 }}>
                                  {saving ? 'Saving...' : 'Save changes'}
                                </Button>
                              </Box>
                            </Grid>
                          </Grid>
                        )}
                      </CardContent>
                    </SectionCard>
                  </Box>
                )}

                {/* Social */}
                <Box id="social" ref={setSectionRef('social')}>
                  <SectionCard>
                    <CardContent>
                      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                          <NotificationsIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={900}>
                            Social
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Liens sociaux professionnels (optionnels)
                          </Typography>
                        </Box>
                      </Stack>

                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Facebook"
                            value={facebook}
                            onChange={(e) => setFacebook(e.target.value)}
                            placeholder="https://facebook.com/yourpage"
                            sx={SocialInputProps.sx}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <FacebookIcon sx={{ color: '#1877F2', fontSize: 22, mr: 0.5 }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Instagram"
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            placeholder="@youraccount"
                            sx={SocialInputProps.sx}
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
                          <TextField
                            fullWidth
                            label="LinkedIn"
                            value={linkedin}
                            onChange={(e) => setLinkedin(e.target.value)}
                            placeholder="https://linkedin.com/in/yourprofile"
                            sx={SocialInputProps.sx}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LinkedInIcon sx={{ color: '#0A66C2', fontSize: 22, mr: 0.5 }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        {currentRole !== 'USER' && (
                          <>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Website"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                placeholder="https://youragency.com"
                                sx={SocialInputProps.sx}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <LanguageIcon sx={{ color: '#9e9e9e', fontSize: 22, mr: 0.5 }} />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="X"
                                value={xLink}
                                onChange={(e) => setXLink(e.target.value)}
                                placeholder="https://x.com/yourhandle"
                                sx={SocialInputProps.sx}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <TwitterIcon sx={{ color: '#000000', fontSize: 22, mr: 0.5 }} />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>
                          </>
                        )}

                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button variant="contained" onClick={handleSaveSocialLinks} disabled={saving} sx={{ borderRadius: 2 }}>
                              {saving ? 'Saving...' : 'Save changes'}
                            </Button>
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
                      <CardContent>
                        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'warning.main', width: 40, height: 40 }}>
                            <SettingsIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight={900}>
                              Preferences
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Notifications et centres d'interet
                            </Typography>
                          </Box>
                        </Stack>

                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <FormControlLabel
                              control={<Switch checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} />}
                              label="Email notifications"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <FormControlLabel
                              control={<Switch checked={promotions} onChange={(e) => setPromotions(e.target.checked)} />}
                              label="Promotions"
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <FormControl fullWidth sx={SocialInputProps.sx}>
                              <InputLabel>Travel interests</InputLabel>
                              <Select
                                multiple
                                value={travelInterests}
                                onChange={(e) => setTravelInterests(e.target.value as string[])}
                                label="Travel interests"
                                renderValue={(selected) => (selected as string[]).join(', ')}
                              >
                                {interestOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <Typography variant="caption" color="text.secondary">
                              UI only - map to `interests` when API is ready.
                            </Typography>
                          </Grid>

                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <Button variant="contained" onClick={handleSavePreferences} disabled={saving} sx={{ borderRadius: 2 }}>
                                {saving ? 'Saving...' : 'Save changes'}
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </SectionCard>
                  </Box>
                )}

                {/* Change Password */}
                <Box id="change-password" ref={setSectionRef('change-password')}>
                  <SectionCard>
                    <CardContent>
                      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                          <VpnKey />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={900}>
                            Change Password
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Renforcer votre compte
                          </Typography>
                        </Box>
                      </Stack>

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            type="password"
                            label="Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            sx={SocialInputProps.sx}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            type="password"
                            label="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            sx={SocialInputProps.sx}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            type="password"
                            label="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            sx={SocialInputProps.sx}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button variant="contained" onClick={handleChangePassword} disabled={saving} sx={{ borderRadius: 2 }}>
                              {saving ? 'Updating...' : 'Update password'}
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </SectionCard>
                </Box>

                {/* Transfer Ownership */}
                {(currentRole === 'ORGANIZER' || currentRole === 'ADMIN') && (
                  <Box id="ownership" ref={setSectionRef('ownership')}>
                    <SectionCard>
                      <CardContent>
                        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'warning.main', width: 40, height: 40 }}>
                            <SwapHorizIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight={900}>
                              Transfer Ownership
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {currentRole === 'ORGANIZER'
                                ? 'Si votre agence contient un autre admin, transfert la propriete a un user.'
                                : 'Option sensible : transfert des droits Super Admin.'}
                            </Typography>
                          </Box>
                        </Stack>

                        <Alert severity={currentRole === 'ADMIN' ? 'warning' : 'info'} variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
                          <Typography variant="body2" fontWeight={800}>
                            Important
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            UI only - branch cette action avec le backend quand l'endpoint sera disponible.
                          </Typography>
                        </Alert>

                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label={currentRole === 'ADMIN' ? 'New admin email' : 'New Owner Email'}
                              value={newOwnerEmail}
                              onChange={(e) => setNewOwnerEmail(e.target.value)}
                              placeholder="owner@example.com"
                              sx={SocialInputProps.sx}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="confirmation"
                              value={transferConfirmation}
                              onChange={(e) => setTransferConfirmation(e.target.value)}
                              placeholder={currentRole === 'ADMIN' ? 'Type CONFIRM' : 'Type CONFIRM'}
                              sx={SocialInputProps.sx}
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <Button variant="contained" onClick={() => showComingSoon('Transfer ownership')} sx={{ borderRadius: 2 }}>
                                Confirm transfer
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </SectionCard>
                  </Box>
                )}

                {/* Account Deletion / Danger Zone */}
                <Box id="account-deletion" ref={setSectionRef('account-deletion')}>
                  <SectionCard>
                    <CardContent>
                      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'error.main', width: 40, height: 40 }}>
                          <Delete />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={900}>
                            Account Deletion
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Actions irreversibles (ou desactivation)
                          </Typography>
                        </Box>
                      </Stack>

                      {currentRole === 'ADMIN' ? (
                        <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
                          <Typography variant="body2" fontWeight={900}>
                            Super Admin account cannot be deleted directly.
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Pour effectuer une action de suppression, passe par le backoffice/admin policies.
                          </Typography>
                        </Alert>
                      ) : (
                        <>
                          {currentRole === 'ORGANIZER' ? (
                            <Alert severity="warning" variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
                              <Typography variant="body2" fontWeight={900}>
                                Disable agency account
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Warning: trips/bookings impacted.
                              </Typography>
                            </Alert>
                          ) : (
                            <Alert severity="error" variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
                              <Typography variant="body2" fontWeight={900}>
                                Delete account permanently
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Confirmation by password is required.
                              </Typography>
                            </Alert>
                          )}

                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                type="password"
                                label="confirmation password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                sx={SocialInputProps.sx}
                                placeholder="********"
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                  variant="contained"
                                  color="error"
                                  onClick={currentRole === 'ORGANIZER' ? handleDisableAccount : handleDeleteAccount}
                                  sx={{ borderRadius: 2 }}
                                >
                                  {currentRole === 'ORGANIZER' ? 'Disable account' : 'Delete account permanently'}
                                </Button>
                              </Box>
                            </Grid>
                          </Grid>
                        </>
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
        autoHideDuration={4200}
        onClose={() => setSnackbar({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity || 'info'} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;
