import React, { useContext, useEffect, useState } from "react";
import { ChatContext } from "../context/ChatContext";

const Message = () => {
  const {
    messagesList,
    selectedUserName,
    showMessages,
    selectedAddr,
    messageInput,
    setMessageInput,
    sendMessage,
  } = useContext(ChatContext);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedAddr) {
      setIsLoading(true);
      showMessages(selectedAddr).finally(() => {
        setIsLoading(false);
      });
    }
  }, [selectedAddr]);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) {
      alert("Message cannot be empty!");
      return;
    }

    try {
      setIsLoading(true);
      await sendMessage(selectedAddr);
      setMessageInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedAddr) {
    return (
      <div className="messages">
        <p>Please select a friend to start a chat.</p>
      </div>
    );
  }

  return (
    <div className="messages">
      <div className="message-header">
        <h3>Chat with {selectedUserName || "Unknown User"}</h3>
      </div>
      <div className="message-list">
        {isLoading ? (
          <p>Loading messages...</p>
        ) : Array.isArray(messagesList) && messagesList.length > 0 ? (
          messagesList.map((item, index) => {
            const senderAddress = item.sender;
            const messageContent = item.msg;
            const timestamp = item.timestamp; // BigInt value

            // Convert BigInt to a number for display
            const messageTime = isNaN(Number(timestamp))
              ? "Invalid time"
              : new Date(Number(timestamp) * 1000).toLocaleTimeString();

            return (
              <div key={index} className="message">
                <p>
                  <strong>From: {senderAddress}</strong>
                  <br />
                  <strong>Message:</strong> <span>{messageContent}</span>
                </p>
                <span>{messageTime}</span>
              </div>
            );
          })
        ) : (
          <p>No messages yet. Say hello!</p>
        )}
      </div>

    </div>
  );
};

export default Message;