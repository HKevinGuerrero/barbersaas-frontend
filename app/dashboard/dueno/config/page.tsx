"use client";

import { useEffect, useRef, useState } from "react";
import { 
  User, 
  Lock, 
  Globe, 
  Bell, 
  CreditCard, 
  Save,
  MapPin
} from "lucide-react";
import gsap from "gsap";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function ConfigDuenoPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Estados de datos
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  
  // Estados de preferencias (Mock visuales por ahora)
  const [zonaHoraria, setZonaHoraria] = useState("cartagena");
  const [moneda, setMoneda] = useState("cop");
  const [notifResumen, setNotifResumen] = useState(true);
  const [notifAlertas, setNotifAlertas] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);

  // Cargar datos reales del dueño
useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get('/Auth/perfil');
        
        // 1. Extraemos los valores
        const n = res.data.nombre;
        const a = res.data.apellido;

        // 2. Limpieza total: 
        // Si el valor es null, undefined, o el STRING "null", lo convertimos en vacío ""
        const nombreLimpio = (n && n !== "null") ? n : "";
        const apellidoLimpio = (a && a !== "null") ? a : "";

        // 3. Concatenamos y aplicamos trim para quitar espacios sobrantes
        const nombreCompleto = `${nombreLimpio} ${apellidoLimpio}`.replace(/\s+/g, ' ').trim();
        
        setNombre(nombreCompleto);
        setCorreo(res.data.correo);
      } catch (error) {
        console.error("Error al cargar perfil", error);
        toast.error("Error al cargar los datos del perfil.");
      }
    };
    loadProfile();
  }, []);

  // Animaciones iniciales
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".config-section", 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.15, duration: 0.7, ease: "power3.out" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Guardar Cambios (Nombre y Contraseña)
  const handleGuardarCambios = async () => {
    setIsSaving(true);
    try {
      const payload: any = { nombre };
      
      // Solo enviamos la contraseña si el usuario escribió algo
      if (nuevaPassword.trim().length > 0) {
        if (nuevaPassword.length < 6) {
          toast.error("La contraseña debe tener al menos 6 caracteres.");
          setIsSaving(false);
          return;
        }
        payload.nuevaPassword = nuevaPassword;
      }

      await api.put('/Auth/perfil', payload);
      
      toast.success("Configuración guardada exitosamente.");
      setNuevaPassword(""); // Limpiamos el campo de contraseña
      
    } catch (error) {
      console.error("Error guardando configuración", error);
      toast.error("Hubo un problema al guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div ref={containerRef} className="space-y-6 md:space-y-8 relative pb-20 max-w-4xl mx-auto">
      
      {/* Resplandor de fondo sutil */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[300px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 config-section">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-100 tracking-tight">
            Configuración <span className="text-amber-500">General</span>
          </h1>
          <p className="text-stone-500 mt-1 text-xs md:text-sm">
            Gestiona tu cuenta de administrador, notificaciones y facturación.
          </p>
        </div>
        
        <button 
          onClick={handleGuardarCambios}
          disabled={isSaving}
          className="bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-600 text-zinc-950 font-bold px-6 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-amber-500/10 w-full sm:w-auto"
        >
          {isSaving ? <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div> : <Save size={18} />}
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>

      <div className="space-y-6 relative z-10">
        
        {/* SECCIÓN 1: Perfil Personal (Admin) */}
        <div className="config-section bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-lg">
              <User size={20} />
            </div>
            <h2 className="text-xl font-bold text-stone-200">Datos del Administrador</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Nombre Completo</label>
              <input 
                type="text" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Cargando..."
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Correo de Acceso</label>
              <input 
                type="email" 
                value={correo}
                disabled 
                placeholder="Cargando..."
                className="w-full bg-zinc-950/50 border border-white/5 rounded-xl py-3 px-4 text-stone-500 text-sm cursor-not-allowed" 
              />
            </div>
            <div className="space-y-2 md:col-span-2 pt-2 border-t border-white/5 mt-2">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Lock size={12} /> Cambiar Contraseña (Opcional)
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="password" 
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  placeholder="Escribe aquí tu nueva contraseña" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none transition-all" 
                />
                <button 
                  onClick={handleGuardarCambios}
                  disabled={nuevaPassword.length === 0 || isSaving}
                  className="bg-zinc-800 disabled:opacity-50 hover:bg-zinc-700 text-stone-200 px-6 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap"
                >
                  Actualizar Contraseña
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: Preferencias del Sistema (Globales) */}
        <div className="config-section bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-lg">
              <Globe size={20} />
            </div>
            <h2 className="text-xl font-bold text-stone-200">Preferencias del Sistema</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <MapPin size={12} /> Zona Horaria Central
              </label>
              <select 
                value={zonaHoraria}
                onChange={(e) => setZonaHoraria(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none appearance-none cursor-pointer"
              >
                <option value="cartagena">Cartagena, Colombia (GMT-5)</option>
                <option value="bogota">Bogotá, Colombia (GMT-5)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Moneda Principal</label>
              <select 
                value={moneda}
                onChange={(e) => setMoneda(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none appearance-none cursor-pointer"
              >
                <option value="cop">Peso Colombiano (COP)</option>
                <option value="usd">Dólar Estadounidense (USD)</option>
              </select>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
            <h3 className="text-sm font-bold text-stone-300 mb-4 flex items-center gap-2">
              <Bell size={16} className="text-amber-500" /> Notificaciones
            </h3>
            <div className="space-y-4">
              {/* Toggle Resumen Diario */}
              <div 
                onClick={() => setNotifResumen(!notifResumen)}
                className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 cursor-pointer hover:border-white/10 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-stone-200">Resumen Diario</p>
                  <p className="text-xs text-stone-500">Recibir un email al final del día con el total de ingresos.</p>
                </div>
                <div className={`w-12 h-6 rounded-full relative shadow-inner transition-colors ${notifResumen ? 'bg-amber-500' : 'bg-zinc-700'}`}>
                  <div className={`w-4 h-4 rounded-full absolute top-1 shadow-sm transition-all ${notifResumen ? 'bg-zinc-950 right-1' : 'bg-stone-300 left-1'}`} />
                </div>
              </div>
              
              {/* Toggle Alertas Cancelación */}
              <div 
                onClick={() => setNotifAlertas(!notifAlertas)}
                className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 cursor-pointer hover:border-white/10 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-stone-200">Alertas de Cancelación</p>
                  <p className="text-xs text-stone-500">Avisos inmediatos cuando un cliente cancela una cita.</p>
                </div>
                <div className={`w-12 h-6 rounded-full relative shadow-inner transition-colors ${notifAlertas ? 'bg-amber-500' : 'bg-zinc-700'}`}>
                  <div className={`w-4 h-4 rounded-full absolute top-1 shadow-sm transition-all ${notifAlertas ? 'bg-zinc-950 right-1' : 'bg-stone-300 left-1'}`} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: Suscripción (Detalle SaaS) */}
        <div className="config-section bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
              <CreditCard size={20} />
            </div>
            <h2 className="text-xl font-bold text-stone-200">Plan y Facturación</h2>
          </div>

          <div className="bg-gradient-to-r from-zinc-900 to-black/40 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px]" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-serif font-bold text-stone-100">Plan Élite</h3>
                  <span className="bg-amber-500 text-zinc-950 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                    Piloto
                  </span>
                </div>
                <p className="text-stone-400 text-sm max-w-md">
                  Tienes acceso ilimitado a todas las funciones premium. El programa piloto finaliza el <strong className="text-stone-200">25 de mayo de 2026</strong>.
                </p>
              </div>
              
              <div className="flex flex-col gap-2 shrink-0">
                <button 
                  onClick={() => toast.info("Módulo de pagos en desarrollo para la fase post-piloto.")}
                  className="bg-white hover:bg-stone-200 text-zinc-950 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg text-center"
                >
                  Añadir Método de Pago
                </button>
                <button 
                  onClick={() => toast.info("Próximamente verás los planes disponibles.")}
                  className="text-stone-500 hover:text-stone-300 text-xs font-medium transition-colors text-center"
                >
                  Ver planes disponibles
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}