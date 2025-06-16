import { makeAuthenticatedApiCall } from './apiUtils';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ChatSession {
  sessionId: string;
  title: string;
  lastMessage: string;
  lastActivity: string;
  messageCount: number;
  createdAt: string;
}

export interface SendChatMessageRequest {
  message: string;
  sessionId?: string;
  context?: any;
}

export interface SendChatMessageResponse {
  message: string;
  sessionId: string;
  messageId: string;
  suggestions?: any[];
}

export interface ChatHistoryResponse {
  sessions: ChatSession[];
  total: number;
}

export interface ChatSessionResponse {
  sessionId: string;
  messages: ChatMessage[];
  title: string;
  createdAt: string;
  updatedAt: string;
}

export const chatApi = {
  /**
   * Send a chat message
   * @param request Message content and optional session context
   * @returns API response with assistant's reply
   */
  sendMessage: async (request: SendChatMessageRequest): Promise<SendChatMessageResponse> => {
    try {
      const response = await makeAuthenticatedApiCall({
        method: 'POST',
        path: '/chats/send',
        body: request
      });
      
      const data = await response.body.json();
      
      if (response.statusCode !== 200) {
        throw new Error(data.error || `API call failed with status ${response.statusCode}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  },

  /**
   * Get chat history for the authenticated user
   * @returns List of chat sessions
   */
  getChatHistory: async (): Promise<ChatHistoryResponse> => {
    try {
      const response = await makeAuthenticatedApiCall({
        method: 'GET',
        path: '/chats/history'
      });
      
      const data = await response.body.json();
      
      if (response.statusCode !== 200) {
        throw new Error(data.error || `API call failed with status ${response.statusCode}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  },

  /**
   * Get messages for a specific chat session
   * @param sessionId The ID of the chat session
   * @returns Chat session with messages
   */
  getChatSession: async (sessionId: string): Promise<ChatSessionResponse> => {
    try {
      const response = await makeAuthenticatedApiCall({
        method: 'GET',
        path: `/chats/history/${sessionId}`
      });
      
      const data = await response.body.json();
      
      if (response.statusCode !== 200) {
        throw new Error(data.error || `API call failed with status ${response.statusCode}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching chat session:', error);
      throw error;
    }
  },

  /**
   * Get all chats (overview)
   * @returns List of chats with basic info
   */
  getChats: async (): Promise<any> => {
    try {
      const response = await makeAuthenticatedApiCall({
        method: 'GET',
        path: '/chats'
      });
      
      const data = await response.body.json();
      
      if (response.statusCode !== 200) {
        throw new Error(data.error || `API call failed with status ${response.statusCode}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching chats:', error);
      throw error;
    }
  },

  /**
   * Delete a chat session
   * @param sessionId The ID of the chat session to delete
   */
  deleteChatSession: async (sessionId: string): Promise<void> => {
    try {
      const response = await makeAuthenticatedApiCall({
        method: 'DELETE',
        path: `/chats/${sessionId}`
      });
      
      if (response.statusCode !== 200) {
        const data = await response.body.json();
        throw new Error(data.error || `API call failed with status ${response.statusCode}`);
      }
    } catch (error) {
      console.error('Error deleting chat session:', error);
      throw error;
    }
  }
};
