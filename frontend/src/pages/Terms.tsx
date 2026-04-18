import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Article,
  CheckCircle,
  Warning,
  Gavel,
  Security,
  EventAvailable,
  MoneyOff,
  CloudQueue,
} from '@mui/icons-material';

const TermsPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Article color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h4" component="h1">
            Terms & Conditions
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Dernière mise à jour : Avril 2026
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Gavel color="primary" />
            <Typography variant="h6">1. Réservation et paiement</Typography>
          </Box>
          <List dense>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Toutes les réservations sont confirmées après paiement intégral ou partiel selon les conditions de l'offre." />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Les prix indiqués sont en dinars tunisiens (TND) sauf indication contraire." />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Un acompte de 30% est généralement requis pour confirmer la réservation." />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Le solde doit être réglé avant la date de départ selon les modalités communiquées." />
            </ListItem>
          </List>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Security color="primary" />
            <Typography variant="h6">2. Politique d'annulation</Typography>
          </Box>
          <List dense>
            <ListItem>
              <ListItemIcon><Warning color="warning" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Plus de 60 jours avant le départ : remboursement intégral moins les frais de dossier (5%)." />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Entre 45 et 60 jours : 50% du montant remboursé." />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Entre 30 et 45 jours : 25% du montant remboursé." />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="error" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Moins de 30 jours : aucun remboursement, sauf cas de force majeure vérifiable." />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Vous pouvez choisir entre remboursement, bon d'achat ou reprogrammation selon les options disponibles." />
            </ListItem>
          </List>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <MoneyOff color="primary" />
            <Typography variant="h6">3. Remboursements</Typography>
          </Box>
          <List dense>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Les remboursements sont effectués dans un délai de 14 jours ouvrables." />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Le remboursement s'effectue sur le moyen de paiement utilisé lors de la réservation." />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Les bons d'achat sont valables pendant 12 mois à compter de leur emission." />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Les frais de dossier (5%) ne sont jamais remboursables." />
            </ListItem>
          </List>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <EventAvailable color="primary" />
            <Typography variant="h6">4. Modifications et reprogrammation</Typography>
          </Box>
          <List dense>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Vous pouvez reprogrammer votre voyage jusqu'à 7 jours avant la date de départ, sous réserve de disponibilité." />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Une différence de prix может s'appliquer si le nouveau voyage a un coût supérieur." />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="La reprogrammation n'est possible qu'une seule fois par réservation." />
            </ListItem>
          </List>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CloudQueue color="primary" />
            <Typography variant="h6">5. Force majeure</Typography>
          </Box>
          <List dense>
            <ListItem>
              <ListItemIcon><Warning color="warning" fontSize="small" /></ListItemIcon>
              <ListItemText primary="En cas de force majeure (catastrophe naturelle, pandémie, troubles politiques), le voyage peut être annulé sans frais." />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Dans ce cas, vous aurez le choix entre un remboursement intégral ou un bon d'achat de valeur équivalente." />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Les événements de force majeure doivent être justifiés par des pièces officielles." />
            </ListItem>
          </List>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Warning color="primary" />
            <Typography variant="h6">6. Responsabilités</Typography>
          </Box>
          <List dense>
            <ListItem>
              <ListItemIcon><Warning color="warning" fontSize="small" /></ListItemIcon>
              <ListItemText primary="TripBooking agit en tant qu'intermédiaire entre le voyageur et l'organisateur." />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Les organisateur sont responsables de la qualité des services fournis." />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" fontSize="small" /></ListItemIcon>
              <ListItemText primary="TripBooking ne peut être tenu responsable des circonstances indépendantes de sa volonté." />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Pour toute question concernant ces conditions, veuillez nous contacter à l'adresse support@tripbooking.tn ou via notre formulaire de contact.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsPage;