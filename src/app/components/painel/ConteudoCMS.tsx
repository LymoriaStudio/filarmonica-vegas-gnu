import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderLock, Presentation, Calendar, Newspaper, Film, Plus, Trash2, Edit,
  Copy, Star, Eye, Globe, Sparkles, Image, Play, Check, Clock, CloudUpload, X,
  Search, LayoutGrid, List, SortAsc, Pencil, Music
} from 'lucide-react';
import { InstrumentEvent, NewsArticle, MusicCourse, GalleryPhoto, GalleryVideo, Professor, Instrument } from '../../validations/types';
import { RichTextEditor, ImageUploader, Toast, uploadFileToSupabase } from './MiniWidgets';
import { Drawer, DrawerSection, DrawerField, DrawerInput, DrawerTextarea, DrawerSelect } from './Drawer';
import { supabase } from '../../../lib/supabase';
import { dataCache } from '../../../lib/dataCache';
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

  // Events view controls
  const [eventsSearch, setEventsSearch] = useState('');
  const [eventsStatusFilter, setEventsStatusFilter] = useState<'todos' | 'published' | 'rascunho' | 'arquivado'>('todos');
  const [eventsSort, setEventsSort] = useState<'recent' | 'oldest' | 'az'>('recent');
  const [eventsViewMode, setEventsViewMode] = useState<'cards' | 'list'>('cards');

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
      const cached = dataCache.get<InstrumentEvent[]>('events');
      if (cached) {
        setEvents(cached);
        setEventsLoading(false);
        return;
      }

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

      const mapped = (data || []).map(mapEventFromDb);
      dataCache.set('events', mapped);
      setEvents(mapped);
      setEventsLoading(false);
    };

    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync cache when events state changes
  useEffect(() => {
    if (!eventsLoading) {
      dataCache.set('events', events);
    }
  }, [events, eventsLoading]);

  useEffect(() => {
    const cached = dataCache.get<MusicCourse[]>('courses');
    if (cached) { setCourses(cached); setCoursesLoading(false); return; }
    setCoursesLoading(true);
    getCourses()
      .then(data => { dataCache.set('courses', data); setCourses(data); })
      .catch((error) => console.error('Erro ao buscar cursos:', error))
      .finally(() => setCoursesLoading(false));
  }, []);

  useEffect(() => {
    if (!coursesLoading) dataCache.set('courses', courses);
  }, [courses, coursesLoading]);

  useEffect(() => {
    const cached = dataCache.get<Professor[]>('professors');
    if (cached) { setProfessorsList(cached); return; }
    getProfessors()
      .then(data => { dataCache.set('professors', data); setProfessorsList(data); })
      .catch((err) => console.error('Erro ao carregar professores:', err));
  }, []);

  // ==========================================
  // LOAD INSTRUMENTS FROM SUPABASE
  // ==========================================
  useEffect(() => {
    const cached = dataCache.get<Instrument[]>('instruments');
    if (cached) { setInstruments(cached); setInstrumentsLoading(false); return; }
    setInstrumentsLoading(true);
    getInstruments()
      .then(data => { dataCache.set('instruments', data); setInstruments(data); })
      .catch((err) => console.error('Erro ao carregar instrumentos:', err))
      .finally(() => setInstrumentsLoading(false));
  }, []);

  useEffect(() => {
    if (!instrumentsLoading) dataCache.set('instruments', instruments);
  }, [instruments, instrumentsLoading]);

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

  const filteredEvents = useMemo(() => {
    let list = [...events];
    if (eventsSearch.trim()) {
      const q = eventsSearch.toLowerCase();
      list = list.filter(e => e.title.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q));
    }
    if (eventsStatusFilter !== 'todos') {
      list = list.filter(e => e.status === eventsStatusFilter);
    }
    if (eventsSort === 'recent') list.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
    else if (eventsSort === 'oldest') list.sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
    else if (eventsSort === 'az') list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [events, eventsSearch, eventsStatusFilter, eventsSort]);


  return (
    <div className="space-y-6 p-6 animate-fade-in select-none">

      {/* ==========================================================
          SUBTAB 1: EVENTS LIST & DUPLICATION (CMS AGENDA)
          ========================================================== */}
      {subTab === 'eventos' && (
        <div className="space-y-4">
          {/* Header row */}
          <div className="flex justify-between items-center bg-white border border-gray-200 p-4 rounded-xl">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-amber-500 tracking-wider">Mural Orquestral de Apresentações</span>
              <p className="text-xs text-gray-400">Ative o destaque para estampar a abertura de vendas de ingressos na Home principal.</p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenEventModal(null)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#ffc300] hover:bg-yellow-400 text-[#001856] rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              + Adicionar Novo Evento
            </button>
          </div>

          {/* Toolbar: search + filters + view toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar evento por nome ou local..."
                value={eventsSearch}
                onChange={e => setEventsSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#ffc300] placeholder:text-gray-400"
              />
            </div>

            {/* Status filter select */}
            <select
              value={eventsStatusFilter}
              onChange={e => setEventsStatusFilter(e.target.value as typeof eventsStatusFilter)}
              className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#ffc300] cursor-pointer"
            >
              <option value="todos">Todos os status</option>
              <option value="published">Publicado</option>
              <option value="rascunho">Rascunho</option>
              <option value="arquivado">Arquivado</option>
            </select>

            {/* Sort select */}
            <div className="relative">
              <SortAsc size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={eventsSort}
                onChange={e => setEventsSort(e.target.value as typeof eventsSort)}
                className="pl-7 pr-7 py-1.5 text-[10px] font-mono border border-gray-200 rounded-lg bg-white focus:outline-none cursor-pointer appearance-none"
              >
                <option value="recent">Mais recentes</option>
                <option value="oldest">Mais antigos</option>
                <option value="az">Nome A→Z</option>
              </select>
            </div>

            {/* Card / List toggle */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setEventsViewMode('cards')}
                title="Visualização em cards"
                className={`p-2 cursor-pointer transition-colors ${eventsViewMode === 'cards' ? 'bg-[#001856] text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
              >
                <LayoutGrid size={13} />
              </button>
              <button
                type="button"
                onClick={() => setEventsViewMode('list')}
                title="Visualização em lista"
                className={`p-2 cursor-pointer transition-colors ${eventsViewMode === 'list' ? 'bg-[#001856] text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
              >
                <List size={13} />
              </button>
            </div>
          </div>

          {eventsLoading ? (
            <div className="text-center py-12 text-xs text-gray-400 font-mono">Carregando eventos...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400 font-mono border border-dashed border-gray-200 rounded-xl">
              {events.length === 0 ? 'Nenhum evento cadastrado ainda.' : 'Nenhum evento encontrado para este filtro.'}
            </div>
          ) : eventsViewMode === 'cards' ? (
            /* ── CARD VIEW ── */
            <div className="grid grid-cols-1 md:grid-cols-2 xxl:grid-cols-3 gap-5">
              {filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="rounded-2xl overflow-hidden bg-white border border-gray-100 flex flex-col hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  {/* Cover image */}
                  <div className="relative">
                    <img
                      src={evt.cover}
                      alt={evt.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-40 object-cover bg-gray-50"
                    />
                    {/* Category badge */}
                    <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-amber-400 text-[9px] font-bold uppercase px-2.5 py-1 rounded-full">
                      {evt.category}
                    </span>
                    {/* Ticket badge */}
                    {evt.isPaid && evt.ticket != null && (
                      <span className="absolute bottom-3 right-3 bg-emerald-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-full">
                        R$ {Number(evt.ticket).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                    {!evt.isPaid && (
                      <span className="absolute bottom-3 right-3 bg-sky-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-full">
                        Gratuito
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 flex-1 space-y-2.5">
                    {/* Status + date row */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        evt.status === 'published' ? 'bg-emerald-50 text-emerald-700' :
                        evt.status === 'rascunho' ? 'bg-gray-100 text-gray-500' :
                        'bg-rose-50 text-rose-600'
                      }`}>
                        {evt.status === 'published' ? 'Publicado' : evt.status === 'rascunho' ? 'Rascunho' : 'Arquivado'}
                      </span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock size={10} className="text-[#001856]" />
                        {evt.date}{evt.time ? ` • ${evt.time}` : ''}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-bold text-[#001856] leading-snug tracking-tight">{evt.title}</h4>

                    {/* Description */}
                    <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{evt.description}</p>

                    {/* Location */}
                    {evt.location && (
                      <p className="text-[10px] text-gray-400 truncate">📍 {evt.location}</p>
                    )}
                  </div>

                  {/* Footer: destaque toggle left, actions right */}
                  <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/60">
                    {/* Destaque na Home toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleFeatureEvent(evt.id, evt.title, !evt.featured)}
                      className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                        evt.featured
                          ? 'bg-[#ffc300]/15 text-[#a87d00]'
                          : 'bg-white border border-gray-200 text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      <Star size={11} className={evt.featured ? 'fill-[#ffc300] text-[#ffc300]' : ''} />
                      Destaque na Home
                    </button>

                    {/* Action icons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Duplicar"
                        onClick={() => handleDuplicateEvent(evt)}
                        className="p-2 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-[#001856] hover:border-gray-300 transition-colors cursor-pointer"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        type="button"
                        title="Editar"
                        onClick={() => handleOpenEventModal(evt)}
                        className="p-2 rounded-lg bg-white border border-gray-200 text-amber-500 hover:bg-amber-50 hover:border-amber-200 transition-colors cursor-pointer"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        title="Excluir"
                        onClick={() => handleDeleteEvent(evt.id, evt.title)}
                        className="p-2 rounded-lg bg-white border border-gray-200 text-rose-400 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ── LIST VIEW ── */
            <div className="space-y-2">
              {filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-3 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  {/* Thumb */}
                  <img
                    src={evt.cover}
                    alt={evt.title}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 object-cover rounded-lg shrink-0 bg-gray-50"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        evt.status === 'published' ? 'bg-emerald-50 text-emerald-700' :
                        evt.status === 'rascunho' ? 'bg-gray-100 text-gray-500' :
                        'bg-rose-50 text-rose-600'
                      }`}>
                        {evt.status === 'published' ? 'Publicado' : evt.status === 'rascunho' ? 'Rascunho' : 'Arquivado'}
                      </span>
                      <span className="text-[9px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{evt.category}</span>
                      {evt.featured && (
                        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Star size={9} className="fill-amber-500" /> Destaque
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-[#001856] truncate">{evt.title}</p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-3">
                      <span className="flex items-center gap-1"><Clock size={10} />{evt.date}{evt.time ? ` • ${evt.time}` : ''}</span>
                      {evt.location && <span className="truncate">📍 {evt.location}</span>}
                      {evt.isPaid && evt.ticket != null && (
                        <span className="text-emerald-600 font-bold">R$ {Number(evt.ticket).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      )}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatureEvent(evt.id, evt.title, !evt.featured)}
                      title="Destaque na Home"
                      className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                        evt.featured ? 'bg-amber-50 border-amber-200 text-amber-500' : 'bg-white border-gray-200 text-gray-300 hover:text-amber-400 hover:border-amber-200'
                      }`}
                    >
                      <Star size={13} className={evt.featured ? 'fill-amber-500' : ''} />
                    </button>
                    <button
                      type="button"
                      title="Duplicar"
                      onClick={() => handleDuplicateEvent(evt)}
                      className="p-2 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-[#001856] hover:border-gray-300 cursor-pointer transition-colors"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      type="button"
                      title="Editar"
                      onClick={() => handleOpenEventModal(evt)}
                      className="p-2 rounded-lg bg-white border border-gray-200 text-amber-500 hover:bg-amber-50 hover:border-amber-200 cursor-pointer transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      title="Excluir"
                      onClick={() => handleDeleteEvent(evt.id, evt.title)}
                      className="p-2 rounded-lg bg-white border border-gray-200 text-rose-400 hover:bg-rose-50 hover:border-rose-200 cursor-pointer transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
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
              className="flex items-center gap-1.5 px-4 py-2 bg-[#ffc300] hover:bg-yellow-400 text-[#001856] rounded-lg text-xs font-bold cursor-pointer transition-colors"
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
              className="flex items-center gap-1.5 px-4 py-2 bg-[#ffc300] hover:bg-yellow-400 text-[#001856] rounded-lg text-xs font-bold cursor-pointer transition-colors"
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
                className="flex items-center gap-1.5 px-4 py-2 bg-[#ffc300] hover:bg-yellow-400 text-[#001856] rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                + Registrar Nova Foto
              </button>
            )}
            {galleryMode === 'videos' && (
              <button
                type="button"
                onClick={() => handleOpenVideoModal(null)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#ffc300] hover:bg-yellow-400 text-[#001856] rounded-lg text-xs font-bold cursor-pointer transition-colors"
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

      {/* Drawer A: Event */}
      <Drawer
        open={eventModalOpen && !!activeEvent}
        onClose={() => setEventModalOpen(false)}
        title={activeEvent?.id ? 'Editar evento na agenda' : 'Novo evento na agenda'}
        description="Preencha as informações do evento abaixo."
        icon={Calendar}
        iconBg="bg-amber-50"
        iconColor="text-amber-500"
        onSubmit={handleSaveEvent}
        submitLabel={eventSaving ? 'Salvando...' : 'Salvar evento'}
        submitting={eventSaving}
      >
        {activeEvent && (<>
          <DrawerSection title="Informações Principais">
            <DrawerField label="Título do concerto / evento" required>
              <DrawerInput type="text" required value={activeEvent.title || ''} onChange={e => setActiveEvent({ ...activeEvent, title: e.target.value })} placeholder="Ex: Noite de Metais Clássicos – Schubert" />
            </DrawerField>
            <DrawerField label="Breve descrição para o card">
              <DrawerTextarea value={activeEvent.description || ''} onChange={e => setActiveEvent({ ...activeEvent, description: e.target.value })} rows={3} maxLength={200} placeholder="Resumo curto que será exibido no card do evento..." />
              <p className="text-[10px] text-gray-400 text-right mt-1">{(activeEvent.description || '').length}/200</p>
            </DrawerField>
            <div className="grid grid-cols-2 gap-3">
              <DrawerField label="Data de realização" required>
                <DrawerInput type="date" required value={activeEvent.date || ''} onChange={e => setActiveEvent({ ...activeEvent, date: e.target.value })} />
              </DrawerField>
              <DrawerField label="Horário de início" required>
                <DrawerInput type="time" required value={activeEvent.time || ''} onChange={e => setActiveEvent({ ...activeEvent, time: e.target.value })} />
              </DrawerField>
            </div>
          </DrawerSection>
          <DrawerSection title="Localização">
            <div className="grid grid-cols-2 gap-3">
              <DrawerField label="Local / Palco principal" required>
                <DrawerInput type="text" required value={activeEvent.location || ''} onChange={e => setActiveEvent({ ...activeEvent, location: e.target.value })} placeholder="Theatro Municipal..." />
              </DrawerField>
              <DrawerField label="Categoria de entrada" required>
                <DrawerInput type="text" required value={activeEvent.category || ''} onChange={e => setActiveEvent({ ...activeEvent, category: e.target.value })} placeholder="Concerto, Oficina..." />
              </DrawerField>
            </div>
            <DrawerField label="Endereço completo">
              <DrawerInput type="text" value={activeEvent.address || ''} onChange={e => setActiveEvent({ ...activeEvent, address: e.target.value })} placeholder="Rua, número, bairro, cidade, estado" />
            </DrawerField>
          </DrawerSection>
          <DrawerSection title="Links" optional>
            <div className="grid grid-cols-2 gap-3">
              <DrawerField label="Link Google Maps">
                <DrawerInput type="text" value={activeEvent.mapsUrl || ''} onChange={e => setActiveEvent({ ...activeEvent, mapsUrl: e.target.value })} placeholder="https://maps.google.com/..." className="font-mono text-xs" />
              </DrawerField>
              <DrawerField label="Link externo (ingresso)">
                <DrawerInput type="text" value={activeEvent.link || ''} onChange={e => setActiveEvent({ ...activeEvent, link: e.target.value })} placeholder="https://..." className="font-mono text-xs" />
              </DrawerField>
            </div>
          </DrawerSection>
          <DrawerSection title="Configurações">
            <div className="grid grid-cols-2 gap-3">
              <DrawerField label="É pago?" required>
                <DrawerSelect value={activeEvent.isPaid ? 'sim' : 'nao'} onChange={e => { const p = e.target.value === 'sim'; setActiveEvent(prev => prev ? { ...prev, isPaid: p, ticket: p ? prev.ticket : undefined } : prev); }}>
                  <option value="nao">Não (Entrada Gratuita)</option>
                  <option value="sim">Sim (Evento Pago)</option>
                </DrawerSelect>
              </DrawerField>
              {activeEvent.isPaid ? (
                <DrawerField label="Valor do ingresso (R$)" required>
                  <DrawerInput type="number" step="0.01" min="0" required value={activeEvent.ticket ?? ''} onChange={e => setActiveEvent({ ...activeEvent, ticket: e.target.value === '' ? undefined : Number(e.target.value) })} placeholder="35,00" />
                </DrawerField>
              ) : (
                <DrawerField label="Status publicação" required>
                  <DrawerSelect value={activeEvent.status || 'rascunho'} onChange={e => setActiveEvent({ ...activeEvent, status: e.target.value as any })}>
                    <option value="published">Liberado ao Público</option>
                    <option value="rascunho">Rascunho Interno</option>
                    <option value="arquivado">Arquivado</option>
                  </DrawerSelect>
                </DrawerField>
              )}
            </div>
            {activeEvent.isPaid && (
              <DrawerField label="Status publicação" required>
                <DrawerSelect value={activeEvent.status || 'rascunho'} onChange={e => setActiveEvent({ ...activeEvent, status: e.target.value as any })}>
                  <option value="published">Liberado ao Público</option>
                  <option value="rascunho">Rascunho Interno</option>
                  <option value="arquivado">Arquivado</option>
                </DrawerSelect>
              </DrawerField>
            )}
          </DrawerSection>
          <DrawerSection title="Imagem de Capa">
            {activeEvent.cover && (
              <div className="relative rounded-xl overflow-hidden border border-gray-200">
                <img src={activeEvent.cover} alt="Capa" referrerPolicy="no-referrer" className="w-full h-36 object-cover" />
                <button type="button" onClick={() => setActiveEvent(prev => prev ? { ...prev, cover: undefined } : prev)} className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white cursor-pointer"><X size={12} /></button>
              </div>
            )}
            <ImageUploader allowedTypes="Imagens (.jpg, .png, .webp)" onFileSelected={(file, previewUrl) => { setPendingEventCoverFile(file); setActiveEvent(prev => prev ? { ...prev, cover: previewUrl } : prev); }} />
            <p className="text-[10px] text-gray-400">Formatos: JPG, PNG, WEBP &bull; Máx. 10MB &bull; Recomendado: 16:9</p>
          </DrawerSection>
        </>)}
      </Drawer>

      {/* Drawer B: News */}
      <Drawer
        open={newsModalOpen && !!activeNews}
        onClose={() => setNewsModalOpen(false)}
        title={activeNews?.id ? 'Editar comunicado' : 'Novo comunicado à imprensa'}
        description="Redija e publique a matéria no site institucional."
        icon={Newspaper}
        iconBg="bg-sky-50"
        iconColor="text-sky-500"
        onSubmit={handleSaveNews}
        submitLabel="Publicar Postagem"
        width="w-[680px]"
      >
        {activeNews && (<>
          <DrawerSection title="Identificação">
            <div className="grid grid-cols-2 gap-3">
              <DrawerField label="Título da matéria" required>
                <DrawerInput type="text" required value={activeNews.title || ''} onChange={e => setActiveNews({ ...activeNews, title: e.target.value })} />
              </DrawerField>
              <DrawerField label="Categoria">
                <DrawerInput type="text" value={activeNews.category || ''} onChange={e => setActiveNews({ ...activeNews, category: e.target.value })} />
              </DrawerField>
            </div>
            <DrawerField label="Resumo / sinopse">
              <DrawerInput type="text" value={activeNews.summary || ''} onChange={e => setActiveNews({ ...activeNews, summary: e.target.value })} placeholder="Instigue o leitor a clicar no post..." />
            </DrawerField>
          </DrawerSection>
          <DrawerSection title="Conteúdo">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <label className="block text-[10px] font-mono uppercase text-gray-400 mb-2 font-bold flex items-center">
                <Sparkles size={11} className="mr-1.5 text-[#ffc300]" /> Editor de texto avançado
              </label>
              <RichTextEditor value={activeNews.content || ''} onChange={val => setActiveNews({ ...activeNews, content: val })} />
            </div>
          </DrawerSection>
          <DrawerSection title="Autor e Imagem">
            <div className="grid grid-cols-2 gap-3">
              <DrawerField label="Autor / Redator">
                <DrawerInput type="text" value={activeNews.author || ''} onChange={e => setActiveNews({ ...activeNews, author: e.target.value })} />
              </DrawerField>
              <DrawerField label="Imagem de capa">
                <ImageUploader onFileSelected={(file, previewUrl) => setActiveNews({ ...activeNews, coverImage: previewUrl })} />
              </DrawerField>
            </div>
          </DrawerSection>
        </>)}
      </Drawer>

      {/* Drawer C: Course */}
      <Drawer
        open={courseModalOpen && !!activeCourse}
        onClose={() => setCourseModalOpen(false)}
        title={activeCourse?.id ? 'Editar oficina / classe' : 'Nova oficina / classe'}
        description="Preencha a ementa curricular da oficina."
        icon={Music}
        iconBg="bg-violet-50"
        iconColor="text-violet-500"
        onSubmit={handleSaveCourse}
        submitLabel={courseSaving ? 'Salvando...' : 'Confirmar Ementa'}
        submitting={courseSaving}
      >
        {activeCourse && (<>
          <DrawerSection title="Identificação">
            <DrawerField label="Nome da oficina / instrumento" required>
              <DrawerInput type="text" required value={activeCourse.name || ''} onChange={e => setActiveCourse({ ...activeCourse, name: e.target.value })} placeholder="Ex: Masterclass de Trompa Sinfônica" />
            </DrawerField>
            <DrawerField label="Descrição">
              <DrawerTextarea value={activeCourse.description || ''} onChange={e => setActiveCourse({ ...activeCourse, description: e.target.value })} rows={3} />
            </DrawerField>
          </DrawerSection>
          <DrawerSection title="Detalhes">
            <div className="grid grid-cols-2 gap-3">
              <DrawerField label="Professor titular">
                <DrawerSelect value={activeCourse.professorId || ''} onChange={e => { const id = e.target.value; const p = professorsList.find(p => p.id === id); setActiveCourse({ ...activeCourse, professorId: id, responsibleProfessor: p?.name || '' }); }}>
                  <option value="">Selecione...</option>
                  {professorsList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </DrawerSelect>
              </DrawerField>
              <DrawerField label="Carga horária">
                <DrawerInput type="text" value={activeCourse.duration || ''} onChange={e => setActiveCourse({ ...activeCourse, duration: e.target.value })} placeholder="Ex: 2h/semana" />
              </DrawerField>
            </div>
            <DrawerField label="Quantidade de vagas">
              <DrawerInput type="number" value={activeCourse.vagas || 1} onChange={e => setActiveCourse({ ...activeCourse, vagas: Number(e.target.value) })} />
            </DrawerField>
          </DrawerSection>
          <DrawerSection title="Foto da Oficina">
            <ImageUploader bg={activeCourse.photo} allowedTypes="Imagens (.jpg, .png, .webp)" onFileSelected={(file, previewUrl) => { setPendingCoursePhotoFile(file); setActiveCourse(prev => prev ? { ...prev, photo: previewUrl } : prev); }} />
          </DrawerSection>
        </>)}
      </Drawer>

      {/* Drawer D: Instrument */}
      <Drawer
        open={instrumentModalOpen && !!activeInstrument}
        onClose={() => setInstrumentModalOpen(false)}
        title={activeInstrument?.id ? 'Editar instrumento' : 'Novo instrumento'}
        description="Cadastre o instrumento no catálogo da orquestra."
        icon={Music}
        iconBg="bg-amber-50"
        iconColor="text-amber-500"
        onSubmit={handleSaveInstrument}
        submitLabel={instrumentSaving ? 'Salvando...' : 'Confirmar Instrumento'}
        submitting={instrumentSaving}
      >
        {activeInstrument && (<>
          <DrawerSection title="Identificação">
            <div className="grid grid-cols-2 gap-3">
              <DrawerField label="Nome do instrumento" required>
                <DrawerInput type="text" required value={activeInstrument.name || ''} onChange={e => setActiveInstrument({ ...activeInstrument, name: e.target.value })} placeholder="Ex: Trompete" />
              </DrawerField>
              <DrawerField label="Slug">
                <DrawerInput type="text" value={activeInstrument.slug || ''} onChange={e => setActiveInstrument({ ...activeInstrument, slug: e.target.value })} placeholder="trompete" className="font-mono text-xs" />
              </DrawerField>
            </div>
            <DrawerField label="Descrição curta" required>
              <DrawerTextarea required value={activeInstrument.description || ''} onChange={e => setActiveInstrument({ ...activeInstrument, description: e.target.value })} rows={2} placeholder="Resumo para o card de listagem..." />
            </DrawerField>
            <DrawerField label="Descrição completa" required>
              <DrawerTextarea required value={activeInstrument.longDescription || ''} onChange={e => setActiveInstrument({ ...activeInstrument, longDescription: e.target.value })} rows={4} placeholder="Texto completo para a página do instrumento..." />
            </DrawerField>
          </DrawerSection>
          <DrawerSection title="Mídia e Destaque">
            <div className="grid grid-cols-2 gap-3">
              <DrawerField label="Link de vídeo (YouTube/Vimeo)">
                <DrawerInput type="text" value={activeInstrument.videoUrl || ''} onChange={e => setActiveInstrument({ ...activeInstrument, videoUrl: e.target.value })} placeholder="https://youtube.com/..." className="font-mono text-xs" />
              </DrawerField>
              <DrawerField label="Cor de destaque">
                <input type="color" value={activeInstrument.color || '#0B4DA2'} onChange={e => setActiveInstrument({ ...activeInstrument, color: e.target.value })} className="w-full h-10 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer" />
              </DrawerField>
            </div>
            <DrawerField label="Imagem principal">
              {activeInstrument.image && <img src={activeInstrument.image} alt="Preview" referrerPolicy="no-referrer" className="w-full h-28 object-cover rounded-lg border border-gray-200 mb-2" />}
              <ImageUploader allowedTypes="Imagens (.jpg, .png, .webp)" onFileSelected={(file, previewUrl) => { setPendingInstrumentImageFile(file); setActiveInstrument(prev => prev ? { ...prev, image: previewUrl } : prev); }} />
            </DrawerField>
          </DrawerSection>
          <DrawerSection title="Galeria de Fotos">
            {activeInstrument.gallery && activeInstrument.gallery.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-3">
                {activeInstrument.gallery.map(url => (
                  <div key={url} className="relative group">
                    <img src={url} alt="Galeria" referrerPolicy="no-referrer" className="w-full h-16 object-cover rounded border border-gray-200" />
                    <button type="button" onClick={() => handleRemoveGalleryImage(url)} className="absolute top-0.5 right-0.5 bg-rose-950 text-rose-400 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all"><X size={10} /></button>
                  </div>
                ))}
              </div>
            )}
            <ImageUploader allowedTypes="Imagens (.jpg, .png, .webp)" onFileSelected={file => setPendingGalleryFile(file)} />
            {pendingGalleryFile && <p className="text-[9px] text-emerald-500 font-mono mt-1">Pronta para envio: {pendingGalleryFile.name}</p>}
          </DrawerSection>
        </>)}
      </Drawer>

      {/* Drawer E: Photo */}
      <Drawer
        open={photoModalOpen && !!activePhoto}
        onClose={() => setPhotoModalOpen(false)}
        title="Registrar foto no álbum"
        description="Adicione uma foto à galeria de mídia."
        icon={Image}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-500"
        onSubmit={handleSavePhoto}
        submitLabel="Gravar Imagem"
        width="w-[480px]"
      >
        {activePhoto && (<>
          <DrawerSection title="Detalhes">
            <DrawerField label="Álbum de origem" required>
              <DrawerSelect value={activePhoto.album || ''} onChange={e => setActivePhoto({ ...activePhoto, album: e.target.value })}>
                <option value="Concertos 2026">Concertos Metálicos 2026</option>
                <option value="Ensaios Gerais">Ensaios e Bastidores</option>
                <option value="Formatura Solene">Formatura Alunos Solene Nova</option>
              </DrawerSelect>
            </DrawerField>
            <DrawerField label="Legenda explicativa" required>
              <DrawerInput type="text" required value={activePhoto.caption || ''} onChange={e => setActivePhoto({ ...activePhoto, caption: e.target.value })} />
            </DrawerField>
          </DrawerSection>
          <DrawerSection title="Arquivo">
            <ImageUploader onFileSelected={(file, previewUrl) => setActivePhoto({ ...activePhoto, url: previewUrl })} />
          </DrawerSection>
        </>)}
      </Drawer>

      {/* Drawer F: Video */}
      <Drawer
        open={videoModalOpen && !!activeVideo}
        onClose={() => setVideoModalOpen(false)}
        title="Adicionar vídeo"
        description="Anexe um link de vídeo do YouTube ou Vimeo."
        icon={Film}
        iconBg="bg-rose-50"
        iconColor="text-rose-500"
        onSubmit={handleSaveVideo}
        submitLabel="Anexar Playback"
        width="w-[480px]"
      >
        {activeVideo && (<>
          <DrawerSection title="Identificação">
            <DrawerField label="Título do vídeo" required>
              <DrawerInput type="text" required value={activeVideo.title || ''} onChange={e => setActiveVideo({ ...activeVideo, title: e.target.value })} />
            </DrawerField>
            <DrawerField label="Link YouTube / Vimeo" required>
              <DrawerInput type="text" required value={activeVideo.youtubeUrl || ''} onChange={e => setActiveVideo({ ...activeVideo, youtubeUrl: e.target.value })} placeholder="https://www.youtube.com/watch?..." className="font-mono text-xs" />
            </DrawerField>
          </DrawerSection>
        </>)}
      </Drawer>
    </div>
  );
}
