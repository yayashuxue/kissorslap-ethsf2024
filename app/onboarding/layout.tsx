"use client";

import React, { useState, useEffect, useRef } from "react";
import { ProgressBar } from "@/components/ProgressBar";
import { usePathname } from "next/navigation";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname = usePathname();
  const [showDesignImage, setShowDesignImage] = useState(true);
  const [showSlapImage, setShowSlapImage] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img) {
      if (img.complete) {
        // 图片已经加载完成（可能是从缓存加载的）
        if (img.naturalWidth === 0) {
          // 图片加载失败
          setShowDesignImage(false);
        }
      } else {
        // 图片还在加载中
        img.onload = () => {
          // 图片加载成功
        };
        img.onerror = () => {
          // 图片加载失败
          setShowDesignImage(false);
        };
      }
    }
  }, []);

  // 如果在 Step 5，不显示某些组件
  const isStep5 = pathname.includes("/onboarding/step5");

  return (
    <div className="bg-transparent flex flex-row justify-center w-full min-h-screen relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {showDesignImage && (
          <img
            ref={imgRef}
            className="absolute w-full h-full object-cover"
            src="/design.svg"
            alt=""
            style={{ display: showDesignImage ? 'block' : 'none' }}
          />
        )}
        <div className="absolute inset-0 bg-black opacity-30"></div>
      </div>
      <div className="relative w-full max-w-[393px] min-h-screen py-[113px] px-5 z-10">
        {!isStep5 ? (
        <div className="relative pt-6 pb-16 w-full min-h-[400px] bg-[#ffffff0f] rounded-[9.88px] border-[5px] border-solid border-transparent [border-image:linear-gradient(to_bottom,rgba(255,218.44,220.62,0.01),rgb(89,79,172))_1] bg-cover bg-[50%_50%] flex flex-col justify-between overflow-visible">
          <div className="relative flex flex-col justify-between mx-6 my-10">
            {children}
          </div>
          {showSlapImage && (
            <img
              className="absolute w-[178px] h-[196px] left-0 bottom-0 transform translate-y-1/2"
              alt="Slap"
              src="/slap.png"
              onError={() => setShowSlapImage(false)}
            />
          )}
        </div>) : (
          <div className="relative flex flex-col justify-between">{children}</div>
        )
        }
      </div>
      {!isStep5 && (
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 inline-flex items-start gap-[8.11px]">
        <div className="font-press-start font-normal text-[#ecece2] text-xs tracking-[1.44px] leading-[18.3px] whitespace-nowrap">
          KISS
        </div>
        <div className="font-press-start font-normal text-[#ecece2] text-xs tracking-[1.44px] leading-[18.3px] whitespace-nowrap">
          OR
        </div>
        <div className="font-press-start font-normal text-[#ecece2] text-xs tracking-[1.44px] leading-[18.3px] whitespace-nowrap">
          SLAP
        </div>
      </div>
      )
      }
    </div>
  );
}