"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation"; 
import { CalendarHeart, Clock, Scissors, XCircle, Star, X, Loader2, MapPin } from "lucide-react"; 
import gsap from "gsap";
import { toast } from "sonner";
import { api } from "@/lib/api";

// 👇 Función mágica para convertir la hora (La dejamos por fuera para que no se recargue)
const formatHoraAmPm = (horaMilitar: string) => {
  if (!horaMilitar) return "";
  
  const [hours, minutes] = horaMilitar.split(':');
  let h = parseInt(hours, 10);
  
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; 
  
  const strHours = h.toString().padStart(2, '0');
  return `${strHours}:${minutes} ${ampm}`;
};

export default function MisCitasPage() {
  const router = useRouter(); 
  const [tab, setTab] = useState<"proximas" | "historial">("proximas");
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. ESTADOS REALES
  const [citasProximas, setCitasProximas] = useState<any[]>([]);
  const [citasHistorial, setCitasHistorial] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para el sistema de calificación
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [citaToRate, setCitaToRate] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comentario, setComentario] = useState("");

  // 2. FUNCIÓN PARA TRAER LOS DATOS DEL BACKEND
  const fetchMisCitas = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/Citas/cliente/mis-citas');
      
      const proximas: any[] = [];
      const historial: any[] = [];

      res.data.forEach((c: any) => {
        const soloFecha = c.fechaCita.split('T')[0]; 
        const fechaObj = new Date(`${soloFecha}T00:00:00`);
        const dateFormateada = fechaObj.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '');
        
        // 👇 AQUÍ APLICAMOS LA MAGIA (Ya no usamos el substring)
        const timeFormateada = formatHoraAmPm(c.horaCita);

        const citaMapeada = {
          id: c.id,
          sucursalId: c.sucursalId, 
          barberia: c.sucursalNombre || "Barbería Local",
          barbero: c.barberoNombre?.split(" ")[0] || "Tu Barbero",
          servicio: c.servicios ? c.servicios.join(" + ") : "Servicio",
          date: dateFormateada,
          time: timeFormateada,
          status: c.estado,
          image: "/images/barbershop-interior-1.jpg", 
          
          rated: c.puntuacion && c.puntuacion > 0 ? true : false,
          puntuacion: c.puntuacion || 0,
          comentario: c.comentario || "",
        };

        if (["Pendiente", "Aceptada", "En Curso"].includes(c.estado)) {
          proximas.push(citaMapeada);
        } else {
          historial.push(citaMapeada);
        }
      });

      setCitasProximas(proximas);
      setCitasHistorial(historial);

    } catch (error) {
      console.error("Error cargando mis citas:", error);
      toast.error("No se pudieron cargar tus citas.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMisCitas();
  }, [fetchMisCitas]);

  // 3. ANIMACIONES GSAP
  useEffect(() => {
    if (!isLoading) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".cita-card", 
          { opacity: 0, y: 20 }, 
          { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, ease: "power2.out" }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [tab, isLoading, citasProximas, citasHistorial]);

  useEffect(() => {
    if (ratingModalOpen) {
      gsap.fromTo(".rating-modal", 
        { opacity: 0, scale: 0.95 }, 
        { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.5)" }
      );
    }
  }, [ratingModalOpen]);

  const citas = tab === "proximas" ? citasProximas : citasHistorial;

  // 4. FUNCIÓN PARA CANCELAR CITA
  const handleCancelarCita = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas cancelar esta cita?")) return;
    
    try {
      await api.put(`/Citas/${id}/estado`, { estado: "Cancelada" });
      toast.success("Cita cancelada correctamente.");
      fetchMisCitas(); 
    } catch (error) {
      toast.error("Error al cancelar la cita.");
    }
  };

  const handleOpenRating = (cita: any) => {
    setCitaToRate(cita);
    setRating(0);
    setHoverRating(0);
    setComentario("");
    setRatingModalOpen(true);
  };

  const handleSubmitRating = async () => {
    try {
      await api.post(`/Citas/${citaToRate.id}/calificar`, {
        puntuacion: rating,
        comentario: comentario
      });

      toast.success("¡Gracias por tu feedback!", {
        description: `Has calificado a ${citaToRate.barbero} con ${rating} estrellas.`,
      });
      
      setRatingModalOpen(false);
      
      setCitasHistorial(prev => prev.map(c => 
        c.id === citaToRate.id ? { ...c, rated: true, puntuacion: rating, comentario: comentario } : c
      ));

      setTimeout(() => {
        setCitaToRate(null);
        setRating(0);
        setComentario("");
      }, 300);

    } catch (error) {
      console.error("Error al calificar", error);
      toast.error("Hubo un problema al guardar tu calificación.");
    }
  };

  return (
    <div ref={containerRef} className="space-y-8 pb-20 relative">
      <div>
        <h1 className="text-3xl font-serif font-bold text-stone-100 flex items-center gap-3">
          <CalendarHeart className="text-amber-500" /> Mis Citas
        </h1>
        <p className="text-stone-500 mt-1 text-sm">Gestiona tus reservas y revisa tu historial.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-zinc-900/50 p-1.5 rounded-xl w-fit border border-white/5">
        <button 
          onClick={() => setTab("proximas")}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === "proximas" ? "bg-zinc-800 text-stone-100 shadow-md" : "text-stone-500 hover:text-stone-300"}`}
        >
          Próximas
        </button>
        <button 
          onClick={() => setTab("historial")}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === "historial" ? "bg-zinc-800 text-stone-100 shadow-md" : "text-stone-500 hover:text-stone-300"}`}
        >
          Historial
        </button>
      </div>

      {/* Lista de Citas */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-amber-500" size={40} />
          </div>
        ) : citas.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/40 border border-white/5 rounded-3xl backdrop-blur-md">
            <p className="text-stone-500">No tienes citas en esta sección.</p>
          </div>
        ) : (
          citas.map(cita => (
            <div key={cita.id} className="cita-card opacity-0 bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-amber-500/20 transition-colors">
              
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className="w-20 h-20 rounded-xl overflow-hidden relative shrink-0 border border-white/10">
                  <Image src={cita.image} alt={cita.barberia} fill className="object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      cita.status === "Confirmada" || cita.status === "Aceptada" ? "bg-emerald-500/10 text-emerald-500" :
                      cita.status === "En Curso" ? "bg-amber-500/10 text-amber-500 animate-pulse" :
                      cita.status === "Completada" ? "bg-blue-500/10 text-blue-500" :
                      "bg-red-500/10 text-red-500"
                    }`}>
                      {cita.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-stone-100 text-lg line-clamp-1">{cita.barberia}</h3>
                  <p className="text-stone-400 text-sm flex items-center gap-1 mt-0.5 line-clamp-1"><Scissors size={14} className="shrink-0"/> {cita.servicio} con {cita.barbero}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-center gap-4 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                <div className="flex md:flex-col gap-4 md:gap-1 text-sm mr-auto md:mr-4">
                  <div className="flex items-center gap-2 text-stone-300"><CalendarHeart size={16} className="text-amber-500"/> <span className="capitalize">{cita.date}</span></div>
                  <div className="flex items-center gap-2 text-stone-300"><Clock size={16} className="text-amber-500"/> {cita.time}</div>
                </div>

                {tab === "proximas" ? (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => router.push(`/dashboard/cliente/barberia/${cita.sucursalId}`)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-stone-200 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <MapPin size={16}/> Ver Barbería
                    </button>
                    
                    <button 
                      onClick={() => handleCancelarCita(cita.id)}
                      title="Cancelar Cita"
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle size={16}/>
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-4 w-full sm:w-auto items-center">
                    {cita.status === "Completada" && !cita.rated && (
                      <button 
                        onClick={() => handleOpenRating(cita)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-500 border border-amber-500/20 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        <Star size={16} /> Calificar
                      </button>
                    )}
                    
                    {cita.status === "Completada" && cita.rated && (
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1 bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-white/5 shadow-inner">
                          <span className="text-[10px] font-bold text-stone-500 mr-1 uppercase">Tú:</span>
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star 
                              key={s} 
                              size={12} 
                              className={s <= cita.puntuacion ? "text-amber-500 fill-amber-500" : "text-zinc-700 fill-zinc-800"} 
                            />
                          ))}
                        </div>
                        {cita.comentario && (
                          <p className="text-[10px] text-stone-400 italic line-clamp-1 max-w-[150px]">
                            "{cita.comentario}"
                          </p>
                        )}
                      </div>
                    )}

                    <button 
                      onClick={() => router.push(`/dashboard/cliente/barberia/${cita.sucursalId}`)}
                      className="flex-1 sm:flex-none px-6 py-2 bg-amber-600 hover:bg-amber-500 text-zinc-950 rounded-lg text-sm font-bold transition-colors"
                    >
                      Volver a agendar
                    </button>
                  </div>
                )}
              </div>

            </div>
          ))
        )}
      </div>

      {/* --- MODAL DE CALIFICACIÓN --- */}
      {ratingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" 
            onClick={() => setRatingModalOpen(false)} 
          />
          
          <div className="rating-modal bg-zinc-900 border border-white/10 p-6 md:p-8 rounded-3xl w-full max-w-sm relative z-10 shadow-2xl flex flex-col items-center text-center">
            
            <button 
              onClick={() => setRatingModalOpen(false)}
              className="absolute top-4 right-4 text-stone-500 hover:text-stone-300 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4 border border-amber-500/20">
              <Star size={32} className="text-amber-500 fill-amber-500" />
            </div>

            <h3 className="text-xl font-serif font-bold text-stone-100 mb-1">Califica el Servicio</h3>
            <p className="text-stone-400 text-sm mb-6 text-balance">
              ¿Qué tal te pareció tu corte con <span className="font-bold text-stone-200">{citaToRate?.barbero}</span>?
            </p>
            
            <div className="flex gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(star => (
                 <button 
                   key={star}
                   type="button"
                   onMouseEnter={() => setHoverRating(star)}
                   onMouseLeave={() => setHoverRating(0)}
                   onClick={() => setRating(star)}
                   className="hover:scale-110 transition-transform focus:outline-none"
                 >
                   <Star 
                     size={36} 
                     className={`transition-colors duration-200 ${
                       star <= (hoverRating || rating) 
                       ? "text-amber-500 fill-amber-500" 
                       : "text-zinc-700 fill-zinc-800"
                     }`} 
                   />
                 </button>
              ))}
            </div>

            <textarea 
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Escribe una breve reseña (opcional)..."
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none resize-none h-24 mb-6 placeholder:text-stone-600"
            />

            <button 
              disabled={rating === 0}
              onClick={handleSubmitRating}
              className="w-full bg-amber-600 disabled:bg-zinc-800 disabled:text-zinc-600 hover:bg-amber-500 text-zinc-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-amber-900/20 active:scale-95 uppercase tracking-widest text-xs"
            >
              Enviar Calificación
            </button>
          </div>
        </div>
      )}
    </div>
  );
}