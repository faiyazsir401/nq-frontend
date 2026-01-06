import React from "react";
import { useInstantLessonSocket } from "./useInstantLessonSocket";
import InstantLessonModal from "./InstantLessonModal";
import InstantLessonTraineeModal from "./InstantLessonTraineeModal";

/**
 * Provider component that sets up global instant lesson socket listener
 * and renders the modals for both trainer and trainee. Should be placed at app level.
 */
const InstantLessonProvider = () => {
  // Set up global socket listener
  useInstantLessonSocket();

  // Render both modals (only one will be visible based on account type and state)
  return (
    <>
      <InstantLessonModal />
      <InstantLessonTraineeModal />
    </>
  );
};

export default InstantLessonProvider;

