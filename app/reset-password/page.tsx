"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, ChevronLeft } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Extraemos los datos que mandó el correo en la URL
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/Auth/reset-password", {
        email: email,
        token: token,
        nuevaPassword: password
      });

      toast.success("¡Tu contraseña ha sido actualizada!");
      setTimeout(() => router.push("/login"), 2000);
      
    } catch (error: any) {
      toast.error(error.response?.data?.mensaje || "El enlace es inválido o ha expirado.");
    } finally {
      setIsLoading(false);
    }
  };

  // Si alguien entra a esta página sin el token del correo, lo bloqueamos
  if (!token || !email) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-stone-200">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-500">Enlace Inválido</h1>
          <p>Faltan parámetros de seguridad en la URL.</p>
          <Link href="/login" className="text-amber-500 hover:underline">Ir al Login</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image src="/images/barbershop-interior-2.jpg" alt="Background" fill className="object-cover brightness-[0.2]" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/50 via-zinc-950/80 to-zinc-950" />
      </div>

      <div className="w-full max-w-[440px] z-10 bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-10 rounded-2xl shadow-2xl shadow-black/50">
        <div className="text-center mb-8">
          <span className="text-amber-500 font-bold tracking-[0.2em] text-xs uppercase mb-3 block">Seguridad</span>
          <h1 className="font-serif text-3xl font-bold text-stone-100 tracking-tight mb-2">Nueva Contraseña</h1>
          <p className="text-stone-400 text-sm">Crea una contraseña segura para tu cuenta.</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.15em] ml-1">Nueva Contraseña</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600 group-focus-within:text-amber-500 transition-colors" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/10 rounded-lg py-4 pl-12 pr-12 text-stone-200 focus:outline-none focus:border-amber-500/50 transition-all"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-600 hover:text-stone-300 transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.15em] ml-1">Confirmar Contraseña</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600 group-focus-within:text-amber-500 transition-colors" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/10 rounded-lg py-4 pl-12 pr-4 text-stone-200 focus:outline-none focus:border-amber-500/50 transition-all"
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-amber-600/90 hover:bg-amber-500 text-zinc-950 font-bold py-4 rounded-lg uppercase text-sm tracking-widest disabled:opacity-50 transition-all">
            {isLoading ? "Actualizando..." : "Guardar Contraseña"}
          </button>
        </form>
      </div>
    </main>
  );
}