import React, { useEffect, useState } from 'react';
import ChatUI from '../components/chatUi';
import Users from '../components/userschat';
import Cookies from 'js-cookie';
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {io} from 'socket.io-client';


function Chat() {
    const [selectedUserId, setSelectedUserId] = useState(null); 
    const [socket, setSocket] = useState (null); 
    const [onlineUsers, setOnlineUsers] = useState ([]);
    const handleUserSelect = (userId) => {
        setSelectedUserId(userId);
    };
    const [me, setMe] = useState(null);

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
        fetchUsers();
    }, [me]);
    const token = Cookies.get("jwt");
    const fetchUsers = async () => {
        try {
            const Meresponse = await axios.get('https://chat-prod-dvbe.onrender.com/api/v1/users/me', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            setMe(Meresponse.data.data);
        } catch (error) {
           console.error('Error fetching current user: ' + error.message);
           toast.error('Error fetching current user: ' + error.message);
        }
    };
    return (
        <>
            <div style={{ display: "flex", paddingLeft: "10px", gap:"0" }}>
                <div style={{width:"30%"}}>
                <Users onUserSelect={handleUserSelect} me={me} />
                </div>
                <div style={{width:"70%"}}>
                <ChatUI selectedUserId={selectedUserId}  me={me} onlineUser={{ id: 1, name: 'John', isOnline: true }} />
                </div>
                <ToastContainer/>
                </div>
        </>
    )
}

export default Chat;
