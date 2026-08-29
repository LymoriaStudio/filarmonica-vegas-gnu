import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getBannersAtivos, PublicBanner as Banner } from "../services/bannersService";

function handleBtnClick(link: string | null) {
  if (!link) return;

  // Link interno (âncora ou rota)
  if (link.startsWith("#")) {
    document.getElementById(link.slice(1))?.scrollIntoView({ behavior: "smooth" });
  } else if (link.startsWith("/")) {
    window.location.href = link;
  } else {
    window.open(link, "_blank", "noopener,noreferrer");
  }
}

export function Hero() {
  const [slides, setSlides] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  // ── GET banners ativos, ordenados ──────────────────────────────────────────
  useEffect(() => {
    getBannersAtivos()
      .then((data) => {
        if (data.length > 0) setSlides(data);
      })
      .catch((err) => console.error('Erro ao carregar banners:', err))
      .finally(() => setLoading(false));
  }, []);

  // ── Auto-avanço ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 15000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  // ── Loading / sem banners ──────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="relative h-screen min-h-[600px] bg-[#000042] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#ffc300] border-t-transparent rounded-full animate-spin" />
      </section>
    );
  }

  if (slides.length === 0) {
    return (
      <section className="relative h-screen min-h-[600px] bg-[#000042] flex items-center justify-center">
        <p className="text-white/40 text-sm">Nenhum banner ativo.</p>
      </section>
    );
  }

  const slide = slides[current];

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden bg-[#000042]">
      {/* ── Slides ── */}
      {slides.map((s, idx) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === current ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Imagem responsiva: mobile vs desktop */}
          <picture>
            <source media="(max-width: 767px)" srcSet={s.image_mobile} />
            <img
              src={s.image_desktop}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-r from-[#000042]/90 via-[#000042]/60 to-[#000042]/30" />
        </div>
      ))}

      {/* ── Content ── */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl">

            {/* Tag */}
            {slide.tag && (
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
                  {slide.tag}
                </span>
              </div>
            )}

            {/* Title */}
            <h1
              className="text-white mb-4 whitespace-pre-line"
              style={{
                fontFamily: "'Instrument Sans', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              {slide.title}
            </h1>

            {/* Subtitle */}
            {slide.subtitle && (
              <p
                className="text-[#ffc300] mb-3"
                style={{
                  fontFamily: "'Instrument Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "clamp(1rem, 1.8vw, 1.25rem)",
                  lineHeight: 1.4,
                }}
              >
                {slide.subtitle}
              </p>
            )}

            {/* Text */}
            {slide.text && (
              <p
                className="text-white/80 mb-10 max-w-xl"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 400,
                  fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
                  lineHeight: 1.7,
                }}
              >
                {slide.text}
              </p>
            )}

            {/* Buttons */}
            {(slide.primary_btn_text || slide.secondary_btn_text) && (
              <div className="flex flex-wrap gap-4">
                {slide.primary_btn_text && (
                  <button
                    onClick={() => handleBtnClick(slide.primary_btn_link)}
                    className="bg-[#ffc300] cursor-pointer text-[#001856] px-8 py-4 rounded-full hover:bg-yellow-400 transition-colors"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 700,
                      fontSize: "16px",
                    }}
                  >
                    {slide.primary_btn_text}
                  </button>
                )}
                {slide.secondary_btn_text && (
                  <button
                    onClick={() => handleBtnClick(slide.secondary_btn_link)}
                    className="border-2 cursor-pointer border-white text-white px-8 py-4 rounded-full hover:bg-white hover:text-[#001856] transition-colors"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      fontSize: "16px",
                    }}
                  >
                    {slide.secondary_btn_text}
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Setas (só se houver mais de 1 slide) ── */}
      {slides.length > 1 && (
        <>
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
        </>
      )}

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
