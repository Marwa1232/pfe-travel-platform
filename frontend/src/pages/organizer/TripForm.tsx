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
  Star,
  PhotoCamera,
  AttachMoney,
  CalendarMonth,
  LocationOn,
  Description,
  Lightbulb,
} from '@mui/icons-material';
import { tripAPI } from '../../services/api';

// Available tags
const availableTags = [
  { value: 'nature', label: '#Nature', icon: '🌿' },
  { value: 'montagne', label: '#Montagne', icon: '🏔️' },
  { value: 'plage', label: '#Plage', icon: '🏖️' },
  { value: 'desert', label: '#Désert', icon: '🏜️' },
  { value: 'culture', label: '#Culture', icon: '🏛️' },
  { value: 'aventure', label: '#Aventure', icon: '🎒' },
  { value: 'famille', label: '#Famille', icon: '👨‍👩‍👧' },
  { value: 'romantique', label: '#Romantique', icon: '💕' },
  { value: 'luxe', label: '#Luxe', icon: '💎' },
  { value: 'jeunes', label: '#Jeunes', icon: '🎉' },
  { value: 'froid', label: '#Froid', icon: '❄️' },
  { value: 'sport', label: '#Sport', icon: '⚽' },
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
  const [visibilityScore, setVisibilityScore] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: General Info
    title: '',
    slug: '',
    category: '',
    destination: '',
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
  });

  const steps = [
    { label: 'Informations', icon: <Description /> },
    { label: 'Planning', icon: <CalendarMonth /> },
    { label: 'Prix', icon: <AttachMoney /> },
    { label: 'Photos', icon: <PhotoCamera /> },
    { label: 'Validation', icon: <Lightbulb /> },
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
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };

  const loadTrip = async () => {
    try {
      setLoading(true);
      const response = await tripAPI.get(Number(id));
      const trip = response.data;

      setFormData({
        ...formData,
        title: trip.title || '',
        slug: trip.slug || '',
        category: trip.categories?.[0]?.name || '',
        destination: trip.destinations?.[0]?.name || '',
        short_description: trip.short_description || '',
        long_description: trip.long_description || '',
        tags: trip.tags || [],
        start_date: trip.sessions?.[0]?.start_date || '',
        end_date: trip.sessions?.[0]?.end_date || '',
        meeting_point: trip.meeting_point || '',
        meeting_address: trip.meeting_address || '',
        max_places: trip.sessions?.[0]?.max_capacity?.toString() || '',
        base_price: trip.base_price || '',
        currency: trip.currency || 'TND',
        inclusions: trip.inclusions || [],
        exclusions: trip.exclusions || [],
        cover_image_preview: trip.images?.[0]?.url || '',
        gallery: trip.images?.slice(1).map((img: any) => ({ file: null, preview: '', url: img.url })) || [],
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
    
    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug }));
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

  // Calculate visibility score
  useEffect(() => {
    let score = 0;
    const suggestions: string[] = [];

    // Description (15 points)
    if (formData.long_description.length >= 150) {
      score += 15;
    } else if (formData.long_description.length > 0) {
      suggestions.push('Ajoutez une description plus détaillée (minimum 150 caractères)');
    }

    // Photos (20 points)
    const totalPhotos = (formData.cover_image ? 1 : formData.cover_image_preview ? 1 : 0) + formData.gallery.length;
    if (totalPhotos >= 3) {
      score += 20;
    } else {
      suggestions.push(`Ajoutez ${3 - totalPhotos} photo(s) supplémentaire(s)`);
    }

    // Tags (10 points)
    if (formData.tags.length >= 3) {
      score += 10;
    } else if (formData.tags.length > 0) {
      suggestions.push('Ajoutez plus de tags pour améliorer la visibilité');
    }

    // Program (15 points)
    if (formData.program.length >= 3) {
      score += 15;
    } else if (formData.program.length > 0) {
      suggestions.push('Ajoutez plus de jours au programme');
    }

    // Image HD - simplified check
    if (formData.cover_image || formData.cover_image_preview) {
      score += 20;
    }

    setVisibilityScore(score);
    setAiSuggestions(suggestions);
  }, [formData]);

  // AI Consistency Check
  const getAIConsistencyCheck = () => {
    const checks: string[] = [];
    
    // Winter check for mountain/camping
    if ((formData.category === 'camping' || formData.category === 'randonnee') && 
        formData.start_date) {
      const month = new Date(formData.start_date).getMonth();
      if (month >= 10 || month <= 2) { // Nov-Feb
        if (!formData.long_description.toLowerCase().includes('froid') && 
            !formData.long_description.toLowerCase().includes('hiver') &&
            !formData.tags.includes('froid')) {
          checks.push('⚠️ Conseil : En hiver, prévoyez des vêtements chauds pour vos participants.');
        }
      }
    }

    // Beach in summer
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

    try {
      const submitData = {
        title: formData.title,
        slug: formData.slug,
        short_description: formData.short_description,
        long_description: formData.long_description,
        base_price: parseFloat(formData.base_price),
        currency: formData.currency,
        duration_days: formData.program.length || parseInt(formData.end_date) - parseInt(formData.start_date) || 1,
        difficulty_level: 'medium',
        status: status,
        tags: formData.tags,
        inclusions: formData.inclusions,
        exclusions: formData.exclusions,
        meeting_point: formData.meeting_point,
        meeting_address: formData.meeting_address,
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
      case 0: // General Info
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
                  helperText={`${formData.title.length}/80 caractères`}
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
                    {categories.map((cat) => (
                      <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
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
                      <MenuItem key={dest.id} value={dest.name}>{dest.name} ({dest.country})</MenuItem>
                    ))}
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
                      label={`${tag.icon} ${tag.label}`}
                      onClick={() => handleTagToggle(tag.value)}
                      color={formData.tags.includes(tag.value) ? 'primary' : 'default'}
                      variant={formData.tags.includes(tag.value) ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Box>
        );

      case 1: // Planning
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
                  <Button startIcon={<Add />} onClick={addProgramDay} variant="outlined">
                    Ajouter un jour
                  </Button>
                </Box>

                {formData.program.map((day, index) => (
                  <Card key={index} sx={{ mb: 2, p: 2 }}>
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

      case 2: // Pricing
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

              {/* Price estimation */}
              {formData.base_price && (
                <Grid xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
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
            </Grid>
          </Box>
        );

      case 3: // Media
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
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: formData.cover_image_preview ? 'transparent' : 'grey.50',
                    backgroundImage: formData.cover_image_preview ? `url(${formData.cover_image_preview})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: 200,
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.cover_image_preview ? (
                    <Box>
                      <Button variant="contained" startIcon={<CloudUpload />}>
                        Changer l'image
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                      <Typography>Cliquez pour télécharger une image de couverture</Typography>
                    </Box>
                  )}
                </Box>
              </Grid>

              <Grid xs={12}>
                <Typography variant="subtitle1" gutterBottom>Galerie d'images (minimum 3 recommandées)</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {formData.gallery.map((img, index) => (
                    <Card key={index} sx={{ width: 150, position: 'relative' }}>
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
                      border: '2px dashed',
                      borderColor: 'divider',
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
                    <Add sx={{ color: 'text.secondary' }} />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );

      case 4: // AI Validation
        const consistencyChecks = getAIConsistencyCheck();
        
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Vérification intelligente</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Notre IA analyse votre voyage pour vous donner des recommandations
            </Typography>

            {/* Consistency Check */}
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'warning.light' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                🔍 Vérification de cohérence
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
                <Alert severity="success">Votre voyage semble cohérent !</Alert>
              )}
            </Paper>

            {/* Visibility Score */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                📊 Score de visibilité
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={visibilityScore} 
                    sx={{ height: 10, borderRadius: 5 }}
                    color={visibilityScore >= 80 ? 'success' : visibilityScore >= 50 ? 'warning' : 'error'}
                  />
                </Box>
                <Typography variant="h6" fontWeight={700}>
                  {visibilityScore}%
                </Typography>
              </Box>
              
              {aiSuggestions.length > 0 && (
                <Alert severity="info" icon={<Lightbulb />}>
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

            {/* Preview Mode */}
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  👁️ Aperçu
                </Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<Visibility />}
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  {previewMode ? 'Masquer' : 'Voir'} l'aperçu
                </Button>
              </Box>
              
              {previewMode && (
                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
                  <Typography variant="h5" fontWeight={700}>{formData.title || 'Titre du voyage'}</Typography>
                  <Typography color="text.secondary" gutterBottom>
                    {formData.category} - {formData.destination}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {formData.short_description || 'Description courte...'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {formData.tags.map(tag => (
                      <Chip key={tag} label={`#${tag}`} size="small" />
                    ))}
                  </Box>
                  <Typography variant="h5" color="primary" sx={{ mt: 2 }}>
                    {formData.base_price} {formData.currency}
                  </Typography>
                </Box>
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
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        {isEdit ? 'Modifier le voyage' : 'Créer un nouveau voyage'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((step, index) => (
          <Step key={step.label} onClick={() => setActiveStep(index)} sx={{ cursor: 'pointer' }}>
            <StepLabel StepIconComponent={() => (
              <Box sx={{ 
                width: 32, 
                height: 32, 
                borderRadius: '50%', 
                bgcolor: activeStep >= index ? 'primary.main' : 'grey.300',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: activeStep >= index ? 'white' : 'grey.600'
              }}>
                {index + 1}
              </Box>
            )}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {step.icon}
                {step.label}
              </Box>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        {renderStepContent()}

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            disabled={activeStep === 0}
            onClick={() => setActiveStep(prev => prev - 1)}
            variant="outlined"
          >
            Retour
          </Button>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Save />}
              onClick={handleSaveDraft}
              disabled={saving}
            >
              Sauvegarder brouillon
            </Button>

            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={() => setActiveStep(prev => prev + 1)}
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
              >
                {saving ? <CircularProgress size={24} /> : 'Publier'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default TripForm;
