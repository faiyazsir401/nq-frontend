import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getScheduleInventoryData,
  updateSchedulingSlots,
} from "./scheduleInventory.api";
import { toast } from "react-toastify";

const scheduleInventoryData = [
  {
    day: "monday",
    slots: [{ start_time: "", end_time: "" }],
  },
  {
    day: "tuesday",
    slots: [{ start_time: "", end_time: "" }],
  },
  {
    day: "wednesday",
    slots: [{ start_time: "", end_time: "" }],
  },
  {
    day: "thursday",
    slots: [{ start_time: "", end_time: "" }],
  },
  {
    day: "friday",
    slots: [{ start_time: "", end_time: "" }],
  },
 
];


const initialState = {
  status: "pending",
  scheduleInventoryData: [],
};

export const getScheduleInventoryDataAsync = createAsyncThunk(
  "scheduleInventory/get",
  async () => {
    try {
      const response = await getScheduleInventoryData();
      return response;
    } catch (err) {
      throw err;
    }
  }
);

export const updateScheduleInventoryAsync = createAsyncThunk(
  "scheduleInventory/update",
  async (payload) => {
    try {
      const res = await updateSchedulingSlots(payload);
      return res;
    } catch (err) {
      throw err;
    }
  }
);

export const scheduleInventorySlice = createSlice({
  name: "scheduleInventory",
  initialState,
  reducers: {
    scheduleInventory: (state) => {
      return state;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getScheduleInventoryDataAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(getScheduleInventoryDataAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        if (
          action.payload &&
          action.payload.data &&
          action.payload.data.data &&
          action.payload.data.data.available_slots &&
          action.payload.data.data.available_slots.length
        ) {
          const availableSlots = action.payload.data.data.available_slots;
          availableSlots.forEach(({ slots }) => {
            if (!(slots && slots.length)) {
              slots.push({ start_time: "", end_time: "" });
            }
          });
          state.scheduleInventoryData = availableSlots;
        } else {
          state.scheduleInventoryData = scheduleInventoryData;
        }
      })
      .addCase(getScheduleInventoryDataAsync.rejected, (state) => {
        state.status = "rejected";
      })
      .addCase(updateScheduleInventoryAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(updateScheduleInventoryAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        toast.success(action.payload.data.message);
      })
      .addCase(updateScheduleInventoryAsync.rejected, (state, action) => {
        state.status = "rejected";
        toast.error(action.payload.data.message);
      });
  },
});

export default scheduleInventorySlice.reducer;
export const scheduleInventoryState = (state) => state.scheduleInventory;
export const scheduleInventoryAction = scheduleInventorySlice.actions;
