import React, { useState } from 'react';
import {
  Music, LayoutDashboard, Globe, Users, HeartHandshake, DollarSign,
  BookOpen, Settings, ChevronDown, ListMusic, UserCheck, UserPlus,
  HelpCircle, Calendar, Image, ShieldAlert, FileClock, Menu, X, ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: string;
  permissions: string[];
}

const navGroups = [
  {
    id: 'conteudo',
    title: 'Conteúdo (CMS)',
    permissionKey: 'conteudo',
    items: [
      { id: 'site-banners', label: 'Hero Banners', icon: <Image size={14} /> },
      { id: 'conteudo-eventos', label: 'Eventos', icon: <Calendar size={14} /> },
      // { id: 'conteudo-cursos', label: 'Cursos e Oficinas', icon: <BookOpen size={14} /> },
      // { id: 'conteudo-galeria', label: 'Galeria Mídia', icon: <Image size={14} /> },
      { id: 'conteudo-instrumentos', label: 'Instrumentos', icon: <ListMusic size={14} /> },
    ],
  },
  {
    id: 'relacionamento',
    title: 'Relacionamento',
    permissionKey: 'relacionamento',
    items: [
      { id: 'relacionamento-interesse', label: 'Tenho Interesse', icon: <BookOpen size={14} /> },
      { id: 'relacionamento-apoiar', label: 'Quero Apoiar', icon: <HeartHandshake size={14} /> },
      { id: 'pessoas-alunos', label: 'Alunos', icon: <UserPlus size={14} /> },
    ],
  },
  // {
  //   id: 'pessoas',
  //   title: 'Pessoas (ERP)',
  //   permissionKey: 'pessoas',
  //   items: [
  //     { id: 'pessoas-professores', label: 'Professores', icon: <UserCheck size={14} /> },
  //     { id: 'pessoas-alunos', label: 'Alunos', icon: <UserPlus size={14} /> },
  //   ],
  // },
  {
    id: 'financeiro',
    title: 'Financeiro',
    permissionKey: 'financeiro',
    items: [
      { id: 'financeiro-doacoes', label: 'Doações Diretas', icon: <DollarSign size={14} /> },
    ],
  },
  {
    id: 'sistema',
    title: 'Configurações Sistema',
    permissionKey: 'sistema',
    items: [
      { id: 'sistema-usuarios', label: 'Controle Usuários', icon: <ShieldAlert size={14} /> },
      { id: 'sistema-auditoria', label: 'Logs Auditoria', icon: <FileClock size={14} /> },
    ],
  },
];

export default function Sidebar({ activeTab, setActiveTab, userRole, permissions }: SidebarProps) {
  const navigate = useNavigate();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    pessoas: true,
    relacionamento: true,
    financeiro: true,
    conteudo: true,
    sistema: false,
  });
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const hasPermission = (key: string) =>
    userRole === 'super_admin' || userRole === 'admin' || permissions.includes(key);

  const goTo = (id: string) => {
    setActiveTab(id);
    setIsOpenMobile(false);
  };

  const SidebarContent = (
    <div className="flex flex-col h-full bg-[#001856] text-white">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <p className="text-[#ffc300] uppercase tracking-widest text-xs font-bold mb-1">Painel</p>
        <h1 className="text-white font-bold text-base leading-tight" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
          Filarmônica<br />de Metais
        </h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {/* Dashboard */}
        {hasPermission('dashboard') && (
          <button
            type="button"
            onClick={() => goTo('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left mb-3 ${
              activeTab === 'dashboard'
                ? 'bg-[#ffc300] text-[#001856] font-semibold'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <LayoutDashboard size={16} />
            <span>Painel de Estatísticas</span>
          </button>
        )}

        {/* Grupos */}
        {navGroups.map((group) => {
          if (!hasPermission(group.permissionKey)) return null;
          const isExpanded = expandedGroups[group.id] ?? true;

          return (
            <div key={group.id} className="mb-2">
              <button
                type="button"
                onClick={() =>
                  setExpandedGroups((prev) => ({ ...prev, [group.id]: !prev[group.id] }))
                }
                className="w-full flex items-center justify-between px-3 py-1 mb-1 text-white/30 text-[11px] font-bold uppercase tracking-widest hover:text-white/50 transition-colors"
              >
                <span>{group.title}</span>
                <ChevronDown
                  size={11}
                  className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              {isExpanded && (
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => goTo(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left cursor-pointer ${
                        activeTab === item.id
                          ? 'bg-[#ffc300] text-[#001856] font-semibold'
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Voltar ao Site */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} />
          Voltar ao Site
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Botão mobile */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        <button
          type="button"
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="p-2 rounded-md bg-[#001856] border border-white/10 text-[#ffc300] shadow-lg"
        >
          {isOpenMobile ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Desktop */}
      <aside className="hidden md:flex w-64 h-screen sticky top-0 flex-shrink-0 flex-col z-40">
        {SidebarContent}
      </aside>

      {/* Mobile overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden flex">
          <div className="w-64 h-full flex-shrink-0">{SidebarContent}</div>
          <div className="flex-1" onClick={() => setIsOpenMobile(false)} />
        </div>
      )}
    </>
  );
}
