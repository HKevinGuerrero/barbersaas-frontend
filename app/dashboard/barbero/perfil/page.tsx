"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { 
  User, Lock, Save, Camera, Mail, Phone, Scissors,
  ImagePlus, Trash2, Images, Link as LinkIcon,
  Copy, Timer, Building2, RefreshCw
} from "lucide-react";
import gsap from "gsap";
import { toast } from "sonner";
import { api } from "@/lib/api";

// Mock Data para el portafolio (hasta implementar subida de imágenes en backend)
const portfolioPhotos = [
  { id: 1, style: "Mid Fade + Barba", image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&q=80" },
  { id: 2, style: "Corte Clásico", image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&q=80" },
  { id: 3, style: "Mullet Moderno", image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=500&q=80" },
];

export default function PerfilBarberoPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Estados del Perfil
  const [isLoadingDatos, setIsLoadingDatos] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [perfil, setPerfil] = useState({
    nombre: "",
    apellido: "", 
    correo: "",
    telefono: "+57 ", 
    especialidad: ""
  });

  // Estados de Contraseña
  const [passwords, setPasswords] = useState({
    actual: "",
    nueva: "",
    confirmar: ""
  });

  // Estados para Vinculación
  const [linkingCode, setLinkingCode] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const MAX_BARBERIAS = 1;
  const [barberiasActuales, setBarberiasActuales] = useState(0); // Ahora es un estado dinámico

  // Cargar perfil y conteo de vinculaciones al iniciar
  const fetchPerfil = useCallback(async () => {
    setIsLoadingDatos(true);
    try {
      // Hacemos las dos peticiones en paralelo para mayor velocidad
      const [resPerfil, resConteo] = await Promise.all([
        api.get('/Auth/perfil'),
        api.get('/Staff/mis-vinculaciones/conteo') // Llamamos al nuevo endpoint de C#
      ]);
      
      setPerfil(prev => ({
        ...prev,
        nombre: resPerfil.data.nombre,
        apellido: resPerfil.data.apellido || "",
        correo: resPerfil.data.correo
      }));

      // Actualizamos el contador real con la respuesta del backend
      setBarberiasActuales(resConteo.data.total);

    } catch (error) {
      console.error("Error cargando perfil:", error);
      toast.error("No pudimos cargar tus datos.");
    } finally {
      setIsLoadingDatos(false);
    }
  }, []);

  useEffect(() => {
    fetchPerfil();
  }, [fetchPerfil]);

  // Lógica del Temporizador
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && linkingCode) {
      setLinkingCode(null);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, linkingCode]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- GENERACIÓN DE CÓDIGO REAL ---
  const handleGenerateCode = async () => {
    if (barberiasActuales >= MAX_BARBERIAS) {
      toast.error("Límite alcanzado", { description: "Ya estás vinculado a una barbería." });
      return;
    }
    
    try {
      // Llamamos al C# para que genere y guarde el código
      const res = await api.post('/Staff/generar-codigo');
      
      // El backend nos responde con el código real de la base de datos
      setLinkingCode(res.data.codigo);
      setTimeLeft(res.data.tiempoRestante);
      
      toast.success("Código generado", { description: "Entrégale este código al dueño de la sucursal." });
    } catch (error: any) {
      console.error("Error al generar código", error);
      toast.error("Error", { description: error.response?.data?.mensaje || "No se pudo generar el código de vinculación." });
    }
  };

  const handleCopyCode = () => {
    if (linkingCode) {
      navigator.clipboard.writeText(linkingCode);
      toast.info("Código copiado al portapapeles");
    }
  };

  // --- LÓGICA DE GUARDADO AL BACKEND ---
  const handleGuardarCambios = async () => {
    setIsSaving(true);
    try {
      const nombreCompleto = `${perfil.nombre} ${perfil.apellido}`.trim();
      
      await api.put('/Auth/perfil', {
        nombre: nombreCompleto,
      });

      localStorage.setItem("user_name", nombreCompleto);
      toast.success("Perfil actualizado correctamente");
      
    } catch (error: any) {
      toast.error("Error al guardar", { description: error.response?.data?.mensaje || "Inténtalo de nuevo." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleActualizarContrasena = async () => {
    if (!passwords.nueva || passwords.nueva !== passwords.confirmar) {
      toast.error("Error", { description: "Las contraseñas nuevas no coinciden o están vacías." });
      return;
    }

    setIsSaving(true);
    try {
      await api.put('/Auth/perfil', {
        nuevaPassword: passwords.nueva
      });

      toast.success("Contraseña actualizada", { description: "Tu seguridad ha sido reforzada." });
      setPasswords({ actual: "", nueva: "", confirmar: "" }); 
    } catch (error: any) {
      toast.error("Error", { description: "No pudimos actualizar la contraseña." });
    } finally {
      setIsSaving(false);
    }
  };

  // Animaciones iniciales
  useEffect(() => {
    if (!isLoadingDatos) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".profile-section", 
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.15, duration: 0.7, ease: "power3.out" }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLoadingDatos]);

  return (
    <div ref={containerRef} className="space-y-6 md:space-y-8 relative pb-20 max-w-4xl mx-auto">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[300px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 profile-section">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-100 tracking-tight">
            Mi <span className="text-amber-500">Perfil</span>
          </h1>
          <p className="text-stone-500 mt-1 text-xs md:text-sm">
            Actualiza tus datos, foto de perfil y gestiona tus sucursales.
          </p>
        </div>
        
        <button 
          onClick={handleGuardarCambios}
          disabled={isSaving || isLoadingDatos}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-zinc-950 font-bold px-6 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-amber-500/10 w-full sm:w-auto active:scale-95"
        >
          {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
          Guardar Cambios
        </button>
      </div>

      {isLoadingDatos ? (
        <div className="flex justify-center py-20 relative z-10">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6 relative z-10">
          
          {/* SECCIÓN 1: Foto y Datos Básicos */}
          <div className="profile-section bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start shadow-lg">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center space-y-4 mx-auto md:mx-0 shrink-0">
              <div className="relative group cursor-pointer" onClick={() => toast.info("Función de fotos en desarrollo.")}>
                <div className="w-32 h-32 rounded-full bg-zinc-800 border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-stone-500 group-hover:border-amber-500 group-hover:text-amber-500 transition-colors overflow-hidden">
                  <User size={32} className="mb-2 opacity-50" />
                  <span className="text-xs font-bold uppercase tracking-wider">Subir Foto</span>
                </div>
                <div className="absolute bottom-0 right-0 p-2.5 bg-amber-500 text-zinc-950 rounded-full shadow-lg border-4 border-zinc-900 transition-transform group-hover:scale-110">
                  <Camera size={16} />
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div className="flex-1 w-full space-y-5">
              <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-4">
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                  <Scissors size={18} />
                </div>
                <h2 className="text-lg font-bold text-stone-200">Información Pública</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Nombres</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                    <input 
                      type="text" 
                      value={perfil.nombre} 
                      onChange={(e) => setPerfil({...perfil, nombre: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Apellidos</label>
                  <input 
                    type="text" 
                    value={perfil.apellido} 
                    onChange={(e) => setPerfil({...perfil, apellido: e.target.value})}
                    placeholder="Tus apellidos" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Teléfono Personal</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                    <input 
                      type="tel" 
                      value={perfil.telefono} 
                      onChange={(e) => setPerfil({...perfil, telefono: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                    <input 
                      type="email" 
                      value={perfil.correo} 
                      disabled 
                      className="w-full bg-zinc-950/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-stone-500 text-sm cursor-not-allowed" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: VINCULACIÓN CON BARBERÍAS */}
          <div className="profile-section bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-8 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-lg">
                  <LinkIcon size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-200">Vinculación a Sucursales</h2>
                  <p className="text-xs text-stone-500 mt-1">Genera un código para unirte al equipo de una barbería.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-zinc-950/50 border border-white/5 px-4 py-2 rounded-xl">
                <Building2 size={16} className={barberiasActuales >= MAX_BARBERIAS ? "text-red-500" : "text-amber-500"} />
                <span className="text-sm font-bold text-stone-300">
                  Límites: <span className={barberiasActuales >= MAX_BARBERIAS ? "text-red-500" : "text-amber-500"}>{barberiasActuales} / {MAX_BARBERIAS}</span>
                </span>
              </div>
            </div>

            <div className="bg-black/20 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              {barberiasActuales >= MAX_BARBERIAS ? (
                <div className="space-y-2">
                  <p className="text-red-400 font-bold">Has alcanzado el límite de barberías.</p>
                  <p className="text-stone-500 text-sm">Debes desvincularte de una sucursal para generar un nuevo código.</p>
                </div>
              ) : linkingCode ? (
                <div className="space-y-4 w-full max-w-sm">
                  <p className="text-stone-400 text-sm">Entrégale este código al dueño de la barbería:</p>
                  <div className="flex items-center justify-between bg-zinc-950 border border-amber-500/30 rounded-xl p-4">
                    <span className="text-2xl font-mono font-bold text-amber-500 tracking-widest">{linkingCode}</span>
                    <button onClick={handleCopyCode} className="text-stone-400 hover:text-amber-500 transition-colors p-2 bg-zinc-900 rounded-lg">
                      <Copy size={20} />
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-amber-500/80 text-sm font-medium animate-pulse">
                    <Timer size={16} />
                    <span>Expira en: {formatTime(timeLeft)}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-stone-400 text-sm max-w-md mx-auto">
                    Al generar un código, el dueño tendrá 15 minutos para ingresarlo en su panel y agregarte a su staff.
                  </p>
                  <button 
                    onClick={handleGenerateCode}
                    className="bg-zinc-800 hover:bg-amber-500/20 hover:border-amber-500/50 hover:text-amber-500 border border-white/10 text-stone-200 font-bold px-6 py-3 rounded-xl transition-all shadow-lg text-sm"
                  >
                    Generar Código de Vinculación
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN 3: Seguridad y Contraseña */}
          <div className="profile-section bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-red-500/10 text-red-500 rounded-lg">
                <Lock size={20} />
              </div>
              <h2 className="text-xl font-bold text-stone-200">Seguridad de la Cuenta</h2>
            </div>

            <div className="max-w-xl space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Contraseña Actual (Opcional por ahora)</label>
                <input 
                  type="password" 
                  value={passwords.actual}
                  onChange={(e) => setPasswords({...passwords, actual: e.target.value})}
                  placeholder="Ingresa tu contraseña actual" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none transition-all" 
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Nueva Contraseña</label>
                  <input 
                    type="password" 
                    value={passwords.nueva}
                    onChange={(e) => setPasswords({...passwords, nueva: e.target.value})}
                    placeholder="Nueva contraseña" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Confirmar Contraseña</label>
                  <input 
                    type="password" 
                    value={passwords.confirmar}
                    onChange={(e) => setPasswords({...passwords, confirmar: e.target.value})}
                    placeholder="Repite la contraseña" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleActualizarContrasena}
                  disabled={!passwords.nueva || isSaving}
                  className="bg-zinc-800 disabled:opacity-50 hover:bg-zinc-700 text-stone-200 px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                >
                  {isSaving && <RefreshCw size={14} className="animate-spin" />}
                  Actualizar Contraseña
                </button>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}