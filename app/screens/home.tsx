// ===============================================
// HOME SCREEN - MAIN TRAINING & FITNESS DASHBOARD
// ===============================================
// This is the main dashboard showing today's training,
// fitness metrics, and daily check-in functionality.
// Preserves all original UI/UX while adding clear code organization.

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Modal, RefreshControl, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDarkMode } from '../hooks/commonHooks';
import { useUserId } from '../hooks/commonHooks';
import { getCurrentDateString, capitalizeFirst, getFitnessLevelText, getFatigueLevelText, normalizeTrainingSession } from '../utils/commonUtils';
import { Ionicons } from '@expo/vector-icons';
import { getThemedStyles } from '../styling';
import "../../global.css";

// ===============================================
// TYPE DEFINITIONS
// ===============================================

interface TrainingMetrics {
  ctl: number;
  atl: number;
  form: number;
}

interface TrainingSession {
  event_type: string;
  name: string;
  sport: string;
  time: string;
  description: string;
  completed: boolean;
  duration?: string;
  session_focus?: string;
  id?: string;
  workoutId?: string;
  timeStamp?: number;
}

interface HealthMetrics {
  physicallyFeeling: number;
  mentallyFeeling: number;
  sleep: number;
  weight: string;
  illness: string;
  injury: string;
}

// ===============================================
// CUSTOM UI COMPONENTS
// ===============================================

// Custom Dropdown Component
const CustomDropdown = ({ 
  value, 
  options, 
  onValueChange, 
  isDarkMode 
}: {
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
  isDarkMode: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const styles = getThemedStyles(isDarkMode);
  
  return (
    <View className="relative">
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className={`flex-row items-center justify-between p-0`}
      >
        <Text className={styles.text.body}>
          {value}
        </Text>
      </TouchableOpacity>
      
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity 
          className="flex-1 justify-end bg-black/50"
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View className={`${styles.card.modal} rounded-t-3xl p-6`}>
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
            <Text className={`${styles.text.title} mb-4`}>
              Select Injury Status
            </Text>
            <View>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    onValueChange(option);
                    setIsOpen(false);
                  }}
                  className={`p-4 rounded-xl flex-row items-center justify-between mb-3 ${
                    value === option 
                      ? styles.button.primary
                      : styles.button.secondary
                  }`}
                >
                  <Text className={`text-base font-medium ${
                    value === option 
                      ? 'text-white' 
                      : styles.text.body
                  }`}>
                    {option}
                  </Text>
                  {value === option && (
                    <Ionicons name="checkmark" size={20} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => setIsOpen(false)}
              className={`mt-6 p-4 rounded-xl ${styles.button.secondary}`}
            >
              <Text className={`text-center font-medium ${styles.text.body}`}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
const SimpleSlider = ({ 
  value, 
  onValueChange, 
  label,
  isDarkMode 
}: {
  value: number;
  onValueChange: (value: number) => void;
  label: string;
  isDarkMode: boolean;
}) => {
  const levels = ['Poor', 'Below Avg', 'Average', 'Good', 'Excellent'];
  
  return (
    <View className="mb-6">
      <Text className={`text-base font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {label}
      </Text>
      <View className="flex-row justify-between mb-2">
        {levels.map((level, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onValueChange(index + 1)}
            className={`px-3 py-2 rounded-lg ${
              value === index + 1 
                ? 'bg-blue-500' 
                : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}
          >
            <Text className={`text-xs font-medium ${
              value === index + 1 
                ? 'text-white' 
                : isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ===============================================
// MAIN HOME SCREEN COMPONENT
// ===============================================

const HomeScreen = () => {
  // =====================================
  // HOOKS & STATE MANAGEMENT
  // =====================================
  
  const { isDarkMode } = useDarkMode();
  const { userId } = useUserId();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const styles = getThemedStyles(isDarkMode);
  
  const [metrics, setMetrics] = useState<HealthMetrics>({
    physicallyFeeling: 3,
    mentallyFeeling: 3,
    sleep: 3,
    weight: '',
    illness: 'None',
    injury: 'None',
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [trainingMetrics, setTrainingMetrics] = useState<TrainingMetrics>({
    ctl: 75,
    atl: 65,
    form: 10
  });
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [loadingTraining, setLoadingTraining] = useState(false);
  const [todayTraining, setTodayTraining] = useState<TrainingSession[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Default training shown while loading or if API fails
  const defaultTrainingToday: TrainingSession[] = [
    { event_type: 'Swim', name: 'Drills & endurance', sport: 'Swimming', time: '1h', description: '', completed: false },
    { event_type: 'Yoga', name: 'Evening recovery', sport: 'Yoga', time: '30m', description: '', completed: false },
  ];

  // =====================================
  // DATA INITIALIZATION & EFFECTS
  // =====================================

  // Initialize with default data
  useEffect(() => {
    if (userId) {
      setMetrics({
        physicallyFeeling: 3,
        mentallyFeeling: 3,
        sleep: 3,
        weight: '',
        illness: 'None',
        injury: 'None',
      });
      setTrainingMetrics({
        ctl: 120,
        atl: 95,
        form: 25
      });
      setTodayTraining(defaultTrainingToday);
      setLoading(false);
    }
  }, [userId]);

  // =====================================
  // EVENT HANDLERS
  // =====================================

  // Handle refresh function
  const handleRefresh = async () => {
    if (!userId || refreshing) return;
    setRefreshing(true);
    // Simulate refresh without API calls
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const saveMetrics = async () => {
    if (!userId) return;
    setLoadingMetrics(true);
    try {
      // Simulate saving metrics locally without API call
      setMetrics({ ...metrics });
      console.log('Metrics would be saved:', metrics);
    } catch (err) {
      console.error('[metrics] Error saving metrics:', err);
      setError('Could not save metrics');
    } finally {
      setLoadingMetrics(false);
    }
  };

  // =====================================
  // LOADING STATE HANDLING
  // =====================================

  // Check if any data is still loading
  const isAnyDataLoading = loading || loadingMetrics || loadingTraining || refreshing;

  // Show single loading indicator while any data is loading
  if (isAnyDataLoading) {
    return (
      <View className={`${styles.layout.screenContainer} flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className={`${styles.text.small} mt-4 text-center`}>
          {refreshing ? 'Refreshing...' : 'Loading...'}
        </Text>
      </View>
    );
  }

  // =====================================
  // MAIN RENDER
  // =====================================

  return (
    <View className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex-1`}>
      {/* ===== FIXED HEADER ===== */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingBottom: 16,
          paddingHorizontal: 24,
        }}
        className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}
      >
        <Text className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Today
        </Text>
        <Text className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={isDarkMode ? '#FFFFFF' : '#000000'}
          />
        }
      >
        <View className="px-6" style={{ paddingTop: 24, paddingBottom: 24 }}>
          
          {/* ==========================================
              FITNESS METRICS SECTION
              ========================================== */}
          <View className="mb-8">
            <View className="flex-row gap-4">
              
              {/* Fitness Section */}
              <View className="flex-1">
                <View className="flex-row items-center mb-4">
                  <View className={`p-2 rounded-lg mr-3 ${
                    isDarkMode ? 'bg-green-500/20' : 'bg-green-50'
                  }`}>
                    <Ionicons 
                      name="fitness" 
                      size={20} 
                      color={isDarkMode ? '#22C55E' : '#10B981'} 
                    />
                  </View>
                  <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Fitness
                  </Text>
                </View>
                
                <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {getFitnessLevelText(trainingMetrics.ctl)}
                  </Text>
                </View>
              </View>

              {/* Fatigue Section */}
              <View className="flex-1">
                <View className="flex-row items-center mb-4">
                  <View className={`p-2 rounded-lg mr-3 ${
                    isDarkMode ? 'bg-orange-500/20' : 'bg-orange-50'
                  }`}>
                    <Ionicons 
                      name="battery-half" 
                      size={20} 
                      color={isDarkMode ? '#FB923C' : '#F59E0B'} 
                    />
                  </View>
                  <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Fatigue
                  </Text>
                </View>
                
                <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {getFatigueLevelText(trainingMetrics.form)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

        {/* ==========================================
            TODAY'S ACTIVITIES SECTION
            ========================================== */}
        <View className="mb-8">
          <View className="flex-row items-center mb-4">
            <View className={`p-2 rounded-lg mr-3 ${
              isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'
            }`}>
              <Ionicons 
                name="calendar-outline" 
                size={20} 
                color={isDarkMode ? '#60A5FA' : '#3B82F6'} 
              />
            </View>
            <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Today's Activities
            </Text>
          </View>
          
          {todayTraining.length === 0 ? (
            <View className={`p-8 rounded-2xl border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <View className="items-center">
                <Ionicons 
                  name="bed-outline" 
                  size={48} 
                  color={isDarkMode ? '#6B7280' : '#9CA3AF'} 
                />
                <Text className={`text-lg font-medium mt-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Rest Day
                </Text>
                <Text className={`text-sm mt-1 text-center ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  No training scheduled for today
                </Text>
              </View>
            </View>
          ) : (
            <View>
              {todayTraining.slice(0, 3).map((session, index) => {
                const handleSessionPress = () => {
                  const workoutId = session.id || session.workoutId;
                  const currentDate = new Date();
                  const isCompleted = session.timeStamp && new Date(session.timeStamp * 1000) < currentDate;
                  
                  // Don't navigate if there's no valid workout ID
                  if (!workoutId) {
                    console.warn('No valid workout ID found for session:', session);
                    return;
                  }
                  
                  if (isCompleted) {
                    (navigation as any).navigate('analysis', { workoutId });
                  } else {
                    (navigation as any).navigate('SessionDetails', { 
                      date: getCurrentDateString(), 
                      sessionId: workoutId,
                      viewOnly: true
                    });
                  }
                };

                return (
                  <TouchableOpacity 
                    key={index}
                    className={`${styles.card.listItem} border`}
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
                      <Text className={styles.text.title}>
                        {session.event_type ? capitalizeFirst(session.event_type) + (session.name ? `: ${session.name}` : '') : session.name}
                      </Text>
                      <View className={`px-3 py-1 rounded-full ${
                        session.completed ? 'bg-green-100' : 'bg-orange-100'
                      }`}>
                        <Text className={`text-xs font-medium ${
                          session.completed ? 'text-green-700' : 'text-orange-700'
                        }`}>
                          {session.completed ? 'Completed' : 'Scheduled'}
                        </Text>
                      </View>
                    </View>
                    
                    <View className="flex-row items-center mb-2">
                      {session.sport && (
                        <View className="flex-row items-center mr-4">
                          <Ionicons 
                            name="fitness" 
                            size={14} 
                            color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                          />
                          <Text className={`${styles.text.small} ml-1`}>
                            {capitalizeFirst(session.sport)}
                          </Text>
                        </View>
                      )}
                      
                      {session.time && (
                        <View className="flex-row items-center mr-4">
                          <Ionicons 
                            name="time" 
                            size={14} 
                            color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                          />
                          <Text className={`${styles.text.small} ml-1`}>
                            {session.time}
                          </Text>
                        </View>
                      )}
                      
                      {session.duration && (
                        <View className="flex-row items-center">
                          <Ionicons 
                            name="hourglass" 
                            size={14} 
                            color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                          />
                          <Text className={`${styles.text.small} ml-1`}>
                            {session.duration}
                          </Text>
                        </View>
                      )}
                    </View>

                    {session.description && (
                      <Text 
                        className={`${styles.text.small} leading-5`}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {session.description}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
              
              {todayTraining.length > 3 && (
                <View className={`${styles.card.cardCompact} border`}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDarkMode ? 0.2 : 0.08,
                  shadowRadius: 8,
                  elevation: 3,
                }}>
                  <TouchableOpacity 
                    className="items-center py-2"
                    onPress={() => (navigation as any).navigate('Calendar')}
                  >
                    <Text className={`${styles.text.link} text-sm font-medium`}>
                      View {todayTraining.length - 3} more activities
                    </Text>
                    <Ionicons 
                      name="chevron-forward" 
                      size={16} 
                      color={isDarkMode ? '#60A5FA' : '#3B82F6'} 
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        {/* ==========================================
            DAILY CHECK-IN SECTION
            ========================================== */}
        <View className="mb-8">
          <View className="flex-row items-center mb-4">
            <View className={`p-2 rounded-lg mr-3 ${
              isDarkMode ? 'bg-purple-500/20' : 'bg-purple-50'
            }`}>
              <Ionicons 
                name="heart" 
                size={20} 
                color={isDarkMode ? '#A78BFA' : '#8B5CF6'} 
              />
            </View>
            <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Daily Check-in
            </Text>
          </View>
          
          <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-5 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>

          <SimpleSlider
            value={metrics.physicallyFeeling}
            onValueChange={(value) => setMetrics({...metrics, physicallyFeeling: value})}
            label="Physical Energy"
            isDarkMode={isDarkMode}
          />

          <SimpleSlider
            value={metrics.mentallyFeeling}
            onValueChange={(value) => setMetrics({...metrics, mentallyFeeling: value})}
            label="Mental Focus"
            isDarkMode={isDarkMode}
          />

          <SimpleSlider
            value={metrics.sleep}
            onValueChange={(value) => setMetrics({...metrics, sleep: value})}
            label="Sleep Quality"
            isDarkMode={isDarkMode}
          />

          {/* Weight and Injury Form Fields */}
          <View className="space-y-4">
            
            {/* Weight Input */}
            <View>
              <Text className={`text-base font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Weight (kg)
              </Text>
              <View className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-xl p-3 flex-row items-center`}>
                <Ionicons name="scale-outline" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} className="mr-3" />
                <TextInput
                  value={metrics.weight}
                  onChangeText={(value) => setMetrics({...metrics, weight: value})}
                  keyboardType="numeric"
                  placeholder="Enter your weight"
                  placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  className={`flex-1 ${isDarkMode ? 'text-white' : 'text-gray-900'} ml-3`}
                  style={Platform.select({
                    android: { 
                      minHeight: 20, 
                      textAlignVertical: 'center', 
                      includeFontPadding: false,
                      paddingVertical: 0
                    },
                    ios: { 
                      minHeight: 20, 
                      paddingTop: 2, 
                      paddingBottom: 2
                    }
                  })}
                />
              </View>
            </View>
            
            {/* Injury Status Dropdown */}
            <View className="mt-6">
              <Text className={`text-base font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Injury Status
              </Text>
              <View className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-xl p-3 flex-row items-center`}>
                <Ionicons name="medical-outline" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                <View className="flex-1 ml-3">
                  <CustomDropdown
                    value={metrics.injury}
                    options={['None', 'Minor', 'Major', 'Recovering']}
                    onValueChange={(value: string) => setMetrics({...metrics, injury: value})}
                    isDarkMode={isDarkMode}
                  />
                </View>
                <Ionicons name="chevron-down" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={saveMetrics}
            disabled={loadingMetrics}
            className={`${loadingMetrics ? 'opacity-50' : ''} bg-blue-500 rounded-xl p-4 flex-row items-center justify-center mt-6`}
            style={{
              shadowColor: '#3B82F6',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6
            }}
          >
            {loadingMetrics ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="white" />
                <Text className="text-white text-base font-semibold ml-2">
                  Save Daily Check-in
                </Text>
              </>
            )}
          </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Padding */}
        <View className="h-6" />
      </View>
    </ScrollView>
    </View>
  );
};

export default HomeScreen;