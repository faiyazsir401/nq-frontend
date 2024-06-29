import { axiosInstance } from "../../../config/axios-interceptor";

export const getMasterData = async () => {
  try {
    const response = await axiosInstance({
      method: "get",
      url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/master-data`,
    });
    return response;
  } catch (error) {
    throw error;
  }
};
