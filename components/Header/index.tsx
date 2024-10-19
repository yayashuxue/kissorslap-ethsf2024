"use client"; // Required for using hooks in client-side components
import { useState, useEffect } from "react";
import Link from "next/link";
import { useOnboardingData } from "../../app/hooks/useOnboardingData";
import { usePrivy } from "@privy-io/react-auth"; // Import Privy hook
import Recharge from "@/components/Recharge";
import { usePathname, useRouter } from "next/navigation";
import "@/app/globals.css";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { data } = useOnboardingData();
  const { login, logout, authenticated } = usePrivy(); // Use Privy hook
  const [showRecharge, setShowRecharge] = useState(false);
  const [pointsDropdownVisible, setPointsDropdownVisible] = useState(false);
  const [usernameDropdownVisible, setUsernameDropdownVisible] = useState(false);
  const router = useRouter();
  const handlePointsClick = () => {
    setPointsDropdownVisible(!pointsDropdownVisible);
  };

  
  const handleUsernameClick = () => {
    setUsernameDropdownVisible(!usernameDropdownVisible);
  };
  const handleRechargeClick = () => {
    setShowRecharge(true);
  };

  // Effect to handle scroll and set header background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    await logout(); // Trigger logout
    window.location.href = "/"; // Redirect after logout
  };
  const pathname = usePathname();

  if (
    pathname.startsWith("/onboarding") && pathname !== "/onboarding/step5" ||
    pathname === "/" ||
    pathname.startsWith("/testing")
  ) {
    return null;
  }

  return (
    <>
      <div className="font-press-start sticky top-0 z-[10000]">
        <header className="fixed top-0 left-0 right-0 z-50 bg-cover bg-[50%_50%] z-10000">
          <div className="flex justify-between items-center h-full py-4 px-8 max-w-7xl mx-auto">
            {/* Logo Section */}
            <div className="grid grid-rows-3 gap-2">
              <div className="text-[#ecece2] text-sm tracking-[1.68px] leading-[18px]">
                KISS
              </div>
              <div className="text-[#ecece2] text-sm tracking-[1.68px] leading-[18px]">
                OR
              </div>
              <div className="text-[#ecece2] text-sm tracking-[1.68px] leading-[18px]">
                SLAP
              </div>
            </div>

            {/* <div className="sm:flex sm:items-center sm:gap-2">
              <span className="sm:hidden text-[#ecece2] text-xs tracking-[1.68px] leading-[18px]">
                KissOsSlap
              </span>

              <div className="hidden sm:text-[#ecece2] text-sm tracking-[1.68px] leading-[18px]">
                KISS
              </div>
              <div className="hidden sm:text-[#ecece2] text-sm tracking-[1.68px] leading-[18px]">
                OR
              </div>
              <div className="hidden sm:text-[#ecece2] text-sm tracking-[1.68px] leading-[18px]">
                SLAP
              </div>
            </div> */}

            {data && data.username && (
              <div className="flex items-center space-x-2">
                <div className="inline-flex items-center justify-center gap-0.5 px-3 py-2 rounded-3xl overflow-hidden border border-solid border-white hidden sm:flex">
                  <div className="font-sans text-white text-base text-center">
                    🔥
                  </div>
                  <div className="font-sans text-white text-base text-center">
                    {data.hotScore}%
                  </div>
                </div>
                <div className="inline-flex items-center justify-center gap-0.5 px-3 py-2 rounded-3xl overflow-hidden border border-solid border-white hidden sm:flex">
                  <div className="font-sans text-white text-base text-center">
                    😈
                  </div>
                  <div className="font-sans text-white text-base text-center">
                    {data.karmaScore}%
                  </div>
                </div>
                <div className="relative">
                  <button
                    className="inline-flex items-center justify-center gap-0.5 px-3 py-2 rounded-3xl overflow-hidden border border-solid border-white bg-purple"
                    onClick={handlePointsClick}
                  >
                    <div className="points inline-flex items-center gap-0.5">
                      <div className="font-sans text-white text-base text-center">
                        💰
                      </div>
                      <div className="font-sans font-medium text-white text-base text-center">
                        {data.points}
                      </div>
                    </div>
                    <img
                      className="w-[18.1px] h-[10.65px]"
                      alt="Group"
                      src="/dropdown.png"
                      width={18}
                      height={11}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />{" "}
                  </button>
                  {pointsDropdownVisible && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-50">
                      <button
                        className="block w-48 text-left px-4 py-2 text-black hover:bg-gray-100 text-xs"
                        onClick={handleRechargeClick}
                      >
                        Add 💰
                      </button>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    className="text-xs cursor-pointer text-white"
                    onClick={handleUsernameClick}
                  >
                    {data.username}
                  </button>
                  {usernameDropdownVisible && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-50">
                      <button
                        className="block w-48 text-left px-4 py-2 text-black hover:bg-gray-100 text-xs"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>
      </div>
      <div className="h-24"></div> {/* Spacer div */}
      {showRecharge && <Recharge onClose={() => setShowRecharge(false)} />}
    </>
  );
}
