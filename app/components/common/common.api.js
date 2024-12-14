import axios from "axios";
import { axiosInstance } from "../../../config/axios-interceptor";
import { convertTimesForDataArray, Utils } from "../../../utils/utils";
import { LOCAL_STORAGE_KEYS } from "../../common/constants";
import store from "../../store";

export const addRating = async (payload) => {
  try {
    const res = await axiosInstance({
      method: "put",
      url: `/user/rating`,
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
      url: `/user/scheduled-meetings`,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${Utils.getToken(
          LOCAL_STORAGE_KEYS.ACCESS_TOKEN
        )}`,
      },
      params: payload,
    });
    console.log("getScheduledMeetingDetails1", response.data);

    let filteredData = response.data.data;

    // Convert times for the filtered data
    filteredData = convertTimesForDataArray(filteredData);

    // Iterate through the data and update statuses if needed
    filteredData = filteredData.map((item, index) => {
      if (item.status === "booked" || item.status === "confirmed") {
        const availabilityInfo = Utils.meetingAvailability(
          item.booked_date,
          item.session_start_time,
          item.session_end_time,
          item.time_zone, // Assuming `userTimeZone` is `item.time_zone`
          item.start_time,
          item.end_time
        );
        const { has24HoursPassedSinceBooking } = availabilityInfo;

        const accountType = store.getState().auth.accountType;

        const isMeetingCompleted = (detail) => {
          return (
            detail &&
            detail.ratings &&
            detail.ratings[accountType.toLowerCase()] &&
            detail.ratings[accountType.toLowerCase()].sessionRating
          );
        };

        // Check if the meeting is done, and if so, update its status to completed
        if (isMeetingCompleted(item) || has24HoursPassedSinceBooking) {
          item.status = "completed"; // Update the status to completed
        }
      }
      return item;
    });

    // Filter based on the status provided in payload
    if (payload?.status === "upcoming") {
      filteredData = filteredData.filter(
        (item) => item.status === "booked" || item.status === "confirmed"
      );
    } else if (payload?.status === "canceled") {
      filteredData = filteredData.filter((item) => item.status === "canceled");
    } else if (payload?.status === "completed") {
      filteredData = filteredData.filter((item) => item.status === "completed");
    }

    console.log("convertTimesForDataArray", filteredData);
    return { ...response.data, data: filteredData };
  } catch (error) {
    console.log("getScheduledMeetingDetailsError", error);
    throw error;
  }
};

export const updateBookedSessionScheduledMeeting = async (payload) => {
  try {
    const response = await axiosInstance({
      method: "put",
      url: `/user/update-booked-session/${payload.id}`,
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
      url: `/common/upload`,
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
      url: `/user/add-trainee-clip/${payload.id}`,
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
      url: `/user/create-verification-session`,
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
      url: `/user/stripe-account-verification`,
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
      url: `/common/update-profile-picture`,
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
