"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function ContactRequestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/login");
      return;
    }

    fetchContactRequests();
  }, [session, status, router]);

  const fetchContactRequests = async () => {
    try {
      const response = await fetch("/api/admin/contact-requests");
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des demandes:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/contact-requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await fetchContactRequests();
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "text-red-500 bg-red-500/10 border-red-500/30";
      case "high": return "text-orange-500 bg-orange-500/10 border-orange-500/30";
      case "normal": return "text-blue-500 bg-blue-500/10 border-blue-500/30";
      case "low": return "text-gray-500 bg-gray-500/10 border-gray-500/30";
      default: return "text-gray-500 bg-gray-500/10 border-gray-500/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30";
      case "in_progress": return "text-blue-500 bg-blue-500/10 border-blue-500/30";
      case "resolved": return "text-green-500 bg-green-500/10 border-green-500/30";
      case "closed": return "text-gray-500 bg-gray-500/10 border-gray-500/30";
      default: return "text-gray-500 bg-gray-500/10 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">
          Demandes de Contact ({requests.length})
        </h1>

        <div className="grid gap-6">
          {requests.length === 0 ? (
            <div className="bg-gray-800/50 rounded-xl p-8 text-center">
              <p className="text-gray-400">Aucune demande de contact pour le moment</p>
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 p-6 hover:border-orange-500/30 transition-all cursor-pointer"
                onClick={() => setSelectedRequest(request)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold text-white">{request.subject}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(request.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{request.name}</p>
                    <p className="text-gray-400 text-sm">{request.email}</p>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">
                    Voir détails →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Détails */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Demande de Contact</h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nom</label>
                  <p className="text-white">{selectedRequest.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <p className="text-white">{selectedRequest.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Sujet</label>
                  <p className="text-white">{selectedRequest.subject}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-white whitespace-pre-wrap">{selectedRequest.message}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Priorité</label>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(selectedRequest.priority)}`}>
                      {selectedRequest.priority}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Statut</label>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Changer le statut</label>
                  <div className="flex flex-wrap gap-2">
                    {["pending", "in_progress", "resolved", "closed"].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateRequestStatus(selectedRequest.id, status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedRequest.status === status
                            ? "bg-blue-500 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
