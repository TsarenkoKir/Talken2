import React, { useState, useEffect, useContext } from "react";
import { ChatContext } from "../context/ChatContext";

const Input = () => {
  const {
    setSearchAccount,
    searchAndAddFriend,
    setMessageInput,
    sendMessage,
    selectedAddr, // убедитесь, что этот стейт доступен здесь
  } = useContext(ChatContext);

  const handleSend = () => {
    if (!selectedAddr) {
      alert("No friend selected");
      return;
    }
    sendMessage(selectedAddr);
  };

  return (
    <div className="input">
      <input
        required
        type="text"
        placeholder="Type something..."
        onChange={(e) => setMessageInput(e.target.value)}
      />
      <div className="send">
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Input;