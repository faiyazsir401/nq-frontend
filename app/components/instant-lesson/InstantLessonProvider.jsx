import React from "react";
import { useInstantLessonSocket } from "./useInstantLessonSocket";
import InstantLessonModal from "./InstantLessonModal";
import InstantLessonTraineeModal from "./InstantLessonTraineeModal";
import InstantLessonNavigationGuard from "./InstantLessonNavigationGuard";

/**
 * Provider component that sets up global instant lesson socket listener
 * and renders the modals for both trainer and trainee. Should be placed at app level.
 */
const InstantLessonProvider = () => {
  // Set up global socket listener
  useInstantLessonSocket();

  // Render navigation guard and both modals (only one modal will be visible
  // based on account type and state)
  return (
    <>
      <InstantLessonNavigationGuard />
      <InstantLessonModal />
      <InstantLessonTraineeModal />
    </>
  );
};

export default InstantLessonProvider;

