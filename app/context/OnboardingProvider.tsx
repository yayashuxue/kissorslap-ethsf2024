// app/context/OnboardingProvider.tsx
"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";

interface OnboardingData {
  fileName: any;
  phoneNumber: string;
  username: string;
  name: string;
  bio: string;
  photo: string | null;
  originalPhoto: string | null;
  hotScore: number;
  karmaScore: number;
  points: number;
  gender: string;
  genderPreference: string;
  age: number;
  birthday: string;
}

interface OnboardingContextProps {
  data: OnboardingData;
  updateData: (newData: Partial<OnboardingData>) => void;
  isLoading: boolean;
  error: string | null;
}

export const OnboardingContext = createContext<
  OnboardingContextProps | undefined
>(undefined);

interface OnboardingProviderProps {
  children: ReactNode;
  initialData?: OnboardingData; // Make initialData optional
}

export const OnboardingProvider = ({
  children,
  initialData,
}: OnboardingProviderProps) => {
  const [data, setData] = useState<OnboardingData>({
    fileName: null,
    phoneNumber: "",
    username: "",
    name: "",
    bio: "",
    photo: null,
    originalPhoto: null,
    hotScore: 0,
    karmaScore: 0,
    points: 0,
    age: 0,
    gender: "",
    birthday: "",
    genderPreference: "",
    ...initialData, // Spread initialData to override defaults
  });
  const [isLoading, setIsLoading] = useState<boolean>(!initialData); // If initialData is provided, no need to load
  const [error, setError] = useState<string | null>(null);

  
  const updatePoints = (newPoints: number) => {
    setData((prevData) => ({
      ...prevData,
      points: newPoints,
    }));
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/getUser", {
        method: "GET",
        credentials: "include", // Include cookies
      });

      console.log("/api/getUser", response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch user data");
      }

      const userData: OnboardingData = await response.json();
      setData(userData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchUserData();
    }
    // If initialData is provided, skip fetching
  }, [initialData]);

  const updateData = (newData: Partial<OnboardingData>) => {
    setData((prevData) => ({ ...prevData, ...newData }));
  };

  return (
    <OnboardingContext.Provider value={{ data, updateData, isLoading, error }}>
      {children}
    </OnboardingContext.Provider>
  );
};
