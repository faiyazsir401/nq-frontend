import axios from "axios";
import { axiosInstance } from "../../../config/axios-interceptor";
import { Utils } from "../../../utils/utils";
import { LOCAL_STORAGE_KEYS } from "../../common/constants";

export const addRating = async (payload) => {
  try {
    const res = await axiosInstance({
      method: "put",
      url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/rating`,
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

export const getScheduledMeetingDetails = async (payload) => {
  try {
    const response = await axiosInstance({
      method: "get",
      url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/scheduled-meetings`,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${Utils.getToken(
          LOCAL_STORAGE_KEYS.ACCESS_TOKEN
        )}`,
      },
      params: payload,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateBookedSessionScheduledMeeting = async (payload) => {
  try {
    const response = await axiosInstance({
      method: "put",
      url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/update-booked-session/${payload.id}`,
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

export const uploadProfilePicture = async (payload) => {
  try {
    const formData = new FormData();
    formData.append("files", payload.files);
    const response = await axiosInstance({
      url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/common/upload`,
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
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

export const addTraineeClipInBookedSession = async (payload) => {
  try {
    const response = await axiosInstance({
      method: "put",
      url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/add-trainee-clip/${payload.id}`,
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

export const createVarificationSession = async (payload) => {
  try {
    const res = await axiosInstance({
      method: "PUT",
      url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/create-verification-session`,
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

export const createStripeVarificationUrl = async (payload) => {
  try {
    const res = await axiosInstance({
      method: "PUT",
      url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/stripe-account-verification`,
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

export const getS3SignUrlForProfile = async (payload) => {
  try {
    const response = await axiosInstance({
      method: "PUT",
      url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/common/update-profile-picture`,
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

export const generateThumbnailURL = async (payload) => {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `https://6d3e-59-99-53-84.ngrok-free.app/common/generate-thumbnail`,
      data: payload,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export async function pushProfilePhotoToS3(
  presignedUrl,
  uploadPhoto,
  setProgress,
  cb
) {
  const myHeaders = new Headers({
    "Content-Type": "image/*",
    "Content-Disposition": "inline",
  });
  axios
    .put(presignedUrl, uploadPhoto, {
      headers: myHeaders,
      onUploadProgress: (progressEvent) => {
        const { loaded, total } = progressEvent;
        const percentCompleted = (loaded / total) * 100;
        setProgress(
          Math.trunc(percentCompleted === 100 ? 0 : percentCompleted)
        );
      },
    })
    .then((response) => {
      cb();
    })
    .catch((error) => {
      console.error("Error:", error);

      if (error.response) {
        console.error("Response data:", error.response.data);
      }
    });
}
