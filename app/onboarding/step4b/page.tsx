"use client";
import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingData } from "../../hooks/useOnboardingData";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import Button from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";

const Step4b: React.FC = () => {
  const router = useRouter();
  const { data, updateData } = useOnboardingData();
  const imageRef = useRef<HTMLImageElement | null>(null);
  const cropperRef = useRef<Cropper | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (data.originalPhoto && imageRef.current) {
      // Ensure that the originalPhoto is valid and the imageRef is rendered
      if (data.originalPhoto instanceof Blob || data.originalPhoto instanceof File) {
        if (cropperRef.current) {
          cropperRef.current.destroy(); // Destroy any existing cropper instance before re-initializing
        }
        cropperRef.current = new Cropper(imageRef.current, {
          aspectRatio: 350 / 560, // Custom aspect ratio for profile photo
          viewMode: 1,
          autoCrop: true,
          guides: false,
          center: true,
          background: false,
          highlight: false,
          cropBoxMovable: false,
          cropBoxResizable: false,
          dragMode: "move", // Allow moving the image
          ready() {
            // Adjust the crop box to fit the container height and maintain aspect ratio
            const cropper = cropperRef.current;
            if (cropper) {
              const containerData = cropper.getContainerData();
              const aspectRatio = 350 / 560;
              const newCropBoxHeight = containerData.height;
              const newCropBoxWidth = newCropBoxHeight * aspectRatio;

              cropper.setCropBoxData({
                left: (containerData.width - newCropBoxWidth) / 2,
                top: 0,
                width: newCropBoxWidth,
                height: newCropBoxHeight,
              });
            }
          },
        });
      } else {
        setError("Invalid image format. Please upload a valid image.");
      }
    }
  }, [data.originalPhoto]);

  const handleCrop = () => {
    const cropper = cropperRef.current;
    if (cropper) {
      const canvas = cropper.getCroppedCanvas({
        width: 1500, // Ensure the final canvas is square
        height: 1500,
      });
      if (canvas) {
        // Check the dimensions of the cropped image
        const croppedWidth = canvas.width;
        const croppedHeight = canvas.height;
  
        if (croppedWidth < 640 || croppedHeight < 640) {
          setError("Cropped image is too small. Minimum size is 640x640 pixels.");
          return;
        }
  
        canvas.toBlob((blob) => {
          if (blob) {
            updateData({ photo: blob }); // Update photo with cropped image
            router.push("/onboarding/step4c"); // Proceed to the confirmation step
          } else {
            setError("Failed to crop the image. Please try again.");
          }
        }, "image/jpeg");
      } else {
        setError("Unable to generate cropped image. Please try again.");
      }
    } else {
      setError("Cropper instance is not available. Please reload the page.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative">
      <div className="absolute top-[-120px] left-1/2 transform -translate-x-1/2 w-full flex justify-center z-10">
        <ProgressBar step={2} totalSteps={5} />
      </div>
      <div className="mt-12 relative z-20 flex flex-col items-center gap-6 w-[290px]">
        <p className="title-white">Crop Your Profile Photo</p>
        {data.originalPhoto &&
        (data.originalPhoto instanceof Blob || data.originalPhoto instanceof File) ? (
          <div className="relative w-60 h-60 bg-m3-state-layers-primary-container-opacity-12 rounded-3xl overflow-hidden  bg-cover bg-[50%_50%]">
            <img
              className="absolute w-[121px] h-[155px] top-[47px] left-[59px] object-cover"
              ref={imageRef}
              src={URL.createObjectURL(data.originalPhoto)}
              alt="Source"
            />
          </div>
        ) : (
          <p className="text-red-500 mt-2">
            No valid image to crop. Please upload a valid image.
          </p>
        )}

        {error && <p className="text-red-500 mt-2">{error}</p>}

        <div className="flex justify-between w-full gap-4 mt-6">
          <Button onClick={() => router.push("/onboarding/step4a")} text="Back" className="w-full" />
          <Button
            onClick={handleCrop}
            text={"Done"}
            variant="secondary"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Step4b;