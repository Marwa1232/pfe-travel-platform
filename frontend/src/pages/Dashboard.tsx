import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Box, Button, Grid, Avatar,
  Chip, CircularProgress, LinearProgress, IconButton,
  Collapse, Divider, Tooltip,
} from '@mui/material';
import { styled, alpha, keyframes } from '@mui/material/styles';
import {
  FlightTakeoff, History, Favorite,
  CalendarMonth, LocationOn,
  EmojiEvents, ArrowForward, Edit,
  Diamond, FamilyRestroom,
  Logout, Dashboard as DashboardIcon, RocketLaunch,
  WorkspacePremium, Celebration, AttachMoney,
  BookmarkBorder as BookingsIcon, Explore, BeachAccess,
  Terrain, Restaurant, Spa, DirectionsBike,
  CardGiftcard, Save,
  MilitaryTech, SportsScore, Grade, HourglassEmpty,
  ExpandMore, ExpandLess, LocalOffer, ChevronLeft, ChevronRight,
} from '@mui/icons-material';
import { logout, updateInterests } from '../store/authSlice';
import { fixImageUrl } from '../services/api';
import { RootState } from '../store';

// ─── Tokens ───────────────────────────────────────────
const T = {
  teal:   '#0EA5A0', tealDk: '#0C8F8A',
  navy:   '#0F2D5C', navyLt: '#1A3F7A',
  slate:  '#64748B', ink:    '#0F172A',
  paper:  '#F0F4F8', white:  '#FFFFFF',
  border: '#DDE3EB', green:  '#16A34A',
  amber:  '#D97706', red:    '#DC2626',
  purple: '#7C3AED',
};

const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS_FR   = ['L','M','M','J','V','S','D'];

const fadeUp = keyframes`from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}`;

const Page    = styled(Box)({ minHeight: '100vh', backgroundColor: T.paper, padding: '32px 0 80px' });
const SCard   = styled(Box)({ backgroundColor: T.white, borderRadius: 20, border: `1px solid ${T.border}`, boxShadow: '0 2px 12px rgba(15,45,92,0.06)' });
const NavItem = styled(Box)({ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:10, cursor:'pointer', transition:'all 0.18s ease', color:T.navy, fontWeight:600, fontSize:14 });

const INTERESTS = [
  { value:'aventure',    label:'Aventure',    icon:<Terrain /> },
  { value:'plage',       label:'Plage',       icon:<BeachAccess /> },
  { value:'culture',     label:'Culture',     icon:<Explore /> },
  { value:'gastronomie', label:'Gastronomie', icon:<Restaurant /> },
  { value:'nature',      label:'Nature',      icon:<Spa /> },
  { value:'sport',       label:'Sport',       icon:<DirectionsBike /> },
  { value:'luxe',        label:'Luxe',        icon:<Diamond /> },
  { value:'famille',     label:'Famille',     icon:<FamilyRestroom /> },
];

const getBadge = (n: number) => {
  if (n >= 20) return { name:'Explorateur Légendaire', color:'#D97706', icon:<WorkspacePremium />, next:null };
  if (n >= 10) return { name:'Maître Aventurier',      color:'#7C3AED', icon:<EmojiEvents />,      next:{target:20,name:'Explorateur Légendaire'} };
  if (n >= 5)  return { name:'Voyageur Confirmé',      color:T.teal,    icon:<Celebration />,      next:{target:10,name:'Maître Aventurier'} };
  if (n >= 1)  return { name:'Explorateur Débutant',   color:'#16A34A', icon:<RocketLaunch />,     next:{target:5, name:'Voyageur Confirmé'} };
  return        { name:'Nouveau Voyageur',             color:T.slate,   icon:<FlightTakeoff />,    next:{target:1, name:'Explorateur Débutant'} };
};

const getPointsLevel = (pts: number) => {
  if (pts >= 500) return { name:'Platine',  color:'#7C3AED', icon:<WorkspacePremium sx={{fontSize:14}} /> };
  if (pts >= 200) return { name:'Or',       color:'#D97706', icon:<EmojiEvents sx={{fontSize:14}} /> };
  if (pts >= 100) return { name:'Argent',   color:'#64748B', icon:<MilitaryTech sx={{fontSize:14}} /> };
  if (pts >= 50)  return { name:'Bronze',   color:'#92400E', icon:<SportsScore sx={{fontSize:14}} /> };
  return                 { name:'Débutant', color:T.slate,   icon:<Grade sx={{fontSize:14}} /> };
};

const computeLoyaltyStats = (data: any) => {
  const byOrg = data?.by_organizer || [];
  const available = byOrg.reduce((s:number,o:any) => s+(o.available||0), 0);
  const totalEarned = data?.total_earned || 0;
  return { available, totalEarned, used: Math.max(0, totalEarned - available) };
};

const todayStr  = () => new Date().toISOString().split('T')[0];
const daysUntil = (d:string) => Math.ceil((new Date(d).getTime()-Date.now())/86400000);
const cleanDesc = (desc:string) =>
  desc.replace(/\s*[—–-]\s*réservation\s*#\d+/gi,'').replace(/\s*pour\s+(la\s+)?réservation\s*#\d+/gi,'').trim();

// Couleurs cycle pour les voyages
const TRIP_COLORS = [T.teal, T.amber, T.navy, T.purple, T.green, '#E11D48'];

// ════════════════════════════════════════════════════
//  6-MONTH CALENDAR GRID  (comme l'image de référence)
// ════════════════════════════════════════════════════
const SixMonthCalendar: React.FC<{ bookings: any[]; onTripClick:(id:number)=>void }> = ({ bookings, onTripClick }) => {
  const now = new Date();

  // 6 mois à partir du mois courant
  const months = Array.from({length:6}, (_,i) => {
    const d = new Date(now.getFullYear(), now.getMonth()+i, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  // Couleur unique par trip
  const tripIds = [...new Set(bookings.map((b:any) => b.trip?.id))];
  const tripColor: Record<number,string> = {};
  tripIds.forEach((id:any, i:number) => { tripColor[id] = TRIP_COLORS[i % TRIP_COLORS.length]; });

  // Pour un jour donné, récupère les bookings actifs
  const getDayBookings = (year:number, month:number, day:number) => {
    const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return bookings.filter((b:any) => ds >= (b.trip_session?.start_date||'') && ds <= (b.trip_session?.end_date||''));
  };

  if (bookings.length === 0) return (
    <Box sx={{textAlign:'center',py:6}}>
      <FlightTakeoff sx={{fontSize:48, color:alpha(T.teal,0.3), mb:2}} />
      <Typography sx={{fontSize:15,fontWeight:700,color:T.navy,mb:0.5}}>Aucun voyage confirmé à venir</Typography>
      <Typography sx={{fontSize:13,color:T.slate}}>Planifiez votre prochaine aventure !</Typography>
    </Box>
  );

  return (
    <Box>
      {/* Grille 3 colonnes × 2 rangées */}
      <Grid container spacing={1.5}>
        {months.map(({year, month}) => {
          const firstDay   = new Date(year, month, 1);
          const offset     = (firstDay.getDay()+6) % 7; // Monday-based
          const daysInMonth = new Date(year, month+1, 0).getDate();
          const cells: (number|null)[] = [];
          for (let i=0; i<offset; i++) cells.push(null);
          for (let d=1; d<=daysInMonth; d++) cells.push(d);

          const today = todayStr();
          const isCurrentMonth = year===now.getFullYear() && month===now.getMonth();

          return (
            <Grid item xs={12} sm={6} md={4} key={`${year}-${month}`}>
              <Box sx={{
                borderRadius: '14px',
                border: `1.5px solid ${isCurrentMonth ? T.teal : T.border}`,
                overflow: 'hidden',
                boxShadow: isCurrentMonth ? `0 4px 16px ${alpha(T.teal,0.15)}` : 'none',
              }}>
                {/* Header du mois */}
                <Box sx={{
                  px: 1.5, py: 1,
                  background: isCurrentMonth
                    ? `linear-gradient(135deg, ${T.navy}, ${T.teal})`
                    : T.navy,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <Typography sx={{fontSize:11,fontWeight:800,color:T.white,textTransform:'uppercase',letterSpacing:'0.08em'}}>
                    {MONTHS_FR[month]}
                  </Typography>
                  <Typography sx={{fontSize:11,fontWeight:600,color:alpha(T.white,0.7)}}>
                    {year}
                  </Typography>
                </Box>

                {/* Jours de la semaine */}
                <Box sx={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',bgcolor:alpha(T.navy,0.04),px:0.5,py:0.4}}>
                  {DAYS_FR.map((d,i) => (
                    <Typography key={i} sx={{fontSize:9,fontWeight:700,color:T.slate,textAlign:'center',py:0.3}}>
                      {d}
                    </Typography>
                  ))}
                </Box>

                {/* Jours */}
                <Box sx={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:0,px:0.5,pb:0.5}}>
                  {cells.map((day,idx) => {
                    if (!day) return <Box key={`e${idx}`} sx={{py:0.4}} />;

                    const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                    const dayBkgs   = getDayBookings(year, month, day);
                    const hasBkg    = dayBkgs.length > 0;
                    const isToday   = ds === today;
                    const isStart   = hasBkg && dayBkgs.some((b:any) => b.trip_session?.start_date === ds);
                    const isEnd     = hasBkg && dayBkgs.some((b:any) => b.trip_session?.end_date === ds);
                    const mainColor = hasBkg ? tripColor[dayBkgs[0].trip?.id] : T.teal;
                    const isUrgent  = hasBkg && daysUntil(dayBkgs[0].trip_session?.start_date||'') <= 7;

                    return (
                      <Tooltip
                        key={`d${day}`}
                        title={hasBkg ? dayBkgs.map((b:any)=>b.trip?.title).join(', ') : ''}
                        placement="top"
                        arrow
                      >
                        <Box
                          onClick={() => hasBkg && onTripClick(dayBkgs[0].trip?.id)}
                          sx={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 0.35,
                            cursor: hasBkg ? 'pointer' : 'default',
                            bgcolor: hasBkg && !isStart && !isEnd
                              ? alpha(mainColor, 0.12)
                              : 'transparent',
                            borderRadius: isStart ? '6px 0 0 6px' : isEnd ? '0 6px 6px 0' : '0px',
                            '&:hover': hasBkg ? { bgcolor: alpha(mainColor, 0.25) } : {},
                          }}
                        >
                          <Box sx={{
                            width: 22, height: 22,
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            bgcolor: isToday
                              ? T.teal
                              : (isStart || isEnd)
                                ? mainColor
                                : 'transparent',
                            boxShadow: isToday ? `0 2px 8px ${alpha(T.teal,0.5)}` : 'none',
                          }}>
                            <Typography sx={{
                              fontSize: 9.5,
                              fontWeight: isToday || hasBkg ? 800 : 400,
                              color: isToday || isStart || isEnd
                                ? T.white
                                : hasBkg
                                  ? mainColor
                                  : T.slate,
                              lineHeight: 1,
                            }}>
                              {day}
                            </Typography>
                          </Box>

                          {/* Point rouge urgence */}
                          {isStart && isUrgent && (
                            <Box sx={{
                              position:'absolute', top:2, right:2,
                              width:5, height:5, borderRadius:'50%', bgcolor:T.red,
                            }} />
                          )}
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* Légende voyages */}
      <Box sx={{mt:2.5, pt:2, borderTop:`1px solid ${T.border}`}}>
        <Typography sx={{fontSize:11,fontWeight:700,color:T.slate,textTransform:'uppercase',letterSpacing:'0.05em',mb:1}}>
          Légende
        </Typography>
        <Box sx={{display:'flex',flexWrap:'wrap',gap:1}}>
          {[...new Map(bookings.map((b:any) => [b.trip?.id, b])).values()].map((b:any) => {
            const col  = tripColor[b.trip?.id];
            const days = daysUntil(b.trip_session?.start_date||'');
            const isUrgent = days >= 0 && days <= 7;
            return (
              <Box key={b.trip?.id}
                onClick={() => onTripClick(b.trip?.id)}
                sx={{
                  display:'flex', alignItems:'center', gap:1,
                  px:1.5, py:0.8, borderRadius:'8px', cursor:'pointer',
                  bgcolor: alpha(col,0.07),
                  border:`1px solid ${alpha(col,0.2)}`,
                  transition:'all 0.15s',
                  '&:hover':{ bgcolor:alpha(col,0.14), transform:'translateY(-1px)' },
                }}>
                <Box sx={{width:8,height:8,borderRadius:'50%',bgcolor:col,flexShrink:0}} />
                <Box>
                  <Typography sx={{fontSize:11,fontWeight:700,color:T.navy}}>
                    {b.trip?.title}
                  </Typography>
                  <Typography sx={{fontSize:9,color:isUrgent?T.red:T.slate,fontWeight:isUrgent?700:400}}>
                    {b.trip_session?.start_date} → {b.trip_session?.end_date}
                    {isUrgent && ` · dans ${days}j !`}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

// ════════════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════════════
const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const userAny  = user as any;
  const photoUrl = userAny?.profile_photo_url
    ? (typeof fixImageUrl === 'function' ? fixImageUrl(userAny.profile_photo_url) : userAny.profile_photo_url)
    : null;

  const [allBookings, setAllBookings]             = useState<any[]>([]);
  const [loading, setLoading]                     = useState(true);
  const [interests, setInterests]                 = useState<string[]>(userAny?.interests || []);
  const [editingInterests, setEditingInterests]   = useState(false);
  const [savingInterests, setSavingInterests]     = useState(false);
  const [loyaltyData, setLoyaltyData]             = useState<any>(null);
  const [loyaltyLoading, setLoyaltyLoading]       = useState(false);
  const [showLoyaltyDetails, setShowLoyaltyDetails] = useState(false);

  useEffect(() => { setInterests(userAny?.interests || []); }, [userAny?.interests]);
  useEffect(() => { if (!token) { navigate('/login'); return; } loadData(); }, [token]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/user/bookings/upcoming', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const d = await res.json();
        setAllBookings([...(d.upcoming||[]), ...(d.past||[])]);
      }
    } catch (e) { console.error(e); }
    await loadLoyaltyData();
    setLoading(false);
  };

  const loadLoyaltyData = async () => {
    setLoyaltyLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/loyalty/points', { headers: { Authorization:`Bearer ${token}` } });
      if (res.ok) setLoyaltyData(await res.json());
    } catch(_) {} finally { setLoyaltyLoading(false); }
  };

  const toggleInterest = (v:string) => setInterests(p => p.includes(v) ? p.filter(i=>i!==v) : [...p,v]);

  const saveInterests = async () => {
    setSavingInterests(true);
    try {
      const res = await fetch('http://localhost:8000/api/user/profile', {
        method:'PUT', headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
        body: JSON.stringify({ interests }),
      });
      if (res.ok) { const d = await res.json(); dispatch(updateInterests(d.interests)); setEditingInterests(false); }
    } catch(e) { console.error(e); } finally { setSavingInterests(false); }
  };

  const handleLogout = () => { dispatch(logout() as any); navigate('/'); };

  const today = todayStr();
  const confirmedUpcoming = allBookings.filter(
    (b:any) => b.status==='CONFIRMED' && b.trip_session?.start_date >= today
  );
  const realPastTrips = allBookings.filter(
    (b:any) => b.status==='CONFIRMED' && b.trip_session?.end_date && b.trip_session.end_date < today
  );

  const totalTrips   = confirmedUpcoming.length + realPastTrips.length;
  const badge        = getBadge(totalTrips);
  const progress     = badge.next ? Math.min((totalTrips/badge.next.target)*100,100) : 100;
  const loyaltyStats = loyaltyData ? computeLoyaltyStats(loyaltyData) : null;

  if (loading) return (
    <Box sx={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',bgcolor:T.paper}}>
      <CircularProgress size={44} thickness={3} sx={{color:T.teal}} />
    </Box>
  );

  return (
    <Page>
      <Box maxWidth={1240} mx="auto" px={{xs:2,md:4}}>
        <Grid container spacing={3}>

          {/* ══ SIDEBAR — un seul rectangle ══ */}
          <Grid item xs={12} md={4} lg={3}>
            <Box sx={{position:'sticky',top:24}}>
              <SCard sx={{overflow:'hidden',boxShadow:'0 8px 32px rgba(15,45,92,0.12)'}}>

                {/* Header navy */}
                <Box sx={{height:80,bgcolor:T.navy,position:'relative',overflow:'hidden'}}>
                  <Box sx={{position:'absolute',right:-30,top:-30,width:120,height:120,borderRadius:'50%',bgcolor:alpha(T.teal,0.15)}} />
                  <Box sx={{position:'absolute',right:20,bottom:-20,width:60,height:60,borderRadius:'50%',bgcolor:alpha(T.teal,0.1)}} />
                </Box>

                {/* Profile */}
                <Box sx={{px:3,pt:0,pb:2.5,textAlign:'center'}}>
                  <Avatar src={photoUrl||undefined}
                    sx={{width:150,height:150,mx:'auto',mt:'-40px',
                      border:`4px solid ${T.white}`,bgcolor:T.teal,fontSize:28,fontWeight:800,
                      boxShadow:'0 6px 20px rgba(15,45,92,0.18)'}}>
                    {userAny?.first_name?.charAt(0)}
                  </Avatar>
                  <Typography sx={{fontSize:17,fontWeight:800,color:T.navy,mt:1.2,lineHeight:1.2}}>
                    {userAny?.first_name} {userAny?.last_name}
                  </Typography>
                  <Typography sx={{fontSize:11,color:T.slate,mt:0.3}}>{userAny?.email}</Typography>
                  <Box sx={{display:'inline-flex',alignItems:'center',gap:0.7,mt:1.2,
                    px:2,py:0.7,borderRadius:10,bgcolor:alpha(badge.color,0.08),
                    border:`1px solid ${alpha(badge.color,0.2)}`}}>
                    <Box sx={{color:badge.color,display:'flex','& svg':{fontSize:13}}}>{badge.icon}</Box>
                    <Typography sx={{fontSize:11,fontWeight:700,color:badge.color}}>{badge.name}</Typography>
                  </Box>
                  {badge.next && (
                    <Box sx={{mt:1.2}}>
                      <Box sx={{display:'flex',justifyContent:'space-between',mb:0.4}}>
                        <Typography sx={{fontSize:10,color:T.slate}}>{totalTrips} voyages</Typography>
                        <Typography sx={{fontSize:10,color:T.slate}}>{badge.next.target} → {badge.next.name}</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={progress}
                        sx={{height:4,borderRadius:3,bgcolor:alpha(T.teal,0.1),'& .MuiLinearProgress-bar':{bgcolor:T.teal,borderRadius:3}}} />
                    </Box>
                  )}
                  <Button fullWidth variant="contained" onClick={()=>navigate('/organizer-request')}
                    sx={{mt:2,py:1,borderRadius:'10px',bgcolor:T.teal,color:T.white,
                      fontSize:12,fontWeight:700,textTransform:'none',
                      boxShadow:`0 4px 14px ${alpha(T.teal,0.35)}`,'&:hover':{bgcolor:T.tealDk}}}>
                    {userAny?.status_organizer==='pending'
                      ? <Box sx={{display:'flex',alignItems:'center',gap:1}}><HourglassEmpty sx={{fontSize:15}}/><span>Vérification en cours…</span></Box>
                      : <Box sx={{display:'flex',alignItems:'center',gap:1}}><RocketLaunch sx={{fontSize:15}}/><span>Devenir Organisateur</span></Box>}
                  </Button>
                </Box>

                <Divider sx={{borderColor:T.border}} />

                {/* Nav */}
                <Box sx={{px:1.5,py:1.5}}>
                  {[
                    {label:'Tableau de bord',  icon:<DashboardIcon />, path:'/dashboard'},
                    {label:'Mes réservations', icon:<BookingsIcon />,  path:'/bookings'},
                    {label:'Mes favoris',      icon:<Favorite />,      path:'/saved'},
                  ].map((item,i) => (
                    <NavItem key={i} onClick={()=>navigate(item.path)}
                      sx={{'&:hover':{bgcolor:alpha(T.teal,0.07),color:T.teal,'& .nav-icon':{color:T.teal}}}}>
                      <Box className="nav-icon" sx={{color:T.navy,display:'flex',transition:'0.18s','& svg':{fontSize:19}}}>{item.icon}</Box>
                      <Typography sx={{fontSize:13,fontWeight:600}}>{item.label}</Typography>
                    </NavItem>
                  ))}
                </Box>

                <Divider sx={{borderColor:T.border}} />

                {/* Intérêts */}
                <Box sx={{px:2.5,py:2}}>
                  <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center',mb:1.5}}>
                    <Typography sx={{fontSize:11,fontWeight:800,color:T.navy,letterSpacing:'0.08em',textTransform:'uppercase'}}>
                      Mes intérêts
                    </Typography>
                    <Box sx={{display:'flex',gap:0.5}}>
                      {editingInterests && (
                        <IconButton size="small" onClick={saveInterests} disabled={savingInterests}
                          sx={{color:T.teal,bgcolor:alpha(T.teal,0.08),borderRadius:'7px',p:0.5}}>
                          {savingInterests ? <CircularProgress size={13} sx={{color:T.teal}}/> : <Save sx={{fontSize:15}}/>}
                        </IconButton>
                      )}
                      <IconButton size="small" onClick={()=>setEditingInterests(!editingInterests)}
                        sx={{color:editingInterests?T.navy:T.slate,bgcolor:editingInterests?alpha(T.navy,0.07):'transparent',borderRadius:'7px',p:0.5}}>
                        <Edit sx={{fontSize:15}}/>
                      </IconButton>
                    </Box>
                  </Box>
                  <Box sx={{display:'flex',flexWrap:'wrap',gap:0.7}}>
                    {(editingInterests ? INTERESTS : INTERESTS.filter(i=>interests.includes(i.value))).map(item => {
                      const sel = interests.includes(item.value);
                      return (
                        <Chip key={item.value} label={item.label} size="small"
                          onClick={editingInterests ? ()=>toggleInterest(item.value) : undefined}
                          sx={{height:26,fontSize:11,fontWeight:700,borderRadius:'7px',
                            cursor:editingInterests?'pointer':'default',
                            bgcolor:sel?T.navy:alpha(T.navy,0.05),color:sel?T.white:T.navy,
                            border:`1.5px solid ${sel?T.navy:alpha(T.navy,0.12)}`}}/>
                      );
                    })}
                    {!editingInterests && interests.length===0 && (
                      <Typography sx={{fontSize:11,color:T.slate,fontStyle:'italic'}}>Aucun intérêt sélectionné</Typography>
                    )}
                  </Box>
                </Box>

                <Divider sx={{borderColor:T.border}} />

                {/* Logout */}
                <Box onClick={handleLogout}
                  sx={{display:'flex',alignItems:'center',justifyContent:'center',gap:1.5,
                    px:2,py:1.8,cursor:'pointer',color:T.slate,transition:'0.18s',
                    borderRadius:'0 0 20px 20px','&:hover':{color:T.red,bgcolor:alpha(T.red,0.04)}}}>
                  <Logout sx={{fontSize:17}}/>
                  <Typography sx={{fontSize:13,fontWeight:600}}>Déconnexion</Typography>
                </Box>
              </SCard>
            </Box>
          </Grid>

          {/* ══ MAIN ══ */}
          <Grid item xs={12} md={8} lg={9}>
            <Box sx={{display:'flex',flexDirection:'column',gap:2.5}}>

              {/* ── LOYALTY ── */}
              <SCard sx={{p:3,animation:`${fadeUp} 0.4s ease 0.05s both`}}>
                <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center',mb:3}}>
                  <Box sx={{display:'flex',alignItems:'center',gap:1.5}}>
                    <Box sx={{width:40,height:40,borderRadius:'12px',
                      background:`linear-gradient(135deg, ${T.amber}, #F59E0B)`,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      boxShadow:`0 4px 12px ${alpha(T.amber,0.35)}`}}>
                      <EmojiEvents sx={{fontSize:20,color:T.white}}/>
                    </Box>
                    <Box>
                      <Typography sx={{fontSize:16,fontWeight:800,color:T.navy}}>Points Fidélité</Typography>
                      <Typography sx={{fontSize:11,color:T.slate}}>1 point gagné par 10 EUR dépensés</Typography>
                    </Box>
                  </Box>
                  {loyaltyStats && (
                    <Chip
                      label={<Box sx={{display:'flex',alignItems:'center',gap:0.5}}>
                        {getPointsLevel(loyaltyStats.totalEarned).icon}
                        <Typography sx={{fontSize:11,fontWeight:700}}>{getPointsLevel(loyaltyStats.totalEarned).name}</Typography>
                      </Box>}
                      size="small"
                      sx={{bgcolor:alpha(getPointsLevel(loyaltyStats.totalEarned).color,0.1),
                        color:getPointsLevel(loyaltyStats.totalEarned).color,fontWeight:700,
                        fontSize:11,height:26,borderRadius:'8px',
                        border:`1px solid ${alpha(getPointsLevel(loyaltyStats.totalEarned).color,0.25)}`}}
                    />
                  )}
                </Box>

                {loyaltyLoading ? (
                  <Box sx={{display:'flex',justifyContent:'center',py:4}}><CircularProgress size={30} sx={{color:T.amber}}/></Box>
                ) : loyaltyStats ? (
                  <>
                    <Box sx={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:1.5,mb:3}}>
                      {[
                        {label:'Disponibles',  value:loyaltyStats.available,   color:T.teal,  bg:`linear-gradient(135deg,${alpha(T.teal,0.08)},${alpha(T.teal,0.04)})`},
                        {label:'Gagnés total', value:loyaltyStats.totalEarned, color:T.amber, bg:`linear-gradient(135deg,${alpha(T.amber,0.08)},${alpha(T.amber,0.04)})`},
                        {label:'Utilisés',     value:loyaltyStats.used,        color:T.slate, bg:`linear-gradient(135deg,${alpha(T.slate,0.07)},${alpha(T.slate,0.03)})`},
                      ].map(s => (
                        <Box key={s.label} sx={{p:2.5,borderRadius:'14px',background:s.bg,border:`1px solid ${alpha(s.color,0.12)}`,textAlign:'center'}}>
                          <Typography sx={{fontSize:28,fontWeight:900,color:s.color,lineHeight:1}}>{s.value??0}</Typography>
                          <Typography sx={{fontSize:11,color:T.slate,mt:0.6,fontWeight:500}}>{s.label}</Typography>
                        </Box>
                      ))}
                    </Box>

                    {(() => {
                      const pts = loyaltyStats.available;
                      const thresholds = [50,100,200,500];
                      const next = thresholds.find(t=>t>pts);
                      const prev = thresholds.filter(t=>t<=pts).pop()||0;
                      const prog = next ? Math.min(((pts-prev)/(next-prev))*100,100) : 100;
                      return next ? (
                        <Box sx={{mb:2,p:2,borderRadius:'12px',bgcolor:alpha(T.amber,0.04),border:`1px solid ${alpha(T.amber,0.1)}`}}>
                          <Box sx={{display:'flex',justifyContent:'space-between',mb:1}}>
                            <Typography sx={{fontSize:11,color:T.slate}}>Progression vers le niveau suivant</Typography>
                            <Typography sx={{fontSize:11,fontWeight:800,color:T.amber}}>{pts} / {next} pts</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={prog}
                            sx={{height:7,borderRadius:4,bgcolor:alpha(T.amber,0.12),'& .MuiLinearProgress-bar':{bgcolor:T.amber,borderRadius:4}}}/>
                          <Typography sx={{fontSize:10,color:T.slate,mt:0.7}}>Encore {next-pts} points pour le niveau suivant</Typography>
                        </Box>
                      ) : (
                        <Box sx={{mb:2,p:2,borderRadius:'12px',bgcolor:alpha('#7C3AED',0.06),border:`1px solid ${alpha('#7C3AED',0.15)}`,textAlign:'center'}}>
                          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center',gap:1}}>
                            <WorkspacePremium sx={{fontSize:18,color:'#7C3AED'}}/>
                            <Typography sx={{fontSize:13,fontWeight:700,color:'#7C3AED'}}>Niveau maximum atteint — Platine !</Typography>
                          </Box>
                        </Box>
                      );
                    })()}

                    <Box sx={{display:'flex',justifyContent:'center',mb:1}}>
                      <Button size="small" onClick={()=>setShowLoyaltyDetails(!showLoyaltyDetails)}
                        endIcon={showLoyaltyDetails ? <ExpandLess sx={{fontSize:14}}/> : <ExpandMore sx={{fontSize:14}}/>}
                        sx={{fontSize:11,textTransform:'none',color:T.slate,fontWeight:600,
                          px:2,py:0.6,borderRadius:'8px',border:`1px solid ${alpha(T.slate,0.2)}`,
                          '&:hover':{bgcolor:alpha(T.navy,0.04),borderColor:T.navy,color:T.navy}}}>
                        {showLoyaltyDetails ? 'Masquer les détails' : 'Voir détails'}
                      </Button>
                    </Box>

                    <Collapse in={showLoyaltyDetails}>
                      <Box sx={{pt:1}}>
                        {(loyaltyData?.by_organizer||[]).length>0 && (
                          <Box sx={{mb:2.5}}>
                            <Typography sx={{fontSize:12,fontWeight:800,color:T.navy,letterSpacing:'0.06em',textTransform:'uppercase',mb:1.2}}>Points par agence</Typography>
                            {loyaltyData.by_organizer.map((org:any) => (
                              <Box key={org.organizer_id}
                                sx={{display:'flex',justifyContent:'space-between',alignItems:'center',
                                  py:1.2,px:1.8,borderRadius:'10px',mb:0.8,
                                  bgcolor:alpha(T.teal,0.04),border:`1px solid ${alpha(T.teal,0.1)}`}}>
                                <Box>
                                  <Typography sx={{fontSize:13,fontWeight:600,color:T.navy}}>{org.agency_name}</Typography>
                                  <Typography sx={{fontSize:10,color:T.slate}}>{org.earned} pts gagnés au total</Typography>
                                </Box>
                                <Chip label={`${org.available} pts`} size="small"
                                  sx={{bgcolor:org.available>0?alpha(T.teal,0.1):alpha(T.slate,0.08),
                                    color:org.available>0?T.teal:T.slate,fontWeight:700,fontSize:12,borderRadius:'8px'}}/>
                              </Box>
                            ))}
                          </Box>
                        )}
                        {loyaltyData?.history?.length>0 && (
                          <Box sx={{mb:2}}>
                            <Typography sx={{fontSize:12,fontWeight:800,color:T.navy,letterSpacing:'0.06em',textTransform:'uppercase',mb:1.2}}>Historique récent</Typography>
                            {loyaltyData.history.slice(0,5).map((tx:any) => (
                              <Box key={tx.id}
                                sx={{display:'flex',justifyContent:'space-between',alignItems:'center',
                                  py:1.2,px:1.8,borderRadius:'10px',mb:0.8,
                                  bgcolor:tx.type==='earn'?alpha(T.green,0.04):alpha(T.red,0.04),
                                  border:`1px solid ${tx.type==='earn'?alpha(T.green,0.1):alpha(T.red,0.1)}`}}>
                                <Box sx={{display:'flex',alignItems:'center',gap:1.2}}>
                                  <Box sx={{width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                                    bgcolor:tx.type==='earn'?alpha(T.green,0.1):alpha(T.red,0.1)}}>
                                    {tx.type==='earn'?<EmojiEvents sx={{fontSize:13,color:T.green}}/>:<CardGiftcard sx={{fontSize:13,color:T.red}}/>}
                                  </Box>
                                  <Box>
                                    <Typography sx={{fontSize:12,fontWeight:600,color:T.ink}}>{cleanDesc(tx.description)}</Typography>
                                    <Typography sx={{fontSize:10,color:T.slate}}>{tx.created_at}</Typography>
                                  </Box>
                                </Box>
                                <Typography sx={{fontSize:13,fontWeight:800,color:tx.type==='earn'?T.green:T.red}}>
                                  {tx.type==='earn'?'+':''}{tx.points} pts
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Collapse>

                    <Box sx={{display:'flex',justifyContent:'flex-end'}}>
                      <Button size="small" startIcon={<LocalOffer sx={{fontSize:13}}/>} endIcon={<ArrowForward sx={{fontSize:13}}/>}
                        onClick={()=>navigate('/loyalty-offers')}
                        sx={{fontSize:12,textTransform:'none',fontWeight:700,px:2,py:0.8,
                          borderRadius:'10px',bgcolor:alpha(T.amber,0.1),color:T.amber,
                          border:`1px solid ${alpha(T.amber,0.25)}`,'&:hover':{bgcolor:alpha(T.amber,0.18)}}}>
                        Voir les offres
                      </Button>
                    </Box>
                  </>
                ) : (
                  <Box sx={{textAlign:'center',py:4}}>
                    <Typography sx={{fontSize:13,color:T.slate}}>Impossible de charger vos points</Typography>
                  </Box>
                )}
              </SCard>

              {/* ── VOYAGES À VENIR — BANNER + 6-MONTH GRID ── */}
              <SCard sx={{overflow:'hidden',animation:`${fadeUp} 0.4s ease 0.1s both`}}>
                <Box sx={{
                  position:'relative', height:160, overflow:'hidden',
                  backgroundImage:'url(https://i.pinimg.com/736x/fe/17/78/fe17784f7dcf764a6a7cf67dd0511829.jpg)',
                  backgroundSize:'cover', backgroundPosition:'center',
                }}>
                  <Box sx={{position:'absolute',inset:0,background:`linear-gradient(135deg, ${alpha(T.navy,0.85)} 0%, ${alpha(T.teal,0.5)} 100%)`}}/>
                  <Box sx={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',display:'flex',alignItems:'center'}}>
                    {'2026'.split('').map((c,i) => (
                      <Typography key={i} sx={{fontSize:80,fontWeight:900,lineHeight:1,letterSpacing:'-6px',color:i%5===0?alpha(T.white,0.7):alpha(T.teal,0.7)}}>{c}</Typography>
                    ))}
                  </Box>
                  <Box sx={{position:'absolute',left:24,top:'50%',transform:'translateY(-50%)'}}>
                    <Typography sx={{fontSize:22,fontWeight:900,color:T.white,lineHeight:1.1,mb:0.5}}>Voyages à venir</Typography>
                    <Typography sx={{fontSize:12,color:alpha(T.white,0.75)}}>{confirmedUpcoming.length} voyage{confirmedUpcoming.length!==1?'s':''} confirmé{confirmedUpcoming.length!==1?'s':''}</Typography>
                  </Box>
                  <Button size="small" endIcon={<ArrowForward sx={{fontSize:11}}/>}
                    onClick={()=>navigate('/bookings')}
                    sx={{position:'absolute',bottom:12,right:14,fontSize:10,textTransform:'none',fontWeight:700,
                      color:T.white,bgcolor:alpha(T.white,0.15),border:`1px solid ${alpha(T.white,0.3)}`,
                      borderRadius:'8px',px:1.5,py:0.5,backdropFilter:'blur(4px)',
                      '&:hover':{bgcolor:alpha(T.white,0.28)}}}>
                    Voir tout
                  </Button>
                </Box>
                <Box sx={{p:3}}>
                  <SixMonthCalendar bookings={confirmedUpcoming} onTripClick={(id)=>navigate(`/trips/${id}`)} />
                </Box>
              </SCard>

              {/* ── VOYAGES PASSÉS ── */}
              <SCard sx={{p:3,animation:`${fadeUp} 0.4s ease 0.15s both`}}>
                <Box sx={{display:'flex',alignItems:'center',gap:1.5,mb:3}}>
                  <Box sx={{width:40,height:40,borderRadius:'12px',
                    background:`linear-gradient(135deg,${alpha(T.slate,0.6)},${alpha(T.navy,0.5)})`,
                    display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <History sx={{fontSize:20,color:T.white}}/>
                  </Box>
                  <Box>
                    <Typography sx={{fontSize:16,fontWeight:800,color:T.navy}}>Voyages passés</Typography>
                    <Typography sx={{fontSize:11,color:T.slate}}>
                      {realPastTrips.length} voyage{realPastTrips.length!==1?'s':''} effectué{realPastTrips.length!==1?'s':''}
                    </Typography>
                  </Box>
                </Box>
                {realPastTrips.length===0 ? (
                  <Typography sx={{fontSize:13,color:T.slate,textAlign:'center',py:4}}>Aucun voyage terminé pour le moment</Typography>
                ) : (
                  <Grid container spacing={1.5}>
                    {realPastTrips.slice(0,4).map((booking:any) => (
                      <Grid item xs={12} sm={6} key={booking.id}>
                        <Box sx={{p:'14px 16px',borderRadius:'12px',border:`1px solid ${T.border}`,
                          cursor:'pointer',transition:'all 0.15s',
                          '&:hover':{borderColor:alpha(T.teal,0.4),boxShadow:`0 4px 16px ${alpha(T.navy,0.06)}`,transform:'translateY(-2px)'}}}
                          onClick={()=>navigate(`/trips/${booking.trip?.id}`)}>
                          <Typography sx={{fontSize:13,fontWeight:700,color:T.navy,mb:0.4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                            {booking.trip?.title}
                          </Typography>
                          <Typography sx={{fontSize:11,color:T.slate,mb:1.2}}>
                            {booking.trip_session?.start_date} → {booking.trip_session?.end_date}
                          </Typography>
                          <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                            <Typography sx={{fontSize:11,fontWeight:700,color:T.teal}}>Revivre l'expérience →</Typography>
                            <Button size="small" variant="contained"
                              onClick={(e)=>{e.stopPropagation();navigate(`/trips/${booking.trip?.id}`);}}
                              sx={{fontSize:10,py:0.4,px:1.2,bgcolor:T.teal,color:T.white,borderRadius:'6px',textTransform:'none',fontWeight:600,'&:hover':{bgcolor:T.tealDk}}}>
                              Commenter
                            </Button>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </SCard>

            </Box>
          </Grid>
        </Grid>
      </Box>
    </Page>
  );
};

export default Dashboard;