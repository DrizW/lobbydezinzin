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
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [confirmPwd, setConfirmPwd] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/security/status');
        if (r.ok) {
          const d = await r.json();
          setTwoFAEnabled(!!d.twoFactorEnabled);
        }
      } catch {}
    })();
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
            <button onClick={requestOtp} className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 transform hover:scale-105 mb-3">Générer le QR</button>
          ) : (
            <div className="mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="QR 2FA" className="mx-auto w-48 h-48 border border-gray-700 rounded" />
            </div>
          )}
          <form onSubmit={enable} className="flex gap-2 items-center">
            <input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="Code à 6 chiffres" className="flex-1 p-2 border border-gray-700 bg-gray-900 text-white rounded" value={otp} onChange={e=>setOtp(e.target.value)} />
            <button type="submit" className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 transform hover:scale-105">Activer</button>
          </form>
          {twoFAEnabled && <div className="text-green-400 mt-2">2FA activée</div>}
        </div>

        {twoFAEnabled && (
          <div className="mb-6">
            <h3 className="text-md text-gray-200 mb-2">Codes de secours</h3>
            <button
              onClick={async ()=>{
                setError("");
                const r = await fetch('/api/security/generate-backup-codes', { method: 'POST' });
                if (r.ok) {
                  const data = await r.json();
                  const blob = new Blob([data.codes.join('\n')], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = 'codes-secours.txt'; a.click();
                  URL.revokeObjectURL(url);
                } else {
                  setError('Impossible de générer les codes');
                }
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold shadow-lg hover:shadow-orange-500/25 transition-all duration-200 transform hover:scale-105 mb-3"
            >Générer et télécharger</button>

            <button
              onClick={()=> setShowDisableConfirm(true)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-semibold shadow-lg hover:shadow-gray-500/25 transition-all duration-200 transform hover:scale-105"
            >Désactiver la 2FA</button>
          </div>
        )}

        {showDisableConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={()=>setShowDisableConfirm(false)} />
            <div className="relative bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4 animate-[fadeIn_.15s_ease-out]">
              <h4 className="text-xl font-semibold text-gray-100 mb-2">Êtes-vous sûr ?</h4>
              <p className="text-gray-300 mb-5">La désactivation du 2FA supprimera la protection TOTP et invalidera vos codes de secours.</p>
              <div className="flex gap-3">
                <button
                  onClick={async ()=>{
                    setError("");
                    const r = await fetch('/api/security/disable-2fa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: confirmPwd }) });
                    if (r.ok) {
                      setTwoFAEnabled(false);
                      setQr(""); setOtp(""); setConfirmPwd("");
                      setShowDisableConfirm(false);
                    } else {
                      const d = await r.json().catch(()=>({}));
                      setError(d?.error || 'Impossible de désactiver la 2FA');
                      setShowDisableConfirm(false);
                    }
                  }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold shadow-lg hover:shadow-rose-500/25 transition-all duration-200"
                >Oui, désactiver</button>
                <button
                  onClick={()=> setShowDisableConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-semibold shadow-lg hover:shadow-gray-500/25 transition-all duration-200"
                >Annuler</button>
              </div>
              <div className="mt-4">
                <input type="password" value={confirmPwd} onChange={e=>setConfirmPwd(e.target.value)} placeholder="Mot de passe actuel" className="w-full p-2 border border-gray-700 bg-gray-900 text-white rounded" />
              </div>
            </div>
          </div>
        )}

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


