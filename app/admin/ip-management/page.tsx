'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  allowedIPs: string | null;
  role: string;
  subscription?: {
    status: string;
    currentPeriodEnd: string;
  } | null;
  settings?: {
    selectedCountry: string;
  } | null;
  _count: {
    dnsLogs: number;
  };
}

interface DNSLog {
  id: string;
  domain: string;
  region: string;
  clientIP: string;
  timestamp: string;
  user: {
    email: string;
  };
}

export default function IPManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [dnsLogs, setDNSLogs] = useState<DNSLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [newIP, setNewIP] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchUsers();
    fetchDNSLogs();
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users-with-ips');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Erreur récupération utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDNSLogs = async () => {
    try {
      const response = await fetch('/api/admin/dns-logs');
      if (response.ok) {
        const data = await response.json();
        setDNSLogs(data);
      }
    } catch (error) {
      console.error('Erreur récupération logs DNS:', error);
    }
  };

  const updateUserIPs = async (userId: string, ips: string) => {
    try {
      const response = await fetch('/api/admin/update-user-ips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ips })
      });

      if (response.ok) {
        await fetchUsers();
        setSelectedUser('');
        setNewIP('');
        alert('✅ IPs mises à jour avec succès');
      } else {
        alert('❌ Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur mise à jour IPs:', error);
    }
  };

  const getClientIP = async () => {
    try {
      const response = await fetch('/api/get-client-ip');
      const data = await response.json();
      setNewIP(data.ip);
    } catch (error) {
      console.error('Erreur récupération IP:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">🔄 Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-white mb-6">🔧 Gestion DNS & IPs</h1>
          
          {/* Tabs */}
          <div className="flex mb-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 mr-2 rounded ${
                activeTab === 'users' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              👥 Utilisateurs & IPs
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded ${
                activeTab === 'logs' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              📊 Logs DNS
            </button>
          </div>

          {/* Onglet Utilisateurs */}
          {activeTab === 'users' && (
            <div>
              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">➕ Ajouter/Modifier IP</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="bg-gray-600 text-white rounded px-3 py-2"
                  >
                    <option value="">Sélectionner un utilisateur</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.email} {user.subscription?.status === 'active' ? '✅' : '❌'}
                      </option>
                    ))}
                  </select>
                  
                  <div className="flex">
                    <input
                      type="text"
                      value={newIP}
                      onChange={(e) => setNewIP(e.target.value)}
                      placeholder="192.168.1.100 ou auto-detect"
                      className="bg-gray-600 text-white rounded-l px-3 py-2 flex-1"
                    />
                    <button
                      onClick={getClientIP}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-r"
                      title="Détecter mon IP"
                    >
                      🎯
                    </button>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (selectedUser && newIP) {
                        const user = users.find(u => u.id === selectedUser);
                        const currentIPs = user?.allowedIPs || '';
                        const newIPs = currentIPs ? `${currentIPs},${newIP}` : newIP;
                        updateUserIPs(selectedUser, newIPs);
                      }
                    }}
                    disabled={!selectedUser || !newIP}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded px-4 py-2"
                  >
                    ✅ Ajouter IP
                  </button>
                </div>
              </div>

              {/* Liste des utilisateurs */}
              <div className="bg-gray-700 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-600">
                    <tr>
                      <th className="text-left p-3 text-white">📧 Email</th>
                      <th className="text-left p-3 text-white">🔑 Abonnement</th>
                      <th className="text-left p-3 text-white">🌍 Région</th>
                      <th className="text-left p-3 text-white">📡 IPs Autorisées</th>
                      <th className="text-left p-3 text-white">📊 Logs</th>
                      <th className="text-left p-3 text-white">⚙️ Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-b border-gray-600">
                        <td className="p-3 text-white">{user.email}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.subscription?.status === 'active' 
                              ? 'bg-green-600 text-white' 
                              : 'bg-red-600 text-white'
                          }`}>
                            {user.subscription?.status === 'active' ? '✅ Actif' : '❌ Inactif'}
                          </span>
                        </td>
                        <td className="p-3 text-gray-300">
                          {user.settings?.selectedCountry || 'nigeria'}
                        </td>
                        <td className="p-3 text-gray-300 max-w-xs truncate">
                          {user.allowedIPs || '❌ Aucune IP'}
                        </td>
                        <td className="p-3 text-gray-300">
                          {user._count.dnsLogs} requêtes
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => updateUserIPs(user.id, '')}
                            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                          >
                            🗑️ Clear
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Onglet Logs */}
          {activeTab === 'logs' && (
            <div className="bg-gray-700 rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-600">
                <h3 className="text-lg font-semibold text-white">📊 Activité DNS en Temps Réel</h3>
                <p className="text-gray-300 text-sm">Dernières requêtes interceptées par le Smart DNS</p>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-600 sticky top-0">
                    <tr>
                      <th className="text-left p-3 text-white">⏰ Timestamp</th>
                      <th className="text-left p-3 text-white">👤 Utilisateur</th>
                      <th className="text-left p-3 text-white">🌐 Domaine</th>
                      <th className="text-left p-3 text-white">🌍 Région</th>
                      <th className="text-left p-3 text-white">📡 IP Client</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dnsLogs.map(log => (
                      <tr key={log.id} className="border-b border-gray-600">
                        <td className="p-3 text-gray-300 text-xs">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3 text-white text-sm">
                          {log.user.email}
                        </td>
                        <td className="p-3 text-blue-400 text-sm font-mono">
                          {log.domain}
                        </td>
                        <td className="p-3 text-green-400 text-sm">
                          {log.region}
                        </td>
                        <td className="p-3 text-yellow-400 text-sm font-mono">
                          {log.clientIP}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📋 Instructions Smart DNS</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-blue-200 mb-2">🎮 Configuration Console</h4>
              <code className="bg-gray-800 text-green-400 p-2 rounded block">
                DNS Primaire: 192.168.1.100<br/>
                DNS Secondaire: 8.8.8.8
              </code>
            </div>
            <div>
              <h4 className="font-semibold text-blue-200 mb-2">🚀 Déploiement Serveur</h4>
              <code className="bg-gray-800 text-green-400 p-2 rounded block">
                sudo node scripts/smart-dns-server.js<br/>
                # Port 53 requis (root access)
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}