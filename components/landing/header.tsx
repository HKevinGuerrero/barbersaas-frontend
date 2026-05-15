"use client";

import { useEffect, useRef, useState } from "react"; // Añadimos useState para el scroll 
import Link from "next/link";
import gsap from "gsap";

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false); // Estado para el fondo 

  useEffect(() => {
    // 1. Animación de entrada inicial pulida (Estilo v0) 
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        y: -100,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.1,
      });

      gsap.from(".header-logo", {
        opacity: 0,
        x: -20,
        duration: 0.6,
        delay: 0.5,
        ease: "power3.out",
      });

      gsap.from(".header-nav-item", {
        opacity: 0,
        y: -10,
        duration: 0.4,
        stagger: 0.1,
        delay: 0.7,
        ease: "power3.out",
      });
    }, headerRef);

    // 2. Listener de Scroll eficiente 
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      ctx.revert(); // Limpieza de memoria profesional 
    };
  }, []);

  return (
<header
    ref={headerRef}
    className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled
        ? "bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/50 py-3 shadow-lg" 
        : "bg-transparent border-b border-transparent py-5" // Forzamos el borde a transparente aquí
    }`}
  >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo con clase para animación específica */}
        <Link
          href="/"
          className="header-logo font-serif text-2xl md:text-3xl font-bold text-stone-200 tracking-tight hover:text-amber-500 transition-colors duration-300"
        >
          BarberSaaS
        </Link>

        {/* Lado derecho: Idioma e Inicio de Sesión */}
        <div className="flex items-center gap-6">
          {/* Selector de Idioma */}
          <div className="header-nav-item flex items-center gap-1 text-sm text-stone-400">
            <button className="text-amber-500 font-medium hover:text-amber-400 transition-colors">
              ES
            </button>
            <span>/</span>
            <button className="hover:text-stone-200 transition-colors">
              EN
            </button>
          </div>

          {/* Enlace de Login con efecto hover moderno */}
          <Link
            href="/login"
            className="header-nav-item text-sm text-stone-400 hover:text-amber-500 transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-amber-500 after:transition-all after:duration-300 hover:after:w-full"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </header>
  );
}