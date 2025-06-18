// ===============================================
// CALENDAR SCREEN - TRAINING SCHEDULE & PLANNING
// ===============================================
// This screen displays a calendar view of training sessions,
// allows scheduling and editing of workouts, and provides
// daily metrics tracking and planning functionality.

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, Modal, TextInput, Platform, ScrollView, RefreshControl } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDarkMode } from '../hooks/commonHooks';
import { getFitnessLevelText, getFatigueLevelText } from '../utils/commonUtils';
import { getThemedStyles } from '../styling';
import '../../global.css';

const screenWidth = Dimensions.get('window').width;

// ===============================================
// UTILITY FUNCTIONS
// ===============================================

// Helper function to capitalize the first letter of a string
function capitalizeFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ===============================================
// TYPE DEFINITIONS
// ===============================================

// Daily metrics interface
interface DailyMetrics {
  ctl: number;
  atl: number;
  form: number;
  physicallyFeeling: number;
  mentallyFeeling: number;
  sleep: number;
  weight: number;
  illness: string;
  injury: string;
}

// ===============================================
// MAIN CALENDAR COMPONENT
// ===============================================

const CalendarScreen = () => {
  
  // =====================================
  // HOOKS & STATE MANAGEMENT
  // =====================================
  
  const { isDarkMode } = useDarkMode();
  const styles = getThemedStyles(isDarkMode);

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [calendarData, setCalendarData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [scheduledHours, setScheduledHours] = useState<string>('');
  const [fabOpen, setFabOpen] = useState(false);
  const [monthScheduledHours, setMonthScheduledHours] = useState<Record<string, string>>({});
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editHours, setEditHours] = useState(scheduledHours);

  const [refreshing, setRefreshing] = useState(false);
  
  // Daily metrics state
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Helper to get a friendly label for the selected date
  const getSelectedDateLabel = () => {
    const today = new Date();
    const selected = new Date(selectedDate);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (
      selected.getFullYear() === today.getFullYear() &&
      selected.getMonth() === today.getMonth() &&
      selected.getDate() === today.getDate()
    ) {
      return 'Today';
    } else if (
      selected.getFullYear() === tomorrow.getFullYear() &&
      selected.getMonth() === tomorrow.getMonth() &&
      selected.getDate() === tomorrow.getDate()
    ) {
      return 'Tomorrow';
    } else if (
      selected.getFullYear() === yesterday.getFullYear() &&
      selected.getMonth() === yesterday.getMonth() &&
      selected.getDate() === yesterday.getDate()
    ) {
      return 'Yesterday';
    } else {
      return selected.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  };

  // Fetch user ID on component mount
  useEffect(() => {
    getUserId();
  }, []);

  // Only fetch training for the selected day
  useEffect(() => {
    if (userId) {
      fetchTrainingForDate(selectedDate);
      initializeDailyMetrics(selectedDate);
    }
  }, [userId, selectedDate]);

  // Mark the selected day on the calendar
  useEffect(() => {
    setMarkedDates({
      [selectedDate]: {
        selected: true,
        selectedColor: isDarkMode ? '#2563EB' : '#3B82F6',
      },
    });
  }, [selectedDate, isDarkMode]);

  // Initialize with default data when userId is available
  useEffect(() => {
    if (userId && selectedDate) {
      setScheduledHours('2'); // Default scheduled hours
      setError(null);
    }
  }, [userId, selectedDate]);

  // Initialize month scheduled hours with default data
  useEffect(() => {
    if (!userId || !selectedDate) return;
    const [year, month] = selectedDate.split('-');
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    const newScheduled: Record<string, string> = {};
    
    for (let day = 1; day <= lastDay; day++) {
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `${year}-${month}-${dayStr}`;
      newScheduled[dateStr] = Math.floor(Math.random() * 3 + 1).toString(); // Random 1-3 hours for demo
    }
    setMonthScheduledHours(newScheduled);
  }, [userId, selectedDate]);

  // Get user ID from AsyncStorage
  const getUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        setUserId(storedUserId);
      } else {
        setError('User not authenticated');
      }
    } catch (err) {
      setError('Error retrieving user information');
    }
  };

  // Fetch training data for a specific date
  const fetchTrainingForDate = async (date: string) => {
    if (!userId) return;

    setLoading(true);
    try {
      // Mock training data instead of API call
      const mockTrainingData = [
        {
          id: '1',
          name: 'Morning Run',
          event_type: 'run',
          sport: 'Running',
          time: '01:00:00',
          description: 'Easy recovery run',
          duration: '1 hour',
        },
        {
          id: '2',
          name: 'Strength Training',
          event_type: 'strength',
          sport: 'Strength',
          time: '00:45:00',
          description: 'Upper body focus',
          duration: '45 minutes',
        }
      ];

      setCalendarData(prevData => ({
        ...prevData,
        [date]: mockTrainingData
      }));
      
      setError(null);
    } catch (err: any) {
      setCalendarData(prevData => ({
        ...prevData,
        [date]: []
      }));
      setError('Error fetching training data');
    } finally {
      setLoading(false);
    }
  };

  // Initialize with mock daily metrics
  const initializeDailyMetrics = async (date: string) => {
    if (!userId) return;

    // Mock metrics data
    const mockMetrics = {
      ctl: 120,
      atl: 95,
      form: 25,
      physicallyFeeling: 3,
      mentallyFeeling: 4,
      sleep: 3,
      weight: 70,
      illness: 'None',
      injury: 'None',
    };
    
    setDailyMetrics(mockMetrics);
  };

  // Function to handle saving edited hours (local only)
  const saveEditedHours = async () => {
    if (!userId || !selectedDate) return;
    try {
      console.log('Hours would be saved:', editHours);
      setScheduledHours((parseFloat(editHours) || 0).toString());
      setEditModalVisible(false);
    } catch (err) {
      console.error('Error saving hours:', err);
    }
  };

  // Get entries for the selected date
  const entries = calendarData[selectedDate] || [];

  const onDayPress = (day: any) => {
    setSelectedDate(day.dateString);
  };

  const renderItem = ({ item }: { item: any }) => {
    const sessionDate = new Date(selectedDate);
    const currentDate = new Date();
    const isCompleted = item.timeStamp && new Date(item.timeStamp * 1000) < currentDate;

    const handleSessionPress = () => {
      const workoutId = item.id || item.workoutId;
      if (isCompleted) {
        (navigation as any).navigate('analysis', { workoutId });
      } else {
        (navigation as any).navigate('SessionDetails', { 
          date: selectedDate, 
          sessionId: workoutId,
          viewOnly: true
        });
      }
    };
    
    return (
      <TouchableOpacity 
        className={`p-4 rounded-2xl border ${
          isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white border-gray-200'
        }`}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDarkMode ? 0.2 : 0.08,
          shadowRadius: 8,
          elevation: 3,
          marginBottom: 16,
        }}
        onPress={handleSessionPress}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center justify-between mb-2">
          <Text className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {item.name || item.event_type || ''}
          </Text>
          <View className={`px-3 py-1 rounded-full ${
            isCompleted ? 'bg-green-100' : 'bg-orange-100'
          }`}>
            <Text className={`text-xs font-medium ${
              isCompleted ? 'text-green-700' : 'text-orange-700'
            }`}>
              {isCompleted ? 'Completed' : 'Scheduled'}
            </Text>
          </View>
        </View>
        
        <View className="flex-row items-center mb-2">
          {item.sport && (
            <View className="flex-row items-center mr-4">
              <Ionicons 
                name="fitness" 
                size={14} 
                color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
              />
              <Text className={`text-sm ml-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {capitalizeFirst(item.sport)}
              </Text>
            </View>
          )}
          
          {item.time && (
            <View className="flex-row items-center mr-4">
              <Ionicons 
                name="time" 
                size={14} 
                color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
              />
              <Text className={`text-sm ml-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {item.time}
              </Text>
            </View>
          )}
          
          {item.duration && (
            <View className="flex-row items-center">
              <Ionicons 
                name="hourglass" 
                size={14} 
                color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
              />
              <Text className={`text-sm ml-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {item.duration}
              </Text>
            </View>
          )}
        </View>

        {item.description && (
          <Text 
            className={`text-sm leading-5 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.description}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  // Handle refresh functionality
  const handleRefresh = async () => {
    if (!userId) return;
    setRefreshing(true);
    try {
      await fetchTrainingForDate(selectedDate);
      await initializeDailyMetrics(selectedDate);
      // Month scheduled hours already initialized
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Fixed Header */}
      <View 
        className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}
        style={{ paddingTop: insets.top + 12, paddingBottom: 16 }}
      >
        <View className="px-6">
          <Text className={`text-3xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Calendar
          </Text>
          <Text className={`text-base ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          } mt-1`}>
            Manage your training schedule
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[isDarkMode ? '#3B82F6' : '#2563EB']}
            tintColor={isDarkMode ? '#3B82F6' : '#2563EB'}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Calendar Card */}
        <View className="px-6 mt-6">
          <View
            className={`p-4 rounded-2xl border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}
            style={{
              shadowColor: '#000',
              shadowOpacity: isDarkMode ? 0.2 : 0.08,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 3,
            }}
          >
            <Calendar
              key={`calendar-${isDarkMode ? 'dark' : 'light'}`}
              current={selectedDate}
              onDayPress={onDayPress}
              markedDates={markedDates}
              firstDay={1}
              theme={{
                selectedDayBackgroundColor: isDarkMode ? '#3B82F6' : '#3B82F6',
                todayTextColor: isDarkMode ? '#3B82F6' : '#3B82F6',
                arrowColor: isDarkMode ? '#3B82F6' : '#3B82F6',
                textDayFontWeight: '500',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '600',
                calendarBackground: isDarkMode ? '#1F2937' : '#FFFFFF',
                dayTextColor: isDarkMode ? '#FFFFFF' : '#111827',
                monthTextColor: isDarkMode ? '#FFFFFF' : '#111827',
                textSectionTitleColor: isDarkMode ? '#9CA3AF' : '#6B7280',
                selectedDayTextColor: '#FFFFFF',
                todayBackgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
                textDisabledColor: isDarkMode ? '#6B7280' : '#9CA3AF',
              }}
            />
          </View>
        </View>

        {/* Daily Overview Section */}
        <View className="px-6 mt-8 mb-8">
          {/* Section Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <View className={`p-2 rounded-lg mr-3 ${
                isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'
              }`}>
                <Ionicons 
                  name="calendar" 
                  size={20} 
                  color={isDarkMode ? '#60A5FA' : '#3B82F6'} 
                />
              </View>
              <View>
                <Text className={`text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {getSelectedDateLabel()}
                </Text>

              </View>
            </View>
            
            <TouchableOpacity 
              onPress={() => { setEditHours(scheduledHours); setEditModalVisible(true); }}
              className={`flex-row items-center px-4 py-2 rounded-full ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}
            >
              <Ionicons 
                name="time" 
                size={16} 
                color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
              />
              <Text className={`font-medium text-sm ml-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {scheduledHours}h
              </Text>
              <MaterialIcons 
                name="edit" 
                size={16} 
                color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          </View>

          {/* Daily Metrics */}
          {metricsLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator 
                size="large" 
                color={isDarkMode ? '#3B82F6' : '#2563EB'} 
              />
              <Text className={`text-sm mt-3 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Loading metrics...
              </Text>
            </View>
          ) : dailyMetrics ? (
            <View className="space-y-4">
              {/* Daily Metrics Grid */}
              <View style={{ gap: 7 }}>
                {/* First Row - Feelings */}
                <View style={{ flexDirection: 'row', gap: 7 }}>
                  {/* Physical Feeling */}
                  <View className={`flex-1 p-3 rounded-xl ${
                    isDarkMode ? 'bg-purple-500/10' : 'bg-purple-50'
                  }`}>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Ionicons 
                          name="body" 
                          size={16} 
                          color={isDarkMode ? '#A855F7' : '#8B5CF6'} 
                        />
                        <Text className={`text-xs font-medium ml-2 ${
                          isDarkMode ? 'text-purple-300' : 'text-purple-700'
                        }`}>
                          Physical
                        </Text>
                      </View>
                      <Text className={`text-lg font-bold ${
                        isDarkMode ? 'text-purple-400' : 'text-purple-600'
                      }`}>
                        {dailyMetrics.physicallyFeeling}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Mental Feeling */}
                  <View className={`flex-1 p-3 rounded-xl ${
                    isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-50'
                  }`}>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Ionicons 
                          name="happy" 
                          size={16} 
                          color={isDarkMode ? '#6366F1' : '#4F46E5'} 
                        />
                        <Text className={`text-xs font-medium ml-2 ${
                          isDarkMode ? 'text-indigo-300' : 'text-indigo-700'
                        }`}>
                          Mental
                        </Text>
                      </View>
                      <Text className={`text-lg font-bold ${
                        isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                      }`}>
                        {dailyMetrics.mentallyFeeling}
                      </Text>
                    </View>
                  </View>

                  {/* Sleep Quality */}
                  <View className={`flex-1 p-3 rounded-xl ${
                    isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'
                  }`}>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Ionicons 
                          name="moon" 
                          size={16} 
                          color={isDarkMode ? '#3B82F6' : '#2563EB'} 
                        />
                        <Text className={`text-xs font-medium ml-2 ${
                          isDarkMode ? 'text-blue-300' : 'text-blue-700'
                        }`}>
                          Sleep
                        </Text>
                      </View>
                      <Text className={`text-lg font-bold ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                        {dailyMetrics.sleep}
                      </Text>
                    </View>
                  </View>
                </View>
                
                {/* Second Row - Weight & Health Status */}
                <View style={{ flexDirection: 'row', gap: 7 }}>
                  {/* Weight */}
                  <View className={`flex-1 p-3 rounded-xl ${
                    isDarkMode ? 'bg-cyan-500/10' : 'bg-cyan-50'
                  }`}>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Ionicons 
                          name="barbell" 
                          size={16} 
                          color={isDarkMode ? '#06B6D4' : '#0891B2'} 
                        />
                        <Text className={`text-xs font-medium ml-2 ${
                          isDarkMode ? 'text-cyan-300' : 'text-cyan-700'
                        }`}>
                          Weight
                        </Text>
                      </View>
                      <Text className={`text-lg font-bold ${
                        isDarkMode ? 'text-cyan-400' : 'text-cyan-600'
                      }`}>
                        {dailyMetrics.weight > 0 ? `${dailyMetrics.weight}kg` : '-'}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Health Status */}
                  <View className={`flex-1 p-3 rounded-xl ${
                    (dailyMetrics.illness !== 'None' || dailyMetrics.injury !== 'None')
                      ? isDarkMode ? 'bg-red-500/10' : 'bg-red-50'
                      : isDarkMode ? 'bg-green-500/10' : 'bg-green-50'
                  }`}>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Ionicons 
                          name={
                            (dailyMetrics.illness !== 'None' || dailyMetrics.injury !== 'None')
                              ? "medical" 
                              : "checkmark-circle"
                          }
                          size={16} 
                          color={
                            (dailyMetrics.illness !== 'None' || dailyMetrics.injury !== 'None')
                              ? isDarkMode ? '#F87171' : '#DC2626'
                              : isDarkMode ? '#22C55E' : '#16A34A'
                          }
                        />
                        <Text className={`text-xs font-medium ml-2 ${
                          (dailyMetrics.illness !== 'None' || dailyMetrics.injury !== 'None')
                            ? isDarkMode ? 'text-red-300' : 'text-red-700'
                            : isDarkMode ? 'text-green-300' : 'text-green-700'
                        }`}>
                          Health
                        </Text>
                      </View>
                      <Text className={`text-sm font-semibold ${
                        (dailyMetrics.illness !== 'None' || dailyMetrics.injury !== 'None')
                          ? isDarkMode ? 'text-red-400' : 'text-red-600'
                          : isDarkMode ? 'text-green-400' : 'text-green-600'
                      }`}>
                        {(dailyMetrics.illness !== 'None' || dailyMetrics.injury !== 'None') ? 'Issues' : 'Good'}
                      </Text>
                    </View>
                    
                    {/* Health details when there are issues */}
                    {(dailyMetrics.illness !== 'None' || dailyMetrics.injury !== 'None') && (
                      <View className="mt-2 space-y-1">
                        {dailyMetrics.illness !== 'None' && (
                          <Text className={`text-xs ${
                            isDarkMode ? 'text-red-300' : 'text-red-600'
                          }`}>
                            • Illness: {dailyMetrics.illness}
                          </Text>
                        )}
                        {dailyMetrics.injury !== 'None' && (
                          <Text className={`text-xs ${
                            isDarkMode ? 'text-red-300' : 'text-red-600'
                          }`}>
                            • Injury: {dailyMetrics.injury}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View className={`p-8 rounded-2xl border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <View className="items-center">
                <Ionicons 
                  name="analytics-outline" 
                  size={48} 
                  color={isDarkMode ? '#6B7280' : '#9CA3AF'} 
                />
                <Text className={`text-lg font-medium mt-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  No check-in data
                </Text>
                <Text className={`text-sm mt-1 text-center ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Daily check-in metrics will appear here when available
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Training Sessions */}
        <View className="px-6 mt-1 mb-8">
          {loading ? (
            <View className="items-center py-12">
              <ActivityIndicator 
                size="large" 
                color={isDarkMode ? '#3B82F6' : '#2563EB'} 
              />
              <Text className={`text-sm mt-3 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Loading sessions...
              </Text>
            </View>
          ) : entries.length > 0 ? (
            <View>
              {entries.map((item, index) => (
                <View key={index}>
                  {renderItem({ item })}
                </View>
              ))}
            </View>
          ) : (
            <View className={`p-8 rounded-2xl border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <View className="items-center">
                <Ionicons 
                  name="barbell-outline" 
                  size={48} 
                  color={isDarkMode ? '#6B7280' : '#9CA3AF'} 
                />
                <Text className={`text-lg font-medium mt-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  No sessions scheduled
                </Text>
                <Text className={`text-sm mt-1 text-center ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Your training sessions for this day will appear here
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className={`rounded-2xl p-6 w-[320px] ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 8,
          }}>
            <Text className={`text-xl font-bold mb-2 text-center ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Edit Scheduled Hours
            </Text>
            <Text className={`text-sm mb-6 text-center ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Set your available training hours for {getSelectedDateLabel().toLowerCase()}
            </Text>
            
            <View className={`rounded-xl border p-4 mb-6 ${
              isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
            }`}>
              <Text className={`text-sm font-medium mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Available Hours
              </Text>
              <View className="w-full">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className={`${isDarkMode ? 'text-gray-400' : 'text-slate-600'} text-sm`}>0 hours</Text>
                  <Text className={`font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} text-lg`}>
                    {editHours || '0'} hours
                  </Text>
                  <Text className={`${isDarkMode ? 'text-gray-400' : 'text-slate-600'} text-sm`}>12 hours</Text>
                </View>
                <Slider
                  style={{ width: '100%', height: 40 }}
                  minimumValue={0}
                  maximumValue={12}
                  step={0.5}
                  value={Number(editHours) || 0}
                  onValueChange={(value) => setEditHours(value.toString())}
                  minimumTrackTintColor={isDarkMode ? '#3B82F6' : '#2563EB'}
                  maximumTrackTintColor={isDarkMode ? '#374151' : '#E5E7EB'}
                  thumbTintColor={isDarkMode ? '#3B82F6' : '#2563EB'}
                />
              </View>
            </View>
            
            <View className="flex-row gap-3">
              <TouchableOpacity 
                onPress={() => setEditModalVisible(false)} 
                className={`flex-1 py-3 rounded-xl border ${
                  isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                }`}
              >
                <Text className={`text-center font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={saveEditedHours} 
                className="flex-1 py-3 rounded-xl bg-blue-500"
              >
                <Text className="text-center font-semibold text-white">
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FAB Button */}
      <TouchableOpacity 
        className={`absolute bottom-8 right-6 w-14 h-14 rounded-2xl justify-center items-center ${
          isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
        }`}
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 8,
        }}
        onPress={() => (navigation as any).navigate('AddTraining', { date: selectedDate })}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
      
      {fabOpen && (
        <View 
          className={`absolute bottom-24 right-6 rounded-xl p-2 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
          style={{
            shadowColor: '#000', 
            shadowOpacity: 0.15, 
            shadowRadius: 5, 
            shadowOffset: { width: 0, height: 2 }, 
            elevation: 5
          }}
        >
          <TouchableOpacity className="p-2" onPress={() => { setFabOpen(false); /* TODO: Add training logic */ }}>
            <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Add Training</Text>
          </TouchableOpacity>
          <TouchableOpacity className="p-2" onPress={() => { setFabOpen(false); /* TODO: Update schedule logic */ }}>
            <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Update Schedule</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default CalendarScreen;

