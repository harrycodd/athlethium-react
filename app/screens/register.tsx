import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import { useNavigation } from '@react-navigation/native';
import { useDarkMode } from '../hooks/commonHooks';
import { detailsApi } from '../api_calls/detailsApi';
import { sessionApi } from '../api_calls/sessionApi';
import { trainingApi } from '../api_calls/trainingApi';
import { 
  getCurrentDateString, 
  getErrorMessage, 
  generateRandomPassword,
  getPlaceholderColor 
} from '../utils/commonUtils';
import '../../global.css';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getLevelToCTL = () => ({
  'Beginner': 30,
  'Intermediate': 60,
  'Advanced': 90,
});

const getContainerStyle = (isDarkMode: boolean): string => {
  return isDarkMode 
    ? 'flex-1 bg-gradient-to-b from-slate-900 to-slate-800' 
    : 'flex-1 bg-gradient-to-b from-gray-50 to-white';
};

const getInputStyle = (isDarkMode: boolean): string => {
  return isDarkMode 
    ? 'w-full px-6 py-4 rounded-2xl bg-slate-700/90 text-white border-2 border-slate-600/50 h-14 shadow-lg backdrop-blur-sm text-lg focus:border-blue-400'
    : 'w-full px-6 py-4 rounded-2xl bg-white/90 text-slate-800 border-2 border-gray-200/50 h-14 shadow-lg backdrop-blur-sm text-lg focus:border-blue-400';
};

const getButtonStyle = (isDarkMode: boolean, type: 'primary' | 'secondary' = 'primary'): string => {
  if (type === 'primary') {
    return 'w-full py-5 rounded-xl items-center justify-center bg-blue-600 shadow-xl active:scale-95 transform transition-all duration-150 min-h-[60px] border-2 border-blue-500';
  } else {
    return isDarkMode 
      ? 'w-full py-4 rounded-xl items-center border border-gray-600 bg-gray-800 shadow-lg active:scale-95 transform transition-all duration-150'
      : 'w-full py-4 rounded-xl items-center border border-gray-300 bg-white shadow-lg active:scale-95 transform transition-all duration-150';
  }
};

const getCardStyle = (isDarkMode: boolean): string => {
  return isDarkMode
    ? 'bg-slate-800/90 rounded-2xl p-6 border border-slate-700/50 shadow-2xl backdrop-blur-sm'
    : 'bg-white/90 rounded-2xl p-6 border border-gray-200/50 shadow-2xl backdrop-blur-sm';
};

const getProgressPercentage = (currentStep: number): number => {
  const totalSteps = 12; // Steps 3-14 = 12 total steps
  const stepIndex = currentStep - 3; // Convert to 0-based index
  return (stepIndex / (totalSteps - 1)) * 100;
};

// ============================================================================
// STYLING FUNCTIONS
// ============================================================================

const getOptionButtonStyle = (isDarkMode: boolean, isSelected: boolean): string => {
  const baseStyle = 'p-4 rounded-xl border-2 shadow-lg transform transition-all duration-200';
  
  if (isSelected) {
    return isDarkMode
      ? `${baseStyle} bg-blue-600 border-blue-400 scale-105 shadow-xl`
      : `${baseStyle} bg-blue-500 border-blue-300 scale-105 shadow-xl`;
  } else {
    return isDarkMode
      ? `${baseStyle} bg-slate-700 border-slate-600 active:scale-95`
      : `${baseStyle} bg-gray-100 border-gray-300 active:scale-95`;
  }
};

const getOptionButtonTextStyle = (isDarkMode: boolean, isSelected: boolean): string => {
  if (isSelected) {
    return 'text-white';
  } else {
    return isDarkMode ? 'text-gray-300' : 'text-slate-800';
  }
};

const getOptionButtonIconColor = (isDarkMode: boolean, isSelected: boolean): string => {
  if (isSelected) {
    return '#FFFFFF';
  } else {
    return isDarkMode ? '#9CA3AF' : '#1E293B';
  }
};

// ============================================================================
// REGISTRATION STEP COMPONENTS
// ============================================================================

interface TargetSportsStepProps {
  mainFocus: { swimming: boolean; cycling: boolean; running: boolean };
  onMainFocusChange: (sport: string) => void;
  onNext: () => void;
  onBack: () => void;
  isDarkMode: boolean;
  buttonClassName: string;
  backButtonClassName: string;
  backButtonTextClassName: string;
}

const TargetSportsStep: React.FC<TargetSportsStepProps> = ({
  mainFocus,
  onMainFocusChange,
  onNext,
  onBack,
  isDarkMode,
  buttonClassName,
  backButtonClassName,
  backButtonTextClassName,
}) => {
  const canContinue = Object.values(mainFocus).some(Boolean);
  
  return (
    <View className="w-full items-center justify-center flex-1 px-6">
      <View className="mb-10">
        <Text className={`text-3xl font-bold mb-3 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Target Sports
        </Text>
        <Text className={`text-lg mb-2 text-center leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Choose your sport(s) that you are training for
        </Text>
      </View>
      
      <View className="flex-row justify-between items-center gap-4 mb-12 w-full">
        {([
          { focus: 'running', icon: 'directions-run', label: 'Running' },
          { focus: 'swimming', icon: 'pool', label: 'Swimming' },
          { focus: 'cycling', icon: 'pedal-bike', label: 'Cycling' },
        ]).map(({ focus, icon, label }) => {
          const isSelected = mainFocus[focus as keyof typeof mainFocus];
          
          return (
            <TouchableOpacity
              key={focus}
              onPress={() => onMainFocusChange(focus)}
              className={`flex-1 items-center justify-center rounded-2xl border-2 shadow-lg h-[120px] transform transition-all duration-200 ${
                isSelected
                  ? isDarkMode
                    ? 'bg-blue-600 border-blue-400 scale-105 shadow-xl'
                    : 'bg-blue-500 border-blue-300 scale-105 shadow-xl'
                  : isDarkMode
                  ? 'bg-slate-700 border-slate-600 active:scale-95'
                  : 'bg-gray-100 border-gray-300 active:scale-95'
              }`}
              style={{ elevation: isSelected ? 8 : 4 }}
            >
              <MaterialIcons
                name={icon as any}
                size={32}
                color={getOptionButtonIconColor(isDarkMode, isSelected)}
              />
              <Text
                className={`mt-3 text-xs font-semibold text-center ${getOptionButtonTextStyle(isDarkMode, isSelected)}`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      <View className="w-full space-y-4">
        <TouchableOpacity
          className={canContinue 
            ? 'w-full py-5 rounded-xl items-center justify-center bg-blue-600 shadow-xl min-h-[60px] border-2 border-blue-500'
            : `w-full py-5 rounded-xl items-center justify-center shadow-xl min-h-[60px] border-2 ${isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-400 border-gray-300'}`
          }
          onPress={onNext}
          disabled={!canContinue}
        >
          <Text className={`font-bold text-lg drop-shadow-sm ${canContinue ? 'text-white' : isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Continue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onBack} className="py-3 items-center">
          <Text className={`font-semibold text-base text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface AllActivitiesStepProps {
  activities: { swimming: boolean; cycling: boolean; running: boolean; yoga: boolean; strength: boolean };
  mainFocus: { swimming: boolean; cycling: boolean; running: boolean };
  onActivitiesChange: (activity: string) => void;
  onNext: () => void;
  onBack: () => void;
  isDarkMode: boolean;
  buttonClassName: string;
  backButtonClassName: string;
  backButtonTextClassName: string;
}

const AllActivitiesStep: React.FC<AllActivitiesStepProps> = ({
  activities,
  mainFocus,
  onActivitiesChange,
  onNext,
  onBack,
  isDarkMode,
  buttonClassName,
  backButtonClassName,
  backButtonTextClassName,
}) => {
  return (
    <View className="w-full items-center justify-center flex-1 px-6">
      <View className="mb-10">
        <Text className={`text-3xl font-bold mb-3 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          All Activities
        </Text>
        <Text className={`text-lg mb-2 text-center leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Select all activities you participate in
        </Text>
      </View>
      
      <View className="mb-12 w-full">
        <View className="flex-row justify-between items-center gap-3 mb-5">
          {([
            { key: 'running', icon: 'directions-run', label: 'Running' },
            { key: 'swimming', icon: 'pool', label: 'Swimming' },
            { key: 'cycling', icon: 'pedal-bike', label: 'Cycling' },
          ]).map(({ key, icon, label }) => {
            const isSelected = activities[key as keyof typeof activities];
            const isFromMainFocus = mainFocus[key as keyof typeof mainFocus];
            const isDisabled = isFromMainFocus; // Disable if it was selected in step 1
            
            return (
              <TouchableOpacity
                key={key}
                onPress={() => !isDisabled && onActivitiesChange(key)}
                className={`flex-1 items-center justify-center rounded-2xl border-2 shadow-lg h-[120px] transform transition-all duration-200 ${
                  isSelected
                    ? isDarkMode
                      ? `bg-blue-600 border-blue-400 scale-105 shadow-xl ${isFromMainFocus ? 'ring-2 ring-yellow-400' : ''}`
                      : `bg-blue-500 border-blue-300 scale-105 shadow-xl ${isFromMainFocus ? 'ring-2 ring-yellow-500' : ''}`
                    : isDarkMode
                    ? 'bg-slate-700 border-slate-600 active:scale-95'
                    : 'bg-gray-100 border-gray-300 active:scale-95'
                }`}
                style={{ elevation: isSelected ? 8 : 4 }}
              >
                {isFromMainFocus && (
                  <View className="absolute -top-1 -right-1 bg-yellow-500 rounded-full w-4 h-4 items-center justify-center">
                    <MaterialIcons name="star" size={10} color="white" />
                  </View>
                )}
                <MaterialIcons
                  name={icon as any}
                  size={32}
                  color={getOptionButtonIconColor(isDarkMode, isSelected)}
                />
                <Text
                  className={`mt-3 text-xs font-semibold text-center ${getOptionButtonTextStyle(isDarkMode, isSelected)}`}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        
        <View className="w-full flex-row justify-center gap-4">
          {[
            { key: 'yoga', icon: 'self-improvement', label: 'Yoga' },
            { key: 'strength', icon: 'fitness-center', label: 'Strength' },
          ].map(({ key, icon, label }) => {
            const isSelected = activities[key as keyof typeof activities];
            
            return (
              <TouchableOpacity
                key={key}
                onPress={() => onActivitiesChange(key)}
                className={`items-center justify-center rounded-2xl border-2 shadow-lg h-[120px] w-[45%] transform transition-all duration-200 ${
                  isSelected
                    ? isDarkMode
                      ? 'bg-blue-600 border-blue-400 scale-105 shadow-xl'
                      : 'bg-blue-500 border-blue-300 scale-105 shadow-xl'
                    : isDarkMode
                    ? 'bg-slate-700 border-slate-600 active:scale-95'
                    : 'bg-gray-100 border-gray-300 active:scale-95'
                }`}
                style={{ elevation: isSelected ? 8 : 4 }}
              >
                <MaterialIcons
                  name={icon as any}
                  size={32}
                  color={getOptionButtonIconColor(isDarkMode, isSelected)}
                />
                <Text
                  className={`mt-3 text-xs font-semibold text-center ${getOptionButtonTextStyle(isDarkMode, isSelected)}`}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      
      <View className="w-full space-y-4">
        <TouchableOpacity className={`${buttonClassName}`} onPress={onNext} style={{ elevation: 6 }}>
          <Text className="font-bold text-lg text-white drop-shadow-sm">Continue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onBack} className="py-3 items-center">
          <Text className={`font-semibold text-base text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface WeeklyScheduleStepProps {
  targetHours: string;
  schedule: Array<{ hours: string }>;
  onTargetHoursChange: (hours: string) => void;
  onScheduleChange: (dayIndex: number, hours: string) => void;
  onNext: () => void;
  onBack: () => void;
  isDarkMode: boolean;
  buttonClassName: string;
  backButtonClassName: string;
  backButtonTextClassName: string;
}

const WeeklyScheduleStep: React.FC<WeeklyScheduleStepProps> = ({
  targetHours,
  schedule,
  onTargetHoursChange,
  onScheduleChange,
  onNext,
  onBack,
  isDarkMode,
  buttonClassName,
  backButtonClassName,
  backButtonTextClassName,
}) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // ============================================================================
  // MEMOIZED VALUES TO PREVENT REANIMATED WARNINGS
  // ============================================================================
  
  const targetHoursValue = React.useMemo(() => Number(targetHours) || 0, [targetHours]);
  
  const handleTargetHoursChange = React.useCallback((value: number) => {
    onTargetHoursChange(value.toString());
  }, [onTargetHoursChange]);
  
  const handleScheduleChange = React.useCallback((dayIndex: number, value: number) => {
    onScheduleChange(dayIndex, value.toString());
  }, [onScheduleChange]);
  
  return (
    <View className="w-full items-center justify-center flex-1">
      <ScrollView className="w-full flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="mb-8">
          <Text className={`text-2xl font-bold mb-2 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Weekly Schedule
          </Text>
          <Text className={`text-base mb-6 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Set your training targets and schedule
          </Text>
        </View>

        {/* Target Weekly Hours */}
        <View className="mb-4 px-6">
          <Text className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Target Weekly Hours
          </Text>
          <Text className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            This is the number of hours you would like to train in the week
          </Text>
          <View className="w-full">
            <View className="flex-row justify-between items-center mb-2">
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-slate-600'} text-sm font-medium`}>0 hours</Text>
              <View className={`px-3 py-1 rounded-full ${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                <Text className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} text-base`}>
                  {targetHours || '0'} hours
                </Text>
              </View>
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-slate-600'} text-sm font-medium`}>30 hours</Text>
            </View>
            <Slider
              style={{ width: '100%', height: 30 }}
              minimumValue={0}
              maximumValue={30}
              step={1}
              value={targetHoursValue}
              onValueChange={handleTargetHoursChange}
              minimumTrackTintColor={isDarkMode ? '#3B82F6' : '#2563EB'}
              maximumTrackTintColor={isDarkMode ? '#374151' : '#E5E7EB'}
              thumbTintColor={isDarkMode ? '#60A5FA' : '#3B82F6'}
            />
          </View>
        </View>

        {/* Max Daily Hours */}
        <View className="mb-4 px-6">
          <Text className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Max Daily Hours
          </Text>
          <Text className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Set your maximum training hours for each day
          </Text>
          <View className="w-full">  
            {days.map((day, i) => {
              const scheduleHoursValue = Number(schedule[i]?.hours) || 0;
              
              return (
                <View key={day} className={`w-full mb-3 p-3 rounded-xl ${isDarkMode ? 'bg-slate-700/30' : 'bg-gray-50/70'}`}>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-slate-800'} text-sm`}>
                      {day}
                    </Text>
                    <View className={`px-2 py-1 rounded-full ${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                      <Text className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} text-xs`}>
                        {schedule[i]?.hours || '0'}h
                      </Text>
                    </View>
                  </View>
                  <View className="w-full">
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className={`${isDarkMode ? 'text-gray-400' : 'text-slate-600'} text-xs font-medium`}>0</Text>
                      <Text className={`${isDarkMode ? 'text-gray-400' : 'text-slate-600'} text-xs font-medium`}>8</Text>
                    </View>
                    <Slider
                      style={{ width: '100%', height: 25 }}
                      minimumValue={0}
                      maximumValue={8}
                      step={0.5}
                      value={scheduleHoursValue}
                      onValueChange={(value) => handleScheduleChange(i, value)}
                      minimumTrackTintColor={isDarkMode ? '#3B82F6' : '#2563EB'}
                      maximumTrackTintColor={isDarkMode ? '#475569' : '#E5E7EB'}
                      thumbTintColor={isDarkMode ? '#60A5FA' : '#3B82F6'}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
      
      <View className="w-full px-6 space-y-4">
        <TouchableOpacity className={buttonClassName} onPress={onNext} style={{ elevation: 6 }}>
          <Text className="font-bold text-lg text-white drop-shadow-sm">Continue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onBack} className="py-3 items-center">
          <Text className={`font-semibold text-base text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface NameStepProps {
  name: string;
  onNameChange: (name: string) => void;
  onNext: () => void;
  onBack: () => void;
  isDarkMode: boolean;
  buttonClassName: string;
  backButtonClassName: string;
  backButtonTextClassName: string;
}

const NameStep: React.FC<NameStepProps> = ({
  name,
  onNameChange,
  onNext,
  onBack,
  isDarkMode,
  buttonClassName,
  backButtonClassName,
  backButtonTextClassName,
}) => {
  return (
    <View className="w-full items-center justify-center flex-1 px-6">
      <View className="mb-10">
        <Text className={`text-3xl font-bold mb-3 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Your Name
        </Text>
        <Text className={`text-lg mb-2 text-center leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          What should we call you?
        </Text>
      </View>
      
      <View className="w-full mb-12">
        <TextInput
          className={`px-4 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-300 text-slate-800'}`}
          style={Platform.select({
            android: { minHeight: 38, textAlignVertical: 'center', includeFontPadding: false, paddingVertical: 6 },
            ios: { minHeight: 38, paddingTop: 6, paddingBottom: 6 }
          })}
          value={name}
          onChangeText={onNameChange}
          placeholder="Enter your name"
          placeholderTextColor={getPlaceholderColor(isDarkMode)}
          autoCapitalize="words"
        />
      </View>
      
      <View className="w-full space-y-4">
        <TouchableOpacity
          className={`w-full py-5 rounded-xl items-center justify-center shadow-xl active:scale-95 transform transition-all duration-150 min-h-[60px] border-2 ${
            name.trim()
              ? 'bg-blue-600 border-blue-500'
              : isDarkMode
              ? 'bg-gray-600 border-gray-500'
              : 'bg-gray-400 border-gray-300'
          }`}
          onPress={onNext}
          disabled={!name.trim()}
          style={{ elevation: 6 }}
        >
          <Text className="font-bold text-lg text-white drop-shadow-sm">Continue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onBack} className="py-3 items-center">
          <Text className={`font-semibold text-base text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface UnitsStepProps {
  units: 'Metric' | 'Imperial';
  onUnitsChange: (units: 'Metric' | 'Imperial') => void;
  onNext: () => void;
  onBack: () => void;
  isDarkMode: boolean;
  buttonClassName: string;
  backButtonClassName: string;
  backButtonTextClassName: string;
}

const UnitsStep: React.FC<UnitsStepProps> = ({
  units,
  onUnitsChange,
  onNext,
  onBack,
  isDarkMode,
  buttonClassName,
  backButtonClassName,
  backButtonTextClassName,
}) => {
  return (
    <View className="w-full items-center justify-center flex-1 px-6">
      <View className="mb-10">
        <Text className={`text-3xl font-bold mb-3 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Preferred Units
        </Text>
        <Text className={`text-lg mb-2 text-center leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Choose your measurement system
        </Text>
      </View>
      
      <View className="flex-row justify-between items-center gap-5 mb-12 w-full">
        {['Metric', 'Imperial'].map((unit) => {
          const isSelected = units === unit;
          
          return (
            <TouchableOpacity
              key={unit}
              className={`flex-1 items-center justify-center rounded-2xl border-2 shadow-lg h-[120px] transform transition-all duration-200 ${
                isSelected
                  ? isDarkMode
                    ? 'bg-blue-600 border-blue-400 scale-105 shadow-xl'
                    : 'bg-blue-500 border-blue-300 scale-105 shadow-xl'
                  : isDarkMode
                  ? 'bg-slate-700 border-slate-600 active:scale-95'
                  : 'bg-gray-100 border-gray-300 active:scale-95'
              }`}
              onPress={() => onUnitsChange(unit as 'Metric' | 'Imperial')}
              style={{ elevation: isSelected ? 8 : 4 }}
            >
              <MaterialIcons
                name={unit === 'Metric' ? 'straighten' : 'straighten'}
                size={32}
                color={getOptionButtonIconColor(isDarkMode, isSelected)}
              />
              <Text className={`mt-3 text-xs font-semibold text-center ${getOptionButtonTextStyle(isDarkMode, isSelected)}`}>
                {unit}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      <View className="w-full space-y-4">
        <TouchableOpacity className={buttonClassName} onPress={onNext} style={{ elevation: 3 }}>
          <Text className="font-bold text-lg text-white drop-shadow-sm">Continue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onBack} className="py-3 items-center">
          <Text className={`font-semibold text-base text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface NotificationsStepProps {
  uploadNotif: boolean;
  dailyTrainingNotif: boolean;
  onUploadNotifChange: () => void;
  onDailyTrainingNotifChange: () => void;
  onNext: () => void;
  onBack: () => void;
  isDarkMode: boolean;
  buttonClassName: string;
  backButtonClassName: string;
  backButtonTextClassName: string;
}

const NotificationsStep: React.FC<NotificationsStepProps> = ({
  uploadNotif,
  dailyTrainingNotif,
  onUploadNotifChange,
  onDailyTrainingNotifChange,
  onNext,
  onBack,
  isDarkMode,
  buttonClassName,
  backButtonClassName,
  backButtonTextClassName,
}) => {
  return (
    <View className="w-full items-center justify-center flex-1 px-6">
      <View className="mb-10">
        <Text className={`text-3xl font-bold mb-3 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Notifications
        </Text>
        <Text className={`text-lg mb-2 text-center leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Manage what you'd like to be notified about
        </Text>
      </View>
      
      <View className="w-full mb-12">
        <View className="flex-row justify-between items-center gap-3">
          {[
            { label: 'Workout Upload', state: uploadNotif, setState: onUploadNotifChange, icon: 'cloud-upload' },
            { label: 'Daily Training', state: dailyTrainingNotif, setState: onDailyTrainingNotifChange, icon: 'update' },
          ].map(({ label, state, setState, icon }) => (
            <TouchableOpacity
              key={label}
              onPress={setState}
              className={`flex-1 items-center justify-center p-4 rounded-xl border shadow-md min-h-[100px] ${
                state
                  ? isDarkMode
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-blue-500 border-blue-400'
                  : isDarkMode
                  ? 'bg-slate-800 border-gray-600'
                  : 'bg-slate-200 border-gray-300'
              }`}
              style={{ elevation: 3 }}
            >
              <MaterialIcons
                name={icon as any}
                size={24}
                color={state ? '#FFFFFF' : isDarkMode ? '#9CA3AF' : '#1E293B'}
              />
              <Text
                className={`mt-2 text-sm font-medium text-center ${
                  state ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-slate-800'
                }`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View className="w-full space-y-4">
        <TouchableOpacity className={buttonClassName} onPress={onNext} style={{ elevation: 6 }}>
          <Text className="font-bold text-lg text-white drop-shadow-sm">Continue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onBack} className="py-3 items-center">
          <Text className={`font-semibold text-base text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface IntervalTypeStepProps {
  intervalType: string;
  onIntervalTypeChange: (type: string) => void;
  onNext: () => void;
  onBack: () => void;
  isDarkMode: boolean;
  buttonClassName: string;
  backButtonClassName: string;
  backButtonTextClassName: string;
}

const IntervalTypeStep: React.FC<IntervalTypeStepProps> = ({
  intervalType,
  onIntervalTypeChange,
  onNext,
  onBack,
  isDarkMode,
  buttonClassName,
  backButtonClassName,
  backButtonTextClassName,
}) => {
  return (
    <View className="w-full items-center justify-center flex-1 px-6">
      <View className="mb-10">
        <Text className={`text-3xl font-bold mb-3 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Interval Type
        </Text>
        <Text className={`text-lg mb-2 text-center leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Choose your preferred interval training style
        </Text>
      </View>
      
      <View className="w-full mb-12">
        <View className="flex-row flex-wrap justify-between items-start gap-3">
          {[
            { type: 'mix', icon: 'shuffle', label: 'Mix' },
            { type: 'structured', icon: 'grid-on', label: 'Structured' },
            { type: 'non structured', icon: 'grid-off', label: 'Non-Structured' },
          ].map(({ type, icon, label }) => (
            <TouchableOpacity
              key={type}
              onPress={() => onIntervalTypeChange(type)}
              className={`items-center justify-center p-4 rounded-xl border shadow-md min-h-[100px] w-[30%] mb-3 ${
                intervalType === type
                  ? isDarkMode
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-blue-500 border-blue-400'
                  : isDarkMode
                  ? 'bg-slate-800 border-gray-600'
                  : 'bg-slate-200 border-gray-300'
              }`}
              style={{ elevation: 3 }}
            >
              <MaterialIcons
                name={icon as any}
                size={24}
                color={intervalType === type ? '#FFFFFF' : isDarkMode ? '#9CA3AF' : '#1E293B'}
              />
              <Text
                className={`mt-2 text-xs font-medium text-center leading-tight ${
                  intervalType === type ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-slate-800'
                }`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
          <View className="w-full flex-row justify-center gap-3">
            <TouchableOpacity
              onPress={() => onIntervalTypeChange('none')}
              className={`items-center justify-center p-4 rounded-xl border shadow-md min-h-[100px] w-[30%] ${
                intervalType === 'none'
                  ? isDarkMode
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-blue-500 border-blue-400'
                  : isDarkMode
                  ? 'bg-slate-800 border-gray-600'
                  : 'bg-slate-200 border-gray-300'
              }`}
              style={{ elevation: 3 }}
            >
              <MaterialIcons
                name="block"
                size={24}
                color={intervalType === 'none' ? '#FFFFFF' : isDarkMode ? '#9CA3AF' : '#1E293B'}
              />
              <Text
                className={`mt-2 text-sm font-medium text-center leading-tight ${
                  intervalType === 'none' ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-slate-800'
                }`}
              >
                None
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <View className="w-full space-y-4">
        <TouchableOpacity className={`${buttonClassName}`} onPress={onNext} style={{ elevation: 6 }}>
          <Text className="font-bold text-lg text-white drop-shadow-sm">Continue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onBack} className="py-3 items-center">
          <Text className={`font-semibold text-base text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface FitnessStepProps {
  fitnessMode: 'level' | 'ctl';
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  ctl: string;
  onFitnessModeChange: (mode: 'level' | 'ctl') => void;
  onFitnessLevelChange: (level: 'Beginner' | 'Intermediate' | 'Advanced') => void;
  onCtlChange: (ctl: string) => void;
  onFinish: () => void;
  onBack: () => void;
  loading: boolean;
  isDarkMode: boolean;
  buttonClassName: string;
  backButtonClassName: string;
  backButtonTextClassName: string;
}

const FitnessStep: React.FC<FitnessStepProps> = ({
  fitnessMode,
  fitnessLevel,
  ctl,
  onFitnessModeChange,
  onFitnessLevelChange,
  onCtlChange,
  onFinish,
  onBack,
  loading,
  isDarkMode,
  buttonClassName,
  backButtonClassName,
  backButtonTextClassName,
}) => {
  return (
    <View className="w-full items-center justify-center flex-1 px-6">
      <View className="mb-10">
        <Text className={`text-3xl font-bold mb-3 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Current Fitness Level
        </Text>
        <Text className={`text-lg mb-2 text-center leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Help us personalize your training plan
        </Text>
      </View>
      
      <View className="w-full mb-12">
        <View className="flex-row mb-8 gap-4">
          <TouchableOpacity
            className={`flex-1 items-center justify-center rounded-2xl border-2 shadow-lg h-[120px] transform transition-all duration-200 ${
              fitnessMode === 'level'
                ? isDarkMode
                  ? 'bg-blue-600 border-blue-400 scale-105 shadow-xl'
                  : 'bg-blue-500 border-blue-300 scale-105 shadow-xl'
                : isDarkMode
                ? 'bg-slate-700 border-slate-600 active:scale-95'
                : 'bg-gray-100 border-gray-300 active:scale-95'
            }`}
            onPress={() => onFitnessModeChange('level')}
            style={{ elevation: fitnessMode === 'level' ? 8 : 4 }}
          >
            <MaterialIcons
              name="trending-up"
              size={32}
              color={getOptionButtonIconColor(isDarkMode, fitnessMode === 'level')}
            />
            <Text className={`mt-3 text-xs font-semibold text-center ${getOptionButtonTextStyle(isDarkMode, fitnessMode === 'level')}`}>
              Level
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`flex-1 items-center justify-center rounded-2xl border-2 shadow-lg h-[120px] transform transition-all duration-200 ${
              fitnessMode === 'ctl'
                ? isDarkMode
                  ? 'bg-blue-600 border-blue-400 scale-105 shadow-xl'
                  : 'bg-blue-500 border-blue-300 scale-105 shadow-xl'
                : isDarkMode
                ? 'bg-slate-700 border-slate-600 active:scale-95'
                : 'bg-gray-100 border-gray-300 active:scale-95'
            }`}
            onPress={() => onFitnessModeChange('ctl')}
            style={{ elevation: fitnessMode === 'ctl' ? 8 : 4 }}
          >
            <MaterialIcons
              name="analytics"
              size={32}
              color={getOptionButtonIconColor(isDarkMode, fitnessMode === 'ctl')}
            />
            <Text className={`mt-3 text-xs font-semibold text-center ${getOptionButtonTextStyle(isDarkMode, fitnessMode === 'ctl')}`}>
              CTL
            </Text>
          </TouchableOpacity>
        </View>

        {fitnessMode === 'level' ? (
          <View className="space-y-3">
            <Text className={`text-base mb-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Select your fitness level:
            </Text>
            <CustomDropdown
              value={fitnessLevel}
              options={['Beginner', 'Intermediate', 'Advanced']}
              onValueChange={(value) => onFitnessLevelChange(value as 'Beginner' | 'Intermediate' | 'Advanced')}
              isDarkMode={isDarkMode}
              title="Select Fitness Level"
            />
          </View>
        ) : (
          <View className="space-y-3">
            <Text className={`text-base mb-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Enter your current CTL value:
            </Text>
            <TextInput
              value={ctl}
              onChangeText={onCtlChange}
              className={`px-4 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-300 text-slate-800'}`}
              style={Platform.select({
                android: { minHeight: 38, textAlignVertical: 'center', includeFontPadding: false, paddingVertical: 6 },
                ios: { minHeight: 38, paddingTop: 6, paddingBottom: 6 }
              })}
              placeholder="Enter CTL value"
              placeholderTextColor={getPlaceholderColor(isDarkMode)}
              keyboardType="numeric"
            />
          </View>
        )}
      </View>
      
      <View className="w-full space-y-4">
        <TouchableOpacity
          className={`${buttonClassName} ${loading ? 'opacity-75' : ''}`}
          onPress={onFinish}
          disabled={loading}
          style={{ elevation: 6 }}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="font-bold text-lg text-white drop-shadow-sm">Complete Registration</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onBack} className="py-3 items-center">
          <Text className={`font-semibold text-base text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================================================
// PARTNER INTEGRATION STEP COMPONENT
// ============================================================================

interface PartnerIntegrationStepProps {
  onNext: () => void;
  onBack: () => void;
  isDarkMode: boolean;
  buttonClassName: string;
  backButtonClassName: string;
  backButtonTextClassName: string;
}

const PartnerIntegrationStep: React.FC<PartnerIntegrationStepProps> = ({
  onNext,
  onBack,
  isDarkMode,
  buttonClassName,
  backButtonClassName,
  backButtonTextClassName,
}) => {
  const handleConnectStrava = () => {
    Alert.alert('Strava Integration', 'Strava integration coming soon!');
  };

  const handleConnectGarmin = () => {
    Alert.alert('Garmin Integration', 'Garmin Connect integration coming soon!');
  };

  const handleConnectWahoo = () => {
    Alert.alert('Wahoo Integration', 'Wahoo integration coming soon!');
  };

  return (
    <View className="w-full items-center justify-center flex-1 px-6">
      <View className="mb-10">
        <Text className={`text-3xl font-bold mb-3 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Partner Integrations
        </Text>
        <Text className={`text-lg mb-2 text-center leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Connect with your favorite fitness platforms
        </Text>
      </View>
      
      <ScrollView className="w-full mb-12" showsVerticalScrollIndicator={false}>
        {/* Strava Integration */}
        <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-5 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-4 shadow-sm`}>
          <View className="flex-row items-center mb-4">
            <View className="mr-3">
              <Image 
                source={require('../../assets/images/strava-logo.png')} 
                style={{ width: 28, height: 28 }}
                resizeMode="contain"
              />
            </View>
            <Text className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Strava
            </Text>
          </View>
          
          <Text className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Import completed workouts and sync planned workouts with Strava
          </Text>
          
          <TouchableOpacity
            className={`py-3 rounded-lg border ${
              isDarkMode ? 'border-orange-500 bg-orange-500/10' : 'border-orange-500 bg-orange-50'
            }`}
            onPress={handleConnectStrava}
            style={{ elevation: 2 }}
          >
            <Text className={`text-center font-semibold ${
              isDarkMode ? 'text-orange-400' : 'text-orange-600'
            }`}>
              Connect Strava
            </Text>
          </TouchableOpacity>
        </View>

        {/* Garmin Integration */}
        <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-5 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-4 shadow-sm`}>
          <View className="flex-row items-center mb-4">
            <View className="mr-3">
              <Image 
                source={require('../../assets/images/garmin-logo.png')} 
                style={{ width: 28, height: 28 }}
                resizeMode="contain"
              />
            </View>
            <Text className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Garmin Connect
            </Text>
          </View>
          
          <Text className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Import workouts from Garmin Connect and sync planned workouts to your Garmin device
          </Text>
          
          <TouchableOpacity
            className={`py-3 rounded-lg border ${
              isDarkMode ? 'border-blue-500 bg-blue-500/10' : 'border-blue-500 bg-blue-50'
            }`}
            onPress={handleConnectGarmin}
            style={{ elevation: 2 }}
          >
            <Text className={`text-center font-semibold ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`}>
              Connect Garmin
            </Text>
          </TouchableOpacity>
        </View>

        {/* Wahoo Integration */}
        <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-5 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
          <View className="flex-row items-center mb-4">
            <View className="mr-3">
              <Image 
                source={require('../../assets/images/wahoo-logo.png')} 
                style={{ width: 28, height: 28 }}
                resizeMode="contain"
              />
            </View>
            <Text className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Wahoo
            </Text>
          </View>
          
          <Text className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Import workouts from Wahoo Cloud and sync planned workouts to your Wahoo app
          </Text>
          
          <TouchableOpacity
            className={`py-3 rounded-lg border ${
              isDarkMode ? 'border-red-500 bg-red-500/10' : 'border-red-500 bg-red-50'
            }`}
            onPress={handleConnectWahoo}
            style={{ elevation: 2 }}
          >
            <Text className={`text-center font-semibold ${
              isDarkMode ? 'text-red-400' : 'text-red-600'
            }`}>
              Connect Wahoo
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <View className="w-full space-y-4">
        <TouchableOpacity className={buttonClassName} onPress={onNext} style={{ elevation: 6 }}>
          <Text className="font-bold text-lg text-white drop-shadow-sm">Continue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onBack} className="py-3 items-center">
          <Text className={`font-semibold text-base text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================================================
// CUSTOM DROPDOWN COMPONENT
// ============================================================================

const CustomDropdown = ({ 
  value, 
  options, 
  onValueChange, 
  isDarkMode,
  title 
}: {
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
  isDarkMode: boolean;
  title: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <View className="relative">
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className={`flex-row items-center justify-between p-4 rounded-xl border shadow-md ${
          isDarkMode 
            ? 'bg-slate-800 border-gray-600' 
            : 'bg-white border-gray-300'
        }`}
        style={{ elevation: 3 }}
      >
        <Text className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {value}
        </Text>
        <MaterialIcons 
          name="keyboard-arrow-down" 
          size={24} 
          color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
        />
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
          <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-t-3xl p-6`}>
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
            <Text className={`text-xl font-bold mb-6 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {title}
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
                      ? 'bg-blue-500'
                      : isDarkMode
                      ? 'bg-slate-700 border border-gray-600'
                      : 'bg-gray-100 border border-gray-300'
                  }`}
                  style={{ elevation: 2 }}
                >
                  <Text className={`text-base font-medium ${
                    value === option 
                      ? 'text-white' 
                      : isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {option}
                  </Text>
                  {value === option && (
                    <MaterialIcons name="check" size={20} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => setIsOpen(false)}
              className={`mt-6 p-4 rounded-xl ${
                isDarkMode ? 'bg-slate-700 border border-gray-600' : 'bg-gray-100 border border-gray-300'
              }`}
              style={{ elevation: 2 }}
            >
              <Text className={`text-center font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ============================================================================
// CHAT SETTINGS STEP COMPONENT
// ============================================================================

interface ChatSettingsStepProps {
  chatHistory: boolean;
  onChatHistoryChange: (value: boolean) => void;
  chatMemory: boolean;
  onChatMemoryChange: (value: boolean) => void;
  isDarkMode: boolean;
  onNext: () => void;
  onBack: () => void;
}

const ChatSettingsStep: React.FC<ChatSettingsStepProps> = ({
  chatHistory,
  onChatHistoryChange,
  chatMemory,
  onChatMemoryChange,
  isDarkMode,
  onNext,
  onBack,
}) => {
  const buttonClassName = isDarkMode 
    ? 'bg-blue-600 py-4 rounded-xl shadow-lg border border-blue-500 items-center hover:bg-blue-700 active:bg-blue-800'
    : 'bg-blue-500 py-4 rounded-xl shadow-lg items-center hover:bg-blue-600 active:bg-blue-700';

  return (
    <View className="flex-1 px-6 py-8 justify-between">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Text className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Chat Settings
        </Text>
        
        <Text className={`text-base mb-8 leading-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          Configure how the AI Coach works for you
        </Text>

        <View className="flex-row justify-between items-center gap-3">
          {[
            { label: 'Chat History', state: chatHistory, setState: onChatHistoryChange, icon: 'history' },
            { label: 'Chat Memory', state: chatMemory, setState: onChatMemoryChange, icon: 'memory' },
          ].map(({ label, state, setState, icon }) => (
            <TouchableOpacity
              key={label}
              onPress={() => setState(!state)}
              className={`flex-1 items-center justify-center p-4 rounded-xl border shadow-md min-h-[100px] ${
                state
                  ? isDarkMode
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-blue-500 border-blue-400'
                  : isDarkMode
                  ? 'bg-slate-800 border-gray-600'
                  : 'bg-slate-200 border-gray-300'
              }`}
              style={{ elevation: 3 }}
            >
              <MaterialIcons
                name={icon as any}
                size={24}
                color={state ? '#FFFFFF' : isDarkMode ? '#9CA3AF' : '#1E293B'}
              />
              <Text
                className={`mt-2 text-sm font-medium text-center ${
                  state ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-slate-800'
                }`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      <View className="w-full space-y-4">
        <TouchableOpacity className={buttonClassName} onPress={onNext} style={{ elevation: 6 }}>
          <Text className="font-bold text-lg text-white drop-shadow-sm">Continue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onBack} className="py-3 items-center">
          <Text className={`font-semibold text-base text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================================================
// APPEARANCE STEP COMPONENT  
// ============================================================================

interface AppearanceStepProps {
  darkModePreference: 'light' | 'dark' | 'system';
  onDarkModePreferenceChange: (value: 'light' | 'dark' | 'system') => void;
  isDarkMode: boolean;
  onNext: () => void;
  onBack: () => void;
}

const AppearanceStep: React.FC<AppearanceStepProps> = ({
  darkModePreference,
  onDarkModePreferenceChange,
  isDarkMode,
  onNext,
  onBack,
}) => {
  const buttonClassName = isDarkMode 
    ? 'bg-blue-600 py-4 rounded-xl shadow-lg border border-blue-500 items-center hover:bg-blue-700 active:bg-blue-800'
    : 'bg-blue-500 py-4 rounded-xl shadow-lg items-center hover:bg-blue-600 active:bg-blue-700';

  return (
    <View className="flex-1 px-6 py-8 justify-between">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Text className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Appearance
        </Text>
        
        <Text className={`text-base mb-8 leading-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          Select your preferred theme
        </Text>

        <View className="flex-row justify-between items-center gap-3">
          {[
            { mode: 'light', icon: 'wb-sunny', label: 'Light' },
            { mode: 'dark', icon: 'nights-stay', label: 'Dark' },
            { mode: 'system', icon: 'settings', label: 'System' },
          ].map(({ mode, icon, label }) => (
            <TouchableOpacity
              key={mode}
              onPress={() => onDarkModePreferenceChange(mode as 'light' | 'dark' | 'system')}
              className={`flex-1 items-center justify-center p-4 rounded-xl border shadow-md min-h-[100px] ${
                darkModePreference === mode
                  ? isDarkMode
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-blue-500 border-blue-400'
                  : isDarkMode
                  ? 'bg-slate-800 border-gray-600'
                  : 'bg-slate-200 border-gray-300'
              }`}
              style={{ elevation: 3 }}
            >
              <MaterialIcons
                name={icon as any}
                size={24}
                color={darkModePreference === mode ? '#FFFFFF' : isDarkMode ? '#9CA3AF' : '#1E293B'}
              />
              <Text
                className={`mt-2 text-sm font-medium text-center ${
                  darkModePreference === mode ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-slate-800'
                }`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      <View className="w-full space-y-4">
        <TouchableOpacity className={buttonClassName} onPress={onNext} style={{ elevation: 6 }}>
          <Text className="font-bold text-lg text-white drop-shadow-sm">Continue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onBack} className="py-3 items-center">
          <Text className={`font-semibold text-base text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================================================
// SCHEDULE DAYS AHEAD STEP COMPONENT
// ============================================================================

interface ScheduleDaysAheadStepProps {
  daysAhead: number;
  onDaysAheadChange: (value: number) => void;
  isDarkMode: boolean;
  onNext: () => void;
  onBack: () => void;
}

const ScheduleDaysAheadStep: React.FC<ScheduleDaysAheadStepProps> = ({
  daysAhead,
  onDaysAheadChange,
  isDarkMode,
  onNext,
  onBack,
}) => {
  const buttonClassName = isDarkMode 
    ? 'bg-blue-600 py-4 rounded-xl shadow-lg border border-blue-500 items-center hover:bg-blue-700 active:bg-blue-800'
    : 'bg-blue-500 py-4 rounded-xl shadow-lg items-center hover:bg-blue-600 active:bg-blue-700';

  return (
    <View className="flex-1 px-6 py-8 justify-between">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Text className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Schedule Days Ahead
        </Text>
        
        <Text className={`text-base mb-8 leading-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          Choose how many days ahead to schedule your training.
        </Text>

        <View className="flex-row gap-4">
          {[1, 3, 5].map((days) => (
            <TouchableOpacity
              key={days}
              className={`flex-1 items-center justify-center p-4 rounded-xl border shadow-md min-h-[100px] ${
                daysAhead === days
                  ? isDarkMode
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-blue-500 border-blue-400'
                  : isDarkMode
                  ? 'bg-slate-800 border-gray-600'
                  : 'bg-slate-200 border-gray-300'
              }`}
              style={{ elevation: 3 }}
              onPress={() => onDaysAheadChange(days)}
            >
              <Text className={`text-sm font-medium text-center ${
                daysAhead === days ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-slate-800'
              }`}>{days} Day{days > 1 ? 's' : ''}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      <View className="w-full space-y-4">
        <TouchableOpacity className={buttonClassName} onPress={onNext} style={{ elevation: 6 }}>
          <Text className="font-bold text-lg text-white drop-shadow-sm">Continue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onBack} className="py-3 items-center">
          <Text className={`font-semibold text-base text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const RegisterFlow = ({ route }: any) => {
  const navigation = useNavigation<any>();
  const { isDarkMode } = useDarkMode();
  // Get email and step from route params (from login page or auto-login)
  const initialEmail = route?.params?.email || '';
  const initialStep = route?.params?.step || 3; // Start at step 3 (target sports)
  const [step, setStep] = useState(initialStep);
  const [email, setEmail] = useState(initialEmail);
  const [verificationCode, setVerificationCode] = useState('');
  const [loginVerificationCode, setLoginVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // User profile states
  const [name, setName] = useState('');
  const [units, setUnits] = useState<'Metric' | 'Imperial'>('Metric');
  const [intervalType, setIntervalType] = useState('mix');
  const [uploadNotif, setUploadNotif] = useState(true);
  const [dailyTrainingNotif, setDailyTrainingNotif] = useState(true);
  const [targetHours, setTargetHours] = useState('12');
  const [ctl, setCtl] = useState('');
  const [fitnessMode, setFitnessMode] = useState<'level' | 'ctl'>('level');
  const [fitnessLevel, setFitnessLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  
  const [mainFocus, setMainFocus] = useState({
    swimming: false,
    cycling: false,
    running: false,
  });
  const [activities, setActivities] = useState({
    swimming: false,
    cycling: false,
    running: false,
    yoga: false,
    strength: false,
  });  const [schedule, setSchedule] = useState(Array(7).fill({ hours: '3' }));

  const [chatHistoryEnabled, setChatHistoryEnabled] = useState(true);
  const [chatMemoryEnabled, setChatMemoryEnabled] = useState(true);
  const [darkModePreference, setDarkModePreference] = useState<'light' | 'dark' | 'system'>('system');
  const [scheduleDaysAhead, setScheduleDaysAhead] = useState(1);

  // Sync mainFocus selections to activities when mainFocus changes
  useEffect(() => {
    setActivities(prev => ({
      ...prev,
      swimming: mainFocus.swimming || prev.swimming,
      cycling: mainFocus.cycling || prev.cycling,
      running: mainFocus.running || prev.running,
    }));
  }, [mainFocus]);

  const handleNextStep = () => {
    setStep((prev: number) => prev + 1);
  }

  const handlePreviousStep = () => {
    setStep((prev: number) => prev - 1);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text.toLowerCase());
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if logout fails, navigate to login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  // Only send verification code if this is a new registration (step 3 or later)
  useEffect(() => {
    // Auto-verification handled by login flow, start directly at registration steps
  }, []);

  const handleRegister = async () => {
    const user = await getCurrentUser();
    const userId = (user.userId);
    setLoading(true);
    console.log(mainFocus)
    console.log(activities)
    console.log(Object.keys(mainFocus).filter((k) => mainFocus[k as keyof typeof mainFocus] === true))
    console.log(Object.keys(activities).filter((k) => activities[k as keyof typeof activities] === true))
    try {
      const details = {
        signUpCompleted: true,
        name: name,
        units: units,
        focusedSports: Object.keys(mainFocus).filter((k) => mainFocus[k as keyof typeof mainFocus] === true),
        sports: Object.keys(activities).filter((k) => activities[k as keyof typeof activities] === true),
        intervalType: intervalType,
        uploadNotif: !!uploadNotif,
        dailyTrainingNotif: !!dailyTrainingNotif,
        weeklyHours: targetHours ? Number(targetHours) : 0,
        defaultSchedule: schedule.map((d) => {
          const value = parseFloat(d.hours);
          const processed = isNaN(value) ? 0 : Math.round(value * 2) / 2; // Ensure proper 0.5 step precision
          console.log(`[register] Converting schedule hours: "${d.hours}" -> ${processed}`);
          return processed;
        }),
        daysAhead: scheduleDaysAhead,
        chatHistoryEnabled: chatHistoryEnabled,
        chatMemoryEnabled: chatMemoryEnabled,
        darkModePreference: darkModePreference
      };
      console.log('User details:', details);

      try {
        await detailsApi.updateUserDetails(details);
        console.log('User details saved:', details);
      } catch (err) {
        alert('Failed to save user details. ' + getErrorMessage(err));
        return;
      }
      try {
        let ctlValue: number; // Declare the variable in outer scope
        if ((Number(ctl)) == 0) {
          const levelToCtl = getLevelToCTL();
          console.log(levelToCtl[fitnessLevel])
          console.log(levelToCtl["Beginner"])

          ctlValue = levelToCtl[fitnessLevel]; // Assign without redeclaring
        }
        else {
          ctlValue = Number(ctl); // Assign without redeclaring
        }
        const today = new Date(); // Use current date
        const selectedActivities = Object.keys(activities).filter((k) => (activities as any)[k] && k !== 'yoga' && k !== 'strength');

        console.log(ctlValue, Math.round(ctlValue / selectedActivities.length))
        ctlValue = Math.round(ctlValue / selectedActivities.length);
        for (let i = 1; i < 42; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateStr = formatDateString(date);
          for (const activity of selectedActivities) {
            await sessionApi.addTraining(dateStr, {
              tss: Math.round(ctlValue / selectedActivities.length),
              session_focus: "-2",
              completed: true,
              date: dateStr,
              name: `Auto-generated workout`,
              sport: activity
            });
          }
        }
      } catch (err) {
        alert('Failed to generate training history. ' + getErrorMessage(err));
        console.log(err)
        return;
      }

      // Manually run the update training plan API request
      try {
        const dateStr = getCurrentDateString();
        await trainingApi.runTrainingAlgorithm(dateStr);
      } catch (err) {
        console.log(err);
      }
      console.log('User details saved successfully');
      navigation.navigate('Home');
    } finally {
      setLoading(false);
    }
  };

  // Consistent modern look for all registration steps
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={-100}
    >
      <View className={getContainerStyle(isDarkMode)}>
        {/* Background decoration */}
        <View className={`absolute top-0 left-0 w-full h-72 opacity-10 ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`} 
              style={{ borderBottomLeftRadius: 50, borderBottomRightRadius: 50 }} />
        
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }}
        >
          <View className="flex-1 justify-center px-2 py-6">
            {/* Modern App Title - positioned between notch and content */}
            <View className="mb-6 mt-20">
              <Text className={`text-5xl font-black text-center tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Athlethium
              </Text>
            </View>
            
            {/* Render the correct step component */}
            {step === 3 && (
              <TargetSportsStep
                mainFocus={mainFocus}
                onMainFocusChange={(sport) => setMainFocus((prev) => ({
                  ...prev,
                  [sport]: !prev[sport as keyof typeof prev],
                }))}
                onNext={handleNextStep}
                onBack={handleLogout}
                isDarkMode={isDarkMode}
                buttonClassName={getButtonStyle(isDarkMode, 'primary')}
                backButtonClassName="mt-4"
                backButtonTextClassName={`font-semibold text-base ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}
              />
            )}
            {step === 4 && (
              <AllActivitiesStep
                activities={activities}
                mainFocus={mainFocus}
                onActivitiesChange={(activity) => setActivities((prev) => ({ ...prev, [activity]: !prev[activity as keyof typeof activities] }))}
                onNext={handleNextStep}
                onBack={handlePreviousStep}
                isDarkMode={isDarkMode}
                buttonClassName={getButtonStyle(isDarkMode, 'primary')}
                backButtonClassName="mt-4"
                backButtonTextClassName={`font-semibold text-base ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}
              />
            )}
            {step === 5 && (
              <WeeklyScheduleStep
                targetHours={targetHours}
                schedule={schedule}
                onTargetHoursChange={setTargetHours}
                onScheduleChange={(dayIndex, hours) => {
                  const newSchedule = [...schedule];
                  newSchedule[dayIndex] = { hours };
                  setSchedule(newSchedule);
                }}
                onNext={handleNextStep}
                onBack={handlePreviousStep}
                isDarkMode={isDarkMode}
                buttonClassName={getButtonStyle(isDarkMode, 'primary')}
                backButtonClassName="mt-4"
                backButtonTextClassName={`font-semibold text-base ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}
              />
            )}
            {step === 6 && (
              <NameStep
                name={name}
                onNameChange={setName}
                onNext={handleNextStep}
                onBack={handlePreviousStep}
                isDarkMode={isDarkMode}
                buttonClassName={getButtonStyle(isDarkMode, 'primary')}
                backButtonClassName="mt-4"
                backButtonTextClassName={`font-semibold text-base ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}
              />
            )}
            {step === 7 && (
              <UnitsStep
                units={units}
                onUnitsChange={setUnits}
                onNext={handleNextStep}
                onBack={handlePreviousStep}
                isDarkMode={isDarkMode}
                buttonClassName={getButtonStyle(isDarkMode, 'primary')}
                backButtonClassName="mt-4"
                backButtonTextClassName={`font-semibold text-base ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}
              />
            )}
            {step === 8 && (
              <NotificationsStep
                uploadNotif={uploadNotif}
                dailyTrainingNotif={dailyTrainingNotif}
                onUploadNotifChange={() => setUploadNotif(!uploadNotif)}
                onDailyTrainingNotifChange={() => setDailyTrainingNotif(!dailyTrainingNotif)}
                onNext={handleNextStep}
                onBack={handlePreviousStep}
                isDarkMode={isDarkMode}
                buttonClassName={getButtonStyle(isDarkMode, 'primary')}
                backButtonClassName="mt-4"
                backButtonTextClassName={`font-semibold text-base ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}
              />
            )}
            {step === 9 && (
              <IntervalTypeStep
                intervalType={intervalType}
                onIntervalTypeChange={setIntervalType}
                onNext={handleNextStep}
                onBack={handlePreviousStep}
                isDarkMode={isDarkMode}
                buttonClassName={getButtonStyle(isDarkMode, 'primary')}
                backButtonClassName="mt-4"
                backButtonTextClassName={`font-semibold text-base ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}
              />
            )}
            {step === 10 && (
              <ChatSettingsStep
                chatHistory={chatHistoryEnabled}
                onChatHistoryChange={setChatHistoryEnabled}
                chatMemory={chatMemoryEnabled}
                onChatMemoryChange={setChatMemoryEnabled}
                onNext={handleNextStep}
                onBack={handlePreviousStep}
                isDarkMode={isDarkMode}
              />
            )}
            {step === 11 && (
              <AppearanceStep
                darkModePreference={darkModePreference}
                onDarkModePreferenceChange={setDarkModePreference}
                onNext={handleNextStep}
                onBack={handlePreviousStep}
                isDarkMode={isDarkMode}
              />
            )}
            {step === 12 && (
              <ScheduleDaysAheadStep
                daysAhead={scheduleDaysAhead}
                onDaysAheadChange={setScheduleDaysAhead}
                onNext={handleNextStep}
                onBack={handlePreviousStep}
                isDarkMode={isDarkMode}
              />
            )}
            {step === 13 && (
              <PartnerIntegrationStep
                onNext={handleNextStep}
                onBack={handlePreviousStep}
                isDarkMode={isDarkMode}
                buttonClassName={getButtonStyle(isDarkMode, 'primary')}
                backButtonClassName="mt-4"
                backButtonTextClassName={`font-semibold text-base ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}
              />
            )}
            {step === 14 && (
              <FitnessStep
                fitnessMode={fitnessMode}
                fitnessLevel={fitnessLevel}
                ctl={ctl}
                onFitnessModeChange={setFitnessMode}
                onFitnessLevelChange={(level) => setFitnessLevel(level)}
                onCtlChange={setCtl}
                onFinish={handleRegister}
                onBack={handlePreviousStep}
                loading={loading}
                isDarkMode={isDarkMode}
                buttonClassName={getButtonStyle(isDarkMode, 'primary')}
                backButtonClassName="mt-4"
                backButtonTextClassName={`font-semibold text-base ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}
              />
            )}
          </View>
        </ScrollView>
        
        {/* Progress Bar */}
        <View className="absolute bottom-0 left-0 right-0 px-6 pb-6">
          <View className={`h-2 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-300'}`}>
            <View 
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage(step)}%` }}
            />
          </View>
          <Text className={`text-xs mt-2 text-center font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Step {step - 2} of 12
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default RegisterFlow;