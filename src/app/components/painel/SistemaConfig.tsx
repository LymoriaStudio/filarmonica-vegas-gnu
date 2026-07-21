/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2, ShieldAlert, Library, Settings, History, Save, Plus, Trash2,
  Edit, Check, AlertTriangle, CloudDownload, Calendar, Lock, Globe, Share2,
  CheckCircle, FileText, Search, AppWindow, FolderOpen, Play, ToggleLeft, ToggleRight,
  Eye, EyeOff, UserPlus, X as XIcon
} from 'lucide-react';
import { SystemUser, LibraryFile, InstitutionConfig, AuditLog, BackupHistory } from '../../validations/types';
import { ImageUploader } from './MiniWidgets';
import { Drawer, DrawerSection, DrawerField, DrawerInput, DrawerTextarea, DrawerSelect } from './Drawer';
import { listUsers, createUser, updateUser, deleteUser, type PainelUser, type UserRole } from '../../services/usersService';

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
  activeTab?: string;
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
  addAuditLog,
  activeTab,
}: SistemaConfigProps) {
  const initialSubTab = activeTab === 'sistema-auditoria' ? 'auditoria' : activeTab === 'sistema-configuracoes' ? 'instituicao' : activeTab === 'sistema-backup' ? 'backup' : activeTab === 'sistema-biblioteca' ? 'biblioteca' : 'usuarios';
  const [subTab, setSubTab] = useState<'usuarios' | 'biblioteca' | 'instituicao' | 'auditoria' | 'backup'>(initialSubTab as any);

  // Media Library states
  const [libQuery, setLibQuery] = useState('');
  const [libCategory, setLibCategory] = useState<string>('all');

  // ── Real users from Supabase ──────────────────────────────────────────────
  const [painelUsers, setPainelUsers] = useState<PainelUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');

  // Filtros de usuários
  const [userSearch, setUserSearch]       = useState('');
  const [userRoleFilter, setUserRoleFilter]     = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  const filteredUsers = useMemo(() => {
    return painelUsers.filter(u => {
      const matchName = !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      const rawStatus = (u as any).status ?? (u.blocked ? 'bloqueado' : 'ativo');
      const matchStatus = userStatusFilter === 'all' || rawStatus === userStatusFilter;
      return matchName && matchRole && matchStatus;
    });
  }, [painelUsers, userSearch, userRoleFilter, userStatusFilter]);

  // User modal
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PainelUser | null>(null);
  const [formName, setFormName]         = useState('');
  const [formEmail, setFormEmail]       = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole]         = useState<UserRole>('editor');
  const [showPass, setShowPass]         = useState(false);
  const [modalSaving, setModalSaving]   = useState(false);
  const [modalError, setModalError]     = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const data = await listUsers();
      setPainelUsers(data);
    } catch (err: any) {
      setUsersError(err.message);
    } finally {
      setUsersLoading(false);
    }
  };

  const openNewUser = () => {
    setEditingUser(null);
    setFormName(''); setFormEmail(''); setFormPassword(''); setFormRole('editor');
    setModalError(''); setUserModalOpen(true);
  };

  const openEditUser = (u: PainelUser) => {
    setEditingUser(u);
    setFormName(u.name); setFormEmail(u.email); setFormPassword(''); setFormRole(u.role);
    setModalError(''); setUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalSaving(true); setModalError('');
    try {
      if (editingUser) {
        await updateUser(editingUser.id, formName, formRole);
        addAuditLog('Alterou Usuário', 'Sistema', `Atualizou ${formName} → role: ${formRole}`);
      } else {
        if (!formPassword || formPassword.length < 6) throw new Error('Senha deve ter ao menos 6 caracteres.');
        const created = await createUser(formEmail, formPassword, formName, formRole);
        addAuditLog('Criou Usuário', 'Sistema', `Criou ${formName} (${formEmail}) como ${formRole}`);
        setPainelUsers(prev => [created, ...prev]);
        setUserModalOpen(false); return;
      }
      await loadUsers();
      setUserModalOpen(false);
    } catch (err: any) {
      setModalError(err.message ?? 'Erro ao salvar usuário.');
    } finally {
      setModalSaving(false);
    }
  };

  const handleDeleteUser = async (u: PainelUser) => {
    if (!confirm(`Remover o usuário "${u.name}"? Esta ação é irreversível.`)) return;
    try {
      await deleteUser(u.id);
      addAuditLog('Removeu Usuário', 'Sistema', `Deletou ${u.name} (${u.email})`);
      setPainelUsers(prev => prev.filter(x => x.id !== u.id));
    } catch (err: any) {
      alert('Erro ao remover: ' + err.message);
    }
  };

  // Backup Manual snapshot simulation state
  const [manualBackupSnapshot, setManualBackupSnapshot] = useState<string | null>(null);

  // Save institutional config alert
  const [isSavedAlert, setIsSavedAlert] = useState(false);


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
      {/* <div className="pb-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-[#001856] tracking-tight flex items-center">
            <Building2 className="mr-2 text-[#001856]" size={20} />
            Logs do Sistema
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Audite eventos de segurança contra exclusão, regule o controle de usuários do staff e altere parâmetros SEO da homepage.
          </p>
        </div>

      </div> */}

      {/* ==========================================================
          SUBTAB 1: IAM STAFF MEMBERS (USERS & ROLES)
          ========================================================== */}
      {subTab === 'usuarios' && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center bg-white border border-gray-200 p-4 rounded-xl flex-wrap gap-2.5">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-[#ffc300] tracking-wider">Controle de Usuários</span>
              <p className="text-xs text-gray-400 mt-0.5">Gerencie os acessos ao painel administrativo. Dois perfis: Admin (acesso total) e Editor (sem configurações do sistema).</p>
            </div>
            <button type="button" onClick={openNewUser}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#ffc300] hover:bg-yellow-400 text-[#001856] rounded-lg text-xs font-bold cursor-pointer transition-colors">
              <UserPlus size={13} /> Novo Usuário
            </button>
          </div>

          {/* Busca e filtros */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por nome ou e-mail..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#001856]/20"
              />
            </div>
            <select value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#001856]/20 cursor-pointer">
              <option value="all">Todos os cargos</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
            </select>
            <select value={userStatusFilter} onChange={e => setUserStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#001856]/20 cursor-pointer">
              <option value="all">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="bloqueado">Bloqueado</option>
              <option value="inativo">Inativo</option>
              <option value="pendente">Pendente</option>
            </select>
          </div>

          {/* Error / loading */}
          {usersError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              {usersError}
              {usersError.includes('VITE_SUPABASE_SERVICE_KEY') && (
                <p className="mt-1 text-xs text-red-400">Adicione <code className="bg-red-100 px-1 rounded">VITE_SUPABASE_SERVICE_KEY=sua_service_role_key</code> ao arquivo <code>.env</code> e reinicie o servidor.</p>
              )}
            </div>
          )}

          {usersLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#001856] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.length === 0 && (
                <div className="col-span-3 text-center py-12 text-gray-400 text-sm">
                  Nenhum usuário encontrado.
                </div>
              )}
              {filteredUsers.map(u => (
                <div key={u.id} className="p-4 bg-white border border-gray-100 rounded-xl flex flex-col gap-3">
                  {/* top */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#001856] flex items-center justify-center shrink-0">
                      <span className="text-[#ffc300] text-xs font-bold">{u.name.substring(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#001856] truncate">{u.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{u.email}</p>
                    </div>
                  </div>
                  {/* role badge */}
                  <div>
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                      u.role === 'admin'
                        ? 'bg-[#001856] text-[#ffc300]'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {u.role === 'admin' ? 'Administrador' : 'Editor'}
                    </span>
                  </div>
                  {/* actions */}
                  <div className="flex gap-2 pt-1 border-t border-gray-100">
                    <button type="button" onClick={() => openEditUser(u)}
                      className="flex-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-[#001856] bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg py-1.5 transition-colors">
                      <Edit size={12} /> Editar
                    </button>
                    <button type="button" onClick={() => handleDeleteUser(u)}
                      className="flex-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg py-1.5 transition-colors">
                      <Trash2 size={12} /> Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==========================================================
          SUBTAB 2: LIBRARY FILES EXPORT DIR
          ========================================================== */}
      {subTab === 'biblioteca' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white border border-gray-200 p-4 rounded-xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={libQuery}
                  onChange={(e) => setLibQuery(e.target.value)}
                  placeholder="Localizar Partitura / PDF..."
                  className="bg-gray-50 border border-gray-200 text-gray-800 text-xs p-2 pl-8 rounded-lg focus:outline-none w-52"
                />
              </div>

              <select
                value={libCategory}
                onChange={(e) => setLibCategory(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-400 text-xs p-2 rounded-lg"
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
              className="p-2 px-4 bg-[#001856] hover:bg-blue-750 text-white rounded text-xs font-semibold cursor-pointer"
            >
              + Anexar Recurso / PDF
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredLibrary.map((file) => (
              <div key={file.id} className="p-3.5 bg-white border border-gray-100 rounded-lg flex flex-col justify-between hover:border-gray-300 transition">
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded bg-gray-50 border border-gray-200">
                    <FileText className="text-[#ffc300]" size={20} />
                  </div>
                  <button
                    onClick={() => handleDeleteLibraryFile(file.id, file.name)}
                    className="p-1 text-rose-500 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <div className="mt-3">
                  <span className="block font-sans font-bold text-gray-800 text-xs truncate" title={file.name}>
                    {file.name}
                  </span>
                  <div className="flex justify-between items-center text-[9px] font-mono text-gray-400 mt-1 uppercase">
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
      {false && subTab === 'instituicao' && (
        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Metadados Cadastrais em Bloco */}
            <div className="p-5 bg-white border border-gray-200 rounded-xl space-y-4">
              <h3 className="text-xs font-mono font-bold text-gray-800 uppercase tracking-wider border-b border-gray-200 pb-2">Metadados Jurídicos Associativos</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Nome Administrativo Oficial</label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-2 text-xs text-gray-800 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-505 mb-1">CNPJ Instituição</label>
                  <input
                    type="text"
                    value={config.cnpj}
                    onChange={(e) => setConfig({ ...config, cnpj: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-2 text-xs text-gray-800 rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-505 mb-1 text-gray-400">Endereço da Sede Artística</label>
                <input
                  type="text"
                  value={config.address}
                  onChange={(e) => setConfig({ ...config, address: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2 text-xs text-gray-800 rounded"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[8px] font-mono uppercase text-gray-400 mb-1">CEP Sede</label>
                  <input
                    type="text"
                    value={config.cep}
                    onChange={(e) => setConfig({ ...config, cep: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-1.5 text-xs text-gray-800 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-neutral-505 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={config.city}
                    onChange={(e) => setConfig({ ...config, city: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-1.5 text-xs text-gray-800 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-neutral-505 mb-1">Estado</label>
                  <input
                    type="text"
                    value={config.state}
                    onChange={(e) => setConfig({ ...config, state: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-1.5 text-xs text-gray-800 rounded font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Telefones Staff</label>
                  <input
                    type="text"
                    value={config.phones}
                    onChange={(e) => setConfig({ ...config, phones: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-2 text-xs text-neutral-250 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-505 mb-1">E-mail Ouvidoria</label>
                  <input
                    type="text"
                    value={config.email}
                    onChange={(e) => setConfig({ ...config, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-2 text-xs text-neutral-250 rounded"
                  />
                </div>
              </div>
            </div>

            {/* SEO E REDES SOCIAIS CONFIG BLOCK */}
            <div className="p-5 bg-white border border-gray-200 rounded-xl space-y-4">
              <h3 className="text-xs font-mono font-bold text-gray-800 uppercase tracking-wider border-b border-gray-200 pb-2">Otimização (SEO) & Identidade de Marca</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Instagram Integrador</label>
                  <input
                    type="text"
                    value={config.socialInstagram}
                    onChange={(e) => setConfig({ ...config, socialInstagram: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-2 text-xs text-gray-800 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">WhatsApp Fale Geral</label>
                  <input
                    type="text"
                    value={config.socialWhatsapp}
                    onChange={(e) => setConfig({ ...config, socialWhatsapp: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-2 text-xs text-gray-800 rounded"
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
                    className="w-full bg-gray-50 border border-gray-200 p-2 text-xs text-gray-800 rounded font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-450 mb-1">Resumo Sinopse Meta Description</label>
                  <textarea
                    value={config.seoMetaDescription}
                    onChange={(e) => setConfig({ ...config, seoMetaDescription: e.target.value })}
                    rows={2.5}
                    className="w-full bg-gray-50 border border-gray-200 p-2 text-xs text-gray-800 rounded"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Action trigger footer */}
          <div className="flex justify-between items-center bg-gray-50 p-4 border border-gray-100 rounded-xl">
            <div className="text-xs text-gray-400 font-mono">
              {isSavedAlert && (
                <span className="text-emerald-400 font-bold flex items-center">
                  <CheckCircle size={14} className="mr-1 inline" /> PARÂMETROS FISCAIS SALVOS NAS DIRETRIZES DO SISTEMA
                </span>
              )}
            </div>
            <button
              type="submit"
              className="p-2 px-6 bg-[#001856] hover:bg-blue-750 text-white rounded font-bold text-xs uppercase tracking-widest cursor-pointer shadow-lg flex items-center"
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
          <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-xs flex justify-between items-center text-neutral-450 font-mono">
            <span className="flex items-center text-amber-500">
              <AlertTriangle size={14} className="mr-2" />
              Apenas Administradores podem visualizar os Logs
            </span>
            <span>Total de registros: {auditLogs.length} eventos</span>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden overflow-y-auto max-h-[380px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-neutral-550 border-b border-gray-100 font-mono uppercase tracking-wider text-[10px]">
                  <th className="p-3.5 pl-4">Timestamp</th>
                  <th className="p-3.5">Operador IAM</th>
                  <th className="p-3.5">Ação Efetuada</th>
                  <th className="p-3.5">Módulo Alterado</th>
                  <th className="p-3.5">Detalhamento Técnico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="p-3 pl-4 text-gray-400 whitespace-nowrap">{log.dateTime}</td>
                    <td className="p-3 font-semibold text-gray-600">Super Admin</td>
                    <td className="p-3 text-amber-450 font-bold">{log.action || 'Alteração de Dados'}</td>
                    <td className="p-3">
                      <span className="bg-gray-100 text-gray-600 p-0.5 px-2 rounded font-semibold text-[10.5px]">
                        {log.module}
                      </span>
                    </td>
                    <td className="p-3 text-gray-400 font-sans tracking-wide">{log.details}</td>
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
            <div className="p-5 bg-white border border-gray-200 rounded-xl space-y-4">
              <h3 className="text-xs font-mono font-bold text-gray-800 uppercase tracking-wider">Mecanismo de Desastres e Sincronização</h3>

              <div className="space-y-3.5 text-xs text-gray-400 leading-relaxed">
                <p>Nossos bancos de dados locais são espelhados em nuvem segura a cada ciclo de 12 horas. Você pode ligar a rotina automatizada ou compilar instantaneamente o banco de dados institucional em formato JSON clicando em backup manual.</p>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="block font-bold text-neutral-250">Backup Diretor Automático</span>
                    <span className="text-[10px] text-gray-400 font-mono">Sincroniza todas as noites às 02h</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleAutoBackup}
                    className="p-1 px-3 text-[#ffc300] font-mono text-xs cursor-pointer bg-white border border-gray-200 rounded"
                  >
                    {config.autoBackup ? 'DESATIVAR AUTO' : 'ATIVAR AUTO'}
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleTriggerManualBackup}
                    className="w-full p-2.5 bg-[#001856] hover:bg-blue-750 text-white font-mono text-xs font-bold rounded uppercase tracking-wider text-center"
                  >
                    🚀 Rodar Backup Manual Imediato
                  </button>
                </div>
              </div>
            </div>

            {/* Backups Catalog */}
            <div className="p-5 bg-white border border-gray-200 rounded-xl space-y-4">
              <h3 className="text-xs font-mono font-bold text-gray-800 uppercase tracking-wider">Histórico de Snapshots Registrados</h3>

              <div className="space-y-2.5 select-none text-xs">
                {backups.map((bak) => (
                  <div key={bak.id} className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center text-neutral-450 font-mono">
                    <div>
                      <span className="block font-bold text-gray-600">Ref: {bak.date}</span>
                      <span className="text-[9px] text-neutral-550">Tipo: {bak.type} • Tamanho: {bak.size}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="bg-emerald-950 text-emerald-400 text-[10px] p-0.5 px-2 rounded-full font-bold">SUCESSO</span>
                      <button
                        onClick={() => {
                          alert(`Carregando snapshot de cache ${bak.id}... Banco de dados restaurado com sucesso!`);
                        }}
                        className="p-1 bg-gray-100 text-[#ffc300] rounded text-[10px] uppercase font-bold"
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
            <div className="p-4 bg-gray-50 border border-emerald-900/30 rounded-xl space-y-3">
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
          DRAWER: IAM OPERATOR
          ========================================== */}
      <Drawer
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
        description={editingUser ? 'Altere nome ou perfil de acesso' : 'Crie um acesso ao painel administrativo'}
        icon={UserPlus}
        iconBg="bg-[#001856]/10"
        iconColor="text-[#001856]"
        onSubmit={handleSaveUser}
        submitLabel={modalSaving ? 'Salvando...' : (editingUser ? 'Salvar' : 'Criar Usuário')}
        submitting={modalSaving}
      >
        <DrawerSection title="Dados do usuário">
          <DrawerField label="Nome completo" required>
            <DrawerInput
              required
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="Ex: Maria Silva"
            />
          </DrawerField>

          {!editingUser && (
            <DrawerField label="E-mail" required>
              <DrawerInput
                required
                type="email"
                value={formEmail}
                onChange={e => setFormEmail(e.target.value)}
                placeholder="usuario@filarmonicademetais.com"
              />
            </DrawerField>
          )}

          {!editingUser && (
            <DrawerField label="Senha inicial" required>
              <div className="relative">
                <DrawerInput
                  required
                  type={showPass ? 'text' : 'password'}
                  value={formPassword}
                  onChange={e => setFormPassword(e.target.value)}
                  placeholder="mín. 6 caracteres"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </DrawerField>
          )}
        </DrawerSection>

        <DrawerSection title="Perfil de acesso">
          <div className="grid grid-cols-2 gap-2">
            {(['admin', 'editor'] as UserRole[]).map(r => (
              <button key={r} type="button" onClick={() => setFormRole(r)}
                className={`py-2.5 rounded-lg border text-sm font-semibold transition-all cursor-pointer ${
                  formRole === r
                    ? 'bg-[#001856] text-[#ffc300] border-[#001856]'
                    : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                }`}>
                {r === 'admin' ? 'Administrador' : 'Editor'}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-2">
            {formRole === 'admin'
              ? 'Admin vê tudo: conteúdo, pessoas, financeiro e configurações do sistema.'
              : 'Editor vê conteúdo, pessoas e financeiro. Não acessa configurações do sistema.'}
          </p>
        </DrawerSection>

        {modalError && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">
            {modalError}
          </div>
        )}
      </Drawer>

    </div>
  );
}
