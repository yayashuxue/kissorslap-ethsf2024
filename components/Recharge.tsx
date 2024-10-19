import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { usePrivy } from "@privy-io/react-auth";
import { Spinner } from "@/components/Spinner";
import { FormField } from "@/components/FormField";
import { useOnboardingData } from "@/app/hooks/useOnboardingData";
import Button from "./Button";

// Initialize Stripe with your public key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface RechargeProps {
  onClose: () => void;
}

const Recharge: React.FC<RechargeProps> = ({ onClose }) => {
  const pathname = usePathname();
  const { user } = usePrivy();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { data } = useOnboardingData();
  const rechargeOptions = [
    { amount: 10, points: 90 },
    { amount: 20, points: 185 },
    { amount: 50, points: 470 },
  ];

  const handleSelectAmount = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAmount(null);
    setCustomAmount(e.target.value);
  };

  const handleSubmit = async () => {
    const amount = selectedAmount || parseFloat(customAmount);

    if (!amount || amount < 5) {
      setError("Amount must be at least $5.");
      return;
    }

    if (!user) {
      setError("User not authenticated.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const stripe = await stripePromise;

      const currentUrl = `${window.location.origin}${pathname}`;

      const response = await fetch("/api/checkout_session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          userId: user.id,
          returnUrl: currentUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await response.json();

      if (stripe) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to initiate payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 z-10000">
      <div className="w-full max-w-md mx-auto bg-[#161616] opacity-2 p-8 rounded-xl shadow-lg border relative">
        {/* Close Button */}
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

            <p className="self-stretch font-semibold text-white text-xl text-center">
              Select a recharge amount:
            </p>

            <div className="w-full">
              <input
                type="number"
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder="Or enter custom amount (USD)"
                className="w-full px-4 py-3 bg-transparent border border-purple-300 border-opacity-30 rounded-lg text-white placeholder-gray-500"
              />
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
                  <div className="font-bold text-white text-lg">
                    ${option.amount}
                  </div>
                  <div className="text-white text-sm">{option.points} pts</div>
                </button>
              ))}
            </div>

            {error && <p className="text-red-500 mt-2">{error}</p>}

            <Button
              onClick={handleSubmit}
              loading={isLoading}
              text={"Recharge"}
              variant="secondary"
            ></Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recharge;
