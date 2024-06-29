import { axiosInstance } from "../../../config/axios-interceptor";

export const getS3SignUrl = async (payload) => {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/common/video-upload-url`,
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
export const getSaveSessionS3SignUrl = async (payload) => {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/common/saved-sessions-upload-url`,
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

export const getAllSavedSessions = async () => {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/common/get-all-saved-sessions`,
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
}

export const screenShotTake = async (payload) => {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/report/add-image`,
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



export const getReport = async (payload) => {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/report/get`,
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


export const removeImage = async (payload) => {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/report/remove-image`,
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


export const cropImage = async (payload) => {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/report/crop-image`,
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



export const createReport = async (payload) => {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/report`,
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