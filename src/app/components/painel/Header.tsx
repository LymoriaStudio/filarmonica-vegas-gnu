/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Bell, User, ChevronDown, Check, Zap, Sparkles, X, 
  UserCheck, PlusCircle, ShieldAlert, CheckSquare, ListFilter, Play
} from 'lucide-react';
import { AppUser, AdminNotification, Student, Professor, OrchestraEvent, NewsArticle } from '../../validations/types';

interface HeaderProps {
  notifications: AdminNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AdminNotification[]>>;
  activeUser: AppUser;
  setActiveUser: (user: AppUser) => void;
  systemUsers: AppUser[];
  onQuickAction: (actionKey: string) => void;
  
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
  activeUser,
  setActiveUser,
  systemUsers,
  onQuickAction,
  students,
  professors,
  events,
  news,
  setActiveTab,
  setSelectedEntityForEdit
}: HeaderProps) {
  const [showNotificationOverlay, setShowNotificationOverlay] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
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
    const matchedStudents = students.filter(s => s.name.toLowerCase().includes(q) || s.instrument.toLowerCase().includes(q));
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

  return (
    <header className="relative h-16 w-full glass-panel border-b border-neutral-800 flex items-center justify-between px-6 z-30 select-none bg-neutral-900/40">
      
      <div>
        <h2>Olá, Izabela</h2>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-4">
        
        {/* 2. Quick Actions Menu Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowQuickActions(!showQuickActions);
              setShowNotificationOverlay(false);
              setShowRoleSelector(false);
            }}
            className="flex items-center space-x-1.5 p-2 px-3 rounded-lg bg-neutral-800/80 hover:bg-[#0B4DA2] text-xs font-semibold text-white cursor-pointer transition-all border border-neutral-700 hover:border-[#0B4DA2]"
          >
            <Zap size={14} className="text-[#F2C94C]" />
            <span className="hidden sm:inline">Ações Rápidas</span>
            <ChevronDown size={12} />
          </button>

          {showQuickActions && (
            <div className="absolute right-0 mt-2 w-52 bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-lg shadow-2xl overflow-hidden py-1.5 z-50">
              <div className="px-3 py-1.5 border-b border-neutral-800 text-[10px] font-semibold text-[#F2C94C] uppercase tracking-wider font-mono">Inserir Módulo</div>
              {[
                { label: 'Novo Aluno', key: 'new-student' },
                { label: 'Novo Professor', key: 'new-professor' },
                { label: 'Novo Evento / Show', key: 'new-event' },
                { label: 'Nova Notícia / Edital', key: 'new-news' },
                { label: 'Novo Organizador', key: 'new-organizer' },
                { label: 'Novo Apoiador Jurídico', key: 'new-supporter' }
              ].map(action => (
                <button
                  key={action.key}
                  type="button"
                  onClick={() => {
                    onQuickAction(action.key);
                    setShowQuickActions(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-neutral-800 text-[#E5E5E5] hover:text-white text-xs text-left transition-all border-none outline-none"
                >
                  <PlusCircle size={13} className="text-amber-400" />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Real-time Notifications Center */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotificationOverlay(!showNotificationOverlay);
              setShowRoleSelector(false);
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

        {/* 4. Swappable Administrator Profile Select Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowRoleSelector(!showRoleSelector);
              setShowNotificationOverlay(false);
              setShowQuickActions(false);
            }}
            className="flex items-center space-x-2.5 p-1.5 px-3 hover:bg-neutral-800 rounded-lg text-xs font-medium cursor-pointer transition-all text-neutral-300"
          >
            <div className="w-6 h-6 rounded bg-[#F2C94C]/10 border border-[#F2C94C]/25 text-[#F2C94C] font-mono font-extrabold flex items-center justify-center text-[10px]">
              {activeUser.name.substring(0,2).toUpperCase()}
            </div>
            <div className="text-left hidden lg:block leading-tight select-none">
              <span className="block font-semibold text-neutral-200 text-[11px] max-w-[120px] truncate">{activeUser.name}</span>
              <span className="text-[9px] font-mono text-amber-400 capitalize">{activeUser.role.replace('_', ' ')}</span>
            </div>
            <ChevronDown size={12} className="opacity-60" />
          </button>

          {showRoleSelector && (
            <div className="absolute right-0 mt-2 w-64 bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-lg shadow-2xl p-2 z-50">
              <div className="p-2 border-b border-neutral-850 mb-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#F2C94C] block font-mono">Alterar Perfil de Acesso</span>
                <p className="text-[9px] text-neutral-500 mt-0.5 leading-tight">Mude os perfis para ver regras e permissões em ação imediata!</p>
              </div>

              <div className="space-y-1 max-h-60 overflow-y-auto">
                {systemUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setActiveUser(user);
                      setShowRoleSelector(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded text-left transition-all ${
                      activeUser.id === user.id 
                        ? 'bg-[#0B4DA2]/20 border-l-2 border-[#0B4DA2] text-white' 
                        : 'hover:bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold flex items-center space-x-1.5">
                        <span>{user.name}</span>
                        {!user.active && <span className="bg-red-500 text-white text-[7px] px-1 rounded">Inativo</span>}
                      </div>
                      <div className="text-[9px] font-mono text-neutral-500">{user.role.toUpperCase()}</div>
                    </div>
                    {activeUser.id === user.id && <Check size={11} className="text-[#0B4DA2]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
