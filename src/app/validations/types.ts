/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Tipos para Banners do Site (Hero Banner)
export interface Banner {
  id: string;
  imageDesktop: string;
  imageMobile: string;
  title: string;
  subtitle: string;
  text: string;
  primaryBtnText: string;
  primaryBtnLink: string;
  secondaryBtnText: string;
  secondaryBtnLink: string;
  order: number;
  status: 'active' | 'draft' | 'scheduled';
  scheduledDate?: string;
}

// Histórico do Painel de Estatísticas
export interface SiteStatistics {
  studentsCount: number;
  professorsCount: number;
  eventsCount: number;
  presentationsCount: number;
  yearsActive: number;
}

// Valores da Organização
export interface ValueItem {
  id: string;
  title: string;
  description: string;
  order: number;
}

// Linha do Tempo Institucional
export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  image?: string;
  order: number;
}

// Professores (ERP Pessoas)
export interface Professor {
  id: string;
  photo: string;
  name: string;
  role: string;          // ex: Maestro, Chefe de Naipe
  specialty: string;     // ex: Trompete, Trombone, Tuba
  instrument: string;
  miniBio: string;
  fullBio: string;
  socialInstagram?: string;
  socialFacebook?: string;
  socialYoutube?: string;
  socialLinkedin?: string;
  socialWhatsapp?: string;
  email: string;
  phone: string;
  highlighted: boolean;  // Destacar na Home
  order: number;
}

// Alunos (ERP Pessoas)
export interface Student {
  id: string;
  photo: string;
  name: string;
  birthDate: string;
  instrument: string;
  classroom: string;     // Turma (Iniciante, Intermediário, Avançado)
  phone: string;
  email: string;
  guardian?: string;     // Responsável (se menor)
  address: string;
  status: 'active' | 'inactive' | 'graduated' | 'archived';
}

// Organizadores/Equipe Administrativa
export interface Organizer {
  id: string;
  photo: string;
  name: string;
  role: string;          // Cargo
  bio: string;
  phone: string;
  email: string;
}

// Apoiadores e Patrocinadores
export interface Supporter {
  id: string;
  logo: string;
  name: string;
  siteUrl: string;
  description: string;
  category: string;      // ex: Cultura, Educação
  sponsorshipLevel: 'diamond' | 'gold' | 'silver' | 'bronze'; // Nível de Patrocínio
  highlightedOnHome: boolean;
}

// Cursos e Oficinas
export interface AcademyCourse {
  id: string;
  image: string;
  name: string;
  description: string;
  ageGroup: string;      // Faixa Etária
  duration: string;      // Duração (ex: 6 meses)
  availableSeats: number;// Quantidade de Vagas
  professorInCharge: string; // Professor Responsável
}

// Eventos e Apresentações
export interface OrchestraEvent {
  id: string;
  coverImage: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;          // Local
  address: string;
  googleMapsUrl?: string;
  category: 'concert' | 'workshop' | 'audition' | 'rehearsal';
  status: 'published' | 'draft' | 'cancelled';
  highlighted: boolean;
}

// Conteúdos da Galeria (Fotos / Vídeos)
export interface GalleryMedia {
  id: string;
  type: 'image' | 'video';
  albumName: string;      // Álbum
  title: string;
  thumbnail: string;
  sourceUrl: string;       // link pro YouTube/Vimeo ou arquivo
  category: string;
  createdAt: string;
}

// Notícias / Blog
export interface NewsArticle {
  id: string;
  coverImage: string;
  title: string;
  summary: string;
  content: string;         // HTML-like ou markdown
  category: string;
  author: string;
  date: string;
  status: 'published' | 'draft' | 'scheduled';
  scheduledDate?: string;
}

// Relacionamento: Tenho Interesse (Prospects)
export interface InterestFormResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  instrumentOfInterest: string;
  message: string;
  date: string;
  status: 'new' | 'contacted' | 'converted' | 'archived';
}

// Relacionamento: Quero Apoiar
export interface SupportFormResponse {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  supportType: string;    // ex: Doação de Instrumentos, Padrinho de Aluno, Financeiro
  message: string;
  date: string;
  status: 'pending' | 'contacted' | 'approved' | 'archived';
}

// Financeiro: Doação Direta
export interface DirectDonation {
  id: string;
  donorName: string;
  amount: number;
  date: string;
  paymentMethod: 'pix' | 'credit_card' | 'bank_slip' | 'transfer';
  status: 'confirmed' | 'pending' | 'cancelled';
}

// Formulário de Contato Global
export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: 'unread' | 'replied' | 'resolved' | 'archived';
}

// Usuários do Sistema Administrativo
export type UserRole = 'super_admin' | 'admin' | 'secretary' | 'financial' | 'editor';

export interface AppUser {
  id: string;
  photo?: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  permissions: string[]; // Lista de módulos permitidos
}

// Biblioteca de Arquivos
export interface LibraryFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'video' | 'doc';
  size: string; // Ex: 1.2 MB
  category: string;
  uploadedAt: string;
}

// Auditoria do Sistema
export interface AuditLog {
  id: string;
  userEmail: string;
  userName: string;
  action: string;       // ex: 'Criou Banner', 'Alterou Status'
  dateTime: string;
  module: string;       // ex: 'Banners', 'Alunos', 'Financeiro'
  details?: string;
}

// backups
export interface BackupRecord {
  id: string;
  fileName: string;
  size: string;
  createdAt: string;
  createdType: 'manual' | 'automatic';
  status: 'success' | 'failed';
}

// Notificações administrativas internas
export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  category: 'form_interest' | 'donation' | 'upcoming_event' | 'contact' | 'support';
  resolved: boolean;
  createdAt: string;
}

// Configurações Gerais da Instituição
export interface SystemSettings {
  institution: {
    name: string;
    cnpj: string;
    address: string;
    zipCode: string;
    city: string;
    state: string;
    phones: string[];
    emails: string[];
  };
  socials: {
    instagram: string;
    facebook: string;
    youtube: string;
    tiktok: string;
    whatsapp: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
  appearance: {
    logoUrl: string;
    faviconUrl: string;
    primaryColor: string;
    secondaryColor: string;
    themeMode: 'dark' | 'light' | 'system';
  };
}

// Interfaces adicionais para visualização fina e adaptadores do CMS/ERP
export interface SystemUser {
  id: string;
  photo: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'blocked';
  scopes: string[];
}

export interface InstitutionConfig {
  name: string;
  cnpj: string;
  address: string;
  cep: string;
  city: string;
  state: string;
  phones: string;
  email: string;
  socialInstagram: string;
  socialWhatsapp: string;
  seoMetaTitle: string;
  seoMetaDescription: string;
  autoBackup: boolean;
}

export interface BackupHistory {
  id: string;
  date: string;
  type: 'manual' | 'automatic';
  size: string;
  status: 'success' | 'failed';
}

export interface InstrumentEvent {
  id: string;
  cover: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  address: string;
  mapsUrl: string;
  category: string;
  status: 'published' | 'draft' | 'cancelled';
  featured: boolean;
}

export interface MusicCourse {
  id: string;
  photo: string;
  name: string;
  description: string;
  ageLimit: string;
  duration: string;
  vagas: number;
  responsibleProfessor: string;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  caption: string;
  album: string;
  category: string;
}

export interface GalleryVideo {
  id: string;
  youtubeUrl: string;
  title: string;
  vimeoUrl?: string;
}

