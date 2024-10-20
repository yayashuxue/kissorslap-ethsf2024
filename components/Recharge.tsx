"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { Spinner } from "@/components/Spinner";
import { FormField } from "@/components/FormField";
import { useOnboardingData } from "@/app/hooks/useOnboardingData";
import Button from "./Button";
import { generateSecureToken } from "@/app/utils/queries";
import { CBPayInstanceType, initOnRamp } from "@coinbase/cbpay-js";

interface RechargeProps {
  onClose: () => void;
}
export const rechargeOptions = [
  { amount: 1, points: 90, flowAmount: 1.79 },
  { amount: 2, points: 185, flowAmount: 3.57 },
  { amount: 5, points: 470, flowAmount: 8.93 },
];

const Recharge: React.FC<RechargeProps> = ({ onClose }) => {
  const pathname = usePathname();
  const { user } = usePrivy();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [selectedAsset, setSelectedAsset] = useState<string>("USDC");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { data } = useOnboardingData();
  const [onrampInstance, setOnrampInstance] = useState<CBPayInstanceType | null>(null);



  const calculatePointsFromTransaction = (selectedAmount: number | null, selectedAsset: string) => {
    if (selectedAmount === null) return 0;

    const option = rechargeOptions.find(option => option.amount === selectedAmount);
    return option ? option.points : 0;
  };

  useEffect(() => {
    const ethAddress = selectedAsset === "USDC"
      ? "0xD9F8bf1F266E50Bb4dE528007f28c14bb7edaff7"
      : "0xdd43a14758eb96d3";

    const blockchains = selectedAsset === "USDC" ? ["polygon"] : ["flow"];

    const initializeOnRamp = async () => {

      try {
        const token = await generateSecureToken({
          ethAddress,
          blockchains,
        });

        initOnRamp(
          {
            appId: "66442d99-d795-458d-a102-7e931cb1a8d1",
            widgetParameters: {
              addresses: { ethAddress: blockchains },
              // assets: ["ETH", "USDC", "BTC"],
              defaultAsset: selectedAsset,
              presetFiatAmount: selectedAmount || parseFloat(customAmount) || 1,
              fiatCurrency: "USD",
            },
            onSuccess: async () => {
              console.log("success");

              // Call backend to credit points
              try {
                const response = await fetch("/api/credit-points", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    points: calculatePointsFromTransaction(
                      selectedAmount,
                      selectedAsset
                    ),
                  }),
                  credentials: "include", // This ensures cookies (including privy-token) are sent with the request
                });

                if (!response.ok) {
                  throw new Error("Failed to credit points");
                }

                console.log("Points credited successfully");
              } catch (error) {
                console.error("Error crediting points:", error);
              }
            },
            onExit: () => {
              console.log("exit");
            },
            onEvent: (event) => {
              console.log("event", event);
            },
            experienceLoggedIn: "popup",
            experienceLoggedOut: "popup",
            closeOnExit: true,
            closeOnSuccess: true,
          },
          (_, instance) => {
            setOnrampInstance(instance);
          }
        );
      } catch (error) {
        console.error("Failed to initialize onramp:", error);
      }
    };

    initializeOnRamp();

    return () => {
      onrampInstance?.destroy();
    };
  }, [selectedAsset, selectedAmount, customAmount]);

  const handleSelectAmount = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAmount(null);
    setCustomAmount(e.target.value);
  };

  const handleAssetSelection = (asset: string) => {
    setSelectedAsset(asset);
  };

  const handleRecharge = useCallback(async () => {
    if (!user) {
      setError("User not authenticated.");
      return;
    }

    const amount = selectedAmount || parseFloat(customAmount) || 1;
    if (amount < 1) {
      setError("Amount must be at least $1.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const token = await generateSecureToken({
        ethAddress:
          selectedAsset === "USDC"
            ? "0xD9F8bf1F266E50Bb4dE528007f28c14bb7edaff7"
            : "0xdd43a14758eb96d3",
        blockchains: [selectedAsset === "USDC" ? "polygon" : "flow"],
      });
      console.log("selectedAsset", selectedAsset);
      console.log("token", token);

      const onrampUrl = `https://pay.coinbase.com/buy/select-asset?sessionToken=${token}&defaultAsset=${selectedAsset}&presetFiatAmount=${amount}&fiatCurrency=USD`;

      window.open(onrampUrl, "_blank", "popup,width=540,height=700");
    } catch (err) {
      console.log(err);
      setError("Failed to launch Onramp. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedAmount, customAmount, selectedAsset]);

  const handleClick = () => {
    onrampInstance?.open();
  };

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
            RECHARGE
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
              className="flex items-center justify-between w-48 p-1 bg-gray-800 rounded-full cursor-pointer text-md font-semibold"
              onClick={() =>
                handleAssetSelection(selectedAsset === "FLOW" ? "USDC" : "FLOW")
              }
            >
              <div
                className={`flex-1 flex items-center justify-center gap-2 text-center py-1 rounded-full transition-colors duration-300 ${
                  selectedAsset === "FLOW"
                    ? "bg-yellow-500 text-black"
                    : "text-white"
                }`}
              >
                <img src="/flow.png" alt="FLOW" className="w-4 h-4" />
                FLOW
              </div>
              <div
                className={`flex-1 flex items-center justify-center gap-2 text-center py-1 rounded-full transition-colors duration-300 ${
                  selectedAsset === "USDC"
                    ? "bg-yellow-500 text-black"
                    : "text-white"
                }`}
              >
                <img src="/usdc.png" alt="USDC" className="w-4 h-4" />
                USDC
              </div>
            </div>

            <div className="text-center mt-2 text-sm text-white font-press-start">
              {selectedAsset === "FLOW" ? "Extra Rewards" : "Easiest"}
            </div>

            <div className="grid grid-cols-3 gap-4 w-full">
              {rechargeOptions.map((option) => (
                <button
                  key={option.amount}
                  onClick={() => handleSelectAmount(option.amount)}
                  className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl border ${
                    selectedAmount === option.amount
                      ? "bg-[#E6A740] border-white"
                      : "bg-neutral-600 border-white border-opacity-30 hover:bg-neutral-700"
                  }`}
                >
                  {selectedAsset === "USDC" ? (
                    <>
                      <div className="font-bold text-white text-lg flex items-center">
                        <img
                          src="/usdc.png"
                          alt="USDC"
                          className="w-4 h-4 mr-1"
                        />
                        {option.amount}
                      </div>
                      <div className="text-white text-sm">
                        {option.points} pts
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-bold text-white text-lg flex items-center">
                        <img
                          src="/flow.png"
                          alt="FLOW"
                          className="w-4 h-4 mr-1"
                        />
                        {option.flowAmount.toFixed(2)}
                      </div>
                      <div className="text-white text-sm">
                        {option.points} pts
                      </div>
                    </>
                  )}
                </button>
              ))}
            </div>

            {error && <p className="text-red-500 mt-2">{error}</p>}

            <button onClick={handleClick} disabled={!onrampInstance}>
              <img
                src="/button-cbOnramp-normal-condensed-generic-Light.svg"
                alt="Buy with Coinbase"
                className="w-full h-auto" // Adjust width and height as needed
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recharge;
