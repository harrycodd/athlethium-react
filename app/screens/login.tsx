/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                  LOGIN SCREEN                                       ║
 * ║                                                                                      ║
 * ║ Email-based authentication screen with OTP verification.                           ║
 * ║ Handles user sign-in flow and navigation to registration if needed.                ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════╝
 */

// ============================================================================
// IMPORTS
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signIn, signUp, confirmSignUp, confirmSignIn, autoSignIn, getCurrentUser } from 'aws-amplify/auth';
import { useDarkMode } from '../hooks/commonHooks';
import { getPlaceholderColor } from '../utils/commonUtils';
import { getThemedStyles } from '../styling';
import { setUserAuthenticated } from '../utils/authHelpers';
import "../../global.css";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LoginScreen = () => {
  // -------------------------------------------------------------------------
  // HOOKS & NAVIGATION
  // -------------------------------------------------------------------------
  const navigation = useNavigation<any>();
  const { isDarkMode } = useDarkMode();
  const styles = getThemedStyles(isDarkMode);
  
  // -------------------------------------------------------------------------
  // STATE MANAGEMENT
  // -------------------------------------------------------------------------
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // Track if this is a signup flow

  // -------------------------------------------------------------------------
  // INITIALIZATION
  // -------------------------------------------------------------------------
  useEffect(() => {
    // No AWS Amplify configuration needed for mock auth
    console.log('Login screen initialized with mock authentication');
  }, []);

  // -------------------------------------------------------------------------
  // HELPER FUNCTIONS
  // -------------------------------------------------------------------------
  
  const checkUserDetails = async (userId: string) => {
    try {
      // Mock check - look for registration completion in AsyncStorage
      const isRegistrationComplete = await AsyncStorage.getItem('registrationComplete');
      
      if (isRegistrationComplete === 'true') {
        // User setup is complete, navigate to main app
        console.log('User registration complete, navigating to MainTabs');
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else {
        // User needs to complete registration
        console.log('User needs to complete registration, navigating to RegisterFlow');
        navigation.navigate('RegisterFlow', { email, step: 3 });
      }
    } catch (error) {
      console.error('Error checking user details:', error);
      // If we can't check details, assume registration is needed
      navigation.navigate('RegisterFlow', { email, step: 3 });
    }
  };

  const handleSuccessfulAuth = async (userId: string) => {
    try {
      // Set user as authenticated using the auth helper
      await setUserAuthenticated(userId, email, false); // false = registration not complete yet
      
      // Check if user has completed their profile setup
      await checkUserDetails(userId);
    } catch (error) {
      console.error('Error handling successful auth:', error);
      setError('Authentication successful but profile check failed. Please try again.');
    }
  };

  // -------------------------------------------------------------------------
  // EVENT HANDLERS
  // -------------------------------------------------------------------------
  
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
      console.log('Attempting to sign in with:', email);
      
      // First, try to sign in (this will work if user exists)
      const result = await signIn({
        username: email.toLowerCase(),
        options: {
          authFlowType: 'USER_AUTH',
          preferredChallenge: 'EMAIL_OTP',
        },
      });
      
      const signInStep = result?.nextStep?.signInStep;
      
      if (
        signInStep === 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE' ||
        signInStep === 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE'
      ) {
        // User exists, code sent for sign in
        setIsCodeSent(true);
        setIsSignUp(false);
        setError('');
        console.log('Sign in code sent successfully');
        return;
      } else if (signInStep === 'CONFIRM_SIGN_UP') {
        // User exists but needs to confirm sign up
        setIsCodeSent(true);
        setIsSignUp(true);
        setError('');
        console.log('User needs to confirm sign up');
        return;
      } else if (signInStep === 'DONE') {
        // User is already signed in
        const user = await getCurrentUser();
        await handleSuccessfulAuth(user);
        return;
      }
      
    } catch (signInError: any) {
      console.log('Sign in failed, attempting sign up:', signInError);
      
      // If sign in fails, try to sign up (user doesn't exist)
      if (signInError.name === 'UserNotFoundException' || 
          signInError.message?.includes('user does not exist') ||
          signInError.message?.includes('User does not exist')) {
        
        try {
          console.log('User not found, creating new account');
          
          const signUpResult = await signUp({
            username: email.toLowerCase(),
            options: {
              userAttributes: {
                email: email.toLowerCase(),
              },
              autoSignIn: {
                enabled: true,
              },
            },
          });
          
          if (signUpResult.nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
            setIsCodeSent(true);
            setIsSignUp(true);
            setError('');
            console.log('New account created, confirmation code sent');
            return;
          }
          
        } catch (signUpError: any) {
          console.error('Sign up error:', signUpError);
          setError(signUpError.message || 'Failed to create account. Please try again.');
        }
      } else {
        console.error('Unexpected sign in error:', signInError);
        setError(signInError.message || 'An error occurred. Please try again.');
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
      if (isSignUp) {
        // Handle sign up confirmation
        console.log('Confirming sign up with code');
        
        const confirmResult = await confirmSignUp({
          username: email.toLowerCase(),
          confirmationCode: code,
        });
        
        if (confirmResult.isSignUpComplete) {
          // Sign up confirmed, now auto sign in
          console.log('Sign up confirmed, attempting auto sign in');
          
          try {
            const signInResult = await autoSignIn();
            if (signInResult.isSignedIn) {
              const user = await getCurrentUser();
              await handleSuccessfulAuth(user);
              return;
            }
          } catch (autoSignInError) {
            console.log('Auto sign in failed, trying manual sign in');
            // If auto sign in fails, try regular passwordless sign in
            const signInResult = await signIn({
              username: email.toLowerCase(),
              options: {
                authFlowType: 'USER_AUTH',
                preferredChallenge: 'EMAIL_OTP',
              },
            });
            
            if (signInResult.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE') {
              setError('Please check your email for a new verification code');
              setCode('');
              return;
            }
          }
        }
      } else {
        // Handle sign in confirmation
        console.log('Confirming sign in with code');
        
        const { nextStep } = await confirmSignIn({
          challengeResponse: code,
        });
        
        if (nextStep.signInStep === 'DONE') {
          const user = await getCurrentUser();
          await handleSuccessfulAuth(user);
          return;
        }
      }
      
    } catch (err: any) {
      console.error('Error verifying code:', err);
      if (err.name === 'CodeMismatchException' || err.message?.includes('Invalid verification code')) {
        setError('The verification code you entered is incorrect. Please try again.');
      } else if (err.name === 'ExpiredCodeException' || err.message?.includes('expired')) {
        setError('The verification code has expired. Please request a new one.');
        setIsCodeSent(false);
        setCode('');
      } else {
        setError(err.message || 'Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // RENDER COMPONENT
  // -------------------------------------------------------------------------

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={-100}
    >
      <View className={styles.layout.screenContainer}>
        <View className={styles.layout.contentWrapper}>
          
          {/* ===== APP TITLE ===== */}
          <View className="mb-6 mt-16">
            <Text className={`text-5xl font-black text-center tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Athlethium
            </Text>
          </View>

          <View className={styles.layout.formContainer}>
            {!isCodeSent ? (
              <>
                {/* ===== EMAIL INPUT SECTION ===== */}
                <Text className={styles.text.bodyCenter}>
                  Enter your email address
                </Text>
                <TextInput
                  placeholder="Email Address"
                  value={email}
                  onChangeText={handleEmailChange}
                  className={styles.input.textInput}
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
                
                {/* ===== ERROR MESSAGE ===== */}
                {error ? (
                  <Text className={`mb-3 text-center text-sm ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>{error}</Text>
                ) : null}
                
                {/* ===== CONTINUE BUTTON ===== */}
                <TouchableOpacity
                  className={styles.button.primary(!email || loading)}
                  onPress={handleSendCode}
                  disabled={!email || loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="font-bold text-lg text-white">Continue</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* ===== CODE VERIFICATION SECTION ===== */}
                <Text className={styles.text.bodyCenter}>
                  {isSignUp 
                    ? 'Enter the verification code sent to your email to complete account setup'
                    : 'Enter the verification code sent to your email'
                  }
                </Text>
                <TextInput
                  placeholder="Verification Code"
                  value={code}
                  onChangeText={setCode}
                  className={styles.input.textInputCenter}
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
                
                {/* ===== ERROR MESSAGE ===== */}
                {error ? (
                  <Text className={`mb-3 text-center text-sm ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>{error}</Text>
                ) : null}
                
                {/* ===== VERIFY BUTTON ===== */}
                <TouchableOpacity
                  className={styles.button.primaryVerify(!code || loading)}
                  onPress={handleVerifyCode}
                  disabled={!code || loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="font-bold text-lg text-white">
                      {isSignUp ? 'Complete Setup' : 'Verify Code'}
                    </Text>
                  )}
                </TouchableOpacity>
                
                {/* ===== BACK BUTTON ===== */}
                <TouchableOpacity
                  className="mt-1"
                  onPress={() => {
                    setIsCodeSent(false);
                    setCode('');
                    setError('');
                    setIsSignUp(false);
                  }}
                >
                  <Text className={styles.text.backButton}>
                    Back
                  </Text>
                </TouchableOpacity>
              </>
            )}
            
            {/* ===== PRIVACY POLICY & TERMS ===== */}
            {!isCodeSent && (
              <Text className={styles.text.caption}>
                By continuing, you acknowledge that an account will be created if you're new, and you accept Athlethium's{' '}
                <Text 
                  className={styles.text.link} 
                  onPress={() => {
                    const Linking = require('react-native').Linking;
                    Linking.openURL('https://athlethium.com/privacy/');
                  }}
                >
                  Privacy Policy
                </Text>
                {' '}and{' '}
                <Text 
                  className={styles.text.link} 
                  onPress={() => {
                    const Linking = require('react-native').Linking;
                    Linking.openURL('https://athlethium.com/terms/');
                  }}
                >
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

// ============================================================================
// EXPORT
// ============================================================================

export default LoginScreen;
