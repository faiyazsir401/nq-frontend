import { axiosInstance } from "../../../config/axios-interceptor";

export const updateDrawing = async (payload) => {
  try {
    const response = await axiosInstance({
      method: "put",
      url: `/trainer/drawing`,
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

export const updateProfile = async (payload) => {
  try {
    const response = await axiosInstance({
      method: "put",
      url: `/trainer/profile`,
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
export const getTrainers = async () => {
  try {
    const response = await axiosInstance({
      method: "get",
      url: `/trainer/get-trainers`,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const settelReqestToBankAccount = async (payload) => {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/trainer/create-money-request`,
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


export const getAllTrainers = async () => {
  console.trace('[API AUDIT] getAllTrainers (top-trainers) called from:');
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/trainer/top-trainers`,
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};
