"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import Login from "../components/Login";

const GameDemo = () => {
  const [result, setResult] = useState({
    message: "CLICK BUTTON!",
    description: "See how you play as a kisser or slapper in game",
    you: null,
    other: null,
  });
  const [selectedButton, setSelectedButton] = useState<string | null>(null);

  const handleAction = (action) => {
    setSelectedButton(action);
    switch (action) {
      case "slap_kiss":
        setResult({
          message: "😈😈😈",
          description: "You Slapped, They Kissed",
          you: 15,
          other: 0,
        });
        break;
      case "kiss_kiss":
        setResult({
          message: "CHAT NOW",
          description: "Mutual Kiss! Both +💰 10",
          you: 10,
          other: 10,
        });
        break;
      case "kiss_slap":
        setResult({
          message: "OUCH!",
          description: "You Kiss, They Slap!",
          you: 0,
          other: 15,
        });
        break;
      case "slap_slap":
        setResult({
          message: "Slashed!",
          description: "Both Got Partial Points Back",
          you: 5,
          other: 5,
        });
        break;
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-between text-white gap-4 min-h-screen"
      style={{
        padding: "5vh 5vw",
        boxSizing: "border-box",
      }}
    >
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div
          id="noise-bg"
          className="absolute w-full h-full bg-repeat mix-blend-overlay opacity-75"
          style={{
            backgroundImage: 'url("/noise.svg")',
            backgroundSize: "1000px 1000px",
            backgroundRepeat: "repeat",
          }}
        />
        <div
          id="kissorslap-bg"
          className="absolute w-full h-full bg-repeat mix-blend-overlay opacity-75"
          style={{
            backgroundImage: 'url("/kissorslap-light.svg")',
            backgroundSize: "1000px 1000px",
            backgroundRepeat: "repeat",
          }}
        />
      </div>

      <div className="text-center w-full flex-grow">
        <h1 className="font-press-start text-3xl font-bold mb-4 text-[#f9f9f8] font-normal text-[21px] tracking-[2.52px] leading-[29.5px] whitespace-nowrap">
          KISS{" "}
          <span className="bg-blue rounded-lg p-2 tracking-[2.52px] leading-[29.5px] ">
            OR
          </span>{" "}
          SLAP
        </h1>
        <p className="text-[16px] font-weight-400">
          Discover a fun, interactive game where players earn rewards through
          playful interactions. Points can be{" "}
          <span className="text-stroke font-press-start">redeemed</span>
          {" & "}
          <span className="text-stroke font-press-start">cashed out</span>
        </p>
      </div>

      <div className="relative flex flex-col items-center justify-center w-full max-w-md h-auto border-white border-1 bg-purple-300 bg-opacity-20 rounded-3xl py-8 px-6 text-center gap-4 flex-grow">
        <p className="text-2xl font-bold mb-2 text-stroke font-press-start text-center tracking-[2.88px] leading-[48px]">
          {result.message}
        </p>
        <p>{result.description}</p>

        {result.you !== null && (
          <p className="break-words ">
            You Got{"   "}
            <span
              className={`font-press-start ${
                result.you < 10 ? "text-stroke-red" : "text-stroke"
              }`}
            >
              {result.you}
            </span>
            {"   "}
            Points
          </p>
        )}
        {result.other !== null && <p>Other Got {result.other} Points</p>}
      </div>

      <div className="w-full max-w-md flex-grow">
        <div className="grid grid-cols-2 gap-4 mb-4">
          {["kiss_kiss", "kiss_slap", "slap_kiss", "slap_slap"].map(
            (action, index) => (
              <button
                key={index}
                onClick={() => handleAction(action)}
                className={`px-5 py-2 text-center font-bold rounded-lg overflow-hidden ${
                  selectedButton === action
                    ? "bg-gradient-to-b from-[#e8def8] to-[#ffef9d] border-[2.88px] border-solid border-[#453c89] text-[#1d1d1b]"
                    : "bg-purple-300 bg-opacity-20 border-white border-1 text-white"
                }`}
                style={{
                  backgroundImage:
                    selectedButton !== action ? 'url("/noise.svg")' : undefined,
                  backgroundSize: "500px 500px",
                  backgroundRepeat: "repeat",
                  borderRadius: "8px",
                }}
              >
                <div className="flex items-center justify-between relative">
                  <div className="items-start flex flex-col w-[55px] relative">
                    <div className="relative self-stretch h-[21px] mt-[-1.00px] font-body-small font-[number:var(--body-small-font-weight)] text-[#aeaeb2] text-[length:var(--body-small-font-size)] tracking-[var(--body-small-letter-spacing)] leading-[var(--body-small-line-height)] whitespace-nowrap [font-style:var(--body-small-font-style)]">
                      You
                    </div>
                    <div className="ml-[-2.00px] text-[#f9f9f8] relative w-fit font-subtitle w-8 h-[38px] text-[32px]">
                      {action.startsWith("kiss") ? "😘" : "👋"}
                    </div>
                  </div>
                  <div className="items-end flex flex-col w-[55px] relative">
                    <div className="relative self-stretch h-[21px] mt-[-1.00px] font-body-small font-[number:var(--body-small-font-weight)] text-[#aeaeb2] text-[length:var(--body-small-font-size)] text-right tracking-[var(--body-small-letter-spacing)] leading-[var(--body-small-line-height)] whitespace-nowrap [font-style:var(--body-small-font-style)]">
                      Other
                    </div>
                    <div className="text-black relative w-fit w-8 h-[38px] text-[32px]">
                      {action.endsWith("slap") ? "👋" : "😘"}
                    </div>
                  </div>
                </div>
              </button>
            )
          )}
        </div>
        <div className="w-full">
          <Login></Login>
        </div>
      </div>
    </div>
  );
};

export default GameDemo;
