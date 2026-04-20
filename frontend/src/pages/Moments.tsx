import React, { useState, useEffect, useRef } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
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

// ==================== SLIDER PREMIUM À 3 PANNEAUX + MINIATURES ====================
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

  const prev = () => setActiveIndex((prev) => (prev - 1 + total) % total);
  const next = () => setActiveIndex((prev) => (prev + 1) % total);

  return (
    <>
      <Box sx={{ width: '100%' }}>
        {/* Slider 3 panneaux */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '55px 1fr 55px',
              sm: '90px 1fr 90px',
              md: '120px 1fr 120px',
              lg: '150px 1fr 150px',
            },
            gap: '14px',
            alignItems: 'stretch',
            height: { xs: 320, sm: 470, md: 580 },
            width: '100%',
          }}
        >
          {/* Peek gauche */}
          <Box
            onClick={prev}
            sx={{
              cursor: 'pointer',
              overflow: 'hidden',
              borderRadius: '10px',
              height: '100%',
              opacity: 0.75,
              transform: 'scale(0.92)',
              transition: '0.3s',
              '&:hover': { opacity: 1, transform: 'scale(0.96)' },
            }}
          >
            <img
              src={fixImageUrl(prevItem.url)}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>

          {/* Image centrale */}
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '10px',
              height: '100%',
              boxShadow: '0 25px 45px rgba(0,0,0,0.25)',
            }}
          >
            <img
              src={fixImageUrl(current.url)}
              alt=""
              onClick={() => setOpenViewer(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                cursor: 'pointer',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent 45%)',
              }}
            />
            <IconButton
              onClick={prev}
              sx={{
                position: 'absolute',
                left: 18,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255,255,255,0.9)',
                '&:hover': { bgcolor: '#fff' },
              }}
            >
              ‹
            </IconButton>
            <IconButton
              onClick={next}
              sx={{
                position: 'absolute',
                right: 18,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255,255,255,0.9)',
                '&:hover': { bgcolor: '#fff' },
              }}
            >
              ›
            </IconButton>
            <Box sx={{ position: 'absolute', bottom: 22, left: 22, color: '#fff', zIndex: 2 }}>
              {destination && (
                <Typography sx={{ fontSize: { xs: 20, md: 28 }, fontWeight: 800 }}>
                  {destination}
                </Typography>
              )}
              {caption && (
                <Typography sx={{ fontSize: 14, opacity: 0.85 }}>{caption}</Typography>
              )}
            </Box>
          </Box>

          {/* Peek droite */}
          <Box
            onClick={next}
            sx={{
              cursor: 'pointer',
              overflow: 'hidden',
              borderRadius: '10px',
              height: '100%',
              opacity: 0.75,
              transform: 'scale(0.92)',
              transition: '0.3s',
              '&:hover': { opacity: 1, transform: 'scale(0.96)' },
            }}
          >
            <img
              src={fixImageUrl(nextItem.url)}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
        </Box>

        {/* MINIATURES (thumbnails) */}
        <Box
          ref={thumbsRef}
          sx={{
            mt: 2.5,
            overflowX: 'auto',
            pb: 1,
            '&::-webkit-scrollbar': { height: 6 },
            '&::-webkit-scrollbar-track': { bgcolor: 'rgba(0,0,0,0.08)', borderRadius: 1 },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.25)', borderRadius: 1 },
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center', minWidth: 'max-content' }}>
            {mediaItems.map((item, idx) => (
              <Box
                key={idx}
                onClick={() => setActiveIndex(idx)}
                sx={{
                  width: 80,
                  height: 60,
                  borderRadius: 0.5,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'scale(1.05)' },
                }}
              >
                <img
                  src={fixImageUrl(item.url)}
                  alt={`thumb-${idx}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Dialogue plein écran */}
      <Dialog
        open={openViewer}
        onClose={() => setOpenViewer(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#000', boxShadow: 'none' } }}
      >
        <Box sx={{ position: 'relative', bgcolor: '#000' }}>
          <img
            src={fixImageUrl(current.url)}
            alt=""
            style={{ width: '100%', maxHeight: '90vh', objectFit: 'contain' }}
          />
          <IconButton
            onClick={() => setOpenViewer(false)}
            sx={{ position: 'absolute', top: 15, right: 15, color: '#fff', bgcolor: 'rgba(255,255,255,0.15)' }}
          >
            ✕
          </IconButton>
        </Box>
      </Dialog>
    </>
  );
};

// ==================== COMPOSANT PRINCIPAL MOMENTS ====================
const Moments: React.FC = () => {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const { token, user } = useSelector((state: RootState) => state.auth);

  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('momentsDarkMode');
    return saved ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('momentsDarkMode', String(darkMode));
  }, [darkMode]);

  const [moments, setMoments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [eligibleBookings, setEligibleBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previewFiles, setPreviewFiles] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

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
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(newFiles);
      setPreviewFiles(newFiles.map((file) => URL.createObjectURL(file)));
    }
  };

  const handleSubmit = async () => {
    if (!selectedBooking || !content) return;
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('content', content);
      formData.append('booking_id', selectedBooking.toString());
      const booking = eligibleBookings.find((b) => b.id === selectedBooking);
      if (booking) formData.append('trip_id', booking.trip_id.toString());
      files.forEach((file) => formData.append('media[]', file));
      await momentAPI.createMoment(formData);
      setContent('');
      setFiles([]);
      setPreviewFiles([]);
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

  // Styles dynamiques (mode clair/sombre)
  const bgColor = darkMode ? '#0a0a0f' : '#f5f7fa';
  const cardBg = darkMode ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const cardBorder = darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)';
  const textPrimary = darkMode ? '#ffffff' : '#1e293b';
  const textSecondary = darkMode ? '#aaa' : '#64748b';
  const inputBg = darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9';
  const accentColor = '#f97316';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: bgColor }}>
        <CircularProgress size={60} sx={{ color: accentColor }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: bgColor,
        transition: 'background-color 0.3s ease',
        py: { xs: 3, md: 4 },
        px: { xs: 2, sm: 3, md: 4, lg: 5 },
      }}
    >
      {/* En-tête avec toggle dark mode */}
      <Box
        sx={{
          maxWidth: '95%',
          mx: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{
            fontSize: { xs: '1.75rem', sm: '2rem' },
            background: `linear-gradient(135deg, ${textPrimary} 0%, ${accentColor} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Moments
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              icon={<LightMode sx={{ color: '#f59e0b' }} />}
              checkedIcon={<DarkMode sx={{ color: '#94a3b8' }} />}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: accentColor },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: accentColor },
              }}
            />
          }
          label={darkMode ? 'Dark' : 'Light'}
          sx={{ color: textSecondary }}
        />
      </Box>

      {/* Feed principal (large) */}
      <Stack spacing={4} sx={{ maxWidth: '95%', mx: 'auto' }}>
        {/* Section création de post */}
        {!tripId && eligibleBookings.length === 0 && (
          <Alert severity="info" sx={{ borderRadius: 1, bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : '#eef2ff', color: textSecondary, border: 'none' }}>
            You don't have eligible trips yet. You can post a moment once your trip has started.
          </Alert>
        )}

        {token && !tripId && eligibleBookings.length > 0 && (
          <Card
            sx={{
              borderRadius: 1,
              bgcolor: cardBg,
              backdropFilter: darkMode ? 'blur(10px)' : 'none',
              border: cardBorder,
              boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.05)',
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Avatar
                  sx={{
                    bgcolor: accentColor,
                    width: 56,
                    height: 56,
                    fontSize: 22,
                    boxShadow: `0 0 0 2px ${alpha(accentColor, 0.3)}`,
                  }}
                >
                  {getInitials(user?.first_name, user?.last_name)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    placeholder="Share your experience..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        bgcolor: inputBg,
                        color: textPrimary,
                        fontSize: '1rem',
                        '& fieldset': { borderColor: 'transparent' },
                        '&:hover fieldset': { borderColor: alpha(accentColor, 0.5) },
                      },
                    }}
                  />
                  <Stack spacing={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ color: textSecondary }}>Select a trip</InputLabel>
                      <Select
                        value={selectedBooking || ''}
                        label="Select a trip"
                        onChange={(e) => setSelectedBooking(e.target.value as number)}
                        sx={{
                          borderRadius: 1,
                          fontSize: '0.95rem',
                          color: textPrimary,
                          bgcolor: inputBg,
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                        }}
                      >
                        {eligibleBookings.map((booking) => (
                          <MenuItem key={booking.id} value={booking.id}>
                            {booking.trip_title} - {booking.start_date}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {previewFiles.length > 0 && (
                      <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
                        {previewFiles.map((url, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              width: 100,
                              height: 100,
                              borderRadius: 0.5,
                              overflow: 'hidden',
                              border: `1px solid ${alpha(textPrimary, 0.1)}`,
                            }}
                          >
                            <img src={url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </Box>
                        ))}
                      </Stack>
                    )}

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1}>
                        <Button
                          component="label"
                          startIcon={<AddPhotoAlternate sx={{ color: accentColor }} />}
                          sx={{ textTransform: 'none', fontSize: '0.9rem', color: textSecondary }}
                        >
                          Photos
                          <input hidden type="file" accept="image/*,video/*" multiple onChange={handleFileChange} />
                        </Button>
                        <Button
                          component="label"
                          startIcon={<Videocam sx={{ color: accentColor }} />}
                          sx={{ textTransform: 'none', fontSize: '0.9rem', color: textSecondary }}
                        >
                          Videos
                          <input hidden type="file" accept="image/*,video/*" multiple onChange={handleFileChange} />
                        </Button>
                      </Stack>
                      <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={submitting || !selectedBooking || !content.trim()}
                        sx={{
                          borderRadius: 1,
                          px: 4,
                          py: 0.8,
                          textTransform: 'none',
                          fontSize: '0.9rem',
                          bgcolor: accentColor,
                          '&:hover': { bgcolor: '#e8650a' },
                        }}
                      >
                        {submitting ? 'Posting...' : 'Publish'}
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Affichage des moments */}
        {moments.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 1, bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : '#eef2ff', color: textSecondary, border: 'none' }}>
            No moments yet. Be the first to share your experience.
          </Alert>
        ) : (
          <Stack spacing={4}>
            {moments.map((moment) => {
              const mediaItems = Array.isArray(moment.media) ? moment.media : [];
              const location = moment.destination || moment.trip?.destination || 'Unknown destination';
              const views = Math.floor(Math.random() * 5000) + 100; // vue fictive

              return (
                <Card
                  key={moment.id}
                  sx={{
                    borderRadius: 1,
                    bgcolor: cardBg,
                    backdropFilter: darkMode ? 'blur(10px)' : 'none',
                    border: cardBorder,
                    boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.05)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: darkMode ? '0 16px 48px rgba(0,0,0,0.3)' : '0 12px 24px rgba(0,0,0,0.1)' },
                    overflow: 'hidden',
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    {/* En-tête du post */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          src={moment.user?.profile_photo_url ? fixImageUrl(moment.user.profile_photo_url) : undefined}
                          sx={{
                            bgcolor: accentColor,
                            width: 56,
                            height: 56,
                            fontSize: 22,
                            boxShadow: `0 0 0 2px ${alpha(accentColor, 0.3)}`,
                          }}
                        >
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
                            <Typography variant="caption" sx={{ fontSize: 13, color: textSecondary }}>
                              {location}
                            </Typography>
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

                    {/* Légende */}
                    <Typography sx={{ fontSize: 16, lineHeight: 1.5, mb: 3, color: textPrimary }}>
                      {moment.content}
                    </Typography>

                    {/* Galerie premium (slider + thumbnails) */}
                    {mediaItems.length > 0 && (
                      <PremiumGallerySlider
                        mediaItems={mediaItems}
                        destination={location}
                        caption={moment.content?.substring(0, 60)}
                      />
                    )}

                    {/* Vues uniquement */}
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
            <Button
              variant="text"
              sx={{ textTransform: 'none', color: accentColor, fontSize: '0.9rem', '&:hover': { bgcolor: alpha(accentColor, 0.1) } }}
            >
              Load more
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default Moments;