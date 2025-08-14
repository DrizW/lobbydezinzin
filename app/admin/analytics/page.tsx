'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AnalyticsEvent {
  id: string;
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
  user?: {
    email: string;
  };
}

interface AnalyticsStats {
  totalEvents: number;
  uniqueUsers: number;
  topEvents: Array<{ event: string; count: number }>;
  topCategories: Array<{ category: string; count: number }>;
  recentEvents: AnalyticsEvent[];
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user?.email || session.user.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    fetchAnalytics();
  }, [status, session, router, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const getEventIcon = (event: string) => {
    const icons: Record<string, string> = {
      'user_registered': '👤',
      'user_logged_in': '🔐',
      'user_logged_out': '🚪',
      'subscription_created': '💳',
      'subscription_cancelled': '❌',
      'subscription_expired': '⏰',
      'region_changed': '🌍',
      'user_churned': '📉',
      '2fa_enabled': '🔒',
      '2fa_disabled': '🔓',
      'page_viewed': '👁️',
      'conversion': '💰',
      'cookie_consent_updated': '🍪'
    };
    return icons[event] || '📊';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'user': 'bg-blue-500',
      'subscription': 'bg-green-500',
      'region': 'bg-purple-500',
      'security': 'bg-red-500',
      'navigation': 'bg-yellow-500',
      'business': 'bg-orange-500',
      'privacy': 'bg-indigo-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user?.email || session.user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">📊 Analytics</h1>
            <p className="text-gray-400">Statistiques d'utilisation et événements clés</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">90 derniers jours</option>
            </select>
            
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
            >
              🔄 Actualiser
            </button>
          </div>
        </div>

        {stats && (
          <>
            {/* Statistiques générales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total événements</p>
                    <p className="text-3xl font-bold text-white">{stats.totalEvents.toLocaleString()}</p>
                  </div>
                  <div className="text-4xl">📊</div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Utilisateurs uniques</p>
                    <p className="text-3xl font-bold text-white">{stats.uniqueUsers.toLocaleString()}</p>
                  </div>
                  <div className="text-4xl">👥</div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Période</p>
                    <p className="text-3xl font-bold text-white">
                      {timeRange === '7d' ? '7j' : timeRange === '30d' ? '30j' : '90j'}
                    </p>
                  </div>
                  <div className="text-4xl">📅</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Top événements */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4">🔥 Événements les plus fréquents</h3>
                <div className="space-y-3">
                  {stats.topEvents.map((item, index) => (
                    <div key={item.event} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getEventIcon(item.event)}</span>
                        <div>
                          <p className="text-white font-medium">{item.event.replace(/_/g, ' ')}</p>
                          <p className="text-gray-400 text-sm">{item.count} occurrences</p>
                        </div>
                      </div>
                      <div className="text-gray-400 text-sm">#{index + 1}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top catégories */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4">📈 Catégories les plus actives</h3>
                <div className="space-y-3">
                  {stats.topCategories.map((item, index) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${getCategoryColor(item.category)}`}></div>
                        <div>
                          <p className="text-white font-medium">{item.category}</p>
                          <p className="text-gray-400 text-sm">{item.count} événements</p>
                        </div>
                      </div>
                      <div className="text-gray-400 text-sm">#{index + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Événements récents */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">🕒 Événements récents</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400">Événement</th>
                      <th className="text-left py-3 px-4 text-gray-400">Catégorie</th>
                      <th className="text-left py-3 px-4 text-gray-400">Utilisateur</th>
                      <th className="text-left py-3 px-4 text-gray-400">Détails</th>
                      <th className="text-left py-3 px-4 text-gray-400">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentEvents.map((event) => (
                      <tr key={event.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl">{getEventIcon(event.event)}</span>
                            <span className="text-white">{event.event.replace(/_/g, ' ')}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                            {event.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {event.user?.email || 'Anonyme'}
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {event.label || '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-sm">
                          {formatDate(event.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
