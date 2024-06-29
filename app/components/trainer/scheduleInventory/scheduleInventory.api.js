import { Utils } from "../../../../utils/utils";
import { axiosInstance } from "../../../../config/axios-interceptor";

export const getScheduleInventoryData = async () => {
  try {
    const response = await axiosInstance({
      method: "get",
      url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/trainer/get-slots`,
      headers: { Authorization: `Bearer ${Utils.getToken()}` },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateSchedulingSlots = async (payload) => {
  try {
    const res = await axiosInstance({
      method: "post",
      data: payload,
      url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/trainer/update-slots`,
      headers: { Authorization: `Bearer ${Utils.getToken()}` },
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};
