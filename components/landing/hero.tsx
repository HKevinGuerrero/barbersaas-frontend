"use client";

import Image from "next/image";
import Link from "next/link"; // <-- Importamos Link
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      gsap.set([".hero-title", ".hero-subtitle", ".hero-cta-primary", ".hero-cta-secondary"], {
        opacity: 0,
        y: 60,
      });

      tl.to(".hero-title", { opacity: 1, y: 0, duration: 1, delay: 0.3 })
        .to(".hero-subtitle", { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
        .to(".hero-cta-primary", { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
        .to(".hero-cta-secondary", { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, "-=0.3");

      gsap.to(".hero-bg", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
        y: 150,
        scale: 1.1,
      });
    }, sectionRef);

    return () => ctx.revert(); 
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image optimizada con Next/Image */}
      <div className="hero-bg absolute inset-0 z-0">
        <Image
          src="/images/barbershop-hero.jpg"
          alt="Interior de barbería vintage"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/40" />
      </div>

      {/* Contenido Principal */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-24">
        <h1 className="hero-title font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-stone-200 leading-tight text-balance mb-6">
          La evolución de la <br /> barbería clásica.
        </h1>

        <p className="hero-subtitle text-lg md:text-xl text-stone-400 max-w-2xl mx-auto mb-12 text-pretty">
          El sistema definitivo para gestionar locales, impulsar profesionales y conectar clientes.
        </p>

        {/* Jerarquía de Botones convertidos a Links de Next.js */}
        <div className="flex flex-col items-center gap-6">
          <Link 
            href="/register/cliente" 
            className="hero-cta-primary bg-amber-600 hover:bg-amber-500 text-zinc-950 font-semibold text-base px-10 py-5 rounded-md transition-all duration-300 shadow-lg shadow-amber-600/20 hover:scale-105 active:scale-95 text-center block"
          >
            Soy Cliente (Agendar Turno)
          </Link>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link 
              href="/register/barbero" 
              className="hero-cta-secondary border border-amber-600/50 text-amber-500 hover:bg-amber-600/10 hover:border-amber-500 bg-transparent font-medium px-8 py-4 rounded-md transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              Soy Barbero Profesional
              <ArrowRight size={16} />
            </Link>
            
            <Link 
              href="/register/dueno" 
              className="hero-cta-secondary border border-amber-600/50 text-amber-500 hover:bg-amber-600/10 hover:border-amber-500 bg-transparent font-medium px-8 py-4 rounded-md transition-all duration-300 hover:scale-105 active:scale-95 text-center block"
            >
              Registrar mi Barbería
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}