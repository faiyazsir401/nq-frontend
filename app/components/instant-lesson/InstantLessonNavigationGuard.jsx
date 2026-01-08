import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  instantLessonState,
  instantLessonAction,
  INSTANT_LESSON_STEPS,
} from "./instantLesson.slice";
import { toast } from "react-toastify";

/**
 * Guards the browser back button while the instant lesson trainee flow is active.
 *
 * Behavior:
 * - When the trainee flow is active, browser back will move to the previous step
 *   instead of navigating away from the current page.
 * - When already on the first step, browser back is blocked and the user is
 *   instructed to use the explicit "Cancel" action to exit.
 * - Once the flow is cleared (cancelled or lesson joined), normal back
 *   navigation is restored.
 */
const InstantLessonNavigationGuard = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isTraineeFlow, currentStep } = useAppSelector(instantLessonState);

  useEffect(() => {
    // If there is no router (very early mount) just do nothing
    if (!router) return;

    const handleBeforePopState = ({ url, as, options }) => {
      // Only guard when the trainee flow is active
      if (!isTraineeFlow || !currentStep) {
        return true;
      }

      // If we're beyond the first step, treat back as "previous step"
      if (currentStep > INSTANT_LESSON_STEPS.REQUEST) {
        const previousStep = currentStep - 1;
        dispatch(instantLessonAction.setCurrentStep(previousStep));
        return false; // Block the actual route change
      }

      // On the first step, completely block leaving via browser back
      toast.info("Use \"Cancel\" to leave the instant lesson booking flow.");
      return false;
    };

    // Register guard
    router.beforePopState(handleBeforePopState);

    // Cleanup: restore default behavior when component unmounts
    return () => {
      // Reset to a permissive handler so other navigation works normally
      router.beforePopState(() => true);
    };
  }, [router, isTraineeFlow, currentStep, dispatch]);

  return null;
};

export default InstantLessonNavigationGuard;


