"use client";

import { useState, useEffect } from "react";
import { UserCircle, Mail, Phone, Lock, Save, MapPin, CalendarDays, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function MiPerfilPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Estados para los datos del perfil
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    email: "", // Este será intocable
    fechaNacimiento: "",
    ciudad: ""
  });

  // 2. Traer la información actual del usuario desde C#
  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        // 👇 Asegúrate de tener este endpoint en tu C# que devuelva los datos del usuario logueado
const res = await api.get('/Auth/perfil');        
        setFormData({
          nombre: res.data.nombre || "",
          apellido: res.data.apellido || "",
          telefono: res.data.telefono || "",
          email: res.data.correo || "",
          // Limpiamos la fecha si viene de C# para que el input type="date" la lea bien
          fechaNacimiento: res.data.fechaNacimiento ? res.data.fechaNacimiento.split('T')[0] : "",
          ciudad: res.data.ciudad || "Cartagena"
        });
      } catch (error) {
        console.error("Error cargando perfil", error);
        // Si no tienes el backend listo aún, ponemos datos de prueba temporalmente
        setFormData({
          nombre: "Andrés",
          apellido: "Mendoza",
          telefono: "+57 300 000 0000",
          email: "andres@correo.com",
          fechaNacimiento: "1998-05-15",
          ciudad: "Cartagena"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerfil();
  }, []);

  // 3. Manejador de cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 4. Guardar los cambios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // 👇 Ajusta este endpoint para que tu C# reciba la actualización
        await api.put('/Auth/perfil', {
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono,
        fechaNacimiento: formData.fechaNacimiento,
        ciudad: formData.ciudad
        // Nota: NO enviamos el email, porque no queremos que se cambie
      });

      toast.success("¡Perfil actualizado con éxito! 🚀");
      
      // Actualizamos el nombre en el menú lateral guardándolo en localStorage
      localStorage.setItem("user_name", `${formData.nombre} ${formData.apellido}`);
      window.dispatchEvent(new Event("storage")); // Avisa a la app del cambio
      
    } catch (error) {
      toast.error("Hubo un error al guardar tus cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 max-w-3xl">
      <div>
        <h1 className="text-3xl font-serif font-bold text-stone-100 flex items-center gap-3">
          <UserCircle className="text-amber-500" /> Mi Perfil
        </h1>
        <p className="text-stone-500 mt-1 text-sm">Actualiza tu información personal y de contacto.</p>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
        
        {/* Cabecera del Avatar */}
        <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-8">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-serif text-3xl font-bold uppercase">
            {formData.nombre ? formData.nombre.charAt(0) : "U"}
          </div>
          <div>
            <button className="text-sm font-bold bg-zinc-800 hover:bg-zinc-700 text-stone-200 px-4 py-2 rounded-lg transition-colors">
              Cambiar Foto
            </button>
            <p className="text-stone-500 text-xs mt-2">JPG o PNG. Max 2MB.</p>
          </div>
        </div>

        {/* Formulario */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          
          {/* Fila: Correo Electrónico (BLOQUEADO) */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1 flex items-center gap-1">
              Correo Electrónico <Lock size={10} className="text-stone-600"/>
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={16} />
              <input 
                type="email" 
                name="email"
                value={formData.email}
                disabled
                readOnly
                className="w-full bg-black/60 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-stone-500 text-sm cursor-not-allowed outline-none select-none" 
              />
            </div>
            <p className="text-[10px] text-stone-600 ml-1">El correo electrónico no puede ser modificado por seguridad.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Nombre */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Nombres</label>
              <div className="relative">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={16} />
                <input 
                  type="text" 
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none transition-colors" 
                />
              </div>
            </div>

            {/* Apellido */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Apellidos</label>
              <div className="relative">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={16} />
                <input 
                  type="text" 
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none transition-colors" 
                />
              </div>
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Teléfono</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={16} />
                <input 
                  type="tel" 
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="+57 300 000 0000"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none transition-colors" 
                />
              </div>
            </div>

            {/* Fecha de Nacimiento */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Fecha de Nacimiento</label>
              <div className="relative">
                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={16} />
                <input 
                  type="date" 
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none transition-colors" 
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </div>

            {/* Ciudad */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Ciudad o Región</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={16} />
                <input 
                  type="text" 
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  placeholder="Ej. Cartagena, Colombia"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none transition-colors" 
                />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex justify-end">
            <button 
              type="submit"
              disabled={isSaving}
              className="bg-amber-600 disabled:bg-zinc-800 disabled:text-zinc-500 hover:bg-amber-500 text-zinc-950 font-bold py-3 px-8 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 text-sm shadow-lg shadow-amber-900/20"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}