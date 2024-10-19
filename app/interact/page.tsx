import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { db } from "../db";
import UserInteraction from "./components/UserInteraction";
import { User, Interaction } from "@prisma/client"; // Import Prisma types
import Image from "next/image";
import NoMoreMatches from "@/components/NoMoreMatches";

// Update the User interface to include interactionsSent and interactionsReceived properties
interface UserWithInteractions extends User {
  interactionsSent: Interaction[];
  interactionsReceived: Interaction[];
}
import Link from "next/link";
export const revalidate = 0; // Disable cache to ensure fresh data

export default async function UserStack() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("privy-token")?.value;

  if (!accessToken) {
    return <div>Unauthorized. Please log in.</div>;
  }

  const decoded = jwt.decode(accessToken) as { sub: string };
  const senderOutsideId = decoded.sub;

  // Get the current user's Prisma ID from their outsideId
  const currentUser = await db.user.findUnique({
    where: { outsideId: senderOutsideId },
    select: { id: true, genderPreference: true, gender: true },
  });

  if (!currentUser) {
    return <div>User not found. Please log in.</div>;
  }

  const currentUserId = currentUser.id;
  const currentUserGenderPreference = currentUser.genderPreference;
  const currentUserGender = currentUser.gender;

  // Define the gender preference filter based on the current user's preference
  const genderPreferenceFilter = () => {
    if (currentUserGenderPreference === "BOTH") {
      return {}; // If the user is interested in both genders, don't filter by gender
    }
    return { gender: currentUserGenderPreference };
  };

  // Define a filter to find users who are interested in the current user's gender
  const interestedInCurrentUserGenderFilter = () => {
    return {
      genderPreference: {
        in: [currentUserGender, "BOTH"],
      },
    };
  };

  // Query users who meet the interaction criteria and haven't been seen, filtered by gender preference
  const users: (UserWithInteractions & {
    images: { imageUrl: string }[];
    interactionsAsUser1: {
      user2Id: string; // Updated to reflect the new UUID (String)
      user1Action: string | null;
      user2Action: string | null;
      status: string;
    }[];
    interactionsAsUser2: {
      user1Id: string; // Updated to reflect the new UUID (String)
      user1Action: string | null;
      user2Action: string | null;
      status: string;
    }[];
  })[] = await db.user.findMany({
    where: {
      id: { not: currentUserId }, // Exclude current user
      isComplete: true, // Exclude users who haven't completed onboarding

      // @julie: disable gender preference filter and interested for now.
      // ...genderPreferenceFilter(), // Filter users by current user's preference
      // ...interestedInCurrentUserGenderFilter(), // Only show users interested in current user's gender
      AND: [
        // Exclude users the current user has already seen
        {
          wasSeenBy: {
            none: {
              seenByUserId: currentUserId,
            },
          },
        },
        {
          OR: [
            // Users with pending interactions where the current user is either user1 or user2
            {
              // Users who have acted on the current user
              interactionsSent: {
                some: {
                  user2Id: currentUserId,
                  status: "PENDING", // Interaction is pending, awaiting response
                },
              },
            },
            // Users who have never interacted with the current user
            {
              AND: [
                {
                  interactionsSent: {
                    none: { user2Id: currentUserId }, // No interaction as user1
                  },
                },
                {
                  interactionsReceived: {
                    none: { user1Id: currentUserId }, // No interaction as user2
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    select: {
      id: true,
      username: true,
      bio: true,
      name: true,
      gender: true, // Include gender in the selection
      genderPreference: true, // Include genderPreference in the selection
      images: {
        where: { imageType: "PROFILE" }, // Select profile images only
        select: { imageUrl: true },
      },
      karmaScore: true,
      hotScore: true,
      interactionsSent: {
        select: {
          user2Id: true, // Updated to reflect the new UUID (String)
          user1Action: true,
          user2Action: true,
          status: true,
        },
      },
      // interactionsReceived: {
      //   select: {
      //     user1Id: true, // Updated to reflect the new UUID (String)
      //     user1Action: true,
      //     user2Action: true,
      //     status: true,
      //   },
      // },
    },
  });

  const usersWithFlag = users.map((user) => {
    const otherUserActed = user.interactionsSent.some((interaction) => {
      // console.log("Interaction Details:", interaction);
      return (
        interaction.status === "PENDING" &&
        interaction.user1Action !== null && // User1 has acted
        interaction.user2Id === currentUserId && // User2 (current user) is the target
        interaction.user2Action === null // User2 (current user) hasn't acted
      );
    });

    return {
      ...user,
      otherUserActed,
    };
  });

  // console.log("Users with flag:", usersWithFlag);

  return (
    <div className="h-full mt-2 flex flex-col items-center justify-center overflow-hidden">
      {usersWithFlag.length > 0 ? (
        <div className="fixed inset-0 flex items-center justify-center" style={{ marginTop: '-10px' }}>
          <UserInteraction users={usersWithFlag} />
        </div>
      ) : (
        <NoMoreMatches />
      )}
    </div>
  );
}
