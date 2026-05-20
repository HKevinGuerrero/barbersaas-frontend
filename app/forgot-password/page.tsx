"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Mail, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("/Auth/forgot-password", { email });
      setEnviado(true);
      toast.success("Si el correo existe, te hemos enviado un enlace de recuperación.");
    } catch (error: any) {
      toast.error(error.response?.data?.mensaje || "Hubo un error al procesar tu solicitud.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image src="/images/barbershop-interior-1.jpg" alt="Background" fill className="object-cover brightness-[0.2]" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/50 via-zinc-950/80 to-zinc-950" />
      </div>

      <Link href="/login" className="absolute top-8 left-8 text-stone-400 hover:text-amber-500 transition-all flex items-center gap-2 text-sm group z-20">
        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Volver al Login
      </Link>

      <div className="w-full max-w-[440px] z-10 bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-10 rounded-2xl shadow-2xl shadow-black/50">
        <div className="text-center mb-8">
          <span className="text-amber-500 font-bold tracking-[0.2em] text-xs uppercase mb-3 block">Recuperación</span>
          <h1 className="font-serif text-3xl font-bold text-stone-100 tracking-tight mb-2">Restablecer Clave</h1>
          <p className="text-stone-400 text-sm">Ingresa tu correo y te enviaremos instrucciones.</p>
        </div>

        {enviado ? (
          <div className="text-center bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
            <Mail size={32} className="text-emerald-500 mx-auto mb-4" />
            <h3 className="text-stone-200 font-bold mb-2">¡Revisa tu bandeja!</h3>
            <p className="text-stone-400 text-sm">Te hemos enviado un enlace mágico para crear tu nueva contraseña. Recuerda revisar la carpeta de Spam.</p>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.15em] ml-1">Correo Electrónico</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600 group-focus-within:text-amber-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@barbersaas.com"
                  className="w-full bg-black/40 border border-white/10 rounded-lg py-4 pl-12 pr-4 text-stone-200 focus:outline-none focus:border-amber-500/50 transition-all"
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-amber-600/90 hover:bg-amber-500 text-zinc-950 font-bold py-4 rounded-lg flex justify-center items-center gap-2 uppercase text-sm tracking-widest disabled:opacity-50 transition-all">
              {isLoading ? "Procesando..." : "Enviar Enlace"} {!isLoading && <ArrowRight size={16} />}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}