import React from 'react';
import { Container, Typography, Box, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';

// --- NOUVELLE PALETTE "LUNA" ---
const LUNA_LIGHT = '#A7EBF2';  // Pour les accents et titres (remplace Light Teal)
const LUNA_MED = '#26658C';    // Pour les numéros en fond (remplace Pale Teal)
const LUNA_DARK = '#011C40';   // Pour le texte principal (remplace Text Dark)

const TermsPage: React.FC = () => {
  const sections = [
    {
      id: "01",
      title: "Réservation et paiement",
      content: [
        "Confirmation après paiement intégral ou partiel.",
        "Prix indiqués en dinars tunisiens (TND).",
        "Acompte de 30% requis pour valider le dossier.",
        "Solde à régler avant la date de départ prévue."
      ]
    },
    {
      id: "02",
      title: "Politique d'annulation",
      content: [
        "Plus de 60 jours : Remboursement (frais de dossier 5% retenus).",
        "45 à 60 jours : 50% de frais d'annulation.",
        "Moins de 30 jours : Non remboursable (sauf cas de force majeure)."
      ]
    },
    {
      id: "03",
      title: "Remboursements",
      content: [
        "Délai de traitement de 14 jours ouvrables.",
        "Retour sur le moyen de paiement d'origine.",
        "Bons d'achat valables 12 mois."
      ]
    }
  ];

  return (
    <Container maxWidth="md" sx={{ py: 12 }}>
      
      {/* Header Minimaliste - Utilisation de Luna Light */}
      <Box sx={{ mb: 10, textAlign: 'center' }}>
        <Typography 
          variant="h2" 
          fontWeight={300}
          sx={{ color: LUNA_DARK, mt: 1, letterSpacing: -0.5 }}
        >
          Terms & <span style={{ color: LUNA_MED, fontWeight: 700 }}>Conditions</span>
        </Typography>
      </Box>

      <Stack spacing={10}>
        {sections.map((section) => (
          <Box key={section.id} sx={{ position: 'relative' }}>
            
            {/* Le numéro "Luna Med" en fond pour le style */}
            <Typography sx={{ 
              position: 'absolute', top: -35, left: -20, 
              fontSize: 100, fontWeight: 900, 
              color: alpha(LUNA_LIGHT, 0.2), // Utilisation du bleu très clair pour le fond
              zIndex: -1,
              fontFamily: 'serif'
            }}>
              {section.id}
            </Typography>

            <Box sx={{ pl: 4 }}>
              <Typography variant="h5" fontWeight={700} sx={{ color: LUNA_MED, mb: 4 }}>
                {section.title}
              </Typography>

              <Stack spacing={2.5}>
                {section.content.map((text, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    {/* Petite puce carrée stylisée en Luna Light */}
                    <Box sx={{ 
                      width: 8, height: 8, 
                      bgcolor: LUNA_LIGHT, 
                      mt: 1, 
                      borderRadius: '2px', 
                      flexShrink: 0 
                    }} />
                    <Typography variant="body1" sx={{ color: LUNA_DARK, lineHeight: 1.8, fontSize: '1.05rem' }}>
                      {text}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        ))}
      </Stack>

      {/* Footer doux - Utilisation du gradient Luna */}
      <Box sx={{ 
        mt: 15, p: 6, borderRadius: 8, 
        background: `linear-gradient(135deg, ${alpha(LUNA_LIGHT, 0.2)} 0%, ${alpha(LUNA_MED, 0.05)} 100%)`,
        border: `1px solid ${alpha(LUNA_MED, 0.2)}`,
        textAlign: 'center'
      }}>
        <Typography variant="h6" fontWeight={700} sx={{ color: LUNA_MED, mb: 1 }}>
          Une question ?
        </Typography>
        <Typography variant="body1" sx={{ color: LUNA_DARK, opacity: 0.8 }}>
          Écrivez-nous à <span style={{ borderBottom: `2px solid ${LUNA_LIGHT}`, fontWeight: 600 }}>support@tripbooking.tn</span>
        </Typography>
      </Box>

    </Container>
  );
};

export default TermsPage;