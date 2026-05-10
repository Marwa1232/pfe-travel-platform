import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box, Typography, Grid, Card, CardContent, CardActions,
  Button, Chip, CircularProgress, Alert, LinearProgress,
  Avatar, Divider, Fade, Zoom,
} from '@mui/material';
import { alpha, styled, keyframes } from '@mui/material/styles';
import {
  EmojiEvents, LocalOffer, FlightTakeoff, Lock,
  CheckCircle, ArrowForward, Stars, CreditCard,
  GpsFixed, WorkspacePremium, LightbulbOutlined,
  TrendingUp, TrendingDown,
} from '@mui/icons-material';
import { loyaltyAPI, tripAPI } from '../services/api';
import { RootState } from '../store';

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

const Page = styled(Box)({
  minHeight: '100vh',
  backgroundColor: alpha(COLORS.navy, 0.02),
  paddingTop: 88,
  paddingBottom: 64,
});

const GradientButton = styled(Button)({
  background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navy})`,
  borderRadius: 10,
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.85rem',
  color: COLORS.white,
  '&:hover': {
    background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.teal})`,
    transform: 'translateY(-1px)',
  },
});

const OutlineButton = styled(Button)({
  borderRadius: 10,
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.85rem',
  borderColor: COLORS.teal,
  color: COLORS.teal,
  '&:hover': {
    borderColor: COLORS.navy,
    backgroundColor: alpha(COLORS.teal, 0.05),
  },
});

const getPointsLevel = (points: number) => {
  if (points >= 500) return { name: 'Platine', color: COLORS.amber, next: null };
  if (points >= 200) return { name: 'Or',      color: COLORS.amber, next: 500 };
  if (points >= 100) return { name: 'Argent',  color: COLORS.navy,  next: 200 };
  if (points >= 50)  return { name: 'Bronze',  color: COLORS.teal,  next: 100 };
  return                    { name: 'Débutant', color: COLORS.navy, next: 50 };
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
      const oRes = await loyaltyAPI.getOffers();
      setOffers(oRes.data.offers || []);

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

  const usableOffers = offers.filter(o => o.can_use);
  const lockedOffers = offers.filter(o => !o.can_use);

  if (loading) return (
    <Page sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress size={40} sx={{ color: COLORS.teal }} />
    </Page>
  );

  return (
    <Page>
      <Box maxWidth={1100} mx="auto" px={{ xs: 2, md: 4 }}>

        {/* ── Hero header ── */}
        <Fade in timeout={500}>
          <Box sx={{ textAlign: 'center', mb: 6, animation: `${fadeUp} 0.5s ease` }}>
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 80, height: 80, borderRadius: 2,
              background: `linear-gradient(135deg, ${COLORS.amber}, ${COLORS.navy})`,
              boxShadow: `0 12px 32px ${alpha(COLORS.amber, 0.35)}`,
              mb: 3,
            }}>
              <EmojiEvents sx={{ fontSize: 40, color: COLORS.white }} />
            </Box>
            <Typography sx={{ fontSize: { xs: 32, md: 42 }, fontWeight: 800, color: COLORS.navy, letterSpacing: '-0.02em', mb: 1.5 }}>
              Offres Fidélité
            </Typography>
            <Typography sx={{ fontSize: 16, color: alpha(COLORS.navy, 0.6), maxWidth: 520, mx: 'auto' }}>
              Utilisez vos points pour débloquer des réductions exclusives sur vos prochains voyages
            </Typography>
          </Box>
        </Fade>

        {/* ── Carte points utilisateur ── */}
        {token && points ? (
          <Zoom in timeout={600}>
            <Card sx={{
              mb: 5, borderRadius: 2, border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
              boxShadow: `0 8px 32px ${alpha(COLORS.navy, 0.08)}`,
              overflow: 'hidden',
            }}>
              <Box sx={{
                background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.teal} 100%)`,
                p: 3,
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: 13, color: alpha(COLORS.white, 0.7), mb: 0.5 }}>
                      Vos points disponibles
                    </Typography>
                    <Typography sx={{ fontSize: 48, fontWeight: 800, color: COLORS.white, lineHeight: 1 }}>
                      {availPts}
                      <Typography component="span" sx={{ fontSize: 16, fontWeight: 500, color: alpha(COLORS.white, 0.7), ml: 1 }}>
                        pts
                      </Typography>
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Chip
                      label={level?.name}
                      icon={<WorkspacePremium sx={{ fontSize: '16px !important', color: `${COLORS.white} !important` }} />}
                      sx={{
                        bgcolor: alpha(COLORS.white, 0.15),
                        color: COLORS.white,
                        fontWeight: 700,
                        fontSize: 13,
                        height: 32,
                        borderRadius: 8,
                        border: `1px solid ${alpha(COLORS.white, 0.25)}`,
                      }}
                    />
                    <Typography sx={{ fontSize: 12, color: alpha(COLORS.white, 0.6), mt: 1 }}>
                      {points.total_points} pts gagnés au total
                    </Typography>
                  </Box>
                </Box>

                {level?.next && (
                  <Box sx={{ mt: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontSize: 12, color: alpha(COLORS.white, 0.7) }}>
                        Progression vers le niveau suivant
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: COLORS.white, fontWeight: 600 }}>
                        {availPts} / {level.next} pts
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((availPts / level.next) * 100, 100)}
                      sx={{
                        height: 6,
                        borderRadius: 1,
                        bgcolor: alpha(COLORS.white, 0.15),
                        '& .MuiLinearProgress-bar': { bgcolor: COLORS.amber, borderRadius: 1 },
                      }}
                    />
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', p: 2, gap: 0 }}>
                {[
                  { label: 'Disponibles', value: points.available_points, color: COLORS.teal },
                  { label: 'Gagnés total', value: points.total_points, color: COLORS.amber },
                  { label: 'Utilisés', value: points.used_points, color: alpha(COLORS.navy, 0.5) },
                ].map((s, i) => (
                  <Box key={i} sx={{
                    textAlign: 'center',
                    py: 1.5,
                    borderRight: i < 2 ? `1px solid ${alpha(COLORS.teal, 0.15)}` : 'none',
                  }}>
                    <Typography sx={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</Typography>
                    <Typography sx={{ fontSize: 11, color: alpha(COLORS.navy, 0.6) }}>{s.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Card>
          </Zoom>
        ) : !token ? (
          <Fade in>
            <Alert
              severity="info"
              sx={{
                mb: 4,
                borderRadius: 2,
                bgcolor: alpha(COLORS.teal, 0.05),
                color: COLORS.navy,
                '& .MuiAlert-icon': { color: COLORS.teal },
              }}
              action={
                <GradientButton size="small" onClick={() => navigate('/login')}>
                  Se connecter
                </GradientButton>
              }
            >
              Connectez-vous pour voir vos points et utiliser les offres
            </Alert>
          </Fade>
        ) : null}

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: alpha(COLORS.amber, 0.05) }}>
            {error}
          </Alert>
        )}

        {offers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <LocalOffer sx={{ fontSize: 64, color: alpha(COLORS.navy, 0.2), mb: 2 }} />
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: COLORS.navy, mb: 1 }}>
              Aucune offre disponible pour le moment
            </Typography>
            <Typography sx={{ fontSize: 14, color: alpha(COLORS.navy, 0.6), mb: 4 }}>
              Les organisateurs n'ont pas encore créé d'offres fidélité
            </Typography>
            <GradientButton onClick={() => navigate('/trips')}>
              Découvrir les voyages
            </GradientButton>
          </Box>
        ) : (
          <>
            {/* ── Offres utilisables ── */}
            {usableOffers.length > 0 && (
              <Fade in timeout={700}>
                <Box sx={{ mb: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                   
                    <Typography sx={{ fontSize: 20, fontWeight: 700, color: COLORS.navy }}>
                      Offres disponibles pour vous
                    </Typography>
                   
                   
                  </Box>

                  <Grid container spacing={3}>
                    {usableOffers.map((offer, idx) => (
                      <Grid item xs={12} sm={6} md={4} key={offer.id}>
                        <Zoom in timeout={700 + idx * 100}>
                          <Card sx={{
                            height: '100%',
                            borderRadius: 2,
                            border: `2px solid ${alpha(COLORS.teal, 0.3)}`,
                            boxShadow: `0 4px 20px ${alpha(COLORS.teal, 0.1)}`,
                            transition: 'all 0.3s ease',
                            cursor: 'default',
                            '&:hover': {
                              transform: 'translateY(-6px)',
                              boxShadow: `0 16px 40px ${alpha(COLORS.teal, 0.2)}`,
                              borderColor: COLORS.teal,
                            },
                          }}>
                            <CardContent sx={{ p: 3 }}>
                            

                              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 1 }}>
                                <Typography sx={{ fontSize: 44, fontWeight: 900, color: COLORS.amber, lineHeight: 1 }}>
                                  {offer.discount_type === 'percentage_discount'
                                    ? `-${offer.discount_value}%`
                                    : `-${offer.discount_value} EUR`}
                                </Typography>
                              </Box>

                              <Typography sx={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, mb: 1 }}>
                                {offer.title}
                              </Typography>

                              {offer.description && (
                                <Typography sx={{ fontSize: 13, color: alpha(COLORS.navy, 0.6), mb: 2, lineHeight: 1.5 }}>
                                  {offer.description}
                                </Typography>
                              )}

                              <Divider sx={{ my: 2, borderColor: alpha(COLORS.teal, 0.1) }} />

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Stars sx={{ fontSize: 18, color: COLORS.amber }} />
                                <Typography sx={{ fontSize: 14, fontWeight: 700, color: COLORS.amber }}>
                                  {offer.points_required} points requis
                                </Typography>
                              </Box>

                              {offer.expires_at && (
                                <Typography sx={{ fontSize: 11, color: alpha(COLORS.navy, 0.5), mt: 1 }}>
                                  Expire le {offer.expires_at}
                                </Typography>
                              )}
                            </CardContent>
                            <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
                              <GradientButton
                                fullWidth
                                endIcon={<ArrowForward />}
                                onClick={() => navigate('/trips')}
                              >
                                Réserver et utiliser
                              </GradientButton>
                            </CardActions>
                          </Card>
                        </Zoom>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Fade>
            )}

            {/* ── Offres verrouillées ── */}
            {lockedOffers.length > 0 && (
              <Fade in timeout={800}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Lock sx={{ color: alpha(COLORS.navy, 0.5), fontSize: 22 }} />
                    <Typography sx={{ fontSize: 20, fontWeight: 700, color: COLORS.navy }}>
                      Encore quelques points…
                    </Typography>
                    <Chip
                      label={lockedOffers.length}
                      size="small"
                      sx={{
                        bgcolor: alpha(COLORS.navy, 0.08),
                        color: COLORS.navy,
                        fontWeight: 700,
                        borderRadius: 2,
                      }}
                    />
                  </Box>

                  <Grid container spacing={3}>
                    {lockedOffers.map((offer, idx) => {
                      const missing = offer.points_required - availPts;
                      const prog    = token ? Math.min((availPts / offer.points_required) * 100, 100) : 0;
                      return (
                        <Grid item xs={12} sm={6} md={4} key={offer.id}>
                          <Zoom in timeout={800 + idx * 100}>
                            <Card sx={{
                              height: '100%',
                              borderRadius: 16,
                              border: `1px solid ${alpha(COLORS.navy, 0.1)}`,
                              boxShadow: 'none',
                              opacity: 0.85,
                              transition: 'all 0.3s ease',
                              '&:hover': { opacity: 1, transform: 'translateY(-4px)', boxShadow: `0 8px 24px ${alpha(COLORS.navy, 0.1)}` },
                            }}>
                              <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                  <Lock sx={{ fontSize: 16, color: alpha(COLORS.navy, 0.4) }} />
                                  <Chip
                                    label={`Il vous manque ${missing} pts`}
                                    size="small"
                                    sx={{
                                      bgcolor: alpha(COLORS.amber, 0.1),
                                      color: COLORS.amber,
                                      fontWeight: 600,
                                      fontSize: 10,
                                      borderRadius: 6,
                                    }}
                                  />
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 1 }}>
                                  <Typography sx={{ fontSize: 44, fontWeight: 900, color: alpha(COLORS.navy, 0.4), lineHeight: 1 }}>
                                    {offer.discount_type === 'percentage_discount'
                                      ? `-${offer.discount_value}%`
                                      : `-${offer.discount_value} EUR`}
                                  </Typography>
                                </Box>

                                <Typography sx={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, mb: 1 }}>
                                  {offer.title}
                                </Typography>

                                {offer.description && (
                                  <Typography sx={{ fontSize: 13, color: alpha(COLORS.navy, 0.6), mb: 2, lineHeight: 1.5 }}>
                                    {offer.description}
                                  </Typography>
                                )}

                                <Divider sx={{ my: 2, borderColor: alpha(COLORS.navy, 0.1) }} />

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                  <Stars sx={{ fontSize: 18, color: alpha(COLORS.navy, 0.5) }} />
                                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: alpha(COLORS.navy, 0.6) }}>
                                    {offer.points_required} points requis
                                  </Typography>
                                </Box>

                                {token && (
                                  <Box>
                                    <LinearProgress
                                      variant="determinate"
                                      value={prog}
                                      sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        bgcolor: alpha(COLORS.navy, 0.08),
                                        '& .MuiLinearProgress-bar': { bgcolor: COLORS.amber, borderRadius: 3 },
                                      }}
                                    />
                                    <Typography sx={{ fontSize: 10, color: alpha(COLORS.navy, 0.5), mt: 0.5 }}>
                                      {availPts} / {offer.points_required} pts
                                    </Typography>
                                  </Box>
                                )}

                                {offer.expires_at && (
                                  <Typography sx={{ fontSize: 11, color: alpha(COLORS.navy, 0.5), mt: 1 }}>
                                     Expire le {offer.expires_at}
                                  </Typography>
                                )}
                              </CardContent>
                              <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
                                <OutlineButton
                                  fullWidth
                                  endIcon={<FlightTakeoff />}
                                  onClick={() => navigate('/trips')}
                                >
                                  Gagner des points
                                </OutlineButton>
                              </CardActions>
                            </Card>
                          </Zoom>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              </Fade>
            )}
          </>
        )}

        {/* ── Section Comment gagner des points ── */}
        <Fade in timeout={900}>
          <Box sx={{
            mt: 8,
            p: 4,
            borderRadius: 20,
            bgcolor: alpha(COLORS.navy, 0.03),
            border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3 }}>
              <LightbulbOutlined sx={{ color: COLORS.amber, fontSize: 24 }} />
              <Typography sx={{ fontSize: 20, fontWeight: 700, color: COLORS.navy }}>
                Comment gagner des points ?
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {[
                {
                  icon: <FlightTakeoff sx={{ fontSize: 40, color: COLORS.teal }} />,
                  title: 'Réservez un voyage',
                  desc: 'Chaque réservation payée vous rapporte des points',
                },
                {
                  icon: <CreditCard sx={{ fontSize: 40, color: COLORS.amber }} />,
                  title: '1 point = 10 EUR',
                  desc: 'Le calcul est automatique après chaque paiement confirmé',
                },
                {
                  icon: <GpsFixed sx={{ fontSize: 40, color: COLORS.navy }} />,
                  title: 'Utilisez vos points',
                  desc: 'Appliquez une offre lors du checkout pour obtenir une réduction',
                },
              ].map((step, i) => (
                <Grid item xs={12} md={4} key={i}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>{step.icon}</Box>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, mb: 0.5 }}>
                      {step.title}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: alpha(COLORS.navy, 0.6) }}>{step.desc}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>

      </Box>
    </Page>
  );
};

export default LoyaltyOffersPage;