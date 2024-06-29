import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getTransactionSliceData } from "./transaction.api";

export const initialState = {
  status: "pending",
  transactionData: [],
};

export const getTransactionDataAsync = createAsyncThunk("transaction/get", async () => {
  try {
    const response = await getTransactionSliceData();
    return response;
  } catch (err) {
    throw err;
  }
});

export const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    transaction: (state) => {
      return state;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTransactionDataAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(getTransactionDataAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        if (action?.payload?.data?.data?.result?.length) {
          state.transactionData = action.payload.data.data.result;
        } else {
          state.transactionData = [];
        }
      });
  },
});

export default transactionSlice.reducer;
export const transactionState = (state) => state.transaction;
export const transactionAction = transactionSlice.actions;
