export function CTA() {
  return (
    <section
      className="relative isolate overflow-hidden py-24 md:py-32 bg-[#001856]"
    >
      {/* Decorative circles — clipped by overflow-hidden on the section */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-72 h-72 bg-[#ffc300]/10 rounded-full" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 bg-[#ffc300]/5 rounded-full" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <span
          className="inline-block bg-[#ffc300]/20 text-[#ffc300] px-4 py-1 rounded-full mb-6 uppercase tracking-widest"
          style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "13px" }}
        >
          Junte-se a nós
        </span>

        <h2
          className="text-white mb-6"
          style={{
            fontFamily: "'Instrument Sans', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          TEM INTERESSE NO PROJETO?<br />
          <span className="text-[#ffc300]">ESTAMOS PRONTOS PARA TE ATENDER</span>
        </h2>

        <p
          className="text-white/70 mb-10 max-w-xl mx-auto"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.1rem", lineHeight: 1.7 }}
        >
          Não importa sua idade ou experiência musical. Nossa equipe está pronta para te
          acompanhar em cada etapa da sua jornada musical.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-[#ffc300] text-[#001856] px-10 py-4 rounded-full hover:bg-yellow-400 transition-colors"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "1rem" }}
          >
            Entrar em Contato
          </button>
          <button
            onClick={() => document.getElementById("eventos")?.scrollIntoView({ behavior: "smooth" })}
            className="border-2 border-white/50 text-white px-10 py-4 rounded-full hover:border-white hover:bg-white/10 transition-colors"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "1rem" }}
          >
            Ver próximos eventos
          </button>
        </div>
      </div>
    </section>
  );
}
