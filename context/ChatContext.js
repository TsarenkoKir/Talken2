import { createContext, useState, useCallback } from "react";
import Router from "next/router";
import { ChatContractAddress } from "../config";
import ChatAbi from "../backend/build/contracts/ChatContract.json";
import { BrowserProvider, Contract } from "quais";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [correctNetwork, setCorrectNetwork] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [selectedAddr, setSelectedAddr] = useState("");
  const [selectedUserName, setSelectedUserName] = useState("");
  const [searchAccount, setSearchAccount] = useState("");
  const [friendsList, setFriendsList] = useState([]);
  const [messagesList, setMessagesList] = useState([]);

  const initializeProvider = () => {
    if (typeof window === "undefined") return null;
    const { pelagus } = window;
    if (!pelagus) {
      alert("Pelagus Wallet not found");
      return null;
    }
    return new BrowserProvider(pelagus);
  };

  const connectWallet = async () => {
    try {
      const provider = initializeProvider();
      if (!provider) return;

      const { pelagus } = window;
      const chainId = await pelagus.request({ method: "quai_chainId" });
      const ChainId = "0x2328"; // Используем корректный chainId для вашей сети
      if (chainId !== ChainId) {
        setCorrectNetwork(false);
        setNetworkError(true);
        return;
      } else {
        setCorrectNetwork(true);
        setNetworkError(false);
      }

      const accounts = await pelagus.request({ method: "quai_requestAccounts" });
      setIsUserLoggedIn(true);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      alert("Failed to connect wallet");
    }
  };

  const registerUser = async (event) => {
    event.preventDefault();
    try {
      const provider = initializeProvider();
      if (!provider) return;
      const signer = await provider.getSigner();
      const chatContract = new Contract(ChatContractAddress, ChatAbi.abi, signer);

      const tx = await chatContract.registerUser(currentAccount, username, password);
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        alert("User Registered successfully");
      } else {
        alert("Registration transaction failed");
      }
    } catch (error) {
      alert("Registration error");
    }
  };

  const loginUser = async (event) => {
    event.preventDefault();
    try {
      const provider = initializeProvider();
      if (!provider) return;
      const signer = await provider.getSigner();
      const chatContract = new Contract(ChatContractAddress, ChatAbi.abi, signer);

      const tx = await chatContract.loginUser(currentAccount, username, password);
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        Router.push("/ChatHome");
      } else {
        alert("Login failed");
      }
    } catch (error) {
      alert("Login error");
    }
  };

  const logoutUser = async (event) => {
    event.preventDefault();
    try {
      console.log("User LogOut");
  
      // Check if Pelagus wallet is available in the browser
      const { pelagus } = window;
      if (!pelagus) {
        alert("Please install the Pelagus Wallet!");
        return;
      }
  
      // Create a provider for interacting with the Pelagus wallet
      const provider = new BrowserProvider(pelagus);
  
      // Get the signer for sending transactions
      const signer = await provider.getSigner();
  
      // Create a contract instance
      const chatContract = new Contract(ChatContractAddress, ChatAbi.abi, signer);
  
      // Call the logoutUser function in the smart contract
      const tx = await chatContract.logoutUser(currentAccount);
      console.log("Transaction sent:", tx);
  
      // Wait for the transaction to be confirmed
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
  
      // Look for the LogoutUser event in the transaction receipt
      const logoutEvent = receipt.logs.find((log) => {
        // Parse the logs using the contract's interface
        const parsedLog = chatContract.interface.parseLog(log);
        return parsedLog.name === "LogoutUser";
      });
  
      if (logoutEvent) {
        const [isUserLoggedIn] = logoutEvent.args;
        console.log("Logout Event Args:", isUserLoggedIn);
  
        if (!isUserLoggedIn) {
          console.log("User LoggedOut successfully");
          Router.push("/");
        } else {
          alert("User LogOut failed");
        }
      } else {
        alert("Logout event not found in the transaction receipt.");
      }
    } catch (error) {
      console.error("Error during user logout:", error);
      alert(`Error: ${error.message || "Failed to log out!"}`);
    }
  };

  const searchAndAddFriend = async (event) => {
    event.preventDefault();
    try {
      const provider = initializeProvider();
      if (!provider) return;
      const signer = await provider.getSigner();
      const chatContract = new Contract(ChatContractAddress, ChatAbi.abi, signer);

      const boolcheckUser = await chatContract.checkUserExists(searchAccount);
      if (boolcheckUser && searchAccount.toLowerCase() !== currentAccount.toLowerCase()) {
        const friendUsername = await chatContract.getUsername(searchAccount);
        const tx = await chatContract.addFriend(searchAccount, friendUsername);
        const receipt = await tx.wait();
        if (receipt.status === 1) {
          alert("Friend added successfully!");
        } else {
          alert("Failed to add friend");
        }
      } else {
        alert("User does not exist or you are adding yourself");
      }
    } catch (error) {
      alert("Add friend error");
    }
  };

  const getMyFriendList = useCallback(async () => {
    try {
      const provider = initializeProvider();
      if (!provider) return;
      const signer = await provider.getSigner();
      const chatContract = new Contract(ChatContractAddress, ChatAbi.abi, signer);

      const fetchedFriendsList = await chatContract.getMyFriendList();
      setFriendsList(Array.isArray(fetchedFriendsList) ? fetchedFriendsList : []);
    } catch (error) {
      alert("Error fetching friend list");
    }
  }, []);

  const sendMessage = async (friendAddr) => {
    try {
      if (!friendAddr || !messageInput) {
        alert("No friend selected or message is empty.");
        return;
      }
      const provider = initializeProvider();
      if (!provider) return;
      const signer = await provider.getSigner();
      const chatContract = new Contract(ChatContractAddress, ChatAbi.abi, signer);

      const tx = await chatContract.sendMessage(friendAddr, messageInput);
      const receipt = await tx.wait();
      if (receipt.status !== 1) {
        alert("Message sending failed");
        return;
      }
      alert("Message sent!");
      setMessageInput("");
      await showMessages(friendAddr);
    } catch (error) {
      alert("Send message error");
    }
  };

  const showMessages = async (friendAddr) => {
    try {
      if (!friendAddr) {
        alert("Invalid friend address");
        return;
      }

      const provider = initializeProvider();
      if (!provider) return;
      const signer = await provider.getSigner();
      const chatContract = new Contract(ChatContractAddress, ChatAbi.abi, signer);

      const fetchedMessages = await chatContract.readMessage(friendAddr);
      setMessagesList(Array.isArray(fetchedMessages) ? fetchedMessages : []);
      setSelectedAddr(friendAddr);
    } catch (error) {
      alert("Error fetching messages");
    }
  };

  return (
    <ChatContext.Provider
      value={{
        correctNetwork,
        setCorrectNetwork,
        networkError,
        setNetworkError,
        isUserLoggedIn,
        setIsUserLoggedIn,
        currentAccount,
        setCurrentAccount,
        connectWallet,
        setUsername,
        setPassword,
        registerUser,
        loginUser,
        logoutUser,
        searchAndAddFriend,
        setSearchAccount,
        friendsList,
        getMyFriendList,
        messagesList,
        showMessages,
        setMessageInput,
        sendMessage,
        selectedUserName,
        setSelectedUserName,
        selectedAddr,
        setSelectedAddr
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};