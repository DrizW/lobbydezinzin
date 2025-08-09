"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {useTranslations} from 'next-intl';

function isStrongPassword(pw: string) {
  return pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw);
}

export default function RegisterPage() {
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const strong = isStrongPassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!strong) { setError(t('register.passwordRule')); return; }
    const res = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    if (res.ok) { setSuccess(true); setTimeout(() => router.push("/login"), 1500); }
    else { const data = await res.json(); setError(data.error || t('register.error')); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-4 text-blue-300">{t('register.title')}</h1>
        {error && <div className="text-red-400 mb-2">{error}</div>}
        {success && <div className="text-green-400 mb-2">{t('register.success')}</div>}
        <input type="email" placeholder={t('login.email')} className="w-full mb-2 p-2 border border-gray-700 bg-gray-900 text-white rounded" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder={t('login.password')} className="w-full mb-2 p-2 border border-gray-700 bg-gray-900 text-white rounded" value={password} onChange={e => setPassword(e.target.value)} required />
        {!strong && password.length > 0 && (<div className="text-yellow-400 text-sm mb-2">{t('register.passwordRule')}</div>)}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500 font-semibold mb-2 disabled:opacity-50" disabled={!strong}>{t('register.submit')}</button>
        <div className="mt-4 text-center"><Link href="/login" className="text-blue-400 hover:underline">{t('register.loginLink')}</Link></div>
      </form>
    </div>
  );
} 