import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useSubscription } from '../context/SubscriptionContext';
import { PurchasesPackage } from 'react-native-purchases';
import '../../global.css';

const { width } = Dimensions.get('window');

interface PaywallScreenProps {
  onSubscriptionSuccess: () => void;
}

const PaywallScreen: React.FC<PaywallScreenProps> = ({ onSubscriptionSuccess }) => {
  const { isDarkMode } = useDarkMode();
  const { 
    offerings, 
    isLoading, 
    purchasePackage, 
    restorePurchases,
    refreshSubscriptionStatus 
  } = useSubscription();
  
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);

  // Auto-select monthly package by default
  useEffect(() => {
    if (offerings && offerings.length > 0 && offerings[0].availablePackages) {
      // Try to find monthly package first
      const monthlyPackage = offerings[0].availablePackages.find(pkg => 
        pkg.identifier.toLowerCase().includes('monthly') || 
        pkg.packageType === 'MONTHLY'
      );
      
      if (monthlyPackage) {
        setSelectedPackage(monthlyPackage);
      } else if (offerings[0].availablePackages.length > 0) {
        // Fallback to first available package
        setSelectedPackage(offerings[0].availablePackages[0]);
      }
    }
  }, [offerings]);

  const handlePurchase = async () => {
    if (!selectedPackage) {
      Alert.alert('Error', 'Please select a subscription plan');
      return;
    }

    setPurchaseLoading(true);
    try {
      const success = await purchasePackage(selectedPackage);
      if (success) {
        Alert.alert(
          'Welcome to Premium!',
          'Your subscription is now active. Enjoy unlimited access to all features!',
          [{ text: 'Continue', onPress: onSubscriptionSuccess }]
        );
      } else {
        Alert.alert('Purchase Failed', 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Purchase Failed', 'Something went wrong. Please try again.');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoreLoading(true);
    try {
      const success = await restorePurchases();
      if (success) {
        Alert.alert(
          'Purchases Restored!',
          'Your subscription has been restored successfully.',
          [{ text: 'Continue', onPress: onSubscriptionSuccess }]
        );
      } else {
        Alert.alert('No Purchases Found', 'No active subscriptions found to restore.');
      }
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('Restore Failed', 'Could not restore purchases. Please try again.');
    } finally {
      setRestoreLoading(false);
    }
  };

  const getPackages = () => {
    if (!offerings || offerings.length === 0) return [];
    return offerings[0].availablePackages || [];
  };

  const formatPrice = (packageItem: PurchasesPackage) => {
    return packageItem.product.priceString || `$${packageItem.product.price}`;
  };

  const getPackageTitle = (packageItem: PurchasesPackage) => {
    if (packageItem.identifier.toLowerCase().includes('monthly') || packageItem.packageType === 'MONTHLY') {
      return 'Monthly';
    }
    if (packageItem.identifier.toLowerCase().includes('annual') || packageItem.identifier.toLowerCase().includes('yearly') || packageItem.packageType === 'ANNUAL') {
      return 'Yearly';
    }
    return packageItem.product.title || 'Premium';
  };

  const getPackageDescription = (packageItem: PurchasesPackage) => {
    if (packageItem.identifier.toLowerCase().includes('monthly') || packageItem.packageType === 'MONTHLY') {
      return 'Billed monthly';
    }
    if (packageItem.identifier.toLowerCase().includes('annual') || packageItem.identifier.toLowerCase().includes('yearly') || packageItem.packageType === 'ANNUAL') {
      return 'Billed annually • Save 17%';
    }
    return packageItem.product.description || 'Premium access';
  };

  const features = [
    {
      icon: 'fitness-outline',
      title: 'AI-Powered Training Plans',
      description: 'Personalized workouts based on your goals and performance'
    },
    {
      icon: 'analytics-outline',
      title: 'Advanced Analytics',
      description: 'Deep insights into your training load, form, and progress'
    },
    {
      icon: 'chatbubbles-outline',
      title: 'AI Coach Chat',
      description: 'Get instant answers and guidance from your personal AI coach'
    },
    {
      icon: 'sync-outline',
      title: 'Device Integrations',
      description: 'Sync with Strava, Garmin, Wahoo and other fitness platforms'
    },
    {
      icon: 'calendar-outline',
      title: 'Smart Scheduling',
      description: 'Adaptive training calendar that adjusts to your life'
    },
    {
      icon: 'trending-up-outline',
      title: 'Performance Tracking',
      description: 'Track CTL, ATL, form, and all your key metrics'
    }
  ];

  if (isLoading && !offerings) {
    return (
      <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={isDarkMode ? '#3B82F6' : '#2563EB'} />
          <Text className={`mt-4 text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Loading subscription options...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-8 pb-6">
          {/* Header */}
          <View className="items-center mb-8">
            <View className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${
              isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
            }`}>
              <Ionicons 
                name="star" 
                size={40} 
                color={isDarkMode ? '#3B82F6' : '#2563EB'} 
              />
            </View>
            <Text className={`text-3xl font-bold text-center mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Unlock Your Full Potential
            </Text>
            <Text className={`text-lg text-center ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Get unlimited access to all premium features
            </Text>
          </View>

          {/* Features */}
          <View className="mb-8">
            {features.map((feature, index) => (
              <View key={index} className="flex-row items-start mb-6">
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
                  isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                }`}>
                  <Ionicons 
                    name={feature.icon as any} 
                    size={20} 
                    color={isDarkMode ? '#3B82F6' : '#2563EB'} 
                  />
                </View>
                <View className="flex-1">
                  <Text className={`text-lg font-semibold mb-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {feature.title}
                  </Text>
                  <Text className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {feature.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Subscription Options */}
          <View className="mb-8">
            <Text className={`text-xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Choose Your Plan
            </Text>
            
            {getPackages().map((packageItem, index) => {
              const isSelected = selectedPackage?.identifier === packageItem.identifier;
              const isYearly = packageItem.identifier.toLowerCase().includes('annual') || 
                              packageItem.identifier.toLowerCase().includes('yearly') || 
                              packageItem.packageType === 'ANNUAL';
              
              return (
                <TouchableOpacity
                  key={packageItem.identifier}
                  className={`p-4 rounded-xl border-2 mb-3 ${
                    isSelected
                      ? isDarkMode
                        ? 'bg-blue-500/10 border-blue-500'
                        : 'bg-blue-50 border-blue-500'
                      : isDarkMode
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-200'
                  }`}
                  onPress={() => setSelectedPackage(packageItem)}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className={`text-lg font-bold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {getPackageTitle(packageItem)}
                        </Text>
                        {isYearly && (
                          <View className={`ml-2 px-2 py-1 rounded ${
                            isDarkMode ? 'bg-green-500/20' : 'bg-green-100'
                          }`}>
                            <Text className={`text-xs font-semibold ${
                              isDarkMode ? 'text-green-400' : 'text-green-600'
                            }`}>
                              SAVE 17%
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className={`text-sm mt-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {getPackageDescription(packageItem)}
                      </Text>
                    </View>
                    <Text className={`text-xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formatPrice(packageItem)}
                    </Text>
                  </View>
                  
                  {isSelected && (
                    <View className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-700">
                      <View className="flex-row items-center">
                        <Ionicons 
                          name="checkmark-circle" 
                          size={16} 
                          color={isDarkMode ? '#3B82F6' : '#2563EB'} 
                        />
                        <Text className={`ml-2 text-sm ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`}>
                          Selected Plan
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Purchase Button */}
          <TouchableOpacity
            className={`py-4 rounded-xl items-center mb-4 ${
              selectedPackage && !purchaseLoading
                ? 'bg-blue-600'
                : isDarkMode
                ? 'bg-gray-700'
                : 'bg-gray-300'
            }`}
            onPress={handlePurchase}
            disabled={!selectedPackage || purchaseLoading}
          >
            {purchaseLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-semibold">
                {selectedPackage ? `Subscribe for ${formatPrice(selectedPackage)}` : 'Select a Plan'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Restore Purchases */}
          <TouchableOpacity
            className="py-3 items-center mb-4"
            onPress={handleRestore}
            disabled={restoreLoading}
          >
            {restoreLoading ? (
              <ActivityIndicator color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            ) : (
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Restore Purchases
              </Text>
            )}
          </TouchableOpacity>

          {/* Terms */}
          <View className="items-center">
            <Text className={`text-xs text-center ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              Subscription automatically renews unless auto-renew is turned off at least 24-hours before the end of the current period.
            </Text>
            <View className="flex-row mt-2">
              <TouchableOpacity className="mr-4">
                <Text className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Terms of Service
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Privacy Policy
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaywallScreen;
