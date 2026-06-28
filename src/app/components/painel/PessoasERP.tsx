import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, ShieldAlert, Plus, Search, Filter, Mail, Phone, MapPin, 
  Trash2, Edit, Check, Star, Download, Archive, ArrowUp, ArrowDown, UserPlus, 
  Instagram, Facebook, Youtube, Linkedin, MessageCircle, FileSpreadsheet, X
} from 'lucide-react';
import { Professor, Student, Organizer, AuditLog } from '../../validations/types';
import { ImageUploader, uploadFileToSupabase } from './MiniWidgets';
import { getStudents, createStudent, updateStudent, updateStudentStatus, deleteStudent } from '../../services/studentsService';
import { getProfessors, createProfessor, updateProfessor, updateProfessorHighlight, updateProfessorOrder, deleteProfessor } from '../../services/professorsService';

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

  // Simulated export to CSV modal
  const [exportModalContent, setExportModalContent] = useState<string | null>(null);

  const [studentsLoading, setStudentsLoading] = useState(true);
  const [pendingStudentPhoto, setPendingStudentPhoto] = useState<File | null>(null);
  const [pendingProfPhoto, setPendingProfPhoto] = useState<File | null>(null);


  // useEffect de carregamento — coloque ANTES do useEffect do selectedEntityForEdit
useEffect(() => {
  getStudents()
    .then(setStudents)
    .catch((err) => console.error('Erro ao carregar alunos:', err))
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
      finalPhoto = await uploadFileToSupabase(pendingProfPhoto, 'professors');
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
  try {
    await updateProfessorHighlight(id, active);
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
      updateProfessorOrder(a.id, b.order),
      updateProfessorOrder(b.id, tempOrder),
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


  // Mock list exporter
  const handleExportStudents = () => {
    let csv = 'ID,Nome Completo,Status,Turma,Instrumento,Responsavel,Telefone,Email,Data Nascimento\n';
    students.forEach(s => {
      csv += `"${s.id}","${s.name}","${s.status}","${s.classroom}","${s.instrument}","${s.guardian || ''}","${s.phone}","${s.email}","${s.birthDate}"\n`;
    });
    setExportModalContent(csv);
    addAuditLog('Exportou Alunos', 'Alunos', `Exportou lista de ${students.length} alunos inscritos formate CSV`);
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
      
      {/* Top bar header */}
      <div className="pb-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#001856] font-sans tracking-tight flex items-center">
            <Users className="mr-2 text-[#ffc300]" size={20} />
            Gestão Integrada de Pessoas (SaaS ERP)
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Cadastre professores titulares do corpo docente, emita matrículas escolares e regule credenciais da diretoria.
          </p>
        </div>

        {/* Local switcher nested */}
        <div className="flex bg-gray-100 border border-gray-200 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setSubTab('alunos')}
            className={`p-1.5 px-3 rounded-md font-semibold cursor-pointer transition-all ${subTab === 'alunos' ? 'bg-[#001856] text-white shadow' : 'text-gray-400'}`}
          >
            Alunos Bolsistas
          </button>
          <button
            type="button"
            onClick={() => setSubTab('professores')}
            className={`p-1.5 px-3 rounded-md font-semibold cursor-pointer transition-all ${subTab === 'professores' ? 'bg-[#001856] text-white shadow' : 'text-gray-400'}`}
          >
            Corpo de Professores
          </button>
  
        </div>
      </div>

      {/* ==========================================================
          SUBTAB 1: STUDENTS DIRECTORY TABLE (ERP INTRICATE)
          ========================================================== */}
      {subTab === 'alunos' && (
        <div className="space-y-4">
          
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
                className="p-2 px-3 bg-[#001856] hover:bg-[#001856] text-white rounded text-xs font-semibold cursor-pointer flex items-center"
              >
                <UserPlus size={13} className="mr-1.5" /> Novo Aluno
              </button>
            </div>
          </div>

          {/* Real Grid table presentation */}
          {studentsLoading && (
  <div className="text-center py-8 text-xs text-gray-400 font-mono">Carregando alunos...</div>
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
                    <tr key={alu.id} className="hover:bg-gray-50 transition-all">
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
                        <div>
                          <span className="block font-bold text-gray-800">{alu.name}</span>
                          <span className="text-[10px] text-gray-400 font-mono">ID: {alu.id}</span>
                        </div>
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
    alu.status === 'ativo'     ? 'bg-emerald-950 text-emerald-400' :
    alu.status === 'inativo'   ? 'bg-amber-950 text-amber-400' :
    alu.status === 'formado'   ? 'bg-indigo-950 text-indigo-400' :
    alu.status === 'trancado'  ? 'bg-violet-950 text-violet-400' :
    'bg-gray-100 text-gray-400'
  }`}>
    {alu.status === 'ativo'    && 'Ativo'}
    {alu.status === 'inativo'  && 'Inativo'}
    {alu.status === 'formado'  && 'Formado'}
    {alu.status === 'trancado' && 'Trancado'}
    {alu.status === 'arquivado' && 'Arquivado'}
  </span>
</td>
                      <td className="p-3 text-right pr-4 space-x-2">
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
                        <button
                          type="button"
                          onClick={() => handleDeleteStudent(alu.id, alu.name)}
                          className="p-1 px-1.5 bg-gray-100 hover:bg-rose-950 rounded text-rose-400 hover:text-rose-200 transition-all cursor-pointer"
                        >
                          <Trash2 size={11} />
                        </button>
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
              className="p-2 px-3 bg-[#001856] hover:bg-[#001856] text-white text-xs font-semibold rounded cursor-pointer flex items-center"
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
                    src={prof.photo || getProfessorAvatarFallback(prof.name)} 
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
              className="p-2 px-3 bg-[#001856] text-white text-xs font-semibold rounded cursor-pointer"
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


      {/* ==========================================
          MODALS ENGINES
          ========================================== */}
      
      {/* Modal A: Student CRUD form */}
      {studentModalOpen && activeStudent && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-fade-in">
  <form 
    onSubmit={handleSaveStudent}
    className="w-full max-w-xl bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xl space-y-4"
  >
    <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
      <h3 className="text-xs font-mono font-bold text-[#ffc300] uppercase tracking-widest">
        {activeStudent.id ? 'Alterar Ficha do Aluno' : 'Cadastrar Novo Aluno'}
      </h3>
      <button type="button" onClick={() => setStudentModalOpen(false)} className="text-gray-400 hover:text-[#001856]">Fechar</button>
    </div>

    <div className="p-5 space-y-3.5 max-h-[500px] overflow-y-auto">

      {/* Nome + Data nascimento */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Nome Completo</label>
          <input
            type="text"
            required
            value={activeStudent.name || ''}
            onChange={(e) => setActiveStudent({ ...activeStudent, name: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 text-[#001856] p-2 text-xs rounded focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Data de Nascimento</label>
          <input
            type="date"
            value={activeStudent.birthDate || ''}
            onChange={(e) => setActiveStudent({ ...activeStudent, birthDate: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 text-[#001856] p-2 text-xs rounded focus:outline-none font-mono"
          />
        </div>
      </div>

      {/* Instrumento + Turma */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Instrumento Principal</label>
          <select
            value={activeStudent.instrument || ''}
            onChange={(e) => setActiveStudent({ ...activeStudent, instrument: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 text-gray-400 p-2 text-xs rounded focus:outline-none"
          >
            <option value="">Selecione Instrumento...</option>
            <option value="Trompete Bb">Trompete Bb</option>
            <option value="Trombone de Vara">Trombone de Vara</option>
            <option value="Trompa Solista">Trompa Solista</option>
            <option value="Tuba Grave">Tuba Grave</option>
            <option value="Bombardino Bb">Bombardino Bb</option>
            <option value="Percussão Sinfônica">Percussão Sinfônica</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Turma de Admissão</label>
          <select
            value={activeStudent.classroom || ''}
            onChange={(e) => setActiveStudent({ ...activeStudent, classroom: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 text-gray-400 p-2 text-xs rounded focus:outline-none"
          >
            <option value="Iniciante">Iniciante</option>
            <option value="Intermediário">Intermediário</option>
            <option value="Avançado">Avançado</option>
            <option value="Formado">Formado</option>
          </select>
        </div>
      </div>

      {/* Telefone + Responsável */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Telefone/Celular</label>
          <input
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
            className="w-full bg-gray-50 border border-gray-200 text-[#001856] p-2 text-xs rounded focus:outline-none"
            placeholder="(11) 99999-9999"
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Responsável (se menor)</label>
          <input
            type="text"
            value={activeStudent.guardian || ''}
            onChange={(e) => setActiveStudent({ ...activeStudent, guardian: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 text-[#001856] p-2 text-xs rounded"
            placeholder="Nome do Pai/Mãe..."
          />
        </div>
      </div>

      {/* E-mail */}
      <div>
        <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">E-mail</label>
        <input
          type="email"
          required
          value={activeStudent.email || ''}
          onChange={(e) => setActiveStudent({ ...activeStudent, email: e.target.value })}
          className="w-full bg-gray-50 border border-gray-200 text-[#001856] p-2 text-xs rounded focus:outline-none"
        />
      </div>

      {/* Endereço estruturado */}
      <div className="space-y-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
        <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">
          Endereço
        </label>

        {/* CEP + Rua */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">CEP</label>
            <input
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
              className="w-full bg-gray-50 border border-gray-200 text-[#001856] p-2 text-xs rounded font-mono focus:outline-none"
              placeholder="00000-000"
              maxLength={9}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Rua / Logradouro</label>
            <input
              type="text"
              value={activeStudent.street || ''}
              onChange={(e) => setActiveStudent({ ...activeStudent, street: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 text-[#001856] p-2 text-xs rounded focus:outline-none"
              placeholder="Ex: Rua das Flores"
            />
          </div>
        </div>

        {/* Número + Complemento */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Número</label>
            <input
              type="text"
              value={activeStudent.number || ''}
              onChange={(e) => setActiveStudent({ ...activeStudent, number: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 text-[#001856] p-2 text-xs rounded font-mono focus:outline-none"
              placeholder="Ex: 123"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Complemento</label>
            <input
              type="text"
              value={activeStudent.complement || ''}
              onChange={(e) => setActiveStudent({ ...activeStudent, complement: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 text-[#001856] p-2 text-xs rounded focus:outline-none"
              placeholder="Ex: Apto 12, Bloco B"
            />
          </div>
        </div>

        {/* Bairro + Cidade + UF */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Bairro</label>
            <input
              type="text"
              value={activeStudent.neighborhood || ''}
              onChange={(e) => setActiveStudent({ ...activeStudent, neighborhood: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 text-[#001856] p-2 text-xs rounded focus:outline-none"
              placeholder="Ex: Centro"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Cidade</label>
            <input
              type="text"
              value={activeStudent.city || ''}
              onChange={(e) => setActiveStudent({ ...activeStudent, city: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 text-[#001856] p-2 text-xs rounded focus:outline-none"
              placeholder="Ex: Americana"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">UF</label>
            <select
              value={activeStudent.uf || ''}
              onChange={(e) => setActiveStudent({ ...activeStudent, uf: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 text-gray-400 p-2 text-xs rounded font-mono focus:outline-none"
            >
              <option value="">--</option>
              {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Status + Foto */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Status Atribuição</label>
          <select
            value={activeStudent.status || 'ativo'}
            onChange={(e) => setActiveStudent({ ...activeStudent, status: e.target.value as any })}
            className="w-full bg-gray-50 border border-gray-200 text-gray-400 p-2 text-xs rounded focus:outline-none font-bold"
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="trancado">Trancado</option>
            <option value="formado">Formado</option>
            <option value="arquivado">Arquivado</option>
          </select>
        </div>
        <div className="flex flex-col justify-end">
          <label className="block text-[10px] font-mono uppercase text-gray-400 mb-2">Inserção de Foto</label>
            {/* Preview da foto atual */}

          <ImageUploader
            allowedTypes="Imagens (.jpg, .png, .webp)"
            bg={activeStudent.photo && activeStudent.photo}
            onFileSelected={(file, previewUrl) => {
              setPendingStudentPhoto(file);
              setActiveStudent(prev => prev ? { ...prev, photo: previewUrl } : prev);
            }}
          />
        </div>
      </div>

    </div>

    <div className="bg-gray-50 p-3 border-t border-gray-200 flex justify-end space-x-2">
      <button type="button" onClick={() => setStudentModalOpen(false)} className="text-xs text-gray-400 px-3 py-1 bg-gray-100 rounded">Cancelar</button>
      <button type="submit" className="text-xs text-white px-5 py-1 bg-[#001856] rounded">Confirmar Ficha Aluno</button>
    </div>
  </form>
</div>
      )}

      {/* Modal B: Professor CRUD form */}
      {profModalOpen && activeProf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-fade-in">
          <form 
            onSubmit={handleSaveProf}
            className="w-full max-w-2xl bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xl space-y-4"
          >
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xs font-mono font-bold text-[#ffc300] uppercase tracking-wider">
                {activeProf.id ? 'Alterar Cadastro Professor' : 'Registrar Novo Docente'}
              </h3>
              <button type="button" onClick={() => setProfModalOpen(false)} className="text-gray-400">Fechar</button>
            </div>

            <div className="p-4 space-y-3.5 max-h-[460px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    value={activeProf.name || ''}
                    onChange={(e) => setActiveProf({ ...activeProf, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-[#001856] p-2 text-xs rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Papel / Cargo Titular</label>
                  <input 
                    type="text" 
                    required
                    value={activeProf.role || ''}
                    onChange={(e) => setActiveProf({ ...activeProf, role: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-[#001856] p-2 text-xs rounded focus:outline-none"
                    placeholder="Ex: Chefe de Naipe de Trombones"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Especialidade Teórica</label>
                  <input 
                    type="text" 
                    value={activeProf.specialty || ''}
                    onChange={(e) => setActiveProf({ ...activeProf, specialty: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-[#001856] p-2 text-xs rounded"
                    placeholder="Ex: Metais graves e o bocal amplo"
                  />
                </div>
           <div>
  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Telefone Fone</label>
  <input
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
    className="w-full bg-gray-50 border border-gray-200 text-[#001856] p-2 text-xs rounded"
    placeholder="(11) 98888-8888"
  />
</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Breve Bio (Para Sinopse Home)</label>
                  <input 
                    type="text" 
                    value={activeProf.miniBio || ''}
                    onChange={(e) => setActiveProf({ ...activeProf, miniBio: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-[#001856] p-2 text-xs rounded focus:outline-none"
                    placeholder="Frase de efeito sobre a formação..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">E-mail para Recados</label>
                  <input 
                    type="email" 
                    value={activeProf.email || ''}
                    onChange={(e) => setActiveProf({ ...activeProf, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-[#001856] p-2 text-xs rounded focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Biografia Completa de Retrospecto</label>
                <textarea 
                  value={activeProf.fullBio || ''}
                  onChange={(e) => setActiveProf({ ...activeProf, fullBio: e.target.value })}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 text-[#001856] p-2 text-xs rounded focus:outline-none"
                />
              </div>

              {/* Social networks urls */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[8px] font-mono uppercase text-gray-400 mb-1">Instagram</label>
                  <input 
                    type="text" 
                    value={activeProf.socialInstagram || ''}
                    onChange={(e) => setActiveProf({ ...activeProf, socialInstagram: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-[#001856] p-1 text-[11px] rounded"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-gray-400 mb-1">WhatsApp direto</label>
                  <input 
                    type="text" 
                    value={activeProf.socialWhatsapp || ''}
                    onChange={(e) => setActiveProf({ ...activeProf, socialWhatsapp: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-[#001856] p-1 text-[11px] rounded"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-gray-400 mb-1">YouTube Channel</label>
                  <input 
                    type="text" 
                    value={activeProf.socialYoutube || ''}
                    onChange={(e) => setActiveProf({ ...activeProf, socialYoutube: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-[#001856] p-1 text-[11px] rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="highlighted"
                    checked={activeProf.highlighted || false}
                    onChange={(e) => setActiveProf({ ...activeProf, highlighted: e.target.checked })}
                    className="w-4 h-4 bg-gray-50 border border-gray-200 rounded checked:bg-[#ffc300]"
                  />
                  <label htmlFor="highlighted" className="text-[10px] font-mono uppercase text-gray-400">Destacar na Capa</label>
                </div>
           <div>
  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Instrumento</label>
  <select
    value={activeProf.instrument || ''}
    onChange={(e) => setActiveProf({ ...activeProf, instrument: e.target.value })}
    className="w-full bg-gray-50 border border-gray-200 text-gray-400 p-2 text-xs rounded focus:outline-none"
  >
    <option value="">Selecione...</option>
    <option value="Trompete">Trompete</option>
    <option value="Trombone">Trombone</option>
    <option value="Trompa">Trompa</option>
    <option value="Tuba">Tuba</option>
    <option value="Bombardino">Bombardino</option>
    <option value="Percussão">Percussão</option>
    <option value="Regência">Regência</option>
  </select>
</div>

{/* mini_bio e full_bio são NOT NULL — marque como required */}


{/* ImageUploader — troque onUploadSuccess pelo padrão onFileSelected */}
<div className="flex flex-col justify-end">
  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-2">Foto do Professor</label>

  <ImageUploader
  bg={activeProf.photo && activeProf.photo}
    allowedTypes="Imagens (.jpg, .png, .webp)"
    onFileSelected={(file, previewUrl) => {
      setPendingProfPhoto(file);
      setActiveProf(prev => prev ? { ...prev, photo: previewUrl } : prev);
    }}
  />
</div>
              </div>

            </div>

            <div className="bg-gray-50 p-3 border-t border-gray-200 flex justify-end space-x-2">
              <button type="button" onClick={() => setProfModalOpen(false)} className="text-xs text-gray-400 px-3 py-1 bg-gray-100 rounded">Cancelar</button>
              <button type="submit" className="text-xs text-white px-5 py-1 bg-[#001856] rounded">Confirmar Registro Docente</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal C: Organizer CRUD Form */}
      {orgModalOpen && activeOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <form 
            onSubmit={handleSaveOrg}
            className="w-full max-w-md bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xl space-y-4"
          >
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xs font-mono font-bold text-[#ffc300] uppercase tracking-wider">
                {activeOrg.id ? 'Alterar Dados Administrativo' : 'Adicionar Novo Organizador'}
              </h3>
              <button type="button" onClick={() => setOrgModalOpen(false)} className="text-gray-400">Fechar</button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  required
                  value={activeOrg.name || ''}
                  onChange={(e) => setActiveOrg({ ...activeOrg, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2 text-xs text-[#001856] rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Cargo de Atuação</label>
                <input 
                  type="text" 
                  required
                  value={activeOrg.role || ''}
                  onChange={(e) => setActiveOrg({ ...activeOrg, role: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2 text-xs text-[#001856] rounded focus:outline-none whitespace-normal"
                  placeholder="Ex: Coordenador Fiscal e Transparência"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Mini Bio</label>
                <textarea 
                  value={activeOrg.bio || ''}
                  onChange={(e) => setActiveOrg({ ...activeOrg, bio: e.target.value })}
                  rows={2}
                  className="w-full bg-gray-50 border border-gray-200 p-2 text-xs text-[#001856] rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Telefone Celular</label>
                  <input 
                    type="text" 
                    value={activeOrg.phone || ''}
                    onChange={(e) => setActiveOrg({ ...activeOrg, phone: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-2 text-xs text-[#001856] rounded"
                    placeholder="(11) 97777-6666"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">E-mail Corporativo</label>
                  <input 
                    type="email" 
                    value={activeOrg.email || ''}
                    onChange={(e) => setActiveOrg({ ...activeOrg, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-2 text-xs text-[#ffc300] rounded font-mono"
                    placeholder="empresa@orquestra.com"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-3 border-t border-gray-200 flex justify-end space-x-2">
              <button type="button" onClick={() => setOrgModalOpen(false)} className="text-xs text-gray-400 px-3 py-1 bg-gray-100 rounded select-none cursor-pointer">Cancelar</button>
              <button type="submit" className="text-xs text-white px-5 py-1 bg-[#001856] rounded select-none cursor-pointer">Salvar Organizador</button>
            </div>
          </form>
        </div>
      )}


      {/* Modal D: Simulated Exporter visual outcome */}
      {exportModalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-fade-in">
          <div className="w-full max-w-xl bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-emerald-400 flex items-center">
                <FileSpreadsheet size={14} className="mr-2" />
                DADOS EXPORTADOS COM SUCESSO (CSV SPRESS)
              </span>
              <button onClick={() => setExportModalContent(null)} className="text-gray-400 hover:text-[#001856]">Fechar</button>
            </div>
            
            <div className="p-4 bg-gray-50 font-mono text-[10px] text-gray-500 overflow-auto max-h-72">
              <pre>{exportModalContent}</pre>
            </div>

            <div className="p-3 bg-white border-t border-gray-200 text-right">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(exportModalContent);
                  alert('String CSV copiada para a área de transferência!');
                  setExportModalContent(null);
                }}
                className="p-1 px-4 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-mono font-semibold text-xs transition-all cursor-pointer"
              >
                Copiar Linhas CSV
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
