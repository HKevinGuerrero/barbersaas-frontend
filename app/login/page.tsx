"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import gsap from "gsap";
import { api } from "@/lib/api"; 
import { toast } from "sonner"; 
import { useRouter } from "next/navigation"; 
import { useGoogleLogin } from '@react-oauth/google'; // 👈 IMPORTAMOS GOOGLE

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

  // 🌐 --- FUNCIÓN DE LOGIN CON GOOGLE --- 🌐
  const loginConGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const res = await api.post("/Auth/google-login", {
          token: tokenResponse.access_token,
          rol: "Cliente" // Por defecto mandamos Cliente, el backend usa el real si ya existe
        });

        const { token, nombre, rol, usuarioId } = res.data;
        const userRole = rol.toLowerCase();

        // 👑 Si es un dueño que sigue pendiente, el backend manda error, pero por si acaso validamos aquí:
        if (userRole === "dueno" && !token) {
          toast.error("Tu cuenta está en revisión. Un administrador debe aprobarla antes de que puedas iniciar sesión.");
          setIsLoading(false);
          return;
        }

        localStorage.setItem("token", token);
        localStorage.setItem("user_name", nombre);
        localStorage.setItem("role", userRole);
        if (usuarioId) localStorage.setItem("user_id", usuarioId);

        toast.success(`¡Bienvenido de nuevo, ${nombre}!`);

        // REDIRECCIÓN DINÁMICA
        if (userRole === "superadmin") router.push("/dashboard/superadmin");
        else if (userRole === "dueno") router.push("/dashboard/dueno/sucursales");
        else if (userRole === "barbero") router.push("/dashboard/barbero");
        else router.push("/dashboard/cliente");

      } catch (error: any) {
        toast.error(error.response?.data?.mensaje || "Error al iniciar sesión con Google.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => toast.error("Se canceló el inicio de sesión con Google"),
  });

  // 📧 --- FUNCIÓN DE LOGIN TRADICIONAL --- 📧
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

      const userRole = rol.toLowerCase(); 

      if (userRole === "superadmin") router.push("/dashboard/superadmin");
      else if (userRole === "dueno") router.push("/dashboard/dueno/sucursales");
      else if (userRole === "barbero") router.push("/dashboard/barbero");
      else if (userRole === "cliente") router.push("/dashboard/cliente");
      else router.push("/"); 
      
    } catch (error: any) {
      console.error("Error:", error);
      
      const errorData = error.response?.data;
      let message = "Ocurrió un error inesperado, contraseña o usuario incorrecto";

      if (typeof errorData === 'string') {
        message = errorData;
      } else if (errorData?.mensaje) { 
        message = errorData.mensaje;
      } else if (errorData?.message || errorData?.Message) {
        message = errorData.message || errorData.Message;
      } else if (errorData?.errors) {
        message = Object.values(errorData.errors).flat().join(", ");
      } else if (errorData?.title) {
        message = errorData.title;
      }

      toast.error(message); 
      setIsLoading(false); 
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
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

        {/* 👇 BOTÓN GOOGLE CONECTADO 👇 */}
        <button 
          type="button" 
          onClick={() => loginConGoogle()}
          className="w-full bg-white hover:bg-stone-200 text-zinc-950 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-3 text-sm mb-6"
        >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar con Google
        </button>

        <div className="flex items-center gap-4 mb-6 opacity-50">
          <div className="h-px bg-stone-500 flex-1"></div>
          <span className="text-[10px] text-stone-200 uppercase tracking-widest">O con tu correo</span>
          <div className="h-px bg-stone-500 flex-1"></div>
        </div>

        {/* FORMULARIO TRADICIONAL */}
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
            <Link href="/forgot-password" className="text-[10px] text-amber-500/60 hover:text-amber-500 uppercase tracking-tighter transition-colors">
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