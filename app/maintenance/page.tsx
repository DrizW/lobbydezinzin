export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="text-center max-w-xl bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-10 shadow-2xl">
        <div className="inline-flex items-center gap-3 mb-4 px-4 py-2 rounded-full bg-orange-500/20 ring-1 ring-orange-400/40 text-orange-200">
          <span className="text-xl">🛠️</span>
          <span className="font-semibold">Maintenance en cours</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Nous revenons très vite</h1>
        <p className="text-gray-300">Le site est momentanément indisponible pour une mise à jour. Merci de revenir un peu plus tard.</p>
      </div>
    </div>
  );
}


