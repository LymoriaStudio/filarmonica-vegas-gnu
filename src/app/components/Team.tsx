import { useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import imgRaphael from "../../imports/MAESTRO_RAFAEL.png";
import imgHannel from "../../imports/HANNEL.png";
import imgChris from "../../imports/CHRIS.png";
import imgDjinane from "../../imports/DJINANE.png";
import imgJuliana from "../../imports/JULIANA-1.png";

type Member = {
  name: string;
  role: string;
  short: string;
  full: string;
  image: string;
  objectPosition?: string;
  scale?: number;
};

const team: Member[] = [
  {
    name: "Raphael Rodrigues",
    role: "Maestro, Coordenador Pedagógico e Cofundador",
    short:
      "Mestrando em Música pela UNICAMP, maestro, pesquisador, trompetista e educador musical, com trajetória entre importantes orquestras e bandas sinfônicas.",
    full: "Mestrando em Música pela UNICAMP, Raphael Rodrigues é maestro, pesquisador, trompetista e educador musical, com trajetória construída entre importantes orquestras, bandas sinfônicas e projetos de formação artística. Cofundador da Filarmônica de Metais GNU/VEGAS, atua na direção pedagógica e artística do projeto, desenvolvendo um trabalho que une excelência musical, impacto social e formação humana. Ao longo de sua carreira, participou de masterclasses com grandes nomes nacionais e internacionais da música, atuou como músico e regente convidado em diversas formações sinfônicas e consolidou sua atuação como referência na educação musical e no desenvolvimento de jovens talentos.",
    image: imgRaphael,
    objectPosition: "center 15%",
  },
  {
    name: "Hannel Baumgartner",
    role: "Sócio Fundador do Grupo Vegas e Cofundador",
    short:
      "Empresário e idealizador de projetos voltados ao desenvolvimento social e cultural, incentiva a cultura, educação e transformação social por meio da música.",
    full: "Empresário e idealizador de projetos voltados ao desenvolvimento social e cultural, Hannel Baumgartner é sócio fundador do Grupo Vegas e cofundador da Filarmônica. Sua atuação é marcada pelo incentivo à cultura, educação e transformação social por meio da música, apoiando iniciativas que ampliam oportunidades e fortalecem o impacto positivo na comunidade.",
    image: imgHannel,
    objectPosition: "center 15%",
  },
  {
    name: "Chris",
    role: "Cofundador e Empreendedor Cultural",
    short:
      "Proprietário do espaço cultural GNU, atua no fortalecimento da cena artística e no incentivo a projetos culturais independentes.",
    full: "Cofundador da Filarmônica e proprietário do espaço cultural GNU, Chris atua no fortalecimento da cena artística e no incentivo a projetos culturais independentes. Seu trabalho conecta música, cultura e comunidade, criando ambientes que promovem experiências artísticas, desenvolvimento social e acesso à cultura.",
    image: imgChris,
    objectPosition: "center 15%",
  },
  {
    name: "Djinane Panegassi Pavan",
    role: "Secretária e Gestão de Relacionamento",
    short:
      "Graduada em Administração, com especializações em Marketing, Psicanálise e Desenho Projetivo. Cuida da organização e do acolhimento das famílias.",
    full: "Graduada em Administração, com especializações em Administração, Marketing, Psicanálise e Desenho Projetivo, Djinane atua na organização administrativa e acolhimento das famílias na Filarmônica de Metais GNU/VEGAS. Seu trabalho envolve gestão de matrículas, apoio aos eventos e acompanhamento próximo das crianças e responsáveis, contribuindo para um ambiente humano, organizado e acolhedor.",
    image: imgDjinane,
    objectPosition: "center 15%",
  },
  {
    name: "Douglas Winder",
    role: "Psicólogo Clínico e Desenvolvimento Humano",
    short:
      "Promove acolhimento emocional, fortalecimento de vínculos e desenvolvimento coletivo de crianças e adolescentes por meio da música.",
    full: "Psicólogo clínico, Douglas Winder atua na Filarmônica de Metais promovendo acolhimento emocional, fortalecimento de vínculos e desenvolvimento coletivo de crianças e adolescentes. Seu trabalho integra rodas de conversa, escuta ativa e atividades socioemocionais, utilizando a música e o ambiente cultural como ferramentas de transformação humana e social.",
    image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=600&q=80",
    objectPosition: "top center",
  },
  {
    name: "Juliana Assis",
    role: "Assistente Social",
    short:
      "Especializada em saúde mental, desenvolve acompanhamento familiar, fortalecimento da autonomia e promoção de direitos sociais.",
    full: "Assistente social especializada em saúde mental, Juliana Assis desenvolve na Filarmônica um trabalho voltado ao acompanhamento familiar, fortalecimento da autonomia e promoção de direitos sociais. Sua atuação busca compreender o contexto social das crianças e adolescentes atendidos, contribuindo para o desenvolvimento humano, emocional e comunitário dos participantes do projeto.",
    image: imgJuliana,
    objectPosition: "center 50%",
    scale: 1.2,
  },
];

export function Team() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="equipe" className="bg-[#f7f8fb] py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span
            className="text-[#ffc300] uppercase tracking-widest"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "13px" }}
          >
            Quem faz acontecer
          </span>
          <h2
            className="text-[#001856] mt-2"
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              lineHeight: 1.2,
            }}
          >
            Sobre nós
          </h2>
          <p
            className="text-gray-500 mt-4 max-w-2xl mx-auto"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.05rem", lineHeight: 1.7 }}
          >
            Uma equipe multidisciplinar que une excelência artística, gestão, educação e
            cuidado humano para transformar vidas por meio da música.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((m, i) => {
            const open = openIndex === i;
            return (
              <article
                key={m.name}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow flex flex-col"
              >
                <div className="relative aspect-square overflow-hidden bg-[#001856]">
                  <ImageWithFallback
                    src={m.image}
                    alt={m.name}
                    className="w-full h-full object-cover"
                    style={{
                      objectPosition: m.objectPosition ?? "center center",
                      transform: m.scale ? `scale(${m.scale})` : undefined,
                      transformOrigin: m.objectPosition ?? "center center",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#001856]/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <h3
                      style={{
                        fontFamily: "'Instrument Sans', sans-serif",
                        fontWeight: 700,
                        fontSize: "1.35rem",
                        lineHeight: 1.2,
                      }}
                    >
                      {m.name}
                    </h3>
                    <p
                      className="text-[#ffc300] mt-1"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                      }}
                    >
                      {m.role}
                    </p>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <p
                    className="text-gray-600"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.95rem",
                      lineHeight: 1.65,
                    }}
                  >
                    {open ? m.full : m.short}
                  </p>
                  <button
                    onClick={() => setOpenIndex(open ? null : i)}
                    className="mt-4 self-start text-[#001856] hover:text-[#ffc300] transition-colors inline-flex items-center gap-1"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                    }}
                  >
                    {open ? "Ler menos" : "Ler mais"}
                    <span
                      className="transition-transform"
                      style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
                    >
                      ↓
                    </span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
}
