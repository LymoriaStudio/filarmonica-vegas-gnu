import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { InlineLoader } from '../../components/InlineLoader';
import {
  Users, UserCheck, ShieldAlert, Plus, Search, Filter, Mail, Phone, MapPin,
  Trash2, Edit, Check, Star, Download, Archive, ArchiveRestore, ArrowUp, ArrowDown, UserPlus,
  Instagram, Facebook, Youtube, Linkedin, MessageCircle, FileSpreadsheet, X, Calendar, Music2
} from 'lucide-react';
import { Professor, Student, Organizer, AuditLog } from '../../validations/types';
import { ImageUploader } from './MiniWidgets';
import { uploadFileToSupabase } from '../../services/storageService';
import { getStudents, createStudent, updateStudent, updateStudentStatus, deleteStudent } from '../../services/studentsService';
import { Drawer, DrawerSection, DrawerField, DrawerInput, DrawerTextarea, DrawerSelect } from './Drawer';
import { getProfessors, createProfessor, updateProfessor, updateProfessorHighlight, updateProfessorOrder, deleteProfessor } from '../../services/professorsService';
import { uploadMedia } from '../../services/mediaService';
import { resolveMediaUrl } from '../../../lib/apiClient';

interface PessoasERPProps {
  professors: Professor[];
  setProfessors: React.Dispatch<React.SetStateAction<Professor[]>>;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  organizers: Organizer[];
  setOrganizers: React.Dispatch<React.SetStateAction<Organizer[]>>;
  addAuditLog: (action: string, module: string, details: string) => void;
  selectedEntityForEdit: any;
  setSelectedEntityForEdit: (entity: any) => void;
  activeTab?: string;
}

export default function PessoasERP({
  professors,
  setProfessors,
  students,
  setStudents,
  organizers,
  setOrganizers,
  addAuditLog,
  selectedEntityForEdit,
  setSelectedEntityForEdit,
  activeTab,
}: PessoasERPProps) {
  const initialSubTab = activeTab === 'pessoas-professores' ? 'professores' : activeTab === 'pessoas-organizadores' ? 'organizadores' : 'alunos';
  const [subTab, setSubTab] = useState<'alunos' | 'professores' | 'organizadores'>(initialSubTab as any);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [instrumentFilter, setInstrumentFilter] = useState<string>('all');

  // Modals
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [activeStudent, setActiveStudent] = useState<Partial<Student> | null>(null);

  const [profModalOpen, setProfModalOpen] = useState(false);
  const [activeProf, setActiveProf] = useState<Partial<Professor> | null>(null);

  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [activeOrg, setActiveOrg] = useState<Partial<Organizer> | null>(null);

  const [viewStudent, setViewStudent] = useState<Student | null>(null);

  // Simulated export to CSV modal

  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState('');
  const [pendingStudentPhoto, setPendingStudentPhoto] = useState<File | null>(null);
  const [pendingProfPhoto, setPendingProfPhoto] = useState<File | null>(null);

  useEffect(() => {
    setStudentsLoading(true);
    setStudentsError('');
    getStudents()
      .then(setStudents)
      .catch((err: any) => {
        console.error('Erro ao carregar alunos:', err);
        setStudentsError(err?.message ?? 'Erro desconhecido ao carregar alunos.');
      })
      .finally(() => setStudentsLoading(false));
  }, []);
  // Catch any external routing redirect (from header)
  useEffect(() => {
    if (selectedEntityForEdit) {
      if (selectedEntityForEdit.classroom) {
        // It is an student
        setSubTab('alunos');
        handleOpenStudentModal(selectedEntityForEdit);
      } else if (selectedEntityForEdit.miniBio) {
        // It is a professor
        setSubTab('professores');
        handleOpenProfModal(selectedEntityForEdit);
      }
      setSelectedEntityForEdit(null); // consume
    }
  }, [selectedEntityForEdit]);

  useEffect(() => {
  getProfessors()
    .then(setProfessors)
    .catch((err) => console.error('Erro ao carregar professores:', err));
}, []);


// Gera avatar com iniciais do nome quando não há foto cadastrada
const getProfessorAvatarFallback = (name?: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name?.trim() || 'Professor')}&background=F2C94C&color=1a1a1a&size=400&bold=true`;
  // ==========================================
  // PROFESSORS MANAGEMENT (CARDS)
  // ==========================================
  const handleOpenProfModal = (prof: Partial<Professor> | null) => {
    setActiveProf(prof || {
      id: '',
      name: '',
      photo: '',
      role: '',
      specialty: '',
      instrument: '',
      miniBio: '',
      fullBio: '',
      socialInstagram: '',
      socialFacebook: '',
      socialYoutube: '',
      socialLinkedin: '',
      socialWhatsapp: '',
      email: '',
      phone: '',
      highlighted: false,
      order: professors?.length + 1
    });

    
    setProfModalOpen(true);
  };

const handleSaveProf = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!activeProf) return;
  try {
    let finalPhoto = activeProf.photo;
    if (pendingProfPhoto) {
      const uploaded = await uploadMedia(pendingProfPhoto, 'professors');
      finalPhoto = uploaded.caminhoRelativo;
    }  else if (!finalPhoto) {
      finalPhoto = getProfessorAvatarFallback(activeProf.name); }


    if (activeProf.id) {
      const updated = await updateProfessor(activeProf.id, { ...activeProf, photo: finalPhoto });
      setProfessors(prev => prev.map(p => p.id === updated.id ? updated : p));
      addAuditLog('Alterou Professor', 'Professores', `Editou cadastro de: ${updated.name}`);
    } else {
      const created = await createProfessor({ ...activeProf, photo: finalPhoto });
      setProfessors(prev => [...prev, created]);
      addAuditLog('Cadastrou Professor', 'Professores', `Inseriu novo professor: ${created.name}`);
    }
    setProfModalOpen(false);
    setPendingProfPhoto(null);
  } catch (err: any) {
    alert('Erro ao salvar professor: ' + err.message);
  }
};

 const handleDeleteProf = async (id: string, name: string) => {
  if (!confirm(`Remover permanentemente o professor "${name}"?`)) return;
  try {
    await deleteProfessor(id);
    setProfessors(prev => prev.filter(p => p.id !== id));
    addAuditLog('Deletou Professor', 'Professores', `Removeu: ${name}`);
  } catch (err: any) {
    alert('Erro ao remover professor: ' + err.message);
  }
};

const handleToggleHighlightProf = async (id: string, name: string, active: boolean) => {
  const current = professors.find(p => p.id === id);
  if (!current) return;
  try {
    await updateProfessorHighlight(current, active);
    setProfessors(prev => prev.map(p => p.id === id ? { ...p, highlighted: active } : p));
    addAuditLog('Destacou Professor', 'Professores', `${active ? 'Destacou' : 'Ocultou'} ${name}`);
  } catch (err: any) {
    alert('Erro ao atualizar destaque: ' + err.message);
  }
};

const handleOrderProf = async (index: number, direction: 'up' | 'down') => {
  const sorted = [...professors].sort((a, b) => a.order - b.order);
  const targetIdx = direction === 'up' ? index - 1 : index + 1;
  if (targetIdx < 0 || targetIdx >= sorted.length) return;

  const a = sorted[index];
  const b = sorted[targetIdx];
  const tempOrder = a.order;

  try {
    await Promise.all([
      updateProfessorOrder(a, b.order),
      updateProfessorOrder(b, tempOrder),
    ]);
    setProfessors(prev => prev.map(p => {
      if (p.id === a.id) return { ...p, order: b.order };
      if (p.id === b.id) return { ...p, order: tempOrder };
      return p;
    }));
  } catch (err: any) {
    alert('Erro ao reordenar: ' + err.message);
  }
};

  // ==========================================
  // STUDENTS MANAGEMENT (TABLE)
  // ==========================================
  const handleOpenStudentModal = (student: Partial<Student> | null) => {
    setPendingStudentPhoto(null); 
    setActiveStudent(student || {
      id: '',
      name: '',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80',
      birthDate: '',
      instrument: '',
      classroom: 'Iniciante',
      phone: '',
      email: '',
      guardian: '',
      address: '',
      status: 'active'
    });
    setStudentModalOpen(true);
  };

const handleSaveStudent = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!activeStudent) return;
  try {
    // ← entra aqui, antes do if/else
    let finalPhoto = activeStudent.photo;
    if (pendingStudentPhoto) {
      finalPhoto = await uploadFileToSupabase(pendingStudentPhoto, 'students');
    }

    if (activeStudent.id) {
      const updated = await updateStudent(activeStudent.id, { ...activeStudent, photo: finalPhoto });
      setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
      addAuditLog('Alterou Cadastro Aluno', 'Alunos', `Atualizou matrícula de: ${updated.name}`);
    } else {
      const created = await createStudent({ ...activeStudent, photo: finalPhoto });
      setStudents(prev => [...prev, created]);
      addAuditLog('Matriculou Aluno', 'Alunos', `Matriculou novo bolsista: ${created.name}`);
    }
    setStudentModalOpen(false);
    setPendingStudentPhoto(null); // ← limpa após salvar
  } catch (err: any) {
    alert('Erro ao salvar aluno: ' + err.message);
  }
};
const handleDeleteStudent = async (id: string, name: string) => {
  if (!confirm(`Remover permanentemente a matrícula de "${name}"?`)) return;
  try {
    await deleteStudent(id);
    setStudents(prev => prev.filter(s => s.id !== id));
    addAuditLog('Deletou Matrícula Aluno', 'Alunos', `Removeu matrícula ID: ${id} (${name})`);
  } catch (err: any) {
    alert('Erro ao remover aluno: ' + err.message);
  }
};

const handleArchiveStudent = async (id: string, name: string) => {
  try {
    await updateStudentStatus(id, 'archived');
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: 'archived' } : s));
    addAuditLog('Arquivou Aluno', 'Alunos', `Alterou status de: ${name} para Arquivado`);
  } catch (err: any) {
    alert('Erro ao arquivar aluno: ' + err.message);
  }
};

const handleUnarchiveStudent = async (id: string, name: string) => {
  try {
    await updateStudentStatus(id, 'ativo');
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: 'ativo' } : s));
    addAuditLog('Desarquivou Aluno', 'Alunos', `Alterou status de: ${name} para Ativo`);
  } catch (err: any) {
    alert('Erro ao desarquivar aluno: ' + err.message);
  }
};


  // Mock list exporter
  const handleExportStudents = () => {
    const rows = students.map(s => ({
      'ID': s.id,
      'Nome Completo': s.name,
      'Status': s.status,
      'Turma': s.classroom,
      'Instrumento': s.instrument,
      'Responsável': s.guardian || '',
      'Telefone': s.phone,
      'E-mail': s.email,
      'Data de Nascimento': s.birthDate,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Alunos');
    XLSX.writeFile(wb, `alunos_${new Date().toISOString().slice(0, 10)}.xlsx`);
    addAuditLog('Exportou Alunos', 'Alunos', `Exportou lista de ${students.length} alunos em Excel`);
  };


  // ==========================================
  // ORGANIZERS MANAGEMENT
  // ==========================================
  const handleOpenOrgModal = (org: Partial<Organizer> | null) => {
    setActiveOrg(org || {
      id: '',
      name: '',
      photo: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&h=400&q=80',
      role: '',
      bio: '',
      phone: '',
      email: ''
    });
    setOrgModalOpen(true);
  };

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg) return;

    if (activeOrg.id) {
      setOrganizers(prev => prev.map(o => o.id === activeOrg.id ? (activeOrg as Organizer) : o));
      addAuditLog('Editou Administrativo', 'Organizadores', `Editou diretoria de: ${activeOrg.name}`);
    } else {
      const newOrg = { ...activeOrg, id: `org-${Date.now()}` } as Organizer;
      setOrganizers(prev => [...prev, newOrg]);
      addAuditLog('Cadastrou Administrativo', 'Organizadores', `Adicionou organizador: ${newOrg.name}`);
    }
    setOrgModalOpen(false);
  };

  const handleDeleteOrg = (id: string, name: string) => {
    setOrganizers(prev => prev.filter(o => o.id !== id));
    addAuditLog('Excluiu Organizador', 'Organizadores', `Removeu administrativo: ${name}`);
  };


  // Filtering Students
  const filteredStudents = students?.filter(s => {
    const matchQuery = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       s.instrument.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchInstr = instrumentFilter === 'all' || s.instrument.toLowerCase().includes(instrumentFilter.toLowerCase());

    return matchQuery && matchStatus && matchInstr;
  });

  return (
    <div className="space-y-6 p-6 animate-fade-in select-none">
      

      {/* ==========================================================
          SUBTAB 1: STUDENTS DIRECTORY TABLE (ERP INTRICATE)
          ========================================================== */}
      {subTab === 'alunos' && (
        <div className="space-y-4">

          {/* KPI cards */}
          {(() => {
            const total = students?.length ?? 0;
            const ativos = students?.filter(s => s.status === 'ativo').length ?? 0;
            const espera = students?.filter(s => s.status === 'trancado').length ?? 0;
            return (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-1">
                  <span className="text-xs text-gray-400">Total cadastrados</span>
                  <span className="text-3xl font-bold text-[#001856]">{total}</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-1">
                  <span className="text-xs text-gray-400">Alunos ativos</span>
                  <span className="text-3xl font-bold text-emerald-500">{ativos}</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-1">
                  <span className="text-xs text-gray-400">Lista de espera</span>
                  <span className="text-3xl font-bold text-amber-500">{espera}</span>
                </div>
              </div>
            );
          })()}

          {/* Query, Filter and Action header */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Search box search inputs */}
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Localizar Aluno (Nome/Meta)..."
                  className="bg-gray-50 border border-gray-200 text-gray-800 text-xs p-2 pl-8 rounded-lg focus:outline-none focus:border-[#001856] w-56 font-sans"
                />
              </div>

              {/* Status filtering */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-400 text-xs p-2 rounded-lg focus:outline-none"
              >
                <option value="all">Todos Status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativos</option>
                <option value="formado">Formados</option>
                <option value="trancado">Trancado</option>
                <option value="arquivado">Arquivados</option>
              </select>

              {/* Instrument filter selection */}
              <select
                value={instrumentFilter}
                onChange={(e) => setInstrumentFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-400 text-xs p-2 rounded-lg focus:outline-none"
              >
                <option value="all">Todos</option>
                <option value="trompete">Trompete</option>
                <option value="trombone">Trombone</option>
                <option value="trompa">Trompa</option>
                <option value="tuba">Tuba / graves</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={handleExportStudents}
                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-xs font-semibold cursor-pointer flex items-center"
              >
                <Download size={13} className="mr-1.5" /> Exportar Lista
              </button>
              <button
                type="button"
                onClick={() => handleOpenStudentModal(null)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#ffc300] hover:bg-yellow-400 text-[#001856] rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                <UserPlus size={13} /> Novo Aluno
              </button>
            </div>
          </div>

          {/* Real Grid table presentation */}
          {studentsLoading && (
            <InlineLoader message="Carregando alunos..." />
          )}
          {!studentsLoading && studentsError && (
            <div className="text-center py-8 text-xs text-red-500 font-mono bg-red-50 rounded-lg px-4">
              Erro ao carregar alunos: {studentsError}
            </div>
          )}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-400 font-mono uppercase tracking-wider">
                  <th className="p-3 pl-4">Nome Bolsista</th>
                  <th className="p-3">Turma</th>
                  <th className="p-3">Instrumento</th>
                  <th className="p-3">Responsável Legal</th>
                  <th className="p-3">Telefone & E-mail</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right pr-4">Gerenciar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-gray-400 font-serif italic">Nenhum aluno corresponde a esta filtragem orquestral.</td>
                  </tr>
                ) : (
                  filteredStudents?.map((alu) => (
                    <tr key={alu.id} className="hover:bg-gray-50 transition-all cursor-pointer" onClick={() => setViewStudent(alu)}>
                      <td className="p-3 pl-4 flex items-center space-x-2.5">
                        <img
                          src={alu.photo}
                          alt={alu.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(alu.name)}&background=0B4DA2&color=fff&size=64`;
                          }}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-full object-cover border border-gray-100 shrink-0"
                        />
                        <span className="font-bold text-gray-800">{alu.name}</span>
                      </td>
                      <td className="p-3">
                        <span className="bg-gray-100 text-gray-600 p-0.5 px-1.5 rounded text-[10px]">
                          {alu.classroom}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-[#ffc300]">{alu.instrument}</span>
                      </td>
                      <td className="p-3 text-gray-400 font-medium">
                        {alu.guardian ? alu.guardian : <span className="text-gray-500 font-bold">Maior de Idade</span>}
                      </td>
                      <td className="p-3 text-[10.5px] font-mono whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <Phone size={9} className="text-[#001856]" />
                          <span>{alu.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1 mt-0.5 text-gray-400">
                          <Mail size={9} />
                          <span>{alu.email}</span>
                        </div>
                      </td>
                      <td className="p-3">
  <span className={`inline-block p-1 px-2 rounded-full text-[9px] font-bold uppercase tracking-wider ${
    alu.status === 'ativo'     ? 'bg-emerald-50 text-emerald-700' :
    alu.status === 'inativo'   ? 'bg-amber-50 text-amber-700' :
    alu.status === 'formado'   ? 'bg-indigo-50 text-indigo-700' :
    alu.status === 'trancado'  ? 'bg-violet-50 text-violet-700' :
    'bg-gray-100 text-gray-500'
  }`}>
    {alu.status === 'ativo'    && 'Ativo'}
    {alu.status === 'inativo'  && 'Inativo'}
    {alu.status === 'formado'  && 'Formado'}
    {alu.status === 'trancado' && 'Trancado'}
    {alu.status === 'arquivado' && 'Arquivado'}
  </span>
</td>
                      <td className="p-3 pr-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            type="button"
                            onClick={() => handleOpenStudentModal(alu)}
                            className="p-1 px-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 hover:text-[#001856] transition-all cursor-pointer"
                          >
                            <Edit size={11} />
                          </button>
                          {alu.status !== 'archived' && (
                            <button
                              type="button"
                              title="Arquivar no ERP"
                              onClick={() => handleArchiveStudent(alu.id, alu.name)}
                              className="p-1 px-1.5 bg-gray-100 hover:bg-amber-950 rounded text-amber-500 hover:text-amber-200 transition-all cursor-pointer"
                            >
                              <Archive size={11} />
                            </button>
                          )}
                          {alu.status === 'archived' && (
                            <button
                              type="button"
                              title="Desarquivar"
                              onClick={() => handleUnarchiveStudent(alu.id, alu.name)}
                              className="p-1 px-1.5 bg-amber-50 hover:bg-amber-100 rounded text-amber-500 border border-amber-200 transition-all cursor-pointer"
                            >
                              <ArchiveRestore size={11} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(alu.id, alu.name)}
                            className="p-1 px-1.5 bg-gray-100 hover:bg-rose-950 rounded text-rose-400 hover:text-rose-200 transition-all cursor-pointer"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================================
          SUBTAB 2: PROFESSORS DIRECTORY CARDS (CMS & BIO DETAIL)
          ========================================================== */}
      {subTab === 'professores' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white border border-gray-200 p-4 rounded-xl">
            <div>
              <h3 className="text-xs font-mono font-bold text-[#ffc300] uppercase tracking-widest">Maestros, Chefes de Naipe e Auxiliares</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Gestão de professores em formato card para o site público institucional.</p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenProfModal(null)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#ffc300] hover:bg-yellow-400 text-[#001856] rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              + Adicionar Novo Professor
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xxl:grid-cols-3 gap-6">
            {professors?.sort((a,b)=>a.order-b.order).map((prof, idx) => (
              <div 
                key={prof.id} 
                className="rounded-xl overflow-hidden bg-white border border-gray-200 flex flex-col justify-between hover:border-gray-300 transition-all"
              >
                {/* Header detail */}
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-start gap-4">
                  <img 
                    onError={(e) => {
                   (e.target as HTMLImageElement).src = getProfessorAvatarFallback(prof.name);
                 }}
                    alt={prof.name} 
                    referrerPolicy="no-referrer"
                    src={(prof.photo && resolveMediaUrl(prof.photo)) || getProfessorAvatarFallback(prof.name)}
                    className="w-14 h-14 object-cover rounded-lg border border-gray-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <h4 className="text-xs font-bold text-[#001856] truncate">{prof.name}</h4>
                      {prof.highlighted && (
                        <Star size={11} className="fill-[#ffc300] text-[#ffc300] shrink-0" />
                      )}
                    </div>
                    <span className="block text-[10px] font-medium text-[#ffc300] mt-0.5 font-mono">{prof.role}</span>
                    <span className="block text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">Especialidade: {prof.specialty}</span>
                  </div>
                </div>

                {/* Instrumento — campo NOT NULL na tabela, adicionar após Especialidade */}


                {/* Narrative mini biography */}
                <div className="p-4 flex-1 text-[11px] text-gray-400 leading-relaxed bg-white">
                  <span className="text-[9.5px] uppercase font-mono font-semibold tracking-wider text-gray-500 block mb-1">Sinopse de Apresentação</span>
                  <p className="line-clamp-3">"{prof.miniBio}"</p>

                  <div className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap gap-1.5 text-[10px] font-mono text-gray-400">
                    <span>{prof.email}</span>
                    <span>•</span>
                    <span>{prof.phone}</span>
                  </div>

                  {/* Social links integration indicators */}
                  <div className="mt-3 flex items-center space-x-2 text-gray-400">
                    {prof.socialInstagram && <Instagram size={11} className="hover:text-pink-400 cursor-pointer" />}
                    {prof.socialFacebook && <Facebook size={11} className="hover:text-indigo-400 cursor-pointer" />}
                    {prof.socialYoutube && <Youtube size={11} className="hover:text-red-400 cursor-pointer" />}
                    {prof.socialLinkedin && <Linkedin size={11} className="hover:text-sky-450 cursor-pointer" />}
                    {prof.socialWhatsapp && <MessageCircle size={11} className="hover:text-emerald-400 cursor-pointer" />}
                  </div>
                </div>

                {/* Actions footer */}
                <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
                  {/* Order reordering buttons */}
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleOrderProf(idx, 'up')}
                      className="p-1 px-1.5 bg-gray-100 text-gray-400 hover:text-[#001856] rounded disabled:opacity-30"
                    >
                      <ArrowUp size={11} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === professors?.length - 1}
                      onClick={() => handleOrderProf(idx, 'down')}
                      className="p-1 px-1.5 bg-gray-100 text-gray-400 hover:text-[#001856] rounded disabled:opacity-30"
                    >
                      <ArrowDown size={11} />
                    </button>
                  </div>

                  {/* Highlight toggling and general edits */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleToggleHighlightProf(prof.id, prof.name, !prof.highlighted)}
                      className={`p-1 px-1.5 rounded transition-all text-[9.5px] font-bold uppercase tracking-wider ${prof.highlighted ? 'bg-[#ffc300]/10 text-[#ffc300]' : 'bg-gray-100 text-gray-400'}`}
                    >
                      {prof.highlighted ? 'Destaque: Sim' : 'Ativar Destaque'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenProfModal(prof)}
                      className="p-1 px-1.5 bg-gray-100 hover:bg-gray-200 text-[#ffc300] rounded cursor-pointer"
                    >
                      <Edit size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProf(prof.id, prof.name)}
                      className="p-1 px-1.5 bg-gray-100 hover:bg-rose-950 text-rose-500 rounded cursor-pointer"
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

      {/* ==========================================================
          SUBTAB 3: ORGANIZERS ERP CRUD
          ========================================================== */}
      {subTab === 'organizadores' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white border border-gray-200 p-4 rounded-xl">
            <div>
              <h3 className="text-xs font-mono font-bold text-[#ffc300] uppercase tracking-widest">Equipe Executiva de Retaguarda</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Gerenciamento interno para manter atribuições atualizadas.</p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenOrgModal(null)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#ffc300] hover:bg-yellow-400 text-[#001856] rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              + Adicionar Organizador
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {organizers.map((org) => (
              <div key={org.id} className="p-4 bg-white border border-gray-200 rounded-xl flex gap-4 justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 text-[#001856] text-xs flex items-center justify-center font-bold">
                    {org.name.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#001856]">{org.name}</h4>
                    <span className="block text-[10px] text-[#ffc300] font-mono mt-0.5">{org.role}</span>
                    <p className="text-[10.5px] text-gray-400 mt-1 line-clamp-2">"{org.bio}"</p>
                    <div className="text-[9.5px] text-gray-400 mt-2 font-mono flex flex-wrap gap-2">
                      <span>Tel: {org.phone}</span>
                      <span>•</span>
                      <span>Email: {org.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-1">
                  <button
                    type="button"
                    onClick={() => handleOpenOrgModal(org)}
                    className="p-1 bg-gray-100 text-[#ffc300] rounded hover:bg-gray-200 transition-all"
                  >
                    <Edit size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteOrg(org.id, org.name)}
                    className="p-1 bg-gray-100 text-rose-400 rounded hover:bg-rose-950 transition-all"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* ── Modal: Visualizar Aluno ── */}
      {viewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setViewStudent(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            style={{ animation: 'fadeInScale .18s ease' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#001856] px-6 py-5 flex items-center gap-4">
              <img
                src={viewStudent.photo}
                alt={viewStudent.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(viewStudent.name)}&background=0B4DA2&color=fff&size=128`;
                }}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-full object-cover border-2 border-[#ffc300] shrink-0"
              />
              <div className="min-w-0">
                <h3 className="text-white font-bold text-lg leading-tight truncate">{viewStudent.name}</h3>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  <span className="text-[10px] font-bold bg-[#ffc300] text-[#001856] px-2 py-0.5 rounded-full uppercase tracking-wide">{viewStudent.classroom}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                    viewStudent.status === 'ativo' ? 'bg-emerald-500 text-white' :
                    viewStudent.status === 'inativo' ? 'bg-amber-500 text-white' :
                    viewStudent.status === 'formado' ? 'bg-indigo-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>{viewStudent.status}</span>
                </div>
              </div>
              <button onClick={() => setViewStudent(null)} className="ml-auto p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors shrink-0">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Instrumento</p>
                  <p className="text-sm font-bold text-[#ffc300]">{viewStudent.instrument || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Data de Nascimento</p>
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-1"><Calendar size={12} className="text-gray-400" />{viewStudent.birthDate || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Telefone</p>
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-1"><Phone size={12} className="text-gray-400" />{viewStudent.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">E-mail</p>
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-1 truncate"><Mail size={12} className="text-gray-400 shrink-0" />{viewStudent.email || '—'}</p>
                </div>
                {viewStudent.guardian && (
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Responsável Legal</p>
                    <p className="text-sm font-semibold text-gray-800">{viewStudent.guardian}</p>
                  </div>
                )}
                {viewStudent.address && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Endereço</p>
                    <p className="text-sm font-semibold text-gray-800 flex items-start gap-1"><MapPin size={12} className="text-gray-400 mt-0.5 shrink-0" />{viewStudent.address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 flex justify-between">
              <button onClick={() => setViewStudent(null)} className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Fechar
              </button>
              <button
                onClick={() => { handleOpenStudentModal(viewStudent); setViewStudent(null); }}
                className="px-4 py-2 text-xs font-bold bg-[#ffc300] hover:bg-yellow-400 text-[#001856] rounded-lg transition-colors"
              >
                Editar Aluno
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODALS ENGINES
          ========================================== */}

      {/* Modal A: Student CRUD form */}
      <Drawer
        open={studentModalOpen && !!activeStudent}
        onClose={() => setStudentModalOpen(false)}
        title={activeStudent?.id ? 'Editar Aluno' : 'Novo Aluno'}
        description="Cadastre ou edite um aluno da filarmônica."
        icon={Users}
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
        onSubmit={handleSaveStudent}
        submitLabel="Salvar Aluno"
        width="w-[600px]"
      >
        {activeStudent && (<>
          <DrawerSection title="Dados Pessoais">
            <div className="grid grid-cols-2 gap-4">
              <DrawerField label="Nome Completo" required>
                <DrawerInput
                  type="text"
                  required
                  value={activeStudent.name || ''}
                  onChange={(e) => setActiveStudent({ ...activeStudent, name: e.target.value })}
                />
              </DrawerField>
              <DrawerField label="Data de Nascimento">
                <DrawerInput
                  type="date"
                  value={activeStudent.birthDate || ''}
                  onChange={(e) => setActiveStudent({ ...activeStudent, birthDate: e.target.value })}
                />
              </DrawerField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <DrawerField label="Telefone/Celular">
                <DrawerInput
                  type="text"
                  value={activeStudent.phone || ''}
                  onChange={(e) => {
                    const masked = e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 11)
                      .replace(/^(\d{2})(\d)/, '($1) $2')
                      .replace(/(\d{5})(\d)/, '$1-$2');
                    setActiveStudent({ ...activeStudent, phone: masked });
                  }}
                  placeholder="(11) 99999-9999"
                />
              </DrawerField>
              <DrawerField label="Responsável (se menor)">
                <DrawerInput
                  type="text"
                  value={activeStudent.guardian || ''}
                  onChange={(e) => setActiveStudent({ ...activeStudent, guardian: e.target.value })}
                  placeholder="Nome do Pai/Mãe..."
                />
              </DrawerField>
            </div>
            <DrawerField label="E-mail" required>
              <DrawerInput
                type="email"
                required
                value={activeStudent.email || ''}
                onChange={(e) => setActiveStudent({ ...activeStudent, email: e.target.value })}
              />
            </DrawerField>
          </DrawerSection>

          <DrawerSection title="Formação Musical">
            <div className="grid grid-cols-2 gap-4">
              <DrawerField label="Instrumento Principal">
                <DrawerSelect
                  value={activeStudent.instrument || ''}
                  onChange={(e) => setActiveStudent({ ...activeStudent, instrument: e.target.value })}
                >
                  <option value="">Selecione Instrumento...</option>
                  <option value="Trompete Bb">Trompete Bb</option>
                  <option value="Trombone de Vara">Trombone de Vara</option>
                  <option value="Trompa Solista">Trompa Solista</option>
                  <option value="Tuba Grave">Tuba Grave</option>
                  <option value="Bombardino Bb">Bombardino Bb</option>
                  <option value="Percussão Sinfônica">Percussão Sinfônica</option>
                </DrawerSelect>
              </DrawerField>
              <DrawerField label="Turma de Admissão">
                <DrawerSelect
                  value={activeStudent.classroom || ''}
                  onChange={(e) => setActiveStudent({ ...activeStudent, classroom: e.target.value })}
                >
                  <option value="Iniciante">Iniciante</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                  <option value="Formado">Formado</option>
                </DrawerSelect>
              </DrawerField>
            </div>
            <DrawerField label="Status Atribuição">
              <DrawerSelect
                value={activeStudent.status || 'ativo'}
                onChange={(e) => setActiveStudent({ ...activeStudent, status: e.target.value as any })}
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="trancado">Trancado</option>
                <option value="formado">Formado</option>
                <option value="arquivado">Arquivado</option>
              </DrawerSelect>
            </DrawerField>
          </DrawerSection>

          <DrawerSection title="Endereço">
            <div className="grid grid-cols-3 gap-3">
              <DrawerField label="CEP">
                <DrawerInput
                  type="text"
                  value={activeStudent.zipCode || ''}
                  onChange={(e) => setActiveStudent({ ...activeStudent, zipCode: e.target.value })}
                  onBlur={async (e) => {
                    const cep = e.target.value.replace(/\D/g, '');
                    if (cep.length !== 8) return;
                    try {
                      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                      const data = await res.json();
                      if (!data.erro) {
                        setActiveStudent(prev => prev ? {
                          ...prev,
                          street: data.logradouro || prev.street,
                          neighborhood: data.bairro || prev.neighborhood,
                          city: data.localidade || prev.city,
                          uf: data.uf || prev.uf,
                        } : prev);
                      }
                    } catch {}
                  }}
                  placeholder="00000-000"
                  maxLength={9}
                />
              </DrawerField>
              <div className="col-span-2">
                <DrawerField label="Rua / Logradouro">
                  <DrawerInput
                    type="text"
                    value={activeStudent.street || ''}
                    onChange={(e) => setActiveStudent({ ...activeStudent, street: e.target.value })}
                    placeholder="Ex: Rua das Flores"
                  />
                </DrawerField>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <DrawerField label="Número">
                <DrawerInput
                  type="text"
                  value={activeStudent.number || ''}
                  onChange={(e) => setActiveStudent({ ...activeStudent, number: e.target.value })}
                  placeholder="Ex: 123"
                />
              </DrawerField>
              <div className="col-span-2">
                <DrawerField label="Complemento">
                  <DrawerInput
                    type="text"
                    value={activeStudent.complement || ''}
                    onChange={(e) => setActiveStudent({ ...activeStudent, complement: e.target.value })}
                    placeholder="Ex: Apto 12, Bloco B"
                  />
                </DrawerField>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <DrawerField label="Bairro">
                <DrawerInput
                  type="text"
                  value={activeStudent.neighborhood || ''}
                  onChange={(e) => setActiveStudent({ ...activeStudent, neighborhood: e.target.value })}
                  placeholder="Ex: Centro"
                />
              </DrawerField>
              <DrawerField label="Cidade">
                <DrawerInput
                  type="text"
                  value={activeStudent.city || ''}
                  onChange={(e) => setActiveStudent({ ...activeStudent, city: e.target.value })}
                  placeholder="Ex: Americana"
                />
              </DrawerField>
              <DrawerField label="UF">
                <DrawerSelect
                  value={activeStudent.uf || ''}
                  onChange={(e) => setActiveStudent({ ...activeStudent, uf: e.target.value })}
                >
                  <option value="">--</option>
                  {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </DrawerSelect>
              </DrawerField>
            </div>
          </DrawerSection>

          <DrawerSection title="Foto" optional>
            <ImageUploader
              allowedTypes="Imagens (.jpg, .png, .webp)"
              onFileSelected={(file, previewUrl) => {
                setPendingStudentPhoto(file);
                setActiveStudent(prev => prev ? { ...prev, photo: previewUrl } : prev);
              }}
            />
          </DrawerSection>
        </>)}
      </Drawer>

      {/* Modal B: Professor CRUD form */}
      <Drawer
        open={profModalOpen && !!activeProf}
        onClose={() => setProfModalOpen(false)}
        title={activeProf?.id ? 'Editar Professor' : 'Novo Professor'}
        description="Cadastre ou edite um professor da filarmônica."
        icon={UserCheck}
        iconBg="bg-amber-50"
        iconColor="text-amber-600"
        onSubmit={handleSaveProf}
        submitLabel="Salvar Professor"
        width="w-[620px]"
      >
        {activeProf && (<>
          <DrawerSection title="Dados do Docente">
            <div className="grid grid-cols-2 gap-4">
              <DrawerField label="Nome Completo" required>
                <DrawerInput
                  type="text"
                  required
                  value={activeProf.name || ''}
                  onChange={(e) => setActiveProf({ ...activeProf, name: e.target.value })}
                />
              </DrawerField>
              <DrawerField label="Papel / Cargo Titular" required>
                <DrawerInput
                  type="text"
                  required
                  value={activeProf.role || ''}
                  onChange={(e) => setActiveProf({ ...activeProf, role: e.target.value })}
                  placeholder="Ex: Chefe de Naipe de Trombones"
                />
              </DrawerField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <DrawerField label="Especialidade Teórica">
                <DrawerInput
                  type="text"
                  value={activeProf.specialty || ''}
                  onChange={(e) => setActiveProf({ ...activeProf, specialty: e.target.value })}
                  placeholder="Ex: Metais graves e o bocal amplo"
                />
              </DrawerField>
              <DrawerField label="Telefone">
                <DrawerInput
                  type="text"
                  value={activeProf.phone || ''}
                  onChange={(e) => {
                    const masked = e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 11)
                      .replace(/^(\d{2})(\d)/, '($1) $2')
                      .replace(/(\d{5})(\d)/, '$1-$2');
                    setActiveProf({ ...activeProf, phone: masked });
                  }}
                  placeholder="(11) 98888-8888"
                />
              </DrawerField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <DrawerField label="Instrumento">
                <DrawerSelect
                  value={activeProf.instrument || ''}
                  onChange={(e) => setActiveProf({ ...activeProf, instrument: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  <option value="Trompete">Trompete</option>
                  <option value="Trombone">Trombone</option>
                  <option value="Trompa">Trompa</option>
                  <option value="Tuba">Tuba</option>
                  <option value="Bombardino">Bombardino</option>
                  <option value="Percussão">Percussão</option>
                  <option value="Regência">Regência</option>
                </DrawerSelect>
              </DrawerField>
              <DrawerField label="E-mail para Recados">
                <DrawerInput
                  type="email"
                  value={activeProf.email || ''}
                  onChange={(e) => setActiveProf({ ...activeProf, email: e.target.value })}
                />
              </DrawerField>
            </div>
          </DrawerSection>

          <DrawerSection title="Biografia">
            <DrawerField label="Breve Bio (Para Sinopse Home)">
              <DrawerInput
                type="text"
                value={activeProf.miniBio || ''}
                onChange={(e) => setActiveProf({ ...activeProf, miniBio: e.target.value })}
                placeholder="Frase de efeito sobre a formação..."
              />
            </DrawerField>
            <DrawerField label="Biografia Completa de Retrospecto">
              <DrawerTextarea
                value={activeProf.fullBio || ''}
                onChange={(e) => setActiveProf({ ...activeProf, fullBio: e.target.value })}
                rows={3}
              />
            </DrawerField>
          </DrawerSection>

          <DrawerSection title="Redes Sociais" optional>
            <div className="grid grid-cols-3 gap-3">
              <DrawerField label="Instagram">
                <DrawerInput
                  type="text"
                  value={activeProf.socialInstagram || ''}
                  onChange={(e) => setActiveProf({ ...activeProf, socialInstagram: e.target.value })}
                />
              </DrawerField>
              <DrawerField label="WhatsApp">
                <DrawerInput
                  type="text"
                  value={activeProf.socialWhatsapp || ''}
                  onChange={(e) => setActiveProf({ ...activeProf, socialWhatsapp: e.target.value })}
                />
              </DrawerField>
              <DrawerField label="YouTube Channel">
                <DrawerInput
                  type="text"
                  value={activeProf.socialYoutube || ''}
                  onChange={(e) => setActiveProf({ ...activeProf, socialYoutube: e.target.value })}
                />
              </DrawerField>
            </div>
          </DrawerSection>

          <DrawerSection title="Configurações">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="highlighted"
                checked={activeProf.highlighted || false}
                onChange={(e) => setActiveProf({ ...activeProf, highlighted: e.target.checked })}
                className="w-4 h-4 bg-gray-50 border border-gray-200 rounded checked:bg-[#ffc300]"
              />
              <label htmlFor="highlighted" className="text-xs font-semibold text-gray-700">Destacar na Capa</label>
            </div>
          </DrawerSection>

          <DrawerSection title="Foto" optional>
            <ImageUploader
              bg={activeProf.photo ? resolveMediaUrl(activeProf.photo) : undefined}
              allowedTypes="Imagens (.jpg, .png, .webp)"
              onFileSelected={(file, previewUrl) => {
                setPendingProfPhoto(file);
                setActiveProf(prev => prev ? { ...prev, photo: previewUrl } : prev);
              }}
            />
          </DrawerSection>
        </>)}
      </Drawer>

      {/* Modal C: Organizer CRUD Form */}
      <Drawer
        open={orgModalOpen && !!activeOrg}
        onClose={() => setOrgModalOpen(false)}
        title={activeOrg?.id ? 'Editar Organizador' : 'Novo Organizador'}
        description="Cadastre ou edite um membro administrativo da filarmônica."
        icon={ShieldAlert}
        iconBg="bg-rose-50"
        iconColor="text-rose-600"
        onSubmit={handleSaveOrg}
        submitLabel="Salvar Organizador"
        width="w-[520px]"
      >
        {activeOrg && (<>
          <DrawerSection title="Dados do Organizador">
            <DrawerField label="Nome Completo" required>
              <DrawerInput
                type="text"
                required
                value={activeOrg.name || ''}
                onChange={(e) => setActiveOrg({ ...activeOrg, name: e.target.value })}
              />
            </DrawerField>
            <DrawerField label="Cargo de Atuação" required>
              <DrawerInput
                type="text"
                required
                value={activeOrg.role || ''}
                onChange={(e) => setActiveOrg({ ...activeOrg, role: e.target.value })}
                placeholder="Ex: Coordenador Fiscal e Transparência"
              />
            </DrawerField>
            <DrawerField label="Mini Bio">
              <DrawerTextarea
                value={activeOrg.bio || ''}
                onChange={(e) => setActiveOrg({ ...activeOrg, bio: e.target.value })}
                rows={2}
              />
            </DrawerField>
            <div className="grid grid-cols-2 gap-4">
              <DrawerField label="Telefone Celular">
                <DrawerInput
                  type="text"
                  value={activeOrg.phone || ''}
                  onChange={(e) => setActiveOrg({ ...activeOrg, phone: e.target.value })}
                  placeholder="(11) 97777-6666"
                />
              </DrawerField>
              <DrawerField label="E-mail Corporativo">
                <DrawerInput
                  type="email"
                  value={activeOrg.email || ''}
                  onChange={(e) => setActiveOrg({ ...activeOrg, email: e.target.value })}
                  placeholder="empresa@orquestra.com"
                />
              </DrawerField>
            </div>
          </DrawerSection>
        </>)}
      </Drawer>



    </div>
  );
}
