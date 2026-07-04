/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  HeartHandshake, BookOpen, HelpCircle, Check, Archive, Trash2, Mail, Phone,
  UserPlus, UserCheck, MessageSquare, ExternalLink, Calendar, CheckCircle2,
  Play, Send, Share2, Eye, X, GraduationCap
} from 'lucide-react';
import {
  getInteressados,
  updateInteressado,
  deleteInteressado,
  Interessado,
} from '../../services/interessadosService';
import { SupportFormResponse, ContactMessage, Student, Supporter } from '../../validations/types';
import { ImageUploader, uploadFileToSupabase } from './MiniWidgets';
import { supabase } from '../../../lib/supabase';

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
    status: i.status ?? 'novo',
  };
}

type InterestView = ReturnType<typeof toInterestView>;

// ── Mapper: tabela quero_apoiar -> SupportFormResponse ────────────────────────
function toSupportView(row: any): SupportFormResponse {
  return {
    id: row.id ?? '',
    name: row.name,
    company: row.company ?? '',
    email: row.email,
    phone: row.phone,
    supportType: row.support_type,
    message: row.message ?? '',
    date: row.date ? new Date(row.date).toLocaleDateString('pt-BR') : '',
    status: row.status ?? 'pendente',
  };
}

// ── Mapper: ficha de matrícula (camelCase) -> tabela `alunos` (snake_case) ────
const mapStudentFormToDb = (f: Partial<StudentEnrollmentForm>) => ({
  photo: f.photo || null,
  name: f.name,
  birth_date: f.birthDate || null,
  instrument: f.instrument,
  classroom: f.classroom || null,
  phone: f.phone,
  email: f.email,
  guardian: f.guardian || null,
  address: f.address || null,
  status: f.status || 'ativo',
});

const mapStudentFromDb = (row: any): Student => ({
  id: row.id,
  name: row.name,
  birthDate: row.birth_date,
  instrument: row.instrument,
  classroom: row.classroom,
  phone: row.phone,
  email: row.email,
  guardian: row.guardian,
  address: row.address,
  photo: row.photo,
  status: row.status,
});

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

  // ── GET interessados ──────────────────────────────────────────────────────
  useEffect(() => {
    if (subTab !== 'interesse') return;
    setLoadingInterests(true);
    setErrorInterests(null);

    getInteressados()
      .then((data) => setInterests(data.map(toInterestView)))
      .catch((err) => setErrorInterests('Erro ao carregar interessados: ' + err.message))
      .finally(() => setLoadingInterests(false));
  }, [subTab]);

  // ── GET apoiadores da tabela quero_apoiar ─────────────────────────────────
  useEffect(() => {
    if (subTab !== 'apoiar') return;
    setLoadingSupports(true);
    setErrorSupports(null);

    supabase
      .from('quero_apoiar')
      .select('*')
      .order('date', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setErrorSupports('Erro ao carregar apoiadores: ' + error.message);
        } else {
          setSupports((data ?? []).map(toSupportView));
        }
      })
      .finally(() => setLoadingSupports(false));
  }, [subTab]);

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

      const payload = mapStudentFormToDb({ ...enrollForm, photo: finalPhoto });

      const { data, error } = await supabase
        .from('students')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error(error);
        alert('Erro ao matricular aluno: ' + error.message);
        return;
      }

      const newStudent = mapStudentFromDb(data);
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
      const { error } = await supabase
        .from('quero_apoiar')
        .update({ status: 'aprovado', updated_at: new Date().toISOString() })
        .eq('id', item.id);

      if (error) throw error;

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
      const { error } = await supabase
        .from('quero_apoiar')
        .update({ status: 'arquivado', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setSupports((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'arquivado' } : s)));
      addAuditLog('Arquivou Proposta Apoio', 'Relacionamento', `Arquivou proposta de: ${name}`);
    } catch (err: any) {
      alert('Erro ao arquivar: ' + err.message);
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
            Central de Atendimento & Ouvidoria (CRM)
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Responda formulários do site público e converta interessados diretamente no ERP em 1 clique.
          </p>
        </div>

        <div className="flex bg-gray-100 border border-gray-200 p-0.5 rounded-lg text-xs">
          {(['interesse', 'apoiar'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSubTab(t)}
              className={`p-1.5 px-3 rounded-md font-semibold cursor-pointer transition-all ${
                subTab === t ? 'bg-[#001856] text-white shadow' : 'text-gray-400'
              }`}
            >
              {t === 'interesse' ? 'Tenho Interesse (Bolsas)' : t === 'apoiar' ? 'Quero Apoiar (Parcerias)' : 'Contatos Gerais (Inbox)'}
            </button>
          ))}
        </div>
      </div>

      {/* ================================================================
          SUBTAB 1 — INTERESSADOS
          ================================================================ */}
      {subTab === 'interesse' && (
        <div className="space-y-4">
          <div className="text-xs text-gray-400 italic p-3 bg-white border border-gray-200 rounded-lg">
            🚨 <strong>Painel Inteligente</strong>: Clique em <strong>"Converter em Aluno"</strong> para injetar o registro na lista acadêmica e gerar matrícula no ERP.
          </div>

          {loadingInterests && (
            <p className="text-gray-400 text-sm text-center py-8">Carregando interessados...</p>
          )}
          {errorInterests && (
            <p className="text-red-400 text-sm text-center py-8">{errorInterests}</p>
          )}
          {!loadingInterests && !errorInterests && interests.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">Nenhum interessado cadastrado ainda.</p>
          )}

          <div className="space-y-4">
            {interests.map((inter) => (
              <div
                key={inter.id}
                className={`p-4 rounded-xl border flex flex-col md:flex-row gap-4 justify-between items-start transition-all ${
                  inter.status === 'convertido'
                    ? 'border-emerald-600/30 bg-emerald-950/10'
                    : inter.status === 'arquivado'
                    ? 'border-gray-200 bg-gray-50 opacity-55'
                    : inter.status === 'contacted'
                    ? 'border-sky-600/30 bg-sky-950/10'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[#ffc300] font-mono text-xs font-bold bg-amber-500/10 p-0.5 px-2 rounded">
                      Instrumento: {inter.instrumentOfInterest}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">{inter.date}</span>
                    {inter.status === 'convertido' && (
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 p-0.5 px-2 rounded-full text-[9px] font-bold font-mono">
                        CONVERTIDO EM ALUNO
                      </span>
                    )}
                    {inter.status === 'contacted' && (
                      <span className="bg-sky-950 text-sky-400 border border-sky-800 p-0.5 px-2 rounded-full text-[9px] font-bold font-mono">
                        CONTACTADO
                      </span>
                    )}
                    {inter.status === 'novo' && (
                      <span className="bg-amber-500 text-black p-0.5 px-2 rounded-full text-[9px] font-bold font-mono">
                        NOVO
                      </span>
                    )}
                    {inter.status === 'arquivado' && (
                      <span className="bg-gray-100 text-gray-400 border border-gray-300 p-0.5 px-2 rounded-full text-[9px] font-bold font-mono">
                        ARQUIVADO
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-[#001856] flex items-center">
                      {inter.name}
                      {inter.age > 0 && (
                        <span className="text-gray-400 font-mono text-[10px] ml-1.5">• {inter.age} anos</span>
                      )}
                    </h4>
                    {inter.message && (
                      <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed bg-gray-50 p-3 rounded-lg font-serif">
                        "{inter.message}"
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-[10px] font-mono text-gray-400 pt-1">
                    <span className="flex items-center"><Mail size={10} className="mr-1 text-amber-500" /> {inter.email}</span>
                    <span className="flex items-center"><Phone size={10} className="mr-1 text-[#001856]" /> {inter.phone}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                  {inter.status !== 'convertido' && inter.status !== 'arquivado' && (
                    <button
                      type="button"
                      onClick={() => handleOpenEnrollModal(inter)}
                      className="p-2 px-3 bg-[#001856] hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer flex items-center justify-center tracking-wider shadow-lg"
                    >
                      <UserPlus size={13} className="mr-1.5" /> Converter em Aluno
                    </button>
                  )}

                  <div className="flex space-x-1.5">
             {      /* <button
                      type="button"
                      onClick={() => {
                        handleMarkContacted(inter.id);
                        handleOpenSimMail(inter.email, 'interesse', inter);
                      }}
                      className="p-1 px-3 bg-gray-100 hover:bg-neutral-750 text-[#ffc300] text-[10.5px] rounded border border-neutral-750 font-mono flex-1 text-center cursor-pointer"
                    >
                      Contatar Candidato
                    </button> */}

                    {inter.status !== 'arquivado' && inter.status !== 'convertido' && (
                      <button
                        type="button"
                        onClick={() => handleArchiveInterest(inter.id, inter.name)}
                        className="p-1 px-2.5 bg-gray-100 hover:bg-gray-200 text-gray-400 rounded border border-gray-200"
                        title="Arquivar"
                      >
                        <Archive size={11} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteInterest(inter.id, inter.name)}
                      className="p-1 px-2.5 bg-gray-100 hover:bg-rose-950 text-rose-500 rounded border border-gray-200 transition-all cursor-pointer"
                      title="Excluir permanentemente"
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
          SUBTAB 2 — APOIADORES (dados reais do Supabase / quero_apoiar)
          ================================================================ */}
      {subTab === 'apoiar' && (
        <div className="space-y-4">
          <div className="text-xs text-gray-400 italic p-3 bg-white border border-gray-200 rounded-lg">
            💸 <strong>Painel Patrocinador</strong>: Clique em <strong>"Tornar Apoiador Oficial"</strong> para incluir a logomarca no hall dos mecenas da Home.
          </div>

          {loadingSupports && (
            <p className="text-gray-400 text-sm text-center py-8">Carregando apoiadores...</p>
          )}
          {errorSupports && (
            <p className="text-red-400 text-sm text-center py-8">{errorSupports}</p>
          )}
          {!loadingSupports && !errorSupports && supports.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">Nenhuma proposta de apoio recebida ainda.</p>
          )}

          <div className="space-y-4">
            {supports.map((sup) => (
              <div
                key={sup.id}
                className={`p-4 rounded-xl border flex flex-col md:flex-row gap-4 justify-between items-start transition-all ${
                  sup.status === 'aprovado'
                    ? 'border-emerald-600/30 bg-emerald-950/10'
                    : sup.status === 'arquivado'
                    ? 'border-gray-200 bg-gray-50 opacity-55'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2.5 text-[10px] font-mono">
                    <span className="bg-[#001856]/10 text-sky-400 p-1 px-2 rounded-md font-bold uppercase tracking-wider text-[9px]">
                      Apoio: {sup.supportType}
                    </span>
                    <span className="text-gray-400">{sup.date}</span>
                    {sup.status === 'aprovado' && (
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 p-0.5 px-2 rounded-full font-bold">
                        APOIADOR APROVADO
                      </span>
                    )}
                    {sup.status === 'pendente' && (
                      <span className="bg-amber-500 text-black p-0.5 px-2 rounded-full text-[9px] font-bold">
                        PENDENTE
                      </span>
                    )}
                    {sup.status === 'arquivado' && (
                      <span className="bg-gray-100 text-gray-400 border border-gray-300 p-0.5 px-2 rounded-full text-[9px] font-bold">
                        ARQUIVADO
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-[#001856] flex items-center">
                      {sup.name}
                      {sup.company && <span className="text-amber-500 ml-1.5 font-sans">• {sup.company}</span>}
                    </h4>
                    {sup.message && (
                      <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed bg-gray-50 p-3 rounded-lg">
                        "{sup.message}"
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-[10px] font-mono text-gray-400">
                    <span className="flex items-center"><Mail size={10} className="mr-1 text-amber-500" /> {sup.email}</span>
                    <span className="flex items-center"><Phone size={10} className="mr-1 text-[#001856]" /> {sup.phone}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                  {sup.status !== 'aprovado' && sup.status !== 'arquivado' && (
                    <button
                      type="button"
                      onClick={() => handlePromoToSupporter(sup)}
                      className="p-2 px-3 bg-[#001856] hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer flex items-center justify-center tracking-wider"
                    >
                      <UserCheck size={13} className="mr-1.5" /> Tornar Apoiador Oficial
                    </button>
                  )}

                  <div className="flex space-x-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSupports((prev) =>
                          prev.map((s) => (s.id === sup.id ? { ...s, status: 'contacted' } : s))
                        );
                        handleOpenSimMail(sup.email, 'apoiar', sup);
                      }}
                      className="p-1 px-3 bg-gray-100 hover:bg-gray-200 text-[#ffc300] text-[10.5px] rounded border border-gray-200 font-mono flex-1 text-center cursor-pointer"
                    >
                      Enviar Negociação
                    </button>
                    {sup.status !== 'arquivado' && (
                      <button
                        type="button"
                        onClick={() => handleArchiveSupport(sup.id, sup.name)}
                        className="p-1 px-2.5 bg-gray-100 hover:bg-gray-200 text-gray-400 rounded border border-gray-200"
                        title="Arquivar"
                      >
                        <Archive size={11} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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
