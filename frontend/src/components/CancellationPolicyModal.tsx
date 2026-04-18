import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  Link,
} from '@mui/material';
import {
  Cancel,
  CheckCircle,
  Replay,
  Article,
} from '@mui/icons-material';

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
  open,
  onClose,
  policy,
  onViewTerms,
}) => {
  if (!policy) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Politique d'annulation</DialogTitle>
        <DialogContent>
          <Typography>Chargement...</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fermer</Button>
        </DialogActions>
      </Dialog>
    );
  }

  const formatDays = (days: number) => {
    if (days === 0) return 'Jour du départ';
    if (days === 1) return '1 jour';
    return `${days} jours`;
  };

  const sortedRules = [...policy.rules].sort((a, b) => b.days - a.days);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Cancel color="primary" />
          Politique d'annulation
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Frais d'annulation selon le nombre de jours avant le départ :
        </Typography>

        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Délai avant départ</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Frais</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Remboursement</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRules.map((rule, index) => {
                const prevRule = sortedRules[index + 1];
                const daysBefore = prevRule ? prevRule.days - 1 : rule.days;
                const fees = 100 - rule.refund;
                
                return (
                  <TableRow key={index}>
                    <TableCell>
                      {rule.days > 0 ? `${formatDays(rule.days)} et plus` : formatDays(rule.days)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${fees}%`}
                        size="small"
                        color={fees === 0 ? 'success' : fees <= 25 ? 'warning' : 'error'}
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={rule.refund > 0 ? 600 : 400}>
                        {rule.refund}% remboursé
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>Options disponibles :</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {policy.allowVoucher && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle color="success" fontSize="small" />
              <Typography variant="body2">Bon d'achat (valable pour un futur voyage)</Typography>
            </Box>
          )}
          {policy.allowRebooking && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Replay color="primary" fontSize="small" />
              <Typography variant="body2">Reprogrammer pour une autre date</Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle color="success" fontSize="small" />
            <Typography variant="body2">Remboursement sur moyen de paiement initial</Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary">
            * Les frais sont calculés sur le montant total de la réservation.
            * Le remboursement sera effectuées dans les 14 jours ouvrables après l'annulation.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ flexDirection: 'column', alignItems: 'stretch', px: 3, pb: 2 }}>
        <Button
          startIcon={<Article />}
          onClick={onViewTerms}
          sx={{ mb: 1 }}
        >
          Voir Terms & Conditions
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose} variant="outlined" fullWidth>
            Fermer
          </Button>
          <Button onClick={onClose} variant="contained" color="primary" fullWidth>
            J'ai compris
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default CancellationPolicyModal;