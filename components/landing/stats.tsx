"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Centralizamos los datos para facilitar el mantenimiento
const statsData = [
  { value: 2500, suffix: "+", label: "Barberías Activas" },
  { value: 15000, suffix: "+", label: "Profesionales" },
  { value: 1, suffix: "M+", label: "Citas Gestionadas" },
  { value: 98, suffix: "%", label: "Satisfacción" },
];

export default function Stats() {
  const sectionRef = useRef<HTMLElement>(null);
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Animación de entrada de los contenedores (Stat Item)
      gsap.fromTo(
        ".stat-item",
        { opacity: 0, y: 30 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
        }
      );

      // 2. Animación de escala y rebote para los números (Counter Bounce)
      numberRefs.current.forEach((el, index) => {
        if (!el) return;
        const targetValue = statsData[index].value;

        // Efecto de aparición con rebote
        gsap.fromTo(el.parentElement,
          { scale: 0.5, opacity: 0 },
          {
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: "back.out(1.5)",
          }
        );

        // Lógica de conteo numérico
        gsap.fromTo(el,
          { innerText: 0 },
          {
            innerText: targetValue,
            duration: 2,
            ease: "power2.out",
            snap: { innerText: 1 },
            onUpdate: function() {
              // Formateo de números (comas para miles)
              el.innerText = Math.ceil(Number(this.targets()[0].innerText)).toLocaleString('en-US');
            },
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
            }
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert(); // Limpieza de memoria profesional
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-zinc-900 py-20 px-6 border-y border-zinc-800"
    >
      {/* Resplandor de fondo sutil (Estilo v0) */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5" />

      <div className="relative max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {statsData.map((stat, index) => (
            <div key={index} className="stat-item text-center">
              {/* Valor numérico con tipografía Serif y color Ámbar */}
              <div className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-amber-500 mb-2 flex justify-center items-center">
                <span
                  ref={(el) => {
                    numberRefs.current[index] = el;
                  }}
                >
                  0
                </span>
                {stat.suffix}
              </div>
              {/* Etiqueta descriptiva en mayúsculas espaciadas */}
              <div className="text-stone-400 text-sm md:text-base uppercase tracking-wider font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}