"use client";
import { useEffect, useState } from "react";

export default function SecuritySettingsPage() {
  // 2FA retirée
  const [error, setError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdDone, setPwdDone] = useState(false);

  useEffect(() => {}, []);

  const enable = async (_e: React.FormEvent) => {};

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setPwdDone(false);
    if (newPassword !== confirmPassword) { setError('Les mots de passe ne correspondent pas'); return; }
    const res = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }) });
    if (res.ok) setPwdDone(true); else {
      const data = await res.json().catch(()=>({}));
      setError(data?.error || 'Erreur lors du changement de mot de passe');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-lg">
        <h1 className="text-2xl font-bold text-blue-300 mb-4">Sécurité du compte</h1>
        <h2 className="text-lg text-gray-200 mb-4">Changer le mot de passe</h2>
        <h2 className="text-lg text-gray-200 mb-2">Changer le mot de passe</h2>
        <form onSubmit={changePassword}>
          <input type="password" placeholder="Mot de passe actuel" className="w-full mb-3 p-2 border border-gray-700 bg-gray-900 text-white rounded" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} required />
          <input type="password" placeholder="Nouveau mot de passe" className="w-full mb-3 p-2 border border-gray-700 bg-gray-900 text-white rounded" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required />
          <input type="password" placeholder="Confirmer le nouveau mot de passe" className="w-full mb-3 p-2 border border-gray-700 bg-gray-900 text-white rounded" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} required />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-semibold">Mettre à jour</button>
        </form>
        {pwdDone && <div className="text-green-400 mt-3">Mot de passe mis à jour.</div>}
        {error && <div className="text-red-400 mt-3">{error}</div>}
      </div>
    </div>
  );
}


