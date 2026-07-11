import React, { useState, useEffect, useMemo } from 'react';
import { InlineLoader } from '../../components/InlineLoader';
import { Plus, Edit2, Trash2, Search, MessageSquare } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { dataCache } from '../../../lib/dataCache';
import { Drawer, DrawerSection, DrawerField, DrawerInput, DrawerTextarea, DrawerSelect } from './Drawer';

interface Testimonial {
  id: number;
  name: string;
  tag: string;
  tag_detail: string;
  text: string;
  order: number;
  active: boolean;
}

function getInitials(name: string) {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const TAG_OPTIONS = ['Aluno', 'Pai / Mãe', 'Outro'];

const EMPTY: Partial<Testimonial> = {
  name: '', tag: 'Aluno', tag_detail: '', text: '', order: 0, active: true,
};

export default function TestimonialsCMS() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativo' | 'inativo'>('all');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [active, setActive] = useState<Partial<Testimonial> | null>(null);
  const [tagMode, setTagMode] = useState<string>('Aluno'); // valor do select
  const [tagCustom, setTagCustom] = useState(''); // valor livre quando "Outro"
  const [saving, setSaving] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const cached = dataCache.get<Testimonial[]>('testimonials');
    if (cached) { setItems(cached); setLoading(false); return; }

    setLoading(true);
    supabase
      .from('testimonials')
      .select('*')
      .order('order', { ascending: true })
      .then(({ data, error }) => {
        if (error) { console.error(error); }
        else { const d = data ?? []; dataCache.set('testimonials', d); setItems(d); }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) dataCache.set('testimonials', items);
  }, [items, loading]);

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return items.filter(t => {
      const matchSearch = !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.text.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'all' || t.tag === categoryFilter;
      const matchStatus = statusFilter === 'all' || (statusFilter === 'ativo' ? t.active : !t.active);
      return matchSearch && matchCat && matchStatus;
    });
  }, [items, search, categoryFilter, statusFilter]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleOpen = (t: Testimonial | null) => {
    if (t) {
      setActive({ ...t });
      const isKnown = TAG_OPTIONS.includes(t.tag);
      setTagMode(isKnown ? t.tag : 'Outro');
      setTagCustom(isKnown ? '' : t.tag);
    } else {
      setActive({ ...EMPTY, order: items.length + 1 });
      setTagMode('Aluno');
      setTagCustom('');
    }
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!active) return;
    setSaving(true);
    try {
      const resolvedTag = tagMode === 'Outro' ? tagCustom : tagMode;
      const payload = {
        name: active.name,
        tag: resolvedTag,
        tag_detail: active.tag_detail,
        text: active.text,
        order: active.order ?? 0,
        active: active.active ?? true,
      };

      if (active.id) {
        const { data, error } = await supabase
          .from('testimonials').update(payload).eq('id', active.id).select().single();
        if (error) { alert('Erro ao atualizar: ' + error.message); return; }
        setItems(prev => prev.map(t => t.id === data.id ? data : t));
      } else {
        const { data, error } = await supabase
          .from('testimonials').insert(payload).select().single();
        if (error) { alert('Erro ao criar: ' + error.message); return; }
        setItems(prev => [...prev, data]);
      }
      setDrawerOpen(false);
      setActive(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (t: Testimonial) => {
    if (!confirm(`Remover depoimento de "${t.name}"?`)) return;
    const { error } = await supabase.from('testimonials').delete().eq('id', t.id);
    if (error) { alert('Erro ao remover: ' + error.message); return; }
    setItems(prev => prev.filter(x => x.id !== t.id));
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-5 animate-fade-in select-none">

      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#001856]">Depoimentos</h2>
          <p className="text-xs text-gray-400 mt-0.5">Relatos de alunos e famílias exibidos no carrossel</p>
        </div>
        <button
          type="button"
          onClick={() => handleOpen(null)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#ffc300] hover:bg-yellow-400 text-[#001856] rounded-lg text-xs font-bold cursor-pointer transition-colors shrink-0"
        >
          <Plus size={14} /> Novo depoimento
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Pesquisar por nome ou texto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#001856]/20"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#001856]/20 cursor-pointer"
        >
          <option value="all">Todas as categorias</option>
          <option value="Aluno">Aluno</option>
          <option value="Pai / Mãe">Pai / Mãe</option>
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
          className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#001856]/20 cursor-pointer"
        >
          <option value="all">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <InlineLoader message="Carregando depoimentos..." />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
          Nenhum depoimento encontrado.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => (
            <div
              key={t.id}
              className="bg-white border border-gray-100 rounded-xl px-5 py-4 flex items-center gap-4 hover:border-gray-200 transition-colors"
            >
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
                style={{ backgroundColor: '#ffc300', color: '#001856' }}
              >
                {getInitials(t.name)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm text-gray-800">{t.name}</span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#ffc300', color: '#001856' }}
                  >
                    {t.tag}
                  </span>
                  {!t.active && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                      Inativo
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate">{t.text}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpen(t)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#001856] hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(t)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer create/edit */}
      <Drawer
        open={drawerOpen && !!active}
        onClose={() => { setDrawerOpen(false); setActive(null); }}
        title={active?.id ? 'Editar Depoimento' : 'Novo Depoimento'}
        description="Adicione ou edite um depoimento exibido no carrossel do site."
        icon={MessageSquare}
        iconBg="bg-yellow-50"
        iconColor="text-yellow-600"
        onSubmit={e => { e.preventDefault(); handleSave(); }}
        submitting={saving}
        submitLabel={active?.id ? 'Salvar Alterações' : 'Criar Depoimento'}
      >
        {active && (
          <>
            <DrawerSection title="Identificação">
              <DrawerField label="Nome *">
                <DrawerInput
                  value={active.name ?? ''}
                  onChange={e => setActive(a => ({ ...a!, name: e.target.value }))}
                  placeholder="Nome da pessoa"
                />
              </DrawerField>

              <DrawerField label="Categoria *">
                <DrawerSelect
                  value={tagMode}
                  onChange={e => setTagMode((e.target as HTMLSelectElement).value)}
                >
                  <option value="Aluno">Aluno</option>
                  <option value="Pai / Mãe">Pai / Mãe</option>
                  <option value="Outro">Outro</option>
                </DrawerSelect>
              </DrawerField>

              {tagMode === 'Outro' && (
                <DrawerField label="Especifique a categoria">
                  <DrawerInput
                    value={tagCustom}
                    onChange={e => setTagCustom(e.target.value)}
                    placeholder="Ex: Professor, Voluntário..."
                  />
                </DrawerField>
              )}

              <DrawerField label="Tema / Detalhe">
                <DrawerInput
                  value={active.tag_detail ?? ''}
                  onChange={e => setActive(a => ({ ...a!, tag_detail: e.target.value }))}
                  placeholder="Ex: Disciplina e responsabilidade"
                />
              </DrawerField>
            </DrawerSection>

            <DrawerSection title="Depoimento">
              <DrawerField label="Texto *">
                <DrawerTextarea
                  value={active.text ?? ''}
                  onChange={e => setActive(a => ({ ...a!, text: e.target.value }))}
                  placeholder="Escreva o depoimento completo..."
                  rows={5}
                />
              </DrawerField>
            </DrawerSection>

            <DrawerSection title="Configurações">
              <DrawerField label="Ordem de exibição">
                <DrawerInput
                  type="number"
                  value={String(active.order ?? 0)}
                  onChange={e => setActive(a => ({ ...a!, order: Number(e.target.value) }))}
                  placeholder="0"
                />
              </DrawerField>

              <DrawerField label="Status">
                <DrawerSelect
                  value={active.active ? 'ativo' : 'inativo'}
                  onChange={e => setActive(a => ({ ...a!, active: (e.target as HTMLSelectElement).value === 'ativo' }))}
                >
                  <option value="ativo">Ativo (visível no site)</option>
                  <option value="inativo">Inativo (oculto)</option>
                </DrawerSelect>
              </DrawerField>
            </DrawerSection>
          </>
        )}
      </Drawer>
    </div>
  );
}
