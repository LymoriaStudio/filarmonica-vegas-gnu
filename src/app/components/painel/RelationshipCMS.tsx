/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { InlineLoader } from '../../components/InlineLoader';

import React, { useState, useEffect, useMemo } from 'react';
import {
  HeartHandshake, BookOpen, HelpCircle, Check, Archive, ArchiveRestore, Trash2, Mail, Phone,
  UserPlus, UserCheck, MessageSquare, ExternalLink, Calendar, CheckCircle2,
  Play, Send, Share2, Eye, X, GraduationCap, Search, SortAsc
} from 'lucide-react';
import {
  getInteressados,
  updateInteressado,
  deleteInteressado,
  Interessado,
} from '../../services/interessadosService';
import { getApoiadores, updateApoiadorStatus } from '../../services/useApoiadores';
import { createStudent } from '../../services/studentsService';
import { SupportFormResponse, ContactMessage, Student, Supporter } from '../../validations/types';
import { ImageUploader, uploadFileToSupabase } from './MiniWidgets';
import { dataCache } from '../../../lib/dataCache';

// ── Tipo local derivado da tabela Supabase ────────────────────────────────────
function toInterestView(i: Interessado) {
  return {
    id: i.id ?? '',
    name: i.name,
    email: i.email,
    phone: i.phone,
    age: i.age ?? 0,
    instrumentOfInterest: i.instrument_of_interest,
    message: i.message ?? '',
    date: i.date ? new Date(i.date).toLocaleDateString('pt-BR') : '',
    rawDate: i.date ?? '',
    status: i.status ?? 'novo',
  };
}

type InterestView = ReturnType<typeof toInterestView>;

// ── Mapper: tabela quero_apoiar -> SupportFormResponse ────────────────────────
function toSupportView(row: any): SupportFormResponse & { rawDate: string } {
  return {
    id: row.id ?? '',
    name: row.name,
    company: row.company ?? '',
    email: row.email,
    phone: row.phone,
    supportType: row.support_type,
    message: row.message ?? '',
    date: row.date ? new Date(row.date).toLocaleDateString('pt-BR') : '',
    rawDate: row.date ?? '',
    status: row.status ?? 'pendente',
  };
}

interface StudentEnrollmentForm {
  photo?: string;
  name: string;
  birthDate?: string;
  instrument: string;
  classroom?: string;
  phone: string;
  email: string;
  guardian?: string;
  address?: string;
  status?: string;
}

interface RelationshipCMSProps {
  supports: SupportFormResponse[];
  setSupports: React.Dispatch<React.SetStateAction<SupportFormResponse[]>>;
  contacts: ContactMessage[];
  setContacts: React.Dispatch<React.SetStateAction<ContactMessage[]>>;

  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  supporters: Supporter[];
  setSupporters: React.Dispatch<React.SetStateAction<Supporter[]>>;

  addAuditLog: (action: string, module: string, details: string) => void;
  activeTab?: string;
}

export default function RelationshipCMS({
  supports,
  setSupports,
  contacts,
  setContacts,
  students,
  setStudents,
  supporters,
  setSupporters,
  addAuditLog,
  activeTab,
}: RelationshipCMSProps) {
  const initialSubTab = activeTab === 'relacionamento-apoiar' ? 'apoiar' : activeTab === 'relacionamento-contato' ? 'contato' : 'interesse';
  const [subTab, setSubTab] = useState<'interesse' | 'apoiar' | 'contato'>(initialSubTab as any);

  // ── Estado local dos interessados ─────────────────────────────────────────
  const [interests, setInterests] = useState<InterestView[]>([]);
  const [loadingInterests, setLoadingInterests] = useState(false);
  const [errorInterests, setErrorInterests] = useState<string | null>(null);
  const [interestSearch, setInterestSearch] = useState('');
  const [interestSort, setInterestSort] = useState<'recent' | 'oldest' | 'az'>('recent');
  const [viewInterest, setViewInterest] = useState<InterestView | null>(null);
  const [supportSearch, setSupportSearch] = useState('');
  const [supportSort, setSupportSort] = useState<'recent' | 'oldest' | 'az'>('recent');
  const [viewSupport, setViewSupport] = useState<SupportFormResponse | null>(null);

  // ── Estado local dos apoiadores (Supabase) ────────────────────────────────
  const [loadingSupports, setLoadingSupports] = useState(false);
  const [errorSupports, setErrorSupports] = useState<string | null>(null);

  // ── Modal de e-mail simulado ──────────────────────────────────────────────
  const [activeFicha, setActiveFicha] = useState<any | null>(null);
  const [fichaType, setFichaType] = useState<'interesse' | 'apoiar' | 'contato' | null>(null);
  const [simDocMail, setSimDocMail] = useState<string>('');
  const [simMailOpen, setSimMailOpen] = useState(false);

  // ── Modal de ficha de matrícula ───────────────────────────────────────────
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [enrollSource, setEnrollSource] = useState<InterestView | null>(null);
  const [enrollForm, setEnrollForm] = useState<StudentEnrollmentForm | null>(null);
  const [enrollSaving, setEnrollSaving] = useState(false);
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);

  const filteredSupports = useMemo(() => {
    let list = [...supports];
    if (supportSearch.trim()) {
      const q = supportSearch.toLowerCase();
      list = list.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.company?.toLowerCase().includes(q) ||
        s.supportType?.toLowerCase().includes(q)
      );
    }
    if (supportSort === 'recent') list.sort((a, b) => ((b as any).rawDate || '').localeCompare((a as any).rawDate || ''));
    else if (supportSort === 'oldest') list.sort((a, b) => ((a as any).rawDate || '').localeCompare((b as any).rawDate || ''));
    else list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return list;
  }, [supports, supportSearch, supportSort]);

  const filteredInterests = useMemo(() => {
    let list = [...interests];
    if (interestSearch.trim()) {
      const q = interestSearch.toLowerCase();
      list = list.filter(i =>
        i.name?.toLowerCase().includes(q) ||
        i.email?.toLowerCase().includes(q) ||
        i.instrumentOfInterest?.toLowerCase().includes(q)
      );
    }
    if (interestSort === 'recent') list.sort((a, b) => (b.rawDate || '').localeCompare(a.rawDate || ''));
    else if (interestSort === 'oldest') list.sort((a, b) => (a.rawDate || '').localeCompare(b.rawDate || ''));
    else list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return list;
  }, [interests, interestSearch, interestSort]);

  // ── GET interessados ──────────────────────────────────────────────────────
  useEffect(() => {
    if (subTab !== 'interesse') return;
    const cached = dataCache.get<InterestView[]>('interessados');
    if (cached) { setInterests(cached); setLoadingInterests(false); return; }
    setLoadingInterests(true);
    setErrorInterests(null);

    getInteressados()
      .then((data) => {
        const mapped = data.map(toInterestView);
        dataCache.set('interessados', mapped);
        setInterests(mapped);
      })
      .catch((err) => setErrorInterests('Erro ao carregar interessados: ' + err.message))
      .finally(() => setLoadingInterests(false));
  }, [subTab]);

  useEffect(() => {
    if (!loadingInterests && interests.length > 0) dataCache.set('interessados', interests);
  }, [interests, loadingInterests]);

  // ── GET apoiadores da tabela quero_apoiar ─────────────────────────────────
  useEffect(() => {
    if (subTab !== 'apoiar') return;
    const cached = dataCache.get<SupportFormResponse[]>('quero_apoiar');
    // Ignora cache com IDs mockados (não-uuid)
    if (cached && cached.length > 0 && /^[0-9a-f-]{36}$/i.test(cached[0].id)) {
      setSupports(cached); setLoadingSupports(false); return;
    }
    setLoadingSupports(true);
    setErrorSupports(null);

    getApoiadores()
      .then((data) => {
        const mapped = data.map(toSupportView);
        dataCache.set('quero_apoiar', mapped);
        setSupports(mapped);
      })
      .catch((err) => setErrorSupports('Erro ao carregar apoiadores: ' + err.message))
      .finally(() => setLoadingSupports(false));
  }, [subTab]);

  useEffect(() => {
    // Só grava no cache após fetch do Supabase (IDs reais começam com padrão uuid)
    const hasRealIds = supports.length > 0 && /^[0-9a-f-]{36}$/i.test(supports[0].id);
    if (!loadingSupports && hasRealIds) dataCache.set('quero_apoiar', supports);
  }, [supports, loadingSupports]);

  // ── ABRE FICHA DE MATRÍCULA ───────────────────────────────────────────────
  const handleOpenEnrollModal = (item: InterestView) => {
    const exists = students.some((s) => s.email === item.email);
    if (exists) {
      alert('Este e-mail já corresponde a uma matrícula ativa!');
      return;
    }

    setPendingPhotoFile(null);
    setEnrollSource(item);
    setEnrollForm({
      photo: '',
      name: item.name || '',
      birthDate: item.age > 0 ? `${2026 - item.age}-01-01` : '',
      instrument: item.instrumentOfInterest || '',
      classroom: 'Iniciante',
      phone: item.phone || '',
      email: item.email || '',
      guardian: item.age > 0 && item.age < 18 ? 'Responsável Declarado no Fale Conosco' : '',
      address: '',
      status: 'ativo',
    });
    setEnrollModalOpen(true);
  };

  // ── CONFIRMA MATRÍCULA ────────────────────────────────────────────────────
  const handleConfirmEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollForm || !enrollSource) return;

    setEnrollSaving(true);

    try {
      let finalPhoto = enrollForm.photo;

      if (pendingPhotoFile) {
        finalPhoto = await uploadFileToSupabase(pendingPhotoFile, 'students');
      }

      const newStudent = await createStudent({ ...enrollForm, photo: finalPhoto });
      setStudents((prev) => [...prev, newStudent]);

      await updateInteressado(enrollSource.id, { status: 'convertido' });
      setInterests((prev) =>
        prev.map((i) => (i.id === enrollSource.id ? { ...i, status: 'convertido' } : i))
      );

      addAuditLog(
        'Converteu Interessado em Aluno',
        'Relacionamento',
        `Candidato ${newStudent.name} promovido para aluno regular do naipe de ${newStudent.instrument}`
      );

      alert(`Sucesso! Ficha de ${newStudent.name} convertida. Matrícula criada.`);

      setEnrollModalOpen(false);
      setEnrollForm(null);
      setEnrollSource(null);
      setPendingPhotoFile(null);
    } catch (err: any) {
      console.error(err);
      alert('Erro ao processar matrícula: ' + err.message);
    } finally {
      setEnrollSaving(false);
    }
  };

  // ── CONVERSÃO: apoiador proposta → apoiador oficial ───────────────────────
  const handlePromoToSupporter = async (item: SupportFormResponse) => {
    const exists = supporters.some((s) => s.name === item.name);
    if (exists) {
      alert('Este parceiro já está ativo no quadro oficial!');
      return;
    }

    try {
      await updateApoiadorStatus(item.id, 'aprovado');

      const newSupporter: Supporter = {
        id: `sup-${Date.now()}`,
        logo: 'https://images.unsplash.com/photo-1599305445671-ac2c68ad383b?auto=format&fit=crop&w=150&h=80&q=80',
        name: item.company || item.name,
        siteUrl: 'https://example.com',
        description: item.message,
        category: 'Incentivo Cultural',
        sponsorshipLevel: 'silver',
        highlightedOnHome: true,
      };

      setSupporters((prev) => [...prev, newSupporter]);
      setSupports((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, status: 'aprovado' } : s))
      );
      addAuditLog(
        'Converteu Apoiador',
        'Relacionamento',
        `Proposta de ${item.name} convertida para quadro oficial de patrocinadores`
      );
      alert(`${item.company || item.name} promovido para patrocinador Prata!`);
    } catch (err: any) {
      alert('Erro ao promover apoiador: ' + err.message);
    }
  };

  // ── ARQUIVAR interessado ──────────────────────────────────────────────────
  const handleArchiveInterest = async (id: string, name: string) => {
    try {
      await updateInteressado(id, { status: 'arquivado' });
      setInterests((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: 'arquivado' } : i))
      );
      addAuditLog('Arquivou Ficha de Interesse', 'Relacionamento', `Arquivou inscrição de: ${name}`);
    } catch (err: any) {
      alert('Erro ao arquivar: ' + err.message);
    }
  };

  const handleUnarchiveInterest = async (id: string, name: string) => {
    try {
      await updateInteressado(id, { status: 'novo' });
      setInterests((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: 'novo' } : i))
      );
      addAuditLog('Desarquivou Ficha de Interesse', 'Relacionamento', `Desarquivou inscrição de: ${name}`);
    } catch (err: any) {
      alert('Erro ao desarquivar: ' + err.message);
    }
  };

  // ── DELETE interessado ────────────────────────────────────────────────────
  const handleDeleteInterest = async (id: string, name: string) => {
    if (!confirm(`Excluir permanentemente a ficha de ${name}? Esta ação não pode ser desfeita.`)) return;
    try {
      await deleteInteressado(id);
      setInterests((prev) => prev.filter((i) => i.id !== id));
      addAuditLog('Deletou Interessado', 'Relacionamento', `Excluiu registro de: ${name}`);
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  // ── ARQUIVAR apoiador (persiste no Supabase) ──────────────────────────────
  const handleArchiveSupport = async (id: string, name: string) => {
    try {
      await updateApoiadorStatus(id, 'arquivado');

      setSupports((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'arquivado' } : s)));
      addAuditLog('Arquivou Proposta Apoio', 'Relacionamento', `Arquivou proposta de: ${name}`);
    } catch (err: any) {
      alert('Erro ao arquivar: ' + err.message);
    }
  };

  const handleUnarchiveSupport = async (id: string, name: string) => {
    try {
      await updateApoiadorStatus(id, 'pendente');

      setSupports((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'pendente' } : s)));
      addAuditLog('Desarquivou Proposta Apoio', 'Relacionamento', `Desarquivou proposta de: ${name}`);
    } catch (err: any) {
      alert('Erro ao desarquivar: ' + err.message);
    }
  };

  // ── Marcar como "contactado" (visual local) ───────────────────────────────
  const handleMarkContacted = (id: string) => {
    setInterests((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: i.status === 'novo' ? 'contacted' as any : i.status } : i))
    );
  };

  // ── Contatos gerais ───────────────────────────────────────────────────────
  const handleStatusContact = (
    id: string,
    status: 'unread' | 'replied' | 'resolved' | 'archived',
    actionName: string
  ) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    addAuditLog('Alterou Ouvidoria', 'Relacionamento', `${actionName} mensagem ID: ${id}`);
  };

  const handleDeleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    addAuditLog('Deletou Contato', 'Relacionamento', `Excluiu mensagem ID: ${id}`);
  };

  const handleOpenSimMail = (email: string, type: any, item: any) => {
    setSimDocMail(email);
    setActiveFicha(item);
    setFichaType(type);
    setSimMailOpen(true);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-6 animate-fade-in select-none">

      {/* Cabeçalho */}
      <div className="pb-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-[#001856] tracking-tight flex items-center">
            <HeartHandshake className="mr-2 text-[#ffc300]" size={20} />
            Relacionamento
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Respostas obtidas através dos formulários do site.
          </p>
        </div>

      </div>

      {/* ================================================================
          SUBTAB 1 — INTERESSADOS
          ================================================================ */}
      {subTab === 'interesse' && (
        <div className="space-y-4">

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={interestSearch}
                onChange={e => setInterestSearch(e.target.value)}
                placeholder="Buscar por nome, e-mail ou instrumento..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-[#001856] focus:outline-none focus:border-[#ffc300] focus:ring-1 focus:ring-[#ffc300]/30 placeholder:text-gray-400"
              />
            </div>
            <div className="relative">
              <SortAsc size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={interestSort}
                onChange={e => setInterestSort(e.target.value as any)}
                className="pl-9 pr-8 py-2 text-sm bg-white border border-gray-200 rounded-lg text-[#001856] focus:outline-none focus:border-[#ffc300] focus:ring-1 focus:ring-[#ffc300]/30 cursor-pointer"
              >
                <option value="recent">Mais recentes</option>
                <option value="oldest">Mais antigos</option>
                <option value="az">A–Z</option>
              </select>
            </div>
          </div>

          {loadingInterests && (
            <InlineLoader message="Carregando interessados..." />
          )}
          {errorInterests && (
            <p className="text-red-400 text-sm text-center py-8">{errorInterests}</p>
          )}
          {!loadingInterests && !errorInterests && filteredInterests.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">Nenhum interessado encontrado.</p>
          )}

          {!loadingInterests && filteredInterests.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
              <table className="text-sm" style={{ minWidth: '700px', width: '100%' }}>
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400" style={{ width: '160px', maxWidth: '160px' }}>Nome</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400" style={{ minWidth: '190px' }}>E-mail</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400" style={{ minWidth: '150px' }}>Telefone</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400" style={{ minWidth: '120px' }}>Instrumento</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400" style={{ minWidth: '100px' }}>Data</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400" style={{ minWidth: '90px' }}>Status</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right bg-white sticky right-0 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)]" style={{ minWidth: '160px' }}>Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInterests.map((inter) => (
                    <tr key={inter.id} onClick={() => setViewInterest(inter)} className={`hover:bg-gray-50 transition-colors cursor-pointer ${inter.status === 'arquivado' ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3" style={{ width: '160px', maxWidth: '160px' }}>
                        <p className="font-semibold text-[#001856] text-xs truncate" title={inter.name}>{inter.name}</p>
                        {inter.message && <p className="text-[10px] text-gray-400 truncate mt-0.5">{inter.message}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500 flex items-center gap-1"><Mail size={10} className="text-amber-500 shrink-0" />{inter.email}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-600 flex items-center gap-1.5 whitespace-nowrap"><Phone size={11} className="text-[#001856] shrink-0" />{inter.phone}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-[#ffc300] bg-amber-50 px-2 py-0.5 rounded whitespace-nowrap">{inter.instrumentOfInterest}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-400 font-mono whitespace-nowrap">{inter.date}</span>
                      </td>
                      <td className="px-4 py-3">
                        {inter.status === 'convertido' && <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full whitespace-nowrap">Convertido</span>}
                        {inter.status === 'contacted' && <span className="text-[10px] font-bold bg-sky-50 text-sky-600 border border-sky-200 px-2 py-0.5 rounded-full whitespace-nowrap">Contactado</span>}
                        {inter.status === 'novo' && <span className="text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full whitespace-nowrap">Novo</span>}
                        {inter.status === 'arquivado' && <span className="text-[10px] font-bold bg-gray-100 text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full whitespace-nowrap">Arquivado</span>}
                      </td>
                      <td className="px-4 py-3 bg-white sticky right-0 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)]" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {inter.status !== 'convertido' && inter.status !== 'arquivado' && (
                            <button
                              type="button"
                              onClick={() => handleOpenEnrollModal(inter)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-[#ffc300] hover:bg-yellow-400 text-[#001856] rounded-lg text-[10px] font-bold cursor-pointer transition-colors whitespace-nowrap"
                              title="Converter em Aluno"
                            >
                              <UserPlus size={11} /> Converter
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setViewInterest(inter)}
                            className="p-1.5 bg-gray-100 hover:bg-[#001856]/10 text-[#001856] rounded-lg border border-gray-200 cursor-pointer transition-colors"
                            title="Visualizar"
                          >
                            <Eye size={12} />
                          </button>
                          {inter.status !== 'arquivado' && (
                            <button
                              type="button"
                              onClick={() => handleArchiveInterest(inter.id, inter.name)}
                              className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-400 rounded-lg border border-gray-200 cursor-pointer transition-colors"
                              title="Arquivar"
                            >
                              <Archive size={12} />
                            </button>
                          )}
                          {inter.status === 'arquivado' && (
                            <button
                              type="button"
                              onClick={() => handleUnarchiveInterest(inter.id, inter.name)}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-500 rounded-lg border border-amber-200 cursor-pointer transition-colors"
                              title="Desarquivar"
                            >
                              <ArchiveRestore size={12} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteInterest(inter.id, inter.name)}
                            className="p-1.5 bg-gray-100 hover:bg-rose-50 text-rose-500 rounded-lg border border-gray-200 cursor-pointer transition-colors"
                            title="Excluir permanentemente"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: visualizar interesse */}
      {viewInterest && (
        <>
          <style>{`
            @keyframes fadeInScale { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
          `}</style>
          <div
            className="fixed top-0 left-0 w-screen h-screen z-40 bg-black/60"
            onClick={() => setViewInterest(null)}
          />
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ animation: 'fadeInScale 0.18s cubic-bezier(0.22, 1, 0.36, 1) both' }}
          >
            {/* Header */}
            <div className="flex items-start gap-3 px-6 py-5 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-[#001856] flex items-center justify-center shrink-0">
                <BookOpen size={16} className="text-[#ffc300]" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-[#001856] leading-tight">{viewInterest.name}</h2>
                <p className="text-xs text-gray-400 mt-0.5">Ficha de interesse — {viewInterest.date}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewInterest(null)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Status badge */}
              <div className="flex items-center gap-2">
                {viewInterest.status === 'convertido' && <span className="text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full">Convertido em Aluno</span>}
                {viewInterest.status === 'contacted' && <span className="text-xs font-bold bg-sky-50 text-sky-600 border border-sky-200 px-3 py-1 rounded-full">Contactado</span>}
                {viewInterest.status === 'novo' && <span className="text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1 rounded-full">Novo</span>}
                {viewInterest.status === 'arquivado' && <span className="text-xs font-bold bg-gray-100 text-gray-400 border border-gray-200 px-3 py-1 rounded-full">Arquivado</span>}
                <span className="text-xs font-semibold text-[#ffc300] bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">{viewInterest.instrumentOfInterest}</span>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">E-mail</p>
                  <p className="text-sm text-[#001856] font-medium flex items-center gap-1.5"><Mail size={12} className="text-amber-500 shrink-0" />{viewInterest.email}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Telefone</p>
                  <p className="text-sm text-[#001856] font-medium flex items-center gap-1.5"><Phone size={12} className="text-[#001856] shrink-0" />{viewInterest.phone}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Data de envio</p>
                  <p className="text-sm text-[#001856] font-medium flex items-center gap-1.5"><Calendar size={12} className="text-[#001856] shrink-0" />{viewInterest.date}</p>
                </div>
                {viewInterest.age > 0 && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Idade</p>
                    <p className="text-sm text-[#001856] font-medium">{viewInterest.age} anos</p>
                  </div>
                )}
              </div>

              {/* Mensagem */}
              {viewInterest.message && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Mensagem</p>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">"{viewInterest.message}"</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setViewInterest(null)}
                className="px-5 py-2.5 text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Fechar
              </button>
              {viewInterest.status !== 'convertido' && viewInterest.status !== 'arquivado' && (
                <button
                  type="button"
                  onClick={() => { handleOpenEnrollModal(viewInterest); setViewInterest(null); }}
                  className="px-5 py-2.5 text-sm font-bold bg-[#ffc300] hover:bg-yellow-400 text-[#001856] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus size={14} /> Converter em Aluno
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ================================================================
          SUBTAB 2 — APOIADORES (dados reais do Supabase / quero_apoiar)
          ================================================================ */}
      {subTab === 'apoiar' && (
        <div className="space-y-4">

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={supportSearch}
                onChange={e => setSupportSearch(e.target.value)}
                placeholder="Buscar por nome, e-mail, empresa ou tipo..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-[#001856] focus:outline-none focus:border-[#ffc300] focus:ring-1 focus:ring-[#ffc300]/30 placeholder:text-gray-400"
              />
            </div>
            <div className="relative">
              <SortAsc size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={supportSort}
                onChange={e => setSupportSort(e.target.value as any)}
                className="pl-9 pr-8 py-2 text-sm bg-white border border-gray-200 rounded-lg text-[#001856] focus:outline-none focus:border-[#ffc300] focus:ring-1 focus:ring-[#ffc300]/30 cursor-pointer"
              >
                <option value="recent">Mais recentes</option>
                <option value="oldest">Mais antigos</option>
                <option value="az">A–Z</option>
              </select>
            </div>
          </div>

          {loadingSupports && <InlineLoader message="Carregando apoiadores..." />}
          {errorSupports && <p className="text-red-400 text-sm text-center py-8">{errorSupports}</p>}
          {!loadingSupports && !errorSupports && filteredSupports.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">Nenhuma proposta de apoio encontrada.</p>
          )}

          {!loadingSupports && filteredSupports.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="md:overflow-x-visible overflow-x-auto">
                <table className="text-sm w-full table-fixed md:table-auto" style={{ minWidth: '700px' }}>
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 w-[15%]">Nome</th>
                      <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 w-[13%]">Empresa</th>
                      <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 w-[20%]">E-mail</th>
                      <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 w-[13%]">Telefone</th>
                      <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 w-[12%]">Tipo de apoio</th>
                      <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 w-[9%]">Data</th>
                      <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 w-[9%]">Status</th>
                      <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right w-[9%]">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredSupports.map((sup) => (
                      <tr
                        key={sup.id}
                        onClick={() => setViewSupport(sup)}
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${sup.status === 'arquivado' ? 'opacity-50' : ''}`}
                      >
                        <td className="px-3 py-3 max-w-0">
                          <p className="font-semibold text-[#001856] text-xs truncate" title={sup.name}>{sup.name}</p>
                          {sup.message && <p className="text-[10px] text-gray-400 truncate mt-0.5">{sup.message}</p>}
                        </td>
                        <td className="px-3 py-3 max-w-0">
                          <span className="text-xs text-gray-600 truncate block">{sup.company || '—'}</span>
                        </td>
                        <td className="px-3 py-3 max-w-0">
                          <span className="text-xs text-gray-500 flex items-center gap-1 min-w-0"><Mail size={10} className="text-amber-500 shrink-0" /><span className="truncate">{sup.email}</span></span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-xs text-gray-600 flex items-center gap-1 whitespace-nowrap"><Phone size={11} className="text-[#001856] shrink-0" />{sup.phone}</span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-[10px] font-semibold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded whitespace-nowrap">{sup.supportType}</span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-xs text-gray-400 font-mono whitespace-nowrap">{sup.date}</span>
                        </td>
                        <td className="px-3 py-3">
                          {sup.status === 'aprovado' && <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">Aprovado</span>}
                          {sup.status === 'pendente' && <span className="text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">Pendente</span>}
                          {sup.status === 'arquivado' && <span className="text-[10px] font-bold bg-gray-100 text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">Arquivado</span>}
                          {sup.status === 'contacted' && <span className="text-[10px] font-bold bg-sky-50 text-sky-600 border border-sky-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">Contactado</span>}
                        </td>
                        <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {sup.status !== 'aprovado' && sup.status !== 'arquivado' && (
                              <button
                                type="button"
                                onClick={() => handlePromoToSupporter(sup)}
                                className="flex items-center gap-1 p-1.5 xl:px-2.5 xl:py-1.5 bg-[#ffc300] hover:bg-yellow-400 text-[#001856] rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                                title="Tornar Oficial"
                              >
                                <UserCheck size={11} /><span className="hidden xl:inline whitespace-nowrap">Oficial</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setViewSupport(sup)}
                              className="p-1.5 bg-gray-100 hover:bg-[#001856]/10 text-[#001856] rounded-lg border border-gray-200 cursor-pointer transition-colors"
                              title="Visualizar"
                            >
                              <Eye size={12} />
                            </button>
                            {sup.status !== 'arquivado' && (
                              <button
                                type="button"
                                onClick={() => handleArchiveSupport(sup.id, sup.name)}
                                className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-400 rounded-lg border border-gray-200 cursor-pointer transition-colors"
                                title="Arquivar"
                              >
                                <Archive size={12} />
                              </button>
                            )}
                            {sup.status === 'arquivado' && (
                              <button
                                type="button"
                                onClick={() => handleUnarchiveSupport(sup.id, sup.name)}
                                className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-500 rounded-lg border border-amber-200 cursor-pointer transition-colors"
                                title="Desarquivar"
                              >
                                <ArchiveRestore size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: visualizar apoiador */}
      {viewSupport && (
        <>
          <div className="fixed top-0 left-0 w-screen h-screen z-40 bg-black/60" onClick={() => setViewSupport(null)} />
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ animation: 'fadeInScale 0.18s cubic-bezier(0.22, 1, 0.36, 1) both' }}
          >
            <div className="flex items-start gap-3 px-6 py-5 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-[#001856] flex items-center justify-center shrink-0">
                <HeartHandshake size={16} className="text-[#ffc300]" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-[#001856] leading-tight">{viewSupport.name}</h2>
                <p className="text-xs text-gray-400 mt-0.5">Proposta de apoio — {viewSupport.date}</p>
              </div>
              <button type="button" onClick={() => setViewSupport(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer shrink-0">
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                {viewSupport.status === 'aprovado' && <span className="text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full">Apoiador Aprovado</span>}
                {viewSupport.status === 'pendente' && <span className="text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1 rounded-full">Pendente</span>}
                {viewSupport.status === 'contacted' && <span className="text-xs font-bold bg-sky-50 text-sky-600 border border-sky-200 px-3 py-1 rounded-full">Contactado</span>}
                {viewSupport.status === 'arquivado' && <span className="text-xs font-bold bg-gray-100 text-gray-400 border border-gray-200 px-3 py-1 rounded-full">Arquivado</span>}
                <span className="text-xs font-semibold text-sky-600 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full">{viewSupport.supportType}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {viewSupport.company && (
                  <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Empresa</p>
                    <p className="text-sm text-[#001856] font-medium">{viewSupport.company}</p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">E-mail</p>
                  <p className="text-sm text-[#001856] font-medium flex items-center gap-1.5"><Mail size={12} className="text-amber-500 shrink-0" />{viewSupport.email}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Telefone</p>
                  <p className="text-sm text-[#001856] font-medium flex items-center gap-1.5"><Phone size={12} className="text-[#001856] shrink-0" />{viewSupport.phone}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Data de envio</p>
                  <p className="text-sm text-[#001856] font-medium flex items-center gap-1.5"><Calendar size={12} className="text-[#001856] shrink-0" />{viewSupport.date}</p>
                </div>
              </div>

              {viewSupport.message && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Mensagem</p>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">"{viewSupport.message}"</p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
              <button type="button" onClick={() => setViewSupport(null)} className="px-5 py-2.5 text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
                Fechar
              </button>
              {viewSupport.status !== 'aprovado' && viewSupport.status !== 'arquivado' && (
                <button
                  type="button"
                  onClick={() => { handlePromoToSupporter(viewSupport); setViewSupport(null); }}
                  className="px-5 py-2.5 text-sm font-bold bg-[#ffc300] hover:bg-yellow-400 text-[#001856] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <UserCheck size={14} /> Tornar Apoiador Oficial
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ================================================================
          SUBTAB 3 — CONTATOS GERAIS
          ================================================================ */}
      {subTab === 'contato' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 p-3 rounded-lg text-xs flex justify-between items-center text-gray-400 font-mono">
            <span>Caixa Geral de Entrada Fale Conosco</span>
            <span>{contacts.filter((c) => c.status === 'unread').length} mensagens não lidas</span>
          </div>

          <div className="space-y-4">
            {contacts.map((con) => (
              <div
                key={con.id}
                className={`p-4 rounded-xl border flex flex-col md:flex-row gap-4 justify-between items-start transition-all ${
                  con.status === 'resolved'
                    ? 'border-emerald-600/30 bg-emerald-950/10 opacity-70'
                    : con.status === 'unread'
                    ? 'border-amber-500/20 bg-amber-500/5'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2.5">
                    {con.status === 'unread' && (
                      <span className="bg-amber-500 text-black text-[9px] font-bold p-0.5 px-2 rounded-full font-mono">
                        NÃO LIDA
                      </span>
                    )}
                    <span className="text-[11px] text-gray-400 font-mono">{con.date}</span>
                    <span className="text-gray-400 text-xs font-bold">{con.subject}</span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-[#001856]">{con.name}</h4>
                    <p className="text-[11px] text-gray-400 mt-1 line-clamp-3">"{con.message}"</p>
                  </div>

                  <div className="flex gap-4 text-[10px] font-mono text-gray-400">
                    <span>Email: {con.email}</span>
                    <span>•</span>
                    <span>Cel: {con.phone}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                  {con.status !== 'resolved' ? (
                    <button
                      type="button"
                      onClick={() => handleStatusContact(con.id, 'resolved', 'Marcou resolvido')}
                      className="p-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 hover:text-[#001856] rounded text-xs font-semibold cursor-pointer text-center"
                    >
                      Marcar Resolvido / Respondido
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 font-bold flex items-center p-1 px-3">
                      <Check size={12} className="mr-1" /> Resolvida no CRM
                    </span>
                  )}

                  <div className="flex space-x-1">
                    <button
                      type="button"
                      onClick={() => {
                        handleStatusContact(con.id, 'replied', 'Enviou e-mail simulado');
                        handleOpenSimMail(con.email, 'contato', con);
                      }}
                      className="p-1 px-3 bg-gray-100 hover:bg-gray-200 text-amber-500 text-[10px] rounded border border-gray-200 flex-1 text-center cursor-pointer"
                    >
                      Enviar E-mail Solução
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteContact(con.id)}
                      className="p-1 px-2.5 bg-gray-100 hover:bg-rose-950 text-rose-500 rounded border border-gray-200 transition-all cursor-pointer"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================
          MODAL: FICHA DE MATRÍCULA
          ================================================================ */}
      {enrollModalOpen && enrollForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fade-in">
          <form
            onSubmit={handleConfirmEnroll}
            className="w-full max-w-2xl bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 flex items-center">
                <GraduationCap size={14} className="mr-2" />
                Pré Cadastro Aluno
              </h3>
              <button
                type="button"
                onClick={() => setEnrollModalOpen(false)}
                className="text-gray-400 hover:text-[#001856]"
              >
                Fechar
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={enrollForm.name}
                    onChange={(e) => setEnrollForm({ ...enrollForm, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 p-2 text-xs rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={enrollForm.birthDate || ''}
                    onChange={(e) => setEnrollForm({ ...enrollForm, birthDate: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 p-2 text-xs rounded font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    value={enrollForm.email}
                    onChange={(e) => setEnrollForm({ ...enrollForm, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 p-2 text-xs rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Telefone</label>
                  <input
                    type="text"
                    required
                    value={enrollForm.phone}
                    onChange={(e) => setEnrollForm({ ...enrollForm, phone: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 p-2 text-xs rounded font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Instrumento</label>
                  <select
                    required
                    value={enrollForm.instrument}
                    onChange={(e) => setEnrollForm({ ...enrollForm, instrument: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-400 p-2 text-xs rounded focus:outline-none"
                  >
                    <option value="">Selecione um instrumento</option>
                    <option value="trompete">Trompete</option>
                    <option value="trombone">Trombone</option>
                    <option value="trompa">Trompa</option>
                    <option value="bombardino">Bombardino</option>
                    <option value="tuba">Tuba</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Turma / Classe</label>
                  <input
                    type="text"
                    value={enrollForm.classroom || ''}
                    onChange={(e) => setEnrollForm({ ...enrollForm, classroom: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 p-2 text-xs rounded focus:outline-none"
                    placeholder="Ex: Iniciante"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Responsável (se menor de idade)</label>
                <input
                  type="text"
                  value={enrollForm.guardian || ''}
                  onChange={(e) => setEnrollForm({ ...enrollForm, guardian: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 p-2 text-xs rounded focus:outline-none"
                  placeholder="Nome do responsável legal"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Endereço</label>
                <textarea
                  value={enrollForm.address || ''}
                  onChange={(e) => setEnrollForm({ ...enrollForm, address: e.target.value })}
                  rows={2}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 p-2 text-xs rounded focus:outline-none focus:border-[#ffc300]"
                  placeholder="Endereço completo do aluno"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400">Foto do Aluno</label>
                {enrollForm.photo && (
                  <img
                    src={enrollForm.photo}
                    alt="Pré-visualização foto do aluno"
                    referrerPolicy="no-referrer"
                    className="w-24 h-24 object-cover rounded-full border border-gray-200"
                  />
                )}
                <ImageUploader
                  allowedTypes="Imagens (.jpg, .png, .webp)"
                  onFileSelected={(file, previewUrl) => {
                    setPendingPhotoFile(file);
                    setEnrollForm(prev => prev ? { ...prev, photo: previewUrl } : prev);
                  }}
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Status da Matrícula</label>
                <select
                  value={enrollForm.status || 'ativo'}
                  onChange={(e) => setEnrollForm({ ...enrollForm, status: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-400 p-2 text-xs rounded focus:outline-none"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="trancado">Trancado</option>
                </select>
              </div>
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEnrollModalOpen(false)}
                className="p-1.5 px-4 bg-white text-xs rounded hover:bg-gray-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={enrollSaving}
                className="p-1.5 px-6 bg-[#001856] text-xs font-semibold text-white rounded hover:bg-blue-750 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {enrollSaving ? 'Matriculando...' : 'Confirmar Matrícula'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================================================================
          MODAL E-MAIL SIMULADO
          ================================================================ */}
      {simMailOpen && activeFicha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-amber-500 flex items-center">
                <Send size={13} className="mr-2" />
                SIMU EMAIL CLIENT API ENGINE
              </span>
              <button onClick={() => setSimMailOpen(false)} className="text-gray-400">
                <X size={15} />
              </button>
            </div>

            <div className="p-4 space-y-3.5">
              <div className="grid grid-cols-6 items-center gap-2 text-xs">
                <span className="col-span-1 text-gray-400 font-mono">Para:</span>
                <input
                  type="text"
                  value={simDocMail}
                  onChange={(e) => setSimDocMail(e.target.value)}
                  className="col-span-5 bg-gray-50 border border-gray-200 p-1.5 px-2 rounded text-xs text-gray-800"
                />
              </div>

              <div className="grid grid-cols-6 items-center gap-2 text-xs">
                <span className="col-span-1 text-gray-400 font-mono">Assunto:</span>
                <input
                  type="text"
                  defaultValue={`Retorno Filarmônica Aliança do Ouro - Olá ${activeFicha.name}`}
                  className="col-span-5 bg-gray-50 border border-gray-200 p-1.5 px-2 rounded text-[11.5px] text-gray-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Corpo do E-mail</label>
                <textarea
                  rows={4}
                  defaultValue={`Prezado(a) ${activeFicha.name},\n\nAgradecemos imensamente o seu contato enviado em ${activeFicha.date || ''}.\n\nNossa coordenação já analisou sua proposta e entraremos em contato via WhatsApp em breve.\n\nAtenciosamente,\nSecretaria Acadêmica Aliança do Ouro.`}
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded text-xs text-gray-800 leading-relaxed font-sans"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-3.5 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => setSimMailOpen(false)}
                className="text-xs text-gray-400 px-4 py-1.5 bg-white rounded"
              >
                Voltar
              </button>
              <button
                onClick={() => {
                  alert(`E-mail disparado via SMTP com sucesso para: ${simDocMail}`);
                  setSimMailOpen(false);
                }}
                className="text-xs text-white px-6 py-1.5 bg-[#001856] rounded font-bold uppercase tracking-wider flex items-center cursor-pointer"
              >
                Disparar E-mail <Send size={12} className="ml-1.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
