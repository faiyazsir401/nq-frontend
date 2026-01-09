import React from "react";
import { useAppSelector } from "../store";
import { bookingsState } from "../components/common/common.slice";

/**
 * Universal full-screen loader overlay.
 * Controlled via Redux: `bookingsState.isLoading`.
 * To show/hide from anywhere: dispatch `bookingsAction.handleLoading(true/false)`.
 */
const UniversalLoader = () => {
  const { isLoading } = useAppSelector(bookingsState);

  if (!isLoading) return null;

  return (
    <div className="chitchat-loader">
      <img src="/assets/images/netquix_logo_beta.png" alt="Loading..." />
    </div>
  );
};

export default UniversalLoader;


