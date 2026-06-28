/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect } from 'react';
import {
  Users, UserCheck, Heart, DollarSign, Calendar, ArrowUpRight, Clock, MapPin,
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
    <div className="space-y-6 p-8 min-h-screen">

      {/* ── BANNER SUPERIOR ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#001856] rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-[#ffc300]">
          <Award size={180} />
        </div>
        <div className="z-10">
          <div className="flex items-center gap-2 text-xs text-[#ffc300] font-bold uppercase tracking-widest mb-1">
            <Sparkles size={13} />
            <span>Painel Consolidado Geral</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white leading-tight" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
            Visão Geral e ERP da Filarmônica
          </h2>
          <p className="text-sm text-white/60 mt-1 max-w-xl">
            Gerencie dados cadastrais, emita relatórios financeiros e atualize o site em tempo real.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('financeiro-relatorios')}
          className="flex items-center gap-1.5 bg-[#ffc300] hover:bg-yellow-400 text-[#001856] px-4 py-2 rounded-lg text-sm font-semibold transition-colors z-10 flex-shrink-0"
        >
          <TrendingUp size={14} /> Ver Balancetes
        </button>
      </div>

      {/* ── KPI CARDS ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

        {/* Card 1: Alunos */}
        <div
          onClick={() => onNavigate('pessoas-alunos')}
          className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex items-center gap-3 cursor-pointer hover:shadow-md hover:border-[#001856]/20 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#001856] flex items-center justify-center flex-shrink-0">
            <Users size={18} className="text-[#ffc300]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400 truncate">Total de Alunos</p>
            <p className="text-xl font-bold text-[#001856]">{metrics.totalStudents}</p>
            <p className="text-xs text-green-600">+12 novos este mês</p>
          </div>
        </div>

        {/* Card 2: Professores */}
        <div
          onClick={() => onNavigate('pessoas-professores')}
          className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex items-center gap-3 cursor-pointer hover:shadow-md hover:border-[#001856]/20 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#ffc300] flex items-center justify-center flex-shrink-0">
            <UserCheck size={18} className="text-[#001856]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400 truncate">Total de Professores</p>
            <p className="text-xl font-bold text-[#001856]">{metrics.totalProfs}</p>
            <p className="text-xs text-gray-400">Sopros e Percussão</p>
          </div>
        </div>

        {/* Card 3: Apoiadores */}
        <div
          onClick={() => onNavigate('financeiro-apoiadores')}
          className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex items-center gap-3 cursor-pointer hover:shadow-md hover:border-[#001856]/20 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#001856] flex items-center justify-center flex-shrink-0">
            <Heart size={18} className="text-[#ffc300]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400 truncate">Total de Apoiadores</p>
            <p className="text-xl font-bold text-[#001856]">{metrics.totalSups}</p>
            <p className="text-xs text-green-600">Empresas Incentivadas</p>
          </div>
        </div>

        {/* Card 4: Doações */}
        <div
          onClick={() => onNavigate('financeiro-doacoes')}
          className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex items-center gap-3 cursor-pointer hover:shadow-md hover:border-[#001856]/20 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#ffc300] flex items-center justify-center flex-shrink-0">
            <DollarSign size={18} className="text-[#001856]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400 truncate">Total de Doações</p>
            <p className="text-xl font-bold text-[#001856]">{metrics.totalDonationsCount}</p>
            <p className="text-xs text-gray-400">PIX, Boleto e Crédito</p>
          </div>
        </div>

        {/* Card 5: Eventos */}
        <div
          onClick={() => onNavigate('conteudo-eventos')}
          className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex items-center gap-3 cursor-pointer hover:shadow-md hover:border-[#001856]/20 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#001856] flex items-center justify-center flex-shrink-0">
            <Calendar size={18} className="text-[#ffc300]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400 truncate">Eventos na Agenda</p>
            <p className="text-xl font-bold text-[#001856]">{metrics.scheduledEventsCount}</p>
            <p className="text-xs text-gray-400">Concertos e Oficinas</p>
          </div>
        </div>

        {/* Card 6: Interessados — wide */}
        <div
          onClick={() => onNavigate('relacionamento-interesse')}
          className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md hover:border-[#001856]/20 transition-all sm:col-span-2 lg:col-span-2 xl:col-span-3"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ffc300] flex items-center justify-center flex-shrink-0">
                <Users size={18} className="text-[#001856]" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Novos Interessados Cadastrados</p>
                <p className="text-xl font-bold text-[#001856]">{metrics.totalInterestsCount} Candidatos Bolsistas</p>
                <p className="text-xs text-gray-400 italic">Via formulário "Tenho Interesse" do site público</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#001856] font-semibold border border-[#001856]/20 rounded-lg px-3 py-1.5 hover:bg-[#001856]/5 transition-colors flex-shrink-0">
              Converter em Aluno <ArrowUpRight size={13} />
            </div>
          </div>
        </div>

      </div>

      {/* ── GRÁFICOS ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Gráfico A: Crescimento de Alunos */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-[#ffc300] uppercase tracking-wider">Crescimento Institucional</span>
            <span className="text-xs text-gray-400">Matrícula Geral</span>
          </div>
          <h3 className="font-bold text-[#001856] mb-4">Evolução do Corpo de Alunos</h3>
          <div className="flex-1 flex items-center justify-center">
            <CustomAreaChart data={studentGrowthData} color="#001856" />
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <span>Acumulado por mês de matrícula</span>
            <span className="text-[#001856] font-bold">Total: {metrics.totalStudents} alunos</span>
          </div>
        </div>

        {/* Gráfico B: Doações */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-[#001856] uppercase tracking-wider">Financiamento Coletivo</span>
            <span className="text-xs text-gray-400">Fluxo de Caixa</span>
          </div>
          <h3 className="font-bold text-[#001856] mb-4">Doações Confirmadas (Mensal)</h3>
          <div className="flex-1 flex items-center justify-center">
            <CustomBarChart
              data={donationGrowthData}
              v1Name="Doações"
              v2Name=""
              color1="#ffc300"
              color2="transparent"
            />
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <span>Valores em Reais</span>
            <span className="text-green-600 font-bold">R$ {metrics.grossDonationsValue.toLocaleString('pt-BR')}</span>
          </div>
        </div>

      </div>

      {/* ── WIDGETS ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Widget 1: Próximos Eventos */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
            <span className="font-bold text-[#001856] text-sm flex items-center gap-2">
              <Calendar size={15} className="text-[#ffc300]" /> Próximos Eventos
            </span>
            <button onClick={() => onNavigate('conteudo-eventos')} className="text-xs text-[#001856] font-semibold hover:underline">
              Ver agenda
            </button>
          </div>
          <div className="space-y-3">
            {eventsLoading ? (
              <p className="text-sm text-gray-400 py-4 text-center">Carregando eventos...</p>
            ) : events.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Nenhum evento cadastrado.</p>
            ) : events.slice(0, 3).map((evt) => (
              <div key={evt.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 rounded-lg bg-[#001856] flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-[9px] uppercase font-bold text-[#ffc300] leading-none">
                    {evt.date.substring(3, 6)}
                  </span>
                  <span className="text-sm font-bold text-white mt-0.5">
                    {evt.date.substring(0, 2)}
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="block text-sm font-semibold text-[#001856] truncate">{evt.title}</span>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                    <MapPin size={10} className="text-[#ffc300]" />
                    <span className="truncate">{evt.location}</span>
                    <span>· {evt.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 2: Últimas Atividades */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
            <span className="font-bold text-[#001856] text-sm flex items-center gap-2">
              <Clock size={15} className="text-[#ffc300]" /> Últimas Atividades
            </span>
            <button onClick={() => onNavigate('sistema-auditoria')} className="text-xs text-[#001856] font-semibold hover:underline">
              Auditoria
            </button>
          </div>
          <div className="space-y-3">
            {auditLogs.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Nenhuma atividade registrada.</p>
            ) : auditLogs.slice(0, 3).map((log) => (
              <div key={log.id} className="flex gap-3">
                <div className="mt-1 flex-shrink-0">
                  <CheckCircle2 size={14} className="text-[#ffc300]" />
                </div>
                <div>
                  <p className="text-sm text-gray-700 leading-tight">
                    <span className="font-semibold text-[#001856]">{log.userName}</span> {log.action}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{log.details}</p>
                  <span className="text-xs text-gray-300">{log.dateTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}