"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Spinner";
import Button from "@/components/Button";
import { User, PointDrop } from "@prisma/client";

interface UserData {
  points?: number;
  pointDrops?: PointDrop[];
}

const Congrats = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/getUser");
        if (!response.ok) {
          throw new Error("Failed to fetch user data.");
        }
        const data = await response.json();
        setUserData(data);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load your data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleStartGame = () => {
    router.push("/interact");
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto p-8 mt-10 flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto p-8 mt-10 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const points = userData?.points || 0;
  const pointDrops = userData?.pointDrops || [];

  const messages = pointDrops.map((drop) => {
    let description = "";
    switch (drop.eventType) {
      case "onboarding":
        description = "for completing onboarding";
        break;
      case "pwa_install":
        description = "for installing our app";
        break;
      default:
        description = "";
        break;
    }
    return `You earned ${drop.points} points ${description}.`;
  });

  return (
    <div className="relative w-[364px] h-[402px] mx-auto mt-10 p-8 flex flex-col items-center justify-center">
      <img
        className="absolute w-[194px] h-[194px] top-0 left-0 object-cover"
        src="/lips.png"
      />

      <div className="relative z-10 w-full flex flex-col items-center space-y-8">
        <h1 className="text-stroke font-press-start text-[#f9f9f8] text-[30px] leading-[36px] tracking-[3.60px]">
          CONGRATS!
        </h1>
        <div className="w-full flex flex-col items-center gap-4">
          <p className="text-white text-xl font-semibold leading-[32.0px] text-center">
            You have earned a total of {points} Points!
          </p>
          {messages.map((msg, index) => (
            <p
              key={index}
              className="text-white text-xl font-semibold leading-[32.0px] text-center"
            >
              {msg}
            </p>
          ))}
        </div>
      </div>

      <div className="absolute w-[94px] h-[103px] bottom-4 right-4 rotate-[-8.36deg] opacity-80">
        <img
          className="w-[100px] h-[106px] rotate-[8.36deg] object-cover"
          alt="slap"
          src="/slap.png"
        />
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center w-full px-4 mt-12">
        <Button
          onClick={handleStartGame}
          text="Start Kiss & Slap"
          variant="secondary"
        />
      </div>
    </div>
  );
};

export default Congrats;
