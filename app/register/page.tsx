"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

function isStrongPassword(pw: string) {
  return pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw);
}

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string | undefined;
  const router = useRouter();
  // branche le listener Turnstile si présent
  useRegisterTurnstile(setCaptchaToken);

  const strong = isStrongPassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!strong) {
      setError("Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.");
      return;
    }
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, captchaToken: captchaToken || undefined }),
    });
    if (res.ok) {
      // Connexion immédiate après création du compte
      const login = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (login?.ok && !login.error) {
        router.replace("/dashboard");
        return;
      }

      // Fallback: si la connexion échoue, aller sur la page de login
      router.replace("/login");
    } else {
      try {
        const data = await res.json();
        setError(data?.error || "Erreur lors de l'inscription");
      } catch {
        setError("Erreur lors de l'inscription");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700/50 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6">
          <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Créer un compte</span>
        </h1>
        {error && <div className="text-red-400 mb-2">{error}</div>}
        {success && <div className="text-green-400 mb-2">Compte créé ! Redirection...</div>}
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
          className="w-full mb-2 p-2 border border-gray-700 bg-gray-900 text-white rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {siteKey && (
          <div className="mb-3">
            <div
              className="cf-turnstile"
              data-sitekey={siteKey}
              data-callback="onTurnstileVerifyRegister"
            />
          </div>
        )}
        {!strong && password.length > 0 && (
          <div className="text-yellow-400 text-sm mb-2">
            Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.
          </div>
        )}
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold shadow-lg hover:shadow-orange-500/25 transition-all duration-200 transform hover:scale-105 mb-2 disabled:opacity-50"
          disabled={!strong}
        >
          S'inscrire
        </button>
        <div className="mt-4 text-center">
          <Link href="/login" className="text-blue-400 hover:underline">Déjà un compte ? Se connecter</Link>
        </div>
      </form>
    </div>
  );
} 

// Injecte le script Turnstile et le callback global si un site key est présent
if (typeof window !== 'undefined') {
  const sk = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string | undefined;
  if (sk && !(window as any).__turnstileScriptLoaded) {
    (window as any).__turnstileScriptLoaded = true;
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    s.async = true; s.defer = true;
    document.head.appendChild(s);
  }
  (window as any).onTurnstileVerifyRegister = (token: string) => {
    try {
      const ev = new CustomEvent('turnstile-register-token', { detail: token });
      window.dispatchEvent(ev);
    } catch {}
  };
}

// Abonne la page pour récupérer le token et l’enregistrer en state
export function useRegisterTurnstile(setter: (t: string) => void) {
  useEffect(() => {
    const handler = (e: any) => setter(e.detail as string);
    window.addEventListener('turnstile-register-token', handler);
    return () => window.removeEventListener('turnstile-register-token', handler);
  }, [setter]);
}