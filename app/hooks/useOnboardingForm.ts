import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useOnboardingData } from "./useOnboardingData";
// !! Dangerous - do not add points here. points should only be handled on server side
interface OnboardingData {
  username: string;
  name: string;
  bio: string;
  photo: string | null;
  hotScore: number;
  karmaScore: number;
  points: number;
  gender: string;
  genderPreference: string;
  age: number;
}
export function useOnboardingForm() {
  const { data: formData, updateData } = useOnboardingData(); // Use context data
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      updateData({ [name]: value }); // Update context data

      try {
        setIsLoading(true);
        if (pathname !== "/profile") {
          const response = await fetch("/api/updateUser", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [name]: value }),
          });

          if (!response.ok) {
            throw new Error("Failed to update data");
          }
        }
      } catch (error) {
        console.error(error);
        // Handle error (e.g., show a notification)
      } finally {
        setIsLoading(false);
      }
    },
    [pathname, updateData]
  );

  return { formData, handleChange, isLoading };
}
