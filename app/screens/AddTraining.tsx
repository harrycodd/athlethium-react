// ===============================================
// ADD TRAINING SCREEN - WORKOUT CREATION
// ===============================================
// This screen allows users to create and schedule new training sessions,
// configure workout details, and manage training parameters.
// Provides comprehensive form inputs for session customization.

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, ScrollView, SafeAreaView, KeyboardAvoidingView, Keyboard, Modal } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDarkMode, useUserId } from '../hooks/commonHooks';
import { getThemedStyles } from '../styling';
import '../../global.css';

// ===============================================
// MAIN ADD TRAINING COMPONENT
// ===============================================

const AddTrainingScreen = () => {
  
  // =====================================
  // HOOKS & NAVIGATION
  // =====================================
  
  const route = useRoute();
  const navigation = useNavigation();
  const { date } = route.params as { date: string };
  const { isDarkMode } = useDarkMode();
  const { userId } = useUserId();
  const styles = getThemedStyles(isDarkMode);
  const insets = useSafeAreaInsets();

  // =====================================
  // STATE MANAGEMENT
  // =====================================
  
  const [name, setName] = useState('');
  const [sport, setSport] = useState('');
  const [eventType, setEventType] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDateState, setSelectedDateState] = useState(new Date(date));
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');
  const [seconds, setSeconds] = useState('00');
  const [originalHours, setOriginalHours] = useState('00');
  const [originalMinutes, setOriginalMinutes] = useState('00');
  const [originalSeconds, setOriginalSeconds] = useState('00');
  const [tss, setTss] = useState('0');
  const [completed, setCompleted] = useState(false);

  const effortTypes = [
    { label: 'Recovery', value: 'recovery', factor: 25 },
    { label: 'Steady', value: 'steady', factor: 45 },
    { label: 'Threshold', value: 'threshold', factor: 60 },
    { label: 'VO2max/Hard', value: 'vo2max', factor: 80 },
  ];
  const [effortType, setEffortType] = useState(effortTypes[0].value);

  // State for dropdown modals
  const [showSportPicker, setShowSportPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showEffortPicker, setShowEffortPicker] = useState(false);

  // Sport options
  const sportOptions = ['Cycling', 'Running', 'Swimming', 'Yoga', 'Strength'];
  const eventTypeOptions = ['Event', 'Session', 'Goal'];

  // Helper function to check if effort level should be shown
  const shouldShowEffortLevel = () => {
    const currentSport = sport.toLowerCase();
    return ['swimming', 'cycling', 'running'].includes(currentSport);
  };

  // Reset form state
  const resetForm = () => {
    setName('');
    setSport('');
    setEventType('');
    setDescription('');
    setError(null);
    setLoading(false);
    setShowTimePicker(false);
    setShowDatePicker(false);
    setSelectedDateState(new Date(date));
    setHours('00');
    setMinutes('00');
    setSeconds('00');
    setTss('0');
    setCompleted(false);
    setEffortType(effortTypes[0].value);
    setShowSportPicker(false);
    setShowTypePicker(false);
    setShowEffortPicker(false);
  };

  // Set up navigation header to be hidden so we can create our own
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    const hoursNum = Number(hours) + Number(minutes) / 60 + Number(seconds) / 3600;
    const selected = effortTypes.find(e => e.value === effortType);
    if (selected) setTss(Math.round(hoursNum * selected.factor).toString());
  }, [hours, minutes, seconds, effortType]);

  // Keyboard handling
  const scrollViewRef = useRef<ScrollView>(null);
  const nameInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);
  const [activeInput, setActiveInput] = useState<string | null>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        if (activeInput === 'name' && nameInputRef.current) {
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        } else if (activeInput === 'description' && descriptionInputRef.current) {
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 0);
        }
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, [activeInput]);

  const formatTime = () => {
    return `${hours}:${minutes}:${seconds}`;
  };

  const calculateTimeInSeconds = () => {
    return (Number(hours) * 3600) + (Number(minutes) * 60) + Number(seconds);
  };

  const handleAddTraining = async () => {
    setLoading(true);
    setError(null);
    console.log('handleAddTraining called');
    try {
      if (!userId) throw new Error('User not authenticated');
      
      const body = {
        name,
        sport,
        event_type: eventType,
        description,
        time: calculateTimeInSeconds(),
        date: selectedDateState.toISOString().split('T')[0],
        tss: Number(tss),
        tss_type: 'estimated',
        completed,
      };
      console.log('Training would be added:', body);
      
      // Simulate successful addition without API call
      console.log('Training added successfully (local only)');
      navigation.goBack();
    } catch (err: any) {
      console.log('Error in handleAddTraining:', err);
      setError('Failed to add training.');
    } finally {
      setLoading(false);
      console.log('handleAddTraining finished');
    }
  };

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Custom Header */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingBottom: 16,
          paddingHorizontal: 24,
        }}
        className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-1"
          >
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#FFFFFF' : '#1E293B'} />
          </TouchableOpacity>
          
          <View className="flex-1 items-center">
            <Text className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Add Training
            </Text>
            <Text className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
              Create a new training session
            </Text>
          </View>
          
          <View className="w-8" />
        </View>
      </View>

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView 
            ref={scrollViewRef}
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="px-6" style={{ paddingTop: 24, paddingBottom: 24 }}>
              {/* Session Information Card */}
              <View className={`${isDarkMode ? 'bg-gray-800/90' : 'bg-white'} rounded-2xl p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDarkMode ? 0.2 : 0.08,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                {/* Status Banner */}
                {completed && (
                  <View className={`flex-row items-center py-3 px-4 rounded-xl mb-6 ${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'}`}
                    style={{
                      borderLeftWidth: 4,
                      borderLeftColor: '#10B981'
                    }}
                  >
                    <View className="w-3 h-3 rounded-full bg-green-500 mr-3" />
                    <Text className={`font-semibold ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                      Training Session Completed
                    </Text>
                  </View>
                )}
                
                {/* Session Name */}
                <View className="mb-6">
                  <View className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-xl p-3 flex-row items-center`}>
                    <TextInput
                      ref={nameInputRef}
                      className={`flex-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                      style={Platform.select({
                        android: { 
                          minHeight: 28, 
                          textAlignVertical: 'center', 
                          includeFontPadding: false,
                          paddingVertical: 2
                        },
                        ios: { 
                          minHeight: 28, 
                          paddingTop: 2, 
                          paddingBottom: 2
                        }
                      })}
                      value={name}
                      onChangeText={setName}
                      placeholder="Enter session name"
                      placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                      onFocus={() => setActiveInput('name')}
                      onBlur={() => setActiveInput(null)}
                    />
                  </View>
                </View>

                {/* Quick Details Row */}
                <View className="flex-row items-center justify-center flex-wrap gap-4 mb-6">
                  <View className="flex-row items-center">
                    <Ionicons 
                      name="calendar" 
                      size={16} 
                      color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                    />
                    <Text className={`text-sm ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedDateState.toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center">
                    <Ionicons 
                      name="time" 
                      size={16} 
                      color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                    />
                    <Text className={`text-sm ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatTime()}
                    </Text>
                  </View>
                  
                  {sport && (
                    <View className="flex-row items-center">
                      <Ionicons 
                        name="fitness" 
                        size={16} 
                        color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                      />
                      <Text className={`text-sm ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {sport.charAt(0).toUpperCase() + sport.slice(1)}
                      </Text>
                    </View>
                  )}
                  
                  {effortTypes.find(e => e.value === effortType)?.label && (
                    <View className="flex-row items-center">
                      <Ionicons 
                        name="speedometer" 
                        size={16} 
                        color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                      />
                      <Text className={`text-sm ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {effortTypes.find(e => e.value === effortType)?.label}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Session Details */}
                <View className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Text className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Session Details
                  </Text>
                  
                  {/* Spacing before date/duration/sport fields */}
                  <View className="h-6" />
                  
                  {/* Date Field */}
                  <View>
                    <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Date
                    </Text>
                    <TouchableOpacity
                      className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-xl p-3 flex-row items-center`}
                      onPress={() => { Keyboard.dismiss(); setShowDatePicker(true); }}
                    >
                      <Ionicons name="calendar-outline" size={18} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                      <Text className={`flex-1 text-sm ml-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedDateState.toISOString().split('T')[0]}
                      </Text>
                      <Ionicons name="chevron-forward" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                    </TouchableOpacity>
                  </View>

                  {/* Duration Field */}
                  <View className="mt-6">
                    <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Duration
                    </Text>
                    <TouchableOpacity
                      className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-xl p-3 flex-row items-center`}
                      onPress={() => { 
                        Keyboard.dismiss(); 
                        setOriginalHours(hours);
                        setOriginalMinutes(minutes);
                        setOriginalSeconds(seconds);
                        setShowTimePicker(true); 
                      }}
                    >
                      <Ionicons name="time-outline" size={18} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                      <Text className={`flex-1 text-sm ml-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatTime()}
                      </Text>
                      <Ionicons name="chevron-forward" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                    </TouchableOpacity>
                  </View>

                  {/* Sport and Type Row */}
                  <View className="flex-row gap-3 mt-6">
                    <View className="flex-1">
                      <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Sport
                      </Text>
                      <TouchableOpacity
                        className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-xl p-3 flex-row items-center`}
                        onPress={() => setShowSportPicker(true)}
                      >
                        <Text className={`flex-1 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {sport || 'Select Sport'}
                        </Text>
                        <Ionicons name="chevron-down" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                      </TouchableOpacity>
                    </View>

                    <View className="flex-1">
                      <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Type
                      </Text>
                      <TouchableOpacity
                        className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-xl p-3 flex-row items-center`}
                        onPress={() => setShowTypePicker(true)}
                      >
                        <Text className={`flex-1 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {eventType || 'Select Type'}
                        </Text>
                        <Ionicons name="chevron-down" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Effort Level - Only show for Swimming, Cycling, or Running */}
                  {shouldShowEffortLevel() && (
                    <View className="mt-6">
                      <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Effort Level
                      </Text>
                      <TouchableOpacity
                        className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-xl p-3 flex-row items-center`}
                        onPress={() => setShowEffortPicker(true)}
                      >
                        <Ionicons name="speedometer-outline" size={18} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                        <Text className={`flex-1 text-sm ml-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {effortTypes.find(e => e.value === effortType)?.label || 'Select Effort'}
                        </Text>
                        <Ionicons name="chevron-down" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Description */}
                  <View className="mt-6">
                    <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Description
                    </Text>
                    <TextInput
                      ref={descriptionInputRef}
                      className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} p-2 rounded-xl border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}
                      style={Platform.select({
                        android: { 
                          minHeight: 50, 
                          textAlignVertical: 'top', 
                          includeFontPadding: false,
                          paddingVertical: 4
                        },
                        ios: { 
                          minHeight: 50, 
                          paddingTop: 4,
                          paddingBottom: 4
                        }
                      })}
                      value={description}
                      onChangeText={setDescription}
                      placeholder="Add session notes or description..."
                      placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                      multiline
                      onFocus={() => setActiveInput('description')}
                      onBlur={() => setActiveInput(null)}
                    />
                  </View>
                </View>
              </View>

              {/* Action Button */}
              <View className="mt-6">
                <TouchableOpacity
                  className={`${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} rounded-2xl p-4 flex-row items-center justify-center ${loading ? 'opacity-50' : ''}`}
                  style={{
                    shadowColor: '#3B82F6',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6
                  }}
                  onPress={handleAddTraining}
                  disabled={loading}
                >
                  <Ionicons name="add-circle-outline" size={20} color="white" />
                  <Text className="text-white text-base font-semibold ml-2">
                    {loading ? 'Adding Training...' : 'Add Training'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Error Message */}
              {error && (
                <View className={`mt-6 p-4 rounded-xl ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}
                  style={{
                    borderLeftWidth: 4,
                    borderLeftColor: '#EF4444'
                  }}
                >
                  <Text className={`text-base font-medium ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                    {error}
                  </Text>
                </View>
              )}

              {/* Bottom Padding */}
              <View className="h-6" />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      {showDatePicker && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center z-50">
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
              Select Date
            </Text>
            <Text className={`text-sm mb-6 text-center ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Choose the date for your training session
            </Text>
            <View className="w-full items-center">
              <DateTimePicker
                value={selectedDateState}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, dateVal) => {
                  if (Platform.OS === 'android') {
                    setShowDatePicker(false);
                    if (dateVal) setSelectedDateState(dateVal);
                  } else {
                    if (dateVal) setSelectedDateState(dateVal);
                  }
                }}
                style={{ 
                  backgroundColor: isDarkMode ? '#1F2937' : '#fff',
                  width: Platform.OS === 'ios' ? 280 : undefined,
                  maxWidth: 280
                }}
              />
            </View>
            {Platform.OS === 'ios' && (
              <View className="flex-row gap-3 mt-6">
                <TouchableOpacity 
                  onPress={() => setShowDatePicker(false)} 
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
                  onPress={() => setShowDatePicker(false)} 
                  className="flex-1 py-3 rounded-xl bg-blue-500"
                >
                  <Text className="text-center font-semibold text-white">
                    Confirm
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}
      {showTimePicker && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center z-50">
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
              Set Duration
            </Text>
            <Text className={`text-sm mb-6 text-center ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              How long was your training session?
            </Text>
            <View className="flex-row justify-center items-end mb-5 w-full">
              {/* Hours */}
              <View className="items-center mx-2">
                <Text className={`mb-2 text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Hours</Text>
                <View className="flex-col items-center" style={{ height: 120 }}>
                  <TouchableOpacity onPress={() => { const newVal = Number(hours) + 1; setHours(String(newVal).padStart(2, '0')); }} className="p-2 mb-1">
                    <Ionicons name="chevron-up" size={20} color={isDarkMode ? '#E5E7EB' : '#1E293B'} />
                  </TouchableOpacity>
                  <TextInput
                    className={`w-16 border rounded-lg text-center text-lg font-semibold ${isDarkMode ? 'bg-slate-700 text-gray-200 border-gray-600' : 'bg-white text-slate-800 border-gray-300'}`}
                    style={Platform.select({
                      android: { 
                        height: 48,
                        textAlignVertical: 'center', 
                        includeFontPadding: false,
                        textAlign: 'center',
                        paddingVertical: 0,
                        paddingHorizontal: 0
                      },
                      ios: { 
                        height: 48,
                        lineHeight: 20,
                        textAlign: 'center',
                        paddingVertical: 14,
                        paddingHorizontal: 0
                      }
                    })}
                    value={hours}
                    onChangeText={text => { const num = Number(text.replace(/[^0-9]/g, '')); if (!isNaN(num) && num >= 0 && num <= 99) setHours(String(num).padStart(2, '0')); }}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity onPress={() => { const newVal = Math.max(0, Number(hours) - 1); setHours(String(newVal).padStart(2, '0')); }} className="p-2 mt-1">
                    <Ionicons name="chevron-down" size={20} color={isDarkMode ? '#E5E7EB' : '#1E293B'} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View className="flex items-center justify-center" style={{ width: 20, height: 72, marginBottom: 24 }}>
                <Text className={`text-2xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>:</Text>
              </View>
              
              {/* Minutes */}
              <View className="items-center mx-2">
                <Text className={`mb-2 text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Minutes</Text>
                <View className="flex-col items-center" style={{ height: 120 }}>
                  <TouchableOpacity onPress={() => { const newVal = (Number(minutes) + 1) % 60; setMinutes(String(newVal).padStart(2, '0')); }} className="p-2 mb-1">
                    <Ionicons name="chevron-up" size={20} color={isDarkMode ? '#E5E7EB' : '#1E293B'} />
                  </TouchableOpacity>
                  <TextInput
                    className={`w-16 border rounded-lg text-center text-lg font-semibold ${isDarkMode ? 'bg-slate-700 text-gray-200 border-gray-600' : 'bg-white text-slate-800 border-gray-300'}`}
                    style={Platform.select({
                      android: { 
                        height: 48,
                        textAlignVertical: 'center', 
                        includeFontPadding: false,
                        textAlign: 'center',
                        paddingVertical: 0,
                        paddingHorizontal: 0
                      },
                      ios: { 
                        height: 48,
                        lineHeight: 20,
                        textAlign: 'center',
                        paddingVertical: 14,
                        paddingHorizontal: 0
                      }
                    })}
                    value={minutes}
                    onChangeText={text => { const num = Number(text.replace(/[^0-9]/g, '')); if (!isNaN(num) && num >= 0 && num < 60) setMinutes(String(num).padStart(2, '0')); }}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity onPress={() => { const newVal = (Number(minutes) - 1 + 60) % 60; setMinutes(String(newVal).padStart(2, '0')); }} className="p-2 mt-1">
                    <Ionicons name="chevron-down" size={20} color={isDarkMode ? '#E5E7EB' : '#1E293B'} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View className="flex items-center justify-center" style={{ width: 20, height: 72, marginBottom: 24 }}>
                <Text className={`text-2xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>:</Text>
              </View>
              
              {/* Seconds */}
              <View className="items-center mx-2">
                <Text className={`mb-2 text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Seconds</Text>
                <View className="flex-col items-center" style={{ height: 120 }}>
                  <TouchableOpacity onPress={() => { const newVal = (Number(seconds) + 1) % 60; setSeconds(String(newVal).padStart(2, '0')); }} className="p-2 mb-1">
                    <Ionicons name="chevron-up" size={20} color={isDarkMode ? '#E5E7EB' : '#1E293B'} />
                  </TouchableOpacity>
                  <TextInput
                    className={`w-16 border rounded-lg text-center text-lg font-semibold ${isDarkMode ? 'bg-slate-700 text-gray-200 border-gray-600' : 'bg-white text-slate-800 border-gray-300'}`}
                    style={Platform.select({
                      android: { 
                        height: 48,
                        textAlignVertical: 'center', 
                        includeFontPadding: false,
                        textAlign: 'center',
                        paddingVertical: 0,
                        paddingHorizontal: 0
                      },
                      ios: { 
                        height: 48,
                        lineHeight: 20,
                        textAlign: 'center',
                        paddingVertical: 14,
                        paddingHorizontal: 0
                      }
                    })}
                    value={seconds}
                    onChangeText={text => { const num = Number(text.replace(/[^0-9]/g, '')); if (!isNaN(num) && num >= 0 && num < 60) setSeconds(String(num).padStart(2, '0')); }}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity onPress={() => { const newVal = (Number(seconds) - 1 + 60) % 60; setSeconds(String(newVal).padStart(2, '0')); }} className="p-2 mt-1">
                    <Ionicons name="chevron-down" size={20} color={isDarkMode ? '#E5E7EB' : '#1E293B'} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View className="flex-row gap-3 mt-6">
              <TouchableOpacity 
                onPress={() => {
                  // Restore original values when canceling
                  setHours(originalHours);
                  setMinutes(originalMinutes);
                  setSeconds(originalSeconds);
                  setShowTimePicker(false);
                }} 
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
                onPress={() => setShowTimePicker(false)} 
                className="flex-1 py-3 rounded-xl bg-blue-500"
              >
                <Text className="text-center font-semibold text-white">
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Sport Picker Modal */}
      {showSportPicker && (
        <Modal
          visible={showSportPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSportPicker(false)}
        >
          <TouchableOpacity 
            className="flex-1 justify-end bg-black/50"
            activeOpacity={1}
            onPress={() => setShowSportPicker(false)}
          >
            <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-t-3xl p-6`}>
              <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
              <Text className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Select Sport
              </Text>
              <View>
                {sportOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setSport(option);
                      setShowSportPicker(false);
                    }}
                    className={`p-4 rounded-xl flex-row items-center justify-between mb-3 ${
                      sport === option 
                        ? isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
                        : isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                  >
                    <Text className={`text-base font-medium ${
                      sport === option 
                        ? 'text-white' 
                        : isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {option}
                    </Text>
                    {sport === option && (
                      <Ionicons name="checkmark" size={20} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                onPress={() => setShowSportPicker(false)}
                className={`mt-6 p-4 rounded-xl ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}
              >
                <Text className={`text-center font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Event Type Picker Modal */}
      {showTypePicker && (
        <Modal
          visible={showTypePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowTypePicker(false)}
        >
          <TouchableOpacity 
            className="flex-1 justify-end bg-black/50"
            activeOpacity={1}
            onPress={() => setShowTypePicker(false)}
          >
            <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-t-3xl p-6`}>
              <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
              <Text className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Select Type
              </Text>
              <View>
                {eventTypeOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setEventType(option);
                      setShowTypePicker(false);
                    }}
                    className={`p-4 rounded-xl flex-row items-center justify-between mb-3 ${
                      eventType === option 
                        ? isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
                        : isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                  >
                    <Text className={`text-base font-medium ${
                      eventType === option 
                        ? 'text-white' 
                        : isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {option}
                    </Text>
                    {eventType === option && (
                      <Ionicons name="checkmark" size={20} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                onPress={() => setShowTypePicker(false)}
                className={`mt-6 p-4 rounded-xl ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}
              >
                <Text className={`text-center font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Effort Level Picker Modal */}
      {showEffortPicker && (
        <Modal
          visible={showEffortPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowEffortPicker(false)}
        >
          <TouchableOpacity 
            className="flex-1 justify-end bg-black/50"
            activeOpacity={1}
            onPress={() => setShowEffortPicker(false)}
          >
            <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-t-3xl p-6`}>
              <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
              <Text className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Select Effort Level
              </Text>
              <View>
                {effortTypes.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setEffortType(option.value);
                      setShowEffortPicker(false);
                    }}
                    className={`p-4 rounded-xl flex-row items-center justify-between mb-3 ${
                      effortType === option.value 
                        ? isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
                        : isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                  >
                    <Text className={`text-base font-medium ${
                      effortType === option.value 
                        ? 'text-white' 
                        : isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {option.label}
                    </Text>
                    {effortType === option.value && (
                      <Ionicons name="checkmark" size={20} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                onPress={() => setShowEffortPicker(false)}
                className={`mt-6 p-4 rounded-xl ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}
              >
                <Text className={`text-center font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

export default AddTrainingScreen;
