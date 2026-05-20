"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation"; 
import { ChevronLeft, User, Store, ArrowRight, Mail, Lock, Scissors, EyeOff, Eye } from "lucide-react";
import gsap from "gsap";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useGoogleLogin } from '@react-oauth/google'; // 👈 IMPORTACIÓN DE GOOGLE

// IMPORTAMOS NUESTROS COMPONENTES MODULARES
import { FormCliente, FormBarbero, FormDueno } from "@/components/auth/register-forms";

export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();

  const urlRole = params.tipo?.[0] as "cliente" | "barbero" | "dueno" | undefined;
  const role = (urlRole && ["cliente", "barbero", "dueno"].includes(urlRole)) ? urlRole : null;
  const step = role ? 2 : 1; 

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".register-card", 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
    });
    return () => ctx.revert();
  }, [step]); 

  const roleTitles = {
    cliente: "Cliente",
    barbero: "Barbero",
    dueno: "Dueño de Barbería"
  };

  // 🌐 --- LÓGICA DE REGISTRO CON GOOGLE --- 🌐
  const loginConGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const res = await api.post("/Auth/google-login", {
          token: tokenResponse.access_token,
          rol: role === "dueno" ? "Dueno" : role === "barbero" ? "Barbero" : "Cliente"
        });

        const { token, nombre, rol, usuarioId } = res.data;
        const userRole = rol.toLowerCase();

        // Si es dueño y nace pendiente (el backend manda token vacío)
        if (userRole === "dueno" && !token) {
          toast.success("Cuenta creada con Google. Estamos verificando tus datos, te avisaremos pronto.");
          setTimeout(() => router.push("/login"), 3000);
          return;
        }

        localStorage.setItem("token", token);
        localStorage.setItem("user_name", nombre);
        localStorage.setItem("role", userRole);
        if (usuarioId) localStorage.setItem("user_id", usuarioId);

        toast.success(`¡Bienvenido, ${nombre}!`);
        
        if (userRole === "barbero") router.push("/dashboard/barbero");
        else router.push("/dashboard/cliente");

      } catch (error: any) {
        toast.error(error.response?.data?.mensaje || "Error al conectar con Google.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => toast.error("Se canceló el inicio de sesión con Google"),
  });

  // 📧 --- LÓGICA DE REGISTRO TRADICIONAL (CORREO) --- 📧
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    const payload = {
      nombre: formData.get("nombre"),
      email: formData.get("email"),
      password: formData.get("password"),
      rol: role === "dueno" ? "Dueno" : role === "barbero" ? "Barbero" : "Cliente",
      apellido: formData.get("apellido") || "",
      telefono: formData.get("telefono") || ""
    };

    try {
      const response = await api.post("/Auth/registrar", payload);
      const { token, nombre, rol, usuarioId } = response.data;

      const userRole = rol.toLowerCase();

      // 👑 LA REGLA DEL JEFE: Si es dueño, lo mandamos a "Esperar Aprobación"
      if (userRole === "dueno") {
        toast.success(`Cuenta creada. Estamos verificando tus datos, te avisaremos pronto.`);
        
        // No guardamos el token todavía, porque no puede hacer nada. Lo mandamos al login.
        setTimeout(() => {
          router.push("/login");
        }, 3000);
        return; 
      }

      // Si es Barbero o Cliente, entran como Pedro por su casa
      localStorage.setItem("token", token);
      localStorage.setItem("user_name", nombre);
      localStorage.setItem("role", userRole); 
      
      if (usuarioId) {
        localStorage.setItem("user_id", usuarioId); 
      }

      toast.success(`¡Cuenta creada! Bienvenido, ${nombre}`);

      if (userRole === "barbero") router.push("/dashboard/barbero");
      else router.push("/dashboard/cliente");

    } catch (error: any) {
      console.error("Error:", error);
      
      const errorData = error.response?.data;
      let message = "Ocurrió un error inesperado";

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

  const handleVolver = () => {
    if (step === 2) router.push("/register"); 
    else router.push("/login"); 
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-y-auto bg-zinc-950">
      
      <div className="absolute inset-0 z-0 pointer-events-none fixed">
        <Image
          src="/images/barbershop-interior-2.jpg" 
          alt="Barbería registro"
          fill
          className="object-cover brightness-[0.15]" 
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/80 to-zinc-950" />
      </div>

      <button 
        onClick={handleVolver}
        className="absolute top-4 left-4 md:top-8 md:left-8 text-stone-400 hover:text-amber-500 transition-all flex items-center gap-2 text-xs md:text-sm group z-20 bg-black/20 md:bg-transparent p-2 rounded-full md:p-0"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="hidden sm:inline">{step === 2 ? "Cambiar de perfil" : "Volver al login"}</span>
      </button>

      <div className={`register-card w-full z-10 bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-6 md:p-10 rounded-3xl shadow-2xl my-12 transition-all duration-500 ${step === 2 && role === 'dueno' ? 'max-w-[700px]' : 'max-w-[500px]'}`}>
        
        {step === 1 ? (
          <div className="space-y-6">
             <div className="text-center mb-8">
               <span className="text-amber-500 font-bold tracking-[0.2em] text-[10px] uppercase mb-3 block">Únete a BarberSaaS</span>
               <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-100 mb-2">¿Cómo usarás la plataforma?</h1>
             </div>
             <div className="grid gap-3">
               <button onClick={() => router.push("/register/cliente")} className="flex items-center gap-4 p-4 md:p-5 bg-black/40 border border-white/10 rounded-2xl hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group text-left">
                 <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-amber-500"><User className="text-stone-400 group-hover:text-zinc-950" size={24} /></div>
                 <div><h3 className="text-stone-100 font-bold">Soy Cliente</h3><p className="text-stone-500 text-xs">Agendar citas y descubrir barberías.</p></div>
               </button>
               <button onClick={() => router.push("/register/barbero")} className="flex items-center gap-4 p-4 md:p-5 bg-black/40 border border-white/10 rounded-2xl hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group text-left">
                 <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-amber-500"><Scissors className="text-stone-400 group-hover:text-zinc-950" size={24} /></div>
                 <div><h3 className="text-stone-100 font-bold">Soy Barbero</h3><p className="text-stone-500 text-xs">Gestionar mi agenda y perfil.</p></div>
               </button>
               <button onClick={() => router.push("/register/dueno")} className="flex items-center gap-4 p-4 md:p-5 bg-black/40 border border-white/10 rounded-2xl hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group text-left">
                 <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-amber-500"><Store className="text-stone-400 group-hover:text-zinc-950" size={24} /></div>
                 <div><h3 className="text-stone-100 font-bold">Soy Dueño</h3><p className="text-stone-500 text-xs">Administrar locales y personal.</p></div>
               </button>
             </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="font-serif text-2xl font-bold text-stone-100">Crea tu cuenta</h2>
              <p className="text-stone-500 text-xs md:text-sm mt-1">
                Perfil: <span className="text-amber-500 font-bold uppercase">{role && roleTitles[role]}</span>
              </p>
            </div>

            {/* 👇 BOTÓN GOOGLE CONECTADO 👇 */}
            <button 
              type="button" 
              onClick={() => loginConGoogle()}
              className="w-full bg-white hover:bg-stone-200 text-zinc-950 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-3 text-sm"
            >
               <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
               </svg>
               Registrarse con Google
            </button>

            <div className="flex items-center gap-4 my-4 opacity-50">
              <div className="h-px bg-stone-500 flex-1"></div>
              <span className="text-[10px] text-stone-200 uppercase tracking-widest">O con tu correo</span>
              <div className="h-px bg-stone-500 flex-1"></div>
            </div>

            {/* FORMULARIO ÚNICO CONECTADO */}
            <form className="space-y-4" onSubmit={handleRegister}>
              
              {role === "cliente" && <FormCliente />}
              {role === "barbero" && <FormBarbero />}
              {role === "dueno" && <FormDueno />}

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={16} />
                    <input name="email" type="email" required placeholder="ejemplo@correo.com" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={16} />
                    <input 
                      name="password"
                      type={showPassword ? "text" : "password"} 
                      required
                      placeholder="••••••••" 
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-stone-200 text-sm focus:border-amber-500/50 outline-none" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold py-4 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 group mt-6 shadow-lg shadow-amber-900/20 uppercase text-xs tracking-widest disabled:opacity-50"
              >
                {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-stone-500 text-xs">
            ¿Ya tienes una cuenta? <Link href="/login" className="text-amber-500 font-bold hover:text-amber-400 transition-colors">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </main>
  );
}