import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDarkMode } from './useDarkMode';
import { getHeaderStyle, getRefreshIconColor } from '../utils/styles';

interface UseCommonHeaderProps {
  title: string;
  showRefresh?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  rightComponent?: React.ReactNode;
}

export const useCommonHeader = ({
  title,
  showRefresh = false,
  onRefresh,
  refreshing = false,
  rightComponent,
}: UseCommonHeaderProps) => {
  const navigation = useNavigation();
  const { isDarkMode } = useDarkMode();
  
  useEffect(() => {
    // Use the same background color as the main app layout
    const backgroundColor = isDarkMode ? '#0F172A' : '#F1F5F9';
    
    const headerRight = () => {
      if (rightComponent) return rightComponent;
      if (!showRefresh || !onRefresh) return null;
      
      return (
        <TouchableOpacity
          onPress={onRefresh}
          disabled={refreshing}
          style={{ marginRight: 15 }}
        >
          <Ionicons 
            name="refresh" 
            size={24} 
            color={getRefreshIconColor(isDarkMode, refreshing)}
          />
        </TouchableOpacity>
      );
    };
    
    navigation.setOptions({
      headerShown: true,
      title,
      headerStyle: {
        backgroundColor: backgroundColor,
        borderBottomWidth: 0, // Remove header border
        shadowOpacity: 0, // Remove iOS shadow
        elevation: 0, // Remove Android shadow
      },
      headerTintColor: isDarkMode ? '#60A5FA' : '#2563EB',
      headerTitleStyle: {
        fontSize: 18,
        fontWeight: '600',
        color: isDarkMode ? '#FFFFFF' : '#1E293B',
      },
      headerRight,
    });
  }, [navigation, isDarkMode, title, showRefresh, refreshing, rightComponent]);
};
