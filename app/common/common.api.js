import { toast } from "react-toastify";
import { axiosInstance } from "../../config/axios-interceptor";
import { Utils } from "../../utils/utils";
import { LOCAL_STORAGE_KEYS } from "./constants";

export const checkSlot = async (payload) => {
  try {
    const response = await axiosInstance({
      url: `/trainee/check-slot`,
      method: "post",
      data: payload,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${Utils.getToken(
          LOCAL_STORAGE_KEYS.ACCESS_TOKEN
        )}`,
      },
    });
    console.log("response", response.data);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const getAllUsers = async (payload) => {
  try {
    const response = await axiosInstance({
      url: `/user/get-all-users?search=${payload.search}`,
      method: "get",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${Utils.getToken(
          LOCAL_STORAGE_KEYS.ACCESS_TOKEN
        )}`,
      },
    });
    console.log("response", response.data);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const sendFriendRequest = async (payload) => {
  try {
    const response = await axiosInstance({
      url: `/user/send-friend-request`,
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${Utils.getToken(
          LOCAL_STORAGE_KEYS.ACCESS_TOKEN
        )}`,
      },
      data: payload,
    });
    console.log("response", response.data);
    return response.data;
  } catch (err) {
    toast.error(err.response.data.error);
    throw err;
  }
};

export const acceptFriendRequest = async (payload) => {
  try {
    const response = await axiosInstance({
      url: `/user/accept-friend-request`,
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${Utils.getToken(
          LOCAL_STORAGE_KEYS.ACCESS_TOKEN
        )}`,
      },
      data: payload,
    });
    console.log("response", response.data);
    return response.data;
  } catch (err) {
    toast.error(err.response.data.error);
    throw err;
  }
};

export const rejectFriendRequest = async (payload) => {
  try {
    const response = await axiosInstance({
      url: `/user/reject-friend-request`,
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${Utils.getToken(
          LOCAL_STORAGE_KEYS.ACCESS_TOKEN
        )}`,
      },
      data: payload,
    });
    console.log("response", response.data);
    return response.data;
  } catch (err) {
    toast.error(err.response.data.error);
    throw err;
  }
};

export const getFriendRequests = async () => {
  try {
    const response = await axiosInstance({
      url: `/user/friend-requests`,
      method: "get",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${Utils.getToken(
          LOCAL_STORAGE_KEYS.ACCESS_TOKEN
        )}`,
      },
    });
    console.log("response", response.data);
    return response.data;
  } catch (err) {
    toast.error(err.response.data.error);
    throw err;
  }
};

export const getFriends = async () => {
  try {
    const response = await axiosInstance({
      url: `/user/friends`,
      method: "get",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${Utils.getToken(
          LOCAL_STORAGE_KEYS.ACCESS_TOKEN
        )}`,
      },
    });
    console.log("response", response.data);
    return response.data;
  } catch (err) {
    toast.error(err.response.data.error);
    throw err;
  }
};

export const removeFriend = async (payload) => {
  try {
    const response = await axiosInstance({
      url: `/user/remove-friend`,
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${Utils.getToken(
          LOCAL_STORAGE_KEYS.ACCESS_TOKEN
        )}`,
      },
      data: payload,
    });
    console.log("response", response.data);
    return response.data;
  } catch (err) {
    toast.error(err.response.data.error);
    throw err;
  }
};


export const updateAccountPrivacy = async (payload) => {
  try {
    const response = await axiosInstance({
      url: `/user/update-account-privacy`,
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${Utils.getToken(
          LOCAL_STORAGE_KEYS.ACCESS_TOKEN
        )}`,
      },
      data: payload,
    });
    console.log("response", response.data);
    return response.data;
  } catch (err) {
    throw err;
  }
};



