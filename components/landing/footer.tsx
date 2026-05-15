"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Centralizamos los links para un código más limpio y fácil de mantener
const footerLinks = {
  producto: {
    title: "Producto",
    links: [
      { label: "Características", href: "#" },
      { label: "Precios", href: "#" },
      { label: "Casos de éxito", href: "#" },
      { label: "Actualizaciones", href: "#" },
    ],
  },
  recursos: {
    title: "Recursos",
    links: [
      { label: "Blog", href: "#" },
      { label: "Guías para Barberos", href: "#" },
      { label: "Centro de Ayuda", href: "#" },
      { label: "API", href: "#" },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Términos de Servicio", href: "#" },
      { label: "Política de Privacidad", href: "#" },
      { label: "Cookies", href: "#" },
      { label: "Contacto", href: "#" },
    ],
  },
};

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Animación del Logo y Descripción
      gsap.from(".footer-logo", {
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 90%",
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
      });

      // 2. Animación de las Columnas de Links con Stagger
      gsap.from(".footer-column", {
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 85%",
        },
        opacity: 0,
        y: 40,
        duration: 0.6,
        stagger: 0.15,
        ease: "power3.out",
      });

      // 3. Línea Divisoria Animada (Crecimiento horizontal)
      gsap.from(".footer-divider", {
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 70%",
        },
        scaleX: 0,
        duration: 1,
        ease: "power3.inOut",
      });
    }, footerRef);

    return () => ctx.revert(); // Limpieza de memoria profesional
  }, []);

  return (
    <footer ref={footerRef} className="bg-zinc-950 border-t border-zinc-800/50 pt-16 pb-8 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          
          {/* Logo y Descripción */}
          <div className="lg:col-span-2 footer-logo">
            <Link href="/" className="font-serif text-2xl font-bold text-stone-200 tracking-tight hover:text-amber-500 transition-colors duration-300">
              BarberSaaS
            </Link>
            <p className="mt-4 text-stone-500 text-sm leading-relaxed max-w-xs">
              La herramienta definitiva para elevar el estándar de las barberías en todo el mundo.
            </p>
            
            {/* Íconos Sociales (SVGs integrados para máxima compatibilidad) */}
            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="text-stone-500 hover:text-amber-500 transition-colors duration-300" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className="text-stone-500 hover:text-amber-500 transition-colors duration-300" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="text-stone-500 hover:text-amber-500 transition-colors duration-300" aria-label="YouTube">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          {/* Columnas de Links */}
          {Object.values(footerLinks).map((column, index) => (
            <div key={index} className="footer-column">
              <h4 className="font-serif text-amber-500 font-semibold mb-4">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link href={link.href} className="text-stone-500 hover:text-stone-300 text-sm transition-colors duration-300">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider Animado */}
        <div className="footer-divider h-px bg-zinc-800 mt-12 mb-8 origin-left" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-stone-600 text-xs">
          <p>&copy; {new Date().getFullYear()} BarberSaaS. Todos los derechos reservados.</p>
          <p>Hecho con pasión para la comunidad barbera.</p>
        </div>
      </div>
    </footer>
  );
}