"use client";
import { useEffect, useState, useRef, useContext } from "react";
import { ref, onValue, push, remove } from "firebase/database";
import { realtimeDB } from "../../../../firebaseConfig";
import { usePrivy } from "@privy-io/react-auth";

export default function MessageDetailClient({
  chatId,
  user1OutsideId,
  user2OutsideId,
  user1Name,
  user2Name,
  user1,
  user2,
  initialMessages,
}: {
  chatId: string;
  user1Id: string;
  user2Id: string;
  user1OutsideId: string;
  user2OutsideId: string;
  user1Name: string;
  user2Name: string;
  user1Image: string;
  user2Image: string;
  user1: any; // Pass user1 data
  user2: any; // Pass user2 data
  initialMessages: Array<{
    id: string;
    senderId: string;
    content: string;
    timestamp: string;
  }>;
}) {
  const { user } = usePrivy();
  const [messages, setMessages] = useState(initialMessages || []);
  const currentUserId = `${user?.id}`;
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async () => {
    setIsSending(true); // Reset sending state

    await fetch(`/api/chat/${chatId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: newMessage, // Message content to be stored in Prisma
      }),
    });

    if (newMessage.trim()) {
      const messageData = {
        senderId: currentUserId,
        receiverId:
          currentUserId === user1OutsideId ? user2OutsideId : user1OutsideId,
        text: newMessage,
        timestamp: Date.now(),
      };

      // Push message to Firebase
      const messagesRef = ref(realtimeDB, `messages/${chatId}`);
      await push(messagesRef, messageData);

      setNewMessage(""); // Clear input
    }
    scrollToBottom();

    setIsSending(false); // Reset sending state
  };

  // Scroll to bottom on new message (smooth scroll)
  const scrollToBottom = (smooth = true) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  // Fetch real-time updates from Firebase
  useEffect(() => {
    if (chatId && currentUserId) {
      const messagesRef = ref(realtimeDB, `messages/${chatId}`);
      onValue(messagesRef, (snapshot) => {
        scrollToBottom();
        const data = snapshot.val();
        if (data) {
          const firebaseMessages = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value,
          }));
          // Merge new Firebase messages while preventing duplicates from Prisma
          setMessages((prevMessages) => {
            const combinedMessages = [...prevMessages];

            firebaseMessages.forEach((fbMsg) => {
              if (!combinedMessages.some((msg) => msg.id === fbMsg.id)) {
                combinedMessages.push(fbMsg);
              }
            });

            return combinedMessages;
          });
        }
      });
    }
    return () => {
    };
  }, [chatId, currentUserId]);

  // Helper function to identify if the sender is user1 or user2
  const getSenderDetails = (senderId: string) => {
    console.log(senderId, user2.outsideId);
    if (senderId === user1.outsdieId || senderId === user1.id) {
      return {
        name: user1Name,
        image: user2.images[0].imageUrl,
      };
    } else if (senderId === user2.outsideId || senderId === user2.id) {
      return {
        name: user2Name,
        image: user2.images[0].imageUrl,
      };
    } else {
      return {
        name: "Unknown",
        image: "/kissorslap-logo.png",
      };
    }
  };

  return (
    <div className="p-4 md:p-8 text-neutral-800 min-h-screen">
      <div className="bg-[#fff4ed] border shadow p-4 md:p-6 rounded-xl">
        <h1 className="text-lg md:text-3xl mb-4 font-bold">Chat</h1>
        <div
          className="bg-[#f2f2f2] p-4 rounded-lg h-[52vh] md:h-96 overflow-y-auto border"
          ref={chatContainerRef}
        >
          {messages.map((message) => {
            const isSender =
              currentUserId === message.senderId ||
              currentUserId === message.sender?.outsideId;
            const senderDetails = getSenderDetails(message.senderId);

            return (
              <div
                key={message.id}
                className={`mb-2 flex ${
                  isSender ? "justify-end" : "justify-start"
                }`}
              >
                {!isSender && (
                  <img
                    src={senderDetails.image}
                    alt={`${senderDetails.name} Profile`}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                )}
                <div
                  className={`max-w-xs md:max-w-md p-2 rounded-lg ${
                    isSender ? "bg-yellow-200 text-right" : "bg-white text-left"
                  }`}
                >
                  <p className="text-sm md:text-base">
                    {message.content || message.text}
                  </p>
                  <small className="text-neutral-500 text-xs">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </small>
                </div>
                {isSender && (
                  <img
                    src={senderDetails.image}
                    alt={`${senderDetails.name} Profile`}
                    className="w-8 h-8 rounded-full ml-2"
                  />
                )}
              </div>
            );
          })}
        </div>

        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="w-full mt-4 p-2 rounded text-black border text-sm md:text-lg"
        />
        <button
          disabled={isSending}
          onClick={sendMessage}
          className="mt-2 bg-[#E6A740] hover:bg-yellow-500 px-4 py-2 rounded text-white w-full md:w-auto"
        >
          Send
        </button>
      </div>
    </div>
  );
}
