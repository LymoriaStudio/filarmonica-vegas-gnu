import { useState, useRef, useEffect, useCallback } from "react";
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

const GAP = 24; // gap-6 = 24px

/** Calcula quantos cards cabem na largura do container */
function getVisibleCount(containerWidth: number): number {
  if (containerWidth >= 1024) return 3; // lg
  if (containerWidth >= 640) return 2;  // sm/md
  return 1;                              // mobile
}

export function Instruments() {
  const [current, setCurrent] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);

  // Atualiza visibleCount quando o container muda de tamanho
  const updateVisible = useCallback(() => {
    if (!containerRef.current) return;
    const w = containerRef.current.offsetWidth;
    const newVisible = getVisibleCount(w);
    setVisibleCount((prev) => {
      if (prev !== newVisible) {
        setCurrent(0); // reset ao trocar breakpoint
        return newVisible;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    updateVisible();
    const ro = new ResizeObserver(updateVisible);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [updateVisible]);

  const maxIndex = Math.max(0, instruments.length - visibleCount);

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(maxIndex, c + 1));

  /**
   * Largura de cada card = (containerWidth - GAP * (visibleCount - 1)) / visibleCount
   * Offset por step = cardWidth + GAP
   * Em percentual do container: ((cardWidth + GAP) / containerWidth) * 100
   *
   * Simplificando:
   *   cardWidth = (100% - GAP*(vc-1)) / vc
   *   step%     = cardWidth + GAP   →  (100 + GAP*(vc-1)/containerWidth*100 ... )
   *
   * Mais simples: usar pixels via CSS custom property injetada no style.
   * Mas como não temos containerWidth em pixels facilmente no CSS,
   * calculamos o translateX em px com base no offsetWidth atual.
   */
  const cardWidthPx = containerRef.current
    ? (containerRef.current.offsetWidth - GAP * (visibleCount - 1)) / visibleCount
    : 0;

  const translateX = current * (cardWidthPx + GAP);

  const trackRef = useRef<HTMLDivElement>(null);
const dragStart = useRef<number | null>(null);
const isDragging = useRef(false);

const handleDragStart = (clientX: number) => {
  dragStart.current = clientX;
  isDragging.current = false;
};

const handleDragEnd = (clientX: number) => {
  if (dragStart.current === null) return;
  const delta = dragStart.current - clientX;
  if (Math.abs(delta) > 50) {
    delta > 0 ? next() : prev();
  }
  dragStart.current = null;
};

const handleMouseMove = (clientX: number) => {
  if (dragStart.current === null) return;
  if (Math.abs(clientX - dragStart.current) > 5) isDragging.current = true;
};

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

        {/* Carousel track */}
        <div className="overflow-hidden" ref={containerRef}>
          <div
            className="flex transition-transform duration-500"
            style={{
              gap: `${GAP}px`,
              transform: `translateX(-${translateX}px)`,
            }}

             // Touch (mobile)
    onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
    onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientX)}
    // Mouse (desktop)
    onMouseDown={(e) => handleDragStart(e.clientX)}
    onMouseMove={(e) => handleMouseMove(e.clientX)}
    onMouseUp={(e) => handleDragEnd(e.clientX)}
    onMouseLeave={(e) => {
      if (dragStart.current !== null) handleDragEnd(e.clientX);
    }}
          >
            {instruments.map((inst, i) => (
           <Link
  to="/instrumentos"
  key={i}
  className="flex-none flex flex-col rounded-2xl overflow-hidden shadow-lg group transition-transform duration-300 hover:-translate-y-1"
  style={{
    width: cardWidthPx > 0 ? `${cardWidthPx}px` : `calc((100% - ${GAP * (visibleCount - 1)}px) / ${visibleCount})`,
  }}
   draggable={false} 
>
  {/* Image */}
  <div className="relative h-64 overflow-hidden flex-none">
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

  {/* Info — ocupa todo o espaço restante */}
  <div className="p-6 bg-white flex flex-col flex-1">
    <h3
      className="text-[#001856] mb-3"
      style={{ fontFamily: "'Instrument Sans', sans-serif", fontWeight: 700, fontSize: "1.4rem" }}
    >
      {inst.name}
    </h3>

    {/* Descrição empurra o botão para baixo */}
    <p
      className="text-gray-500 leading-relaxed flex-1"
      style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem" }}
    >
      {inst.description}
    </p>

    {/* Botão sempre no fundo */}
    <div className="flex items-center justify-end mt-4">
      <span
        className="px-4 py-2 rounded-full text-sm"
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

        {/* Dots — quantidade dinâmica baseada em maxIndex */}
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
