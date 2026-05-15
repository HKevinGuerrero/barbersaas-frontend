"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { TrendingUp, CheckCircle2, Scissors, Clock, XCircle, RefreshCw } from "lucide-react";
import gsap from "gsap";
import { toast } from "sonner";
import { api } from "@/lib/api";

// 👇 Función mágica de conversión
const formatHoraAmPm = (horaMilitar: string) => {
  if (!horaMilitar) return "";
  const [hours, minutes] = horaMilitar.split(':');
  let h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; 
  const strHours = h.toString().padStart(2, '0');
  return `${strHours}:${minutes} ${ampm}`;
};

export default function MiDiaBarberoPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [barberName, setBarberName] = useState("Barbero");

  // Función para obtener "hoy" en la zona horaria local (Formato YYYY-MM-DD)
  const getTodayLocalString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

const fetchMyDay = useCallback(async () => {
    setIsLoading(true);
    try {
      const miNombre = localStorage.getItem("user_name");
      if (miNombre) setBarberName(miNombre);

      // 1. Llamamos a nuestra ruta segura. ¡El Backend ya sabe quién eres por el Token!
      const res = await api.get('/Citas/mis-citas');
      
      const hoyStr = getTodayLocalString();

      // 2. Solo filtramos por la fecha de hoy. El backend ya hizo el filtro del barbero por nosotros.
      const misCitasHoy = res.data
        .filter((c: any) => c.fechaCita.startsWith(hoyStr))
        .sort((a: any, b: any) => a.horaCita.localeCompare(b.horaCita));

      setAppointments(misCitasHoy);
    } catch (error) {
      console.error("Error al cargar Mi Día:", error);
      toast.error("Hubo un error al cargar tu agenda.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyDay();
  }, [fetchMyDay]);

  // Animaciones GSAP
  useEffect(() => {
    if (!isLoading) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".stat-card", { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.8 });
        gsap.fromTo(".table-row-anim", { opacity: 0, x: -10 }, { opacity: 1, x: 0, stagger: 0.05, duration: 0.5 });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLoading, appointments]);

  // Manejador de cambio de estado
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.put(`/Citas/${id}/estado`, { estado: newStatus });
      toast.success(`Cita marcada como ${newStatus}`);
      
      // Actualizamos el estado local para reflejar el cambio de inmediato
      setAppointments(prev => prev.map(apt => 
        apt.id === id ? { ...apt, estado: newStatus } : apt
      ));
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      toast.error("No se pudo actualizar el estado de la cita.");
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
  };

// --- CÁLCULO DE ESTADÍSTICAS DINÁMICAS ---
  const cortesHoy = appointments.length;
  const completados = appointments.filter(a => a.estado === "Completada").length;
  
  // SOLUCIÓN 1: Ahora SOLO suma las citas con estado "Completada"
  const gananciaHoy = appointments
    .filter(a => a.estado === "Completada") 
    .reduce((sum, apt) => sum + apt.totalPrecio, 0);

  const barberStats = [
    { label: "Mis Cortes Hoy", value: cortesHoy.toString(), icon: Scissors, color: "text-amber-500" },
    { label: "Completados", value: completados.toString(), icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Ganancia Hoy", value: formatMoney(gananciaHoy), icon: TrendingUp, color: "text-emerald-500" },
  ];

  return (
    <div ref={containerRef} className="space-y-8 relative pb-20">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex flex-col gap-1 relative z-10">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-100 tracking-tight flex items-center gap-3">
          Mi <span className="text-amber-500">Día</span>
          <button onClick={fetchMyDay} className="text-amber-500/50 hover:text-amber-500 transition-colors" disabled={isLoading} title="Actualizar Agenda">
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
        </h1>
        <p className="text-stone-500 mt-1 flex items-center gap-2 text-sm capitalize">
          <Clock size={14} /> Agenda Personal: {barberName}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 relative z-10">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="relative z-10 space-y-8">
          {/* Tarjetas de KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {barberStats.map((stat, i) => (
              <div key={i} className="stat-card opacity-0 bg-zinc-900/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-lg">
                <div className={`p-3 rounded-xl bg-zinc-800/50 w-fit mb-4 ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <h3 className="text-stone-500 text-xs font-bold uppercase tracking-widest">{stat.label}</h3>
                <p className="text-3xl font-bold text-stone-100 mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Tabla de Citas */}
          <div className="stat-card opacity-0 bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-6 md:p-8 border-b border-white/5 bg-zinc-950/30">
              <h3 className="text-xl font-serif font-bold text-stone-200">Mis Citas de Hoy</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="text-stone-500 text-[10px] uppercase tracking-[0.2em] bg-white/5">
                    <th className="px-6 py-4 font-bold">Hora</th>
                    <th className="px-6 py-4 font-bold">Cliente</th>
                    <th className="px-6 py-4 font-bold">Servicio</th>
                    <th className="px-6 py-4 font-bold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {appointments.length > 0 ? (
                    appointments.map((apt) => (
                      <tr key={apt.id} className={`table-row-anim opacity-0 transition-all ${apt.estado === 'Completada' || apt.estado === 'Cancelada' ? 'bg-zinc-900/30 opacity-60' : 'hover:bg-white/[0.02]'}`}>
                        <td className="px-6 py-5">
                          <span className="bg-zinc-800 text-stone-300 px-3 py-1.5 rounded-full text-xs font-bold border border-white/5">
                            {/* 👇 APLICAMOS LA MAGIA AQUÍ. Borré el substring */}
                            {formatHoraAmPm(apt.horaCita)}
                          </span>
                        </td>
                        <td className="px-6 py-5 font-medium text-sm capitalize text-stone-200">
                          {apt.nombreClienteInvitado || "Cliente Registrado"}
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm text-stone-300 truncate max-w-[180px]" title={apt.servicios?.join(" + ")}>
                            {apt.servicios?.join(" + ") || "Servicio"}
                          </p>
                          <p className="text-[10px] font-bold mt-0.5 text-emerald-500">
                            {formatMoney(apt.totalPrecio)}
                          </p>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end items-center gap-2">
                            {apt.estado === "Completada" ? (
                              <span className="text-emerald-500 font-bold text-xs flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                                <CheckCircle2 size={14} /> Finalizado
                              </span>
                            ) : apt.estado === "Cancelada" ? (
                              <span className="text-red-500 font-bold text-xs flex items-center gap-1 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                                <XCircle size={14} /> Cancelada
                              </span>
                            ) : (
                              <>
                                {apt.estado === "Pendiente" && (
                                  <button 
                                    onClick={() => handleStatusChange(apt.id, "En Curso")}
                                    className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-500/20 transition-colors"
                                  >
                                    Iniciar
                                  </button>
                                )}
                                {apt.estado === "En Curso" && (
                                  <span className="text-amber-500 font-bold text-[10px] uppercase tracking-widest px-2 animate-pulse">
                                    En Curso...
                                  </span>
                                )}
                                <button 
                                  onClick={() => handleStatusChange(apt.id, "Completada")}
                                  className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                  title="Completar cita"
                                >
                                  <CheckCircle2 size={18} />
                                </button>
                                <button 
                                  onClick={() => handleStatusChange(apt.id, "Cancelada")}
                                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                  title="Cancelar cita"
                                >
                                  <XCircle size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-stone-500 text-sm italic">
                        No tienes citas programadas para el día de hoy.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}