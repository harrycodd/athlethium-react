import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { useDarkMode } from '../../hooks/useDarkMode';
import { getPickerStyle, getTextStyle } from '../../utils/styles';

interface CommonPickerProps {
  label?: string;
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const CommonPicker: React.FC<CommonPickerProps> = ({
  label,
  value,
  options,
  onValueChange,
  placeholder = 'Select option',
  className = '',
  disabled = false,
}) => {
  const { isDarkMode } = useDarkMode();
  
  const pickerClass = getPickerStyle(isDarkMode);
  const labelClass = `text-base font-medium mb-2 ${getTextStyle(isDarkMode, 'primary')}`;
  const textClass = `text-base ${getTextStyle(isDarkMode, 'primary')}`;
  
  const handlePress = () => {
    if (disabled) return;
    
    const currentIndex = options.indexOf(value);
    const nextIndex = (currentIndex + 1) % options.length;
    onValueChange(options[nextIndex]);
  };
  
  return (
    <View className={className}>
      {label && <Text className={labelClass}>{label}</Text>}
      <TouchableOpacity
        className={pickerClass}
        onPress={handlePress}
        disabled={disabled}
        style={{ opacity: disabled ? 0.5 : 1 }}
      >
        <Text className={textClass}>
          {value || placeholder}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
