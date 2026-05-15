"use client";

import { useEffect, useRef, useState } from "react";
import { 
  Scissors, Plus, Clock, DollarSign, MoreVertical, Edit2, Trash2, X, Save, MapPin, Lightbulb
} from "lucide-react";
import gsap from "gsap";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function ServiciosPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [servicios, setServicios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeBranch, setActiveBranch] = useState<string>("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedService, setSelectedService] = useState<any>(null);

  const loadSucursales = async () => {
    try {
      const res = await api.get('/Sucursales');
      setSucursales(res.data);
      if (res.data.length > 0) {
        setActiveBranch(res.data[0].id);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error cargando sucursales:", error);
      toast.error("Error al cargar tus sucursales.");
      setIsLoading(false);
    }
  };

  const loadServicios = async (sucursalId: string) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/Servicios/sucursal/${sucursalId}`);
      setServicios(res.data);
    } catch (error) {
      console.error("Error cargando servicios:", error);
      toast.error("Error al cargar los servicios de esta sucursal.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSucursales();
  }, []);

  useEffect(() => {
    if (activeBranch) {
      loadServicios(activeBranch);
    }
  }, [activeBranch]);

  useEffect(() => {
    if (!isLoading && servicios.length > 0) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".service-card", 
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: "power2.out" }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLoading, servicios]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    if (activeDropdown !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);

  const handleOpenAdd = () => {
    setModalMode("add");
    setSelectedService(null);
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  const handleOpenEdit = (service: any) => {
    setModalMode("edit");
    setSelectedService(service);
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      nombre: formData.get("nombre"),
      precio: parseFloat(formData.get("precio") as string),
      duracionMinutos: parseInt(formData.get("duracion") as string),
      estado: "Activo",
      sucursalId: activeBranch
    };
    try {
      if (modalMode === "add") {
        await api.post('/Servicios', payload);
        toast.success("Servicio creado exitosamente.");
      } else {
        await api.put(`/Servicios/${selectedService.id}`, payload);
        toast.success("Servicio actualizado correctamente.");
      }
      setIsModalOpen(false);
      loadServicios(activeBranch);
    } catch (error: any) {
      console.error("Error al guardar:", error);
      toast.error(error.response?.data?.mensaje || "Ocurrió un error al guardar el servicio.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este servicio?")) return;
    try {
      await api.delete(`/Servicios/${id}`);
      toast.success("Servicio eliminado.");
      loadServicios(activeBranch);
    } catch (error) {
      console.error("Error al eliminar:", error);
      toast.error("Error al eliminar el servicio.");
    } finally {
      setActiveDropdown(null);
    }
  };

  return (
    <div ref={containerRef} className="space-y-6 md:space-y-8 relative pb-20">
      
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-100 tracking-tight">
            Mis <span className="text-amber-500">Servicios</span>
          </h1>
          <p className="text-stone-500 mt-1 text-xs md:text-sm">
            Define los cortes, precios y duración para cada local.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative group w-full sm:w-auto">
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
                sucursales.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))
              )}
            </select>
          </div>

          <button 
            onClick={handleOpenAdd}
            disabled={sucursales.length === 0}
            className="bg-amber-500 disabled:opacity-50 hover:bg-amber-600 text-zinc-950 font-bold px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg w-full sm:w-auto"
          >
            <Plus size={18} />
            Nuevo Servicio
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 relative z-10" key={activeBranch}>
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : sucursales.length === 0 ? (
          <div className="col-span-full text-center py-12 text-stone-400 bg-zinc-900/40 rounded-3xl border border-white/5">
            Debes crear una sucursal primero para poder añadirle servicios.
          </div>
        ) : servicios.length === 0 ? (
          <div className="col-span-full text-center py-12 text-stone-400 bg-zinc-900/40 rounded-3xl border border-white/5">
            Esta sucursal aún no tiene servicios. ¡Crea el primero!
          </div>
        ) : (
          servicios.map((service) => (
            <div key={service.id} className="service-card opacity-0 bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-amber-500/30 transition-all flex flex-col relative group">
              
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                  <Scissors size={20} />
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${
                    service.estado === "Activo" ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-500/10 text-zinc-400"
                  }`}>
                    {service.estado || "Activo"}
                  </span>
                  
                  <div
                    ref={activeDropdown === service.id ? dropdownRef : null}
                    className="relative"
                  >
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(activeDropdown === service.id ? null : service.id);
                      }}
                      className="text-stone-500 hover:text-stone-200 p-1 bg-zinc-800/50 rounded-md transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {activeDropdown === service.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-zinc-800 border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                        <button 
                          onClick={() => handleOpenEdit(service)}
                          className="w-full text-left px-4 py-2 text-sm text-stone-300 hover:bg-zinc-700 flex items-center gap-2"
                        >
                          <Edit2 size={14} /> Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(service.id)}
                          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2"
                        >
                          <Trash2 size={14} /> Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-stone-100">{service.nombre}</h3>
              
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-stone-400">
                  <Clock size={16} className="text-amber-500" />
                  <span className="text-sm">{service.duracionMinutos} min</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 font-bold text-lg">
                  <DollarSign size={16} />
                  <span>{service.precio.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-stone-500 hover:text-stone-300">
              <X size={20} />
            </button>
            <div className="mb-6">
              <h2 className="text-2xl font-serif font-bold text-stone-100">
                {modalMode === "add" ? "Nuevo Servicio" : "Editar Servicio"}
              </h2>
              <p className="text-stone-500 text-sm mt-1">
                Agregando a <strong className="text-amber-500">
                  {sucursales.find(s => s.id === activeBranch)?.nombre}
                </strong>
              </p>
            </div>
            <form key={selectedService?.id || 'new'} className="space-y-4" onSubmit={handleSave}>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Nombre del Servicio</label>
                <input 
                  name="nombre"
                  defaultValue={selectedService?.nombre || ""}
                  type="text" 
                  placeholder="Ej. Barba VIP" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Precio ($)</label>
                  <input 
                    name="precio"
                    defaultValue={selectedService?.precio || ""}
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Duración (Minutos)</label>
                  <select 
                    name="duracion"
                    defaultValue={selectedService?.duracionMinutos || "30"}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none appearance-none cursor-pointer"
                  >
                    <option value="15">15 min</option>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">1 Hora</option>
                    <option value="90">1.5 Horas</option>
                    <option value="120">2 Horas</option>
                  </select>
                </div>
              </div>

              {/* 👇 AQUI ESTÁ EL TIP PROFESIONAL PARA EL BARBERO 👇 */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mt-2 flex gap-3 items-start">
                <Lightbulb className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-amber-500/90 leading-relaxed">
                  <strong className="text-amber-500 block mb-1">Tip Profesional:</strong>
                  Agrega <strong>10 o 15 minutos extra</strong> al tiempo real de tu servicio. Si dura 30 min, ponle 45 min. Esto te dará un margen de gracia por si el cliente llega tarde y evitará que tu agenda colapse.
                </p>
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-6 border-t border-white/5">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-stone-400 hover:text-stone-200 font-medium text-sm">Cancelar</button>
                <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm">
                  <Save size={16} /> Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}