export interface Instrument {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  image: string;
  gallery: string[];
  videoUrl: string;
  color: string;
}

export const instruments: Instrument[] = [
  {
    slug: "trompete",
    name: "Trompete",
    description:
      "O instrumento mais agudo do naipe dos metais. Versátil e brilhante, eternizado no jazz por nomes como Louis Armstrong, Miles Davis e Arturo Sandoval.",
    longDescription:
      "O trompete é o instrumento mais agudo do naipe dos metais. Existem trompetes de vários tipos e afinações como o trompete em Bb (si bemol), trompete em C (dó), Trompete em D (ré), Trompete em Eb (mi bemol), trompete em F (fá) e G (sol), Flugelhorn e trompete piccolo em A(lá)/Bb (si bemol). Porém os mais utilizados são Trompete em Bb e C.\n\nOs músicos especializados no trompete são chamados de trompetistas. O trompete é um instrumento bastante versátil e apesar de integrarem as orquestras sinfônicas, foi no jazz que grandes nomes como Louis Armstrong, Miles Davis, Arturo Sandoval e Thad Jones foram eternizados.",
    image: "https://images.unsplash.com/photo-1627411187044-cc7a4daaca7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1667314467786-c92515abc43d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
      "https://images.unsplash.com/photo-1572017547501-ddc8900d9d6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
      "https://images.unsplash.com/photo-1683723484527-348a2e101d38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    ],
    videoUrl: "https://www.youtube.com/embed/Dx4eGwhFd_Y",
    color: "#ffc300",
  },
  {
    slug: "trombone",
    name: "Trombone",
    description:
      "Instrumento bastante antigo, originado no século XV, antes conhecido como sacabuxa. Único entre os metais por usar uma vara deslizante em vez de pistões.",
    longDescription:
      "O Trombone é um instrumento bastante antigo originado aproximadamente na metade do século XV, que se manteve quase inalterado até os dias de hoje.\n\nNo início era conhecido como sacabuxa e tinha um timbre mais suave e uma sonoridade menos possante que os do trombone moderno, mas o sistema de vara era idêntico ao do atual instrumento. O músico que o domina é chamado de trombonista.",
    image: "https://images.unsplash.com/photo-1547927168-17021e7ef8c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1689204778500-329b194714f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
      "https://images.unsplash.com/photo-1683723484527-348a2e101d38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
      "https://images.unsplash.com/photo-1627411187044-cc7a4daaca7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    ],
    videoUrl: "https://www.youtube.com/embed/4PmHuqy6DtA",
    color: "#001856",
  },
  {
    slug: "trompa",
    name: "Trompa",
    description:
      "Instrumento transpositor afinado em fá, com enorme extensão enrolada sobre si mesma. Permite grande variedade de timbres. O músico que a toca é chamado de trompista.",
    longDescription:
      "A trompa assim como o trompete é um instrumento transpositor, porém afinado em fá. Ela é o segundo instrumento mais agudo na família dos metais, seguindo o trompete. A principal característica da trompa é a sua enorme extensão, enrolada sobre si mesma diversas vezes entre as duas extremidades.\n\nPor essa forma particular, a trompa permite que o músico extraia muitas variedades de timbres. O músico que toca a trompa é chamado de trompista.",
    image: "https://images.unsplash.com/photo-1701748533596-9d5a56a1cfe7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1627764495284-40f6cdf99295?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
      "https://images.unsplash.com/photo-1724198317686-5028781aa6a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
      "https://images.unsplash.com/photo-1742397972404-ba4036749920?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    ],
    videoUrl: "https://www.youtube.com/embed/MeGzP9nuz0I",
    color: "#ffc300",
  },
  {
    slug: "bombardino",
    name: "Bombardino",
    description:
      "Também chamado de eufônio, cujo nome vem de Euphonium — \"som bonito\". Tem timbre escuro, suave e delicado, com extensão semelhante à do trombone.",
    longDescription:
      "O eufônio (português brasileiro) ou bombardino é um aerofone da família dos metais. O eufônio pertence à classe das tubas (tubo mais largo, bocal mais profundo). O nome do instrumento provém da palavra Euphonium que significa \"som bonito\".\n\nAssim é chamado por ter o timbre mais suave e \"redondo\" que o do trombone. Usualmente tem 4, 5 ou 6 válvulas e também é conhecido como tuba tenor. A sua extensão é semelhante à do trombone alcançando 4 oitavas. Este instrumento é caracterizado por um timbre escuro, suave e delicado. O músico que toca este instrumento é chamado de eufonista.",
    image: "https://images.unsplash.com/photo-1601333057494-d20abe2098cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1549264153-48f39faafc60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
      "https://images.unsplash.com/photo-1709145234638-676898c9590f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
      "https://images.unsplash.com/photo-1683723484527-348a2e101d38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    ],
    videoUrl: "https://www.youtube.com/embed/ITsZGd4tlnI",
    color: "#001856",
  },
  {
    slug: "tuba",
    name: "Tuba",
    description:
      "O instrumento mais recente da família dos metais, surgido no século XIX. A base sonora de qualquer conjunto, presente da música clássica às bandas militares.",
    longDescription:
      "A tuba é o mais recente instrumento dessa lista. Ela surgiu em meados do século XIX e desde que foi criada já ganhou um lugar nas orquestras sinfônicas. Existem diversos tamanhos de tuba, como o tenor ou eufônico, o baixo e o contrabaixo.\n\nÉ um instrumento importante na música clássica, mas também ganhou fama em espaços populares, como em bandas de igreja, de música circense e entre os militares. O músico que toca a tuba é chamado de tubista.",
    image: "https://images.unsplash.com/photo-1776611713652-6ad5a5856237?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1650494890554-3114b1e4eac9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
      "https://images.unsplash.com/photo-1680334805813-c3d640d65226?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
      "https://images.unsplash.com/photo-1732869416295-0f308c6689e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    ],
    videoUrl: "https://www.youtube.com/embed/tonaGFKYQ7E",
    color: "#ffc300",
  },
];