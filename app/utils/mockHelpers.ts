/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                 MOCK HELPERS                                         ║
 * ║                                                                                      ║
 * ║ Mock implementations to replace API functionality during development and testing.    ║
 * ║ All functions return realistic sample data for UI development.                       ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════╝
 */

// ============================================================================
// AUTHENTICATION MOCKS
// ============================================================================

/**
 * Mock authentication helper functions
 */
export const mockHelpers = {
  // User Authentication
  signOut: async () => {
    console.log('Mock: User signed out');
    return Promise.resolve();
  },
  
  deleteUser: async () => {
    console.log('Mock: User account deleted');
    return Promise.resolve();
  },
  
  updateUserAttribute: async (params: any) => {
    console.log('Mock: User attribute update:', params);
    return Promise.resolve({ 
      nextStep: { 
        updateAttributeStep: 'CONFIRM_ATTRIBUTE_WITH_CODE',
        codeDeliveryDetails: {
          deliveryMedium: 'EMAIL',
          destination: 'demo@example.com'
        }
      } 
    });
  },
  
  confirmUserAttribute: async (params: any) => {
    console.log('Mock: User attribute confirmation:', params);
    return Promise.resolve();
  },
  
  fetchAuthSession: async () => {
    console.log('Mock: Auth session fetched');
    return Promise.resolve({
      tokens: {
        idToken: { toString: () => 'mock-token' },
        accessToken: { toString: () => 'mock-access-token' }
      }
    });
  },
  
  getCurrentUser: async () => {
    console.log('Mock: Current user fetched');
    return Promise.resolve({
      userId: 'mock-user-id',
      username: 'demo-user'
    });
  }
};

// ============================================================================
// USER API MOCKS
// ============================================================================

/**
 * Mock user API functions
 */
export const userApi = {
  getUser: async (userId: string) => {
    console.log('Mock: Get user:', userId);
    return Promise.resolve({
      id: userId,
      name: 'Demo User',
      email: 'demo@example.com',
      createdAt: new Date().toISOString()
    });
  },
  
  updateUser: async (userId: string, data: any) => {
    console.log('Mock: Update user:', userId, data);
    return Promise.resolve({
      id: userId,
      ...data,
      updatedAt: new Date().toISOString()
    });
  },
  
  getUserSettings: async (userId: string) => {
    console.log('Mock: Get user settings:', userId);
    return Promise.resolve({
      notifications: true,
      darkMode: false,
      language: 'en',
      units: 'metric'
    });
  },
  
  updateUserSettings: async (userId: string, settings: any) => {
    console.log('Mock: Update user settings:', userId, settings);
    return Promise.resolve({
      ...settings,
      updatedAt: new Date().toISOString()
    });
  }
};

// ============================================================================
// TRAINING SESSION API MOCKS
// ============================================================================

/**
 * Mock session API functions
 */
export const sessionApi = {
  getSessions: async (userId: string) => {
    console.log('Mock: Get sessions for user:', userId);
    return Promise.resolve([
      {
        id: 'session-1',
        userId,
        date: new Date().toISOString().split('T')[0],
        type: 'Running',
        duration: 3600,
        intensity: 7,
        tss: 100,
        notes: 'Great workout!',
        completed: true
      },
      {
        id: 'session-2',
        userId,
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        type: 'Cycling',
        duration: 5400,
        intensity: 6,
        tss: 85,
        notes: 'Easy ride',
        completed: true
      }
    ]);
  },
  
  createSession: async (sessionData: any) => {
    console.log('Mock: Create session:', sessionData);
    return Promise.resolve({
      id: `session-${Date.now()}`,
      ...sessionData,
      createdAt: new Date().toISOString()
    });
  },
  
  updateSession: async (sessionId: string, data: any) => {
    console.log('Mock: Update session:', sessionId, data);
    return Promise.resolve({
      id: sessionId,
      ...data,
      updatedAt: new Date().toISOString()
    });
  },
  
  deleteSession: async (sessionId: string) => {
    console.log('Mock: Delete session:', sessionId);
    return Promise.resolve({ success: true });
  },
  
  getSessionDetails: async (sessionId: string) => {
    console.log('Mock: Get session details:', sessionId);
    return Promise.resolve({
      id: sessionId,
      workoutId: sessionId,
      userId: 'demo-user',
      name: 'Mock Training',
      sport: 'Running',
      event_type: 'run',
      description: 'Mock description',
      time: 3600,
      date: new Date().toISOString().split('T')[0],
      tss: 100,
      tss_type: 'estimated',
      completed: false
    });
  },

  getTrainingSession: async (sessionId: string) => {
    console.log('Mock: Get training session:', sessionId);
    return Promise.resolve({
      id: sessionId,
      workoutId: sessionId,
      userId: 'demo-user',
      name: 'Mock Training',
      sport: 'Running',
      event_type: 'run',
      description: 'Mock description',
      time: 3600,
      date: new Date().toISOString().split('T')[0],
      tss: 100,
      tss_type: 'estimated',
      completed: false
    });
  },

  addTraining: async (date: string, trainingData: any) => {
    console.log('Mock: Add training:', date, trainingData);
    return Promise.resolve({
      id: `training-${Date.now()}`,
      date,
      ...trainingData,
      createdAt: new Date().toISOString()
    });
  }
};

// ============================================================================
// ANALYTICS API MOCKS
// ============================================================================

/**
 * Mock analytics API functions
 */
export const analyticsApi = {
  getTrainingMetrics: async (userId: string, dateRange?: { start: string; end: string }) => {
    console.log('Mock: Get training metrics:', userId, dateRange);
    return Promise.resolve({
      totalSessions: 15,
      totalDuration: 54000, // 15 hours
      totalTSS: 1250,
      averageIntensity: 6.5,
      fitnessLevel: 75,
      fatigueLevel: 35,
      peakSessions: 3
    });
  },
  
  getHealthMetrics: async (userId: string) => {
    console.log('Mock: Get health metrics:', userId);
    return Promise.resolve({
      restingHeartRate: 52,
      weight: 75.5,
      bodyFat: 12.5,
      sleepQuality: 8.2,
      stressLevel: 3.5,
      energy: 7.8,
      mood: 8.0
    });
  },
  
  getProgressData: async (userId: string, metric: string, period: string) => {
    console.log('Mock: Get progress data:', userId, metric, period);
    const data = [];
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 90;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.random() * 100 + 50 // Random value between 50-150
      });
    }
    
    return Promise.resolve(data.reverse());
  }
};

// ============================================================================
// CHAT API MOCKS
// ============================================================================

/**
 * Mock chat API functions
 */
export const chatApi = {
  getMonthlyChatHistory: async () => {
    console.log('Mock: Get monthly chat history');
    return Promise.resolve({
      sessions: [
        {
          sessionId: 'chat-1',
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          messageCount: 5
        },
        {
          sessionId: 'chat-2',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          lastActivity: new Date(Date.now() - 86400000).toISOString(),
          messageCount: 3
        }
      ]
    });
  },

  getChatSession: async (sessionId: string) => {
    console.log('Mock: Get chat session:', sessionId);
    return Promise.resolve({
      id: sessionId,
      messages: [
        {
          id: 'msg-1',
          role: 'user' as 'user',
          content: 'Can you suggest a workout for today?',
          timestamp: new Date().toISOString()
        },
        {
          id: 'msg-2',
          role: 'assistant' as 'assistant',
          content: 'Based on your training history, I recommend a 45-minute easy run.',
          timestamp: new Date().toISOString()
        }
      ]
    });
  },

  sendMessage: async (messageData: any) => {
    console.log('Mock: Send message:', messageData);
    return Promise.resolve({
      messageId: `msg-${Date.now()}`,
      sessionId: messageData.sessionId || `session-${Date.now()}`,
      message: 'Thanks for your message! Here are some workout suggestions based on your current training.',
      suggestions: [
        {
          name: 'Easy Run',
          description: 'A comfortable 45-minute run',
          sport: 'Running',
          event_type: 'run',
          time: 2700,
          tss: 65,
          tss_type: 'estimated',
          completed: false,
          date: new Date().toISOString().split('T')[0]
        },
        {
          name: 'Recovery Ride',
          description: 'An easy 1-hour cycling session',
          sport: 'Cycling',
          event_type: 'bike',
          time: 3600,
          tss: 50,
          tss_type: 'estimated',
          completed: false,
          date: new Date().toISOString().split('T')[0]
        }
      ]
    });
  }
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type UpdateUserAttributeOutput = {
  nextStep: {
    updateAttributeStep: string;
    codeDeliveryDetails?: {
      deliveryMedium: string;
      destination: string;
    };
  };
};

export type ConfirmUserAttributeInput = {
  userAttributeKey: string;
  confirmationCode: string;
};

export type MockSession = {
  id: string;
  userId: string;
  date: string;
  type: string;
  duration: number;
  intensity: number;
  tss: number;
  notes: string;
  completed: boolean;
};

export type MockUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type MockUserSettings = {
  notifications: boolean;
  darkMode: boolean;
  language: string;
  units: string;
};

export type MockTrainingMetrics = {
  totalSessions: number;
  totalDuration: number;
  totalTSS: number;
  averageIntensity: number;
  fitnessLevel: number;
  fatigueLevel: number;
  peakSessions: number;
};

export type MockHealthMetrics = {
  restingHeartRate: number;
  weight: number;
  bodyFat: number;
  sleepQuality: number;
  stressLevel: number;
  energy: number;
  mood: number;
};
