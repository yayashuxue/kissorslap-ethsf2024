// src/components/Messages/index.tsx
import React from "react";

interface iMessage {
  messages?: any[];
  currentUser?: string;
}

const Messages: React.FC<iMessage> = ({ messages, currentUser }) => {
  if (messages && messages?.length >= 1) {
    return (
      <div className="h-60 w-[800px] p-6 overflow-auto">
        {messages.map((message, id) => {
          if (message.sender === currentUser) {
            return (
              <div key={id} className="flex justify-end">
                <div className="bg-blue-500 text-white rounded-lg p-2 mt-2">
                  {message.message}
                </div>
              </div>
            );
          }
          return (
            <div key={id} className="flex items-start mt-2">
              <div className="bg-gray-200 text-gray-800 rounded-full p-2 mr-3">
                {message.sender?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold">{message.sender?.split("@")[0]}</p>
                <p>{message.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <div className="h-60 w-[800px] p-6 overflow-auto text-center">
      <p className="text-gray-500">No messages yet</p>
    </div>
  );
};

export { Messages };
