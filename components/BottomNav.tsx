"use client"; // This marks the component as a Client Component
import { FaUser, FaHeart, FaComments, FaGift, FaTrophy } from "react-icons/fa";
import { usePrivy } from "@privy-io/react-auth"; // Import Privy hook
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const handleReferClick = (
  event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
) => {
  event.preventDefault();
  alert("You can exchange points to gift cards here. Opening Soon!");
};

export default function BottomNav() {
  const { authenticated } = usePrivy(); // Use the Privy hook for authentication status
  const pathname = usePathname();

  if (pathname.startsWith("/onboarding") || pathname === "/" || pathname.startsWith("/testing")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[rgba(30,30,30,0.9)] text-gray-300 flex justify-around py-6 border-t border-gray-700 shadow-md shadow-[rgba(0,0,0,0.2)] backdrop-blur-md transition-all duration-300">
      <Link
        href="/interact"
        className="flex flex-col items-center text-gray-300 hover:text-purple-300 transition-colors duration-200"
      >
        <FaHeart size={24} />
      </Link>
      <Link
        href="/refer"
        className="flex flex-col items-center text-gray-300 hover:text-purple-300 transition-colors duration-200"
        onClick={handleReferClick}
      >
        <FaGift size={24} />
      </Link>
      <Link
        href="/interactions"
        className="flex flex-col items-center relative text-gray-300 hover:text-purple-300 transition-colors duration-200"
      >
        <FaComments size={24} />
      </Link>
      <Link
        href="/leaderboard"
        className="flex flex-col items-center text-gray-300 hover:text-purple-300 transition-colors duration-200"
      >
        <FaTrophy size={24} />
      </Link>
      <Link
        href="/profile"
        className="flex flex-col items-center text-gray-300 hover:text-purple-300 transition-colors duration-200"
      >
        <FaUser size={24} />
      </Link>
    </nav>
  );
}
