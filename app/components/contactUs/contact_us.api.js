import { axiosInstance } from "../../../config/axios-interceptor";

export const userConcern = async (payload) => {
  try {
    const res = await axiosInstance({
      method: "post",
      url: `/user/raise-concern`,
      data: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const writeUs = async (payload) => {
  try {
    const res = await axiosInstance({
      method: "post",
      url: `/user/write-us`,
      data: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};







