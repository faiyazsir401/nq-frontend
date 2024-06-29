import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { userConcern, writeUs } from "./contact_us.api"; // Correct import statements

const initialState = {
  status: "idle",
};

export const userConcernAsync = createAsyncThunk("userConcern/post", async (payload) => {
  try {
    const response = await userConcern(payload);
    return response;
  } catch (err) {
    toast.error(err.response.data.error);
    throw err;
  }
});

export const writeUsAsync = createAsyncThunk("writeUs/post", async (payload) => {
  try {
    const response = await writeUs(payload);
    // Ensure that SuccessMsgs is defined with appropriate success messages
    console.log(response, "response");
    return response;
  } catch (err) {
    toast.error(err.response.data.error);
    throw err;
  }
});

export const contactusSlice = createSlice({
  name: "contactus",
  initialState,
  reducers: {}, // Remove unnecessary reducer
  extraReducers: (builder) => {
    builder
      .addCase(userConcernAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(userConcernAsync.fulfilled, (state, action) => {
        toast.success(action?.data?.msg);
        toast.success(action?.payload?.msg);
      })
      .addCase(userConcernAsync.rejected, (state) => {
        state.status = "rejected";
      })
      .addCase(writeUsAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(writeUsAsync.fulfilled, (state, action) => {

        state.status = "fulfilled";
        toast.success(action?.payload?.msg);
      })
      .addCase(writeUsAsync.rejected, (state) => {
        state.status = "rejected";
      });
  },
});

export default contactusSlice.reducer;
export const contactusState = (state) => state.contactus;
export const contactusAction = contactusSlice.actions;
