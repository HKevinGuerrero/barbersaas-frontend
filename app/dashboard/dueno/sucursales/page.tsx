"use client";

import { useEffect, useRef, useState } from "react";
import { 
  Building2, Plus, MapPin, Phone, Users, DollarSign, 
  MoreVertical, Edit2, PowerOff, X, Save, AlertTriangle, Upload,
  Info, RefreshCw
} from "lucide-react";
import gsap from "gsap";
import { api } from "@/lib/api"; 
import { toast } from "sonner"; 

export default function SucursalesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // --- Estados de la Base de Datos ---
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Estados para menús y modales ---
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);

  // 1. OBTENER SUCURSALES (GET)
  const fetchSucursales = async () => {
    try {
      const response = await api.get('/Sucursales');
      setSucursales(response.data);
    } catch (error) {
      console.error("Error cargando sucursales:", error);
      toast.error("Error al conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSucursales(); 
  }, []);

  // Animaciones GSAP
  useEffect(() => {
    if (!isLoading) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".branch-card", 
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, stagger: 0.15, duration: 0.7, ease: "power3.out" }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLoading, sucursales]); 

  // Controladores de modales
  const handleOpenAdd = () => {
    setModalMode("add");
    setSelectedBranch(null);
    setActiveDropdown(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (branch: any) => {
    setModalMode("edit");
    setSelectedBranch(branch);
    setActiveDropdown(null);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (branch: any) => {
    setSelectedBranch(branch);
    setActiveDropdown(null);
    setIsDeleteModalOpen(true);
  };

  // 2. CREAR O ACTUALIZAR SUCURSAL (POST / PUT)
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const data = {
      nombre: formData.get("nombre"),
      descripcion: formData.get("descripcion"), 
      direccion: formData.get("direccion"),
      telefono: formData.get("telefono"),
      nit: formData.get("nit"),
      estado: formData.get("estado"),
      coverUrl: "/images/barbershop-interior-1.jpg" 
    };

    try {
      if (modalMode === "add") {
        await api.post('/Sucursales', data);
        toast.success("¡Sucursal enviada para revisión del Administrador!");
      } else {
        await api.put(`/Sucursales/${selectedBranch.id}`, data);
        toast.success("Sucursal actualizada y enviada a revisión nuevamente.");
      }
      setIsModalOpen(false);
      fetchSucursales(); 
    } catch (error) {
      console.error("Error guardando:", error);
      toast.error("Ocurrió un error al guardar la sucursal.");
    }
  };

  // 3. ELIMINAR SUCURSAL (DELETE)
  const confirmDelete = async () => {
    if (!selectedBranch) return;
    try {
      await api.delete(`/Sucursales/${selectedBranch.id}`);
      toast.success("El local ha sido cerrado y eliminado.");
      setIsDeleteModalOpen(false);
      fetchSucursales(); 
    } catch (error) {
      console.error("Error eliminando:", error);
      toast.error("Error al intentar eliminar la sucursal.");
    }
  };

  return (
    <div ref={containerRef} className="space-y-6 md:space-y-8 relative pb-20">
      
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-100 tracking-tight">
            Mis <span className="text-amber-500">Sucursales</span>
          </h1>
          <p className="text-stone-500 mt-1 text-xs md:text-sm">
            Administra y envía a revisión los locales de tu negocio.
          </p>
        </div>
        
        <button 
          onClick={handleOpenAdd}
          className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-amber-500/10 w-full sm:w-auto"
        >
          <Plus size={18} />
          Añadir Sucursal
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 relative z-10">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : sucursales.length === 0 ? (
          <div className="col-span-full text-center py-12 text-stone-400">
            No tienes sucursales creadas aún. ¡Añade tu primer local!
          </div>
        ) : (
          sucursales.map((branch) => (
            <div key={branch.id} className={`branch-card opacity-0 bg-zinc-900/40 backdrop-blur-md border rounded-3xl overflow-visible transition-all flex flex-col sm:flex-row relative group ${branch.estadoAprobacion === "Rechazada" ? "border-red-500/30" : "border-white/5 hover:border-amber-500/30"}`}>
              
              <div className="sm:w-2/5 h-48 sm:h-auto relative bg-zinc-800 rounded-t-3xl sm:rounded-l-3xl sm:rounded-tr-none overflow-hidden shrink-0">
                <div className="absolute inset-0 flex items-center justify-center text-stone-600">
                  <Building2 size={40} opacity={0.5} />
                </div>
                <div 
                  className="absolute inset-0 bg-cover bg-center brightness-[0.6] group-hover:brightness-[0.8] transition-all duration-500"
                  style={{ backgroundImage: `url(${branch.coverUrl || '/images/barbershop-interior-1.jpg'})` }}
                />
                
                {/* 🏷️ ETIQUETAS DE APROBACIÓN */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {branch.estadoAprobacion === "Pendiente" && (
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-amber-500 text-zinc-950 shadow-lg flex items-center gap-1">
                      <RefreshCw size={12} className="animate-spin" /> En Revisión
                    </span>
                  )}
                  {branch.estadoAprobacion === "Rechazada" && (
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-red-500 text-white shadow-lg flex items-center gap-1">
                      <AlertTriangle size={12} /> Rechazada
                    </span>
                  )}
                  {branch.estadoAprobacion === "Aprobada" && (
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-zinc-950/80 border backdrop-blur-md ${branch.estado === "Operativa" ? "text-emerald-500 border-emerald-500/20" : "text-amber-500 border-amber-500/20"}`}>
                      {branch.estado}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-stone-100">{branch.nombre}</h3>
                    
                    <div className="relative z-20">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === branch.id ? null : branch.id);
                        }}
                        className="text-stone-500 hover:text-stone-200 p-1 bg-zinc-800/50 rounded-md transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>
                      
                      {activeDropdown === branch.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-30" 
                            onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }} 
                          />
                          
                          <div className="absolute right-0 mt-2 w-48 bg-zinc-800 border border-white/10 rounded-xl shadow-2xl py-2 z-40">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleOpenEdit(branch); }}
                              className="w-full text-left px-4 py-2 text-sm text-stone-300 hover:bg-zinc-700 flex items-center gap-2 transition-colors"
                            >
                              <Edit2 size={14} /> Editar / Corregir
                            </button>
                            <div className="h-px bg-white/10 my-1" />
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleOpenDelete(branch); }}
                              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                            >
                              <PowerOff size={14} /> Eliminar Local
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <p className="text-stone-400 text-sm flex items-center gap-2">
                      <MapPin size={14} className="text-amber-500" />
                      {branch.direccion}
                    </p>
                    <p className="text-stone-400 text-sm flex items-center gap-2">
                      <Phone size={14} className="text-amber-500" />
                      {branch.telefono || "Sin teléfono"}
                    </p>
                  </div>
                </div>

                {/* 🚨 MOSTRAR EL FEEDBACK DEL SUPERADMIN SI ESTÁ RECHAZADA */}
                {branch.estadoAprobacion === "Rechazada" && branch.mensajeRechazo ? (
                  <div className="mt-4 bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex gap-3 items-start">
                    <Info size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-1">Motivo de Rechazo:</p>
                      <p className="text-xs text-stone-300">{branch.mensajeRechazo}</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                    <div className="bg-zinc-950/50 p-3 rounded-xl border border-white/5">
                      <p className="text-[10px] text-stone-500 uppercase tracking-widest flex items-center gap-1 mb-1">
                        <Users size={10} /> Personal
                      </p>
                      <p className="text-lg font-bold text-stone-200">{branch.staffCount}</p>
                    </div>
                    <div className="bg-zinc-950/50 p-3 rounded-xl border border-white/5">
                      <p className="text-[10px] text-stone-500 uppercase tracking-widest flex items-center gap-1 mb-1">
                        <DollarSign size={10} /> Ingresos
                      </p>
                      <p className="text-lg font-bold text-emerald-500">{branch.revenue}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL 1: AÑADIR / EDITAR SUCURSAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative my-8">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-stone-500 hover:text-stone-300 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-serif font-bold text-stone-100">
                {modalMode === "add" ? "Nueva Sucursal" : "Editar Detalles"}
              </h2>
              <p className="text-stone-500 text-sm mt-1">
                {modalMode === "add" ? "Ingresa la información para revisión." : "Al guardar, la sucursal volverá a revisión."}
              </p>
            </div>

            <form key={selectedBranch?.id || 'new'} className="space-y-4" onSubmit={handleSave}>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Foto de la Sucursal</label>
                <div className="w-full bg-black/40 border border-dashed border-white/20 rounded-xl py-6 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-2 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors text-stone-400">
                    <Upload size={18} />
                  </div>
                  <span className="text-xs font-medium text-stone-300">Click para subir foto</span>
                  <span className="text-[10px] text-stone-500 mt-1">JPG, PNG o WEBP (Máx 2MB)</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Nombre de la Sucursal</label>
                <input 
                  type="text" 
                  name="nombre"
                  required
                  defaultValue={selectedBranch?.nombre || ""}
                  placeholder="Ej. BarberSaaS - Sur" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Acerca de nosotros (Opcional)</label>
                <textarea 
                  name="descripcion"
                  rows={3}
                  defaultValue={selectedBranch?.descripcion || ""}
                  placeholder="Cuéntale a tus clientes qué hace especial a tu barbería..." 
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none resize-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Teléfono</label>
                  <input 
                    type="tel" 
                    name="telefono"
                    defaultValue={selectedBranch?.telefono || ""}
                    placeholder="+57 300 000 0000" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">NIT / RUT</label>
                  <input 
                    type="text" 
                    name="nit"
                    defaultValue={selectedBranch?.nit || ""}
                    placeholder="900.000.000-1" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Dirección Completa</label>
                <input 
                  type="text" 
                  name="direccion"
                  required
                  defaultValue={selectedBranch?.direccion || ""}
                  placeholder="Ej. Calle Principal #123" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Estado</label>
                <select 
                  name="estado"
                  defaultValue={selectedBranch?.estado || "Operativa"}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none appearance-none cursor-pointer"
                >
                  <option value="Operativa">Operativa</option>
                  <option value="En Remodelación">En Remodelación</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-6 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-stone-400 hover:text-stone-200 font-medium text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm shadow-lg"
                >
                  <Save size={16} />
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRMAR CIERRE/ELIMINACIÓN */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-red-500/20 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative">
            
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 mx-auto">
              <AlertTriangle size={32} />
            </div>

            <h2 className="text-xl font-bold text-stone-100 mb-2 text-center">¿Estás seguro?</h2>
            <p className="text-stone-400 text-sm mb-8 text-center">
              Estás a punto de cerrar y eliminar el local <strong className="text-stone-200">{selectedBranch?.nombre}</strong>. Esta acción no se puede deshacer y desvinculará a los barberos asignados.
            </p>

            <div className="flex w-full gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-stone-200 font-bold py-3 rounded-xl transition-all text-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all text-sm shadow-lg shadow-red-500/20"
              >
                Sí, Cerrar Local
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}