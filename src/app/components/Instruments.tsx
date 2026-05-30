import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router";

const instruments = [
  {
    name: "Trompete",
    description:
      "O instrumento mais agudo do naipe dos metais. Versátil e brilhante, eternizado no jazz por nomes como Louis Armstrong, Miles Davis e Arturo Sandoval.",
    image: "https://images.unsplash.com/photo-1627411187044-cc7a4daaca7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    color: "#ffc300",
  },
  {
    name: "Trombone",
    description:
      "Instrumento bastante antigo, originado no século XV, antes conhecido como sacabuxa. Único entre os metais por usar uma vara deslizante em vez de pistões.",
    image: "https://images.unsplash.com/photo-1547927168-17021e7ef8c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    color: "#001856",
  },
  {
    name: "Trompa",
    description:
      "Instrumento transpositor afinado em fá, com enorme extensão enrolada sobre si mesma. Permite grande variedade de timbres. O músico que a toca é chamado de trompista.",
    image: "https://images.unsplash.com/photo-1701748533596-9d5a56a1cfe7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    color: "#ffc300",
  },
  {
    name: "Bombardino",
    description:
      "Também chamado de eufônio — cujo nome vem de Euphonium, \"som bonito\". Timbre escuro, suave e delicado, com extensão semelhante à do trombone.",
    image: "https://images.unsplash.com/photo-1601333057494-d20abe2098cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    color: "#001856",
  },
  {
    name: "Tuba",
    description:
      "O instrumento mais recente da família dos metais, surgido no século XIX. A base sonora de qualquer conjunto, presente da música clássica às bandas militares.",
    image: "https://images.unsplash.com/photo-1776611713652-6ad5a5856237?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    color: "#ffc300",
  },
];

export function Instruments() {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleCount = 3;
  const maxIndex = instruments.length - visibleCount;

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(maxIndex, c + 1));

  return (
    <section id="instrumentos" className="bg-white py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span
              className="text-[#ffc300] uppercase tracking-widest"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "13px" }}
            >
              Nossos instrumentos
            </span>
            <h2
              className="text-[#001856] mt-2"
              style={{
                fontFamily: "'Instrument Sans', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                lineHeight: 1.2,
              }}
            >
              Conheça os metais que<br />compõem a filarmônica
            </h2>
          </div>
          <div className="flex gap-3">
            <button
              onClick={prev}
              disabled={current === 0}
              className="w-12 h-12 rounded-full border-2 border-[#001856] flex items-center justify-center text-[#001856] hover:bg-[#001856] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              disabled={current >= maxIndex}
              className="w-12 h-12 rounded-full border-2 border-[#001856] flex items-center justify-center text-[#001856] hover:bg-[#001856] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden" ref={containerRef}>
          <div
            className="flex gap-6 transition-transform duration-500"
            style={{ transform: `translateX(calc(-${current} * (100% / ${visibleCount} + 8px)))` }}
          >
            {instruments.map((inst, i) => (
              <Link
                to="/instrumentos"
                key={i}
                className="flex-none w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] rounded-2xl overflow-hidden shadow-lg group block transition-transform duration-300 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={inst.image}
                    alt={inst.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1"
                    style={{ backgroundColor: inst.color }}
                  />
                </div>
                {/* Info */}
                <div className="p-6 bg-white">
                  <h3
                    className="text-[#001856] mb-3"
                    style={{
                      fontFamily: "'Instrument Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: "1.4rem",
                    }}
                  >
                    {inst.name}
                  </h3>
                  <p
                    className="text-gray-500 mb-4 leading-relaxed"
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem" }}
                  >
                    {inst.description}
                  </p>
                  <div className="flex items-center justify-end">
                    <span
                      className="px-4 py-2 rounded-full text-sm transition-colors"
                      style={{
                        backgroundColor: inst.color,
                        color: inst.color === "#ffc300" ? "#001856" : "white",
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                      }}
                    >
                      Ver detalhes →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current ? "bg-[#001856] w-8 h-3" : "bg-gray-300 w-3 h-3"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}