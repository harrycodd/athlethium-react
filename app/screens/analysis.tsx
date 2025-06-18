/*
================================================================================
                           WORKOUT ANALYSIS SCREEN
================================================================================
This screen provides detailed analysis of workout data with interactive charts.
Users can view heart rate data, power metrics, and other workout statistics
through an interactive line chart interface. The screen supports:

- Interactive line charts with gesture-based scrubbing
- Real-time data point selection and highlighting
- Dynamic chart grid and axis display
- Workout data visualization with customizable metrics
- Responsive chart layout that adapts to screen dimensions

The chart implementation uses react-native-svg-charts with custom gesture
handling for smooth user interaction and data exploration.
================================================================================
*/

// =============================================================================
//                                IMPORTS
// =============================================================================
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import { LineChart, YAxis, XAxis } from 'react-native-svg-charts';
import { G, Rect, Line } from 'react-native-svg';
import * as shape from 'd3-shape';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDarkMode } from '../hooks/commonHooks';
import { getThemedStyles } from '../styling';
import '../../global.css';

// =============================================================================
//                               CONSTANTS
// =============================================================================
const screenWidth = Dimensions.get('window').width;
const CHART_WIDTH = screenWidth - 64;
const CHART_HEIGHT = 220;

// =============================================================================
//                              SAMPLE DATA
// =============================================================================
// For demo purposes - in a real app, this would be fetched using the workoutId
const sampleWorkoutData = {
  '123': [200, 220, 210, 250, 260, 280, 270, 300, 310, 330, 340, 320],
  '456': [180, 190, 210, 220, 240, 230, 250, 260, 280, 290, 300, 280],
};

// Default data to use when no workout ID is provided or data not found
const defaultData = [200, 220, 210, 250, 260, 280, 270, 300, 310, 330, 340, 320];

// =============================================================================
//                           CHART COMPONENTS
// =============================================================================
const CustomGrid = ({ x, y, ticks, belowChart = false }) => {
  return (
    <G>
      {ticks.map((tick) => (
        <Line
          key={tick}
          x1="0%"
          x2="100%"
          y1={y(tick)}
          y2={y(tick)}
          stroke={belowChart ? '#E5E7EB' : '#D1D5DB'}
          strokeWidth={1}
        />
      ))}
    </G>
  );
};

// =============================================================================
//                            MAIN COMPONENT
// =============================================================================
const AnalysisScreen = () => {
  // -------------------------------------------------------------------------
  //                          HOOKS & NAVIGATION
  // -------------------------------------------------------------------------
  const { workoutId } = useLocalSearchParams();
  const navigation = useNavigation();
  const { isDarkMode } = useDarkMode();
  
  // -------------------------------------------------------------------------
  //                            COMPONENT STATE
  // -------------------------------------------------------------------------
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<number[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selection, setSelection] = useState<{ start: number | null; end: number | null }>({
    start: null,
    end: null,
  });

  const [metrics, setMetrics] = useState({
    average: 0,
    min: 0,
    max: 0,
    distance: 0,
  });

  // -------------------------------------------------------------------------
  //                           DATA LOADING EFFECT
  // -------------------------------------------------------------------------
  // Effect to load workout data based on ID
  useEffect(() => {
    const fetchWorkoutData = async () => {
      setLoading(true);
      try {
        // In a real app, fetch data from API using the workoutId
        // For demo purposes, we're using the sample data
        const id = workoutId as string;
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get workout data for the provided ID or use default
        const workoutData = id && sampleWorkoutData[id] ? sampleWorkoutData[id] : defaultData;
        setData(workoutData);
      } catch (error) {
        console.error('Error fetching workout data:', error);
        setData(defaultData);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutData();
  }, [workoutId]);

  // -------------------------------------------------------------------------
  //                           GESTURE HANDLERS
  // -------------------------------------------------------------------------
  const handleGesture = (event: PanGestureHandlerGestureEvent) => {
    const x = event.nativeEvent.x;
    const idx = Math.floor((x / CHART_WIDTH) * data.length);

    if (selection.start === null) {
      setSelection({ start: idx, end: idx }); // Initialize both start and end
    } else {
      setSelection({ start: selection.start, end: idx });
    }
  };

  const handleGestureEnd = () => {
    // No changes needed here as the selection already persists
  };

  const resetSelection = () => {
    setSelection({ start: null, end: null });
  };

  // -------------------------------------------------------------------------
  //                          DATA REFRESH HANDLER
  // -------------------------------------------------------------------------
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Simulate data fetch/refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would fetch fresh workout data here
      const selectedData = (sampleWorkoutData as any)[workoutId as string] || defaultData;
      setData(selectedData);
      
      // Recalculate metrics
      const averageHR = selectedData.reduce((sum, hr) => sum + hr, 0) / selectedData.length;
      const maxHR = Math.max(...selectedData);
      const minHR = Math.min(...selectedData);
      
      setMetrics({
        averageHR: Math.round(averageHR),
        maxHR,
        minHR,
        duration: selectedData.length,
      });
    } catch (error) {
      console.error('Error refreshing analysis data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Set up navigation header with refresh button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleRefresh}
          disabled={refreshing}
          style={{ marginRight: 15 }}
        >
          <Ionicons 
            name="refresh" 
            size={24} 
            color={refreshing ? (isDarkMode ? '#9CA3AF' : '#64748B') : (isDarkMode ? '#60A5FA' : '#2563EB')} 
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, isDarkMode, refreshing]);

  useEffect(() => {
    const selectedIndices =
      selection.start !== null && selection.end !== null
        ? [Math.min(selection.start, selection.end), Math.max(selection.start, selection.end)]
        : null;

    const selectedValues =
      selectedIndices !== null ? data.slice(selectedIndices[0], selectedIndices[1] + 1) : data;

    const average = selectedValues.reduce((sum, val) => sum + val, 0) / selectedValues.length;
    const min = Math.min(...selectedValues);
    const max = Math.max(...selectedValues);
    const distance = selectedValues.length * 0.2; // Assuming each point represents 0.2 km

    setMetrics({ average, min, max, distance });
  }, [selection, data]);

  const SelectionDecorator = () => {
    const selectedIndices =
      selection.start !== null && selection.end !== null
        ? [Math.min(selection.start, selection.end), Math.max(selection.start, selection.end)]
        : null;

    if (!selectedIndices) return null;

    const [startIdx, endIdx] = selectedIndices;
    const xStart = (startIdx / (data.length - 1)) * CHART_WIDTH;
    const xEnd = (endIdx / (data.length - 1)) * CHART_WIDTH;
    const width = xEnd - xStart;

    return (
      <G>
        <Rect
          x={xStart}
          y={0}
          width={width}
          height={CHART_HEIGHT}
          fill="rgba(59, 130, 246, 0.2)"
        />
      </G>
    );
  };

  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className={`mt-4 text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Loading workout data...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={resetSelection}>
        <View className={`flex-1 p-4 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
          <Text className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
            Speed Over Time {workoutId ? `(Workout #${workoutId})` : ''}
          </Text>

          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            <YAxis
              data={data}
              contentInset={{ top: 20, bottom: 20 }}
              svg={{ fill: '#64748B', fontSize: 12 }}
              numberOfTicks={5}
              formatLabel={(value) => `${value} km/h`}
            />
            <PanGestureHandler
              onGestureEvent={handleGesture}
              onEnded={handleGestureEnd}
            >
              <View>
                <LineChart
                  style={{ height: CHART_HEIGHT, width: CHART_WIDTH }}
                  data={data}
                  svg={{ stroke: '#3B82F6', strokeWidth: 2 }}
                  contentInset={{ top: 20, bottom: 20 }}
                  curve={shape.curveMonotoneX}
                >
                  <CustomGrid ticks={[...Array(5).keys()].map((i) => i * 100)} />
                  <SelectionDecorator />
                </LineChart>
              </View>
            </PanGestureHandler>
          </View>

          <XAxis
            style={{ marginHorizontal: 10 }}
            data={data}
            formatLabel={(value, index) => `${index} min`}
            contentInset={{ left: 10, right: 10 }}
            svg={{ fill: '#64748B', fontSize: 12 }}
          />

          <View 
            className="mt-4 bg-white rounded-xl p-4"
            style={{
              shadowColor: '#000',
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Text className="text-base mb-1 text-slate-800">Avg Speed: {metrics.average.toFixed(1)} km/h</Text>
            <Text className="text-base mb-1 text-slate-800">Min: {metrics.min} km/h</Text>
            <Text className="text-base mb-1 text-slate-800">Max: {metrics.max} km/h</Text>
            <Text className="text-base mb-1 text-slate-800">Distance: {metrics.distance.toFixed(1)} km</Text>
          </View>

          <Text className="text-xs text-slate-600 mt-2 text-center">Tap to reset. Tap or drag to select a range.</Text>
        </View>
      </TouchableWithoutFeedback>
    </GestureHandlerRootView>
  );
};

export default AnalysisScreen;