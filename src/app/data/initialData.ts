
import {
  Banner,
  SiteStatistics,
  ValueItem,
  TimelineEvent,
  Professor,
  Student,
  Organizer,
  Supporter,
  AcademyCourse,
  OrchestraEvent,
  GalleryMedia,
  NewsArticle,
  InterestFormResponse,
  SupportFormResponse,
  DirectDonation,
  ContactMessage,
  AppUser,
  LibraryFile,
  AuditLog,
  BackupRecord,
  AdminNotification,
  SystemSettings
} from '../validations/types';

// Mock high-quality Unsplash images for brass theme
export const BRASS_IMAGES = {
  heroBanner1: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=80',
  heroBanner2: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
  concertHall: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80',
  maestro: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&h=400&fit=crop&q=80',
  trombone: 'https://images.unsplash.com/photo-1573006939324-641d32296ba5?auto=format&fit=crop&w=400&h=400&fit=crop&q=80',
  frenchHorn: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&h=400&fit=crop&q=80',
  trumpet: 'https://images.unsplash.com/photo-1610136637060-6a2d1d0f507b?auto=format&fit=crop&w=400&h=400&fit=crop&q=80',
  tuba: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=400&h=400&fit=crop&q=80',
  student1: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80',
  student2: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80',
  student3: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&h=300&q=80',
  student4: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300&q=80',
};

// 1. Banners
export const initialBanners: Banner[] = [
  {
    id: 'b-1',
    imageDesktop: BRASS_IMAGES.heroBanner1,
    imageMobile: BRASS_IMAGES.heroBanner1,
    title: 'Filarmônica de Metais Aliança do Ouro',
    subtitle: 'Potência sonora, tradição e inclusão social',
    text: 'A maior orquestra exclusiva de metais e percussão do Estado, promovendo cultura de excelência e formação profissional gratuita para jovens talentos.',
    primaryBtnText: 'Conheça Nossos Cursos',
    primaryBtnLink: '#cursos',
    secondaryBtnText: 'Próximo Concerto',
    secondaryBtnLink: '#eventos',
    order: 1,
    status: 'active'
  },
  {
    id: 'b-2',
    imageDesktop: BRASS_IMAGES.heroBanner2,
    imageMobile: BRASS_IMAGES.heroBanner2,
    title: 'Temporada Sinfônica de Inverno 2026',
    subtitle: 'Sons de Bronze e Ouro no Teatro Municipal',
    text: 'Apresentando releituras monumentais de Mahler, Tchaikovsky e clássicos da bossa nova com arranjos exclusivos para naipes de metais.',
    primaryBtnText: 'Garantir Ingresso',
    primaryBtnLink: '#ingresses',
    secondaryBtnText: 'Ver Agenda Completa',
    secondaryBtnLink: '#eventos',
    order: 2,
    status: 'active'
  },
  {
    id: 'b-3',
    imageDesktop: BRASS_IMAGES.concertHall,
    imageMobile: BRASS_IMAGES.concertHall,
    title: 'Apoie o Futuro da Nossa Música',
    subtitle: 'Seja um Benfeitor ou Patrocinador Corporativo',
    text: 'Nosso projeto transforma vidas através do ensino gratuito de trompete, trombone, trompa e percussão sinfônica. Sua doação é 100% dedutível via Lei Rouanet.',
    primaryBtnText: 'Quero Patrocinar',
    primaryBtnLink: '#apoiar',
    secondaryBtnText: 'Doação PIX Direta',
    secondaryBtnLink: '#doacao',
    order: 3,
    status: 'scheduled',
    scheduledDate: '2026-06-15'
  }
];

// 2. Estatísticas
export const initialStatistics: SiteStatistics = {
  studentsCount: 184,
  professorsCount: 16,
  eventsCount: 42,
  presentationsCount: 118,
  yearsActive: 14
};

// 3. Valores
export const initialValues: ValueItem[] = [
  {
    id: 'val-1',
    title: 'Excelência Artística',
    description: 'Busca incessante pelo rigor técnico, precisão interpretativa e a máxima qualidade acústica em cada harmonia.',
    order: 1
  },
  {
    id: 'val-2',
    title: 'Transformação Social',
    description: 'Democratização do acesso à cultura de alta performance como instrumento de emancipação e cidadania para jovens da periferia.',
    order: 2
  },
  {
    id: 'val-3',
    title: 'Inovação e Tradição',
    description: 'Respeito ao imenso repertório clássico de metais aliado a arranjos contemporâneos inéditos e tecnologias de ensino musical sônico.',
    order: 3
  }
];


// 5. Professores
export const initialProfessors: Professor[] = [
  {
    id: 'prof-1',
    photo: BRASS_IMAGES.maestro,
    name: 'Maestro Alexandre Valeriano',
    role: 'Regente Titular e Diretor Artístico',
    specialty: 'Regência & Metais de Bocal Largo',
    instrument: 'Trombone / Regência',
    miniBio: 'Doutor em Regência pela USP com extensão na Berlim Hochschule für Musik.',
    fullBio: 'Com mais de 25 anos de carreira sinfônica, o Maestro Alexandre já regeu orquestras na Alemanha, Áustria e Argentina. Lidera a Filarmônica de Metais desde sua fundação com foco em fusão sinfônica brasileira.',
    socialInstagram: '@alexandre.maestro',
    socialFacebook: '/maestrovaleriano',
    socialYoutube: 'https://youtube.com',
    socialLinkedin: 'https://linkedin.com',
    socialWhatsapp: '+5511988887777',
    email: 'alexandre.maestro@filarmonica.org.br',
    phone: '(11) 98888-7777',
    highlighted: true,
    order: 1
  },
  {
    id: 'prof-2',
    photo: BRASS_IMAGES.trumpet,
    name: 'Prof.ª Clarice Bronzes',
    role: 'Chefe de Naipe e Instrutora',
    specialty: 'Trompete Clássico e Jazzístico',
    instrument: 'Trompete',
    miniBio: 'Ex-trompetista solista da Orquestra Sinfônica do Estado.',
    fullBio: 'Formada em Trumpet Performance pelo Conservatório de Paris. Clarice tem vasta experiência em orquestração de metais e prepara alunos intensivamento para audições internacionais renomadas.',
    socialInstagram: '@clarice_trumpets',
    socialWhatsapp: '+5511977776666',
    email: 'clarice.sopros@filarmonica.org.br',
    phone: '(11) 97777-6666',
    highlighted: true,
    order: 2
  },
  {
    id: 'prof-3',
    photo: BRASS_IMAGES.frenchHorn,
    name: 'Prof. Marcos da Trompa',
    role: 'Instrutor de Metais de Bocal Curvo',
    specialty: 'Trompa de Harmonia e Afinações',
    instrument: 'Trompa',
    miniBio: 'Especialista em música de câmara romântica europeia.',
    fullBio: 'Marcos atua na capacitação pedagógica há mais de 15 anos. Desenvolveu um método inovador de autocontrole respiratório focado na embocadura sensível de trompistas iniciantes.',
    socialInstagram: '@marcos_trompista',
    socialYoutube: 'https://youtube.com',
    email: 'marcos.horn@filarmonica.org.br',
    phone: '(11) 96666-5555',
    highlighted: false,
    order: 3
  },
  {
    id: 'prof-4',
    photo: BRASS_IMAGES.tuba,
    name: 'Prof. Jeferson Tubista',
    role: 'Instrutor de Metais Graves',
    specialty: 'Tuba, Sopro de Base e Contra-altos',
    instrument: 'Tuba / Bombardino',
    miniBio: 'Mestre em Execução de Graves pela UNESP e arranjador de metais.',
    fullBio: 'Jeferson coordena as classes de base grave da filarmônica. Ele é fascinado pela robustez sônica dos tubas e bombardinos, adaptando canções populares nacionais para os instrumentos mais pesados da orquestra.',
    email: 'jeferson.grave@filarmonica.org.br',
    phone: '(11) 95555-4444',
    highlighted: true,
    order: 4
  }
];

// 6. Alunos
export const initialStudents: Student[] = [
  {
    id: 'alu-1',
    photo: BRASS_IMAGES.student1,
    name: 'Beatriz Vasconcelos de Souza',
    birthDate: '2008-04-12',
    instrument: 'Trompete',
    classroom: 'Avançado',
    phone: '(11) 91111-2222',
    email: 'beatriz.v@gmail.com',
    guardian: 'Mariana Vasconcelos de Souza',
    address: 'Av. Paulista, 1200 - Bela Vista, São Paulo - SP',
    status: 'active'
  },
  {
    id: 'alu-2',
    photo: BRASS_IMAGES.student2,
    name: 'Gustavo Henrique Silva Rocha',
    birthDate: '2010-09-25',
    instrument: 'Trombone de Vara',
    classroom: 'Intermediário',
    phone: '(11) 92222-3333',
    email: 'gustavo.h.rocha@hotmail.com',
    guardian: 'Ricardo Henrique Rocha',
    address: 'Rua das Orquídeas, 452 - Diadema - SP',
    status: 'active'
  },
  {
    id: 'alu-3',
    photo: BRASS_IMAGES.student3,
    name: 'Fernanda Caroline de Oliveira',
    birthDate: '2006-11-03',
    instrument: 'Trompa',
    classroom: 'Formado',
    phone: '(11) 93333-4444',
    email: 'fernanda.carol@outlook.com',
    guardian: 'Silvia Maria de Oliveira',
    address: 'Av. Marechal Deodoro, 89 - Santo André - SP',
    status: 'graduated'
  },
  {
    id: 'alu-4',
    photo: BRASS_IMAGES.student4,
    name: 'Lucas Mateus dos Reis',
    birthDate: '2012-07-15',
    instrument: 'Tuba / Bombardino',
    classroom: 'Iniciante',
    phone: '(11) 94444-5555',
    email: 'lucas.mateus@gmail.com',
    guardian: 'Pedro dos Reis',
    address: 'Rua Pedro Álvares Cabral, 12 - São Bernardo do Campo - SP',
    status: 'active'
  },
  {
    id: 'alu-5',
    photo: BRASS_IMAGES.student4,
    name: 'Arthur Cássio Peixoto',
    birthDate: '2009-02-18',
    instrument: 'Trompete',
    classroom: 'Iniciante',
    phone: '(11) 95555-6666',
    email: 'arthur.peixoto@gmail.com',
    guardian: 'Zélia Peixoto',
    address: 'Vila Madalena, Rua Simpatia, 140 - São Paulo - SP',
    status: 'inactive'
  }
];

// 7. Organizadores
export const initialOrganizers: Organizer[] = [
  {
    id: 'org-1',
    photo: BRASS_IMAGES.maestro,
    name: 'Maestrina Helena de Toledo',
    role: 'Diretora Executiva e Presidente',
    bio: 'Gestora cultural formada pela FGV com mestrado em Música pela Unicamp. Coordena as captações de recursos e contratos corporativos.',
    phone: '(11) 91234-5678',
    email: 'helena.toledo@filarmonica.org.br'
  },
  {
    id: 'org-2',
    photo: BRASS_IMAGES.maestro,
    name: 'Rodrigo Lemos',
    role: 'Coordenador Pedagógico e de Pessoas',
    bio: 'Produtor musical experiente, Rodrigo gerencia o cronograma acadêmico de turmas, logística de transporte escolar e relatórios de evasão.',
    phone: '(11) 99876-5432',
    email: 'rodrigo.lemos@filarmonica.org.br'
  }
];

// 8. Apoiadores
export const initialSupporters: Supporter[] = [
  {
    id: 'sup-1',
    logo: 'https://images.unsplash.com/photo-1599305445671-ac2c68ad383b?auto=format&fit=crop&w=150&h=80&q=80',
    name: 'Siderurgia Nacional Metales',
    siteUrl: 'https://example.com',
    description: 'Fornecedora de ligas de bronze e incentivadora oficial do ensino de bocal.',
    category: 'Indústria Metalúrgica',
    sponsorshipLevel: 'diamond',
    highlightedOnHome: true
  },
  {
    id: 'sup-2',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&h=80&q=80',
    name: 'Instituto Itaipava de Cultura',
    siteUrl: 'https://example.com',
    description: 'Fundo privado de promoção a projetos sociais musicais de alta performace.',
    category: 'Fomento Cultural',
    sponsorshipLevel: 'gold',
    highlightedOnHome: true
  },
  {
    id: 'sup-3',
    logo: 'https://images.unsplash.com/photo-1551498361-1eec7aa1c7df?auto=format&fit=crop&w=150&h=80&q=80',
    name: 'Sopro Novo Distribuidora',
    siteUrl: 'https://example.com',
    description: 'Rede de instrumentos musicais que faz doações periódicas de sobressalentes e lubrificantes.',
    category: 'Comércio Musical',
    sponsorshipLevel: 'silver',
    highlightedOnHome: false
  }
];

// 9. Cursos e Oficinas
export const initialCourses: AcademyCourse[] = [
  {
    id: 'crs-1',
    image: BRASS_IMAGES.trumpet,
    name: 'Iniciação ao Trompete Sônico',
    description: 'Desenvolvimento de embocadura primária, leitura de partituras para clave de Sol e dedilhados básicos da escala Bb.',
    ageGroup: '10 a 14 anos',
    duration: '1 Ano',
    availableSeats: 35,
    professorInCharge: 'Clarice Bronzes'
  },
  {
    id: 'crs-2',
    image: BRASS_IMAGES.trombone,
    name: 'Prática de Conjunto de Metais Pesados',
    description: 'Estudo intensivo de dinâmica e afinação de ensemble de trombones, bombardinos, tubas e helicons sinfônicos.',
    ageGroup: '15 a 21 anos',
    duration: '2 Anos',
    availableSeats: 18,
    professorInCharge: 'Jeferson Tubista'
  },
  {
    id: 'crs-3',
    image: BRASS_IMAGES.frenchHorn,
    name: 'Trompa de Harmonia Avançada',
    description: 'Preparatório técnico com ênfase em transposição tonal, uso da mão direita na campana e domínio harmônico romântico.',
    ageGroup: '14 a 22 anos',
    duration: '1 Ano e Meio',
    availableSeats: 10,
    professorInCharge: 'Marcos da Trompa'
  }
];

// 10. Eventos
export const initialEvents: OrchestraEvent[] = [
  {
    id: 'evt-1',
    coverImage: BRASS_IMAGES.heroBanner1,
    title: 'Concerto de Abertura: Metais Triunfais de Outono',
    description: 'Grande concerto sinfônico apresentando obras de Copland, Richard Strauss e Jean Sibelius arranjadas especificamente para naipes gigantes de sopro.',
    date: '2026-06-12',
    time: '20:00',
    venue: 'Teatro Municipal de São Paulo',
    address: 'Praça Ramos de Azevedo, s/n - República, São Paulo - SP',
    googleMapsUrl: 'https://maps.google.com/?q=Teatro+Municipal+de+Sao+Paulo',
    category: 'concert',
    status: 'published',
    highlighted: true
  },
  {
    id: 'evt-2',
    coverImage: BRASS_IMAGES.concertHall,
    title: 'Recital Acadêmico de Sopros Celestiais',
    description: 'Apresentação pública de fim de semestre de nossos alunos iniciantes e intermediários, mostrando clássicos adaptados do cancioneiro infantil e folclórico brasileiro.',
    date: '2026-06-28',
    time: '15:30',
    venue: 'Auditório Principal do Campus Social',
    address: 'Av. Alcantara de Sopros, 2400 - Diadema - SP',
    category: 'concert',
    status: 'published',
    highlighted: false
  },
  {
    id: 'evt-3',
    coverImage: BRASS_IMAGES.trombone,
    title: 'Workshop de Embocadura e Técnicas de Sopro com Maestros Estrangeiros',
    description: 'Oficina prática masterclass focada em respiração diafragmática, notas pedais graves e harmônicos agudos, administrada por professores franceses convidados.',
    date: '2026-07-05',
    time: '09:00',
    venue: 'Teatro de Arena do Sesc',
    address: 'Rua do Bosque, 45 - Centro, Diadema - SP',
    category: 'workshop',
    status: 'draft',
    highlighted: false
  }
];

// 11. Galeria
export const initialGallery: GalleryMedia[] = [
  {
    id: 'gal-1',
    type: 'image',
    albumName: 'Apresentação Sala São Paulo 2025',
    title: 'Maestro Alexandre regendo o clássico Carmina Burana de Metais',
    thumbnail: BRASS_IMAGES.heroBanner1,
    sourceUrl: BRASS_IMAGES.heroBanner1,
    category: 'Sinfônico',
    createdAt: '2025-11-20'
  },
  {
    id: 'gal-2',
    type: 'video',
    albumName: 'Momentos Educacionais',
    title: 'Ensaio Geral da classe de Trompetes e Percussão do Campus Social',
    thumbnail: BRASS_IMAGES.trumpet,
    sourceUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'Academia',
    createdAt: '2026-02-15'
  },
  {
    id: 'gal-3',
    type: 'image',
    albumName: 'Sessão Solene de Doadores',
    title: 'Reunião festiva de entrega do prêmio Benfeitor de Bronze de 2025',
    thumbnail: BRASS_IMAGES.frenchHorn,
    sourceUrl: BRASS_IMAGES.frenchHorn,
    category: 'Doadores',
    createdAt: '2025-12-10'
  }
];

// 13. Tenho Interesse (Inscrições)
export const initialInterestForm: InterestFormResponse[] = [
  {
    id: 'int-1',
    name: 'Carolina Pires de Magalhães',
    email: 'carol.pires@gmail.com',
    phone: '(11) 98877-2211',
    age: 15,
    instrumentOfInterest: 'Trompete',
    message: 'Gostaria muito de ser uma trompetista clássica. Aprendi um pouco na banda da igreja e busco crescer mais na técnica.',
    date: '2026-06-02 10:12',
    status: 'new'
  },
  {
    id: 'int-2',
    name: 'Igor Martins de Oliveira',
    email: 'igor.martins@outlook.com',
    phone: '(11) 97766-3322',
    age: 12,
    instrumentOfInterest: 'Trombone',
    message: 'Meus pais acham a embocadura do trombone fantástica e querem me matricular para aprender a ler claves.',
    date: '2026-05-30 14:05',
    status: 'contacted'
  },
  {
    id: 'int-3',
    name: 'Juliana de Freitas',
    email: 'juju.freitas@gmail.com',
    phone: '(11) 91122-3344',
    age: 17,
    instrumentOfInterest: 'Trompa',
    message: 'Já fiz aulas de solfejo. Tenho ouvido absoluto e quero migrar pro bocal curvo da trompa.',
    date: '2026-05-15 08:31',
    status: 'converted'
  },
  {
    id: 'int-4',
    name: 'Roberto Chaves Pinto',
    email: 'rob.pinto@yahoo.com',
    phone: '(11) 96655-4411',
    age: 23,
    instrumentOfInterest: 'Tuba',
    message: 'Tenho interesse nas vagas remanescentes para graves. Posso concorrer?',
    date: '2026-05-10 11:45',
    status: 'archived'
  }
];

// 14. Quero Apoiar
export const initialSupportForm: SupportFormResponse[] = [
  {
    id: 'supform-1',
    name: 'Maurício Fernandes Neto',
    company: 'Metalúrgica Brisa do Morro',
    email: 'mauricio@metalbrizas.com.br',
    phone: '(11) 99822-1100',
    supportType: 'Financeiro corporativo via benefício Rouanet',
    message: 'Nossa empresa quer investir R$ 15.000 de abatimento fiscal direto nas classes de novos tubas e bombardinos da orquestra.',
    date: '2026-06-02 09:14',
    status: 'pending'
  },
  {
    id: 'supform-2',
    name: 'Sandra Maria de Jesus',
    company: 'Sandra Music Store',
    email: 'sandra@sandramusic.com',
    phone: '(11) 98833-2211',
    supportType: 'Doação física de lubrificantes e bocais reserva',
    message: 'Tenho uma distribuidora e gostaria de fornecer 40 estojos de lubrificação ultra-silde grátis todo início de semestre.',
    date: '2026-05-28 16:40',
    status: 'contacted'
  },
  {
    id: 'supform-3',
    name: 'Edson Arantes do Castelo',
    company: 'Castelo Advogados Associados',
    email: 'edson@casteloadv.com.br',
    phone: '(11) 95533-8822',
    supportType: 'Padrinho doador individual anual',
    message: 'Gostaria de patrocinar integralmente o violoncelo ou contrabaixo de um estudante, cobrindo transporte e lanche.',
    date: '2026-05-20 11:24',
    status: 'approved'
  }
];

// 15. Doações Diretas
export const initialDonations: DirectDonation[] = [
  {
    id: 'don-1',
    donorName: 'Eudóxio Rodrigues Sampaio',
    amount: 12000,
    date: '2026-06-02 11:15',
    paymentMethod: 'pix',
    status: 'confirmed'
  },
  {
    id: 'don-2',
    donorName: 'Sandra Maria de Jesus',
    amount: 2500,
    date: '2026-06-01 10:42',
    paymentMethod: 'credit_card',
    status: 'confirmed'
  },
  {
    id: 'don-3',
    donorName: 'Anônimo Amigo do Bronze',
    amount: 150,
    date: '2026-06-01 08:30',
    paymentMethod: 'pix',
    status: 'confirmed'
  },
  {
    id: 'don-4',
    donorName: 'Construções Civis Monumento Ltda',
    amount: 50000,
    date: '2026-05-28 17:34',
    paymentMethod: 'bank_slip',
    status: 'confirmed'
  },
  {
    id: 'don-5',
    donorName: 'Dr. Arthur Peixoto Neto',
    amount: 500,
    date: '2026-06-02 14:10',
    paymentMethod: 'pix',
    status: 'pending'
  },
  {
    id: 'don-6',
    donorName: 'Marcos de Almeida',
    amount: 1500,
    date: '2026-05-24 15:00',
    paymentMethod: 'credit_card',
    status: 'cancelled'
  }
];

// 16. Contato Global
export const initialContacts: ContactMessage[] = [
  {
    id: 'msg-1',
    name: 'Rita de Cássia',
    phone: '(11) 97766-5544',
    email: 'ritacassia@gmail.com',
    subject: 'Aluguel de Auditório da Sede Social para Palestra',
    message: 'Prezados, gostaríamos de consultar o valor da diária de locação do auditório de ensaios acústico para um simpósio de fonoaudiologia local de 4 horas.',
    date: '2026-06-02 13:00',
    status: 'unread'
  },
  {
    id: 'msg-2',
    name: 'José Pedro Trombonista',
    phone: '(11) 98844-3311',
    email: 'jose.trombone@gmail.com',
    subject: 'Parceria de intercâmbio com Banda Filarmônica Municipal',
    message: 'Nossa banda filarmônica quer marcar um ensaio compartilhado no fim de semana para integrar os naipes graves.',
    date: '2026-05-30 09:12',
    status: 'replied'
  },
  {
    id: 'msg-3',
    name: 'Márcio Estevão Santos',
    phone: '(11) 95533-2211',
    email: 'marcio.santos@gmail.com',
    subject: 'Dúvida com Edital de Inscrição Infantil',
    message: 'Minha filha tem 9 anos completos, ela já pode se candidatar ou obrigatoriamente tem que ter 10 para entrar no trompete?',
    date: '2026-05-26 14:15',
    status: 'resolved'
  }
];

// 17. Usuários Administrativos
export const initialUsers: AppUser[] = [
  {
    id: 'user-1',
    name: 'Izabela Izidório (Você)',
    email: 'izabelaizidoriobr@gmail.com',
    role: 'super_admin',
    active: true,
    permissions: ['dashboard', 'site', 'pessoas', 'relacionamento', 'financeiro', 'conteudo', 'sistema']
  },
  {
    id: 'user-2',
    name: 'Clarice Sopros Admin',
    email: 'clarice.admin@filarmonica.org.br',
    role: 'admin',
    active: true,
    permissions: ['dashboard', 'site', 'pessoas', 'relacionamento', 'conteudo']
  },
  {
    id: 'user-3',
    name: 'Valter Lira do Caixa',
    email: 'valter.caixa@filarmonica.org.br',
    role: 'financial',
    active: true,
    permissions: ['dashboard', 'financeiro', 'sistema']
  },
  {
    id: 'user-4',
    name: 'Juliana Secretária',
    email: 'juliana.sec@filarmonica.org.br',
    role: 'secretary',
    active: true,
    permissions: ['dashboard', 'pessoas', 'relacionamento']
  },
  {
    id: 'user-5',
    name: 'Augusto Redator de Novidades',
    email: 'augusto.editor@filarmonica.org.br',
    role: 'editor',
    active: false,
    permissions: ['conteudo']
  }
];

// 18. Biblioteca de arquivos
export const initialFiles: LibraryFile[] = [
  {
    id: 'file-1',
    name: 'Edital_Inscricoes_Orquestrais_2026.pdf',
    url: '#pdf',
    type: 'pdf',
    size: '1.4 MB',
    category: 'Editais',
    uploadedAt: '2026-06-01'
  },
  {
    id: 'file-2',
    name: 'partitura_Carmina_Burana_Metais_Sinfonico.pdf',
    url: '#pdf',
    type: 'pdf',
    size: '8.2 MB',
    category: 'Partituras',
    uploadedAt: '2026-05-18'
  },
  {
    id: 'file-3',
    name: 'Banner_Principal_Sala_Sino_Alta_Definicao.jpg',
    url: BRASS_IMAGES.heroBanner1,
    type: 'image',
    size: '4.8 MB',
    category: 'Imagens Site',
    uploadedAt: '2026-05-24'
  },
  {
    id: 'file-4',
    name: 'Video_Ensaio_Trompetes_Social.mp4',
    url: '#video',
    type: 'video',
    size: '48.5 MB',
    category: 'Vídeos Promo',
    uploadedAt: '2026-05-15'
  }
];

// 19. Logs de Auditoria
export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    userEmail: 'izabelaizidoriobr@gmail.com',
    userName: 'Izabela Izidório',
    action: 'Criou Novo Professor',
    dateTime: '2026-06-02 14:10',
    module: 'Professores',
    details: 'Adicionou Professor Jeferson Tubista com instrumento Tuba/Bombardino'
  },
  {
    id: 'log-2',
    userEmail: 'izabelaizidoriobr@gmail.com',
    userName: 'Izabela Izidório',
    action: 'Confirmou Doação PIX',
    dateTime: '2026-06-02 11:20',
    module: 'Financeiro',
    details: 'Confirmou doação no valor de R$ 12.000,00 de Eudóxio Rodrigues Sampaio'
  },
  {
    id: 'log-3',
    userEmail: 'juliana.sec@filarmonica.org.br',
    userName: 'Juliana Secretária',
    action: 'Alterou Status de Aluno',
    dateTime: '2026-06-01 16:45',
    module: 'Alunos',
    details: 'Status de Fernanda Caroline de Oliveira alterado de Ativo para Formado'
  },
  {
    id: 'log-4',
    userEmail: 'clarice.admin@filarmonica.org.br',
    userName: 'Clarice Sopros Admin',
    action: 'Publicou Notícia',
    dateTime: '2026-06-01 09:12',
    module: 'Notícias',
    details: 'Publicou artigo: Inscrições abertas para as novas turmas'
  },
  {
    id: 'log-5',
    userEmail: 'valter.caixa@filarmonica.org.br',
    userName: 'Valter Lira do Caixa',
    action: 'Gerou Relatório Anual',
    dateTime: '2026-05-30 11:00',
    module: 'Financeiro',
    details: 'Exportou arquivo resumido de doações fiscais ano de vigência 2025'
  }
];

// 20. Backups
export const initialBackups: BackupRecord[] = [
  {
    id: 'bac-1',
    fileName: 'backup_total_alianca_ouro_2026-06-01_automático.json',
    size: '224 KB',
    createdAt: '2026-06-01 04:00',
    createdType: 'automatic',
    status: 'success'
  },
  {
    id: 'bac-2',
    fileName: 'backup_total_alianca_ouro_2026-05-25_manual.json',
    size: '222 KB',
    createdAt: '2026-05-25 15:30',
    createdType: 'manual',
    status: 'success'
  },
  {
    id: 'bac-3',
    fileName: 'backup_total_alianca_ouro_2026-05-18_automático.json',
    size: '221 KB',
    createdAt: '2026-05-18 04:00',
    createdType: 'automatic',
    status: 'success'
  }
];

// 21. Notificações Iniciais
export const initialNotifications: AdminNotification[] = [
  {
    id: 'not-1',
    title: 'Nova Inscrição de Interesse',
    message: 'Carolina Pires de Magalhães enviou ficha querendo aprender Trompete.',
    category: 'form_interest',
    resolved: false,
    createdAt: '2026-06-02 10:12'
  },
  {
    id: 'not-2',
    title: 'Doação Pendente Recebida',
    message: 'Dr. Arthur Peixoto Neto declarou doação PIX pendente de confirmação (R$ 500,00).',
    category: 'donation',
    resolved: false,
    createdAt: '2026-06-02 14:10'
  },
  {
    id: 'not-3',
    title: 'Novo Formulário de Apoio',
    message: 'Maurício Fernandes Neto enviou proposta de incentivo corporativo para graves.',
    category: 'support',
    resolved: false,
    createdAt: '2026-06-02 09:14'
  },
  {
    id: 'not-4',
    title: 'Novo Contato Recebido',
    message: 'Rita de Cássia enviou mensagem querendo alugar o auditório acústico.',
    category: 'contact',
    resolved: false,
    createdAt: '2026-06-02 13:00'
  }
];

// 22. Configurações Globais Iniciais
export const initialSettings: SystemSettings = {
  institution: {
    name: 'Associação Orquestral Filarmônica de Metais Aliança do Ouro',
    cnpj: '12.345.678/0001-90',
    address: 'Av. Alcantara de Sopros, 2400 - Recanto das Trompas',
    zipCode: '09960-000',
    city: 'Diadema',
    state: 'SP',
    phones: ['(11) 4056-1122', '(11) 98888-1122'],
    emails: ['contato@filarmonica.org.br', 'diretoria@filarmonica.org.br']
  },
  socials: {
    instagram: '@aliancadoouro_metais',
    facebook: '/filarmonica_aliancadoouro',
    youtube: 'https://youtube.com/c/aliancadoouro',
    tiktok: '@filarmonicametais',
    whatsapp: 'https://wa.me/5511988881122'
  },
  seo: {
    metaTitle: 'Filarmônica de Metais Aliança do Ouro | Diadema SP',
    metaDescription: 'A maior associação orquestral de metais e percussão sinfônica. Cursos de sopro gratuitos, concertos didáticos monumentais e impactação comunitária para jovens carentes.',
    keywords: 'filarmonica de metais, orquestra de sopro, diadema, aula de trompete gratis, aula de trombone gratis, doação cultura lei rouanet, trombone de vara, trompa de harmonia'
  },
  appearance: {
    logoUrl: 'https://images.unsplash.com/photo-1573006939324-641d32296ba5?auto=format&fit=crop&w=80&q=80',
    faviconUrl: 'https://images.unsplash.com/photo-1573006939324-641d32296ba5?auto=format&fit=crop&w=32&q=32',
    primaryColor: '#0B4DA2',
    secondaryColor: '#F2C94C',
    themeMode: 'dark'
  }
};
