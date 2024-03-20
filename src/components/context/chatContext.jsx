import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState, createContext, useRef } from "react";
// import{ io} from 'socket.io-client';
import {io} from 'socket.io-client';

export const ChatContext = createContext();

export const ChatContextProvider = ({ children, user }) => {
  const [userChats, setUserChats] = useState(null);
  const [isUserChatsLoading, setIsUserChatsLoading] = useState(null);
  const [userChatsError, setUserChatsError] = useState(null);
  const [me, setMe] = useState(null);
  // const [socket, setSocket] = useState (null); 
  // const [onlineUsers, setOnlineUsers] = useState ([]);
  const scroll = useRef();
  const token = Cookies.get("jwt");



     // initial socket
     useEffect(() => {
      const newSocket = io ("https://chat-prod-dvbe.onrender.com/api/v1/auth/signup");   //url
      setSocket(newSocket);
      return () =>{
          newSocket.disconnect()
      }
  },[user]);
    //add online users
  useEffect (() => {
      if(socket === null) return;
      socket.emit("addNewUser", user?._id)
      socket.on("getOnlineUsers", (res) =>{
          setOnlineUsers(res);
      });
      return () => {
        socket.off('getOnlineUsers');
      }
  },[socket]);

    // Send Message
    useEffect (() => {
      if(socket === null) return;
      const recipientId = currentChat ?.members?.find((id) => id !== user?._id);
      socket.emit("sendMessage", {...newMessage, recipientId })     
  },[newMessage]);

  // receive message 
  useEffect (() => {
    if(socket === null) return;
    socket.on("getMessage", res => {
      if (currentChat ?._id !== res.child) return;
      setMessages ((prev) => [...prev,res])
    })
    return() => {
      socket.off("getMessage")
    }
   
},[socket, currentChat]);



  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          "https://chat-prod-dvbe.onrender.com/api/v1/users/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMe(res.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    // Uncomment the following block of code if you want to fetch user chats
    // const getUserChats = async () => {
    //   if (me?._id) {
    //     try {
    //       const response = await axios.get(
    //         "https://chat-prod-dvbe.onrender.com/api/v1/chats/",
    //         {
    //           headers: {
    //             Authorization: `Bearer ${token}`,
    //           },
    //         }
    //       );
    //       setUserChats(response.data.data);
    //     } catch (error) {
    //       console.error("Error fetching user chats:", error);
    //     }
    //   }
    // };

    // getUserChats();
  }, [me, token]);

  // Log updated 'me' value
  useEffect(() => {
    console.log("Updated 'me' value:", me);
  }, [me]);

  return (
    <ChatContext.Provider
      value={{
        userChats,
        isUserChatsLoading,
        userChatsError,
        me,
        onlineUsers
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
