'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  action?: {
    label: string;
    url: string;
  };
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Charger les notifications au montage
    loadNotifications();

    // Recharger les notifications toutes les 30 secondes
    const interval = setInterval(loadNotifications, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.notifications?.filter((n: Notification) => !n.read).length || 0);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAsRead', notificationId: id })
      });
      loadNotifications();
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllAsRead' })
      });
      loadNotifications();
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const removeNotification = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', notificationId: id })
      });
      loadNotifications();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleAction = (notification: Notification) => {
    const actionUrl = notification.actionUrl || notification.action?.url;
    if (actionUrl) {
      markAsRead(notification.id);
      router.push(actionUrl);
      setIsOpen(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return new Date(timestamp).toLocaleDateString('fr-FR');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="relative">
      {/* Bouton cloche */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-300 hover:text-orange-400 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 00-6 6v3.75l-2.25 2.25v3h15v-3L15.75 12.75V9.75a6 6 0 00-6-6z" />
        </svg>
        
        {/* Badge de notifications non lues */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown des notifications */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
            <h3 className="text-white font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Liste des notifications */}
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                Aucune notification
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-700/30 hover:bg-gray-700/30 transition-colors ${
                    !notification.read ? 'bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-lg">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-white truncate">
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                                                     <span className="text-xs text-gray-400">
                             {formatTime(notification.createdAt)}
                           </span>
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className="text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mt-1">
                        {notification.message}
                      </p>
                                             {(notification.action || notification.actionLabel) && (
                         <button
                           onClick={() => handleAction(notification)}
                           className="text-xs text-orange-400 hover:text-orange-300 transition-colors mt-2"
                         >
                           {notification.action?.label || notification.actionLabel} →
                         </button>
                       )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-700/50 bg-gray-800/50">
              <button
                                 onClick={() => {
                   // Supprimer toutes les notifications via l'API
                   notifications.forEach(async (notification) => {
                     try {
                       await fetch('/api/notifications', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({ action: 'delete', notificationId: notification.id })
                       });
                     } catch (error) {
                       console.error('Erreur lors de la suppression:', error);
                     }
                   });
                   loadNotifications();
                 }}
                className="text-xs text-gray-400 hover:text-red-400 transition-colors"
              >
                Effacer toutes les notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay pour fermer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
