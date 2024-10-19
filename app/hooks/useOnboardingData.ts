"use client";

import { useContext } from "react";
import { OnboardingContext } from "../context/OnboardingProvider";

export const useOnboardingData = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error(
      "useOnboardingData must be used within an OnboardingProvider"
    );
  }
  return context;
};
