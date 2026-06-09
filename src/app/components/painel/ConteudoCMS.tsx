
import React, { useState } from 'react';
import { 
  FolderLock, Presentation, Calendar, Newspaper, Film, Plus, Trash2, Edit, 
  Copy, Star, Eye, Globe, Sparkles, Image, Play, Check, Clock, CloudUpload, X
} from 'lucide-react';
import { InstrumentEvent, NewsArticle, MusicCourse, GalleryPhoto, GalleryVideo, Professor } from '../../validations/types';
import { RichTextEditor, ImageUploader, Toast } from './MiniWidgets';

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
}

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
  addAuditLog
}: ConteudoCMSProps) {
  const [subTab, setSubTab] = useState<'eventos' | 'noticias' | 'cursos' | 'galeria'>('eventos');

  // Multi-Mode Gallery Tab status
  const [galleryMode, setGalleryMode] = useState<'fotos' | 'videos'>('fotos');

  // Modals state
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState<Partial<InstrumentEvent> | null>(null);

  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [activeNews, setActiveNews] = useState<Partial<NewsArticle> | null>(null);

  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [activeCourse, setActiveCourse] = useState<Partial<MusicCourse> | null>(null);

  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState<Partial<GalleryPhoto> | null>(null);

  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<Partial<GalleryVideo> | null>(null);


  // ==========================================
  // EVENTS CORE (CRUD, DUPLICATE, FEATURED)
  // ==========================================
  const handleOpenEventModal = (item: Partial<InstrumentEvent> | null) => {
    setActiveEvent(item || {
      id: '',
      cover: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=600&h=300&q=80',
      title: '',
      description: '',
      date: '2026-06-15',
      time: '20:00',
      location: 'Theatro Municipal',
      address: 'Pça Ramos de Azevedo, Centro',
      mapsUrl: 'https://maps.google.com',
      category: 'Concerto Especial',
      status: 'published',
      featured: false
    });
    setEventModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent) return;

    if (activeEvent.id) {
      setEvents(prev => prev.map(ev => ev.id === activeEvent.id ? (activeEvent as InstrumentEvent) : ev));
      addAuditLog('Alterou Evento', 'Conteúdo', `Atualizou cronograma: ${activeEvent.title}`);
    } else {
      const newEv = { ...activeEvent, id: `evt-${Date.now()}` } as InstrumentEvent;
      setEvents(prev => [newEv, ...prev]);
      addAuditLog('Criou Evento', 'Conteúdo', `Criou novo evento na agenda: ${newEv.title}`);
    }
    setEventModalOpen(false);
  };

  const handleDuplicateEvent = (evt: InstrumentEvent) => {
    const duplicated: InstrumentEvent = {
      ...evt,
      id: `evt-dup-${Date.now()}`,
      title: `${evt.title} (Cópia)`,
      featured: false,
      status: 'draft'
    };
    setEvents(prev => [duplicated, ...prev]);
    addAuditLog('Duplicou Evento', 'Conteúdo', `Duplicou programação: ${evt.title}`);
    alert('Programação duplicada com sucesso! Ajuste a nova data no rascunho.');
  };

  const handleDeleteEvent = (id: string, title: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    addAuditLog('Deletou Evento', 'Conteúdo', `Removeu evento da agenda ID: ${id} (${title})`);
  };

  const handleToggleFeatureEvent = (id: string, title: string, active: boolean) => {
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
    setActiveCourse(course || {
      id: '',
      photo: 'https://images.unsplash.com/photo-1573152958734-1922c188fba3?auto=format&fit=crop&w=400&h=250&q=80',
      name: '',
      description: '',
      ageLimit: 'Livre',
      duration: '4 meses',
      vagas: 20,
      responsibleProfessor: professors[0]?.name || 'Maestro Principal'
    });
    setCourseModalOpen(true);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourse) return;

    if (activeCourse.id) {
      setCourses(prev => prev.map(c => c.id === activeCourse.id ? (activeCourse as MusicCourse) : c));
      addAuditLog('Alterou Curso', 'Conteúdo', `Atualizou ementa do curso: ${activeCourse.name}`);
    } else {
      const newCr = { ...activeCourse, id: `crs-${Date.now()}` } as MusicCourse;
      setCourses(prev => [...prev, newCr]);
      addAuditLog('Lançou Curso', 'Conteúdo', `Lançou nova classe/oficina regular: ${newCr.name}`);
    }
    setCourseModalOpen(false);
  };

  const handleDeleteCourse = (id: string, name: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    addAuditLog('Excluiu Oficina', 'Conteúdo', `Removeu ementa do curso ID: ${id} (${name})`);
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
      <div className="pb-4 border-b border-neutral-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-neutral-100 tracking-tight flex items-center">
            <Presentation className="mr-2 text-sky-450" size={20} />
            Editor Geral de Conteúdos & Mídia (CMS)
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Controle concertos ao vivo na agenda, edite comunicados à imprensa com editor gráfico e altere cursos de capacitação técnica.
          </p>
        </div>

        {/* Tab switcher options */}
        <div className="flex bg-neutral-900 border border-neutral-800 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setSubTab('eventos')}
            className={`p-1.5 px-3 rounded-md font-semibold cursor-pointer transition-all ${subTab === 'eventos' ? 'bg-[#0B4DA2] text-white shadow' : 'text-neutral-400'}`}
          >
            Agenda de Eventos
          </button>
         
          <button
            type="button"
            onClick={() => setSubTab('cursos')}
            className={`p-1.5 px-3 rounded-md font-semibold cursor-pointer transition-all ${subTab === 'cursos' ? 'bg-[#0B4DA2] text-white shadow' : 'text-neutral-400'}`}
          >
            Oficinas Acadêmicas
          </button>
          <button
            type="button"
            onClick={() => setSubTab('galeria')}
            className={`p-1.5 px-3 rounded-md font-semibold cursor-pointer transition-all ${subTab === 'galeria' ? 'bg-[#0B4DA2] text-white shadow' : 'text-neutral-400'}`}
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
          <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-amber-500 tracking-wider">Mural Orquestral de Apresentações</span>
              <p className="text-xs text-neutral-400">Ative o destaque para estampar a abertura de vendas de ingressos na Home principal.</p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenEventModal(null)}
              className="p-2 px-3 bg-[#0B4DA2] hover:bg-blue-750 text-white rounded text-xs font-semibold cursor-pointer"
            >
              + Adicionar Novo Evento
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xxl:grid-cols-3 gap-6">
            {events.map((evt) => (
              <div 
                key={evt.id} 
                className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-850 flex flex-col justify-between hover:border-neutral-700 transition"
              >
                <div className="relative">
                  <img 
                    src={evt.cover} 
                    alt={evt.title} 
                    referrerPolicy="no-referrer"
                    className="w-full h-36 object-cover" 
                  />
                  {/* Category badging */}
                  <span className="absolute top-2 left-2 bg-black/75 backdrop-blur-sm text-amber-500 text-[9px] font-mono font-bold uppercase p-1 px-2.5 rounded-full border border-neutral-800">
                    {evt.category}
                  </span>
                  
                  {/* Featured badge */}
                  {evt.featured && (
                    <span className="absolute top-2 right-2 bg-[#F2C94C]/95 text-black text-[9px] font-extrabold uppercase p-1 px-2.5 rounded-full flex items-center">
                      <Star size={10} className="mr-1 fill-black" /> Destaque
                    </span>
                  )}
                </div>

                <div className="p-4 flex-1 space-y-2">
                  <span className="text-[9.5px] font-mono text-neutral-550 flex items-center">
                    <Clock size={11} className="mr-1 inline text-[#0B4DA2]" />
                    {evt.date} • {evt.time}
                  </span>
                  <h4 className="text-xs font-bold text-neutral-100 font-sans tracking-tight leading-snug">{evt.title}</h4>
                  <p className="text-[11px] text-neutral-400 line-clamp-3">{evt.description}</p>
                </div>

                {/* Additional event lines */}
                <div className="p-3.5 bg-neutral-950 font-mono text-[9.5px] text-neutral-500 border-t border-neutral-900 flex justify-between select-none">
                  <span className="truncate max-w-56">Local: {evt.location}</span>
                  <span className={`p-0.5 px-2 rounded text-[8px] uppercase font-bold tracking-widest ${
                    evt.status === 'published' ? 'bg-emerald-950 text-emerald-400' :
                    evt.status === 'draft' ? 'bg-neutral-800 text-neutral-400' :
                    'bg-rose-955 text-rose-500'
                  }`}>
                    {evt.status === 'published' ? 'Publicado' : evt.status === 'draft' ? 'Rascunho' : 'Cancelado'}
                  </span>
                </div>

                {/* Event Actions Footer */}
                <div className="p-2.5 bg-neutral-955 border-t border-neutral-900 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatureEvent(evt.id, evt.title, !evt.featured)}
                      className={`text-[9px] font-mono font-bold p-1 px-2 rounded cursor-pointer transition-all ${
                        evt.featured ? 'bg-[#F2C94C]/10 text-[#F2C94C]' : 'bg-neutral-900 text-neutral-500'
                      }`}
                    >
                      Destaque {evt.featured ? 'Sim' : 'Não'}
                    </button>
                    <button
                      type="button"
                      title="Duplicar Evento"
                      onClick={() => handleDuplicateEvent(evt)}
                      className="p-1.5 bg-neutral-900 hover:bg-neutral-850 rounded text-neutral-400 hover:text-white"
                    >
                      <Copy size={11} />
                    </button>
                  </div>

                  <div className="flex space-x-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEventModal(evt)}
                      className="p-1 bg-neutral-900 text-amber-500 rounded cursor-pointer px-2 text-[10.5px] font-mono font-bold"
                    >
                      EDITAR
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(evt.id, evt.title)}
                      className="p-1 bg-neutral-900 text-rose-500 rounded cursor-pointer px-2 text-[10.5px] font-mono font-bold"
                    >
                      EXCLUIR
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

  

      {/* ==========================================================
          SUBTAB 3: MUSIC COURSES EDUCATION (CMS ACADEMY)
          ========================================================== */}
      {subTab === 'cursos' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-sky-450 tracking-widest">Matriz Curricular de Sobrecarga e Sopros</span>
              <p className="text-xs text-neutral-400">Atribua os maestros das oficinas e gerencie o número total de vagas regulares.</p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenCourseModal(null)}
              className="p-2 px-3 bg-[#0B4DA2] text-white text-xs font-semibold rounded cursor-pointer"
            >
              + Lançar Nova Classe / Oficina
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((crs) => (
              <div key={crs.id} className="p-4 rounded-xl bg-neutral-900 border border-neutral-850 flex gap-4 justify-between items-start">
                <div className="flex gap-4">
                  <img 
                    src={crs.photo} 
                    alt={crs.name} 
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 object-cover rounded-lg border border-neutral-800 shrink-0" 
                  />
                  <div>
                    <h4 className="text-xs font-bold text-neutral-100 font-sans tracking-tight">{crs.name}</h4>
                    <span className="block text-[10px] text-amber-500 font-mono mt-0.5">Professor Responsável: {crs.responsibleProfessor}</span>
                    <p className="text-[11px] text-neutral-400 mt-1.5 leading-normal line-clamp-2">"{crs.description}"</p>
                    
                    <div className="flex flex-wrap gap-2.5 text-[9px] font-mono text-neutral-500 mt-3 uppercase tracking-wider">
                      <span className="p-0.5 px-2 bg-neutral-950 rounded">Vagas: {crs.vagas}</span>
                      <span className="p-0.5 px-2 bg-neutral-950 rounded">Tempo: {crs.duration}</span>
                      <span className="p-0.5 px-2 bg-neutral-950 rounded">Faixa: {crs.ageLimit}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 self-center">
                  <button
                    type="button"
                    onClick={() => handleOpenCourseModal(crs)}
                    className="p-1 px-2.5 bg-neutral-850 hover:bg-neutral-8D0 text-amber-550 border border-neutral-800 rounded font-mono text-[9px] cursor-pointer"
                  >
                    EDITAR
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCourse(crs.id, crs.name)}
                    className="p-1 px-2.5 bg-neutral-850 hover:bg-rose-955 text-rose-500 border border-neutral-800 rounded font-mono text-[9px] cursor-pointer"
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
          
          <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex-wrap gap-2.5">
            <div className="flex space-x-1.5 bg-neutral-950 p-0.5 rounded border border-neutral-800 text-xs">
              <button
                type="button"
                onClick={() => setGalleryMode('fotos')}
                className={`p-1 px-3 rounded font-mono font-bold cursor-pointer text-[10px] ${galleryMode === 'fotos' ? 'bg-[#0B4DA2] text-white' : 'text-neutral-500'}`}
              >
                ÁLBUNS DE FOTOS
              </button>
              <button
                type="button"
                onClick={() => setGalleryMode('videos')}
                className={`p-1 px-3 rounded font-mono font-bold cursor-pointer text-[10px] ${galleryMode === 'videos' ? 'bg-[#0B4DA2] text-white' : 'text-neutral-500'}`}
              >
                CANAL DE VÍDEOS (YOUTUBE)
              </button>
            </div>

            {galleryMode === 'fotos' ? (
              <button
                type="button"
                onClick={() => handleOpenPhotoModal(null)}
                className="p-1.5 px-3 bg-[#0B4DA2] hover:bg-blue-750 text-white text-xs font-mono font-bold rounded"
              >
                + Registrar Nova Foto
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenVideoModal(null)}
                className="p-1.5 px-3 bg-[#0B4DA2] hover:bg-blue-750 text-white text-xs font-mono font-bold rounded"
              >
                + Anexar Link de Vídeo Vimeo/YouTube
              </button>
            )}
          </div>

          {/* Render Mode A: Photos collection */}
          {galleryMode === 'fotos' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photos.map((pt) => (
                <div key={pt.id} className="relative rounded-lg overflow-hidden border border-neutral-850 bg-neutral-900 group">
                  <img 
                    src={pt.url} 
                    alt={pt.caption} 
                    referrerPolicy="no-referrer"
                    className="w-full h-32 object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/85 opacity-0 group-hover:opacity-100 transition-all p-3 flex flex-col justify-between text-[11px] text-neutral-200 leading-tight">
                    <div>
                      <span className="text-[8px] font-mono text-amber-500 uppercase block mb-1">Álbum: {pt.album}</span>
                      <p>"{pt.caption}"</p>
                    </div>

                    <div className="flex justify-end space-x-1">
                      <button 
                        onClick={() => handleOpenPhotoModal(pt)}
                        className="p-1 bg-neutral-800 text-amber-400 rounded hover:bg-neutral-750 cursor-pointer"
                      >
                        <Edit size={10} />
                      </button>
                      <button 
                        onClick={() => handleDeletePhoto(pt.id)}
                        className="p-1 bg-neutral-800 text-rose-500 rounded hover:bg-rose-950 cursor-pointer"
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
                <div key={vid.id} className="p-3 rounded-lg overflow-hidden border border-neutral-850 bg-neutral-900 text-xs flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="relative rounded overflow-hidden aspect-video bg-neutral-950 flex items-center justify-center">
                      <Film className="text-neutral-700" size={32} />
                      <span className="absolute bottom-1 right-1 bg-amber-500 text-black text-[8px] font-bold p-0.5 px-1.5 rounded uppercase font-mono">LINK EXTERNO</span>
                    </div>
                    <h4 className="font-bold text-neutral-100 font-sans tracking-tight truncate">{vid.title}</h4>
                    <p className="text-[10px] font-mono text-[#0B4DA2] truncate">{vid.youtubeUrl || vid.vimeoUrl}</p>
                  </div>
                  
                  <div className="mt-4 pt-2 border-t border-neutral-850 flex justify-end space-x-1">
                    <button
                      type="button"
                      onClick={() => handleOpenVideoModal(vid)}
                      className="p-1 px-3 bg-neutral-800 hover:bg-neutral-750 rounded text-amber-500 hover:text-amber-250 transition-all font-mono"
                    >
                      EDITAR
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteVideo(vid.id, vid.title)}
                      className="p-1 px-2.5 bg-neutral-800 hover:bg-rose-955 rounded text-rose-400 hover:text-rose-225 transition-all"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
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
            className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl space-y-4"
          >
            <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-amber-500 uppercase tracking-widest">Ajuste da Programação da Agenda</span>
              <button type="button" onClick={() => setEventModalOpen(false)} className="text-neutral-400">Fechar</button>
            </div>

            <div className="p-4 space-y-3.5 max-h-[440px] overflow-y-auto">
              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Título do Concerto / Evento</label>
                <input 
                  type="text" 
                  required
                  value={activeEvent.title || ''}
                  onChange={(e) => setActiveEvent({ ...activeEvent, title: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded focus:outline-none"
                  placeholder="Ex: Noite de Metais Clássicos - Schubert"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Breve Descrição para o Card</label>
                <textarea 
                  value={activeEvent.description || ''}
                  onChange={(e) => setActiveEvent({ ...activeEvent, description: e.target.value })}
                  rows={2}
                  className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Data de Realização</label>
                  <input 
                    type="date" 
                    required
                    value={activeEvent.date || ''}
                    onChange={(e) => setActiveEvent({ ...activeEvent, date: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-505 mb-1">Horário de Início</label>
                  <input 
                    type="text" 
                    required
                    value={activeEvent.time || ''}
                    onChange={(e) => setActiveEvent({ ...activeEvent, time: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded font-mono"
                    placeholder="Ex: 19:30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Local / Palco Principal</label>
                  <input 
                    type="text" 
                    value={activeEvent.location || ''}
                    onChange={(e) => setActiveEvent({ ...activeEvent, location: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded"
                    placeholder="Ex: Auditório Externo do Conservatório"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Categoria de Entrada</label>
                  <input 
                    type="text" 
                    value={activeEvent.category || ''}
                    onChange={(e) => setActiveEvent({ ...activeEvent, category: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Status Publicação</label>
                  <select
                    value={activeEvent.status || 'published'}
                    onChange={(e) => setActiveEvent({ ...activeEvent, status: e.target.value as any })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-400 p-2 text-xs rounded"
                  >
                    <option value="published">Liberado ao Público (Ativo)</option>
                    <option value="draft">Rascunho Interno</option>
                    <option value="cancelled">Cancelado / Adiado</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-2">Upload Imagem de Capagem</label>
                  <ImageUploader 
                    onUploadSuccess={(url) => setActiveEvent({ ...activeEvent, cover: url })} 
                  />
                </div>
              </div>

            </div>

            <div className="bg-neutral-950 p-3 border-t border-neutral-800 flex justify-end space-x-2">
              <button type="button" onClick={() => setEventModalOpen(false)} className="text-xs text-neutral-400 px-3 py-1 bg-neutral-900 rounded">Cancelar</button>
              <button type="submit" className="text-xs text-white px-5 py-1 bg-[#0B4DA2] rounded">Aportar na Agenda</button>
            </div>
          </form>
        </div>
      )}


      {/* Modal B: News article form (Advanced Text Editor inside) */}
      {newsModalOpen && activeNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fade-in">
          <form 
            onSubmit={handleSaveNews}
            className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl space-y-4"
          >
            <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-amber-500 uppercase tracking-widest">Editor de Comunicado à Imprensa (CMS)</span>
              <button type="button" onClick={() => setNewsModalOpen(false)} className="text-neutral-400">Fechar</button>
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
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-505 mb-1">Pariado com Categoria</label>
                  <input 
                    type="text" 
                    value={activeNews.category || ''}
                    onChange={(e) => setActiveNews({ ...activeNews, category: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-105 p-2 text-xs rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Resumo Sinopse de Listagem</label>
                <input 
                  type="text" 
                  value={activeNews.summary || ''}
                  onChange={(e) => setActiveNews({ ...activeNews, summary: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded focus:outline-none"
                  placeholder="Instigue o leitor a clicar no post..."
                />
              </div>

              {/* Advanced WYSIWYG integration layout */}
              <div className="bg-neutral-955 p-3 rounded-lg border border-neutral-850">
                <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-2 font-bold flex items-center">
                  <Sparkles size={11} className="mr-1.5 text-amber-400" /> Editor de texto avançado estilo WordPress
                </label>
                <RichTextEditor 
                  value={activeNews.content || ''} 
                  onChange={(val) => setActiveNews({ ...activeNews, content: val })} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1 font-bold">Autor / Redator</label>
                  <input 
                    type="text" 
                    value={activeNews.author || ''}
                    onChange={(e) => setActiveNews({ ...activeNews, author: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-2">Upload Imagem de Capagem</label>
                  <ImageUploader 
                    onUploadSuccess={(url) => setActiveNews({ ...activeNews, coverImage: url })} 
                  />
                </div>
              </div>

            </div>

            <div className="bg-neutral-950 p-3 border-t border-neutral-800 flex justify-end space-x-2">
              <button type="button" onClick={() => setNewsModalOpen(false)} className="text-xs text-neutral-400 px-3 py-1 bg-neutral-900 rounded">Cancelar</button>
              <button type="submit" className="text-xs text-white px-5 py-1 bg-[#0B4DA2] rounded">Publicar Postagem</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal C: Music course form */}
      {courseModalOpen && activeCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <form 
            onSubmit={handleSaveCourse}
            className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl space-y-4"
          >
            <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-amber-500 uppercase tracking-widest font-sans">Ementa Curricular</span>
              <button type="button" onClick={() => setCourseModalOpen(false)} className="text-neutral-400 font-sans cursor-pointer">Fechar</button>
            </div>

            <div className="p-4 space-y-3.5">
              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Nome Oficina / Instrumento</label>
                <input 
                  type="text" 
                  required
                  value={activeCourse.name || ''}
                  onChange={(e) => setActiveCourse({ ...activeCourse, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded focus:outline-none"
                  placeholder="Ex: Masterclass de Trompa Sinfônica"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Descrição</label>
                <textarea 
                  value={activeCourse.description || ''}
                  onChange={(e) => setActiveCourse({ ...activeCourse, description: e.target.value })}
                  rows={2}
                  className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Professor Titular</label>
                  <select
                    value={activeCourse.responsibleProfessor || ''}
                    onChange={(e) => setActiveCourse({ ...activeCourse, responsibleProfessor: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-400 p-2 text-xs rounded"
                  >
                    <option value="">Selecione...</option>
                    {professors.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Tempo de Carga Horária</label>
                  <input 
                    type="text" 
                    value={activeCourse.duration || ''}
                    onChange={(e) => setActiveCourse({ ...activeCourse, duration: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Quantidade de Vagas</label>
                  <input 
                    type="number" 
                    value={activeCourse.vagas || 1}
                    onChange={(e) => setActiveCourse({ ...activeCourse, vagas: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded font-mono"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <ImageUploader 
                    onUploadSuccess={(url) => setActiveCourse({ ...activeCourse, photo: url })} 
                  />
                </div>
              </div>

            </div>

            <div className="bg-neutral-955 p-3 border-t border-neutral-800 flex justify-end space-x-2">
              <button type="button" onClick={() => setCourseModalOpen(false)} className="text-xs text-neutral-400 px-3 py-1 bg-neutral-900 rounded">Cancelar</button>
              <button type="submit" className="text-xs text-white px-5 py-1 bg-[#0B4DA2] rounded">Confirmar Ementa</button>
            </div>
          </form>
        </div>
      )}


      {/* Modal D: Photo registry */}
      {photoModalOpen && activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <form 
            onSubmit={handleSavePhoto}
            className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl"
          >
            <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex justify-between items-center text-xs font-mono text-amber-500">
              <span>REGISTRAR FOTO NO ÁLBUM</span>
              <button type="button" onClick={() => setPhotoModalOpen(false)} className="text-neutral-400">Fechar</button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Álbum de Origem</label>
                <select
                  value={activePhoto.album || ''}
                  onChange={(e) => setActivePhoto({ ...activePhoto, album: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-825 text-neutral-400 p-2 text-xs rounded focus:outline-none"
                >
                  <option value="Concertos 2026">Concertos Metálicos 2026</option>
                  <option value="Ensaios Gerais">Ensaios e Bastidores</option>
                  <option value="Formatura Solene">Formatura Alunos Solene Nova</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Legenda Explicativa</label>
                <input 
                  type="text" 
                  required
                  value={activePhoto.caption || ''}
                  onChange={(e) => setActivePhoto({ ...activePhoto, caption: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-820 p-2 text-xs text-neutral-100 rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-2">Upload de arquivo</label>
                <ImageUploader 
                  onUploadSuccess={(url) => setActivePhoto({ ...activePhoto, url })} 
                />
              </div>
            </div>

            <div className="bg-neutral-955 p-3 border-t border-neutral-800 flex justify-end space-x-1.5">
              <button type="button" onClick={() => setPhotoModalOpen(false)} className="text-xs text-neutral-400 px-3 py-1 bg-neutral-900 rounded">Cancelar</button>
              <button type="submit" className="text-xs text-white px-5 py-1 bg-[#0B4DA2] rounded">Gravar Imagem</button>
            </div>
          </form>
        </div>
      )}


      {/* Modal E: Video Link */}
      {videoModalOpen && activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <form 
            onSubmit={handleSaveVideo}
            className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl"
          >
            <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex justify-between items-center text-xs font-mono text-sky-450">
              <span>VÍDEO LINK PLAYBACK</span>
              <button type="button" onClick={() => setVideoModalOpen(false)} className="text-neutral-400">Fechar</button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-505 mb-1">Título do Vídeo Filmado</label>
                <input 
                  type="text" 
                  required
                  value={activeVideo.title || ''}
                  onChange={(e) => setActiveVideo({ ...activeVideo, title: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-820 p-2 text-xs text-neutral-100 rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-505 mb-1">Link Completo YouTube / Vimeo</label>
                <input 
                  type="text" 
                  required
                  value={activeVideo.youtubeUrl || ''}
                  onChange={(e) => setActiveVideo({ ...activeVideo, youtubeUrl: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-820 p-2 text-xs text-neutral-100 rounded focus:outline-none font-mono"
                  placeholder="https://www.youtube.com/watch?..."
                />
              </div>
            </div>

            <div className="bg-neutral-955 p-3 border-t border-neutral-800 flex justify-end space-x-1.5">
              <button type="button" onClick={() => setVideoModalOpen(false)} className="text-xs text-neutral-400 px-3 py-1 bg-neutral-900 rounded">Cancelar</button>
              <button type="submit" className="text-xs text-white px-5 py-1 bg-[#0B4DA2] rounded">Anexar Playback</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
