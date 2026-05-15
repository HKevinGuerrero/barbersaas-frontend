"use client";

import { Store, Building2, MapPin, Upload, Phone, FileBadge } from "lucide-react";

export function FormCliente() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">
          Nombre
        </label>
        <input 
          name="nombre" 
          type="text" 
          required 
          className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none" 
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">
          Apellido
        </label>
        <input 
          name="apellido" 
          type="text" 
          required 
          className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none" 
        />
      </div>
    </div>
  );
}

export function FormBarbero() {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">
            Nombre
          </label>
          <input 
            name="nombre" 
            type="text" 
            required 
            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">
            Apellido
          </label>
          <input 
            name="apellido" 
            type="text" 
            required 
            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none" 
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">
          Teléfono de Contacto
        </label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={16} />
          <input 
            name="telefono" 
            type="tel" 
            required 
            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none" 
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">
          Certificados o Portafolio (Opcional)
        </label>
        <div className="relative">
          <FileBadge className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={16} />
          <input 
            name="portafolio" 
            type="text" 
            placeholder="Link a tu Instagram o Drive" 
            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none" 
          />
        </div>
      </div>
    </>
  );
}

export function FormDueno() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">
            Tu Nombre Completo
          </label>
          <input 
            name="nombre" 
            type="text" 
            required 
            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">
            Nombre de la Barbería
          </label>
          <div className="relative">
            <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={16} />
            <input 
              name="nombreBarberia" 
              type="text" 
              required 
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none" 
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">
            Sucursal (Ej: Norte, Centro)
          </label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={16} />
            <input 
              name="sucursalNombre" 
              type="text" 
              required 
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none" 
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">
            NIT / RUT (Opcional)
          </label>
          <input 
            name="nit" 
            type="text" 
            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none" 
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">
            Dirección del Local
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={16} />
            <input 
              name="direccion" 
              type="text" 
              required 
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none" 
            />
          </div>
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">
            Logo de la Barbería
          </label>
          <div className="w-full bg-black/40 border border-dashed border-white/20 rounded-xl py-4 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500/50 transition-colors">
            <Upload className="text-stone-500 mb-2" size={20} />
            <span className="text-xs text-stone-400">Subir imagen (PNG, JPG)</span>
            <input name="logo" type="file" className="hidden" accept="image/*" />
          </div>
        </div>
      </div>
      <div className="space-y-2 mt-4">
        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">
          Teléfono de Contacto
        </label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={16} />
          <input 
            name="telefono" 
            type="tel" 
            required 
            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-stone-200 text-sm focus:border-amber-500/50 outline-none" 
          />
        </div>
      </div>
    </>
  );
}