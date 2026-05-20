"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Star,
  MapPin,
  Phone,
  Scissors,
  CalendarPlus,
  Clock,
  X,
  Check,
  CalendarDays,
  Heart,
  User,
  Loader2,
} from "lucide-react";
import gsap from "gsap";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function BarberiaProfilePage() {
  const router = useRouter();
  const params = useParams();
  const sucursalId = params.id;

  const containerRef = useRef<HTMLDivElement>(null);

  // ── Estados reales de la base de datos ──────────────────────────────────────
  const [sucursal, setSucursal] = useState<any>(null);
  const [servicios, setServicios] = useState<any[]>([]);
  const [barberos, setBarberos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFavorite, setIsFavorite] = useState(false);

  // ── Estados del modal de agendamiento ───────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBarbero, setSelectedBarbero] = useState<any>(null);
  const [selectedServices, setSelectedServices] = useState<any[]>([]); 
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  // ── Estados para horas disponibles dinámicas ────────────────────────────────
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [isLoadingHoras, setIsLoadingHoras] = useState(false);

  // ── Helper: Agregar/Quitar servicios del carrito ────────────────────────────
  const handleToggleService = (servicio: any) => {
    setSelectedServices((prev) => {
      const yaEstaSeleccionado = prev.some((s) => s.id === servicio.id);
      if (yaEstaSeleccionado) {
        return prev.filter((s) => s.id !== servicio.id); 
      } else {
        return [...prev, servicio]; 
      }
    });
  };

  const getTodayLocalString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // ── 1. Carga de datos de la sucursal ────────────────────────────────────────
  useEffect(() => {
    if (!sucursalId) return;

    const fetchBarberiaData = async () => {
      setIsLoading(true);
      try {
        const [resSucursal, resStaff, resServicios, resFavoritos] = await Promise.all([
          api.get(`/Sucursales/${sucursalId}`),
          api.get(`/Staff/sucursal/${sucursalId}`),
          api.get(`/Servicios/sucursal/${sucursalId}`).catch(() => ({ data: [] })),
          api.get(`/Favoritos/mis-favoritos/ids`).catch(() => ({ data: [] })),
        ]);

        setSucursal(resSucursal.data);
        setBarberos(resStaff.data);
        setServicios(resServicios.data);

        if (resFavoritos.data && resFavoritos.data.includes(sucursalId)) {
          setIsFavorite(true);
        }
      } catch (error) {
        console.error("Error al cargar la barbería:", error);
        toast.error("Esta barbería no está disponible o aún no ha sido aprobada.");
        // 🛡️ Redirección automática si intentan colarse por URL directa
        setTimeout(() => {
          router.push("/dashboard/cliente");
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBarberiaData();
  }, [sucursalId, router]);

  // ── 2. Consulta dinámica de horas libres ────────────────────────────────────
  useEffect(() => {
    const fetchHoras = async () => {
      if (!selectedDate || selectedServices.length === 0 || !selectedBarbero) return;

      setIsLoadingHoras(true);
      setSelectedTime("");

      try {
        const res = await api.get(`/Citas/disponibilidad`, {
          params: {
            sucursalId: sucursal.id,
            barberoId: selectedBarbero.barberoId,
            fecha: selectedDate,
            serviciosIds: selectedServices.map((s) => s.id).join(","),
          },
        });
        setHorariosDisponibles(res.data);
      } catch (error) {
        toast.error("Error al consultar disponibilidad.");
        setHorariosDisponibles([]);
      } finally {
        setIsLoadingHoras(false);
      }
    };

    fetchHoras();
  }, [selectedDate, selectedServices, selectedBarbero, sucursal]); 

  // ── Animaciones GSAP ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoading && sucursal) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".fade-up",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: "power2.out" }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLoading, sucursal]);

  useEffect(() => {
    if (isModalOpen) {
      gsap.to(".modal-overlay", { opacity: 1, duration: 0.3, display: "block" });
      gsap.to(".modal-panel", { x: 0, duration: 0.4, ease: "power3.out" });
    } else {
      gsap.to(".modal-panel", { x: "100%", duration: 0.3, ease: "power3.in" });
      gsap.to(".modal-overlay", {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          gsap.set(".modal-overlay", { display: "none" });
        },
      });
    }
  }, [isModalOpen]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleOpenModal = (barbero: any) => {
    setSelectedBarbero(barbero);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedServices([]); 
      setSelectedDate("");
      setSelectedTime("");
      setHorariosDisponibles([]);
    }, 300);
  };

  const formatTimeParaBackend = (time12h: string) => {
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":");
    if (hours === "12") hours = "00";
    if (modifier === "PM") hours = (parseInt(hours, 10) + 12).toString();
    return `${hours.padStart(2, "0")}:${minutes}:00`;
  };

  // ── 3. Función para agendar ───────────────────────────────────────
  const handleAgendar = async () => {
    try {
      const citaPayload = {
        sucursalId: sucursal.id,
        barberoId: selectedBarbero.barberoId,
        fechaCita: selectedDate,
        horaCita: formatTimeParaBackend(selectedTime),
        serviciosIds: selectedServices.map((s) => s.id), 
      };

      await api.post("/Citas/agendar", citaPayload);

      toast.success("¡Turno agendado exitosamente!", {
        description: `Te esperamos el ${selectedDate} a las ${selectedTime}.`,
      });

      handleCloseModal();

      setTimeout(() => {
        router.push("/dashboard/cliente");
      }, 1500);
    } catch (error: any) {
      console.error("Error al agendar:", error);
      const mensaje =
        error.response?.data?.mensaje ||
        "Error al agendar la cita. Intenta en otro horario.";
      toast.error(mensaje);
    }
  };

  const handleToggleFavorite = async () => {
    setIsFavorite(!isFavorite);
    try {
      const res = await api.post(`/Favoritos/${sucursalId}/toggle`);
      if (res.data.isFavorito) {
        toast.success("Añadida a tus favoritos 💖");
      } else {
        toast.success("Eliminada de favoritos 💔");
      }
    } catch (error) {
      setIsFavorite(isFavorite);
      toast.error("Error al actualizar favoritos.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-amber-500">
        Cargando barbería...
      </div>
    );
  }

  if (!sucursal) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-500">
        Barbería no encontrada o no disponible
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-8 relative pb-24 min-h-screen">
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-20 bg-zinc-950/50 backdrop-blur-md p-2 rounded-full text-stone-300 hover:text-amber-500 hover:bg-zinc-900 border border-white/10 transition-all"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={handleToggleFavorite}
        className="absolute top-4 right-4 z-20 bg-zinc-950/50 backdrop-blur-md p-2 rounded-full border border-white/10 hover:scale-110 transition-transform shadow-lg"
      >
        <Heart
          size={20}
          className={`transition-colors duration-300 ${
            isFavorite ? "text-red-500 fill-red-500" : "text-stone-300"
          }`}
        />
      </button>

      {/* ── Hero Banner ── */}
      <div className="relative h-64 md:h-80 w-full rounded-b-[40px] md:rounded-[40px] overflow-hidden fade-up">
        <Image
          src={sucursal.coverUrl || "/images/barbershop-interior-1.jpg"}
          alt="Portada Barbería"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

        <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 flex items-end gap-6">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-zinc-950 relative shadow-2xl bg-zinc-900 flex items-center justify-center">
            <Image
              src={sucursal.logoUrl || "/images/barbershop-hero.jpg"}
              alt="Logo"
              fill
              className="object-cover"
            />
          </div>
          <div className="pb-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-500 text-zinc-950 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                Verificada
              </span>
              <div className="flex items-center gap-1 bg-zinc-900/80 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
                <Star size={12} className="text-amber-500 fill-amber-500" />
                <span className="text-xs font-bold text-stone-200">
                  {sucursal.rating ? Number(sucursal.rating).toFixed(1) : "5.0"}
                </span>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-100">
              {sucursal.nombre}
            </h1>
            <p className="text-stone-400 text-sm mt-1 flex items-center gap-2">
              <MapPin size={14} className="shrink-0" />
              <span className="line-clamp-1">{sucursal.direccion}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-up">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-8">
            <h2 className="text-xl font-serif font-bold text-stone-100 mb-4">
              Acerca de nosotros
            </h2>
            <p className="text-stone-400 text-sm leading-relaxed">
              {sucursal.descripcion ||
                "La mejor experiencia de barbería clásica combinada con tendencias modernas. Relájate con una bebida de cortesía mientras nuestros expertos cuidan de tu imagen."}
            </p>
          </div>

          <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-8">
            <h2 className="text-xl font-serif font-bold text-stone-100 mb-6 flex items-center gap-2">
              <Scissors className="text-amber-500" size={20} /> Lista de Servicios
            </h2>
            <div className="space-y-3">
              {servicios.length > 0 ? (
                servicios.map((servicio) => (
                  <div
                    key={servicio.id}
                    className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl hover:border-amber-500/30 transition-colors"
                  >
                    <div>
                      <h3 className="font-bold text-stone-200">{servicio.nombre}</h3>
                      <p className="text-stone-500 text-xs flex items-center gap-1 mt-1">
                        <Clock size={12} /> {servicio.duracionMinutos} min
                      </p>
                    </div>
                    <span className="text-amber-500 font-bold">
                      ${servicio.precio.toLocaleString("es-CO")}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-stone-500 text-sm">
                  Esta sucursal aún no ha agregado servicios.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-serif font-bold text-stone-100 px-2">
            Nuestros Barberos
          </h2>
          {barberos.length > 0 ? (
            barberos.map((barbero) => (
              <div
                key={barbero.id}
                className="bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-5 hover:border-amber-500/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-amber-500/20 flex items-center justify-center font-serif text-xl font-bold text-amber-500 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors overflow-hidden relative">
                      {barbero.fotoUrl ? (
                        <Image
                          src={barbero.fotoUrl}
                          alt={barbero.barberoNombre}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        barbero.avatarInitials
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-stone-100 leading-tight truncate max-w-[140px]">
                        {barbero.barberoNombre}
                      </h3>
                      <p className="text-amber-500 text-xs font-medium">
                        {barbero.especialidad || "Barbero"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg shrink-0">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-amber-500">
                      {barbero.rating ? Number(barbero.rating).toFixed(1) : "5.0"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-6 bg-black/30 p-3 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2 text-stone-400 text-xs">
                    <Phone size={14} className="text-stone-500" />
                    <span className="truncate">
                      Contacto: <span className="text-stone-200">En mostrador</span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenModal(barbero)}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-amber-900/20"
                >
                  <CalendarPlus size={18} />
                  Agendar Turno
                </button>
              </div>
            ))
          ) : (
            <p className="text-stone-500 text-sm px-2">
              No hay barberos activos en esta sucursal.
            </p>
          )}
        </div>
      </div>

      <div
        className="modal-overlay fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-40 hidden"
        onClick={handleCloseModal}
      />

      <div className="modal-panel fixed top-0 right-0 h-full w-full max-w-md bg-zinc-950 border-l border-white/10 z-50 transform translate-x-full flex flex-col shadow-2xl">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-zinc-900/50">
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-100">
              Agendar Turno
            </h2>
            <p className="text-stone-400 text-xs mt-1 flex items-center gap-1">
              <User size={12} /> Con {selectedBarbero?.barberoNombre}
            </p>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-2 bg-black/50 rounded-full text-stone-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-stone-300 uppercase tracking-wider flex items-center gap-2">
              <span className="bg-amber-500 text-zinc-950 w-5 h-5 rounded-full flex items-center justify-center text-xs">
                1
              </span>
              Elige tus Servicios
            </h3>
            <div className="grid gap-3">
              {servicios.map((servicio) => {
                const isSelected = selectedServices.some((s) => s.id === servicio.id);

                return (
                  <button
                    key={servicio.id}
                    onClick={() => handleToggleService(servicio)}
                    className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500"
                        : "bg-zinc-900/40 border-white/5 hover:border-white/20"
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-stone-200 text-sm">
                        {servicio.nombre}
                      </h4>
                      <span className="text-stone-500 text-xs">
                        {servicio.duracionMinutos} min
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-amber-500">
                        ${servicio.precio.toLocaleString("es-CO")}
                      </span>
                      {isSelected && (
                        <Check size={18} className="text-amber-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={`space-y-4 transition-opacity duration-300 ${
              selectedServices.length === 0 ? "opacity-30 pointer-events-none" : "opacity-100"
            }`}
          >
            <h3 className="text-sm font-bold text-stone-300 uppercase tracking-wider flex items-center gap-2">
              <span className="bg-amber-500 text-zinc-950 w-5 h-5 rounded-full flex items-center justify-center text-xs">
                2
              </span>
              Fecha del Turno
            </h3>
            <div className="relative">
              <CalendarDays
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500"
                size={18}
              />
              <input
                type="date"
                min={getTodayLocalString()}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none"
                style={{ colorScheme: "dark" }}
              />
            </div>
          </div>

          <div
            className={`space-y-4 transition-opacity duration-300 ${
              !selectedDate ? "opacity-30 pointer-events-none" : "opacity-100"
            }`}
          >
            <h3 className="text-sm font-bold text-stone-300 uppercase tracking-wider flex items-center gap-2">
              <span className="bg-amber-500 text-zinc-950 w-5 h-5 rounded-full flex items-center justify-center text-xs">
                3
              </span>
              Horas Disponibles
            </h3>

            {isLoadingHoras ? (
              <div className="flex items-center justify-center py-6 text-amber-500">
                <Loader2 className="animate-spin" size={24} />
              </div>
            ) : horariosDisponibles.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {horariosDisponibles.map((hora) => (
                  <button
                    key={hora}
                    onClick={() => setSelectedTime(hora)}
                    className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                      selectedTime === hora
                        ? "bg-amber-500 text-zinc-950 border-amber-500 shadow-lg shadow-amber-500/20"
                        : "bg-zinc-900/50 text-stone-300 border-white/10 hover:border-amber-500/50"
                    }`}
                  >
                    {hora}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center bg-zinc-900/50 border border-white/10 rounded-xl p-4">
                <p className="text-stone-400 text-sm">
                  No hay horarios disponibles para esta fecha, no hay tiempo suficiente para los servicios seleccionados o el barbero esta de descanso.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-white/10 bg-zinc-950">
          <button
            disabled={selectedServices.length === 0 || !selectedDate || !selectedTime}
            onClick={handleAgendar}
            className="w-full bg-amber-600 disabled:bg-zinc-800 disabled:text-zinc-600 hover:bg-amber-500 text-zinc-950 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
          >
            Confirmar Reserva
          </button>
        </div>
      </div>
    </div>
  );
}