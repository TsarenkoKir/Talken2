import React, { useContext, useEffect } from "react";
import { ChatContext } from "../context/ChatContext";

const Chats = () => {
  const {
    friendsList,
    getMyFriendList,
    showMessages,
    setSelectedUserName,
    setSelectedAddr,
  } = useContext(ChatContext);

  // Загружаем список друзей при первом рендере
  useEffect(() => {
    getMyFriendList();
  }, [getMyFriendList]);

  return (
    <div className="chats">
      {Array.isArray(friendsList) && friendsList.length > 0 ? (
        friendsList.map((item, index) => (
          <div
            key={item.pubkey || index}
            className="userChat"
            onClick={() => {
              // При клике загружаем сообщения друга
              showMessages(item.pubkey);
              // Устанавливаем текущего выбранного друга
              setSelectedAddr(item.pubkey);
              setSelectedUserName(item.name);
            }}
          >
            <img
              src="https://png.pngitem.com/pimgs/s/130-1300253_female-user-icon-png-download-user-image-color.png"
              alt="Friend Avatar"
            />
            <div className="userChatInfo">
              <span>{item.name}</span>
            </div>
          </div>
        ))
      ) : (
        <p>No friends found</p>
      )}
    </div>
  );
};

export default Chats;