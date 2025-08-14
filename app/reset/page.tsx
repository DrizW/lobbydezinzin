"use client";
import { useEffect, useState } from "react";

export default function ResetPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  // Auto-lecture du token dans l'URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) setToken(t);
  }, []);

  const request = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    const res = await fetch("/api/auth/request-reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    if (res.ok) setSent(true); else setError("Erreur lors de l'envoi");
  };

  const reset = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    const res = await fetch("/api/auth/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
    if (res.ok) setDone(true); else setError("Lien invalide ou expiré");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-blue-300">Réinitialiser le mot de passe</h1>

        {!sent ? (
          <form onSubmit={request}>
            <input type="email" placeholder="Email" className="w-full mb-3 p-2 border border-gray-700 bg-gray-900 text-white rounded" value={email} onChange={e=>setEmail(e.target.value)} required />
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500 font-semibold">Envoyer le lien</button>
          </form>
        ) : done ? (
          <div className="text-green-400">Mot de passe changé. Vous pouvez vous connecter.</div>
        ) : (
          <form onSubmit={reset}>
            {!token && (
              <input type="text" placeholder="Token reçu par email" className="w-full mb-3 p-2 border border-gray-700 bg-gray-900 text-white rounded" value={token} onChange={e=>setToken(e.target.value)} required />
            )}
            <input type="password" placeholder="Nouveau mot de passe" className="w-full mb-3 p-2 border border-gray-700 bg-gray-900 text-white rounded" value={password} onChange={e=>setPassword(e.target.value)} required />
            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-500 font-semibold">Réinitialiser</button>
          </form>
        )}

        {error && <div className="text-red-400 mt-3">{error}</div>}
      </div>
    </div>
  );
}


