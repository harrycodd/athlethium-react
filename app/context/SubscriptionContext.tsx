import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Purchases, { CustomerInfo, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SubscriptionContextType {
  isSubscribed: boolean | null;
  isPremium: boolean;
  offerings: PurchasesOffering[] | null;
  customerInfo: CustomerInfo | null;
  isLoading: boolean;
  checkSubscriptionStatus: () => Promise<void>;
  purchasePackage: (packageToPurchase: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refreshSubscriptionStatus: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [offerings, setOfferings] = useState<PurchasesOffering[] | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkSubscriptionStatus = async () => {
    try {
      setIsLoading(true);
      
      // Get customer info from RevenueCat
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
      
      // Check if user has active subscription
      const hasActiveSubscription = info.activeSubscriptions.length > 0 || 
                                   Object.keys(info.entitlements.active).length > 0;
      
      setIsSubscribed(hasActiveSubscription);
      setIsPremium(hasActiveSubscription);
      
      // Cache subscription status locally
      await AsyncStorage.setItem('subscriptionStatus', JSON.stringify({
        isSubscribed: hasActiveSubscription,
        isPremium: hasActiveSubscription,
        lastChecked: Date.now()
      }));
      
      console.log('Subscription status:', {
        isSubscribed: hasActiveSubscription,
        activeSubscriptions: info.activeSubscriptions,
        entitlements: Object.keys(info.entitlements.active)
      });
      
    } catch (error) {
      console.error('Error checking subscription status:', error);
      
      // Try to get cached status if RevenueCat fails
      try {
        const cached = await AsyncStorage.getItem('subscriptionStatus');
        if (cached) {
          const cachedData = JSON.parse(cached);
          const isRecent = Date.now() - cachedData.lastChecked < 24 * 60 * 60 * 1000; // 24 hours
          
          if (isRecent) {
            setIsSubscribed(cachedData.isSubscribed);
            setIsPremium(cachedData.isPremium);
          } else {
            // Default to not subscribed if cached data is old
            setIsSubscribed(false);
            setIsPremium(false);
          }
        } else {
          setIsSubscribed(false);
          setIsPremium(false);
        }
      } catch (cacheError) {
        console.error('Error reading cached subscription status:', cacheError);
        setIsSubscribed(false);
        setIsPremium(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        setOfferings([offerings.current]);
      } else if (offerings.all && Object.keys(offerings.all).length > 0) {
        setOfferings(Object.values(offerings.all));
      }
      console.log('Loaded offerings:', offerings);
    } catch (error) {
      console.error('Error loading offerings:', error);
      setOfferings([]);
    }
  };

  const purchasePackage = async (packageToPurchase: PurchasesPackage): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      setCustomerInfo(customerInfo);
      
      const hasActiveSubscription = customerInfo.activeSubscriptions.length > 0 || 
                                   Object.keys(customerInfo.entitlements.active).length > 0;
      
      setIsSubscribed(hasActiveSubscription);
      setIsPremium(hasActiveSubscription);
      
      // Update cached status
      await AsyncStorage.setItem('subscriptionStatus', JSON.stringify({
        isSubscribed: hasActiveSubscription,
        isPremium: hasActiveSubscription,
        lastChecked: Date.now()
      }));
      
      console.log('Purchase successful:', {
        isSubscribed: hasActiveSubscription,
        activeSubscriptions: customerInfo.activeSubscriptions
      });
      
      return hasActiveSubscription;
    } catch (error) {
      console.error('Error purchasing package:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const customerInfo = await Purchases.restorePurchases();
      setCustomerInfo(customerInfo);
      
      const hasActiveSubscription = customerInfo.activeSubscriptions.length > 0 || 
                                   Object.keys(customerInfo.entitlements.active).length > 0;
      
      setIsSubscribed(hasActiveSubscription);
      setIsPremium(hasActiveSubscription);
      
      // Update cached status
      await AsyncStorage.setItem('subscriptionStatus', JSON.stringify({
        isSubscribed: hasActiveSubscription,
        isPremium: hasActiveSubscription,
        lastChecked: Date.now()
      }));
      
      console.log('Restore successful:', {
        isSubscribed: hasActiveSubscription,
        activeSubscriptions: customerInfo.activeSubscriptions
      });
      
      return hasActiveSubscription;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSubscriptionStatus = async () => {
    await checkSubscriptionStatus();
  };

  useEffect(() => {
    const initializeSubscriptions = async () => {
      await checkSubscriptionStatus();
      await loadOfferings();
    };
    
    initializeSubscriptions();
  }, []);

  const contextValue: SubscriptionContextType = {
    isSubscribed,
    isPremium,
    offerings,
    customerInfo,
    isLoading,
    checkSubscriptionStatus,
    purchasePackage,
    restorePurchases,
    refreshSubscriptionStatus
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
