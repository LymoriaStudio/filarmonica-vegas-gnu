import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Camera, Save, KeyRound, Eye, EyeOff, Check, Mail, Shield, User, Calendar, Pencil, X } from 'lucide-react';
import { uploadMedia } from '../services/mediaService';
import { resolveMediaUrl } from '../../lib/apiClient';
import { getMyProfile, updateMyProfile, changeMyPassword } from '../services/profileService';

const INPUT = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#001856] focus:ring-1 focus:ring-[#001856] transition-all disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed";
const LABEL = "block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest";

export default function PerfilPage() {
  const navigate = useNavigate();

  const [userId, setUserId]       = useState('');
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [role, setRole]           = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [loading, setLoading]     = useState(true);

  const [editMode, setEditMode]   = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError]     = useState('');

  // password modal
  const [pwModalOpen, setPwModalOpen]   = useState(false);
  const [currentPass, setCurrentPass]   = useState('');
  const [newPass, setNewPass]           = useState('');
  const [confirmPass, setConfirmPass]   = useState('');
  const [showCurrent, setShowCurrent]   = useState(false);
  const [showNew, setShowNew]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError]     = useState('');

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const profile = await getMyProfile();
      if (!profile) { navigate('/login'); return; }

      setUserId(profile.userId);
      setEmail(profile.email);
      setEditEmail(profile.email);
      setAvatarUrl(profile.avatarUrl);
      setName(profile.name);
      setRole(profile.role);
      setCreatedAt(profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('pt-BR') : '');
      setLoading(false);
    })();
  }, [navigate]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCancelEdit = () => {
    setEditEmail(email);
    setEditMode(false);
    setProfileError('');
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileError('');
    setProfileSuccess(false);
    try {
      let finalAvatarUrl = avatarUrl;
      if (pendingFile) {
        const uploaded = await uploadMedia(pendingFile, `avatars`);
        finalAvatarUrl = uploaded.caminhoRelativo;
      }

      await updateMyProfile(name, editEmail, finalAvatarUrl);

      setAvatarUrl(finalAvatarUrl);
      setEmail(editEmail);
      setPendingFile(null);
      setProfileSuccess(true);
      setEditMode(false);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.message ?? 'Erro ao salvar perfil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleOpenPwModal = () => {
    setCurrentPass(''); setNewPass(''); setConfirmPass('');
    setPasswordError(''); setPasswordSuccess(false);
    setPwModalOpen(true);
  };

  const handleSavePassword = async () => {
    setPasswordError('');
    if (!currentPass) { setPasswordError('Informe a senha atual.'); return; }
    if (!newPass || !confirmPass) { setPasswordError('Preencha a nova senha e a confirmação.'); return; }
    if (newPass.length < 6) { setPasswordError('A nova senha deve ter ao menos 6 caracteres.'); return; }
    if (newPass !== confirmPass) { setPasswordError('As senhas não coincidem.'); return; }

    setSavingPassword(true);
    try {
      await changeMyPassword(currentPass, newPass);
      setPasswordSuccess(true);
      setTimeout(() => { setPasswordSuccess(false); setPwModalOpen(false); }, 2000);
    } catch (err: any) {
      setPasswordError(err.message ?? 'Erro ao alterar senha.');
    } finally {
      setSavingPassword(false);
    }
  };

  const displayAvatar = avatarPreview || (avatarUrl ? resolveMediaUrl(avatarUrl) : '');
  const initials = name ? name.substring(0, 2).toUpperCase() : '??';
  const roleLabel: Record<string, string> = {
    super_admin: 'Super Administrador', admin: 'Administrador',
    financial: 'Financeiro', secretary: 'Secretária', editor: 'Editor', operator: 'Operador',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#001856] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <button type="button" onClick={() => navigate('/painel')}
          className="flex items-center gap-2 text-gray-500 hover:text-[#001856] transition-colors text-sm font-medium">
          <ArrowLeft size={16} /> Voltar ao Painel
        </button>
        <span className="text-gray-200">|</span>
        <span className="text-[#001856] font-semibold text-sm">Meu Perfil</span>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: Avatar + identidade ── */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-[#001856] flex items-center justify-center">
                {displayAvatar
                  ? <img src={displayAvatar} alt={name} className="w-full h-full object-cover" />
                  : <span className="text-[#ffc300] text-3xl font-bold">{initials}</span>
                }
              </div>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-[#001856] rounded-full flex items-center justify-center shadow-md hover:bg-[#002070] transition-colors">
                <Camera size={14} className="text-[#ffc300]" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            </div>

            <h2 className="text-base font-bold text-[#001856]">{name || 'Sem nome'}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{email}</p>
            <span className="mt-2 inline-block bg-[#001856] text-[#ffc300] text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
              {roleLabel[role] ?? role}
            </span>

            {/* Botão alterar senha */}
            <button type="button" onClick={handleOpenPwModal}
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:border-[#001856] hover:text-[#001856] text-xs font-semibold transition-all">
              <KeyRound size={13} /> Alterar senha
            </button>

            {pendingFile && (
              <p className="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                Nova foto selecionada — salve para aplicar.
              </p>
            )}
          </div>

          {/* Metadados */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Metadados</p>
            {createdAt && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={14} className="text-gray-300 shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-400 block">Data de cadastro</span>
                  {createdAt}
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield size={14} className="text-gray-300 shrink-0" />
              <div>
                <span className="text-[10px] text-gray-400 block">Nível de acesso</span>
                {roleLabel[role] ?? role}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Detalhes ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-[#001856]">Detalhes Cadastrais</h3>
              {!editMode ? (
                <button type="button" onClick={() => setEditMode(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-[#001856] hover:border-[#001856] text-xs font-semibold transition-all">
                  <Pencil size={12} /> Editar
                </button>
              ) : (
                <button type="button" onClick={handleCancelEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 text-xs font-semibold transition-all">
                  <X size={12} /> Cancelar
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 mb-5">
              {editMode ? 'Edite os campos e clique em salvar.' : 'Clique no lápis para editar seus dados.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nome — sempre editável */}
              <div className="sm:col-span-2">
                <label className={LABEL}><User size={11} className="inline mr-1" />Nome completo</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  disabled={!editMode}
                  className={INPUT} />
              </div>

              {/* E-mail */}
              <div>
                <label className={LABEL}><Mail size={11} className="inline mr-1" />Endereço de e-mail</label>
                <input type="email" value={editMode ? editEmail : email}
                  onChange={e => setEditEmail(e.target.value)}
                  disabled={!editMode}
                  className={INPUT} />
              </div>

              {/* Cargo — somente leitura: só admin troca role, via Controle de Usuários */}
              <div>
                <label className={LABEL}><Shield size={11} className="inline mr-1" />Cargo / Função</label>
                <input type="text" value={roleLabel[role] ?? role}
                  disabled
                  className={INPUT} />
              </div>
            </div>

            {profileError && (
              <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {profileError}
              </div>
            )}

            {editMode && (
              <div className="flex justify-end mt-5">
                <button type="button" onClick={handleSaveProfile} disabled={savingProfile}
                  className="flex items-center gap-2 bg-[#001856] hover:bg-[#002070] text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all disabled:opacity-50">
                  {profileSuccess
                    ? <><Check size={15} /> Salvo!</>
                    : savingProfile
                      ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Salvando...</>
                      : <><Save size={15} /> Salvar Alterações</>
                  }
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal alterar senha ── */}
      {pwModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <KeyRound size={16} className="text-[#001856]" />
                <h3 className="text-base font-bold text-[#001856]">Alterar Senha</h3>
              </div>
              <button type="button" onClick={() => setPwModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-5">Use uma senha forte com ao menos 6 caracteres.</p>

            <div className="space-y-4">
              {/* Senha atual */}
              <div>
                <label className={LABEL}>Senha atual</label>
                <div className="relative">
                  <input type={showCurrent ? 'text' : 'password'} value={currentPass}
                    onChange={e => setCurrentPass(e.target.value)}
                    placeholder="••••••••" className={INPUT + ' pr-10'} />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Nova senha */}
              <div>
                <label className={LABEL}>Nova senha</label>
                <div className="relative">
                  <input type={showNew ? 'text' : 'password'} value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                    placeholder="••••••••" className={INPUT + ' pr-10'} />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Confirmar senha */}
              <div>
                <label className={LABEL}>Confirmar nova senha</label>
                <div className="relative">
                  <input type={showConfirm ? 'text' : 'password'} value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)}
                    placeholder="••••••••" className={INPUT + ' pr-10'} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {passwordError && (
              <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2">
                <Check size={14} /> Senha alterada com sucesso!
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setPwModalOpen(false)}
                className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button type="button" onClick={handleSavePassword} disabled={savingPassword}
                className="flex items-center gap-2 bg-[#001856] hover:bg-[#002070] text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all disabled:opacity-50">
                {savingPassword
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Salvando...</>
                  : <><KeyRound size={15} /> Alterar Senha</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
