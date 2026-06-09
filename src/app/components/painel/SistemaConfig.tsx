/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, ShieldAlert, Library, Settings, History, Save, Plus, Trash2, 
  Edit, Check, AlertTriangle, CloudDownload, Calendar, Lock, Globe, Share2, 
  CheckCircle, FileText, Search, AppWindow, FolderOpen, Play, ToggleLeft, ToggleRight
} from 'lucide-react';
import { SystemUser, LibraryFile, InstitutionConfig, AuditLog, BackupHistory } from '../../validations/types';
import { ImageUploader } from './MiniWidgets';

interface SistemaConfigProps {
  users: SystemUser[];
  setUsers: React.Dispatch<React.SetStateAction<SystemUser[]>>;
  library: LibraryFile[];
  setLibrary: React.Dispatch<React.SetStateAction<LibraryFile[]>>;
  config: InstitutionConfig;
  setConfig: React.Dispatch<React.SetStateAction<InstitutionConfig>>;
  auditLogs: AuditLog[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>;
  backups: BackupHistory[];
  setBackups: React.Dispatch<React.SetStateAction<BackupHistory[]>>;
  addAuditLog: (action: string, module: string, details: string) => void;
}

export default function SistemaConfig({
  users,
  setUsers,
  library,
  setLibrary,
  config,
  setConfig,
  auditLogs,
  setAuditLogs,
  backups,
  setBackups,
  addAuditLog
}: SistemaConfigProps) {
  const [subTab, setSubTab] = useState<'usuarios' | 'biblioteca' | 'instituicao' | 'auditoria' | 'backup'>('usuarios');

  // Media Library states
  const [libQuery, setLibQuery] = useState('');
  const [libCategory, setLibCategory] = useState<string>('all');

  // IAM User states
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<Partial<SystemUser> | null>(null);

  // Backup Manual snapshot simulation state
  const [manualBackupSnapshot, setManualBackupSnapshot] = useState<string | null>(null);

  // Save institutional config alert
  const [isSavedAlert, setIsSavedAlert] = useState(false);


  // ==========================================
  // IAM STAFF MANAGEMENT
  // ==========================================
  const handleOpenUserModal = (user: Partial<SystemUser> | null) => {
    setActiveUser(user || {
      id: '',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      name: '',
      email: '',
      role: 'Editor',
      status: 'active',
      scopes: ['news_edit']
    });
    setUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;

    if (activeUser.id) {
      setUsers(prev => prev.map(u => u.id === activeUser.id ? (activeUser as SystemUser) : u));
      addAuditLog('Alterou Acesso Staff', 'Sistema', `Atualizou credenciais IAM de: ${activeUser.name}`);
    } else {
      const newUser = { ...activeUser, id: `user-${Date.now()}` } as SystemUser;
      setUsers(prev => [...prev, newUser]);
      addAuditLog('Concedeu Permissão IAM', 'Sistema', `Cadastrou novo staff: ${newUser.name} com perfil ${newUser.role}`);
    }
    setUserModalOpen(false);
  };

  const handleToggleUserStatus = (id: string, name: string, active: boolean) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: active ? 'active' : 'blocked' } : u));
    addAuditLog(active ? 'Desbloqueou Staff' : 'Sustou Acesso Staff', 'Sistema', `Mudou status de ${name} para ${active ? 'Ativo' : 'Bloqueado'}`);
  };


  // ==========================================
  // FILE LIBRARY CRUD
  // ==========================================
  const handleAddLibraryFile = () => {
    const newFile: LibraryFile = {
      id: `file-${Date.now()}`,
      name: `Partitura_Arr_Metais_${Date.now().toString().slice(-4)}.pdf`,
      type: 'pdf',
      category: 'Partituras',
      size: '2.4 MB',
      uploadedAt: '2026-06-02',
      url: '#'
    };
    setLibrary(prev => [newFile, ...prev]);
    addAuditLog('Anexou Documento Biblioteca', 'Sistema', `Carregou arquivo: ${newFile.name}`);
    alert(`Arquivo ${newFile.name} adicionado com sucesso!`);
  };

  const handleDeleteLibraryFile = (id: string, name: string) => {
    setLibrary(prev => prev.filter(f => f.id !== id));
    addAuditLog('Deletou Recurso Biblioteca', 'Sistema', `Expulsou arquivo físico ID: ${id} (${name})`);
  };

  // Filtering Library Files
  const filteredLibrary = library.filter(f => {
    const matchesQuery = f.name.toLowerCase().includes(libQuery.toLowerCase());
    const matchesCategory = libCategory === 'all' || f.type === libCategory;
    return matchesQuery && matchesCategory;
  });


  // ==========================================
  // CONFIG SAVING
  // ==========================================
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    addAuditLog('Alterou Configuração Geral', 'Sistema', 'Atualizou metadados SEO, CNPJ fiscal e paleta de branding');
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 3000);
  };


  // ==========================================
  // BACKUPS SIMULATOR CORE
  // ==========================================
  const handleTriggerManualBackup = () => {
    const stateSnapshot = {
      timestamp: new Date().toISOString(),
      institution: config.name,
      cadastrosTotais: {
        staffs: users.length,
        documentos: library.length,
        logs: auditLogs.length
      }
    };
    
    const formattedJson = JSON.stringify(stateSnapshot, null, 2);
    setManualBackupSnapshot(formattedJson);

    // Also add to backups history list
    const newBackup: BackupHistory = {
      id: `bak-${Date.now()}`,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      type: 'manual',
      size: '48.2 KB',
      status: 'success'
    };
    setBackups(prev => [newBackup, ...prev]);
    addAuditLog('Efetuou Backup Manual', 'Sistema', 'Compilou snapshot JSON do banco de dados ERP');
  };

  const handleToggleAutoBackup = () => {
    setConfig(prev => ({
      ...prev,
      autoBackup: !prev.autoBackup
    }));
    addAuditLog('Alternou Backup Automático', 'Sistema', `Modificou automação do cron de backup para ${!config.autoBackup ? 'Ativo' : 'Inativo'}`);
  };


  return (
    <div className="space-y-6 p-6 animate-fade-in select-none">
      
      {/* Top Banner section */}
      <div className="pb-4 border-b border-neutral-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-neutral-100 tracking-tight flex items-center">
            <Building2 className="mr-2 text-[#0B4DA2]" size={20} />
            Configuração Fina & Infraestrutura (Sistema)
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Audite eventos de segurança contra exclusão, regule o controle de usuários do staff e altere parâmetros SEO da homepage.
          </p>
        </div>

        {/* Local micro navigation controls */}
        <div className="flex bg-neutral-900 border border-neutral-800 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setSubTab('usuarios')}
            className={`p-1.5 px-3 rounded-md font-semibold cursor-pointer transition-all ${subTab === 'usuarios' ? 'bg-[#0B4DA2] text-white' : 'text-neutral-400'}`}
          >
            IAM Staffs
          </button>
          <button
            type="button"
            onClick={() => setSubTab('biblioteca')}
            className={`p-1.5 px-3 rounded-md font-semibold cursor-pointer transition-all ${subTab === 'biblioteca' ? 'bg-[#0B4DA2] text-white' : 'text-neutral-400'}`}
          >
            Mídia Biblioteca
          </button>
          <button
            type="button"
            onClick={() => setSubTab('instituicao')}
            className={`p-1.5 px-3 rounded-md font-semibold cursor-pointer transition-all ${subTab === 'instituicao' ? 'bg-[#0B4DA2] text-white' : 'text-neutral-400'}`}
          >
            Instituição & SEO
          </button>
          <button
            type="button"
            onClick={() => setSubTab('auditoria')}
            className={`p-1.5 px-3 rounded-md font-semibold cursor-pointer transition-all ${subTab === 'auditoria' ? 'bg-[#0B4DA2] text-white' : 'text-neutral-400'}`}
          >
            Logs de Auditoria
          </button>
          <button
            type="button"
            onClick={() => setSubTab('backup')}
            className={`p-1.5 px-3 rounded-md font-semibold cursor-pointer transition-all ${subTab === 'backup' ? 'bg-[#0B4DA2] text-white' : 'text-neutral-400'}`}
          >
            Backups Catalunha
          </button>
        </div>
      </div>

      {/* ==========================================================
          SUBTAB 1: IAM STAFF MEMBERS (USERS & ROLES)
          ========================================================== */}
      {subTab === 'usuarios' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex-wrap gap-2.5">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-amber-500 tracking-wider">Mural staff corporativo</span>
              <p className="text-xs text-neutral-400 mt-0.5">Estipule níveis de visualização do dashboard por cargo de atuação administrativa.</p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenUserModal(null)}
              className="p-1.5 px-3.5 bg-[#0B4DA2] hover:bg-blue-750 text-white rounded text-xs font-semibold cursor-pointer"
            >
              + Autorizar Novo Operador
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((item) => (
              <div key={item.id} className="p-4 bg-neutral-900 border border-neutral-850 rounded-xl relative flex flex-col justify-between">
                <div className="flex gap-4 items-start pb-4 border-b border-neutral-850">
                  <img 
                    src={item.photo} 
                    alt={item.name} 
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 object-cover rounded-full border border-neutral-800 shrink-0" 
                  />
                  <div>
                    <h4 className="text-xs font-bold text-neutral-100 font-sans tracking-tight">{item.name}</h4>
                    <span className="block text-[10px] text-amber-500 font-mono mt-0.5">Perfil: {item.role}</span>
                    <span className="block text-[10px] text-neutral-500 mt-1 font-mono">{item.email}</span>
                  </div>
                </div>

                <div className="pt-3 flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className="text-[10px] uppercase font-mono font-bold text-neutral-450">
                      {item.status === 'active' ? 'Staff Ativo' : 'Sustado'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleToggleUserStatus(item.id, item.name, item.status !== 'active')}
                      className={`text-[9.5px] font-mono leading-none p-1 px-2.5 rounded border border-neutral-800 ${
                        item.status === 'active' ? 'bg-neutral-950 text-rose-500' : 'bg-emerald-950 text-emerald-400 font-bold'
                      }`}
                    >
                      {item.status === 'active' ? 'Bloquear' : 'Reativar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenUserModal(item)}
                      className="p-1 px-2.5 bg-neutral-950 rounded text-amber-500 text-[9.5px] border border-neutral-800"
                    >
                      EDITAR
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================================
          SUBTAB 2: LIBRARY FILES EXPORT DIR
          ========================================================== */}
      {subTab === 'biblioteca' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2.5 text-neutral-500" />
                <input 
                  type="text" 
                  value={libQuery}
                  onChange={(e) => setLibQuery(e.target.value)}
                  placeholder="Localizar Partitura / PDF..."
                  className="bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs p-2 pl-8 rounded-lg focus:outline-none w-52"
                />
              </div>

              <select
                value={libCategory}
                onChange={(e) => setLibCategory(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 text-neutral-400 text-xs p-2 rounded-lg"
              >
                <option value="all">Ver Tudo</option>
                <option value="image">Imagens (.jpg, .png)</option>
                <option value="pdf">Documentos (.pdf, .doc)</option>
                <option value="video">Instruções Video (.mp4)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleAddLibraryFile}
              className="p-2 px-4 bg-[#0B4DA2] hover:bg-blue-750 text-white rounded text-xs font-semibold cursor-pointer"
            >
              + Anexar Recurso / PDF
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredLibrary.map((file) => (
              <div key={file.id} className="p-3.5 bg-neutral-900 border border-neutral-850 rounded-lg flex flex-col justify-between hover:border-neutral-700 transition">
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                    <FileText className="text-[#F2C94C]" size={20} />
                  </div>
                  <button
                    onClick={() => handleDeleteLibraryFile(file.id, file.name)}
                    className="p-1 text-rose-500 hover:bg-neutral-950 rounded cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <div className="mt-3">
                  <span className="block font-sans font-bold text-neutral-200 text-xs truncate" title={file.name}>
                    {file.name}
                  </span>
                  <div className="flex justify-between items-center text-[9px] font-mono text-neutral-500 mt-1 uppercase">
                    <span>Tam: {file.size}</span>
                    <span>Cap: {file.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================================
          SUBTAB 3: INSTITUTIONAL CMS META CONFIGS
          ========================================================== */}
      {subTab === 'instituicao' && (
        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Metadados Cadastrais em Bloco */}
            <div className="p-5 bg-neutral-900 border border-neutral-820 rounded-xl space-y-4">
              <h3 className="text-xs font-mono font-bold text-neutral-200 uppercase tracking-wider border-b border-neutral-800 pb-2">Metadados Jurídicos Associativos</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Nome Administrativo Oficial</label>
                  <input 
                    type="text" 
                    value={config.name}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-neutral-200 rounded" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-505 mb-1">CNPJ Instituição</label>
                  <input 
                    type="text" 
                    value={config.cnpj}
                    onChange={(e) => setConfig({ ...config, cnpj: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-neutral-200 rounded font-mono" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-505 mb-1 text-neutral-500">Endereço da Sede Artística</label>
                <input 
                  type="text" 
                  value={config.address}
                  onChange={(e) => setConfig({ ...config, address: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-neutral-200 rounded" 
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[8px] font-mono uppercase text-neutral-500 mb-1">CEP Sede</label>
                  <input 
                    type="text" 
                    value={config.cep}
                    onChange={(e) => setConfig({ ...config, cep: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 p-1.5 text-xs text-neutral-200 rounded" 
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-neutral-505 mb-1">Cidade</label>
                  <input 
                    type="text" 
                    value={config.city}
                    onChange={(e) => setConfig({ ...config, city: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 p-1.5 text-xs text-neutral-200 rounded" 
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-neutral-505 mb-1">Estado</label>
                  <input 
                    type="text" 
                    value={config.state}
                    onChange={(e) => setConfig({ ...config, state: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 p-1.5 text-xs text-neutral-200 rounded font-bold" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Telefones Staff</label>
                  <input 
                    type="text" 
                    value={config.phones}
                    onChange={(e) => setConfig({ ...config, phones: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-neutral-250 rounded" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-505 mb-1">E-mail Ouvidoria</label>
                  <input 
                    type="text" 
                    value={config.email}
                    onChange={(e) => setConfig({ ...config, email: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-neutral-250 rounded" 
                  />
                </div>
              </div>
            </div>

            {/* SEO E REDES SOCIAIS CONFIG BLOCK */}
            <div className="p-5 bg-neutral-900 border border-neutral-820 rounded-xl space-y-4">
              <h3 className="text-xs font-mono font-bold text-neutral-200 uppercase tracking-wider border-b border-neutral-800 pb-2">Otimização (SEO) & Identidade de Marca</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Instagram Integrador</label>
                  <input 
                    type="text" 
                    value={config.socialInstagram}
                    onChange={(e) => setConfig({ ...config, socialInstagram: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-neutral-200 rounded" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">WhatsApp Fale Geral</label>
                  <input 
                    type="text" 
                    value={config.socialWhatsapp}
                    onChange={(e) => setConfig({ ...config, socialWhatsapp: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-neutral-200 rounded" 
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-450 mb-1">Tag Title de indexação Google (Meta Title)</label>
                  <input 
                    type="text" 
                    value={config.seoMetaTitle}
                    onChange={(e) => setConfig({ ...config, seoMetaTitle: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-neutral-200 rounded font-sans" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-450 mb-1">Resumo Sinopse Meta Description</label>
                  <textarea 
                    value={config.seoMetaDescription}
                    onChange={(e) => setConfig({ ...config, seoMetaDescription: e.target.value })}
                    rows={2.5}
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-neutral-200 rounded" 
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Action trigger footer */}
          <div className="flex justify-between items-center bg-neutral-950 p-4 border border-neutral-850 rounded-xl">
            <div className="text-xs text-neutral-500 font-mono">
              {isSavedAlert && (
                <span className="text-emerald-400 font-bold flex items-center">
                  <CheckCircle size={14} className="mr-1 inline" /> PARÂMETROS FISCAIS SALVOS NAS DIRETRIZES DO SISTEMA
                </span>
              )}
            </div>
            <button
              type="submit"
              className="p-2 px-6 bg-[#0B4DA2] hover:bg-blue-750 text-white rounded font-bold text-xs uppercase tracking-widest cursor-pointer shadow-lg flex items-center"
            >
              Gravar Diretrizes <Save size={13} className="ml-2" />
            </button>
          </div>

        </form>
      )}

      {/* ==========================================================
          SUBTAB 4: SECURITY AUDIT TRAILS (LOGS HISTORY)
          ========================================================== */}
      {subTab === 'auditoria' && (
        <div className="space-y-4">
          <div className="p-3 bg-neutral-950 border border-neutral-850 rounded-lg text-xs flex justify-between items-center text-neutral-450 font-mono">
            <span className="flex items-center text-amber-500">
              <AlertTriangle size={14} className="mr-2" />
              Selo Geral Auditoria Imutável (CFR-11)
            </span>
            <span>Total de registros: {auditLogs.length} eventos</span>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden overflow-y-auto max-h-[380px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-950 text-neutral-550 border-b border-neutral-850 font-mono uppercase tracking-wider text-[10px]">
                  <th className="p-3.5 pl-4">Timestamp</th>
                  <th className="p-3.5">Operador IAM</th>
                  <th className="p-3.5">Ação Efetuada</th>
                  <th className="p-3.5">Módulo Alterado</th>
                  <th className="p-3.5">Detalhamento Técnico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-950/25 transition">
                    <td className="p-3 pl-4 text-neutral-500 whitespace-nowrap">{log.dateTime}</td>
                    <td className="p-3 font-semibold text-neutral-300">Super Admin</td>
                    <td className="p-3 text-amber-450 font-bold">{log.action || 'Alteração de Dados'}</td>
                    <td className="p-3">
                      <span className="bg-neutral-800 text-neutral-300 p-0.5 px-2 rounded font-semibold text-[10.5px]">
                        {log.module}
                      </span>
                    </td>
                    <td className="p-3 text-neutral-400 font-sans tracking-wide">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================================
          SUBTAB 5: SYSTEM BACKUPS SNAPSHOTS
          ========================================================== */}
      {subTab === 'backup' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Automatic scheduling configure block */}
            <div className="p-5 bg-neutral-900 border border-neutral-820 rounded-xl space-y-4">
              <h3 className="text-xs font-mono font-bold text-neutral-200 uppercase tracking-wider">Mecanismo de Desastres e Sincronização</h3>
              
              <div className="space-y-3.5 text-xs text-neutral-400 leading-relaxed">
                <p>Nossos bancos de dados locais são espelhados em nuvem segura a cada ciclo de 12 horas. Você pode ligar a rotina automatizada ou compilar instantaneamente o banco de dados institucional em formato JSON clicando em backup manual.</p>
                
                <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-855 flex items-center justify-between">
                  <div>
                    <span className="block font-bold text-neutral-250">Backup Diretor Automático</span>
                    <span className="text-[10px] text-neutral-500 font-mono">Sincroniza todas as noites às 02h</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleAutoBackup}
                    className="p-1 px-3 text-[#F2C94C] font-mono text-xs cursor-pointer bg-neutral-900 border border-neutral-800 rounded"
                  >
                    {config.autoBackup ? 'DESATIVAR AUTO' : 'ATIVAR AUTO'}
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleTriggerManualBackup}
                    className="w-full p-2.5 bg-[#0B4DA2] hover:bg-blue-750 text-white font-mono text-xs font-bold rounded uppercase tracking-wider text-center"
                  >
                    🚀 Rodar Backup Manual Imediato
                  </button>
                </div>
              </div>
            </div>

            {/* Backups Catalog */}
            <div className="p-5 bg-neutral-900 border border-neutral-820 rounded-xl space-y-4">
              <h3 className="text-xs font-mono font-bold text-neutral-200 uppercase tracking-wider">Histórico de Snapshots Registrados</h3>
              
              <div className="space-y-2.5 select-none text-xs">
                {backups.map((bak) => (
                  <div key={bak.id} className="p-2.5 bg-neutral-950 rounded-lg border border-neutral-850 flex justify-between items-center text-neutral-450 font-mono">
                    <div>
                      <span className="block font-bold text-neutral-300">Ref: {bak.date}</span>
                      <span className="text-[9px] text-neutral-550">Tipo: {bak.type} • Tamanho: {bak.size}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="bg-emerald-950 text-emerald-400 text-[10px] p-0.5 px-2 rounded-full font-bold">SUCESSO</span>
                      <button
                        onClick={() => {
                          alert(`Carregando snapshot de cache ${bak.id}... Banco de dados restaurado com sucesso!`);
                        }}
                        className="p-1 bg-neutral-800 text-[#F2C94C] rounded text-[10px] uppercase font-bold"
                      >
                        Restaurar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>


          {/* Snapshot debugger container */}
          {manualBackupSnapshot && (
            <div className="p-4 bg-neutral-950 border border-emerald-900/30 rounded-xl space-y-3">
              <span className="font-mono text-xs font-bold text-emerald-400 block pb-2 border-b border-emerald-950">
                DATABASE BACKUP SNAPSHOT COMPILADO COM SUCESSO!
              </span>
              <pre className="text-[10px] font-mono text-[#E5E5E5] overflow-auto max-h-48 leading-relaxed">
                {manualBackupSnapshot}
              </pre>

              <div className="text-right">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(manualBackupSnapshot);
                    alert('Snapshot copiado!');
                    setManualBackupSnapshot(null);
                  }}
                  className="p-1 px-4 bg-emerald-700 text-white rounded font-mono font-semibold text-xs cursor-pointer"
                >
                  Confirmar e Fechar Visualização
                </button>
              </div>
            </div>
          )}

        </div>
      )}


      {/* ==========================================
          IAM OPERATOR MODAL DETAILS
          ========================================== */}
      {userModalOpen && activeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <form 
            onSubmit={handleSaveUser}
            className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl space-y-4"
          >
            <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-[#F2C94C] uppercase tracking-widest">DEFINIR PERMISSÕES DO OPERADOR</span>
              <button type="button" onClick={() => setUserModalOpen(false)} className="text-neutral-400">Fechar</button>
            </div>

            <div className="p-4 space-y-3.5">
              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-505 mb-1 text-neutral-500">Nome do Colaborador Staff</label>
                <input 
                  type="text" 
                  required
                  value={activeUser.name || ''}
                  onChange={(e) => setActiveUser({ ...activeUser, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-820 p-2 text-xs text-neutral-100 rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-505 mb-1 text-neutral-500">Email Administrativo</label>
                <input 
                  type="email" 
                  required
                  value={activeUser.email || ''}
                  onChange={(e) => setActiveUser({ ...activeUser, email: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-820 p-2 text-xs text-neutral-100 rounded focus:outline-none"
                  placeholder="empresa@orquestra.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Perfil Funcional</label>
                  <select
                    value={activeUser.role || 'Editor'}
                    onChange={(e) => setActiveUser({ ...activeUser, role: e.target.value as any })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-400 p-2 text-xs rounded"
                  >
                    <option value="Super Administrador">Super Administrador</option>
                    <option value="Administrador">Administrador Geral</option>
                    <option value="Secretaria">Secretaria Executiva</option>
                    <option value="Financeiro">Tesoureiro / Financeiro</option>
                    <option value="Editor">Editor Conteúdos</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  <ImageUploader 
                    onUploadSuccess={(url) => setActiveUser({ ...activeUser, photo: url })} 
                  />
                </div>
              </div>

            </div>

            <div className="bg-neutral-955 p-3 border-t border-neutral-800 flex justify-end space-x-2">
              <button type="button" onClick={() => setUserModalOpen(false)} className="text-xs text-neutral-400 px-3 py-1 bg-neutral-900 rounded">Cancelar</button>
              <button type="submit" className="text-xs text-white px-5 py-1 bg-[#0B4DA2] rounded">Salvar Credenciais IAM</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
