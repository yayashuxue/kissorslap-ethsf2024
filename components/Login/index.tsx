"use client";
import React, { useEffect, useCallback, useState } from "react";
import { usePrivy } from "@privy-io/react-auth"; // Import the Privy hook for login/logout
import { ref, set } from "firebase/database"; // Firebase Realtime Database functions
import { realtimeDB } from "../../firebaseConfig"; // Firebase Realtime DB instance
import { useRouter, usePathname } from "next/navigation"; // Use the new next/navigation package for reload and path check
import Button from "../Button";

export default function LoginComponent() {
  const { login, logout, ready, authenticated, user } = usePrivy(); // Use Privy hook
  const router = useRouter(); // Initialize Next.js router from next/navigation
  const pathname = usePathname(); // Get the current route pathname

  const [isSavingToPrisma, setIsSavingToPrisma] = useState(false); // Track Prisma saving state

  // Store the user ID in Firebase
  const storeUserIdInFirebase = useCallback(async (userId: string) => {
    const userRef = ref(realtimeDB, `users/${userId}`);
    await set(userRef, {
      id: userId, // Only storing the user ID in Firebase
    });
  }, []);

  const addToPrismaDatabase = useCallback(async () => {
    if (user && user.id) {
      const email = user.email?.address || user.google?.email || "";
    setIsSavingToPrisma(true);

      const response = await fetch("/api/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          outsideId: user.id,
          phoneNumber: user.phone?.number || "",
          email,
        }),
      });

      if (!response.ok) {
        console.error("Failed to add user to Prisma");
        setIsSavingToPrisma(false);
        return;
      }

      const data = await response.json();
      console.log("User added to Prisma:", data);
      setIsSavingToPrisma(false);
    }
  }, [user]);

  const handleLogin = async () => {
    login(); // Wait for the login process to complete
  };

  const handleLogout = () => {
    logout();
  };

  // Store user in Firebase and Prisma once authenticated and user data is available
  useEffect(() => {
    if (authenticated && user && user.id) {
      storeUserIdInFirebase(user.id); // Store user ID in Firebase
      addToPrismaDatabase(); // Add the user to Prisma database

      // Only refresh the page if the path starts with /interact or /interactions
      if (pathname === "/") {
        window.location.href = "/interact"; // Redirect to /interact if on the home page
      }
      if (pathname.startsWith("/interact")) {
        router.refresh(); // Reload the page to refresh the server-side route
      }
    }
  }, [
    user,
    addToPrismaDatabase,
    storeUserIdInFirebase,
    authenticated,
    router,
    pathname,
  ]);


  return (
    <div>
      {authenticated ? (
        <Button onClick={logout} text="Logout" variant="secondary" loading={!ready} />
      ) : (
        <Button onClick={handleLogin} text="Create Account or Login" variant="secondary" loading={!ready} />
      )}
    </div>
  );
}
