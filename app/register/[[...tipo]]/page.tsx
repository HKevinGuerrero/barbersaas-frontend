"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation"; 
import { ChevronLeft, User, Store, ArrowRight, Mail, Lock, Scissors, EyeOff, Eye } from "lucide-react";
import gsap from "gsap";
import { api } from "@/lib/api";
import { toast } from "sonner";

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

  // --- LÓGICA DE REGISTRO ---
// --- LÓGICA DE REGISTRO ---
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true); // 👈 Prendemos la carga

    const formData = new FormData(e.currentTarget);
    
    // Construimos el objeto para el DTO de C#
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
      
      // 👇 Agregamos usuarioId por si el backend lo devuelve al registrar
      const { token, nombre, rol, usuarioId } = response.data;

      // 👇 Guardamos la sesión EXACTAMENTE igual que en el Login
      localStorage.setItem("token", token);
      localStorage.setItem("user_name", nombre);
      localStorage.setItem("role", rol.toLowerCase()); // 👈 ¡Aquí estaba el detalle!
      
      if (usuarioId) {
        localStorage.setItem("user_id", usuarioId); // Lo guardamos si el back lo manda
      }

      toast.success(`¡Cuenta creada! Bienvenido, ${nombre}`);

      // Redirección dinámica según el rol
      const userRole = rol.toLowerCase();
      if (userRole === "dueno") router.push("/dashboard/dueno/sucursales");
      else if (userRole === "barbero") router.push("/dashboard/barbero");
      else router.push("/dashboard/cliente");

    } catch (error: any) {
      console.error("Error:", error);
      
      // EXTRAER EL MENSAJE CORRECTAMENTE
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
      
      // 👇 AQUÍ ESTÁ LA MAGIA: Apagamos la carga si el registro falla
      setIsLoading(false);
    }
  };

  const handleVolver = () => {
    if (step === 2) router.push("/register"); 
    else router.push("/login"); 
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-y-auto bg-zinc-950">
      
      {/* Fondo e imagen (Igual que tu código) */}
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
          /* Selección de Rol (Igual que tu código) */
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

            {/* BOTÓN GOOGLE (Pendiente implementación) */}
            <button type="button" className="w-full bg-white hover:bg-stone-200 text-zinc-950 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-3 text-sm">
               {/* SVG Google */}
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