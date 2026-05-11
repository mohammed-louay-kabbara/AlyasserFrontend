import axios from "axios";
import { FALLBACK_CONFIG, createApiConfig } from "../constants/config";

// Production-ready API instance
const api = axios.create(createApiConfig());

// Request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/app/login";
    }
    
    // Log production errors appropriately
    if (FALLBACK_CONFIG.SHOW_CONSOLE_ERRORS) {
      console.error('API Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Production-ready error handling wrapper
export const apiCall = async (apiFunction: () => Promise<any>) => {
  try {
    return await apiFunction();
  } catch (error: any) {
    // Check if it's a CORS or network error
    if (error.code === 'ECONNREFUSED' || 
        error.code === 'ERR_CONNECTION_REFUSED' || 
        error.code === 'ERR_NETWORK' ||
        error.message?.includes('CORS') ||
        error.message?.includes('Network Error')) {
      
      if (FALLBACK_CONFIG.SHOW_CONSOLE_ERRORS) {
        console.warn('Network/CORS error detected, using fallback:', error.message);
      }
      
      // For production, we might want to show a user-friendly message
      if (!FALLBACK_CONFIG.ENABLE_MOCK_FALLBACK) {
        throw new Error('Unable to connect to server. Please check your connection.');
      }
    }
    
    throw error;
  }
};

export default api;
