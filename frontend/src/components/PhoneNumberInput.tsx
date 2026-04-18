import React from 'react';
import PhoneInput from 'react-phone-number-input';
import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

const StyledPhoneInput = styled(PhoneInput)(({ theme }) => ({
  '& .PhoneInputInput': {
    width: '100%',
    padding: '12px 16px',
    fontSize: '1rem',
    borderRadius: theme.spacing(2),
    border: '1px solid rgba(0, 0, 0, 0.23)',
    outline: 'none',
    '&:focus': {
      borderColor: '#00BFA5',
      borderWidth: 2,
      boxShadow: '0 4px 20px rgba(0,191,165,0.2)',
    },
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0,191,165,0.1)',
    },
  },
  '& .PhoneInputCountrySelect': {
    border: 'none',
    background: 'transparent',
  },
  '& .PhoneInputCountryIcon': {
    width: 24,
    height: 18,
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
  return (
    <Box>
      {label && (
        <Typography 
          variant="body2" 
          sx={{ 
            mb: 0.5, 
            fontWeight: 600,
            color: error ? 'error.main' : 'text.primary' 
          }}
        >
          {label} {required && <span style={{ color: 'red' }}>*</span>}
        </Typography>
      )}
      <StyledPhoneInput
        value={value || undefined}
        onChange={onChange}
        defaultCountry={countryMap[defaultCountry] as any || defaultCountry as any}
        placeholder="+216 XX XXX XXX"
        countryCallingCodeEditable
        international
        withCountryCallingCode
        style={{
          '--PhoneInput-input-height': '48px',
        } as React.CSSProperties}
      />
      {helperText && (
        <Typography 
          variant="caption" 
          color={error ? 'error' : 'text.secondary'}
          sx={{ mt: 0.5, display: 'block' }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default PhoneNumberInput;