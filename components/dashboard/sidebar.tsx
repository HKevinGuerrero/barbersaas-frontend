"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  Wallet, 
  Settings, 
  Scissors, 
  Clock,
  CalendarDays,
  CircleDollarSign,
  LogOut,
  Compass,
  CalendarHeart,
  Star,
  UserCircle,
  UserPlus,
  ShieldAlert // 👈 Ícono para el SuperAdmin
} from "lucide-react";
import { WalkInModal } from "./WalkInModal";

// 👇 Agregamos el rol "superadmin" a las propiedades permitidas
export function Sidebar({ role, onNavigate }: { role: "superadmin" | "dueno" | "barbero" | "cliente", onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter(); 
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role"); 

    document.body.style.overflow = "unset";
    document.body.classList.remove("overflow-hidden");
    
    router.push("/login");
  };

  // 👑 LOS LINKS EXCLUSIVOS DEL SUPERADMIN
  const superAdminLinks = [
    { title: "Panel Central", href: "/dashboard/superadmin", icon: ShieldAlert },
    { title: "Configuración SaaS", href: "#", icon: Settings }, // Para uso futuro
  ];

  const duenoLinks = [
    { title: "Vista General", href: "/dashboard/dueno", icon: LayoutDashboard },
    { title: "Mis Sucursales", href: "/dashboard/dueno/sucursales", icon: Store },
    { title: "Staff", href: "/dashboard/dueno/staff", icon: Users },
    { title: "Finanzas", href: "/dashboard/dueno/finanzas", icon: Wallet },
    { title: "Mis Servicios", href: "/dashboard/dueno/servicios", icon: Scissors },
    { title: "Horarios", href: "/dashboard/dueno/horarios", icon: Clock },
    { title: "Configuración", href: "/dashboard/dueno/config", icon: Settings },
  ];

  const barberoLinks = [
    { title: "Mi Día", href: "/dashboard/barbero", icon: LayoutDashboard },
    { title: "Agenda Completa", href: "/dashboard/barbero/agenda", icon: CalendarDays },
    { title: "Mis Ganancias", href: "/dashboard/barbero/ganancias", icon: CircleDollarSign },
    { title: "Mi Perfil", href: "/dashboard/barbero/perfil", icon: Settings }, 
  ];

  const clienteLinks = [
    { title: "Explorar", href: "/dashboard/cliente", icon: Compass },
    { title: "Mis Citas", href: "/dashboard/cliente/citas", icon: CalendarHeart },
    { title: "Favoritos", href: "/dashboard/cliente/favoritos", icon: Star },
    { title: "Mi Perfil", href: "/dashboard/cliente/perfil", icon: UserCircle }, 
  ];

  // 👇 Lógica de selección de links según el rol
  const links = 
    role === "superadmin" ? superAdminLinks :
    role === "dueno" ? duenoLinks : 
    role === "barbero" ? barberoLinks : 
    clienteLinks;

  return (
    <aside className="w-full h-screen flex flex-col pt-6 pb-6 bg-zinc-950 overflow-hidden border-r border-white/5">
      
      <div className="px-6 mb-8 hidden md:block flex-shrink-0">
        <h1 className="font-serif text-2xl font-bold text-stone-200">
          Barber<span className={role === "superadmin" ? "text-red-500" : "text-amber-500"}>SaaS</span>
        </h1>
        {role === "superadmin" && (
          <p className="text-[9px] text-red-500 uppercase tracking-widest font-bold mt-1">Modo Administrador</p>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {links.map((link) => {
          const isActive = pathname === link.href;
          
          // Estilo condicional: Si es superadmin, los botones activos brillan en rojo
          const activeStyle = role === "superadmin" 
            ? "bg-red-500/10 text-red-500 border border-red-500/20"
            : "bg-amber-500/10 text-amber-500 border border-amber-500/20";

          return (
            <Link 
              key={link.href} 
              href={link.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                isActive 
                  ? activeStyle 
                  : "text-stone-400 hover:text-stone-200 hover:bg-zinc-900/50 border border-transparent"
              }`}
            >
              <link.icon size={20} />
              <span>{link.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex-shrink-0">
        {role === "dueno" && (
          <div className="px-4 mt-4 mb-2">
            <button 
              onClick={() => setIsWalkInOpen(true)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-amber-500/10 active:scale-95"
            >
              <UserPlus size={18} />
              <span>Walk-in</span>
            </button>
          </div>
        )}

        <div className="px-4 pt-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-stone-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-medium text-sm group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      <WalkInModal isOpen={isWalkInOpen} onClose={() => setIsWalkInOpen(false)} />
    </aside>
  );
}