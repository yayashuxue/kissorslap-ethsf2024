import React from "react";
import Button from "../Button";

interface InstallAppProps {
  platform: string;
  isInstallPromptAvailable: boolean;
  handleInstallClick: () => void;
  handleDesktopInstall: () => void;
  isInstalledPWA: boolean;
}

export const InstallApp: React.FC<InstallAppProps> = ({
  platform,
  isInstallPromptAvailable,
  handleInstallClick,
  handleDesktopInstall,
  isInstalledPWA,
}) => {
  if (isInstalledPWA) {
    return null;
  }

  return (
    <div className="w-full space-y-6">
      <p className="font-inter font-normal text-[#ecece2] text-base text-center tracking-[0] leading-[25.9px]">
        For the best experience, add our App to Home Screen and
        <span className="text-stroke font-press-start text-[#f9f9f8]leading-[36px] tracking-[3.60px] ml-2">
          +50
        </span>
        {"  "}PTS
      </p>
      {platform === "ios" ? (
        <div className="space-y-4">
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="space-y-2">
                <img
                  src={`/step${step}.png`}
                  alt={`Step ${step}`}
                  className="mx-auto w-full h-auto object-contain"
                />
                <p
                  className="font-inter font-normal text-[#ecece2] text-sm text-center tracking-[0] leading-[20px]"
                  dangerouslySetInnerHTML={{
                    __html: `${getStepDescription(step)}`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ) : platform === "desktop" || isInstallPromptAvailable ? (
        <div className="space-y-4 mt-6">
          <Button
            onClick={
              platform === "desktop" ? handleDesktopInstall : handleInstallClick
            }
            text={platform === "desktop" ? "Add App to Desktop" : "Install App"}
          ></Button>
        </div>
      ) : (
        <p className="font-inter font-normal text-[#ecece2] text-base text-center tracking-[0] leading-[25.9px]">
          App installation is not available on your device.
        </p>
      )}
    </div>
  );
};

const getStepDescription = (step: number): string => {
  switch (step) {
    case 1:
      return 'Step 1 for <b>Safari User</b>: Tap the <b>"Share"</b> button.';
    case 2:
      return 'Step 1 for <b>Chrome User</b>: Tap the "Share" button on the top right of the bar.';
    case 3:
      return 'Step 2: Tap "Add to Home Screen"';
    case 4:
      return 'Step 3: Confirm by tapping "Add"';
    case 5:
      return "Done! Open the app from the home screen.";
    default:
      return "";
  }
};

export default InstallApp;
