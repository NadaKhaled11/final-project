import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Typography } from "@mui/material";
import { Box as MuiBox } from "@mui/system";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./navbarChat";
import { useFetchRecipientUser } from '../hooks/useFetchRecipientUser';
import { ChatContext } from './context/chatContext';

const Chat = ({ onlineUser, selectedUserId, me }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [oneChat, setOneChat] = useState('');
    const [isMessageUpdated, setMessageUpdated] = useState(false);
    const [labelValue, setLabelValue] = useState('');
    const token = Cookies.get("jwt");
    const {recipientUser} = useFetchRecipientUser (chat, user);
    const {onlineUsers} = useContext(ChatContext);
    const isOnline = onlineUsers?.some((user) => user?.userId === recipientUser?._id) ? true : false;


    // initial socket
//     useEffect(() => {
//         const newSocket = io ("https://chat-prod-dvbe.onrender.com/api/v1/auth/signup");   //url
//         setSocket(newSocket);
//         return () =>{
//             newSocket.disconnect()
//         }
//     },[user]);

//       //add online users
//     useEffect (() => {
//         if(socket === null) return;
//         socket.emit("addNewUser", user?._id)
//         socket.on("getOnlineUsers", (res) =>{
//             setOnlineUsers(res);
//         });
//         return () => {
//           socket.off('getOnlineUsers');
//         }
//     },[socket]);
  
//       // Send Message
//       useEffect (() => {
//         if(socket === null) return;
//         const recipientId = currentChat ?.members?.find((id) => id !== user?._id);
//         socket.emit("sendMessage", {...newMessage, recipientId })     
//     },[newMessage]);
  
//     // receive message 
//     useEffect (() => {
//       if(socket === null) return;
//       socket.on("getMessage", res => {
//         if (currentChat ?._id !== res.child) return;
//         setMessages ((prev) => [...prev,res])
//       })
//       return() => {
//         socket.off("getMessage")
//       }   
//   },[socket, currentChat]);

    useEffect(() => {
        const fetchChatData = async () => {
            try {
                let chatData = null;
                const chatResponse1 = await axios.get(`https://chat-prod-dvbe.onrender.com/api/v1/chats/find/${me._id}/${selectedUserId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                chatData = chatResponse1.data.data;
                if (!chatData) {
                    const chatResponse2 = await axios.get(`https://chat-prod-dvbe.onrender.com/api/v1/chats/find/${selectedUserId}/${me._id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    chatData = chatResponse2.data.data;
                }

                if (chatData) {
                    setOneChat(chatData);
                    const messagesResponse = await axios.get(`https://chat-prod-dvbe.onrender.com/api/v1/messages/${chatData._id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setMessages(messagesResponse.data.data);
                }
            } catch (error) {
                console.error('Error fetching chat data:', error);
                toast.error('Error fetching chat data:', error);

            }
        };

        if (selectedUserId && me) {
            fetchChatData();
        }
    }, [selectedUserId, me, token, isMessageUpdated]);

    const sendMessage = async () => {
        if (newMessage.trim() === '' || !oneChat._id) return;

        try {
            const response = await axios.post('https://chat-prod-dvbe.onrender.com/api/v1/messages/', { content: newMessage, chatId: oneChat._id }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setMessages([...messages, response.data]);
            setNewMessage('');
            setLabelValue('');
            setMessageUpdated(!isMessageUpdated);
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Error sending message:', error);
        }
    };

    const handleInputChange = (event) => {
        setNewMessage(event.target.value);
    };

    const ChatMessage = ({ message }) => {
        if (!message.content || !message.senderId || !message.senderId._id) {
            return null;
        }
        const messageBackground = message.senderId._id === me._id ? '#78aaa1' : '#E0E0E0';
        const time = message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : '';
        const alignSelf = message.senderId._id === me._id ? 'flex-end' : 'flex-start';

        if (!message.content) {
            return null;
        }

        return (
            <div style={{
                width: "100%",
                display: 'flex',
                flexDirection: 'column',
                alignItems: alignSelf
            }}>
                <MuiBox
                    sx={{
                        margin: '5px',
                        flexDirection: 'column',
                        alignItems: alignSelf,
                        padding: '10px',
                        borderRadius: '10px',
                        backgroundColor: messageBackground,
                        width: 'fit-content',
                        height: 'fit-content',
                    }}
                >
                    <Typography variant="body1">{message.content}</Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.8rem' }}>{time}</Typography>
                </MuiBox>
            </div>
        );
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: "100%", height: '95vh' }}>
            <Navbar selectedUserId={selectedUserId} onlineUser={onlineUser} />
            <Box sx={{ flexGrow: 1, overflowY: 'auto', padding: '10px' }}>
                {messages.length > 0 && messages.map((message) => (
                    <ChatMessage key={message._id} message={message} />
                ))}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
                <TextField
                    value={newMessage}
                    onChange={handleInputChange}
                    variant="outlined"
                    label={labelValue || "Type a message"}
                    fullWidth
                    sx={{ borderRadius: '20px', marginRight: '10px' }}
                />
                <Button onClick={sendMessage} >
                    <SendIcon style={{ color: "#78aaa1" }} />
                </Button>
            </Box>
            <ToastContainer/>
        </Box>
    );
};
export default Chat;