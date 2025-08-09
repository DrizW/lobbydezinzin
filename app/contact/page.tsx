"use client";
import { useState } from "react";
import ClientOnly from "../components/ClientOnly";
import {useTranslations} from 'next-intl';

export default function ContactPage() {
  const t = useTranslations();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "", priority: "normal" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (response.ok) { setSubmitStatus("success"); setFormData({ name: "", email: "", subject: "", message: "", priority: "normal" }); }
      else { setSubmitStatus("error"); }
    } catch (error) { console.error("Erreur envoi contact:", error); setSubmitStatus("error"); }
    finally { setIsSubmitting(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-gray-700/50">
          <div className="max-w-4xl mx-auto px-6 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6"><span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">{t('contact.header.title1')}</span><span className="text-white">{t('contact.header.title2')}</span></h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">{t('contact.header.subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">{t('contact.form.title')}</h2>
              {submitStatus === "success" ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{t('contact.form.success')}</h3>
                  <p className="text-gray-300">{t('contact.form.successNote')}</p>
                  <button onClick={() => setSubmitStatus("idle")} className="mt-4 text-blue-400 hover:text-blue-300 transition-colors">{t('contact.form.new')}</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t('contact.form.name')}</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Votre nom" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t('contact.form.email')}</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="votre@email.com" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t('contact.form.subject')}</label>
                      <input type="text" name="subject" value={formData.subject} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Problème de connexion, question..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t('contact.form.priority')}</label>
                      <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                        <option value="low">Faible</option>
                        <option value="normal">Normale</option>
                        <option value="high">Élevée</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('contact.form.message')}</label>
                    <textarea name="message" value={formData.message} onChange={handleChange} required rows={6} className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none" placeholder="Décrivez votre problème ou votre question en détail..."></textarea>
                  </div>

                  <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 px-8 py-4 rounded-xl text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed">
                    {isSubmitting ? (<div className="flex items-center justify-center space-x-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>{t('contact.form.sending')}</span></div>) : (t('contact.form.submit'))}
                  </button>
                </form>
              )}
            </div>

            <div className="space-y-8">
              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6">{t('contact.support.title')}</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"><svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                    <div><h4 className="font-semibold text-white">{t('contact.quick.problem')}</h4><p className="text-gray-300 text-sm">{t('contact.quick.faq')} <a href="/countries" className="text-orange-400 hover:text-orange-300">{t('contact.link.faq')}</a></p></div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"><svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                    <div><h4 className="font-semibold text-white">{t('contact.quick.response')}</h4><p className="text-gray-300 text-sm">{t('contact.quick.responseDetail')}</p></div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"><svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                    <div><h4 className="font-semibold text-white">{t('contact.quick.always')}</h4><p className="text-gray-300 text-sm">{t('contact.quick.alwaysDetail')}</p></div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 p-8">
                <h3 className="text-xl font-bold text-white mb-6">{t('contact.links.title')}</h3>
                <div className="space-y-3">
                  <a href="/countries" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/30 transition-colors group"><svg className="w-5 h-5 text-blue-400 group-hover:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span className="text-gray-300 group-hover:text-white">{t('contact.link.faq')}</span></a>
                  <a href="/dashboard" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/30 transition-colors group"><svg className="w-5 h-5 text-green-400 group-hover:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg><span className="text-gray-300 group-hover:text-white">{t('contact.link.dashboard')}</span></a>
                  <a href="/subscription" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/30 transition-colors group"><svg className="w-5 h-5 text-purple-400 group-hover:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg><span className="text-gray-300 group-hover:text-white">{t('contact.link.premium')}</span></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
