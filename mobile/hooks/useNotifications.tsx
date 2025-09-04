import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authFetch } from '../../lib/auth-fetch';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  claimId?: string;
  actionType?: 'status_update' | 'new_claim' | 'reminder' | 'system';
}

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => Promise<void>;
  removeNotification: (id: string) => void;
  getFormattedTime: (timestamp: Date) => string;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await authFetch('/mobile/notifications');
        if (!res.ok) return;
        const data = await res.json();
        const parsed = data.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(parsed);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const handler = (event: MessageEvent) => {
      const { type, notification } = event.data || {};
      if (type === 'PUSH_NOTIFICATION' && notification) {
        const parsed: Notification = {
          id: notification.id || Date.now().toString(),
          title: notification.title || '',
          message: notification.message || '',
          type: notification.type || 'info',
          timestamp: new Date(notification.timestamp || Date.now()),
          read: false,
          claimId: notification.claimId,
          actionType: notification.actionType,
        };
        setNotifications(prev =>
          prev.some(n => n.id === parsed.id) ? prev : [parsed, ...prev]
        );
      }
    };

    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    try {
      await authFetch(`/mobile/notifications/${notificationId}/read`, { method: 'POST' });
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    try {
      await authFetch('/mobile/notifications/read-all', { method: 'POST' });
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
    }
  };

  const addNotification = async (
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ) => {
    try {
      const res = await authFetch('/mobile/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification)
      });
      if (!res.ok) return;
      const saved = await res.json();
      const parsed: Notification = {
        ...saved,
        timestamp: new Date(saved.timestamp)
      };
      setNotifications(prev => [parsed, ...prev]);
    } catch (err) {
      console.error('Failed to add notification', err);
    }
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getFormattedTime = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Teraz';
    if (diffInMinutes < 60) return `${diffInMinutes} min temu`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} godz. temu`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} dni temu`;
    
    return timestamp.toLocaleDateString('pl-PL');
  };

  const value: NotificationsContextValue = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
    getFormattedTime
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
}
