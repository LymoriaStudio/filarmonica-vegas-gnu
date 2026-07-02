import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type StatItem = {
  value: number;
  prefix: string;
  suffix: string;
  label: string;
  desc: string;
  displayText: string | null;
};

export type EventItem = {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  address: string;
  theme: string;
  description: string;
  longDescription: string;
  category: string;
  featured: boolean;
  image: string;
  ticketsUrl: string;
  whatsapp: string;
  price: string;
};

export type InstrumentItem = {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  image: string;
  gallery: string[];
  videoUrl: string;
  color: string;
};

export type TestimonialItem = {
  id: number;
  name: string;
  category: "Aluno" | "Pai / Mãe";
  tag: string;
  text: string;
  initials: string;
};

export type TeamMember = {
  name: string;
  role: string;
  short: string;
  full: string;
  imageUrl: string;
  objectPosition: string;
};

export type HeroSlide = {
  id: number;
  image: string;
  title: string;
  subtitle: string;
};

export type ContactInfo = {
  email: string;
  phone: string;
  address: string;
};

// ─── Defaults ────────────────────────────────────────────────────────────────

export const defaultStats: StatItem[] = [
  { value: 50, prefix: "+", suffix: "", label: "Alunos formados", desc: "Alunos que já passaram pelo projeto desde 2022.", displayText: null },
  { value: 4, prefix: "+", suffix: " Anos", label: "Em atividade", desc: "Crescendo em qualidade e abrangência.", displayText: null },
  { value: 2, prefix: "", suffix: "", label: "Em grupo, práticas e teóricas", desc: "Com apoio de psicólogo e assistente social.", displayText: "Aulas semanais" },
  { value: 100, prefix: "", suffix: "%", label: "Projeto social", desc: "Todos os alunos participam gratuitamente.", displayText: null },
];

export const defaultEvents: EventItem[] = [
  { id: 1, title: "Grande Concerto de Verão", date: "15 de Junho, 2026", time: "19h30", location: "Teatro Municipal — São Paulo", address: "Praça Ramos de Azevedo, s/n — República, São Paulo/SP", theme: "Clássicos para Metais", description: "Uma noite inesquecível com as mais belas obras do repertório clássico para metais.", longDescription: "A Filarmônica de Metais apresenta uma noite especial dedicada às mais belas obras do repertório clássico. O programa inclui fanfarras barrocas, marchas heroicas, transcrições de Bach e Handel, além de arranjos especiais de compositores brasileiros.", category: "Concerto", featured: true, image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600", ticketsUrl: "https://www.sympla.com.br", whatsapp: "5519998453478", price: "R$ 80,00 — R$ 220,00" },
  { id: 2, title: "Workshop de Trompete", date: "22 de Junho, 2026", time: "10h00", location: "Escola de Música — Centro Cultural", address: "Rua das Artes, 123 — Centro, São Paulo/SP", theme: "Técnica e Musicalidade", description: "Workshop intensivo para músicos intermediários com foco em técnica e musicalidade.", longDescription: "Um dia inteiro de imersão dedicado ao trompete. Trabalharemos emissão, articulação, controle dinâmico, leitura à primeira vista e interpretação. Inscrições limitadas a 20 participantes.", category: "Workshop", featured: false, image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600", ticketsUrl: "https://www.sympla.com.br", whatsapp: "5519998453478", price: "R$ 150,00" },
  { id: 3, title: "Serenata no Parque", date: "5 de Julho, 2026", time: "17h00", location: "Parque Estadual — Ibirapuera", address: "Av. Pedro Álvares Cabral, s/n — Vila Mariana, São Paulo/SP", theme: "Música ao Ar Livre", description: "Apresentação ao ar livre gratuita para toda a família.", longDescription: "A Filarmônica leva música de qualidade para o parque em uma tarde ensolarada. Programa popular com trilhas de cinema, música brasileira e clássicos acessíveis.", category: "Gratuito", featured: false, image: "https://images.unsplash.com/photo-1514119412350-e174d90d280e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600", ticketsUrl: "", whatsapp: "5519998453478", price: "Gratuito" },
  { id: 4, title: "Temporada de Inverno 2026", date: "20 de Julho, 2026", time: "20h00", location: "Sala São Paulo", address: "Praça Júlio Prestes, 16 — Campos Elíseos, São Paulo/SP", theme: "Mestres do Barroco e Modernidade Brasileira", description: "A grande temporada de inverno traz um programa especial com obras de Handel, Bach e compositores brasileiros.", longDescription: "Em uma das salas de concerto mais bem avaliadas acusticamente do mundo, a Filarmônica apresenta um programa de gala unindo o rigor barroco de Handel e Bach à modernidade de Villa-Lobos.", category: "Concerto", featured: true, image: "https://images.unsplash.com/photo-1519508234439-4f23643125c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600", ticketsUrl: "https://www.sympla.com.br", whatsapp: "5519998453478", price: "R$ 120,00 — R$ 350,00" },
];

export const defaultInstruments: InstrumentItem[] = [
  { slug: "trompete", name: "Trompete", description: "O instrumento mais agudo do naipe dos metais. Versátil e brilhante, eternizado no jazz por nomes como Louis Armstrong, Miles Davis e Arturo Sandoval.", longDescription: "O trompete é o instrumento mais agudo do naipe dos metais. Existem trompetes de vários tipos e afinações como o trompete em Bb (si bemol), trompete em C (dó), Trompete em D (ré), Trompete em Eb (mi bemol), trompete em F (fá) e G (sol), Flugelhorn e trompete piccolo em A(lá)/Bb (si bemol). Porém os mais utilizados são Trompete em Bb e C.\n\nOs músicos especializados no trompete são chamados de trompetistas. O trompete é um instrumento bastante versátil e apesar de integrarem as orquestras sinfônicas, foi no jazz que grandes nomes como Louis Armstrong, Miles Davis, Arturo Sandoval e Thad Jones foram eternizados.", image: "https://images.unsplash.com/photo-1627411187044-cc7a4daaca7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200", gallery: ["https://images.unsplash.com/photo-1667314467786-c92515abc43d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200", "https://images.unsplash.com/photo-1572017547501-ddc8900d9d6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200", "https://images.unsplash.com/photo-1683723484527-348a2e101d38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"], videoUrl: "https://www.youtube.com/embed/Dx4eGwhFd_Y", color: "#ffc300" },
  { slug: "trombone", name: "Trombone", description: "Instrumento bastante antigo, originado no século XV, antes conhecido como sacabuxa. Único entre os metais por usar uma vara deslizante em vez de pistões.", longDescription: "O Trombone é um instrumento bastante antigo originado aproximadamente na metade do século XV, que se manteve quase inalterado até os dias de hoje.\n\nNo início era conhecido como sacabuxa e tinha um timbre mais suave e uma sonoridade menos possante que os do trombone moderno, mas o sistema de vara era idêntico ao do atual instrumento. O músico que o domina é chamado de trombonista.", image: "https://images.unsplash.com/photo-1547927168-17021e7ef8c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200", gallery: ["https://images.unsplash.com/photo-1689204778500-329b194714f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200", "https://images.unsplash.com/photo-1683723484527-348a2e101d38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200", "https://images.unsplash.com/photo-1627411187044-cc7a4daaca7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"], videoUrl: "https://www.youtube.com/embed/4PmHuqy6DtA", color: "#001856" },
  { slug: "trompa", name: "Trompa", description: "Instrumento transpositor afinado em fá, com enorme extensão enrolada sobre si mesma. Permite grande variedade de timbres. O músico que a toca é chamado de trompista.", longDescription: "A trompa assim como o trompete é um instrumento transpositor, porém afinado em fá. Ela é o segundo instrumento mais agudo na família dos metais, seguindo o trompete. A principal característica da trompa é a sua enorme extensão, enrolada sobre si mesma diversas vezes entre as duas extremidades.\n\nPor essa forma particular, a trompa permite que o músico extraia muitas variedades de timbres. O músico que toca a trompa é chamado de trompista.", image: "https://images.unsplash.com/photo-1701748533596-9d5a56a1cfe7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200", gallery: ["https://images.unsplash.com/photo-1627764495284-40f6cdf99295?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200", "https://images.unsplash.com/photo-1724198317686-5028781aa6a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200", "https://images.unsplash.com/photo-1742397972404-ba4036749920?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"], videoUrl: "https://www.youtube.com/embed/MeGzP9nuz0I", color: "#ffc300" },
  { slug: "bombardino", name: "Bombardino", description: "Também chamado de eufônio, cujo nome vem de Euphonium — \"som bonito\". Tem timbre escuro, suave e delicado, com extensão semelhante à do trombone.", longDescription: "O eufônio (português brasileiro) ou bombardino é um aerofone da família dos metais. O eufônio pertence à classe das tubas (tubo mais largo, bocal mais profundo). O nome do instrumento provém da palavra Euphonium que significa \"som bonito\".\n\nAssim é chamado por ter o timbre mais suave e \"redondo\" que o do trombone. Usualmente tem 4, 5 ou 6 válvulas e também é conhecido como tuba tenor. A sua extensão é semelhante à do trombone alcançando 4 oitavas.", image: "https://images.unsplash.com/photo-1601333057494-d20abe2098cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200", gallery: ["https://images.unsplash.com/photo-1549264153-48f39faafc60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200", "https://images.unsplash.com/photo-1709145234638-676898c9590f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200", "https://images.unsplash.com/photo-1683723484527-348a2e101d38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"], videoUrl: "https://www.youtube.com/embed/ITsZGd4tlnI", color: "#001856" },
  { slug: "tuba", name: "Tuba", description: "O instrumento mais recente da família dos metais, surgido no século XIX. A base sonora de qualquer conjunto, presente da música clássica às bandas militares.", longDescription: "A tuba é o mais recente instrumento dessa lista. Ela surgiu em meados do século XIX e desde que foi criada já ganhou um lugar nas orquestras sinfônicas. Existem diversos tamanhos de tuba, como o tenor ou eufônico, o baixo e o contrabaixo.\n\nÉ um instrumento importante na música clássica, mas também ganhou fama em espaços populares, como em bandas de igreja, de música circense e entre os militares.", image: "https://images.unsplash.com/photo-1776611713652-6ad5a5856237?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200", gallery: ["https://images.unsplash.com/photo-1650494890554-3114b1e4eac9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200", "https://images.unsplash.com/photo-1680334805813-c3d640d65226?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200", "https://images.unsplash.com/photo-1732869416295-0f308c6689e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"], videoUrl: "https://www.youtube.com/embed/tonaGFKYQ7E", color: "#ffc300" },
];

export const defaultTestimonials: TestimonialItem[] = [
  { id: 1, name: "Mãe da Lara Franca", category: "Pai / Mãe", tag: "Orgulho e resiliência", text: "Ver a dedicação da Lara para tirar o som perfeito e dominar cada nota me enche de orgulho. A Filarmônica ensina que a evolução vem do esforço contínuo, transformando a frustração inicial em pura resiliência.", initials: "LF" },
  { id: 2, name: "Mãe do Davi Franca", category: "Pai / Mãe", tag: "Pertencimento e segurança", text: "Antes das aulas na Filarmônica, o Davi era mais retraído e inseguro. A superação de cada partitura e o incentivo dos professores trouxeram uma segurança que ele levou para a vida escolar e social.", initials: "DF" },
  { id: 3, name: "Ilda", category: "Pai / Mãe", tag: "Acolhimento e família", text: "A Filarmônica contribuiu muito para a socialização e o comprometimento do meu filho Vinícius. O acompanhamento com profissionais capacitados e dedicados faz toda a diferença. É um lugar acolhedor, uma verdadeira família.", initials: "IL" },
  { id: 4, name: "Mamãe do Arthur Dias", category: "Pai / Mãe", tag: "Disciplina e responsabilidade", text: "A Filarmônica tem sido muito importante na vida do meu filho. Além de proporcionar o aprendizado musical, ela contribui para o desenvolvimento da disciplina, da responsabilidade e do trabalho em equipe.", initials: "AD" },
  { id: 5, name: "Felipe Alves Tiandim", category: "Aluno", tag: "Aprendizado e comunicação", text: "A Filarmônica representa mais do que uma aula de música. É uma experiência única e divertida para aprender. Ela contribuiu para a minha vida social e pessoal, me ensinando a ser mais sociável, ter mais paciência e me comunicar melhor.", initials: "FA" },
  { id: 6, name: "Mirela Inês Horta Gilcel", category: "Aluno", tag: "Respeito e trabalho em equipe", text: "Para mim, a Filarmônica significa muito. Foi a minha primeira escola de música e abriu um livro de possibilidades. Além disso, ela me ensina a respeitar as pessoas como elas são e, principalmente, a me respeitar.", initials: "MI" },
  { id: 7, name: "Vinícius A. Cesolin", category: "Aluno", tag: "Socialização e felicidade", text: "A Filarmônica me ensinou a ser feliz, porque me ajudou a socializar cada vez mais. Fico alegre com meus amigos e aprendi muitas coisas na Filarmônica, como as notas musicais. Os professores ensinam muito bem.", initials: "VC" },
  { id: 8, name: "Emanuelly Lisboa Giunco", category: "Aluno", tag: "Segunda casa e inspiração", text: "Para mim, a Filarmônica é muito mais do que um espaço para aprender música. É uma segunda casa, um lugar onde encontro amizade, disciplina e muita inspiração.", initials: "EL" },
  { id: 9, name: "Lara Arião Franca", category: "Aluno", tag: "Afeto e acolhimento", text: "A Filarmônica significa amor, carinho e cuidado. Não tenho palavras para falar tudo o que ela representa. Ela contribui não só para aprender a tocar bem, mas também com a amizade, o respeito, a alegria, a felicidade e a empatia.", initials: "LA" },
];

export const defaultTeam: TeamMember[] = [
  { name: "Raphael Rodrigues", role: "Maestro, Coordenador Pedagógico e Cofundador", short: "Mestrando em Música pela UNICAMP, maestro, pesquisador, trompetista e educador musical, com trajetória entre importantes orquestras e bandas sinfônicas.", full: "Mestrando em Música pela UNICAMP, Raphael Rodrigues é maestro, pesquisador, trompetista e educador musical, com trajetória construída entre importantes orquestras, bandas sinfônicas e projetos de formação artística. Cofundador da Filarmônica de Metais GNU/VEGAS, atua na direção pedagógica e artística do projeto, desenvolvendo um trabalho que une excelência musical, impacto social e formação humana.", imageUrl: "", objectPosition: "center 15%" },
  { name: "Hannel Baungartner", role: "Sócio Fundador do Grupo Vegas e Cofundador", short: "Empresário e idealizador de projetos voltados ao desenvolvimento social e cultural, incentiva a cultura, educação e transformação social por meio da música.", full: "Empresário e idealizador de projetos voltados ao desenvolvimento social e cultural, Hannel Baungartner é sócio fundador do Grupo Vegas e cofundador da Filarmônica. Sua atuação é marcada pelo incentivo à cultura, educação e transformação social por meio da música, apoiando iniciativas que ampliam oportunidades e fortalecem o impacto positivo na comunidade.", imageUrl: "", objectPosition: "center 15%" },
  { name: "Chris", role: "Cofundador e Empreendedor Cultural", short: "Proprietário do espaço cultural GNU, atua no fortalecimento da cena artística e no incentivo a projetos culturais independentes.", full: "Cofundador da Filarmônica e proprietário do espaço cultural GNU, Chris atua no fortalecimento da cena artística e no incentivo a projetos culturais independentes. Seu trabalho conecta música, cultura e comunidade, criando ambientes que promovem experiências artísticas, desenvolvimento social e acesso à cultura.", imageUrl: "", objectPosition: "center 15%" },
  { name: "Djinane Panegassi Pavan", role: "Secretária e Gestão de Relacionamento", short: "Graduada em Administração, com especializações em Marketing, Psicanálise e Desenho Projetivo. Cuida da organização e do acolhimento das famílias.", full: "Graduada em Administração, com especializações em Administração, Marketing, Psicanálise e Desenho Projetivo, Djinane atua na organização administrativa e acolhimento das famílias na Filarmônica de Metais GNU/VEGAS.", imageUrl: "", objectPosition: "center 15%" },
  { name: "Douglas Winder", role: "Psicólogo Clínico e Desenvolvimento Humano", short: "Promove acolhimento emocional, fortalecimento de vínculos e desenvolvimento coletivo de crianças e adolescentes por meio da música.", full: "Psicólogo clínico, Douglas Winder atua na Filarmônica de Metais promovendo acolhimento emocional, fortalecimento de vínculos e desenvolvimento coletivo de crianças e adolescentes. Seu trabalho integra rodas de conversa, escuta ativa e atividades socioemocionais.", imageUrl: "", objectPosition: "center 15%" },
  { name: "Juliana Assis", role: "Assistente Social", short: "Especializada em saúde mental, desenvolve acompanhamento familiar, fortalecimento da autonomia e promoção de direitos sociais.", full: "Assistente social especializada em saúde mental, Juliana Assis desenvolve na Filarmônica um trabalho voltado ao acompanhamento familiar, fortalecimento da autonomia e promoção de direitos sociais.", imageUrl: "", objectPosition: "center 50%" },
];

export const defaultHeroSlides: HeroSlide[] = [
  { id: 0, image: "https://images.unsplash.com/photo-1777226407432-801354c2ea42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", title: "Música que\ntransforma vidas", subtitle: "A Filarmônica de Metais leva a arte da música a comunidades, formando músicos e cidadãos desde 2022." },
  { id: 1, image: "https://images.unsplash.com/photo-1745618409909-2c1af496c812?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600", title: "Patrocine a\nfilarmônica", subtitle: "Empresas patrocinadoras têm seu nome e marca vinculados em todas as nossas mídias — site, redes sociais e eventos — fortalecendo a imagem da sua marca junto à cultura." },
  { id: 2, image: "https://images.unsplash.com/photo-1774515905600-429e3fef8f16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", title: "Tradição e paixão\nem cada nota", subtitle: "Mais de 100 músicos unidos pelo amor aos instrumentos de sopro e pela excelência musical." },
  { id: 3, image: "https://images.unsplash.com/photo-1776611713652-6ad5a5856237?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", title: "Um projeto social\nque ecoa pelo Brasil", subtitle: "Apresentações, workshops e aulas gratuitas para jovens talentos em todo o país." },
];

export const defaultContact: ContactInfo = {
  email: "filarmonicademetais@gmail.com",
  phone: "(19) 99845-3478",
  address: "R. Padre Avelino Canaza, 258 – Vila Galo, Americana – SP, 13466-340",
};

// ─── Context ──────────────────────────────────────────────────────────────────

type SiteDataContextType = {
  stats: StatItem[];
  setStats: (s: StatItem[]) => void;
  events: EventItem[];
  setEvents: (e: EventItem[]) => void;
  instruments: InstrumentItem[];
  setInstruments: (i: InstrumentItem[]) => void;
  testimonials: TestimonialItem[];
  setTestimonials: (t: TestimonialItem[]) => void;
  team: TeamMember[];
  setTeam: (t: TeamMember[]) => void;
  heroSlides: HeroSlide[];
  setHeroSlides: (h: HeroSlide[]) => void;
  contact: ContactInfo;
  setContact: (c: ContactInfo) => void;
  resetAll: () => void;
};

const SiteDataContext = createContext<SiteDataContextType>({} as SiteDataContextType);

function load<T>(key: string, def: T): T {
  try {
    const s = localStorage.getItem(key);
    return s ? (JSON.parse(s) as T) : def;
  } catch {
    return def;
  }
}

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [stats, setStatsRaw] = useState<StatItem[]>(() => load("adm_stats", defaultStats));
  const [events, setEventsRaw] = useState<EventItem[]>(() => load("adm_events", defaultEvents));
  const [instruments, setInstrumentsRaw] = useState<InstrumentItem[]>(() => load("adm_instruments", defaultInstruments));
  const [testimonials, setTestimonialsRaw] = useState<TestimonialItem[]>(() => load("adm_testimonials", defaultTestimonials));
  const [team, setTeamRaw] = useState<TeamMember[]>(() => load("adm_team", defaultTeam));
  const [heroSlides, setHeroSlidesRaw] = useState<HeroSlide[]>(() => load("adm_hero", defaultHeroSlides));
  const [contact, setContactRaw] = useState<ContactInfo>(() => load("adm_contact", defaultContact));

  useEffect(() => { localStorage.setItem("adm_stats", JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem("adm_events", JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem("adm_instruments", JSON.stringify(instruments)); }, [instruments]);
  useEffect(() => { localStorage.setItem("adm_testimonials", JSON.stringify(testimonials)); }, [testimonials]);
  useEffect(() => { localStorage.setItem("adm_team", JSON.stringify(team)); }, [team]);
  useEffect(() => { localStorage.setItem("adm_hero", JSON.stringify(heroSlides)); }, [heroSlides]);
  useEffect(() => { localStorage.setItem("adm_contact", JSON.stringify(contact)); }, [contact]);

  const resetAll = () => {
    setStatsRaw(defaultStats);
    setEventsRaw(defaultEvents);
    setInstrumentsRaw(defaultInstruments);
    setTestimonialsRaw(defaultTestimonials);
    setTeamRaw(defaultTeam);
    setHeroSlidesRaw(defaultHeroSlides);
    setContactRaw(defaultContact);
    ["adm_stats","adm_events","adm_instruments","adm_testimonials","adm_team","adm_hero","adm_contact"].forEach(k => localStorage.removeItem(k));
  };

  return (
    <SiteDataContext.Provider value={{
      stats, setStats: setStatsRaw,
      events, setEvents: setEventsRaw,
      instruments, setInstruments: setInstrumentsRaw,
      testimonials, setTestimonials: setTestimonialsRaw,
      team, setTeam: setTeamRaw,
      heroSlides, setHeroSlides: setHeroSlidesRaw,
      contact, setContact: setContactRaw,
      resetAll,
    }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export const useSiteData = () => useContext(SiteDataContext);
