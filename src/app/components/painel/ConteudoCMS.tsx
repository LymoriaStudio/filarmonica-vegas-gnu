import React, { useState, useEffect } from 'react';
import {
  FolderLock, Presentation, Calendar, Newspaper, Film, Plus, Trash2, Edit,
  Copy, Star, Eye, Globe, Sparkles, Image, Play, Check, Clock, CloudUpload, X
} from 'lucide-react';
import { InstrumentEvent, NewsArticle, MusicCourse, GalleryPhoto, GalleryVideo, Professor, Instrument } from '../../validations/types';
import { RichTextEditor, ImageUploader, Toast, uploadFileToSupabase } from './MiniWidgets';
import { supabase } from '../../../lib/supabase';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../../services/coursesServices';
import { getProfessors } from '../../services/professorsService';
import { listAllMedia, checkMediaUsage, deleteMediaFile, StorageMediaFile } from '../../services/storageService';
import { getInstruments, createInstrument, updateInstrument, deleteInstrument } from '../../services/instrumentsServices';


interface ConteudoCMSProps {
  events: InstrumentEvent[];
  setEvents: React.Dispatch<React.SetStateAction<InstrumentEvent[]>>;
  news: NewsArticle[];
  setNews: React.Dispatch<React.SetStateAction<NewsArticle[]>>;
  courses: MusicCourse[];
  setCourses: React.Dispatch<React.SetStateAction<MusicCourse[]>>;
  photos: GalleryPhoto[];
  setPhotos: React.Dispatch<React.SetStateAction<GalleryPhoto[]>>;
  videos: GalleryVideo[];
  setVideos: React.Dispatch<React.SetStateAction<GalleryVideo[]>>;
  professors: Professor[];
  addAuditLog: (action: string, module: string, details: string) => void;
  activeTab?: string;
}

// ==========================================
// MAPPERS: eventos (snake_case <-> camelCase)
// ==========================================
const mapEventFromDb = (row: any): InstrumentEvent => ({
  id: row.id,
  cover: row.cover_image,
  title: row.title,
  description: row.description,
  date: row.date,
  time: row.time,
  location: row.venue,
  address: row.address,
  mapsUrl: row.google_maps_url,
  category: row.category,
  status: row.status,
  featured: row.highlighted ?? false,
  link: row.link,
  isPaid: row.is_paid ?? false,
  ticket: row.ticket,
});

const mapEventToDb = (e: Partial<InstrumentEvent>) => ({
  cover_image: e.cover || null,
  title: e.title,
  description: e.description,
  date: e.date,
  time: e.time,
  venue: e.location,
  address: e.address,
  google_maps_url: e.mapsUrl || null,
  category: e.category,
  status: e.status || 'rascunho',
  highlighted: e.featured ?? false,
  link: e.link || null,
  is_paid: e.isPaid ?? false,
  ticket: e.isPaid ? (e.ticket ?? null) : null,
});

export default function ConteudoCMS({
  events,
  setEvents,
  news,
  setNews,
  courses,
  setCourses,
  photos,
  setPhotos,
  videos,
  setVideos,
  professors,
  addAuditLog,
  activeTab,
}: ConteudoCMSProps) {
  const initialSubTab = activeTab === 'conteudo-cursos' ? 'cursos' : activeTab === 'conteudo-galeria' ? 'galeria' : activeTab === 'conteudo-noticias' ? 'noticias' : activeTab === 'conteudo-instrumentos' ? 'instrumentos' : 'eventos';
  const [subTab, setSubTab] = useState<'eventos' | 'noticias' | 'cursos' | 'instrumentos' | 'galeria'>(initialSubTab as any);

  // Multi-Mode Gallery Tab status
  const [galleryMode, setGalleryMode] = useState<'fotos' | 'videos' | 'midia'>('fotos');

  // Modals state
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState<Partial<InstrumentEvent> | null>(null);
  const [eventSaving, setEventSaving] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Arquivo de capa pendente (upload diferido até confirmar/salvar)
  const [pendingEventCoverFile, setPendingEventCoverFile] = useState<File | null>(null);

  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [activeNews, setActiveNews] = useState<Partial<NewsArticle> | null>(null);

  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [activeCourse, setActiveCourse] = useState<Partial<MusicCourse> | null>(null);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [courseSaving, setCourseSaving] = useState(false);

  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState<Partial<GalleryPhoto> | null>(null);
  const [mediaFiles, setMediaFiles] = useState<StorageMediaFile[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaDeletingPath, setMediaDeletingPath] = useState<string | null>(null);

  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<Partial<GalleryVideo> | null>(null);
  const [professorsList, setProfessorsList] = useState<Professor[]>([]);

  const [pendingCoursePhotoFile, setPendingCoursePhotoFile] = useState<File | null>(null);

  // Instruments state
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [instrumentsLoading, setInstrumentsLoading] = useState(true);
  const [instrumentSaving, setInstrumentSaving] = useState(false);
  const [instrumentModalOpen, setInstrumentModalOpen] = useState(false);
  const [activeInstrument, setActiveInstrument] = useState<Partial<Instrument> | null>(null);
  const [pendingInstrumentImageFile, setPendingInstrumentImageFile] = useState<File | null>(null);
  const [pendingGalleryFile, setPendingGalleryFile] = useState<File | null>(null);


  // ==========================================
  // LOAD EVENTS FROM SUPABASE
  // ==========================================
  useEffect(() => {
    const fetchEvents = async () => {
      setEventsLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.error(error);
        setEventsLoading(false);
        return;
      }

      setEvents((data || []).map(mapEventFromDb));
      setEventsLoading(false);
    };

    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCoursesLoading(true);
    getCourses()
      .then(setCourses)
      .catch((error) => {
        console.error('Erro ao buscar cursos:', error);
      })
      .finally(() => setCoursesLoading(false));
  }, []);

  useEffect(() => {
    getProfessors()
      .then(setProfessorsList)
      .catch((err) => console.error('Erro ao carregar professores:', err));
  }, []);

  // ==========================================
  // LOAD INSTRUMENTS FROM SUPABASE
  // ==========================================
  useEffect(() => {
    setInstrumentsLoading(true);
    getInstruments()
      .then(setInstruments)
      .catch((err) => console.error('Erro ao carregar instrumentos:', err))
      .finally(() => setInstrumentsLoading(false));
  }, []);

  const fetchMediaLibrary = async () => {
    setMediaLoading(true);
    try {
      const files = await listAllMedia();
      setMediaFiles(files);
    } catch (err) {
      console.error('Erro ao carregar biblioteca de mídia:', err);
    } finally {
      setMediaLoading(false);
    }
  };

  useEffect(() => {
    if (galleryMode === 'midia' && mediaFiles.length === 0 && !mediaLoading) {
      fetchMediaLibrary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [galleryMode]);

  const handleDeleteMedia = async (file: StorageMediaFile) => {
    setMediaDeletingPath(file.path);
    try {
      const { inUse, usedBy } = await checkMediaUsage(file.url);

      if (inUse) {
        alert(
          `Não é possível remover este arquivo: ele está em uso por:\n\n${usedBy.join('\n')}\n\nRemova ou substitua a imagem nesses cadastros antes de excluir o arquivo.`
        );
        return;
      }

      if (!confirm(`Remover permanentemente o arquivo "${file.name}"? Esta ação não pode ser desfeita.`)) {
        return;
      }

      await deleteMediaFile(file.path);
      setMediaFiles(prev => prev.filter(f => f.path !== file.path));
      addAuditLog('Removeu Arquivo de Mídia', 'Conteúdo', `Removeu arquivo do Storage: ${file.path}`);
    } catch (err: any) {
      alert('Erro ao remover arquivo: ' + err.message);
    } finally {
      setMediaDeletingPath(null);
    }
  };

  // ==========================================
  // EVENTS CORE (CRUD via Supabase, DUPLICATE, FEATURED)
  // ==========================================
  const handleOpenEventModal = (item: Partial<InstrumentEvent> | null) => {
    setPendingEventCoverFile(null);
    setActiveEvent(item || {
      id: '',
      cover: '',
      title: '',
      description: '',
      date: '2026-06-15',
      time: '20:00',
      location: 'Theatro Municipal',
      address: 'Pça Ramos de Azevedo, Centro',
      mapsUrl: '',
      category: 'Concerto Especial',
      status: 'rascunho',
      featured: false,
      link: '',
      isPaid: false,
      ticket: undefined,
    });
    setEventModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent) return;

    setEventSaving(true);

    try {
      let finalCover = activeEvent.cover;

      // Faz o upload da capa somente agora, ao confirmar/salvar
      if (pendingEventCoverFile) {
        finalCover = await uploadFileToSupabase(pendingEventCoverFile, 'eventos');
      }

      const payload = mapEventToDb({
        ...activeEvent,
        cover: finalCover,
      });

      if (activeEvent.id) {
        // PUT (update)
        const { data, error } = await supabase
          .from('events')
          .update(payload)
          .eq('id', activeEvent.id)
          .select()
          .single();

        if (error) {
          console.error(error);
          alert('Erro ao atualizar evento: ' + error.message);
          return;
        }

        const updated = mapEventFromDb(data);
        setEvents(prev => prev.map(ev => ev.id === updated.id ? updated : ev));
        addAuditLog('Alterou Evento', 'Conteúdo', `Atualizou cronograma: ${updated.title}`);
      } else {
        // POST (insert)
        const { data, error } = await supabase
          .from('events')
          .insert(payload)
          .select()
          .single();

        if (error) {
          console.error(error);
          alert('Erro ao criar evento: ' + error.message);
          return;
        }

        const newEv = mapEventFromDb(data);
        setEvents(prev => [newEv, ...prev]);
        addAuditLog('Criou Evento', 'Conteúdo', `Criou novo evento na agenda: ${newEv.title}`);
      }

      setEventModalOpen(false);
      setActiveEvent(null);
      setPendingEventCoverFile(null);
    } catch (err: any) {
      console.error(err);
      alert('Erro ao enviar imagem de capa: ' + err.message);
    } finally {
      setEventSaving(false);
    }
  };

  const handleDuplicateEvent = async (evt: InstrumentEvent) => {
    const payload = mapEventToDb({
      ...evt,
      title: `${evt.title} (Cópia)`,
      featured: false,
      status: 'rascunho',
    });

    const { data, error } = await supabase
      .from('events')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error(error);
      alert('Erro ao duplicar evento: ' + error.message);
      return;
    }

    const duplicated = mapEventFromDb(data);
    setEvents(prev => [duplicated, ...prev]);
    addAuditLog('Duplicou Evento', 'Conteúdo', `Duplicou programação: ${evt.title}`);
    alert('Programação duplicada com sucesso! Ajuste a nova data no rascunho.');
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!confirm(`Remover o evento "${title}"? Esta ação não pode ser desfeita.`)) return;

    const { error } = await supabase.from('events').delete().eq('id', id);

    if (error) {
      console.error(error);
      alert('Erro ao remover evento: ' + error.message);
      return;
    }

    setEvents(prev => prev.filter(e => e.id !== id));
    addAuditLog('Deletou Evento', 'Conteúdo', `Removeu evento da agenda ID: ${id} (${title})`);
  };

  const handleToggleFeatureEvent = async (id: string, title: string, active: boolean) => {
    const { error } = await supabase
      .from('events')
      .update({ highlighted: active })
      .eq('id', id);

    if (error) {
      console.error(error);
      alert('Erro ao atualizar destaque: ' + error.message);
      return;
    }

    setEvents(prev => prev.map(e => e.id === id ? { ...e, featured: active } : e));
    addAuditLog('Destacou Evento', 'Conteúdo', `${active ? 'Destacou' : 'Removeu destaque'} do evento: ${title}`);
  };


  // ==========================================
  // ARTICLES & GENERAL NEWS (CRUD)
  // ==========================================
  const handleOpenNewsModal = (article: Partial<NewsArticle> | null) => {
    setActiveNews(article || {
      id: '',
      cover: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&h=300&q=80',
      title: '',
      summary: '',
      fullContent: '<blockquote>Escreva as novidades aqui no editor avançado...</blockquote>',
      category: 'Informativo',
      author: 'Assessoria de Imprensa',
      date: new Date().toISOString().slice(0, 10)
    });
    setNewsModalOpen(true);
  };

  const handleSaveNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNews) return;

    if (activeNews.id) {
      setNews(prev => prev.map(n => n.id === activeNews.id ? (activeNews as NewsArticle) : n));
      addAuditLog('Editou Notícia', 'Conteúdo', `Efetuou revisão no artigo: ${activeNews.title}`);
    } else {
      const newArt = { ...activeNews, id: `art-${Date.now()}` } as NewsArticle;
      setNews(prev => [newArt, ...prev]);
      addAuditLog('Publicou Notícia', 'Conteúdo', `Publicou novo artigo no blog acadêmico: ${newArt.title}`);
    }
    setNewsModalOpen(false);
  };

  const handleDeleteNews = (id: string, title: string) => {
    setNews(prev => prev.filter(n => n.id !== id));
    addAuditLog('Eliminou Artigo', 'Conteúdo', `Deletou notícia ID: ${id} (${title})`);
  };


  // ==========================================
  // MUSIC COURSES (CRUD)
  // ==========================================
  const handleOpenCourseModal = (course: Partial<MusicCourse> | null) => {
    setPendingCoursePhotoFile(null);
    setActiveCourse(course || {
      id: '',
      photo: '',
      name: '',
      description: '',
      ageLimit: 'Livre',
      duration: '4 meses',
      vagas: 20,
      professorId: professorsList[0]?.id || '',
      responsibleProfessor: professorsList[0]?.name || ''
    });
    setCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourse) return;

    setCourseSaving(true);
    try {
      let finalPhoto = activeCourse.photo;
      if (pendingCoursePhotoFile) {
        finalPhoto = await uploadFileToSupabase(pendingCoursePhotoFile, 'courses');
      }

      const coursePayload = { ...activeCourse, photo: finalPhoto };

      if (activeCourse.id) {
        const updated = await updateCourse(activeCourse.id, coursePayload);
        setCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
        addAuditLog('Alterou Curso', 'Conteúdo', `Atualizou ementa do curso: ${updated.name}`);
      } else {
        const created = await createCourse(coursePayload);
        setCourses(prev => [created, ...prev]);
        addAuditLog('Lançou Curso', 'Conteúdo', `Lançou nova classe/oficina regular: ${created.name}`);
      }
      setCourseModalOpen(false);
      setActiveCourse(null);
      setPendingCoursePhotoFile(null);
    } catch (err: any) {
      alert('Erro ao salvar curso: ' + err.message);
    } finally {
      setCourseSaving(false);
    }
  };

  const handleDeleteCourse = async (id: string, name: string) => {
    if (!confirm(`Remover permanentemente a oficina "${name}"?`)) return;
    try {
      await deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
      addAuditLog('Excluiu Oficina', 'Conteúdo', `Removeu ementa do curso ID: ${id} (${name})`);
    } catch (err: any) {
      alert('Erro ao remover curso: ' + err.message);
    }
  };

  // ==========================================
  // INSTRUMENTS (CRUD)
  // ==========================================
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const handleOpenInstrumentModal = (instrument: Partial<Instrument> | null) => {
    setPendingInstrumentImageFile(null);
    setPendingGalleryFile(null);
    setActiveInstrument(instrument || {
      id: '',
      slug: '',
      name: '',
      description: '',
      longDescription: '',
      image: '',
      gallery: [],
      videoUrl: '',
      color: '#0B4DA2',
    });
    setInstrumentModalOpen(true);
  };

  const handleSaveInstrument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInstrument) return;

    setInstrumentSaving(true);
    try {
      let finalImage = activeInstrument.image;
      if (pendingInstrumentImageFile) {
        finalImage = await uploadFileToSupabase(pendingInstrumentImageFile, 'instruments');
      }

      let finalGallery = activeInstrument.gallery || [];
      if (pendingGalleryFile) {
        const galleryUrl = await uploadFileToSupabase(pendingGalleryFile, 'instruments');
        finalGallery = [...finalGallery, galleryUrl];
      }

      const finalSlug = activeInstrument.slug?.trim()
        ? slugify(activeInstrument.slug)
        : slugify(activeInstrument.name || '');

      const payload: Partial<Instrument> = {
        ...activeInstrument,
        image: finalImage,
        gallery: finalGallery,
        slug: finalSlug,
      };

      if (activeInstrument.id) {
        const updated = await updateInstrument(activeInstrument.id, payload);
        setInstruments(prev => prev.map(i => i.id === updated.id ? updated : i));
        addAuditLog('Alterou Instrumento', 'Conteúdo', `Atualizou ficha do instrumento: ${updated.name}`);
      } else {
        const created = await createInstrument(payload);
        setInstruments(prev => [created, ...prev]);
        addAuditLog('Cadastrou Instrumento', 'Conteúdo', `Cadastrou novo instrumento: ${created.name}`);
      }

      setInstrumentModalOpen(false);
      setActiveInstrument(null);
      setPendingInstrumentImageFile(null);
      setPendingGalleryFile(null);
    } catch (err: any) {
      alert('Erro ao salvar instrumento: ' + err.message);
    } finally {
      setInstrumentSaving(false);
    }
  };

  const handleDeleteInstrument = async (id: string, name: string) => {
    if (!confirm(`Remover permanentemente o instrumento "${name}"?`)) return;
    try {
      await deleteInstrument(id);
      setInstruments(prev => prev.filter(i => i.id !== id));
      addAuditLog('Excluiu Instrumento', 'Conteúdo', `Removeu instrumento ID: ${id} (${name})`);
    } catch (err: any) {
      alert('Erro ao remover instrumento: ' + err.message);
    }
  };

  const handleRemoveGalleryImage = (url: string) => {
    setActiveInstrument(prev => prev ? {
      ...prev,
      gallery: (prev.gallery || []).filter(g => g !== url)
    } : prev);
  };

  // ==========================================
  // GALLERY (PHOTOS & VIDEOS CRUD)
  // ==========================================
  const handleOpenPhotoModal = (photo: Partial<GalleryPhoto> | null) => {
    setActivePhoto(photo || {
      id: '',
      url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=600&h=400&q=80',
      caption: '',
      album: 'Concertos 2026',
      category: 'Apresentações'
    });
    setPhotoModalOpen(true);
  };

  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePhoto) return;

    if (activePhoto.id) {
      setPhotos(prev => prev.map(p => p.id === activePhoto.id ? (activePhoto as GalleryPhoto) : p));
      addAuditLog('Alterou Foto Galeria', 'Conteúdo', `Editou legenda de foto`);
    } else {
      const newPt = { ...activePhoto, id: `pt-${Date.now()}` } as GalleryPhoto;
      setPhotos(prev => [newPt, ...prev]);
      addAuditLog('Sincronizou Foto', 'Conteúdo', `Fez upload de nova foto no álbum: ${newPt.album}`);
    }
    setPhotoModalOpen(false);
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
    addAuditLog('Deletou Foto', 'Conteúdo', `Removeu arquivo visual da Galeria`);
  };

  // Video helpers
  const handleOpenVideoModal = (video: Partial<GalleryVideo> | null) => {
    setActiveVideo(video || {
      id: '',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: '',
      vimeoUrl: ''
    });
    setVideoModalOpen(true);
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVideo) return;

    if (activeVideo.id) {
      setVideos(prev => prev.map(v => v.id === activeVideo.id ? (activeVideo as GalleryVideo) : v));
      addAuditLog('Atualizou Vídeo', 'Conteúdo', `Editou link de vídeo: ${activeVideo.title}`);
    } else {
      const newVd = { ...activeVideo, id: `vd-${Date.now()}` } as GalleryVideo;
      setVideos(prev => [newVd, ...prev]);
      addAuditLog('Anexou Vídeo', 'Conteúdo', `Subiu link de playback da filmagem: ${newVd.title}`);
    }
    setVideoModalOpen(false);
  };

  const handleDeleteVideo = (id: string, title: string) => {
    setVideos(prev => prev.filter(v => v.id !== id));
    addAuditLog('Ejetou Vídeo Link', 'Conteúdo', `Removeu player de vídeo: ${title}`);
  };


  return (
    <div className="space-y-6 p-6 animate-fade-in select-none">

      {/* CMS Header title */}
      <div className="pb-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-[#001856] tracking-tight flex items-center">
            <Presentation className="mr-2 text-sky-450" size={20} />
            Editor Geral de Conteúdos & Mídia (CMS)
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Controle concertos ao vivo na agenda, edite comunicados à imprensa com editor gráfico e altere cursos de capacitação técnica.
          </p>
        </div>

        {/* Tab switcher options */}
        <div className="flex bg-gray-100 border border-gray-200 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setSubTab('eventos')}
            className={`p-1.5 px-3 rounded-md font-semibold cursor-pointer transition-all ${subTab === 'eventos' ? 'bg-[#001856] text-white shadow' : 'text-gray-400'}`}
          >
            Agenda de Eventos
          </button>

          <button
            type="button"
            onClick={() => setSubTab('cursos')}
            className={`p-1.5 px-3 rounded-md font-semibold cursor-pointer transition-all ${subTab === 'cursos' ? 'bg-[#001856] text-white shadow' : 'text-gray-400'}`}
          >
            Oficinas Acadêmicas
          </button>
          <button
            type="button"
            onClick={() => setSubTab('instrumentos')}
            className={`p-1.5 px-3 rounded-md font-semibold cursor-pointer transition-all ${subTab === 'instrumentos' ? 'bg-[#001856] text-white shadow' : 'text-gray-400'}`}
          >
            Instrumentos
          </button>
          <button
            type="button"
            onClick={() => setSubTab('galeria')}
            className={`p-1.5 px-3 rounded-md font-semibold cursor-pointer transition-all ${subTab === 'galeria' ? 'bg-[#001856] text-white shadow' : 'text-gray-400'}`}
          >
            Galeria Multimídia
          </button>
        </div>
      </div>

      {/* ==========================================================
          SUBTAB 1: EVENTS LIST & DUPLICATION (CMS AGENDA)
          ========================================================== */}
      {subTab === 'eventos' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white border border-gray-200 p-4 rounded-xl">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-amber-500 tracking-wider">Mural Orquestral de Apresentações</span>
              <p className="text-xs text-gray-400">Ative o destaque para estampar a abertura de vendas de ingressos na Home principal.</p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenEventModal(null)}
              className="p-2 px-3 bg-[#001856] hover:bg-blue-750 text-white rounded text-xs font-semibold cursor-pointer"
            >
              + Adicionar Novo Evento
            </button>
          </div>

          {eventsLoading ? (
            <div className="text-center py-12 text-xs text-gray-400 font-mono">Carregando eventos...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400 font-mono border border-dashed border-gray-200 rounded-xl">
              Nenhum evento cadastrado ainda.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xxl:grid-cols-3 gap-6">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="rounded-xl overflow-hidden bg-white border border-gray-100 flex flex-col justify-between hover:border-gray-300 transition"
                >
                  <div className="relative">
                    <img
                      src={evt.cover}
                      alt={evt.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-36 object-cover bg-gray-50"
                    />
                    {/* Category badging */}
                    <span className="absolute top-2 left-2 bg-black/75 backdrop-blur-sm text-amber-500 text-[9px] font-mono font-bold uppercase p-1 px-2.5 rounded-full border border-gray-200">
                      {evt.category}
                    </span>

                    {/* Featured badge */}
                    {evt.featured && (
                      <span className="absolute top-2 right-2 bg-[#ffc300]/95 text-black text-[9px] font-extrabold uppercase p-1 px-2.5 rounded-full flex items-center">
                        <Star size={10} className="mr-1 fill-black" /> Destaque
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex-1 space-y-2">
                    <span className="text-[9.5px] font-mono text-neutral-550 flex items-center">
                      <Clock size={11} className="mr-1 inline text-[#001856]" />
                      {evt.date} • {evt.time}
                    </span>
                    <h4 className="text-xs font-bold text-[#001856] font-sans tracking-tight leading-snug">{evt.title}</h4>
                    <p className="text-[11px] text-gray-400 line-clamp-3">{evt.description}</p>
                    {evt.isPaid && evt.ticket != null && (
                      <span className="inline-block text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/50 p-0.5 px-2 rounded">
                        Ingresso: R$ {Number(evt.ticket).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>

                  {/* Additional event lines */}
                  <div className="p-3.5 bg-gray-50 font-mono text-[9.5px] text-gray-400 border-t border-gray-100 flex justify-between select-none">
                    <span className="truncate max-w-56">Local: {evt.location}</span>
                    <span className={`p-0.5 px-2 rounded text-[8px] uppercase font-bold tracking-widest ${
                      evt.status === 'published' ? 'bg-emerald-950 text-emerald-400' :
                      evt.status === 'rascunho' ? 'bg-gray-100 text-gray-400' :
                      'bg-rose-955 text-rose-500'
                    }`}>
                      {evt.status === 'published' ? 'Publicado' : evt.status === 'rascunho' ? 'Rascunho' : 'Arquivado'}
                    </span>
                  </div>

                  {/* Event Actions Footer */}
                  <div className="p-2.5 bg-neutral-955 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatureEvent(evt.id, evt.title, !evt.featured)}
                        className={`text-[9px] font-mono font-bold p-1 px-2 rounded cursor-pointer transition-all ${
                          evt.featured ? 'bg-[#ffc300]/10 text-[#ffc300]' : 'bg-white text-gray-400'
                        }`}
                      >
                        Destaque {evt.featured ? 'Sim' : 'Não'}
                      </button>
                      <button
                        type="button"
                        title="Duplicar Evento"
                        onClick={() => handleDuplicateEvent(evt)}
                        className="p-1.5 bg-white hover:bg-gray-100 rounded text-gray-400 hover:text-[#001856]"
                      >
                        <Copy size={11} />
                      </button>
                    </div>

                    <div className="flex space-x-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEventModal(evt)}
                        className="p-1 bg-white text-amber-500 rounded cursor-pointer px-2 text-[10.5px] font-mono font-bold"
                      >
                        EDITAR
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(evt.id, evt.title)}
                        className="p-1 bg-white text-rose-500 rounded cursor-pointer px-2 text-[10.5px] font-mono font-bold"
                      >
                        EXCLUIR
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}



      {/* ==========================================================
          SUBTAB 3: MUSIC COURSES EDUCATION (CMS ACADEMY)
          ========================================================== */}
      {subTab === 'cursos' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white border border-gray-200 p-4 rounded-xl">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-sky-450 tracking-widest">Matriz Curricular de Sobrecarga e Sopros</span>
              <p className="text-xs text-gray-400">Atribua os maestros das oficinas e gerencie o número total de vagas regulares.</p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenCourseModal(null)}
              className="p-2 px-3 bg-[#001856] text-white text-xs font-semibold rounded cursor-pointer"
            >
              + Lançar Nova Classe / Oficina
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coursesLoading ? (
              <div className="col-span-2 text-center py-12 text-xs text-gray-400 font-mono">Carregando oficinas...</div>
            ) : courses.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-xs text-gray-400 font-mono border border-dashed border-gray-200 rounded-xl">
                Nenhuma oficina cadastrada ainda.
              </div>
            ) : courses.map((crs) => (
              <div key={crs.id} className="p-4 rounded-xl bg-white border border-gray-100 flex gap-4 justify-between items-start">
                <div className="flex gap-4">
                  <img
                    src={crs.photo}
                    alt={crs.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200 shrink-0"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#001856] font-sans tracking-tight">{crs.name}</h4>
                    <span className="block text-[10px] text-amber-500 font-mono mt-0.5">Professor Responsável: {crs.responsibleProfessor}</span>
                    <p className="text-[11px] text-gray-400 mt-1.5 leading-normal line-clamp-2">"{crs.description}"</p>

                    <div className="flex flex-wrap gap-2.5 text-[9px] font-mono text-gray-400 mt-3 uppercase tracking-wider">
                      <span className="p-0.5 px-2 bg-gray-50 rounded">Vagas: {crs.vagas}</span>
                      <span className="p-0.5 px-2 bg-gray-50 rounded">Tempo: {crs.duration}</span>
                      <span className="p-0.5 px-2 bg-gray-50 rounded">Faixa: {crs.ageLimit}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 self-center">
                  <button
                    type="button"
                    onClick={() => handleOpenCourseModal(crs)}
                    className="p-1 px-2.5 bg-neutral-850 hover:bg-gray-100 text-amber-500 border border-gray-200 rounded font-mono text-[9px] cursor-pointer"
                  >
                    EDITAR
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCourse(crs.id, crs.name)}
                    className="p-1 px-2.5 bg-neutral-850 hover:bg-rose-950 text-rose-500 border border-gray-200 rounded font-mono text-[9px] cursor-pointer"
                  >
                    EXCLUIR
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================================
          SUBTAB: INSTRUMENTS CATALOG (CMS)
          ========================================================== */}
      {subTab === 'instrumentos' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white border border-gray-200 p-4 rounded-xl">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-amber-500 tracking-widest">Catálogo de Instrumentos</span>
              <p className="text-xs text-gray-400">Cadastre os instrumentos da orquestra com descrição, galeria e vídeo de demonstração.</p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenInstrumentModal(null)}
              className="p-2 px-3 bg-[#001856] text-white text-xs font-semibold rounded cursor-pointer"
            >
              + Adicionar Instrumento
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xxl:grid-cols-3 gap-6">
            {instrumentsLoading ? (
              <div className="col-span-3 text-center py-12 text-xs text-gray-400 font-mono">Carregando instrumentos...</div>
            ) : instruments.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-xs text-gray-400 font-mono border border-dashed border-gray-200 rounded-xl">
                Nenhum instrumento cadastrado ainda.
              </div>
            ) : instruments.map((inst) => (
              <div
                key={inst.id}
                className="rounded-xl overflow-hidden bg-white border border-gray-100 flex flex-col justify-between hover:border-gray-300 transition"
              >
                <div className="relative">
                  <img
                    src={inst.image}
                    alt={inst.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-36 object-cover bg-gray-50"
                  />
                  <span
                    className="absolute top-2 left-2 text-black text-[9px] font-extrabold uppercase p-1 px-2.5 rounded-full"
                    style={{ backgroundColor: inst.color || '#ffc300' }}
                  >
                    {inst.slug}
                  </span>
                  {inst.gallery?.length > 0 && (
                    <span className="absolute top-2 right-2 bg-black/75 backdrop-blur-sm text-gray-800 text-[9px] font-mono font-bold p-1 px-2.5 rounded-full border border-gray-200">
                      {inst.gallery.length} foto(s)
                    </span>
                  )}
                </div>

                <div className="p-4 flex-1 space-y-2">
                  <h4 className="text-xs font-bold text-[#001856] font-sans tracking-tight leading-snug">{inst.name}</h4>
                  <p className="text-[11px] text-gray-400 line-clamp-2">{inst.description}</p>
                  {inst.videoUrl && (
                    <span className="inline-flex items-center text-[9px] font-mono font-bold text-sky-450 bg-sky-950/50 p-0.5 px-2 rounded">
                      <Film size={10} className="mr-1" /> Vídeo de demonstração
                    </span>
                  )}
                </div>

                <div className="p-2.5 bg-neutral-955 border-t border-gray-100 flex items-center justify-end space-x-1 text-xs">
                  <button
                    type="button"
                    onClick={() => handleOpenInstrumentModal(inst)}
                    className="p-1 bg-white text-amber-500 rounded cursor-pointer px-2 text-[10.5px] font-mono font-bold"
                  >
                    EDITAR
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteInstrument(inst.id, inst.name)}
                    className="p-1 bg-white text-rose-500 rounded cursor-pointer px-2 text-[10.5px] font-mono font-bold"
                  >
                    EXCLUIR
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================================
          SUBTAB 4: MULTIMEDIA GALLERY (PHOTOS & VIDEOS REELS)
          ========================================================== */}
      {subTab === 'galeria' && (
        <div className="space-y-4">

          <div className="flex justify-between items-center bg-white border border-gray-200 p-4 rounded-xl flex-wrap gap-2.5">
            <div className="flex space-x-1.5 bg-gray-100 p-0.5 rounded border border-gray-200 text-xs">
              <button
                type="button"
                onClick={() => setGalleryMode('fotos')}
                className={`p-1 px-3 rounded font-mono font-bold cursor-pointer text-[10px] ${galleryMode === 'fotos' ? 'bg-[#001856] text-white' : 'text-gray-400'}`}
              >
                ÁLBUNS DE FOTOS
              </button>
              <button
                type="button"
                onClick={() => setGalleryMode('videos')}
                className={`p-1 px-3 rounded font-mono font-bold cursor-pointer text-[10px] ${galleryMode === 'videos' ? 'bg-[#001856] text-white' : 'text-gray-400'}`}
              >
                CANAL DE VÍDEOS (YOUTUBE)
              </button>
              <button
                type="button"
                onClick={() => setGalleryMode('midia')}
                className={`p-1 px-3 rounded font-mono font-bold cursor-pointer text-[10px] ${galleryMode === 'midia' ? 'bg-[#001856] text-white' : 'text-gray-400'}`}
              >
                BIBLIOTECA DE MÍDIA
              </button>
            </div>

            {galleryMode === 'fotos' && (
              <button
                type="button"
                onClick={() => handleOpenPhotoModal(null)}
                className="p-1.5 px-3 bg-[#001856] hover:bg-blue-750 text-white text-xs font-mono font-bold rounded"
              >
                + Registrar Nova Foto
              </button>
            )}
            {galleryMode === 'videos' && (
              <button
                type="button"
                onClick={() => handleOpenVideoModal(null)}
                className="p-1.5 px-3 bg-[#001856] hover:bg-blue-750 text-white text-xs font-mono font-bold rounded"
              >
                + Anexar Link de Vídeo Vimeo/YouTube
              </button>
            )}
            {galleryMode === 'midia' && (
              <button
                type="button"
                onClick={fetchMediaLibrary}
                disabled={mediaLoading}
                className="p-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-mono font-bold rounded disabled:opacity-60"
              >
                {mediaLoading ? 'Atualizando...' : 'Atualizar Lista'}
              </button>
            )}
          </div>

          {/* Render Mode A: Photos collection */}
          {galleryMode === 'fotos' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photos.map((pt) => (
                <div key={pt.id} className="relative rounded-lg overflow-hidden border border-gray-100 bg-white group">
                  <img
                    src={pt.url}
                    alt={pt.caption}
                    referrerPolicy="no-referrer"
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/85 opacity-0 group-hover:opacity-100 transition-all p-3 flex flex-col justify-between text-[11px] text-gray-800 leading-tight">
                    <div>
                      <span className="text-[8px] font-mono text-amber-500 uppercase block mb-1">Álbum: {pt.album}</span>
                      <p>"{pt.caption}"</p>
                    </div>

                    <div className="flex justify-end space-x-1">
                      <button
                        onClick={() => handleOpenPhotoModal(pt)}
                        className="p-1 bg-gray-100 text-[#ffc300] rounded hover:bg-gray-200 cursor-pointer"
                      >
                        <Edit size={10} />
                      </button>
                      <button
                        onClick={() => handleDeletePhoto(pt.id)}
                        className="p-1 bg-gray-100 text-rose-500 rounded hover:bg-rose-950 cursor-pointer"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Render Mode B: Videos feed (YouTube widgets) */}
          {galleryMode === 'videos' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {videos.map((vid) => (
                <div key={vid.id} className="p-3 rounded-lg overflow-hidden border border-gray-100 bg-white text-xs flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="relative rounded overflow-hidden aspect-video bg-gray-50 flex items-center justify-center">
                      <Film className="text-gray-200" size={32} />
                      <span className="absolute bottom-1 right-1 bg-amber-500 text-black text-[8px] font-bold p-0.5 px-1.5 rounded uppercase font-mono">LINK EXTERNO</span>
                    </div>
                    <h4 className="font-bold text-[#001856] font-sans tracking-tight truncate">{vid.title}</h4>
                    <p className="text-[10px] font-mono text-[#001856] truncate">{vid.youtubeUrl || vid.vimeoUrl}</p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-gray-100 flex justify-end space-x-1">
                    <button
                      type="button"
                      onClick={() => handleOpenVideoModal(vid)}
                      className="p-1 px-3 bg-gray-100 hover:bg-gray-200 rounded text-amber-500 hover:text-amber-250 transition-all font-mono"
                    >
                      EDITAR
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteVideo(vid.id, vid.title)}
                      className="p-1 px-2.5 bg-gray-100 hover:bg-rose-955 rounded text-rose-400 hover:text-rose-225 transition-all"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Render Mode C: Media Library (Storage bucket) */}
          {galleryMode === 'midia' && (
            <div>
              {mediaLoading ? (
                <div className="text-center py-12 text-xs text-gray-400 font-mono">Carregando arquivos do Storage...</div>
              ) : mediaFiles.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-400 font-mono border border-dashed border-gray-200 rounded-xl">
                  Nenhum arquivo encontrado no bucket.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {mediaFiles.map((file) => (
                    <div key={file.path} className="relative rounded-lg overflow-hidden border border-gray-100 bg-white group">
                      <img
                        src={file.url}
                        alt={file.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-32 object-cover bg-gray-50"
                      />
                      <span className="absolute top-1.5 left-1.5 bg-black/75 backdrop-blur-sm text-amber-500 text-[8px] font-mono font-bold uppercase p-1 px-2 rounded-full border border-gray-200">
                        {file.folder}
                      </span>

                      <div className="absolute inset-0 bg-black/85 opacity-0 group-hover:opacity-100 transition-all p-3 flex flex-col justify-between text-[10px] text-gray-800 leading-tight">
                        <p className="break-all">{file.name}</p>

                        <div className="flex justify-end">
                          <button
                            onClick={() => handleDeleteMedia(file)}
                            disabled={mediaDeletingPath === file.path}
                            className="p-1 px-2 bg-gray-100 text-rose-500 rounded hover:bg-rose-950 cursor-pointer disabled:opacity-50 flex items-center text-[9px] font-mono font-bold"
                          >
                            <Trash2 size={10} className="mr-1" />
                            {mediaDeletingPath === file.path ? 'Removendo...' : 'EXCLUIR'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}


      {/* ==========================================================
          MODALS DRAG OVERLAYS
          ========================================================== */}

      {/* Modal A: Event registration */}
      {eventModalOpen && activeEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-fade-in">
          <form
            onSubmit={handleSaveEvent}
            className="w-full max-w-xl bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xl space-y-4"
          >
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-amber-500 uppercase tracking-widest">
                {activeEvent.id ? 'Ajuste da Programação da Agenda' : 'Novo Evento na Agenda'}
              </span>
              <button type="button" onClick={() => setEventModalOpen(false)} className="text-gray-400">Fechar</button>
            </div>

            <div className="p-4 space-y-3.5 max-h-[440px] overflow-y-auto">
              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Título do Concerto / Evento</label>
                <input
                  type="text"
                  required
                  value={activeEvent.title || ''}
                  onChange={(e) => setActiveEvent({ ...activeEvent, title: e.target.value })}
                  className="w-full bg-gray-50 border border-neutral-820 text-[#001856] p-2 text-xs rounded focus:outline-none"
                  placeholder="Ex: Noite de Metais Clássicos - Schubert"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Breve Descrição para o Card</label>
                <textarea
                  required
                  value={activeEvent.description || ''}
                  onChange={(e) => setActiveEvent({ ...activeEvent, description: e.target.value })}
                  rows={2}
                  className="w-full bg-gray-50 border border-neutral-820 text-[#001856] p-2 text-xs rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Data de Realização</label>
                  <input
                    type="date"
                    required
                    value={activeEvent.date || ''}
                    onChange={(e) => setActiveEvent({ ...activeEvent, date: e.target.value })}
                    className="w-full bg-gray-50 border border-neutral-820 text-[#001856] p-2 text-xs rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-505 mb-1">Horário de Início</label>
                  <input
                    type="text"
                    required
                    value={activeEvent.time || ''}
                    onChange={(e) => setActiveEvent({ ...activeEvent, time: e.target.value })}
                    className="w-full bg-gray-50 border border-neutral-820 text-[#001856] p-2 text-xs rounded font-mono"
                    placeholder="Ex: 19:30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Local / Palco Principal</label>
                  <input
                    type="text"
                    required
                    value={activeEvent.location || ''}
                    onChange={(e) => setActiveEvent({ ...activeEvent, location: e.target.value })}
                    className="w-full bg-gray-50 border border-neutral-820 text-[#001856] p-2 text-xs rounded"
                    placeholder="Ex: Auditório Externo do Conservatório"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Categoria de Entrada</label>
                  <input
                    type="text"
                    required
                    value={activeEvent.category || ''}
                    onChange={(e) => setActiveEvent({ ...activeEvent, category: e.target.value })}
                    className="w-full bg-gray-50 border border-neutral-820 text-[#001856] p-2 text-xs rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Endereço Completo</label>
                <input
                  type="text"
                  required
                  value={activeEvent.address || ''}
                  onChange={(e) => setActiveEvent({ ...activeEvent, address: e.target.value })}
                  className="w-full bg-gray-50 border border-neutral-820 text-[#001856] p-2 text-xs rounded"
                  placeholder="Ex: Pça Ramos de Azevedo, Centro - São Paulo, SP"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Link Google Maps (opcional)</label>
                  <input
                    type="text"
                    value={activeEvent.mapsUrl || ''}
                    onChange={(e) => setActiveEvent({ ...activeEvent, mapsUrl: e.target.value })}
                    className="w-full bg-gray-50 border border-neutral-820 text-[#001856] p-2 text-xs rounded font-mono"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Link Externo (inscrição/ingresso)</label>
                  <input
                    type="text"
                    value={activeEvent.link || ''}
                    onChange={(e) => setActiveEvent({ ...activeEvent, link: e.target.value })}
                    className="w-full bg-gray-50 border border-neutral-820 text-[#001856] p-2 text-xs rounded font-mono"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* É pago? */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">É Pago?</label>
                  <select
                    value={activeEvent.isPaid ? 'sim' : 'nao'}
                    onChange={(e) => {
                      const isPaid = e.target.value === 'sim';
                      setActiveEvent(prev => prev ? {
                        ...prev,
                        isPaid,
                        ticket: isPaid ? prev.ticket : undefined,
                      } : prev);
                    }}
                    className="w-full bg-gray-50 border border-neutral-820 text-gray-400 p-2 text-xs rounded"
                  >
                    <option value="nao">Não (Entrada Gratuita)</option>
                    <option value="sim">Sim (Evento Pago)</option>
                  </select>
                </div>

                {/* Campo de valor só aparece se for pago */}
                {activeEvent.isPaid && (
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-emerald-500 mb-1">Valor do Ingresso (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={activeEvent.ticket ?? ''}
                      onChange={(e) => setActiveEvent({ ...activeEvent, ticket: e.target.value === '' ? undefined : Number(e.target.value) })}
                      className="w-full bg-gray-50 border border-neutral-820 text-[#001856] p-2 text-xs rounded font-mono"
                      placeholder="Ex: 25.00"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Status Publicação</label>
                  <select
                    value={activeEvent.status || 'rascunho'}
                    onChange={(e) => setActiveEvent({ ...activeEvent, status: e.target.value as any })}
                    className="w-full bg-gray-50 border border-neutral-820 text-gray-400 p-2 text-xs rounded"
                  >
                    <option value="published">Liberado ao Público (Ativo)</option>
                    <option value="rascunho">Rascunho Interno</option>
                    <option value="arquivado">Arquivado</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-2">Upload Imagem de Capa</label>
                  {activeEvent.cover && (
                    <img
                      src={activeEvent.cover}
                      alt="Pré-visualização capa"
                      referrerPolicy="no-referrer"
                      className="w-full h-20 object-cover rounded border border-gray-200 mb-2"
                    />
                  )}
                  <ImageUploader
                    allowedTypes="Imagens (.jpg, .png, .webp)"
                    onFileSelected={(file, previewUrl) => {
                      setPendingEventCoverFile(file);
                      setActiveEvent(prev => prev ? { ...prev, cover: previewUrl } : prev);
                    }}
                  />
                </div>
              </div>

            </div>

            <div className="bg-gray-50 p-3 border-t border-gray-200 flex justify-end space-x-2">
              <button type="button" onClick={() => setEventModalOpen(false)} className="text-xs text-gray-400 px-3 py-1 bg-white rounded">Cancelar</button>
              <button
                type="submit"
                disabled={eventSaving}
                className="text-xs text-white px-5 py-1 bg-[#001856] rounded disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {eventSaving ? 'Salvando...' : 'Aportar na Agenda'}
              </button>
            </div>
          </form>
        </div>
      )}


      {/* Modal B: News article form (Advanced Text Editor inside) */}
      {newsModalOpen && activeNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fade-in">
          <form
            onSubmit={handleSaveNews}
            className="w-full max-w-2xl bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xl space-y-4"
          >
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-amber-500 uppercase tracking-widest">Editor de Comunicado à Imprensa (CMS)</span>
              <button type="button" onClick={() => setNewsModalOpen(false)} className="text-gray-400">Fechar</button>
            </div>

            <div className="p-4 space-y-3.5 max-h-[460px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-505 mb-1">Título da Matéria</label>
                  <input
                    type="text"
                    required
                    value={activeNews.title || ''}
                    onChange={(e) => setActiveNews({ ...activeNews, title: e.target.value })}
                    className="w-full bg-gray-50 border border-neutral-820 text-[#001856] p-2 text-xs rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-505 mb-1">Pariado com Categoria</label>
                  <input
                    type="text"
                    value={activeNews.category || ''}
                    onChange={(e) => setActiveNews({ ...activeNews, category: e.target.value })}
                    className="w-full bg-gray-50 border border-neutral-820 text-neutral-105 p-2 text-xs rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Resumo Sinopse de Listagem</label>
                <input
                  type="text"
                  value={activeNews.summary || ''}
                  onChange={(e) => setActiveNews({ ...activeNews, summary: e.target.value })}
                  className="w-full bg-gray-50 border border-neutral-820 text-[#001856] p-2 text-xs rounded focus:outline-none"
                  placeholder="Instigue o leitor a clicar no post..."
                />
              </div>

              {/* Advanced WYSIWYG integration layout */}
              <div className="bg-neutral-955 p-3 rounded-lg border border-gray-100">
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-2 font-bold flex items-center">
                  <Sparkles size={11} className="mr-1.5 text-[#ffc300]" /> Editor de texto avançado estilo WordPress
                </label>
                <RichTextEditor
                  value={activeNews.content || ''}
                  onChange={(val) => setActiveNews({ ...activeNews, content: val })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1 font-bold">Autor / Redator</label>
                  <input
                    type="text"
                    value={activeNews.author || ''}
                    onChange={(e) => setActiveNews({ ...activeNews, author: e.target.value })}
                    className="w-full bg-gray-50 border border-neutral-820 text-[#001856] p-2 text-xs rounded"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-2">Upload Imagem de Capagem</label>
                  <ImageUploader
                    onFileSelected={(file, previewUrl) => setActiveNews({ ...activeNews, coverImage: previewUrl })}
                  />
                </div>
              </div>

            </div>

            <div className="bg-gray-50 p-3 border-t border-gray-200 flex justify-end space-x-2">
              <button type="button" onClick={() => setNewsModalOpen(false)} className="text-xs text-gray-400 px-3 py-1 bg-white rounded">Cancelar</button>
              <button type="submit" className="text-xs text-white px-5 py-1 bg-[#001856] rounded">Publicar Postagem</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal C: Music course form */}
      {courseModalOpen && activeCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <form
            onSubmit={handleSaveCourse}
            className="w-full max-w-md bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xl space-y-4"
          >
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-amber-500 uppercase tracking-widest font-sans">Ementa Curricular</span>
              <button type="button" onClick={() => setCourseModalOpen(false)} className="text-gray-400 font-sans cursor-pointer">Fechar</button>
            </div>

            <div className="p-4 space-y-3.5">
              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Nome Oficina / Instrumento</label>
                <input
                  type="text"
                  required
                  value={activeCourse.name || ''}
                  onChange={(e) => setActiveCourse({ ...activeCourse, name: e.target.value })}
                  className="w-full bg-gray-50 border border-neutral-820 text-[#001856] p-2 text-xs rounded focus:outline-none"
                  placeholder="Ex: Masterclass de Trompa Sinfônica"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Descrição</label>
                <textarea
                  value={activeCourse.description || ''}
                  onChange={(e) => setActiveCourse({ ...activeCourse, description: e.target.value })}
                  rows={2}
                  className="w-full bg-gray-50 border border-neutral-820 text-[#001856] p-2 text-xs rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Professor Titular</label>
                  <select
                    value={activeCourse.professorId || ''}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const selectedProf = professorsList.find(p => p.id === selectedId);
                      setActiveCourse({
                        ...activeCourse,
                        professorId: selectedId,
                        responsibleProfessor: selectedProf?.name || ''
                      });
                    }}
                    className="w-full bg-gray-50 border border-neutral-820 text-gray-400 p-2 text-xs rounded"
                  >
                    <option value="">Selecione...</option>
                    {professorsList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Tempo de Carga Horária</label>
                  <input
                    type="text"
                    value={activeCourse.duration || ''}
                    onChange={(e) => setActiveCourse({ ...activeCourse, duration: e.target.value })}
                    className="w-full bg-gray-50 border border-neutral-820 text-[#001856] p-2 text-xs rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Quantidade de Vagas</label>
                  <input
                    type="number"
                    value={activeCourse.vagas || 1}
                    onChange={(e) => setActiveCourse({ ...activeCourse, vagas: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-neutral-820 text-[#001856] p-2 text-xs rounded font-mono"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <ImageUploader
                    bg={activeCourse.photo && activeCourse.photo}
                    allowedTypes="Imagens (.jpg, .png, .webp)"
                    onFileSelected={(file, previewUrl) => {
                      setPendingCoursePhotoFile(file);
                      setActiveCourse(prev => prev ? { ...prev, photo: previewUrl } : prev);
                    }}
                  />
                </div>
              </div>

            </div>

            <div className="bg-gray-50 p-3 border-t border-gray-200 flex justify-end space-x-2">
              <button type="button" onClick={() => setCourseModalOpen(false)} className="text-xs text-gray-400 px-3 py-1 bg-white rounded">Cancelar</button>
              <button
                type="submit"
                disabled={courseSaving}
                className="text-xs text-white px-5 py-1 bg-[#001856] rounded disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {courseSaving ? 'Salvando...' : 'Confirmar Ementa'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal F: Instrument form */}
      {instrumentModalOpen && activeInstrument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-fade-in">
          <form
            onSubmit={handleSaveInstrument}
            className="w-full max-w-xl bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xl space-y-4"
          >
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-amber-500 uppercase tracking-widest">
                {activeInstrument.id ? 'Editar Instrumento' : 'Novo Instrumento'}
              </span>
              <button type="button" onClick={() => setInstrumentModalOpen(false)} className="text-gray-400">Fechar</button>
            </div>

            <div className="p-4 space-y-3.5 max-h-[460px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Nome do Instrumento</label>
                  <input
                    type="text"
                    required
                    value={activeInstrument.name || ''}
                    onChange={(e) => setActiveInstrument({ ...activeInstrument, name: e.target.value })}
                    className="w-full bg-gray-50 border border-neutral-820 text-[#001856] p-2 text-xs rounded focus:outline-none"
                    placeholder="Ex: Trompete"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Slug (opcional, gerado automaticamente)</label>
                  <input
                    type="text"
                    value={activeInstrument.slug || ''}
                    onChange={(e) => setActiveInstrument({ ...activeInstrument, slug: e.target.value })}
                    className="w-full bg-gray-50 border border-neutral-820 text-[#001856] p-2 text-xs rounded font-mono"
                    placeholder="trompete"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Descrição Curta</label>
                <textarea
                  required
                  value={activeInstrument.description || ''}
                  onChange={(e) => setActiveInstrument({ ...activeInstrument, description: e.target.value })}
                  rows={2}
                  className="w-full bg-gray-50 border border-neutral-820 text-[#001856] p-2 text-xs rounded focus:outline-none"
                  placeholder="Resumo para o card de listagem..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Descrição Completa</label>
                <textarea
                  required
                  value={activeInstrument.longDescription || ''}
                  onChange={(e) => setActiveInstrument({ ...activeInstrument, longDescription: e.target.value })}
                  rows={4}
                  className="w-full bg-gray-50 border border-neutral-820 text-[#001856] p-2 text-xs rounded focus:outline-none"
                  placeholder="Texto completo para a página do instrumento..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Link de Vídeo (YouTube/Vimeo)</label>
                  <input
                    type="text"
                    value={activeInstrument.videoUrl || ''}
                    onChange={(e) => setActiveInstrument({ ...activeInstrument, videoUrl: e.target.value })}
                    className="w-full bg-gray-50 border border-neutral-820 text-[#001856] p-2 text-xs rounded font-mono"
                    placeholder="https://youtube.com/watch?..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Cor de Destaque</label>
                  <input
                    type="color"
                    value={activeInstrument.color || '#0B4DA2'}
                    onChange={(e) => setActiveInstrument({ ...activeInstrument, color: e.target.value })}
                    className="w-full bg-gray-50 border border-neutral-820 h-9 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-end">
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-2">Imagem Principal</label>
                {activeInstrument.image && (
                  <img
                    src={activeInstrument.image}
                    alt="Pré-visualização"
                    referrerPolicy="no-referrer"
                    className="w-full h-28 object-cover rounded border border-gray-200 mb-2"
                  />
                )}
                <ImageUploader
                  allowedTypes="Imagens (.jpg, .png, .webp)"
                  onFileSelected={(file, previewUrl) => {
                    setPendingInstrumentImageFile(file);
                    setActiveInstrument(prev => prev ? { ...prev, image: previewUrl } : prev);
                  }}
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-2 font-bold">Galeria de Fotos</label>

                {activeInstrument.gallery && activeInstrument.gallery.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {activeInstrument.gallery.map((url) => (
                      <div key={url} className="relative group">
                        <img
                          src={url}
                          alt="Galeria"
                          referrerPolicy="no-referrer"
                          className="w-full h-16 object-cover rounded border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(url)}
                          className="absolute top-0.5 right-0.5 bg-rose-950 text-rose-400 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="block text-[9px] font-mono uppercase text-gray-400 mb-1">Adicionar foto à galeria (1 por vez, salva ao confirmar)</label>
                <ImageUploader
                  allowedTypes="Imagens (.jpg, .png, .webp)"
                  onFileSelected={(file) => setPendingGalleryFile(file)}
                />
                {pendingGalleryFile && (
                  <p className="text-[9px] text-emerald-400 font-mono mt-1">Pronta para envio: {pendingGalleryFile.name}</p>
                )}
              </div>

            </div>

            <div className="bg-gray-50 p-3 border-t border-gray-200 flex justify-end space-x-2">
              <button type="button" onClick={() => setInstrumentModalOpen(false)} className="text-xs text-gray-400 px-3 py-1 bg-white rounded">Cancelar</button>
              <button
                type="submit"
                disabled={instrumentSaving}
                className="text-xs text-white px-5 py-1 bg-[#001856] rounded disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {instrumentSaving ? 'Salvando...' : 'Confirmar Instrumento'}
              </button>
            </div>
          </form>
        </div>
      )}


      {/* Modal D: Photo registry */}
      {photoModalOpen && activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <form
            onSubmit={handleSavePhoto}
            className="w-full max-w-sm bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xl"
          >
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center text-xs font-mono text-amber-500">
              <span>REGISTRAR FOTO NO ÁLBUM</span>
              <button type="button" onClick={() => setPhotoModalOpen(false)} className="text-gray-400">Fechar</button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Álbum de Origem</label>
                <select
                  value={activePhoto.album || ''}
                  onChange={(e) => setActivePhoto({ ...activePhoto, album: e.target.value })}
                  className="w-full bg-gray-50 border border-neutral-825 text-gray-400 p-2 text-xs rounded focus:outline-none"
                >
                  <option value="Concertos 2026">Concertos Metálicos 2026</option>
                  <option value="Ensaios Gerais">Ensaios e Bastidores</option>
                  <option value="Formatura Solene">Formatura Alunos Solene Nova</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Legenda Explicativa</label>
                <input
                  type="text"
                  required
                  value={activePhoto.caption || ''}
                  onChange={(e) => setActivePhoto({ ...activePhoto, caption: e.target.value })}
                  className="w-full bg-gray-50 border border-neutral-820 p-2 text-xs text-[#001856] rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-2">Upload de arquivo</label>
                <ImageUploader
                  onFileSelected={(file, previewUrl) => setActivePhoto({ ...activePhoto, url: previewUrl })}
                />
              </div>
            </div>

            <div className="bg-gray-50 p-3 border-t border-gray-200 flex justify-end space-x-1.5">
              <button type="button" onClick={() => setPhotoModalOpen(false)} className="text-xs text-gray-400 px-3 py-1 bg-white rounded">Cancelar</button>
              <button type="submit" className="text-xs text-white px-5 py-1 bg-[#001856] rounded">Gravar Imagem</button>
            </div>
          </form>
        </div>
      )}


      {/* Modal E: Video Link */}
      {videoModalOpen && activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <form
            onSubmit={handleSaveVideo}
            className="w-full max-w-sm bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xl"
          >
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center text-xs font-mono text-sky-450">
              <span>VÍDEO LINK PLAYBACK</span>
              <button type="button" onClick={() => setVideoModalOpen(false)} className="text-gray-400">Fechar</button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-505 mb-1">Título do Vídeo Filmado</label>
                <input
                  type="text"
                  required
                  value={activeVideo.title || ''}
                  onChange={(e) => setActiveVideo({ ...activeVideo, title: e.target.value })}
                  className="w-full bg-gray-50 border border-neutral-820 p-2 text-xs text-[#001856] rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-505 mb-1">Link Completo YouTube / Vimeo</label>
                <input
                  type="text"
                  required
                  value={activeVideo.youtubeUrl || ''}
                  onChange={(e) => setActiveVideo({ ...activeVideo, youtubeUrl: e.target.value })}
                  className="w-full bg-gray-50 border border-neutral-820 p-2 text-xs text-[#001856] rounded focus:outline-none font-mono"
                  placeholder="https://www.youtube.com/watch?..."
                />
              </div>
            </div>

            <div className="bg-gray-50 p-3 border-t border-gray-200 flex justify-end space-x-1.5">
              <button type="button" onClick={() => setVideoModalOpen(false)} className="text-xs text-gray-400 px-3 py-1 bg-white rounded">Cancelar</button>
              <button type="submit" className="text-xs text-white px-5 py-1 bg-[#001856] rounded">Anexar Playback</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
