import { useState, useEffect } from 'react';

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

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Aktualizacja statusu',
      message: 'Szkoda SK-2024-001 przeszła do etapu realizacji naprawy',
      type: 'info',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minut temu
      read: false,
      claimId: 'SK-2024-001',
      actionType: 'status_update'
    },
    {
      id: '2',
      title: 'Nowa szkoda',
      message: 'Otrzymano nowe zgłoszenie szkody komunikacyjnej',
      type: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 godziny temu
      read: false,
      actionType: 'new_claim'
    },
    {
      id: '3',
      title: 'Przypomnienie',
      message: 'Szkoda SK-2024-002 oczekuje na Twoją reakcję',
      type: 'warning',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 godziny temu
      read: false,
      claimId: 'SK-2024-002',
      actionType: 'reminder'
    },
    {
      id: '4',
      title: 'Szkoda zakończona',
      message: 'Pomyślnie zakończono realizację szkody SK-2024-004',
      type: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 godzin temu
      read: true,
      claimId: 'SK-2024-004',
      actionType: 'status_update'
    },
    {
      id: '5',
      title: 'Konserwacja systemu',
      message: 'Planowana konserwacja systemu w niedzielę 15.09 od 2:00 do 6:00',
      type: 'info',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 dzień temu
      read: true,
      actionType: 'system'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
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

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
    getFormattedTime
  };
}
