import React from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css'; // Assure-toi d'importer le CSS de base
import { styled, alpha } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

const LUNA = {
  TEAL: '#0EA5A0',
  NAVY: '#0F2D5C',
  ERROR: '#d32f2f',
};

const StyledPhoneInputContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'error' && prop !== 'isFocused',
})<{ error?: boolean; isFocused?: boolean }>(({ theme, error, isFocused }) => ({
  '& .PhoneInput': {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '4px 16px',
    borderRadius: '12px',
    backgroundColor: '#fff',
    border: `1px solid ${error ? LUNA.ERROR : isFocused ? LUNA.TEAL : alpha(LUNA.NAVY, 0.2)}`,
    boxShadow: isFocused ? `0 0 0 3px ${alpha(LUNA.TEAL, 0.1)}` : 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: error ? LUNA.ERROR : LUNA.TEAL,
    },
  },
  '& .PhoneInputInput': {
    flex: 1,
    border: 'none',
    outline: 'none',
    height: '48px',
    fontSize: '1rem',
    fontWeight: 500,
    color: LUNA.NAVY,
    background: 'transparent',
    '&::placeholder': {
      color: alpha(LUNA.NAVY, 0.4),
    },
  },
  '& .PhoneInputCountrySelectContainer': {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  '& .PhoneInputCountrySelect': {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    zIndex: 1,
    border: 'none',
    opacity: 0,
    cursor: 'pointer',
  },
  '& .PhoneInputCountryIcon': {
    width: '28px',
    height: 'auto',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
}));

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string | undefined) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  defaultCountry?: string;
}

const countryMap: Record<string, string> = {
  'Tunisia': 'TN',
  'Algeria': 'DZ',
  'Morocco': 'MA',
  'Libya': 'LY',
  'Egypt': 'EG',
};

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value,
  onChange,
  label,
  error,
  helperText,
  required,
  defaultCountry = 'TN',
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <Box sx={{ width: '100%' }}>
      {label && (
        <Typography 
          variant="body2" 
          sx={{ 
            mb: 1, 
            fontWeight: 700,
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: error ? LUNA.ERROR : alpha(LUNA.NAVY, 0.8)
          }}
        >
          {label} {required && <span style={{ color: LUNA.ERROR }}>*</span>}
        </Typography>
      )}

      <StyledPhoneInputContainer error={error} isFocused={isFocused}>
        <PhoneInput
          value={value || undefined}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          defaultCountry={countryMap[defaultCountry] as any || defaultCountry as any}
          placeholder="+216 XX XXX XXX"
          international
          withCountryCallingCode
        />
      </StyledPhoneInputContainer>

      {helperText && (
        <Typography 
          variant="caption" 
          sx={{ 
            mt: 0.75, 
            display: 'block',
            fontWeight: 500,
            color: error ? LUNA.ERROR : 'text.secondary',
            ml: 1
          }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default PhoneNumberInput;