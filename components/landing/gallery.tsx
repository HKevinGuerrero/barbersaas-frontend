"use client";

import { useEffect, useRef } from "react";
import Image from "next/image"; // Optimización de rendimiento de v0
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Centralizamos los datos para que el código sea más limpio
const galleryImages = [
  {
    src: "/images/barbershop-interior-1.jpg",
    alt: "Interior de barbería moderna",
    span: "col-span-2 row-span-2", // Ocupa el lateral izquierdo en escritorio
  },
  {
    src: "/images/barber-working.jpg",
    alt: "Barbero profesional trabajando",
    span: "col-span-1 row-span-1",
  },
  {
    src: "/images/barbershop-interior-2.jpg",
    alt: "Herramientas de barbería premium",
    span: "col-span-1 row-span-1",
  },
  {
    src: "/images/mobile-app.jpg",
    alt: "App móvil de BarberSaaS",
    span: "col-span-2 row-span-1", // Ocupa el ancho inferior derecho
  },
];

export default function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Animación del título (Entrada suave desde abajo)
      gsap.fromTo(titleRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          }
        }
      );

      // 2. Animación de los items con "stagger" aleatorio
      gsap.fromTo(".gallery-item",
        { opacity: 0, scale: 0.9, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          stagger: {
            amount: 0.6,
            from: "random", // Hace que la entrada sea más orgánica
          },
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".gallery-grid",
            start: "top 85%",
            toggleActions: "play none none none",
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert(); // Limpieza de memoria profesional
  }, []);

  return (
    <section ref={sectionRef} className="bg-zinc-950 py-24 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Encabezado animado */}
        <div ref={titleRef} className="text-center mb-16">
          <span className="text-amber-500 font-medium text-sm uppercase tracking-wider">
            Galería
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-stone-200 mt-4 text-balance">
            El arte de la barbería moderna
          </h2>
          <p className="text-stone-400 mt-4 max-w-2xl mx-auto">
            Descubre el ambiente y la experiencia que nuestros socios crean cada día
          </p>
        </div>

        {/* Bento Grid Gallery (Ajustado para responsive real) */}
        <div className="gallery-grid grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[250px]">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className={`gallery-item relative rounded-xl overflow-hidden group cursor-pointer border border-zinc-800/50 shadow-lg ${image.span}`}
            >
              {/* Uso de Image de Next.js para optimización de v0 */}
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay de v0 con gradiente dinámico */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Texto flotante al hacer hover */}
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-stone-200 text-sm font-medium">{image.alt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}