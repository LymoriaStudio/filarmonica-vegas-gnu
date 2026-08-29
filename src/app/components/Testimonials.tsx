import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { getTestimonialsAtivos, PublicTestimonial as Testimonial } from "../services/testimonialsService";

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function useColumns() {
  const [cols, setCols] = useState(3);
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 768) setCols(1);
      else if (window.innerWidth < 1024) setCols(2);
      else setCols(3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return cols;
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    getTestimonialsAtivos()
      .then(setTestimonials)
      .catch((err) => console.error('Erro ao carregar depoimentos:', err));
  }, []);

  const cols = useColumns();
  const total = testimonials.length;
  const totalPages = Math.ceil(total / cols) || 1;

  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => setPage((p) => (p + 1) % totalPages), [totalPages]);
  const prev = () => setPage((p) => (p - 1 + totalPages) % totalPages);

  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(next, 15000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [paused, next]);

  useEffect(() => { setPage(0); }, [cols]);

  const start = page * cols;
  const visible = testimonials.slice(start, start + cols);

  return (
    <section className="py-20" style={{ backgroundColor: "#001856" }}>
      <div className="max-w-7xl mx-auto px-6">

        {/* Header com setas */}
        <div className="flex items-end justify-between mb-8 gap-6">
          <div>
            <span
              className="uppercase tracking-widest text-[#ffc300]"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "13px" }}
            >
              Depoimentos
            </span>
            <h2
              className="text-white mt-2"
              style={{
                fontFamily: "'Instrument Sans', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                lineHeight: 1.2,
              }}
            >
              Quem vive a Filarmônica<br />conta a experiência
            </h2>
            <p className="text-white/50 mt-3 text-sm">
              Depoimentos reais de alunos e famílias que fazem parte do projeto.
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            <button
              onClick={prev}
              className="w-11 h-11 rounded-full border-2 border-white/30 flex items-center justify-center text-white hover:border-white hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="w-11 h-11 rounded-full border-2 border-white/30 flex items-center justify-center text-white hover:border-white hover:bg-white/10 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Cards */}
        <div
          className={`grid gap-6 ${cols === 1 ? "grid-cols-1" : cols === 2 ? "grid-cols-2" : "grid-cols-3"}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {visible.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl p-7 flex flex-col"
              style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
            >
              {/* Tag */}
              <div className="flex items-center gap-2 mb-5">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "#ffc300", color: "#001856" }}
                >
                  {t.tag}
                </span>
                <span className="text-white/40 text-xs">{t.tag_detail}</span>
              </div>

              {/* Aspas */}
              <div className="text-[#ffc300] mb-4" style={{ fontSize: "2rem", lineHeight: 1, fontFamily: "Georgia, serif" }}>
                ❝❝
              </div>

              {/* Texto */}
              <p
                className="text-white/80 leading-relaxed flex-1 mb-8"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem" }}
              >
                {t.text}
              </p>

              {/* Autor */}
              <div className="flex items-center gap-3 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
                  style={{ backgroundColor: "#ffc300", color: "#001856" }}
                >
                  {getInitials(t.name)}
                </div>
                <p
                  className="text-white font-semibold text-sm"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {t.name}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              aria-label={`Página ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${i === page ? "w-8 h-3" : "w-3 h-3"}`}
              style={{ backgroundColor: i === page ? "#ffc300" : "rgba(255,255,255,0.25)" }}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
