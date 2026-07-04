import { Calendar, MapPin, Clock, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { useEvents } from "../hooks/useEvents";

export function Events() {
  const { events, loading } = useEvents({ onlyPublished: true, highlightedFirst: true });

  const visible = events.slice(0, 4);

  return (
    <section id="eventos" className="bg-[#001856] py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span
              className="text-[#ffc300] uppercase tracking-widest"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "13px" }}
            >
              Programação
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
              Confira nossa programação<br />e participe dos próximos momentos
            </h2>
          </div>
          <Link
            to="/eventos"
            className="flex items-center gap-2 text-[#ffc300] border border-[#ffc300] px-6 py-3 rounded-full hover:bg-[#ffc300] hover:text-[#001856] transition-colors whitespace-nowrap"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
          >
            Ver todos os eventos <ChevronRight size={18} />
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 h-64 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && visible.length === 0 && (
          <p className="text-white/50 text-center py-16" style={{ fontFamily: "'Inter', sans-serif" }}>
            Nenhum evento publicado no momento.
          </p>
        )}

        {/* Events grid */}
        {!loading && visible.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visible.map((event) => (
              <div
                key={event.id}
                className={`rounded-2xl overflow-hidden border transition-transform duration-300 hover:-translate-y-1 cursor-pointer ${
                  event.featured
                    ? "border-[#ffc300]/30 bg-white/5"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {/* Category bar */}
                <div className="h-1.5" style={{ backgroundColor: event.color }} />

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs"
                      style={{
                        backgroundColor: event.color + "25",
                        color: event.color,
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {event.category}
                    </span>
                    {event.featured && (
                      <span
                        className="text-xs text-[#ffc300] bg-[#ffc300]/10 px-3 py-1 rounded-full"
                        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
                      >
                        Destaque
                      </span>
                    )}
                  </div>

                  <h3
                    className="text-white mb-3"
                    style={{
                      fontFamily: "'Instrument Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: "1.25rem",
                      lineHeight: 1.3,
                    }}
                  >
                    {event.title}
                  </h3>

                  <p
                    className="text-white/60 mb-5 leading-relaxed"
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem" }}
                  >
                    {event.description}
                  </p>

                  <div className="flex flex-col gap-2 mb-5">
                    <div className="flex items-center gap-2 text-white/70">
                      <Calendar size={15} className="flex-shrink-0" style={{ color: event.color }} />
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem" }}>
                        {event.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <Clock size={15} className="flex-shrink-0" style={{ color: event.color }} />
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem" }}>
                        {event.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <MapPin size={15} className="flex-shrink-0" style={{ color: event.color }} />
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem" }}>
                        {event.location}
                      </span>
                    </div>
                  </div>

                  {event.link ? (
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 rounded-xl transition-colors text-center block"
                      style={{
                        backgroundColor: event.color,
                        color: event.color === "#ffc300" ? "#001856" : "white",
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                      }}
                    >
                      {event.isPaid ? "Comprar ingressos" : "Participar gratuitamente"}
                    </a>
                  ) : (
                    <Link
                      to="/eventos"
                      className="w-full py-3 rounded-xl transition-colors text-center block"
                      style={{
                        backgroundColor: event.color,
                        color: event.color === "#ffc300" ? "#001856" : "white",
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                      }}
                    >
                      {event.isPaid ? "Comprar ingressos" : "Participar gratuitamente"}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
