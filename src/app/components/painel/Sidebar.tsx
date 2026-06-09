/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Music, LayoutDashboard, Globe, Users, HeartHandshake, DollarSign, 
  BookOpen, Settings, ChevronDown, ListMusic, UserCheck, UserPlus, 
  HelpCircle, Calendar, Newspaper, Image, ShieldAlert, Library, 
  History, Database, FileClock, Menu, X, Bell
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: string;
  permissions: string[];
}

export default function Sidebar({ activeTab, setActiveTab, userRole, permissions }: SidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    site: true,
    pessoas: true,
    relacionamento: true,
    financeiro: true,
    conteudo: true,
    sistema: false
  });

  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const navGroups = [
    {
      id: 'site',
      title: 'Site Institucional',
      icon: <Globe size={16} className="text-sky-450" />,
      permissionKey: 'site',
      items: [
        { id: 'site-banners', label: 'Hero Banners', icon: <Image size={14} /> },
    
      ]
    },
    {
      id: 'pessoas',
      title: 'Pessoas (ERP)',
      icon: <Users size={16} className="text-amber-450" />,
      permissionKey: 'pessoas',
      items: [
        { id: 'pessoas-professores', label: 'Professores', icon: <UserCheck size={14} /> },
        { id: 'pessoas-alunos', label: 'Alunos', icon: <UserPlus size={14} /> },
     
      ]
    },
    {
      id: 'relacionamento',
      title: 'Relacionamento',
      icon: <HeartHandshake size={16} className="text-[#F2C94C]" />,
      permissionKey: 'relacionamento',
      items: [
        { id: 'relacionamento-interesse', label: 'Tenho Interesse', icon: <BookOpen size={14} /> },
        { id: 'relacionamento-apoiar', label: 'Quero Apoiar', icon: <HeartHandshake size={14} /> },
        { id: 'relacionamento-contato', label: 'Contatos / Ouvidoria', icon: <HelpCircle size={14} /> }
      ]
    },
    {
      id: 'financeiro',
      title: 'Financeiro',
      icon: <DollarSign size={16} className="text-emerald-450" />,
      permissionKey: 'financeiro',
      items: [
        { id: 'financeiro-doacoes', label: 'Doações Diretas', icon: <DollarSign size={14} /> },
      ]
    },
    {
      id: 'conteudo',
      title: 'Conteúdo (CMS)',
      icon: <ListMusic size={16} className="text-[#0B4DA2]" />,
      permissionKey: 'conteudo',
      items: [
        { id: 'conteudo-eventos', label: 'Eventos / Concertos', icon: <Calendar size={14} /> },
        { id: 'conteudo-cursos', label: 'Cursos e Oficinas', icon: <BookOpen size={14} /> },
        { id: 'conteudo-galeria', label: 'Galeria Mídia', icon: <Image size={14} /> }
      ]
    },
    {
      id: 'sistema',
      title: 'Configurações Sistema',
      icon: <Settings size={16} className="text-neutral-400" />,
      permissionKey: 'sistema',
      items: [
        { id: 'sistema-usuarios', label: 'Controle Usuários', icon: <ShieldAlert size={14} /> },
        { id: 'sistema-biblioteca', label: 'Biblioteca Mídias', icon: <Library size={14} /> },
        { id: 'sistema-configuracoes', label: 'Configurações ERP', icon: <Settings size={14} /> },
        { id: 'sistema-auditoria', label: 'Logs Auditoria', icon: <FileClock size={14} /> },
        { id: 'sistema-backup', label: 'Backup Banco Dados', icon: <Database size={14} /> }
      ]
    }
  ];

  const handleItemClick = (id: string) => {
    setActiveTab(id);
    setIsOpenMobile(false);
  };

  const hasPermission = (key: string) => {
    return userRole === 'super_admin' || permissions.includes(key);
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-[#1A1A1A] border-r border-neutral-800 text-neutral-200">
      {/* Brand logo header */}
      <div className="p-5 border-b border-neutral-800 flex items-center space-x-3 bg-neutral-900/50">
        <div className="p-2 bg-[#0B4DA2] rounded-lg text-white glow-border animate-pulse">
          <Music size={20} className="stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-xs font-mono font-bold tracking-widest text-[#F2C94C] uppercase leading-none">Filarmônica</h1>
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-1">SaaS ADM & ERP</p>
        </div>
      </div>

      {/* Main navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {/* Dashboard index */}
        {hasPermission('dashboard') && (
          <button
            onClick={() => handleItemClick('dashboard')}
            className={`w-full flex items-center justify-between p-2 px-3 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-[#0B4DA2] text-white shadow-md shadow-[#0B4DA2]/20 font-semibold' 
                : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <LayoutDashboard size={16} />
              <span>Painel de Estatísticas</span>
            </div>
          </button>
        )}

        {/* Dynamic Groups */}
        {navGroups.map((group) => {
          if (!hasPermission(group.permissionKey)) return null;

          const isExpanded = expandedGroups[group.id];

          return (
            <div key={group.id} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between p-1.5 px-2.5 rounded-md hover:bg-neutral-800/30 text-neutral-400 hover:text-neutral-200 transition-all text-[11px] font-semibold tracking-wider uppercase border-none outline-none select-none"
              >
                <div className="flex items-center space-x-2">
                  {group.icon}
                  <span>{group.title}</span>
                </div>
                <ChevronDown 
                  size={12} 
                  className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                />
              </button>

              {isExpanded && (
                <div className="space-y-0.5 pl-2 border-l border-neutral-800 ml-3.5 mt-1">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center space-x-2.5 p-2 px-3 rounded-md text-[11px] font-medium transition-all ${
                        activeTab === item.id
                          ? 'text-white bg-neutral-800/80 border-l-2 border-[#F2C94C]'
                          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/30'
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
      </div>

      {/* User role indicator at bottom */}
      <div className="p-4 border-t border-neutral-800 bg-neutral-900/60 text-xs flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-[#2B2B2B] flex items-center justify-center font-mono font-bold text-amber-400 text-sm border border-neutral-700">
          U
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-medium text-neutral-200 truncate">{userRole === 'super_admin' ? 'Super Administrador' : userRole.toUpperCase()}</div>
          <div className="text-[9px] font-mono text-neutral-500 truncate leading-tight">Painel Operacional</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Icon to toggle sidebar on small screens */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        <button
          type="button"
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="p-2 rounded-md bg-neutral-900 border border-neutral-800 text-amber-400 shadow-lg focus:outline-none focus:ring-1 focus:ring-amber-400"
        >
          {isOpenMobile ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 flex-shrink-0 z-40">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Overlay Sidebar Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden flex">
          <div className="w-64 h-full animate-fade-in">
            {renderSidebarContent()}
          </div>
          {/* Backdrop Touch Dismiss */}
          <div className="flex-1" onClick={() => setIsOpenMobile(false)} />
        </div>
      )}
    </>
  );
}
