"use client";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastType = "success" | "error" | "info";
type Toast = { id: number; type: ToastType; title: string; message?: string };

const ToastCtx = createContext<{ add: (t: Omit<Toast, "id">) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const add = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, ...t }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 5000);
  }, []);

  const value = useMemo(() => ({ add }), [add]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-3">
        {toasts.map((t) => (
          <div key={t.id} className={
            `flex items-start gap-3 rounded-xl px-4 py-3 shadow-2xl border backdrop-blur-md ` +
            (t.type === 'success' ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-emerald-400/30'
             : t.type === 'error' ? 'bg-gradient-to-br from-red-600 to-rose-700 text-white border-red-400/30'
             : 'bg-gradient-to-br from-gray-700 to-gray-800 text-white border-gray-400/30')
          }>
            <span className="text-xl">{t.type === 'success' ? '✅' : t.type === 'error' ? '⚠️' : 'ℹ️'}</span>
            <div>
              <div className="font-semibold">{t.title}</div>
              {t.message && <div className="text-sm opacity-90">{t.message}</div>}
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}


