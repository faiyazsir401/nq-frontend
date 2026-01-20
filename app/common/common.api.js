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
    
    return response.data;
  } catch (err) {
    if (!err.isUnauthorized) {
      toast.error(err.response.data.error);
    }
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
    
    return response.data;
  } catch (err) {
    if (!err.isUnauthorized) {
      toast.error(err.response.data.error);
    }
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
    
    return response.data;
  } catch (err) {
    if (!err.isUnauthorized) {
      toast.error(err.response.data.error);
    }
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
    
    return response.data;
  } catch (err) {
    if (!err.isUnauthorized) {
      toast.error(err.response.data.error);
    }
    throw err;
  }
};

export const cancelFriendRequest = async (payload) => {
  try {
    const response = await axiosInstance({
      url: `/user/cancel-friend-request`,
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
    
    return response.data;
  } catch (err) {
    if (!err.isUnauthorized) {
      toast.error(err.response.data.error);
    }
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
    
    return response.data;
  } catch (err) {
    if (!err.isUnauthorized) {
      toast.error(err.response.data.error);
    }
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
    
    return response.data;
  } catch (err) {
    if (!err.isUnauthorized) {
      toast.error(err.response.data.error);
    }
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
    
    return response.data;
  } catch (err) {
    if (!err.isUnauthorized) {
      toast.error(err.response.data.error);
    }
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
    
    return response.data;
  } catch (err) {
    if (!err.isUnauthorized) {
      toast.error(err.response.data.error);
    }
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
    
    return response.data;
  } catch (err) {
    throw err;
  }
};


export const updateNotificationSettings = async (payload) => {
  try {
    const response = await axiosInstance({
      url: `/user/update-notifications-settings`,
      method: "patch",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${Utils.getToken(
          LOCAL_STORAGE_KEYS.ACCESS_TOKEN
        )}`,
      },
      data: payload,
    });
    
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const updateExtendedSessionTime = async (payload) => {
  try {
    // Validate payload before making request
    if (!payload || !payload.sessionId) {
      throw new Error("Invalid payload: sessionId is required");
    }

    const response = await axiosInstance({
      url: `/common/extend-session-end-time`,
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
    
    return response.data;
  } catch (err) {
    // Log error for debugging
    console.error("Error updating extended session time:", err);
    // Re-throw with more context if needed
    if (err.response) {
      // Server responded with error status
      throw new Error(err.response.data?.message || err.response.data?.error || "Failed to extend session time");
    } else if (err.request) {
      // Request was made but no response received
      throw new Error("Network error: Unable to connect to server");
    } else {
      // Something else happened
      throw err;
    }
  }
};




