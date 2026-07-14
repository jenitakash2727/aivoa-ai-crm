import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const chatAPI = {
  sendMessage: async (message, hcpId = null) => {
    const response = await api.post('/api/chat', { message, hcp_id: hcpId });
    return response.data;
  }
};

export const interactionAPI = {
  log: async (data) => {
    const response = await api.post('/api/interactions/log', data);
    return response.data;
  },
  edit: async (data) => {
    const response = await api.put('/api/interactions/edit', data);
    return response.data;
  }
};

export const hcpAPI = {
  search: async (query) => {
    const response = await api.get('/api/hcps/search', { params: { query } });
    return response.data;
  },
  getHistory: async (hcpId) => {
    const response = await api.get(`/api/hcps/${hcpId}/history`);
    return response.data;
  },
  list: async () => {
    const response = await api.get('/api/hcps');
    return response.data;
  },
  getSuggestions: async (hcpId) => {
    const response = await api.get(`/api/hcps/${hcpId}/suggest`);
    return response.data;
  },
  generateFollowUp: async (hcpId, topic = '') => {
    const response = await api.post('/api/hcps/follow-up', { hcp_id: hcpId, topic });
    return response.data;
  }
};

export default api;