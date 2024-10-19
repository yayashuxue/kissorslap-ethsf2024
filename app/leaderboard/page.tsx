"use client";

import React, { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useOnboardingData } from "../hooks/useOnboardingData";
import "@/app/globals.css";

interface User {
  id: string;
  username: string;
  name: string | null;
  hotScore: number;
  karmaScore: number;
  points: number;
  totalInteractionsReceived: number;
}

export default function LeaderboardPage() {
  const { authenticated } = usePrivy();
  const [leaderboardData, setLeaderboardData] = useState<User[]>([]);
  const { data } = useOnboardingData();
  const [currentUserData, setCurrentUserData] = useState<User | null>(null);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchLeaderboard = async (page: number) => {
    try {
      const response = await fetch(`/api/leaderboard?page=${page}`);
      if (!response.ok) {
        toast.error("Failed to fetch leaderboard");
        return;
      }
      const data = await response.json();
      setLeaderboardData(data.users);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setCurrentUserRank(data.currentUserRank);
      setCurrentUserData(data.currentUser);
    } catch (error) {
      toast.error("Error fetching leaderboard");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchLeaderboard(currentPage);
    }
  }, [authenticated, currentPage]);

  if (!authenticated) {
    return (
      <div className="text-center mt-8">
        Please log in to view the leaderboard.
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center mt-8">Loading leaderboard...</div>;
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setIsLoading(true);
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 pb-24">
      <div className="w-full max-w-[350px] h-7 top-0 left-0 text-center text-stroke font-press-start text-[18px] leading-[36px] tracking-[3.60px] mb-6">
        LEADERBOARD
      </div>

      {/* Current User's Rank */}
      {currentUserData && currentUserRank && (
        <div className="flex w-full max-w-[350px] items-center justify-between px-6 py-4 relative bg-purple-300 bg-opacity-20 rounded-xl mb-6">
          <div className="flex w-16 items-center flex-col relative">
            <img
              src={data.photo || "/kissorslap-logo.png"}
              className="relative self-stretch w-full h-16 rounded-full border border-solid border-white object-cover"
            />
            <div className="relative self-stretch font-body-strong font-[number:var(--body-strong-font-weight)] text-[#d1d1d6] text-[length:var(--body-strong-font-size)] text-center tracking-[var(--body-strong-letter-spacing)] leading-[var(--body-strong-line-height)] [font-style:var(--body-strong-font-style)]">
              {currentUserData.username}
            </div>
          </div>
          <div className="inline-flex items-start justify-center gap-5 self-stretch flex-[0_0_auto] flex-col relative">
            <div className="inline-flex flex-col items-start gap-1 relative flex-[0_0_auto]">
              <p className="relative self-stretch mt-[-1.00px] font-heading font-[number:var(--heading-font-weight)] text-transparent text-[length:var(--heading-font-size)] tracking-[var(--heading-letter-spacing)] leading-[var(--heading-line-height)] [font-style:var(--heading-font-style)]">
                <span className="text-white tracking-[var(--heading-letter-spacing)] font-heading [font-style:var(--heading-font-style)] font-[number:var(--heading-font-weight)] leading-[var(--heading-line-height)] text-[length:var(--heading-font-size)]">
                  🏆 Your Rank:{" "}
                </span>
                <span className="text-[#eaddff] tracking-[var(--heading-letter-spacing)] font-heading [font-style:var(--heading-font-style)] font-[number:var(--heading-font-weight)] leading-[var(--heading-line-height)] text-[length:var(--heading-font-size)]">
                  #{currentUserRank}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-1 relative self-stretch w-full flex-[0_0_auto] bg-cover bg-[50%_50%]">
              <div className="inline-flex items-center justify-center gap-0.5 px-3 py-2 relative flex-[0_0_auto] rounded-3xl overflow-hidden border border-solid border-white">
                <div className="relative w-fit mt-[-1.00px] font-sans font-normal text-white text-base text-center tracking-[0] leading-[14px] whitespace-nowrap">
                  🔥
                </div>
                <div className="relative w-fit mt-[-1.00px] [font-family:'IBM_Plex_Mono-Regular',Helvetica] font-normal text-white text-base text-center tracking-[0] leading-[14px] whitespace-nowrap">
                  {currentUserData.hotScore}
                </div>
              </div>
              <div className="inline-flex items-center justify-center gap-0.5 px-3 py-2 relative flex-[0_0_auto] rounded-3xl overflow-hidden border border-solid border-white">
                <div className="relative w-fit mt-[-1.00px] font-sans font-normal text-white text-base text-center tracking-[0] leading-[14px] whitespace-nowrap">
                  😈
                </div>
                <div className="relative w-fit mt-[-1.00px] font-sans font-normal text-white text-base text-center tracking-[0] leading-[14px] whitespace-nowrap">
                  {currentUserData.karmaScore}
                </div>
              </div>
              <div className="inline-flex items-center justify-center gap-0.5 px-3 py-2 relative flex-[0_0_auto] rounded-3xl overflow-hidden border border-solid border-white">
                <div className="relative w-fit mt-[-1.00px] fontsans font-normal text-white text-base text-center tracking-[0] leading-[14px] whitespace-nowrap">
                  💰
                </div>
                <div className="relative w-fit mt-[-1.00px] [font-family:'IBM_Plex_Mono-Regular',Helvetica] font-normal text-white text-base text-center tracking-[0] leading-[14px] whitespace-nowrap">
                  {currentUserData.points}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      {leaderboardData.length > 0 ? (
        <>
          <div className="overflow-x-auto w-full max-w-[350px] rounded-xl border border-purple-200 mb-6">
            <table className="min-w-full text-white text-sm text-left">
              <thead className="border-b rounded-lg">
                <tr>
                  <th className="py-3 px-2">#</th>
                  <th className="py-3 px-2">User</th>
                  <th className="py-3 px-2">Pts</th>
                  <th className="py-3 px-2">Hot</th>
                  <th className="py-3 px-2">Karma</th>
                  <th className="py-3 px-2">Int</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData
                  .filter(user => user.username) // Filter out entries with null or empty username
                  .map((user, index) => (
                    <tr key={user.id} className="border-b hover:bg-purple">
                      <td className="py-3 px-2">
                        {(currentPage - 1) * 50 + index + 1}
                      </td>
                      <td className="py-3 px-2 truncate max-w-[100px]">
                        {user.username}
                      </td>
                      <td className="py-3 px-2">${user.points}</td>
                      <td className="py-3 px-2">{user.hotScore}</td>
                      <td className="py-3 px-2">{user.karmaScore}</td>
                      <td className="py-3 px-2">
                        {user.totalInteractionsReceived}
                      </td>
                    </tr>

                  ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-center mt-6 space-x-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-lg ${
                currentPage === 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#E6A740] hover:bg-yellow-500"
              } text-white`}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg ${
                    currentPage === page
                      ? "bg-neutral-800 text-white"
                      : "bg-white text-neutral-800 border border-neutral-300 hover:bg-neutral-100"
                  }`}
                >
                  {page}
                </button>
              )
            )}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-lg ${
                currentPage === totalPages
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#E6A740] hover:bg-yellow-500"
              } text-white`}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p className="text-center">No users found.</p>
      )}
      {/* Toast Notifications */}
    </div>
  );
}
