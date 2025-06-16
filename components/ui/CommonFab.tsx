import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDarkMode } from '../../hooks/useDarkMode';
import { getFabStyle, getRefreshIconColor } from '../../utils/styles';

interface CommonFabProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'refresh';
}

export const CommonFab: React.FC<CommonFabProps> = ({
  icon,
  onPress,
  className = '',
  disabled = false,
  variant = 'default',
}) => {
  const { isDarkMode } = useDarkMode();
  
  const fabClass = getFabStyle(isDarkMode);
  const iconColor = variant === 'refresh' 
    ? getRefreshIconColor(isDarkMode, disabled)
    : 'white';
  
  return (
    <TouchableOpacity
      className={`${fabClass} ${className}`}
      onPress={onPress}
      disabled={disabled}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Ionicons name={icon} size={24} color={iconColor} />
    </TouchableOpacity>
  );
};
