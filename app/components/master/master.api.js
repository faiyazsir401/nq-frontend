import { axiosInstance } from "../../../config/axios-interceptor";

export const getMasterData = async () => {
  console.trace('[API AUDIT] getMasterData called from:');
  try {
    const response = await axiosInstance({
      method: "get",
      url: `/master/master-data`,
    });
    return response;
  } catch (error) {
    // Enhanced error logging
    if (error.message === 'Network Error' || !error.response) {
      console.error('[MASTER API ERROR] Network error - unable to reach server:', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        message: error.message,
      });
      
      // Provide more helpful error message
      const enhancedError = new Error(
        'Unable to connect to the server. Please check your internet connection and ensure the API server is running.'
      );
      enhancedError.originalError = error;
      enhancedError.isNetworkError = true;
      throw enhancedError;
    }
    
    // Re-throw other errors as-is
    throw error;
  }
};
