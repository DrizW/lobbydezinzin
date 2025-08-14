'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserSession {
  id: string;
  deviceName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  os: string;
  ip?: string;
  location?: string;
  isCurrent: boolean;
  lastActivity: string;
  createdAt: string;
}

export default function SessionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    fetchSessions();
  }, [status, router]);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir révoquer cette session ?')) return;
    
    setRevoking(sessionId);
    try {
      const response = await fetch('/api/sessions/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      if (response.ok) {
        setSessions(sessions.filter(s => s.id !== sessionId));
        // Afficher un toast de succès
        if (typeof window !== 'undefined' && (window as any).showToast) {
          (window as any).showToast('Session révoquée avec succès', 'success');
        }
      } else {
        throw new Error('Erreur lors de la révocation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast('Erreur lors de la révocation', 'error');
      }
    } finally {
      setRevoking(null);
    }
  };

  const revokeAllSessions = async () => {
    if (!confirm('Êtes-vous sûr de vouloir révoquer toutes les autres sessions ? Vous resterez connecté sur cet appareil.')) return;
    
    setRevokingAll(true);
    try {
      const response = await fetch('/api/sessions/revoke-all', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(sessions.filter(s => s.isCurrent));
        if (typeof window !== 'undefined' && (window as any).showToast) {
          (window as any).showToast(`${data.sessionsRevoked} session(s) révoquée(s)`, 'success');
        }
      } else {
        throw new Error('Erreur lors de la révocation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast('Erreur lors de la révocation', 'error');
      }
    } finally {
      setRevokingAll(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return '📱';
      case 'tablet': return '📱';
      case 'desktop': return '💻';
      default: return '🖥️';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Sessions actives</h1>
            <p className="text-gray-400">
              Gérez vos appareils connectés et révoquez l'accès à distance
            </p>
          </div>
          <Link 
            href="/dashboard"
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            ← Retour au dashboard
          </Link>
        </div>

        {/* Actions */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Actions</h2>
              <p className="text-gray-400 text-sm">
                Vous êtes actuellement connecté sur {sessions.filter(s => s.isCurrent).length} appareil(s)
              </p>
            </div>
            {sessions.filter(s => !s.isCurrent).length > 0 && (
              <button
                onClick={revokeAllSessions}
                disabled={revokingAll}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {revokingAll ? 'Révocation...' : `Révoquer toutes les autres sessions (${sessions.filter(s => !s.isCurrent).length})`}
              </button>
            )}
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-400">Aucune session active</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div 
                key={session.id} 
                className={`bg-gray-800 rounded-lg p-6 border-l-4 ${
                  session.isCurrent ? 'border-green-500' : 'border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {getDeviceIcon(session.deviceType)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-white">
                          {session.deviceName}
                        </h3>
                        {session.isCurrent && (
                          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                            Actuel
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">
                        {session.browser} sur {session.os}
                      </p>
                      {session.ip && (
                        <p className="text-gray-500 text-xs">
                          IP: {session.ip}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-400 mb-2">
                      <div>Dernière activité: {formatDate(session.lastActivity)}</div>
                      <div>Connecté le: {formatDate(session.createdAt)}</div>
                    </div>
                    {!session.isCurrent && (
                      <button
                        onClick={() => revokeSession(session.id)}
                        disabled={revoking === session.id}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-4 py-2 rounded text-sm transition-colors"
                      >
                        {revoking === session.id ? 'Révocation...' : 'Révoquer'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Security Tips */}
        <div className="mt-8 bg-blue-900/20 border border-blue-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-300 mb-3">💡 Conseils de sécurité</h3>
          <ul className="text-blue-200 text-sm space-y-2">
            <li>• Révoquez les sessions des appareils que vous ne reconnaissez pas</li>
            <li>• Utilisez "Révoquer toutes les autres sessions" si vous suspectez une intrusion</li>
            <li>• Vérifiez régulièrement vos sessions actives</li>
            <li>• Activez l'authentification à deux facteurs pour plus de sécurité</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
