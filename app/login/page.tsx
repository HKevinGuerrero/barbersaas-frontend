"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import gsap from "gsap";
import { api } from "@/lib/api"; // Tu cliente de axios
import { toast } from "sonner"; // Para notificaciones visuales
import { useRouter } from "next/navigation"; // Para redireccionar

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para los campos
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".login-card", 
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power4.out", delay: 0.2 }
      );
      gsap.fromTo(".bg-overlay", 
        { opacity: 0 },
        { opacity: 1, duration: 1.5, ease: "none" }
      );
    });
    return () => ctx.revert();
  }, []);

// --- FUNCIÓN DE LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); 

    try {
      const response = await api.post("/Auth/login", {
        email: email,
        password: password
      });

      const { token, nombre, rol, usuarioId } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user_name", nombre);
      localStorage.setItem("role", rol.toLowerCase());
      localStorage.setItem("user_id", usuarioId);

      toast.success(`¡Bienvenido de nuevo, ${nombre}!`);

      // --- REDIRECCIÓN DINÁMICA ---
      const userRole = rol.toLowerCase(); 

      if (userRole === "dueno") {
        router.push("/dashboard/dueno/sucursales");
      } else if (userRole === "barbero") {
        router.push("/dashboard/barbero");
      } else if (userRole === "cliente") {
        router.push("/dashboard/cliente");
      } else {
        router.push("/"); 
      }
      
    } catch (error: any) {
      console.error("Error:", error);
      
      const errorData = error.response?.data;
      let message = "Ocurrió un error inesperado";

      if (typeof errorData === 'string') {
        message = errorData;
      } else if (errorData?.errors) {
        message = Object.values(errorData.errors).flat().join(", ");
      } else if (errorData?.title) {
        message = errorData.title;
      }

      toast.error(message); 
      
      // 👇 AQUÍ ESTÁ LA MAGIA: Apagamos la carga si hay error para que puedan volver a intentar
      setIsLoading(false); 
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* 1. Imagen de Fondo Dinámica */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/barbershop-interior-1.jpg"
          alt="Barbershop background"
          fill
          className="object-cover brightness-[0.2]"
          priority
        />
        <div className="bg-overlay absolute inset-0 bg-gradient-to-b from-zinc-950/50 via-zinc-950/80 to-zinc-950" />
      </div>

      <Link 
        href="/" 
        className="absolute top-8 left-8 text-stone-400 hover:text-amber-500 transition-all flex items-center gap-2 text-sm group z-20"
      >
        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Volver al inicio
      </Link>

      <div className="login-card w-full max-w-[440px] z-10 bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-10 rounded-2xl shadow-2xl shadow-black/50">
        
        <div className="text-center mb-10">
          <span className="text-amber-500 font-bold tracking-[0.2em] text-xs uppercase mb-3 block">
            Barber SaaS
          </span>
          <h1 className="font-serif text-3xl font-bold text-stone-100 tracking-tight mb-2">
            Bienvenido de nuevo
          </h1>
          <p className="text-stone-400 text-sm">
            Ingresa tus credenciales para acceder a tu panel.
          </p>
        </div>

        {/* FORMULARIO CONECTADO */}
        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.15em] ml-1">
              Correo Electrónico
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600 group-focus-within:text-amber-500 transition-colors" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@barbersaas.com"
                className="w-full bg-black/40 border border-white/10 rounded-lg py-4 pl-12 pr-4 text-stone-200 placeholder:text-stone-700 focus:outline-none focus:border-amber-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.15em]">
                Contraseña
              </label>
              <Link href="#" className="text-[10px] text-amber-500/60 hover:text-amber-500 uppercase tracking-tighter transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600 group-focus-within:text-amber-500 transition-colors" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/10 rounded-lg py-4 pl-12 pr-12 text-stone-200 placeholder:text-stone-700 focus:outline-none focus:border-amber-500/50 transition-all"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-600 hover:text-stone-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-600/90 hover:bg-amber-500 text-zinc-950 font-bold py-4 rounded-lg transition-all duration-300 shadow-lg shadow-amber-900/20 active:scale-[0.98] uppercase text-sm tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Verificando..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center">
          <p className="text-stone-500 text-sm">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-amber-500 font-bold hover:text-amber-400 transition-colors">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>

      <footer className="absolute bottom-8 w-full px-12 hidden md:flex justify-between items-center z-10 text-[10px] text-stone-600 uppercase tracking-[0.2em]">
        <div className="flex gap-8">
          <Link href="#" className="hover:text-stone-400 transition-colors">Términos</Link>
          <Link href="#" className="hover:text-stone-400 transition-colors">Privacidad</Link>
          <Link href="#" className="hover:text-stone-400 transition-colors">Contacto</Link>
        </div>
        <p>© 2026 BARBER SAAS. ARTESANÍA Y PRECISIÓN.</p>
      </footer>
    </main>
  );
}