import { getMasterData } from "../master/master.api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const initialState = {
  status: "pending",
  masterData: null,
};

export const getMasterDataAsync = createAsyncThunk("master/get", async () => {
  try {
    const response = await getMasterData();
    return response;
  } catch (err) {
    throw err;
  }
});

export const masterSlice = createSlice({
  name: "master",
  initialState,
  reducers: {
    master: (state) => {
      return state;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMasterDataAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(getMasterDataAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        if (
          action.payload &&
          action.payload.data &&
          action.payload.data.data &&
          action.payload.data.data.length
        ) {
          state.masterData = action.payload.data.data[0];
        } else {
          state.masterData = null;
        }
      });
  },
});

export default masterSlice.reducer;
export const masterState = (state) => state;
export const masterAction = masterSlice.actions;
