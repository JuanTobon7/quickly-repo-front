import { useState, useEffect } from 'react';

type CurrencyInputProps = {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
};

export function CurrencyInput({
  value,
  onChange,
  placeholder = '0',
  className = '',
  disabled = false,
  min = 0,
  max,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Format number with thousands separators
  const formatNumber = (num: number): string => {
    if (num === 0) return '';
    return num.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Parse formatted string to number
  const parseFormattedNumber = (str: string): number => {
    const cleaned = str.replace(/\D/g, '');
    return cleaned ? parseInt(cleaned, 10) : 0;
  };

  // Update display value when prop value changes (only if not focused)
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatNumber(value));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Remove all non-numeric characters
    const numericValue = input.replace(/\D/g, '');
    
    // Parse to number
    const parsedValue = numericValue ? parseInt(numericValue, 10) : 0;
    
    // Apply min/max constraints
    let constrainedValue = parsedValue;
    if (min !== undefined && constrainedValue < min) constrainedValue = min;
    if (max !== undefined && constrainedValue > max) constrainedValue = max;
    
    // Update display with formatted value
    setDisplayValue(formatNumber(constrainedValue));
    
    // Notify parent
    onChange(constrainedValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
    // If value is 0, clear the display
    if (value === 0) {
      setDisplayValue('');
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Format the final value
    setDisplayValue(formatNumber(value));
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  );
}
