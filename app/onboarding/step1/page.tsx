"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingData } from "@/app/hooks/useOnboardingData";
import { FormField } from "@/components/FormField2";
import { Spinner } from "@/components/Spinner";
import { ProgressBar } from "@/components/ProgressBar";
import Button from "@/components/Button";

export default function Step1() {
  const router = useRouter();
  const { data, updateData } = useOnboardingData();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleNext = async () => {
    // Check for invalid characters (e.g., spaces)
    const invalidUsernamePattern = /[^a-zA-Z0-9_]/;
    if (invalidUsernamePattern.test(data.username)) {
      setError("Username can only contain letters, numbers, and underscores.");
      return;
    }
  
    if (data.username.length < 3 || data.username.length > 10) {
      setError("Username must be between 3 and 10 characters.");
      return;
    }
  
    try {
      setError(""); // Clear any previous errors
      setIsLoading(true);
  
      const response = await fetch("/api/updateUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: data.username.toLowerCase() }),
      });
  
      if (response.status === 409) {
        // Handle username already taken
        const errorData = await response.json();
        setError(errorData.error);
        return;
      }
  
      if (!response.ok) {
        throw new Error("Failed to update username.");
      }
  
      router.push("/onboarding/step2");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    // Check for invalid characters (e.g., spaces)
    const invalidUsernamePattern = /[^a-zA-Z0-9_]/;
    if (!invalidUsernamePattern.test(newValue)) {
      updateData({ [e.target.name]: newValue });
    }
  };
  return (
    <div className="w-full max-w-md mx-auto relative">
      <div className="absolute top-[-120px] left-1/2 transform -translate-x-1/2 w-full flex justify-center z-10">
        <ProgressBar step={1} totalSteps={5} />
      </div>
      <div className="mt-24 relative z-20 flex flex-col items-center gap-6  w-[290px]">
        {/* Input Field Container */}
        <FormField
          label="Your Username"
          details="(3-10 characters)"
          name="username"
          value={data.username}
          placeholder="Pro tip: shorter is better"
          onChange={handleChange}
          error={error}
          borderColor="#e8def8"
          isRequired={true}
        />
        <Button
          onClick={handleNext}
          loading={isLoading}
          text={"Next"}
          variant="secondary"
        />
      </div>
    </div>
  );
}
