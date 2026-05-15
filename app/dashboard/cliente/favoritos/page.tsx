"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, MapPin, Heart, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function FavoritosPage() {
  const router = useRouter();
  const [favoritos, setFavoritos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Cargar las barberías favoritas desde C#
  useEffect(() => {
    const fetchFavoritos = async () => {
      try {
        const res = await api.get('/Favoritos/mis-favoritos');
        setFavoritos(res.data);
      } catch (error) {
        console.error("Error cargando favoritos", error);
        toast.error("No pudimos cargar tus favoritos.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavoritos();
  }, []);

  // 2. Función para quitar de favoritos
  const handleToggleFavorito = async (sucursalId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que se dispare el click de la tarjeta que te lleva al perfil
    
    try {
      await api.post(`/Favoritos/${sucursalId}/toggle`);
      
      // Eliminamos visualmente la barbería de la lista al instante
      setFavoritos(prev => prev.filter(b => b.id !== sucursalId));
      toast.success("Eliminada de tus favoritos.");
      
    } catch (error) {
      toast.error("Hubo un error al actualizar tus favoritos.");
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-serif font-bold text-stone-100 flex items-center gap-3">
          <Star className="text-amber-500 fill-amber-500" /> Mis Favoritos
        </h1>
        <p className="text-stone-500 mt-1 text-sm">Las barberías que más te han gustado.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-amber-500" size={40} />
        </div>
      ) : favoritos.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/40 border border-white/5 rounded-3xl backdrop-blur-md">
          <p className="text-stone-500">Aún no tienes barberías favoritas.</p>
          <button 
            onClick={() => router.push('/dashboard/cliente')}
            className="mt-4 text-amber-500 hover:text-amber-400 font-bold text-sm"
          >
            Explorar barberías
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoritos.map((barberia) => (
            <div 
              key={barberia.id} 
              onClick={() => router.push(`/dashboard/cliente/barberia/${barberia.id}`)}
              className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all group cursor-pointer relative flex flex-col"
            >
              
              {/* Botón de Corazón Conectado al API */}
              <button 
                onClick={(e) => handleToggleFavorito(barberia.id, e)}
                title="Quitar de favoritos"
                className="absolute top-4 right-4 z-10 bg-zinc-950/80 backdrop-blur-md p-2 rounded-full border border-white/10 text-red-500 hover:text-stone-400 hover:scale-110 transition-all shadow-lg"
              >
                <Heart size={16} fill="currentColor" />
              </button>

              <div className="relative h-48 overflow-hidden shrink-0">
                <Image 
                  src={barberia.coverUrl || "/images/barbershop-hero.jpg"} 
                  alt={barberia.nombre} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
              </div>
              
              <div className="p-5 flex flex-col justify-between flex-1">
                <h3 className="text-lg font-bold text-stone-100 line-clamp-1">{barberia.nombre}</h3>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1 text-stone-500 text-xs">
                    <MapPin size={14} className="shrink-0" />
                    <span className="line-clamp-1">{barberia.direccion || "Cartagena, Colombia"}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-zinc-950/80 px-2 py-1 rounded-lg border border-white/5">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-stone-200">
                      {barberia.rating ? Number(barberia.rating).toFixed(1) : "5.0"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}