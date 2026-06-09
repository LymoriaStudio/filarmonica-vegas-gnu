import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, ShieldAlert, Plus, Search, Filter, Mail, Phone, MapPin, 
  Trash2, Edit, Check, Star, Download, Archive, ArrowUp, ArrowDown, UserPlus, 
  Instagram, Facebook, Youtube, Linkedin, MessageCircle, FileSpreadsheet, X
} from 'lucide-react';
import { Professor, Student, Organizer, AuditLog } from '../../validations/types';
import { ImageUploader } from './MiniWidgets';

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
  setSelectedEntityForEdit
}: PessoasERPProps) {
  const [subTab, setSubTab] = useState<'alunos' | 'professores' | 'organizadores'>('alunos');

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


  // ==========================================
  // PROFESSORS MANAGEMENT (CARDS)
  // ==========================================
  const handleOpenProfModal = (prof: Partial<Professor> | null) => {
    setActiveProf(prof || {
      id: '',
      name: '',
      photo: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&h=400&q=80',
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
      order: professors.length + 1
    });
    setProfModalOpen(true);
  };

  const handleSaveProf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProf) return;

    if (activeProf.id) {
      setProfessors(prev => prev.map(p => p.id === activeProf.id ? (activeProf as Professor) : p));
      addAuditLog('Alterou Professor', 'Professores', `Editou cadastro de: ${activeProf.name}`);
    } else {
      const newProf = { ...activeProf, id: `prof-${Date.now()}` } as Professor;
      setProfessors(prev => [...prev, newProf]);
      addAuditLog('Cadastrou Professor', 'Professores', `Inseriu novo professor titular: ${newProf.name}`);
    }
    setProfModalOpen(false);
  };

  const handleDeleteProf = (id: string, name: string) => {
    setProfessors(prev => prev.filter(p => p.id !== id));
    addAuditLog('Deletou Professor', 'Professores', `Removeu cadastro docente ID: ${id} (${name})`);
  };

  const handleToggleHighlightProf = (id: string, name: string, active: boolean) => {
    setProfessors(prev => prev.map(p => p.id === id ? { ...p, highlighted: active } : p));
    addAuditLog('Destacou Professor', 'Professores', `${active ? 'Destacou' : 'Ocultou'} professor ${name} na homepage`);
  };

  const handleOrderProf = (index: number, direction: 'up' | 'down') => {
    const sorted = [...professors].sort((a,b)=>a.order-b.order);
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    const temp = sorted[index].order;
    sorted[index].order = sorted[targetIdx].order;
    sorted[targetIdx].order = temp;

    setProfessors(sorted);
  };


  // ==========================================
  // STUDENTS MANAGEMENT (TABLE)
  // ==========================================
  const handleOpenStudentModal = (student: Partial<Student> | null) => {
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

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) return;

    if (activeStudent.id) {
      setStudents(prev => prev.map(s => s.id === activeStudent.id ? (activeStudent as Student) : s));
      addAuditLog('Alterou Cadastro Aluno', 'Alunos', `Atualizou matrícula de: ${activeStudent.name}`);
    } else {
      const newSt = { ...activeStudent, id: `alu-${Date.now()}` } as Student;
      setStudents(prev => [...prev, newSt]);
      addAuditLog('Matriculou Aluno', 'Alunos', `Matriculou novo bolsista: ${newSt.name}`);
    }
    setStudentModalOpen(false);
  };

  const handleDeleteStudent = (id: string, name: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    addAuditLog('Deletou Matrícula Aluno', 'Alunos', `Removeu matrícula ID: ${id} (${name})`);
  };

  const handleArchiveStudent = (id: string, name: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: 'archived' } : s));
    addAuditLog('Arquivou Aluno', 'Alunos', `Alterou status de: ${name} para Arquivado`);
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
  const filteredStudents = students.filter(s => {
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
      <div className="pb-4 border-b border-neutral-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 font-sans tracking-tight flex items-center">
            <Users className="mr-2 text-amber-500" size={20} />
            Gestão Integrada de Pessoas (SaaS ERP)
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Cadastre professores titulares do corpo docente, emita matrículas escolares e regule credenciais da diretoria.
          </p>
        </div>

        {/* Local switcher nested */}
        <div className="flex bg-neutral-900 border border-neutral-800 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setSubTab('alunos')}
            className={`p-1.5 px-3 rounded-md font-semibold cursor-pointer transition-all ${subTab === 'alunos' ? 'bg-[#0B4DA2] text-white shadow' : 'text-neutral-400'}`}
          >
            Alunos Bolsistas
          </button>
          <button
            type="button"
            onClick={() => setSubTab('professores')}
            className={`p-1.5 px-3 rounded-md font-semibold cursor-pointer transition-all ${subTab === 'professores' ? 'bg-[#0B4DA2] text-white shadow' : 'text-neutral-400'}`}
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
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Search box search inputs */}
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2.5 text-neutral-500" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Localizar Aluno (Nome/Meta)..."
                  className="bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs p-2 pl-8 rounded-lg focus:outline-none focus:border-[#0B4DA2] w-56 font-sans"
                />
              </div>

              {/* Status filtering */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 text-neutral-400 text-xs p-2 rounded-lg focus:outline-none"
              >
                <option value="all">Todos Status Matrícula</option>
                <option value="active">Alunos Ativos</option>
                <option value="inactive">Afastados / Inativos</option>
                <option value="graduated">Formados</option>
                <option value="archived">Arquivados</option>
              </select>

              {/* Instrument filter selection */}
              <select
                value={instrumentFilter}
                onChange={(e) => setInstrumentFilter(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 text-neutral-400 text-xs p-2 rounded-lg focus:outline-none"
              >
                <option value="all">Sopros / Percussão</option>
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
                className="p-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 rounded text-xs font-semibold cursor-pointer flex items-center"
              >
                <Download size={13} className="mr-1.5" /> Exportar Lista
              </button>
              <button
                type="button"
                onClick={() => handleOpenStudentModal(null)}
                className="p-2 px-3 bg-[#0B4DA2] hover:bg-blue-750 text-white rounded text-xs font-semibold cursor-pointer flex items-center"
              >
                <UserPlus size={13} className="mr-1.5" /> Novo Aluno
              </button>
            </div>
          </div>

          {/* Real Grid table presentation */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-950/70 border-b border-neutral-800 text-neutral-500 font-mono uppercase tracking-wider">
                  <th className="p-3 pl-4">Nome Bolsista</th>
                  <th className="p-3">Turma</th>
                  <th className="p-3">Instrumento</th>
                  <th className="p-3">Responsável Legal</th>
                  <th className="p-3">Telefone & E-mail</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right pr-4">Gerenciar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-neutral-500 font-serif italic">Nenhum aluno corresponde a esta filtragem orquestral.</td>
                  </tr>
                ) : (
                  filteredStudents.map((alu) => (
                    <tr key={alu.id} className="hover:bg-neutral-950/40 transition-all">
                      <td className="p-3 pl-4 flex items-center space-x-2.5">
                        <img 
                          src={alu.photo} 
                          alt={alu.name} 
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-full object-cover border border-neutral-850 shrink-0" 
                        />
                        <div>
                          <span className="block font-bold text-neutral-200">{alu.name}</span>
                          <span className="text-[10px] text-neutral-500 font-mono">ID: {alu.id}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="bg-neutral-800 text-neutral-300 p-0.5 px-1.5 rounded text-[10px]">
                          {alu.classroom}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-amber-500">{alu.instrument}</span>
                      </td>
                      <td className="p-3 text-neutral-400 font-medium">
                        {alu.guardian ? alu.guardian : <span className="text-neutral-600 font-bold">Maior de Idade</span>}
                      </td>
                      <td className="p-3 text-[10.5px] font-mono whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <Phone size={9} className="text-[#0B4DA2]" />
                          <span>{alu.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1 mt-0.5 text-neutral-500">
                          <Mail size={9} />
                          <span>{alu.email}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-block p-1 px-2 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          alu.status === 'active' ? 'bg-emerald-950 text-emerald-400' :
                          alu.status === 'inactive' ? 'bg-amber-950 text-amber-400' :
                          alu.status === 'graduated' ? 'bg-indigo-950 text-indigo-400' :
                          'bg-neutral-850 text-neutral-500'
                        }`}>
                          {alu.status === 'active' && 'Ativo'}
                          {alu.status === 'inactive' && 'Inativo'}
                          {alu.status === 'graduated' && 'Formado'}
                          {alu.status === 'archived' && 'Arquivado'}
                        </span>
                      </td>
                      <td className="p-3 text-right pr-4 space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenStudentModal(alu)}
                          className="p-1 px-1.5 bg-neutral-800 hover:bg-neutral-750 rounded text-neutral-300 hover:text-white transition-all cursor-pointer"
                        >
                          <Edit size={11} />
                        </button>
                        {alu.status !== 'archived' && (
                          <button
                            type="button"
                            title="Arquivar no ERP"
                            onClick={() => handleArchiveStudent(alu.id, alu.name)}
                            className="p-1 px-1.5 bg-neutral-800 hover:bg-amber-950 rounded text-amber-500 hover:text-amber-200 transition-all cursor-pointer"
                          >
                            <Archive size={11} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteStudent(alu.id, alu.name)}
                          className="p-1 px-1.5 bg-neutral-800 hover:bg-rose-950 rounded text-rose-400 hover:text-rose-200 transition-all cursor-pointer"
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
          <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
            <div>
              <h3 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">Maestros, Chefes de Naipe e Auxiliares</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">Gestão de professores em formato card para o site público institucional.</p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenProfModal(null)}
              className="p-2 px-3 bg-[#0B4DA2] hover:bg-blue-750 text-white text-xs font-semibold rounded cursor-pointer flex items-center"
            >
              + Adicionar Novo Professor
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xxl:grid-cols-3 gap-6">
            {professors.sort((a,b)=>a.order-b.order).map((prof, idx) => (
              <div 
                key={prof.id} 
                className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 flex flex-col justify-between hover:border-neutral-700 transition-all"
              >
                {/* Header detail */}
                <div className="p-4 bg-neutral-950 border-b border-neutral-850 flex items-start gap-4">
                  <img 
                    src={prof.photo} 
                    alt={prof.name} 
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 object-cover rounded-lg border border-neutral-800 shrink-0" 
                  />
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <h4 className="text-xs font-bold text-neutral-100 truncate">{prof.name}</h4>
                      {prof.highlighted && (
                        <Star size={11} className="fill-[#F2C94C] text-[#F2C94C] shrink-0" />
                      )}
                    </div>
                    <span className="block text-[10px] font-medium text-amber-500 mt-0.5 font-mono">{prof.role}</span>
                    <span className="block text-[10px] text-neutral-400 mt-0.5 uppercase tracking-wide">Especialidade: {prof.specialty}</span>
                  </div>
                </div>

                {/* Narrative mini biography */}
                <div className="p-4 flex-1 text-[11px] text-neutral-400 leading-relaxed bg-neutral-900/40">
                  <span className="text-[9.5px] uppercase font-mono font-semibold tracking-wider text-neutral-600 block mb-1">Sinopse de Apresentação</span>
                  <p className="line-clamp-3">"{prof.miniBio}"</p>

                  <div className="mt-4 pt-3 border-t border-neutral-800 flex flex-wrap gap-1.5 text-[10px] font-mono text-neutral-500">
                    <span>{prof.email}</span>
                    <span>•</span>
                    <span>{prof.phone}</span>
                  </div>

                  {/* Social links integration indicators */}
                  <div className="mt-3 flex items-center space-x-2 text-neutral-600">
                    {prof.socialInstagram && <Instagram size={11} className="hover:text-pink-400 cursor-pointer" />}
                    {prof.socialFacebook && <Facebook size={11} className="hover:text-indigo-400 cursor-pointer" />}
                    {prof.socialYoutube && <Youtube size={11} className="hover:text-red-400 cursor-pointer" />}
                    {prof.socialLinkedin && <Linkedin size={11} className="hover:text-sky-450 cursor-pointer" />}
                    {prof.socialWhatsapp && <MessageCircle size={11} className="hover:text-emerald-400 cursor-pointer" />}
                  </div>
                </div>

                {/* Actions footer */}
                <div className="p-3 bg-neutral-950 border-t border-neutral-850 flex items-center justify-between text-xs">
                  {/* Order reordering buttons */}
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleOrderProf(idx, 'up')}
                      className="p-1 px-1.5 bg-neutral-900 text-neutral-400 hover:text-white rounded disabled:opacity-30"
                    >
                      <ArrowUp size={11} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === professors.length - 1}
                      onClick={() => handleOrderProf(idx, 'down')}
                      className="p-1 px-1.5 bg-neutral-900 text-neutral-400 hover:text-white rounded disabled:opacity-30"
                    >
                      <ArrowDown size={11} />
                    </button>
                  </div>

                  {/* Highlight toggling and general edits */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleToggleHighlightProf(prof.id, prof.name, !prof.highlighted)}
                      className={`p-1 px-1.5 rounded transition-all text-[9.5px] font-bold uppercase tracking-wider ${prof.highlighted ? 'bg-[#F2C94C]/10 text-[#F2C94C]' : 'bg-neutral-900 text-neutral-500'}`}
                    >
                      {prof.highlighted ? 'Destaque: Sim' : 'Ativar Destaque'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenProfModal(prof)}
                      className="p-1 px-1.5 bg-neutral-900 hover:bg-neutral-800 text-amber-500 rounded cursor-pointer"
                    >
                      <Edit size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProf(prof.id, prof.name)}
                      className="p-1 px-1.5 bg-neutral-900 hover:bg-rose-950 text-rose-500 rounded cursor-pointer"
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
          <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
            <div>
              <h3 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">Equipe Executiva de Retaguarda</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">Gerenciamento interno para manter atribuições atualizadas.</p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenOrgModal(null)}
              className="p-2 px-3 bg-[#0B4DA2] text-white text-xs font-semibold rounded cursor-pointer"
            >
              + Adicionar Organizador
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {organizers.map((org) => (
              <div key={org.id} className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl flex gap-4 justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#3B3B3B] text-white text-xs flex items-center justify-center font-bold">
                    {org.name.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-100">{org.name}</h4>
                    <span className="block text-[10px] text-amber-500 font-mono mt-0.5">{org.role}</span>
                    <p className="text-[10.5px] text-neutral-400 mt-1 line-clamp-2">"{org.bio}"</p>
                    <div className="text-[9.5px] text-neutral-500 mt-2 font-mono flex flex-wrap gap-2">
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
                    className="p-1 bg-neutral-800 text-amber-400 rounded hover:bg-neutral-750 transition-all"
                  >
                    <Edit size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteOrg(org.id, org.name)}
                    className="p-1 bg-neutral-800 text-rose-450 rounded hover:bg-rose-950 transition-all"
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
            className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl space-y-4"
          >
            <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">
                {activeStudent.id ? 'Alterar Ficha do Aluno' : 'Cadastrar Novo Aluno'}
              </h3>
              <button type="button" onClick={() => setStudentModalOpen(false)} className="text-neutral-400 hover:text-white">Fechar</button>
            </div>

            <div className="p-5 space-y-3.5 max-h-[450px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    value={activeStudent.name || ''}
                    onChange={(e) => setActiveStudent({ ...activeStudent, name: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Data de Nascimento</label>
                  <input 
                    type="date" 
                    required
                    value={activeStudent.birthDate || ''}
                    onChange={(e) => setActiveStudent({ ...activeStudent, birthDate: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Instrumento Principal</label>
                  <select
                    value={activeStudent.instrument || ''}
                    onChange={(e) => setActiveStudent({ ...activeStudent, instrument: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-400 p-2 text-xs rounded focus:outline-none"
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
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Turma de Admissão</label>
                  <select
                    value={activeStudent.classroom || ''}
                    onChange={(e) => setActiveStudent({ ...activeStudent, classroom: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-400 p-2 text-xs rounded focus:outline-none"
                  >
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                    <option value="Formado">Formado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Telefone Fone</label>
                  <input 
                    type="text" 
                    value={activeStudent.phone || ''}
                    onChange={(e) => setActiveStudent({ ...activeStudent, phone: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded focus:outline-none"
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Responsável (se menor)</label>
                  <input 
                    type="text" 
                    value={activeStudent.guardian || ''}
                    onChange={(e) => setActiveStudent({ ...activeStudent, guardian: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded"
                    placeholder="Nome do Pai/Mãe..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1 font-bold">Endereço Residencial</label>
                  <textarea 
                    value={activeStudent.address || ''}
                    onChange={(e) => setActiveStudent({ ...activeStudent, address: e.target.value })}
                    rows={2}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">E-mail para Boletim</label>
                  <input 
                    type="email" 
                    value={activeStudent.email || ''}
                    onChange={(e) => setActiveStudent({ ...activeStudent, email: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-825 text-neutral-100 p-2 text-xs rounded focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Status Atribuição</label>
                  <select
                    value={activeStudent.status || 'active'}
                    onChange={(e) => setActiveStudent({ ...activeStudent, status: e.target.value as any })}
                    className="w-full bg-neutral-950 border border-neutral-825 text-neutral-400 p-2 text-xs rounded focus:outline-none font-bold"
                  >
                    <option value="active">Regular Ativo</option>
                    <option value="inactive">Matrícula Trancada</option>
                    <option value="graduated">Formado / Alumni</option>
                    <option value="archived">Arquivado no ERP</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-2">Inserção de Foto</label>
                  <ImageUploader 
                    onUploadSuccess={(url) => setActiveStudent({ ...activeStudent, photo: url })} 
                  />
                </div>
              </div>

            </div>

            <div className="bg-neutral-950 p-3 border-t border-neutral-800 flex justify-end space-x-2">
              <button type="button" onClick={() => setStudentModalOpen(false)} className="text-xs text-neutral-400 px-3 py-1 bg-neutral-905 rounded">Cancelar</button>
              <button type="submit" className="text-xs text-white px-5 py-1 bg-[#0B4DA2] rounded">Confirmar Ficha Aluno</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal B: Professor CRUD form */}
      {profModalOpen && activeProf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-fade-in">
          <form 
            onSubmit={handleSaveProf}
            className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl space-y-4"
          >
            <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="text-xs font-mono font-bold text-[#F2C94C] uppercase tracking-wider">
                {activeProf.id ? 'Alterar Cadastro Professor' : 'Registrar Novo Docente'}
              </h3>
              <button type="button" onClick={() => setProfModalOpen(false)} className="text-neutral-400">Fechar</button>
            </div>

            <div className="p-4 space-y-3.5 max-h-[460px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    value={activeProf.name || ''}
                    onChange={(e) => setActiveProf({ ...activeProf, name: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Papel / Cargo Titular</label>
                  <input 
                    type="text" 
                    required
                    value={activeProf.role || ''}
                    onChange={(e) => setActiveProf({ ...activeProf, role: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded focus:outline-none"
                    placeholder="Ex: Chefe de Naipe de Trombones"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Especialidade Teórica</label>
                  <input 
                    type="text" 
                    value={activeProf.specialty || ''}
                    onChange={(e) => setActiveProf({ ...activeProf, specialty: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded"
                    placeholder="Ex: Metais graves e o bocal amplo"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Telefone Fone</label>
                  <input 
                    type="text" 
                    value={activeProf.phone || ''}
                    onChange={(e) => setActiveProf({ ...activeProf, phone: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded"
                    placeholder="(11) 98888-8888"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Breve Bio (Para Sinopse Home)</label>
                  <input 
                    type="text" 
                    value={activeProf.miniBio || ''}
                    onChange={(e) => setActiveProf({ ...activeProf, miniBio: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded focus:outline-none"
                    placeholder="Frase de efeito sobre a formação..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">E-mail para Recados</label>
                  <input 
                    type="email" 
                    value={activeProf.email || ''}
                    onChange={(e) => setActiveProf({ ...activeProf, email: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Biografia Completa de Retrospecto</label>
                <textarea 
                  value={activeProf.fullBio || ''}
                  onChange={(e) => setActiveProf({ ...activeProf, fullBio: e.target.value })}
                  rows={3}
                  className="w-full bg-neutral-950 border border-neutral-824 text-neutral-100 p-2 text-xs rounded focus:outline-none"
                />
              </div>

              {/* Social networks urls */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[8px] font-mono uppercase text-neutral-500 mb-1">Instagram</label>
                  <input 
                    type="text" 
                    value={activeProf.socialInstagram || ''}
                    onChange={(e) => setActiveProf({ ...activeProf, socialInstagram: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-824 text-neutral-100 p-1 text-[11px] rounded"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-neutral-500 mb-1">WhatsApp direto</label>
                  <input 
                    type="text" 
                    value={activeProf.socialWhatsapp || ''}
                    onChange={(e) => setActiveProf({ ...activeProf, socialWhatsapp: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-824 text-neutral-100 p-1 text-[11px] rounded"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-neutral-500 mb-1">YouTube Channel</label>
                  <input 
                    type="text" 
                    value={activeProf.socialYoutube || ''}
                    onChange={(e) => setActiveProf({ ...activeProf, socialYoutube: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-821 text-neutral-100 p-1 text-[11px] rounded"
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
                    className="w-4 h-4 bg-neutral-950 border border-neutral-800 rounded checked:bg-[#F2C94C]"
                  />
                  <label htmlFor="highlighted" className="text-[10px] font-mono uppercase text-neutral-400">Destacar na Capa</label>
                </div>
                <div className="flex flex-col justify-end">
                  <ImageUploader 
                    onUploadSuccess={(url) => setActiveProf({ ...activeProf, photo: url })} 
                  />
                </div>
              </div>

            </div>

            <div className="bg-neutral-950 p-3 border-t border-neutral-800 flex justify-end space-x-2">
              <button type="button" onClick={() => setProfModalOpen(false)} className="text-xs text-neutral-400 px-3 py-1 bg-neutral-900 rounded">Cancelar</button>
              <button type="submit" className="text-xs text-white px-5 py-1 bg-[#0B4DA2] rounded">Confirmar Registro Docente</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal C: Organizer CRUD Form */}
      {orgModalOpen && activeOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <form 
            onSubmit={handleSaveOrg}
            className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl space-y-4"
          >
            <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider">
                {activeOrg.id ? 'Alterar Dados Administrativo' : 'Adicionar Novo Organizador'}
              </h3>
              <button type="button" onClick={() => setOrgModalOpen(false)} className="text-neutral-400">Fechar</button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  required
                  value={activeOrg.name || ''}
                  onChange={(e) => setActiveOrg({ ...activeOrg, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-820 p-2 text-xs text-neutral-100 rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Cargo de Atuação</label>
                <input 
                  type="text" 
                  required
                  value={activeOrg.role || ''}
                  onChange={(e) => setActiveOrg({ ...activeOrg, role: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-820 p-2 text-xs text-neutral-100 rounded focus:outline-none whitespace-normal"
                  placeholder="Ex: Coordenador Fiscal e Transparência"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Mini Bio</label>
                <textarea 
                  value={activeOrg.bio || ''}
                  onChange={(e) => setActiveOrg({ ...activeOrg, bio: e.target.value })}
                  rows={2}
                  className="w-full bg-neutral-950 border border-neutral-820 p-2 text-xs text-neutral-100 rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Telefone Celular</label>
                  <input 
                    type="text" 
                    value={activeOrg.phone || ''}
                    onChange={(e) => setActiveOrg({ ...activeOrg, phone: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-820 p-2 text-xs text-neutral-100 rounded"
                    placeholder="(11) 97777-6666"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">E-mail Corporativo</label>
                  <input 
                    type="email" 
                    value={activeOrg.email || ''}
                    onChange={(e) => setActiveOrg({ ...activeOrg, email: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-820 p-2 text-xs text-amber-500 rounded font-mono"
                    placeholder="empresa@orquestra.com"
                  />
                </div>
              </div>
            </div>

            <div className="bg-neutral-950 p-3 border-t border-neutral-800 flex justify-end space-x-2">
              <button type="button" onClick={() => setOrgModalOpen(false)} className="text-xs text-neutral-400 px-3 py-1 bg-neutral-900 rounded select-none cursor-pointer">Cancelar</button>
              <button type="submit" className="text-xs text-white px-5 py-1 bg-[#0B4DA2] rounded select-none cursor-pointer">Salvar Organizador</button>
            </div>
          </form>
        </div>
      )}


      {/* Modal D: Simulated Exporter visual outcome */}
      {exportModalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-fade-in">
          <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-emerald-400 flex items-center">
                <FileSpreadsheet size={14} className="mr-2" />
                DADOS EXPORTADOS COM SUCESSO (CSV SPRESS)
              </span>
              <button onClick={() => setExportModalContent(null)} className="text-neutral-500 hover:text-white">Fechar</button>
            </div>
            
            <div className="p-4 bg-neutral-950 font-mono text-[10px] text-neutral-450 overflow-auto max-h-72">
              <pre>{exportModalContent}</pre>
            </div>

            <div className="p-3 bg-neutral-900 border-t border-neutral-800 text-right">
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
