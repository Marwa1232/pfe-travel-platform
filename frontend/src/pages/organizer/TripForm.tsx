import React, { useState, useEffect, useRef, CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  OutlinedInput,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Card,
  CardMedia,
  IconButton,
  Checkbox,
  FormControlLabel,
  Slider,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Add,
  Delete,
  CloudUpload,
  Visibility,
  Save,
  Send,
  CheckCircle,
  Warning,
  Info,
  Schedule,
  PriceCheck,
  PhotoLibrary,
  Analytics,
  TipsAndUpdates,
  LocationOn,
  Nature,
  Landscape,
  BeachAccess,
  Terrain,
  Museum,
  Hiking,
  FamilyRestroom,
  Favorite,
  Diamond,
  Celebration,
  AcUnit,
  SportsSoccer,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';
import { tripAPI } from '../../services/api';
import { styled, alpha, keyframes } from '@mui/material/styles';

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

// Available tags with professional icons
const availableTags = [
  { value: 'nature', label: 'Nature', icon: <Nature fontSize="small" /> },
  { value: 'montagne', label: 'Montagne', icon: <Landscape fontSize="small" /> },
  { value: 'plage', label: 'Plage', icon: <BeachAccess fontSize="small" /> },
  { value: 'desert', label: 'Désert', icon: <Terrain fontSize="small" /> },
  { value: 'culture', label: 'Culture', icon: <Museum fontSize="small" /> },
  { value: 'aventure', label: 'Aventure', icon: <Hiking fontSize="small" /> },
  { value: 'famille', label: 'Famille', icon: <FamilyRestroom fontSize="small" /> },
  { value: 'romantique', label: 'Romantique', icon: <Favorite fontSize="small" /> },
  { value: 'luxe', label: 'Luxe', icon: <Diamond fontSize="small" /> },
  { value: 'jeunes', label: 'Jeunes', icon: <Celebration fontSize="small" /> },
  { value: 'froid', label: 'Froid', icon: <AcUnit fontSize="small" /> },
  { value: 'sport', label: 'Sport', icon: <SportsSoccer fontSize="small" /> },
];

// Inclusion options
const inclusionOptions = [
  { value: 'transport', label: 'Transport' },
  { value: 'hebergement', label: 'Hébergement' },
  { value: 'guide', label: 'Guide' },
  { value: 'assurance', label: 'Assurance' },
  { value: 'repas', label: 'Repas' },
  { value: 'activites', label: 'Activités' },
];

// Exclusion options
const exclusionOptions = [
  { value: 'depenses_personnelles', label: 'Dépenses personnelles' },
  { value: 'activites_optionnelles', label: 'Activités optionnelles' },
  { value: 'repas_libres', label: 'Repas libres' },
  { value: 'boissons', label: 'Boissons' },
  { value: 'pourboires', label: 'Pourboires' },
];

// ─── Styled Components ───────────────────────────────────────────
const GradientHeader = styled(Paper)({
  marginBottom: '3rem' as unknown  | number as string,
  borderRadius: 16,
  background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.teal} 100%)`,
  boxShadow: `0 14px 34px ${alpha(COLORS.navy, 0.28)}`,
  padding: { xs: '2.5rem' as unknown as string | number, md: '3.5rem' as unknown as string | number } as unknown  | number as CSSProperties,
} as unknown as TemplateStringsArray);

const StyledPaper = styled(Paper)({
  border: `1px solid ${alpha(COLORS.teal, 0.15)}`,
  borderRadius: 16,
  boxShadow: `0 12px 30px ${alpha(COLORS.navy, 0.08)}`,
  backgroundColor: COLORS.white,
  overflowX: 'hidden',
  width: '100%',
});

const GradientButton = styled(Button)({
  background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navy})`,
  borderRadius: 12,
  fontWeight: 600,
  textTransform: 'none',
  padding: '10px 24px',
  color: COLORS.white,
  '&:hover': {
    background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.teal})`,
    transform: 'translateY(-1px)',
  },
});

const OutlineButton = styled(Button)({
  borderRadius: 12,
  fontWeight: 600,
  textTransform: 'none',
  padding: '10px 24px',
  borderColor: COLORS.teal,
  color: COLORS.teal,
  '&:hover': {
    borderColor: COLORS.navy,
    backgroundColor: alpha(COLORS.teal, 0.05),
  },
});

const DangerButton = styled(Button)({
  borderRadius: 12,
  fontWeight: 600,
  textTransform: 'none',
  padding: '10px 24px',
  backgroundColor: COLORS.amber,
  color: COLORS.white,
  '&:hover': {
    backgroundColor: alpha(COLORS.amber, 0.85),
  },
});

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    '&:hover fieldset': {
      borderColor: COLORS.teal,
    },
    '&.Mui-focused fieldset': {
      borderColor: COLORS.teal,
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: COLORS.teal,
  },
});

const StepIconBox = styled(Box)<{ active?: boolean; completed?: boolean }>(({ active, completed }) => ({
  width: 36,
  height: 36,
  borderRadius: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: active || completed ? COLORS.teal : alpha(COLORS.navy, 0.15),
  color: active || completed ? COLORS.white : alpha(COLORS.navy, 0.5),
  fontWeight: 700,
  fontSize: 14,
  transition: 'all 0.3s ease',
  boxShadow: active ? `0 0 0 3px ${alpha(COLORS.teal, 0.2)}` : 'none',
}));

const TripForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [categoriesState, setCategoriesState] = useState<any[]>([]);
  const [visibilityScore, setVisibilityScore] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const [fieldErrors, setFieldErrors] = useState({
    title: '',
    start_date: '',
    end_date: '',
  });

  const today = new Date().toISOString().split('T')[0];

  const validateAlphabetic = (value: string): string => {
    if (value && !/^[a-zA-Z\s'-]+$/.test(value)) {
      return 'Seules les lettres sont autorisées';
    }
    return '';
  };

  const validateFirstUppercase = (value: string): string => {
    if (value && value.length > 0 && value[0] !== value[0].toUpperCase()) {
      return 'La première lettre doit être en majuscule';
    }
    return '';
  };

  const validateTitle = (value: string): string => {
    const alphaErr = validateAlphabetic(value);
    if (alphaErr) return alphaErr;
    const upperErr = validateFirstUppercase(value);
    if (upperErr) return upperErr;
    return '';
  };

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: '',
    destination: '',
    difficulty_level: 'medium',
    short_description: '',
    long_description: '',
    tags: [] as string[],
    start_date: '',
    end_date: '',
    meeting_point: '',
    meeting_address: '',
    max_places: '',
    program: [] as { day: number; title: string; description: string }[],
    base_price: '',
    currency: 'TND',
    inclusions: [] as string[],
    exclusions: [] as string[],
    cover_image: null as File | null,
    cover_image_preview: '',
    gallery: [] as { file: File | null; preview: string; url?: string }[],
    status: 'draft',
    policyType: 'moderate',
    allowVoucher: true,
    allowRebooking: true,
  });

  const steps = [
    { label: 'Informations', icon: <Info /> },
    { label: 'Planning', icon: <Schedule /> },
    { label: 'Prix', icon: <PriceCheck /> },
    { label: 'Photos', icon: <PhotoLibrary /> },
    { label: 'Validation', icon: <Analytics /> },
  ];

  useEffect(() => {
    loadOptions();
    if (isEdit && id) {
      loadTrip();
    }
  }, [id]);

  const loadOptions = async () => {
    try {
      const destRes = await fetch('http://localhost:8000/api/destinations');
      const destData = await destRes.json();
      setDestinations(destData['hydra:member'] || destData);
      
      const catRes = await fetch('http://localhost:8000/api/categories');
      const catData = await catRes.json();
      setCategoriesState(catData['hydra:member'] || catData);
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };

  const loadTrip = async () => {
    try {
      setLoading(true);
      const response = await tripAPI.get(Number(id));
      const trip = response.data;

      const categoryId = trip.categories?.[0]?.id || '';
      const destinationId = trip.destinations?.[0]?.id || '';
      const session = trip.sessions?.[0] || {};
      const coverImage = trip.images?.find((img: any) => img.is_cover);
      const galleryImages = trip.images?.filter((img: any) => !img.is_cover) || [];

      setFormData({
        ...formData,
        title: trip.title || '',
        slug: trip.slug || '',
        category: categoryId,
        destination: destinationId,
        short_description: trip.short_description || '',
        long_description: trip.long_description || '',
        tags: trip.tags || [],
        start_date: session.start_date ? new Date(session.start_date).toISOString().split('T')[0] : '',
        end_date: session.end_date ? new Date(session.end_date).toISOString().split('T')[0] : '',
        meeting_point: trip.meeting_point || '',
        meeting_address: trip.meeting_address || '',
        max_places: session.max_capacity?.toString() || '',
        base_price: trip.base_price?.toString() || '',
        currency: trip.currency || 'TND',
        inclusions: trip.inclusions || [],
        exclusions: trip.exclusions || [],
        cover_image: null,
        cover_image_preview: coverImage?.url || '',
        gallery: galleryImages.map((img: any) => ({ file: null, preview: '', url: img.url })),
        status: trip.status || 'draft',
      });
    } catch {
      setError('Erreur lors du chargement du voyage');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug }));
      setFieldErrors(prev => ({ ...prev, title: validateTitle(value) }));
    }
    if (name === 'start_date') {
      if (value && value < today) {
        setFieldErrors(prev => ({ ...prev, start_date: 'Date invalide' }));
      } else {
        setFieldErrors(prev => ({ ...prev, start_date: '' }));
      }
      if (formData.end_date && value && formData.end_date < value) {
        setFieldErrors(prev => ({ ...prev, end_date: 'Date invalide' }));
      } else if (formData.end_date && value && formData.end_date >= value) {
        setFieldErrors(prev => ({ ...prev, end_date: '' }));
      }
    }
    if (name === 'end_date') {
      if (value && formData.start_date && value < formData.start_date) {
        setFieldErrors(prev => ({ ...prev, end_date: 'Date invalide' }));
      } else {
        setFieldErrors(prev => ({ ...prev, end_date: '' }));
      }
    }
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleInclusionToggle = (item: string) => {
    setFormData(prev => ({
      ...prev,
      inclusions: prev.inclusions.includes(item)
        ? prev.inclusions.filter(i => i !== item)
        : [...prev.inclusions, item],
    }));
  };

  const handleExclusionToggle = (item: string) => {
    setFormData(prev => ({
      ...prev,
      exclusions: prev.exclusions.includes(item)
        ? prev.exclusions.filter(e => e !== item)
        : [...prev.exclusions, item],
    }));
  };

  const addProgramDay = () => {
    const nextDay = formData.program.length + 1;
    setFormData(prev => ({
      ...prev,
      program: [...prev.program, { day: nextDay, title: '', description: '' }],
    }));
  };

  const updateProgramDay = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      program: prev.program.map((day, i) => 
        i === index ? { ...day, [field]: value } : day
      ),
    }));
  };

  const removeProgramDay = (index: number) => {
    setFormData(prev => ({
      ...prev,
      program: prev.program.map((day, i) => ({ ...day, day: i + 1 })).filter((_, i) => i !== index),
    }));
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        cover_image: file,
        cover_image_preview: URL.createObjectURL(file),
      }));
    }
  };

  const handleGalleryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setFormData(prev => ({
        ...prev,
        gallery: [...prev.gallery, ...newImages],
      }));
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  useEffect(() => {
    let score = 0;
    const suggestions: string[] = [];

    if (formData.long_description.length >= 150) {
      score += 15;
    } else if (formData.long_description.length > 0) {
      suggestions.push('Ajoutez une description plus détaillée (minimum 150 caractères)');
    }

    const totalPhotos = (formData.cover_image ? 1 : formData.cover_image_preview ? 1 : 0) + formData.gallery.length;
    if (totalPhotos >= 3) {
      score += 20;
    } else {
      suggestions.push(`Ajoutez ${3 - totalPhotos} photo(s) supplémentaire(s)`);
    }

    if (formData.tags.length >= 3) {
      score += 10;
    } else if (formData.tags.length > 0) {
      suggestions.push('Ajoutez plus de tags pour améliorer la visibilité');
    }

    if (formData.program.length >= 3) {
      score += 15;
    } else if (formData.program.length > 0) {
      suggestions.push('Ajoutez plus de jours au programme');
    }

    if (formData.cover_image || formData.cover_image_preview) {
      score += 20;
    }

    setVisibilityScore(score);
    setAiSuggestions(suggestions);
  }, [formData]);

  const getAIConsistencyCheck = () => {
    const checks: string[] = [];
    
    if ((formData.category === 'camping' || formData.category === 'randonnee') && formData.start_date) {
      const month = new Date(formData.start_date).getMonth();
      if (month >= 10 || month <= 2) {
        if (!formData.long_description.toLowerCase().includes('froid') && 
            !formData.long_description.toLowerCase().includes('hiver') &&
            !formData.tags.includes('froid')) {
          checks.push('🌡️ Conseil : En hiver, prévoyez des vêtements chauds pour vos participants.');
        }
      }
    }

    if (formData.category === 'detente' && formData.destination) {
      if (formData.destination.toLowerCase().includes('djerba') || 
          formData.destination.toLowerCase().includes('hammamet')) {
        checks.push('Information : N\'oubliez pas de mentionner les activités plage dans votre description.');
      }
    }

    return checks;
  };

  const handleSaveDraft = async () => {
    await submitTrip('draft');
  };

  const handlePublish = async () => {
    await submitTrip('pending');
  };

  const submitTrip = async (status: string) => {
    setSaving(true);
    setError(null);

    const validationErrors: string[] = [];
    if (!formData.title.trim()) validationErrors.push('Le titre est requis');
    if (!formData.short_description.trim()) validationErrors.push('La description courte est requise');
    if (!formData.base_price || parseFloat(formData.base_price) <= 0) validationErrors.push('Le prix de base doit être supérieur à 0');
    if (!formData.category) validationErrors.push('Veuillez sélectionner une catégorie');
    if (!formData.destination) validationErrors.push('Veuillez sélectionner une destination');

    const titleErr = validateTitle(formData.title);
    if (titleErr) {
      setFieldErrors(prev => ({ ...prev, title: titleErr }));
      validationErrors.push(titleErr);
    }
    if (formData.start_date && formData.start_date < today) {
      setFieldErrors(prev => ({ ...prev, start_date: 'Date invalide' }));
      validationErrors.push('La date de début ne peut pas être dans le passé');
    }
    if (formData.end_date && formData.start_date && formData.end_date < formData.start_date) {
      setFieldErrors(prev => ({ ...prev, end_date: 'Date invalide' }));
      validationErrors.push('La date de fin doit être après la date de début');
    }
    
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. \n'));
      setSaving(false);
      return;
    }

    try {
      const formatDate = (dateStr: string) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
      };

      let coverImageUrl = formData?.cover_image_preview || '';
      if (formData?.cover_image) {
        try {
          const coverResponse = await tripAPI.uploadImages([formData.cover_image], undefined, true);
          coverImageUrl = coverResponse.data.urls?.[0] || null;
        } catch (uploadErr) {
          console.error('Cover image upload failed:', uploadErr);
        }
      }

      let galleryUrls: string[] = [];
      const galleryFiles = formData.gallery?.filter((img: any) => img.file) || [];
      if (galleryFiles.length > 0) {
        try {
          const files = galleryFiles.map((img: any) => img.file);
          const galleryResponse = await tripAPI.uploadImages(files, undefined, false);
          galleryUrls = galleryResponse.data.urls || [];
        } catch (uploadErr) {
          console.error('Gallery upload failed:', uploadErr);
        }
      }

      const submitData = {
        title: formData.title.trim(),
        slug: formData.slug.trim() || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        short_description: formData.short_description.trim(),
        long_description: formData.long_description?.trim() || null,
        base_price: parseFloat(formData.base_price) || 0,
        currency: formData.currency || 'TND',
        duration_days: formData.program.length || 1,
        difficulty_level: formData.difficulty_level || 'medium',
        status: status,
        tags: formData.tags || [],
        inclusions: formData.inclusions || [],
        exclusions: formData.exclusions || [],
        meeting_point: formData.meeting_point?.trim() || null,
        meeting_address: formData.meeting_address?.trim() || null,
        category: formData.category ? parseInt(formData.category) : null,
        destination: formData.destination ? parseInt(formData.destination) : null,
        start_date: formatDate(formData.start_date),
        end_date: formatDate(formData.end_date),
        max_places: formData.max_places ? parseInt(formData.max_places) : null,
        program: formData.program.length > 0 ? formData.program : null,
        cover_image: coverImageUrl || null,
        gallery: galleryUrls.length > 0 ? galleryUrls : null,
        policyType: formData.policyType,
        allowVoucher: formData.allowVoucher,
        allowRebooking: formData.allowRebooking,
      };

      if (isEdit) {
        await tripAPI.update(Number(id), submitData);
      } else {
        await tripAPI.create(submitData);
      }

      navigate('/organizer/trips');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: COLORS.navy, mb: 1 }}>
                Informations générales
              </Typography>
              <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6), mb: 3 }}>
                Définissez l'identité et l'ambiance de votre voyage
              </Typography>
              <Grid container spacing={3}>
                <Grid xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Titre du voyage"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    error={!!fieldErrors.title}
                    helperText={fieldErrors.title || `${formData.title.length}/80 caractères`}
                    inputProps={{ maxLength: 80 }}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="Slug (URL)"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    helperText="URL automatique basée sur le titre"
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ '&.Mui-focused': { color: COLORS.teal } }}>Catégorie</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      label="Catégorie"
                      sx={{ borderRadius: 2 }}
                    >
                      {categoriesState.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ '&.Mui-focused': { color: COLORS.teal } }}>Destination</InputLabel>
                    <Select
                      name="destination"
                      value={formData.destination}
                      onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                      label="Destination"
                      sx={{ borderRadius: 2 }}
                    >
                      {destinations.map((dest) => (
                        <MenuItem key={dest.id} value={dest.id}>{dest.name} ({dest.country})</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ '&.Mui-focused': { color: COLORS.teal } }}>Niveau de difficulté</InputLabel>
                    <Select
                      name="difficulty_level"
                      value={formData.difficulty_level}
                      onChange={(e) => setFormData(prev => ({ ...prev, difficulty_level: e.target.value }))}
                      label="Niveau de difficulté"
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="easy">Facile</MenuItem>
                      <MenuItem value="medium">Moyen</MenuItem>
                      <MenuItem value="difficult">Difficile</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Description courte"
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleChange}
                    multiline
                    rows={2}
                    required
                  />
                </Grid>
                <Grid xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Description détaillée"
                    name="long_description"
                    value={formData.long_description}
                    onChange={handleChange}
                    multiline
                    rows={6}
                    helperText="Décrivez l'ambiance, les activités, le public cible (minimum 150 caractères)"
                  />
                </Grid>
                <Grid xs={12}>
                  <Typography variant="body1" fontWeight={600} sx={{ color: COLORS.navy, mb: 1 }}>
                    Tags (mots-clés)
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {availableTags.map((tag) => (
                      <Chip
                        key={tag.value}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {tag.icon}
                            <span>{tag.label}</span>
                          </Box>
                        }
                        onClick={() => handleTagToggle(tag.value)}
                        color={formData.tags.includes(tag.value) ? 'primary' : 'default'}
                        variant={formData.tags.includes(tag.value) ? 'filled' : 'outlined'}
                        sx={{
                          borderRadius: 8,
                          '&.MuiChip-filled': {
                            backgroundColor: COLORS.teal,
                            color: COLORS.white,
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );

      case 1:
        return (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: COLORS.navy, mb: 1 }}>
                Planning & Logistique
              </Typography>
              <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6), mb: 3 }}>
                Définissez le cadre organisationnel du voyage
              </Typography>
              <Grid container spacing={3}>
                <Grid xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="Date de début"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    error={!!fieldErrors.start_date}
                    helperText={fieldErrors.start_date}
                    inputProps={{ min: today }}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="Date de fin"
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    error={!!fieldErrors.end_date}
                    helperText={fieldErrors.end_date}
                    inputProps={{ min: formData.start_date || today }}
                  />
                </Grid>
                <Grid xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Point de rendez-vous"
                    name="meeting_point"
                    value={formData.meeting_point}
                    onChange={handleChange}
                    placeholder="Ex: Agence de voyage, Gare..."
                  />
                </Grid>
                <Grid xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Adresse"
                    name="meeting_address"
                    value={formData.meeting_address}
                    onChange={handleChange}
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="Nombre maximum de places"
                    name="max_places"
                    type="number"
                    value={formData.max_places}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid xs={12}>
                  <Divider sx={{ my: 2, borderColor: alpha(COLORS.teal, 0.15) }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: COLORS.navy }}>
                      Programme détaillé
                    </Typography>
                    <OutlineButton startIcon={<Add />} onClick={addProgramDay}>
                      Ajouter un jour
                    </OutlineButton>
                  </Box>
                  {formData.program.map((day, index) => (
                    <Card key={index} sx={{ mb: 2, p: 2, borderRadius: 12, border: `1px solid ${alpha(COLORS.teal, 0.1)}` }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: COLORS.teal }}>
                          Jour {day.day}
                        </Typography>
                        <IconButton onClick={() => removeProgramDay(index)} sx={{ color: COLORS.amber }}>
                          <Delete />
                        </IconButton>
                      </Box>
                      <StyledTextField
                        fullWidth
                        label="Titre"
                        value={day.title}
                        onChange={(e) => updateProgramDay(index, 'title', e.target.value)}
                        sx={{ mb: 2 }}
                      />
                      <StyledTextField
                        fullWidth
                        label="Description"
                        value={day.description}
                        onChange={(e) => updateProgramDay(index, 'description', e.target.value)}
                        multiline
                        rows={2}
                      />
                    </Card>
                  ))}
                  {formData.program.length === 0 && (
                    <Typography sx={{ color: alpha(COLORS.navy, 0.5), textAlign: 'center', py: 4 }}>
                      Cliquez sur "Ajouter un jour" pour créer votre programme
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );

      case 2:
        return (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: COLORS.navy, mb: 1 }}>
                Prix & Inclusions
              </Typography>
              <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6), mb: 3 }}>
                Définissez clairement votre offre financière
              </Typography>
              <Grid container spacing={3}>
                <Grid xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="Prix par personne (TND)"
                    name="base_price"
                    type="number"
                    value={formData.base_price}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ '&.Mui-focused': { color: COLORS.teal } }}>Devise</InputLabel>
                    <Select
                      name="currency"
                      value={formData.currency}
                      onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                      label="Devise"
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="TND">TND (Dinars tunisiens)</MenuItem>
                      <MenuItem value="EUR">EUR (Euros)</MenuItem>
                      <MenuItem value="USD">USD (Dollars)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {formData.base_price && (
                  <Grid xs={12}>
                    <Paper sx={{ p: 2, borderRadius: 12, bgcolor: alpha(COLORS.teal, 0.03), border: `1px solid ${alpha(COLORS.teal, 0.1)}` }}>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: COLORS.navy, mb: 1 }}>
                        Estimation des revenus
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid xs={4}>
                          <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6) }}>Revenu brut</Typography>
                          <Typography variant="h6" sx={{ color: COLORS.teal }}>
                            {parseFloat(formData.base_price) * (parseInt(formData.max_places) || 10)} TND
                          </Typography>
                        </Grid>
                        <Grid xs={4}>
                          <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6) }}>Commission (10%)</Typography>
                          <Typography variant="h6" sx={{ color: COLORS.amber }}>
                            {parseFloat(formData.base_price) * (parseInt(formData.max_places) || 10) * 0.1} TND
                          </Typography>
                        </Grid>
                        <Grid xs={4}>
                          <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6) }}>Revenu net</Typography>
                          <Typography variant="h6" sx={{ color: COLORS.teal }}>
                            {parseFloat(formData.base_price) * (parseInt(formData.max_places) || 10) * 0.9} TND
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                )}
                <Grid xs={12}>
                  <Divider sx={{ my: 2, borderColor: alpha(COLORS.teal, 0.15) }} />
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: COLORS.navy, mb: 1 }}>
                    Ce qui est inclus
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {inclusionOptions.map((item) => (
                      <Chip
                        key={item.value}
                        label={item.label}
                        onClick={() => handleInclusionToggle(item.value)}
                        color={formData.inclusions.includes(item.value) ? 'primary' : 'default'}
                        variant={formData.inclusions.includes(item.value) ? 'filled' : 'outlined'}
                        icon={formData.inclusions.includes(item.value) ? <CheckCircle /> : undefined}
                        sx={{
                          borderRadius: 8,
                          '&.MuiChip-filled': formData.inclusions.includes(item.value) ? {
                            backgroundColor: COLORS.teal,
                            color: COLORS.white,
                          } : {},
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid xs={12}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: COLORS.navy, mb: 1 }}>
                    Ce qui n'est pas inclus
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {exclusionOptions.map((item) => (
                      <Chip
                        key={item.value}
                        label={item.label}
                        onClick={() => handleExclusionToggle(item.value)}
                        color={formData.exclusions.includes(item.value) ? 'error' : 'default'}
                        variant={formData.exclusions.includes(item.value) ? 'filled' : 'outlined'}
                        icon={formData.exclusions.includes(item.value) ? <Warning /> : undefined}
                        sx={{
                          borderRadius: 8,
                          '&.MuiChip-filled': formData.exclusions.includes(item.value) ? {
                            backgroundColor: COLORS.amber,
                            color: COLORS.white,
                          } : {},
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid xs={12}>
                  <Divider sx={{ my: 2, borderColor: alpha(COLORS.teal, 0.15) }} />
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: COLORS.navy, mb: 1 }}>
                    Politique d'annulation
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ '&.Mui-focused': { color: COLORS.teal } }}>Politique</InputLabel>
                        <Select
                          name="policyType"
                          value={formData.policyType}
                          onChange={(e) => setFormData(prev => ({ ...prev, policyType: e.target.value }))}
                          label="Politique"
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="flexible">Flexible - Remboursement total jusqu'à 24h avant</MenuItem>
                          <MenuItem value="moderate">Modérée - Remboursement variable selon le délai</MenuItem>
                          <MenuItem value="strict">Stricte - Remboursement limité</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.allowVoucher}
                            onChange={(e) => setFormData(prev => ({ ...prev, allowVoucher: e.target.checked }))}
                            sx={{ color: COLORS.teal, '&.Mui-checked': { color: COLORS.teal } }}
                          />
                        }
                        label="Permettre voucher"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.allowRebooking}
                            onChange={(e) => setFormData(prev => ({ ...prev, allowRebooking: e.target.checked }))}
                            sx={{ color: COLORS.teal, '&.Mui-checked': { color: COLORS.teal } }}
                          />
                        }
                        label="Permettre rebooking"
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );

      case 3:
        return (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: COLORS.navy, mb: 1 }}>
                Galerie Photos
              </Typography>
              <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6), mb: 3 }}>
                Valorisez visuellement votre voyage
              </Typography>
              <Grid container spacing={3}>
                <Grid xs={12}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: COLORS.navy, mb: 1 }}>
                    Image de couverture (obligatoire)
                  </Typography>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    ref={fileInputRef}
                    onChange={handleCoverImageChange}
                  />
                  <Box
                    sx={{
                      border: `2px dashed ${alpha(COLORS.teal, 0.3)}`,
                      borderRadius: 12,
                      p: 4,
                      textAlign: 'center',
                      cursor: 'pointer',
                      bgcolor: formData.cover_image_preview ? 'transparent' : alpha(COLORS.teal, 0.02),
                      backgroundImage: formData.cover_image_preview ? `url(${formData.cover_image_preview})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      minHeight: 200,
                      transition: 'all 0.3s ease',
                      '&:hover': { borderColor: COLORS.teal },
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {formData.cover_image_preview ? (
                      <GradientButton startIcon={<CloudUpload />}>
                        Changer l'image
                      </GradientButton>
                    ) : (
                      <Box>
                        <CloudUpload sx={{ fontSize: 48, color: COLORS.teal, mb: 1 }} />
                        <Typography sx={{ color: alpha(COLORS.navy, 0.6) }}>
                          Cliquez pour télécharger une image de couverture
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
                <Grid xs={12}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: COLORS.navy, mb: 1 }}>
                    Galerie d'images (minimum 3 recommandées)
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {formData.gallery.map((img, index) => (
                      <Card key={index} sx={{ width: 150, position: 'relative', borderRadius: 12, border: `1px solid ${alpha(COLORS.teal, 0.1)}` }}>
                        <CardMedia
                          component="img"
                          height={100}
                          image={img.preview || img.url || '/placeholder.jpg'}
                          sx={{ borderRadius: '12px 12px 0 0' }}
                        />
                        <IconButton
                          size="small"
                          sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.5)', color: COLORS.white, '&:hover': { bgcolor: COLORS.amber } }}
                          onClick={() => removeGalleryImage(index)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Card>
                    ))}
                    <Box
                      sx={{
                        width: 150,
                        height: 100,
                        border: `2px dashed ${alpha(COLORS.teal, 0.3)}`,
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': { borderColor: COLORS.teal, bgcolor: alpha(COLORS.teal, 0.02) },
                      }}
                      onClick={() => galleryInputRef.current?.click()}
                    >
                      <input
                        ref={galleryInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={handleGalleryImageChange}
                      />
                      <Add sx={{ color: COLORS.teal, fontSize: 32 }} />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );

      case 4:
        const consistencyChecks = getAIConsistencyCheck();
        return (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: COLORS.navy, mb: 1 }}>
                Vérification intelligente
              </Typography>
              <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6), mb: 3 }}>
                Notre IA analyse votre voyage pour vous donner des recommandations
              </Typography>
              <Paper sx={{ p: 3, mb: 3, borderRadius: 12, bgcolor: alpha(COLORS.teal, 0.02), border: `1px solid ${alpha(COLORS.teal, 0.1)}` }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: COLORS.navy, mb: 2 }}>
                   Vérification de cohérence
                </Typography>
                {consistencyChecks.length > 0 ? (
                  <List dense>
                    {consistencyChecks.map((check, i) => (
                      <ListItem key={i}>
                        <ListItemIcon><Warning sx={{ color: COLORS.amber }} /></ListItemIcon>
                        <ListItemText primary={check} sx={{ color: alpha(COLORS.navy, 0.7) }} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity="success" sx={{ borderRadius: 10, bgcolor: alpha(COLORS.teal, 0.05), borderLeft: `4px solid ${COLORS.teal}` }}>
                    Votre voyage semble cohérent !
                  </Alert>
                )}
              </Paper>
              <Paper sx={{ p: 3, mb: 3, borderRadius: 12, border: `1px solid ${alpha(COLORS.teal, 0.1)}` }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: COLORS.navy, mb: 2 }}>
                  Score de visibilité
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={visibilityScore} 
                      sx={{ 
                        height: 10, 
                        borderRadius: 5, 
                        backgroundColor: alpha(COLORS.teal, 0.15),
                        '& .MuiLinearProgress-bar': { 
                          backgroundColor: visibilityScore >= 80 ? COLORS.teal : visibilityScore >= 50 ? COLORS.amber : COLORS.amber,
                          borderRadius: 5,
                        }
                      }}
                    />
                  </Box>
                  <Typography variant="h6" fontWeight={800} sx={{ color: visibilityScore >= 80 ? COLORS.teal : COLORS.amber }}>
                    {visibilityScore}%
                  </Typography>
                </Box>
                {aiSuggestions.length > 0 && (
                  <Alert severity="info" icon={<TipsAndUpdates />} sx={{ borderRadius: 10, bgcolor: alpha(COLORS.teal, 0.05), borderLeft: `4px solid ${COLORS.teal}` }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: COLORS.navy, mb: 1 }}>
                      Conseils pour améliorer :
                    </Typography>
                    <List dense disablePadding>
                      {aiSuggestions.map((suggestion, i) => (
                        <ListItem key={i} sx={{ py: 0.5, px: 0 }}>
                          <ListItemIcon><Info sx={{ color: COLORS.teal, fontSize: 16 }} /></ListItemIcon>
                          <ListItemText primary={suggestion} sx={{ color: alpha(COLORS.navy, 0.7) }} />
                        </ListItem>
                      ))}
                    </List>
                  </Alert>
                )}
              </Paper>
            </Box>
          </Fade>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: alpha(COLORS.navy, 0.02), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} sx={{ color: COLORS.teal }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: alpha(COLORS.navy, 0.02), py: 4, width: '100%', overflowX: 'hidden' }}>
      <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 }, width: '100%', maxWidth: '100% !important' }}>
        
        {/* Header */}
        <GradientHeader elevation={0} sx={{ width: '100%', borderRadius: 16 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, color: COLORS.white }}>
            {isEdit ? 'Modifier le voyage' : 'Créer un nouveau voyage'}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.92, color: COLORS.white }}>
            Remplissez les informations étape par étape pour publier une fiche claire et attractive.
          </Typography>
        </GradientHeader>

        {/* Error Alert */}
        {error && (
          <Fade in>
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: 12, borderLeft: `4px solid ${COLORS.amber}` }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {/* Stepper */}
        <Paper sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 12, 
          border: `1px solid ${alpha(COLORS.teal, 0.15)}`,
          backgroundColor: COLORS.white,
          overflowX: 'auto',
          width: '100%',
        }}>
          <Stepper activeStep={activeStep} sx={{ 
            '& .MuiStepConnector-line': { borderColor: alpha(COLORS.teal, 0.2) },
            flexWrap: 'wrap',
            minWidth: 'fit-content',
          }}>
            {steps.map((step, index) => (
              <Step
                key={step.label}
                onClick={() => setActiveStep(index)}
                sx={{ cursor: 'pointer' }}
              >
                <StepLabel StepIconComponent={() => (
                  <StepIconBox active={activeStep === index} completed={activeStep > index}>
                    {activeStep > index ? <CheckCircle sx={{ fontSize: 16 }} /> : index + 1}
                  </StepIconBox>
                )}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap' }}>
                    {step.icon}
                    <Typography sx={{ 
                      fontWeight: activeStep === index ? 700 : 500,
                      color: activeStep === index ? COLORS.teal : alpha(COLORS.navy, 0.6),
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    }}>
                      {step.label}
                    </Typography>
                  </Box>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Form Content */}
        <StyledPaper elevation={0} sx={{ p: { xs: 2, sm: 3, md: 4 }, width: '100%' }}>
          {renderStepContent()}

          {/* Navigation Buttons */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mt: 4, 
            pt: 3, 
            borderTop: `1px solid ${alpha(COLORS.teal, 0.15)}`,
            flexWrap: 'wrap',
            gap: 2,
          }}>
            <OutlineButton
              disabled={activeStep === 0}
              onClick={() => setActiveStep(prev => prev - 1)}
              startIcon={<ArrowBack />}
              sx={{ minWidth: { xs: '100px', sm: 'auto' } }}
            >
              Retour
            </OutlineButton>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <OutlineButton
                startIcon={<Save />}
                onClick={handleSaveDraft}
                disabled={saving}
                sx={{ minWidth: { xs: '140px', sm: 'auto' } }}
              >
                Sauvegarder brouillon
              </OutlineButton>

              {activeStep < steps.length - 1 ? (
                <GradientButton
                  onClick={() => setActiveStep(prev => prev + 1)}
                  endIcon={<ArrowForward />}
                >
                  Suivant
                </GradientButton>
              ) : (
                <GradientButton
                  startIcon={<Send />}
                  onClick={handlePublish}
                  disabled={saving}
                >
                  {saving ? <CircularProgress size={24} sx={{ color: COLORS.white }} /> : 'Publier'}
                </GradientButton>
              )}
            </Box>
          </Box>
        </StyledPaper>
      </Container>
    </Box>
  );
};

export default TripForm;