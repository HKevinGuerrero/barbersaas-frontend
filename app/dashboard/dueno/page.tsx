"use client";

import { useEffect, useRef, useCallback, useState } from "react"; 
import { Users, CalendarCheck, DollarSign, Clock, MapPin, RefreshCw } from "lucide-react";
import gsap from "gsap";
import { toast } from "sonner";
import { api } from "@/lib/api";

const formatHoraAmPm = (horaBackend: string) => {
  if (!horaBackend) return "";

  // 1. Si la hora ya trae "AM" o "PM", la devolvemos tal cual para no duplicar
  if (horaBackend.toLowerCase().includes('am') || horaBackend.toLowerCase().includes('pm')) {
    return horaBackend;
  }

  // 2. Si viene militar pura (ej: "14:30" o "14:30:00"), hacemos la magia
  const partes = horaBackend.split(':');
  let h = parseInt(partes[0], 10);
  const minutos = partes[1].substring(0, 2); // Cortamos a 2 dígitos por si trae segundos
  
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; 
  const strHours = h.toString().padStart(2, '0');
  
  return `${strHours}:${minutos} ${ampm}`;
};

export default function DashboardDuenoPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [activeBranch, setActiveBranch] = useState<string>("");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Cargar sucursales al inicio
  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const res = await api.get('/Sucursales');
        setSucursales(res.data);
      } catch (error) {
        console.error("Error cargando sucursales:", error);
      }
    };
    fetchSucursales();
  }, []);

  // --- FUNCIÓN DE CARGA EXTRAÍDA ---
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = activeBranch ? `?sucursalId=${activeBranch}` : "";
      const res = await api.get(`/Dashboard/resumen${query}`);
      setDashboardData(res.data);
    } catch (error) {
      console.error("Error al cargar dashboard:", error);
      toast.error("Error al cargar las métricas.");
    } finally {
      setIsLoading(false);
    }
  }, [activeBranch]);

  // 2. Ejecutar carga cuando cambie la sucursal
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Animaciones
  useEffect(() => {
    if (!isLoading && dashboardData) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".stat-card", 
          { opacity: 0, y: 20 }, 
          { opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: "power2.out" }
        );
        gsap.fromTo(".table-row-anim", 
          { opacity: 0, x: -10 }, 
          { opacity: 1, x: 0, stagger: 0.05, duration: 0.5 }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLoading, dashboardData]);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
  };

  const stats = [
    { label: "Citas Hoy", value: dashboardData?.citasHoy || 0, icon: CalendarCheck, color: "text-amber-500" },
    { label: "Ingresos Hoy", value: formatMoney(dashboardData?.ingresosHoy || 0), icon: DollarSign, color: "text-emerald-500" },
    { label: "Ingresos del Mes", value: formatMoney(dashboardData?.ingresosMes || 0), icon: DollarSign, color: "text-emerald-400" },
  ];

  return (
    <div ref={containerRef} className="space-y-8 relative pb-20">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-100 tracking-tight">
            Panel de <span className="text-amber-500">Control</span>
          </h1>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-stone-500 flex items-center gap-2 text-sm">
              <Clock size={14} /> Vista de Administrador General
            </p>
            <button 
              onClick={fetchDashboardData} 
              className="text-amber-500/50 hover:text-amber-500 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div className="relative group w-full md:w-auto">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" size={16} />
          <select 
            value={activeBranch}
            onChange={(e) => setActiveBranch(e.target.value)}
            className="w-full md:w-64 bg-zinc-900/80 border border-amber-500/30 rounded-xl py-2.5 pl-10 pr-8 text-amber-500 font-bold text-sm focus:border-amber-500 outline-none appearance-none cursor-pointer"
          >
            <option value="">Todas las Sucursales</option>
            {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>
      </div>

      {isLoading && !dashboardData ? (
        <div className="flex justify-center py-20 relative z-10">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div key={activeBranch} className="space-y-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card opacity-0 bg-zinc-900/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl hover:border-amber-500/30 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl bg-zinc-800/50 ${stat.color} group-hover:scale-110 transition-transform`}>
                    <stat.icon size={24} />
                  </div>
                </div>
                <h3 className="text-stone-500 text-[10px] font-bold uppercase tracking-widest">{stat.label}</h3>
                <p className="text-2xl font-bold text-stone-100 mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="stat-card opacity-0 bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-6 md:p-8 border-b border-white/5 bg-zinc-950/30 flex justify-between items-center">
              <h3 className="text-xl font-serif font-bold text-stone-200">Agenda de Hoy</h3>
              <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 uppercase tracking-wider">
                {activeBranch === "" ? "Consolidado Global" : sucursales.find(s => s.id === activeBranch)?.nombre}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="text-stone-500 text-[10px] uppercase tracking-[0.2em] bg-white/5">
                    <th className="px-6 py-4 font-bold">Hora</th>
                    <th className="px-6 py-4 font-bold">Cliente</th>
                    <th className="px-6 py-4 font-bold">Servicio</th>
                    <th className="px-6 py-4 font-bold">Estado</th>
                    <th className="px-6 py-4 font-bold">Barbero</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {dashboardData?.proximasCitas?.length > 0 ? (
                    dashboardData.proximasCitas.map((apt: any) => (
                      <tr key={apt.id} className="table-row-anim opacity-0 hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-5">
                          <span className="bg-zinc-800 text-stone-300 px-3 py-1.5 rounded-full text-xs font-bold border border-white/5">
                            {/* 👇 APLICAMOS LA MAGIA AQUÍ */}
                            {formatHoraAmPm(apt.hora)}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-stone-200 font-medium text-sm">
                          {apt.cliente}
                        </td>
                        <td className="px-6 py-5 text-stone-300 text-sm max-w-[180px] truncate" title={apt.servicio}>
                          {apt.servicio}
                        </td>
                        <td className="px-6 py-5">
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${
                            apt.estado === "Pendiente" ? "bg-zinc-800 text-stone-400" : 
                            apt.estado === "En Curso" ? "bg-blue-500/10 text-blue-500" :
                            apt.estado === "Completada" ? "bg-emerald-500/10 text-emerald-500" :
                            "bg-red-500/10 text-red-500"
                          }`}>
                            {apt.estado}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-stone-400 text-sm">{apt.barbero}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-stone-500 text-sm italic">
                        No se encontraron registros para el día de hoy.
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