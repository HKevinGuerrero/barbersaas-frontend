"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { 
  Users, Building2, DollarSign, CalendarCheck, 
  CheckCircle2, XCircle, Activity, RefreshCw, ShieldAlert, X
} from "lucide-react";
import gsap from "gsap";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function SuperAdminDashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [metrics, setMetrics] = useState<any>(null);
  const [pendingOwners, setPendingOwners] = useState<any[]>([]);
  const [pendingBranches, setPendingBranches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 👇 NUEVOS ESTADOS PARA EL MODAL DE RECHAZO
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [branchToReject, setBranchToReject] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");

  // --- OBTENER DATOS MAESTROS ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resMetrics, resOwners, resBranches] = await Promise.all([
        api.get('/SuperAdmin/metricas'),
        api.get('/SuperAdmin/solicitudes/duenos'),
        api.get('/SuperAdmin/solicitudes/sucursales')
      ]);

      setMetrics(resMetrics.data);
      setPendingOwners(resOwners.data);
      setPendingBranches(resBranches.data);
    } catch (error: any) {
      console.error("Error cargando panel admin:", error);
      if (error.response?.status === 403) {
        toast.error("Acceso Denegado. No eres SuperAdmin.");
      } else {
        toast.error("Error al conectar con la base de datos maestra.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- ANIMACIONES ---
  useEffect(() => {
    if (!isLoading && metrics) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".admin-card", 
          { opacity: 0, y: 20 }, 
          { opacity: 1, y: 0, stagger: 0.1, duration: 0.7, ease: "power3.out" }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLoading, metrics]);

  // --- ACCIONES SOBRE DUEÑOS ---
  const handleOwnerAction = async (id: string, action: 'aprobar' | 'rechazar') => {
    try {
      const res = await api.put(`/SuperAdmin/duenos/${id}/${action}`);
      toast.success(res.data.mensaje);
      setPendingOwners(prev => prev.filter(o => o.id !== id));
    } catch (error) {
      toast.error(`Error al intentar ${action} al dueño.`);
    }
  };

  // --- ACCIONES SOBRE SUCURSALES ---
  const approveBranch = async (id: string) => {
    try {
      const res = await api.put(`/SuperAdmin/sucursales/${id}/aprobar`);
      toast.success(res.data.mensaje);
      setPendingBranches(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      toast.error("Error al aprobar la sucursal.");
    }
  };

  // 1. Abre el modal y guarda qué sucursal estamos rechazando
  const openRejectModal = (branch: any) => {
    setBranchToReject(branch);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  // 2. Envía el rechazo con el texto escrito al Backend
  const submitRejectBranch = async () => {
    if (!rejectReason.trim()) {
      toast.error("Debes escribir un motivo de rechazo para el dueño.");
      return;
    }
    try {
      // Mandamos el motivo en el body de la petición
      const res = await api.put(`/SuperAdmin/sucursales/${branchToReject.id}/rechazar`, { motivo: rejectReason });
      toast.success(res.data.mensaje);
      setPendingBranches(prev => prev.filter(s => s.id !== branchToReject.id));
      setIsRejectModalOpen(false); // Cerramos el modal
    } catch (error) {
      toast.error("Error al rechazar la sucursal.");
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div ref={containerRef} className="space-y-8 relative pb-20 max-w-7xl mx-auto">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10 bg-zinc-900/40 p-6 rounded-3xl border border-red-500/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert size={12} /> Acceso Restringido
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-100 tracking-tight">
            Modo <span className="text-red-500">SuperAdmin</span>
          </h1>
          <p className="text-stone-400 mt-1 text-sm">
            Control maestro de la plataforma BarberSaaS.
          </p>
        </div>
        
        <button 
          onClick={fetchData} 
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-stone-200 px-4 py-2.5 rounded-xl transition-all text-sm border border-white/5"
          disabled={isLoading}
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Actualizar Datos
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 relative z-10">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-8 relative z-10">
          
          {/* MÉTRICAS GLOBALES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="admin-card opacity-0 bg-zinc-900/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl">
              <div className="p-3 w-max rounded-xl bg-blue-500/10 text-blue-500 mb-4">
                <Users size={24} />
              </div>
              <h3 className="text-stone-500 text-[10px] font-bold uppercase tracking-widest">Dueños Registrados</h3>
              <p className="text-3xl font-bold text-stone-100 mt-1">{metrics?.totalDuenos || 0}</p>
            </div>
            
            <div className="admin-card opacity-0 bg-zinc-900/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl">
              <div className="p-3 w-max rounded-xl bg-purple-500/10 text-purple-500 mb-4">
                <Building2 size={24} />
              </div>
              <h3 className="text-stone-500 text-[10px] font-bold uppercase tracking-widest">Sucursales Activas</h3>
              <p className="text-3xl font-bold text-stone-100 mt-1">{metrics?.sucursalesActivas || 0}</p>
            </div>

            <div className="admin-card opacity-0 bg-zinc-900/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl">
              <div className="p-3 w-max rounded-xl bg-emerald-500/10 text-emerald-500 mb-4">
                <DollarSign size={24} />
              </div>
              <h3 className="text-stone-500 text-[10px] font-bold uppercase tracking-widest">Volumen Transaccional</h3>
              <p className="text-2xl font-bold text-emerald-500 mt-1">{formatMoney(metrics?.ingresosGenerados || 0)}</p>
            </div>

            <div className="admin-card opacity-0 bg-zinc-900/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl">
              <div className="p-3 w-max rounded-xl bg-amber-500/10 text-amber-500 mb-4">
                <CalendarCheck size={24} />
              </div>
              <h3 className="text-stone-500 text-[10px] font-bold uppercase tracking-widest">Citas en la Plataforma</h3>
              <p className="text-3xl font-bold text-stone-100 mt-1">{metrics?.citasCompletadas || 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* SOLICITUDES DE DUEÑOS */}
            <div className="admin-card opacity-0 bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden flex flex-col h-[500px]">
              <div className="p-6 border-b border-white/5 bg-zinc-950/50 flex justify-between items-center">
                <h2 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
                  <Users className="text-amber-500" size={18} /> Solicitudes de Dueños
                </h2>
                <span className="bg-amber-500 text-zinc-950 font-bold text-xs px-2 py-1 rounded-full">
                  {pendingOwners.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {pendingOwners.length === 0 ? (
                  <p className="text-center text-stone-500 text-sm py-10 italic">No hay dueños pendientes de aprobación.</p>
                ) : (
                  pendingOwners.map(owner => (
                    <div key={owner.id} className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-stone-200">{owner.nombre} {owner.apellido}</h4>
                        <p className="text-xs text-stone-400 mt-1">{owner.correo}</p>
                        <p className="text-xs text-stone-500 mt-1">
                          Tel: {owner.telefono && owner.telefono.trim() !== "" ? owner.telefono : "No registrado"}
                        </p>                      
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={() => handleOwnerAction(owner.id, 'aprobar')}
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 p-2 rounded-xl transition-colors" title="Aprobar"
                        >
                          <CheckCircle2 size={20} />
                        </button>
                        <button 
                          onClick={() => handleOwnerAction(owner.id, 'rechazar')}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded-xl transition-colors" title="Rechazar"
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SOLICITUDES DE SUCURSALES */}
            <div className="admin-card opacity-0 bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden flex flex-col h-[500px]">
              <div className="p-6 border-b border-white/5 bg-zinc-950/50 flex justify-between items-center">
                <h2 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
                  <Building2 className="text-emerald-500" size={18} /> Sucursales Pendientes
                </h2>
                <span className="bg-emerald-500 text-zinc-950 font-bold text-xs px-2 py-1 rounded-full">
                  {pendingBranches.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {pendingBranches.length === 0 ? (
                  <p className="text-center text-stone-500 text-sm py-10 italic">No hay sucursales pendientes de revisión.</p>
                ) : (
                  pendingBranches.map(branch => (
                    <div key={branch.id} className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-stone-200">{branch.nombre}</h4>
                        <p className="text-xs text-stone-400 mt-1">{branch.direccion}</p>
                        <p className="text-[10px] text-stone-500 uppercase tracking-wider mt-2 border border-white/10 w-max px-2 py-0.5 rounded-md">
                          Dueño: {branch.dueno}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {/* 👇 APROBAR DIRECTO */}
                        <button 
                          onClick={() => approveBranch(branch.id)}
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 p-2 rounded-xl transition-colors" title="Aprobar Local"
                        >
                          <CheckCircle2 size={20} />
                        </button>
                        {/* 👇 ABRIR MODAL PARA RECHAZAR */}
                        <button 
                          onClick={() => openRejectModal(branch)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded-xl transition-colors" title="Rechazar Local"
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 🚨 EL NUEVO MODAL PARA ESCRIBIR EL FEEDBACK AL DUEÑO */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-red-500/20 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            
            <button 
              onClick={() => setIsRejectModalOpen(false)} 
              className="absolute top-4 right-4 text-stone-500 hover:text-white"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-bold text-stone-100 mb-2">Rechazar Sucursal</h2>
            <p className="text-stone-400 text-sm mb-4">
              Escribe el motivo del rechazo para que el dueño <strong className="text-white">({branchToReject?.dueno})</strong> pueda corregirlo en el local <strong className="text-white">({branchToReject?.nombre})</strong>.
            </p>
            
            <textarea 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ej: El NIT proporcionado no es válido, por favor corrige la información."
              rows={4}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-200 text-sm focus:border-red-500/50 outline-none resize-none mb-4"
            />
            
            <button 
              onClick={submitRejectBranch}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all text-sm shadow-lg shadow-red-500/20"
            >
              Enviar Feedback y Rechazar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}