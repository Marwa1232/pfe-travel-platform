import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Badge,
  ToggleButton,
  ToggleButtonGroup,
  Fade,
  Zoom,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today,
  Add,
  Sync,
  CalendarMonth,
  ViewWeek,
  FlightTakeoff,
  People,
  AccessTime,
  ArrowBack,
  EventAvailable,
  EventBusy,
} from '@mui/icons-material';
import { styled, alpha, keyframes } from '@mui/material/styles';
import api from '../../services/api';

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

// ─── Types ───────────────────────────────────────────────────────
interface TripSession {
  id: number;
  trip_id: number;
  trip_title: string;
  start_date: string;
  end_date: string;
  status: 'OPEN' | 'FULL' | 'CANCELLED' | 'CLOSED';
  available_seats: number;
  max_capacity: number;
  color?: string;
}

// ─── Styled ──────────────────────────────────────────────────────
const CalendarPaper = styled(Paper)({
  borderRadius: 16,
  boxShadow: `0 4px 24px ${alpha(COLORS.navy, 0.06)}`,
  border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
  overflow: 'hidden',
});

const DayCell = styled(Box, {
  shouldForwardProp: (p) => p !== 'isToday' && p !== 'isOtherMonth' && p !== 'isSelected',
})<{ isToday?: boolean; isOtherMonth?: boolean; isSelected?: boolean }>(
  ({ isToday, isOtherMonth, isSelected }) => ({
    minHeight: 120,
    padding: '8px 10px',
    borderRight: `1px solid ${alpha(COLORS.teal, 0.08)}`,
    borderBottom: `1px solid ${alpha(COLORS.teal, 0.08)}`,
    backgroundColor: isSelected
      ? alpha(COLORS.teal, 0.04)
      : isOtherMonth
      ? alpha(COLORS.navy, 0.01)
      : COLORS.white,
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    '&:hover': { backgroundColor: alpha(COLORS.teal, 0.04) },
    position: 'relative',
  })
);

const DayNumber = styled(Box, {
  shouldForwardProp: (p) => p !== 'isToday' && p !== 'isWeekend',
})<{ isToday?: boolean; isWeekend?: boolean }>(({ isToday, isWeekend }) => ({
  width: 28,
  height: 28,
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 13,
  fontWeight: isToday ? 700 : 500,
  backgroundColor: isToday ? COLORS.teal : 'transparent',
  color: isToday ? COLORS.white : isWeekend ? COLORS.amber : alpha(COLORS.navy, 0.7),
  marginBottom: 6,
  transition: 'all 0.2s ease',
}));

const EventPill = styled(Box)<{ color?: string; cancelled?: boolean }>(({ color, cancelled }) => ({
  fontSize: 11,
  fontWeight: 600,
  padding: '4px 8px',
  borderRadius: 8,
  marginBottom: 4,
  backgroundColor: cancelled ? alpha(COLORS.amber, 0.1) : alpha(color || COLORS.teal, 0.12),
  color: cancelled ? COLORS.amber : color || COLORS.teal,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': { 
    opacity: 0.85,
    transform: 'translateX(2px)',
  },
}));

// ─── Color palette for trips ─────────────────────────────────────
const TRIP_COLORS = [
  COLORS.teal,
  COLORS.navy,
  COLORS.amber,
  alpha(COLORS.teal, 0.7),
  alpha(COLORS.navy, 0.7),
  alpha(COLORS.amber, 0.7),
];

const getTripColor = (tripId: number) => TRIP_COLORS[tripId % TRIP_COLORS.length];

// ─── Helpers ─────────────────────────────────────────────────────
const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS_FR   = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

const isSameDay = (a: Date, b: Date) =>
  a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

const getCalendarDays = (year: number, month: number) => {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  let startDow = first.getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;
  const days: { date: Date; isOtherMonth: boolean }[] = [];
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, isOtherMonth: true });
  }
  for (let d = 1; d <= last.getDate(); d++) {
    days.push({ date: new Date(year, month, d), isOtherMonth: false });
  }
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push({ date: new Date(year, month + 1, d), isOtherMonth: true });
  }
  return days;
};

const sessionSpansDay = (session: TripSession, date: Date) => {
  const start = new Date(session.start_date);
  const end   = new Date(session.end_date);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return date >= start && date <= end;
};

const getStatusMeta = (status: string) => {
  const map: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    OPEN:      { label: 'Ouvert',    color: COLORS.teal,   bg: alpha(COLORS.teal, 0.1),   icon: <EventAvailable sx={{ fontSize: 12 }} /> },
    FULL:      { label: 'Complet',   color: COLORS.amber,  bg: alpha(COLORS.amber, 0.1),  icon: <EventBusy sx={{ fontSize: 12 }} /> },
    CANCELLED: { label: 'Annulé',    color: COLORS.amber,  bg: alpha(COLORS.amber, 0.1),  icon: <EventBusy sx={{ fontSize: 12 }} /> },
    CLOSED:    { label: 'Fermé',     color: COLORS.navy,   bg: alpha(COLORS.navy, 0.08),  icon: <EventBusy sx={{ fontSize: 12 }} /> },
  };
  return map[status] || { label: status, color: COLORS.navy, bg: alpha(COLORS.navy, 0.08), icon: null };
};

// ─── Week view helpers ──────────────────────────────────────────
const getWeekDays = (date: Date) => {
  const d = new Date(date);
  const dow = d.getDay() === 0 ? 6 : d.getDay() - 1;
  d.setDate(d.getDate() - dow);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(d);
    day.setDate(d.getDate() + i);
    return day;
  });
};

// ─── Gradient Button ────────────────────────────────────────────
const GradientButton = styled(Button)({
  background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navy})`,
  borderRadius: 10,
  padding: '8px 20px',
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
  padding: '8px 20px',
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

// ─── Main Component ─────────────────────────────────────────────
const OrganizerCalendar: React.FC = () => {
  const navigate = useNavigate();
  const today = new Date();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [sessions, setSessions] = useState<TripSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TripSession | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    loadSessions();
  }, [year, month]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/organizer/trips');
      const trips = response.data || [];
      const allSessions: TripSession[] = [];
      trips.forEach((trip: any) => {
        (trip.sessions || []).forEach((session: any) => {
          allSessions.push({
            id: session.id,
            trip_id: trip.id,
            trip_title: trip.title,
            start_date: session.start_date,
            end_date: session.end_date,
            status: session.status,
            available_seats: session.available_seats,
            max_capacity: session.max_capacity,
            color: getTripColor(trip.id),
          });
        });
      });
      setSessions(allSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    await loadSessions();
    setSyncing(false);
  };

  const prevPeriod = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(month - 1);
    else d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const nextPeriod = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(month + 1);
    else d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const goToday = () => setCurrentDate(new Date());

  const openDetail = (session: TripSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSession(session);
    setDetailOpen(true);
  };

  const calendarDays = getCalendarDays(year, month);
  const weekDays = getWeekDays(currentDate);

  const headerLabel = viewMode === 'month'
    ? `${MONTHS_FR[month]} ${year}`
    : (() => {
        const start = weekDays[0];
        const end   = weekDays[6];
        return start.getMonth() === end.getMonth()
          ? `${start.getDate()} – ${end.getDate()} ${MONTHS_FR[end.getMonth()]} ${end.getFullYear()}`
          : `${start.getDate()} ${MONTHS_FR[start.getMonth()]} – ${end.getDate()} ${MONTHS_FR[end.getMonth()]} ${end.getFullYear()}`;
      })();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: alpha(COLORS.navy, 0.02), py: 4 }}>
      <Container maxWidth="xl">

        {/* ── Page Header ─────────────────────────────────────── */}
        <Fade in timeout={500}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <IconButton 
              onClick={() => navigate('/organizer/dashboard')}
              sx={{ 
                bgcolor: COLORS.white, 
                borderRadius: 10,
                border: `1px solid ${alpha(COLORS.teal, 0.2)}`,
                '&:hover': { bgcolor: alpha(COLORS.teal, 0.05), borderColor: COLORS.teal }
              }}
            >
              <ArrowBack sx={{ color: COLORS.navy }} />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ color: COLORS.navy, letterSpacing: '-0.02em' }}>
                Calendrier
              </Typography>
              <Typography variant="body2" sx={{ color: alpha(COLORS.navy, 0.6) }}>
                {today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, ml: 'auto' }}>
              <OutlineButton
                startIcon={syncing ? <CircularProgress size={14} sx={{ color: COLORS.teal }} /> : <Sync />}
                onClick={handleSync}
                disabled={syncing}
              >
                Synchroniser
              </OutlineButton>
              <GradientButton
                startIcon={<Add />}
                onClick={() => navigate('/organizer/trips/new')}
              >
                Nouveau voyage
              </GradientButton>
            </Box>
          </Box>
        </Fade>

        {/* ── Calendar Card ───────────────────────────────────── */}
        <CalendarPaper>
          {/* Toolbar */}
          <Box sx={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            px: 3, py: 2, borderBottom: `1px solid ${alpha(COLORS.teal, 0.1)}`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <OutlineButton
                size="small"
                onClick={goToday}
                sx={{ minWidth: 70, py: 0.5 }}
              >
                Aujourd'hui
              </OutlineButton>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton 
                  size="small" 
                  onClick={prevPeriod}
                  sx={{ color: alpha(COLORS.navy, 0.5), '&:hover': { color: COLORS.teal } }}
                >
                  <ChevronLeft />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={nextPeriod}
                  sx={{ color: alpha(COLORS.navy, 0.5), '&:hover': { color: COLORS.teal } }}
                >
                  <ChevronRight />
                </IconButton>
              </Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: COLORS.navy, minWidth: 220 }}>
                {headerLabel}
              </Typography>
            </Box>

            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, v) => v && setViewMode(v)}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: 13,
                  border: `1px solid ${alpha(COLORS.teal, 0.2)}`,
                  color: alpha(COLORS.navy, 0.6),
                  px: 2,
                  borderRadius: 8,
                  '&.Mui-selected': {
                    bgcolor: COLORS.teal,
                    color: COLORS.white,
                    '&:hover': { bgcolor: alpha(COLORS.teal, 0.85) },
                  },
                },
              }}
            >
              <ToggleButton value="month">Mois</ToggleButton>
              <ToggleButton value="week">Semaine</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress size={40} sx={{ color: COLORS.teal }} />
            </Box>
          ) : viewMode === 'month' ? (
            // ── Month View ───────────────────────────────────────
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: `1px solid ${alpha(COLORS.teal, 0.08)}` }}>
                {DAYS_FR.map((d, i) => (
                  <Box key={d} sx={{
                    py: 1.5, textAlign: 'center',
                    fontSize: 12, fontWeight: 700,
                    color: i >= 5 ? COLORS.amber : alpha(COLORS.navy, 0.6),
                    letterSpacing: 0.5,
                    borderRight: i < 6 ? `1px solid ${alpha(COLORS.teal, 0.08)}` : 'none',
                  }}>
                    {d}
                  </Box>
                ))}
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {calendarDays.map(({ date, isOtherMonth }, idx) => {
                  const isToday = isSameDay(date, today);
                  const dow = idx % 7;
                  const isWeekend = dow === 5 || dow === 6;
                  const daySessions = sessions.filter(s => sessionSpansDay(s, date));
                  const MAX_VISIBLE = 3;
                  const visible = daySessions.slice(0, MAX_VISIBLE);
                  const extra = daySessions.length - MAX_VISIBLE;

                  return (
                    <DayCell
                      key={idx}
                      isToday={isToday}
                      isOtherMonth={isOtherMonth}
                      sx={{ borderRight: dow === 6 ? 'none' : undefined }}
                    >
                      <DayNumber isToday={isToday} isWeekend={isWeekend && !isOtherMonth}>
                        {date.getDate()}
                      </DayNumber>

                      {visible.map(session => (
                        <EventPill
                          key={session.id}
                          color={session.color}
                          cancelled={session.status === 'CANCELLED'}
                          onClick={(e) => openDetail(session, e)}
                          title={session.trip_title}
                        >
                          • {session.trip_title.length > 25 
                              ? `${session.trip_title.substring(0, 22)}...` 
                              : session.trip_title}
                        </EventPill>
                      ))}

                      {extra > 0 && (
                        <Typography variant="caption" sx={{ color: COLORS.teal, fontWeight: 700, fontSize: 10, pl: 0.5 }}>
                          +{extra} autre{extra > 1 ? 's' : ''}
                        </Typography>
                      )}
                    </DayCell>
                  );
                })}
              </Box>
            </>
          ) : (
            // ── Week View ────────────────────────────────────────
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: `1px solid ${alpha(COLORS.teal, 0.08)}` }}>
                {weekDays.map((date, i) => {
                  const isToday = isSameDay(date, today);
                  const isWeekend = i >= 5;
                  return (
                    <Box key={i} sx={{
                      py: 2, textAlign: 'center',
                      borderRight: i < 6 ? `1px solid ${alpha(COLORS.teal, 0.08)}` : 'none',
                      bgcolor: isToday ? alpha(COLORS.teal, 0.04) : 'transparent',
                    }}>
                      <Typography variant="caption" sx={{
                        display: 'block', fontWeight: 700, letterSpacing: 0.5,
                        color: isWeekend ? COLORS.amber : alpha(COLORS.navy, 0.6),
                        mb: 0.5,
                      }}>
                        {DAYS_FR[i]}
                      </Typography>
                      <Box sx={{
                        width: 34, height: 34, borderRadius: 8, mx: 'auto',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: isToday ? COLORS.teal : 'transparent',
                      }}>
                        <Typography variant="body1" fontWeight={700}
                          sx={{ color: isToday ? COLORS.white : isWeekend ? COLORS.amber : COLORS.navy }}
                        >
                          {date.getDate()}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {weekDays.map((date, i) => {
                  const isToday = isSameDay(date, today);
                  const daySessions = sessions.filter(s => sessionSpansDay(s, date));
                  return (
                    <Box key={i} sx={{
                      minHeight: 200, p: 1.5,
                      borderRight: i < 6 ? `1px solid ${alpha(COLORS.teal, 0.08)}` : 'none',
                      bgcolor: isToday ? alpha(COLORS.teal, 0.02) : 'transparent',
                    }}>
                      {daySessions.map(session => (
                        <Box
                          key={session.id}
                          onClick={(e) => openDetail(session, e)}
                          sx={{
                            p: 1.5, borderRadius: 10, mb: 1, cursor: 'pointer',
                            bgcolor: session.status === 'CANCELLED' ? alpha(COLORS.amber, 0.08) : alpha(session.color!, 0.1),
                            borderLeft: `3px solid ${session.status === 'CANCELLED' ? COLORS.amber : session.color}`,
                            transition: 'all 0.2s ease',
                            '&:hover': { transform: 'translateX(3px)', opacity: 0.9 },
                          }}
                        >
                          <Typography variant="caption" fontWeight={700}
                            sx={{ color: session.status === 'CANCELLED' ? COLORS.amber : session.color, display: 'block' }}
                          >
                            • {session.trip_title.length > 30 
                                ? `${session.trip_title.substring(0, 27)}...` 
                                : session.trip_title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: alpha(COLORS.navy, 0.5), fontSize: 10 }}>
                            {new Date(session.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                            {' → '}
                            {new Date(session.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  );
                })}
              </Box>
            </>
          )}
        </CalendarPaper>

        {/* ── Legend ───────────────────────────────────────────── */}
        {sessions.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap', p: 1 }}>
            {Array.from(new Map(sessions.map(s => [s.trip_id, s])).values()).map(s => (
              <Box key={s.trip_id} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: s.color }} />
                <Typography variant="caption" sx={{ color: alpha(COLORS.navy, 0.7), fontWeight: 500 }}>
                  {s.trip_title.length > 25 ? `${s.trip_title.substring(0, 22)}...` : s.trip_title}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* ── Session Detail Dialog ────────────────────────────── */}
        <Dialog
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ 
            sx: { 
              borderRadius: 16, 
              overflow: 'hidden',
              boxShadow: `0 20px 60px ${alpha(COLORS.navy, 0.15)}`,
              border: `1px solid ${alpha(COLORS.teal, 0.1)}`,
            } 
          }}
        >
          {selectedSession && (
            <>
              <Box sx={{
                height: 6,
                background: `linear-gradient(90deg, ${selectedSession.color}, ${alpha(selectedSession.color!, 0.5)})`,
              }} />

              <DialogTitle sx={{ pt: 2.5, pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{
                    width: 44, height: 44, borderRadius: 10,
                    bgcolor: alpha(selectedSession.color!, 0.12),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FlightTakeoff sx={{ fontSize: 20, color: selectedSession.color }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: COLORS.navy, lineHeight: 1.2 }}>
                      {selectedSession.trip_title}
                    </Typography>
                    <Chip
                      size="small"
                      label={getStatusMeta(selectedSession.status).label}
                      icon={getStatusMeta(selectedSession.status).icon as any}
                      sx={{
                        height: 22,
                        fontSize: 10,
                        fontWeight: 700,
                        mt: 0.5,
                        bgcolor: getStatusMeta(selectedSession.status).bg,
                        color: getStatusMeta(selectedSession.status).color,
                        borderRadius: 6,
                      }}
                    />
                  </Box>
                </Box>
              </DialogTitle>

              <DialogContent sx={{ pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                  <AccessTime sx={{ fontSize: 16, color: alpha(COLORS.navy, 0.5) }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: alpha(COLORS.navy, 0.6), fontWeight: 600 }}>
                      Période
                    </Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ color: COLORS.navy }}>
                      {new Date(selectedSession.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {' → '}
                      {new Date(selectedSession.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                  <People sx={{ fontSize: 16, color: alpha(COLORS.navy, 0.5) }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: alpha(COLORS.navy, 0.6), fontWeight: 600 }}>
                      Places
                    </Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ color: COLORS.navy }}>
                      {selectedSession.available_seats} disponibles / {selectedSession.max_capacity} total
                    </Typography>
                  </Box>
                </Box>

                {/* Capacity bar */}
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: alpha(COLORS.navy, 0.6) }}>Taux de remplissage</Typography>
                    <Typography variant="caption" fontWeight={700} sx={{ color: selectedSession.color }}>
                      {Math.round(((selectedSession.max_capacity - selectedSession.available_seats) / selectedSession.max_capacity) * 100)}%
                    </Typography>
                  </Box>
                  <Box sx={{ height: 6, borderRadius: 3, bgcolor: alpha(selectedSession.color!, 0.12), overflow: 'hidden' }}>
                    <Box sx={{
                      height: '100%', borderRadius: 3,
                      width: `${((selectedSession.max_capacity - selectedSession.available_seats) / selectedSession.max_capacity) * 100}%`,
                      bgcolor: selectedSession.color,
                      transition: 'width 0.5s ease',
                    }} />
                  </Box>
                </Box>
              </DialogContent>

              <DialogActions sx={{ px: 3, pb: 2.5, gap: 2 }}>
                <OutlineButton onClick={() => setDetailOpen(false)}>
                  Fermer
                </OutlineButton>
                <GradientButton
                  onClick={() => { 
                    setDetailOpen(false); 
                    navigate(`/organizer/trips/${selectedSession.trip_id}/edit`);
                  }}
                >
                  Modifier
                </GradientButton>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Box>
  );
};

export default OrganizerCalendar;