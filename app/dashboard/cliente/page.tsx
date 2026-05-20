"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Search, MapPin, Star, Clock, ArrowRight, Scissors, CalendarPlus, Phone, User, Loader2 } from "lucide-react";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api"; 
import { toast } from "sonner";

export default function DashboardClientePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Estados Principales
  const [nombreCliente, setNombreCliente] = useState<string>("Cliente");
  const [barberias, setBarberias] = useState<any[]>([]);
  const [barberos, setBarberos] = useState<any[]>([]); 
  const [proximaCita, setProximaCita] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🚀 ESTADOS PARA LA PAGINACIÓN 🚀
  const [pagina, setPagina] = useState(1);
  const [hayMasPaginas, setHayMasPaginas] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  // ── Helper para obtener la fecha local correcta ──
  const getTodayLocalString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (!token || !role || role.toLowerCase().trim() !== "cliente") {
        router.push("/login");
        return;
      }

      const nombre = localStorage.getItem("user_name") || "Cliente";
      setNombreCliente(nombre.split(" ")[0]); 

      // 1. Traer Barberías (PÁGINA 1, LÍMITE 6 para que se vea bien en grid)
      const resBarberias = await api.get('/Sucursales/todas?pagina=1&limite=6');
      
      setBarberias(resBarberias.data.data || []);
      // Evaluamos si el backend dice que hay más páginas
      setHayMasPaginas(resBarberias.data.paginaActual < resBarberias.data.totalPaginas);
      setPagina(1);

      // 2. Traer Barberos
      try {
        const resBarberos = await api.get('/Staff/todos');
        setBarberos(resBarberos.data || []);
      } catch (err) {
        console.error("No se pudieron cargar los barberos", err);
      }

      // 3. Traer Citas
      try {
        const resCitas = await api.get('/Citas/cliente/mis-citas');
        const todayStr = getTodayLocalString();
        
        const arregloCitas = Array.isArray(resCitas.data) ? resCitas.data : (resCitas.data.data || []);

        const citasFuturas = arregloCitas
          .filter((c: any) => 
            (c.estado === "Pendiente" || c.estado === "Aceptada" || c.estado === "En Curso") &&
            c.fechaCita.split('T')[0] >= todayStr
          )
          .sort((a: any, b: any) => {
            const dateA = new Date(`${a.fechaCita.split('T')[0]}T${a.horaCita}`).getTime();
            const dateB = new Date(`${b.fechaCita.split('T')[0]}T${b.horaCita}`).getTime();
            return dateA - dateB;
          });

        if (citasFuturas.length > 0) {
          setProximaCita(citasFuturas[0]);
        }
      } catch (citaError) {
        console.error("No se pudieron cargar las citas:", citaError);
      }

    } catch (error: any) {
      console.error("Error cargando dashboard:", error);
      toast.error("Hubo un problema al cargar los datos.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (!isLoading) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".anim-item", 
          { opacity: 0, y: 20 }, 
          { opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: "power3.out" }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLoading]);

  // 🚀 FUNCIÓN PARA CARGAR MÁS PÁGINAS 🚀
  const cargarMasBarberias = async () => {
    if (!hayMasPaginas || isLoadingMore) return;
    
    setIsLoadingMore(true);
    try {
      const siguientePagina = pagina + 1;
      const res = await api.get(`/Sucursales/todas?pagina=${siguientePagina}&limite=6`);
      
      const nuevasBarberias = res.data.data || [];
      
      // Acumulamos las nuevas barberías a las que ya teníamos
      setBarberias(prev => [...prev, ...nuevasBarberias]);
      setPagina(siguientePagina);
      setHayMasPaginas(res.data.paginaActual < res.data.totalPaginas);

    } catch (error) {
      toast.error("Error al cargar más barberías.");
    } finally {
      setIsLoadingMore(false);
    }
  };


  const getMesCorto = (fechaIso: string) => {
    return new Date(fechaIso).toLocaleDateString('es-CO', { month: 'short' }).substring(0, 3);
  };
  const getDia = (fechaIso: string) => {
    return new Date(fechaIso).getDate().toString().padStart(2, '0');
  };
  const formatHora = (horaFull: string) => {
    if (!horaFull) return "--:--";
    const [hours, minutes] = horaFull.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; 
    return `${h.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  // FILTROS EN TIEMPO REAL
  const searchLower = searchTerm.toLowerCase();
  
  const barberiasFiltradas = barberias.filter(b => 
    b.nombre?.toLowerCase().includes(searchLower) || 
    b.direccion?.toLowerCase().includes(searchLower)
  );

  const barberosFiltrados = barberos.filter(b => 
    b.nombre?.toLowerCase().includes(searchLower) ||
    b.sucursalNombre?.toLowerCase().includes(searchLower)
  );

  return (
    <div ref={containerRef} className="space-y-8 relative pb-20">
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Saludo y Buscador */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 anim-item">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-100 tracking-tight capitalize">
            Hola, <span className="text-amber-500">{nombreCliente}</span>
          </h1>
          <p className="text-stone-500 mt-1 text-sm">
            ¿Qué estilo buscas para hoy?
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
          <input 
            id="buscador-principal"
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar barberías o barberos..." 
            className="w-full bg-zinc-900/80 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Tarjeta de Próxima Cita (Oculta si el usuario está buscando algo) */}
      {!searchTerm && (
        <div className="anim-item relative bg-gradient-to-br from-zinc-900 to-zinc-950 border border-amber-500/20 rounded-3xl p-1 overflow-hidden group shadow-2xl">
          <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors" />
          <div className="relative bg-zinc-950/80 backdrop-blur-xl rounded-[22px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/5">
            
            {isLoading ? (
               <div className="w-full flex justify-center py-4">
                 <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
               </div>
            ) : proximaCita ? (
              <>
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs text-amber-500 font-bold uppercase tracking-widest">{getMesCorto(proximaCita.fechaCita)}</span>
                    <span className="text-2xl font-serif font-bold text-stone-100 leading-none mt-1">{getDia(proximaCita.fechaCita)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-md uppercase tracking-wider">Próxima Cita</span>
                      <span className="text-[9px] font-bold bg-zinc-800 text-stone-400 px-2 py-0.5 rounded-md uppercase tracking-widest">{proximaCita.estado}</span>
                    </div>
                    <h3 className="text-xl font-bold text-stone-100 line-clamp-1">{proximaCita.sucursalNombre || "Sucursal Local"}</h3>
                    <p className="text-stone-400 text-sm flex items-center gap-2 mt-1 line-clamp-1">
                      <Scissors size={14} className="shrink-0" /> 
                      {proximaCita.servicios?.join(" + ") || "Servicio"} con {proximaCita.barberoNombre?.split(" ")[0] || "Tu Barbero"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                  <div className="flex items-center gap-2 text-stone-300 bg-zinc-900 px-4 py-2 rounded-xl border border-white/5 w-full sm:w-auto justify-center">
                    <Clock size={16} className="text-amber-500" />
                    <span className="font-medium text-sm">{formatHora(proximaCita.horaCita)}</span>
                  </div>
                  <button 
                    onClick={() => router.push('/dashboard/cliente/citas')}
                    className="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold px-6 py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-amber-900/20 active:scale-95"
                  >
                    Ver Detalles
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
                <div className="flex items-center gap-4 text-stone-400">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center">
                    <CalendarPlus size={20} className="text-stone-500" />
                  </div>
                  <div>
                    <h3 className="text-stone-200 font-bold">Aún no tienes citas programadas</h3>
                    <p className="text-sm">Explora nuestras barberías y reserva tu estilo.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECCIÓN: BARBEROS */}
      {(searchTerm && barberosFiltrados.length > 0) && (
        <div className="anim-item pt-4">
          <h2 className="text-xl font-serif font-bold text-stone-100 mb-6 flex items-center gap-2">
            <User className="text-amber-500" size={24}/> Barberos Encontrados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {barberosFiltrados.map((barbero) => (
              <div key={barbero.id} 
              onClick={() => router.push(`/dashboard/cliente/barberia/${barbero.sucursalId}`)}
              className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 hover:border-amber-500/30 transition-all group cursor-pointer flex items-center gap-4">
                
                <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-amber-500/20 group-hover:border-amber-500/50 transition-colors flex items-center justify-center bg-zinc-800">
                  {barbero.fotoUrl ? (
                    <Image 
                      src={barbero.fotoUrl} 
                      alt={barbero.nombre} 
                      fill 
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-xl font-serif font-bold text-amber-500">
                      {barbero.initials}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 overflow-hidden">
                  <h3 className="text-lg font-bold text-stone-100 truncate">{barbero.nombre}</h3>
                  <div className="flex items-center gap-1 text-stone-500 text-xs mt-1 truncate">
                    <MapPin size={12} className="shrink-0 text-amber-500" />
                    <span className="truncate">{barbero.sucursalNombre}</span>
                  </div>
                  <div className="flex items-center gap-1 text-stone-400 text-xs mt-1">
                    <Phone size={12} className="shrink-0" />
                    <span>{barbero.telefono}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECCIÓN EXPLORAR BARBERÍAS */}
      <div className="anim-item pt-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif font-bold text-stone-100">
            {searchTerm ? "Barberías Encontradas" : "Explorar Barberías o Barberos"}
          </h2>
          
          {/* Botón Ver todas conectado a Cargar Más si hay páginas */}
          {!searchTerm && (
            <button 
              onClick={() => hayMasPaginas ? cargarMasBarberias() : null}
              className={`text-sm font-medium flex items-center gap-1 transition-colors ${hayMasPaginas ? 'text-amber-500 hover:text-amber-400' : 'text-stone-600 cursor-not-allowed'}`}
              disabled={!hayMasPaginas || isLoadingMore}
            >
              {isLoadingMore ? <Loader2 size={16} className="animate-spin" /> : "Ver más"} 
              <ArrowRight size={16} />
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : barberiasFiltradas.length === 0 ? (
          barberosFiltrados.length === 0 && (
            <div className="text-center py-20 text-stone-500 bg-zinc-900/40 rounded-3xl border border-white/5 backdrop-blur-md">
              <p>{searchTerm ? "No encontramos nada con esa búsqueda." : "No hay barberías registradas en este momento."}</p>
            </div>
          )
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {barberiasFiltradas.map((barberia) => (
                <div key={barberia.id} 
                onClick={() => router.push(`/dashboard/cliente/barberia/${barberia.id}`)}
                className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all group cursor-pointer flex flex-col h-full">
                  <div className="relative h-48 overflow-hidden shrink-0">
                    <Image 
                      src={barberia.imagenUrl || "/images/barbershop-hero.jpg"} 
                      alt={barberia.nombre} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                    <div className="absolute top-4 right-4 bg-zinc-950/80 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-stone-200">
                      {barberia.rating ? Number(barberia.rating).toFixed(1) : "5.0"}
                    </span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-stone-100 line-clamp-1">{barberia.nombre}</h3>
                      <div className="flex items-start gap-1 text-stone-500 text-xs mt-3">
                        <MapPin size={14} className="shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{barberia.direccion || "Cartagena, Colombia"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 👇 BOTÓN DE CARGAR MÁS AL FINAL DEL GRID 👇 */}
            {hayMasPaginas && !searchTerm && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={cargarMasBarberias}
                  disabled={isLoadingMore}
                  className="bg-zinc-900/80 hover:bg-amber-600 text-amber-500 hover:text-zinc-950 border border-amber-500/30 hover:border-amber-500 px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-3 text-sm shadow-lg"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Cargando...
                    </>
                  ) : (
                    "Cargar más barberías"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}