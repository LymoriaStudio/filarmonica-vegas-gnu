/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Bell, User, ChevronDown, Zap, X,
  PlusCircle, Play, LogOut
} from 'lucide-react';
import { AdminNotification, Student, Professor, OrchestraEvent, NewsArticle } from '../../validations/types';
import { useCurrentProfile } from '../../hooks/useCurrentProfile';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const PAGE_LABELS: Record<string, string> = {
  'dashboard': 'Dashboard',
  'pessoas-professores': 'Professores',
  'pessoas-alunos': 'Alunos',
  'pessoas-organizadores': 'Organizadores',
  'relacionamento-interesse': 'Tenho Interesse',
  'relacionamento-apoiar': 'Quero Apoiar',
  'relacionamento-contato': 'Fale Conosco',
  'financeiro-doacoes': 'Doações Diretas',
  'financeiro-apoiadores': 'Apoiadores',
  'financeiro-relatorios': 'Relatórios',
  'site-banners': 'Hero Banners',
  'site-sobre': 'Sobre',
  'site-timeline': 'Timeline',
  'conteudo-eventos': 'Eventos',
  'conteudo-noticias': 'Notícias',
  'conteudo-cursos': 'Cursos e Oficinas',
  'conteudo-galeria': 'Galeria Mídia',
  'conteudo-instrumentos': 'Instrumentos',
  'conteudo-depoimentos': 'Depoimentos',
  'sistema-usuarios': 'Controle de Usuários',
  'sistema-auditoria': 'Logs de Auditoria',
  'sistema-configuracoes': 'Configurações',
  'sistema-backup': 'Backup',
  'sistema-biblioteca': 'Biblioteca',
};

interface HeaderProps {
  notifications: AdminNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AdminNotification[]>>;
  onQuickAction: (actionKey: string) => void;
  activeTab?: string;

  // Data for global search
  students: Student[];
  professors: Professor[];
  events: OrchestraEvent[];
  news: NewsArticle[];
  setActiveTab: (tab: string) => void;
  setSelectedEntityForEdit: (entity: any) => void;
}

export default function Header({
  notifications,
  setNotifications,
  onQuickAction,
  activeTab,
  students,
  professors,
  events,
  news,
  setActiveTab,
  setSelectedEntityForEdit
}: HeaderProps) {
  const { profile, loading: profileLoading } = useCurrentProfile();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const [showNotificationOverlay, setShowNotificationOverlay] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    category: string;
    items: { title: string; subtitle: string; tabId: string; subEntity: any }[];
  }[]>([]);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close overlays on outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Perform search matching
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const matches: typeof searchResults = [];

    // Alunos
    const matchedStudents = students?.filter(s => s.name.toLowerCase().includes(q) || s.instrument.toLowerCase().includes(q));
    if (matchedStudents.length > 0) {
      matches.push({
        category: 'Alunos (ERP Pessoas)',
        items: matchedStudents.map(s => ({
          title: s.name,
          subtitle: `Instrumento: ${s.instrument} | Turma: ${s.classroom}`,
          tabId: 'pessoas-alunos',
          subEntity: s
        }))
      });
    }

    

    // Professores
    const matchedProfs = professors.filter(p => p.name.toLowerCase().includes(q) || p.specialty.toLowerCase().includes(q));
    if (matchedProfs.length > 0) {
      matches.push({
        category: 'Professores (ERP Pessoas)',
        items: matchedProfs.map(p => ({
          title: p.name,
          subtitle: `${p.role} • ${p.specialty}`,
          tabId: 'pessoas-professores',
          subEntity: p
        }))
      });
    }

    // Eventos
    const matchedEvents = events.filter(e => e.title.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q));
    if (matchedEvents.length > 0) {
      matches.push({
        category: 'Agenda & Eventos',
        items: matchedEvents.map(e => ({
          title: e.title,
          subtitle: `Local: ${e.venue} | Data: ${e.date}`,
          tabId: 'conteudo-eventos',
          subEntity: e
        }))
      });
    }

    // Notícias
    const matchedNews = news.filter(n => n.title.toLowerCase().includes(q) || n.category.toLowerCase().includes(q));
    if (matchedNews.length > 0) {
      matches.push({
        category: 'Notícias & Blog',
        items: matchedNews.map(n => ({
          title: n.title,
          subtitle: `Autor: ${n.author} | Categoria: ${n.category}`,
          tabId: 'conteudo-noticias',
          subEntity: n
        }))
      });
    }

    setSearchResults(matches);
  }, [searchQuery, students, professors, events, news]);

  const handleSearchResultClick = (tabId: string, subEntity: any) => {
    setActiveTab(tabId);
    setSelectedEntityForEdit(subEntity);
    setSearchQuery('');
  };

  const activeNotifications = notifications.filter(n => !n.resolved);

  const markAllAsResolved = () => {
    setNotifications(prev => prev.map(n => ({ ...n, resolved: true })));
  };

  const toggleResolveNotification = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, resolved: !n.resolved } : n));
  };

  const displayName = profileLoading ? '...' : (profile?.name ?? 'Usuário');
  const displayRole = profileLoading ? '' : (profile?.role ?? '');
  const initials = displayName.substring(0, 2).toUpperCase();

  console.log("nome: ", profile?.name)

  return (
    <header className="relative h-16 w-full border-b border-gray-200 flex items-center justify-between px-6 z-30 select-none bg-white">
      
      <div className="pl-10 md:pl-0">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Filarmônica de Metais</p>
        <h2 className="text-base font-bold text-[#001856]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
          {activeTab && PAGE_LABELS[activeTab] ? PAGE_LABELS[activeTab] : `Olá, ${displayName}`}
        </h2>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-4">
        
        {/* 2. Quick Actions Menu Button */}
        {/* <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowQuickActions(!showQuickActions);
              setShowNotificationOverlay(false);
              setShowUserMenu(false);
            }}
            className="flex items-center space-x-1.5 p-2 px-3 rounded-lg bg-[#001856] hover:bg-[#002070] text-xs font-semibold text-white cursor-pointer transition-all border border-[#001856]"
          >
            <Zap size={14} className="text-[#F2C94C]" />
            <span className="hidden sm:inline">Ações Rápidas</span>
            <ChevronDown size={12} />
          </button>

          {showQuickActions && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden py-1.5 z-50">
              <div className="px-3 py-1.5 border-b border-gray-100 text-[10px] font-semibold text-[#001856] uppercase tracking-wider">Inserir Módulo</div>
              {[
                { label: 'Novo Aluno', key: 'new-student' },
                { label: 'Novo Professor', key: 'new-professor' },
                { label: 'Novo Evento / Show', key: 'new-event' },
              ].map(action => (
                <button
                  key={action.key}
                  type="button"
                  onClick={() => {
                    onQuickAction(action.key);
                    setShowQuickActions(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-[#001856] text-xs text-left transition-all border-none outline-none"
                >
                  <PlusCircle size={13} className="text-[#ffc300]" />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          )}
        </div> */}

        {/* 3. Real-time Notifications Center */}

        {
          /*
  <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotificationOverlay(!showNotificationOverlay);
              setShowUserMenu(false);
              setShowQuickActions(false);
            }}
            className="relative p-2 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-750 transition-all border border-neutral-700/50"
          >
            <Bell size={15} />
            {activeNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center animate-pulse">
                {activeNotifications.length}
              </span>
            )}
          </button>

          {showNotificationOverlay && (
            <div className="absolute right-0 mt-2 w-80 bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-lg shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800 mb-2">
                <span className="text-xs font-semibold text-neutral-200 flex items-center space-x-1.5">
                  <Bell size={13} className="text-amber-400" />
                  <span>Notificações Pendentes</span>
                  {activeNotifications.length > 0 && (
                    <span className="bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded text-[9px]">
                      {activeNotifications.length} novas
                    </span>
                  )}
                </span>
                {activeNotifications.length > 0 && (
                  <button 
                    onClick={markAllAsResolved}
                    className="text-[10px] text-[#F2C94C] hover:underline"
                  >
                    Limpar todas
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="text-center p-6 text-xs text-neutral-500">Muito bem! Nenhuma notificação.</div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {notifications.map((not) => (
                    <div 
                      key={not.id} 
                      className={`p-2.5 rounded-md text-xs transition-all border ${
                        not.resolved 
                          ? 'bg-neutral-900/30 border-neutral-850 opacity-40' 
                          : 'bg-neutral-950 border-neutral-800 hover:border-neutral-750'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-neutral-200 block text-[11px] leading-tight">
                          {not.title}
                        </span>
                        <button 
                          onClick={() => toggleResolveNotification(not.id)}
                          className={`text-[9px] font-mono px-1 rounded hover:opacity-100 ${not.resolved ? 'bg-neutral-800 text-neutral-400' : 'bg-emerald-950 text-emerald-400'}`}
                        >
                          {not.resolved ? 'Arquivado' : 'Marcar Lido'}
                        </button>
                      </div>
                      <p className="text-neutral-400 text-[10px] mt-1 leading-snug">{not.message}</p>
                      <span className="text-[8px] font-mono text-neutral-600 block mt-1.5">{not.createdAt}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>


          */
        }
      
        {/* 4. Logged-in user display (read-only, dados reais do profile) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotificationOverlay(false);
              setShowQuickActions(false);
            }}
            className="flex items-center space-x-2.5 p-1.5 px-3 hover:bg-gray-100 rounded-lg text-xs font-medium cursor-pointer transition-all text-gray-700"
          >
            <div className="w-7 h-7 rounded-full bg-[#001856] flex items-center justify-center text-[#ffc300] font-bold text-[10px] overflow-hidden shrink-0">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                : initials
              }
            </div>
            <div className="text-left hidden lg:block leading-tight select-none">
              <span className="block font-semibold text-[#001856] text-[11px] max-w-[120px] truncate">{displayName}</span>
              <span className="text-[9px] text-gray-400 capitalize">{displayRole.replace('_', ' ')}</span>
            </div>
            <ChevronDown size={12} className="opacity-60" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
              {/* user info */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#001856] flex items-center justify-center shrink-0 overflow-hidden">
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                    : <span className="text-[#ffc300] text-xs font-bold">{initials}</span>
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-[#001856] font-semibold text-xs truncate">{displayName}</p>
                  <p className="text-gray-400 text-[10px] truncate">{profile?.email}</p>
                </div>
              </div>

              {/* actions */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => { setShowUserMenu(false); navigate('/painel/perfil'); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#001856] transition-colors"
                >
                  <User size={14} className="text-gray-400" />
                  Meu Perfil
                </button>
              </div>

              <div className="border-t border-gray-100 py-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} />
                  Sair da conta
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}