export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
}

export interface NewLoginNotification extends Notification {
  type: 'warning';
  title: 'Nouvelle connexion détectée';
  message: string;
  deviceInfo: {
    deviceName: string;
    deviceType: string;
    browser: string;
    os: string;
    ip?: string;
    location?: string;
  };
}

// Stockage local des notifications
const NOTIFICATIONS_KEY = 'ldz_notifications';

export const notificationService = {
  // Récupérer toutes les notifications
  getAll(): Notification[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  // Ajouter une notification
  add(notification: Omit<Notification, 'id' | 'timestamp'>): void {
    if (typeof window === 'undefined') return;
    
    const notifications = this.getAll();
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    
    notifications.unshift(newNotification);
    
    // Garder seulement les 50 dernières notifications
    if (notifications.length > 50) {
      notifications.splice(50);
    }
    
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    
    // Déclencher un événement personnalisé
    window.dispatchEvent(new CustomEvent('notification-added', { 
      detail: newNotification 
    }));
  },

  // Marquer une notification comme lue
  markAsRead(id: string): void {
    if (typeof window === 'undefined') return;
    
    const notifications = this.getAll();
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    }
  },

  // Marquer toutes les notifications comme lues
  markAllAsRead(): void {
    if (typeof window === 'undefined') return;
    
    const notifications = this.getAll();
    notifications.forEach(n => n.read = true);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  },

  // Supprimer une notification
  remove(id: string): void {
    if (typeof window === 'undefined') return;
    
    const notifications = this.getAll();
    const filtered = notifications.filter(n => n.id !== id);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(filtered));
  },

  // Supprimer toutes les notifications
  clear(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(NOTIFICATIONS_KEY);
  },

  // Compter les notifications non lues
  getUnreadCount(): number {
    return this.getAll().filter(n => !n.read).length;
  },

  // Créer une notification de nouvelle connexion
  createNewLoginNotification(deviceInfo: {
    deviceName: string;
    deviceType: string;
    browser: string;
    os: string;
    ip?: string;
    location?: string;
  }): void {
    const message = `Connexion depuis ${deviceInfo.deviceName} (${deviceInfo.browser} sur ${deviceInfo.os})`;
    
    this.add({
      type: 'warning',
      title: 'Nouvelle connexion détectée',
      message,
      read: false,
      action: {
        label: 'Voir les sessions',
        url: '/sessions'
      }
    });
  }
};

// Fonction pour créer des notifications côté serveur
// Ces notifications seront récupérées côté client lors de la prochaine visite
export async function createServerNotification(userId: string, notification: Omit<Notification, 'id' | 'timestamp'>): Promise<void> {
  try {
    const { prisma } = await import('./prisma');
    
    await prisma.userNotification.create({
      data: {
        userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        actionUrl: notification.action?.url,
        actionLabel: notification.action?.label
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de la notification en base:', error);
  }
}

// Fonction pour créer une notification de nouvelle connexion côté serveur
export async function createServerNewLoginNotification(userId: string, deviceInfo: {
  deviceName: string;
  deviceType: string;
  browser: string;
  os: string;
  ip?: string;
  location?: string;
}): Promise<void> {
  const message = `Connexion depuis ${deviceInfo.deviceName} (${deviceInfo.browser} sur ${deviceInfo.os})`;
  
  await createServerNotification(userId, {
    type: 'warning',
    title: 'Nouvelle connexion détectée',
    message,
    read: false,
    action: {
      label: 'Voir les sessions',
      url: '/sessions'
    }
  });
}
