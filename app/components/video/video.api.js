import { axiosInstance } from "../../../config/axios-interceptor";

export const getS3SignPdfUrl = async (payload) => {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/common/pdf-upload-url`,
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


