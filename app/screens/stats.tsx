// ===============================================
// STATS SCREEN - TRAINING METRICS & ANALYTICS
// ===============================================
// This screen displays training metrics charts,
// performance analytics, and historical data visualization.
// Preserves all original UI/UX while adding clear code organization.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  PanResponder,
  StyleSheet,
} from 'react-native';
// @ts-ignore - react-native-svg-charts doesn't have type definitions
import { LineChart, YAxis, XAxis, Grid, BarChart } from 'react-native-svg-charts';
// @ts-ignore
import * as shape from 'd3-shape';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useDarkMode } from '../hooks/commonHooks';
import { getThemedStyles } from '../styling';
import '../../global.css';

// ===============================================
// TYPE DEFINITIONS
// ===============================================

// TypeScript interfaces
interface TrainingMetrics {
  ctl: number;     // Fitness (Chronic Training Load)
  eftp: number;    // eFTP (estimated Functional Threshold Power)
  form: number;    // Training Stress Balance (freshness)
  physicalFeeling?: number; // Physical feeling on a scale of 1-5
  mentalFeeling?: number;   // Mental feeling on a scale of 1-5
  sleep?: number;           // Sleep quality on a scale of 1-5
  weight?: number;          // Weight in kg
  illness?: number;         // Illness as numeric value (0=None, 1=Mild, 2=Severe)
  injury?: number;          // Injury as numeric value (0=None, 1=Minor, 2=Major, 3=Not Affecting)
}

interface MetricsDataPoint {
  date: string;
  metrics: TrainingMetrics;
}

interface ChartData {
  ctl: number[];
  eftp: number[];
  form: number[];
  physicalFeeling: number[];
  mentalFeeling: number[];
  sleep: number[];
  weight: number[];
  illness: number[];
  injury: number[];
  dates: string[];
  [key: string]: number[] | string[]; // Index signature for dynamic access
}

const screenWidth = Dimensions.get('window').width;
const CHART_WIDTH = screenWidth - 64; // Account for px-6 (24px) on each side = 48px total horizontal padding  
const CHART_HEIGHT = 200; // Slightly reduced height
const CHART_LEFT_YAXIS_WIDTH = 35; // Increased width for better text visibility
const CHART_RIGHT_YAXIS_WIDTH = 35; // Increased width for better text visibility
const CHART_GRAPH_WIDTH = CHART_WIDTH - CHART_LEFT_YAXIS_WIDTH - CHART_RIGHT_YAXIS_WIDTH;

// Colors for different metrics - organized by scale groups for better distinction
const colors = {
  // Left Scale Group 1: Weight (Blue scale - distinct from others)
  weight: '#3B82F6',         // Blue - Weight (clearly distinct)
  
  // Left Scale Group 2: Training Load (Green scale)  
  ctl: '#10B981',            // Emerald Green - Fitness (Chronic Training Load)
  form: '#059669',           // Darker Green - Form (freshness) - same scale as CTL
  
  // Right Scale Group 1: eFTP (Orange scale - warm but distinct)
  eftp: '#F97316',           // Orange - eFTP (estimated Functional Threshold Power)
  
  // Right Scale Group 2: Feelings/Status (Purple/Pink scale - clearly different)
  physicalFeeling: '#8B5CF6', // Purple - Physical feeling
  mentalFeeling: '#A855F7',   // Light Purple - Mental feeling  
  sleep: '#6366F1',          // Indigo - Sleep quality
  injury: '#EC4899',         // Pink - Injury (for health status)
  illness: '#F43F5E',        // Rose - Illness (for health status)
};

const MODERN_BG = '#101014';
const MODERN_CARD = '#181A20';
const MODERN_SHADOW = '#0008';
const MODERN_BORDER = '#23242b';
const MODERN_TEXT = '#F3F4F6';
const MODERN_MUTED = '#6B7280';
const MODERN_ACCENT = '#2563EB';

const StatsScreen = () => {
  const { isDarkMode } = useDarkMode();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // State for metrics data
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [rawMetricsData, setRawMetricsData] = useState<MetricsDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeDateRange, setActiveDateRange] = useState<'7d' | '14d' | '28d'>('7d');
  const [fetchProgress, setFetchProgress] = useState(0);

  // State for visible metrics toggles
  const [visibleMetrics, setVisibleMetrics] = useState({
    ctl: true,
    eftp: true,
    form: true,
    physicalFeeling: true,
    mentalFeeling: true,
    sleep: true,
    weight: true,
    illness: true,
    injury: true,
  });

  // Convert text feeling to numeric value (1-5 scale)
  const convertFeelingToNumeric = (feeling: string | undefined): number => {
    switch(feeling?.toLowerCase()) {
      case 'excellent': return 5;
      case 'good': return 4;
      case 'average': return 3;
      case 'poor': return 2;
      case 'very poor': return 1;
      default: return 3; // Default to average
    }
  };

  // Map illness to numeric values
  const illnessToNumeric = (illness: string): number => {
    switch ((illness || '').toLowerCase()) {
      case 'none': return 0;
      case 'mild': return 1;
      case 'severe': return 2;
      default: return 0;
    }
  };

  // Map injury to numeric values
  const injuryToNumeric = (injury: string): number => {
    switch ((injury || '').toLowerCase()) {
      case 'none': return 0;
      case 'minor (affects training)': return 1;
      case 'major (needs rest)': return 2;
      case 'not affecting training': return 3;
      default: return 0;
    }
  };

  // Fetch userId on mount
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        console.log('[stats] Got userId from AsyncStorage:', storedUserId);
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          setError('User not authenticated');
        }
      } catch (err) {
        setError('Error retrieving user information');
      }
    };
    fetchUserId();
  }, []);

  // Fetch metrics when userId is available or date range changes
  useEffect(() => {
    if (!userId) return;
    fetchMetrics();
  }, [userId, activeDateRange]);

  // Generate an array of dates for the given range
  const generateDateSequence = (startDate: Date, endDate: Date): string[] => {
    const dates: string[] = [];
    const currentDate = new Date(startDate);
    
    const formatDate = (date: Date) => {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    
    while (currentDate <= endDate) {
      dates.push(formatDate(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    setFetchProgress(0);
    
    try {
      // Calculate date range based on selection
      const endDate = new Date();
      let startDate = new Date();
      
      switch (activeDateRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '14d':
          startDate.setDate(endDate.getDate() - 14);
          break;
        case '28d':
          startDate.setDate(endDate.getDate() - 28);
          break;
      }
      
      // Generate all dates we need to process
      const dateSequence = generateDateSequence(startDate, endDate);
      console.log(`[stats] Generating mock metrics for userId=${userId}, days=${dateSequence.length}`);
      
      // Use mock data instead of API calls
      const allMetricsData: any[] = [];
      
      // Generate mock data for the date range
      for (const date of dateSequence) {
        const mockData = {
          date: date,
          ctl: Math.random() * 50 + 100, // Random CTL between 100-150
          eftp: Math.random() * 50 + 250, // Random eFTP between 250-300
          physicalFeeling: Math.floor(Math.random() * 5) + 1, // 1-5
          mentalFeeling: Math.floor(Math.random() * 5) + 1, // 1-5
          sleep: Math.floor(Math.random() * 5) + 1, // 1-5
          weight: Math.random() * 10 + 70, // Weight between 70-80
        };
        allMetricsData.push(mockData);
      }
      
      console.log(`[stats] Generated ${allMetricsData.length} days of mock metrics data`);
      
      if (allMetricsData.length > 0) {
        processMetricsData(allMetricsData);
      } else {
        console.log('[stats] No data generated, using default mock data');
        useMockData();
      }
      
      setError(null);
    } catch (err) {
      console.error('[stats] Error fetching metrics:', err);
      setError('Could not load metrics. Using sample data.');
      useMockData();
    } finally {
      setLoading(false);
      setRefreshing(false);
      setFetchProgress(0);
    }
  };

  // Process metrics data from API to chartData format
  const processMetricsData = (data: any[]) => {
    try {
      const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      const processed: ChartData = {
        ctl: [],
        eftp: [],
        form: [],
        physicalFeeling: [],
        mentalFeeling: [],
        sleep: [],
        weight: [],
        illness: [],
        injury: [],
        dates: []
      };
      
      const rawData: MetricsDataPoint[] = [];
      
      sortedData.forEach(item => {
        // Convert text-based feelings to numeric values
        const physicalFeelingNumeric = convertFeelingToNumeric(item.physicalFeeling || '');
        const mentalFeelingNumeric = convertFeelingToNumeric(item.mentalFeeling || '');
        const sleepNumeric = convertFeelingToNumeric(item.sleep || '');
        const weightNum = item.weight ? Number(item.weight) : 0;
        const illnessNum = illnessToNumeric(item.illness || '');
        const injuryNum = injuryToNumeric(item.injury || '');
        
        const metrics = {
          ctl: item.ctl || 0,
          eftp: item.eftp || item.atl || 0, // Support both eftp and legacy atl values
          form: item.form || (item.ctl - (item.eftp || item.atl)) || 0,
          physicalFeeling: physicalFeelingNumeric,
          mentalFeeling: mentalFeelingNumeric,
          sleep: sleepNumeric,
          weight: weightNum,
          illness: illnessNum,
          injury: injuryNum,
        };
        
        processed.ctl.push(metrics.ctl);
        processed.eftp.push(metrics.eftp);
        processed.form.push(metrics.form);
        processed.physicalFeeling.push(metrics.physicalFeeling);
        processed.mentalFeeling.push(metrics.mentalFeeling);
        processed.sleep.push(metrics.sleep);
        processed.weight.push(metrics.weight);
        processed.illness.push(metrics.illness);
        processed.injury.push(metrics.injury);
        processed.dates.push(item.date);
        
        rawData.push({
          date: item.date,
          metrics
        });
      });
      
      setChartData(processed);
      setRawMetricsData(rawData);
    } catch (error) {
      console.error('[stats] Error processing metrics data:', error);
      useMockData();
    }
  };

  // Use mock data if API fails or for testing
  const useMockData = () => {
    const today = new Date();
    const dates = [];
    const mockData: ChartData = {
      ctl: [],
      eftp: [],
      form: [],
      physicalFeeling: [],
      mentalFeeling: [],
      sleep: [],
      weight: [],
      illness: [],
      injury: [],
      dates: []
    };
    
    const rawData: MetricsDataPoint[] = [];
    
    // Generate dates for the selected range
    let daysToGenerate;
    switch (activeDateRange) {
      case '7d': daysToGenerate = 7; break;
      case '14d': daysToGenerate = 14; break;
      case '28d': daysToGenerate = 28; break;
      default: daysToGenerate = 7; break;
    }
    
    for (let i = daysToGenerate - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      dates.push(dateString);
      
      // Generate realistic training load progression with some randomness
      const dayIndex = daysToGenerate - i;
      
      // CTL grows slowly (fitness)
      const ctlBase = 65 + (dayIndex / daysToGenerate) * 20;
      const ctl = Math.round(ctlBase + (Math.random() * 4 - 2));
      
      // eFTP fluctuates more (estimated power)
      const eftpBase = 220 + (dayIndex / daysToGenerate) * 30;
      const eftp = Math.round(eftpBase + (Math.random() * 15 - 7.5));
      
      // Form is CTL - eFTP (freshness)
      const form = ctl - Math.round(eftp / 4); // Scale eFTP down for form calculation
      
      // Other metrics
      const physicalFeeling = Math.round(1 + Math.random() * 4); // 1 - 5
      const mentalFeeling = Math.round(1 + Math.random() * 4); // 1 - 5
      const sleep = Math.round(1 + Math.random() * 4); // 1 - 5
      const weight = Math.round(60 + Math.random() * 20); // 60 - 80 kg
      const illness = Math.round(Math.random() * 2); // 0 - 2
      const injury = Math.round(Math.random() * 3); // 0 - 3
      
      mockData.ctl.push(ctl);
      mockData.eftp.push(eftp);
      mockData.form.push(form);
      mockData.physicalFeeling.push(physicalFeeling);
      mockData.mentalFeeling.push(mentalFeeling);
      mockData.sleep.push(sleep);
      mockData.weight.push(weight);
      mockData.illness.push(illness);
      mockData.injury.push(injury);
      mockData.dates.push(dateString);
      
      rawData.push({
        date: dateString,
        metrics: {
          ctl,
          eftp,
          form,
          physicalFeeling,
          mentalFeeling,
          sleep,
          weight,
          illness,
          injury,
        }
      });
    }
    
    setChartData(mockData);
    setRawMetricsData(rawData);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMetrics();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  return (
    <View className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex-1`}>
      {/* Fixed Header */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingBottom: 16,
          paddingHorizontal: 24,
        }}
        className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}
      >
        <Text className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Analytics
        </Text>
        <Text className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDarkMode ? '#FFFFFF' : '#000000'}
          />
        }
      >
        <View className="px-6" style={{ paddingTop: 24, paddingBottom: 24 }}>
          {/* Date Range Selector */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <View className={`p-2 rounded-lg mr-3 ${
                isDarkMode ? 'bg-purple-500/20' : 'bg-purple-50'
              }`}>
                <Ionicons 
                  name="calendar" 
                  size={20} 
                  color={isDarkMode ? '#A78BFA' : '#8B5CF6'} 
                />
              </View>
              <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Time Range
              </Text>
            </View>
            
            <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-1 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <View className="flex-row">
                {['7d', '14d', '28d'].map((range, index) => (
                  <TouchableOpacity
                    key={range}
                    className={`flex-1 py-3 rounded-xl mx-1 ${
                      activeDateRange === range 
                        ? 'bg-blue-500'
                        : 'transparent'
                    }`}
                    onPress={() => setActiveDateRange(range as any)}
                  >
                    <Text className={`text-center font-semibold ${
                      activeDateRange === range 
                        ? 'text-white' 
                        : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {range.replace('d', ' Days')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Metric Toggle Buttons */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <View className={`p-2 rounded-lg mr-3 ${
                isDarkMode ? 'bg-green-500/20' : 'bg-green-50'
              }`}>
                <Ionicons 
                  name="options" 
                  size={20} 
                  color={isDarkMode ? '#22C55E' : '#10B981'} 
                />
              </View>
              <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Metrics
              </Text>
            </View>
            
            <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <View className="flex-row flex-wrap justify-center">
              {[
                { key: 'weight', label: 'Weight', color: colors.weight, lineStyle: 'solid' },
                { key: 'ctl', label: 'Fitness', color: colors.ctl, lineStyle: 'solid' },
                { key: 'eftp', label: 'eFTP', color: colors.eftp, lineStyle: 'solid' },
                { key: 'physicalFeeling', label: 'Physical', color: colors.physicalFeeling, lineStyle: 'solid' },
                { key: 'form', label: 'Form', color: colors.form, lineStyle: 'dashed' },
                { key: 'mentalFeeling', label: 'Mental', color: colors.mentalFeeling, lineStyle: 'dashed' },
                { key: 'sleep', label: 'Sleep', color: colors.sleep, lineStyle: 'solid' },
                { key: 'injury', label: 'Injury', color: colors.injury, lineStyle: 'dotted' },
                { key: 'illness', label: 'Illness', color: colors.illness, lineStyle: 'dash-dot' },
              ].map((metric) => (
                <View key={metric.key} className="w-1/3 p-1">
                  <TouchableOpacity
                    className="rounded-xl py-3 px-3"
                    style={{
                      backgroundColor: visibleMetrics[metric.key as keyof typeof visibleMetrics] 
                        ? metric.color 
                        : (isDarkMode ? '#374151' : '#F3F4F6'),
                      minHeight: 70, // Increased height for better layout
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                    onPress={() => setVisibleMetrics(v => ({ ...v, [metric.key]: !(v as any)[metric.key] }))}
                  >
                    {/* Line style indicator when active */}
                    {visibleMetrics[metric.key as keyof typeof visibleMetrics] && (
                      <View style={{ 
                        width: 28, 
                        height: 3, 
                        marginBottom: 8,
                        alignSelf: 'center',
                        backgroundColor: 'transparent',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        {/* Render different line style patterns */}
                        {metric.lineStyle === 'solid' && (
                          <View style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#FFFFFF',
                            borderRadius: 1.5,
                          }} />
                        )}
                        {metric.lineStyle === 'dashed' && (
                          <View style={{
                            flexDirection: 'row',
                            height: '100%',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                          }}>
                            <View style={{ width: 5, height: '100%', backgroundColor: '#FFFFFF', borderRadius: 1.5 }} />
                            <View style={{ width: 1, height: '100%', backgroundColor: 'transparent' }} />
                            <View style={{ width: 5, height: '100%', backgroundColor: '#FFFFFF', borderRadius: 1.5 }} />
                            <View style={{ width: 1, height: '100%', backgroundColor: 'transparent' }} />
                            <View style={{ width: 5, height: '100%', backgroundColor: '#FFFFFF', borderRadius: 1.5 }} />
                            <View style={{ width: 1, height: '100%', backgroundColor: 'transparent' }} />
                            <View style={{ width: 5, height: '100%', backgroundColor: '#FFFFFF', borderRadius: 1.5 }} />
                          </View>
                        )}
                        {metric.lineStyle === 'dotted' && (
                          <View style={{
                            flexDirection: 'row',
                            height: '100%',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                          }}>
                            {[...Array(9)].map((_, i) => (
                              <View 
                                key={i}
                                style={{
                                  width: 2,
                                  height: 2,
                                  backgroundColor: '#FFFFFF',
                                  borderRadius: 1,
                                }}
                              />
                            ))}
                          </View>
                        )}
                        {metric.lineStyle === 'dash-dot' && (
                          <View style={{
                            flexDirection: 'row',
                            height: '100%',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                          }}>
                            <View style={{ width: 6, height: '100%', backgroundColor: '#FFFFFF', borderRadius: 1.5 }} />
                            <View style={{ width: 1, height: '100%', backgroundColor: 'transparent' }} />
                            <View style={{ width: 2, height: 2, backgroundColor: '#FFFFFF', borderRadius: 1 }} />
                            <View style={{ width: 1, height: '100%', backgroundColor: 'transparent' }} />
                            <View style={{ width: 6, height: '100%', backgroundColor: '#FFFFFF', borderRadius: 1.5 }} />
                            <View style={{ width: 1, height: '100%', backgroundColor: 'transparent' }} />
                            <View style={{ width: 2, height: 2, backgroundColor: '#FFFFFF', borderRadius: 1 }} />
                          </View>
                        )}
                      </View>
                    )}
                    <Text className={`text-center font-semibold text-sm ${
                      visibleMetrics[metric.key as keyof typeof visibleMetrics] 
                        ? 'text-white' // White text for all colored backgrounds
                        : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {metric.label}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Main Chart */}
        <View className="mb-6">
          <View className="flex-row items-center mb-4">
            <View className={`p-2 rounded-lg mr-3 ${
              isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'
            }`}>
              <Ionicons 
                name="analytics" 
                size={20} 
                color={isDarkMode ? '#60A5FA' : '#3B82F6'} 
              />
            </View>
            <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Trends
            </Text>
          </View>
          
          <View
            className={`p-6 rounded-2xl border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}
            style={{
              shadowColor: '#000',
              shadowOpacity: isDarkMode ? 0.2 : 0.08,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 3,
              minHeight: CHART_HEIGHT + 80, // More space for chart, scales and tooltips
              overflow: 'visible', // Allow tooltips to show outside container
            }}
          >
            {loading ? (
              <View className="items-center justify-center py-12">
                <ActivityIndicator size="large" color={isDarkMode ? '#3B82F6' : '#2563EB'} />
                <Text className={`text-sm mt-3 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Loading analytics...
                </Text>
              </View>
            ) : error ? (
              <View className={`p-6 rounded-xl ${
                isDarkMode ? 'bg-red-900/20' : 'bg-red-50'
              }`}>
                <Text className={`text-center text-base font-medium ${
                  isDarkMode ? 'text-red-400' : 'text-red-700'
                }`}>
                  {error}
                </Text>
              </View>
            ) : chartData && chartData.dates.length > 0 ? (
              <View>
                <ChartWithTooltip
                  chartData={chartData}
                  visibleMetrics={visibleMetrics}
                  colors={colors}
                  isDarkMode={isDarkMode}
                  dates={chartData?.dates || []}
                />
                <Text className={`text-center text-sm mt-3 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Tap or drag on the graph for details
                </Text>
              </View>
            ) : (
              <View className="items-center py-12">
                <View className={`w-16 h-16 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full items-center justify-center mb-3`}>
                  <Ionicons name="analytics-outline" size={28} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                </View>
                <Text className={`text-base font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  No data available
                </Text>
                <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 text-center`}>
                  Complete your daily check-ins to see trends
                </Text>
              </View>
            )}
          </View>
        </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default StatsScreen;

interface ChartWithTooltipProps {
  chartData: ChartData;
  visibleMetrics: {
    ctl: boolean;
    eftp: boolean;
    form: boolean;
    physicalFeeling: boolean;
    mentalFeeling: boolean;
    weight: boolean;
    illness: boolean;
    injury: boolean;
    [key: string]: boolean; // Index signature for dynamic access
  };
  colors: {
    ctl: string;
    eftp: string;
    form: string;
    physicalFeeling: string;
    mentalFeeling: string;
    weight: string;
    illness: string;
    injury: string;
    [key: string]: string; // Index signature for dynamic access
  };
  isDarkMode: boolean;
  dates: string[];
}

const ChartWithTooltip: React.FC<ChartWithTooltipProps> = ({ chartData, visibleMetrics, colors, isDarkMode, dates }) => {
  // Defensive: if chartData or visibleMetrics or colors or dates is null, render nothing
  if (!chartData || !visibleMetrics || !colors || !dates) return null;

  const [tooltip, setTooltip] = useState<{ index: number; x: number; y: number } | null>(null);

  // Find the closest data index for a given x position (relative to graph area)
  const getClosestIndex = (x: number, width: number) => {
    if (!dates || dates.length === 0) return 0;
    const step = width / (dates.length - 1);
    return Math.round(x / step);
  };

  // PanResponder for touch events (only in graph area)
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        const { locationX, locationY } = evt.nativeEvent;
        // Clamp to graph area
        const x = Math.max(0, Math.min(locationX, CHART_GRAPH_WIDTH));
        setTooltip({ index: getClosestIndex(x, CHART_GRAPH_WIDTH), x, y: locationY });
      },
      onPanResponderMove: (evt, gestureState) => {
        const { locationX, locationY } = evt.nativeEvent;
        const x = Math.max(0, Math.min(locationX, CHART_GRAPH_WIDTH));
        setTooltip({ index: getClosestIndex(x, CHART_GRAPH_WIDTH), x, y: locationY });
      },
      onPanResponderRelease: () => {
        // Keep tooltip for a brief moment before hiding
        setTimeout(() => setTooltip(null), 1500);
      },
      onPanResponderTerminate: () => setTooltip(null),
    })
  ).current;

  // Prepare the selected metrics for display
  const selectedKeys = Object.keys(visibleMetrics).filter(k => visibleMetrics[k]);
  const tooltipIndex = tooltip?.index ?? null;
  const tooltipValues = tooltipIndex !== null && chartData && chartData.dates && chartData.dates[tooltipIndex]
    ? selectedKeys.map(key => ({
        key,
        value: chartData[key]?.[tooltipIndex] !== undefined && chartData[key]?.[tooltipIndex] !== null
          ? Number(chartData[key][tooltipIndex]).toFixed(1)
          : chartData[key]?.[tooltipIndex],
        color: colors[key],
      }))
    : [];

  // Determine which scales to show based on visible metrics
  const shouldShowWeightScale = visibleMetrics.weight;
  const shouldShowTrainingLoadScale = visibleMetrics.ctl || visibleMetrics.form;
  const shouldShowEftpScale = visibleMetrics.eftp;
  const shouldShowRightScale = visibleMetrics.physicalFeeling || visibleMetrics.mentalFeeling || visibleMetrics.sleep || visibleMetrics.injury || visibleMetrics.illness;

  // Calculate appropriate Y-axis ranges for different metric groups
  const getWeightAxisData = () => {
    let data: number[] = [];
    let min = 0, max = 100; // Start weight at 0
    
    if (visibleMetrics.weight && chartData?.weight) {
      data = [...data, ...chartData.weight];
      if (data.length > 0) {
        min = 0; // Always start at 0
        max = Math.max(...data) + 10; // Add some padding at top
      }
    }
    
    return { data, min, max };
  };

  const getTrainingLoadAxisData = () => {
    let data: number[] = [];
    let min = 0, max = 100;
    
    if (visibleMetrics.ctl && chartData?.ctl) {
      data = [...data, ...chartData.ctl];
    }
    if (visibleMetrics.form && chartData?.form) {
      data = [...data, ...chartData.form];
    }
    
    if (data.length > 0) {
      min = Math.min(...data) - 5;
      max = Math.max(...data) + 5;
    }
    
    return { data, min, max };
  };

  const getEftpAxisData = () => {
    let data: number[] = [];
    let min = 0, max = 300; // Start eFTP at 0
    
    if (visibleMetrics.eftp && chartData?.eftp) {
      data = [...data, ...chartData.eftp];
      if (data.length > 0) {
        min = 0; // Always start at 0
        max = Math.max(...data) + 30; // Add some padding at top
      }
    }
    
    return { data, min, max };
  };

  const getRightAxisData = () => {
    let data: number[] = [];
    let min = 0, max = 5; // Fixed scale for feelings 0-5
    
    if (visibleMetrics.physicalFeeling && chartData?.physicalFeeling) {
      data = [...data, ...chartData.physicalFeeling];
      min = 0; max = 5; // Fixed scale
    }
    if (visibleMetrics.mentalFeeling && chartData?.mentalFeeling) {
      data = [...data, ...chartData.mentalFeeling];
      min = 0; max = 5; // Fixed scale
    }
    if (visibleMetrics.sleep && chartData?.sleep) {
      data = [...data, ...chartData.sleep];
      min = 0; max = 5; // Fixed scale
    }
    if (visibleMetrics.injury && chartData?.injury) {
      data = [...data, ...chartData.injury];
      min = 0; max = 3;
    }
    if (visibleMetrics.illness && chartData?.illness) {
      data = [...data, ...chartData.illness];
      min = 0; max = 2;
    }
    
    return { data, min, max };
  };

  const weightAxis = getWeightAxisData();
  const trainingLoadAxis = getTrainingLoadAxisData();
  const eftpAxis = getEftpAxisData();
  const rightAxis = getRightAxisData();

  return (
    <View style={{ width: '100%', paddingHorizontal: 4 }}>
      {/* Scale Labels */}
      {(shouldShowWeightScale || shouldShowTrainingLoadScale || shouldShowEftpScale || shouldShowRightScale) && (
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          paddingHorizontal: 8, 
          marginBottom: 12,
          alignItems: 'center'
        }}>
          <View style={{ flex: 1, alignItems: 'flex-start' }}>
            {shouldShowWeightScale && (
              <Text style={{ 
                fontSize: 11, 
                fontWeight: '600',
                color: colors.weight
              }}>
                Weight (kg)
              </Text>
            )}
            {shouldShowTrainingLoadScale && (
              <Text style={{ 
                fontSize: 11, 
                fontWeight: '600',
                color: colors.ctl,
                marginTop: shouldShowWeightScale ? 2 : 0
              }}>
                Training Load
              </Text>
            )}
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            {shouldShowEftpScale && (
              <Text style={{ 
                fontSize: 11, 
                fontWeight: '600',
                color: colors.eftp
              }}>
                eFTP (watts)
              </Text>
            )}
            {shouldShowRightScale && (
              <Text style={{ 
                fontSize: 11, 
                fontWeight: '600',
                color: visibleMetrics.physicalFeeling ? colors.physicalFeeling : colors.injury,
                marginTop: shouldShowEftpScale ? 2 : 0
              }}>
                {visibleMetrics.physicalFeeling || visibleMetrics.mentalFeeling || visibleMetrics.sleep ? 'Feeling (1-5)' : 'Status Level'}
              </Text>
            )}
          </View>
        </View>
      )}
      
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'flex-end', 
        width: CHART_WIDTH,
        alignSelf: 'center' // Center the chart horizontally
      }}>
        {/* Weight Y-Axis (Left) */}
        {shouldShowWeightScale ? (
          <YAxis
            data={weightAxis.data.length > 0 ? weightAxis.data : [0, 100]}
            contentInset={{ top: 12, bottom: 12 }}
            svg={{ 
              fontSize: 9, 
              fill: colors.weight,
              fontWeight: '600'
            }}
            min={weightAxis.min}
            max={weightAxis.max}
            style={{ width: CHART_LEFT_YAXIS_WIDTH / 2, marginRight: 2 }}
            numberOfTicks={5}
            formatLabel={(value: any) => Math.round(value).toString()}
          />
        ) : (
          <View style={{ width: CHART_LEFT_YAXIS_WIDTH / 2, marginRight: 2 }} />
        )}

        {/* Training Load Y-Axis (Left-Center) */}
        {shouldShowTrainingLoadScale ? (
          <YAxis
            data={trainingLoadAxis.data.length > 0 ? trainingLoadAxis.data : [0, 100]}
            contentInset={{ top: 12, bottom: 12 }}
            svg={{ 
              fontSize: 9, 
              fill: colors.ctl,
              fontWeight: '600'
            }}
            min={trainingLoadAxis.min}
            max={trainingLoadAxis.max}
            style={{ width: CHART_LEFT_YAXIS_WIDTH / 2, marginRight: 2 }}
            numberOfTicks={4}
            formatLabel={(value: any) => Math.round(value).toString()}
          />
        ) : (
          <View style={{ width: CHART_LEFT_YAXIS_WIDTH / 2, marginRight: 2 }} />
        )}
        
        {/* Graph area (center) with tooltip container */}
        <View style={{ 
          width: CHART_GRAPH_WIDTH, 
          height: CHART_HEIGHT, 
          position: 'relative',
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderBottomWidth: 1,
          borderTopWidth: 0, // Remove top border
          borderColor: isDarkMode ? '#374151' : '#E5E7EB',
          borderRadius: 0, // Changed from 4 to 0
        }}>
          {/* Chart container with overflow hidden for chart elements */}
          <View style={{ 
            width: CHART_GRAPH_WIDTH, 
            height: CHART_HEIGHT, 
            position: 'absolute',
            overflow: 'hidden', // Prevent chart overflow
            borderRadius: 0, // Changed from 3 to 0
          }} {...panResponder.panHandlers}>
            {/* Touch overlay for better interaction */}
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={(evt) => {
                const { locationX, locationY } = evt.nativeEvent;
                const x = Math.max(0, Math.min(locationX, CHART_GRAPH_WIDTH));
                setTooltip({ index: getClosestIndex(x, CHART_GRAPH_WIDTH), x, y: locationY });
                // Auto-hide tooltip after 2 seconds
                setTimeout(() => setTooltip(null), 2000);
              }}
            />
          {/* Custom horizontal grid lines for better visibility */}
          {[...Array(5)].map((_, index) => (
            <View
              key={`grid-line-${index}`}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: 1,
                top: 12 + (index * (CHART_HEIGHT - 24) / 4), // Distribute evenly with contentInset
                backgroundColor: isDarkMode ? '#4B5563' : '#E5E7EB',
                opacity: 0.6,
                zIndex: 1, // Behind charts but visible
              }}
            />
          ))}
          
          {/* Bar chart for weight */}
          {visibleMetrics.weight && (
            <BarChart
              style={StyleSheet.absoluteFill}
              data={chartData?.weight || []}
              svg={{ fill: 'rgba(255,255,255,0.3)', rx: 2 }}
              contentInset={{ top: 12, bottom: 12 }}
              spacingInner={0.4}
              yMin={weightAxis.min}
              yMax={weightAxis.max}
            />
          )}
          
          {/* Line charts for all selected metrics */}
          {selectedKeys.map(key => {
            let yMin = 0, yMax = 1;
            let strokeDasharray = undefined; // Default to solid line
            
            // Use appropriate axis ranges for different metrics
            if (key === 'weight') {
              yMin = weightAxis.min;
              yMax = weightAxis.max;
              strokeDasharray = undefined; // Solid line for weight
            } else if (key === 'ctl') {
              yMin = trainingLoadAxis.min;
              yMax = trainingLoadAxis.max;
              strokeDasharray = undefined; // Solid line for CTL (fitness)
            } else if (key === 'form') {
              yMin = trainingLoadAxis.min;
              yMax = trainingLoadAxis.max;
              strokeDasharray = [8, 4]; // Dashed line for form
            } else if (key === 'eftp') {
              yMin = eftpAxis.min;
              yMax = eftpAxis.max;
              strokeDasharray = undefined; // Solid line for eFTP
            } else if (key === 'physicalFeeling') {
              yMin = 0; 
              yMax = 5;
              strokeDasharray = undefined; // Solid line for physical feeling
            } else if (key === 'mentalFeeling') {
              yMin = 0; 
              yMax = 5;
              strokeDasharray = [8, 4]; // Dashed line for mental feeling
            } else if (key === 'sleep') {
              yMin = 0; 
              yMax = 5;
              strokeDasharray = undefined; // Solid line for sleep
            } else if (key === 'injury') {
              yMin = 0; 
              yMax = 3;
              strokeDasharray = [4, 2]; // Dotted line for injury
            } else if (key === 'illness') {
              yMin = 0; 
              yMax = 2;
              strokeDasharray = [8, 2, 2, 2]; // Dash-dot line for illness
            }
            
            return (
              <LineChart
                key={key}
                style={StyleSheet.absoluteFill}
                data={(chartData[key] as number[]) || []}
                svg={{ 
                  stroke: colors[key], 
                  strokeWidth: 2, 
                  strokeDasharray: strokeDasharray,
                  strokeOpacity: 0.9
                }}
                contentInset={{ top: 12, bottom: 12 }}
                yMin={yMin}
                yMax={yMax}
                curve={shape.curveLinear}
              />
            );
          })}
          
          {/* Tooltip vertical line */}
          {tooltip && tooltipIndex !== null && chartData?.dates?.[tooltipIndex] && (
            <View 
              pointerEvents="none" 
              style={{ 
                position: 'absolute', 
                left: Math.max(0, Math.min(tooltip.x - 1, CHART_GRAPH_WIDTH - 2)), 
                top: 0, 
                height: CHART_HEIGHT, 
                width: 2, 
                backgroundColor: isDarkMode ? '#60A5FA' : '#3B82F6', 
                opacity: 0.6,
                borderRadius: 1
              }} 
            />
          )}
          </View>
          
          {/* Tooltip container - positioned outside the clipped chart area */}
          {tooltip && tooltipIndex !== null && chartData?.dates?.[tooltipIndex] && (
            <View style={{ 
              position: 'absolute', 
              left: Math.max(8, Math.min(tooltip.x + 12, CHART_GRAPH_WIDTH - 140)), 
              top: (() => {
                // Smart tooltip positioning to avoid clipping
                const tooltipHeight = 120; // Approximate height of tooltip
                const preferredTop = tooltip.y - 70; // Preferred position above touch point
                
                // If tooltip would go below chart area, position it above the touch point
                if (preferredTop + tooltipHeight > CHART_HEIGHT) {
                  return Math.max(-60, tooltip.y - tooltipHeight - 10); // Allow negative top for overflow above
                }
                
                // If tooltip would go above chart area, position it below the touch point
                if (preferredTop < 8) {
                  return Math.min(tooltip.y + 20, CHART_HEIGHT + 40); // Allow overflow below
                }
                
                return preferredTop;
              })(),
              backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', 
              borderRadius: 12, 
              padding: 12, 
              borderWidth: 1, 
              borderColor: isDarkMode ? '#374151' : '#E5E7EB',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDarkMode ? 0.3 : 0.15,
              shadowRadius: 8,
              elevation: 8,
              zIndex: 1000, // High z-index to ensure it's above everything
              minWidth: 130,
              maxWidth: 140
            }}>
              <Text style={{ 
                fontWeight: 'bold', 
                color: isDarkMode ? '#F3F4F6' : '#1F2937', 
                marginBottom: 6, 
                fontSize: 12,
                textAlign: 'center'
              }}>
                {new Date(chartData.dates[tooltipIndex]).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Text>
              {tooltipValues.map(({ key, value, color }) => (
                <View key={key} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <View style={{ 
                    width: 8, 
                    height: 8, 
                    backgroundColor: color, 
                    borderRadius: 4, 
                    marginRight: 8 
                  }} />
                  <Text style={{ 
                    color: isDarkMode ? '#D1D5DB' : '#374151', 
                    fontSize: 11, 
                    fontWeight: '500',
                    flex: 1
                  }}>
                    {key === 'ctl' ? 'Fitness' : key === 'eftp' ? 'eFTP' : key === 'physicalFeeling' ? 'Physical' : key === 'mentalFeeling' ? 'Mental' : key === 'sleep' ? 'Sleep' : key.charAt(0).toUpperCase() + key.slice(1)}: {value !== undefined ? value : '-'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
        
        {/* eFTP Y-Axis (Right-Center) */}
        {shouldShowEftpScale ? (
          <YAxis
            data={eftpAxis.data.length > 0 ? eftpAxis.data : [0, 300]}
            contentInset={{ top: 12, bottom: 12 }}
            svg={{ 
              fontSize: 9, 
              fill: colors.eftp,
              fontWeight: '600'
            }}
            min={eftpAxis.min}
            max={eftpAxis.max}
            style={{ width: CHART_RIGHT_YAXIS_WIDTH / 2, marginLeft: 2 }}
            numberOfTicks={5}
            formatLabel={(value: any) => Math.round(value).toString()}
          />
        ) : (
          <View style={{ width: CHART_RIGHT_YAXIS_WIDTH / 2, marginLeft: 2 }} />
        )}

        {/* Right Y-Axis (Feelings/Status) */}
        {shouldShowRightScale ? (
          <YAxis
            data={rightAxis.data.length > 0 ? rightAxis.data : [0, 5]}
            contentInset={{ top: 12, bottom: 12 }}
            svg={{ 
              fontSize: 9, 
              fill: visibleMetrics.physicalFeeling ? colors.physicalFeeling : colors.injury,
              fontWeight: '600'
            }}
            min={rightAxis.min}
            max={rightAxis.max}
            style={{ width: CHART_RIGHT_YAXIS_WIDTH / 2, marginLeft: 2 }}
            numberOfTicks={6} // 0, 1, 2, 3, 4, 5 for feelings scale
            formatLabel={(value: any) => Math.round(value).toString()}
          />
        ) : (
          <View style={{ width: CHART_RIGHT_YAXIS_WIDTH / 2, marginLeft: 2 }} />
        )}
      </View>
      
      {/* Custom X-Axis with multiline labels */}
      <View style={{ 
        width: CHART_WIDTH, 
        flexDirection: 'row', 
        marginTop: 12,
        marginBottom: 8,
        alignSelf: 'center'
      }}>
        <View style={{ width: CHART_LEFT_YAXIS_WIDTH + 4 }} />
        <View style={{ 
          width: CHART_GRAPH_WIDTH, 
          height: 40,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 8
        }}>
          {dates.map((date, index) => {
            const numDates = dates.length || 0;
            if (numDates === 0) return null;

            // Adjust skipFactor to aim for around 4-5 labels
            const desiredLabels = Math.min(numDates, 4);
            const skipFactor = numDates <= desiredLabels ? 1 : Math.ceil(numDates / desiredLabels);

            if (index % skipFactor === 0 || index === numDates - 1) {
              const dt = new Date(date + 'T00:00:00');
              const dayAbbr = dt.toLocaleDateString('en-US', { weekday: 'short' });
              const day = dt.getDate();
              const month = dt.getMonth() + 1;

              return (
                <View key={index} style={{ alignItems: 'center' }}>
                  <Text style={{ 
                    fontSize: 9, 
                    color: isDarkMode ? '#D1D5DB' : '#4B5563',
                    fontWeight: '500',
                    textAlign: 'center'
                  }}>
                    {dayAbbr}
                  </Text>
                  <Text style={{ 
                    fontSize: 9, 
                    color: isDarkMode ? '#D1D5DB' : '#4B5563',
                    fontWeight: '500',
                    textAlign: 'center',
                    marginTop: 1
                  }}>
                    {day}/{month}
                  </Text>
                </View>
              );
            }
            return null;
          })}
        </View>
        <View style={{ width: CHART_RIGHT_YAXIS_WIDTH + 4 }} />
      </View>
    </View>
  );
};