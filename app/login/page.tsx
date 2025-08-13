"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    console.log("🔄 Tentative de connexion côté client...");
    
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, // Ne pas rediriger automatiquement
    });
    
    console.log("📡 Réponse de signIn:", res);
    
    if (res?.error) {
      console.log("❌ Erreur de connexion:", res.error);
      setError("Email ou mot de passe incorrect");
    } else if (res?.ok) {
      console.log("✅ Connexion réussie, redirection vers /dashboard");
      // Redirection forcée vers le dashboard
      window.location.replace("/dashboard");
    } else {
      console.log("⚠️ Réponse inattendue:", res);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700/50 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6">
          <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Connexion</span>
        </h1>
        {error && <div className="text-red-400 mb-2">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-2 p-2 border border-gray-700 bg-gray-900 text-white rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          className="w-full mb-4 p-2 border border-gray-700 bg-gray-900 text-white rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold shadow-lg hover:shadow-orange-500/25 transition-all duration-200 transform hover:scale-105 mb-2">Se connecter</button>
        <div className="mt-4 text-center">
          <Link href="/register" className="text-blue-400 hover:underline">Créer un compte</Link>
          <div className="mt-2">
            <Link href="/reset" className="text-sm text-gray-300 hover:underline">Mot de passe oublié ?</Link>
          </div>
        </div>
      </form>
    </div>
  );
} 