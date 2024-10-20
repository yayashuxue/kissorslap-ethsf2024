"use client";

import React from "react";
import {
  DynamicContextProvider,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { FlowWalletConnectors } from "@dynamic-labs/flow";


export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: "231322b5-2099-4841-a0fc-f301b7fccbf5",
        walletConnectors: [EthereumWalletConnectors, FlowWalletConnectors],
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}