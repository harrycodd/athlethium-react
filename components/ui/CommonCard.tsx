import React from 'react';
import { View, Text } from 'react-native';
import { useDarkMode } from '../../hooks/useDarkMode';
import { getCardStyle, getTextStyle } from '../../utils/styles';

interface CommonCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: 'default' | 'alt';
  className?: string;
  borderLeftColor?: string;
}

export const CommonCard: React.FC<CommonCardProps> = ({
  title,
  subtitle,
  children,
  variant = 'default',
  className = '',
  borderLeftColor,
}) => {
  const { isDarkMode } = useDarkMode();
  
  const cardClass = getCardStyle(isDarkMode, variant);
  const titleClass = `text-lg font-semibold mb-2 ${getTextStyle(isDarkMode, 'primary')}`;
  const subtitleClass = `text-sm mb-4 ${getTextStyle(isDarkMode, 'muted')}`;
  
  const cardStyle = borderLeftColor ? {
    borderLeftWidth: 4,
    borderLeftColor,
  } : undefined;
  
  return (
    <View 
      className={`${cardClass} ${className}`}
      style={cardStyle}
    >
      {title && <Text className={titleClass}>{title}</Text>}
      {subtitle && <Text className={subtitleClass}>{subtitle}</Text>}
      {children}
    </View>
  );
};
