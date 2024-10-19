"use client";

import React, { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import { User, Action } from "@prisma/client";
import Link from "next/link";
import {useOnboardingData} from "@/app/hooks/useOnboardingData";
import InteractUserProfile from "@/components/InteractUserProfile/page";
import Recharge from "@/components/Recharge"; // Assuming Recharge is a component
import Button from "@/components/Button";
import { useRouter } from "next/navigation";
import NoMoreMatches from "@/components/NoMoreMatches";
interface ExtendedUser extends User {
  name: string;
  images: { imageUrl: string }[];
  otherUserActed: boolean;
}

export default function UserInteraction({ users }: { users: ExtendedUser[] }) {
  const { authenticated, user } = usePrivy();
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [remainingUsers, setRemainingUsers] = useState(users);
  const [modalVisible, setModalVisible] = useState(false);
  const [interactionResult, setInteractionResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRecharge, setShowRecharge] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const router = useRouter();
  const { updateData } = useOnboardingData();

  useEffect(() => {
    if (authenticated && user) {
      setRemainingUsers(users);
      setCurrentUserIndex(0);
      setInteractionResult("");
      setModalVisible(false);
    }
  }, [authenticated, user, users]);

  const handleNextUser = async (interactionType: Action) => {
    const targetUser = remainingUsers[currentUserIndex];

    if (!targetUser || isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUser: targetUser.id,
          interactionType,
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        if (response.status == 400) {
          throw new Error(
              "Not enough points to make an interaction. \nBuy some pts at the 💰 button on top right!"
          );
        }
        throw new Error(errorMessage || "Failed to record interaction.");
      }

      const data = await response.json();
      console.log("Interaction Result:", data);

      if (data.newPoints !== undefined) {
        // Use updateData to update only the points
        updateData({ points: data.newPoints });
      }

      if (data.result && data.result !== "PENDING") {
        setInteractionResult(data.result);
        setModalVisible(true);
        if (data.result === "MUTUAL_KISS" && data.chatId) {
          setChatId(data.chatId);
        }
      } else {
        removeUserFromStack();
      }
    } catch (error) {
      console.log("Error during interaction:", error);
      if (error instanceof Error) {
        let errorMessage = error.message;
        try {
          const parsedError = JSON.parse(error.message);
          if (parsedError.error) {
            errorMessage = parsedError.error;
          }
        } catch (e) {
          // If parsing fails, use the original error message
        }
        alert(errorMessage);
        setShowRecharge(true);
      } else {
        alert("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const removeUserFromStack = () => {
    const newRemainingUsers = remainingUsers.filter(
      (_, index) => index !== currentUserIndex
    );
    setRemainingUsers(newRemainingUsers);

    if (currentUserIndex >= newRemainingUsers.length) {
      setCurrentUserIndex(0);
    }
  };

  const currentUser = remainingUsers[currentUserIndex];
  // console.log("Current User:", currentUser);
  if (!authenticated) {
    return (
      <div className="flex justify-center mt-52 min-h-screen ">
        <div className="w-24 h-24 border-4 border-yellow-500 border-dashed rounded-full animate-spin-slow glow-shrink"></div>
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg) scale(1);
              box-shadow: 0 0 10px rgba(230, 167, 64, 0.5);
            }
            50% {
              transform: rotate(180deg) scale(0.8);
              box-shadow: 0 0 20px rgba(230, 167, 64, 0.8);
            }
            100% {
              transform: rotate(360deg) scale(1);
              box-shadow: 0 0 10px rgba(230, 167, 64, 0.5);
            }
          }

          .animate-spin-slow {
            animation: spin 3s linear infinite; /* Slower animation speed (3s) */
          }

          .glow-shrink {
            box-shadow: 0 0 10px rgba(230, 167, 64, 0.5); /* Initial glow effect */
          }
        `}</style>
      </div>
    );
  }

  if (!currentUser) {
    return <NoMoreMatches />;
  }


  return (
    <div className="flex flex-col items-center justify-center text-neutral-800 mt-4">
      <InteractUserProfile
        currentUser={currentUser}
        handleNextUser={handleNextUser}
        isLoading={isLoading}
      />
      {/* Modal for interaction result */}
      {modalVisible && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md mx-auto relative z-50">
          <h3 className="text-2xl font-bold mb-4">
            
            {
            interactionResult === "MUTUAL_KISS"
              ? "It's a Match! Both +💰 10. You can chat now!"
              : interactionResult === "SLAP_KISS"
              ? "Ouch! You got slapped! -💰 10, they +💰 15"
              : interactionResult === "MUTUAL_SLAP"
              ? "You slapped each other! 😂 Both get back 💰 5"
              : interactionResult === "KISS_SLAP"
              ? "They kissed, you slapped! Successfully rugged +💰 15, they get 💰 0"
              : "Interaction Result"}
          </h3>

          <div className="flex flex-col gap-4">
            {interactionResult === "MUTUAL_KISS" && chatId && (<Button
              onClick={() => {
                setModalVisible(false);
                removeUserFromStack();
              }}
              text="Continue"
              variant="secondary"
            />)}
            <Button
              text="Go to Chat"
              onClick={() => {
                setModalVisible(false);
                removeUserFromStack();
                router.push(`/chat/${chatId}`);
              }}
              variant="primary"
            />
          </div>
        </div>
      </div>
      )}
      {showRecharge && <Recharge onClose={() => setShowRecharge(false)} />}
    </div>
  );
}
