"use client";

import { useEffect, useRef, useState } from "react";
import { 
  Plus, Search, MoreVertical, Scissors, Star, Mail, Phone, ShieldCheck, Trash2, X, Link as LinkIcon
} from "lucide-react";
import gsap from "gsap";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function StaffPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  // 👇 Ref para detectar clicks fuera del dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [staff, setStaff] = useState<any[]>([]);
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [vinculacionCode, setVinculacionCode] = useState("");
  const [selectedSucursal, setSelectedSucursal] = useState("");

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [staffRes, sucursalesRes] = await Promise.all([
        api.get('/Staff'),
        api.get('/Sucursales')
      ]);
      setStaff(staffRes.data);
      setSucursales(sucursalesRes.data);
      if (sucursalesRes.data.length > 0) {
        setSelectedSucursal(sucursalesRes.data[0].id);
      }
    } catch (error) {
      console.error("Error cargando el staff:", error);
      toast.error("Error al conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 👇 Cierra el dropdown al hacer click fuera — reemplaza el overlay
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

  useEffect(() => {
    if (!isLoading) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".staff-card", 
          { opacity: 0, scale: 0.95, y: 20 },
          { opacity: 1, scale: 1, y: 0, stagger: 0.1, duration: 0.6, ease: "back.out(1.2)" }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLoading, staff]);

  const handleVincularBarbero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (vinculacionCode.length < 5) {
      toast.error("Código inválido", { description: "Asegúrate de escribir el código completo." });
      return;
    }
    try {
      await api.post('/Staff/vincular', {
        codigoVinculacion: vinculacionCode,
        sucursalId: selectedSucursal
      });
      toast.success("¡Barbero Vinculado!", { 
        description: `El barbero se ha añadido a tu equipo exitosamente.` 
      });
      setIsInviteModalOpen(false);
      setVinculacionCode("");
      loadData();
    } catch (error: any) {
      console.error("Error al vincular:", error);
      const message = error.response?.data?.mensaje || error.response?.data || "El código no existe o ya expiró.";
      toast.error(message);
    }
  };

  const handleEliminarBarbero = async (staffId: string) => {
    if (!window.confirm("¿Estás seguro de que deseas desvincular a este barbero del local?")) return;
    try {
      await api.delete(`/Staff/${staffId}`);
      toast.success("Barbero eliminado del local exitosamente.");
      loadData();
    } catch (error: any) {
      console.error("Error al eliminar:", error);
      toast.error("Hubo un error al intentar eliminar al barbero.");
    } finally {
      setActiveDropdown(null);
    }
  };

  return (
    <div ref={containerRef} className="space-y-6 md:space-y-8 relative pb-20">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full md:w-[600px] h-[300px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-100 tracking-tight">
            Gestión de <span className="text-amber-500">Staff</span>
          </h1>
          <p className="text-stone-500 mt-1 text-xs md:text-sm">
            Administra los accesos y visualiza el rendimiento de tus barberos.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="relative group flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within:text-amber-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Buscar barbero..." 
              className="bg-zinc-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-stone-200 text-sm focus:outline-none focus:border-amber-500/50 transition-all w-full md:w-64"
            />
          </div>
          <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm whitespace-nowrap shadow-lg shadow-amber-500/10"
          >
            <Plus size={18} />
            <span>Vincular Barbero</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 relative z-10">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : staff.length === 0 ? (
          <div className="col-span-full text-center py-12 text-stone-400 bg-zinc-900/40 rounded-3xl border border-white/5">
            Aún no tienes barberos vinculados. ¡Pídeles su código de vinculación y añádelos a tu equipo!
          </div>
        ) : (
          staff.map((member) => (
            <div key={member.id} className="staff-card opacity-0 bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 md:p-6 hover:border-amber-500/30 transition-all flex flex-col relative">
              
              <div className="flex justify-between items-start w-full mb-4">
                <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${
                  member.estado === "Activo" ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                }`}>
                  {member.estado || "Activo"}
                </span>
                
                {/* 👇 ref asignado dinámicamente solo al dropdown activo */}
                <div
                  ref={activeDropdown === member.id ? dropdownRef : null}
                  className="relative z-20"
                >
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === member.id ? null : member.id);
                    }}
                    className="text-stone-500 hover:text-stone-200 p-1 bg-zinc-800/50 rounded-md transition-colors"
                  >
                    <MoreVertical size={16} />
                  </button>
                  
                  {activeDropdown === member.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-zinc-800 border border-white/10 rounded-xl shadow-2xl py-2 z-50 overflow-hidden">
                      <button 
                        onClick={() => handleEliminarBarbero(member.id)}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                      >
                        <Trash2 size={14} /> Eliminar del Local
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center text-center flex-1">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 border-2 border-zinc-800 flex items-center justify-center text-xl md:text-2xl font-bold text-stone-300 shadow-xl mb-3 md:mb-4 relative uppercase overflow-hidden">
                  {member.avatarUrl ? (
                    <img src={member.avatarUrl} alt={member.barberoNombre || "Barbero"} className="w-full h-full object-cover" />
                  ) : (
                    member.avatarInitials || "SC"
                  )}
                  {member.especialidad?.includes("Senior") && (
                    <div className="absolute -bottom-1 -right-1 bg-amber-500 text-zinc-950 p-1 rounded-full border-2 border-zinc-900">
                      <ShieldCheck size={10} className="md:w-3 md:h-3" />
                    </div>
                  )}
                </div>
                
                <h3 className="text-base md:text-lg font-bold text-stone-100">
                  {member.barberoNombre || "Barbero Sin Nombre"}
                </h3>
                <p className="text-stone-500 text-[10px] md:text-xs flex items-center gap-1 mt-1 font-medium">
                  <Scissors size={10} />
                  {member.especialidad || "Barbero"}
                </p>
                <p className="text-stone-600 text-[10px] flex items-center gap-1 mt-1">
                  📍 {member.sucursalNombre || "Sin sucursal asignada"}
                </p>
              </div>

              <div className="mt-4 md:mt-6 pt-4 border-t border-white/5 grid grid-cols-2 gap-2 md:gap-4">
                <div className="text-center">
                  <p className="text-[9px] md:text-[10px] text-stone-500 uppercase tracking-widest mb-1">Cortes (Mes)</p>
                  <p className="text-xs md:text-sm font-bold text-stone-200">{member.cortesMes || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] md:text-[10px] text-stone-500 uppercase tracking-widest mb-1">Rating</p>
                  <p className="text-xs md:text-sm font-bold text-amber-500 flex items-center justify-center gap-1">
                    {member.rating || "5.0"} <Star size={10} className="fill-amber-500" />
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-center gap-3">
                {member.correo && (
                  <a href={`mailto:${member.correo}`} className="w-10 h-10 rounded-full bg-zinc-800/50 hover:bg-amber-500 hover:text-zinc-950 text-stone-400 flex items-center justify-center transition-all">
                    <Mail size={16} />
                  </a>
                )}
                {member.telefono && (
                  <a href={`tel:${member.telefono}`} className="w-10 h-10 rounded-full bg-zinc-800/50 hover:bg-amber-500 hover:text-zinc-950 text-stone-400 flex items-center justify-center transition-all">
                    <Phone size={16} />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ❌ Se eliminó el overlay div.fixed.inset-0.z-10 */}

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute top-6 right-6 text-stone-500 hover:text-stone-300 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="mb-6">
              <h2 className="text-2xl font-serif font-bold text-stone-100">Vincular Barbero</h2>
              <p className="text-stone-500 text-sm mt-1 text-balance">
                Ingresa el código temporal de vinculación generado por el barbero desde su aplicación.
              </p>
            </div>
            <form className="space-y-5" onSubmit={handleVincularBarbero}>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Código de Vinculación</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={16} />
                  <input 
                    type="text" 
                    required
                    value={vinculacionCode}
                    onChange={(e) => setVinculacionCode(e.target.value)}
                    placeholder="Ej. 68904C" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none uppercase placeholder:normal-case font-mono tracking-widest" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Asignar a Sucursal</label>
                {sucursales.length === 0 ? (
                  <div className="text-sm text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    Debes crear una sucursal antes de vincular personal.
                  </div>
                ) : (
                  <select 
                    value={selectedSucursal}
                    onChange={(e) => setSelectedSucursal(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none appearance-none cursor-pointer"
                  >
                    {sucursales.map(s => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="pt-2 flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-stone-400 hover:text-stone-200 font-medium text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={!vinculacionCode || sucursales.length === 0}
                  className="bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-600 text-zinc-950 font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm shadow-lg"
                >
                  <ShieldCheck size={16} />
                  Vincular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}