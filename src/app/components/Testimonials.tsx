import { Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Lucas Oliveira",
    role: "Trompetista — 3 anos na Filarmônica",
    text: "Entrei sem saber nada de música. Hoje sou músico profissional graças ao projeto. A filarmônica mudou completamente minha perspectiva de vida e me abriu portas que eu jamais imaginaria.",
    avatar: "https://images.unsplash.com/photo-1642048147215-c2b4d4cee877?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
  },
  {
    id: 2,
    name: "Carla Menezes",
    role: "Trombonista — 2 anos na Filarmônica",
    text: "A sensação de tocar no palco com toda a orquestra é indescritível. A dedicação dos maestros e colegas cria um ambiente único de aprendizado e companheirismo que vai muito além da música.",
    avatar: "https://images.unsplash.com/photo-1620194838305-435750454c95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
  },
  {
    id: 3,
    name: "Juliana Santos",
    role: "Mãe do João, 12 anos — aluno de trompa",
    text: "Inscrevi meu filho no projeto há um ano e a transformação foi enorme. Além de aprender música, ele ganhou disciplina, amigos e autoconfiança. Como mãe, ver o orgulho dele em cada apresentação não tem preço — recomendo a todos os pais.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
  },
];

export function Testimonials() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <span
            className="text-[#ffc300] uppercase tracking-widest"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "13px" }}
          >
            Depoimentos
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
            Acompanhe relatos de quem<br />vive a experiência da Filarmônica
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col"
            >
              <Quote size={32} className="text-[#ffc300] mb-4 flex-shrink-0" />
              <p
                className="text-gray-600 leading-relaxed flex-1 mb-6"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.95rem" }}
              >
                "{t.text}"
              </p>
              <div className="flex items-center gap-4 mt-auto pt-4 border-t border-gray-100">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <div>
                  <p
                    className="text-[#001856]"
                    style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
                  >
                    {t.name}
                  </p>
                  <p
                    className="text-gray-400"
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}
                  >
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
