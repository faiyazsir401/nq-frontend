import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addRating,
  addTraineeClipInBookedSession,
  getScheduledMeetingDetails,
  updateBookedSessionScheduledMeeting,
  uploadProfilePicture,
} from "./common.api";
import { toast } from "react-toastify";

const initialState = {
  status: "idle",
  scheduledMeetingDetails: [],
  addRatingModel: { _id: null, isOpen: false },
  profile_picture: null,
  isLoading: true,
  selectedTrainerId: null,
  profile_image_url: null,
  configs: {
    sidebar: {
      isToggleEnable: false,
      isMobileMode: false,
    },
  },
  activeTab: "",
  sidebarTab: "",
  isMeetingLoading : false,
};

export const addRatingAsync = createAsyncThunk(
  "add/rating",
  async (payload) => {
    try {
      const res = await addRating(payload);
      return res;
    } catch (err) {
      console.log(`rre `, err);
      toast.error(err.response.data.error);
      throw err;
    }
  }
);

export const updateBookedSessionScheduledMeetingAsync = createAsyncThunk(
  "update/booked/session",
  async (payload, { dispatch }) => {
    const { status, updatePayload } = payload;
    const statusPayload = {
      status,
    };
    try {
      const response = await updateBookedSessionScheduledMeeting(updatePayload);
      dispatch(getScheduledMeetingDetailsAsync(statusPayload));
      //TODO:update redux state not calling get api
      return response;
    } catch (err) {
      toast.error(err.response.data.error);
      throw err;
    }
  }
);


export const addTraineeClipInBookedSessionAsync = createAsyncThunk(
  "add/clip/booked/session",
  async (payload, { dispatch }) => {
    try {
      const response = await addTraineeClipInBookedSession(payload);
      return response;
    } catch (err) {
      toast.error(err.response.data.error);
      throw err;
    }
  }
);

export const getScheduledMeetingDetailsAsync = createAsyncThunk(
  "get/scheduled/meetings",
  async (payload) => {
    try {
      const response = await getScheduledMeetingDetails(payload);
      return response;
    } catch (err) {
      toast.error(err.response.data.error);
      throw err;
    }
  }
);

export const uploadProfilePictureAsync = createAsyncThunk(
  "add/profile_picture",
  async (payload) => {
    try {
      const response = await uploadProfilePicture(payload);
      return response;
    } catch (err) {
      toast.error(err.response.data.error);
      throw err;
    }
  }
);

export const bookingsSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    bookings: (state) => {
      return state;
    },
    addRating: (state, action) => {
      state.addRatingModel = action.payload;
    },
    removeProfilePicture: (state, action) => {
      state.profile_picture = action.payload;
    },
    handleLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    handleSelectedTrainer: (state, action) => {
      state.selectedTrainerId = action.payload;
    },
    removeProfileImageUrl: (state, action) => {
      state.profile_image_url = action.payload;
    },
    isMobileFriendly: (state, action) => {
      state.configs.sidebar = {
        ...state.configs.sidebar,
        isMobileMode: action.payload,
      };
    },
    isSidebarToggleEnabled: (state, action) => {
      state.configs.sidebar = {
        ...state.configs.sidebar,
        isToggleEnable: action.payload,
      };
    },
    handleActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    handleSidebarTabClose: (state, action) => {
      state.sidebarTab = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getScheduledMeetingDetailsAsync.pending, (state) => {
        state.status = "pending";
        state.isMeetingLoading = true;
      })
      .addCase(getScheduledMeetingDetailsAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.isMeetingLoading = false;
        state.scheduledMeetingDetails = action.payload.data;
      })
      .addCase(getScheduledMeetingDetailsAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.isMeetingLoading = false;
      })
      .addCase(
        updateBookedSessionScheduledMeetingAsync.pending,
        (state, action) => {
          state.status = "pending";
        }
      )
      .addCase(
        updateBookedSessionScheduledMeetingAsync.fulfilled,
        (state, action) => {
          state.status = "fulfilled";
          toast.success(action.payload.message);
        }
      )
      .addCase(
        updateBookedSessionScheduledMeetingAsync.rejected,
        (state, action) => {
          state.status = "rejected";
        }
      )
      .addCase(
        addTraineeClipInBookedSessionAsync.pending,
        (state, action) => {
          state.status = "pending";
        }
      )
      .addCase(
        addTraineeClipInBookedSessionAsync.fulfilled,
        (state, action) => {
          state.status = "fulfilled";
          toast.success(action.payload.message);
        }
      )
      .addCase(
        addTraineeClipInBookedSessionAsync.rejected,
        (state, action) => {
          state.status = "rejected";
        }
      )
      .addCase(addRatingAsync.pending, (state, action) => {
        state.status = "pending";
      })
      .addCase(addRatingAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.addRatingModel = { _id: null, isOpen: false };
        toast.success(action.payload.message, { type: "success" });
      })
      .addCase(addRatingAsync.rejected, (state, action) => {
        state.status = "rejected";
      })
      .addCase(uploadProfilePictureAsync.pending, (state, action) => {
        state.status = "pending";
      })
      .addCase(uploadProfilePictureAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.profile_picture = action.payload.url;
        state.profile_image_url = action.payload.url;
      })
      .addCase(uploadProfilePictureAsync.rejected, (state, action) => {
        state.status = "rejected";
      });
  },
});

export default bookingsSlice.reducer;
export const bookingsState = (state) => state.bookings;
export const bookingsAction = bookingsSlice.actions;
