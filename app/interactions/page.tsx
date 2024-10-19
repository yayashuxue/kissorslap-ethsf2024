// app/profile/MutualKissInteractions.tsx

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { db } from "../db"; // Adjust the path if necessary
import Link from "next/link";
import Image from "next/image"; // Next.js Image component for optimized images
import { Interaction, User, Message, Image as UserImage } from "@prisma/client";

// Define the shape of a mutual kiss interaction
interface MutualKissInteraction {
  chatId: string;
  otherUser: {
    username: string;
    imageUrl: string | null;
  };
  lastMessage: {
    content: string;
    senderUsername: string;
    timestamp: string; // ISO string
  } | null;
}

export default async function MutualKissInteractions() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("privy-token")?.value;

  if (!accessToken) {
    return (
      <div className="text-center mt-8 text-red-500">
        Unauthorized. Please log in.
      </div>
    );
  }

  const decoded = jwt.decode(accessToken) as { sub: string };
  const userOutsideId = decoded.sub;

  const currentUser = await db.user.findUnique({
    where: { outsideId: userOutsideId },
    select: { id: true },
  });

  if (!currentUser) {
    return (
      <div className="text-center mt-8 text-red-500">
        User not found. Please log in.
      </div>
    );
  }

  const currentUserId = currentUser.id;

  const mutualKissInteractions = await db.interaction.findMany({
    where: {
      OR: [{ user1Id: currentUserId }, { user2Id: currentUserId }],
      result: "MUTUAL_KISS",
      status: "COMPLETE",
    },
    include: {
      user1: {
        select: {
          username: true,
          images: {
            where: { imageType: "PROFILE" },
            select: { imageUrl: true },
          },
        },
      },
      user2: {
        select: {
          username: true,
          images: {
            where: { imageType: "PROFILE" },
            select: { imageUrl: true },
          },
        },
      },
      chat: {
        include: {
          messages: {
            orderBy: { timestamp: "desc" },
            take: 1,
            select: {
              content: true,
              sender: { select: { username: true } },
              timestamp: true,
            },
          },
        },
      },
    },
  });

  const mutualKissData: MutualKissInteraction[] = mutualKissInteractions.map(
    (interaction) => {
      const isUser1 = interaction.user1Id === currentUserId;
      const otherUser = isUser1 ? interaction.user2 : interaction.user1;
      const otherUserImage =
        otherUser.images.length > 0 ? otherUser.images[0].imageUrl : null;

      const lastMessage = interaction.chat?.messages[0] || null;

      return {
        chatId: interaction.chatId || "",
        otherUser: {
          username: otherUser.username,
          imageUrl: otherUserImage,
        },
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              senderUsername: lastMessage.sender.username,
              timestamp: lastMessage.timestamp.toISOString(),
            }
          : null,
      };
    }
  );

  if (mutualKissData.length === 0) {
    return (
      <p className="text-center mt-8 text-white">
        You have no mutual kiss interactions yet.
      </p>
    );
  }

  return (
    <div className="relative z-10 w-full flex flex-col p-6 text-neutral-800 min-h-screen pb-32 overflow-y-auto">
      <h1 className="text-stroke font-press-start text-[#E6A740] text-[18px] leading-[36px] tracking-[3.60px]">
        MUTUAL KISS Chat
      </h1>

      {/* Scrollable Chats Container */}
      <div className="space-y-6 text-white">
        {mutualKissData.map((interaction) => (
          <Link
            href={`/chat/${interaction.chatId}`}
            key={interaction.chatId}
            className="flex items-center bg-purple-300 bg-opacity-20 p-4 rounded-lg shadow-md transition-colors relative"
            aria-label={`Chat with ${interaction.otherUser.username}`}
          >
            {/* Other User's Profile Picture */}
            <div className="flex-shrink-0">
              {interaction.otherUser.imageUrl ? (
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src={interaction.otherUser.imageUrl}
                    alt={`${interaction.otherUser.username}'s profile`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center">
                  {/* Placeholder content */}
                </div>
              )}
            </div>

            {/* Other User's Info and Last Message */}
            <div className="ml-4 flex-1">
              <h2 className="text-xl font-semibold">
                {interaction.otherUser.username}
              </h2>
              <p className="text-sm text-gray truncate">
                {interaction.lastMessage
                  ? `${interaction.lastMessage.content}`
                  : "No messages yet."}
              </p>
            </div>

            {/* Timestamp in the upper right */}
            {interaction.lastMessage && (
              <div className="absolute top-4 right-4 text-xs">
                {(() => {
                  const messageDate = new Date(interaction.lastMessage.timestamp);
                  const today = new Date();
                  const isToday =
                    messageDate.getDate() === today.getDate() &&
                    messageDate.getMonth() === today.getMonth() &&
                    messageDate.getFullYear() === today.getFullYear();

                  return isToday
                    ? messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : messageDate.toLocaleDateString();
                })()}
              </div>
            )}

            {/* Arrow Icon */}
            <div className="ml-4 text-neutral-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
