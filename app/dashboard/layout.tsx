"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar"; 
import { Menu, X } from "lucide-react";

// 👇 1. AGREGAMOS EL ROL "superadmin" AQUÍ
type Role = "superadmin" | "dueno" | "barbero" | "cliente";
const RoleContext = createContext<Role>("cliente");

export function useRole() {
  return useContext(RoleContext);
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [role, setRole] = useState<Role>("cliente"); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedRole = (localStorage.getItem("role") || localStorage.getItem("user_role")) as Role;
    
    if (savedRole) {
      setRole(savedRole.toLowerCase() as Role);
    }
    
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="h-screen bg-zinc-950 flex items-center justify-center text-amber-500">Cargando...</div>;
  }

  return (
    <RoleContext.Provider value={role}>
      <div className="flex h-screen bg-zinc-950 overflow-hidden text-stone-200 relative">
        
        {/* --- TOPBAR PARA CELULARES --- */}
        <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-zinc-950/90 backdrop-blur-md border-b border-white/5 z-30 flex items-center justify-between px-4">
          <h1 className="font-serif text-xl font-bold text-stone-200">
            Barber<span className={role === "superadmin" ? "text-red-500" : "text-amber-500"}>SaaS</span>
          </h1>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-stone-400 hover:text-white transition-colors bg-zinc-900 rounded-lg border border-white/5"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* --- SIDEBAR PARA ESCRITORIO --- */}
        <div className="hidden md:block w-64 border-r border-white/5 shrink-0 z-40 relative bg-zinc-950">
          <Sidebar role={role} />
        </div>

        {/* --- SIDEBAR DESLIZABLE PARA CELULARES --- */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div 
              className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            <div className="relative w-64 max-w-[80%] h-full bg-zinc-950 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300 border-r border-white/5">
              <div className="px-6 pt-6 pb-2 flex items-center justify-between">
                <h1 className="font-serif text-2xl font-bold text-stone-200">
                  Barber<span className={role === "superadmin" ? "text-red-500" : "text-amber-500"}>SaaS</span>
                </h1>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-stone-400 hover:text-white bg-zinc-900 rounded-lg transition-colors border border-white/5"
                >
                  <X size={18} />
                </button>
              </div>
              <Sidebar role={role} onNavigate={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* --- CONTENIDO PRINCIPAL --- */}
        <div className="flex-1 overflow-y-auto relative pt-16 md:pt-0">
          <main className="p-4 md:p-8 max-w-7xl mx-auto">
            {children}
          </main>
        </div>
      </div>
    </RoleContext.Provider>
  );
}