import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 0,
    image: "https://images.unsplash.com/photo-1777226407432-801354c2ea42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFzcyUyMGJhbmQlMjBvcmNoZXN0cmElMjBwZXJmb3JtYW5jZXxlbnwxfHx8fDE3NzczMTIyMTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Música que\ntransforma vidas",
    subtitle:
      "A Filarmônica de Metais leva a arte da música a comunidades, formando músicos e cidadãos desde 2022.",
  },
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1745618409909-2c1af496c812?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    title: "Patrocine a\nfilarmônica",
    subtitle:
      "Empresas patrocinadoras têm seu nome e marca vinculados em todas as nossas mídias — site, redes sociais e eventos — fortalecendo a imagem da sua marca junto à cultura.",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1774515905600-429e3fef8f16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxicmFzcyUyMGJhbmQlMjBvcmNoZXN0cmElMjBwZXJmb3JtYW5jZXxlbnwxfHx8fDE3NzczMTIyMTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Tradição e paixão\nem cada nota",
    subtitle:
      "Mais de 100 músicos unidos pelo amor aos instrumentos de sopro e pela excelência musical.",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1776611713652-6ad5a5856237?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxicmFzcyUyMGJhbmQlMjBwZXJmb3JtYW5jZXxlbnwxfHx8fDE3NzczMTIyMTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Um projeto social\nque ecoa pelo Brasil",
    subtitle:
      "Apresentações, workshops e aulas gratuitas para jovens talentos em todo o país.",
  },
];

export function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden bg-[#000042]">
      {/* Slides */}
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#000042]/90 via-[#000042]/60 to-[#000042]/30" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl">
            <div className="inline-block bg-[#ffc300] px-4 py-1 rounded-full mb-6">
              <span
                className="text-[#001856]"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: "13px",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Projeto Social Musical
              </span>
            </div>
            <h1
              className="text-white mb-6 whitespace-pre-line"
              style={{
                fontFamily: "'Instrument Sans', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              {slides[current].title}
            </h1>
            <p
              className="text-white/80 mb-10 max-w-xl"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
                lineHeight: 1.7,
              }}
            >
              {slides[current].subtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => {
                  document
                    .getElementById("contato")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-[#ffc300] text-[#001856] px-8 py-4 rounded-full hover:bg-yellow-400 transition-colors"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: "16px",
                }}
              >
                Quero participar
              </button>
              <button
                onClick={() => {
                  document
                    .getElementById("sobre")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white hover:text-[#001856] transition-colors"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: "16px",
                }}
              >
                Saiba mais
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <button
        onClick={prev}
        className="absolute left-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={next}
        className="absolute right-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`rounded-full transition-all duration-300 ${
              idx === current
                ? "bg-white w-8 h-3"
                : "bg-white/40 w-3 h-3 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-10 z-20 hidden md:flex flex-col items-center gap-2">
        <span
          className="text-white/60 rotate-90 text-sm tracking-widest uppercase"
          style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
        >
          Scroll
        </span>
        <div className="w-px h-12 bg-white/30" />
      </div>
    </section>
  );
}
