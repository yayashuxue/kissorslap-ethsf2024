import React from "react";

interface ProgressBarProps {
  step: number;
  totalSteps: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  step,
  totalSteps,
}) => {
  const percentage = (step / totalSteps) * 100;

  return (
    <div className="relative w-[317px] h-[194px] overflow-visible">
      <div className="w-[317px] h-[194px]">
        <div className="relative h-[194px]">
          <div className="inline-flex h-[23px] items-center justify-center gap-[3.36px] absolute top-[89px] left-0 z-10">
            <div className="w-[73px] h-[3px] bg-[#eaddff] rounded-[1.51px]" />
            <div className="w-[100px] h-[3px] bg-[#ffffff40] rounded-[1.51px]" />
            <div className="w-[137px] h-[3px] bg-[#ffffff40] rounded-[1.51px]" />
          </div>
          <img
            className="absolute w-[155px] h-[155px] top-5 object-cover transition-all duration-500 ease-in-out z-20"
            alt="Lips"
            src="/lips.png"
            style={{
              left: `${percentage}%`,
              transform: `translateX(-50%) rotate(16.56deg)`,
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </div>
    </div>
  );
};
