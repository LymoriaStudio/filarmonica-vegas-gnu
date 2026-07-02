import { Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Mãe da Lara Franca",
    role: "Mãe de aluna — Pai / Mãe",
    text: "Ver a dedicação da Lara para tirar o som perfeito e dominar cada nota me enche de orgulho. A Filarmônica ensina que a evolução vem do esforço contínuo, transformando a frustração inicial em pura resiliência.",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
  },
  {
    id: 2,
    name: "Mãe do Davi Franca",
    role: "Mãe de aluno — Pai / Mãe",
    text: "Antes das aulas na Filarmônica, o Davi era mais retraído e inseguro. A superação de cada partitura e o incentivo dos professores trouxeram uma segurança que ele levou para a vida escolar e social. As apresentações e a convivência com outros alunos criaram um senso de pertencimento crucial para essa fase da vida.",
    avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
  },
  {
    id: 3,
    name: "Ilda",
    role: "Mãe do Vinícius — Pai / Mãe",
    text: "A Filarmônica contribuiu muito para a socialização e o comprometimento do meu filho Vinícius. O acompanhamento com profissionais capacitados e dedicados faz toda a diferença no aprendizado. Além disso, promove festas comemorativas uma vez ao mês, que as crianças amam. É um lugar acolhedor, uma verdadeira família.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
  },
  {
    id: 4,
    name: "Mamãe do Arthur Dias",
    role: "Mãe de aluno — Pai / Mãe",
    text: "A Filarmônica tem sido muito importante na vida do meu filho. Além de proporcionar o aprendizado musical, ela contribui para o desenvolvimento da disciplina, da responsabilidade e do trabalho em equipe. Percebo que ele ficou mais dedicado, confiante e comprometido com seus objetivos.",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
  },
  {
    id: 5,
    name: "Felipe Alves Tiandim",
    role: "Aluno — Filarmônica de Metais",
    text: "A Filarmônica representa mais do que uma aula de música. É uma experiência única e divertida para aprender. Ela contribuiu para a minha vida social e pessoal, me ensinando a ser mais sociável, ter mais paciência e me comunicar melhor.",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
  },
  {
    id: 6,
    name: "Mirela Inês Horta Gilcel",
    role: "Aluna — Filarmônica de Metais",
    text: "Para mim, a Filarmônica significa muito. Foi a minha primeira escola de música e abriu um livro de possibilidades. Além disso, ela me ensina a respeitar as pessoas como elas são e, principalmente, a me respeitar. Por isso, aprendo a gostar de trabalhar em equipe. Obrigada, Filarmônica.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
  },
  {
    id: 7,
    name: "Vinícius A. Cesolin",
    role: "Aluno — Filarmônica de Metais",
    text: "A Filarmônica me ensinou a ser feliz, porque me ajudou a socializar cada vez mais. Fico alegre com meus amigos e aprendi muitas coisas na Filarmônica, como as notas musicais. Os professores ensinam muito bem e eu acho esse projeto incrível.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
  },
  {
    id: 8,
    name: "Emanuelly Lisboa Giunco",
    role: "Aluna — Filarmônica de Metais",
    text: "Para mim, a Filarmônica é muito mais do que um espaço para aprender música. É uma segunda casa, um lugar onde encontro amizade, disciplina e muita inspiração.",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
  },
  {
    id: 9,
    name: "Lara Arião Franca",
    role: "Aluna — Filarmônica de Metais",
    text: "A Filarmônica significa amor, carinho e cuidado. Não tenho palavras para falar tudo o que ela representa, porque significa mais do que palavras. Ela contribui não só para aprender a tocar bem, mas também com a amizade, o respeito, o amor, o carinho, a alegria, a felicidade, a empatia e muito mais.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
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
