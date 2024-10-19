"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingForm } from "../../hooks/useOnboardingForm";
import { useOnboardingData } from "../../hooks/useOnboardingData"; // Hook to fetch onboarding data
import { ProgressBar } from "../../../components/ProgressBar";
import { Spinner } from "../../../components/Spinner";
import Button from "@/components/Button";
import { FormField } from "../../../components/FormField2"; // Add this import

const Step3 = () => {
  const router = useRouter();
  const { data: onboardingData, isLoading, error } = useOnboardingData();
  const {
    formData,
    handleChange,
    isLoading: isFormLoading,
  } = useOnboardingForm();

  const [formError, setFormError] = useState(""); // State to handle form errors

  // Function to calculate age from birthday
  const calculateAge = (birthday: string) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleNext = async () => {
    // Validate birthday is not empty or null
    if (!formData.birthday || formData.birthday === "") {
      setFormError("Valid birthday is required.");
      return;
    }

    // Validate that the birthday is a valid date and user is at least 18 years old
    const age = calculateAge(formData.birthday);
    if (isNaN(age) || age < 18) {
      setFormError("You must be at least 18 years old.");
      return;
    }

    // // Validate that genderPreference is selected
    // if (!formData.genderPreference) {
    //   setFormError("Please select a sexual preference.");
    //   return;
    // }

    // Clear errors if validation passed
    setFormError("");

    // Proceed to next step
    router.push("/onboarding/step4a");
  };

  const handleBack = () => {
    router.push("/onboarding/step2");
  };

  const toggleGender = () => {
    const newGender = formData.gender === "MALE" ? "FEMALE" : "MALE";
    handleChange({
      target: { name: "gender", value: newGender },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="w-full max-w-md mx-auto relative">
      <div className="absolute top-[-120px] left-1/2 transform -translate-x-1/2 w-full flex justify-center z-10">
        <ProgressBar step={2} totalSteps={5} />
      </div>
      <div className="mt-12 relative z-20 flex flex-col items-center gap-6 w-[290px]">
        {/* Birthday Input */}
        <FormField
          label="Birthday"
          name="birthday"
          value={formData.birthday ? new Date(formData.birthday).toISOString().split('T')[0] : ''}
          onChange={handleChange}
          error={formError}
          borderColor="#FFFFFF"
          isRequired={true}
          type="date"
          placeholder="Select your birthday"
        />
        {/* Gender Toggle */}
        {/* <div className="mt-4 w-full">
          <label className="title-white">Gender</label>
          <div
            className={`w-16 h-6 rounded-full p-1 cursor-pointer ${
              formData.gender === "MALE" ? "bg-blue-500" : "bg-gray-400"
            }`}
            onClick={toggleGender}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${
                formData.gender === "MALE" ? "translate-x-10" : "translate-x-0"
              }`}
            ></div>
          </div>
          <span className="title-white">
            {formData.gender === "MALE" ? "Male" : "Female"}
          </span>
        </div> */}
        {/* Sexual Preference Selection */}
        {/* <div className="mt-4 w-full">
          <label className="title-white">Sexual Preference</label>
          <div className="flex space-x-4 title-white">
            <label className="flex items-center">
              <input
                type="radio"
                name="genderPreference"
                value="MALE"
                checked={formData.genderPreference === "MALE"}
                onChange={handleChange}
              />
              <span className="ml-2">Male</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="genderPreference"
                value="FEMALE"
                checked={formData.genderPreference === "FEMALE"}
                onChange={handleChange}
              />
              <span className="ml-2">Female</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="genderPreference"
                value="BOTH"
                checked={formData.genderPreference === "BOTH"}
                onChange={handleChange}
              />
              <span className="ml-2">Both</span>
            </label>
          </div>
        </div> */}
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {/* Display form error if any */}
        <div className="flex justify-between w-full gap-4 mt-6">
          <Button onClick={handleBack} text="Back" className="w-full" />
          <Button
            onClick={handleNext}
            loading={isLoading}
            text={"Next"}
            variant="secondary"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Step3;
