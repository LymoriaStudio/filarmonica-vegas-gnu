import { Instagram, Facebook, Youtube } from "lucide-react";
import logoFilarmonica from "../../imports/LOGO_FILARM_NICA-1.png";

const footerLinks = {
  "A Filarmônica": [
    { label: "Sobre Nós", id: "sobre" },
    { label: "Nossa História", id: "sobre" },
    { label: "Equipe", id: "sobre" },
    { label: "Parceiros", id: "contato" },
  ],
  "Programas": [
    { label: "Aulas de Instrumento", id: "instrumentos" },
    { label: "Ensaios Coletivos", id: "sobre" },
    { label: "Concertos", id: "eventos" },
    { label: "Workshops", id: "eventos" },
  ],
  "Contato": [
    { label: "Fale Conosco", id: "contato" },
    { label: "Seja um Músico", id: "contato" },
    { label: "Seja Parceiro", id: "contato" },
    { label: "Imprensa", id: "contato" },
  ],
};

export function Footer() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-[#000833] text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <img
                src={logoFilarmonica}
                alt="Filarmônica de Metais"
                className="w-32 h-32 object-contain flex-shrink-0"
              />
              <span
                className="text-white tracking-wider uppercase"
                style={{ fontFamily: "'Instrument Sans', sans-serif", fontWeight: 700, fontSize: "14px" }}
              >
                Filarmônica de Metais
              </span>
            </div>
            <p
              className="text-white/50 leading-relaxed mb-6 max-w-xs"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem" }}
            >
              Um projeto social dedicado a democratizar o acesso à música erudita, transformando vidas por meio dos instrumentos de metal desde 2022.
            </p>
            <div className="flex gap-4">
              {[
                { icon: <Instagram size={18} />, href: "https://www.instagram.com/filarmonicademetais?igsh=MWQ0MmszbWhic2g4eg==" },
                { icon: <Facebook size={18} />, href: "#" },
                { icon: <Youtube size={18} />, href: "https://youtube.com/@filarmonicademetais1215?si=dbFW-IkjdOfZzzAt" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#ffc300] hover:text-[#001856] transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4
                className="text-[#ffc300] mb-5 uppercase tracking-wider"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "12px" }}
              >
                {category}
              </h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => scrollTo(link.id)}
                      className="text-white/50 hover:text-white transition-colors text-left"
                      style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem" }}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Contact info bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap gap-6 text-white/40 text-sm">
            <span style={{ fontFamily: "'Inter', sans-serif" }}>📧 filarmonicademetais@gmail.com</span>
            <span style={{ fontFamily: "'Inter', sans-serif" }}>📞 (19) 99845-3478</span>
            <span style={{ fontFamily: "'Inter', sans-serif" }}>📍 R. Padre Avelino Canaza, 258 – Americana, SP</span>
          </div>
          <p
            className="text-white/30 text-sm"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            © 2025 Filarmônica de Metais. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}