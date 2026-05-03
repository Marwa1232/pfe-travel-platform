import React, { useState, useEffect, useRef } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogContent,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Alert,
  Fade,
  Zoom,
  Chip,
  Divider,
  FormControlLabel,
} from '@mui/material';
import { styled, alpha, keyframes } from '@mui/material/styles';
import {
  AddPhotoAlternate,
  Send,
  Videocam,
  Delete,
  DarkMode,
  LightMode,
  Close,
  Visibility,
  Favorite,
  FavoriteBorder,
  Share,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { momentAPI, fixImageUrl } from '../services/api';

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

// ─── CUSTOM DARK MODE SWITCH ─────────────────────────────────────
const SwitchContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 55,
});

const SwitchOuter = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isDark',
})<{ isDark: boolean }>(({ isDark }) => ({
  height: '100%',
  width: 115,
  borderRadius: 165,
  background: isDark ? COLORS.navy : alpha(COLORS.navy, 0.15),
  boxShadow: isDark 
    ? `inset 0px 5px 10px 0px ${alpha(COLORS.navy, 0.6)}, 0px 3px 6px -2px ${alpha(COLORS.navy, 0.3)}`
    : `inset 0px 5px 10px 0px ${alpha(COLORS.navy, 0.1)}, 0px 3px 6px -2px ${alpha(COLORS.navy, 0.05)}`,
  border: `1px solid ${isDark ? alpha(COLORS.white, 0.15) : alpha(COLORS.navy, 0.2)}`,
  padding: '6px',
  boxSizing: 'border-box',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: isDark ? alpha(COLORS.white, 0.3) : COLORS.teal,
  },
}));

const ButtonInner = styled(Box)({
  width: '100%',
  height: '100%',
  display: 'flex',
  position: 'relative',
  justifyContent: 'space-between',
});

const ButtonToggle = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isDark',
})<{ isDark: boolean; isChecked: boolean }>(({ isDark, isChecked }) => ({
  height: 42,
  width: 42,
  background: isDark 
    ? `linear-gradient(135deg, ${COLORS.white}, ${alpha(COLORS.white, 0.8)})`
    : `linear-gradient(135deg, ${COLORS.navy}, ${alpha(COLORS.navy, 0.8)})`,
  borderRadius: '50%',
  boxShadow: isDark
    ? `inset 0px 5px 4px 0px ${alpha(COLORS.white, 0.3)}, 0px 4px 15px 0px ${alpha(COLORS.navy, 0.4)}`
    : `inset 0px 5px 4px 0px ${alpha(COLORS.navy, 0.2)}, 0px 4px 15px 0px ${alpha(COLORS.navy, 0.2)}`,
  position: 'relative',
  zIndex: 2,
  transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  left: isChecked ? 'calc(100% - 42px)' : 0,
  cursor: 'pointer',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: isDark ? COLORS.navy : COLORS.white,
    transition: 'all 0.3s ease',
  },
}));

const ButtonIndicator = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isDark' && prop !== 'isAnimating',
})<{ isDark: boolean; isAnimating: boolean }>(({ isDark, isAnimating }) => ({
  height: 25,
  width: 25,
  top: '50%',
  transform: 'translateY(-50%)',
  borderRadius: '50%',
  border: `3px solid ${isDark ? COLORS.amber : COLORS.teal}`,
  boxSizing: 'border-box',
  right: 10,
  position: 'relative',
  transition: 'all 0.3s ease',
  animation: isAnimating ? 'indicator 0.5s forwards' : 'none',
  '@keyframes indicator': {
    '0%': {
      opacity: 1,
      border: `3px solid ${isDark ? COLORS.amber : COLORS.teal}`,
    },
    '30%': {
      opacity: 0,
    },
    '100%': {
      opacity: 1,
      border: `3px solid ${isDark ? COLORS.teal : COLORS.amber}`,
      left: '-68%',
    },
  },
}));

interface DarkModeSwitchProps {
  isDark: boolean;
  onToggle: () => void;
}

const DarkModeSwitch: React.FC<DarkModeSwitchProps> = ({ isDark, onToggle }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    onToggle();
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  return (
    <SwitchContainer>
      <SwitchOuter isDark={isDark} onClick={handleToggle}>
        <ButtonInner>
          <ButtonToggle isDark={isDark} isChecked={isDark} />
          <ButtonIndicator isDark={isDark} isAnimating={isAnimating} />
        </ButtonInner>
      </SwitchOuter>
    </SwitchContainer>
  );
};

// ==================== SLIDER PREMIUM ====================
const PremiumGallerySlider: React.FC<{
  mediaItems: any[];
  destination?: string;
  caption?: string;
}> = ({ mediaItems, destination, caption }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [openViewer, setOpenViewer] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);

  if (!mediaItems?.length) return null;

  const total = mediaItems.length;
  const current = mediaItems[activeIndex];
  const prevItem = mediaItems[(activeIndex - 1 + total) % total];
  const nextItem = mediaItems[(activeIndex + 1) % total];

  const prev = () => setActiveIndex((p) => (p - 1 + total) % total);
  const next = () => setActiveIndex((p) => (p + 1) % total);

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '55px 1fr 55px', sm: '90px 1fr 90px', md: '120px 1fr 120px', lg: '150px 1fr 150px' },
          gap: '14px', alignItems: 'stretch',
          height: { xs: 320, sm: 470, md: 580 }, width: '100%',
        }}>
          <Box onClick={prev} sx={{ cursor: 'pointer', overflow: 'hidden', borderRadius: '10px',
            height: '100%', opacity: 0.75, transform: 'scale(0.92)', transition: '0.3s',
            '&:hover': { opacity: 1, transform: 'scale(0.96)' } }}>
            {prevItem.type === 'video' ? (
              <video src={fixImageUrl(prevItem.url)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted loop playsInline />
            ) : (
              <img src={fixImageUrl(prevItem.url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </Box>

          <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: '10px', height: '100%', boxShadow: `0 25px 45px ${alpha(COLORS.navy, 0.25)}` }}>
            {current.type === 'video' ? (
              <video src={fixImageUrl(current.url)} onClick={() => setOpenViewer(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                muted loop playsInline autoPlay />
            ) : (
              <img src={fixImageUrl(current.url)} alt="" onClick={() => setOpenViewer(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
            )}
            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent 45%)', borderRadius: '10px' }} />
            
            <IconButton onClick={prev} sx={{ position: 'absolute', left: 18, top: '50%',  transform: 'translateY(-50%)',
              bgcolor: COLORS.white, '&:hover': { bgcolor: alpha(COLORS.white, 0.9) } }}>‹</IconButton>
            <IconButton onClick={next} sx={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)',
              bgcolor: COLORS.white, '&:hover': { bgcolor: alpha(COLORS.white, 0.9) } }}>›</IconButton>
          </Box>

          <Box onClick={next} sx={{ cursor: 'pointer', overflow: 'hidden', borderRadius: '10px',
            height: '100%', opacity: 0.75, transform: 'scale(0.92)', transition: '0.3s',
            '&:hover': { opacity: 1, transform: 'scale(0.96)' } }}>
            {nextItem.type === 'video' ? (
              <video src={fixImageUrl(nextItem.url)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted loop playsInline />
            ) : (
              <img src={fixImageUrl(nextItem.url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </Box>
        </Box>

        <Box ref={thumbsRef} sx={{ display: 'flex', gap: 2, mt: 2, overflowX: 'auto', pb: 1,
          scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
          {mediaItems.map((item, index) => (
            <Box key={index} onClick={() => setActiveIndex(index)} sx={{
              flexShrink: 0, width: { xs: 50, sm: 70, md: 90 }, height: { xs: 40, sm: 50, md: 60 },
              borderRadius: '8px', overflow: 'hidden',
              border: activeIndex === index ? `2px solid ${COLORS.teal}` : 'none',
              cursor: 'pointer', opacity: activeIndex === index ? 1 : 0.6, transition: 'all 0.2s',
              '&:hover': { opacity: 1 } }}>
              {item.type === 'video' ? (
                <video src={fixImageUrl(item.url)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted loop playsInline />
              ) : (
                <img src={fixImageUrl(item.url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </Box>
          ))}
        </Box>

        <Dialog open={openViewer} onClose={() => setOpenViewer(false)} maxWidth={false}
          sx={{ '& .MuiDialog-paper': { bgcolor: alpha(COLORS.navy, 0.95), borderRadius: '12px', maxWidth: '95vw' } }}>
          <DialogContent sx={{ p: 0, position: 'relative' }}>
            <Box sx={{ position: 'relative', maxHeight: '85vh' }}>
              {current.type === 'video' ? (
                <video src={fixImageUrl(current.url)} controls autoPlay
                  style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain' }} />
              ) : (
                <img src={fixImageUrl(current.url)} alt=""
                  style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain' }} />
              )}
              <IconButton onClick={() => setOpenViewer(false)}
                sx={{ position: 'absolute', top: 12, right: 12, color: COLORS.white,
                  bgcolor: alpha(COLORS.navy, 0.5), '&:hover': { bgcolor: COLORS.amber } }}>✕</IconButton>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </>
  );
};

// ==================== COMPOSANT PRINCIPAL MOMENTS ====================
const Moments: React.FC = () => {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const { token, user } = useSelector((state: RootState) => state.auth);

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('momentsDarkMode');
    return saved ? saved === 'true' : false;
  });

  useEffect(() => {
    localStorage.setItem('momentsDarkMode', String(darkMode));
  }, [darkMode]);

  const [moments, setMoments]               = useState<any[]>([]);
  const [loading, setLoading]               = useState(true);
  const [eligibleBookings, setEligibleBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking]   = useState<number | null>(null);
  const [content, setContent]               = useState('');
  const [files, setFiles]                   = useState<File[]>([]);
  const [previewUrls, setPreviewUrls]       = useState<string[]>([]);
  const [submitting, setSubmitting]         = useState(false);

  useEffect(() => {
    loadMoments();
    if (token) loadEligibleBookings();
  }, [tripId, token]);

  const loadMoments = async () => {
    try {
      setLoading(true);
      const response = tripId
        ? await momentAPI.getTripMoments(Number(tripId))
        : await momentAPI.getAllMoments();
      setMoments(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadEligibleBookings = async () => {
    try {
      const response = await momentAPI.getMyEligibleBookings();
      setEligibleBookings(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles]);
    setPreviewUrls(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedBooking || !content.trim()) return;
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('content', content);
      formData.append('booking_id', selectedBooking.toString());
      const booking = eligibleBookings.find(b => b.id === selectedBooking);
      if (booking) formData.append('trip_id', booking.trip_id.toString());
      files.forEach(file => formData.append('media', file));
      await momentAPI.createMoment(formData);
      setContent('');
      setFiles([]);
      setPreviewUrls([]);
      setSelectedBooking(null);
      loadMoments();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erreur lors de la publication');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer ce moment ?')) return;
    try {
      await momentAPI.deleteMoment(id);
      loadMoments();
    } catch (error) {
      console.error(error);
    }
  };

  const getInitials = (first?: string, last?: string) =>
    `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || 'U';

  const formatRelativeTime = (iso?: string) => {
    if (!iso) return 'À l\'instant';
    const d = new Date(iso).getTime();
    if (Number.isNaN(d)) return 'À l\'instant';
    const diffMs = Date.now() - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins <= 0) return 'À l\'instant';
    if (diffMins === 1) return 'Il y a 1 minute';
    if (diffMins < 60) return `Il y a ${diffMins} minutes`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return 'Il y a 1 heure';
    if (diffHours < 24) return `Il y a ${diffHours} heures`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Hier';
    return `Il y a ${diffDays} jours`;
  };

  const bgColor = darkMode ? alpha(COLORS.navy, 0.95) : alpha(COLORS.navy, 0.02);
  const cardBg = darkMode ? alpha(COLORS.white, 0.05) : COLORS.white;
  const cardBorder = darkMode ? `1px solid ${alpha(COLORS.white, 0.08)}` : `1px solid ${alpha(COLORS.teal, 0.1)}`;
  const textPrimary = darkMode ? COLORS.white : COLORS.navy;
  const textSecondary = darkMode ? alpha(COLORS.white, 0.6) : alpha(COLORS.navy, 0.6);
  const inputBg = darkMode ? alpha(COLORS.white, 0.08) : alpha(COLORS.navy, 0.03);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: bgColor }}>
        <CircularProgress size={50} sx={{ color: COLORS.teal }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: bgColor, transition: 'background-color 0.3s ease', py: 4, px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
      <Box sx={{ maxWidth: '95%', mx: 'auto' }}>
        
        {/* Header */}
        <Fade in timeout={500}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton 
                onClick={() => navigate(-1)}
                sx={{ 
                  bgcolor: cardBg, 
                  borderRadius: '12px',
                  border: `1px solid ${alpha(COLORS.teal, 0.2)}`,
                  '&:hover': { bgcolor: alpha(COLORS.teal, 0.1), borderColor: COLORS.teal }
                }}
              >
                <ArrowBack sx={{ color: COLORS.navy }} />
              </IconButton>
              <Box>
                <Typography variant="h4" fontWeight={800} sx={{ color: textPrimary, letterSpacing: '-0.02em' }}>
                  Moments
                </Typography>
                <Typography variant="body2" sx={{ color: textSecondary }}>
                  Partagez vos expériences de voyage
                </Typography>
              </Box>
            </Box>
            
            {/* Custom Dark Mode Switch */}
            <DarkModeSwitch isDark={darkMode} onToggle={() => setDarkMode(!darkMode)} />
          </Box>
        </Fade>

        <Stack spacing={4}>

          {/* Section création de post */}
          {token && !tripId && eligibleBookings.length > 0 && (
            <Zoom in timeout={500}>
              <Card sx={{ 
                borderRadius: '12px', 
                bgcolor: cardBg, 
                backdropFilter: darkMode ? 'blur(10px)' : 'none',
                border: cardBorder, 
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 12px 28px ${alpha(COLORS.navy, 0.1)}` }
              }}>
                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Avatar sx={{ 
                      bgcolor: COLORS.teal, 
                      width: 56, 
                      height: 56, 
                      fontSize: 22,
                      boxShadow: `0 0 0 3px ${alpha(COLORS.teal, 0.3)}`
                    }}>
                      {getInitials(user?.first_name, user?.last_name)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <TextField 
                        fullWidth 
                        multiline 
                        minRows={3}
                        placeholder="Partagez votre expérience..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        sx={{ mb: 2,
                          '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: inputBg, color: textPrimary,
                            fontSize: '1rem', '& fieldset': { borderColor: 'transparent' },
                            '&:hover fieldset': { borderColor: COLORS.teal },
                            '&.Mui-focused fieldset': { borderColor: COLORS.teal } },
                        }} 
                      />

                      <Stack spacing={2}>
                        <FormControl fullWidth size="small">
                          <InputLabel sx={{ color: textSecondary }}>Sélectionnez un voyage</InputLabel>
                          <Select 
                            value={selectedBooking || ''} 
                            label="Sélectionnez un voyage"
                            onChange={(e) => setSelectedBooking(e.target.value as number)}
                            sx={{ borderRadius: '10px', fontSize: '0.9rem', color: textPrimary, bgcolor: inputBg,
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.teal } }}>
                            {eligibleBookings.map((booking) => (
                              <MenuItem key={booking.id} value={booking.id}>
                                {booking.trip_title} - {booking.start_date}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        {/* Prévisualisation */}
                        {previewUrls.length > 0 && (
                          <Box>
                            <Typography sx={{ fontSize: 12, color: textSecondary, mb: 1 }}>
                              {previewUrls.length} fichier{previewUrls.length > 1 ? 's' : ''} sélectionné{previewUrls.length > 1 ? 's' : ''}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
                              {previewUrls.map((url, idx) => (
                                <Box key={idx} sx={{ position: 'relative', flexShrink: 0, width: 100, height: 100 }}>
                                  <Box sx={{ width: 100, height: 100, borderRadius: '10px', overflow: 'hidden', border: `2px solid ${alpha(COLORS.teal, 0.4)}` }}>
                                    {files[idx]?.type.startsWith('video') ? (
                                      <video src={url} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                      <img src={url} alt={`preview-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    )}
                                  </Box>
                                  <Chip
                                    size="small"
                                    label={files[idx]?.type.startsWith('video') ? 'VIDÉO' : 'PHOTO'}
                                    sx={{ position: 'absolute', bottom: 4, left: 4, height: 18, fontSize: 8, fontWeight: 700, bgcolor: alpha(COLORS.navy, 0.7), color: COLORS.white, borderRadius: '6px' }}
                                  />
                                  <IconButton
                                    size="small"
                                    onClick={() => handleRemoveFile(idx)}
                                    sx={{ position: 'absolute', top: -8, right: -8, width: 20, height: 20, bgcolor: COLORS.amber, color: COLORS.white, '&:hover': { bgcolor: alpha(COLORS.amber, 0.8) } }}>
                                    <Close sx={{ fontSize: 12 }} />
                                  </IconButton>
                                </Box>
                              ))}
                            </Stack>
                          </Box>
                        )}

                        {/* Boutons action */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                          <Stack direction="row" spacing={1}>
                            <Button component="label"
                              startIcon={<AddPhotoAlternate sx={{ color: COLORS.teal }} />}
                              sx={{ textTransform: 'none', fontSize: '0.85rem', color: textSecondary, borderRadius: '10px',
                                '&:hover': { bgcolor: alpha(COLORS.teal, 0.1) } }}>
                              Photos
                              <input hidden type="file" accept="image/*" multiple onChange={handleFileChange} />
                            </Button>
                            <Button component="label"
                              startIcon={<Videocam sx={{ color: COLORS.teal }} />}
                              sx={{ textTransform: 'none', fontSize: '0.85rem', color: textSecondary, borderRadius: '10px',
                                '&:hover': { bgcolor: alpha(COLORS.teal, 0.1) } }}>
                              Vidéos
                              <input hidden type="file" accept="video/*" multiple onChange={handleFileChange} />
                            </Button>
                          </Stack>

                          <Button onClick={handleSubmit} variant="contained"
                            disabled={submitting || !selectedBooking || !content.trim()}
                            startIcon={submitting ? undefined : <Send sx={{ fontSize: 16 }} />}
                            sx={{ borderRadius: '10px', px: 4, py: 0.8, textTransform: 'none', fontSize: '0.85rem', bgcolor: COLORS.teal, fontWeight: 600,
                              '&:hover': { bgcolor: COLORS.navy },
                              '&:disabled': { bgcolor: alpha(COLORS.teal, 0.3), color: COLORS.white } }}>
                            {submitting ? <CircularProgress size={18} sx={{ color: COLORS.white }} /> : 'Publier'}
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Zoom>
          )}

          {/* Feed moments */}
          {moments.length === 0 ? (
            <Fade in>
              <Alert severity="info" sx={{ borderRadius: '12px', bgcolor: alpha(COLORS.teal, 0.05), color: textPrimary, border: `1px solid ${alpha(COLORS.teal, 0.1)}` }}>
                Aucun moment pour le moment. Soyez le premier à partager votre expérience.
              </Alert>
            </Fade>
          ) : (
            <Stack spacing={3}>
              {moments.map((moment, idx) => {
                const mediaItems = Array.isArray(moment.media) ? moment.media : [];
                const location = moment.destination || moment.trip?.destination || 'Destination inconnue';
                const views = Math.floor(Math.random() * 5000) + 100;

                return (
                  <Fade in timeout={500 + idx * 100} key={moment.id}>
                    <Card sx={{ 
                      borderRadius: '12px', 
                      bgcolor: cardBg,
                      backdropFilter: darkMode ? 'blur(10px)' : 'none', 
                      border: cardBorder,
                      transition: 'all 0.3s ease',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 16px 32px ${alpha(COLORS.navy, 0.12)}` },
                      overflow: 'hidden'
                    }}>
                      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                        {/* En-tête */}
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar 
                              src={moment.user?.profile_photo_url ? fixImageUrl(moment.user.profile_photo_url) : undefined}
                              sx={{ bgcolor: COLORS.teal, width: 56, height: 56, fontSize: 22,
                                boxShadow: `0 0 0 3px ${alpha(COLORS.teal, 0.3)}` }}>
                              {getInitials(moment.user?.first_name, moment.user?.last_name)}
                            </Avatar>
                            <Box>
                              <Typography fontWeight={700} fontSize={18} sx={{ color: textPrimary }}>
                                {moment.user?.first_name} {moment.user?.last_name}
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                <Chip 
                                  label={moment.trip?.title || location} 
                                  size="small"
                                  sx={{ height: 22, fontSize: 11, bgcolor: alpha(COLORS.teal, 0.1), color: COLORS.teal, borderRadius: '8px' }}
                                />
                                <Typography variant="caption" sx={{ fontSize: 12, color: textSecondary }}>•</Typography>
                                <Typography variant="caption" sx={{ fontSize: 12, color: textSecondary }}>
                                  {formatRelativeTime(moment.created_at)}
                                </Typography>
                              </Stack>
                            </Box>
                          </Stack>
                          {user?.id === moment.user?.id && (
                            <IconButton size="small" onClick={() => handleDelete(moment.id)} sx={{ color: textSecondary, '&:hover': { color: COLORS.amber } }}>
                              <Delete fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>

                        {/* Contenu */}
                        <Typography sx={{ fontSize: 16, lineHeight: 1.6, mb: 3, color: textPrimary }}>
                          {moment.content}
                        </Typography>

                        {/* Galerie */}
                        {mediaItems.length > 0 && (
                          <PremiumGallerySlider mediaItems={mediaItems} destination={location}
                            caption={moment.content?.substring(0, 60)} />
                        )}

                        {/* Interactions */}
                        <Divider sx={{ my: 2, borderColor: alpha(COLORS.teal, 0.1) }} />
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={2}>
                            <Button startIcon={<FavoriteBorder sx={{ color: textSecondary }} />}
                              sx={{ textTransform: 'none', color: textSecondary, fontSize: '0.8rem', borderRadius: '10px' }}>
                              J'aime
                            </Button>
                            <Button startIcon={<Share sx={{ color: textSecondary }} />}
                              sx={{ textTransform: 'none', color: textSecondary, fontSize: '0.8rem', borderRadius: '10px' }}>
                              Partager
                            </Button>
                          </Stack>
                          <Typography variant="caption" sx={{ fontSize: 12, color: textSecondary }}>
                            <Visibility sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                            {views.toLocaleString()} vues
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Fade>
                );
              })}
            </Stack>
          )}

          {moments.length > 0 && (
            <Box sx={{ textAlign: 'center', pt: 2 }}>
              <Button variant="text" sx={{ textTransform: 'none', color: COLORS.teal, fontSize: '0.9rem', borderRadius: '10px',
                '&:hover': { bgcolor: alpha(COLORS.teal, 0.1) } }}>
                Charger plus
              </Button>
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default Moments;