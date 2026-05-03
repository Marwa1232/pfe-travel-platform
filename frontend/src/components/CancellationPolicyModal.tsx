import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip,
  Divider, Stack
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Cancel, CheckCircle, Replay, Article, HelpOutline
} from '@mui/icons-material';

// --- PALETTE LUNA ---
const LUNA = {
  PALE: '#A7EBF2',
  MED: '#26658C',
  DEEP: '#023859',
  NIGHT: '#011C40',
  SUCCESS: '#00BFA5',
  WARNING: '#FFB74D',
  ERROR: '#FF5252',
};

interface PolicyModalProps {
  open: boolean;
  onClose: () => void;
  policy: {
    rules: { days: number; refund: number }[];
    allowVoucher: boolean;
    allowRebooking: boolean;
  } | null;
  onViewTerms: () => void;
}

const CancellationPolicyModal: React.FC<PolicyModalProps> = ({
  open, onClose, policy, onViewTerms,
}) => {
  if (!policy) return null;

  const formatDays = (days: number) => {
    if (days === 0) return 'Jour J';
    return `${days} jours`;
  };

  const sortedRules = [...policy.rules].sort((a, b) => b.days - a.days);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{ 
        sx: { borderRadius: 4, boxShadow: '0 20px 40px rgba(1, 28, 64, 0.2)' } 
      }}
    >
      <DialogTitle sx={{ bgcolor: alpha(LUNA.PALE, 0.1), py: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ 
            display: 'flex', p: 1, borderRadius: 2, 
            bgcolor: alpha(LUNA.MED, 0.1), color: LUNA.MED 
          }}>
            <Cancel fontSize="small" />
          </Box>
          <Typography variant="h6" fontWeight={800} color={LUNA.NIGHT}>
            Politique d'annulation
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="body2" sx={{ mb: 3, color: LUNA.DEEP, fontWeight: 500 }}>
          Le remboursement dépend du délai entre l'annulation et le départ :
        </Typography>

        <TableContainer 
          component={Paper} 
          elevation={0} 
          sx={{ 
            mb: 4, border: `1px solid ${alpha(LUNA.MED, 0.1)}`, 
            borderRadius: 3, overflow: 'hidden' 
          }}
        >
          <Table size="small">
            <TableHead sx={{ bgcolor: alpha(LUNA.PALE, 0.05) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: LUNA.MED }}>Délai</TableCell>
                <TableCell sx={{ fontWeight: 700, color: LUNA.MED }}>Frais</TableCell>
                <TableCell sx={{ fontWeight: 700, color: LUNA.MED }} align="right">Remboursement</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRules.map((rule, index) => {
                const fees = 100 - rule.refund;
                const isFree = fees === 0;

                return (
                  <TableRow key={index} sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 600, color: LUNA.NIGHT }}>
                      {rule.days > 0 ? `> ${formatDays(rule.days)}` : 'Dernier moment'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={isFree ? 'Gratuit' : `${fees}%`}
                        size="small"
                        sx={{ 
                          fontWeight: 700,
                          bgcolor: isFree ? alpha(LUNA.SUCCESS, 0.1) : alpha(LUNA.ERROR, 0.05),
                          color: isFree ? LUNA.SUCCESS : LUNA.ERROR,
                          border: `1px solid ${isFree ? LUNA.SUCCESS : alpha(LUNA.ERROR, 0.2)}`
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: LUNA.DEEP }}>
                      {rule.refund}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="overline" sx={{ color: LUNA.MED, fontWeight: 800, letterSpacing: 1.2 }}>
          Options de compensation
        </Typography>
        
        <Stack spacing={1.5} sx={{ mt: 1, mb: 3 }}>
          {[
            { show: policy.allowVoucher, icon: <HelpOutline />, text: "Bon d'achat valable 12 mois" },
            { show: policy.allowRebooking, icon: <Replay />, text: "Reprogrammation flexible" },
            { show: true, icon: <CheckCircle />, text: "Crédit direct sur votre compte" }
          ].filter(opt => opt.show).map((opt, i) => (
            <Stack key={i} direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ color: LUNA.SUCCESS, display: 'flex' }}>
                {React.cloneElement(opt.icon as React.ReactElement, { sx: { fontSize: 18 } })}
              </Box>
              <Typography variant="body2" fontWeight={500} color={LUNA.DEEP}>{opt.text}</Typography>
            </Stack>
          ))}
        </Stack>

        <Box sx={{ p: 2, bgcolor: alpha(LUNA.PALE, 0.1), borderRadius: 3, border: `1px dashed ${LUNA.PALE}` }}>
          <Typography variant="caption" sx={{ color: LUNA.MED, display: 'block', fontStyle: 'italic' }}>
            * Remboursement effectué sous 14 jours ouvrables.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0, flexDirection: 'column', gap: 1.5 }}>
        <Button
          fullWidth
          startIcon={<Article />}
          onClick={onViewTerms}
          sx={{ 
            color: LUNA.MED, fontWeight: 700, textTransform: 'none',
            '&:hover': { bgcolor: alpha(LUNA.MED, 0.05) }
          }}
        >
          Lire les conditions complètes
        </Button>
        <Button 
          fullWidth 
          onClick={onClose} 
          variant="contained" 
          sx={{ 
            bgcolor: LUNA.NIGHT, borderRadius: 3, py: 1.2, fontWeight: 700,
            textTransform: 'none',
            '&:hover': { bgcolor: LUNA.DEEP }
          }}
        >
          J'ai compris
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancellationPolicyModal;