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
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import api from '../../services/api';

const PRIMARY = '#00BFA5';
const SECONDARY = '#0D47A1';

// ─── Types ────────────────────────────────────────────
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

// ─── Styled ───────────────────────────────────────────
const CalendarPaper = styled(Paper)({
  borderRadius: 20,
  boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
  border: `1px solid ${alpha(PRIMARY, 0.1)}`,
  overflow: 'hidden',
});

const DayCell = styled(Box, {
  shouldForwardProp: (p) => p !== 'isToday' && p !== 'isOtherMonth' && p !== 'isSelected',
})<{ isToday?: boolean; isOtherMonth?: boolean; isSelected?: boolean }>(
  ({ isToday, isOtherMonth, isSelected }) => ({
    minHeight: 110,
    padding: '8px 10px',
    borderRight: `1px solid #f0f3f7`,
    borderBottom: `1px solid #f0f3f7`,
    backgroundColor: isSelected
      ? alpha(PRIMARY, 0.04)
      : isOtherMonth
      ? '#fafbfc'
      : '#ffffff',
    cursor: 'pointer',
    transition: 'background 0.15s',
    '&:hover': { backgroundColor: alpha(PRIMARY, 0.04) },
    position: 'relative',
  })
);

const DayNumber = styled(Box, {
  shouldForwardProp: (p) => p !== 'isToday' && p !== 'isWeekend',
})<{ isToday?: boolean; isWeekend?: boolean }>(({ isToday, isWeekend }) => ({
  width: 28,
  height: 28,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 13,
  fontWeight: isToday ? 700 : 500,
  backgroundColor: isToday ? SECONDARY : 'transparent',
  color: isToday ? '#fff' : isWeekend ? '#F44336' : '#374151',
  marginBottom: 4,
}));

const EventPill = styled(Box)<{ color?: string }>(({ color }) => ({
  fontSize: 11,
  fontWeight: 600,
  padding: '2px 7px',
  borderRadius: 6,
  marginBottom: 3,
  backgroundColor: color || alpha(PRIMARY, 0.12),
  color: color ? '#fff' : PRIMARY,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  cursor: 'pointer',
  transition: 'opacity 0.15s',
  '&:hover': { opacity: 0.85 },
}));

// ─── Color palette for trips ──────────────────────────
const TRIP_COLORS = [
  PRIMARY,
  SECONDARY,
  '#FF9800',
  '#9C27B0',
  '#F44336',
  '#2196F3',
  '#4CAF50',
  '#E91E63',
];

const getTripColor = (tripId: number) => TRIP_COLORS[tripId % TRIP_COLORS.length];

// ─── Helpers ──────────────────────────────────────────
const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS_FR   = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

const isSameDay = (a: Date, b: Date) =>
  a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

const getCalendarDays = (year: number, month: number) => {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  // Monday-based week
  let startDow = first.getDay(); // 0=Sun
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
  const map: Record<string, { label: string; color: string; bg: string }> = {
    OPEN:      { label: 'Ouvert',    color: PRIMARY,   bg: alpha(PRIMARY, 0.1) },
    FULL:      { label: 'Complet',   color: '#FF9800', bg: alpha('#FF9800', 0.1) },
    CANCELLED: { label: 'Annulé',    color: '#F44336', bg: alpha('#F44336', 0.1) },
    CLOSED:    { label: 'Fermé',     color: '#9E9E9E', bg: alpha('#9E9E9E', 0.1) },
  };
  return map[status] || { label: status, color: '#999', bg: '#f5f5f5' };
};

// ─── Week view helpers ────────────────────────────────
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

// ─── Main Component ───────────────────────────────────
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
      // Fetch trips then extract sessions
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

  // Header label
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
    <Container maxWidth="xl" sx={{ py: 3 }}>

      {/* ── Page Header ─────────────────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ color: SECONDARY }}>Calendrier</Typography>
          <Typography variant="body2" color="text.secondary">
            {today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={syncing ? <CircularProgress size={14} /> : <Sync />}
            onClick={handleSync}
            disabled={syncing}
            sx={{
              borderRadius: 2, textTransform: 'none', fontWeight: 600,
              borderColor: alpha(PRIMARY, 0.4), color: PRIMARY,
              '&:hover': { borderColor: PRIMARY, bgcolor: alpha(PRIMARY, 0.05) },
            }}
          >
            Sync Now
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/organizer/trips/new')}
            sx={{
              borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2.5,
              background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
              boxShadow: `0 4px 14px ${alpha(PRIMARY, 0.4)}`,
              '&:hover': { background: `linear-gradient(135deg, ${SECONDARY}, ${PRIMARY})`, transform: 'translateY(-1px)' },
            }}
          >
            + Add new task
          </Button>
        </Box>
      </Box>

      {/* ── Calendar Card ────────────────────────────── */}
      <CalendarPaper>
        {/* Toolbar */}
        <Box sx={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          px: 3, py: 2, borderBottom: `1px solid #f0f3f7`,
        }}>
          {/* Left: Today + arrows + title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={goToday}
              sx={{
                borderRadius: 2, textTransform: 'none', fontWeight: 600, minWidth: 70,
                borderColor: alpha(SECONDARY, 0.3), color: SECONDARY,
                '&:hover': { borderColor: SECONDARY, bgcolor: alpha(SECONDARY, 0.04) },
              }}
            >
              Today
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton size="small" onClick={prevPeriod}
                sx={{ color: '#9CA3AF', '&:hover': { color: SECONDARY } }}
              >
                <ChevronLeft />
              </IconButton>
              <IconButton size="small" onClick={nextPeriod}
                sx={{ color: '#9CA3AF', '&:hover': { color: SECONDARY } }}
              >
                <ChevronRight />
              </IconButton>
            </Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: SECONDARY, minWidth: 220 }}>
              {headerLabel}
            </Typography>
          </Box>

          {/* Right: Month/Week toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, v) => v && setViewMode(v)}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                textTransform: 'none', fontWeight: 600, fontSize: 13,
                border: `1px solid ${alpha(SECONDARY, 0.2)}`,
                color: '#6B7280', px: 2,
                '&.Mui-selected': {
                  bgcolor: SECONDARY, color: '#fff',
                  '&:hover': { bgcolor: SECONDARY },
                },
              },
            }}
          >
            <ToggleButton value="month">Month</ToggleButton>
            <ToggleButton value="week">Week</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: PRIMARY }} />
          </Box>
        ) : viewMode === 'month' ? (
          // ── Month View ────────────────────────────────
          <>
            {/* Day headers */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: `1px solid #f0f3f7` }}>
              {DAYS_FR.map((d, i) => (
                <Box key={d} sx={{
                  py: 1.5, textAlign: 'center',
                  fontSize: 12, fontWeight: 700,
                  color: i >= 5 ? '#F44336' : '#9CA3AF',
                  letterSpacing: 0.5,
                  borderRight: i < 6 ? `1px solid #f0f3f7` : 'none',
                }}>
                  {d}
                </Box>
              ))}
            </Box>

            {/* Grid */}
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
                        color={session.status === 'CANCELLED' ? '#9E9E9E' : session.color}
                        onClick={(e) => openDetail(session, e)}
                        title={session.trip_title}
                      >
                        • {session.trip_title}
                      </EventPill>
                    ))}

                    {extra > 0 && (
                      <Typography variant="caption" sx={{ color: PRIMARY, fontWeight: 700, fontSize: 10, pl: 0.5 }}>
                        +{extra} more
                      </Typography>
                    )}
                  </DayCell>
                );
              })}
            </Box>
          </>
        ) : (
          // ── Week View ─────────────────────────────────
          <>
            {/* Day headers */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: `1px solid #f0f3f7` }}>
              {weekDays.map((date, i) => {
                const isToday = isSameDay(date, today);
                const isWeekend = i >= 5;
                return (
                  <Box key={i} sx={{
                    py: 2, textAlign: 'center',
                    borderRight: i < 6 ? `1px solid #f0f3f7` : 'none',
                    bgcolor: isToday ? alpha(SECONDARY, 0.04) : 'transparent',
                  }}>
                    <Typography variant="caption" sx={{
                      display: 'block', fontWeight: 700, letterSpacing: 0.5,
                      color: isWeekend ? '#F44336' : '#9CA3AF', mb: 0.5,
                    }}>
                      {DAYS_FR[i]}
                    </Typography>
                    <Box sx={{
                      width: 34, height: 34, borderRadius: '50%', mx: 'auto',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: isToday ? SECONDARY : 'transparent',
                    }}>
                      <Typography variant="body1" fontWeight={700}
                        sx={{ color: isToday ? '#fff' : isWeekend ? '#F44336' : SECONDARY }}
                      >
                        {date.getDate()}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Week cells */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {weekDays.map((date, i) => {
                const isToday = isSameDay(date, today);
                const daySessions = sessions.filter(s => sessionSpansDay(s, date));
                return (
                  <Box key={i} sx={{
                    minHeight: 200, p: 1.5,
                    borderRight: i < 6 ? `1px solid #f0f3f7` : 'none',
                    bgcolor: isToday ? alpha(SECONDARY, 0.02) : 'transparent',
                  }}>
                    {daySessions.map(session => (
                      <Box
                        key={session.id}
                        onClick={(e) => openDetail(session, e)}
                        sx={{
                          p: 1, borderRadius: 2, mb: 1, cursor: 'pointer',
                          bgcolor: session.status === 'CANCELLED' ? alpha('#9E9E9E', 0.1) : alpha(session.color!, 0.12),
                          borderLeft: `3px solid ${session.status === 'CANCELLED' ? '#9E9E9E' : session.color}`,
                          transition: 'all 0.15s',
                          '&:hover': { transform: 'translateX(2px)', opacity: 0.9 },
                        }}
                      >
                        <Typography variant="caption" fontWeight={700}
                          sx={{ color: session.status === 'CANCELLED' ? '#9E9E9E' : session.color, display: 'block' }}
                        >
                          • {session.trip_title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: 10 }}>
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

      {/* ── Legend ───────────────────────────────────── */}
      {sessions.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>
          {Array.from(new Map(sessions.map(s => [s.trip_id, s])).values()).map(s => (
            <Box key={s.trip_id} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: s.color }} />
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                {s.trip_title}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* ── Session Detail Dialog ─────────────────────── */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        {selectedSession && (
          <>
            {/* Colored top bar */}
            <Box sx={{
              height: 6,
              background: `linear-gradient(90deg, ${selectedSession.color}, ${alpha(selectedSession.color!, 0.5)})`,
            }} />

            <DialogTitle sx={{ pt: 2.5, pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: 2,
                  bgcolor: alpha(selectedSession.color!, 0.12),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FlightTakeoff sx={{ fontSize: 18, color: selectedSession.color }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ color: SECONDARY, lineHeight: 1.2 }}>
                    {selectedSession.trip_title}
                  </Typography>
                  <Chip
                    size="small"
                    label={getStatusMeta(selectedSession.status).label}
                    sx={{
                      height: 20, fontSize: 10, fontWeight: 700, mt: 0.5,
                      bgcolor: getStatusMeta(selectedSession.status).bg,
                      color: getStatusMeta(selectedSession.status).color,
                    }}
                  />
                </Box>
              </Box>
            </DialogTitle>

            <DialogContent sx={{ pb: 2 }}>
              {[
                {
                  icon: <AccessTime sx={{ fontSize: 16, color: '#9CA3AF' }} />,
                  label: 'Période',
                  value: `${new Date(selectedSession.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} → ${new Date(selectedSession.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`,
                },
                {
                  icon: <People sx={{ fontSize: 16, color: '#9CA3AF' }} />,
                  label: 'Places',
                  value: `${selectedSession.available_seats} disponibles / ${selectedSession.max_capacity} total`,
                },
              ].map(item => (
                <Box key={item.label} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                  <Box sx={{ mt: 0.2 }}>{item.icon}</Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>{item.value}</Typography>
                  </Box>
                </Box>
              ))}

              {/* Capacity bar */}
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">Taux de remplissage</Typography>
                  <Typography variant="caption" fontWeight={700} sx={{ color: selectedSession.color }}>
                    {Math.round(((selectedSession.max_capacity - selectedSession.available_seats) / selectedSession.max_capacity) * 100)}%
                  </Typography>
                </Box>
                <Box sx={{ height: 6, borderRadius: 3, bgcolor: alpha(selectedSession.color!, 0.15), overflow: 'hidden' }}>
                  <Box sx={{
                    height: '100%', borderRadius: 3,
                    width: `${((selectedSession.max_capacity - selectedSession.available_seats) / selectedSession.max_capacity) * 100}%`,
                    bgcolor: selectedSession.color,
                    transition: 'width 0.5s ease',
                  }} />
                </Box>
              </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
              <Button onClick={() => setDetailOpen(false)} variant="outlined" size="small"
                sx={{ borderRadius: 2, textTransform: 'none', borderColor: alpha(PRIMARY, 0.4), color: PRIMARY }}
              >
                Fermer
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={() => { setDetailOpen(false); navigate(`/organizer/trips/${selectedSession.trip_id}/edit`); }}
                sx={{
                  borderRadius: 2, textTransform: 'none',
                  background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
                  '&:hover': { background: `linear-gradient(135deg, ${SECONDARY}, ${PRIMARY})` },
                }}
              >
                Modifier
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default OrganizerCalendar;