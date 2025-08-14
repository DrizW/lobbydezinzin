"use client";
import { useEffect, useState } from "react";

export default function SecuritySettingsPage() {
  // 2FA retirée
  const [error, setError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdDone, setPwdDone] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const [qr, setQr] = useState<string>("");
  const [otp, setOtp] = useState("");
  const [twoFAEnabled, setTwoFAEnabled] = useState<boolean>(false);

  useEffect(() => {
    // TODO: récupérer l'état réel via session/me si dispo
  }, []);

  const requestOtp = async () => {
    setError("");
    const res = await fetch('/api/security/request-otp', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setQr(data.qr);
    } else {
      setError('Impossible de générer le QR');
    }
  };

  const enable = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    const res = await fetch('/api/security/enable-2fa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: otp }) });
    if (res.ok) {
      setTwoFAEnabled(true);
    } else {
      const data = await res.json().catch(()=>({}));
      setError(data?.error || 'Code invalide');
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setPwdDone(false);
    if (newPassword !== confirmPassword) { setError('Les mots de passe ne correspondent pas'); return; }
    const res = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }) });
    if (res.ok) {
      setPwdDone(true);
      setCountdown(5);
      const interval = setInterval(()=>setCountdown(c=>c-1), 1000);
      setTimeout(async ()=>{ clearInterval(interval); window.location.replace('/login'); }, 5000);
    } else {
      const data = await res.json().catch(()=>({}));
      setError(data?.error || 'Erreur lors du changement de mot de passe');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-lg">
        <h1 className="text-2xl font-bold text-blue-300 mb-4">Sécurité du compte</h1>
        <h2 className="text-lg text-gray-200 mb-4">Activer l’authentification à deux facteurs (2FA)</h2>
        <div className="mb-6">
          {!qr ? (
            <button onClick={requestOtp} className="mb-3 py-2 px-4 rounded bg-indigo-600 hover:bg-indigo-500 text-white">Générer le QR</button>
          ) : (
            <div className="mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="QR 2FA" className="mx-auto w-48 h-48 border border-gray-700 rounded" />
            </div>
          )}
          <form onSubmit={enable} className="flex gap-2 items-center">
            <input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="Code à 6 chiffres" className="flex-1 p-2 border border-gray-700 bg-gray-900 text-white rounded" value={otp} onChange={e=>setOtp(e.target.value)} />
            <button type="submit" className="py-2 px-4 rounded bg-indigo-600 hover:bg-indigo-500 text-white">Activer</button>
          </form>
          {twoFAEnabled && <div className="text-green-400 mt-2">2FA activée</div>}
        </div>

        <h2 className="text-lg text-gray-200 mb-4">Changer le mot de passe</h2>
        <form onSubmit={changePassword}>
          <input type="password" placeholder="Mot de passe actuel" className="w-full mb-3 p-2 border border-gray-700 bg-gray-900 text-white rounded" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} required />
          <input type="password" placeholder="Nouveau mot de passe" className="w-full mb-3 p-2 border border-gray-700 bg-gray-900 text-white rounded" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required />
          <input type="password" placeholder="Confirmer le nouveau mot de passe" className="w-full mb-3 p-2 border border-gray-700 bg-gray-900 text-white rounded" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} required />
          <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 transform hover:scale-105">Mettre à jour</button>
        </form>
        {pwdDone && <div className="text-green-400 mt-3">Mot de passe mis à jour. Déconnexion dans {countdown}s...</div>}
        {error && <div className="text-red-400 mt-3">{error}</div>}
      </div>
    </div>
  );
}


