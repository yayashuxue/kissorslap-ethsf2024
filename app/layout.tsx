// app/layout.tsx
import { Inter, Varela_Round, Press_Start_2P } from "next/font/google";

import "./globals.css";
import type { Metadata, Viewport } from "next";
import Providers from "./context/PrivyProvider";
import ServiceOn from "../components/ServiceOn";
import BottomNav from "../components/BottomNav"; // Import client-side component
import Head from "next/head";
import { OnboardingProvider } from "./context/OnboardingProvider";
import { db } from "./db"; // Adjust the path to your Prisma client
import { cookies } from "next/headers"; // To get cookies from request headers
import jwt from "jsonwebtoken";
import Header from "../components/Header";
import {ToastContainer} from "react-toastify";
import HeightAdjuster from "@/components/HeightAdjuster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const varelaRound = Varela_Round({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-varela-round",
});

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});


export const metadata: Metadata = {
  title: "Kiss Or Slap",
  description:
    'Kiss or Slap is a fun and interactive social game where users can make real money through playful interactions. Choose to "Kiss" or "Slap" and win based on your choices. Earn rewards, boost your social karma, and engage in thrilling encounters.',
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: ["nextjs", "next14", "pwa", "next-pwa"],
  authors: [
    {
      name: "Kiss or Slap",
      url: "kissorslap.com",
    },
  ],
  icons: [
    { rel: "apple-touch-icon", url: "/kissorslap-logo.png" },
    { rel: "icon", url: "/kissorslap-logo.png" },
  ],
  appleWebApp: {
    statusBarStyle: "black",
  },
};

export const viewport: Viewport = {
  themeColor: "black",
};

export const generateViewport = () => ({
  viewport: {
    minimumScale: 1,
    initialScale: 1,
    width: "device-width",
    shrinkToFit: "no",
    viewportFit: "cover",
  },
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("privy-token")?.value;

  let initialData = {
    username: "",
    name: "",
    bio: "",
    photo: null,
    hotScore: 0,
    karmaScore: 0,
    points: 0,
    birthday: "",
  };

  if (accessToken) {
    const decoded = jwt.decode(accessToken) as { sub: string };
    const outsideId = decoded.sub;

    const user = await db.user.findUnique({
      where: { outsideId },
      select: {
        age: true,
        username: true,
        name: true,
        bio: true,
        hotScore: true,
        karmaScore: true,
        points: true,
        gender: true,
        genderPreference: true,
        birthday: true,
        images: {
          where: { imageType: "PROFILE" },
          select: { imageUrl: true },
        },
      },
    });

    const firstImageUrl = user?.images?.[0]?.imageUrl || null;
    initialData = {
      birthday: user?.birthday,
      age: user?.age,
      gender: user?.gender,
      genderPreference: user?.genderPreference || "",
      points: user?.points || 0,
      username: user?.username || "",
      name: user?.name || "",
      bio: user?.bio || "",
      photo: firstImageUrl || null,
      hotScore: user?.hotScore || 0,
      karmaScore: user?.karmaScore || 0,
    };
  }
  return (
    <html lang="en" className="h-full">
      <body
        className={`bg-black text-neutral-800 flex flex-col h-full relative ${inter.variable} ${varelaRound.variable} ${pressStart2P.variable}`}
      >
        <ToastContainer style={{ zIndex: 99999 }} />
        <HeightAdjuster>
          <div className="fixed inset-0 overflow-hidden pointer-events-none -z-1">
            <div
              id="noise-bg"
              className="absolute w-full h-full bg-repeat mix-blend-overlay opacity-75"
              style={{
                backgroundImage: 'url("/noise.svg")',
                backgroundSize: "1000px 1000px", // Adjust this value as needed
                backgroundRepeat: "repeat", // Ensure the image repeats correctly
                display: "none", // Initially hide the background
              }}
            />
            <div
              id="kissorslap-bg"
              className="absolute w-full h-full bg-repeat mix-blend-overlay opacity-75"
              style={{
                backgroundImage: 'url("/kissorslap-light.svg")',
                backgroundSize: "1000px 1000px", // Adjust this value as needed
                backgroundRepeat: "repeat", // Ensure the image repeats correctly
                display: "none", // Initially hide the background
              }}
            />
          </div>
          <div
            className="z-10 flex flex-col flex-grow"
            style={{ height: "calc(var(--vh, 1vh) * 100)" }}
          >
            <Providers>
                <OnboardingProvider initialData={initialData}>
                  <div className={`sticky top-0 z-[10000]`}>
                    <Header />
                  </div>
                  <main className="flex-grow min-h-screen bg-transparent relative z-[10]">
                    {children}
                  </main>
                  <div className="relative z-20">
                    <BottomNav />
                  </div>
                </OnboardingProvider>
            </Providers>
          </div>
        </HeightAdjuster>
        <ServiceOn />
      </body>
    </html>
  );
}
