import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Notification, notificationsAPI } from '../lib/api';
import toast from 'react-hot-toast';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    toast.success(notification.message);
  };

  const loadNotifications = async () => {
    try {
      const response = await notificationsAPI.getAll();
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  useEffect(() => {
    if (socketRef.current) {
      return;
    }

    // Use localhost:3000 instead of 3001 to match backend port
    const socketUrl = 'http://localhost:3000';
    console.log('Initializing socket connection to:', socketUrl);
    const newSocket = io(socketUrl, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      transports: ['polling'], // Match backend configuration
      upgrade: false, // Disable transport upgrades to match backend
      forceNew: false, // Reuse existing connection if possible
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      console.log('Socket transport:', newSocket.io.engine.transport.name);
      console.log('Socket readyState:', newSocket.io.engine.readyState);
      // Remove loadNotifications() call to prevent API interference
      // loadNotifications();
    });

    newSocket.on('disconnect', (reason) => {
      console.log('⚠️ Socket disconnected:', reason);
      console.log('Socket transport at disconnect:', newSocket.io.engine.transport.name);
      console.log('Socket readyState at disconnect:', newSocket.io.engine.readyState);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      console.error('Error type:', error.type);
      console.error('Error description:', error.description);
    });

    newSocket.on('notification', (notification: Notification) => {
      addNotification(notification);
    });

    newSocket.on('connected', (data) => {
      console.log('Received connection confirmation:', data);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      addNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};