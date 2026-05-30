export interface EventItem {
  id: number;
  slug: string;
  title: string;
  date: string;
  time: string;
  location: string;
  address: string;
  theme: string;
  description: string;
  longDescription: string;
  category: string;
  color: string;
  featured: boolean;
  image: string;
  ticketsUrl: string;
  whatsapp: string;
  price: string;
}

export const events: EventItem[] = [
  {
    id: 1,
    slug: "grande-concerto-de-verao",
    title: "Grande Concerto de Verão",
    date: "15 de Junho, 2026",
    time: "19h30",
    location: "Teatro Municipal — São Paulo",
    address: "Praça Ramos de Azevedo, s/n — República, São Paulo/SP",
    theme: "Clássicos para Metais",
    description:
      "Uma noite inesquecível com as mais belas obras do repertório clássico para metais.",
    longDescription:
      "A Filarmônica de Metais apresenta uma noite especial dedicada às mais belas obras do repertório clássico. O programa inclui fanfarras barrocas, marchas heroicas, transcrições de Bach e Handel, além de arranjos especiais de compositores brasileiros. Uma celebração da força e nobreza dos metais em sua máxima expressão.",
    category: "Concerto",
    color: "#ffc300",
    featured: true,
    image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    ticketsUrl: "https://www.sympla.com.br",
    whatsapp: "5511999998888",
    price: "R$ 80,00 — R$ 220,00",
  },
  {
    id: 2,
    slug: "workshop-de-trompete",
    title: "Workshop de Trompete",
    date: "22 de Junho, 2026",
    time: "10h00",
    location: "Escola de Música — Centro Cultural",
    address: "Rua das Artes, 123 — Centro, São Paulo/SP",
    theme: "Técnica e Musicalidade",
    description:
      "Workshop intensivo para músicos intermediários com foco em técnica e musicalidade.",
    longDescription:
      "Um dia inteiro de imersão dedicado ao trompete. Trabalharemos emissão, articulação, controle dinâmico, leitura à primeira vista e interpretação. Inscrições limitadas a 20 participantes para garantir atenção individual. Inclui apostila e certificado.",
    category: "Workshop",
    color: "#001856",
    featured: false,
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    ticketsUrl: "https://www.sympla.com.br",
    whatsapp: "5511999998888",
    price: "R$ 150,00",
  },
  {
    id: 3,
    slug: "serenata-no-parque",
    title: "Serenata no Parque",
    date: "5 de Julho, 2026",
    time: "17h00",
    location: "Parque Estadual — Ibirapuera",
    address: "Av. Pedro Álvares Cabral, s/n — Vila Mariana, São Paulo/SP",
    theme: "Música ao Ar Livre",
    description:
      "Apresentação ao ar livre gratuita para toda a família.",
    longDescription:
      "A Filarmônica leva música de qualidade para o parque em uma tarde ensolarada. Programa popular com trilhas de cinema, música brasileira e clássicos acessíveis. Traga sua canga, sua família e venha aproveitar uma tarde inesquecível ao ar livre. Entrada totalmente gratuita.",
    category: "Gratuito",
    color: "#ffc300",
    featured: false,
    image: "https://images.unsplash.com/photo-1514119412350-e174d90d280e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    ticketsUrl: "",
    whatsapp: "5511999998888",
    price: "Gratuito",
  },
  {
    id: 4,
    slug: "temporada-de-inverno-2026",
    title: "Temporada de Inverno 2026",
    date: "20 de Julho, 2026",
    time: "20h00",
    location: "Sala São Paulo",
    address: "Praça Júlio Prestes, 16 — Campos Elíseos, São Paulo/SP",
    theme: "Mestres do Barroco e Modernidade Brasileira",
    description:
      "A grande temporada de inverno traz um programa especial com obras de Handel, Bach e compositores brasileiros.",
    longDescription:
      "Em uma das salas de concerto mais bem avaliadas acusticamente do mundo, a Filarmônica apresenta um programa de gala unindo o rigor barroco de Handel e Bach à modernidade vibrante de Villa-Lobos e Camargo Guarnieri. Uma noite imperdível para os apreciadores da grande música.",
    category: "Concerto",
    color: "#001856",
    featured: true,
    image: "https://images.unsplash.com/photo-1519508234439-4f23643125c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    ticketsUrl: "https://www.sympla.com.br",
    whatsapp: "5511999998888",
    price: "R$ 120,00 — R$ 350,00",
  },
];
