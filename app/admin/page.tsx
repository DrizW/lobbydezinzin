"use client";
import React, { useState, useEffect } from "react";

const continents = ["Europe", "Amérique", "Asie"];

export default function AdminPage() {
  const [dnsServers, setDnsServers] = useState<{ip: string, continent: string}[]>([]);
  const [ip, setIp] = useState("");
  const [continent, setContinent] = useState("Europe");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch DNS servers on mount
  useEffect(() => {
    fetchDns();
  }, []);

  async function fetchDns() {
    setLoading(true);
    const res = await fetch("/api/dns");
    const data = await res.json();
    setDnsServers(data);
    setLoading(false);
  }

  async function addServer(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!ip) return;
    const res = await fetch("/api/dns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip, continent }),
    });
    if (res.ok) {
      setIp("");
      fetchDns();
    } else {
      const data = await res.json();
      setError(data.error || "Erreur lors de l'ajout");
    }
  }

  async function removeServer(ipToRemove: string) {
    setError("");
    const res = await fetch("/api/dns", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip: ipToRemove }),
    });
    if (res.ok) {
      fetchDns();
    } else {
      setError("Erreur lors de la suppression");
    }
  }

  // Pour l'édition DNS
  const [editingIp, setEditingIp] = useState<string | null>(null);
  const [editIp, setEditIp] = useState("");
  const [editContinent, setEditContinent] = useState(continents[0]);

  function startEditDns(server: { ip: string; continent: string }) {
    setEditingIp(server.ip);
    setEditIp(server.ip);
    setEditContinent(server.continent);
  }

  async function saveEditDns() {
    if (!editingIp) return;
    const res = await fetch("/api/dns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldIp: editingIp, newIp: editIp, continent: editContinent }),
    });
    if (res.ok) {
      setEditingIp(null);
      setEditIp("");
      setEditContinent(continents[0]);
      fetchDns();
    } else {
      const data = await res.json();
      setError(data.error || "Erreur lors de la modification");
    }
  }

  function cancelEditDns() {
    setEditingIp(null);
    setEditIp("");
    setEditContinent(continents[0]);
  }

  // Liste des utilisateurs abonnés depuis l'API
  const [users, setUsers] = useState<{ email: string; status: string }[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");

  useEffect(() => {
    fetch("/api/users")
      .then(res => {
        if (!res.ok) {
          throw new Error("Erreur lors du chargement des utilisateurs");
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          setUsers([]);
          setUsersError("Format de données invalide");
        }
      })
      .catch(error => {
        console.error("Erreur:", error);
        setUsers([]);
        setUsersError("Erreur lors du chargement des utilisateurs");
      })
      .finally(() => {
        setUsersLoading(false);
      });
  }, []);

  // Suppression d'un utilisateur
  async function removeUser(email: string) {
    if (!window.confirm(`Supprimer l'utilisateur ${email} ?`)) return;
    const res = await fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setUsers(users => users.filter(u => u.email !== email));
    } else {
      alert("Erreur lors de la suppression");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              ADMIN
            </span>
            <span className="text-white"> PANEL</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Gestion des serveurs DNS et des utilisateurs
          </p>
        </div>

        {/* DNS Management Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                GESTION
              </span>
              <span className="text-white"> DES SERVEURS DNS</span>
            </h2>
            
            <form onSubmit={addServer} className="flex flex-col md:flex-row gap-4 mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700/30">
              <input
                type="text"
                placeholder="IP du serveur"
                value={ip}
                onChange={e => setIp(e.target.value)}
                className="flex-1 border border-gray-600 bg-gray-700 text-white p-3 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                required
              />
              <select
                value={continent}
                onChange={e => setContinent(e.target.value)}
                className="border border-gray-600 bg-gray-700 text-white p-3 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
              >
                {continents.map(c => <option key={c}>{c}</option>)}
              </select>
              <button type="submit" className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-6 py-3 rounded-lg text-white font-bold transition-all duration-200 shadow-lg hover:shadow-orange-500/25">
                Ajouter
              </button>
            </form>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                <p className="text-gray-400 mt-4">Chargement des serveurs...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dnsServers.map(s => (
                  <div key={s.ip} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30 hover:border-orange-500/50 transition-all duration-300">
                    {editingIp === s.ip ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editIp}
                          onChange={e => setEditIp(e.target.value)}
                          className="w-full border border-gray-600 bg-gray-700 text-white p-2 rounded-lg focus:border-orange-500 focus:outline-none"
                        />
                        <select
                          value={editContinent}
                          onChange={e => setEditContinent(e.target.value)}
                          className="w-full border border-gray-600 bg-gray-700 text-white p-2 rounded-lg focus:border-orange-500 focus:outline-none"
                        >
                          {continents.map(c => <option key={c}>{c}</option>)}
                        </select>
                        <div className="flex gap-2">
                          <button onClick={saveEditDns} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-3 py-2 rounded-lg text-white text-sm font-medium transition-all duration-200">
                            Enregistrer
                          </button>
                          <button onClick={cancelEditDns} className="flex-1 bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded-lg text-white text-sm font-medium transition-all duration-200">
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-orange-400 font-mono text-sm">{s.ip}</span>
                          <div className="flex gap-2">
                            <button onClick={() => startEditDns(s)} className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 px-3 py-1 rounded-lg text-white text-xs font-medium transition-all duration-200">
                              Modifier
                            </button>
                            <button onClick={() => removeServer(s.ip)} className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 px-3 py-1 rounded-lg text-white text-xs font-medium transition-all duration-200">
                              Supprimer
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-gray-400 text-sm">{s.continent}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Users Management Section */}
        <section>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">
              <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                GESTION
              </span>
              <span className="text-white"> DES UTILISATEURS</span>
            </h2>

            {usersError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6">
                {usersError}
              </div>
            )}

            {usersLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                <p className="text-gray-400 mt-4">Chargement des utilisateurs...</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-700/30">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-700 to-gray-800">
                      <th className="p-4 text-left text-white font-bold">Email</th>
                      <th className="p-4 text-left text-white font-bold">Statut</th>
                      <th className="p-4 text-left text-white font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-gray-400">
                          Aucun utilisateur trouvé
                        </td>
                      </tr>
                    ) : (
                      users.map(u => (
                        <tr key={u.email} className="border-t border-gray-700/30 hover:bg-gray-800/30 transition-colors">
                          <td className="p-4 text-white">{u.email}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              u.status === "actif" ? "bg-green-500/20 text-green-400" : 
                              u.status === "expiré" ? "bg-red-500/20 text-red-400" : 
                              "bg-gray-500/20 text-gray-400"
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <button 
                              onClick={() => removeUser(u.email)} 
                              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-200"
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
} 