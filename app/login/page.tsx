"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {useTranslations} from 'next-intl';

export default function LoginPage() {
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) setError(t('login.error'));
    else if (res?.ok) window.location.replace("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-4 text-blue-300">{t('login.title')}</h1>
        {error && <div className="text-red-400 mb-2">{error}</div>}
        <input type="email" placeholder={t('login.email')} className="w-full mb-2 p-2 border border-gray-700 bg-gray-900 text-white rounded" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder={t('login.password')} className="w-full mb-4 p-2 border border-gray-700 bg-gray-900 text-white rounded" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500 font-semibold mb-2">{t('login.submit')}</button>
        <div className="mt-4 text-center">
          <Link href="/register" className="text-blue-400 hover:underline">{t('login.registerLink')}</Link>
        </div>
      </form>
    </div>
  );
} 