// components/HeightAdjuster.tsx
"use client"; // 声明这是一个客户端组件
import { useEffect } from "react";

export default function HeightAdjuster({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const adjustHeightForMobile = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    adjustHeightForMobile(); // 初始调用

    window.addEventListener("resize", adjustHeightForMobile);
    window.addEventListener("orientationchange", adjustHeightForMobile);

    // 清理函数，在组件卸载时移除事件监听器
    return () => {
      window.removeEventListener("resize", adjustHeightForMobile);
      window.removeEventListener("orientationchange", adjustHeightForMobile);
    };
  }, []);

  return <>{children}</>;
}
