// "use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import Login from "../components/Login";
import GameDemo from "@/components/GameDemo";

export default function Header() {
  // const [isScrolled, setIsScrolled] = useState(false);

  // // Effect to handle scroll and set header background
  // useEffect(() => {
  //   const handleScroll = () => {
  //     if (window.scrollY > 50) {
  //       setIsScrolled(true);
  //     } else {
  //       setIsScrolled(false);
  //     }
  //   };

  //   window.addEventListener("scroll", handleScroll);

  //   return () => {
  //     window.removeEventListener("scroll", handleScroll);
  //   };
  // }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <GameDemo />
    </div>
  );
}
