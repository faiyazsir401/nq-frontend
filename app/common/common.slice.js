import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { checkSlot } from "./common.api";
import { toast } from "react-toastify";
import { myClips } from "../../containers/rightSidebar/fileSection.api";

const initialState = {
  status: "idle",
  isSlotAvailable: null,
  session_durations: { from: "", to: "" },
  availableSlots: [],
  clips: [],
  slots:[]
};

export const checkSlotAsync = createAsyncThunk("checkSlot", async (payload) => {
  try {
    const response = await checkSlot(payload);
    return response;
  } catch (err) {
    toast.error(err.response.data.error);
    throw err;
  }
});


export const getClipsAsync = createAsyncThunk(
  "get/clips",
  async (payload) => {
    try {
      const response = await myClips(payload);
      return response;
    } catch (err) {
      toast.error(err.response.data.error);
      throw err;
    }
  }
);

export const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {
    common: (state) => {
      return state;
    },
    handleTrainerAvailable: (state, action) => {
      state.isSlotAvailable = action.payload;
    },
    setSlots: (state , action) =>{
      state.slots = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkSlotAsync.pending, (state, action) => {
        state.status = "pending";
      })
      .addCase(checkSlotAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.isSlotAvailable = action.payload.data.isAvailable;
        const revamped = action.payload.data.result.map((item) => {
          const { session_start_time, session_end_time } = item;
          return {
            start_time: session_start_time,
            end_time: session_end_time,
          };
        });
        state.availableSlots = revamped;
        action.payload.data.result.map((session) => {
          const { session_end_time, session_start_time } = session;
          state.session_durations = {
            from: session_start_time,
            to: session_end_time,
          };
        });
      })
      .addCase(checkSlotAsync.rejected, (state, action) => {
        state.status = "rejected";
      })
      .addCase(getClipsAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(getClipsAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        let temp = action.payload.data;
        temp = temp?.map((clp) => {
          return { ...clp, show: true };
        });
        state.clips = temp;
      })
      .addCase(getClipsAsync.rejected, (state, action) => {
        state.status = "rejected";
      });
  },
});
export default commonSlice.reducer;
export const commonState = (state) => state.common;
export const commonAction = commonSlice.actions;
