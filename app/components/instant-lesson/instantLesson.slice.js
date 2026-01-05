import { createSlice } from "@reduxjs/toolkit";

// UI State Machine States
export const UI_STATES = {
  INCOMING: "incoming",
  ACCEPTING: "accepting",
  DECLINING: "declining",
  EXPIRED: "expired",
  ERROR: "error",
};

const initialState = {
  isIncoming: false,
  uiState: UI_STATES.INCOMING,
  lessonId: null,
  expiresAt: null,
  coachId: null,
  traineeInfo: null,
  lessonType: null,
  duration: null,
  requestData: null,
  errorMessage: null,
  isCountdownPaused: false,
};

export const instantLessonSlice = createSlice({
  name: "instantLesson",
  initialState,
  reducers: {
    setIncomingRequest: (state, action) => {
      state.isIncoming = true;
      state.uiState = UI_STATES.INCOMING;
      state.lessonId = action.payload.lessonId;
      state.expiresAt = action.payload.expiresAt;
      state.coachId = action.payload.coachId;
      state.traineeInfo = action.payload.traineeInfo;
      state.lessonType = action.payload.lessonType;
      state.duration = action.payload.duration;
      state.requestData = action.payload.requestData;
      state.errorMessage = null;
      state.isCountdownPaused = false;
    },
    clearIncomingRequest: (state) => {
      state.isIncoming = false;
      state.uiState = UI_STATES.INCOMING;
      state.lessonId = null;
      state.expiresAt = null;
      state.coachId = null;
      state.traineeInfo = null;
      state.lessonType = null;
      state.duration = null;
      state.requestData = null;
      state.errorMessage = null;
      state.isCountdownPaused = false;
    },
    setAccepting: (state) => {
      state.uiState = UI_STATES.ACCEPTING;
      state.isCountdownPaused = true;
    },
    setDeclining: (state) => {
      state.uiState = UI_STATES.DECLINING;
    },
    setExpired: (state) => {
      state.uiState = UI_STATES.EXPIRED;
      state.isCountdownPaused = true;
    },
    setError: (state, action) => {
      state.uiState = UI_STATES.ERROR;
      state.errorMessage = action.payload?.message || "An error occurred";
    },
    updateExpiresAt: (state, action) => {
      state.expiresAt = action.payload;
    },
    pauseCountdown: (state) => {
      state.isCountdownPaused = true;
    },
    resumeCountdown: (state) => {
      state.isCountdownPaused = false;
    },
  },
});

export default instantLessonSlice.reducer;
export const instantLessonState = (state) => state.instantLesson;
export const instantLessonAction = instantLessonSlice.actions;

