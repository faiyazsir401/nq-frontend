import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Defensive guard: Log error if baseURL is missing
if (!baseURL) {
  console.error('[API ERROR] NEXT_PUBLIC_API_BASE_URL is undefined. API calls will fail.');
}

export const axiosInstance = axios.create({
  baseURL: baseURL,
});

// Request interceptor to prevent API calls with undefined URLs
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
    const { config, response } = error;
    
    // Add a custom property to identify 401 errors
    if (response && response.status === 401) {
      error.isUnauthorized = true;
    }
    
    return Promise.reject(error);
  }
);
