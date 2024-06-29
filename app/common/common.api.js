import { axiosInstance } from "../../config/axios-interceptor";
import { Utils } from "../../utils/utils";
import { LOCAL_STORAGE_KEYS } from "./constants";

export const checkSlot = async (payload) => {
  try {
    const response = await axiosInstance({
      url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/trainee/check-slot`,
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
    throw err;
  }
};
