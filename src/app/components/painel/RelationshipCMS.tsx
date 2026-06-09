/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  HeartHandshake, BookOpen, HelpCircle, Check, Archive, Trash2, Mail, Phone, 
  UserPlus, UserCheck, MessageSquare, ExternalLink, Calendar, CheckCircle2, 
  Play, Send, Share2, Eye, X
} from 'lucide-react';
import { InterestFormResponse, SupportFormResponse, ContactMessage, Student, Supporter } from '../../validations/types';

interface RelationshipCMSProps {
  interests: InterestFormResponse[];
  setInterests: React.Dispatch<React.SetStateAction<InterestFormResponse[]>>;
  supports: SupportFormResponse[];
  setSupports: React.Dispatch<React.SetStateAction<SupportFormResponse[]>>;
  contacts: ContactMessage[];
  setContacts: React.Dispatch<React.SetStateAction<ContactMessage[]>>;
  
  // Backdoor conversions hooks to mutate the actual ERP states! Very high value!
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  supporters: Supporter[];
  setSupporters: React.Dispatch<React.SetStateAction<Supporter[]>>;
  
  addAuditLog: (action: string, module: string, details: string) => void;
}

export default function RelationshipCMS({
  interests,
  setInterests,
  supports,
  setSupports,
  contacts,
  setContacts,
  students,
  setStudents,
  supporters,
  setSupporters,
  addAuditLog
}: RelationshipCMSProps) {
  const [subTab, setSubTab] = useState<'interesse' | 'apoiar' | 'contato'>('interesse');

  // Modals simulation state
  const [activeFicha, setActiveFicha] = useState<any | null>(null);
  const [fichaType, setFichaType] = useState<'interesse' | 'apoiar' | 'contato' | null>(null);
  const [simDocMail, setSimDocMail] = useState<string>('');
  const [simMailOpen, setSimMailOpen] = useState(false);


  // ==========================================
  // CONVERSION CORE: PROMOTES CANDIDATE TO STUDENT IN THE ERP
  // ==========================================
  const handlePromoToStudent = (item: InterestFormResponse) => {
    // Check if copy already exists in active enrollment
    const exists = students.some(s => s.email === item.email);
    if (exists) {
      alert('Este e-mail de candidato já corresponde a uma matrícula de estudante ativa!');
      return;
    }

    const newStudent: Student = {
      id: `alu-${Date.now()}`,
      name: item.name,
      birthDate: `${2026 - item.age}-01-01`, // calculate birth
      instrument: item.instrumentOfInterest || 'Trompete Bb',
      classroom: 'Iniciante',
      phone: item.phone,
      email: item.email,
      guardian: item.age < 18 ? 'Responsável Declarado no Fale Conosco' : undefined,
      address: 'Endereço fornecido no formulário de captação',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80',
      status: 'active'
    };

    setStudents(prev => [...prev, newStudent]);
    
    // Update candidate status
    setInterests(prev => prev.map(i => i.id === item.id ? { ...i, status: 'converted' } : i));
    
    addAuditLog('Converteu Interessado em Aluno', 'Relacionamento', `Candidato ${item.name} promovido para aluno regular do naipe de ${item.instrumentOfInterest}`);
    alert(`Sucesso! Ficha de ${item.name} convertida. Registro criado com matrícula Iniciante.`);
  };


  // ==========================================
  // CONVERSION CORE: PROMOTES SUPPORTER FORM TO COMPANY SUPPORTER
  // ==========================================
  const handlePromoToSupporter = (item: SupportFormResponse) => {
    const exists = supporters.some(s => s.name === item.name);
    if (exists) {
      alert('Este parceiro já está ativo no nosso quadro oficial de empresas apoiadoras!');
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
      highlightedOnHome: true
    };

    setSupporters(prev => [...prev, newSupporter]);
    
    // Update proposal status
    setSupports(prev => prev.map(s => s.id === item.id ? { ...s, status: 'approved' } : s));
    
    addAuditLog('Converteu Apoiador', 'Relacionamento', `Proposta de apoio de ${item.name} convertida para quadro oficial de patrocinadores`);
    alert(`Orquestra Apoiada! ${item.company || item.name} promovido para patrocinador Prata.`);
  };


  // ==========================================
  // GENERAL CRUDS
  // ==========================================
  const handleArchiveInterest = (id: string, name: string) => {
    setInterests(prev => prev.map(i => i.id === id ? { ...i, status: 'archived' } : i));
    addAuditLog('Arquivou Ficha de Interesse', 'Relacionamento', `Arquivou inscrição bolsista de: ${name}`);
  };

  const handleArchiveSupport = (id: string, name: string) => {
    setSupports(prev => prev.map(s => s.id === id ? { ...s, status: 'archived' } : s));
    addAuditLog('Arquivou Proposta Apoio', 'Relacionamento', `Arquivou proposta de patrocínio de: ${name}`);
  };

  const handleStatusContact = (id: string, status: 'unread' | 'replied' | 'resolved' | 'archived', actionName: string) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    addAuditLog('Alterou Ouvidoria', 'Relacionamento', `${actionName} mensagem de ID: ${id}`);
  };

  const handleDeleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    addAuditLog('Deletou Contato', 'Relacionamento', `Excluiu permanentemente a mensagem de ID: ${id}`);
  };

  const handleOpenSimMail = (email: string, itemType: any, item: any) => {
    setSimDocMail(email);
    setActiveFicha(item);
    setFichaType(itemType);
    setSimMailOpen(true);
  };

  return (
    <div className="space-y-6 p-6 animate-fade-in select-none">
      
      {/* Page description */}
      <div className="pb-4 border-b border-neutral-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-neutral-100 tracking-tight flex items-center">
            <HeartHandshake className="mr-2 text-[#F2C94C]" size={20} />
            Central de Atendimento & Ouvidoria (CRM)
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Responda e-mails enviados pelos formulários do site público e converta interessados diretamente no banco de dados ERP em 1 clique.
          </p>
        </div>

        {/* Tab local controls switcher */}
        <div className="flex bg-neutral-900 border border-neutral-800 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setSubTab('interesse')}
            className={`p-1.5 px-3 rounded-md font-semibold cursor-pointer transition-all ${subTab === 'interesse' ? 'bg-[#0B4DA2] text-white shadow' : 'text-neutral-400'}`}
          >
            Tenho Interesse (Bolsas)
          </button>
          <button
            type="button"
            onClick={() => setSubTab('apoiar')}
            className={`p-1.5 px-3 rounded-md font-semibold cursor-pointer transition-all ${subTab === 'apoiar' ? 'bg-[#0B4DA2] text-white shadow' : 'text-neutral-400'}`}
          >
            Quero Apoiar (Parcerias)
          </button>
          <button
            type="button"
            onClick={() => setSubTab('contato')}
            className={`p-1.5 px-3 rounded-md font-semibold cursor-pointer transition-all ${subTab === 'contato' ? 'bg-[#0B4DA2] text-white shadow' : 'text-neutral-400'}`}
          >
            Contatos Gerais (Inboxes)
          </button>
        </div>
      </div>

      {/* ==========================================================
          SUBTAB 1: "TENHO INTERESSE" BOARD (QUALIFICATION CRM)
          ========================================================== */}
      {subTab === 'interesse' && (
        <div className="space-y-4">
          <div className="text-xs text-neutral-400 font-sans italic p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
            🚨 <strong>Painel Inteligente Conversão</strong>: Se o candidato possuir perfil apto técnico, clique em <strong>"Converter em Aluno"</strong>. Isso injetará instantaneamente o registro na lista acadêmica oficial e gerará uma nova matrícula no sistema!
          </div>

          <div className="space-y-4">
            {interests.map((inter) => (
              <div 
                key={inter.id} 
                className={`p-4 rounded-xl border flex flex-col md:flex-row gap-4 justify-between items-start transition-all ${
                  inter.status === 'converted' 
                    ? 'border-emerald-600/30 bg-emerald-950/10' 
                    : inter.status === 'archived'
                    ? 'border-neutral-800 bg-neutral-950/40 opacity-55'
                    : 'border-neutral-800 bg-neutral-900'
                }`}
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-[#F2C94C] font-mono text-xs font-bold bg-amber-500/10 p-0.5 px-2 rounded">
                      Naipe: {inter.instrumentOfInterest}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">{inter.date}</span>
                    {inter.status === 'converted' && (
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 p-0.5 px-2 rounded-full text-[9px] font-bold font-mono">CONVERTIDO EM ALUNO MATRICULADO</span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-neutral-100 flex items-center">
                      {inter.name} 
                      <span className="text-neutral-500 font-mono text-[10px] ml-1.5">• {inter.age} anos</span>
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed bg-neutral-950/50 p-3 rounded-lg font-serif">
                      "{inter.message}"
                    </p>
                  </div>

                  {/* Contact channels */}
                  <div className="flex flex-wrap gap-4 text-[10px] font-mono text-neutral-500 pt-1">
                    <span className="flex items-center"><Mail size={10} className="mr-1 text-amber-500" /> {inter.email}</span>
                    <span className="flex items-center"><Phone size={10} className="mr-1 text-[#0B4DA2]" /> {inter.phone}</span>
                  </div>
                </div>

                {/* Integration conversion buttons */}
                <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                  {inter.status !== 'converted' && (
                    <button
                      type="button"
                      onClick={() => handlePromoToStudent(inter)}
                      className="p-2 px-3 bg-[#0B4DA2] hover:bg-blue-750 text-white rounded text-xs font-semibold cursor-pointer flex items-center justify-center.5 tracking-wider shadow-lg"
                    >
                      <UserPlus size={13} className="mr-1.5" /> Converter em Aluno ERP
                    </button>
                  )}
                  
                  <div className="flex space-x-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setInterests(prev => prev.map(i => i.id === inter.id ? { ...i, status: 'contacted' } : i));
                        handleOpenSimMail(inter.email, 'interesse', inter);
                      }}
                      className="p-1 px-3 bg-neutral-800 hover:bg-neutral-750 text-[#F2C94C] text-[10.5px] rounded border border-neutral-750 font-mono flex-1 text-center"
                    >
                      Contatar Candidato
                    </button>
                    {inter.status !== 'archived' && (
                      <button
                        type="button"
                        onClick={() => handleArchiveInterest(inter.id, inter.name)}
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

      {/* ==========================================================
          SUBTAB 2: "QUERO APOIAR" PROPOSALS (SPONSOR LEAD CRM)
          ========================================================== */}
      {subTab === 'apoiar' && (
        <div className="space-y-4">
          <div className="text-xs text-neutral-400 font-sans italic p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
            💸 <strong>Painel Inteligente Patrocinador</strong>: Se a empresa concordar com a contrapartida cultural de impostos, clique em <strong>"Converter em Apoiador"</strong>. Isso incluirá a logomarca e descrição no hall dos mecenas da Home!
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
                    <span className="bg-[#0B4DA2]/10 text-sky-450 p-1 px-2 rounded-md font-bold uppercase tracking-wider text-[9px]">
                      Apoio: {sup.supportType}
                    </span>
                    <span className="text-neutral-500">{sup.date}</span>
                    {sup.status === 'approved' && (
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 p-0.5 px-2 rounded-full font-bold">APOIADOR APROVADO QUADRO</span>
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
                      className="p-2 px-3 bg-[#0B4DA2] hover:bg-blue-750 text-white rounded text-xs font-semibold cursor-pointer flex items-center justify-center tracking-wider"
                    >
                      <UserCheck size={13} className="mr-1.5" /> Tornar Apoiador Oficial
                    </button>
                  )}

                  <div className="flex space-x-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSupports(prev => prev.map(s => s.id === sup.id ? { ...s, status: 'contacted' } : s));
                        handleOpenSimMail(sup.email, 'apoiar', sup);
                      }}
                      className="p-1 px-3 bg-neutral-800 hover:bg-neutral-750 text-[#F2C94C] text-[10.5px] rounded border border-neutral-750 font-mono flex-1 text-center"
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

      {/* ==========================================================
          SUBTAB 3: CONTACT GENERAL MESSAGES INBOX
          ========================================================== */}
      {subTab === 'contato' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-lg text-xs flex justify-between items-center text-neutral-400 font-mono">
            <span>Caixa Geral de Entrada Fale Conosco</span>
            <span>{contacts.filter(c => c.status === 'unread').length} mensagens não lidas</span>
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
                      <span className="bg-amber-500 text-black text-[9px] font-bold p-0.5 px-2 rounded-full font-mono">NÃO LIDA</span>
                    )}
                    <span className="text-[11px] text-neutral-500 font-mono">{con.date}</span>
                    <span className="text-neutral-400 text-xs font-bold">{con.subject}</span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-neutral-100">{con.name}</h4>
                    <p className="text-[11px] text-neutral-400 mt-1 lines-clamp-3">"{con.message}"</p>
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
                        handleStatusContact(con.id, 'replied', 'Enviou simulado email');
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


      {/* ==========================================
          MOCK E-MAIL SIMULATOR DRAG PANEL OVERLAYS
          ========================================== */}
      {simMailOpen && activeFicha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-amber-500 flex items-center">
                <Send size={13} className="mr-2" />
                SIMU EMAIL CLIENT API ENGINE
              </span>
              <button onClick={() => setSimMailOpen(false)} className="text-neutral-400"><X size={15} /></button>
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
                <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Copo do E-mail</label>
                <textarea 
                  rows={4}
                  defaultValue={`Prezado(a) ${activeFicha.name},\n\nAgradecemos imensamente o seu contato enviado em ${activeFicha.date || ''}.\n\nNossa coordenação artística e de pessoas já analisou sua proposta e entraremos em contato via WhatsApp no número de telefone informado.\n\nAtenciosamente,\nSecretaria Acadêmica Aliança do Ouro.`}
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
                  alert(`E-mail com simulação disparado via SMTP com sucesso para: ${simDocMail}`);
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
