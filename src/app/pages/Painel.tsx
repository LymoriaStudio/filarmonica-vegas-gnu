import React, { useState, useMemo } from 'react';
import Sidebar from '../components/painel/Sidebar';
import Header from '../components/painel/Header';
import DashboardHome from '../components/painel/DashboardHome';
import SiteCMS from '../components/painel/SiteCMS';
import PessoasERP from '../components/painel/PessoasERP';
import RelationshipCMS from '../components/painel/RelationshipCMS';
import FinanceiroERP from '../components/painel/FinanceiroERP';
import ConteudoCMS from '../components/painel/ConteudoCMS';
import SistemaConfig from '../components/painel/SistemaConfig';

import {
  initialBanners,
  initialStatistics,
  initialValues,
  initialTimeline,
  initialProfessors,
  initialStudents,
  initialOrganizers,
  initialSupporters,
  initialCourses,
  initialEvents,
  initialGallery,
  initialNews,
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

export default function Painel() {
  // 1. Core Page Navigation state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // 2. Click Highlights State (from Search results or table clicks)
  const [selectedEntityForEdit, setSelectedEntityForEdit] = useState<any>(null);

  // 3. System States - Real CMS & ERP Live Databases
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [statistics, setStatistics] = useState<SiteStatistics>(initialStatistics);
  const [values, setValues] = useState<ValueItem[]>(initialValues);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(initialTimeline);
  
  const [professors, setProfessors] = useState<Professor[]>(initialProfessors);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [organizers, setOrganizers] = useState<Organizer[]>(initialOrganizers);
  const [supporters, setSupporters] = useState<Supporter[]>(initialSupporters);

  const [interests, setInterests] = useState<InterestFormResponse[]>(initialInterestForm);
  const [supports, setSupports] = useState<SupportFormResponse[]>(initialSupportForm);
  const [donations, setDonations] = useState<DirectDonation[]>(initialDonations);
  const [contacts, setContacts] = useState<ContactMessage[]>(initialContacts);

  const [notifications, setNotifications] = useState<AdminNotification[]>(initialNotifications);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

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

  // Mapped News/Blog
  const [news, setNews] = useState<NewsArticle[]>(initialNews);

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
  // SHARED MUTATION HELPER (AUDIT LOGGER)
  // ==========================================
  const addAuditLog = (action: string, module: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userName: activeAdminUser.name.replace(' (Você)', ''),
      userEmail: activeAdminUser.email,
      action,
      dateTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      module,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Push local real-time administrative toast and notification count 
    const newNot: AdminNotification = {
      id: `not-${Date.now()}`,
      title: action,
      message: details,
      category: module.toLowerCase().includes('apoio') ? 'support' : 'donation',
      resolved: false,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    setNotifications(prev => [newNot, ...prev]);
  };


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
      case 'new-news':
        setActiveTab('conteudo-noticias');
        setSelectedEntityForEdit({ addNewNewsTrigger: true });
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
    <div className="flex h-screen w-full bg-[#0A0A0A] text-neutral-200 font-sans overflow-hidden">
      
      {/* Sidebar - sticky side navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={activeAdminUser.role} 
        permissions={activeAdminUser.permissions} 
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
          onQuickAction={handleQuickActionTrigger}
          students={students}
          professors={professors}
          events={orchestraEventsForSearch}
          news={news}
          setActiveTab={setActiveTab}
          setSelectedEntityForEdit={setSelectedEntityForEdit}
        />

        {/* Dynamic Inner Router Views */}
        <main className="flex-1 overflow-y-auto bg-[#0F0F0F] relative">
          
          {/* PAINEL / DASHBOARD */}
          {activeTab === 'dashboard' && (
            <DashboardHome 
              students={students}
              professors={professors}
              organizers={organizers}
              supporters={supporters}
              donations={donations}
              events={orchestraEventsForSearch}
              news={news}
              interests={interests}
              contacts={contacts}
              auditLogs={auditLogs}
              onNavigate={setActiveTab}
              onQuickAction={handleQuickActionTrigger}
            />
          )}

          {/* SITE INSTITUCIONAL SECTION */}
          {(activeTab === 'site-banners' || activeTab === 'site-sobre' || activeTab === 'site-timeline') && (
            <SiteCMS 
              banners={banners}
              setBanners={setBanners}
              statistics={statistics}
              setStatistics={setStatistics}
              values={values}
              setValues={setValues}
              timeline={timeline}
              setTimeline={setTimeline}
              addAuditLog={addAuditLog}
              selectedEntityForEdit={selectedEntityForEdit}
              setSelectedEntityForEdit={setSelectedEntityForEdit}
            />
          )}

          {/* PESSOAS SECTION */}
          {(activeTab === 'pessoas-professores' || activeTab === 'pessoas-alunos' || activeTab === 'pessoas-organizadores') && (
            <PessoasERP 
              professors={professors}
              setProfessors={setProfessors}
              students={students}
              setStudents={setStudents}
              organizers={organizers}
              setOrganizers={setOrganizers}
              addAuditLog={addAuditLog}
              selectedEntityForEdit={selectedEntityForEdit}
              setSelectedEntityForEdit={setSelectedEntityForEdit}
            />
          )}

          {/* RELACIONAMENTO / CRM */}
          {(activeTab === 'relacionamento-interesse' || activeTab === 'relacionamento-apoiar' || activeTab === 'relacionamento-contato') && (
            <RelationshipCMS 
              interests={interests}
              setInterests={setInterests}
              supports={supports}
              setSupports={setSupports}
              contacts={contacts}
              setContacts={setContacts}
              students={students}
              setStudents={setStudents}
              supporters={supporters}
              setSupporters={setSupporters}
              addAuditLog={addAuditLog}
            />
          )}

          {/* FINANCEIRO SECTION */}
          {(activeTab === 'financeiro-doacoes' || activeTab === 'financeiro-apoiadores' || activeTab === 'financeiro-relatorios') && (
            <FinanceiroERP 
              donations={donations}
              setDonations={setDonations}
              supporters={supporters}
              setSupporters={setSupporters}
              addAuditLog={addAuditLog}
            />
          )}

          {/* CONTEÚDO SECTION */}
          {(activeTab === 'conteudo-eventos' || activeTab === 'conteudo-noticias' || activeTab === 'conteudo-cursos' || activeTab === 'conteudo-galeria') && (
            <ConteudoCMS 
              events={events}
              setEvents={setEvents}
              news={news}
              setNews={setNews}
              courses={courses}
              setCourses={setCourses}
              photos={photos}
              setPhotos={setPhotos}
              videos={videos}
              setVideos={setVideos}
              professors={professors}
              addAuditLog={addAuditLog}
            />
          )}

          {/* CONFIGURAÇÕES GERAIS / SISTEMA */}
          {(activeTab === 'sistema-usuarios' || activeTab === 'sistema-biblioteca' || activeTab === 'sistema-configuracoes' || activeTab === 'sistema-auditoria' || activeTab === 'sistema-backup') && (
            <SistemaConfig 
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
            />
          )}

        </main>

      </div>
    </div>
  );
}
