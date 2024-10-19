"use client";

import React from "react";
import { PrivyProvider } from "@privy-io/react-auth";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={
        process.env.NODE_ENV === "development"
          ? "clzpn25af01iee4s7e66p1mqp" // Development app ID
          : "cm275t2oh08vzt7o71bo4deou"
      } // Production app ID
      config={{
        // Customize Privy's appearance in your app
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
          logo: "https://kissorslap-six.vercel.app/kissorslap-logo.png",
        },
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
