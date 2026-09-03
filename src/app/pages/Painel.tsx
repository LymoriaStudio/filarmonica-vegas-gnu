import React, { useState, useMemo, useEffect } from 'react';
import { useCurrentProfile } from '../hooks/useCurrentProfile';
import Sidebar from '../components/painel/Sidebar';
import Header from '../components/painel/Header';
import DashboardHome from '../components/painel/DashboardHome';
import SiteCMS from '../components/painel/SiteCMS';
import PessoasERP from '../components/painel/PessoasERP';
import RelationshipCMS from '../components/painel/RelationshipCMS';
import FinanceiroERP from '../components/painel/FinanceiroERP';
import ConteudoCMS from '../components/painel/ConteudoCMS';
import SistemaConfig from '../components/painel/SistemaConfig';
import TestimonialsCMS from '../components/painel/TestimonialsCMS';
import { useAuditLogs } from '../hooks/useAuditLogs';

import {
  initialBanners,
  initialStatistics,
  initialValues,
  initialProfessors,
  initialStudents,
  initialOrganizers,
  initialSupporters,
  initialCourses,
  initialEvents,
  initialGallery,
  initialInterestForm,
  initialSupportForm,
  initialDonations,
  initialContacts,
  initialUsers,
  initialFiles,
  initialAuditLogs,
  initialBackups,
  initialNotifications,
  initialSettings
} from '../data/initialData';

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
  SystemSettings,
  SystemUser,
  InstitutionConfig,
  BackupHistory,
  InstrumentEvent,
  MusicCourse,
  GalleryPhoto,
  GalleryVideo
} from '../validations/types';

const EMPTY_NEWS: NewsArticle[] = [];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin:  ['dashboard', 'site', 'pessoas', 'relacionamento', 'financeiro', 'conteudo', 'sistema'],
  editor: ['dashboard', 'site', 'pessoas', 'relacionamento', 'conteudo'],
};

export default function Painel() {
  const { profile: currentProfile } = useCurrentProfile();

  // 1. Core Page Navigation state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // 2. Click Highlights State (from Search results or table clicks)
  const [selectedEntityForEdit, setSelectedEntityForEdit] = useState<any>(null);


  // 3. System States - Real CMS & ERP Live Databases
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [statistics, setStatistics] = useState<SiteStatistics>(initialStatistics);
  const [values, setValues] = useState<ValueItem[]>(initialValues);
const [professors, setProfessors] = useState<Professor[]>([]);
const [students, setStudents] = useState<Student[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [supporters, setSupporters] = useState<Supporter[]>(initialSupporters);

  const [interests, setInterests] = useState<InterestFormResponse[]>(initialInterestForm);
  const [supports, setSupports] = useState<SupportFormResponse[]>([]);
  const [donations, setDonations] = useState<DirectDonation[]>(initialDonations);
  const [contacts, setContacts] = useState<ContactMessage[]>(initialContacts);

  const [notifications, setNotifications] = useState<AdminNotification[]>(initialNotifications);

  const { auditLogs, setAuditLogs, addAuditLog } = useAuditLogs();

  // 4. Adapt/Convert states for subcomponents matching their local definitions
  // Mapped Events state (stored in local standard format)
  const initialMappedEvents: InstrumentEvent[] = initialEvents.map(evt => ({
    id: evt.id,
    cover: evt.coverImage,
    title: evt.title,
    description: evt.description,
    date: evt.date,
    time: evt.time,
    location: evt.venue,
    address: evt.address,
    mapsUrl: evt.googleMapsUrl || 'https://maps.google.com',
    category: evt.category === 'concert' ? 'Concerto Especial' : 'Masterclass',
    status: evt.status as any,
    featured: evt.highlighted
  }));
  const [events, setEvents] = useState<InstrumentEvent[]>(initialMappedEvents);

  // Mapped Courses state
  const initialMappedCourses: MusicCourse[] = initialCourses.map(c => ({
    id: c.id,
    photo: c.image,
    name: c.name,
    description: c.description,
    ageLimit: c.ageGroup,
    duration: c.duration,
    vagas: c.availableSeats,
    responsibleProfessor: c.professorInCharge
  }));
  const [courses, setCourses] = useState<MusicCourse[]>(initialMappedCourses);

  // Mapped Photo Gallery
  const initialMappedPhotos: GalleryPhoto[] = initialGallery
    .filter(g => g.type === 'image')
    .map(g => ({
      id: g.id,
      url: g.sourceUrl,
      caption: g.title,
      album: g.albumName,
      category: g.category
    }));
  const [photos, setPhotos] = useState<GalleryPhoto[]>(initialMappedPhotos);

  // Mapped Video Gallery
  const initialMappedVideos: GalleryVideo[] = initialGallery
    .filter(g => g.type === 'video')
    .map(g => ({
      id: g.id,
      youtubeUrl: g.sourceUrl,
      title: g.title,
      vimeoUrl: ''
    }));
  const [videos, setVideos] = useState<GalleryVideo[]>(initialMappedVideos);



  // Mapped File library
  const [libraryFiles, setLibraryFiles] = useState<LibraryFile[]>(initialFiles);

  // Mapped Backups History
  const initialMappedBackups: BackupHistory[] = initialBackups.map(b => ({
    id: b.id,
    date: b.createdAt,
    type: b.createdType,
    size: b.size,
    status: b.status
  }));
  const [backups, setBackups] = useState<BackupHistory[]>(initialMappedBackups);

  // Mapped System Settings
  const initialMappedConfig: InstitutionConfig = {
    name: initialSettings.institution.name,
    cnpj: initialSettings.institution.cnpj,
    address: initialSettings.institution.address,
    cep: initialSettings.institution.zipCode,
    city: initialSettings.institution.city,
    state: initialSettings.institution.state,
    phones: initialSettings.institution.phones.join(', '),
    email: initialSettings.institution.emails[0],
    socialInstagram: initialSettings.socials.instagram,
    socialWhatsapp: initialSettings.socials.whatsapp,
    seoMetaTitle: initialSettings.seo.metaTitle,
    seoMetaDescription: initialSettings.seo.metaDescription,
    autoBackup: true
  };
  const [sysConfig, setSysConfig] = useState<InstitutionConfig>(initialMappedConfig);

  // SYSTEM IAM - Staff Users State
  const initialMappedUsers: SystemUser[] = initialUsers.map(u => ({
    id: u.id,
    photo: u.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    name: u.name,
    email: u.email,
    role: u.role === 'super_admin' ? 'Super Administrador' : u.role === 'admin' ? 'Administrador' : u.role === 'financial' ? 'Financeiro' : u.role === 'secretary' ? 'Secretária' : 'Editor',
    status: u.active ? 'active' : 'blocked',
    scopes: u.permissions
  }));
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(initialMappedUsers);

  // Active user state in Header 
  const [activeAdminUser, setActiveAdminUser] = useState<AppUser>(initialUsers[0]);

  // Dynamic back-mapping for Search metrics on-the-fly
  const orchestraEventsForSearch: OrchestraEvent[] = useMemo(() => {
    return events.map(e => ({
      id: e.id,
      coverImage: e.cover,
      title: e.title,
      description: e.description,
      date: e.date,
      time: e.time,
      venue: e.location,
      address: e.address,
      googleMapsUrl: e.mapsUrl,
      category: e.category.toLowerCase().includes('concerto') ? 'concert' : 'workshop',
      status: e.status,
      highlighted: e.featured
    }));
  }, [events]);

  const appUsersForHeader: AppUser[] = useMemo(() => {
    return systemUsers.map(su => ({
      id: su.id,
      name: su.name,
      email: su.email,
      role: su.role === 'Super Administrador' ? 'super_admin' : su.role === 'Administrador' ? 'admin' : su.role === 'Financeiro' ? 'financial' : su.role === 'Secretária' ? 'secretary' : 'editor',
      active: su.status === 'active',
      permissions: su.scopes
    }));
  }, [systemUsers]);


  // ==========================================
  // QUICK ACTIONS TRIGGER
  // ==========================================
  const handleQuickActionTrigger = (actionKey: string) => {
    switch (actionKey) {
      case 'new-student':
        setActiveTab('pessoas-alunos');
        setSelectedEntityForEdit({ addNewStudentTrigger: true });
        break;
      case 'new-professor':
        setActiveTab('pessoas-professores');
        setSelectedEntityForEdit({ addNewProfessorTrigger: true });
        break;
      case 'new-event':
        setActiveTab('conteudo-eventos');
        setSelectedEntityForEdit({ addNewEventTrigger: true });
        break;
      case 'new-organizer':
        setActiveTab('pessoas-organizadores');
        setSelectedEntityForEdit({ addNewOrganizerTrigger: true });
        break;
      case 'new-supporter':
        setActiveTab('financeiro-apoiadores');
        setSelectedEntityForEdit({ addNewSupporterTrigger: true });
        break;
      default:
        break;
    }
  };


  return (
    <div className="flex h-screen w-full bg-gray-50 font-sans overflow-hidden">
      
      {/* Sidebar - sticky side navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={currentProfile?.role ?? 'editor'}
        permissions={ROLE_PERMISSIONS[currentProfile?.role ?? 'editor'] ?? ROLE_PERMISSIONS['editor']}
      />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Global header */}
        <Header 
          notifications={notifications}
          setNotifications={setNotifications}
          activeUser={activeAdminUser}
          setActiveUser={setActiveAdminUser}
          systemUsers={appUsersForHeader}
          activeTab={activeTab}
          onQuickAction={handleQuickActionTrigger}
          students={students}
          professors={professors}
          setProfessors={setProfessors}
          events={orchestraEventsForSearch}
          setActiveTab={setActiveTab}
          setSelectedEntityForEdit={setSelectedEntityForEdit}
        />

        {/* Dynamic Inner Router Views */}
        <main className="flex-1 overflow-y-auto bg-gray-50 relative">
          
          {/* PAINEL / DASHBOARD */}
          {activeTab === 'dashboard' && (
            <DashboardHome
              students={students}
              professors={professors}
              organizers={organizers}
              supporters={supporters}
              donations={donations}
              events={orchestraEventsForSearch}
              interests={interests}
              contacts={contacts}
              auditLogs={auditLogs}
              onNavigate={setActiveTab}
              onQuickAction={handleQuickActionTrigger}
              userRole={currentProfile?.role ?? 'editor'}
            />
          )}

          {/* SITE INSTITUCIONAL SECTION */}
          {(activeTab === 'site-banners' || activeTab === 'site-sobre' || activeTab === 'site-timeline') && (
            <SiteCMS
              key={activeTab}
              banners={banners}
              setBanners={setBanners}
              statistics={statistics}
              setStatistics={setStatistics}
              values={values}
              setValues={setValues}
              addAuditLog={addAuditLog}
              selectedEntityForEdit={selectedEntityForEdit}
              setSelectedEntityForEdit={setSelectedEntityForEdit}
              activeTab={activeTab}
            />
          )}

          {/* PESSOAS SECTION */}
          {(activeTab === 'pessoas-professores' || activeTab === 'pessoas-alunos' || activeTab === 'pessoas-organizadores') && (
            <PessoasERP
              key={activeTab}
              professors={professors}
              setProfessors={setProfessors}
              students={students}
              setStudents={setStudents}
              organizers={organizers}
              setOrganizers={setOrganizers}
              addAuditLog={addAuditLog}
              selectedEntityForEdit={selectedEntityForEdit}
              setSelectedEntityForEdit={setSelectedEntityForEdit}
              activeTab={activeTab}
            />
          )}

          {/* RELACIONAMENTO / CRM */}
          {(activeTab === 'relacionamento-interesse' || activeTab === 'relacionamento-apoiar' || activeTab === 'relacionamento-contato') && (
            <RelationshipCMS
              key={activeTab}
              supports={supports}
              setSupports={setSupports}
              contacts={contacts}
              setContacts={setContacts}
              students={students}
              setStudents={setStudents}
              supporters={supporters}
              setSupporters={setSupporters}
              addAuditLog={addAuditLog}
              activeTab={activeTab}
            />
          )}

          {/* FINANCEIRO SECTION — apenas admin */}
          {(activeTab === 'financeiro-doacoes' || activeTab === 'financeiro-apoiadores' || activeTab === 'financeiro-relatorios') && (
            (ROLE_PERMISSIONS[currentProfile?.role ?? 'editor'] ?? []).includes('financeiro') ? (
              <FinanceiroERP
                key={activeTab}
                supporters={supporters}
                setSupporters={setSupporters}
                addAuditLog={addAuditLog}
                activeTab={activeTab}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-32 text-center gap-3">
                <span className="text-5xl">🔒</span>
                <p className="text-lg font-bold text-[#001856]">Acesso restrito</p>
                <p className="text-sm text-gray-400">Você não tem permissão para acessar esta seção.</p>
              </div>
            )
          )}

          {/* DEPOIMENTOS */}
          {activeTab === 'conteudo-depoimentos' && <TestimonialsCMS />}

          {/* CONTEÚDO SECTION */}
          {(activeTab === 'conteudo-eventos' || activeTab === 'conteudo-noticias' || activeTab === 'conteudo-cursos' || activeTab === 'conteudo-galeria' || activeTab === 'conteudo-instrumentos') && (
            <ConteudoCMS
              key={activeTab}
              events={events}
              setEvents={setEvents}
              news={EMPTY_NEWS}
              setNews={() => {}}
              courses={courses}
              setCourses={setCourses}
              photos={photos}
              setPhotos={setPhotos}
              videos={videos}
              setVideos={setVideos}
              professors={professors}
              addAuditLog={addAuditLog}
              activeTab={activeTab}
            />
          )}

          {/* CONFIGURAÇÕES GERAIS / SISTEMA */}
          {(activeTab === 'sistema-usuarios' || activeTab === 'sistema-biblioteca' || activeTab === 'sistema-configuracoes' || activeTab === 'sistema-auditoria' || activeTab === 'sistema-backup') && (
            <SistemaConfig
              key={activeTab}
              users={systemUsers}
              setUsers={setSystemUsers}
              library={libraryFiles}
              setLibrary={setLibraryFiles}
              config={sysConfig}
              setConfig={setSysConfig}
              auditLogs={auditLogs}
              setAuditLogs={setAuditLogs}
              backups={backups}
              setBackups={setBackups}
              addAuditLog={addAuditLog}
              activeTab={activeTab}
            />
          )}

        </main>

      </div>
    </div>
  );
}
