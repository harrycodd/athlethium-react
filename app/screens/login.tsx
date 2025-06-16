import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { confirmSignIn, autoSignIn, signIn, getCurrentUser, fetchAuthSession, resendSignUpCode } from "aws-amplify/auth";
import { useDarkMode } from '../../hooks/useDarkMode';
import { getContainerStyle, getInputStyle, getButtonStyle, getPlaceholderColor } from '../../utils/styles';
import { detailsApi } from '../api_calls/detailsApi';
import "../../global.css";

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const { isDarkMode } = useDarkMode();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailChange = (text: string) => {
    setEmail(text.toLowerCase());
  };

  const handleSendCode = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Try to sign in
      let result = await signIn({
        username: email.toLowerCase(),
        options: {
          authFlowType: 'USER_AUTH',
          preferredChallenge: 'EMAIL_OTP',
        },
      });
      console.log('signIn result (full):', JSON.stringify(result, null, 2));
      const signInStep = result?.nextStep?.signInStep;
      if (
        signInStep === 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE' ||
        signInStep === 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE'
      ) {
        setIsCodeSent(true);
        setError('');
        return;
      }
      else if (signInStep === 'CONFIRM_SIGN_UP') {
        // If the user is not confirmed, start the registration flow
        navigation.navigate('RegisterFlow', { email, step: 1 });
      }
      // Fallback: if result.nextStep exists at all, try showing code input (for future-proofing)
      if (result?.nextStep) {
        setIsCodeSent(true);
        setError('');
        console.warn('Fallback: nextStep present but signInStep not recognized:', signInStep);
        return;
      }
      setError(
        'Unexpected sign-in response. Please contact support. ' +
          (signInStep ? `signInStep: ${signInStep}` : '')
      );
      console.log('Unexpected sign-in response:', result);
    } catch (err) {
      const error: any = err;
      console.log('signIn error (full):', error);
      // If user not found, start register flow
      if (error && error.name === 'UserNotFoundException') {
        setIsCodeSent(false);
        setError('');
        navigation.navigate('RegisterFlow', { email, step: 2 });
        return;
      }
      // If user is not confirmed, also start register flow
      if (error && error.name === 'UserNotConfirmedException') {
        setIsCodeSent(false);
        setError('');
        navigation.navigate('RegisterFlow', { email, step: 2 });
        return;
      }
      // If user exists but another error, show error
      if (error && error.message) {
        setError(error.message);
      } else {
        setError('Error sending verification code.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      setError('Please enter the verification code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log(`Verifying code for user: ${email}`);
      
      let { nextStep: confirmSignInNextStep } = await confirmSignIn({
        challengeResponse: code,
      });
      
      console.log('Verification step response:', confirmSignInNextStep);
      
      if (confirmSignInNextStep.signInStep === 'DONE') {
        try {
          // Get current user
          const user = await getCurrentUser();
          if (user) {
            console.log('User ID retrieved:', user.userId);
            // Store userId in AsyncStorage
            await AsyncStorage.setItem('userId', user.userId);
            // Fetch user details to check signUpCompleted
            let userDetails: any = null;
            try {
              userDetails = await detailsApi.getUserDetails();
            } catch (err) {
              console.error('Error fetching user details after login:', err);
            }
            if (userDetails && userDetails.signUpCompleted === false) {
              navigation.navigate('RegisterFlow', { email, step: 3 });
              return;
            }
            // Success! The _layout.tsx will handle the subscription check and navigation
            // No need to navigate manually - the auth state change will trigger a re-render
          } else {
            throw new Error('Could not get current user after sign in');
          }
        } catch (error) {
          console.error('Error setting up user session after login:', error);
          setError('Error setting up your session. Please try again.');
        }
      } else {
        console.error('Sign in not completed, got step:', confirmSignInNextStep.signInStep);
        setError('Verification not completed. Please try again.');
      }
    } catch (err: any) {
      console.error('Error verifying code:', err);
      
      if (err.name === 'CodeMismatchException') {
        setError('The verification code you entered is incorrect. Please try again.');
      } else {
        setError(`Error verifying code: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={-100}
    >
      <View className={getContainerStyle(isDarkMode) + " justify-center items-center px-6"}>
        <View className="w-full max-w-sm items-center justify-center">
          <Text className={`text-4xl font-extrabold mb-4 text-center ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Athlethium</Text>

          <View className="w-full items-center mb-8">
            {!isCodeSent ? (
              <>
                <Text className={`text-base mb-3 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Enter your email address to get started</Text>
                <TextInput
                  placeholder="Email Address"
                  value={email}
                  onChangeText={handleEmailChange}
                  className={getInputStyle(isDarkMode).replace('h-12', '').replace('mb-6', 'mb-6')}
                  style={Platform.select({
                    android: { minHeight: 52, textAlignVertical: 'center', includeFontPadding: false, paddingVertical: 14 },
                    ios: { minHeight: 52, paddingTop: 14, paddingBottom: 14 }
                  })}
                  placeholderTextColor={getPlaceholderColor(isDarkMode)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                  editable={!isCodeSent && !loading}
                />
                {error ? (
                  <Text className="text-red-500 mb-3 text-center text-sm">{error}</Text>
                ) : null}
                <TouchableOpacity
                  className={getButtonStyle(isDarkMode, (!email || loading) ? 'secondary' : 'primary') + ' mb-4'}
                  onPress={handleSendCode}
                  disabled={!email || loading}
                >
                  {loading ? (
                    <ActivityIndicator color={isDarkMode ? '#fff' : '#1E293B'} />
                  ) : (
                    <Text className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-white'}`}>Continue with Email</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text className={`text-base mb-3 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Enter the code sent to your email
                </Text>
                <TextInput
                  placeholder="Verification Code"
                  value={code}
                  onChangeText={setCode}
                  className={getInputStyle(isDarkMode).replace('h-12', '').replace('mb-6', 'mb-6')}
                  style={Platform.select({
                    android: { minHeight: 52, textAlignVertical: 'center', includeFontPadding: false, paddingVertical: 14, textAlign: 'center' },
                    ios: { minHeight: 52, paddingTop: 14, paddingBottom: 14, textAlign: 'center' }
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
                  className={getButtonStyle(isDarkMode, (!code || loading) ? 'secondary' : 'primary') + ' mb-3'}
                  onPress={handleVerifyCode}
                  disabled={!code || loading}
                >
                  {loading ? (
                    <ActivityIndicator color={isDarkMode ? '#fff' : '#1E293B'} />
                  ) : (
                    <Text className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-white'}`}>Verify Code</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  className="mt-1"
                  onPress={() => {
                    setIsCodeSent(false);
                    setCode('');
                    setError('');
                  }}
                >
                  <Text className={`font-semibold text-base ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Back</Text>
                </TouchableOpacity>
              </>
            )}
            {!isCodeSent && (
              <Text className={`text-xs text-center mt-4 mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                By continuing, you acknowledge Athlethium's{' '}
                <Text className={`underline ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} onPress={() => {
                  const Linking = require('react-native').Linking;
                  Linking.openURL('https://athlethium.com/privacy/');
                }}>
                  Privacy Policy
                </Text>
                {' '}and{' '}
                <Text className={`underline ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} onPress={() => {
                  const Linking = require('react-native').Linking;
                  Linking.openURL('https://athlethium.com/terms/');
                }}>
                  Terms and Conditions
                </Text>.
              </Text>
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
