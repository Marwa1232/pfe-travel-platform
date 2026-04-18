import React, { useState, useEffect, useRef } from 'react';
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
} from '@mui/icons-material';
import { tripAPI } from '../../services/api';
import { styled, alpha } from '@mui/material/styles';

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

const categories = [
  { value: 'randonnee', label: 'Randonnée' },
  { value: 'camping', label: 'Camping' },
  { value: 'culturel', label: 'Culturel' },
  { value: 'detente', label: 'Détente' },
  { value: 'aventure', label: 'Aventure' },
  { value: 'roadtrip', label: 'Road Trip' },
];

const TripForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      return 'Fields must be alphabetic';
    }
    return '';
  };

  const validateFirstUppercase = (value: string): string => {
    if (value && value.length > 0 && value[0] !== value[0].toUpperCase()) {
      return 'First letter must be uppercase';
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
    // Step 1: General Info
    title: '',
    slug: '',
    category: '',
    destination: '',
    difficulty_level: 'medium',
    short_description: '',
    long_description: '',
    tags: [] as string[],
    
    // Step 2: Planning
    start_date: '',
    end_date: '',
    meeting_point: '',
    meeting_address: '',
    max_places: '',
    program: [] as { day: number; title: string; description: string }[],
    
    // Step 3: Pricing
    base_price: '',
    currency: 'TND',
    inclusions: [] as string[],
    exclusions: [] as string[],
    
    // Step 4: Media
    cover_image: null as File | null,
    cover_image_preview: '',
    gallery: [] as { file: File | null; preview: string; url?: string }[],
    
    // Status
    status: 'draft',
    
    // Cancellation Policy
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
      // Load destinations
      const destRes = await fetch('http://localhost:8000/api/destinations');
      const destData = await destRes.json();
      setDestinations(destData['hydra:member'] || destData);
      
      // Load categories
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
        setFieldErrors(prev => ({ ...prev, start_date: 'Insufficient date' }));
      } else {
        setFieldErrors(prev => ({ ...prev, start_date: '' }));
      }
      if (formData.end_date && value && formData.end_date < value) {
        setFieldErrors(prev => ({ ...prev, end_date: 'Insufficient date' }));
      } else if (formData.end_date && value && formData.end_date >= value) {
        setFieldErrors(prev => ({ ...prev, end_date: '' }));
      }
    }
    if (name === 'end_date') {
      if (value && formData.start_date && value < formData.start_date) {
        setFieldErrors(prev => ({ ...prev, end_date: 'Insufficient date' }));
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
          checks.push('⚠️ Conseil : En hiver, prévoyez des vêtements chauds pour vos participants.');
        }
      }
    }

    if (formData.category === 'detente' && formData.destination) {
      if (formData.destination.toLowerCase().includes('djerba') || 
          formData.destination.toLowerCase().includes('hammamet')) {
        checks.push('💡 Information : N\'oubliez pas de mentionner les activités plage dans votre description.');
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
      setFieldErrors(prev => ({ ...prev, start_date: 'Insufficient date' }));
      validationErrors.push('Insufficient date');
    }
    if (formData.end_date && formData.start_date && formData.end_date < formData.start_date) {
      setFieldErrors(prev => ({ ...prev, end_date: 'Insufficient date' }));
      validationErrors.push('Insufficient date');
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

  // Styles pour le thème
  const primaryGradient = 'linear-gradient(90deg, #00BFA5, #0D47A1)';
  const primaryColor = '#00BFA5';
  const secondaryColor = '#0D47A1';

  const CustomStepIcon = ({ active, completed, icon }: { active?: boolean; completed?: boolean; icon?: number }) => (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        bgcolor: active || completed ? primaryColor : 'grey.300',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: active || completed ? 'white' : 'grey.600',
        boxShadow: active ? `0 0 0 3px ${alpha(primaryColor, 0.2)}` : 'none',
      }}
    >
      {completed ? <CheckCircle sx={{ fontSize: 18 }} /> : icon}
    </Box>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Informations générales</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Définissez l'identité et l'ambiance de votre voyage
            </Typography>
            <Grid container spacing={3}>
              <Grid xs={12}>
                <TextField
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
                <TextField
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
                  <InputLabel>Catégorie</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    label="Catégorie"
                  >
                    {categoriesState.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Destination</InputLabel>
                  <Select
                    name="destination"
                    value={formData.destination}
                    onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                    label="Destination"
                  >
                    {destinations.map((dest) => (
                      <MenuItem key={dest.id} value={dest.id}>{dest.name} ({dest.country})</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Niveau de difficulté</InputLabel>
                  <Select
                    name="difficulty_level"
                    value={formData.difficulty_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty_level: e.target.value }))}
                    label="Niveau de difficulté"
                  >
                    <MenuItem value="easy">Facile</MenuItem>
                    <MenuItem value="medium">Moyen</MenuItem>
                    <MenuItem value="difficult">Difficile</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12}>
                <TextField
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
                <TextField
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
                <Typography variant="body1" gutterBottom>Tags (mots-clés)</Typography>
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
                        '& .MuiChip-label': { display: 'flex', alignItems: 'center', gap: 0.5 },
                        '&.MuiChip-filled': {
                          backgroundColor: primaryColor,
                          color: 'white',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Planning & Logistique</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Définissez le cadre organisationnel du voyage
            </Typography>
            <Grid container spacing={3}>
              <Grid xs={12} sm={6}>
                <TextField
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
                <TextField
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
                <TextField
                  fullWidth
                  label="Point de rendez-vous"
                  name="meeting_point"
                  value={formData.meeting_point}
                  onChange={handleChange}
                  placeholder="Ex: Agence de voyage, Gare..."
                />
              </Grid>
              <Grid xs={12}>
                <TextField
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
                <TextField
                  fullWidth
                  label="Nombre maximum de places"
                  name="max_places"
                  type="number"
                  value={formData.max_places}
                  onChange={handleChange}
                />
              </Grid>
              <Grid xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Programme détaillé</Typography>
                  <Button 
                    startIcon={<Add />} 
                    onClick={addProgramDay} 
                    variant="outlined"
                    sx={{
                      borderColor: alpha(primaryColor, 0.5),
                      color: primaryColor,
                      '&:hover': {
                        borderColor: primaryColor,
                        backgroundColor: alpha(primaryColor, 0.04),
                      },
                    }}
                  >
                    Ajouter un jour
                  </Button>
                </Box>
                {formData.program.map((day, index) => (
                  <Card key={index} sx={{ mb: 2, p: 2, border: `1px solid ${alpha(primaryColor, 0.1)}` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight={600}>Jour {day.day}</Typography>
                      <IconButton onClick={() => removeProgramDay(index)} color="error">
                        <Delete />
                      </IconButton>
                    </Box>
                    <TextField
                      fullWidth
                      label="Titre"
                      value={day.title}
                      onChange={(e) => updateProgramDay(index, 'title', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
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
                  <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                    Cliquez sur "Ajouter un jour" pour créer votre programme
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Prix & Inclusions</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Définissez clairement votre offre financière
            </Typography>
            <Grid container spacing={3}>
              <Grid xs={12} sm={6}>
                <TextField
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
                  <InputLabel>Devise</InputLabel>
                  <Select
                    name="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    label="Devise"
                  >
                    <MenuItem value="TND">TND (Dinars tunisiens)</MenuItem>
                    <MenuItem value="EUR">EUR (Euros)</MenuItem>
                    <MenuItem value="USD">USD (Dollars)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {formData.base_price && (
                <Grid xs={12}>
                  <Paper sx={{ p: 2, bgcolor: alpha(primaryColor, 0.02), border: `1px solid ${alpha(primaryColor, 0.1)}` }}>
                    <Typography variant="subtitle2" gutterBottom>Estimation des revenus</Typography>
                    <Grid container spacing={2}>
                      <Grid xs={4}>
                        <Typography variant="body2" color="text.secondary">Revenu brut</Typography>
                        <Typography variant="h6" color="primary">
                          {parseFloat(formData.base_price) * (parseInt(formData.max_places) || 10)} TND
                        </Typography>
                      </Grid>
                      <Grid xs={4}>
                        <Typography variant="body2" color="text.secondary">Commission (10%)</Typography>
                        <Typography variant="h6" color="warning.main">
                          {parseFloat(formData.base_price) * (parseInt(formData.max_places) || 10) * 0.1} TND
                        </Typography>
                      </Grid>
                      <Grid xs={4}>
                        <Typography variant="body2" color="text.secondary">Revenu net</Typography>
                        <Typography variant="h6" color="success.main">
                          {parseFloat(formData.base_price) * (parseInt(formData.max_places) || 10) * 0.9} TND
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              )}
              <Grid xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>Ce qui est inclus</Typography>
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
                        '&.MuiChip-filled': formData.inclusions.includes(item.value) ? {
                          backgroundColor: primaryColor,
                          color: 'white',
                        } : {},
                      }}
                    />
                  ))}
                </Box>
              </Grid>
              <Grid xs={12}>
                <Typography variant="subtitle1" gutterBottom>Ce qui n'est pas inclus</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {exclusionOptions.map((item) => (
                    <Chip
                      key={item.value}
                      label={item.label}
                      onClick={() => handleExclusionToggle(item.value)}
                      color={formData.exclusions.includes(item.value) ? 'error' : 'default'}
                      variant={formData.exclusions.includes(item.value) ? 'filled' : 'outlined'}
                      icon={formData.exclusions.includes(item.value) ? <Warning /> : undefined}
                    />
                  ))}
                </Box>
              </Grid>
              <Grid xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>Politique d'annulation</Typography>
                <Grid container spacing={2}>
                  <Grid xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Politique</InputLabel>
                      <Select
                        name="policyType"
                        value={formData.policyType}
                        onChange={(e) => setFormData(prev => ({ ...prev, policyType: e.target.value }))}
                        label="Politique"
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
                          color="primary"
                        />
                      }
                      label="Permettre voucher"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.allowRebooking}
                          onChange={(e) => setFormData(prev => ({ ...prev, allowRebooking: e.target.checked }))}
                          color="primary"
                        />
                      }
                      label="Permettre rebooking"
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Galerie Photos</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Valorisez visuellement votre voyage
            </Typography>
            <Grid container spacing={3}>
              <Grid xs={12}>
                <Typography variant="subtitle1" gutterBottom>Image de couverture (obligatoire)</Typography>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  ref={fileInputRef}
                  onChange={handleCoverImageChange}
                />
                <Box
                  sx={{
                    border: `2px dashed ${alpha(primaryColor, 0.3)}`,
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: formData.cover_image_preview ? 'transparent' : alpha(primaryColor, 0.02),
                    backgroundImage: formData.cover_image_preview ? `url(${formData.cover_image_preview})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: 200,
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.cover_image_preview ? (
                    <Box>
                      <Button 
                        variant="contained" 
                        startIcon={<CloudUpload />}
                        sx={{
                          background: primaryGradient,
                          '&:hover': { background: `linear-gradient(90deg, ${alpha(primaryColor, 0.9)}, ${alpha(secondaryColor, 0.9)})` },
                        }}
                      >
                        Changer l'image
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      <CloudUpload sx={{ fontSize: 48, color: primaryColor, mb: 1 }} />
                      <Typography>Cliquez pour télécharger une image de couverture</Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid xs={12}>
                <Typography variant="subtitle1" gutterBottom>Galerie d'images (minimum 3 recommandées)</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {formData.gallery.map((img, index) => (
                    <Card key={index} sx={{ width: 150, position: 'relative', border: `1px solid ${alpha(primaryColor, 0.1)}` }}>
                      <CardMedia
                        component="img"
                        height={100}
                        image={img.preview || img.url || '/placeholder.jpg'}
                      />
                      <IconButton
                        size="small"
                        sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}
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
                      border: `2px dashed ${alpha(primaryColor, 0.3)}`,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={() => document.getElementById('gallery-input')?.click()}
                  >
                    <input
                      id="gallery-input"
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={handleGalleryImageChange}
                    />
                    <Add sx={{ color: primaryColor }} />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );

      case 4:
        const consistencyChecks = getAIConsistencyCheck();
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Vérification intelligente</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Notre IA analyse votre voyage pour vous donner des recommandations
            </Typography>
            <Paper sx={{ p: 3, mb: 3, bgcolor: alpha(primaryColor, 0.02), border: `1px solid ${alpha(primaryColor, 0.1)}` }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                 Vérification de cohérence
              </Typography>
              {consistencyChecks.length > 0 ? (
                <List dense>
                  {consistencyChecks.map((check, i) => (
                    <ListItem key={i}>
                      <ListItemIcon><Warning color="warning" /></ListItemIcon>
                      <ListItemText primary={check} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="success" sx={{ borderRadius: 2, borderLeft: `4px solid ${primaryColor}` }}>
                  Votre voyage semble cohérent !
                </Alert>
              )}
            </Paper>
            <Paper sx={{ p: 3, mb: 3, border: `1px solid ${alpha(primaryColor, 0.1)}` }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                 Score de visibilité
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={visibilityScore} 
                    sx={{ height: 10, borderRadius: 5, backgroundColor: alpha(primaryColor, 0.2) }}
                    color={visibilityScore >= 80 ? 'success' : visibilityScore >= 50 ? 'warning' : 'error'}
                  />
                </Box>
                <Typography variant="h6" fontWeight={700}>
                  {visibilityScore}%
                </Typography>
              </Box>
              {aiSuggestions.length > 0 && (
                <Alert severity="info" icon={<TipsAndUpdates />} sx={{ borderRadius: 2, borderLeft: `4px solid ${primaryColor}` }}>
                  <Typography variant="subtitle2" gutterBottom>Conseils pour améliorer :</Typography>
                  <List dense>
                    {aiSuggestions.map((suggestion, i) => (
                      <ListItem key={i} sx={{ py: 0 }}>
                        <ListItemIcon><Info fontSize="small" /></ListItemIcon>
                        <ListItemText primary={suggestion} />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              )}
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress sx={{ color: primaryColor }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 3,
          borderRadius: 3,
          color: 'white',
          background: 'linear-gradient(100deg, #0D47A1 0%, #00BFA5 100%)',
          boxShadow: '0 14px 34px rgba(13, 71, 161, 0.28)',
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
          {isEdit ? 'Modifier le voyage' : 'Créer un nouveau voyage'}
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.92 }}>
          Remplissez les informations étape par étape pour publier une fiche claire et attractive.
        </Typography>
      </Paper>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2, borderRadius: 2, borderLeft: `4px solid ${primaryColor}` }}
        >
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, md: 2 },
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${alpha(primaryColor, 0.14)}`,
          backgroundColor: '#fff',
        }}
      >
      <Stepper activeStep={activeStep} sx={{ mb: 0 }}>
        {steps.map((step, index) => (
          <Step
            key={step.label}
            onClick={() => setActiveStep(index)}
            sx={{ cursor: 'pointer' }}
          >
            <StepLabel StepIconComponent={(props) => <CustomStepIcon {...props} icon={index + 1} />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {step.icon}
                {step.label}
              </Box>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4 },
          border: `1px solid ${alpha(primaryColor, 0.14)}`,
          borderRadius: 3,
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
          backgroundColor: '#fff',
        }}
      >
        {renderStepContent()}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: `1px solid ${alpha(primaryColor, 0.1)}` }}>
          <Button
            disabled={activeStep === 0}
            onClick={() => setActiveStep(prev => prev - 1)}
            variant="outlined"
            sx={{
              borderColor: alpha(primaryColor, 0.5),
              color: primaryColor,
              '&:hover': {
                borderColor: primaryColor,
                backgroundColor: alpha(primaryColor, 0.04),
              },
            }}
          >
            Retour
          </Button>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Save />}
              onClick={handleSaveDraft}
              disabled={saving}
              sx={{
                borderColor: alpha(primaryColor, 0.5),
                color: primaryColor,
                '&:hover': {
                  borderColor: primaryColor,
                  backgroundColor: alpha(primaryColor, 0.04),
                },
              }}
            >
              Sauvegarder brouillon
            </Button>

            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={() => setActiveStep(prev => prev + 1)}
                sx={{
                  background: primaryGradient,
                  color: 'white',
                  '&:hover': {
                    background: `linear-gradient(90deg, ${alpha(primaryColor, 0.9)}, ${alpha(secondaryColor, 0.9)})`,
                  },
                }}
              >
                Suivant
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                startIcon={<Send />}
                onClick={handlePublish}
                disabled={saving}
                sx={{
                  background: primaryGradient,
                  '&:hover': {
                    background: `linear-gradient(90deg, ${alpha(primaryColor, 0.9)}, ${alpha(secondaryColor, 0.9)})`,
                  },
                }}
              >
                {saving ? <CircularProgress size={24} color="inherit" /> : 'Publier'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default TripForm;