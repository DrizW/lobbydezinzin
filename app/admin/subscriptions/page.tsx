"use client";
import { useEffect, useState } from "react";

type Sub = { id: string; status: string; currentPeriodEnd: string; user: { id: string; email: string; role: string } };

export default function AdminSubscriptions() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [status, setStatus] = useState<string>("active");
  const [loading, setLoading] = useState<boolean>(true);

  const load = async (s: string) => {
    setLoading(true);
    const res = await fetch(`/api/admin/subscriptions?status=${encodeURIComponent(s)}`);
    const data = await res.json();
    setSubs(data.subscriptions || []);
    setLoading(false);
  };

  useEffect(() => { load(status); }, [status]);

  const action = async (id: string, a: string) => {
    await fetch('/api/admin/subscriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscriptionId: id, action: a }) });
    load(status);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-6xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Abonnements</h1>
          <div className="flex gap-2">
            {['active','expired','canceled','all'].map((s)=> (
              <button key={s} onClick={()=>setStatus(s==='all' ? '' : s)} className={`px-4 py-2 rounded-xl text-white font-semibold transition-all ${ (status===s || (s==='all' && status==='')) ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-gray-700 hover:bg-gray-600' }`}>{s||'all'}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-gray-300">Chargement...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-200">
              <thead>
                <tr className="text-sm text-gray-400">
                  <th className="py-2">Utilisateur</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Expire</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s)=> (
                  <tr key={s.id} className="border-t border-gray-700/40">
                    <td className="py-3">{s.user.email}</td>
                    <td className="py-3 capitalize">{s.status}</td>
                    <td className="py-3">{new Date(s.currentPeriodEnd).toLocaleString()}</td>
                    <td className="py-3 flex gap-2">
                      <button onClick={()=>action(s.id,'cancel')} className="px-3 py-1 rounded bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm">Annuler</button>
                      <button onClick={()=>action(s.id,'expire')} className="px-3 py-1 rounded bg-gray-700 text-sm">Marquer expiré</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


