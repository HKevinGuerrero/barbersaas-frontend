"use client";

import { useEffect, useRef } from "react";
import Image from "next/image"; // Optimización de v0
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Animación Parallax del Fondo (Estilo v0 con scrub)
      gsap.fromTo(".cta-bg-image",
        { scale: 1.2 },
        {
          scale: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        }
      );

      // 2. Aparición Secuencial (Mejorado con stagger y power4)
      if (contentRef.current) {
        gsap.fromTo(contentRef.current.children,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "power4.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              toggleActions: "play none none none" // Evita repeticiones innecesarias
            }
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert(); // Limpieza de memoria profesional
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 px-6 overflow-hidden border-t border-zinc-800/50 mt-12">
      {/* Background Image con Next/Image (Paso a paso de v0) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/barbershop-hero.jpg"
          alt="Barbershop background"
          fill
          className="cta-bg-image object-cover brightness-[0.2]" // Brillo reducido para legibilidad
          priority={false}
        />
        {/* Gradiente de profundidad (Propuesta de v0) */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-zinc-950" />
      </div>

      {/* Contenido Responsive */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        <div ref={contentRef} className="flex flex-col items-center w-full">
          
          <span className="text-amber-500 font-bold tracking-widest text-sm uppercase mb-4">
            Comienza Ahora
          </span>
          
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-stone-200 leading-tight mb-6 text-balance">
            Lleva tu barbería al siguiente nivel
          </h2>
          
          <p className="text-stone-400 text-lg md:text-xl mb-10 max-w-2xl leading-relaxed">
            Únete a miles de profesionales que ya están transformando su negocio con la plataforma más completa del mercado.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center mb-6">
            {/* Botón Primario (Clases táctiles y escala de v0) */}
            <button className="bg-amber-500 text-zinc-950 font-bold py-4 px-10 rounded-lg hover:bg-amber-600 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 group w-full sm:w-auto">
              Prueba Gratis 14 Días
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            {/* Botón Secundario Outline */}
            <button className="border border-stone-600 text-stone-300 hover:bg-stone-800 hover:text-stone-100 py-4 px-10 rounded-lg transition-all duration-300 w-full sm:w-auto">
              Ver Demo
            </button>
          </div>

          <span className="text-stone-500 text-xs tracking-wide">
            Sin tarjeta de crédito requerida
          </span>
          
        </div>
      </div>
    </section>
  );
}