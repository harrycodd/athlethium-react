import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, ScrollView, useColorScheme, SafeAreaView, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, ActivityIndicator, Alert, Modal } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DarkModeContext } from '../context/DarkModeContext';
import { useContext } from 'react';
import { sessionApi } from '../../utils/mockHelpers';

// Training data interface to match API response
interface TrainingData {
  workoutId: string;
  userId: string;
  date: string;
  name: string;
  description: string;
  tss?: number;
  tss_type?: string;
  time: number;
  sport: string;
  completed: boolean;
  event_type: string;
  workout_file_url?: string;
}

const SessionDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { date, sessionId, viewOnly } = route.params as { date: string, sessionId: string, viewOnly?: boolean };
  const { darkMode } = useContext(DarkModeContext);
  const systemColorScheme = useColorScheme();
  const isDarkMode = darkMode === 'dark' || (darkMode === 'system' && systemColorScheme === 'dark');
  const insets = useSafeAreaInsets();

  // Set the navigation header to hidden and we'll create our own
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const [name, setName] = useState('');
  const [sport, setSport] = useState('');
  const [eventType, setEventType] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDateState, setSelectedDateState] = useState(new Date(date));
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');
  const [seconds, setSeconds] = useState('00');
  const [originalHours, setOriginalHours] = useState('00');
  const [originalMinutes, setOriginalMinutes] = useState('00');
  const [originalSeconds, setOriginalSeconds] = useState('00');
  const [isEditing, setIsEditing] = useState(!viewOnly);
  const [trainingData, setTrainingData] = useState<TrainingData | null>(null);
  const [tss, setTss] = useState<string>('0');
  const [tssType, setTssType] = useState<string>('');
  const [completed, setCompleted] = useState(false);

  // State for dropdown modals
  const [showSportPicker, setShowSportPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showEffortPicker, setShowEffortPicker] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const nameInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);
  const [activeInput, setActiveInput] = useState<string | null>(null);

  // Effort types and their TSS factors
  const effortTypes = [
    { label: 'Recovery', value: 'recovery', factor: 25 },
    { label: 'Steady', value: 'steady', factor: 45 },
    { label: 'Threshold', value: 'threshold', factor: 60 },
    { label: 'VO2max/Hard', value: 'vo2max', factor: 80 },
  ];
  const [effortType, setEffortType] = useState(effortTypes[0].value);

  // Sport options
  const sportOptions = ['Cycling', 'Running', 'Swimming', 'Yoga', 'Strength'];
  const eventTypeOptions = ['Event', 'Session', 'Goal'];

  // Helper function to check if effort level should be shown
  const shouldShowEffortLevel = () => {
    const currentSport = sport.toLowerCase();
    return ['swimming', 'cycling', 'running'].includes(currentSport);
  };

  // Update TSS when time or effortType changes
  useEffect(() => {
    const hoursNum = Number(hours) + Number(minutes) / 60 + Number(seconds) / 3600;
    const selected = effortTypes.find(e => e.value === effortType);
    if (selected) setTss(Math.round(hoursNum * selected.factor).toString());
  }, [hours, minutes, seconds, effortType]);

  // Fetch session details on component mount
  useEffect(() => {
    if (sessionId && sessionId !== 'undefined') {
      fetchSessionDetails();
    } else {
      setIsLoading(false);
      setError('Invalid session ID. Unable to load session details.');
    }
  }, [sessionId]);

  // Handle keyboard visibility for scrolling to active input
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        if (activeInput === 'name' && nameInputRef.current) {
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        } else if (activeInput === 'description' && descriptionInputRef.current) {
          // Since description is now at the bottom, ensure we scroll to the end
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 0);
        }
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, [activeInput]);  // Fetch session details from API
  const fetchSessionDetails = async () => {
    setIsLoading(true);
    try {
      console.log(`Fetching training data for session ${sessionId}`);
      
      // Use the new sessionApi to get training session
      console.log('[session] GET /session/get', { sessionId });
      const data = await sessionApi.getTrainingSession(sessionId);
      console.log('Training data received:', data);
      
      // Store the full response
      setTrainingData(data);
      
      // Set state with fetched data
      setName(data.name || '');
      setSport(data.sport || '');
      setEventType(data.event_type || '');
      setDescription(data.description || '');
      setTss(data.tss?.toString() || '0');
      setTssType(data.tss_type || '');
      setCompleted(data.completed || false);
      
      // Convert time in seconds to HH:MM:SS
      const totalSeconds = data.time || 0;
      const hrs = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;
      
      setHours(String(hrs).padStart(2, '0'));
      setMinutes(String(mins).padStart(2, '0'));
      setSeconds(String(secs).padStart(2, '0'));
      
      // Set the date
      if (data.date) {
        setSelectedDateState(new Date(data.date));
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching training data:', err);
      setError('Failed to load training details');
    } finally {
      setIsLoading(false);
    }
  };

  // Format the time as HH:MM:SS string from separate parts
  const formatTime = () => {
    return `${hours}:${minutes}:${seconds}`;
  };

  // Calculate total seconds for the API
  const calculateTimeInSeconds = () => {
    return (Number(hours) * 3600) + (Number(minutes) * 60) + Number(seconds);
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // Confirmation handler for save action
  const handleSave = () => {
    Alert.alert(
      'Save Changes',
      'Are you sure you want to save these changes?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Save',
          style: 'default',
          onPress: () => {
            handleUpdateTraining();
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Confirmation handler for mark as completed action
  const handleMarkAsCompleted = () => {
    Alert.alert(
      'Mark as Completed',
      'Are you sure you want to mark this session as completed?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Mark Completed',
          style: 'default',
          onPress: () => {
            markAsCompleted();
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Confirmation handler for unmark as completed action
  const handleUnmarkAsCompleted = () => {
    Alert.alert(
      'Unmark as Completed',
      'Are you sure you want to unmark this session as completed?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unmark',
          style: 'default',
          onPress: () => {
            unmarkAsCompleted();
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Confirmation handler for delete action
  const handleDeleteSession = () => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteSession();
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Function to mark session as completed
  const markAsCompleted = async () => {
    try {
      setLoading(true);
      
      if (!trainingData) throw new Error('No training data found');
      
      const body = {
        ...trainingData,
        completed: true
      };
      
      console.log('[session] PUT /session/update', { sessionId, ...body });
      await sessionApi.updateSession(sessionId, body);
      
      setCompleted(true);
      setError(null);
    } catch (err: any) {
      console.error('Error marking as completed:', err);
      setError('Failed to mark as completed');
    } finally {
      setLoading(false);
    }
  };

  // Function to unmark session as completed
  const unmarkAsCompleted = async () => {
    try {
      setLoading(true);
      
      if (!trainingData) throw new Error('No training data found');
      
      const body = {
        ...trainingData,
        completed: false
      };
      
      console.log('[session] PUT /session/update', { sessionId, ...body });
      await sessionApi.updateSession(sessionId, body);
      
      setCompleted(false);
      setError(null);
    } catch (err: any) {
      console.error('Error unmarking as completed:', err);
      setError('Failed to unmark as completed');
    } finally {
      setLoading(false);
    }
  };

  // Function to delete session
  const deleteSession = async () => {
    try {
      setLoading(true);
      console.log('[session] DELETE /session/delete', { sessionId });
      await sessionApi.deleteSession(sessionId);
      navigation.goBack();
    } catch (err) {
      console.error('Error deleting session:', err);
      setError('Failed to delete session');
    } finally {
      setLoading(false);
    }
  };

  // Handle updating training session
  const handleUpdateTraining = async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock user authentication
      const userId = 'demo-user';
      
      console.log(`Updating training session ${sessionId}`);
      
      const body: Partial<TrainingData> = {
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
      
      // Keep the workout_file_url if it exists
      if (trainingData?.workout_file_url) {
        body.workout_file_url = trainingData.workout_file_url;
      }
      
      console.log('Sending update with data:', body);
      
      // Update the training session using the new sessionApi
      console.log('[session] PUT /session/update', { sessionId, ...body });
      await sessionApi.updateSession(sessionId, body);
      
      navigation.goBack();
    } catch (err: any) {
      console.error('Error updating training:', err);
      setError('Failed to update training.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View className={`flex-1 justify-center items-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#2563EB'} />
        <Text className={`mt-4 text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Loading session details...
        </Text>
      </View>
    );
  }

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
              {viewOnly ? 'Training Details' : 'Update Training'}
            </Text>
            <Text className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
              {viewOnly ? 'View and manage session details' : 'Edit your training session'}
            </Text>
          </View>
          
          <View className="w-8" />
        </View>
      </View>

      <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
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
                {/* Session Name */}
                <View className="mb-6">
                  {isEditing ? (
                    <>
                      <Text className={`text-base font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Session Name
                      </Text>
                      <View className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-xl p-3 flex-row items-center`}>
                        <TextInput
                          ref={nameInputRef}
                          className={`flex-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                          style={Platform.select({
                            android: {
                              minHeight: 28,
                              textAlignVertical: 'center',
                              includeFontPadding: false,
                              paddingVertical: 2,
                            },
                            ios: {
                              minHeight: 28,
                              paddingTop: 2,
                              paddingBottom: 2,
                            },
                          })}
                          value={name}
                          onChangeText={setName}
                          placeholder="Enter session name"
                          placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                          onFocus={() => setActiveInput('name')}
                          onBlur={() => setActiveInput(null)}
                        />
                      </View>
                    </>
                  ) : (
                    <Text className={`text-xl font-semibold text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {name || 'Untitled Session'}
                    </Text>
                  )}
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
                  
                  <View className={`px-3 py-1 rounded-full ${
                    completed ? 'bg-green-100' : 'bg-orange-100'
                  }`}>
                    <Text className={`text-xs font-medium ${
                      completed ? 'text-green-700' : 'text-orange-700'
                    }`}>
                      {completed ? 'Completed' : 'Scheduled'}
                    </Text>
                  </View>
                </View>

                {/* Edit Fields - Only show in edit mode */}
                {isEditing && (
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
                        className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-xl px-3 py-3 flex-row items-center`}
                        onPress={() => {
                          Keyboard.dismiss();
                          setShowDatePicker(true);
                        }}
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
                        className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-xl px-3 py-3 flex-row items-center`}
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
                          className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-xl px-3 py-3 flex-row items-center`}
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
                          className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-xl px-3 py-3 flex-row items-center`}
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
                          className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-xl px-3 py-3 flex-row items-center`}
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

                    {/* Description - Moved to bottom to match AddTraining.tsx */}
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
                            paddingVertical: 4,
                          },
                          ios: {
                            minHeight: 50,
                            paddingTop: 4,
                            paddingBottom: 4,
                          },
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
                )}

                {/* Description - Only show in view mode when there's a description */}
                {!isEditing && description && (
                  <View className="pt-6 mt-2 border-t border-gray-200 dark:border-gray-700">
                    <Text className={`text-base font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Description
                    </Text>
                    <Text className={`text-sm leading-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {description}
                    </Text>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              {viewOnly && !isEditing && (
                <View className="mt-6">
                  <View className="gap-4">
                    {!completed ? (
                      <TouchableOpacity
                        className={`${isDarkMode ? 'bg-green-600' : 'bg-green-500'} rounded-xl p-4 flex-row items-center justify-center`}
                        style={{
                          shadowColor: '#10B981',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          elevation: 6
                        }}
                        onPress={handleMarkAsCompleted}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <>
                            <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                            <Text className="text-white text-base font-semibold ml-2">
                              Mark as Completed
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        className={`${isDarkMode ? 'bg-orange-600' : 'bg-orange-500'} rounded-xl p-4 flex-row items-center justify-center`}
                        style={{
                          shadowColor: '#F97316',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          elevation: 6
                        }}
                        onPress={handleUnmarkAsCompleted}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <>
                            <Ionicons name="close-circle-outline" size={20} color="white" />
                            <Text className="text-white text-base font-semibold ml-2">
                              Unmark as Completed
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity 
                      onPress={toggleEditMode}
                      className={`${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} rounded-xl p-4 flex-row items-center justify-center`}
                      style={{
                        shadowColor: '#3B82F6',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 6
                      }}
                    >
                      <Ionicons name="create-outline" size={20} color="white" />
                      <Text className="text-white text-base font-semibold ml-2">
                        Edit Session
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      className={`${isDarkMode ? 'bg-red-600' : 'bg-red-500'} rounded-xl p-4 flex-row items-center justify-center`}
                      style={{
                        shadowColor: '#EF4444',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 6
                      }}
                      onPress={handleDeleteSession}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <>
                          <Ionicons name="trash-outline" size={20} color="white" />
                          <Text className="text-white text-base font-semibold ml-2">
                            Delete Session
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Edit Mode Action Buttons */}
              {isEditing && (
                <View className="mt-6">
                  <View className="gap-4">
                    <TouchableOpacity
                      className={`${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} rounded-xl p-4 flex-row items-center justify-center`}
                      style={{
                        shadowColor: '#3B82F6',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 6
                      }}
                      onPress={handleSave}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <>
                          <Ionicons name="save-outline" size={20} color="white" />
                          <Text className="text-white text-base font-semibold ml-2">
                            Save Changes
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      className={`${isDarkMode ? 'bg-gray-600' : 'bg-gray-500'} rounded-xl p-4 flex-row items-center justify-center`}
                      style={{
                        shadowColor: '#6B7280',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 6
                      }}
                      onPress={() => {
                        setIsEditing(false);
                        // Reset form to original values
                        if (trainingData) {
                          setName(trainingData.name || '');
                          setSport(trainingData.sport || '');
                          setEventType(trainingData.event_type || '');
                          setDescription(trainingData.description || '');
                          setCompleted(trainingData.completed || false);
                          
                          // Reset time values
                          const totalSeconds = trainingData.time || 0;
                          const hrs = Math.floor(totalSeconds / 3600);
                          const mins = Math.floor((totalSeconds % 3600) / 60);
                          const secs = totalSeconds % 60;
                          
                          setHours(String(hrs).padStart(2, '0'));
                          setMinutes(String(mins).padStart(2, '0'));
                          setSeconds(String(secs).padStart(2, '0'));
                          
                          // Reset date
                          if (trainingData.date) {
                            setSelectedDateState(new Date(trainingData.date));
                          }
                        }
                      }}
                      disabled={loading}
                    >
                      <Ionicons name="close-outline" size={20} color="white" />
                      <Text className="text-white text-base font-semibold ml-2">
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      className={`${isDarkMode ? 'bg-red-600' : 'bg-red-500'} rounded-xl p-4 flex-row items-center justify-center`}
                      style={{
                        shadowColor: '#EF4444',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 6
                      }}
                      onPress={handleDeleteSession}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <>
                          <Ionicons name="trash-outline" size={20} color="white" />
                          <Text className="text-white text-base font-semibold ml-2">
                            Delete Session
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

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
      
      {/* Date Picker Modal */}
      {showDatePicker && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center z-[100]">
          <View className={`rounded-2xl p-4 items-center w-[90%] max-w-[500px] border shadow-lg ${
            isDarkMode ? 'bg-slate-800 border-gray-600' : 'bg-white border-transparent'
          }`}> 
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
              style={{ backgroundColor: isDarkMode ? '#1E293B' : '#fff' }}
            />
            {Platform.OS === 'ios' && (
              <View className="flex-row mt-3 w-full">
                <TouchableOpacity onPress={() => setShowDatePicker(false)} className="flex-1 items-center p-2.5">
                  <Text className="text-red-500 font-semibold text-base">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowDatePicker(false)} className="flex-1 items-center p-2.5">
                  <Text className="text-blue-600 font-semibold text-base">Confirm</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}
      
      {/* Custom Time Picker Modal */}
      {showTimePicker && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center z-[100]">
          <View className={`rounded-2xl p-4 items-center w-[90%] max-w-[500px] border shadow-lg ${
            isDarkMode ? 'bg-slate-800 border-gray-600' : 'bg-white border-transparent'
          }`}>
            <Text className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>
              Set Length
            </Text>
            
            <View className="flex-row justify-center items-end mb-5 w-full">
              {/* Hours */}
              <View className="items-center mx-2">
                <Text className={`mb-2 text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Hours</Text>
                <View className="flex-col items-center" style={{ height: 120 }}>
                  <TouchableOpacity 
                    onPress={() => {
                      const newVal = Number(hours) + 1;
                      setHours(String(newVal).padStart(2, '0'));
                    }}
                    className="p-2 mb-1"
                  >
                    <Ionicons name="chevron-up" size={20} color={isDarkMode ? '#E5E7EB' : '#1E293B'} />
                  </TouchableOpacity>
                  <TextInput
                    className={`w-16 border rounded-lg text-center text-lg font-semibold ${
                      isDarkMode 
                        ? 'bg-slate-700 border-gray-600 text-gray-200' 
                        : 'bg-white border-gray-300 text-slate-800'
                    }`}
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
                    onChangeText={(text) => {
                      const num = Number(text.replace(/[^0-9]/g, ''));
                      if (!isNaN(num) && num >= 0 && num <= 99) {
                        setHours(String(num).padStart(2, '0'));
                      }
                    }}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity 
                    onPress={() => {
                      const newVal = Math.max(0, Number(hours) - 1);
                      setHours(String(newVal).padStart(2, '0'));
                    }}
                    className="p-2 mt-1"
                  >
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
                  <TouchableOpacity 
                    onPress={() => {
                      const newVal = (Number(minutes) + 1) % 60;
                      setMinutes(String(newVal).padStart(2, '0'));
                    }}
                    className="p-2 mb-1"
                  >
                    <Ionicons name="chevron-up" size={20} color={isDarkMode ? '#E5E7EB' : '#1E293B'} />
                  </TouchableOpacity>
                  <TextInput
                    className={`w-16 border rounded-lg text-center text-lg font-semibold ${
                      isDarkMode 
                        ? 'bg-slate-700 border-gray-600 text-gray-200' 
                        : 'bg-white border-gray-300 text-slate-800'
                    }`}
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
                    onChangeText={(text) => {
                      const num = Number(text.replace(/[^0-9]/g, ''));
                      if (!isNaN(num) && num >= 0 && num < 60) {
                        setMinutes(String(num).padStart(2, '0'));
                      }
                    }}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity 
                    onPress={() => {
                      const newVal = (Number(minutes) - 1 + 60) % 60;
                      setMinutes(String(newVal).padStart(2, '0'));
                    }}
                    className="p-2 mt-1"
                  >
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
                  <TouchableOpacity 
                    onPress={() => {
                      const newVal = (Number(seconds) + 1) % 60;
                      setSeconds(String(newVal).padStart(2, '0'));
                    }}
                    className="p-2 mb-1"
                  >
                    <Ionicons name="chevron-up" size={20} color={isDarkMode ? '#E5E7EB' : '#1E293B'} />
                  </TouchableOpacity>
                  <TextInput
                    className={`w-16 border rounded-lg text-center text-lg font-semibold ${
                      isDarkMode 
                        ? 'bg-slate-700 border-gray-600 text-gray-200' 
                        : 'bg-white border-gray-300 text-slate-800'
                    }`}
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
                    onChangeText={(text) => {
                      const num = Number(text.replace(/[^0-9]/g, ''));
                      if (!isNaN(num) && num >= 0 && num < 60) {
                        setSeconds(String(num).padStart(2, '0'));
                      }
                    }}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity 
                    onPress={() => {
                      const newVal = (Number(seconds) - 1 + 60) % 60;
                      setSeconds(String(newVal).padStart(2, '0'));
                    }}
                    className="p-2 mt-1"
                  >
                    <Ionicons name="chevron-down" size={20} color={isDarkMode ? '#E5E7EB' : '#1E293B'} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <View className="flex-row mt-3 w-full">
              <TouchableOpacity 
                onPress={() => {
                  // Restore original values when canceling
                  setHours(originalHours);
                  setMinutes(originalMinutes);
                  setSeconds(originalSeconds);
                  setShowTimePicker(false);
                }} 
                className="flex-1 items-center p-2.5">
                <Text className="text-red-500 font-semibold text-base">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowTimePicker(false)} className="flex-1 items-center p-2.5">
                <Text className="text-blue-600 font-semibold text-base">Confirm</Text>
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

export default SessionDetailsScreen;