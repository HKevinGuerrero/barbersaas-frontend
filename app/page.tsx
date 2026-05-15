import Header from "@/components/landing/header";
import Hero from "@/components/landing/hero";
import Features from "@/components/landing/features";
import Showcase from "@/components/landing/showcase";
import Stats from "@/components/landing/stats";
import Gallery from "@/components/landing/gallery";
import Testimonials from "@/components/landing/testimonials";
import CTA from "@/components/landing/cta";
import Footer from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] overflow-hidden">
      <Header />
      <Hero />
      <Features />
      <Showcase />
      <Stats />
      <Gallery />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}