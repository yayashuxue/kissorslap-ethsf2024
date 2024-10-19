import React, { forwardRef } from "react";
import Image from "next/image";
import { Action } from "@prisma/client";

interface UserInteractionModalProps {
  currentUser: any;
  handleNextUser?: (action: Action) => void;
  isLoading?: boolean;
  hideButtons?: boolean;
  hideBorder?: boolean;
}

const InteractUserProfile = forwardRef<HTMLDivElement, UserInteractionModalProps>(
  ({ currentUser, handleNextUser, isLoading, hideButtons = false, hideBorder = false }, ref) => {
    // Function to handle button click with animation
    const handleButtonClick = (action: Action) => {
      const button = document.querySelector(`.${action.toLowerCase()}-button`);
      if (button) {
        button.classList.add('animate-click');
        setTimeout(() => button.classList.remove('animate-click'), 300);
      }
      handleNextUser && handleNextUser(action);
    };

    return (
      <div ref={ref} className="relative flex flex-col items-center">
        <div
          className={`relative w-[80vw] max-w-[350px] max-h-[560px] aspect-[5/8] bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl overflow-hidden shadow-[rgba(0,0,0,0.2)_3px_2px_10px_3px] ${
            hideBorder ? "" : "border-4 border-purple-500"
          }`}
        >
          {currentUser.images[0]?.imageUrl ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={currentUser.images[0].imageUrl}
                alt={currentUser.name || "User"}
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70" />
            </div>
          ) : (
            <div className="w-full h-full bg-neutral-600 flex items-center justify-center">
              <span className="text-6xl text-neutral-100">
                {currentUser.username?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>
          )}

          {/* Glowing Acted On You Button */}
          <div className="z-100">
            {currentUser.otherUserActed && (
              <div className="bg-[linear-gradient(39.85deg,_#E8DEF8_34.67%,_#FFEF9D_100%)] border-[#453C8A] border absolute px-3 py-1 rounded-full absolute bottom-[16vh] shadow-lg flex items-center justify-center ml-2 brightness-120">
                <div className="text-xl">👀</div>
                <div className="pl-3 font-press-start font-normal text-[#1d1d1b] text-xs acted-on-you">
                  Acted On You
                </div>
              </div>
            )}
          </div>

          <div className="absolute inset-0 h-full w-full z-10">
            {/* User name and age */}
            <div className="absolute bottom-[9vh] left-4 text-white">
              <h2 className="text-2xl font-bold">
                {currentUser.name}
                {currentUser.birthday
                  ? `, ${
                      new Date().getFullYear() -
                      new Date(currentUser.birthday).getFullYear()
                    }`
                  : ""}
              </h2>
              <p className="text-xs">{currentUser.bio || "Anonymous"}</p>
            </div>

            {/* Interaction stats with progress bars inside */}
            <div className="absolute bottom-[2vh] left-4 right-4 flex justify-between">
              <div className="flex flex-col w-full text-white mr-4 hot-score">
                <div className="flex items-center justify-between border-2 border-[#E8DEF8] rounded-xl mb-4 bg-[#161616]">
                  <span className="font-bold px-2 py-1 text-xs flex items-center">
                    🔥 <span className="ml-1">{currentUser.hotScore}%</span>
                  </span>
                  <div className="relative w-full bg-gray-300 rounded-full h-[4.5px] ml-2 mr-2">
                    <div
                      className="absolute top-0 h-full bg-[#8274E9] rounded-full"
                      style={{ width: `${currentUser.hotScore}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col w-full text-white ml-4 karma-score">
                <div className="flex items-center justify-between border-2 border-[#E8DEF8] rounded-xl mb-4 bg-[#161616]">
                  <span className="font-bold px-2 py-1 text-xs flex items-center">
                    👼 <span className="ml-1">{currentUser.karmaScore}%</span>
                  </span>
                  <div className="relative w-full bg-gray-300 rounded-full h-[4.5px] ml-2 mr-2">
                    <div
                      className="absolute top-0 h-full bg-[#A340B8] rounded-full"
                      style={{ width: `${currentUser.karmaScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transparent interaction buttons */}
        <div className="absolute bottom-[-90px] left-0 right-0 flex justify-between items-center pb-4 px-6">
          <button
            onClick={() => handleButtonClick("SLAP")}
            className={`slap-button ml-4 border border-[#EADDFF] w-20 h-20 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-[#1E1D20] shadow-none ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
            }`}
            disabled={isLoading}
          >
            <span className="text-3xl sm:text-2xl">✋</span>
          </button>
          <button
            onClick={() => handleButtonClick("KISS")}
            className={`kiss-button mr-4 border border-[#BAF8ED] w-20 h-20 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-[#1E1D20] shadow-none ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
            }`}
            disabled={isLoading}
          >
            <span className="text-3xl sm:text-2xl">😗</span>
          </button>
        </div>
      </div>
    );
  }
);

// Add CSS for the animation
const styles = `
  .animate-click {
    animation: clickEffect 0.3s ease-in-out;
  }

  @keyframes clickEffect {
    0% { transform: scale(1); }
    50% { transform: scale(1.5); }
    100% { transform: scale(1); }
  }
`;

// Inject styles into the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

InteractUserProfile.displayName = 'InteractUserProfile';

export default InteractUserProfile;
