import { axiosInstance } from "../../config/axios-interceptor";

export const myClips = async (payload) => {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/common/get-clips`,
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
export const deleteClip = async(payload) => {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/common/delete-clip/${payload.id}`,
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
export const deleteSavedSession = async(payload) => {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/common/delete-saved-session/${payload.id}`,
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

export const traineeClips = async (payload) => {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/common/trainee-clips`,
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

export const reports = async (payload) => {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/report/get-all`,
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
export const deleteReports = async (payload) => {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/report/delete-report/${payload.id}`,
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



export const shareClips = async (payload) => {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/user/share-clips`,
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



