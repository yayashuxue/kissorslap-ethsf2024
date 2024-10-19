"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingData } from "../../hooks/useOnboardingData";
import Button from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";

const Step4a: React.FC = () => {
  const router = useRouter();
  const { data, updateData } = useOnboardingData();
  const [error, setError] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleContainerClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  useEffect(() => {
    if (data.fileName) {
      setFileName(data.fileName);
    }
  }, [data.fileName]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name); // Update the file name state
      updateData({ fileName: file.name }); // Update global state with file name
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const minWidth = 800;
        const minHeight = 800;
        if (img.width < minWidth || img.height < minHeight) {
          setError(
            `Image resolution is too low. Minimum resolution is ${minWidth}x${minHeight}px.`
          );
        } else {
          updateData({ originalPhoto: file });
          router.push("/onboarding/step4b"); // Go to Crop Step
        }
      };
    } else {
      setError("Please upload an image.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative">
      <div className="absolute top-[-120px] left-1/2 transform -translate-x-1/2 w-full flex justify-center z-10">
        <ProgressBar step={2} totalSteps={5} />
      </div>
      <div className="mt-12 relative z-20 flex flex-col items-center gap-6 w-[290px]">
        <p className="title-white">Upload Your Profile Photo</p>
        <input
          id="photo"
          name="photo"
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          className="hidden" // Hide the input element
          ref={fileInputRef}
        />
        {error && <p className="text-red-500 mt-2">{error}</p>}

        <div
          className="w-60 h-60 bg-m3-state-layers-primary-container-opacity-12 rounded-3xl overflow-hidden border border-solid border-primary-fixed mt-6 cursor-pointer"
          onClick={handleContainerClick}
        >
          <div className="flex flex-col w-[138px] items-center gap-3 relative top-[83px] left-[51px]">
            <div className="flex h-[41px] items-center justify-center gap-[8.65px] px-[23.06px] py-[7px] relative self-stretch w-full mt-[-2.00px] ml-[-2.00px] mr-[-2.00px] rounded-[48px] overflow-hidden border-2 border-solid border-[#453c89] [background:linear-gradient(180deg,rgb(232,222,248)_38.75%,rgb(246.77,241.67,255)_100%)]">
              <div className="relative w-fit mt-[-1.50px] ml-[-6.06px] mr-[-2.06px] font-sans font-semibold text-[#432f78] text-lg tracking-[0.18px] leading-[25.9px] whitespace-nowrap">
                {fileName ? "Change File" : "Choose File"}
              </div>
            </div>
            <div className="relative self-stretch font-sans font-normal text-[#a7a7a7] text-base text-center tracking-[0.16px] leading-[25.9px]">
              {fileName || "No File Selected"}
            </div>
          </div>
        </div>
        <div className="w-full flex justify-between mt-6">
          <Button
            onClick={() => {
              router.push("/onboarding/step3");
            }}
            text="Back"
            className="w-1/2 mr-2"
          />
          {fileName && (
            <Button
              onClick={() => {
                router.push("/onboarding/step4b");
              }}
              text="Next"
              variant="secondary"
              className="w-1/2 ml-2"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Step4a;
