"use client";

import { useEffect, useRef } from "react";
import Image from "next/image"; 
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check } from "lucide-react";

const showcaseItems = [
  "Gestión de citas en tiempo real",
  "Panel de analíticas avanzado",
  "Control de pagos y clientes",
  "Sistema de pagos unificado",
];

export default function Showcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Animación de la Imagen
      gsap.fromTo(
        imageRef.current,
        { opacity: 0, x: -60, scale: 0.95 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 1,
          ease: "power3.out",
        }
      );

      // 2. Animación del Contenido
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, x: 60 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
          opacity: 1,
          x: 0,
          duration: 1,
          delay: 0.2,
          ease: "power3.out",
        }
      );

      // 3. Cascada (Stagger)
      gsap.fromTo(
        ".showcase-feature",
        { opacity: 0, x: 20 },
        {
          scrollTrigger: {
            trigger: ".showcase-list",
            start: "top 85%",
            toggleActions: "play none none none",
          },
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
        }
      );
    }, sectionRef);

    return () => ctx.revert(); 
  }, []);

  return (
    <section ref={sectionRef} className="bg-zinc-950 py-24 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Dashboard Image */}
          <div ref={imageRef} className="relative">
            {/* Glow effect de fondo ajustado */}
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 to-amber-600/10 blur-3xl rounded-3xl" />
            
            {/* Contenedor sin bordes extraños para que el mockup se vea limpio */}
            <div className="relative rounded-xl overflow-hidden drop-shadow-2xl">
              <Image
                src="/images/dashboard-mejorado.jpg"
                alt="BarberSaaS Dashboard de Finanzas"
                width={3312} // Resolución original para máxima nitidez
                height={2704} // Resolución original
                quality={100} // Bloquea la compresión por defecto de Next.js
                className="w-full h-auto object-contain"
                priority={false}
              />
            </div>
          </div>

          {/* Contenido de Texto */}
          <div ref={contentRef}>
            <span className="text-amber-500 font-medium text-sm uppercase tracking-wider">
              Plataforma Completa
            </span>
            
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-stone-200 mt-4 mb-6 text-balance">
              Todo lo que necesitas en un solo lugar
            </h2>
            
            <p className="text-stone-400 text-lg leading-relaxed mb-8">
              Desde la gestión de citas hasta el análisis de rendimiento, nuestra 
              plataforma te ofrece las herramientas para llevar tu barbería al 
              siguiente nivel.
            </p>

            {/* Lista de Features */}
            <ul className="showcase-list space-y-4">
              {showcaseItems.map((item, index) => (
                <li key={index} className="showcase-feature flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-amber-500" strokeWidth={3} />
                  </div>
                  <span className="text-stone-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}