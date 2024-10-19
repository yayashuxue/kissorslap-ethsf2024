"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingData } from "../../hooks/useOnboardingData";
import { ProgressBar } from "../../../components/ProgressBar";
import InteractUserProfile from "@/components/InteractUserProfile/page";
import Button from "@/components/Button";
import { storage } from "../../../firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Step5 = () => {
  const router = useRouter();
  const { data, updateData } = useOnboardingData();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);
  const [elementPositions, setElementPositions] = useState<{
    [key: string]: DOMRect | null;
  }>({});

  useEffect(() => {
    const updatePositions = () => {
      if (!profileRef.current) return;

      const profileElement = profileRef.current;

      const getElementPosition = (selector: string) => {
        const element = profileElement.querySelector(selector);
        if (element) {
          const rect = element.getBoundingClientRect();
          return {
            top: rect.top + window.scrollY, // Adjust for scroll position
            left: rect.left + window.scrollX, // Adjust for scroll position
            width: rect.width,
            height: rect.height,
          };
        }
        return null;
      };

      const newPositions = {
        karmaScore: getElementPosition(".karma-score"),
        hotScore: getElementPosition(".hot-score"),
        kissButton: getElementPosition(".kiss-button"),
        slapButton: getElementPosition(".slap-button"),
        actedOnYou: getElementPosition(".acted-on-you"),
      };

      console.log("newPositions: ", newPositions); 
      setElementPositions(newPositions);
    };

    updatePositions();
    window.addEventListener("resize", updatePositions);
    return () => {
      window.removeEventListener("resize", updatePositions);
    };
  }, [profileRef]);

  useEffect(() => {
    const updatePositions = () => {
      const pointsElement = document.querySelector(".points"); // Use document.querySelector to find the .points element across components
      if (pointsElement) {
        const rect = pointsElement.getBoundingClientRect();

        setElementPositions((prevPositions) => ({
          ...prevPositions,
          points: new DOMRect(
            rect.left + window.scrollX, // left
            rect.top + window.scrollY + 10, // top, account for page scroll
            rect.width, // width
            rect.height // height
          ),
      }));
      }
    };

    updatePositions(); // Initial position update
    window.addEventListener("resize", updatePositions); // Listen for window resize to recalculate positions

    return () => {
      window.removeEventListener("resize", updatePositions); // Clean up the event listener on component unmount
    };
  }, []);

  const handleFinish = async () => {
    setIsLoading(true);
    setError("");

    try {
      let photoUrl = data.photo;

      // If the photo is a Blob, upload it to the backend
      if (data.photo instanceof Blob) {
        photoUrl = await uploadCroppedImageToBackend(data.photo, "PROFILE");
        updateData({ photo: photoUrl });
      }

      // Call the updateUser API to trigger the completion logic
      const response = await fetch("/api/updateUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to update user completion status.");
      }

      // After successful update, redirect to the next step
      router.push("/congrats");
    } catch (err: any) {
      setError("Failed to proceed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const uploadCroppedImageToBackend = async (
    blob: Blob,
    imageType: string
  ): Promise<string> => {
    // Convert Blob to base64
    const reader = new FileReader();
    const fileData = await new Promise<string>((resolve, reject) => {
      reader.onloadend = () =>
        resolve(reader.result?.toString()?.split(",")[1] || "");
      reader.onerror = () => reject("Failed to read file");
      reader.readAsDataURL(blob);
    });

    // Make the API request without needing to pass the JWT manually
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: `images/${Date.now()}.jpg`, // Define the file path
        fileData, // Send the base64 file data
        imageType, // Send the image type (PROFILE or GALLERY)
      }),
      credentials: "include", // This ensures cookies (including privy-token) are sent with the request
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to upload file");
    }

    return result.imageUrl; // Return the file URL after successful upload
  };

  const handleBack = () => {
    if (currentStep === 0) {
      router.push("/onboarding/step4c");
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextOrFinish = () => {
    if (currentStep < tooltips.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const tooltips = [
    { content: "Welcome to the onboarding process! Let's get started.", position: "center" },
    { content: "These are your points. Earn more by interacting!", position: "custom", element: "points" },
    { content: "This is your karma score. Be nice to others!", position: "custom", element: "karmaScore" },
    { content: "Your hot score shows how popular you are.", position: "custom", element: "hotScore" },
    { content: "Kiss other users to show your affection.", position: "custom", element: "kissButton" },
    { content: "Slap users you don't like (but be careful!).", position: "custom", element: "slapButton" },
    { content: "This icon shows when someone has interacted with you.", position: "custom", element: "actedOnYou" },
    { content: "You're all set! Click 'Finish' to complete the onboarding.", position: "center" }
  ];

  const currentTooltip = tooltips[currentStep];

  // Prepare the currentUser object for InteractUserProfile
  const currentUser = {
    name: data.name,
    birthday: data.birthday,
    bio: data.bio,
    images: [{ imageUrl: data.photo instanceof Blob ? URL.createObjectURL(data.photo) : data.photo }],
    hotScore: data.hotScore || 50,
    karmaScore: data.karmaScore || 50,
    otherUserActed: true,
  };

  return (
    <>
      <div className="w-full flex flex-col items-center relative mt-[-100px]">
        <InteractUserProfile
          ref={profileRef}
          currentUser={currentUser}
          isLoading={isLoading}
          hideButtons={true}
        />

        {error && <p className="text-red-500 mt-4">{error}</p>}

        <div className="flex justify-between w-full gap-4 mt-20">
          <Button onClick={handleBack} text="Back" className="w-full" />
          <Button
            onClick={handleNextOrFinish}
            loading={isLoading}
            text={currentStep < tooltips.length - 1 ? "Next" : "Finish"}
            variant="secondary"
            className="w-full"
          />
        </div>
      </div>
      <Tooltip
        content={currentTooltip.content}
        position={
          currentTooltip.position as
            | "top"
            | "bottom"
            | "bottom-left"
            | "bottom-right"
            | "custom"
        }
        elementPosition={
          currentTooltip.element && elementPositions[currentTooltip.element]
            ? elementPositions[currentTooltip.element]
            : null
        }
        currentStep={currentStep}
        totalSteps={tooltips.length}
        onNext={handleNextOrFinish}
        onPrevious={handlePrevious}
        onSkip={() => setCurrentStep(tooltips.length - 1)}
      />
    </>
  );
};

export default Step5;

interface TooltipProps {
  content: string;
  position: 
  "center" | "top" | "bottom" | "bottom-left" | "bottom-right" | "custom";
  elementPosition?: {
    top: number;
    left: number;
    width: number;
    height: number;
  } | null;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  position,
  elementPosition,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
}) => {
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [isAbove, setIsAbove] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculatePosition = () => {
      if (position === "custom" && elementPosition && tooltipRef.current) {
        const { top, left, width, height } = elementPosition;
        const tooltipHeight = tooltipRef.current.offsetHeight;
        const tooltipWidth = tooltipRef.current.offsetWidth;
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        let tooltipTop = top + height + 10; // Position below the element
        let tooltipLeft = left + width / 2;

        // Check if tooltip goes beyond viewport bottom
        if (tooltipTop + tooltipHeight > viewportHeight) {
          tooltipTop = top - tooltipHeight - 10; // Position above the element
          setIsAbove(true);
        } else {
          setIsAbove(false);
        }

        // Adjust horizontal position if tooltip overflows viewport
        tooltipLeft = Math.max(
          tooltipWidth / 2,
          Math.min(tooltipLeft, viewportWidth - tooltipWidth / 2)
        );

        setTooltipStyle({
          position: "fixed",
          top: `${tooltipTop}px`,
          left: `${tooltipLeft}px`,
          transform: "translateX(-50%)",
        });
      } else {
        // Default positions
        const defaultStyle: React.CSSProperties = {
          position: "fixed",
          transform: "translateX(-50%)",
        };
        switch (position) {
          case "top":
            defaultStyle.top = "16px";
            defaultStyle.left = "50%";
            break;
          case "bottom":
            defaultStyle.bottom = "16px";
            defaultStyle.left = "50%";
            break;
          case "bottom-left":
            defaultStyle.bottom = "16px";
            defaultStyle.left = "16px";
            defaultStyle.transform = "none";
            break;
          case "bottom-right":
            defaultStyle.bottom = "16px";
            defaultStyle.right = "16px";
            defaultStyle.transform = "none";
            break;
          case "center":
            defaultStyle.top = "50%";
            defaultStyle.left = "50%";
            defaultStyle.transform = "translate(-50%, -50%)";
            break;
          default:
            defaultStyle.top = "16px";
            defaultStyle.left = "50%";
        }

        setTooltipStyle(defaultStyle);
        setIsAbove(false);
      }
    };

    calculatePosition();
    window.addEventListener("resize", calculatePosition);
    return () => window.removeEventListener("resize", calculatePosition);
  }, [position, elementPosition]);

  return (
    <div
      ref={tooltipRef}
      className="absolute w-full max-w-[300px] bg-[#4A4458] p-4 shadow-lg z-50 rounded-xl"
      style={tooltipStyle}
    >
      {/* Tooltip content */}
      <div className="flex flex-col gap-4">
        <p className="text-primary text-sm font-medium leading-tight">
          {content}
        </p>
        <div className="flex justify-between items-center">
          {currentStep > 0 ? (
            <button
              onClick={onPrevious}
              className="text-[#cac4d0] text-xs font-medium cursor-pointer hover:text-[#f2f4f5] transition-colors"
            >
              Back
            </button>
          ) : (
            <button
              onClick={onSkip}
              className="text-[#cac4d0] text-xs font-medium cursor-pointer hover:text-[#f2f4f5] transition-colors"
            >
              Skip
            </button>
          )}
          <button
            onClick={onNext}
            className="text-[#f2f4f5] text-xs font-medium cursor-pointer hover:text-[#ffffff] transition-colors"
          >
            {currentStep < totalSteps - 1 ? "Next" : "Finish"}{" "}
            <span className="text-[#999999]">
              ({currentStep + 1}/{totalSteps})
            </span>
          </button>
        </div>
      </div>

      {/* Tooltip arrow */}
      {position === "custom" && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: `translateX(-50%) ${isAbove ?  "": "rotate(180deg)"}`,
            [isAbove ? "bottom" : "top"]: "-6px",
          }}
        >
          <img className="w-3 h-1.5" alt="Arrow" src="/arrow.svg" />
        </div>
      )}
    </div>
  );
};
