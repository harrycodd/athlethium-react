import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useDarkMode } from '../../hooks/useDarkMode';
import { getButtonStyle } from '../../utils/styles';

interface CommonButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'compact';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const CommonButton: React.FC<CommonButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
}) => {
  const { isDarkMode } = useDarkMode();
  
  const buttonClass = getButtonStyle(isDarkMode, variant);
  const textColor = variant === 'secondary' ? (isDarkMode ? 'text-gray-200' : 'text-slate-800') : 'text-white';
  
  return (
    <TouchableOpacity
      className={`${buttonClass} ${className}`}
      onPress={onPress}
      disabled={disabled || loading}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      {loading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <Text className={`font-bold text-base ${textColor}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
