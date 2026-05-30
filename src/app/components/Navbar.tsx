import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import logoFilarmonica from "../../imports/LOGO_FILARM_NICA-1.png";

interface NavbarProps {
  transparent?: boolean;
}

interface NavItem {
  label: string;
  type: "scroll" | "route";
  target: string;
}

const items: NavItem[] = [
  { label: "Início", type: "route", target: "/" },
  { label: "Sobre Nós", type: "scroll", target: "sobre" },
  { label: "Instrumentos", type: "route", target: "/instrumentos" },
  { label: "Eventos", type: "route", target: "/eventos" },
  { label: "Contato", type: "scroll", target: "contato" },
];

export function Navbar({ transparent = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTo = (id: string) => {
    setMobileOpen(false);
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navBg =
    scrolled || !transparent ? "bg-[#001856] shadow-lg" : "bg-transparent";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logoFilarmonica}
            alt="Filarmônica de Metais"
            className="w-11 h-11 object-contain flex-shrink-0"
          />
          <span
            className="text-white tracking-wider uppercase"
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontWeight: 700,
              fontSize: "15px",
            }}
          >
            Filarmônica de Metais
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-8">
          {items.map((item) =>
            item.type === "route" ? (
              <Link
                key={item.label}
                to={item.target}
                className={`transition-colors cursor-pointer ${
                  location.pathname === item.target
                    ? "text-[#ffc300]"
                    : "text-white/90 hover:text-[#ffc300]"
                }`}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: "16px",
                }}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={() => handleScrollTo(item.target)}
                className="text-white/90 cursor-pointer hover:text-[#ffc300] transition-colors"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: "16px",
                }}
              >
                {item.label}
              </button>
            )
          )}
          <button
            onClick={() => handleScrollTo("contato")}
            className="bg-white cursor-pointer text-[#001856] px-6 py-2 rounded-full hover:bg-[#ffc300] transition-colors"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: "15px",
            }}
          >
            Quero participar
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden text-white"
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#001856] px-6 pb-6 flex flex-col gap-4 border-t border-white/10">
          {items.map((item) =>
            item.type === "route" ? (
              <Link
                key={item.label}
                to={item.target}
                onClick={() => setMobileOpen(false)}
                className="text-white/90 text-left py-2 border-b border-white/10"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={() => handleScrollTo(item.target)}
                className="text-white/90 text-left py-2 border-b border-white/10"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
              >
                {item.label}
              </button>
            )
          )}
          <button
            onClick={() => handleScrollTo("contato")}
            className="bg-[#ffc300] text-[#001856] px-6 py-3 rounded-full mt-2"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
          >
            Quero participar
          </button>
        </div>
      )}
    </nav>
  );
}
