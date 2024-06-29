import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

const initialState = {
  status: "idle",
  isOpen: false
};

export const videouploadSlice = createSlice({
  name: "videoupload",
  initialState,
  reducers: {
    videoupload: (state) => {
      return state;
    },
    setIsOpen: (state, action) => {
      state.isOpen = action.payload;
    },
    uploadVideoS3: (state, action) => {
      toast.success("Clip upload successfully.");
      state.isOpen = false;
    },
  }
});
export default videouploadSlice.reducer;
export const videouploadState = (state) => state.videoupload;
export const videouploadAction = videouploadSlice.actions;
