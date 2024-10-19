"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingData } from "@/app/hooks/useOnboardingData";
import { FormField } from "@/components/FormField2";
import { Spinner } from "@/components/Spinner";
import { ProgressBar } from "@/components/ProgressBar";
import Button from "@/components/Button";

const Step2 = () => {
  const router = useRouter();
  const { data, updateData } = useOnboardingData();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleNext = async () => {
    if (data.name.trim() === "") {
      setError("Display Name is required.");
      return;
    }
    if (data.bio.trim() === "") {
      setError("Bio is required.");
      return;
    }
    if (data.bio.length > 280) {
      setError("Bio must be 280 characters or less.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/updateUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          bio: data.bio,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user information.");
      }
      router.push("/onboarding/step3");
    } catch (error: any) {
      setError(error.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/onboarding/step1");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateData({ [e.target.name]: e.target.value });
  };

  return (
    <div className="w-full max-w-md mx-auto relative">
      <div className="absolute top-[-120px] left-1/2 transform -translate-x-1/2 w-full flex justify-center z-10">
        <ProgressBar step={2} totalSteps={5} />
      </div>
      <div className="mt-12 relative z-20 flex flex-col items-center gap-6  w-[290px]">
        {/* Display Name Field */}
        <FormField
          label="Display Name"
          name="name"
          value={data.name}
          placeholder="PPL will See it. 3-20 characters"
          onChange={handleChange}
          borderColor="#e8def8"
          isRequired={true}
          uppercase={false}
        />
        {/* Bio Field */}
        <FormField
          label="Bio"
          name="bio"
          value={data.bio}
          placeholder="280 characters or less. Be creative! Use Emoji & #hashtags. 🍭🎿🍖"
          onChange={handleChange}
          borderColor="#e8def8"
          isRequired={true}
          textarea={true}
          maxLength={280}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex justify-between w-full gap-4 mt-6">
          <Button onClick={handleBack} text="Back" className="w-full" />
          <Button
            onClick={handleNext}
            loading={isLoading}
            text={isLoading ? <Spinner /> : "Next"}
            variant="secondary"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Step2;
