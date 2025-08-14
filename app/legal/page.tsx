import Link from "next/link";

export default function LegalIndex() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-3xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Informations légales</h1>
        <ul className="space-y-3 text-orange-400">
          <li><Link href="/legal/cgu" className="hover:underline">Conditions Générales d'Utilisation</Link></li>
          <li><Link href="/legal/privacy" className="hover:underline">Politique de Confidentialité</Link></li>
        </ul>
      </div>
    </div>
  );
}


