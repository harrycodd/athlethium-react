import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { getInputStyle, getPlaceholderColor } from '../../utils/styles';

const BUTTON_HEIGHT = 52;
const BUTTON_RADIUS = 12;
const BUTTON_FONT = 'font-semibold text-base';
const BUTTON_FULL_WIDTH = 'w-full';

// Consistent square button styling for all registration steps
const SQUARE_BUTTON_SIZE = 'w-[30%] max-w-[140px] aspect-square';

function getConsistentButtonStyle(isDarkMode: boolean, variant: 'primary' | 'secondary' = 'primary') {
  const base = `${BUTTON_FULL_WIDTH} flex-row items-center justify-center rounded-[${BUTTON_RADIUS}px] h-[${BUTTON_HEIGHT}px] ${BUTTON_FONT}`;
  if (variant === 'primary') {
    return `${base} ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} shadow-md`;
  } else {
    return `${base} ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'} border border-gray-300`;
  }
}

interface EmailStepProps {
  email: string;
  onEmailChange: (text: string) => void;
  onNext: () => void;
  onBack: () => void;
  isDarkMode: boolean;
}

export const EmailStep: React.FC<EmailStepProps> = ({
  email,
  onEmailChange,
  onNext,
  onBack,
  isDarkMode
}) => (
  <View className="w-full items-center px-4">
    <Text className={`text-2xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-slate-800'} mb-2 w-full text-center`}>
      Step 1: Email
    </Text>
    <Text className={`${isDarkMode ? 'text-gray-400' : 'text-slate-600'} text-base mb-4 w-full text-center`}>
      Please enter your email address to proceed.
    </Text>
    <TextInput
      placeholder="Enter your email"
      value={email}
      onChangeText={onEmailChange}
      className={getInputStyle(isDarkMode)}
      style={Platform.select({
        android: { minHeight: 48, textAlignVertical: 'center', includeFontPadding: false, paddingVertical: 12 },
        ios: { minHeight: 48, paddingTop: 12, paddingBottom: 12 }
      })}
      placeholderTextColor={getPlaceholderColor(isDarkMode)}
      autoCorrect={false}
      autoCapitalize="none"
    />
    <View className="flex-col items-center w-full space-y-2 mt-8">
      <TouchableOpacity
        className={getConsistentButtonStyle(isDarkMode, 'secondary')}
        onPress={onBack}
      >
        <Text className={`text-slate-800 ${BUTTON_FONT}`}>Back to Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={getConsistentButtonStyle(isDarkMode)}
        onPress={onNext}
      >
        <Text className={`text-white ${BUTTON_FONT}`}>Next</Text>
      </TouchableOpacity>
    </View>
  </View>
);

interface VerificationStepProps {
  verificationCode: string;
  onCodeChange: (text: string) => void;
  onVerify: () => void;
  onBack: () => void;
  isDarkMode: boolean;
}

export const VerificationStep: React.FC<VerificationStepProps> = ({
  verificationCode,
  onCodeChange,
  onVerify,
  onBack,
  isDarkMode
}) => (
  <View className="w-full items-center px-4">
    <Text className={`text-2xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-slate-800'} mb-2 w-full text-center`}>
      Step 2: Verify Email
    </Text>
    <Text className={`${isDarkMode ? 'text-gray-400' : 'text-slate-600'} text-base mb-4 w-full text-center`}>
      Enter the verification code sent to your email
    </Text>
    <TextInput
      placeholder="Enter verification code"
      value={verificationCode}
      onChangeText={onCodeChange}
      className={getInputStyle(isDarkMode)}
      style={Platform.select({
        android: { minHeight: 48, textAlignVertical: 'center', includeFontPadding: false, paddingVertical: 12, textAlign: 'center' },
        ios: { minHeight: 48, paddingTop: 12, paddingBottom: 12, textAlign: 'center' }
      })}
      placeholderTextColor={getPlaceholderColor(isDarkMode)}
      maxLength={8}
    />
    <View className="flex-col items-center w-full space-y-2 mt-8">
      <TouchableOpacity
        className={getConsistentButtonStyle(isDarkMode, 'secondary')}
        onPress={onBack}
      >
        <Text className={`text-slate-800 ${BUTTON_FONT}`}>Back</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={getConsistentButtonStyle(isDarkMode)}
        onPress={onVerify}
      >
        <Text className={`text-white ${BUTTON_FONT}`}>Verify</Text>
      </TouchableOpacity>
    </View>
  </View>
);

interface StepHeaderProps {
  stepNumber?: number;
  title: string;
  description: string;
  isDarkMode: boolean;
}

const StepHeader: React.FC<StepHeaderProps & { progressBar?: React.ReactNode }> = ({ stepNumber, title, description, isDarkMode, progressBar }) => (
  <>
    <Text className={`text-2xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-slate-800'} mb-2 w-full text-center`}>
      {title}
    </Text>
    {progressBar}
    <Text className={`${isDarkMode ? 'text-gray-400' : 'text-slate-600'} text-base mb-4 w-full text-center`}>
      {description}
    </Text>
  </>
);

interface StepButtonsProps {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
  isDarkMode: boolean;
  buttonClassName?: string;
  backButtonClassName?: string;
  backButtonTextClassName?: string;
}

const StepButtons: React.FC<StepButtonsProps> = ({ 
  onBack, 
  onNext, 
  nextLabel = 'Next', 
  nextDisabled = false, 
  loading = false, 
  isDarkMode, 
  buttonClassName,
  backButtonClassName,
  backButtonTextClassName
}) => (
  <View className="flex-col items-center w-full space-y-2 mt-8">
    <TouchableOpacity
      className={buttonClassName || getConsistentButtonStyle(isDarkMode)}
      onPress={onNext}
      disabled={nextDisabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className={`text-white ${BUTTON_FONT}`}>{nextLabel}</Text>
      )}
    </TouchableOpacity>
    <TouchableOpacity
      className={backButtonClassName || getConsistentButtonStyle(isDarkMode, 'secondary')}
      onPress={onBack}
      disabled={loading}
    >
      <Text className={backButtonTextClassName || `${isDarkMode ? 'text-slate-100' : 'text-slate-800'} ${BUTTON_FONT}`}>Back</Text>
    </TouchableOpacity>
  </View>
);

interface TargetSportsStepProps {
  mainFocus: Record<string, boolean>;
  onMainFocusChange: (sport: string) => void;
  onNext: () => void;
  onBack: () => void;
  isDarkMode: boolean;
}

const RegistrationProgressBar: React.FC<{ step: number; totalSteps: number; isDarkMode: boolean }> = ({ step, totalSteps, isDarkMode }) => {
  const percent = Math.round((step - 2) / (totalSteps - 2) * 100); // step 2 is first, totalSteps includes finish
  return (
    <View className="w-full mb-4 mt-2">
      <View className={`h-2 w-full rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}> 
        <View
          className="h-2 rounded-full"
          style={{
            width: `${percent}%`,
            backgroundColor: isDarkMode ? '#2563EB' : '#3B82F6',
          }}
        />
      </View>
    </View>
  );
};

export const TargetSportsStep: React.FC<TargetSportsStepProps & { step?: number; totalSteps?: number; buttonClassName?: string; backButtonClassName?: string; backButtonTextClassName?: string }> = ({
  mainFocus,
  onMainFocusChange,
  onNext,
  onBack,
  isDarkMode,
  step = 3,
  totalSteps = 10,
  buttonClassName,
  backButtonClassName,
  backButtonTextClassName,
}) => (
  <View className="w-full items-center px-4">
    <StepHeader
      title="Target Sports"
      description="Choose your sport(s) that you are competing at. You must select at least one."
      isDarkMode={isDarkMode}
      progressBar={<RegistrationProgressBar step={step} totalSteps={totalSteps} isDarkMode={isDarkMode} />}
    />
    <View className="flex-row flex-wrap justify-center items-center my-5 gap-4">
      {[
        { key: 'swimming', icon: 'pool' },
        { key: 'cycling', icon: 'pedal-bike' },
        { key: 'running', icon: 'directions-run' },
      ].map(({ key, icon }) => (
        <TouchableOpacity
          key={key}
          onPress={() => onMainFocusChange(key)}
          className={`items-center justify-center p-3 rounded-xl ${SQUARE_BUTTON_SIZE} border shadow-md ${
            mainFocus[key]
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
            color={mainFocus[key] ? '#FFFFFF' : isDarkMode ? '#9CA3AF' : '#1E293B'}
          />
          <Text
            className={`mt-1.5 text-sm font-medium text-center ${
              mainFocus[key] ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-slate-800'
            }`}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
    <StepButtons
      onBack={onBack}
      onNext={onNext}
      nextDisabled={Object.values(mainFocus).filter(Boolean).length === 0}
      isDarkMode={isDarkMode}
      buttonClassName={buttonClassName}
      backButtonClassName={backButtonClassName}
      backButtonTextClassName={backButtonTextClassName}
    />
  </View>
);

interface AllActivitiesStepProps {
  activities: Record<string, boolean>;
  mainFocus: Record<string, boolean>;
  onActivitiesChange: (activity: string) => void;
  onNext: () => void;
  onBack: () => void;
  isDarkMode: boolean;
}

export const AllActivitiesStep: React.FC<AllActivitiesStepProps & { buttonClassName?: string; backButtonClassName?: string; backButtonTextClassName?: string }> = ({
  activities,
  mainFocus,
  onActivitiesChange,
  onNext,
  onBack,
  isDarkMode,
  buttonClassName,
  backButtonClassName,
  backButtonTextClassName
}) => (
  <View className="w-full items-center px-4">
    <StepHeader
      title="All Activities"
      description="Toggle the types of workouts you'd like to include, for a variety of training. Your target sport is always included."
      isDarkMode={isDarkMode}
      progressBar={<RegistrationProgressBar step={4} totalSteps={10} isDarkMode={isDarkMode} />}
    />
    <View className="flex-row flex-wrap justify-center items-center my-5 gap-4">
      {Object.keys(activities).map((key) => {
        const isMain = ['swimming', 'cycling', 'running'].includes(key);
        const isMainFocus = isMain && mainFocus[key];
        const checked = isMainFocus ? true : activities[key];
        const isOptional = key === 'yoga' || key === 'strength';
        
        return (
          <TouchableOpacity
            key={key}
            onPress={() => {
              if (isMainFocus && !isOptional) return;
              onActivitiesChange(key);
            }}
            className={`items-center justify-center p-3 rounded-xl ${SQUARE_BUTTON_SIZE} border shadow-md ${
              checked
                ? isDarkMode
                  ? 'bg-blue-600 border-blue-500'
                  : 'bg-blue-500 border-blue-400'
                : isDarkMode
                ? 'bg-slate-800 border-gray-600'
                : 'bg-slate-200 border-gray-300'
            } ${isMainFocus && !isOptional ? 'opacity-50' : 'opacity-100'}`}
            disabled={isMainFocus && !isOptional}
            style={{ elevation: 3 }}
          >
            <MaterialIcons
              name={
                key === 'running' ? 'directions-run'
                : key === 'swimming' ? 'pool'
                : key === 'cycling' ? 'pedal-bike'
                : key === 'yoga' ? 'self-improvement'
                : 'fitness-center'
              }
              size={24}
              color={checked ? '#FFFFFF' : isMainFocus && !isOptional ? '#9CA3AF' : (isDarkMode ? '#9CA3AF' : '#1E293B')}
            />
            <Text
              className={`mt-1.5 text-sm font-medium text-center ${
                checked ? 'text-white' : 
                isMainFocus && !isOptional ? 'text-gray-400' : isDarkMode ? 'text-gray-400' : 'text-slate-800'
              }`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
    <StepButtons
      onBack={onBack}
      onNext={onNext}
      nextDisabled={Object.entries(activities).filter(([k, v]) => {
        const isMain = ['swimming', 'cycling', 'running'].includes(k);
        return (isMain && mainFocus[k]) || (!isMain && v);
      }).length === 0}
      isDarkMode={isDarkMode}
      buttonClassName={buttonClassName}
      backButtonClassName={backButtonClassName}
      backButtonTextClassName={backButtonTextClassName}
    />
  </View>
);

interface NameStepProps {
  name: string;
  onNameChange: (text: string) => void;
  onNext: () => void;
  onBack: () => void;
  isDarkMode: boolean;
}

export const NameStep: React.FC<NameStepProps & { buttonClassName?: string; backButtonClassName?: string; backButtonTextClassName?: string }> = ({
  name,
  onNameChange,
  onNext,
  onBack,
  isDarkMode,
  buttonClassName,
  backButtonClassName,
  backButtonTextClassName
}) => (
  <View className="w-full items-center px-4">
    <StepHeader
      title="Name"
      description="Enter your name."
      isDarkMode={isDarkMode}
      progressBar={<RegistrationProgressBar step={6} totalSteps={10} isDarkMode={isDarkMode} />}
    />
    <TextInput
      placeholder="Your Name"
      value={name}
      onChangeText={onNameChange}
      className={getInputStyle(isDarkMode)}
      style={Platform.select({
        android: { minHeight: 48, textAlignVertical: 'center', includeFontPadding: false, paddingVertical: 12 },
        ios: { minHeight: 48, paddingTop: 12, paddingBottom: 12 }
      })}
      placeholderTextColor={getPlaceholderColor(isDarkMode)}
    />
    <StepButtons
      onBack={onBack}
      onNext={onNext}
      isDarkMode={isDarkMode}
      buttonClassName={buttonClassName}
      backButtonClassName={backButtonClassName}
      backButtonTextClassName={backButtonTextClassName}
    />
  </View>
);

interface UnitsStepProps {
  units: 'Metric' | 'Imperial';
  onUnitsChange: (units: 'Metric' | 'Imperial') => void;
  onNext: () => void;
  onBack: () => void;
  isDarkMode: boolean;
}

export const UnitsStep: React.FC<UnitsStepProps & { buttonClassName?: string; backButtonClassName?: string; backButtonTextClassName?: string }> = ({
  units,
  onUnitsChange,
  onNext,
  onBack,
  isDarkMode,
  buttonClassName,
  backButtonClassName,
  backButtonTextClassName
}) => (
  <View className="w-full items-center px-4">
    <StepHeader
      title="Units"
      description="Choose your preferred measurement system."
      isDarkMode={isDarkMode}
      progressBar={<RegistrationProgressBar step={7} totalSteps={10} isDarkMode={isDarkMode} />}
    />
    <View className="flex-row flex-wrap justify-center items-center my-5 gap-4">
      <TouchableOpacity 
        className={`items-center justify-center p-3 rounded-xl ${SQUARE_BUTTON_SIZE} border shadow-md ${
          units === 'Metric'
            ? isDarkMode
              ? 'bg-blue-600 border-blue-500'
              : 'bg-blue-500 border-blue-400'
            : isDarkMode
            ? 'bg-slate-800 border-gray-600'
            : 'bg-slate-200 border-gray-300'
        }`}
        style={{ elevation: 3 }}
        onPress={() => onUnitsChange('Metric')}
      >
        <MaterialIcons name="straighten" size={28} style={{ marginBottom: 4 }} color={units === 'Metric' ? '#fff' : isDarkMode ? '#9CA3AF' : '#1E293B'} />
        <Text className={`text-sm text-center mt-0.5 font-medium ${
          units === 'Metric' ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-slate-800'
        }`}>Metric</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        className={`items-center justify-center p-3 rounded-xl ${SQUARE_BUTTON_SIZE} border shadow-md ${
          units === 'Imperial'
            ? isDarkMode
              ? 'bg-blue-600 border-blue-500'
              : 'bg-blue-500 border-blue-400'
            : isDarkMode
            ? 'bg-slate-800 border-gray-600'
            : 'bg-slate-200 border-gray-300'
        }`}
        style={{ elevation: 3 }}
        onPress={() => onUnitsChange('Imperial')}
      >
        <MaterialIcons name="square-foot" size={28} style={{ marginBottom: 4 }} color={units === 'Imperial' ? '#fff' : isDarkMode ? '#9CA3AF' : '#1E293B'} />
        <Text className={`text-sm text-center mt-0.5 font-medium ${
          units === 'Imperial' ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-slate-800'
        }`}>Imperial</Text>
      </TouchableOpacity>
    </View>
    <StepButtons
      onBack={onBack}
      onNext={onNext}
      isDarkMode={isDarkMode}
      buttonClassName={buttonClassName}
      backButtonClassName={backButtonClassName}
      backButtonTextClassName={backButtonTextClassName}
    />
  </View>
);

interface NotificationsStepProps {
  uploadNotif: boolean;
  dailyTrainingNotif: boolean;
  onUploadNotifChange: () => void;
  onDailyTrainingNotifChange: () => void;
  onNext: () => void;
  onBack: () => void;
  isDarkMode: boolean;
}

export const NotificationsStep: React.FC<NotificationsStepProps & { buttonClassName?: string; backButtonClassName?: string; backButtonTextClassName?: string }> = ({
  uploadNotif,
  dailyTrainingNotif,
  onUploadNotifChange,
  onDailyTrainingNotifChange,
  onNext,
  onBack,
  isDarkMode,
  buttonClassName,
  backButtonClassName,
  backButtonTextClassName
}) => (
  <View className="w-full items-center px-4">
    <StepHeader
      title="Notifications"
      description="Choose which notifications you'd like to receive."
      isDarkMode={isDarkMode}
      progressBar={<RegistrationProgressBar step={8} totalSteps={10} isDarkMode={isDarkMode} />}
    />
    <View className="flex-row flex-wrap justify-center items-center my-5 gap-4">
      <TouchableOpacity 
        className={`items-center justify-center p-3 rounded-xl ${SQUARE_BUTTON_SIZE} border shadow-md ${
          uploadNotif
            ? isDarkMode
              ? 'bg-blue-600 border-blue-500'
              : 'bg-blue-500 border-blue-400'
            : isDarkMode
            ? 'bg-slate-800 border-gray-600'
            : 'bg-slate-200 border-gray-300'
        }`}
        style={{ elevation: 3 }}
        onPress={onUploadNotifChange}
      >
        <MaterialIcons name="cloud-upload" size={24} style={{ marginBottom: 4 }} color={uploadNotif ? '#fff' : isDarkMode ? '#9CA3AF' : '#1E293B'} />
        <Text className={`text-sm text-center mt-0.5 font-medium ${
          uploadNotif ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-slate-800'
        }`}>Workout Upload</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        className={`items-center justify-center p-3 rounded-xl ${SQUARE_BUTTON_SIZE} border shadow-md ${
          dailyTrainingNotif
            ? isDarkMode
              ? 'bg-blue-600 border-blue-500'
              : 'bg-blue-500 border-blue-400'
            : isDarkMode
            ? 'bg-slate-800 border-gray-600'
            : 'bg-slate-200 border-gray-300'
        }`}
        style={{ elevation: 3 }}
        onPress={onDailyTrainingNotifChange}
      >
        <MaterialIcons name="update" size={24} style={{ marginBottom: 4 }} color={dailyTrainingNotif ? '#fff' : isDarkMode ? '#9CA3AF' : '#1E293B'} />
        <Text className={`text-sm text-center mt-0.5 font-medium ${
          dailyTrainingNotif ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-slate-800'
        }`}>Daily Training</Text>
      </TouchableOpacity>
    </View>
    <StepButtons
      onBack={onBack}
      onNext={onNext}
      isDarkMode={isDarkMode}
      buttonClassName={buttonClassName}
      backButtonClassName={backButtonClassName}
      backButtonTextClassName={backButtonTextClassName}
    />
  </View>
);

interface IntervalTypeStepProps {
  intervalType: string;
  onIntervalTypeChange: (type: string) => void;
  onNext: () => void;
  onBack: () => void;
  isDarkMode: boolean;
}

export const IntervalTypeStep: React.FC<IntervalTypeStepProps & { buttonClassName?: string; backButtonClassName?: string; backButtonTextClassName?: string }> = ({
  intervalType,
  onIntervalTypeChange,
  onNext,
  onBack,
  isDarkMode,
  buttonClassName,
  backButtonClassName,
  backButtonTextClassName
}) => (
  <View className="w-full items-center px-4">
    <StepHeader
      title="Interval Type"
      description="Choose your preferred interval training style."
      isDarkMode={isDarkMode}
      progressBar={<RegistrationProgressBar step={9} totalSteps={10} isDarkMode={isDarkMode} />}
    />
    <View className="flex-row flex-wrap justify-center items-center my-5 gap-4">
      {[
        { type: 'mix', icon: 'shuffle', label: 'Mix' }, 
        { type: 'structured', icon: 'grid-on', label: 'Structured' }, 
        { type: 'non structured', icon: 'grid-off', label: 'Non Structured' }, 
        { type: 'none', icon: 'block', label: 'None' }
      ].map(({ type, icon, label }) => (
        <TouchableOpacity 
          key={type} 
          className={`items-center justify-center p-3 rounded-xl ${SQUARE_BUTTON_SIZE} border shadow-md ${
            intervalType === type
              ? isDarkMode
                ? 'bg-blue-600 border-blue-500'
                : 'bg-blue-500 border-blue-400'
              : isDarkMode
              ? 'bg-slate-800 border-gray-600'
              : 'bg-slate-200 border-gray-300'
          }`}
          style={{ elevation: 3 }}
          onPress={() => onIntervalTypeChange(type)}
        >
          <MaterialIcons name={icon as any} size={24} style={{ marginBottom: 4 }} color={intervalType === type ? '#fff' : isDarkMode ? '#9CA3AF' : '#1E293B'} />
          <Text className={`text-sm text-center mt-0.5 font-medium ${
            intervalType === type ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-slate-800'
          }`}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
    <StepButtons
      onBack={onBack}
      onNext={onNext}
      isDarkMode={isDarkMode}
      buttonClassName={buttonClassName}
      backButtonClassName={backButtonClassName}
      backButtonTextClassName={backButtonTextClassName}
    />
  </View>
);

interface WeeklyScheduleStepProps {
  targetHours: string;
  schedule: Array<{ hours: string }>;
  onTargetHoursChange: (text: string) => void;
  onScheduleChange: (dayIndex: number, hours: string) => void;
  onNext: () => void;
  onBack: () => void;
  isDarkMode: boolean;
}

export const WeeklyScheduleStep: React.FC<WeeklyScheduleStepProps & { buttonClassName?: string; backButtonClassName?: string; backButtonTextClassName?: string }> = ({
  targetHours,
  schedule,
  onTargetHoursChange,
  onScheduleChange,
  onNext,
  onBack,
  isDarkMode,
  buttonClassName,
  backButtonClassName,
  backButtonTextClassName
}) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <View className="w-full items-center px-4">
      <ScrollView
        className="w-full"
        contentContainerStyle={{ paddingBottom: 12 }}
        showsVerticalScrollIndicator={true}
        style={{ maxHeight: 600 }}
      >
        <StepHeader
          title="Weekly Schedule"
          description=""
          isDarkMode={isDarkMode}
          progressBar={<RegistrationProgressBar step={5} totalSteps={10} isDarkMode={isDarkMode} />}
        />
        
        <Text className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-slate-800'} text-lg mb-1 w-full text-center -mt-9`}>
          Target Weekly Hours
        </Text>
        
        <Text className={`${isDarkMode ? 'text-gray-400' : 'text-slate-600'} text-base mb-1 w-full text-center`}>
          Set your target weekly hours and default daily hours for your training schedule.
        </Text>
        
        <View className="w-full mb-2 mt-2">
          <View className="w-full">
            <View className="flex-row justify-between items-center mb-2">
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-slate-600'} text-sm`}>0 hours</Text>
              <Text className={`font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} text-lg`}>
                {targetHours || '0'} hours
              </Text>
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-slate-600'} text-sm`}>30 hours</Text>
            </View>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0}
              maximumValue={30}
              step={1}
              value={Number(targetHours) || 0}
              onValueChange={(value) => onTargetHoursChange(value.toString())}
              minimumTrackTintColor={isDarkMode ? '#3B82F6' : '#2563EB'}
              maximumTrackTintColor={isDarkMode ? '#374151' : '#E5E7EB'}
              thumbTintColor={isDarkMode ? '#3B82F6' : '#2563EB'}
            />
          </View>
        </View>
        
        <Text className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-slate-800'} text-lg mb-2 w-full text-center`}>
          Default Daily Hours
        </Text>
        <Text className={`${isDarkMode ? 'text-gray-400' : 'text-slate-600'} text-base mb-4 w-full text-center`}>
          These are your default hours for each day. The algorithm will use these as a starting point for your schedule.
        </Text>
        <View className="w-full">
          {days.map((day, i) => (
            <View key={day} className="w-full mb-3">
              <View className="flex-row justify-between items-center mb-1">
                <Text className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-slate-800'} text-sm`}>
                  {day}
                </Text>
                <Text className={`font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} text-sm`}>
                  {schedule[i].hours || '0'} hours
                </Text>
              </View>
              <View className="w-full">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className={`${isDarkMode ? 'text-gray-400' : 'text-slate-600'} text-xs`}>0</Text>
                  <Text className={`${isDarkMode ? 'text-gray-400' : 'text-slate-600'} text-xs`}>8</Text>
                </View>
                <Slider
                  style={{ width: '100%', height: 30 }}
                  minimumValue={0}
                  maximumValue={8}
                  step={0.5}
                  value={Number(schedule[i].hours) || 0}
                  onValueChange={(value) => onScheduleChange(i, value.toString())}
                  minimumTrackTintColor={isDarkMode ? '#3B82F6' : '#2563EB'}
                  maximumTrackTintColor={isDarkMode ? '#374151' : '#E5E7EB'}
                  thumbTintColor={isDarkMode ? '#3B82F6' : '#2563EB'}
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <StepButtons
        onBack={onBack}
        onNext={onNext}
        isDarkMode={isDarkMode}
        buttonClassName={buttonClassName}
        backButtonClassName={backButtonClassName}
        backButtonTextClassName={backButtonTextClassName}
      />
    </View>
  );
};

interface FitnessStepProps {
  fitnessMode: 'level' | 'ctl';
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  ctl: string;
  onFitnessModeChange: (mode: 'level' | 'ctl') => void;
  onFitnessLevelChange: () => void;
  onCtlChange: (ctl: string) => void;
  onFinish: () => void;
  onBack: () => void;
  loading: boolean;
  isDarkMode: boolean;
}

export const FitnessStep: React.FC<FitnessStepProps & { buttonClassName?: string; backButtonClassName?: string; backButtonTextClassName?: string }> = ({
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
  backButtonTextClassName
}) => (
  <View className="w-full items-center px-4">
    <StepHeader
      title="Current Fitness"
      description="Choose your current fitness level or enter your CTL (Chronic Training Load)."
      isDarkMode={isDarkMode}
      progressBar={<RegistrationProgressBar step={10} totalSteps={10} isDarkMode={isDarkMode} />}
    />
    <View className="flex-row flex-wrap justify-center items-center my-5 gap-4">
      <TouchableOpacity
        className={`items-center justify-center p-3 rounded-xl ${SQUARE_BUTTON_SIZE} border shadow-md ${
          fitnessMode === 'level'
            ? isDarkMode
              ? 'bg-blue-600 border-blue-500'
              : 'bg-blue-500 border-blue-400'
            : isDarkMode
            ? 'bg-slate-800 border-gray-600'
            : 'bg-slate-200 border-gray-300'
        }`}
        style={{ elevation: 3 }}
        onPress={() => onFitnessModeChange('level')}
      >
        <MaterialIcons
          name="star"
          size={24}
          style={{ marginBottom: 4 }}
          color={fitnessMode === 'level' ? '#fff' : isDarkMode ? '#9CA3AF' : '#1E293B'}
        />
        <Text className={`text-sm text-center mt-0.5 font-medium ${
          fitnessMode === 'level' ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-slate-800'
        }`}>Level</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`items-center justify-center p-3 rounded-xl ${SQUARE_BUTTON_SIZE} border shadow-md ${
          fitnessMode === 'ctl'
            ? isDarkMode
              ? 'bg-blue-600 border-blue-500'
              : 'bg-blue-500 border-blue-400'
            : isDarkMode
            ? 'bg-slate-800 border-gray-600'
            : 'bg-slate-200 border-gray-300'
        }`}
        style={{ elevation: 3 }}
        onPress={() => onFitnessModeChange('ctl')}
      >
        <MaterialIcons
          name="fitness-center"
          size={24}
          style={{ marginBottom: 4 }}
          color={fitnessMode === 'ctl' ? '#fff' : isDarkMode ? '#9CA3AF' : '#1E293B'}
        />
        <Text className={`text-sm text-center mt-0.5 font-medium ${
          fitnessMode === 'ctl' ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-slate-800'
        }`}>CTL</Text>
      </TouchableOpacity>
    </View>
    {fitnessMode === 'level' ? (
      <TouchableOpacity
        className={`${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} border-2 ${isDarkMode ? 'border-blue-600' : 'border-blue-500'} rounded-xl px-4 py-4 mb-3 w-full items-center flex-row justify-center`}
        onPress={onFitnessLevelChange}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name={
            fitnessLevel === 'Beginner' ? 'directions-walk'
            : fitnessLevel === 'Intermediate' ? 'directions-run'
            : fitnessLevel === 'Advanced' ? 'directions-bike'
            : 'emoji-events'
          }
          size={22}
          color={isDarkMode ? '#3B82F6' : '#2563EB'}
          style={{ marginRight: 10 }}
        />
        <Text className={`text-base ${isDarkMode ? 'text-gray-200' : 'text-slate-800'} font-semibold text-center`}>
          {fitnessLevel}
        </Text>
        <MaterialIcons
          name="sync"
          size={20}
          color={isDarkMode ? '#3B82F6' : '#2563EB'}
          style={{ marginLeft: 10 }}
        />
      </TouchableOpacity>
    ) : (
      <TextInput
        placeholder="Current CTL (e.g. 50)"
        value={ctl}
        onChangeText={onCtlChange}
        className={getInputStyle(isDarkMode)}
        style={Platform.select({
          android: { minHeight: 48, textAlignVertical: 'center', includeFontPadding: false, paddingVertical: 12 },
          ios: { minHeight: 48, paddingTop: 12, paddingBottom: 12 }
        })}
        keyboardType="numeric"
        placeholderTextColor={getPlaceholderColor(isDarkMode)}
      />
    )}
    <StepButtons
      onBack={onBack}
      onNext={onFinish}
      nextLabel="Finish"
      loading={loading}
      isDarkMode={isDarkMode}
      buttonClassName={buttonClassName}
      backButtonClassName={backButtonClassName}
      backButtonTextClassName={backButtonTextClassName}
    />
  </View>
);
