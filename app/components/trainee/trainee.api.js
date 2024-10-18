import { axiosInstance } from "../../../config/axios-interceptor";

import {fetchPeerConfig} from "../../../api/index"

export const fetchTraineeWithSlots = async (params) => {
  try {
    const response = await axiosInstance({
      method: "get",
      url: `/trainee/get-trainers-with-slots`,
      params,
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


export const bookSession = async (payload) => {
  try {
    const iceServerResponse = await fetchPeerConfig();
    payload.iceServers = iceServerResponse.data.formattedIceServers;
    const response = await axiosInstance({
      method: "post",
      url: `/trainee/book-session`,
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


export const createPaymentIntent = async (payload) => {
  try {
    const response = await axiosInstance({
      method: "post",
      url: `/transaction/create-payment-intent`,
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


export const updateProfile = async (payload) => {
  try {
    const response = await axiosInstance({
      method: "put",
      url: `/trainee/profile`,
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
