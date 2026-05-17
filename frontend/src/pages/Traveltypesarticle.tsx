import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, Container, Grid, Button } from '@mui/material';
import { styled, alpha, keyframes } from '@mui/material/styles';
import {
  Terrain, AccountBalance, BeachAccess, WbSunny,
  Restaurant, Spa, ArrowForward, Check,
} from '@mui/icons-material';

// ─── Keyframes ───────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

// ─── Types ───────────────────────────────────────────────
interface Activity {
  title: string;
  description: string;
  image: string;
  
  location: string;
}

interface TravelType {
  id: string;
  label: string;
  icon: React.ReactNode;
  accent: string;
  heroImage: string;
  tagline: string;
  description: string[];
  activities: Activity[];
  highlights: string[];
}

// ─── North Africa Data ───────────────────────────────────
const TYPES: TravelType[] = [
  {
    id: 'aventure',
    label: 'Aventure & Randonnée',
    icon: <Terrain />,
    accent: '#16A34A',
    heroImage: 'https://images.unsplash.com/photo-1489493887464-892be6d1daae?w=1400&q=80',
    tagline: 'Des dunes du Sahara aux sommets de l\'Atlas, l\'Afrique du Nord vous défie',
    description: [
      "L'Afrique du Nord est un terrain d'aventure exceptionnel. Entre les massifs enneigés du Haut-Atlas marocain, les gorges vertigineuses du Djurdjura algérien et les dunes monumentales du Grand Erg Oriental, chaque pas révèle un paysage nouveau.",
      "Du Jebel Chaambi tunisien aux falaises de Tassili n'Ajjer, nos itinéraires de randonnée vous emmènent là où les guides locaux berbères transmettent leurs secrets de génération en génération.",
    ],
    activities: [
      {
        title: 'Traversée du Haut-Atlas',
        description: "Marrakech → Imlil → Toubkal (4 167 m) — gravissez le toit de l'Afrique du Nord avec des guides berbères. Villages d'amandiers en fleurs et panoramas jusqu'au Sahara.",
        image: 'https://i.pinimg.com/736x/7a/41/6f/7a416f36cd504b0b29d03aea4adb84ff.jpg',
        location: 'Maroc',
      },
      {
        title: 'Gorges de Todgha & Dadès',
        description: "Escalade et randonnée dans les gorges les plus spectaculaires du Maroc. Les parois de 300 mètres encadrent un chemin en surplomb au-dessus de la rivière.",
        image: 'https://i.pinimg.com/736x/56/55/91/565591c8d58fbc5b6a0a5822215a70a7.jpg',
        location: 'Maroc',
      },
      {
        title: 'Jebel Chaambi & Tinja',
        description: "Le point culminant de la Tunisie (1 544 m) offre des randonnées dans une forêt de pins et de chênes liège. Bivouacs sous les étoiles de la dorsale tunisienne.",
        image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
        location: 'Tunisie',
      },
    ],
    highlights: ['Guides berbères certifiés', 'Mulets pour les bagages', 'Bivouacs en altitude', 'Petits groupes ≤ 10 pers.'],
  },

  {
    id: 'culturel',
    label: 'Culturel & Historique',
    icon: <AccountBalance />,
    accent: '#7C3AED',
    heroImage: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1400&q=80',
    tagline: 'Carthage, Rome, Islam — trois mille ans d\'histoire à portée de regard',
    description: [
      "L'Afrique du Nord est un carrefour de civilisations unique au monde. Phéniciens, Romains, Berbères, Arabes, Ottomans — chaque empire a laissé sa trace dans la pierre, les villes et les traditions vivantes.",
      "De la médina de Fès classée UNESCO aux ruines de Timgad, des mosaïques romaines du Bardo aux ksour troglodytes du Sud tunisien, nos voyages culturels sont une plongée dans l'âme profonde du Maghreb.",
    ],
    activities: [
      {
        title: 'Carthage & Tunis Antique',
        description: "Musée du Bardo (plus grande collection de mosaïques romaines au monde), site de Carthage, Utique, Dougga — parcourez 3 000 ans d'histoire avec un archéologue.",
        image: 'https://i.pinimg.com/736x/05/73/0e/05730e81012737f248a4cb2812fc026b.jpg',
       
        location: 'Tunisie',
      },
      {
        title: 'Médinas du Maroc',
        description: "Fès el-Bali (XIe siècle), Chefchaouen la bleue, Meknès impériale — les médinas marocaines sont des villes-musées vivantes où l'artisanat médiéval perdure.",
        image: 'https://i.pinimg.com/1200x/3e/94/19/3e94199827d1717a12f4f5bd084cd035.jpg',
       
        location: 'Maroc',
      },
      {
        title: 'Tassili n\'Ajjer & Hoggar',
        description: "Le plateau du Tassili abrite plus de 15 000 peintures rupestres néolithiques — l'un des plus grands musées à ciel ouvert de l'humanité. Patrimoine UNESCO en plein désert.",
        image: 'https://i.pinimg.com/736x/97/cd/95/97cd95dcf0f0625f9d5b45a5f303f3a1.jpg',
        location: 'Algérie',
      },
    ],
    highlights: ['Archéologues accompagnateurs', 'Accès aux sites fermés au public', 'Visites de maisons privées', 'Artisans & maîtres de métiers'],
  },

  {
    id: 'plage',
    label: 'Plage & Relaxation',
    icon: <BeachAccess />,
    accent: '#0EA5E9',
    heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=80',
    tagline: 'Méditerranée et Atlantique — deux mers, un littoral sans fin',
    description: [
      "Des côtes turquoise de Hammamet aux falaises dorées de Dakhla, l'Afrique du Nord dispose de milliers de kilomètres de rivage parmi les plus beaux et les moins fréquentés du bassin méditerranéen.",
      "Stations balnéaires historiques, criques secrètes, kitesurf sur l'Atlantique ou plongée dans les eaux de Tabarka — le bord de mer nord-africain réserve des trésors pour chaque type de voyageur.",
    ],
    activities: [
      {
        title: 'Hammamet & Cap Bon',
        description: "Médina blanche et bleue, plages de sable fin, jasmin en fleurs — Hammamet est la perle balnéaire de la Tunisie. Le Cap Bon révèle des calanques sauvages hors des sentiers.",
        image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80',
        location: 'Tunisie',
      },
      {
        title: 'Dakhla Kitesurf & Lagune',
        description: "Le lagon de Dakhla est considéré comme l'un des 5 meilleurs spots de kitesurf au monde. Eau plate, vent régulier, dunes de sable juste derrière — un rêve pour riders et novices.",
        image: 'https://i.pinimg.com/736x/e4/7b/6a/e47b6a292c3e7d150eeca67225f9b5bf.jpg',
        location: 'Maroc',
      },
      {
        title: 'Côte d\'Azur Algéroise',
        description: "Les plages de Tipaza, Zéralda et les calanques de la Corniche d'Alger offrent une Méditerranée préservée. Ruines romaines les pieds dans l'eau à Tipaza.",
        image: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=800&q=80',
        location: 'Algérie',
      },
    ],
    highlights: ['Riads & hôtels bord de mer', 'Équipement nautique fourni', 'Transferts privés', 'Excursions côtières incluses'],
  },

  {
    id: 'desert',
    label: 'Désert & Safari',
    icon: <WbSunny />,
    accent: '#D97706',
    heroImage: 'https://i.pinimg.com/1200x/1d/77/3a/1d773a48fff8b9ad4e324297786bc43d.jpg',
    tagline: 'Le Grand Erg, les ksour et les nuits sous les étoiles sahariennes',
    description: [
      "Le Sahara représente plus d'un tiers de l'Afrique du Nord. Ses ergs monumentaux — Grand Erg Oriental, Grand Erg Occidental, Erg Chebbi — sont parmi les paysages les plus saisissants de la planète.",
      "Nomades touaregs, caravanes de dromadaires, ksour fortifiés, oasis cachées — le désert nord-africain n'est pas un vide, c'est un monde entier avec ses codes, ses routes et ses étoiles.",
    ],
    activities: [
      {
        title: 'Erg Chebbi & Merzouga',
        description: "Les dunes de Merzouga atteignent 150 mètres. Traversée à dos de dromadaire au coucher du soleil, bivouac nomade sous les étoiles, réveil au lever du soleil sur les crêtes dorées.",
        image: 'https://i.pinimg.com/736x/fa/ee/f5/faeef58bf35661d1baf3f0cb17bddbf2.jpg',
        location: 'Maroc',
      },
      {
        title: 'Ksour du Sud Tunisien',
        description: "Matmata (villages troglodytes), Ksar Hadada, Douiret, Chenini — les ksour berbères accrochés aux falaises du Dahar sont les décors naturels de Star Wars. Un autre monde.",
        image: 'https://i.pinimg.com/1200x/d0/ee/a6/d0eea6bab4b09b1797b17d48bae28432.jpg',
        location: 'Tunisie',
      },
      {
        title: 'Tassili & Grand Erg Oriental',
        description: "L'Erg de l'Issaouane et le plateau du Tassili en 4x4 avec des guides touaregs. Dunes, roches sculptées par le vent, sources d'eau dans le désert — le Sahara profond.",
        image: 'https://i.pinimg.com/736x/a5/02/9a/a5029a21754784022ba39f1ecdf87e29.jpg',
        location: 'Algérie',
      },
    ],
    highlights: ['4x4 Land Cruiser privatif', 'Guides touaregs & berbères', 'Bivouacs sous les étoiles', 'Caravanes de dromadaires'],
  },

  {
    id: 'gastro',
    label: 'Gastronomie',
    icon: <Restaurant />,
    accent: '#DC2626',
    heroImage: 'https://i.pinimg.com/1200x/7e/d8/20/7ed820e5c480f310ca0096fbcb13ea85.jpg',
    tagline: 'Tajine, couscous, brik, harissa — la cuisine du Maghreb dévoile ses secrets',
    description: [
      "La gastronomie nord-africaine est l'une des plus riches et des plus complexes du monde méditerranéen. Épices d'Orient, herbes du Maghreb, influences andalouses et berbères se mêlent dans des recettes millénaires.",
      "Marchés d'épices de la médina, cours de cuisine dans des demeures ancestrales, dîners chez l'habitant, distilleries d'eau de rose — nos voyages gastronomiques révèlent l'âme culinaire du Maghreb.",
    ],
    activities: [
      {
        title: 'Saveurs de Tunis & Bizerte',
        description: "Marché Central de Tunis, Médina, lablabi matinal au souk, brik à l'œuf, makroud de Kairouan — un tour culinaire de la Tunisie avec une cheffe tunisoise passionnée.",
        image: 'https://i.pinimg.com/1200x/d1/3b/1f/d13b1f30eea93636fc4e233ee9e8a637.jpg',
        location: 'Tunisie',
      },
      {
        title: 'Route des Épices de Marrakech',
        description: "Djemaa el-Fna, souk des épices, Mellah juif, riad privé — apprenez le tajine d'agneau aux pruneaux et la pastilla au pigeon avec un maître cuisinier fassi.",
        image: 'https://i.pinimg.com/1200x/eb/5b/cc/eb5bcc7b24d1ba15e5c19b6fa34a0e6e.jpg',
        location: 'Maroc',
      },
      {
        title: 'Terroir Algérien & Vins de Médéa',
        description: "La région de Médéa et Mascara produit certains des meilleurs vins d'Afrique du Nord. Visite de domaines, dégustation de chorba et de méchoui, secrets de la cuisine kabyle.",
        image: 'https://i.pinimg.com/736x/e5/ef/4e/e5ef4e3978be109f1ff717a28545721f.jpg',
        location: 'Algérie',
      },
    ],
    highlights: ['Chefs & cuisinières locales', 'Cours de cuisine inclus', 'Visites de marchés & producteurs', 'Dîners chez l\'habitant'],
  },

  {
    id: 'wellness',
    label: 'Wellness & Spa',
    icon: <Spa />,
    accent: '#0EA5A0',
    heroImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1400&q=80',
    tagline: 'Le hammam, la thalasso et le silence du désert pour une renaissance totale',
    description: [
      "Le Maghreb a inventé l'art du soin du corps bien avant les spas modernes. Le hammam traditionnel, rituel social et purificateur, la ghassoul du Moyen-Atlas, le savon beldi aromatique — une cosmétique ancestrale au service du bien-être contemporain.",
      "Des thalassos de Hammamet aux retraites de silence dans les oasis sahariennes, l'Afrique du Nord offre des expériences wellness d'une profondeur rare, ancrées dans des traditions thérapeutiques millénaires.",
    ],
    activities: [
      {
        title: 'Thalasso de Hammamet',
        description: "Les instituts thalassothérapiques de Hammamet utilisent les eaux de la Méditerranée et les boues marines pour des soins réputés dans tout le monde arabe. Cure de 5 jours revitalisante.",
        image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80',
        location: 'Tunisie',
      },
      {
        title: 'Riads Spa de Marrakech',
        description: "Hammam à la vapeur de menthe, massage à l'huile d'argan, gommage au savon beldi, masque à la ghassoul — les riads-spas de la médina de Marrakech sont un luxe discret et enveloppant.",
        image: 'https://i.pinimg.com/736x/0f/d9/bd/0fd9bdaf94f0c4feb34c5398940cce51.jpg',
        location: 'Maroc',
      },
      {
        title: 'Silence & Détox Saharienne',
        description: "Une retraite de silence dans une oasis du Sud tunisien ou marocain. Yoga au lever du soleil face aux dunes, jeûne intermittent, bains de sable chaud — une remise à zéro totale.",
        image: 'https://i.pinimg.com/736x/1c/a3/0f/1ca30f4e03debaf690c1102c98291794.jpg',
        location: 'Tunisie / Maroc',
      },
    ],
    highlights: ['Hammam & soins traditionnels', 'Produits naturels du Maghreb', 'Thérapeutes certifiés', 'Cuisines détox & locales'],
  },
];

// ─── Styled ──────────────────────────────────────────────
const TypeTab = styled(Box, {
  shouldForwardProp: p => p !== 'active' && p !== 'accent',
})<{ active?: boolean; accent?: string }>(({ active, accent }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '9px 18px',
  borderRadius: 40,
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 13.5,
  whiteSpace: 'nowrap',
  transition: 'all 0.2s ease',
  border: `1.5px solid ${active ? accent : 'transparent'}`,
  backgroundColor: active ? alpha(accent!, 0.08) : 'transparent',
  color: active ? accent : '#64748B',
  '&:hover': { backgroundColor: alpha(accent!, 0.06), color: accent },
}));

const ActivityCard = styled(Box)({
  borderRadius: 16,
  overflow: 'hidden',
  border: '1px solid #E2E8F0',
  backgroundColor: '#fff',
  transition: 'all 0.25s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 16px 48px rgba(0,0,0,0.1)',
    '& .card-img': { transform: 'scale(1.06)' },
  },
  '& .card-img': { transition: 'transform 0.4s ease' },
});

// ─── Component ───────────────────────────────────────────
const TravelTypesArticle: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [active, setActive] = useState(searchParams.get('type') || 'aventure');
  const [animKey, setAnimKey] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  const typeParam = searchParams.get('type');
  const validType = typeParam && TYPES.some(t => t.id === typeParam) ? typeParam : 'aventure';
  const current = TYPES.find(t => t.id === validType) || TYPES[0];

  useEffect(() => {
    const param = searchParams.get('type');
    if (param && param !== active && TYPES.some(t => t.id === param)) {
      setActive(param);
      setAnimKey(k => k + 1);
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [searchParams, active]);

  if (!current) {
    return null;
  }

  const handleSelect = (id: string) => {
    if (id === active) return;
    setActive(id);
    setAnimKey(k => k + 1);
    setSearchParams({ type: id });
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  return (
    <Box sx={{ bgcolor: '#FAFAF8', minHeight: '100vh', fontFamily: "'Georgia', 'Times New Roman', serif" }}>

      {/* ── Page header ──────────────────────────── */}
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #E2E8F0', py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ width: 3, height: 28, borderRadius: 2, bgcolor: current.accent, transition: 'background 0.3s' }} />
            <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748B', fontFamily: 'sans-serif' }}>
              Afrique du Nord
            </Typography>
          </Box>
          <Typography sx={{ fontSize: { xs: 26, md: 40 }, fontWeight: 700, color: '#0F172A', lineHeight: 1.15, mb: 1.5 }}>
            Nos types de voyages
          </Typography>
          <Typography sx={{ fontSize: 16, color: '#64748B', maxWidth: 580, lineHeight: 1.75 }}>
            Du Sahara aux côtes méditerranéennes, de l'Atlas aux médinas millénaires — choisissez l'aventure qui vous ressemble.
          </Typography>
        </Container>
      </Box>

      {/* ── Sticky tabs ──────────────────────────── */}
      <Box sx={{
        position: 'sticky', top: 0, zIndex: 100,
        bgcolor: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #E2E8F0',
        py: 1.5,
      }}>
        <Container maxWidth="lg">
          <Box sx={{
            display: 'flex', gap: 0.8, overflowX: 'auto',
            '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none',
          }}>
            {TYPES.map(t => (
              <TypeTab key={t.id} active={active === t.id} accent={t.accent} onClick={() => handleSelect(t.id)}>
                {t.icon}
                {t.label}
              </TypeTab>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── Content ──────────────────────────────── */}
      <Box ref={sectionRef}>

        {/* Hero */}
        <Box sx={{ height: { xs: 260, md: 440 }, overflow: 'hidden', position: 'relative' }} key={`hero-${animKey}`}>
          <Box
            component="img"
            src={current.heroImage}
            alt={current.label}
            className="card-img"
            sx={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              animation: `${fadeIn} 0.55s ease`,
            }}
          />
          {/* Overlay */}
          <Box sx={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(105deg, ${alpha('#000', 0.6)} 0%, ${alpha(current.accent, 0.35)} 50%, transparent 75%)`,
          }} />
          {/* Text */}
          <Container maxWidth="lg" sx={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', pb: { xs: 3, md: 5 } }}>
            <Box sx={{ animation: `${fadeUp} 0.5s ease` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
                <Box sx={{
                  width: 32, height: 32, borderRadius: '50%',
                  bgcolor: alpha(current.accent, 0.3), backdropFilter: 'blur(6px)',
                  border: `1px solid ${alpha('#fff', 0.3)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', '& svg': { fontSize: 16 },
                }}>
                  {current.icon}
                </Box>
                <Typography sx={{ color: alpha('#fff', 0.85), fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
                  {current.label}
                </Typography>
              </Box>
              <Typography sx={{
                fontSize: { xs: 18, md: 30 }, fontWeight: 700, color: '#fff',
                maxWidth: 580, lineHeight: 1.3,
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              }}>
                {current.tagline}
              </Typography>
            </Box>
          </Container>
        </Box>

        {/* Body */}
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>

          {/* Description + highlights */}
          <Grid container spacing={5} sx={{ mb: 7 }} key={`body-${animKey}`}>
            <Grid item xs={12} md={7} sx={{ animation: `${fadeUp} 0.5s ease 0.1s both` }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: current.accent, mb: 2, fontFamily: 'sans-serif' }}>
                À propos
              </Typography>
              {current.description.map((para, i) => (
                <Typography key={i} sx={{ fontSize: 16, lineHeight: 1.85, color: '#374151', mb: 2.5 }}>
                  {para}
                </Typography>
              ))}
            </Grid>

            <Grid item xs={12} md={5} sx={{ animation: `${fadeUp} 0.5s ease 0.2s both` }}>
              <Box sx={{
                p: 3, borderRadius: 3,
                bgcolor: alpha(current.accent, 0.04),
                border: `1px solid ${alpha(current.accent, 0.18)}`,
              }}>
                <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: current.accent, mb: 2.5, fontFamily: 'sans-serif' }}>
                  Ce qui est inclus
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {current.highlights.map((h, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                      <Box sx={{
                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                        bgcolor: alpha(current.accent, 0.12),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Check sx={{ fontSize: 12, color: current.accent }} />
                      </Box>
                      <Typography sx={{ fontSize: 14, color: '#374151', fontWeight: 500, fontFamily: 'sans-serif' }}>
                        {h}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Divider */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Box sx={{ flex: 1, height: 1, bgcolor: '#E2E8F0' }} />
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: current.accent }} />
            <Box sx={{ flex: 1, height: 1, bgcolor: '#E2E8F0' }} />
          </Box>

          {/* Activities */}
          <Box key={`acts-${animKey}`}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: current.accent, mb: 1, fontFamily: 'sans-serif' }}>
              Nos expériences
            </Typography>
            <Typography sx={{ fontSize: { xs: 22, md: 30 }, fontWeight: 700, color: '#0F172A', mb: 4, lineHeight: 1.2 }}>
              {current.label} en Afrique du Nord
            </Typography>

            <Grid container spacing={3}>
              {current.activities.map((act, i) => (
                <Grid item xs={12} md={4} key={act.title}
                  sx={{ animation: `${fadeUp} 0.5s ease ${0.05 + i * 0.1}s both` }}
                >
                  <ActivityCard>
                    {/* Image */}
                    <Box sx={{ height: 210, overflow: 'hidden', position: 'relative' }}>
                      <Box
                        component="img"
                        src={act.image}
                        alt={act.title}
                        className="card-img"
                        sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                      {/* Country badge */}
                      <Box sx={{
                        position: 'absolute', top: 10, left: 10,
                        px: 1.5, py: 0.4, borderRadius: 20,
                        bgcolor: alpha(current.accent, 0.88),
                        backdropFilter: 'blur(4px)',
                      }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: 'sans-serif' }}>
                          {act.location}
                        </Typography>
                      </Box>
                      
                    </Box>

                    {/* Body */}
                    <Box sx={{ p: 2.5 }}>
                      <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#0F172A', mb: 1, lineHeight: 1.35 }}>
                        {act.title}
                      </Typography>
                      <Typography sx={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.7 }}>
                        {act.description}
                      </Typography>
                    </Box>
                  </ActivityCard>
                </Grid>
              ))}
            </Grid>
          </Box>

        </Container>
      </Box>
    </Box>
  );
};

export default TravelTypesArticle;