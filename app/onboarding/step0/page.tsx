"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { InstallApp } from "@/components/InstallApp";
import Button from "@/components/Button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => void;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const WelcomeComponent = () => {
  const router = useRouter();

  // State management
  const [step, setStep] = useState(1);
  const [platform, setPlatform] = useState<string>("");
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallPromptAvailable, setIsInstallPromptAvailable] =
    useState<boolean>(false);
  const [isBrowser, setIsBrowser] = useState(false);
  const [isInstalledPWA, setIsInstalledPWA] = useState(false);
  const [showSkipOption, setShowSkipOption] = useState(false);

  useEffect(() => {
    setIsBrowser(true);

    const userAgent = navigator.userAgent || navigator.vendor || "";

    // Detect platform
    if (/android/i.test(userAgent)) {
      setPlatform("android");
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      setPlatform("ios");
    } else if (
      /Macintosh|MacIntel|MacPPC|Mac68K|Windows|Linux/.test(userAgent)
    ) {
      setPlatform("desktop");
    } else {
      setPlatform("other");
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallPromptAvailable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const checkIfInstalledPWA = () => {
      if (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
      ) {
        setIsInstalledPWA(true);
        setStep(2); // Automatically move to step 2 if the app is already installed
      }
    };

    checkIfInstalledPWA();

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  if (!isBrowser) return null;

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        setDeferredPrompt(null);
        setIsInstallPromptAvailable(false);
        if (choiceResult.outcome === "accepted") {
          setIsInstalledPWA(true);
          setStep(2); // Move to step 2 after successful installation
        }
      });
    }
  };

  const handleDesktopInstall = () => {
    if (deferredPrompt) {
      handleInstallClick();
    } else {
      alert(
        "To install this app, click on the browser's options menu and select 'Install App'."
      );
      setStep(2); // On desktop, can directly move to step 2
    }
  };

  const handleSkip = () => {
    if (platform === "ios") {
      alert(
        "Some features like push notifications may not be available without installing the app."
      );
    }
    setStep(2);
  };

  const handleNext = () => {
    if (step === 1) {
      if (platform === "ios" && !isInstalledPWA) {
        setShowSkipOption(true); // Show skip option instead of blocking
      } else {
        setStep(2);
      }
    }

    // Add this condition to handle desktop finish directly
    if (platform === "desktop") {
      router.push("/onboarding/step1");
    }
  };

  const handleFinish = () => {
    router.push("/onboarding/step1");
  };

  return (
    <>
      <img
        className="absolute w-[90px] h-[90px] top-[-90px] right-[5px] object-cover"
        src="/lips.png"
        style={{ transform: "rotate(16.56deg)" }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <div className="relative">
        <div className="flex flex-col items-center justify-center relative self-stretch w-full flex-[0_0_auto]">
          <div className="relative w-fit mt-[-1.00px] font-press-start font-normal text-[#f9f9f8] text-2xl tracking-[2.88px] leading-6 ">
            WELCOME!
          </div>
        </div>
        {step === 1 &&
          (platform === "ios" || platform === "android") &&
          !isInstalledPWA && (
            <div className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto] mt-6">
              {!showSkipOption && (
                <InstallApp
                  platform={platform}
                  isInstallPromptAvailable={isInstallPromptAvailable}
                  handleInstallClick={handleInstallClick}
                  handleDesktopInstall={handleDesktopInstall}
                  isInstalledPWA={isInstalledPWA}
                />
              )}
              {showSkipOption && platform === "ios" && (
                <>
                  <p className="text-[#ecece2] text-sm text-center mb-2">
                    Don't want to install the app now? You can always add the
                    app to your home screen later to earn
                    <span className="text-stroke font-press-start text-[#f9f9f8] ml-2">
                      +50
                    </span>
                    {"  "}PTS
                  </p>
                  <Button text="Skip for now" onClick={handleSkip} />
                  <Button
                    text="Back To Install"
                    onClick={() => setShowSkipOption(false)}
                    variant="secondary"
                  />
                </>
              )}
            </div>
          )}
        {(step === 2 || platform === "desktop" || isInstalledPWA) && (
          <div className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto] mt-6">
            {platform !== "desktop" && (
              <Button
                text="Finish"
                onClick={handleFinish}
              />
            )}
          </div>
        )}
        {!showSkipOption && !isInstalledPWA && (
          <div className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto] mt-6">
            <Button
              text={
                step === 1 && (platform === "ios" || platform === "android")
                  ? "Skip"
                  : "Finish"
              }
              onClick={platform === "desktop" ? handleFinish : handleNext}
              variant="primary"
            />
          </div>
        )}
      </div>
    </>
  );
};

export default WelcomeComponent;
