/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect } from 'react';
import {
  Users, UserCheck, Heart, DollarSign, Calendar, ArrowUpRight, Clock, MapPin,
  CheckCircle2, Filter, X
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { getProfessors } from '../../services/professorsService';
import { getDoacoes } from '../../services/doacoesService';
import { useEvents } from '../../hooks/useEvents';
import { OrchestraEvent, AuditLog, InterestFormResponse } from '../../validations/types';
import { CustomAreaChart, CustomBarChart } from './MiniWidgets';

interface StudentRow  { id: string; created_at: string; [key: string]: unknown }
interface ProfessorRow { id: string; created_at?: string; [key: string]: unknown }
interface SupporterRow { id: string; status: string; created_at: string; [key: string]: unknown }
interface DoacaoRow   { id: string; status: string; amount: number; date: string; [key: string]: unknown }

interface DashboardHomeProps {
  events?: OrchestraEvent[];
  interests: InterestFormResponse[];
  auditLogs: AuditLog[];
  onNavigate: (tabId: string) => void;
  onQuickAction: (actionKey: string) => void;
  userRole?: string;
}

const MONTH_LABELS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const MONTH_NAMES  = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function toDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  // handle YYYY-MM-DD without timezone shift
  const d = s.includes('T') ? new Date(s) : new Date(s + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

export default function DashboardHome({ interests, auditLogs, onNavigate, userRole }: DashboardHomeProps) {

  // ── Raw data from API ──────────────────────────────────────────────────────
  const [students,   setStudents]   = useState<StudentRow[]>([]);
  const [professors, setProfessors] = useState<ProfessorRow[]>([]);
  const [supporters, setSupporters] = useState<SupporterRow[]>([]);
  const [donations,  setDonations]  = useState<DoacaoRow[]>([]);

  const { events, loading: eventsLoading } = useEvents({ onlyPublished: true });

  useEffect(() => {
    supabase.from('students').select('id, created_at')
      .then(({ data }) => setStudents(data ?? []));

    getProfessors().then(setProfessors).catch(console.error);

    supabase.from('quero_apoiar').select('id, status, created_at').eq('status', 'aprovado')
      .then(({ data }) => setSupporters(data ?? []));

    getDoacoes()
      .then(all => setDonations(all.filter((d: DoacaoRow) => d.status === 'confirmado')))
      .catch(console.error);
  }, []);

  // ── Filter state ──────────────────────────────────────────────────────────
  const [filterYear,  setFilterYear]  = useState<number | null>(null);
  const [filterMonth, setFilterMonth] = useState<number | null>(null);
  const [filterDay,   setFilterDay]   = useState<number | null>(null);

  const hasFilter = filterYear !== null || filterMonth !== null || filterDay !== null;

  function clearFilter() { setFilterYear(null); setFilterMonth(null); setFilterDay(null); }

  function handleYearChange(v: string) {
    setFilterYear(v ? Number(v) : null);
    setFilterMonth(null);
    setFilterDay(null);
  }
  function handleMonthChange(v: string) {
    setFilterMonth(v ? Number(v) : null);
    setFilterDay(null);
  }

  // ── Available year/month/day options derived from ALL data ─────────────────
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: currentYear - 2023 + 1 }, (_, i) => currentYear - i);
  const availableMonths = Array.from({ length: 12 }, (_, i) => i + 1);
  const availableDays = useMemo(() => {
    // dias do mês selecionado (ou 31 se nenhum mês escolhido)
    const daysInMonth = filterYear && filterMonth
      ? new Date(filterYear, filterMonth, 0).getDate()
      : 31;
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [filterYear, filterMonth]);

  // ── Filter helper ─────────────────────────────────────────────────────────
  function matchesFilter(dateStr: string | null | undefined): boolean {
    if (!filterYear && !filterMonth && !filterDay) return true;
    const d = toDate(dateStr);
    if (!d) return false;
    if (filterYear  && d.getFullYear()   !== filterYear)  return false;
    if (filterMonth && d.getMonth() + 1  !== filterMonth) return false;
    if (filterDay   && d.getDate()        !== filterDay)   return false;
    return true;
  }

  // ── Filtered slices ────────────────────────────────────────────────────────
  const filteredStudents   = useMemo(() => students.filter(s   => matchesFilter(s.created_at)),     [students,   filterYear, filterMonth, filterDay]);
  const filteredDonations  = useMemo(() => donations.filter(d  => matchesFilter(d.date)),            [donations,  filterYear, filterMonth, filterDay]);
  const filteredSupporters = useMemo(() => supporters.filter(s => matchesFilter(s.created_at)),      [supporters, filterYear, filterMonth, filterDay]);
  const filteredEvents     = useMemo(() => events.filter(e     => matchesFilter(e.rawDate)),         [events,     filterYear, filterMonth, filterDay]);
  const filteredInterests  = useMemo(() => {
    if (!hasFilter) return interests;
    return interests.filter((i: any) => matchesFilter(i.submittedAt ?? i.createdAt ?? i.created_at ?? null));
  }, [interests, filterYear, filterMonth, filterDay, hasFilter]);

  // ── Metrics ────────────────────────────────────────────────────────────────
  const metrics = useMemo(() => ({
    totalStudents:       filteredStudents.length,
    totalProfs:          professors.length,            // professores não têm data útil aqui
    totalSups:           filteredSupporters.length,
    totalDonationsCount: filteredDonations.length,
    grossDonationsValue: filteredDonations.reduce((s, d) => s + (d.amount ?? 0), 0),
    scheduledEventsCount: filteredEvents.length,
    totalInterestsCount: filteredInterests.length,
  }), [filteredStudents, professors, filteredSupporters, filteredDonations, filteredEvents, filteredInterests]);

  // ── Chart data ─────────────────────────────────────────────────────────────
  const studentGrowthData = useMemo(() => {
    if (filteredStudents.length === 0) return [{ label: 'Sem dados', value: 0 }];
    const countsByMonth = new Map<string, number>();
    filteredStudents.forEach(s => {
      const d = toDate(s.created_at);
      if (!d) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      countsByMonth.set(key, (countsByMonth.get(key) ?? 0) + 1);
    });
    const sortedKeys = Array.from(countsByMonth.keys()).sort();
    let running = 0;
    return sortedKeys.map(key => {
      const [year, month] = key.split('-');
      running += countsByMonth.get(key)!;
      return { label: `${MONTH_LABELS[Number(month) - 1]}/${year.slice(2)}`, value: running };
    });
  }, [filteredStudents]);

  const donationGrowthData = useMemo(() => {
    if (filteredDonations.length === 0) return [{ label: 'Sem dados', v1: 0, v2: 0 }];
    const sumByMonth = new Map<string, number>();
    filteredDonations.forEach(d => {
      const dt = toDate(d.date);
      if (!dt) return;
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      sumByMonth.set(key, (sumByMonth.get(key) ?? 0) + (d.amount ?? 0));
    });
    const sortedKeys = Array.from(sumByMonth.keys()).sort();
    return sortedKeys.map(key => {
      const [year, month] = key.split('-');
      return { label: `${MONTH_LABELS[Number(month) - 1]}/${year.slice(2)}`, v1: Math.round(sumByMonth.get(key)!), v2: 0 };
    });
  }, [filteredDonations]);

  // ── Filter label ──────────────────────────────────────────────────────────
  const filterLabel = useMemo(() => {
    const parts = [];
    if (filterYear)  parts.push(String(filterYear));
    if (filterMonth) parts.push(MONTH_NAMES[filterMonth - 1]);
    if (filterDay)   parts.push(`dia ${filterDay}`);
    return parts.length ? parts.join(' · ') : 'Todos os períodos';
  }, [filterYear, filterMonth, filterDay]);

  const selectClass = "bg-white border border-gray-200 rounded-xl text-sm text-[#001856] font-medium px-3 py-2 pr-8 appearance-none cursor-pointer hover:border-[#001856]/40 focus:outline-none focus:ring-2 focus:ring-[#001856]/20 focus:border-[#001856] transition-all";

  return (
    <div className="space-y-6 p-8 min-h-screen">

      {/* ── FILTRO DE PERÍODO ─────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-[#001856]">
            <Filter size={15} className="text-[#ffc300]" />
            <span className="text-sm font-semibold">Filtrar período</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Ano */}
            <div className="relative">
              <select
                value={filterYear ?? ''}
                onChange={e => handleYearChange(e.target.value)}
                className={selectClass}
              >
                <option value="">Todos os anos</option>
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
            </div>

            {/* Mês */}
            <div className="relative">
              <select
                value={filterMonth ?? ''}
                onChange={e => handleMonthChange(e.target.value)}
                className={selectClass}
              >
                <option value="">Todos os meses</option>
                {availableMonths.map(m => <option key={m} value={m}>{MONTH_NAMES[m - 1]}</option>)}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
            </div>

            {/* Dia */}
            <div className="relative">
              <select
                value={filterDay ?? ''}
                onChange={e => setFilterDay(e.target.value ? Number(e.target.value) : null)}
                className={selectClass}
              >
                <option value="">Todos os dias</option>
                {availableDays.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
            </div>

            {/* Label ativo */}
            <span className={`text-xs px-3 py-1.5 rounded-lg font-medium ${hasFilter ? 'bg-[#001856] text-[#ffc300]' : 'bg-gray-100 text-gray-400'}`}>
              {filterLabel}
            </span>

            {/* Limpar */}
            {hasFilter && (
              <button
                onClick={clearFilter}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 rounded-lg px-3 py-1.5 transition-colors"
              >
                <X size={12} /> Limpar filtro
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

        <div onClick={() => onNavigate('pessoas-alunos')} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex items-center gap-3 cursor-pointer hover:shadow-md hover:border-[#001856]/20 transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#001856] flex items-center justify-center flex-shrink-0">
            <Users size={18} className="text-[#ffc300]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400 truncate">Total de Alunos</p>
            <p className="text-xl font-bold text-[#001856]">{metrics.totalStudents}</p>
            <p className="text-xs text-gray-400">Matrículas{hasFilter ? ' no período' : ' gerais'}</p>
          </div>
        </div>

        <div onClick={() => onNavigate('pessoas-professores')} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex items-center gap-3 cursor-pointer hover:shadow-md hover:border-[#001856]/20 transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#ffc300] flex items-center justify-center flex-shrink-0">
            <UserCheck size={18} className="text-[#001856]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400 truncate">Total de Professores</p>
            <p className="text-xl font-bold text-[#001856]">{metrics.totalProfs}</p>
            <p className="text-xs text-gray-400">Sopros e Percussão</p>
          </div>
        </div>

        <div onClick={() => onNavigate('financeiro-apoiadores')} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex items-center gap-3 cursor-pointer hover:shadow-md hover:border-[#001856]/20 transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#001856] flex items-center justify-center flex-shrink-0">
            <Heart size={18} className="text-[#ffc300]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400 truncate">Total de Apoiadores</p>
            <p className="text-xl font-bold text-[#001856]">{metrics.totalSups}</p>
            <p className="text-xs text-green-600">Empresas Incentivadas</p>
          </div>
        </div>

        <div onClick={() => onNavigate('financeiro-doacoes')} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex items-center gap-3 cursor-pointer hover:shadow-md hover:border-[#001856]/20 transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#ffc300] flex items-center justify-center flex-shrink-0">
            <DollarSign size={18} className="text-[#001856]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400 truncate">Total de Doações</p>
            <p className="text-xl font-bold text-[#001856]">{metrics.totalDonationsCount}</p>
            <p className="text-xs text-gray-400">PIX, Boleto e Crédito</p>
          </div>
        </div>

        <div onClick={() => onNavigate('conteudo-eventos')} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex items-center gap-3 cursor-pointer hover:shadow-md hover:border-[#001856]/20 transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#001856] flex items-center justify-center flex-shrink-0">
            <Calendar size={18} className="text-[#ffc300]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400 truncate">Eventos na Agenda</p>
            <p className="text-xl font-bold text-[#001856]">{metrics.scheduledEventsCount}</p>
            <p className="text-xs text-gray-400">Concertos e Oficinas</p>
          </div>
        </div>

        <div onClick={() => onNavigate('relacionamento-interesse')} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md hover:border-[#001856]/20 transition-all sm:col-span-2 lg:col-span-2 xl:col-span-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ffc300] flex items-center justify-center flex-shrink-0">
                <Users size={18} className="text-[#001856]" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Novos Interessados Cadastrados</p>
                <p className="text-xl font-bold text-[#001856]">{metrics.totalInterestsCount} Interessados</p>
                <p className="text-xs text-gray-400 italic">Via formulário "Tenho Interesse" do site público</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#001856] font-semibold border border-[#001856]/20 rounded-lg px-3 py-1.5 hover:bg-[#001856]/5 transition-colors flex-shrink-0">
              Converter em Aluno <ArrowUpRight size={13} />
            </div>
          </div>
        </div>

      </div>

      {/* ── GRÁFICOS ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

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

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-[#001856] uppercase tracking-wider">Financiamento Coletivo</span>
            <span className="text-xs text-gray-400">Fluxo de Caixa</span>
          </div>
          <h3 className="font-bold text-[#001856] mb-4">Doações Confirmadas (Mensal)</h3>
          <div className="flex-1 flex items-center justify-center">
            <CustomBarChart data={donationGrowthData} v1Name="Doações" v2Name="" color1="#ffc300" color2="transparent" />
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <span>Valores em Reais</span>
            <span className="text-green-600 font-bold">R$ {metrics.grossDonationsValue.toLocaleString('pt-BR')}</span>
          </div>
        </div>

      </div>

      {/* ── WIDGETS ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

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
            ) : filteredEvents.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Nenhum evento{hasFilter ? ' no período selecionado' : ' cadastrado'}.</p>
            ) : filteredEvents.slice(0, 3).map((evt) => (
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

        {userRole !== 'editor' && (
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
        )}

      </div>
    </div>
  );
}
