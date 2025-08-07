"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type User = {
  id: string;
  email: string;
  role: string;
  status: string;
  subscriptionId?: string;
  subscriptionEnd?: string;
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }

    // Vérifier si l'utilisateur est admin
    if (session.user?.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }

    fetchUsers();
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSubscription = async (userId: string, currentStatus: string) => {
    setActionLoading(userId);
    
    try {
      const response = await fetch("/api/admin/toggle-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          userId, 
          activate: currentStatus !== "actif" 
        }),
      });

      if (response.ok) {
        await fetchUsers(); // Recharger la liste
      } else {
        alert("Erreur lors de la modification");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur de connexion");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (userId: string, email: string) => {
    if (!confirm(`Supprimer l'utilisateur ${email} ?`)) return;
    
    setActionLoading(userId);
    
    try {
      const response = await fetch("/api/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        await fetchUsers(); // Recharger la liste
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur de connexion");
    } finally {
      setActionLoading(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-400">Chargement du panel admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
                PANEL
              </span>
              <span className="text-white"> ADMIN</span>
            </h1>
            <p className="text-gray-400">Gestion des utilisateurs et abonnements</p>
          </div>
          <Link href="/dashboard">
            <button className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg text-white transition-colors">
              ← Retour Dashboard
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700/50">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{users.length}</div>
              <div className="text-gray-400 text-sm">Total Utilisateurs</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700/50">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">
                {users.filter(u => u.status === "actif").length}
              </div>
              <div className="text-gray-400 text-sm">Abonnés Actifs</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700/50">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400">
                {users.filter(u => u.status === "gratuit").length}
              </div>
              <div className="text-gray-400 text-sm">Comptes Gratuits</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700/50">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">
                {users.filter(u => u.role === "ADMIN").length}
              </div>
              <div className="text-gray-400 text-sm">Administrateurs</div>
            </div>
          </div>
        </div>

        {/* Navigation Admin */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/ip-management">
            <div className="bg-gradient-to-br from-blue-800/50 to-blue-900/50 p-6 rounded-xl border border-blue-700/50 hover:border-blue-600/70 transition-all cursor-pointer">
              <div className="text-center">
                <div className="text-4xl mb-3">🌐</div>
                <div className="text-xl font-bold text-blue-400 mb-2">Gestion DNS</div>
                <div className="text-gray-400 text-sm">IPs autorisées & logs Smart DNS</div>
              </div>
            </div>
          </Link>
          <Link href="/admin/contact-requests">
            <div className="bg-gradient-to-br from-purple-800/50 to-purple-900/50 p-6 rounded-xl border border-purple-700/50 hover:border-purple-600/70 transition-all cursor-pointer">
              <div className="text-center">
                <div className="text-4xl mb-3">💬</div>
                <div className="text-xl font-bold text-purple-400 mb-2">Support</div>
                <div className="text-gray-400 text-sm">Demandes de contact</div>
              </div>
            </div>
          </Link>
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-xl border border-gray-700/50 opacity-50">
            <div className="text-center">
              <div className="text-4xl mb-3">⚙️</div>
              <div className="text-xl font-bold text-gray-400 mb-2">Paramètres</div>
              <div className="text-gray-500 text-sm">Bientôt disponible</div>
            </div>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="p-6 border-b border-gray-700/50">
            <h2 className="text-2xl font-bold text-white">Gestion des Utilisateurs</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold">Rôle</th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold">Expiration</th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id} className={`border-t border-gray-700/50 ${index % 2 === 0 ? 'bg-gray-800/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{user.email}</div>
                      <div className="text-gray-400 text-sm">{user.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === "ADMIN" 
                          ? "bg-purple-500/20 text-purple-400" 
                          : "bg-gray-500/20 text-gray-400"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status === "actif" 
                          ? "bg-green-500/20 text-green-400" 
                          : "bg-orange-500/20 text-orange-400"
                      }`}>
                        {user.status === "actif" ? "🟢 Premium" : "🟡 Gratuit"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300 text-sm">
                        {user.subscriptionEnd 
                          ? new Date(user.subscriptionEnd).toLocaleDateString("fr-FR")
                          : "Aucune"
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {user.role !== "ADMIN" && (
                          <button
                            onClick={() => toggleSubscription(user.id, user.status)}
                            disabled={actionLoading === user.id}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              user.status === "actif"
                                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            } disabled:opacity-50`}
                          >
                            {actionLoading === user.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : user.status === "actif" ? (
                              "Désactiver"
                            ) : (
                              "Activer"
                            )}
                          </button>
                        )}
                        
                        {user.role !== "ADMIN" && (
                          <button
                            onClick={() => deleteUser(user.id, user.email)}
                            disabled={actionLoading === user.id}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                          >
                            Supprimer
                          </button>
                        )}
                        
                        {user.role === "ADMIN" && (
                          <span className="text-gray-500 text-sm">Administrateur</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-lg">Aucun utilisateur trouvé</div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">📋 Instructions Panel Admin</h3>
          <div className="grid md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h4 className="font-semibold text-blue-400 mb-2">✅ Activer un abonnement :</h4>
              <p className="text-sm">Cliquez sur "Activer" pour donner accès Premium à un utilisateur (durée : 30 jours).</p>
            </div>
            <div>
              <h4 className="font-semibold text-red-400 mb-2">❌ Désactiver un abonnement :</h4>
              <p className="text-sm">Cliquez sur "Désactiver" pour révoquer l'accès Premium immédiatement.</p>
            </div>
            <div>
              <h4 className="font-semibold text-orange-400 mb-2">🗑️ Supprimer un utilisateur :</h4>
              <p className="text-sm">Supprime définitivement le compte et toutes ses données.</p>
            </div>
            <div>
              <h4 className="font-semibold text-purple-400 mb-2">👑 Comptes Admin :</h4>
              <p className="text-sm">Les administrateurs ne peuvent pas être modifiés via cette interface.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}