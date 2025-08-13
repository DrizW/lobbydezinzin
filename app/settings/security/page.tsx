"use client";
import { useEffect, useState } from "react";

export default function SecuritySettingsPage() {
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdDone, setPwdDone] = useState(false);

  useEffect(() => {
    // Récupérer un QR/secret pour initialiser 2FA
    (async () => {
      try {
        const res = await fetch('/api/security/request-otp', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          setQr(data.qr); setSecret(data.secret);
        }
      } catch {}
    })();
  }, []);

  const enable = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    const res = await fetch('/api/security/enable-2fa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
    if (res.ok) setEnabled(true); else setError("Code invalide");
  };

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
        <h2 className="text-lg text-gray-200 mb-2">Activer l'authentification à deux facteurs (2FA)</h2>
        <p className="text-gray-400 mb-4">Scannez le QR avec Google Authenticator / Authy, puis entrez le code.</p>
        {qr && <img src={qr} alt="QR Code" className="mx-auto mb-4" />}
        {secret && <div className="text-center text-gray-400 text-sm mb-4">Secret: <span className="font-mono">{secret}</span></div>}
        <form onSubmit={enable}>
          <input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="Code 6 chiffres" className="w-full mb-3 p-2 border border-gray-700 bg-gray-900 text-white rounded" value={token} onChange={e=>setToken(e.target.value)} required />
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded font-semibold">Activer 2FA</button>
        </form>
        {enabled && <div className="text-green-400 mt-3">2FA activée.</div>}
        <div className="h-px bg-gray-700 my-6" />
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


