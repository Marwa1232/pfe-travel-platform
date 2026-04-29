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
  Switch,
  FormControlLabel,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  AddPhotoAlternate,
  Send,
  Videocam,
  Delete,
  DarkMode,
  LightMode,
  Close,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { momentAPI, fixImageUrl } from '../services/api';

const getInitials = (first?: string, last?: string) =>
  `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || 'U';

const formatRelativeTime = (iso?: string) => {
  if (!iso) return 'Just now';
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return 'Just now';
  const diffMs = Date.now() - d;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins <= 0) return 'Just now';
  if (diffMins === 1) return '1 min ago';
  if (diffMins < 60) return `${diffMins} mins ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hour ago';
  return `${diffHours} hours ago`;
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
          {/* Peek gauche */}
          <Box onClick={prev} sx={{ cursor: 'pointer', overflow: 'hidden', borderRadius: '10px',
            height: '100%', opacity: 0.75, transform: 'scale(0.92)', transition: '0.3s',
            '&:hover': { opacity: 1, transform: 'scale(0.96)' } }}>
            {prevItem.type === 'video' ? (
              <video src={fixImageUrl(prevItem.url)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted loop playsInline />
            ) : (
              <img src={fixImageUrl(prevItem.url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </Box>

          {/* Média centrale */}
          <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: '10px', height: '100%', boxShadow: '0 25px 45px rgba(0,0,0,0.25)' }}>
            {current.type === 'video' ? (
              <video src={fixImageUrl(current.url)} onClick={() => setOpenViewer(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                muted loop playsInline autoPlay />
            ) : (
              <img src={fixImageUrl(current.url)} alt="" onClick={() => setOpenViewer(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
            )}
            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent 45%)' }} />
            {current.type === 'video' && (
              <IconButton sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                bgcolor: 'rgba(255,255,255,0.9)', width: 50, height: 50, '&:hover': { bgcolor: '#fff' } }}>
                <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              </IconButton>
            )}
            <IconButton onClick={prev} sx={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#fff' } }}>‹</IconButton>
            <IconButton onClick={next} sx={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#fff' } }}>›</IconButton>
          </Box>

          {/* Peek droite */}
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

        {/* Miniatures */}
        <Box ref={thumbsRef} sx={{ display: 'flex', gap: 2, mt: 2, overflowX: 'auto', pb: 1,
          scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
          {mediaItems.map((item, index) => (
            <Box key={index} onClick={() => setActiveIndex(index)} sx={{
              flexShrink: 0, width: { xs: 50, sm: 70, md: 90 }, height: { xs: 40, sm: 50, md: 60 },
              borderRadius: 1, overflow: 'hidden',
              border: activeIndex === index ? '2px solid #00BFA5' : 'none',
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

        {/* Fullscreen viewer */}
        <Dialog open={openViewer} onClose={() => setOpenViewer(false)} maxWidth={false}
          sx={{ '& .MuiDialog-paper': { bgcolor: 'rgba(0,0,0,0.95)', borderRadius: 2, maxWidth: '95vw' } }}>
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
                sx={{ position: 'absolute', top: 12, right: 12, color: '#fff',
                  bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(255,0,0,0.5)' } }}>✕</IconButton>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </>
  );
};

// ==================== COMPOSANT PRINCIPAL MOMENTS ====================
const Moments: React.FC = () => {
  const { tripId } = useParams();
  const { token, user } = useSelector((state: RootState) => state.auth);

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('momentsDarkMode');
    return saved ? saved === 'true' : true;
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

  // ── Ajouter des fichiers (images + vidéos) ──────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles]);
    setPreviewUrls(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);
    // Reset input pour permettre re-sélection du même fichier
    e.target.value = '';
  };

  // ── Supprimer un fichier avant publication ──────────
  const handleRemoveFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // ── Publier ─────────────────────────────────────────
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
      alert('Moment published successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error publishing moment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this moment?')) return;
    try {
      await momentAPI.deleteMoment(id);
      loadMoments();
    } catch (error) {
      console.error(error);
    }
  };

  // ── Styles dynamiques ────────────────────────────────
  const bgColor       = darkMode ? '#0a0a0f' : '#f5f7fa';
  const cardBg        = darkMode ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const cardBorder    = darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)';
  const textPrimary   = darkMode ? '#ffffff' : '#1e293b';
  const textSecondary = darkMode ? '#aaa' : '#64748b';
  const inputBg       = darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9';
  const accentColor   = '#f97316';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: bgColor }}>
        <CircularProgress size={60} sx={{ color: accentColor }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: bgColor, transition: 'background-color 0.3s ease',
      py: { xs: 3, md: 4 }, px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>

      {/* Header */}
      <Box sx={{ maxWidth: '95%', mx: 'auto', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight={800} sx={{
          fontSize: { xs: '1.75rem', sm: '2rem' },
          background: `linear-gradient(135deg, ${textPrimary} 0%, ${accentColor} 100%)`,
          backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent',
        }}>
          Moments
        </Typography>
        <FormControlLabel
          control={
            <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)}
              icon={<LightMode sx={{ color: '#f59e0b' }} />}
              checkedIcon={<DarkMode sx={{ color: '#94a3b8' }} />}
              sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: accentColor },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: accentColor } }} />
          }
          label={darkMode ? 'Dark' : 'Light'}
          sx={{ color: textSecondary }}
        />
      </Box>

      <Stack spacing={4} sx={{ maxWidth: '95%', mx: 'auto' }}>

        {/* Info si pas de bookings éligibles */}
        {!tripId && eligibleBookings.length === 0 && (
          <Alert severity="info" sx={{ borderRadius: 1,
            bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : '#eef2ff',
            color: textSecondary, border: 'none' }}>
            You don't have eligible trips yet. You can post a moment once your trip has started.
          </Alert>
        )}

        {/* ── Section création de post ── */}
        {token && !tripId && eligibleBookings.length > 0 && (
          <Card sx={{ borderRadius: 1, bgcolor: cardBg, backdropFilter: darkMode ? 'blur(10px)' : 'none',
            border: cardBorder, boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.05)',
            transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Avatar sx={{ bgcolor: accentColor, width: 56, height: 56, fontSize: 22,
                  boxShadow: `0 0 0 2px ${alpha(accentColor, 0.3)}` }}>
                  {getInitials(user?.first_name, user?.last_name)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <TextField fullWidth multiline minRows={3}
                    placeholder="Share your experience..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    sx={{ mb: 2,
                      '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: inputBg, color: textPrimary,
                        fontSize: '1rem', '& fieldset': { borderColor: 'transparent' },
                        '&:hover fieldset': { borderColor: alpha(accentColor, 0.5) },
                        '&.Mui-focused fieldset': { borderColor: accentColor } },
                    }} />

                  <Stack spacing={2}>
                    {/* Sélection du booking */}
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ color: textSecondary }}>Select a trip</InputLabel>
                      <Select value={selectedBooking || ''} label="Select a trip"
                        onChange={(e) => setSelectedBooking(e.target.value as number)}
                        sx={{ borderRadius: 1, fontSize: '0.95rem', color: textPrimary, bgcolor: inputBg,
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' } }}>
                        {eligibleBookings.map((booking) => (
                          <MenuItem key={booking.id} value={booking.id}>
                            {booking.trip_title} - {booking.start_date}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* ── Prévisualisation avec bouton suppression ── */}
                    {previewUrls.length > 0 && (
                      <Box>
                        <Typography sx={{ fontSize: 12, color: textSecondary, mb: 1 }}>
                          {previewUrls.length} fichier{previewUrls.length > 1 ? 's' : ''} sélectionné{previewUrls.length > 1 ? 's' : ''}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1,
                          scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                          {previewUrls.map((url, idx) => (
                            <Box key={idx} sx={{ position: 'relative', flexShrink: 0,
                              width: 100, height: 100, borderRadius: 1.5, overflow: 'visible' }}>
                              {/* Thumbnail */}
                              <Box sx={{ width: 100, height: 100, borderRadius: 1.5, overflow: 'hidden',
                                border: `2px solid ${alpha(accentColor, 0.4)}` }}>
                                {files[idx]?.type.startsWith('video') ? (
                                  <video src={url} muted playsInline
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <img src={url} alt={`preview-${idx}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                )}
                              </Box>

                              {/* Badge type */}
                              <Box sx={{ position: 'absolute', bottom: 6, left: 6,
                                bgcolor: 'rgba(0,0,0,0.65)', borderRadius: 1, px: 0.6, py: 0.2 }}>
                                <Typography sx={{ fontSize: 9, color: '#fff', fontWeight: 700,
                                  textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  {files[idx]?.type.startsWith('video') ? '🎬 VID' : '🖼 IMG'}
                                </Typography>
                              </Box>

                              {/* ── Bouton supprimer ── */}
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveFile(idx)}
                                sx={{
                                  position: 'absolute', top: -8, right: -8,
                                  width: 22, height: 22,
                                  bgcolor: '#ef4444',
                                  color: '#fff',
                                  border: '2px solid',
                                  borderColor: darkMode ? '#0a0a0f' : '#f5f7fa',
                                  '&:hover': { bgcolor: '#dc2626', transform: 'scale(1.15)' },
                                  transition: 'all 0.15s',
                                  zIndex: 10,
                                }}>
                                <Close sx={{ fontSize: 12 }} />
                              </IconButton>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {/* ── Boutons action ── */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1}>
                        <Button component="label"
                          startIcon={<AddPhotoAlternate sx={{ color: accentColor }} />}
                          sx={{ textTransform: 'none', fontSize: '0.9rem', color: textSecondary,
                            '&:hover': { bgcolor: alpha(accentColor, 0.08) } }}>
                          Photos
                          <input hidden type="file" accept="image/*" multiple onChange={handleFileChange} />
                        </Button>
                        <Button component="label"
                          startIcon={<Videocam sx={{ color: accentColor }} />}
                          sx={{ textTransform: 'none', fontSize: '0.9rem', color: textSecondary,
                            '&:hover': { bgcolor: alpha(accentColor, 0.08) } }}>
                          Vidéos
                          <input hidden type="file" accept="video/*" multiple onChange={handleFileChange} />
                        </Button>
                      </Stack>

                      <Button onClick={handleSubmit} variant="contained"
                        disabled={submitting || !selectedBooking || !content.trim()}
                        startIcon={submitting ? undefined : <Send sx={{ fontSize: 16 }} />}
                        sx={{ borderRadius: 1, px: 4, py: 0.8, textTransform: 'none',
                          fontSize: '0.9rem', bgcolor: accentColor,
                          '&:hover': { bgcolor: '#e8650a' },
                          '&:disabled': { bgcolor: alpha(accentColor, 0.3), color: '#fff' } }}>
                        {submitting ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Publish'}
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* ── Feed moments ── */}
        {moments.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 1,
            bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : '#eef2ff',
            color: textSecondary, border: 'none' }}>
            No moments yet. Be the first to share your experience.
          </Alert>
        ) : (
          <Stack spacing={4}>
            {moments.map((moment) => {
              const mediaItems = Array.isArray(moment.media) ? moment.media : [];
              const location = moment.destination || moment.trip?.destination || 'Unknown destination';
              const views = Math.floor(Math.random() * 5000) + 100;

              return (
                <Card key={moment.id} sx={{ borderRadius: 1, bgcolor: cardBg,
                  backdropFilter: darkMode ? 'blur(10px)' : 'none', border: cardBorder,
                  boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-4px)',
                    boxShadow: darkMode ? '0 16px 48px rgba(0,0,0,0.3)' : '0 12px 24px rgba(0,0,0,0.1)' },
                  overflow: 'hidden' }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    {/* En-tête */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar src={moment.user?.profile_photo_url ? fixImageUrl(moment.user.profile_photo_url) : undefined}
                          sx={{ bgcolor: accentColor, width: 56, height: 56, fontSize: 22,
                            boxShadow: `0 0 0 2px ${alpha(accentColor, 0.3)}` }}>
                          {getInitials(moment.user?.first_name, moment.user?.last_name)}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={700} fontSize={18} sx={{ color: textPrimary }}>
                            {moment.user?.first_name} {moment.user?.last_name}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Typography variant="caption" sx={{ fontSize: 13, color: textSecondary }}>
                              {moment.trip?.title || location}
                            </Typography>
                            {moment.trip?.agency_name && (
                              <>
                                <Typography variant="caption" sx={{ fontSize: 13, color: textSecondary }}>•</Typography>
                                <Typography variant="caption" sx={{ fontSize: 13, color: '#00BFA5', fontWeight: 600 }}>
                                  {moment.trip.agency_name}
                                </Typography>
                              </>
                            )}
                            <Typography variant="caption" sx={{ fontSize: 13, color: textSecondary }}>•</Typography>
                            <Typography variant="caption" sx={{ fontSize: 13, color: textSecondary }}>{location}</Typography>
                            <Typography variant="caption" sx={{ fontSize: 13, color: textSecondary }}>•</Typography>
                            <Typography variant="caption" sx={{ fontSize: 13, color: textSecondary }}>
                              {formatRelativeTime(moment.created_at)}
                            </Typography>
                          </Stack>
                        </Box>
                      </Stack>
                      {user?.id === moment.user?.id && (
                        <IconButton size="small" onClick={() => handleDelete(moment.id)} sx={{ color: textSecondary }}>
                          <Delete fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>

                    {/* Contenu */}
                    <Typography sx={{ fontSize: 16, lineHeight: 1.5, mb: 3, color: textPrimary }}>
                      {moment.content}
                    </Typography>

                    {/* Galerie */}
                    {mediaItems.length > 0 && (
                      <PremiumGallerySlider mediaItems={mediaItems} destination={location}
                        caption={moment.content?.substring(0, 60)} />
                    )}

                    {/* Vues */}
                    <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
                      <Typography variant="caption" sx={{ fontSize: 12, color: alpha(textSecondary, 0.6) }}>
                        {views.toLocaleString()} views
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}

        {moments.length > 0 && (
          <Box sx={{ textAlign: 'center', pt: 2 }}>
            <Button variant="text" sx={{ textTransform: 'none', color: accentColor, fontSize: '0.9rem',
              '&:hover': { bgcolor: alpha(accentColor, 0.1) } }}>
              Load more
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default Moments;