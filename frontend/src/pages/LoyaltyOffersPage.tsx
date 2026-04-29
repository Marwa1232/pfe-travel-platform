import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box, Typography, Grid, Card, CardContent, CardActions,
  Button, Chip, CircularProgress, Alert, LinearProgress,
  Avatar, Divider,
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import {
  EmojiEvents, LocalOffer, FlightTakeoff, Lock,
  CheckCircle, ArrowForward, Stars, CreditCard,
  GpsFixed, WorkspacePremium, LightbulbOutlined,
} from '@mui/icons-material';
import { loyaltyAPI, tripAPI } from '../services/api';
import { RootState } from '../store';

const T = {
  teal:   '#0EA5A0',
  navy:   '#0F2D5C',
  slate:  '#64748B',
  ink:    '#0F172A',
  paper:  '#F8FAFC',
  white:  '#FFFFFF',
  border: '#E2E8F0',
  amber:  '#D97706',
  green:  '#16A34A',
  red:    '#DC2626',
};

const Page = styled(Box)({
  minHeight: '100vh',
  backgroundColor: T.paper,
  paddingTop: 88,
  paddingBottom: 64,
});

const getPointsLevel = (points: number) => {
  if (points >= 500) return { name: 'Platine', color: '#7C3AED', next: null };
  if (points >= 200) return { name: 'Or',      color: T.amber,   next: 500 };
  if (points >= 100) return { name: 'Argent',  color: '#64748B', next: 200 };
  if (points >= 50)  return { name: 'Bronze',  color: '#92400E', next: 100 };
  return                    { name: 'Débutant',color: T.slate,   next: 50  };
};

const LoyaltyOffersPage: React.FC = () => {
  const navigate                    = useNavigate();
  const { token }                   = useSelector((state: RootState) => state.auth);
  const [offers, setOffers]         = useState<any[]>([]);
  const [points, setPoints]         = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les offres
      const oRes = await loyaltyAPI.getOffers();
      setOffers(oRes.data.offers || []);

      // Charger les points si connecté
      if (token) {
        const pRes = await loyaltyAPI.getPoints();
        setPoints(pRes.data);
      }
    } catch (e: any) {
      setError('Impossible de charger les offres');
    } finally {
      setLoading(false);
    }
  };

  const level        = points ? getPointsLevel(points.available_points) : null;
  const availPts     = points?.available_points || 0;

  // Grouper les offres par can_use
  const usableOffers = offers.filter(o => o.can_use);
  const lockedOffers = offers.filter(o => !o.can_use);

  if (loading) return (
    <Page sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress sx={{ color: T.amber }} />
    </Page>
  );

  return (
    <Page>
      <Box maxWidth={1100} mx="auto" px={{ xs: 2, md: 4 }}>

        {/* ── Hero header ── */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: '20px',
            background: `linear-gradient(135deg, ${T.amber}, #F59E0B)`,
            boxShadow: `0 12px 32px ${alpha(T.amber, 0.35)}`, mb: 3 }}>
            <EmojiEvents sx={{ fontSize: 36, color: '#fff' }} />
          </Box>
          <Typography sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 800, color: T.ink, mb: 1.5 }}>
            Offres Fidélité
          </Typography>
          <Typography sx={{ fontSize: 16, color: T.slate, maxWidth: 520, mx: 'auto' }}>
            Utilisez vos points pour débloquer des réductions exclusives sur vos prochains voyages
          </Typography>
        </Box>

        {/* ── Carte points utilisateur ── */}
        {token && points ? (
          <Card sx={{ mb: 5, borderRadius: 3, border: `1px solid ${T.border}`,
            boxShadow: 'none', overflow: 'hidden' }}>
            <Box sx={{ background: `linear-gradient(135deg, ${T.navy} 0%, #1a4a8a 100%)`, p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: 13, color: alpha('#fff', 0.7), mb: 0.5 }}>
                    Vos points disponibles
                  </Typography>
                  <Typography sx={{ fontSize: 42, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                    {availPts}
                    <Typography component="span" sx={{ fontSize: 16, fontWeight: 500, color: alpha('#fff', 0.7), ml: 1 }}>
                      pts
                    </Typography>
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Chip
                    label={level?.name}
                    icon={<WorkspacePremium sx={{ fontSize: '16px !important', color: `${level?.color} !important` }} />}
                    sx={{
                    bgcolor: alpha(level?.color || T.amber, 0.2),
                    color: '#fff', fontWeight: 700, fontSize: 13, height: 32,
                    border: `1px solid ${alpha(level?.color || T.amber, 0.4)}`,
                  }} />
                  <Typography sx={{ fontSize: 12, color: alpha('#fff', 0.6), mt: 1 }}>
                    {points.total_points} pts gagnés au total
                  </Typography>
                </Box>
              </Box>

              {/* Progress vers niveau suivant */}
              {level?.next && (
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontSize: 12, color: alpha('#fff', 0.7) }}>
                      Progression vers le niveau suivant
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>
                      {availPts} / {level.next} pts
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate"
                    value={Math.min((availPts / level.next) * 100, 100)}
                    sx={{ height: 6, borderRadius: 3,
                      bgcolor: alpha('#fff', 0.15),
                      '& .MuiLinearProgress-bar': { bgcolor: T.amber, borderRadius: 3 } }} />
                </Box>
              )}
            </Box>

            {/* Stats rapides */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', p: 2, gap: 0 }}>
              {[
                { label: 'Disponibles', value: points.available_points, color: T.teal },
                { label: 'Gagnés total', value: points.total_points, color: T.amber },
                { label: 'Utilisés', value: points.used_points, color: T.slate },
              ].map((s, i) => (
                <Box key={i} sx={{ textAlign: 'center', py: 1,
                  borderRight: i < 2 ? `1px solid ${T.border}` : 'none' }}>
                  <Typography sx={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</Typography>
                  <Typography sx={{ fontSize: 11, color: T.slate }}>{s.label}</Typography>
                </Box>
              ))}
            </Box>
          </Card>
        ) : !token ? (
          <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}
            action={
              <Button size="small" onClick={() => navigate('/login')} sx={{ fontWeight: 700 }}>
                Se connecter
              </Button>
            }>
            Connectez-vous pour voir vos points et utiliser les offres
          </Alert>
        ) : null}

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        {offers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <LocalOffer sx={{ fontSize: 56, color: T.border, mb: 2 }} />
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: T.ink, mb: 1 }}>
              Aucune offre disponible pour le moment
            </Typography>
            <Typography sx={{ fontSize: 14, color: T.slate, mb: 3 }}>
              Les organisateurs n'ont pas encore créé d'offres fidélité
            </Typography>
            <Button variant="contained" onClick={() => navigate('/trips')}
              sx={{ bgcolor: T.navy, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
              Découvrir les voyages
            </Button>
          </Box>
        ) : (
          <>
            {/* ── Offres utilisables ── */}
            {usableOffers.length > 0 && (
              <Box sx={{ mb: 5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <CheckCircle sx={{ color: T.green, fontSize: 22 }} />
                  <Typography sx={{ fontSize: 18, fontWeight: 700, color: T.ink }}>
                    Offres disponibles pour vous
                  </Typography>
                  <Chip label={usableOffers.length} size="small"
                    sx={{ bgcolor: alpha(T.green, 0.1), color: T.green, fontWeight: 700 }} />
                </Box>

                <Grid container spacing={2.5}>
                  {usableOffers.map(offer => (
                    <Grid item xs={12} sm={6} md={4} key={offer.id}>
                      <Card sx={{ height: '100%', borderRadius: 3, border: `2px solid ${alpha(T.green, 0.3)}`,
                        boxShadow: `0 4px 20px ${alpha(T.green, 0.08)}`,
                        transition: 'all 0.2s', cursor: 'default',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 12px 32px ${alpha(T.green, 0.15)}`,
                          borderColor: T.green } }}>
                        <CardContent sx={{ p: 3 }}>
                          {/* Badge dispo */}
                          <Chip label="Disponible" icon={<CheckCircle sx={{ fontSize: '14px !important' }} />}
                            size="small" sx={{ mb: 2,
                            bgcolor: alpha(T.green, 0.1), color: T.green, fontWeight: 700, fontSize: 11 }} />

                          {/* Réduction */}
                          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 1 }}>
                            <Typography sx={{ fontSize: 40, fontWeight: 900, color: T.amber, lineHeight: 1 }}>
                              {offer.discount_type === 'percentage_discount'
                                ? `-${offer.discount_value}%`
                                : `-${offer.discount_value}€`}
                            </Typography>
                          </Box>

                          <Typography sx={{ fontSize: 16, fontWeight: 700, color: T.ink, mb: 1 }}>
                            {offer.title}
                          </Typography>

                          {offer.description && (
                            <Typography sx={{ fontSize: 13, color: T.slate, mb: 2, lineHeight: 1.5 }}>
                              {offer.description}
                            </Typography>
                          )}

                          <Divider sx={{ my: 1.5 }} />

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <Stars sx={{ fontSize: 16, color: T.amber }} />
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: T.amber }}>
                              {offer.points_required} points requis
                            </Typography>
                          </Box>

                          {offer.expires_at && (
                            <Typography sx={{ fontSize: 11, color: T.slate, mt: 0.8 }}>
                              Expire le {offer.expires_at}
                            </Typography>
                          )}
                        </CardContent>
                        <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
                          <Button fullWidth variant="contained" endIcon={<ArrowForward />}
                            onClick={() => navigate('/trips')}
                            sx={{ bgcolor: T.teal, borderRadius: 2, textTransform: 'none',
                              fontWeight: 600, '&:hover': { bgcolor: '#0c9490' } }}>
                            Réserver et utiliser
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* ── Offres verrouillées ── */}
            {lockedOffers.length > 0 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Lock sx={{ color: T.slate, fontSize: 22 }} />
                  <Typography sx={{ fontSize: 18, fontWeight: 700, color: T.ink }}>
                    Encore quelques points…
                  </Typography>
                  <Chip label={lockedOffers.length} size="small"
                    sx={{ bgcolor: alpha(T.slate, 0.1), color: T.slate, fontWeight: 700 }} />
                </Box>

                <Grid container spacing={2.5}>
                  {lockedOffers.map(offer => {
                    const missing = offer.points_required - availPts;
                    const prog    = token ? Math.min((availPts / offer.points_required) * 100, 100) : 0;
                    return (
                      <Grid item xs={12} sm={6} md={4} key={offer.id}>
                        <Card sx={{ height: '100%', borderRadius: 3, border: `1px solid ${T.border}`,
                          boxShadow: 'none', opacity: 0.75,
                          transition: 'all 0.2s', '&:hover': { opacity: 0.9 } }}>
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <Lock sx={{ fontSize: 16, color: T.slate }} />
                              <Chip label={`Il vous manque ${missing} pts`} size="small"
                                sx={{ bgcolor: alpha(T.slate, 0.1), color: T.slate, fontWeight: 600, fontSize: 10 }} />
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 1 }}>
                              <Typography sx={{ fontSize: 40, fontWeight: 900, color: T.slate, lineHeight: 1 }}>
                                {offer.discount_type === 'percentage_discount'
                                  ? `-${offer.discount_value}%`
                                  : `-${offer.discount_value}€`}
                              </Typography>
                            </Box>

                            <Typography sx={{ fontSize: 16, fontWeight: 700, color: T.ink, mb: 1 }}>
                              {offer.title}
                            </Typography>

                            {offer.description && (
                              <Typography sx={{ fontSize: 13, color: T.slate, mb: 2, lineHeight: 1.5 }}>
                                {offer.description}
                              </Typography>
                            )}

                            <Divider sx={{ my: 1.5 }} />

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                              <Stars sx={{ fontSize: 16, color: T.slate }} />
                              <Typography sx={{ fontSize: 13, fontWeight: 600, color: T.slate }}>
                                {offer.points_required} points requis
                              </Typography>
                            </Box>

                            {token && (
                              <Box>
                                <LinearProgress variant="determinate" value={prog}
                                  sx={{ height: 5, borderRadius: 3,
                                    bgcolor: alpha(T.slate, 0.12),
                                    '& .MuiLinearProgress-bar': { bgcolor: T.amber, borderRadius: 3 } }} />
                                <Typography sx={{ fontSize: 10, color: T.slate, mt: 0.5 }}>
                                  {availPts} / {offer.points_required} pts
                                </Typography>
                              </Box>
                            )}

                            {offer.expires_at && (
                              <Typography sx={{ fontSize: 11, color: T.slate, mt: 1 }}>
                                Expire le {offer.expires_at}
                              </Typography>
                            )}
                          </CardContent>
                          <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
                            <Button fullWidth variant="outlined" endIcon={<FlightTakeoff />}
                              onClick={() => navigate('/trips')}
                              sx={{ borderColor: T.border, color: T.slate, borderRadius: 2,
                                textTransform: 'none', fontWeight: 600,
                                '&:hover': { borderColor: T.teal, color: T.teal } }}>
                              Gagner des points
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            )}
          </>
        )}

        <Box sx={{ mt: 8, p: 4, borderRadius: 3, bgcolor: alpha(T.navy, 0.04),
          border: `1px solid ${alpha(T.navy, 0.1)}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3 }}>
            <LightbulbOutlined sx={{ color: T.amber, fontSize: 22 }} />
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: T.ink }}>
              Comment gagner des points ?
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {[
              {
                icon: <FlightTakeoff sx={{ fontSize: 36, color: T.teal }} />,
                title: 'Réservez un voyage',
                desc: 'Chaque réservation payée vous rapporte des points',
              },
              {
                icon: <CreditCard sx={{ fontSize: 36, color: T.amber }} />,
                title: '1 point = 10 EUR',
                desc: 'Le calcul est automatique après chaque paiement confirmé',
              },
              {
                icon: <GpsFixed sx={{ fontSize: 36, color: '#7C3AED' }} />,
                title: 'Utilisez vos points',
                desc: 'Appliquez une offre lors du checkout pour obtenir une réduction',
              },
            ].map((step, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center' }}>{step.icon}</Box>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: T.ink, mb: 0.5 }}>{step.title}</Typography>
                  <Typography sx={{ fontSize: 13, color: T.slate }}>{step.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

      </Box>
    </Page>
  );
};

export default LoyaltyOffersPage;