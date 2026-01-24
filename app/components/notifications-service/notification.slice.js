import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { getNotifications, updateNotifications } from "./notification.api";

const initialState = {
  status: "idle",
  isLoading : false,
  notifications: [],
  hasMoreNotifications: true, // Track if there are more notifications to load
  totalCount: 0,
  currentPage: 1
};

export const getAllNotifications = createAsyncThunk("get/notifications", async (payload) => {
  try {
    const response = await getNotifications(payload);
    return response;
  } catch (err) {
    if (!err.isUnauthorized) {
      toast.error(err.response.data.error);
    }
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
      if (!err.isUnauthorized) {
        toast.error(err.response.data.error);
      }
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
        state.isLoading = false;
        
        const newNotifications = action.payload?.data || [];
        const append = action.meta?.arg?.append || false;
        const limit = action.meta?.arg?.limit || 20;
        
        if (append) {
          // Append new notifications to existing ones (for infinite scroll)
          // Filter out duplicates based on _id
          const existingIds = new Set(state.notifications.map(n => n._id));
          const uniqueNewNotifications = newNotifications.filter(n => !existingIds.has(n._id));
          state.notifications = [...state.notifications, ...uniqueNewNotifications];
        } else {
          // Replace notifications (for initial load or refresh)
          state.notifications = newNotifications;
          state.currentPage = 1;
        }
        
        // Check if there are more notifications to load
        // If we got fewer notifications than the limit, we've reached the end
        state.hasMoreNotifications = newNotifications.length >= limit;
        state.totalCount = action.payload?.totalCount || state.notifications.length;
        
        // Update current page
        if (append) {
          state.currentPage = action.meta?.arg?.page || state.currentPage;
        } else {
          state.currentPage = 1;
        }
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
