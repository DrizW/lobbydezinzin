"use client";
import { useEffect, useState } from "react";

export default function VerifyPage() {
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [message, setMessage] = useState("Vérification en cours...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Lien invalide");
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (res.ok) {
          setStatus("ok");
          setMessage("Email vérifié. Vous pouvez vous connecter.");
        } else {
          const data = await res.json().catch(() => ({}));
          setStatus("error");
          setMessage(data?.error || "Lien invalide ou expiré");
        }
      } catch {
        setStatus("error");
        setMessage("Erreur lors de la vérification");
      }
    })();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-blue-300">Vérification de l'email</h1>
        <div className={status === "ok" ? "text-green-400" : status === "error" ? "text-red-400" : "text-gray-200"}>
          {message}
        </div>
      </div>
    </div>
  );
}

