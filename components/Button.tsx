import React from "react";

interface ButtonProps {
  text: string | React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
  loading?: boolean;
  className?: string; // Add className prop
}

const Button: React.FC<ButtonProps> = ({
  text,
  onClick,
  variant = "primary",
  loading = false,
  className = "", // Default to an empty string
}) => {
  const baseClasses =
    "flex items-center justify-center gap-2 p-4 relative w-full rounded-xl overflow-hidden z-10 sm:p-3";
  
  const primaryClasses =
    "before:content-[''] before:absolute before:inset-0 before:p-[2px] before:bg-gradient-to-b before:from-[#d0bcff] before:to-[#ffef9d] before:rounded-xl before:-z-10 after:content-[''] after:absolute after:inset-[2px] after:bg-[#1d1d1b] after:rounded-[calc(0.75rem-2px)] after:-z-[5]";
  
  const secondaryClasses =
    "bg-gradient-to-b from-[#e8def8] to-[#ffef9d] border-[2.88px] border-solid border-[#453c89] sm:border-[2px]";
  
  const buttonClasses =
    "relative w-full font-inter font-bold text-lg leading-[25.9px] rounded-xl sm:text-[20px] sm:leading-[23px]";
  
  const primaryTextClasses = "text-[#eeeeee]";
  const secondaryTextClasses = "text-[#1d1d1b]";
  return (
    <div
      className={`${baseClasses} ${
        variant === "primary" ? primaryClasses : secondaryClasses
      } ${className}`} // Apply className here
    >
      <button
        onClick={onClick}
        className={`${buttonClasses} ${
          variant === "primary" ? primaryTextClasses : secondaryTextClasses
        }`}
        disabled={loading}
      >
        {loading ? (
          <div className="flex justify-center items-center w-full h-full">
            <div className="spinner border-t-transparent border-solid border-4 border-white rounded-full w-6 h-6 animate-spin"></div>
          </div>
          ) : (
          text
        )}
      </button>
    </div>
  );
};

export default Button;