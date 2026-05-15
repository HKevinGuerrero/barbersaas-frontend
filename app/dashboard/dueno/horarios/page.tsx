"use client";

import { useEffect, useRef, useState } from "react";
import { 
  Calendar, Clock, AlertTriangle, Plus, Save, CalendarX2, User, X, MapPin
} from "lucide-react";
import gsap from "gsap";
import { toast } from "sonner";
import { api } from "@/lib/api";

// Horario por defecto en caso de que la sucursal sea nueva
const defaultWeekDays = [
  { dia: "Lunes", isOpen: true, open: "09:00", close: "20:00" },
  { dia: "Martes", isOpen: true, open: "09:00", close: "20:00" },
  { dia: "Miércoles", isOpen: true, open: "09:00", close: "20:00" },
  { dia: "Jueves", isOpen: true, open: "09:00", close: "20:00" },
  { dia: "Viernes", isOpen: true, open: "09:00", close: "21:00" },
  { dia: "Sábado", isOpen: true, open: "10:00", close: "18:00" },
  { dia: "Domingo", isOpen: false, open: "", close: "" },
];

export default function HorariosPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // --- Estados de Datos ---
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]); 
  const [activeBranch, setActiveBranch] = useState<string>("");
  
  const [horarios, setHorarios] = useState<any[]>(defaultWeekDays);
  const [excepciones, setExcepciones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Estados de UI ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [blockType, setBlockType] = useState<"local" | "barbero">("local");

  // 1. CARGA INICIAL
  const loadInitialData = async () => {
    try {
      const [sucursalesRes, staffRes] = await Promise.all([
        api.get('/Sucursales'),
        api.get('/Staff')
      ]);
      setSucursales(sucursalesRes.data);
      setStaff(staffRes.data);
      
      if (sucursalesRes.data.length > 0) {
        setActiveBranch(sucursalesRes.data[0].id);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error inicial:", error);
      toast.error("Error al cargar los datos base.");
      setIsLoading(false);
    }
  };

// 2. CARGAR HORARIOS Y EXCEPCIONES POR SUCURSAL
  const loadBranchSchedule = async (sucursalId: string) => {
    setIsLoading(true);
    try {
      const [horariosRes, excepcionesRes] = await Promise.all([
        // Agregamos un console.error al catch para que si falla el back, lo veamos en consola
        api.get(`/HorariosAtencion/${sucursalId}`).catch(e => { console.error(e); return { data: [] }; }),
        api.get(`/BloqueosAgenda/sucursal/${sucursalId}`).catch(e => { console.error(e); return { data: [] }; })
      ]);

      // --- CORRECCIÓN DEL HORARIO (Extraer los días del envoltorio) ---
      let dataHorario = horariosRes.data;
      
      // Si el backend devuelve un array con 1 elemento (ej. [{ sucursalId, dias }]), lo sacamos
      if (Array.isArray(dataHorario) && dataHorario.length > 0 && dataHorario[0].dias) {
        dataHorario = dataHorario[0];
      }

      // Ahora buscamos la propiedad "dias" o "Dias"
      if (dataHorario && (dataHorario.dias || dataHorario.Dias)) {
        const diasData = dataHorario.dias || dataHorario.Dias;
        // Si C# lo guardó como JSON string, lo parseamos. Si ya es un array, lo usamos directo.
        setHorarios(typeof diasData === 'string' ? JSON.parse(diasData) : diasData);
      } 
      // Si por casualidad el backend devolvió directamente el array de 7 días
      else if (Array.isArray(dataHorario) && dataHorario.length === 7) {
        setHorarios(dataHorario);
      } 
      // Si no hay horario guardado, usamos los días por defecto (Copia profunda)
      else {
        setHorarios(JSON.parse(JSON.stringify(defaultWeekDays)));
      }
      
      setExcepciones(excepcionesRes.data || []);
    } catch (error) {
      console.error("Error cargando agenda:", error);
      toast.error("No se pudo cargar la agenda de esta sucursal.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeBranch) loadBranchSchedule(activeBranch);
  }, [activeBranch]);

  // Animaciones GSAP
  useEffect(() => {
    if (!isLoading) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".schedule-element", 
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: "power2.out" }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLoading, activeBranch]);

  // --- MANEJADORES LOCALES DEL HORARIO ---
  const handleToggleDay = (index: number) => {
    const newHorarios = [...horarios];
    newHorarios[index].isOpen = !newHorarios[index].isOpen;
    if (!newHorarios[index].isOpen) {
      newHorarios[index].open = "";
      newHorarios[index].close = "";
    } else {
      newHorarios[index].open = "09:00";
      newHorarios[index].close = "20:00";
    }
    setHorarios(newHorarios);
  };

  const handleTimeChange = (index: number, field: "open" | "close", value: string) => {
    const newHorarios = [...horarios];
    newHorarios[index][field] = value;
    setHorarios(newHorarios);
  };

  // 3. GUARDAR HORARIO SEMANAL
  const handleSaveHorario = async () => {
    try {
      // Ruta corregida a /HorariosAtencion y convertido a POST según tu controlador
      await api.post(`/HorariosAtencion`, { sucursalId: activeBranch, dias: horarios });
      toast.success("¡Horario semanal actualizado!");
    } catch (error) {
      console.error("Error guardando horario:", error);
      toast.error("Hubo un error al guardar el horario.");
    }
  };

  // 4. AÑADIR EXCEPCIÓN / BLOQUEO
  const handleAddException = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const payload = {
      sucursalId: activeBranch,
      motivo: formData.get("motivo"),
      tipo: blockType,
      barberoId: blockType === "barbero" ? formData.get("barberoId") : null,
      fechaInicio: formData.get("fechaInicio"),
      fechaFin: formData.get("fechaFin")
    };

    try {
      // Ruta corregida a /BloqueosAgenda
      await api.post('/BloqueosAgenda', payload);
      toast.success("Fechas bloqueadas correctamente.");
      setIsModalOpen(false);
      loadBranchSchedule(activeBranch);
    } catch (error) {
      console.error("Error guardando excepción:", error);
      toast.error("Ocurrió un error al bloquear las fechas.");
    }
  };

  // 5. ELIMINAR EXCEPCIÓN
  const handleDeleteException = async (id: string) => {
    if(!window.confirm("¿Deseas eliminar este bloqueo?")) return;
    try {
      // Ruta corregida a /BloqueosAgenda
      await api.delete(`/BloqueosAgenda/${id}`);
      toast.success("Bloqueo eliminado.");
      loadBranchSchedule(activeBranch);
    } catch (error) {
      console.error("Error al eliminar excepción:", error);
      toast.error("No se pudo eliminar el bloqueo.");
    }
  };

  const staffDeSucursal = staff.filter(s => s.sucursalId === activeBranch);

  return (
    <div ref={containerRef} className="space-y-6 md:space-y-8 relative pb-20">
      
      <div className="absolute top-20 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Header con Selector de Sucursal */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10 schedule-element">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-100 tracking-tight">
            Horarios y <span className="text-amber-500">Disponibilidad</span>
          </h1>
          <p className="text-stone-500 mt-1 text-xs md:text-sm">
            Configura los horarios por sucursal y bloquea fechas.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Selector de Sucursal */}
          <div className="relative group flex-1 sm:flex-none">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" size={16} />
            <select 
              value={activeBranch}
              onChange={(e) => setActiveBranch(e.target.value)}
              disabled={sucursales.length === 0}
              className="w-full bg-zinc-900/80 border border-amber-500/30 rounded-xl py-2.5 pl-10 pr-8 text-amber-500 font-bold text-sm focus:border-amber-500 outline-none appearance-none cursor-pointer disabled:opacity-50"
            >
              {sucursales.length === 0 ? (
                <option value="">Sin sucursales</option>
              ) : (
                sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)
              )}
            </select>
          </div>

          <button 
            onClick={handleSaveHorario}
            disabled={sucursales.length === 0 || isLoading}
            className="bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-stone-200 font-bold px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg disabled:opacity-50"
          >
            <Save size={16} />
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 relative z-10">
        
        {/* COLUMNA 1: HORARIO SEMANAL */}
        <div className="schedule-element bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-lg">
                <Clock size={20} />
              </div>
              <h2 className="text-xl font-bold text-stone-200">Horario de Atención</h2>
            </div>
          </div>

          {isLoading ? (
             <div className="flex justify-center py-12">
               <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : (
            <div className="space-y-4">
              {horarios.map((day, idx) => (
                <div key={idx} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border transition-all gap-3 ${day.isOpen ? 'bg-black/20 border-white/5' : 'bg-black/10 border-transparent opacity-60'}`}>
                  <div className="flex items-center gap-3 w-32">
                    <div 
                      onClick={() => handleToggleDay(idx)}
                      className={`w-10 h-5 rounded-full relative cursor-pointer shadow-inner transition-colors ${day.isOpen ? 'bg-amber-500' : 'bg-zinc-700'}`}
                    >
                      <div className={`w-3.5 h-3.5 bg-zinc-950 rounded-full absolute top-0.5 shadow-sm transition-all ${day.isOpen ? 'right-0.5' : 'left-0.5 bg-stone-300'}`} />
                    </div>
                    <span className={`text-sm font-medium ${day.isOpen ? 'text-stone-200' : 'text-stone-500'}`}>{day.dia || day.day}</span>
                  </div>

                  {day.isOpen ? (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input 
                        type="time" 
                        value={day.open} 
                        onChange={(e) => handleTimeChange(idx, "open", e.target.value)}
                        className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-stone-300 text-sm focus:outline-none focus:border-amber-500/50" 
                      />
                      <span className="text-stone-500 text-sm">a</span>
                      <input 
                        type="time" 
                        value={day.close} 
                        onChange={(e) => handleTimeChange(idx, "close", e.target.value)}
                        className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-stone-300 text-sm focus:outline-none focus:border-amber-500/50" 
                      />
                    </div>
                  ) : (
                    <div className="w-full sm:w-auto text-left sm:text-right text-sm text-stone-500 font-medium px-2">
                      Cerrado
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COLUMNA 2: BLOQUEOS Y EXCEPCIONES */}
        <div className="schedule-element bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-500/10 text-red-500 rounded-lg">
                <CalendarX2 size={20} />
              </div>
              <h2 className="text-xl font-bold text-stone-200">Fechas Bloqueadas</h2>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              disabled={sucursales.length === 0}
              className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold disabled:opacity-50"
            >
              <Plus size={16} /> Añadir
            </button>
          </div>

          <div className="flex-1 space-y-4">
            {isLoading ? (
               <div className="flex justify-center py-12">
                 <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
               </div>
            ) : excepciones.length > 0 ? (
              excepciones.map((block) => (
                <div key={block.id} className="p-4 bg-zinc-950/50 border border-white/5 rounded-xl relative group hover:border-red-500/20 transition-colors">
                  <button 
                    onClick={() => handleDeleteException(block.id)}
                    className="absolute top-4 right-4 text-stone-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                  <h3 className="text-stone-200 font-bold text-sm mb-1">{block.motivo}</h3>
                  <div className="flex items-center gap-4 mt-3">
                    <p className="text-stone-400 text-xs flex items-center gap-1">
                      <Calendar size={12} className="text-amber-500" /> {block.fechaInicio} al {block.fechaFin}
                    </p>
                    <p className="text-stone-400 text-xs flex items-center gap-1">
                      {block.tipo === "barbero" ? <User size={12} className="text-amber-500" /> : <AlertTriangle size={12} className="text-amber-500" />}
                      {block.tipo === "barbero" ? block.barberoNombre : "Local Completo"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-stone-500 py-10 border-2 border-dashed border-white/5 rounded-2xl">
                <CalendarX2 size={40} opacity={0.2} className="mb-2" />
                <p className="text-sm">No hay fechas bloqueadas en esta sucursal.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL CREAR BLOQUEO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-stone-500 hover:text-stone-300">
              <X size={20} />
            </button>
            <div className="mb-6">
              <h2 className="text-2xl font-serif font-bold text-stone-100">Bloquear Agenda</h2>
              <p className="text-stone-500 text-sm mt-1">Cierra la sucursal <span className="text-amber-500 font-bold">{sucursales.find(s=>s.id === activeBranch)?.nombre}</span> o bloquea a un barbero.</p>
            </div>
            
            <form className="space-y-4" onSubmit={handleAddException}>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Motivo / Título</label>
                <input name="motivo" type="text" placeholder="Ej. Vacaciones, Día Festivo..." className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none" required />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Aplica a</label>
                <select 
                  value={blockType}
                  onChange={(e) => setBlockType(e.target.value as "local" | "barbero")}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none appearance-none"
                >
                  <option value="local">Todo el Local (Nadie puede agendar)</option>
                  <option value="barbero">Un Barbero Específico</option>
                </select>
              </div>

                {blockType === "barbero" && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Seleccionar Barbero</label>
                  <select name="barberoId" required className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none appearance-none">
                    {staffDeSucursal.length === 0 ? (
                      <option value="">No hay barberos en esta sucursal</option>
                    ) : (
                      // 👇 AQUÍ ESTÁ LA CORRECCIÓN: value={s.barberoId} 👇
                      staffDeSucursal.map(s => <option key={s.id} value={s.barberoId}>{s.barberoNombre}</option>)
                    )}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Fecha de Inicio</label>
                  <input name="fechaInicio" type="date" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-400 text-sm focus:border-amber-500/50 outline-none uppercase" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Fecha de Fin</label>
                  <input name="fechaFin" type="date" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-400 text-sm focus:border-amber-500/50 outline-none uppercase" required />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-6 border-t border-white/5">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-stone-400 hover:text-stone-200 font-medium text-sm">Cancelar</button>
                <button type="submit" disabled={blockType === "barbero" && staffDeSucursal.length === 0} className="bg-red-500 disabled:opacity-50 hover:bg-red-600 text-white font-bold px-6 py-2.5 rounded-xl transition-all text-sm shadow-lg">
                  Confirmar Bloqueo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}