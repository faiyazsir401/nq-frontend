import React from "react";
import { useInstantLessonSocket } from "./useInstantLessonSocket";
import InstantLessonModal from "./InstantLessonModal";

/**
 * Provider component that sets up global instant lesson socket listener
 * and renders the modal. Should be placed at app level.
 */
const InstantLessonProvider = () => {
  // Set up global socket listener
  useInstantLessonSocket();

  // Render the modal
  return <InstantLessonModal />;
};

export default InstantLessonProvider;

