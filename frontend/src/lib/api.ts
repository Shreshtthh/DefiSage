import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = {
  query: async (query: string, sessionId?: string) => {
    const response = await axios.post(`${API_URL}/api/query`, {
      query,
      sessionId
    });
    return response.data;
  },

  approve: async (sessionId: string, approved: boolean) => {
    const response = await axios.post(`${API_URL}/api/approve`, {
      sessionId,
      approved
    });
    return response.data;
  }
};
