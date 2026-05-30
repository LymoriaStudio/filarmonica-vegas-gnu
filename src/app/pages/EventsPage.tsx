import { useEffect } from "react";
import { Link } from "react-router";
import { ArrowLeft, Calendar, Clock, MapPin, Ticket, MessageCircle, Tag, DollarSign } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { events } from "../data/events";

export function EventsPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const buildWhatsAppLink = (phone: string, title: string) =>
    `https://wa.me/${phone}?text=${encodeURIComponent(
      `Olá! Gostaria de fazer uma reserva para o evento "${title}".`
    )}`;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <section className="bg-[#001856] pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-[#ffc300] transition-colors mb-6"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px" }}
          >
            <ArrowLeft size={16} /> Voltar para a página inicial
          </Link>
          <span
            className="text-[#ffc300] uppercase tracking-widest"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "13px" }}
          >
            Programação Completa
          </span>
          </div>
        
          <h1
            className="text-white mt-3"
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              lineHeight: 1.15,
            }}
          >
            Próximos eventos<br />da Filarmônica
          </h1>
          <p
            className="text-white/70 mt-5 max-w-2xl"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "1rem", lineHeight: 1.7 }}
          >
            Confira todas as informações sobre cada evento — data, horário, local, tema e como
            garantir sua presença.
          </p>
        </div>
      </section>

      {/* Events list */}
      <section className="py-16 bg-[#f5f6fa]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col gap-10">
          {events.map((event, idx) => {
            const reverse = idx % 2 === 1;
            return (
              <article
                key={event.id}
                className="bg-white rounded-3xl overflow-hidden shadow-xl flex flex-col lg:flex-row"
              >
                {/* Image */}
                <div
                  className={`lg:w-2/5 relative ${reverse ? "lg:order-2" : ""}`}
                >
                  <div className="h-64 lg:h-full">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute top-5 left-5 flex gap-2">
                    <span
                      className="px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: event.color,
                        color: event.color === "#ffc300" ? "#001856" : "white",
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: "12px",
                      }}
                    >
                      {event.category}
                    </span>
                    {event.featured && (
                      <span
                        className="px-3 py-1 rounded-full bg-white/90 text-[#001856]"
                        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "12px" }}
                      >
                        Destaque
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="lg:w-3/5 p-8 md:p-10 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag size={14} style={{ color: event.color }} />
                    <span
                      className="uppercase tracking-widest text-[#001856]/60"
                      style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "12px" }}
                    >
                      Tema: {event.theme}
                    </span>
                  </div>

                  <h2
                    className="text-[#001856] mb-4"
                    style={{
                      fontFamily: "'Instrument Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: "clamp(1.5rem, 3vw, 2rem)",
                      lineHeight: 1.2,
                    }}
                  >
                    {event.title}
                  </h2>

                  <p
                    className="text-gray-600 mb-6 leading-relaxed"
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.95rem", lineHeight: 1.7 }}
                  >
                    {event.longDescription}
                  </p>

                  {/* Info grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">
                    {[
                      { icon: Calendar, label: "Data", value: event.date },
                      { icon: Clock, label: "Horário", value: event.time },
                      { icon: MapPin, label: "Local", value: event.location, sub: event.address },
                      { icon: DollarSign, label: "Ingresso", value: event.price },
                    ].map((info, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: event.color + "20" }}
                        >
                          <info.icon size={16} style={{ color: event.color }} />
                        </div>
                        <div>
                          <span
                            className="text-gray-400 uppercase tracking-wider block"
                            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "11px" }}
                          >
                            {info.label}
                          </span>
                          <p
                            className="text-[#001856]"
                            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.9rem" }}
                          >
                            {info.value}
                          </p>
                          {info.sub && (
                            <p
                              className="text-gray-500 mt-0.5"
                              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}
                            >
                              {info.sub}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                    {event.ticketsUrl && (
                      <a
                        href={event.ticketsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl transition-transform hover:-translate-y-0.5"
                        style={{
                          backgroundColor: event.color,
                          color: event.color === "#ffc300" ? "#001856" : "white",
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                        }}
                      >
                        <Ticket size={18} />
                        Comprar ingressos
                      </a>
                    )}
                    <a
                      href={buildWhatsAppLink(event.whatsapp, event.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl border-2 border-[#001856] text-[#001856] hover:bg-[#001856] hover:text-white transition-colors"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                      }}
                    >
                      <MessageCircle size={18} />
                      Reservar via WhatsApp
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
}
