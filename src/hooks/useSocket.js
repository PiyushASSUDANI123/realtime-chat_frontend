import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

export function useSocket(user) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [newMessage, setNewMessage] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Connect to Socket.io (uses vite proxy)
    const socket = io('/', {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Announce this user is online
      socket.emit('user_online', {
        userId: user.id,
        username: user.username,
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen for incoming messages
    socket.on('receive_message', (message) => {
      setNewMessage(message);
    });

    // Listen for online status changes
    socket.on('online_status', ({ userId, isOnline, onlineUsers }) => {
      // Check if the chat partner is in the online list
      const partnerIsOnline = onlineUsers.some(
        (u) => u.userId !== user.id
      );
      setPartnerOnline(partnerIsOnline);
    });

    // Listen for typing status
    socket.on('typing_status', ({ userId, isTyping }) => {
      if (userId !== user.id) {
        setPartnerTyping(isTyping);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  const sendMessage = useCallback((data) => {
    if (socketRef.current) {
      socketRef.current.emit('send_message', data);
    }
  }, []);

  const emitTyping = useCallback((isTyping) => {
    if (socketRef.current && user) {
      socketRef.current.emit('typing', {
        userId: user.id,
        username: user.username,
        isTyping,
      });
    }
  }, [user]);

  return {
    socket: socketRef.current,
    isConnected,
    partnerOnline,
    partnerTyping,
    newMessage,
    sendMessage,
    emitTyping,
  };
}
