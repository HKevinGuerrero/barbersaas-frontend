"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { 
  DollarSign, 
  Wallet, 
  Calendar, 
  Scissors, 
  ArrowUpRight,
  Download,
  CheckCircle2,
  RefreshCw,
  Clock,
  MapPin 
} from "lucide-react";
import gsap from "gsap";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function GananciasBarberoPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [citasCompletadas, setCitasCompletadas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [periodo, setPeriodo] = useState<string>("Esta Semana");

  const fetchGanancias = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/Citas/mis-citas');
      const misCompletadas = res.data.filter((c: any) => c.estado === "Completada");
      setCitasCompletadas(misCompletadas);
    } catch (error) {
      console.error("Error al cargar ganancias:", error);
      toast.error("Error al cargar tu historial de producción.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGanancias();
  }, [fetchGanancias]);

  useEffect(() => {
    if (!isLoading && citasCompletadas.length >= 0) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".earn-card", 
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: "power2.out" }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLoading, citasCompletadas]);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
  };

  const isCitaInPeriod = (citaFechaStr: string, period: string) => {
    const [year, month, day] = citaFechaStr.split('T')[0].split('-');
    const citaDate = new Date(Number(year), Number(month) - 1, Number(day)); 
    
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(start);

    switch (period) {
      case "Esta Semana":
        const currentDay = start.getDay() || 7;
        start.setDate(start.getDate() - currentDay + 1); 
        break;
      case "Semana Pasada":
        const lastWeekDay = start.getDay() || 7;
        start.setDate(start.getDate() - lastWeekDay - 6);
        end.setDate(end.getDate() - lastWeekDay);
        break;
      case "Este Mes":
        start.setDate(1); 
        end.setMonth(end.getMonth() + 1);
        end.setDate(0); 
        break;
    }
    return citaDate >= start && citaDate <= end;
  };

  const ingresosSemana = citasCompletadas
    .filter(c => isCitaInPeriod(c.fechaCita, "Esta Semana"))
    .reduce((sum, c) => sum + c.totalPrecio, 0);

  const ingresosMes = citasCompletadas
    .filter(c => isCitaInPeriod(c.fechaCita, "Este Mes"))
    .reduce((sum, c) => sum + c.totalPrecio, 0);

  const citasFiltradas = citasCompletadas
    .filter(c => isCitaInPeriod(c.fechaCita, periodo))
    .sort((a, b) => new Date(b.fechaCita).getTime() - new Date(a.fechaCita).getTime());

  return (
    <div ref={containerRef} className="space-y-6 md:space-y-8 relative pb-20 max-w-5xl mx-auto">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[300px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 earn-card">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-100 tracking-tight flex items-center gap-3">
            Mi <span className="text-emerald-500">Producción</span>
            <button onClick={fetchGanancias} className="text-emerald-500/50 hover:text-emerald-500 transition-colors" disabled={isLoading} title="Actualizar datos">
               <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            </button>
          </h1>
          <p className="text-stone-500 mt-1 text-xs md:text-sm">
            Historial de cortes realizados y dinero generado en tu silla.
          </p>
        </div>
        
        <button className="bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-stone-200 font-bold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg w-full sm:w-auto active:scale-95">
          <Download size={16} />
          Descargar Resumen
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 relative z-10">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 relative z-10">
            <div className="earn-card bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <DollarSign size={20} />
                </div>
                <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500">
                  <ArrowUpRight size={12} /> Activo
                </span>
              </div>
              <p className="text-stone-500 text-[10px] md:text-xs uppercase tracking-widest mt-4">Generado esta semana</p>
              <h3 className="text-2xl md:text-3xl font-bold text-stone-100 mt-1">{formatMoney(ingresosSemana)}</h3>
            </div>

            <div className="earn-card bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2.5 rounded-xl bg-zinc-800/50 text-stone-400">
                  <Scissors size={20} />
                </div>
              </div>
              <p className="text-stone-500 text-[10px] md:text-xs uppercase tracking-widest mt-4">Cortes Realizados ({periodo})</p>
              <h3 className="text-2xl md:text-3xl font-bold text-stone-100 mt-1">{citasFiltradas.length}</h3>
            </div>

            <div className="earn-card bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-[30px]" />
              <div className="flex justify-between items-start mb-2 relative z-10">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Wallet size={20} />
                </div>
              </div>
              <p className="text-emerald-500/70 text-[10px] md:text-xs uppercase tracking-widest mt-4 relative z-10">Acumulado del Mes</p>
              <h3 className="text-2xl md:text-3xl font-bold text-emerald-400 mt-1 relative z-10">{formatMoney(ingresosMes)}</h3>
            </div>
          </div>

          <div className="earn-card bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden relative z-10 shadow-xl">
            <div className="p-6 md:p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-xl font-serif font-bold text-stone-200">Historial de Servicios</h3>
              
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-stone-500" />
                <select 
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="bg-zinc-800/50 border border-white/10 text-stone-300 text-xs rounded-lg px-3 py-2 outline-none cursor-pointer"
                >
                  <option>Esta Semana</option>
                  <option>Semana Pasada</option>
                  <option>Este Mes</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="text-stone-500 text-[10px] uppercase tracking-[0.2em] bg-white/5">
                    <th className="px-6 py-4 font-bold">Fecha / Hora</th>
                    <th className="px-6 py-4 font-bold">Sucursal</th>
                    <th className="px-6 py-4 font-bold">Corte / Cliente</th>
                    <th className="px-8 py-4 font-bold text-right">Valor del Servicio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {citasFiltradas.length > 0 ? (
                    citasFiltradas.map((earn: any) => (
                      <tr key={earn.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-5">
                          <p className="text-stone-300 text-sm font-medium">{earn.fechaCita.split('T')[0]}</p>
                          <p className="text-stone-500 text-xs flex items-center gap-1 mt-1">
                            <Clock size={10} /> {earn.horaCita}
                          </p>
                        </td>
                        <td className="px-6 py-5">
                          <span className="flex items-center gap-1 text-stone-300 text-sm font-medium">
                            <MapPin size={14} className="text-emerald-500"/>
                            {earn.sucursalNombre || "Sucursal Local"}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-stone-300 text-sm font-bold capitalize truncate max-w-[200px]" title={earn.servicios?.join(" + ")}>
                            {earn.servicios?.join(" + ") || "Servicio"}
                          </p>
                          <p className="text-stone-500 text-xs capitalize mt-1">
                            {earn.nombreClienteInvitado || "Cliente Registrado"}
                          </p>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-emerald-400 text-base">{formatMoney(earn.totalPrecio)}</span>
                            <span className="text-[9px] font-bold tracking-widest text-emerald-500 flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10">
                              <CheckCircle2 size={10} /> {earn.estado}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-stone-500 text-sm italic">
                        No has completado servicios en este periodo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
}