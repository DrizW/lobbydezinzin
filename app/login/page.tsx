"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    console.log("🔄 Tentative de connexion côté client...");
    
    const res = await signIn("credentials", {
      email,
      password,
      otp,
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
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-4 text-blue-300">Connexion</h1>
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
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Code 2FA (si activé)"
          className="w-full mb-4 p-2 border border-gray-700 bg-gray-900 text-white rounded"
          value={otp}
          onChange={e => setOtp(e.target.value)}
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500 font-semibold mb-2">
          Se connecter
        </button>
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