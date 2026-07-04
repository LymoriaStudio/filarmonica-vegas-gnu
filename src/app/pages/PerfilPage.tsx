import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Camera, Save, KeyRound, Eye, EyeOff, Check, Mail, Shield, User, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { uploadFileToSupabase } from '../components/painel/MiniWidgets';

// ─── helpers ─────────────────────────────────────────────────────────────────

const INPUT = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#001856] focus:ring-1 focus:ring-[#001856] transition-all disabled:bg-gray-50 disabled:text-gray-400";
const LABEL = "block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest";

function Field({ label, value, onChange, disabled = false, icon, type = 'text' }: {
  label: string; value: string; onChange?: (v: string) => void;
  disabled?: boolean; icon?: React.ReactNode; type?: string;
}) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          disabled={disabled}
          className={INPUT + (icon ? ' pl-9' : '')}
        />
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PerfilPage() {
  const navigate = useNavigate();

  // profile data
  const [userId, setUserId]     = useState('');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [role, setRole]         = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [loading, setLoading]   = useState(true);

  // save states
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // password
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass]         = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  // ── Load profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) { navigate('/login'); return; }

      setUserId(user.id);
      setEmail(user.email ?? '');
      setAvatarUrl(user.user_metadata?.avatar_url ?? '');

      const { data: profile } = await supabase
        .from('profiles')
        .select('name, role, created_at')
        .eq('id', user.id)
        .single();

      if (profile) {
        setName(profile.name ?? '');
        setRole(profile.role ?? '');
        setCreatedAt(profile.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR') : '');
      }
      setLoading(false);
    })();
  }, [navigate]);

  // ── Avatar select ─────────────────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileError('');
    setProfileSuccess(false);
    try {
      let finalAvatarUrl = avatarUrl;

      // upload avatar if pending
      if (pendingFile) {
        finalAvatarUrl = await uploadFileToSupabase(pendingFile, `avatars/${userId}`);
        await supabase.auth.updateUser({ data: { avatar_url: finalAvatarUrl } });
        setAvatarUrl(finalAvatarUrl);
        setPendingFile(null);
      }

      // update name in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', userId);

      if (error) throw error;

      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.message ?? 'Erro ao salvar perfil.');
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Change password ───────────────────────────────────────────────────────
  const handleSavePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);
    if (!newPass || !confirmPass) { setPasswordError('Preencha todos os campos de senha.'); return; }
    if (newPass.length < 6) { setPasswordError('A nova senha deve ter ao menos 6 caracteres.'); return; }
    if (newPass !== confirmPass) { setPasswordError('As senhas não coincidem.'); return; }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) throw error;
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message ?? 'Erro ao alterar senha.');
    } finally {
      setSavingPassword(false);
    }
  };

  const displayAvatar = avatarPreview || avatarUrl;
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
        <button
          type="button"
          onClick={() => navigate('/painel')}
          className="flex items-center gap-2 text-gray-500 hover:text-[#001856] transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Voltar ao Painel
        </button>
        <span className="text-gray-200">|</span>
        <span className="text-[#001856] font-semibold text-sm">Meu Perfil</span>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT CARD: Avatar + identidade ── */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col items-center text-center">

            {/* Avatar */}
            <div className="relative mb-4">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-[#001856] flex items-center justify-center">
                {displayAvatar
                  ? <img src={displayAvatar} alt={name} className="w-full h-full object-cover" />
                  : <span className="text-[#ffc300] text-3xl font-bold">{initials}</span>
                }
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-[#001856] rounded-full flex items-center justify-center shadow-md hover:bg-[#002070] transition-colors"
              >
                <Camera size={14} className="text-[#ffc300]" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            </div>

            <h2 className="text-base font-bold text-[#001856]">{name || 'Sem nome'}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{email}</p>
            <span className="mt-2 inline-block bg-[#001856] text-[#ffc300] text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
              {roleLabel[role] ?? role}
            </span>

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

        {/* ── RIGHT CARDS ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Detalhes cadastrais */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h3 className="text-base font-bold text-[#001856] mb-1">Detalhes Cadastrais</h3>
            <p className="text-xs text-gray-400 mb-5">Atualize seu nome de exibição e foto de perfil.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field
                  label="Nome completo"
                  value={name}
                  onChange={setName}
                  icon={<User size={14} />}
                />
              </div>
              <Field
                label="Endereço de e-mail (inalterável)"
                value={email}
                disabled
                icon={<Mail size={14} />}
              />
              <Field
                label="Cargo / Função (inalterável)"
                value={roleLabel[role] ?? role}
                disabled
                icon={<Shield size={14} />}
              />
            </div>

            <p className="text-[11px] text-gray-400 mt-4">
              * E-mail e cargo são gerenciados pelo administrador do sistema.
            </p>

            {profileError && (
              <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {profileError}
              </div>
            )}

            <div className="flex justify-end mt-5">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="flex items-center gap-2 bg-[#001856] hover:bg-[#002070] text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all disabled:opacity-50"
              >
                {profileSuccess
                  ? <><Check size={15} /> Salvo!</>
                  : savingProfile
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Salvando...</>
                    : <><Save size={15} /> Salvar Alterações</>
                }
              </button>
            </div>
          </div>

          {/* Alterar senha */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <KeyRound size={16} className="text-[#001856]" />
              <h3 className="text-base font-bold text-[#001856]">Alterar Senha de Acesso</h3>
            </div>
            <p className="text-xs text-gray-400 mb-5">Use uma senha forte com ao menos 6 caracteres.</p>

            <div className="space-y-4">
              {/* new password */}
              <div>
                <label className={LABEL}>Nova senha</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                    placeholder="••••••••"
                    className={INPUT + ' pr-10'}
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* confirm password */}
              <div>
                <label className={LABEL}>Confirmar nova senha</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)}
                    placeholder="••••••••"
                    className={INPUT + ' pr-10'}
                  />
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

            <div className="flex justify-end mt-5">
              <button
                type="button"
                onClick={handleSavePassword}
                disabled={savingPassword}
                className="flex items-center gap-2 bg-[#001856] hover:bg-[#002070] text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all disabled:opacity-50"
              >
                {passwordSuccess
                  ? <><Check size={15} /> Alterada!</>
                  : savingPassword
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Salvando...</>
                    : <><KeyRound size={15} /> Alterar Senha</>
                }
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
