import { axiosInstance } from "../../../config/axios-interceptor";

export const postSubscription = async (payload) => {
    try {
      const response = await axiosInstance({
        method: "POST",
        url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/subscription`,
        data: payload,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (err) {
      throw err;
    }
};
export const getNotifications = async (payload) => {
    try {
      const response = await axiosInstance({
        method: "GET",
        url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications?page=${payload?.page}&&limit=${payload?.limit}`,
        headers: {
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (err) {
      throw err;
    }
};
export const updateNotifications = async (payload) => {
    try {
      const response = await axiosInstance({
        method: "PATCH",
        url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/update`,
        data: payload,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (err) {
      throw err;
    }
};