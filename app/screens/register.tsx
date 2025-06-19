/*
================================================================================
                           REGISTRATION FLOW SCREEN
================================================================================
This screen provides a comprehensive multi-step registration flow for new users,
guiding them through the complete setup of their training profile and preferences.

The registration flow includes the following steps:
- Target Sports Selection (step 3)
- All Activities Selection (step 4) 
- Weekly Schedule Configuration (step 5)
- Name Entry (step 6)
- Units Preference (step 7)
- Notification Settings (step 8)
- Interval Type Selection (step 9)
- Appearance Theme Selection (step 10)
- Chat Settings Configuration (step 11)
- Schedule Days Ahead (step 12)
- Partner Integration Setup (step 13)
- Fitness Level & CTL Configuration (step 14)

Each step maintains consistent UI/UX patterns matching the settings page,
with proper state management and progress tracking throughout the flow.
================================================================================
*/

// ============================================================================
//                                IMPORTS
// ============================================================================
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
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import { useNavigation } from '@react-navigation/native';
import { useDarkMode } from '../hooks/commonHooks';
import { signupUser } from '../api_calls/signupApi';
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
    ? 'flex-1 bg-slate-900' 
    : 'flex-1 bg-gray-50';
};

const getInputStyle = (isDarkMode: boolean): string => {
  return isDarkMode 
    ? 'w-full px-6 py-4 rounded-2xl bg-slate-700/90 text-white border-2 border-slate-600/50 h-14 shadow-lg backdrop-blur-sm text-lg focus:border-blue-400'
    : 'w-full px-6 py-4 rounded-2xl bg-white/90 text-slate-800 border-2 border-gray-200/50 h-14 shadow-lg backdrop-blur-sm text-lg focus:border-blue-400';
};

const getButtonStyle = (isDarkMode: boolean, type: 'primary' | 'secondary' | 'disabled' = 'primary'): string => {
  if (type === 'primary') {
    return 'w-full py-5 rounded-xl items-center justify-center bg-blue-600 shadow-xl min-h-[60px] border-2 border-blue-500';
  } else if (type === 'disabled') {
    return isDarkMode 
      ? 'w-full py-5 rounded-xl items-center justify-center bg-gray-600 shadow-xl min-h-[60px] border-2 border-gray-500'
      : 'w-full py-5 rounded-xl items-center justify-center bg-gray-400 shadow-xl min-h-[60px] border-2 border-gray-300';
  } else {
    return isDarkMode 
      ? 'w-full py-4 rounded-xl items-center border border-gray-600 bg-gray-800 shadow-lg'
      : 'w-full py-4 rounded-xl items-center border border-gray-300 bg-white shadow-lg';
  }
};

const getButtonTextStyle = (type: 'primary' | 'secondary' | 'disabled' = 'primary', isDarkMode: boolean = false): string => {
  if (type === 'primary') {
    return 'font-bold text-lg text-white drop-shadow-sm';
  } else if (type === 'disabled') {
    return isDarkMode ? 'font-bold text-lg text-gray-300' : 'font-bold text-lg text-gray-600';
  } else {
    return isDarkMode ? 'font-semibold text-base text-center text-slate-300' : 'font-semibold text-base text-center text-slate-700';
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
  const baseStyle = 'p-4 rounded-xl border-2 shadow-lg';
  
  if (isSelected) {
    return isDarkMode
      ? `${baseStyle} bg-blue-600 border-blue-400 scale-105 shadow-xl`
      : `${baseStyle} bg-blue-500 border-blue-300 scale-105 shadow-xl`;
  } else {
    return isDarkMode
      ? `${baseStyle} bg-slate-700 border-slate-600`
      : `${baseStyle} bg-gray-100 border-gray-300`;
  }
};

const getOptionButtonTextStyle = (isDarkMode: boolean, isSelected: boolean): string => {
  if (isSelected) {
    return 'text-white font-semibold';
  } else {
    return isDarkMode ? 'text-gray-300 font-semibold' : 'text-slate-800 font-semibold';
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
}

const TargetSportsStep: React.FC<TargetSportsStepProps> = ({
  mainFocus,
  onMainFocusChange,
  onNext,
  onBack,
  isDarkMode,
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
              className={`flex-1 items-center justify-center h-[120px] ${getOptionButtonStyle(isDarkMode, isSelected)}`}
              style={{ elevation: isSelected ? 8 : 4 }}
            >
              <MaterialIcons
                name={icon as any}
                size={32}
                color={getOptionButtonIconColor(isDarkMode, isSelected)}
              />
              <Text className={`mt-3 text-sm text-center ${getOptionButtonTextStyle(isDarkMode, isSelected)}`}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      <View className="w-full space-y-4">
        <TouchableOpacity
          className={canContinue ? getButtonStyle(isDarkMode, 'primary') : getButtonStyle(isDarkMode, 'disabled')}
          onPress={onNext}
          disabled={!canContinue}
          style={{ elevation: 6 }}
        >
          <Text className={canContinue ? getButtonTextStyle('primary') : getButtonTextStyle('disabled', isDarkMode)}>Continue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onBack} className="py-3 items-center">
          <Text className={getButtonTextStyle('secondary', isDarkMode)}>Back</Text>
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
}

const AllActivitiesStep: React.FC<AllActivitiesStepProps> = ({
  activities,
  mainFocus,
  onActivitiesChange,
  onNext,
  onBack,
  isDarkMode,
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
                className={`flex-1 items-center justify-center h-[120px] ${getOptionButtonStyle(isDarkMode, isSelected)} ${isFromMainFocus ? (isDarkMode ? 'ring-2 ring-yellow-400' : 'ring-2 ring-yellow-500') : ''}`}
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
                  className={`mt-3 text-sm font-semibold text-center ${getOptionButtonTextStyle(isDarkMode, isSelected)}`}
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
                className={`flex-1 items-center justify-center h-[120px] ${getOptionButtonStyle(isDarkMode, isSelected)}`}
                style={{ elevation: isSelected ? 8 : 4 }}
              >
                <MaterialIcons
                  name={icon as any}
                  size={32}
                  color={getOptionButtonIconColor(isDarkMode, isSelected)}
                />
                <Text
                  className={`mt-3 text-sm font-semibold text-center ${getOptionButtonTextStyle(isDarkMode, isSelected)}`}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      
      <View className="w-full space-y-4">
        <TouchableOpacity className={getButtonStyle(isDarkMode, 'primary')} onPress={onNext} style={{ elevation: 6 }}>
          <Text className={getButtonTextStyle('primary')}>Continue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onBack} className="py-3 items-center">
          <Text className={getButtonTextStyle('secondary', isDarkMode)}>Back</Text>
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
}

const WeeklyScheduleStep: React.FC<WeeklyScheduleStepProps> = ({
  targetHours,
  schedule,
  onTargetHoursChange,
  onScheduleChange,
  onNext,
  onBack,
  isDarkMode,
}) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // ============================================================================
  // MEMOIZED VALUES TO PREVENT REANIMATED WARNINGS
  // ============================================================================
  
  const targetHoursValue = React.useMemo(() => Number(targetHours) || 0, [targetHours]);
  
  const scheduleValues = React.useMemo(() => 
    schedule.map(d => Number(d.hours) || 0), 
    [schedule]
  );
  
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
              const scheduleHoursValue = scheduleValues[i];
              
              return (
                <View key={day} className={`w-full mb-3 p-3 rounded-xl ${isDarkMode ? 'bg-slate-700/30' : 'bg-gray-50/70'}`}>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-slate-800'} text-sm`}>
                      {day}
                    </Text>
                    <View className={`px-2 py-1 rounded-full ${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                      <Text className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} text-xs`}>
                        {scheduleHoursValue}h
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
        <TouchableOpacity className={getButtonStyle(isDarkMode, 'primary')} onPress={onNext} style={{ elevation: 6 }}>
          <Text className={getButtonTextStyle('primary')}>Continue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onBack} className="py-3 items-center">
          <Text className={getButtonTextStyle('secondary', isDarkMode)}>Back</Text>
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
}

const NameStep: React.FC<NameStepProps> = ({
  name,
  onNameChange,
  onNext,
  onBack,
  isDarkMode,
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
          className={name.trim() ? getButtonStyle(isDarkMode, 'primary') : getButtonStyle(isDarkMode, 'disabled')}
          onPress={onNext}
          disabled={!name.trim()}
          style={{ elevation: 6 }}
        >
          <Text className={name.trim() ? getButtonTextStyle('primary') : getButtonTextStyle('disabled', isDarkMode)}>Continue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onBack} className="py-3 items-center">
          <Text className={getButtonTextStyle('secondary', isDarkMode)}>Back</Text>
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
}

const UnitsStep: React.FC<UnitsStepProps> = ({
  units,
  onUnitsChange,
  onNext,
  onBack,
  isDarkMode,
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
              className={`flex-1 items-center justify-center h-[120px] ${getOptionButtonStyle(isDarkMode, isSelected)}`}
              onPress={() => onUnitsChange(unit as 'Metric' | 'Imperial')}
              style={{ elevation: isSelected ? 8 : 4 }}
            >
              <MaterialIcons
                name={unit === 'Metric' ? 'straighten' : 'straighten'}
                size={32}
                color={getOptionButtonIconColor(isDarkMode, isSelected)}
              />
              <Text className={`mt-3 text-sm text-center ${getOptionButtonTextStyle(isDarkMode, isSelected)}`}>
                {unit}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      <View className="w-full space-y-4">
        <TouchableOpacity className={getButtonStyle(isDarkMode, 'primary')} onPress={onNext} style={{ elevation: 6 }}>
          <Text className={getButtonTextStyle('primary')}>Continue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onBack} className="py-3 items-center">
          <Text className={getButtonTextStyle('secondary', isDarkMode)}>Back</Text>
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
}

const NotificationsStep: React.FC<NotificationsStepProps> = ({
  uploadNotif,
  dailyTrainingNotif,
  onUploadNotifChange,
  onDailyTrainingNotifChange,
  onNext,
  onBack,
  isDarkMode,
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
              className={`flex-1 items-center justify-center min-h-[100px] ${getOptionButtonStyle(isDarkMode, state)}`}
              style={{ elevation: 3 }}
            >
              <MaterialIcons
                name={icon as any}
                size={24}
                color={getOptionButtonIconColor(isDarkMode, state)}
              />
              <Text className={`mt-2 text-sm text-center ${getOptionButtonTextStyle(isDarkMode, state)}`}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View className="w-full space-y-4">
        <TouchableOpacity className={getButtonStyle(isDarkMode, 'primary')} onPress={onNext} style={{ elevation: 6 }}>
          <Text className={getButtonTextStyle('primary')}>Continue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onBack} className="py-3 items-center">
          <Text className={getButtonTextStyle('secondary', isDarkMode)}>Back</Text>
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
}

const IntervalTypeStep: React.FC<IntervalTypeStepProps> = ({
  intervalType,
  onIntervalTypeChange,
  onNext,
  onBack,
  isDarkMode,
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
        <View className="flex-row justify-between items-center gap-3">
          {[
            { type: 'mix', icon: 'shuffle', label: 'Mix' },
            { type: 'structured', icon: 'grid-on', label: 'Structured' },
            { type: 'non structured', icon: 'grid-off', label: 'Non-Structured' },
          ].map(({ type, icon, label }) => (
            <TouchableOpacity
              key={type}
              onPress={() => onIntervalTypeChange(type)}
              className={`flex-1 items-center justify-center min-h-[100px] ${getOptionButtonStyle(isDarkMode, intervalType === type)}`}
              style={{ elevation: 3 }}
            >
              <MaterialIcons
                name={icon as any}
                size={24}
                color={getOptionButtonIconColor(isDarkMode, intervalType === type)}
              />
              <Text className={`mt-2 text-sm text-center ${getOptionButtonTextStyle(isDarkMode, intervalType === type)}`}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View className="w-full flex-row justify-center gap-3 mt-3">
          <TouchableOpacity
            onPress={() => onIntervalTypeChange('none')}
            className={`w-full items-center justify-center min-h-[100px] ${getOptionButtonStyle(isDarkMode, intervalType === 'none')}`}
            style={{ elevation: 3 }}
          >
            <MaterialIcons
              name="block"
              size={24}
              color={getOptionButtonIconColor(isDarkMode, intervalType === 'none')}
            />
            <Text className={`mt-2 text-sm text-center ${getOptionButtonTextStyle(isDarkMode, intervalType === 'none')}`}>
              None
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View className="w-full space-y-4">
        <TouchableOpacity className={getButtonStyle(isDarkMode, 'primary')} onPress={onNext} style={{ elevation: 6 }}>
          <Text className={getButtonTextStyle('primary')}>Continue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onBack} className="py-3 items-center">
          <Text className={getButtonTextStyle('secondary', isDarkMode)}>Back</Text>
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
            <Text className={`mt-3 text-sm font-semibold text-center ${getOptionButtonTextStyle(isDarkMode, fitnessMode === 'level')}`}>
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
            <Text className={`mt-3 text-sm font-semibold text-center ${getOptionButtonTextStyle(isDarkMode, fitnessMode === 'ctl')}`}>
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
          className={`${getButtonStyle(isDarkMode, 'primary')} ${loading ? 'opacity-75' : ''}`}
          onPress={onFinish}
          disabled={loading}
          style={{ elevation: 6 }}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className={getButtonTextStyle('primary')}>Complete Registration</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onBack} className="py-3 items-center">
          <Text className={getButtonTextStyle('secondary', isDarkMode)}>Back</Text>
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
}

const PartnerIntegrationStep: React.FC<PartnerIntegrationStepProps> = ({
  onNext,
  onBack,
  isDarkMode,
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
        <TouchableOpacity className={getButtonStyle(isDarkMode, 'primary')} onPress={onNext} style={{ elevation: 6 }}>
          <Text className={getButtonTextStyle('primary')}>Continue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onBack} className="py-3 items-center">
          <Text className={getButtonTextStyle('secondary', isDarkMode)}>Back</Text>
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

  return (
    <View className="w-full items-center justify-center flex-1 px-6">
      <View className="mb-10">
        <Text className={`text-3xl font-bold mb-3 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Chat Settings
        </Text>
        <Text className={`text-lg mb-2 text-center leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Configure how the AI Coach works for you
        </Text>
      </View>

      <View className="flex-row justify-between items-center gap-3 mb-12 w-full">
          {[
            { label: 'Chat History', state: chatHistory, setState: onChatHistoryChange, icon: 'history' },
            { label: 'Chat Memory', state: chatMemory, setState: onChatMemoryChange, icon: 'memory' },
          ].map(({ label, state, setState, icon }) => (
            <TouchableOpacity
              key={label}
              onPress={() => setState(!state)}
              className={`flex-1 items-center justify-center min-h-[100px] ${getOptionButtonStyle(isDarkMode, state)}`}
              style={{ elevation: 3 }}
            >
              <MaterialIcons
                name={icon as any}
                size={24}
                color={getOptionButtonIconColor(isDarkMode, state)}
              />
              <Text className={`mt-2 text-sm text-center ${getOptionButtonTextStyle(isDarkMode, state)}`}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      
      <View className="w-full space-y-4">
        <TouchableOpacity className={getButtonStyle(isDarkMode, 'primary')} onPress={onNext} style={{ elevation: 6 }}>
          <Text className={getButtonTextStyle('primary')}>Continue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onBack} className="py-3 items-center">
          <Text className={getButtonTextStyle('secondary', isDarkMode)}>Back</Text>
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

  return (
    <View className="w-full items-center justify-center flex-1 px-6">
      <View className="mb-10">
        <Text className={`text-3xl font-bold mb-3 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Appearance
        </Text>
        <Text className={`text-lg mb-2 text-center leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Select your preferred theme
        </Text>
      </View>
      
      <View className="w-full mb-12">
        <View className="flex-row justify-between items-center gap-3">
          {[
            { mode: 'light', icon: 'wb-sunny', label: 'Light' },
            { mode: 'dark', icon: 'nights-stay', label: 'Dark' },
            { mode: 'system', icon: 'settings', label: 'System' },
          ].map(({ mode, icon, label }) => (
            <TouchableOpacity
              key={mode}
              onPress={() => onDarkModePreferenceChange(mode as 'light' | 'dark' | 'system')}
              className={`flex-1 items-center justify-center min-h-[100px] ${getOptionButtonStyle(isDarkMode, darkModePreference === mode)}`}
              style={{ elevation: 3 }}
            >
              <MaterialIcons
                name={icon as any}
                size={24}
                color={getOptionButtonIconColor(isDarkMode, darkModePreference === mode)}
              />
              <Text className={`mt-2 text-sm text-center ${getOptionButtonTextStyle(isDarkMode, darkModePreference === mode)}`}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View className="w-full space-y-4">
        <TouchableOpacity className={getButtonStyle(isDarkMode, 'primary')} onPress={onNext} style={{ elevation: 6 }}>
          <Text className={getButtonTextStyle('primary')}>Continue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onBack} className="py-3 items-center">
          <Text className={getButtonTextStyle('secondary', isDarkMode)}>Back</Text>
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

  return (
    <View className="w-full items-center justify-center flex-1 px-6">
      <View className="mb-10">
        <Text className={`text-3xl font-bold mb-3 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Schedule Days Ahead
        </Text>
        <Text className={`text-lg mb-2 text-center leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Choose how many days ahead to schedule your training
        </Text>
      </View>
      
      <View className="w-full mb-12">
        <View className="flex-row gap-4">
          {[1, 3, 5].map((days) => (
            <TouchableOpacity
              key={days}
              className={`flex-1 items-center justify-center min-h-[100px] ${getOptionButtonStyle(isDarkMode, daysAhead === days)}`}
              style={{ elevation: 3 }}
              onPress={() => onDaysAheadChange(days)}
            >
              <Text className={`mt-2 text-sm text-center ${getOptionButtonTextStyle(isDarkMode, daysAhead === days)}`}>{days} Day{days > 1 ? 's' : ''}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View className="w-full space-y-4">
        <TouchableOpacity className={getButtonStyle(isDarkMode, 'primary')} onPress={onNext} style={{ elevation: 6 }}>
          <Text className={getButtonTextStyle('primary')}>Continue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onBack} className="py-3 items-center">
          <Text className={getButtonTextStyle('secondary', isDarkMode)}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const RegisterFlow = ({ route }: any) => {
  let navigation: any = null;
  try {
    navigation = useNavigation<any>();
  } catch (error) {
    console.warn('Navigation context not available:', error);
  }
  
  const { isDarkMode, darkMode, setDarkMode } = useDarkMode();
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
      if (navigation) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Only send verification code if this is a new registration (step 3 or later)
  useEffect(() => {
    // Auto-verification handled by login flow, start directly at registration steps
  }, []);

  const handleRegister = async () => {
    setLoading(true);
    try {
      // Calculate CTL value
      let ctlValue: number;
      if ((Number(ctl)) == 0) {
        const levelToCtl = getLevelToCTL();
        ctlValue = levelToCtl[fitnessLevel];
      } else {
        ctlValue = Number(ctl);
      }

      // Prepare user details according to new API format
      const userDetails = {
        signUpCompleted: true,
        name: name,
        units: units,
        intervalType: intervalType,
        uploadNotif: !!uploadNotif,
        dailyTrainingNotif: !!dailyTrainingNotif,
        defaultSchedule: schedule.map((d) => {
          const value = parseFloat(d.hours);
          const processed = isNaN(value) ? 0 : Math.round(value * 2) / 2;
          console.log(`[register] Converting schedule hours: "${d.hours}" -> ${processed}`);
          return processed;
        }),
        daysAhead: scheduleDaysAhead,
        chatHistoryEnabled: chatHistoryEnabled,
        chatMemoryEnabled: chatMemoryEnabled,
        darkModePreference: darkMode
      };

      // Prepare fitness profile according to new API format
      const fitnessProfile = {
        mode: fitnessMode,
        fitnessLevel: fitnessLevel.toLowerCase(),
        focusedSports: Object.keys(mainFocus).filter((k) => mainFocus[k as keyof typeof mainFocus] === true),
        weeklyHours: targetHours ? Number(targetHours) : 0,
        ctl: ctlValue
      };

      console.log('User details:', userDetails);
      console.log('Fitness profile:', fitnessProfile);

      await signupUser(userDetails, fitnessProfile);
      console.log('User signup completed successfully');
      navigation.navigate('MainTabs');
    } catch (err) {
      alert('Failed to complete signup. ' + getErrorMessage(err));
      console.error('Signup error:', err);
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
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={isDarkMode ? '#0F172A' : '#F9FAFB'} 
      />
      <View 
        className={getContainerStyle(isDarkMode)}
        style={{ 
          backgroundColor: isDarkMode ? '#0F172A' : '#F9FAFB',
          flex: 1
        }}
      >
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
              />
            )}
            {step === 6 && (
              <NameStep
                name={name}
                onNameChange={setName}
                onNext={handleNextStep}
                onBack={handlePreviousStep}
                isDarkMode={isDarkMode}
              />
            )}
            {step === 7 && (
              <UnitsStep
                units={units}
                onUnitsChange={setUnits}
                onNext={handleNextStep}
                onBack={handlePreviousStep}
                isDarkMode={isDarkMode}
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
              />
            )}
            {step === 9 && (
              <IntervalTypeStep
                intervalType={intervalType}
                onIntervalTypeChange={setIntervalType}
                onNext={handleNextStep}
                onBack={handlePreviousStep}
                isDarkMode={isDarkMode}
              />
            )}
            {step === 10 && (
              <AppearanceStep
                darkModePreference={darkMode}
                onDarkModePreferenceChange={setDarkMode}
                onNext={handleNextStep}
                onBack={handlePreviousStep}
                isDarkMode={isDarkMode}
              />
            )}
            {step === 11 && (
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