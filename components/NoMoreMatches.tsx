"use client";

import React from "react";
import Link from "next/link";

export default function NoMoreMatches() {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center text-center">
        <h2 className="text-stroke font-press-start text-[18px] leading-[36px] tracking-[3.60px] mb-4">
          No more matches!
        </h2>
        <div className="bg-purple-300 bg-opacity-20 rounded-xl p-6 max-w-[350px]">
          <p className="text-white mb-4">
            You've interacted with all available users. Please check back later!
          </p>
          <p className="text-sm text-white my-4">
            We are working on finding more users for you. Check back soon!
          </p>

          <Link
            href="/interactions"
            className="block w-full mb-4 px-6 py-3 bg-[#E6A740] text-white rounded-lg shadow-md hover:bg-yellow-500 focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:ring-opacity-50 transition-all duration-300 ease-in-out"
          >
            Chat with Match
          </Link>
          <Link
            href="/profile#prior-interactions"
            className="block w-full mb-4 px-6 py-3 bg-[#E6A740] text-white rounded-lg shadow-md hover:bg-yellow-500 focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:ring-opacity-50 transition-all duration-300 ease-in-out"
          >
            See Past Interactions
          </Link>
        </div>
      </div>
    </div>
  );
}

