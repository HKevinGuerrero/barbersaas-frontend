"use client";

import { useEffect, useRef, useState } from "react";
import { 
  TrendingUp, 
  Wallet, 
  Scissors, 
  Download,
  CalendarX2,
  MapPin,
  Clock
} from "lucide-react";
import gsap from "gsap";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function FinanzasPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Estados
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [selectedSucursal, setSelectedSucursal] = useState<string>("");
  const [periodo, setPeriodo] = useState<string>("Esta Semana");
  const [resumen, setResumen] = useState<any>(null);
  const [transacciones, setTransacciones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

// Función para obtener Inicio y Fin según el filtro seleccionado
// Función para obtener Inicio y Fin según el filtro seleccionado
  const getDateRange = (period: string) => {
    const today = new Date();
    let start = new Date(today);
    let end = new Date(today);

    switch (period) {
      case "Esta Semana":
        const day = start.getDay() || 7; // Lunes = 1, Domingo = 7
        start.setDate(start.getDate() - day + 1); // Lunes
        break;
      case "Semana Pasada":
        const lastWeekDay = start.getDay() || 7;
        start.setDate(start.getDate() - lastWeekDay - 6);
        end.setDate(end.getDate() - lastWeekDay);
        break;
      case "Este Mes":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Último día del mes actual
        break;
      case "Mes Pasado":
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
    }
    
    // Formatear a YYYY-MM-DD usando la hora local
    const formatLocal = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // EL TRUCO DE LA MEDIANOCHE: 
    // Le decimos al backend que abarque desde las 00:00:00 del inicio hasta las 23:59:59 del fin
    return {
      fechaInicio: `${formatLocal(start)}T00:00:00`,
      fechaFin: `${formatLocal(end)}T23:59:59`
    };
  };

  // Carga Inicial de Sucursales
  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const res = await api.get('/Sucursales');
        setSucursales(res.data);
      } catch (error) {
        console.error("Error al cargar sucursales", error);
      }
    };
    fetchSucursales();
  }, []);

  // Cargar Finanzas y Transacciones cada vez que cambie el filtro
  useEffect(() => {
    const loadFinanzas = async () => {
      setIsLoading(true);
      try {
        const { fechaInicio, fechaFin } = getDateRange(periodo);
        const sucursalQuery = selectedSucursal ? `&sucursalId=${selectedSucursal}` : "";
        
        const [resumenRes, transaccionesRes] = await Promise.all([
          api.get(`/Transacciones/resumen?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}${sucursalQuery}`),
          api.get(`/Transacciones/recientes?${sucursalQuery}`)
        ]);

        setResumen(resumenRes.data);
        setTransacciones(transaccionesRes.data);
      } catch (error) {
        console.error("Error cargando finanzas:", error);
        toast.error("Hubo un error al cargar el reporte financiero.");
      } finally {
        setIsLoading(false);
      }
    };

    loadFinanzas();
  }, [selectedSucursal, periodo]);

  // Animaciones GSAP
  useEffect(() => {
    if (!isLoading && resumen) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".finance-element", 
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: "power2.out" }
        );
        
        gsap.fromTo(".bar-chart-fill",
          { height: "0%" },
          { height: (index, target) => target.getAttribute("data-height"), duration: 1.5, ease: "power4.out", stagger: 0.1, delay: 0.3 }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLoading, resumen]);

  // Formateador de dinero
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(amount);
  };

  // Calcular la altura dinámica del gráfico (100% = el día que más se vendió)
  const maxMontoGrafico = resumen?.graficoIngresos?.length > 0 
    ? Math.max(...resumen.graficoIngresos.map((d: any) => d.monto)) 
    : 1;

  return (
    <div ref={containerRef} className="space-y-6 md:space-y-8 relative pb-20">
      
      <div className="absolute top-0 left-0 w-full h-[400px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Header Responsivo */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10 finance-element">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-100 tracking-tight">
            Resumen de <span className="text-emerald-500">Ingresos</span>
          </h1>
          <p className="text-stone-500 mt-1 text-xs md:text-sm">
            Métricas de ventas y volumen de servicios.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Filtro de Sucursal */}
          <div className="relative group flex-1 sm:flex-none">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={16} />
            <select 
              value={selectedSucursal}
              onChange={(e) => setSelectedSucursal(e.target.value)}
              className="w-full bg-zinc-900/80 border border-white/10 rounded-xl py-2.5 pl-10 pr-8 text-stone-200 text-sm focus:border-emerald-500/50 outline-none appearance-none cursor-pointer"
            >
              <option value="">Todas las Sucursales</option>
              {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>

          <button className="bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-stone-200 font-bold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg">
            <Download size={16} />
            Exportar Reporte
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 relative z-10">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Tarjetas de KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 relative z-10">
            {/* Ingresos Brutos */}
            <div className="finance-element bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2.5 rounded-xl bg-zinc-800/50 text-stone-400">
                  <Wallet size={20} />
                </div>
              </div>
              <p className="text-stone-500 text-[10px] md:text-xs uppercase tracking-widest mt-4">Ingresos Brutos</p>
              <h3 className="text-xl md:text-2xl font-bold text-stone-100 mt-1">{formatMoney(resumen?.ingresosBrutos || 0)}</h3>
            </div>
            
            {/* Servicios Realizados */}
            <div className="finance-element bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2.5 rounded-xl bg-zinc-800/50 text-stone-400">
                  <Scissors size={20} />
                </div>
              </div>
              <p className="text-stone-500 text-[10px] md:text-xs uppercase tracking-widest mt-4">Servicios Completados</p>
              <h3 className="text-2xl md:text-3xl font-bold text-stone-100 mt-1">{resumen?.serviciosRealizados || 0}</h3>
            </div>

            {/* Promedio Diario */}
            <div className="finance-element bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2.5 rounded-xl bg-zinc-800/50 text-stone-400">
                  <TrendingUp size={20} />
                </div>
              </div>
              <p className="text-stone-500 text-[10px] md:text-xs uppercase tracking-widest mt-4">Promedio Diario</p>
              <h3 className="text-xl md:text-2xl font-bold text-stone-100 mt-1">{formatMoney(resumen?.promedioDiario || 0)}</h3>
            </div>

            {/* Citas Canceladas */}
            <div className="finance-element bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2.5 rounded-xl bg-zinc-800/50 text-stone-400">
                  <CalendarX2 size={20} />
                </div>
              </div>
              <p className="text-stone-500 text-[10px] md:text-xs uppercase tracking-widest mt-4">Citas Canceladas</p>
              <h3 className="text-2xl md:text-3xl font-bold text-stone-100 mt-1">{resumen?.citasCanceladas || 0}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 relative z-10">
            {/* Gráfico de Barras */}
            <div className="finance-element lg:col-span-2 bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex flex-col h-[350px]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-lg font-bold text-stone-200">Evolución de Ingresos</h3>
                <select 
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="bg-zinc-800/50 border border-white/10 text-stone-300 text-xs rounded-lg px-3 py-2 w-full sm:w-auto focus:outline-none cursor-pointer"
                >
                  <option>Esta Semana</option>
                  <option>Semana Pasada</option>
                  <option>Este Mes</option>
                  <option>Mes Pasado</option>
                </select>
              </div>
              
              <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 pt-4">
                {resumen?.graficoIngresos?.length > 0 ? (
                  resumen.graficoIngresos.map((data: any, idx: number) => {
                    const heightPercent = `${(data.monto / maxMontoGrafico) * 100}%`;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-3 w-full group">
                        <div className="relative w-full flex justify-center h-[200px] items-end">
                          <div className="absolute -top-7 sm:-top-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-zinc-800 text-stone-200 text-[9px] sm:text-xs font-bold py-1 px-1.5 sm:px-2 rounded-md pointer-events-none z-10 whitespace-nowrap">
                            {formatMoney(data.monto)}
                          </div>
                          <div className="absolute w-6 sm:w-8 md:w-12 h-full bg-zinc-800/30 rounded-t-lg" />
                          <div 
                            className="bar-chart-fill relative w-6 sm:w-8 md:w-12 bg-emerald-500 rounded-t-lg transition-colors group-hover:bg-emerald-400"
                            data-height={heightPercent}
                            style={{ height: "0%" }}
                          />
                        </div>
                        <span className="text-stone-500 text-[10px] sm:text-xs font-medium">{data.fecha}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-500 text-sm">
                    No hay ingresos registrados en este periodo.
                  </div>
                )}
              </div>
            </div>

            {/* Breakdown de Sucursales */}
            <div className="finance-element bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6">
              <h3 className="text-lg font-bold text-stone-200 mb-6">Por Sucursal</h3>
              <div className="space-y-6">
                {resumen?.desgloseSucursales?.length > 0 ? (
                  resumen.desgloseSucursales.map((sucursal: any, idx: number) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-stone-300">{sucursal.nombreSucursal}</span>
                        <span className="text-stone-300 font-bold">{formatMoney(sucursal.totalIngresos)}</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${sucursal.porcentaje}%` }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-stone-500 text-sm text-center py-10">
                    No hay datos suficientes.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Historial de Transacciones */}
          <div className="finance-element bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden relative z-10">
            <div className="p-6 md:p-8 border-b border-white/5">
              <h3 className="text-xl font-serif font-bold text-stone-200">Últimos Cobros (Recientes)</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="text-stone-500 text-[10px] uppercase tracking-[0.2em] bg-white/5">
                    <th className="px-8 py-4 font-bold">Fecha / Hora</th>
                    <th className="px-6 py-4 font-bold">Cliente / Servicio</th>
                    <th className="px-6 py-4 font-bold">Método</th>
                    <th className="px-6 py-4 font-bold">Sucursal</th>
                    <th className="px-8 py-4 font-bold text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transacciones.length > 0 ? (
                    transacciones.map((trx, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-8 py-4">
                          <p className="text-stone-300 text-sm font-medium flex items-center gap-1">
                            <Clock size={12} className="text-emerald-500"/>
                            {new Date(trx.fechaCobro).toLocaleDateString()}
                          </p>
                          <p className="text-stone-500 text-xs ml-4">
                            {new Date(trx.fechaCobro).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-stone-300 text-sm font-bold">{trx.clienteNombre}</p>
                          <p className="text-stone-500 text-[10px] uppercase truncate max-w-[200px]" title={trx.serviciosResumen}>
                            {trx.serviciosResumen}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                            trx.metodoPago === 'Efectivo' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                            'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}>
                            {trx.metodoPago}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-stone-400 text-sm">
                          {trx.sucursalNombre}
                        </td>
                        <td className="px-8 py-4 text-right font-bold text-emerald-400">
                          {formatMoney(trx.montoTotal)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-8 py-10 text-center text-stone-500 text-sm">
                        No hay transacciones registradas.
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