/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect } from 'react';
import { 
  Users, UserCheck, Heart, DollarSign, Calendar, Plus, ArrowUpRight, Clock, MapPin, 
  Award, CheckCircle2, TrendingUp, Sparkles
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { getProfessors } from '../../services/professorsService'; // ajuste o path se necessário
import { getDoacoes } from '../../services/doacoesService';       // ajuste o path se necessário
import { useEvents } from '../../hooks/useEvents';
import { OrchestraEvent, AuditLog, InterestFormResponse } from '../../validations/types';
import { CustomAreaChart, CustomBarChart } from './MiniWidgets';

// ─── Tipos locais mínimos ─────────────────────────────────────────────────────

interface StudentRow { id: string; created_at: string; [key: string]: unknown }
interface ProfessorRow { id: string; [key: string]: unknown }
interface SupporterRow { id: string; status: string; [key: string]: unknown }
interface DoacaoRow { id: string; status: string; amount: number; date: string; donor_name?: string; payment_method?: string; [key: string]: unknown }

// ─── Props ────────────────────────────────────────────────────────────────────

interface DashboardHomeProps {
  events?: OrchestraEvent[];        // mantido para compatibilidade, mas será sobrescrito
  interests: InterestFormResponse[];
  auditLogs: AuditLog[];
  onNavigate: (tabId: string) => void;
  onQuickAction: (actionKey: string) => void;
}

export default function DashboardHome({
  interests,
  auditLogs,
  onNavigate,
}: DashboardHomeProps) {

  // ─── Estado dos dados da API ─────────────────────────────────────────────

  const [students, setStudents]       = useState<StudentRow[]>([]);
  const [professors, setProfessors]   = useState<ProfessorRow[]>([]);
  const [supporters, setSupporters]   = useState<SupporterRow[]>([]);
  const [donations, setDonations]     = useState<DoacaoRow[]>([]);

  const { events, loading: eventsLoading } = useEvents({ onlyPublished: true });

  useEffect(() => {
    // Alunos
    supabase
      .from('students')
      .select('id, created_at')
      .then(({ data }) => setStudents(data ?? []));

    // Professores
    getProfessors().then(setProfessors).catch(console.error);

    // Apoiadores aprovados
    supabase
      .from('quero_apoiar')
      .select('id, status')
      .eq('status', 'aprovado')
      .then(({ data }) => setSupporters(data ?? []));

    // Doações confirmadas
    getDoacoes()
      .then(all => setDonations(all.filter((d: DoacaoRow) => d.status === 'confirmado')))
      .catch(console.error);
  }, []);

  // ─── Métricas ─────────────────────────────────────────────────────────────

  const metrics = useMemo(() => {
    const totalStudents        = students.length;
    const totalProfs           = professors.length;
    const totalSups            = supporters.length;
    const totalDonationsCount  = donations.length;
    const grossDonationsValue  = donations.reduce((sum, d) => sum + (d.amount ?? 0), 0);
    const scheduledEventsCount = events.length;
    const totalInterestsCount  = interests.length;

    return {
      totalStudents,
      totalProfs,
      totalSups,
      totalDonationsCount,
      grossDonationsValue,
      scheduledEventsCount,
      totalInterestsCount,
    };
  }, [students, professors, supporters, donations, events, interests]);

  // ─── Dados dos gráficos (derivados de dados reais) ────────────────────────

  const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  // Crescimento de alunos: acumulado mês a mês, rastreando created_at de cada aluno
  const studentGrowthData = useMemo(() => {
    if (students.length === 0) {
      return [{ label: 'Sem dados', value: 0 }];
    }

    // Conta quantos alunos entraram em cada "AAAA-MM"
    const countsByMonth = new Map<string, number>();
    students.forEach(s => {
      const d = new Date(s.created_at);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      countsByMonth.set(key, (countsByMonth.get(key) ?? 0) + 1);
    });

    // Ordena as chaves cronologicamente
    const sortedKeys = Array.from(countsByMonth.keys()).sort();

    // Acumula para formar uma curva de crescimento
    let running = 0;
    return sortedKeys.map(key => {
      const [year, month] = key.split('-');
      running += countsByMonth.get(key)!;
      return {
        label: `${MONTH_LABELS[Number(month) - 1]}/${year.slice(2)}`,
        value: running,
      };
    });
  }, [students]);

  // Doações confirmadas: soma por mês, uma única série
  // (CustomBarChart exige { label, v1, v2 } — v2 fica zerado para não desenhar a segunda barra)
  const donationGrowthData = useMemo(() => {
    if (donations.length === 0) {
      return [{ label: 'Sem dados', v1: 0, v2: 0 }];
    }

    const sumByMonth = new Map<string, number>();
    donations.forEach(d => {
      const raw = d.date;
      if (!raw) return;
      const parsed = new Date(raw);
      if (isNaN(parsed.getTime())) return;
      const key = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
      sumByMonth.set(key, (sumByMonth.get(key) ?? 0) + (d.amount ?? 0));
    });

    const sortedKeys = Array.from(sumByMonth.keys()).sort();

    return sortedKeys.map(key => {
      const [year, month] = key.split('-');
      return {
        label: `${MONTH_LABELS[Number(month) - 1]}/${year.slice(2)}`,
        v1: Math.round(sumByMonth.get(key)!),
        v2: 0,
      };
    });
  }, [donations]);

  return (
    <div className="space-y-6 animate-fade-in p-6 select-none bg-neutral-950/10 min-h-screen">
      
      {/* Upper greetings & Quick launch title banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl glass-panel relative overflow-hidden bg-gradient-to-r from-neutral-900 to-neutral-950">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-[#F2C94C] blur-xs">
          <Award size={180} />
        </div>
        <div className="z-10">
          <div className="flex items-center space-x-2 text-xs font-mono text-amber-400">
            <Sparkles size={13} className="animate-spin" />
            <span className="uppercase tracking-widest font-bold">Painel Consolidado Geral</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-sans text-neutral-100 tracking-tight mt-1.5 leading-none">
            Visão Geral e ERP da Filarmônica
          </h2>
          <p className="text-xs text-neutral-400 mt-2 max-w-xl">
            Bem-vindo ao centro de comando. Gerencie os dados cadastrais da orquestra escolar, emita relatórios financeiros e atualize o site institucional em tempo real.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 z-10">
          <button
            type="button"
            onClick={() => onNavigate('financeiro-relatorios')}
            className="p-2 py-1.5 text-[11px] font-mono text-[#F2C94C] bg-[#F2C94C]/10 hover:bg-[#F2C94C]/20 border border-[#F2C94C]/30 rounded-lg cursor-pointer transition-all flex items-center"
          >
            <TrendingUp size={12} className="mr-1.5" /> Ver Balancetes
          </button>
        </div>
      </div>

      {/* ========================================================
          1. METRICS CARDS
          ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" id="indicators">
        
        {/* Card 1: Total Alunos */}
        <div 
          onClick={() => onNavigate('pessoas-alunos')} 
          className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-[#0B4DA2] hover:bg-neutral-900/90 transition-all cursor-pointer group flex items-start justify-between"
        >
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono font-bold">Total de Alunos</span>
            <div className="text-2xl font-bold font-mono text-neutral-100">{metrics.totalStudents}</div>
            <p className="text-[10px] text-emerald-400 font-mono flex items-center mt-1">
              +12 novos este mês
            </p>
          </div>
          <div className="p-2 bg-[#0B4DA2]/10 group-hover:bg-[#0B4DA2]/20 text-[#0B4DA2] rounded-lg transition-all">
            <Users size={16} />
          </div>
        </div>

        {/* Card 2: Total Professores */}
        <div 
          onClick={() => onNavigate('pessoas-professores')} 
          className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-[#0B4DA2] hover:bg-neutral-900/90 transition-all cursor-pointer group flex items-start justify-between"
        >
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono font-bold">Total de Professores</span>
            <div className="text-2xl font-bold font-mono text-neutral-100">{metrics.totalProfs}</div>
            <p className="text-[10px] text-neutral-400 font-mono mt-1">Sopros e Percussão</p>
          </div>
          <div className="p-2 bg-amber-500/10 group-hover:bg-amber-500/20 text-[#F2C94C] rounded-lg transition-all">
            <UserCheck size={16} />
          </div>
        </div>

        {/* Card 3: Total Apoiadores */}
        <div 
          onClick={() => onNavigate('financeiro-apoiadores')} 
          className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-[#0B4DA2] hover:bg-neutral-900/90 transition-all cursor-pointer group flex items-start justify-between"
        >
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono font-bold">Total de Apoiadores</span>
            <div className="text-2xl font-bold font-mono text-neutral-100">{metrics.totalSups}</div>
            <p className="text-[10px] text-emerald-400 font-mono mt-1">Empresas Incentivadas</p>
          </div>
          <div className="p-2 bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-all">
            <Heart size={16} />
          </div>
        </div>

        {/* Card 4: Total de Doações */}
        <div 
          onClick={() => onNavigate('financeiro-doacoes')} 
          className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/90 transition-all cursor-pointer group flex items-start justify-between"
        >
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono font-bold">Total de Doações</span>
            <div className="text-2xl font-bold font-mono text-neutral-100">{metrics.totalDonationsCount}</div>
            <p className="text-[10px] text-amber-500 font-mono mt-1">PIX, Boleto e Crédito</p>
          </div>
          <div className="p-2 bg-pink-500/10 group-hover:bg-pink-500/20 text-pink-400 rounded-lg transition-all">
            <DollarSign size={16} />
          </div>
        </div>

        {/* Card 5: Eventos Agendados */}
        <div 
          onClick={() => onNavigate('conteudo-eventos')} 
          className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-[#0B4DA2] hover:bg-neutral-900/90 transition-all cursor-pointer group flex items-start justify-between"
        >
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono font-bold">Eventos Ativos na Agenda</span>
            <div className="text-2xl font-bold font-mono text-neutral-100">{metrics.scheduledEventsCount}</div>
            <p className="text-[10px] text-amber-500 font-mono mt-1">Concertos e Oficinas</p>
          </div>
          <div className="p-2 bg-[#0B4DA2]/10 group-hover:bg-[#0B4DA2]/20 text-[#F2C94C] rounded-lg transition-all">
            <Calendar size={16} />
          </div>
        </div>

        {/* Card 6: Interessados Cadastrados — full width */}
        <div 
          onClick={() => onNavigate('relacionamento-interesse')} 
          className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-[#0B4DA2] hover:bg-neutral-900/90 transition-all cursor-pointer group flex items-start justify-between sm:col-span-2 lg:col-span-3 xl:col-span-3"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono font-bold">Novos Interessados Cadastrados</span>
              <div className="text-2xl font-bold font-mono text-neutral-100 leading-tight">
                {metrics.totalInterestsCount} Candidatos Bolsistas
              </div>
              <p className="text-[10px] text-neutral-400 font-serif italic mt-0.5">Captura direta do formulário principal "Tenho Interesse" do site público</p>
            </div>
            <div className="mt-2 sm:mt-0 p-2 px-3 bg-neutral-850 hover:bg-neutral-800 rounded-lg text-[11px] text-[#F2C94C] font-mono border border-neutral-800 transition-all flex items-center">
              Furar Fila para Converter em Aluno <ArrowUpRight size={13} className="ml-1" />
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================
          2. CHARTS REGION
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart A: Crescimento de Alunos */}
        <div className="p-5 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-amber-500 uppercase tracking-widest font-bold">Crescimento Institucional</span>
              <span className="text-xs text-neutral-500">Matrik Geral</span>
            </div>
            <h3 className="text-base font-bold text-neutral-200 mt-1">Evolução do Corpo de Alunos</h3>
          </div>
          
          <div className="mt-6 flex-1 flex items-center justify-center">
            <CustomAreaChart data={studentGrowthData} color="#F2C94C" />
          </div>
          
          <div className="mt-4 pt-3 border-t border-neutral-850 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
            <span>Acumulado por mês de matrícula</span>
            <span className="text-[#F2C94C] font-bold">Total atual: {metrics.totalStudents} alunos</span>
          </div>
        </div>

        {/* Chart B: Crescimento de Doações */}
        <div className="p-5 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#0B4DA2] uppercase tracking-widest font-bold">Financiamento Coletivo</span>
              <span className="text-xs text-neutral-500">Fluxo de Caixa</span>
            </div>
            <h3 className="text-base font-bold text-neutral-200 mt-1">Doações Confirmadas (Mensal)</h3>
          </div>

          <div className="mt-6 flex-1 flex items-center justify-center">
            <CustomBarChart 
              data={donationGrowthData} 
              v1Name="Doações" 
              v2Name="" 
              color1="#0B4DA2" 
              color2="transparent" 
            />
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-850 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
            <span>Valores Expressos em Reais</span>
            <span className="text-emerald-400 font-bold">R$ {metrics.grossDonationsValue.toLocaleString('pt-BR')}</span>
          </div>
        </div>

      </div>

      {/* ========================================================
          3. RECENT WIDGETS FEED
          ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="widgets">
        
        {/* Widget 1: Próximos Eventos */}
        <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 flex flex-col justify-between">
          <div className="pb-3 border-b border-neutral-800 flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-neutral-200">Próximos Eventos</span>
            <button 
              onClick={() => onNavigate('conteudo-eventos')} 
              className="text-[10px] text-[#F2C94C] hover:underline"
            >
              Ver agenda
            </button>
          </div>
          
          <div className="space-y-3 flex-1">
            {eventsLoading ? (
              <p className="text-[11px] text-neutral-500 font-mono">Carregando eventos...</p>
            ) : events.slice(0, 3).map((evt) => (
              <div key={evt.id} className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-900 flex items-start space-x-3">
                <div className="w-10 h-10 rounded-md bg-[#2B2B2B] text-center flex flex-col justify-center border border-neutral-800 shrink-0">
                  <span className="text-[9px] uppercase font-bold text-[#F2C94C] font-mono leading-none">
                    {evt.date.substring(3, 6)}
                  </span>
                  <span className="text-xs font-bold text-neutral-200 font-mono mt-0.5">
                    {evt.date.substring(0, 2)}
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] font-bold text-neutral-100 truncate">{evt.title}</span>
                  <div className="flex items-center space-x-2 text-[9px] text-neutral-400 font-mono mt-1">
                    <MapPin size={9} className="text-amber-500" />
                    <span className="truncate">{evt.location}</span>
                    <span>• {evt.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 2: Últimas Atividades */}
        <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 flex flex-col justify-between">
          <div className="pb-3 border-b border-neutral-800 flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-neutral-200">Últimas Atividades</span>
            <button 
              onClick={() => onNavigate('sistema-auditoria')} 
              className="text-[10px] text-neutral-400 hover:underline"
            >
              Auditoria
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {auditLogs.slice(0, 3).map((log) => (
              <div key={log.id} className="flex space-x-3 text-xs leading-tight">
                <div className="mt-1 relative flex items-center justify-center">
                  <Clock size={12} className="text-neutral-500" />
                  <span className="absolute -bottom-2.5 -top-2 w-0.5 bg-neutral-800" />
                </div>
                <div>
                  <p className="text-neutral-300 text-[11px] leading-tight">
                    <span className="font-bold text-neutral-100">{log.userName}</span> {log.action}
                  </p>
                  <p className="text-neutral-500 text-[9px] mt-0.5 font-mono">{log.details}</p>
                  <span className="text-[8px] font-mono text-neutral-500">{log.dateTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}