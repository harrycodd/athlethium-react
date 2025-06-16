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
} from 'react-native';
import { signUp, confirmSignUp, signOut, getCurrentUser, autoSignIn, resendSignUpCode } from 'aws-amplify/auth';
import { useNavigation } from '@react-navigation/native';
import { useDarkMode } from '../../hooks/useDarkMode';
import { 
  EmailStep, 
  VerificationStep, 
  TargetSportsStep, 
  AllActivitiesStep, 
  WeeklyScheduleStep, 
  NameStep, 
  UnitsStep, 
  NotificationsStep, 
  IntervalTypeStep, 
  FitnessStep 
} from '../../components/registration/RegistrationSteps';
import { generateRandomPassword, getErrorMessage } from '../../utils/stringUtils';
import { detailsApi } from '../api_calls/detailsApi';
import { sessionApi } from '../api_calls/sessionApi';
import { trainingApi } from '../api_calls/trainingApi';
import { getCurrentDateString, formatDateString } from '../../utils/dateUtils';
import { getLevelToCTL } from '../../utils/trainingUtils';
import { getContainerStyle, getInputStyle, getButtonStyle, getPlaceholderColor } from '../../utils/styles';
import '../../global.css';

const RegisterFlow = ({ route }: any) => {
  const navigation = useNavigation<any>();
  const { isDarkMode } = useDarkMode();
  // Get email and step from route params (from login page or auto-login)
  const initialEmail = route?.params?.email || '';
  const initialStep = route?.params?.step || 2;
  const [step, setStep] = useState(initialStep); // Start at step from params
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
    swimming: true,
    cycling: true,
    running: true,
    yoga: true,
    strength: true,
  });
  const [schedule, setSchedule] = useState(Array(7).fill({ hours: '3' }));

  const handleNextStep = () => {
    if (step === 1) setStep(3);
    setStep((prev: number) => prev + 1);
  }

  const handlePreviousStep = () => {
    if (step === 3) return;
    setStep((prev: number) => prev - 1);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text.toLowerCase());
  };

  // Only send verification code if this is a new registration (step 1 or 2, but not if already sent)
  useEffect(() => {
    if (step === 1 && !verificationCode) {
      handleResendVerification();
    }
    // Only send if step is 2 and verificationCode is empty (first mount)
    if (step === 2 && !verificationCode) {
      handleSendVerification();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendVerification = async () => {
    setError(''); // Reset error message
    try {
      // First, sign up
      const { nextStep: signUpNextStep } = await signUp({
        options: {
          userAttributes: {
            email: email.toLowerCase(),
          },
          autoSignIn: {

            authFlowType: 'USER_AUTH',
          },
        },
        username: email.toLowerCase(),
      });
      console.log('Verification email sent to:', signUpNextStep);
    } catch (error) {
      if ((error as any).name === 'UsernameExistsException') {
        alert('Email already exists. Please try logging in or using a different email.');
      }
      else {
        console.log('Error sending verification code:', error);
        alert(`An error occurred while sending the verification code. Please try again. ${`\n\n`} ${error}`);
      }
    }
  };

  const handleResendVerification = async () => {
    setError(''); // Reset error message
    setLoading(true);
    try {
      // First, sign up
      await resendSignUpCode({
        options: {
          userAttributes: {
            email: email.toLowerCase(),
          },
          autoSignIn: {
            authFlowType: 'USER_AUTH',
          },
        },
        username: email.toLowerCase(),
      });
      console.log('Verification email resent to:', email);
    } catch (error) {
      console.log('Error resending verification code:', error);
      alert(`An error occurred while resending the verification code. Please try again. ${`\n\n`} ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify sign up code
  const handleVerifyCode = async () => {
    setError(''); // Reset error message
    try {
      let { nextStep: confirmSignUpNextStep } = await confirmSignUp({
        username: email.toLowerCase(),
        confirmationCode: verificationCode,
        options: {
          autoSignIn: {
            enabled: true,
            authFlowType: 'USER_AUTH',
          },
        },
      });
      console.log('Verification code confirmed:', confirmSignUpNextStep.signUpStep);
      if (confirmSignUpNextStep.signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
          // Call `autoSignIn` API to complete the flow
          const { nextStep } = await autoSignIn(
          );
          console.log('Auto sign-in next step:', nextStep);

          if (nextStep.signInStep === 'DONE') {
              console.log('Successfully signed in.');
              // Navigate to the next step in the registration flow
              handleNextStep();
          }
      } else if (confirmSignUpNextStep.signUpStep === 'DONE') {
        console.log('Sign up completed successfully.');
        Alert.alert(('There was an issue with the auto sign-in. Please log in again.'));
        navigation.navigate('Login');
      }

    } catch (error) {
      console.error('Error verifying code:', error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      alert('Verification failed: ' + ((error as any)?.message || JSON.stringify(error)));
    }
  };

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
        daysAhead: 3
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

  // Step 1: Initial verification code entry with resend option
  if (step === 1) {
    return (
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={-100}
      >
        <View className={getContainerStyle(isDarkMode) + ' justify-center items-center px-6'}>
          <View className="w-full max-w-sm items-center justify-center">
            <Text className={`text-4xl font-extrabold mb-4 text-center ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Athlethium</Text>
            <View className="w-full items-center mb-8">
              <Text className={`text-base mb-3 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Enter the code sent to your email</Text>
              <TextInput
                placeholder="Verification Code"
                value={verificationCode}
                onChangeText={setVerificationCode}
                className={getInputStyle(isDarkMode).replace('h-12', '').replace('mb-6', 'mb-6')}
                style={Platform.select({
                  android: { minHeight: 52, textAlignVertical: 'center', includeFontPadding: false, paddingVertical: 14 },
                  ios: { minHeight: 52, paddingTop: 14, paddingBottom: 14 }
                })}
                placeholderTextColor={getPlaceholderColor(isDarkMode)}
                keyboardType="number-pad"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="oneTimeCode"
                editable={!loading}
                maxLength={8}
              />
              {error ? (
                <Text className="text-red-500 mb-3 text-center text-sm">{error}</Text>
              ) : null}
              <TouchableOpacity
                className={getButtonStyle(isDarkMode, (!verificationCode || loading) ? 'secondary' : 'primary') + ' mb-3'}
                onPress={handleVerifyCode}
                disabled={!verificationCode || loading}
              >
                {loading ? (
                  <ActivityIndicator color={isDarkMode ? '#fff' : '#1E293B'} />
                ) : (
                  <Text className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Verify Code</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate && navigation.navigate('Login' as never)}
                className="mt-4"
              >
                <Text className={`font-semibold text-base ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Remove step 1 UI, always show step 2 as the first step
  // Step 2: Verification code entry (without resend option)
  if (step === 2) {
    return (
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={-100}
      >
        <View className={getContainerStyle(isDarkMode) + ' justify-center items-center px-6'}>
          <View className="w-full max-w-sm items-center justify-center">
            <Text className={`text-4xl font-extrabold mb-4 text-center ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Athlethium</Text>
            <View className="w-full items-center mb-8">
              <Text className={`text-base mb-3 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Enter the code sent to your email</Text>
              <TextInput
                placeholder="Verification Code"
                value={verificationCode}
                onChangeText={setVerificationCode}
                className={getInputStyle(isDarkMode).replace('h-12', '').replace('mb-6', 'mb-6')}
                style={Platform.select({
                  android: { minHeight: 52, textAlignVertical: 'center', includeFontPadding: false, paddingVertical: 14 },
                  ios: { minHeight: 52, paddingTop: 14, paddingBottom: 14 }
                })}
                placeholderTextColor={getPlaceholderColor(isDarkMode)}
                keyboardType="number-pad"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="oneTimeCode"
                editable={!loading}
                maxLength={8}
              />
              {error ? (
                <Text className="text-red-500 mb-3 text-center text-sm">{error}</Text>
              ) : null}
              <TouchableOpacity
                className={getButtonStyle(isDarkMode, (!verificationCode || loading) ? 'secondary' : 'primary') + ' mb-3'}
                onPress={handleVerifyCode}
                disabled={!verificationCode || loading}
              >
                {loading ? (
                  <ActivityIndicator color={isDarkMode ? '#fff' : '#1E293B'} />
                ) : (
                  <Text className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Verify Code</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate && navigation.navigate('Login' as never)}
                className="mt-4"
              >
                <Text className={`font-semibold text-base ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Consistent modern look for all registration steps
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={-100}
    >
      <View className={getContainerStyle(isDarkMode) + ' justify-center items-center px-6'}>
        <View className="w-full max-w-sm items-center justify-center">
          <Text className={`text-4xl font-extrabold mb-4 mt-14 text-center ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Athlethium</Text>
          <View className="w-full items-center mb-8">
            {/* Render the correct step component, all centered and styled like the verification code step */}
            {step === 3 && (
              <TargetSportsStep
                mainFocus={mainFocus}
                onMainFocusChange={(sport) => setMainFocus((prev) => ({
                  ...prev,
                  [sport]: !prev[sport as keyof typeof prev],
                }))}
                onNext={handleNextStep}
                onBack={async () => {
                  await signOut();
                  navigation.navigate('Login');
                }}
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
              <FitnessStep
                fitnessMode={fitnessMode}
                fitnessLevel={fitnessLevel}
                ctl={ctl}
                onFitnessModeChange={setFitnessMode}
                onFitnessLevelChange={() => {
                  const levels = ['Beginner', 'Intermediate', 'Advanced'];
                  const currentIdx = levels.indexOf(fitnessLevel);
                  const nextIdx = (currentIdx + 1) % levels.length;
                  setFitnessLevel(levels[nextIdx] as any);
                }}
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
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default RegisterFlow;

