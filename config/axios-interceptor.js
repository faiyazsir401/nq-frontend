import axios from "axios";
import { LOCAL_STORAGE_KEYS } from "../app/common/constants";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Defensive guard: Log error if baseURL is missing
if (!baseURL) {
  console.error('[API ERROR] NEXT_PUBLIC_API_BASE_URL is undefined. API calls will fail.');
}

export const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 30000, // 30 second timeout
});

// Request interceptor to prevent API calls with undefined URLs and add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Guard: Prevent API calls if baseURL is missing
    if (!baseURL) {
      const error = new Error('[API ERROR] Cannot make API call: NEXT_PUBLIC_API_BASE_URL is undefined');
      console.error(error.message, config);
      return Promise.reject(error);
    }
    
    // Guard: Prevent API calls if URL becomes undefined
    if (!config.url) {
      const error = new Error('[API ERROR] Cannot make API call: URL is undefined');
      console.error(error.message, config);
      return Promise.reject(error);
    }
    
    // Add authorization token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Ensure Content-Type is set
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const { config, response, message, code } = error;
    
    // Handle network errors
    if (!response) {
      if (code === 'ECONNABORTED') {
        console.error('[API ERROR] Request timeout:', config?.url);
        error.message = 'Request timeout. Please check your connection and try again.';
      } else if (message === 'Network Error') {
        console.error('[API ERROR] Network error:', config?.url);
        console.error('[API ERROR] Base URL:', baseURL);
        error.message = 'Network error. Please check your internet connection and ensure the API server is running.';
      } else {
        console.error('[API ERROR] Request failed:', {
          url: config?.url,
          method: config?.method,
          message: error.message,
          code: error.code,
        });
      }
    }
    
    // Add a custom property to identify 401 errors
    if (response && response.status === 401) {
      error.isUnauthorized = true;
      // Optionally clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
      }
    }
    
    return Promise.reject(error);
  }
);
