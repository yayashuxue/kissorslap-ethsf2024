import { db } from "../../db"; // Import your Prisma client
import MessageDetailClient from "./components/MessageDetailClient"; // Import client component

export default async function ChatPage({
  params: { chatId },
}: {
  params: { chatId: string };
}) {
  const chat = await db.chat.findUnique({
    where: { id: chatId },
    select: {
      user1: {
        select: {
          id: true,
          outsideId: true,
          username: true,
          images: {
            select: {
              imageUrl: true,
              imageType: true,
            },
            where: {
              imageType: "PROFILE",
            },
            take: 1,
          },
        },
      },
      user2: {
        select: {
          id: true,
          outsideId: true,
          username: true,
          images: {
            select: {
              imageUrl: true,
              imageType: true,
            },
            where: {
              imageType: "PROFILE",
            },
            take: 1,
          },
        },
      },
      messages: {
        select: {
          id: true,
          senderId: true,
          sender: {
            select: {
              outsideId: true,
              username: true,
              images: {
                select: {
                  imageUrl: true,
                  imageType: true,
                },
                where: {
                  imageType: "PROFILE",
                },
                take: 1,
              },
            },
          },
          content: true,
          timestamp: true,
        },
        orderBy: { timestamp: "asc" },
      },
    },
  });

  if (!chat) {
    return <div>Chat not found</div>;
  }

  const user1Image = chat.user1.images[0]?.imageUrl || "/kissorslap-logo.png";
  const user2Image = chat.user2.images[0]?.imageUrl || "/kissorslap-logo.png";

  return (
    <MessageDetailClient
      chatId={chatId}
      user1OutsideId={chat.user1.outsideId}
      user2OutsideId={chat.user2.outsideId}
      user1Id={chat.user1.id}
      user2Id={chat.user2.id}
      user1Name={chat.user1.username}
      user2Name={chat.user2.username}
      user1Image={user1Image}
      user2Image={user2Image}
      user1={chat.user1} // Pass user1 data
      user2={chat.user2} // Pass user2 data
      initialMessages={chat.messages}
    />
  );
}
