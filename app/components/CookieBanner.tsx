"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { if (typeof window !== 'undefined' && !localStorage.getItem('ldz-cookie-consent')) setVisible(true); }, []);
  if (!visible) return null;
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 z-50">
      <div className="mx-auto max-w-3xl rounded-2xl p-4 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-gray-300 text-sm">
            Nous utilisons des cookies techniques pour la connexion et la sécurité. Voir notre <Link href="/legal/privacy" className="text-orange-400 hover:underline">politique de confidentialité</Link>.
          </div>
          <div className="flex gap-2">
            <button onClick={()=>{ localStorage.setItem('ldz-cookie-consent','essential'); setVisible(false); }} className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold">Accepter</button>
            <button onClick={()=>setVisible(false)} className="px-4 py-2 rounded-xl bg-gray-700 text-gray-200">Refuser</button>
          </div>
        </div>
      </div>
    </div>
  );
}


