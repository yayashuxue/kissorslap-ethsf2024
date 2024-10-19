/* Step4c.tsx - Confirm Image */
"use client";
import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingData } from "../../hooks/useOnboardingData";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import Button from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";

const Step4c: React.FC = () => {
  const router = useRouter();
  const { data, updateData } = useOnboardingData();
  const [error, setError] = useState<string>("");
  const imageRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<Cropper | null>(null);

  const handleBack = () => {
    router.push("/onboarding/step4b");
  };

  // useEffect(() => {
  //   if (
  //     data.photo &&
  //     (data.photo instanceof Blob || data.photo instanceof File) &&
  //     imageRef.current
  //   ) {
  //     if (cropperRef.current) {
  //       cropperRef.current.destroy(); // 销毁现有的 cropper 实例
  //     }
  //     cropperRef.current = new Cropper(imageRef.current, {
  //       aspectRatio: 1,
  //       viewMode: 1,
  //       autoCrop: true,
  //     });
  //   } else if (!data.photo) {
  //     setError("No valid photo available for cropping. Please upload one.");
  //   }
  // }, [data.photo]);

  return (
    <div className="w-full max-w-md mx-auto relative">
      <div className="absolute top-[-120px] left-1/2 transform -translate-x-1/2 w-full flex justify-center z-10">
        <ProgressBar step={2} totalSteps={5} />
      </div>
      <div className="mt-12 relative z-20 flex flex-col items-center gap-6  w-[290px]">
        <p className="title-white">Confirm Your Profile Photo</p>

        {data.photo && (
          <div className="mt-4">
            <img
              src={
                data.photo instanceof Blob
                  ? URL.createObjectURL(data.photo)
                  : typeof data.photo === "string"
                  ? data.photo
                  : ""
              }
              alt="Cropped Preview"
              className="relative w-[185px] h-[288px] object-cover rounded-3xl"
            />
          </div>
        )}
        <div className="flex justify-between w-full gap-4 mt-6">
          <Button onClick={handleBack} text="Back" className="w-full" />
          <Button
            onClick={() => router.push("/onboarding/step5")}
            text={"Next"}
            variant="secondary"
            className="w-full"
          />
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default Step4c;
