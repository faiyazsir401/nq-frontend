import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { getNotifications, updateNotifications } from "./notification.api";

const initialState = {
  status: "idle",
  isLoading : false,
  notifications: []
};

export const getAllNotifications = createAsyncThunk("get/notifications", async (payload) => {
  try {
    const response = await getNotifications(payload);
    return response;
  } catch (err) {
    toast.error(err.response.data.error);
    throw err;
  }
});

export const updateNotificationsStatus = createAsyncThunk(
  "patch/updateNotificationsStatus",
  async (payload) => {
    try {
      const res = await updateNotifications(payload);
      return res;
    } catch (err) {
      toast.error(err.response.data.error);
      throw err;
    }
  }
);

export const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    notification: (state) => {
      return state;
    },
    addNotification: (state , action) =>{
      state.notifications.push(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllNotifications.pending, (state, action) => {
        state.status = "pending";
        state.isLoading = true;
      })
      .addCase(getAllNotifications.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.notifications = action.payload.data;
        state.isLoading = false;
      })
      .addCase(getAllNotifications.rejected, (state, action) => {
        state.status = "rejected";
        state.isLoading = false;
      })
      .addCase(updateNotificationsStatus.pending, (state, action) => {
        state.status = "pending";
      })
      .addCase(updateNotificationsStatus.fulfilled, (state, action) => {
        state.status = "fulfilled";
      })
      .addCase(updateNotificationsStatus.rejected, (state, action) => {
        state.status = "rejected";
      });
  },
});

export default notificationSlice.reducer;
export const notificationState = (state) => state.notification;
export const notificationAction = notificationSlice.actions;
