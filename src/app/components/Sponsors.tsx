import logo1 from "../../imports/Logo_Colorido_e_Slogan_4x.png";
import logo2 from "../../imports/Ativo_1.png";

const sponsors = [
  { name: "Patrocinador 1", logo: logo1 },
  { name: "Patrocinador 2", logo: logo2 },
  { name: "Patrocinador 3", logo: logo1 },
  { name: "Patrocinador 4", logo: logo2 },
  { name: "Patrocinador 5", logo: logo1 },
  { name: "Patrocinador 6", logo: logo2 },
];

export function Sponsors() {
  const reel = [...sponsors, ...sponsors];

  return (
    <section className="bg-white py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="text-center">
          <span
            className="text-[#ffc300] uppercase tracking-widest"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "13px" }}
          >
            Patrocinadores
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
            Quem acredita no nosso projeto
          </h2>
          <p
            className="text-gray-500 mt-3 max-w-xl mx-auto"
            style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.7 }}
          >
            Empresas e instituições que apoiam a Filarmônica de Metais e tornam
            possível levar música a tantas vidas.
          </p>
        </div>
      </div>

      {/* Marquee */}
      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />

        <div className="flex w-max animate-[sponsor-scroll_30s_linear_infinite] hover:[animation-play-state:paused]">
          {reel.map((sp, i) => (
            <div
              key={i}
              className="flex-none w-56 mx-6 h-32 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
            >
              <img
                src={sp.logo}
                alt={sp.name}
                className="max-h-24 max-w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes sponsor-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
