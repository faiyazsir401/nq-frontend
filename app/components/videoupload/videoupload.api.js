import { axiosInstance } from "../../../config/axios-interceptor";

export const getS3SignUrl = async (payload) => {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/common/video-upload-url`,
      data: payload,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (err) {
    console.error("error while posting video clip ", err);
  }
};
export const getSaveSessionS3SignUrl = async (payload) => {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/common/saved-sessions-upload-url`,
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
      url: `/common/get-all-saved-sessions`,
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
      url: `/report/add-image`,
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
      url: `/report/get`,
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
      url: `/report/remove-image`,
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
      url: `/report/crop-image`,
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
      url: `/report`,
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