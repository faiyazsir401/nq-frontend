import { axiosInstance } from "../../../config/axios-interceptor";

export const getMasterData = async () => {
  console.trace('[API AUDIT] getMasterData called from:');
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
