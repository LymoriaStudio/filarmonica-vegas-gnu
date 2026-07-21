import React, { useState, useEffect, useMemo } from 'react';
import { InlineLoader } from '../../components/InlineLoader';
import {
  Plus, Edit2, Trash2, ArrowUp, ArrowDown, Copy, Calendar, Eye, Image, X,
  HelpCircle, AlignLeft, BarChart3, Star, Sparkles, Check, CheckSquare, Globe, Search
} from 'lucide-react';
import { Banner, SiteStatistics, ValueItem, TimelineEvent, AuditLog } from '../../validations/types';
import { ImageUploader, uploadFileToSupabase } from './MiniWidgets';
import { Drawer, DrawerSection, DrawerField, DrawerInput, DrawerTextarea, DrawerSelect } from './Drawer';
import { supabase } from '../../../lib/supabase';
import { dataCache } from '../../../lib/dataCache';

interface SiteCMSProps {
  banners: Banner[];
  setBanners: React.Dispatch<React.SetStateAction<Banner[]>>;
  statistics: SiteStatistics;
  setStatistics: React.Dispatch<React.SetStateAction<SiteStatistics>>;
  values: ValueItem[];
  setValues: React.Dispatch<React.SetStateAction<ValueItem[]>>;

  addAuditLog: (action: string, module: string, details: string) => void;
  selectedEntityForEdit: any;
  setSelectedEntityForEdit: (entity: any) => void;
  activeTab?: string;
}

// Map a row from the `banners` table (snake_case) to the app's Banner type (camelCase)
const mapBannerFromDb = (row: any): Banner => ({
  id: row.id,
  imageDesktop: row.image_desktop,
  imageMobile: row.image_mobile,
  tag: row.tag,
  title: row.title,
  subtitle: row.subtitle,
  text: row.text,
  primaryBtnText: row.primary_btn_text,
  primaryBtnLink: row.primary_btn_link,
  secondaryBtnText: row.secondary_btn_text,
  secondaryBtnLink: row.secondary_btn_link,
  order: row.order,
  status: row.status,
});

// Map a Banner (camelCase) into the snake_case payload the `banners` table expects
const mapBannerToDb = (b: Partial<Banner>) => ({
  image_desktop: b.imageDesktop,
  image_mobile: b.imageMobile,
  tag: b.tag || null,
  title: b.title,
  subtitle: b.subtitle || null,
  text: b.text || null,
  primary_btn_text: b.primaryBtnText || null,
  primary_btn_link: b.primaryBtnLink || null,
  secondary_btn_text: b.secondaryBtnText || null,
  secondary_btn_link: b.secondaryBtnLink || null,
  order: b.order ?? 0,
  status: b.status || 'rascunho',
});

export default function SiteCMS({
  banners,
  setBanners,
  statistics,
  setStatistics,
  values,
  setValues,
  addAuditLog,
  selectedEntityForEdit,
  setSelectedEntityForEdit,
  activeTab,
}: SiteCMSProps) {
  const initialSubTab = activeTab === 'site-sobre' ? 'sobre' : activeTab === 'site-timeline' ? 'stats' : 'banners';
  const [subTab, setSubTab] = useState<'banners' | 'stats' | 'sobre'>(initialSubTab as any);

  // Modal triggers
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [activeBanner, setActiveBanner] = useState<Partial<Banner> | null>(null);
  const [bannerSaving, setBannerSaving] = useState(false);
  const [bannersLoading, setBannersLoading] = useState(true);

  // Arquivos pendentes selecionados no modal de banner, cujo upload
  // para o Supabase só ocorre ao clicar em "Confirmar e Salvar"
  const [bannerSearch, setBannerSearch] = useState('');
  const [bannerStatusFilter, setBannerStatusFilter] = useState<'all' | 'ativo' | 'rascunho' | 'agendado'>('all');

  const [pendingDesktopFile, setPendingDesktopFile] = useState<File | null>(null);
  const [pendingMobileFile, setPendingMobileFile] = useState<File | null>(null);

  const [valueModalOpen, setValueModalOpen] = useState(false);
  const [activeValue, setActiveValue] = useState<Partial<ValueItem> | null>(null);

  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [activeTimeline, setActiveTimeline] = useState<Partial<TimelineEvent> | null>(null);
  const [pendingTimelineFile, setPendingTimelineFile] = useState<File | null>(null);

  // ==========================================
  // LOAD BANNERS FROM SUPABASE
  // ==========================================
  useEffect(() => {
    const fetchBanners = async () => {
      const cached = dataCache.get<Banner[]>('banners');
      if (cached) {
        setBanners(cached);
        setBannersLoading(false);
        return;
      }

      setBannersLoading(true);
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('order', { ascending: true });

      if (error) {
        console.error(error);
        setBannersLoading(false);
        return;
      }

      const mapped = (data || []).map(mapBannerFromDb);
      dataCache.set('banners', mapped);
      setBanners(mapped);
      setBannersLoading(false);
    };

    fetchBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================
  // BANNERS HANDLERS
  // ==========================================
  const handleOpenBannerModal = (banner: Partial<Banner> | null) => {
    // Limpa quaisquer arquivos pendentes de uma edição anterior
    setPendingDesktopFile(null);
    setPendingMobileFile(null);

    setActiveBanner(banner || {
      id: '',
      title: '',
      subtitle: '',
      text: '',
      imageDesktop: '',
      imageMobile: '',
      primaryBtnText: 'Inscreva-se',
      primaryBtnLink: '#inscricao',
      secondaryBtnText: 'Saiba Mais',
      secondaryBtnLink: '#valores',
      order: BannersSorted().length + 1,
      status: 'rascunho'
    });
    setBannerModalOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBanner) return;

    // Só exige imagem se for um novo banner (sem id)
    if (!activeBanner.id) {
      const hasDesktopImage = !!activeBanner.imageDesktop || !!pendingDesktopFile;
      const hasMobileImage = !!activeBanner.imageMobile || !!pendingMobileFile;
      if (!hasDesktopImage || !hasMobileImage) {
        alert('Envie as imagens desktop e mobile antes de salvar.');
        return;
      }
    }

    setBannerSaving(true);

    try {
      let finalImageDesktop = activeBanner.imageDesktop;
      let finalImageMobile = activeBanner.imageMobile;

      // Faz o upload real para o Supabase Storage somente agora,
      // no momento de confirmar e salvar.
      if (pendingDesktopFile) {
        finalImageDesktop = await uploadFileToSupabase(pendingDesktopFile, 'banners');
      }
      if (pendingMobileFile) {
        finalImageMobile = await uploadFileToSupabase(pendingMobileFile, 'banners');
      }

      const payload = mapBannerToDb({
        ...activeBanner,
        imageDesktop: finalImageDesktop,
        imageMobile: finalImageMobile,
      });

      // Reorder: when the new order collides with an existing banner, push all subsequent ones down by 1
      const newOrder = activeBanner.order;
      const othersAtOrAbove = banners
        .filter(b => b.id !== activeBanner.id && b.order >= newOrder)
        .sort((a, b) => a.order - b.order);

      // Walk through sorted list; shift each one that would collide with the previous
      const shiftMap: Record<string, number> = {};
      let expectedNext = newOrder + 1;
      for (const b of othersAtOrAbove) {
        if (b.order < expectedNext) {
          shiftMap[b.id] = expectedNext;
          expectedNext++;
        } else {
          expectedNext = b.order + 1; // no collision, reset chain
        }
      }

      if (Object.keys(shiftMap).length > 0) {
        await Promise.all(
          Object.entries(shiftMap).map(([id, order]) =>
            supabase.from('banners').update({ order }).eq('id', id)
          )
        );
        setBanners(prev => prev.map(b => shiftMap[b.id] !== undefined ? { ...b, order: shiftMap[b.id] } : b));
      }

      if (activeBanner.id) {
        // Edit
        const { data, error } = await supabase
          .from('banners')
          .update(payload)
          .eq('id', activeBanner.id)
          .select()
          .single();

        if (error) {
          console.error(error);
          alert('Erro ao atualizar banner: ' + error.message);
          return;
        }

        const updated = mapBannerFromDb(data);
        setBanners(prev => prev.map(b => b.id === updated.id ? updated : b));
        addAuditLog('Editou Banner', 'Site Banners', `Alterou banner: ${updated.title}`);
      } else {
        // Add
        const { data, error } = await supabase
          .from('banners')
          .insert(payload)
          .select()
          .single();

        if (error) {
          console.error(error);
          alert('Erro ao criar banner: ' + error.message);
          return;
        }

        const newBanner = mapBannerFromDb(data);
        setBanners(prev => [...prev, newBanner]);
        addAuditLog('Criou Banner', 'Site Banners', `Inseriu banner: ${newBanner.title}`);
      }

      setBannerModalOpen(false);
      setActiveBanner(null);
      setPendingDesktopFile(null);
      setPendingMobileFile(null);
    } catch (err: any) {
      console.error(err);
      alert('Erro ao enviar imagens: ' + err.message);
    } finally {
      setBannerSaving(false);
    }
  };

  const handleDeleteBanner = async (id: string, name: string) => {
    if (!confirm(`Remover o banner "${name}"? Esta ação não pode ser desfeita.`)) return;

    const { error } = await supabase.from('banners').delete().eq('id', id);

    if (error) {
      console.error(error);
      alert('Erro ao remover banner: ' + error.message);
      return;
    }

    setBanners(prev => prev.filter(b => b.id !== id));
    addAuditLog('Deletou Banner', 'Site Banners', `Removeu banner de ID: ${id} (${name})`);
  };

  const handleDuplicateBanner = async (b: Banner) => {
    const payload = mapBannerToDb({
      ...b,
      title: `${b.title} (Cópia)`,
      order: BannersSorted().length + 1,
      status: 'rascunho',
    });

    const { data, error } = await supabase
      .from('banners')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error(error);
      alert('Erro ao duplicar banner: ' + error.message);
      return;
    }

    const dup = mapBannerFromDb(data);
    setBanners(prev => [...prev, dup]);
    addAuditLog('Duplicou Banner', 'Site Banners', `Duplicou banner: ${b.title}`);
  };

  const handleMoveBanner = async (index: number, direction: 'up' | 'down') => {
    const sorted = BannersSorted();
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= sorted.length) return;

    const a = sorted[index];
    const b = sorted[newIdx];
    const aOrder = a.order;
    const bOrder = b.order;

    const [{ error: err1 }, { error: err2 }] = await Promise.all([
      supabase.from('banners').update({ order: bOrder }).eq('id', a.id),
      supabase.from('banners').update({ order: aOrder }).eq('id', b.id),
    ]);

    if (err1 || err2) {
      console.error(err1, err2);
      alert('Erro ao reordenar banners.');
      return;
    }

    setBanners(prev => prev.map(banner => {
      if (banner.id === a.id) return { ...banner, order: bOrder };
      if (banner.id === b.id) return { ...banner, order: aOrder };
      return banner;
    }));

    addAuditLog('Reordenou Banners', 'Site Banners', 'Alterou a disposição dos banners no carrossel institucional');
  };

  // Sync cache whenever banners state changes after load
  useEffect(() => {
    if (!bannersLoading) {
      dataCache.set('banners', banners);
    }
  }, [banners, bannersLoading]);

  const BannersSorted = () => {
    return [...banners].sort((a,b) => a.order - b.order);
  };

  const filteredBanners = useMemo(() => {
    return BannersSorted().filter(b => {
      const matchesSearch = !bannerSearch || b.title.toLowerCase().includes(bannerSearch.toLowerCase()) || b.subtitle?.toLowerCase().includes(bannerSearch.toLowerCase());
      const matchesStatus = bannerStatusFilter === 'all' || b.status === bannerStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [banners, bannerSearch, bannerStatusFilter]);


  // ==========================================
  // VALUES HANDLERS
  // ==========================================
  const handleOpenValueModal = (val: Partial<ValueItem> | null) => {
    setActiveValue(val || {
      id: '',
      title: '',
      description: '',
      order: values.length + 1
    });
    setValueModalOpen(true);
  };

  const handleSaveValue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeValue) return;

    if (activeValue.id) {
      setValues(prev => prev.map(v => v.id === activeValue.id ? (activeValue as ValueItem) : v));
      addAuditLog('Editou Valor Institucional', 'Valores', `Alterou valor: ${activeValue.title}`);
    } else {
      const newVal = { ...activeValue, id: `val-${Date.now()}` } as ValueItem;
      setValues(prev => [...prev, newVal]);
      addAuditLog('Criou Valor Institucional', 'Valores', `Criou valor: ${newVal.title}`);
    }
    setValueModalOpen(false);
  };

  const handleDeleteValue = (id: string, name: string) => {
    setValues(prev => prev.filter(v => v.id !== id));
    addAuditLog('Deletou Valor', 'Valores', `Deletou valor: ${name}`);
  };

  // ==========================================
  // TIMELINE HANDLERS (local-only, not yet persisted)
  // ==========================================
  const handleSaveTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTimeline) return;

    // Faz o upload da imagem do marco somente ao confirmar/salvar
    if (pendingTimelineFile) {
      try {
        const url = await uploadFileToSupabase(pendingTimelineFile, 'timeline');
        setActiveTimeline(prev => prev ? { ...prev, image: url } : prev);
      } catch (err: any) {
        console.error(err);
        alert('Erro ao enviar imagem do marco: ' + err.message);
        return;
      }
    }

    setPendingTimelineFile(null);
    setTimelineModalOpen(false);
  };


  return (
    <div className="space-y-6 p-6 animate-fade-in select-none">
      
      {/* CMS Site Top Section Header */}
      <div className="pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-[#001856] tracking-tight flex items-center">
            <Globe className="mr-2 text-[#001856]" size={20} />
            Banners
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Controle todo o conteúdo visível na página pública oficial sem precisar digitar uma única linha de código.
          </p>
        </div>

        {subTab === 'banners' && (
          <button
            type="button"
            onClick={() => handleOpenBannerModal(null)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#ffc300] hover:bg-yellow-400 text-[#001856] rounded-lg text-xs font-bold cursor-pointer transition-colors shrink-0"
          >
            <Plus size={14} /> Adicionar Banner
          </button>
        )}
      </div>

      {/* ==========================================================
          SUBTAB 1: HERO BANNERS CAROUSEL CRUD
          ========================================================== */}
      {subTab === 'banners' && (
        <div className="space-y-4">

          {/* Toolbar de filtros */}
          <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Pesquisar por título ou subtítulo..."
                value={bannerSearch}
                onChange={e => setBannerSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#001856]/20"
              />
            </div>
            <select
              value={bannerStatusFilter}
              onChange={e => setBannerStatusFilter(e.target.value as any)}
              className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#001856]/20 cursor-pointer"
            >
              <option value="all">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="rascunho">Rascunho</option>
              <option value="agendado">Agendado</option>
            </select>
          </div>

          {bannersLoading ? (
            <InlineLoader message="Carregando banners..." />
          ) : filteredBanners.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400 font-mono border border-dashed border-gray-200 rounded-xl">
              {bannerSearch || bannerStatusFilter !== 'all' ? 'Nenhum banner encontrado para os filtros aplicados.' : 'Nenhum banner cadastrado ainda.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBanners.map((b, idx) => (
                <div 
                  key={b.id} 
                  className="rounded-xl overflow-hidden bg-white border border-gray-200 flex flex-col justify-between"
                >
                  {/* Visual Banner Preview Container */}
                  <div className="h-40 relative bg-gray-100 flex items-center justify-center">
                    <img 
                      src={b.imageDesktop} 
                      alt={b.title} 
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="relative p-4 text-center z-10 max-w-sm">
                      <span className="text-[8px] font-mono p-0.5 px-1.5 rounded-full bg-white text-[#ffc300] uppercase tracking-widest font-bold">
                        Slide {b.order} • {b.status}
                      </span>
                      <h4 className="text-sm font-bold text-white font-sans tracking-tight mt-1.5 line-clamp-1">{b.title}</h4>
                      <p className="text-[10px] text-white/80 mt-1 line-clamp-2">{b.subtitle}</p>
                    </div>
                  </div>

                  {/* Info and Actions */}
                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {b.status === 'ativo' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Público
                        </span>
                      )}
                      {b.status === 'rascunho' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" /> Rascunho
                        </span>
                      )}
                      {b.status === 'agendado' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block" /> Agendado
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveBanner(idx, 'up')}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-400 hover:text-[#001856] disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === filteredBanners.length - 1}
                        onClick={() => handleMoveBanner(idx, 'down')}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-400 hover:text-[#001856] disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ArrowDown size={12} />
                      </button>
                      <div className="w-px h-4 bg-gray-200 mx-0.5" />
                      <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDuplicateBanner(b)}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-400 hover:text-[#001856] flex items-center text-[10px] uppercase font-bold tracking-wider font-mono cursor-pointer"
                      >
                        <Copy size={11} className="mr-1" /> Copiar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenBannerModal(b)}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded text-[#ffc300] hover:text-[#ffc300] transition-all cursor-pointer"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBanner(b.id, b.title)}
                        className="p-1.5 bg-gray-100 hover:bg-rose-950 rounded text-rose-400 hover:text-rose-200 transition-all cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Drawer 1: Banner */}
      <Drawer
        open={bannerModalOpen && !!activeBanner}
        onClose={() => setBannerModalOpen(false)}
        title={activeBanner?.id ? 'Modificar banner existente' : 'Adicionar novo banner'}
        description="Configure o slide de capa do site."
        icon={Image}
        iconBg="bg-amber-50"
        iconColor="text-amber-500"
        onSubmit={handleSaveBanner}
        submitLabel={bannerSaving ? 'Salvando...' : 'Confirmar e Salvar'}
        submitting={bannerSaving}
      >
        {activeBanner && (<>
          <DrawerSection title="Textos">
            <div className="grid grid-cols-2 gap-3">
              <DrawerField label="Título do banner" required>
                <DrawerInput type="text" required value={activeBanner.title || ''} onChange={e => setActiveBanner({ ...activeBanner, title: e.target.value })} />
              </DrawerField>
              <DrawerField label="Subtítulo">
                <DrawerInput type="text" value={activeBanner.subtitle || ''} onChange={e => setActiveBanner({ ...activeBanner, subtitle: e.target.value })} />
              </DrawerField>
            </div>
            <DrawerField label="Tag">
              <DrawerInput type="text" value={activeBanner.tag || ''} onChange={e => setActiveBanner({ ...activeBanner, tag: e.target.value })} placeholder="ex: projeto social musical" />
            </DrawerField>
            <DrawerField label="Corpo do texto principal">
              <DrawerTextarea value={activeBanner.text || ''} onChange={e => setActiveBanner({ ...activeBanner, text: e.target.value })} rows={2} />
            </DrawerField>
          </DrawerSection>

          <DrawerSection title="Imagens">
            <div className="flex flex-col gap-4">
              <DrawerField label="Imagem Desktop">
                {activeBanner.imageDesktop && (
                  <div className="relative mb-2">
                    <img src={activeBanner.imageDesktop} alt="Desktop" referrerPolicy="no-referrer" className="w-full h-36 object-cover rounded border border-gray-200" />
                    <button type="button" onClick={() => { setPendingDesktopFile(null); setActiveBanner(prev => prev ? { ...prev, imageDesktop: '' } : prev); }} className="absolute -top-2.5 -right-2.5 p-1.5 bg-rose-600 hover:bg-rose-700 rounded-full text-white cursor-pointer shadow-lg border-2 border-white"><X size={14} strokeWidth={2.5} /></button>
                  </div>
                )}
                {!activeBanner.imageDesktop && <ImageUploader allowedTypes="Imagens (.jpg, .png, .webp)" onFileSelected={(file, previewUrl) => { setPendingDesktopFile(file); setActiveBanner(prev => prev ? { ...prev, imageDesktop: previewUrl } : prev); }} />}
              </DrawerField>
              <DrawerField label="Imagem Mobile">
                {activeBanner.imageMobile && (
                  <div className="relative mb-2">
                    <img src={activeBanner.imageMobile} alt="Mobile" referrerPolicy="no-referrer" className="w-full h-36 object-cover rounded border border-gray-200" />
                    <button type="button" onClick={() => { setPendingMobileFile(null); setActiveBanner(prev => prev ? { ...prev, imageMobile: '' } : prev); }} className="absolute -top-2.5 -right-2.5 p-1.5 bg-rose-600 hover:bg-rose-700 rounded-full text-white cursor-pointer shadow-lg border-2 border-white"><X size={14} strokeWidth={2.5} /></button>
                  </div>
                )}
                {!activeBanner.imageMobile && <ImageUploader allowedTypes="Imagens (.jpg, .png, .webp)" onFileSelected={(file, previewUrl) => { setPendingMobileFile(file); setActiveBanner(prev => prev ? { ...prev, imageMobile: previewUrl } : prev); }} />}
              </DrawerField>
            </div>
          </DrawerSection>

          <DrawerSection title="Botões de Ação" optional>
            <div className="grid grid-cols-2 gap-3">
              <DrawerField label="Rótulo botão primário">
                <DrawerInput type="text" value={activeBanner.primaryBtnText || ''} onChange={e => setActiveBanner({ ...activeBanner, primaryBtnText: e.target.value })} />
              </DrawerField>
              <DrawerField label="Link botão primário">
                <DrawerInput type="text" value={activeBanner.primaryBtnLink || ''} onChange={e => setActiveBanner({ ...activeBanner, primaryBtnLink: e.target.value })} />
              </DrawerField>
              <DrawerField label="Rótulo botão secundário">
                <DrawerInput type="text" value={activeBanner.secondaryBtnText || ''} onChange={e => setActiveBanner({ ...activeBanner, secondaryBtnText: e.target.value })} />
              </DrawerField>
              <DrawerField label="Link botão secundário">
                <DrawerInput type="text" value={activeBanner.secondaryBtnLink || ''} onChange={e => setActiveBanner({ ...activeBanner, secondaryBtnLink: e.target.value })} />
              </DrawerField>
            </div>
          </DrawerSection>

          <DrawerSection title="Configurações">
            <div className="grid grid-cols-2 gap-3">
              <DrawerField label="Ordem">
                <DrawerInput type="number" value={activeBanner.order || 0} onChange={e => setActiveBanner({ ...activeBanner, order: Number(e.target.value) })} />
              </DrawerField>
              <DrawerField label="Status de publicação">
                <DrawerSelect value={activeBanner.status || 'rascunho'} onChange={e => setActiveBanner({ ...activeBanner, status: e.target.value as any })}>
                  <option value="ativo">Ativo</option>
                  <option value="rascunho">Rascunho</option>
                </DrawerSelect>
              </DrawerField>
            </div>
          </DrawerSection>
        </>)}
      </Drawer>

      {/* Drawer 2: Values */}
      <Drawer
        open={valueModalOpen && !!activeValue}
        onClose={() => setValueModalOpen(false)}
        title={activeValue?.id ? 'Alterar valor' : 'Adicionar novo valor'}
        description="Defina um valor institucional da organização."
        icon={Star}
        iconBg="bg-amber-50"
        iconColor="text-amber-500"
        onSubmit={handleSaveValue}
        submitLabel="Salvar Valor"
        width="w-[480px]"
      >
        {activeValue && (<>
          <DrawerSection title="Identificação">
            <DrawerField label="Nome do valor" required>
              <DrawerInput type="text" required value={activeValue.title || ''} onChange={e => setActiveValue({ ...activeValue, title: e.target.value })} />
            </DrawerField>
            <DrawerField label="Descrição explicativa">
              <DrawerTextarea value={activeValue.description || ''} onChange={e => setActiveValue({ ...activeValue, description: e.target.value })} rows={3} />
            </DrawerField>
            <DrawerField label="Ordem">
              <DrawerInput type="number" value={activeValue.order || 0} onChange={e => setActiveValue({ ...activeValue, order: Number(e.target.value) })} />
            </DrawerField>
          </DrawerSection>
        </>)}
      </Drawer>

      {/* Drawer 3: Timeline */}
      <Drawer
        open={timelineModalOpen && !!activeTimeline}
        onClose={() => setTimelineModalOpen(false)}
        title={activeTimeline?.id ? 'Alterar marco histórico' : 'Adicionar novo marco'}
        description="Registre um evento marcante na linha do tempo."
        icon={Calendar}
        iconBg="bg-blue-50"
        iconColor="text-blue-500"
        onSubmit={handleSaveTimeline}
        submitLabel="Salvar Marco"
        width="w-[520px]"
      >
        {activeTimeline && (<>
          <DrawerSection title="Identificação">
            <div className="grid grid-cols-2 gap-3">
              <DrawerField label="Ano do marco" required>
                <DrawerInput type="text" required value={activeTimeline.year || ''} onChange={e => setActiveTimeline({ ...activeTimeline, year: e.target.value })} placeholder="2012" className="font-mono font-bold" />
              </DrawerField>
              <DrawerField label="Título do evento" required>
                <DrawerInput type="text" required value={activeTimeline.title || ''} onChange={e => setActiveTimeline({ ...activeTimeline, title: e.target.value })} />
              </DrawerField>
            </div>
            <DrawerField label="Descrição do fato marcante">
              <DrawerTextarea value={activeTimeline.description || ''} onChange={e => setActiveTimeline({ ...activeTimeline, description: e.target.value })} rows={3} />
            </DrawerField>
          </DrawerSection>
          <DrawerSection title="Imagem" optional>
            <DrawerField label="Link da imagem">
              <DrawerInput type="text" value={activeTimeline.image || ''} onChange={e => setActiveTimeline({ ...activeTimeline, image: e.target.value })} placeholder="https://..." className="font-mono text-xs" />
            </DrawerField>
            <DrawerField label="Upload de arquivo">
              <ImageUploader onFileSelected={(file, previewUrl) => { setPendingTimelineFile(file); setActiveTimeline(prev => prev ? { ...prev, image: previewUrl } : prev); }} />
            </DrawerField>
          </DrawerSection>
        </>)}
      </Drawer>

    </div>
  );
}
