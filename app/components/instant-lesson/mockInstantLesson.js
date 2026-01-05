/**
 * Mock utility for testing instant lesson requests
 * 
 * Usage in browser console:
 * 1. Get socket from window: const socket = window.__socket__;
 * 2. Call: mockInstantLessonRequest(socket, { coachId: 'your_coach_id', traineeName: 'John Doe', duration: 30 });
 */

import { EVENTS } from "../../../helpers/events";

/**
 * Mock function to simulate an instant lesson request
 * @param {Object} socket - Socket.io client instance
 * @param {Object} payload - Request payload
 * @param {string} payload.coachId - ID of the coach to receive the request
 * @param {string} payload.traineeName - Name of the trainee making the request
 * @param {number} payload.duration - Duration in minutes (default: 30)
 * @param {string} payload.lessonId - Optional lesson ID (auto-generated if not provided)
 * @param {Object} payload.traineeInfo - Optional full trainee info object
 */
export const mockInstantLessonRequest = (socket, payload = {}) => {
  if (!socket) {
    console.error("Socket not available. Make sure SocketProvider is initialized.");
    return;
  }

  if (!payload.coachId) {
    console.error("coachId is required in payload");
    return;
  }

  const defaultDuration = payload.duration || 30;
  const expiresAt = payload.expiresAt 
    ? new Date(payload.expiresAt).toISOString()
    : new Date(Date.now() + defaultDuration * 1000).toISOString();

  const mockPayload = {
    lessonId: payload.lessonId || `lesson_${Date.now()}`,
    coachId: payload.coachId,
    traineeInfo: payload.traineeInfo || {
      _id: payload.traineeId || `trainee_${Date.now()}`,
      fullname: payload.traineeName || "Test Student",
      fullName: payload.traineeName || "Test Student",
      profile_picture: payload.profilePicture || null,
    },
    lessonType: payload.lessonType || `Instant Lesson - ${defaultDuration} Minutes`,
    duration: defaultDuration,
    expiresAt,
    ...payload,
  };

  // Emit mock event
  socket.emit(EVENTS.INSTANT_LESSON.REQUEST, mockPayload);
  console.log("✅ Mock instant lesson request sent:", mockPayload);
  return mockPayload;
};

/**
 * Helper to set up mock function globally for easy testing
 * Call this after socket is initialized
 */
export const setupMockInstantLesson = (socket) => {
  if (typeof window !== "undefined") {
    window.mockInstantLessonRequest = (payload) => mockInstantLessonRequest(socket, payload);
    window.__socket__ = socket; // Also expose socket for direct access
    
    // Enhanced testing helper
    window.testInstantLesson = function(options = {}) {
      const defaultOptions = {
        coachId: null,
        traineeName: options.traineeName || 'Test Student',
        duration: options.duration || 30,
        lessonType: options.lessonType || null,
      };
      
      // Try to get coachId from Redux store if available
      try {
        // Check if Redux store is accessible via window
        if (window.__REDUX_STORE__) {
          const state = window.__REDUX_STORE__.getState();
          if (state?.auth?.userInfo?._id) {
            defaultOptions.coachId = state.auth.userInfo._id;
            console.log('✅ Auto-detected Coach ID:', defaultOptions.coachId);
          }
        }
      } catch (e) {
        // Silently fail - user will provide ID manually
      }
      
      // Use provided coachId or try to get from options
      if (options.coachId) {
        defaultOptions.coachId = options.coachId;
      }
      
      if (!defaultOptions.coachId) {
        console.error('❌ Coach ID is required!');
        console.log('💡 How to get your User ID:');
        console.log('   1. Open Redux DevTools extension');
        console.log('   2. Go to State tab → auth.userInfo._id');
        console.log('   3. Copy the value and use:');
        console.log('   window.testInstantLesson({ coachId: "your_user_id" })');
        console.log('');
        console.log('   OR provide it manually:');
        console.log('   window.mockInstantLessonRequest({ coachId: "your_user_id", traineeName: "John", duration: 30 })');
        return;
      }
      
      console.log('🚀 Testing instant lesson request with:', defaultOptions);
      return mockInstantLessonRequest(socket, defaultOptions);
    };
    
    console.log("✅ Mock instant lesson function available!");
    console.log("📝 Usage:");
    console.log("   window.mockInstantLessonRequest({ coachId: 'your_id', traineeName: 'John', duration: 30 })");
    console.log("   OR");
    console.log("   window.testInstantLesson({ traineeName: 'John', duration: 30 }) // Auto-detects your user ID");
    console.log("");
    console.log("💡 Tip: If testInstantLesson doesn't auto-detect your ID, use Redux DevTools to find auth.userInfo._id");
  }
};

