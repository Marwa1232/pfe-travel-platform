import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { favoriteAPI, fixImageUrl } from '../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface TripImage {
  url: string;
  is_cover: boolean;
}

interface TripDestination {
  id: number;
  name: string;
  country?: string;
}

interface TripCategory {
  id: number;
  name: string;
}

interface TripOrganizer {
  id: number;
  agency_name?: string;
  agencyName?: string;
}

interface Trip {
  id: number;
  title: string;
  short_description?: string;
  base_price: string | number;
  currency?: string;
  duration_days?: number;
  difficulty_level?: string;
  images?: TripImage[];
  cover_image?: string;
  destinations?: TripDestination[];
  categories?: TripCategory[];
  organizer?: TripOrganizer;
  avg_rating?: number;
  total_reviews?: number;
  agency_name?: string;
  destination?: string;
}

interface TripCard2Props {
  trip: Trip;
}

// ─── Placeholders ─────────────────────────────────────────────────────────────
const PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=70',
  'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=70',
  'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=70',
  'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=600&q=70',
];

const getPlaceholder = (id: number) => PLACEHOLDERS[id % PLACEHOLDERS.length];

// ─── Component ────────────────────────────────────────────────────────────────
const TripCard2: React.FC<TripCard2Props> = ({ trip }) => {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  // ── Cover image ──────────────────────────────────────────────────────────────
  const coverImg = (() => {
    if (trip.images && trip.images.length > 0) {
      const cover = trip.images.find(img => img.is_cover);
      return fixImageUrl((cover || trip.images[0]).url);
    }
    if (trip.cover_image) return fixImageUrl(trip.cover_image);
    return getPlaceholder(trip.id);
  })();

  // ── Destinations ─────────────────────────────────────────────────────────────
  const destinations: string[] = (() => {
    if (trip.destinations && trip.destinations.length > 0)
      return trip.destinations.map(d => d.name);
    if (trip.destination) return [trip.destination];
    return [];
  })();

  // ── Categories ────────────────────────────────────────────────────────────────
  const categories = trip.categories?.map(c => c.name) || [];

  // ── Agency ───────────────────────────────────────────────────────────────────
  const agencyName =
    trip.agency_name ||
    trip.organizer?.agency_name ||
    trip.organizer?.agencyName ||
    null;

  // ── Price ─────────────────────────────────────────────────────────────────────
  const price = parseFloat(String(trip.base_price)) || 0;
  const currency = trip.currency || 'TND';

  // ── Rating ───────────────────────────────────────────────────────────────────
  const rating = trip.avg_rating ?? null;
  const reviewCount = trip.total_reviews ?? 0;

  // ── Favorite ─────────────────────────────────────────────────────────────────
  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await favoriteAPI.toggle(trip.id);
    } catch { /* optimistic */ }
    setSaved(prev => !prev);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      style={s.card}
      onClick={() => navigate(`/trips/${trip.id}`)}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 36px rgba(0,0,0,0.14)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {/* ══════════════════════════════════════════════════
          LEFT — image cover
      ══════════════════════════════════════════════════ */}
      <div style={s.imageCol}>
        <div style={s.mainImgWrap}>
          <img src={coverImg} alt={trip.title} style={s.mainImg} />
          <div style={s.imgGradient} />

          {/* Heart button */}
          <button
            style={{ ...s.heartBtn, ...(saved ? s.heartSaved : {}) }}
            onClick={handleFavorite}
            aria-label="Sauvegarder"
          >
            <svg
              width="16" height="16" viewBox="0 0 24 24"
              fill={saved ? '#e74c3c' : 'none'}
              stroke={saved ? '#e74c3c' : '#555'}
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>

          {/* Difficulty badge */}
          {trip.difficulty_level && (
            <span style={{
              ...s.diffBadge,
              background:
                trip.difficulty_level === 'easy' ? '#0d6b3a'
                : trip.difficulty_level === 'hard' ? '#dc2626'
                : '#d97706',
            }}>
              {trip.difficulty_level}
            </span>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          CENTER — info
      ══════════════════════════════════════════════════ */}
      <div style={s.infoCol}>

        {/* Category badges */}
        {categories.length > 0 && (
          <div style={s.catsRow}>
            {categories.slice(0, 2).map(c => (
              <span key={c} style={s.catBadge}>{c}</span>
            ))}
          </div>
        )}

        <h2 style={s.title}>{trip.title}</h2>

        {/* Rating */}
        <div style={s.ratingRow}>
          {rating !== null ? (
            <>
              {[1, 2, 3, 4, 5].map(star => (
                <svg key={star} width="14" height="14" viewBox="0 0 24 24"
                  fill={star <= Math.round(rating) ? '#E8A020' : '#ddd'}
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
              <span style={s.ratingNum}>{rating.toFixed(1)}</span>
              <span style={s.ratingCount}>({reviewCount} avis)</span>
            </>
          ) : (
            <span style={{ fontSize: 12, color: '#bbb' }}>Aucun avis</span>
          )}
        </div>

        {/* Short description — clampée à 2 lignes, overflow hidden */}
        {trip.short_description && (
          <p style={s.desc}>{trip.short_description}</p>
        )}

        <div style={s.divider} />

        {/* Details table */}
        <table style={s.table}>
          <tbody>
            {trip.duration_days != null && (
              <tr>
                <td style={s.tdLabel}>Durée</td>
                <td style={s.tdValue}>{trip.duration_days} jours</td>
              </tr>
            )}
            {destinations.length > 0 && (
              <tr>
                <td style={s.tdLabel}>Destinations</td>
                <td style={s.tdValue}>
                  {/* Max 2 destinations affichées pour garder la hauteur fixe */}
                  {destinations.slice(0, 2).join(', ')}
                  {destinations.length > 2 && (
                    <span style={s.moreTag}> +{destinations.length - 2}</span>
                  )}
                </td>
              </tr>
            )}
            {agencyName && (
              <tr>
                <td style={s.tdLabel}>Organisateur</td>
                <td style={s.tdValue}>
                  <span style={s.agencyRow}>
                    <span style={s.agencyAvatar}>
                      {agencyName.charAt(0).toUpperCase()}
                    </span>
                    <span style={s.agencyName}>{agencyName}</span>
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ══════════════════════════════════════════════════
          RIGHT — prix + boutons
      ══════════════════════════════════════════════════ */}
      <div style={s.priceCol} onClick={e => e.stopPropagation()}>

        <div style={s.priceBlock}>
          <div style={s.fromLabel}>À partir de</div>
          <div style={s.priceNow}>
            <span style={s.amount}>{price.toLocaleString('fr-TN')}</span>
            <span style={s.currency}> {currency}</span>
          </div>
          <div style={s.perPerson}>par personne</div>
        </div>

        <div style={s.actions}>
          <button
            style={s.btnPrimary}
            onClick={() => navigate(`/trips/${trip.id}`)}
          >
            Voir le voyage
          </button>
          <button
            style={s.btnSecondary}
            onClick={() => navigate(`/trips/${trip.id}#booking`)}
          >
            Réserver
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripCard2;

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_HEIGHT = 250; // hauteur fixe en px — change ici pour tout ajuster

const s: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    background: '#fff',
    borderRadius: 16,
    border: '1px solid #e8e8e8',
    overflow: 'hidden',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    width: '100%',
    height: CARD_HEIGHT,           // ← HAUTEUR FIXE
    minHeight: CARD_HEIGHT,
    maxHeight: CARD_HEIGHT,
    cursor: 'pointer',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    transition: 'box-shadow 0.25s ease, transform 0.25s ease',
    alignItems: 'stretch',         // ← les colonnes prennent toute la hauteur
  },

  // ── Image col ──
  imageCol: {
    width: 180,
    flexShrink: 0,
    overflow: 'hidden',
  },
  mainImgWrap: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  mainImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  imgGradient: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.28) 100%)',
    pointerEvents: 'none',
  },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.92)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
    flexShrink: 0,
  },
  heartSaved: { background: '#fff0f0' },
  diffBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    color: '#fff',
    fontSize: 10,
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: 10,
    textTransform: 'capitalize',
  },

  // ── Info col ──
  infoCol: {
    flex: 1,
    padding: '14px 18px',
    borderRight: '1px solid #f0f0f0',
    minWidth: 0,
    overflow: 'hidden',            // ← empêche le débordement vertical
    display: 'flex',
    flexDirection: 'column',
  },
  catsRow: {
    display: 'flex',
    gap: 5,
    marginBottom: 6,
    flexWrap: 'nowrap',
    overflow: 'hidden',
  },
  catBadge: {
    display: 'inline-block',
    padding: '2px 9px',
    borderRadius: 20,
    border: '1px solid #ddd',
    fontSize: 10,
    color: '#555',
    whiteSpace: 'nowrap',
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: '#111',
    margin: '0 0 5px',
    lineHeight: 1.3,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  } as React.CSSProperties,
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    marginBottom: 6,
    flexShrink: 0,
  },
  ratingNum: {
    fontWeight: 600,
    fontSize: 12,
    color: '#222',
    marginLeft: 3,
  },
  ratingCount: {
    fontSize: 11,
    color: '#888',
    marginLeft: 2,
  },
  // Description clampée strictement à 2 lignes
  desc: {
    fontSize: 12,
    color: '#555',
    lineHeight: 1.5,
    margin: '0 0 6px',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    flexShrink: 0,
  } as React.CSSProperties,
  divider: {
    height: '0.5px',
    background: '#eee',
    margin: '6px 0',
    flexShrink: 0,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 12,
    overflow: 'hidden',
  },
  tdLabel: {
    fontWeight: 600,
    color: '#111',
    padding: '3px 14px 3px 0',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
    width: '38%',
  },
  tdValue: {
    color: '#444',
    padding: '3px 0',
    lineHeight: 1.4,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 0,             // force l'ellipsis dans le tableau
  },
  moreTag: {
    display: 'inline-block',
    background: '#f0f0f0',
    color: '#555',
    fontSize: 10,
    borderRadius: 6,
    padding: '1px 5px',
    marginLeft: 3,
    fontWeight: 600,
  },
  agencyRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    overflow: 'hidden',
  },
  agencyAvatar: {
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: '#0d6b3a',
    color: '#fff',
    fontSize: 9,
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  agencyName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  // ── Price col ──
  priceCol: {
    width: 170,
    flexShrink: 0,
    padding: '14px 14px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  priceBlock: {
    flexShrink: 0,
  },
  fromLabel: {
    fontSize: 10,
    color: '#888',
    marginBottom: 2,
  },
  priceNow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 2,
    flexWrap: 'wrap',
  },
  amount: {
    fontSize: 22,
    fontWeight: 700,
    color: '#111',
    lineHeight: 1,
  },
  currency: {
    fontSize: 12,
    fontWeight: 600,
    color: '#555',
  },
  perPerson: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
    flexShrink: 0,
  },
  btnPrimary: {
    background: '#1e40af',
    color: '#fff',
    border: 'none',
    borderRadius: 24,
    padding: '9px 0',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
  },
  btnSecondary: {
    background: '#e0e7ff',
    color: '#1e40af',
    border: 'none',
    borderRadius: 24,
    padding: '9px 0',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
  },
};