import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const { config, response } = error;
    return Promise.reject(error);
  }
);
