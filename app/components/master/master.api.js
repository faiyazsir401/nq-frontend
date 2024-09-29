import { axiosInstance } from "../../../config/axios-interceptor";

export const getMasterData = async () => {
  try {
    const response = await axiosInstance({
      method: "get",
      url: `/master/master-data`,
    });
    return response;
  } catch (error) {
    throw error;
  }
};
