import { axiosInstance } from "../../../config/axios-interceptor";

export const getAvailability = async (payload) => {
  try {
    const res = await axiosInstance({
      method: "post",
      url: `/trainer/get-availability`,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      data: JSON.stringify(payload),
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const addTrainerSlot = async (payload) => {
  try {
    const res = await axiosInstance({
      method: "post",
      url: `/trainer/add-slot`,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      data: JSON.stringify(payload),
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const deleteTrainerSlot = async (payload) => {
  try {
    const res = await axiosInstance({
      method: "post",
      url: `/trainer/delete-slot`,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      data: JSON.stringify(payload),
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const updateTrainerSlot = async (payload) => {
  try {
    const res = await axiosInstance({
      method: "post",
      url: `/trainer/update-slot`,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      data: JSON.stringify(payload),
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};