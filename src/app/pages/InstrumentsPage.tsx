import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { instruments, type Instrument } from "../data/instruments";

export function InstrumentsPage() {
  const [selected, setSelected] = useState<Instrument | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    if (selected) {
      const el = document.getElementById("instrument-detail");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selected]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <section className="bg-[#001856] pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6">
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
            Galeria de Instrumentos
          </span>
          <h1
            className="text-white mt-3"
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              lineHeight: 1.15,
            }}
          >
            Conheça cada instrumento<br />de metal da filarmônica
          </h1>
          <p
            className="text-white/70 mt-5 max-w-2xl"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "1rem", lineHeight: 1.7 }}
          >
            Clique em qualquer instrumento abaixo para descobrir suas características,
            ver fotos de músicos em ação e ouvir uma demonstração sonora.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {instruments.map((inst) => {
              const isActive = selected?.slug === inst.slug;
              return (
                <button
                  key={inst.slug}
                  onClick={() => setSelected(inst)}
                  className={`text-left rounded-2xl overflow-hidden shadow-lg transition-all duration-300 group ${
                    isActive ? "ring-4 ring-[#ffc300] -translate-y-1" : "hover:-translate-y-1"
                  }`}
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={inst.image}
                      alt={inst.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1.5"
                      style={{ backgroundColor: inst.color }}
                    />
                  </div>
                  <div className="p-6 bg-white">
                    <h3
                      className="text-[#001856] mb-2"
                      style={{
                        fontFamily: "'Instrument Sans', sans-serif",
                        fontWeight: 700,
                        fontSize: "1.4rem",
                      }}
                    >
                      {inst.name}
                    </h3>
                    <p
                      className="text-gray-500 leading-relaxed"
                      style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem" }}
                    >
                      {inst.description}
                    </p>
                    <div
                      className="mt-4 inline-flex items-center gap-2"
                      style={{
                        color: inst.color === "#ffc300" ? "#001856" : "#001856",
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: "0.875rem",
                      }}
                    >
                      {isActive ? "Selecionado" : "Ver detalhes"} →
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Detail */}
      {selected && (
        <section id="instrument-detail" className="bg-[#f5f6fa] py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl">
              {/* Hero */}
              <div className="relative h-72 md:h-96">
                <img
                  src={selected.image}
                  alt={selected.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001856]/90 via-[#001856]/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                  <h2
                    className="text-white"
                    style={{
                      fontFamily: "'Instrument Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: "clamp(2rem, 5vw, 3.5rem)",
                      lineHeight: 1.1,
                    }}
                  >
                    {selected.name}
                  </h2>
                </div>
              </div>

              <div className="p-8 md:p-12">
                {/* Description */}
                <p
                  className="text-gray-700 leading-relaxed mb-10 max-w-3xl"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.05rem", lineHeight: 1.8 }}
                >
                  {selected.longDescription.split("\n\n").map((para, idx) => (
                    <span key={idx}>
                      {para}
                      {idx < selected.longDescription.split("\n\n").length - 1 && <><br /><br /></>}
                    </span>
                  ))}
                </p>

                {/* Gallery */}
                <h3
                  className="text-[#001856] mb-5"
                  style={{
                    fontFamily: "'Instrument Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.5rem",
                  }}
                >
                  Músicos em ação
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                  {selected.gallery.map((src, i) => (
                    <div
                      key={i}
                      className="aspect-[4/3] rounded-xl overflow-hidden group cursor-pointer"
                    >
                      <img
                        src={src}
                        alt={`${selected.name} — foto ${i + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>

                {/* Video */}
                <h3
                  className="text-[#001856] mb-5"
                  style={{
                    fontFamily: "'Instrument Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.5rem",
                  }}
                >
                  Demonstração sonora
                </h3>
                <div className="aspect-video rounded-xl overflow-hidden bg-black mb-10">
                  <iframe
                    key={selected.slug}
                    src={selected.videoUrl}
                    title={`Demonstração de ${selected.name}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                {/* CTA */}
                <div
                  className="rounded-2xl p-8 text-center"
                  style={{ backgroundColor: "#001856" }}
                >
                  <h3
                    className="text-white mb-3"
                    style={{
                      fontFamily: "'Instrument Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: "1.5rem",
                    }}
                  >
                    Quer aprender a tocar {selected.name.toLowerCase()}?
                  </h3>
                  <p
                    className="text-white/70 mb-6 max-w-xl mx-auto"
                    style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.7 }}
                  >
                    Junte-se à filarmônica e tenha acesso a aulas, ensaios e apresentações.
                  </p>
                  <Link
                    to="/#contato"
                    className="inline-block px-8 py-3 rounded-full transition-colors"
                    style={{
                      backgroundColor: "#ffc300",
                      color: "#001856",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 700,
                    }}
                  >
                    Falar com a filarmônica
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}