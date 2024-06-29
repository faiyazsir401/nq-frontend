import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getTrainers, updateDrawing, updateProfile } from "./trainer.api";
import { toast } from "react-toastify";
import { getMeAsync } from "../auth/auth.slice";

const initialState = {
  status: "idle",
  trainersList: [],
  selectedTrainerInfo: null
};

export const updateDrawingAsync = createAsyncThunk(
  "update/drawing",
  async (payload) => {
    try {
      const response = await updateDrawing(payload);
      return response;
    } catch (err) {
      toast.error(err.response.data.error);
      throw err;
    }
  }
);

//update Profile
export const updateProfileAsync = createAsyncThunk(
  "update/profile",
  async (payload, { dispatch }) => {
    try {
      const response = await updateProfile(payload);
      dispatch(getMeAsync());
      return response;
    } catch (err) {
      toast.error(err.response.data.error);
      throw err;
    }
  }
);

export const getTrainersAsync = createAsyncThunk("get/trainers", async () => {
  try {
    const response = await getTrainers();
    return response;
  } catch (err) {
    toast.error(err.response.data.error);
    throw err;
  }
});

export const trainerSlice = createSlice({
  name: "trainer",
  initialState,
  reducers: {
    trainer: (state) => {
      return state;
    },
    setSelectedTrainerInfo: (state, action) => {
      state.selectedTrainerInfo = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateDrawingAsync.pending, (state, action) => {
        state.status = "pending";
      })
      .addCase(updateDrawingAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
      })
      .addCase(updateDrawingAsync.rejected, (state, action) => {
        state.status = "rejected";
      })
      .addCase(updateProfileAsync.pending, (state, action) => {
        state.status = "pending";
      })
      .addCase(updateProfileAsync.fulfilled, (state, action) => {
        toast.success(action.payload.data.message);
        state.status = "fulfilled";
      })
      .addCase(updateProfileAsync.rejected, (state, action) => {
        state.status = "rejected";
      })
      .addCase(getTrainersAsync.pending, (state, action) => {
        state.status = "pending";
      })
      .addCase(getTrainersAsync.fulfilled, (state, action) => {
        state.trainersList = action.payload.data;
        state.status = "fulfilled";
      })
      .addCase(getTrainersAsync.rejected, (state, action) => {
        state.status = "rejected";
      });
  },
});
export default trainerSlice.reducer;
export const trainerState = (state) => state.trainer;
export const trainerAction = trainerSlice.actions;
