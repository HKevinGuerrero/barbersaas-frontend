"use client";

import { useEffect, useRef } from "react";
import Image from "next/image"; // Optimización de v0 para imágenes de perfil
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Carlos Mendoza",
    role: "Propietario de Barbería Elite",
    image: "/images/barber-1.jpg",
    quote: "BarberSaaS transformó completamente mi negocio. Ahora gestiono 3 locales desde mi teléfono con total facilidad.",
    rating: 5,
  },
  {
    name: "María Santos",
    role: "Barbera Independiente",
    image: "/images/barber-2.jpg",
    quote: "Como profesional independiente, esta plataforma me ayudó a construir mi marca personal y duplicar mis clientes en 6 meses.",
    rating: 5,
  },
  {
    name: "Roberto Álvarez",
    role: "Fundador de The Classic Cut",
    image: "/images/barber-3.jpg",
    quote: "Después de 25 años en el negocio, puedo decir que esta es la mejor inversión que he hecho para modernizar mi barbería.",
    rating: 5,
  }
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Animación del Título (v0 style)
      gsap.fromTo(titleRef.current,
        { opacity: 0, y: 40 },
        {
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
        }
      );

      // 2. Animación 3D y Stagger de Tarjetas
      gsap.fromTo(".testimonial-card",
        { opacity: 0, y: 50, rotationY: 10, scale: 0.95 }, // Reducimos rotación para mayor elegancia
        {
          scrollTrigger: {
            trigger: ".testimonials-grid",
            start: "top 85%",
            toggleActions: "play none none none",
          },
          opacity: 1,
          y: 0,
          rotationY: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
        }
      );

      // 3. Animación de Iconos de Comilla (Bounce individual)
      gsap.fromTo(".quote-icon",
        { opacity: 0, scale: 0, rotation: -45 },
        {
          scrollTrigger: {
            trigger: ".testimonials-grid",
            start: "top 80%",
          },
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.5,
          stagger: 0.15,
          delay: 0.3,
          ease: "back.out(1.7)",
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-zinc-900 py-24 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        
        {/* Encabezado centrado */}
        <div ref={titleRef} className="text-center mb-16">
          <span className="text-amber-500 font-medium text-sm uppercase tracking-wider">
            Testimonios
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-stone-200 mt-4 text-balance">
            Lo que dicen nuestros profesionales
          </h2>
        </div>

        {/* Grid de Testimonios con perspectiva 3D */}
        <div className="testimonials-grid grid grid-cols-1 md:grid-cols-3 gap-8" style={{ perspective: "1200px" }}>
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="testimonial-card relative bg-zinc-950 rounded-2xl p-8 border border-zinc-800 hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1 shadow-2xl"
            >
              {/* Ícono de Comilla Estilo v0 */}
              <div className="quote-icon absolute -top-4 -right-4 w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20 z-10">
                <Quote className="w-5 h-5 text-zinc-950 fill-current" />
              </div>

              {/* Rating de Estrellas */}
              <div className="flex gap-1 mb-6">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                ))}
              </div>

              {/* Texto del Testimonio */}
              <p className="text-stone-300 leading-relaxed mb-8 text-pretty italic">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Autor con Image de Next.js */}
              <div className="flex items-center gap-4 mt-auto">
                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-amber-500/30">
                  <Image
                    src={t.image}
                    alt={t.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-stone-200 font-serif tracking-wide">
                    {t.name}
                  </h4>
                  <p className="text-sm text-stone-500 font-medium">
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}