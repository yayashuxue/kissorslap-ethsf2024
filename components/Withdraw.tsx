"use client";

import React, { useState, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useOnboardingData } from "@/app/hooks/useOnboardingData";
import Button from "@/components/Button";
import { rechargeOptions } from "@/components/Recharge";
interface WithdrawProps {
  onClose: () => void;
}

const Withdraw: React.FC<WithdrawProps> = ({ onClose }) => {
  const { user } = usePrivy();
  const { data } = useOnboardingData();
  const [selectedChain, setSelectedChain] = useState<string>("polygon");
  const [withdrawAmount, setWithdrawAmount] = useState<number | null>(null);
  const [withdrawAddress, setWithdrawAddress] = useState<string>("");
  const [error, setError] = useState<string>("");


  // Function to calculate amount and flowAmount based on points
  const calculateAmount = (points: number) => {
    const basePoints = rechargeOptions[0].points;
    const baseAmount = rechargeOptions[0].amount;
    const baseFlowAmount = rechargeOptions[0].flowAmount;

    const usdcAmount = (points / basePoints) * baseAmount * 0.98; // Multiply by 0.98 for fee deduction
    const flowAmount = (points / basePoints) * baseFlowAmount * 0.98;

    return { usdcAmount, flowAmount };
  };

  const handleChainSelection = (chain: string) => {
    setSelectedChain(chain);
  };

  const handleWithdraw = useCallback(async () => {
    if (!user) {
      setError("User not authenticated.");
      return;
    }

    if (!withdrawAmount || withdrawAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (!withdrawAddress) {
      setError("Please enter a valid address.");
      return;
    }

    try {
      setError("");

      // Calculate token amount based on points
      const { usdcAmount, flowAmount } = calculateAmount(withdrawAmount);

      const response = await fetch("/api/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chain: selectedChain,
          amount: selectedChain === "polygon" ? usdcAmount : flowAmount,
          address: withdrawAddress,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to process withdrawal");
      }

      console.log("Withdrawal successful");
    } catch (err) {
      console.error("Error processing withdrawal:", err);
      setError("Failed to process withdrawal. Please try again.");
    }
  }, [user, selectedChain, withdrawAmount, withdrawAddress]);

  // Realtime calculation based on input points
  const realtimeCalculation = withdrawAmount
    ? calculateAmount(withdrawAmount)
    : { usdcAmount: 0, flowAmount: 0 };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 z-10000">
      <div className="w-full max-w-md mx-auto bg-[#161616] opacity-2 p-8 rounded-xl shadow-lg border relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-2xl font-bold"
        >
          &times;
        </button>

        <div className="relative z-10 w-full flex flex-col items-center space-y-8">
          <h1 className="text-stroke font-press-start text-[30px] leading-[36px] tracking-[3.60px]">
            WITHDRAW
          </h1>

          <div className="flex flex-col w-[350px] items-center justify-center gap-5 px-6 py-8 relative bg-purple-900 bg-opacity-20 rounded-xl">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-gray-400 font-semibold">
                Current Balance:
              </div>
              <div className="inline-flex items-center justify-center px-3 py-2 bg-purple-200 rounded-3xl">
                <span className="text-black text-base mr-1">💰</span>
                <span className="font-mono font-medium text-black text-base">
                  {data.points || 0}PTS
                </span>
              </div>
            </div>

            <div
              className="flex items-center justify-between w-48 p-1 bg-gray-800 rounded-full cursor-pointer text-md"
              onClick={() =>
                handleChainSelection(
                  selectedChain === "polygon" ? "flow" : "polygon"
                )
              }
            >
              <div
                className={`flex-1 flex items-center justify-center gap-2 text-center py-1 rounded-full transition-colors duration-300 ${
                  selectedChain === "flow"
                    ? "bg-yellow-500 text-black"
                    : "text-white"
                }`}
              >
                <img src="/flow.png" alt="FLOW" className="w-4 h-4" />
                FLOW
              </div>
              <div
                className={`flex-1 flex items-center justify-center gap-2 text-center py-1 rounded-full transition-colors duration-300 ${
                  selectedChain === "polygon"
                    ? "bg-yellow-500 text-black"
                    : "text-white"
                }`}
              >
                <img src="/usdc.png" alt="Polygon" className="w-4 h-4" />
                USDC
              </div>
            </div>

            <input
              type="number"
              placeholder="Amount in points"
              value={withdrawAmount || ""}
              onChange={(e) => setWithdrawAmount(parseInt(e.target.value))}
              className="w-full p-2 mt-4 bg-gray-800 text-white rounded"
            />

            <div className="text-sm text-gray-400">
              <p>
                {`USDC: ${realtimeCalculation.usdcAmount.toFixed(
                  2
                )} | FLOW: ${realtimeCalculation.flowAmount.toFixed(2)}`}
              </p>
            </div>

            <input
              type="text"
              placeholder="Withdrawal Address"
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
              className="w-full p-2 mt-4 bg-gray-800 text-white rounded"
            />

            {error && <p className="text-red-500 mt-2">{error}</p>}

            <Button
              onClick={handleWithdraw}
              className="w-full p-2 mt-4 bg-yellow-500 text-black rounded"
              text="Withdraw"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;
