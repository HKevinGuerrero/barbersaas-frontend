"use client";

import { useState, useEffect } from "react";
import { X, UserPlus, Scissors, CheckCircle2, UserCheck, Store, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function WalkInModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [clientName, setClientName] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedBarber, setSelectedBarber] = useState("");
  const [selectedSucursal, setSelectedSucursal] = useState("");

  // Estados de datos reales
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [barberos, setBarberos] = useState<any[]>([]);
  const [servicios, setServicios] = useState<any[]>([]);
  const [isLoadingDatos, setIsLoadingDatos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Cargar las sucursales al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setIsLoadingDatos(true);
        try {
          const resSucursales = await api.get('/Sucursales');
          setSucursales(resSucursales.data);
        } catch (error) {
          console.error("Error al cargar sucursales:", error);
          toast.error("Error al conectar con la base de datos.");
        } finally {
          setIsLoadingDatos(false);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  // 2. Cargar barberos y servicios cuando se selecciona una sucursal
  useEffect(() => {
    if (selectedSucursal) {
      const fetchDetallesSucursal = async () => {
        try {
          // Traemos el staff de la sucursal seleccionada
          const resStaff = await api.get(`/Staff/sucursal/${selectedSucursal}`);
          setBarberos(resStaff.data);

          // Traemos los servicios específicos de esta sucursal (Ruta corregida api/Servicios/sucursal/id)
          const resServicios = await api.get(`/Servicios/sucursal/${selectedSucursal}`);
          setServicios(resServicios.data);
          
        } catch (error) {
          console.error("Error cargando detalles de la sucursal:", error);
          toast.error("No se pudieron cargar los servicios de esta sede.");
        }
      };
      
      fetchDetallesSucursal();
      
      // Limpiamos selecciones previas al cambiar de sucursal
      setSelectedBarber("");
      setSelectedServices([]); 
    }
  }, [selectedSucursal]);

  const toggleService = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
  };

const handleConfirm = async () => {
    if (!clientName || selectedServices.length === 0 || !selectedBarber || !selectedSucursal) {
      toast.error("Datos incompletos", { 
        description: "Nombre, sucursal, al menos un servicio y barbero son obligatorios." 
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date();
      
      // Formato HH:mm:ss requerido para que C# lo asigne a un TimeSpan
      const horaActual = now.getHours().toString().padStart(2, '0') + ":" + 
                         now.getMinutes().toString().padStart(2, '0') + ":" + 
                         now.getSeconds().toString().padStart(2, '0');

      // CORRECCIÓN ZONA HORARIA: Extraemos tu fecha local exacta
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const fechaLocalStr = `${year}-${month}-${day}T00:00:00`; // Garantiza 2026-05-01

      const nuevaCita = {
        sucursalId: selectedSucursal,
        barberoId: selectedBarber,
        tipoReserva: "WalkIn",
        nombreClienteInvitado: clientName,
        clienteId: null,
        fechaCita: fechaLocalStr, 
        horaCita: horaActual, 
        serviciosIds: selectedServices
      };

      await api.post('/Citas/agendar', nuevaCita);

      toast.success("Turno presencial registrado", {
        description: `${clientName} ha sido agregado a la agenda.`
      });
      
      setClientName("");
      setSelectedServices([]);
      setSelectedBarber("");
      setSelectedSucursal("");
      onClose();

    } catch (error: any) {
      console.error("Error al crear Walk-in:", error);
      const mensajeError = error.response?.data?.mensaje || "Hubo un problema al registrar el turno.";
      toast.error("Error", { description: mensajeError });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md">
      <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        <button onClick={onClose} className="absolute top-6 right-6 text-stone-500 hover:text-stone-200 transition-colors">
          <X size={20} />
        </button>

        <div className="mb-6">
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4 border border-amber-500/20">
            <UserPlus size={24} className="text-amber-500" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-100 italic">Cita Rápida (Walk-in)</h2>
          <p className="text-stone-500 text-xs mt-1">Registra servicios inmediatos en el local.</p>
        </div>

        {isLoadingDatos ? (
          <div className="flex justify-center items-center py-10">
             <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Nombre del Cliente</label>
              <input 
                type="text" 
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej. Juan Pérez" 
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Sucursal</label>
              <div className="relative">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={16} />
                <select 
                  value={selectedSucursal}
                  onChange={(e) => setSelectedSucursal(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none appearance-none"
                >
                  <option value="" disabled>Selecciona la sede</option>
                  {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Asignar Barbero</label>
              <div className="relative">
                <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={16} />
                <select 
                  value={selectedBarber}
                  onChange={(e) => setSelectedBarber(e.target.value)}
                  disabled={!selectedSucursal || barberos.length === 0}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none appearance-none disabled:opacity-30"
                >
                  <option value="" disabled>
                    {selectedSucursal ? (barberos.length > 0 ? "Selecciona un profesional" : "No hay barberos asignados") : "Selecciona una sucursal primero"}
                  </option>
                  {barberos.map(b => <option key={b.barberoId} value={b.barberoId}>{b.barberoNombre}</option>)}
                </select>
              </div>
            </div>

            {selectedSucursal && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Servicios</label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {servicios.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleService(s.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        selectedServices.includes(s.id) 
                        ? "bg-amber-500/10 border-amber-500 text-amber-500" 
                        : "bg-black/20 border-white/5 text-stone-400 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Scissors size={14} className={selectedServices.includes(s.id) ? "text-amber-500" : "text-stone-600"} />
                        <span className="text-xs font-bold text-left">{s.nombre}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] opacity-60">{formatMoney(s.precio)}</span>
                        {selectedServices.includes(s.id) && <Check size={14} />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="w-full bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-600 text-zinc-950 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 mt-4 active:scale-95"
            >
              {isSubmitting ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
              {isSubmitting ? "Registrando..." : "Confirmar Registro"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}