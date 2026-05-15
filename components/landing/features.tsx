"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Store, Scissors, CalendarCheck } from "lucide-react";

// Separamos la información para mantener el código limpio
const featuresData = [
  {
    id: 1,
    title: "Para Barberías",
    description: "Gestión total de tu local. Controla tus ingresos, organiza los turnos diarios y administra a tu equipo de barberos desde un solo panel financiero.",
    icon: Store,
  },
  {
    id: 2,
    title: "Para Profesionales",
    description: "Tu talento viaja contigo. Crea tu portafolio personal, atrae clientes y mantén tu agenda llena independientemente del local en el que trabajes.",
    icon: Scissors,
  },
  {
    id: 3,
    title: "Para Clientes",
    description: "Nunca pierdas la pista de tu barbero. Reserva en segundos, califica el servicio y sigue a tu estilista favorito a donde vaya.",
    icon: CalendarCheck,
  }
];

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Usamos gsap.context para asegurar que las animaciones solo afecten a este componente
    const ctx = gsap.context(() => {
      // Animación de las Cards (Suben y aparecen)
      gsap.fromTo(".feature-card",
        { opacity: 0, y: 60, scale: 0.95 },
        {
          scrollTrigger: {
            trigger: ".features-grid",
            start: "top 90%",
            toggleActions: "play none none none"
          },
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.15,
          ease: "power3.out"
        }
      );

      // Animación de los Íconos (Rotación elástica)
      gsap.fromTo(".feature-icon",
        { scale: 0, rotation: -180 },
        {
          scrollTrigger: {
            trigger: ".features-grid",
            start: "top 85%"
          },
          scale: 1,
          rotation: 0,
          duration: 0.6,
          stagger: 0.15,
          delay: 0.3,
          ease: "back.out(1.7)"
        }
      );
    }, sectionRef);

    return () => ctx.revert(); // Limpiamos la animación al desmontar
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
      <h2 className="font-serif text-4xl md:text-5xl text-center text-[var(--foreground)] mb-16 drop-shadow-sm">
        ¿Por qué elegir BarberSaaS?
      </h2>
      
      <div className="features-grid grid grid-cols-1 lg:grid-cols-3 gap-8">
        {featuresData.map((feature) => {
          const Icon = feature.icon;
          return (
            <div 
              key={feature.id} 
              className="feature-card bg-[var(--card)] border border-[var(--border)] p-10 rounded-[var(--radius)] hover:-translate-y-1 transition-transform duration-300 interactive shadow-xl shadow-black/20"
            >
              <div className="mb-8 w-12 h-12 flex items-center justify-start">
                <Icon className="feature-icon text-[var(--gold)]" size={42} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[var(--foreground)] mb-4">
                {feature.title}
              </h3>
              <p className="text-[var(--muted-foreground)] leading-relaxed text-lg">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}