export default function CGUPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-3xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-8">
        <h1 className="text-3xl font-bold text-white mb-4">Conditions Générales d'Utilisation</h1>
        <p className="text-gray-300 mb-2">Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}</p>
        <p className="text-gray-300">Ces conditions encadrent l'utilisation du site LobbyDeZinzin. Elles peuvent être adaptées selon ton besoin réel.</p>
      </div>
    </div>
  );
}


