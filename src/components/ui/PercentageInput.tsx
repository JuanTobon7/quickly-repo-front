import { useState, useEffect } from 'react';

type PercentageInputProps = {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  decimals?: number;
};

export function PercentageInput({
  value,
  onChange,
  placeholder = '0',
  className = '',
  disabled = false,
  min = 0,
  max = 100,
  decimals = 2,
}: PercentageInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Format number with decimals
  const formatNumber = (num: number): string => {
    if (num === 0) return '';
    return num.toFixed(decimals).replace(/\.?0+$/, '');
  };

  // Parse formatted string to number
  const parseFormattedNumber = (str: string): number => {
    const cleaned = str.replace(',', '.');
    return cleaned ? parseFloat(cleaned) : 0;
  };

  // Update display value when prop value changes (only if not focused)
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatNumber(value));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Allow numbers and decimal separator
    const numericValue = input.replace(/[^\d.,]/g, '').replace(',', '.');
    
    // Parse to number
    const parsedValue = numericValue ? parseFloat(numericValue) : 0;
    
    // Apply min/max constraints
    let constrainedValue = parsedValue;
    if (min !== undefined && constrainedValue < min) constrainedValue = min;
    if (max !== undefined && constrainedValue > max) constrainedValue = max;
    
    // Update display
    setDisplayValue(numericValue);
    
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
      inputMode="decimal"
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
