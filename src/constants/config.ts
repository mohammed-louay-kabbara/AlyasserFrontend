// Production-ready API configuration
export const API_BASE_URL = "http://alyasser-center.com:8080/api";
export const PAGE_SIZE = 10;

// Production deployment configuration
export const PRODUCTION_CONFIG = {
  // When deployed to same domain as API, no CORS issues
  SAME_DOMAIN: false, // Set to true if frontend and API are on same domain
  API_TIMEOUT: 60000,
  RETRY_ATTEMPTS: 3,
};

// Fallback configuration for development
export const FALLBACK_CONFIG = {
  ENABLE_MOCK_FALLBACK: true, // Enabled for testing when backend is not responding
  SHOW_CONSOLE_ERRORS: true, // Show errors for debugging
};

// Production-ready API configuration
export const createApiConfig = () => {
  return {
    baseURL: API_BASE_URL,
    timeout: PRODUCTION_CONFIG.API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    withCredentials: false, // Important for CORS
  };
};
