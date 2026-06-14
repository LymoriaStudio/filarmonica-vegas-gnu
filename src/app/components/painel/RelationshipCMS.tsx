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
// Mapeia Interessado (snake_case) para o shape usado no JSX (camelCase)
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
}: RelationshipCMSProps) {
  const [subTab, setSubTab] = useState<'interesse' | 'apoiar' | 'contato'>('interesse');

  // ── Estado local dos interessados (vem do Supabase) ───────────────────────
  const [interests, setInterests] = useState<InterestView[]>([]);
  const [loadingInterests, setLoadingInterests] = useState(false);
  const [errorInterests, setErrorInterests] = useState<string | null>(null);

  // ── Modal de e-mail simulado ──────────────────────────────────────────────
  const [activeFicha, setActiveFicha] = useState<any | null>(null);
  const [fichaType, setFichaType] = useState<'interesse' | 'apoiar' | 'contato' | null>(null);
  const [simDocMail, setSimDocMail] = useState<string>('');
  const [simMailOpen, setSimMailOpen] = useState(false);

  // ── Modal de ficha de matrícula (interessado -> aluno) ────────────────────
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [enrollSource, setEnrollSource] = useState<InterestView | null>(null);
  const [enrollForm, setEnrollForm] = useState<StudentEnrollmentForm | null>(null);
  const [enrollSaving, setEnrollSaving] = useState(false);
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);

  // ── GET ao montar e ao trocar para a aba interesse ────────────────────────
  useEffect(() => {
    if (subTab !== 'interesse') return;
    setLoadingInterests(true);
    setErrorInterests(null);

    getInteressados()
      .then((data) => setInterests(data.map(toInterestView)))
      .catch((err) => setErrorInterests('Erro ao carregar interessados: ' + err.message))
      .finally(() => setLoadingInterests(false));
  }, [subTab]);

  // ── ABRE A FICHA DE MATRÍCULA pré-preenchida com dados do interessado ─────
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

  // ── CONFIRMA A FICHA: POST em `alunos` + PUT status do interessado ────────
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

      // Status válidos na constraint: 'novo' | 'convertido' | 'arquivado'
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
  const handlePromoToSupporter = (item: SupportFormResponse) => {
    const exists = supporters.some((s) => s.name === item.name);
    if (exists) {
      alert('Este parceiro já está ativo no quadro oficial!');
      return;
    }

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
      prev.map((s) => (s.id === item.id ? { ...s, status: 'approved' } : s))
    );
    addAuditLog(
      'Converteu Apoiador',
      'Relacionamento',
      `Proposta de ${item.name} convertida para quadro oficial de patrocinadores`
    );
    alert(`${item.company || item.name} promovido para patrocinador Prata!`);
  };

  // ── PUT: arquivar interessado ─────────────────────────────────────────────
  const handleArchiveInterest = async (id: string, name: string) => {
    try {
      // Status válidos na constraint: 'novo' | 'convertido' | 'arquivado'
      await updateInteressado(id, { status: 'arquivado' });
      setInterests((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: 'arquivado' } : i))
      );
      addAuditLog('Arquivou Ficha de Interesse', 'Relacionamento', `Arquivou inscrição de: ${name}`);
    } catch (err: any) {
      alert('Erro ao arquivar: ' + err.message);
    }
  };

  // ── DELETE: excluir interessado permanentemente ───────────────────────────
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

  // ── Marcar como "contactado" (apenas estado local, não persistido) ───────
  // A constraint `interessados_status_check` só permite 'novo' | 'convertido' | 'arquivado',
  // então "contactado" é tratado como um marcador visual local e não é salvo no banco.
  const handleMarkContacted = (id: string) => {
    setInterests((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: i.status === 'novo' ? 'contacted' as any : i.status } : i))
    );
  };

  // ── Apoio e contatos (lógica local inalterada) ────────────────────────────
  const handleArchiveSupport = (id: string, name: string) => {
    setSupports((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'archived' } : s)));
    addAuditLog('Arquivou Proposta Apoio', 'Relacionamento', `Arquivou proposta de: ${name}`);
  };

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
      <div className="pb-4 border-b border-neutral-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-neutral-100 tracking-tight flex items-center">
            <HeartHandshake className="mr-2 text-[#F2C94C]" size={20} />
            Central de Atendimento & Ouvidoria (CRM)
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Responda formulários do site público e converta interessados diretamente no ERP em 1 clique.
          </p>
        </div>

        <div className="flex bg-neutral-900 border border-neutral-800 p-0.5 rounded-lg text-xs">
          {(['interesse', 'apoiar', 'contato'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSubTab(t)}
              className={`p-1.5 px-3 rounded-md font-semibold cursor-pointer transition-all ${
                subTab === t ? 'bg-[#0B4DA2] text-white shadow' : 'text-neutral-400'
              }`}
            >
              {t === 'interesse' ? 'Tenho Interesse (Bolsas)' : t === 'apoiar' ? 'Quero Apoiar (Parcerias)' : 'Contatos Gerais (Inbox)'}
            </button>
          ))}
        </div>
      </div>

      {/* ================================================================
          SUBTAB 1 — INTERESSADOS (dados reais do Supabase)
          ================================================================ */}
      {subTab === 'interesse' && (
        <div className="space-y-4">
          <div className="text-xs text-neutral-400 italic p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
            🚨 <strong>Painel Inteligente</strong>: Clique em <strong>"Converter em Aluno"</strong> para injetar o registro na lista acadêmica e gerar matrícula no ERP.
          </div>

          {/* Estados de carregamento / erro */}
          {loadingInterests && (
            <p className="text-neutral-400 text-sm text-center py-8">Carregando interessados...</p>
          )}
          {errorInterests && (
            <p className="text-red-400 text-sm text-center py-8">{errorInterests}</p>
          )}
          {!loadingInterests && !errorInterests && interests.length === 0 && (
            <p className="text-neutral-500 text-sm text-center py-8">Nenhum interessado cadastrado ainda.</p>
          )}

          <div className="space-y-4">
            {interests.map((inter) => (
              <div
                key={inter.id}
                className={`p-4 rounded-xl border flex flex-col md:flex-row gap-4 justify-between items-start transition-all ${
                  inter.status === 'convertido'
                    ? 'border-emerald-600/30 bg-emerald-950/10'
                    : inter.status === 'arquivado'
                    ? 'border-neutral-800 bg-neutral-950/40 opacity-55'
                    : inter.status === 'contacted'
                    ? 'border-sky-600/30 bg-sky-950/10'
                    : 'border-neutral-800 bg-neutral-900'
                }`}
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[#F2C94C] font-mono text-xs font-bold bg-amber-500/10 p-0.5 px-2 rounded">
                      Naipe: {inter.instrumentOfInterest}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">{inter.date}</span>
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
                      <span className="bg-neutral-800 text-neutral-400 border border-neutral-700 p-0.5 px-2 rounded-full text-[9px] font-bold font-mono">
                        ARQUIVADO
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-neutral-100 flex items-center">
                      {inter.name}
                      {inter.age > 0 && (
                        <span className="text-neutral-500 font-mono text-[10px] ml-1.5">• {inter.age} anos</span>
                      )}
                    </h4>
                    {inter.message && (
                      <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed bg-neutral-950/50 p-3 rounded-lg font-serif">
                        "{inter.message}"
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-[10px] font-mono text-neutral-500 pt-1">
                    <span className="flex items-center"><Mail size={10} className="mr-1 text-amber-500" /> {inter.email}</span>
                    <span className="flex items-center"><Phone size={10} className="mr-1 text-[#0B4DA2]" /> {inter.phone}</span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                  {inter.status !== 'convertido' && inter.status !== 'arquivado' && (
                    <button
                      type="button"
                      onClick={() => handleOpenEnrollModal(inter)}
                      className="p-2 px-3 bg-[#0B4DA2] hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer flex items-center justify-center tracking-wider shadow-lg"
                    >
                      <UserPlus size={13} className="mr-1.5" /> Converter em Aluno ERP
                    </button>
                  )}

                  <div className="flex space-x-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        handleMarkContacted(inter.id);
                        handleOpenSimMail(inter.email, 'interesse', inter);
                      }}
                      className="p-1 px-3 bg-neutral-800 hover:bg-neutral-750 text-[#F2C94C] text-[10.5px] rounded border border-neutral-750 font-mono flex-1 text-center cursor-pointer"
                    >
                      Contatar Candidato
                    </button>

                    {inter.status !== 'arquivado' && inter.status !== 'convertido' && (
                      <button
                        type="button"
                        onClick={() => handleArchiveInterest(inter.id, inter.name)}
                        className="p-1 px-2.5 bg-neutral-800 hover:bg-neutral-950 text-neutral-400 rounded border border-neutral-750"
                        title="Arquivar"
                      >
                        <Archive size={11} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteInterest(inter.id, inter.name)}
                      className="p-1 px-2.5 bg-neutral-800 hover:bg-rose-950 text-rose-500 rounded border border-neutral-750 transition-all cursor-pointer"
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
          SUBTAB 2 — APOIADORES (lógica local inalterada)
          ================================================================ */}
      {subTab === 'apoiar' && (
        <div className="space-y-4">
          <div className="text-xs text-neutral-400 italic p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
            💸 <strong>Painel Patrocinador</strong>: Clique em <strong>"Tornar Apoiador Oficial"</strong> para incluir a logomarca no hall dos mecenas da Home.
          </div>

          <div className="space-y-4">
            {supports.map((sup) => (
              <div
                key={sup.id}
                className={`p-4 rounded-xl border flex flex-col md:flex-row gap-4 justify-between items-start transition-all ${
                  sup.status === 'approved'
                    ? 'border-emerald-600/30 bg-emerald-950/10'
                    : sup.status === 'archived'
                    ? 'border-neutral-800 bg-neutral-950/40 opacity-55'
                    : 'border-neutral-800 bg-neutral-900'
                }`}
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2.5 text-[10px] font-mono">
                    <span className="bg-[#0B4DA2]/10 text-sky-400 p-1 px-2 rounded-md font-bold uppercase tracking-wider text-[9px]">
                      Apoio: {sup.supportType}
                    </span>
                    <span className="text-neutral-500">{sup.date}</span>
                    {sup.status === 'approved' && (
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 p-0.5 px-2 rounded-full font-bold">
                        APOIADOR APROVADO
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-neutral-100 flex items-center">
                      {sup.name}
                      {sup.company && <span className="text-amber-500 ml-1.5 font-sans">• {sup.company}</span>}
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed bg-neutral-950/50 p-3 rounded-lg">
                      "{sup.message}"
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-[10px] font-mono text-neutral-500">
                    <span className="flex items-center"><Mail size={10} className="mr-1 text-amber-500" /> {sup.email}</span>
                    <span className="flex items-center"><Phone size={10} className="mr-1 text-[#0B4DA2]" /> {sup.phone}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                  {sup.status !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => handlePromoToSupporter(sup)}
                      className="p-2 px-3 bg-[#0B4DA2] hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer flex items-center justify-center tracking-wider"
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
                      className="p-1 px-3 bg-neutral-800 hover:bg-neutral-750 text-[#F2C94C] text-[10.5px] rounded border border-neutral-750 font-mono flex-1 text-center cursor-pointer"
                    >
                      Enviar Negociação
                    </button>
                    {sup.status !== 'archived' && (
                      <button
                        type="button"
                        onClick={() => handleArchiveSupport(sup.id, sup.name)}
                        className="p-1 px-2.5 bg-neutral-800 hover:bg-neutral-950 text-neutral-400 rounded border border-neutral-750"
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
          SUBTAB 3 — CONTATOS GERAIS (lógica local inalterada)
          ================================================================ */}
      {subTab === 'contato' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-lg text-xs flex justify-between items-center text-neutral-400 font-mono">
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
                    : 'border-neutral-800 bg-neutral-900'
                }`}
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2.5">
                    {con.status === 'unread' && (
                      <span className="bg-amber-500 text-black text-[9px] font-bold p-0.5 px-2 rounded-full font-mono">
                        NÃO LIDA
                      </span>
                    )}
                    <span className="text-[11px] text-neutral-500 font-mono">{con.date}</span>
                    <span className="text-neutral-400 text-xs font-bold">{con.subject}</span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-neutral-100">{con.name}</h4>
                    <p className="text-[11px] text-neutral-400 mt-1 line-clamp-3">"{con.message}"</p>
                  </div>

                  <div className="flex gap-4 text-[10px] font-mono text-neutral-500">
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
                      className="p-1.5 px-3 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white rounded text-xs font-semibold cursor-pointer text-center"
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
                      className="p-1 px-3 bg-neutral-800 hover:bg-neutral-750 text-amber-500 text-[10px] rounded border border-neutral-750 flex-1 text-center cursor-pointer"
                    >
                      Enviar E-mail Solução
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteContact(con.id)}
                      className="p-1 px-2.5 bg-neutral-800 hover:bg-rose-950 text-rose-500 rounded border border-neutral-750 transition-all cursor-pointer"
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
          MODAL: FICHA DE INSCRIÇÃO / MATRÍCULA (interessado -> aluno)
          ================================================================ */}
      {enrollModalOpen && enrollForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fade-in">
          <form
            onSubmit={handleConfirmEnroll}
            className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 flex items-center">
                <GraduationCap size={14} className="mr-2" />
                Ficha de Matrícula — Conversão para Aluno
              </h3>
              <button
                type="button"
                onClick={() => setEnrollModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                Fechar
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              {/* Dados pessoais */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={enrollForm.name}
                    onChange={(e) => setEnrollForm({ ...enrollForm, name: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 p-2 text-xs rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={enrollForm.birthDate || ''}
                    onChange={(e) => setEnrollForm({ ...enrollForm, birthDate: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 p-2 text-xs rounded font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    value={enrollForm.email}
                    onChange={(e) => setEnrollForm({ ...enrollForm, email: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 p-2 text-xs rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1">Telefone</label>
                  <input
                    type="text"
                    required
                    value={enrollForm.phone}
                    onChange={(e) => setEnrollForm({ ...enrollForm, phone: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 p-2 text-xs rounded font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Dados acadêmicos */}
              <div className="grid grid-cols-2 gap-4">
                <div>
  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1">Instrumento</label>
  <select
    required
    value={enrollForm.instrument}
    onChange={(e) => setEnrollForm({ ...enrollForm, instrument: e.target.value })}
    className="w-full bg-neutral-950 border border-neutral-800 text-neutral-400 p-2 text-xs rounded focus:outline-none"
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
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1">Turma / Classe</label>
                  <input
                    type="text"
                    value={enrollForm.classroom || ''}
                    onChange={(e) => setEnrollForm({ ...enrollForm, classroom: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 p-2 text-xs rounded focus:outline-none"
                    placeholder="Ex: Iniciante"
                  />
                </div>
              </div>

              {/* Responsável e endereço */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1">Responsável (se menor de idade)</label>
                <input
                  type="text"
                  value={enrollForm.guardian || ''}
                  onChange={(e) => setEnrollForm({ ...enrollForm, guardian: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 p-2 text-xs rounded focus:outline-none"
                  placeholder="Nome do responsável legal"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1">Endereço</label>
                <textarea
                  value={enrollForm.address || ''}
                  onChange={(e) => setEnrollForm({ ...enrollForm, address: e.target.value })}
                  rows={2}
                  className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 p-2 text-xs rounded focus:outline-none focus:border-amber-400"
                  placeholder="Endereço completo do aluno"
                />
              </div>

              {/* Foto do aluno */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500">Foto do Aluno</label>
                {enrollForm.photo && (
                  <img
                    src={enrollForm.photo}
                    alt="Pré-visualização foto do aluno"
                    referrerPolicy="no-referrer"
                    className="w-24 h-24 object-cover rounded-full border border-neutral-800"
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

              {/* Status da matrícula */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1">Status da Matrícula</label>
                <select
                  value={enrollForm.status || 'ativo'}
                  onChange={(e) => setEnrollForm({ ...enrollForm, status: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 text-neutral-400 p-2 text-xs rounded focus:outline-none"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="trancado">Trancado</option>
                </select>
              </div>
            </div>

            <div className="bg-neutral-950 p-4 border-t border-neutral-800 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEnrollModalOpen(false)}
                className="p-1.5 px-4 bg-neutral-900 text-xs rounded hover:bg-neutral-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={enrollSaving}
                className="p-1.5 px-6 bg-[#0B4DA2] text-xs font-semibold text-white rounded hover:bg-blue-750 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-amber-500 flex items-center">
                <Send size={13} className="mr-2" />
                SIMU EMAIL CLIENT API ENGINE
              </span>
              <button onClick={() => setSimMailOpen(false)} className="text-neutral-400">
                <X size={15} />
              </button>
            </div>

            <div className="p-4 space-y-3.5">
              <div className="grid grid-cols-6 items-center gap-2 text-xs">
                <span className="col-span-1 text-neutral-500 font-mono">Para:</span>
                <input
                  type="text"
                  value={simDocMail}
                  onChange={(e) => setSimDocMail(e.target.value)}
                  className="col-span-5 bg-neutral-950 border border-neutral-800 p-1.5 px-2 rounded text-xs text-neutral-200"
                />
              </div>

              <div className="grid grid-cols-6 items-center gap-2 text-xs">
                <span className="col-span-1 text-neutral-500 font-mono">Assunto:</span>
                <input
                  type="text"
                  defaultValue={`Retorno Filarmônica Aliança do Ouro - Olá ${activeFicha.name}`}
                  className="col-span-5 bg-neutral-950 border border-neutral-800 p-1.5 px-2 rounded text-[11.5px] text-neutral-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Corpo do E-mail</label>
                <textarea
                  rows={4}
                  defaultValue={`Prezado(a) ${activeFicha.name},\n\nAgradecemos imensamente o seu contato enviado em ${activeFicha.date || ''}.\n\nNossa coordenação já analisou sua proposta e entraremos em contato via WhatsApp em breve.\n\nAtenciosamente,\nSecretaria Acadêmica Aliança do Ouro.`}
                  className="w-full bg-neutral-950 border border-neutral-800 p-3 rounded text-xs text-neutral-200 leading-relaxed font-sans"
                />
              </div>
            </div>

            <div className="bg-neutral-950 p-3.5 border-t border-neutral-800 flex justify-end space-x-2">
              <button
                onClick={() => setSimMailOpen(false)}
                className="text-xs text-neutral-400 px-4 py-1.5 bg-neutral-900 rounded"
              >
                Voltar
              </button>
              <button
                onClick={() => {
                  alert(`E-mail disparado via SMTP com sucesso para: ${simDocMail}`);
                  setSimMailOpen(false);
                }}
                className="text-xs text-white px-6 py-1.5 bg-[#0B4DA2] rounded font-bold uppercase tracking-wider flex items-center cursor-pointer"
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
