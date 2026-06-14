import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, ArrowUp, ArrowDown, Copy, Calendar, Eye, Image, 
  HelpCircle, AlignLeft, BarChart3, Star, Sparkles, Check, CheckSquare, Globe
} from 'lucide-react';
import { Banner, SiteStatistics, ValueItem, TimelineEvent, AuditLog } from '../../validations/types';
import { ImageUploader, uploadFileToSupabase } from './MiniWidgets';
import { supabase } from '../../../lib/supabase';

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
  setSelectedEntityForEdit
}: SiteCMSProps) {
  const [subTab, setSubTab] = useState<'banners' | 'stats' | 'sobre' >('banners');

  // Modal triggers
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [activeBanner, setActiveBanner] = useState<Partial<Banner> | null>(null);
  const [bannerSaving, setBannerSaving] = useState(false);
  const [bannersLoading, setBannersLoading] = useState(true);

  // Arquivos pendentes selecionados no modal de banner, cujo upload
  // para o Supabase só ocorre ao clicar em "Confirmar e Salvar"
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

      setBanners((data || []).map(mapBannerFromDb));
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

    // Precisa ter ou uma imagem já existente (edição), ou um arquivo pendente selecionado
    const hasDesktopImage = !!activeBanner.imageDesktop || !!pendingDesktopFile;
    const hasMobileImage = !!activeBanner.imageMobile || !!pendingMobileFile;

    if (!hasDesktopImage || !hasMobileImage) {
      alert('Envie as imagens desktop e mobile antes de salvar.');
      return;
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

  const BannersSorted = () => {
    return [...banners].sort((a,b) => a.order - b.order);
  };


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
      <div className="pb-4 border-b border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-neutral-100 tracking-tight flex items-center">
            <Globe className="mr-2 text-[#0B4DA2]" size={20} />
            Editor CMS do Site Institucional
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Controle todo o conteúdo visível na página pública oficial sem precisar digitar uma única linha de código.
          </p>
        </div>

    
      </div>

      {/* ==========================================================
          SUBTAB 1: HERO BANNERS CAROUSEL CRUD
          ========================================================== */}
      {subTab === 'banners' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-neutral-900/40 p-4 border border-neutral-800 rounded-xl">
            <div>
              <h3 className="text-sm font-bold text-neutral-200">Banners Rotativos Principais</h3>
              <p className="text-[11px] text-neutral-500 mt-0.5">Disposição sequencial de imagens na capa do site público.</p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenBannerModal(null)}
              className="p-2 px-3 bg-gradient-to-r from-[#0B4DA2] to-blue-750 text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center shadow-lg"
            >
              <Plus size={14} className="mr-1.5" /> Adicionar Banner
            </button>
          </div>

          {bannersLoading ? (
            <div className="text-center py-12 text-xs text-neutral-500 font-mono">Carregando banners...</div>
          ) : BannersSorted().length === 0 ? (
            <div className="text-center py-12 text-xs text-neutral-500 font-mono border border-dashed border-neutral-800 rounded-xl">
              Nenhum banner cadastrado ainda.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BannersSorted().map((b, idx) => (
                <div 
                  key={b.id} 
                  className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 flex flex-col justify-between"
                >
                  {/* Visual Banner Preview Container */}
                  <div className="h-40 relative bg-neutral-950 flex items-center justify-center">
                    <img 
                      src={b.imageDesktop} 
                      alt={b.title} 
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover opacity-35" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
                    <div className="relative p-4 text-center z-10 max-w-sm">
                      <span className="text-[8px] font-mono p-0.5 px-1.5 rounded-full bg-neutral-900 text-amber-400 uppercase tracking-widest font-bold">
                        Slide {b.order} • {b.status}
                      </span>
                      <h4 className="text-sm font-bold text-neutral-100 font-sans tracking-tight mt-1.5 line-clamp-1">{b.title}</h4>
                      <p className="text-[10px] text-neutral-300 mt-1 line-clamp-2">{b.subtitle}</p>
                    </div>
                  </div>

                  {/* Info and Actions */}
                  <div className="p-4 bg-neutral-950 border-t border-neutral-850 flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveBanner(idx, 'up')}
                        className="p-1.5 bg-neutral-900 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === BannersSorted().length - 1}
                        onClick={() => handleMoveBanner(idx, 'down')}
                        className="p-1.5 bg-neutral-900 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleDuplicateBanner(b)}
                        className="p-1.5 bg-neutral-900 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white flex items-center text-[10px] uppercase font-bold tracking-wider font-mono cursor-pointer"
                      >
                        <Copy size={11} className="mr-1" /> Copiar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenBannerModal(b)}
                        className="p-1.5 bg-neutral-900 hover:bg-neutral-800 rounded text-[#F2C94C] hover:text-amber-300 transition-all cursor-pointer"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBanner(b.id, b.title)}
                        className="p-1.5 bg-neutral-900 hover:bg-rose-950 rounded text-rose-400 hover:text-rose-200 transition-all cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {bannerModalOpen && activeBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fade-in">
          <form 
            onSubmit={handleSaveBanner}
            className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500">
                {activeBanner.id ? 'Modificar Banner Existente' : 'Adicionar Novo Slider Capa'}
              </h3>
              <button 
                type="button" 
                onClick={() => setBannerModalOpen(false)} 
                className="text-neutral-400 hover:text-white"
              >
                Fechar
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1">Título do Banner</label>
                  <input 
                    type="text" 
                    required
                    value={activeBanner.title || ''} 
                    onChange={(e) => setActiveBanner({ ...activeBanner, title: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 p-2 text-xs rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1">Subtítulo (Destaque Médio)</label>
                  <input 
                    type="text" 
                    value={activeBanner.subtitle || ''} 
                    onChange={(e) => setActiveBanner({ ...activeBanner, subtitle: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 p-2 text-xs rounded focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1">Tag (opcional)</label>
                  <input 
                    type="text" 
                    value={activeBanner.tag || ''} 
                    onChange={(e) => setActiveBanner({ ...activeBanner, tag: e.target.value })}
                    placeholder="ex: projeto social musical"
                    className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 p-2 text-xs rounded focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1">Corpo do Texto Principal (Breve Resumo)</label>
                <textarea 
                  value={activeBanner.text || ''} 
                  onChange={(e) => setActiveBanner({ ...activeBanner, text: e.target.value })}
                  rows={2}
                  className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 p-2 text-xs rounded focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Image desktop and mobile uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500">Imagem Desktop</label>
                  {activeBanner.imageDesktop && (
                    <img
                      src={activeBanner.imageDesktop}
                      alt="Pré-visualização desktop"
                      referrerPolicy="no-referrer"
                      className="w-full h-24 object-cover rounded border border-neutral-800"
                    />
                  )}
                  <ImageUploader
                    allowedTypes="Imagens (.jpg, .png, .webp)"
                    onFileSelected={(file, previewUrl) => {
                      setPendingDesktopFile(file);
                      setActiveBanner(prev => prev ? { ...prev, imageDesktop: previewUrl } : prev);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500">Imagem Mobile</label>
                  {activeBanner.imageMobile && (
                    <img
                      src={activeBanner.imageMobile}
                      alt="Pré-visualização mobile"
                      referrerPolicy="no-referrer"
                      className="w-full h-24 object-cover rounded border border-neutral-800"
                    />
                  )}
                  <ImageUploader
                    allowedTypes="Imagens (.jpg, .png, .webp)"
                    onFileSelected={(file, previewUrl) => {
                      setPendingMobileFile(file);
                      setActiveBanner(prev => prev ? { ...prev, imageMobile: previewUrl } : prev);
                    }}
                  />
                </div>
              </div>

              {/* Action buttons and links */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#0B4DA2] mb-1">Rótulo Botão Primário</label>
                  <input 
                    type="text" 
                    value={activeBanner.primaryBtnText || ''} 
                    onChange={(e) => setActiveBanner({ ...activeBanner, primaryBtnText: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 p-2 text-xs rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#0B4DA2] mb-1">Link Botão Primário</label>
                  <input 
                    type="text" 
                    value={activeBanner.primaryBtnLink || ''} 
                    onChange={(e) => setActiveBanner({ ...activeBanner, primaryBtnLink: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 p-2 text-xs rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-505 mb-1">Rótulo Botão Secundário</label>
                  <input 
                    type="text" 
                    value={activeBanner.secondaryBtnText || ''} 
                    onChange={(e) => setActiveBanner({ ...activeBanner, secondaryBtnText: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 p-2 text-xs rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-505 mb-1">Link Botão Secundário</label>
                  <input 
                    type="text" 
                    value={activeBanner.secondaryBtnLink || ''} 
                    onChange={(e) => setActiveBanner({ ...activeBanner, secondaryBtnLink: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 p-2 text-xs rounded focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1">Disposição de Ordem</label>
                  <input 
                    type="number" 
                    value={activeBanner.order || 0} 
                    onChange={(e) => setActiveBanner({ ...activeBanner, order: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 p-2 text-xs rounded focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1">Status de Publicação</label>
                  <select
                    value={activeBanner.status || 'rascunho'}
                    onChange={(e) => setActiveBanner({ ...activeBanner, status: e.target.value as any })}
                    className="w-full bg-neutral-950 border border-neutral-800 text-neutral-400 p-2 text-xs rounded focus:outline-none"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="rascunho">Rascunho</option>
                  </select>
                </div>
              </div>

            </div>

            <div className="bg-neutral-950 p-4 border-t border-neutral-800 flex justify-end space-x-3">
              <button 
                type="button" 
                onClick={() => setBannerModalOpen(false)}
                className="p-1.5 px-4 bg-neutral-900 text-xs rounded hover:bg-neutral-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={bannerSaving}
                className="p-1.5 px-6 bg-[#0B4DA2] text-xs font-semibold text-white rounded hover:bg-blue-750 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {bannerSaving ? 'Salvando...' : 'Confirmar e Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal 2: Values Items Add/Edit */}
      {valueModalOpen && activeValue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <form 
            onSubmit={handleSaveValue}
            className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl"
          >
            <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="text-xs font-mono font-bold uppercase text-[#F2C94C] tracking-wider">
                {activeValue.id ? 'Alterar Valor' : 'Adicionar Novo Valor'}
              </h3>
              <button type="button" onClick={() => setValueModalOpen(false)} className="text-neutral-400">Fechar</button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Nome do Valor</label>
                <input 
                  type="text" 
                  required
                  value={activeValue.title || ''}
                  onChange={(e) => setActiveValue({ ...activeValue, title: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Descrição Explicativa</label>
                <textarea 
                  value={activeValue.description || ''}
                  onChange={(e) => setActiveValue({ ...activeValue, description: e.target.value })}
                  rows={3}
                  className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Ordem</label>
                <input 
                  type="number" 
                  value={activeValue.order || 0}
                  onChange={(e) => setActiveValue({ ...activeValue, order: Number(e.target.value) })}
                  className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-neutral-950 p-3 border-t border-neutral-800 flex justify-end space-x-2">
              <button type="button" onClick={() => setValueModalOpen(false)} className="text-xs text-neutral-400 px-3 py-1 bg-neutral-900 rounded">Cancelar</button>
              <button type="submit" className="text-xs text-white px-5 py-1 bg-[#0B4DA2] rounded">Salvar Valor</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal 3: Timeline Marks Create/Update */}
      {timelineModalOpen && activeTimeline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <form 
            onSubmit={handleSaveTimeline}
            className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl space-y-4"
          >
            <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="text-xs font-mono font-bold uppercase text-amber-500 tracking-wider">
                {activeTimeline.id ? 'Alterar Marco Histórico' : 'Adicionar Novo Ano'}
              </h3>
              <button type="button" onClick={() => setTimelineModalOpen(false)} className="text-neutral-400">Fechar</button>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Ano do Marco (Ex: 2012)</label>
                  <input 
                    type="text" 
                    required
                    value={activeTimeline.year || ''}
                    onChange={(e) => setActiveTimeline({ ...activeTimeline, year: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded focus:outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Título do Evento</label>
                  <input 
                    type="text" 
                    required
                    value={activeTimeline.title || ''}
                    onChange={(e) => setActiveTimeline({ ...activeTimeline, title: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Descrição do Fato Marcante</label>
                <textarea 
                  value={activeTimeline.description || ''}
                  onChange={(e) => setActiveTimeline({ ...activeTimeline, description: e.target.value })}
                  rows={3}
                  className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Upload ou Img Link</label>
                  <input 
                    type="text" 
                    value={activeTimeline.image || ''}
                    onChange={(e) => setActiveTimeline({ ...activeTimeline, image: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-500 p-2 text-xs rounded focus:outline-none font-mono"
                    placeholder="Link da imagem..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-2">Upload Expresso</label>
                  <ImageUploader 
                    onFileSelected={(file, previewUrl) => {
                      setPendingTimelineFile(file);
                      setActiveTimeline(prev => prev ? { ...prev, image: previewUrl } : prev);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-neutral-950 p-3 border-t border-neutral-800 flex justify-end space-x-2">
              <button type="button" onClick={() => setTimelineModalOpen(false)} className="text-xs text-neutral-400 px-3 py-1 bg-neutral-900 rounded">Cancelar</button>
              <button type="submit" className="text-xs text-white px-5 py-1 bg-[#0B4DA2] rounded">Salvar Marco</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
