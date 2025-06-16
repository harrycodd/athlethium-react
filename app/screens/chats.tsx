import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, RefreshControl, ScrollView, Modal, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDarkMode } from '../../hooks/useDarkMode';
import { formatSecondsToHHMMSS, getCurrentDateString } from '../../utils/dateUtils';
import { sessionApi } from '../api_calls/sessionApi';
import { chatApi, type ChatMessage as ApiChatMessage, type ChatSession as ApiChatSession } from '../api_calls/chatApi';
import { validateParams, getErrorMessage } from '../../utils/stringUtils';
import '../../global.css';

type Message = ApiChatMessage;

type TrainingSuggestion = {
  name: string;
  description: string;
  sport: string;
  time: number;
  tss: number;
  tss_type: string;
  event_type: string;
  completed: boolean;
  date: string;
} | null;

type ChatSession = {
  sessionId: string;
  date: string;
  firstMessage: string;
  messageCount: number;
  lastActivity: string;
};

const nextSuggested = {
  type: 'Swim',
  duration: '1h',
  note: 'Endurance swim tomorrow',
};

const ChatScreen = () => {
  const { isDarkMode } = useDarkMode();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [trainingSuggestion, setTrainingSuggestion] = useState<TrainingSuggestion>(null);
  const [accepting, setAccepting] = useState(false);
  const [hiddenSessions, setHiddenSessions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Chat history states
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [currentChatSession, setCurrentChatSession] = useState<string | null>(null);

  useEffect(() => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    console.log('Chat session initialized with ID:', newSessionId);

    getUserId();
  }, []);

  const getUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        setUserId(storedUserId);
        console.log('User ID retrieved from AsyncStorage:', storedUserId);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now().toString() + '_error',
          role: 'assistant',
          content: 'User not authenticated. Please log in again.',
        }]);
      }
    } catch (err: any) {
      console.error('Error getting user ID:', err);
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '_error',
        role: 'assistant',
        content: 'Authentication error. Please try logging out and back in.',
      }]);
    }
  };

  // Fetch chat history from the API
  const fetchChatHistory = async () => {
    if (!userId) return;
    setLoadingHistory(true);
    try {
      const response = await chatApi.getChatHistory();
      
      if (response.sessions && Array.isArray(response.sessions)) {
        // Map the API response to our ChatSession type
        const sessions: ChatSession[] = response.sessions.map((session: ApiChatSession) => ({
          sessionId: session.sessionId,
          date: session.createdAt ? new Date(session.createdAt).toLocaleDateString() : '',
          firstMessage: session.title || session.lastMessage || 'Chat Session',
          messageCount: session.messageCount,
          lastActivity: session.lastActivity
        }));
        setChatHistory(sessions);
      } else {
        setChatHistory([]);
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
      setChatHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Load a specific chat session
  const loadChatSession = async (sessionId: string) => {
    if (!userId) return;
    try {
      const response = await chatApi.getChatSession(sessionId);
      
      if (response && response.messages && Array.isArray(response.messages)) {
        // Map the API messages to our Message type
        const messages: Message[] = response.messages.map((msg: ApiChatMessage) => ({
          id: msg.id || Date.now().toString(),
          role: msg.role || 'user',
          content: msg.content || ''
        }));
        setMessages(messages);
        setCurrentChatSession(sessionId);
        setSessionId(sessionId);
        setShowChatHistory(false);
      }
    } catch (err) {
      console.error('Error loading chat session:', err);
    }
  };

  // Start a new chat session
  const startNewChat = () => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    setMessages([]);
    setCurrentChatSession(null);
    setShowChatHistory(false);
    console.log('New chat session initialized with ID:', newSessionId);
  };

  const handleRefresh = async () => {
    if (!userId) return;
    setRefreshing(true);
    try {
      // Refresh chat history if needed
      if (showChatHistory) {
        await fetchChatHistory();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Set up navigation header to hide it (we'll use custom header)
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    // Any initialization logic for when userId changes
  }, [userId]);

  const sendMessage = async () => {
    if (!input.trim() || !sessionId) return;

    if (!userId) {
      console.error('Cannot send message: Missing userId');
      await getUserId();

      if (!userId) {
        const errorMessage: Message = {
          id: Date.now().toString() + '_error',
          role: 'assistant',
          content: 'Unable to send message: User ID not available. Please try again later.',
        };

        setMessages(prev => [...prev, errorMessage]);
        return;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = input;
    setInput('');
    setIsLoading(true);
    setTrainingSuggestion(null);

    try {
      // Prepare context with conversation history and hidden sessions
      let context = {
        conversationHistory: messages.map(m => `${m.role}: ${m.content}`).join('\n'),
        hiddenSessions: hiddenSessions
      };

      const response = await chatApi.sendMessage({
        message: messageToSend,
        sessionId: currentChatSession || sessionId,
        context: context
      });

      console.log('Chat API response:', response);

      let reply = response.message || '';
      let suggestion: TrainingSuggestion = null;

      // Check if there are suggestions in the response
      if (response.suggestions && Array.isArray(response.suggestions) && response.suggestions.length > 0) {
        suggestion = response.suggestions[0]; // Take the first suggestion
        setHiddenSessions(prev => [...prev, suggestion]);
      }

      // Parse any JSON training suggestions from the message content
      if (reply) {
        const jsonMatch = reply.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
          try {
            const parsedSuggestion = JSON.parse(jsonMatch[0]);
            if (parsedSuggestion && typeof parsedSuggestion === 'object') {
              suggestion = parsedSuggestion;
              setHiddenSessions(prev => [...prev, suggestion]);
              reply = reply.replace(jsonMatch[0], '').replace(/\n{2,}/g, '\n').trim();
            }
          } catch (e) {
            // Keep original reply if JSON parsing fails
          }
        }
      }

      const assistantMessage: Message = {
        id: response.messageId || Date.now().toString() + '_assistant',
        role: 'assistant',
        content: reply,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setTrainingSuggestion(suggestion);

      // Update session ID if this is a new conversation
      if (response.sessionId && !currentChatSession) {
        setSessionId(response.sessionId);
      }
    } catch (error: any) {
      console.error('Chat API Error:', error);

      let errorContent = 'Sorry, there was an error processing your request. Please try again later.';

      if (error.message && error.message.includes('userId')) {
        errorContent = 'Your user ID could not be determined. Please try logging out and back in.';
      } else if (error.name === 'NetworkError' || error.message?.includes('network')) {
        errorContent = 'Network error. Please check your internet connection and try again.';
      } else if (error.name === 'UnauthorizedException' || error.message?.includes('Unauthorized')) {
        errorContent = 'Your session has expired. Please log in again.';
      } else if (error.message?.includes('ValidationException') || error.message?.includes('agentAliasId')) {
        console.error('Bedrock configuration error detected. Backend needs to fix agentAliasId format.');
        errorContent = 'The AI assistant is currently unavailable due to a backend configuration issue. Our team has been notified and is working on a fix.';
      }

      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        role: 'assistant',
        content: errorContent,
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTraining = async (training: any) => {
    if (!userId) return;
    try {
      const date = training.date || getCurrentDateString();
      
      const trainingToAdd = {
        ...training,
        tss_type: 'estimated', // Overwrite tss_type to 'estimated'
      };
      
      await sessionApi.addTraining(date, trainingToAdd);
      console.log('Training added successfully');
      // Optionally update UI or state here
    } catch (err) {
      console.error('Error in handleAddTraining:', err);
      // Optionally show error to user
    }
  };

  const TrainingSuggestionBox = ({ suggestion }: { suggestion: TrainingSuggestion }) => {
    const [accepted, setAccepted] = useState(false);
    if (!suggestion) return null;
    return (
      <View 
        className={`rounded-xl p-4 my-3 border ${
          isDarkMode 
            ? 'bg-gray-700 border-gray-600' 
            : 'bg-gray-50 border-gray-200'
        }`}
      >
        <Text className={`font-bold text-base mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {suggestion.name}
        </Text>
        <Text className={`mb-2 text-sm ${
          isDarkMode ? 'text-blue-400' : 'text-blue-600'
        }`}>
          {suggestion.sport} • {suggestion.event_type} • {formatSecondsToHHMMSS(suggestion.time)} • TSS: {suggestion.tss} ({suggestion.tss_type})
        </Text>
        <Text className={`mb-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {suggestion.description}
        </Text>
        <Text className={`text-xs mb-3 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Date: {suggestion.date} {suggestion.completed ? '✓ Completed' : ''}
        </Text>
        <TouchableOpacity
          className={`py-3 px-4 rounded-lg items-center ${
            accepted 
              ? (isDarkMode ? 'bg-gray-600' : 'bg-gray-300') 
              : 'bg-blue-500'
          }`}
          style={{ opacity: accepted ? 0.6 : 1 }}
          disabled={accepted}
          onPress={async () => {
            setAccepted(true);
            setAccepting(true);
            await handleAddTraining(suggestion);
            setAccepting(false);
          }}
        >
          <Text className="text-white font-semibold text-base">{accepted ? 'Accepted' : 'Accept'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Chat history component
  const ChatHistoryModal = () => (
    <Modal
      visible={showChatHistory}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowChatHistory(false)}
    >
      <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 12,
            paddingBottom: 16,
            paddingHorizontal: 24,
          }}
          className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}
        >
          <View className="flex-row items-center justify-between">
            <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Chat History
            </Text>
            <TouchableOpacity
              onPress={() => setShowChatHistory(false)}
              className="p-2"
            >
              <Ionicons name="close" size={24} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat history list */}
        <ScrollView className="flex-1 px-6 py-4">
          {loadingHistory ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#2563EB'} />
              <Text className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Loading chat history...
              </Text>
            </View>
          ) : chatHistory.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <Ionicons 
                name="chatbubbles-outline" 
                size={64} 
                color={isDarkMode ? '#6B7280' : '#9CA3AF'} 
              />
              <Text className={`text-lg font-medium mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No chat history
              </Text>
              <Text className={`text-sm mt-2 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Your previous conversations will appear here
              </Text>
            </View>
          ) : (
            chatHistory.map((session, index) => (
              <TouchableOpacity
                key={session.sessionId}
                onPress={() => loadChatSession(session.sessionId)}
                className={`p-4 rounded-xl mb-3 border ${
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
                }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className={`font-semibold text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {session.firstMessage.length > 40 
                      ? session.firstMessage.substring(0, 40) + '...' 
                      : session.firstMessage}
                  </Text>
                  <View className={`px-2 py-1 rounded-full ${
                    isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
                  }`}>
                    <Text className={`text-xs font-medium ${
                      isDarkMode ? 'text-blue-300' : 'text-blue-700'
                    }`}>
                      {session.messageCount} messages
                    </Text>
                  </View>
                </View>
                
                <View className="flex-row items-center justify-between">
                  <Text className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {session.date}
                  </Text>
                  <Text className={`text-xs ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    {session.lastActivity}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  const renderMessage = ({ item, index }: { item: Message, index: number }) => (
    <>
      <View className={`my-2 p-3 rounded-xl max-w-[80%] ${
        item.role === 'user' 
          ? `self-end ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'}` 
          : `self-start ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`
      }`}>
        <Text className={`text-base ${
          item.role === 'user' 
            ? 'text-white' 
            : isDarkMode ? 'text-gray-200' : 'text-gray-900'
        }`}>{item.content}</Text>
      </View>
      {item.role === 'assistant' && index === messages.length - 1 && trainingSuggestion && (
        <TrainingSuggestionBox suggestion={trainingSuggestion} />
      )}
    </>
  );

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
          Chats
        </Text>
        <Text className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
          Chat with your virtual coach
        </Text>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={isDarkMode ? '#FFFFFF' : '#000000'}
          />
        }
      >
        <View className="px-6" style={{ paddingTop: 24, paddingBottom: 24 }}>
          {/* Action Buttons */}
          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity
              onPress={startNewChat}
              className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl ${
                isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
              }`}
              style={{
                shadowColor: '#3B82F6',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3
              }}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">New Chat</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => {
                setShowChatHistory(true);
                fetchChatHistory();
              }}
              className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-600' 
                  : 'bg-white border-gray-200'
              }`}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isDarkMode ? 0.2 : 0.1,
                shadowRadius: 2,
                elevation: 2
              }}
            >
              <Ionicons name="time" size={20} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
              <Text className={`font-semibold ml-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                History
              </Text>
            </TouchableOpacity>
          </View>

          {/* Chat Content */}
          <View className="mb-8">
            {/* Show current session indicator if viewing a historical chat */}
            {currentChatSession && (
              <View className={`mb-4 p-3 rounded-lg ${
                isDarkMode 
                  ? 'bg-blue-900/20 border-l-4 border-blue-500' 
                  : 'bg-blue-50 border-l-4 border-blue-500'
              }`}>
                <Text className={`text-sm font-medium ${
                  isDarkMode ? 'text-blue-300' : 'text-blue-700'
                }`}>
                  Viewing chat session
                </Text>
                <Text className={`text-xs ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  Start a new chat to continue with AI Coach
                </Text>
              </View>
            )}
            
            {messages.length === 0 && !currentChatSession ? (
              <View className="items-center justify-center py-20">
                <Ionicons 
                  name="chatbubbles-outline" 
                  size={80} 
                  color={isDarkMode ? '#6B7280' : '#9CA3AF'} 
                />
                <Text className={`text-xl font-medium mt-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Start a conversation
                </Text>
                <Text className={`text-base mt-3 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Ask me anything about your training plan
                </Text>
              </View>
            ) : (
              <View className="flex-1">
                {messages.map((item, index) => renderMessage({ item, index }))}
              </View>
            )}
          </View>

          {/* Bottom Padding */}
          <View className="h-6" />
        </View>
    </ScrollView>

      {/* Input Section */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View className="px-6 pb-6 pt-4">
          <View className={`flex-row items-center gap-3 py-2 px-4 rounded-2xl border ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDarkMode ? 0.2 : 0.08,
            shadowRadius: 8,
            elevation: 4
          }}>
            <TextInput
              className={`flex-1 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-900'
              }`}
              value={input}
              onChangeText={setInput}
              placeholder={currentChatSession ? "Start a new chat to continue..." : "Ask about your training plan..."}
              placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
              editable={!isLoading && !currentChatSession}
              multiline
              maxLength={500}
              style={Platform.select({
                android: { minHeight: 20, maxHeight: 80, textAlignVertical: 'center', includeFontPadding: false, paddingVertical: 8 },
                ios: { minHeight: 20, maxHeight: 80, paddingTop: 8, paddingBottom: 8 }
              })}
            />
            <TouchableOpacity 
              onPress={currentChatSession ? startNewChat : sendMessage} 
              className={`p-2 rounded-xl ${
                isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
              }`}
              style={{ 
                opacity: (isLoading || !userId) ? 0.5 : 1,
                shadowColor: '#3B82F6',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3
              }}
              disabled={isLoading || !userId}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons 
                  name={currentChatSession ? "add" : "send"} 
                  size={20} 
                  color="#fff" 
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      
      {/* Chat History Modal */}
      <ChatHistoryModal />
    </View>
  );
};

export default ChatScreen;
