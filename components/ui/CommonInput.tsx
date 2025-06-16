import React, { forwardRef } from 'react';
import { TextInput, Text, View, TextStyle } from 'react-native';
import { useDarkMode } from '../../hooks/useDarkMode';
import { getInputStyle, getTextStyle, getPlaceholderColor } from '../../utils/styles';

interface CommonInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  variant?: 'default' | 'alt' | 'compact';
  keyboardType?: 'default' | 'numeric' | 'email-address';
  multiline?: boolean;
  className?: string;
  labelClassName?: string;
  secureTextEntry?: boolean;
  maxLength?: number;
  style?: TextStyle;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const CommonInput = forwardRef<TextInput, CommonInputProps>(({
  label,
  value,
  onChangeText,
  placeholder,
  variant = 'default',
  keyboardType = 'default',
  multiline = false,
  className = '',
  labelClassName = '',
  secureTextEntry = false,
  maxLength,
  style,
  onFocus,
  onBlur,
}, ref) => {
  const { isDarkMode } = useDarkMode();
  
  const inputClass = getInputStyle(isDarkMode, variant);
  const labelClass = `text-base font-medium mb-2 ${getTextStyle(isDarkMode, 'primary')} ${labelClassName}`;
  
  return (
    <View className={className}>
      {label && <Text className={labelClass}>{label}</Text>}
      <TextInput
        ref={ref}
        className={inputClass}
        style={multiline ? { 
          ...style, 
          textAlignVertical: 'top',
          paddingVertical: 12,
          paddingTop: 12,
          paddingBottom: 12,
          minHeight: 80,
          lineHeight: 20
        } : {
          ...style,
          textAlignVertical: 'center',
          includeFontPadding: false,
          paddingVertical: 12,
          paddingTop: 12,
          paddingBottom: 12,
          minHeight: 48,
          lineHeight: 20
        }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={getPlaceholderColor(isDarkMode)}
        keyboardType={keyboardType}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        maxLength={maxLength}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </View>
  );
});
