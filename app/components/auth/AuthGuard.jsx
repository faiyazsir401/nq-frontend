import { useEffect } from "react";
import { useRouter } from "next/router";
import { AccountType, LOCAL_STORAGE_KEYS, routingPaths } from "../../common/constants";
import { useAppDispatch, useAppSelector } from "../../store";
import { authAction, authState, getMeAsync } from "./auth.slice";
import { getAvailability } from "../calendar/calendar.api";

const AuthGuard = ({ children }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isUserLoggedIn, isRedirectToDashboard, userInfo } = useAppSelector(authState);
  const path = router.asPath;
  const pathName = router.pathname;
  const showGoogleRegistrationForm = useAppSelector((state) => state.auth.showGoogleRegistrationForm.isFromGoogle); // Extract primitive value
  console.log(userInfo, 'userInfo');

  useEffect(() => {
    // Handle Google Registration Form redirection
    if (showGoogleRegistrationForm) {
      if (router.asPath !== routingPaths.signUp) { // Check current path before pushing
        router.push(routingPaths.signUp);
      }
    }
  }, [showGoogleRegistrationForm, router]); // Added router to dependencies for stable reference

  useEffect(() => {
    const isTokenExists = !!localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);

    if (isTokenExists) {
      dispatch(getMeAsync());
    } else {
      handlePublicRoutes(pathName, path, router);
    }
  }, [isUserLoggedIn, path, dispatch, router]); // Added dispatch and router for stability

  useEffect(() => {
    if (isRedirectToDashboard) {
      if (router.asPath !== routingPaths.dashboard) { // Check current path before pushing
        router.push(routingPaths.dashboard);
      }
    } else {
      dispatch(authAction.updateIsAuthModalOpen(false));
      dispatch(authAction.updateIsRedirectToDashboard(true));
    }
  }, [isRedirectToDashboard, router, dispatch]); // Separate effect for dashboard redirect

  return children;
};

// Public routes handling
export const handlePublicRoutes = (pathName, path, router) => {
  if (pathName === routingPaths.signUp || pathName === routingPaths.signIn) {
    if (path !== routingPaths.signUp) { // Check current path before pushing
      router.push(routingPaths.signUp);
    }
  } else if (pathName === routingPaths.forgetPassword) {
    if (path !== routingPaths.forgetPassword) { // Check current path before pushing
      router.push(routingPaths.forgetPassword);
    }
  } else if (pathName === routingPaths.verifiedForgetPassword || pathName === routingPaths.landing) {
    if (path !== routingPaths.landing) { // Check current path before pushing
      router.push(routingPaths.landing);
    }
  } else {
    if (path !== routingPaths.landing) { // Check current path before pushing
      router.push(routingPaths.landing);
    }
  }
};

export default AuthGuard;
