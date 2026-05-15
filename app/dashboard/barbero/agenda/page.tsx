"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { 
  Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, 
  CheckCircle2, XCircle, Scissors, DollarSign, MapPin, RefreshCw 
} from "lucide-react";
import gsap from "gsap";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function AgendaCompletaBarberoPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Formateador de fecha para el Header ("Hoy, 01 May")
  const getTodayFormatted = () => {
    const today = new Date();
    return `Hoy, ${today.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }).replace('.', '')}`;
  };
  const [currentDate] = useState(getTodayFormatted());

  // Función para cargar las citas desde el backend
  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      // 🔒 AQUÍ SE ARREGLÓ LA FUGA: Se usa el endpoint seguro que lee el JWT
      const res = await api.get('/Citas/mis-citas');
      
      // Extraemos la fecha en tu zona horaria local
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const hoyStr = `${year}-${month}-${day}`; 
      
      const citasHoy = res.data
        .filter((c: any) => c.fechaCita.startsWith(hoyStr))
        .sort((a: any, b: any) => a.horaCita.localeCompare(b.horaCita));
        
      setAppointments(citasHoy);
    } catch (error) {
      console.error("Error al cargar agenda:", error);
      toast.error("Error al cargar la agenda.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Animaciones (se disparan cuando cargan las citas)
  useEffect(() => {
    if (!isLoading && appointments.length >= 0) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".agenda-item", 
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, stagger: 0.1, duration: 0.5, ease: "power2.out" }
        );
        gsap.fromTo(".agenda-header",
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.5 }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLoading, appointments]);

  // Helpers de formato
  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [hour, minute] = timeStr.split(':');
    const d = new Date();
    d.setHours(parseInt(hour, 10), parseInt(minute, 10));
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
  };

  // --- LÓGICA DE ACTUALIZACIÓN DE ESTADO ---
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.put(`/Citas/${id}/estado`, { estado: newStatus });
      
      toast.success(`Cita marcada como ${newStatus}`);
      
      // Actualizamos el estado local inmediatamente
      setAppointments(prev => prev.map(apt => 
        apt.id === id ? { ...apt, estado: newStatus } : apt
      ));

    } catch (error) {
      console.error("Error al cambiar estado:", error);
      toast.error("No se pudo actualizar el estado de la cita.");
    }
  };

  return (
    <div ref={containerRef} className="space-y-6 md:space-y-8 relative pb-20 max-w-3xl mx-auto">
      
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header y Control de Fecha */}
      <div className="agenda-header flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 bg-zinc-900/40 backdrop-blur-md border border-white/5 p-4 md:p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-100 tracking-tight flex items-center gap-3">
            Agenda <span className="text-amber-500">Completa</span>
            <button onClick={fetchAppointments} className="text-amber-500/50 hover:text-amber-500 transition-colors" disabled={isLoading}>
               <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            </button>
          </h1>
          <p className="text-stone-500 mt-1 text-sm flex items-center gap-1">
            <MapPin size={14} /> Vista de Operación Local
          </p>
        </div>
        
        <div className="flex items-center justify-between sm:justify-center bg-zinc-950/50 border border-white/5 rounded-xl p-1.5 w-full sm:w-auto">
          <button className="p-2 text-stone-400 hover:text-amber-500 transition-colors rounded-lg hover:bg-zinc-800">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2 px-4 font-bold text-stone-200 capitalize">
            <CalendarIcon size={16} className="text-amber-500" />
            {currentDate}
          </div>
          <button className="p-2 text-stone-400 hover:text-amber-500 transition-colors rounded-lg hover:bg-zinc-800">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Línea de Tiempo (Timeline) */}
      <div className="relative z-10 mt-8">
        <div className="absolute left-[39px] md:left-[47px] top-4 bottom-4 w-px bg-white/10" />

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-20 text-stone-500 bg-zinc-900/40 rounded-3xl border border-white/5 backdrop-blur-md">
            <p>No tienes citas programadas para hoy.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {appointments.map((apt) => (
              <div key={apt.id} className="agenda-item flex gap-4 md:gap-6 relative">
                
                {/* Indicador de Hora y Estado (Timeline Dot) */}
                <div className="flex flex-col items-center pt-1 w-20 md:w-24 shrink-0">
                  <span className="text-xs md:text-sm font-bold text-stone-300 mb-2">{formatTime(apt.horaCita)}</span>
                  <div className={`w-4 h-4 rounded-full border-4 border-zinc-950 z-10 relative shadow-sm ${
                    apt.estado === "Completada" ? "bg-emerald-500" :
                    apt.estado === "En Curso" ? "bg-amber-500 animate-pulse" :
                    apt.estado === "Cancelada" ? "bg-red-500" : "bg-zinc-600"
                  }`}>
                    {apt.estado === "En Curso" && (
                      <div className="absolute inset-0 rounded-full bg-amber-500 animate-ping opacity-50" />
                    )}
                  </div>
                </div>

                {/* Tarjeta de la Cita */}
                <div className={`flex-1 rounded-2xl p-4 md:p-5 border backdrop-blur-md transition-all ${
                  apt.estado === "En Curso" ? "bg-amber-500/5 border-amber-500/30" : 
                  apt.estado === "Cancelada" ? "bg-zinc-900/20 border-white/5 opacity-60" :
                  "bg-zinc-900/40 border-white/5 hover:border-white/10"
                }`}>
                  
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-lg font-bold capitalize ${apt.estado === "Cancelada" ? "text-stone-500 line-through" : "text-stone-100"}`}>
                          {apt.nombreClienteInvitado || apt.barberoNombre} 
                        </h3>
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                          apt.estado === "Completada" ? "bg-emerald-500/10 text-emerald-500" :
                          apt.estado === "En Curso" ? "bg-amber-500/10 text-amber-500" :
                          apt.estado === "Cancelada" ? "bg-red-500/10 text-red-500" : "bg-zinc-800 text-stone-400"
                        }`}>
                          {apt.estado}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400 mt-2">
                        {/* 📍 AQUÍ SE MUESTRA EL NOMBRE DE LA SUCURSAL */}
                        <span className="flex items-center gap-1 font-medium text-stone-300 bg-white/5 px-2 py-1 rounded-md">
                          <MapPin size={12} className="text-amber-500" /> 
                          {apt.sucursalNombre || "Sucursal Local"}
                        </span>
                        
                        <span className="flex items-center gap-1">
                          <Scissors size={12} className="text-amber-500" /> 
                          {apt.servicios?.join(" + ") || "Servicio"}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign size={12} className="text-amber-500" /> 
                          {formatMoney(apt.totalPrecio)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-amber-500" /> 
                          {apt.barberoNombre}
                        </span>
                      </div>
                    </div>

                    {/* Acciones del Barbero */}
                    {(apt.estado === "Pendiente" || apt.estado === "En Curso") && (
                      <div className="flex items-center gap-2 pt-2 md:pt-0 border-t border-white/5 md:border-0 mt-2 md:mt-0">
                        {apt.estado === "Pendiente" && (
                          <button 
                            onClick={() => handleStatusChange(apt.id, "En Curso")}
                            className="flex-1 md:flex-none bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                          >
                            Iniciar
                          </button>
                        )}
                        <button 
                          onClick={() => handleStatusChange(apt.id, "Completada")}
                          className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-colors" 
                          title="Marcar como Completada"
                        >
                          <CheckCircle2 size={20} />
                        </button>
                        <button 
                          onClick={() => handleStatusChange(apt.id, "Cancelada")}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors" 
                          title="Cancelar Cita"
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}