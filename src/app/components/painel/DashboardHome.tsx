/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { InlineLoader } from '../../components/InlineLoader';
import {
  Users, Heart, DollarSign, Calendar, Clock, MapPin,
  CheckCircle2, ChevronDown, X, RefreshCw
} from 'lucide-react';
import { StatCard, StatCardDef } from './StatCard';
import { DayPicker } from 'react-day-picker';
import type { DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { dataCache } from '../../../lib/dataCache';
import { getProfessors } from '../../services/professorsService';
import { getDoacoes } from '../../services/doacoesService';
import { getStudentsMinimal } from '../../services/studentsService';
import { getApoiadoresAprovadosMinimal } from '../../services/useApoiadores';
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

  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = () => {
    setRefreshing(true);
    const minDelay = new Promise<void>(res => setTimeout(res, 1000));

    const fetches = Promise.all([
      getStudentsMinimal()
        .then(d => { dataCache.set('dashboard_students', d); setStudents(d); }).catch(console.error),
      getProfessors().then(d => { dataCache.set('professors', d); setProfessors(d); }).catch(console.error),
      getApoiadoresAprovadosMinimal()
        .then(d => { dataCache.set('dashboard_supporters', d); setSupporters(d); }).catch(console.error),
      getDoacoes()
        .then(all => { const confirmed = all.filter((d: DoacaoRow) => d.status === 'confirmado'); dataCache.set('dashboard_donations', confirmed); setDonations(confirmed); })
        .catch(console.error),
    ]);

    Promise.all([fetches, minDelay]).finally(() => setRefreshing(false));
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Date range filter state ───────────────────────────────────────────────
  const [range,       setRange]       = useState<DateRange>({ from: undefined, to: undefined });
  const [pickerOpen,  setPickerOpen]  = useState(false);
  const [draftRange,  setDraftRange]  = useState<DateRange>({ from: undefined, to: undefined });
  const [activePreset, setActivePreset] = useState('Todos os períodos');
  const pickerRef = useRef<HTMLDivElement>(null);
  const btnRef    = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 320 });

  // Recalculate fixed position whenever picker opens
  useEffect(() => {
    if (!pickerOpen || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const maxW = Math.min(vw - 16, 620);
    const left = Math.max(8, Math.min(rect.left, vw - maxW - 8));
    setDropdownPos({ top: rect.bottom + 8, left, width: maxW });
  }, [pickerOpen]);

  // close on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  function startOfDay(d: Date) { const r = new Date(d); r.setHours(0,0,0,0); return r; }
  function endOfDay(d: Date)   { const r = new Date(d); r.setHours(23,59,59,999); return r; }
  function subDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() - n); return r; }
  function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
  function endOfMonth(d: Date)   { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }
  function startOfYear(d: Date)  { return new Date(d.getFullYear(), 0, 1); }

  const PRESETS = [
    { label: 'Hoje',            range: () => { const t = new Date(); return { from: startOfDay(t), to: endOfDay(t) }; } },
    { label: 'Ontem',           range: () => { const t = subDays(new Date(), 1); return { from: startOfDay(t), to: endOfDay(t) }; } },
    { label: 'Últimos 7 dias',  range: () => ({ from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()) }) },
    { label: 'Últimos 30 dias', range: () => ({ from: startOfDay(subDays(new Date(), 29)), to: endOfDay(new Date()) }) },
    { label: 'Este mês',        range: () => ({ from: startOfMonth(new Date()), to: endOfDay(new Date()) }) },
    { label: 'Mês passado',     range: () => { const p = new Date(); p.setMonth(p.getMonth()-1); return { from: startOfMonth(p), to: endOfMonth(p) }; } },
    { label: 'Este trimestre',  range: () => { const m = new Date().getMonth(); const s = Math.floor(m/3)*3; const t = new Date(); t.setMonth(s,1); return { from: startOfDay(t), to: endOfDay(new Date()) }; } },
    { label: 'Este ano',        range: () => ({ from: startOfYear(new Date()), to: endOfDay(new Date()) }) },
  ];

  function applyPreset(label: string, r: DateRange) {
    setRange(r);
    setDraftRange(r);
    setActivePreset(label);
    setPickerOpen(false);
  }

  function applyCustom() {
    if (draftRange.from) {
      setRange(draftRange);
      const fmt = (d?: Date) => d ? d.toLocaleDateString('pt-BR') : '';
      setActivePreset(draftRange.to ? `${fmt(draftRange.from)} → ${fmt(draftRange.to)}` : fmt(draftRange.from));
    }
    setPickerOpen(false);
  }

  function clearFilter() {
    setRange({ from: undefined, to: undefined });
    setDraftRange({ from: undefined, to: undefined });
    setActivePreset('Todos os períodos');
  }

  const hasFilter = !!(range.from || range.to);

  // ── Filter helper ─────────────────────────────────────────────────────────
  function matchesFilter(dateStr: string | null | undefined): boolean {
    if (!range.from && !range.to) return true;
    const d = toDate(dateStr);
    if (!d) return false;
    if (range.from && d < range.from) return false;
    if (range.to   && d > range.to)   return false;
    return true;
  }

  // ── Filtered slices ────────────────────────────────────────────────────────
  const filteredStudents   = useMemo(() => students.filter(s   => matchesFilter(s.created_at)),     [students,   range]);
  const filteredDonations  = useMemo(() => donations.filter(d  => matchesFilter(d.date)),            [donations,  range]);
  const filteredSupporters = useMemo(() => supporters.filter(s => matchesFilter(s.created_at)),      [supporters, range]);
  const filteredEvents     = useMemo(() => events.filter(e     => matchesFilter(e.rawDate)),         [events,     range]);
  const filteredInterests  = useMemo(() => {
    if (!hasFilter) return interests;
    return interests.filter((i: any) => matchesFilter(i.submittedAt ?? i.createdAt ?? i.created_at ?? null));
  }, [interests, range, hasFilter]);

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

  return (
    <div className="space-y-6 p-8 min-h-screen">

      {/* ── FILTRO DE PERÍODO ─────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-wrap">
        {/* Label "Período" + Select — coluna no mobile, linha no desktop */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2 text-[#001856]">
            <Calendar size={15} className="text-[#ffc300]" />
            <span className="text-sm font-semibold">Período</span>
          </div>

          {/* Trigger button */}
          <div className="relative" ref={pickerRef}>
          <button
            ref={btnRef}
            onClick={() => { setDraftRange(range); setPickerOpen(v => !v); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
              hasFilter
                ? 'bg-[#001856] text-[#ffc300] border-[#001856]'
                : 'bg-white text-[#001856] border-gray-200 hover:border-[#001856]/40'
            }`}
          >
            <Calendar size={14} />
            {activePreset}
            <ChevronDown size={14} className={`transition-transform ${pickerOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {pickerOpen && (
            <div
              className="fixed z-[9999] bg-white border border-gray-200 rounded-2xl shadow-xl flex flex-col overflow-hidden"
              style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }}
            >
              <div className="flex flex-col lg:flex-row">
                {/* Presets sidebar */}
                <div className="bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-100 p-3 flex flex-row lg:flex-col gap-1 flex-wrap lg:flex-nowrap lg:min-w-[150px]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-2 py-1 w-full hidden lg:block">Períodos rápidos</p>
                  {PRESETS.map(p => (
                    <button
                      key={p.label}
                      onClick={() => applyPreset(p.label, p.range())}
                      className={`text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap ${
                        activePreset === p.label
                          ? 'bg-[#001856] text-white font-semibold'
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                  <div className="hidden lg:block border-t border-gray-200 my-1 w-full" />
                  <button
                    onClick={() => setActivePreset('Personalizado')}
                    className={`text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap ${
                      activePreset === 'Personalizado'
                        ? 'bg-[#001856] text-white font-semibold'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Personalizado
                  </button>
                </div>

                {/* Calendar + custom inputs */}
                <div className="p-3 flex flex-col gap-3 overflow-x-auto">
                  <DayPicker
                    mode="range"
                    numberOfMonths={1}
                    selected={draftRange}
                    onSelect={(r) => setDraftRange(r ?? { from: undefined, to: undefined })}
                    locale={undefined}
                    classNames={{
                      day_selected: '!bg-[#001856] !text-white rounded-full',
                      day_range_middle: '!bg-[#001856]/10 !text-[#001856] rounded-none',
                      day_range_start: '!bg-[#001856] !text-white rounded-full',
                      day_range_end: '!bg-[#001856] !text-white rounded-full',
                      day_today: 'font-bold border border-[#ffc300] rounded-full',
                      root: 'text-sm',
                      month: 'w-full',
                      caption: 'flex justify-center items-center py-1 relative',
                      nav_button: 'absolute top-0 p-1 rounded hover:bg-gray-100',
                      nav_button_previous: 'left-0',
                      nav_button_next: 'right-0',
                      table: 'w-full border-collapse',
                      head_cell: 'text-gray-400 font-medium text-[11px] pb-1 text-center w-8',
                      cell: 'text-center p-0',
                      day: 'w-8 h-8 text-xs rounded-full mx-auto flex items-center justify-center hover:bg-gray-100 transition-colors',
                    }}
                  />

                  {/* Intervalo personalizado */}
                  <div className="border-t border-gray-100 pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Intervalo personalizado</p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2">
                      <div className="flex gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-gray-500">De</label>
                          <input
                            type="date"
                            value={draftRange.from ? draftRange.from.toISOString().slice(0,10) : ''}
                            onChange={e => setDraftRange(r => ({ ...r, from: e.target.value ? new Date(e.target.value + 'T00:00:00') : undefined }))}
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-[#001856] focus:outline-none focus:border-[#001856]"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-gray-500">Até</label>
                          <input
                            type="date"
                            value={draftRange.to ? draftRange.to.toISOString().slice(0,10) : ''}
                            onChange={e => setDraftRange(r => ({ ...r, to: e.target.value ? new Date(e.target.value + 'T23:59:59') : undefined }))}
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-[#001856] focus:outline-none focus:border-[#001856]"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPickerOpen(false)}
                          className="px-3 py-1.5 text-xs text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={applyCustom}
                          className="px-4 py-1.5 text-xs font-bold bg-[#001856] text-white rounded-lg hover:bg-[#001856]/90 transition-colors"
                        >
                          Aplicar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>{/* fecha div do trigger */}
        </div>{/* fecha div label+select */}

        {/* Atualizar / limpar */}
        <div className="flex items-center gap-2 sm:ml-auto">
          {hasFilter && (
            <button
              onClick={clearFilter}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors"
            >
              <X size={13} /> Limpar
            </button>
          )}
          <button
            onClick={() => fetchAll()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={13} /> Atualizar
          </button>
        </div>
      </div>

      {/* ── KPI CARDS ───────────────────────────────────────────────────────── */}
      {(() => {
        const cards: (StatCardDef & { value: number | string })[] = [
          {
            id: 'alunos',
            label: 'Total de Alunos',
            sublabel: `Matrículas${hasFilter ? ' no período' : ' gerais'}`,
            icon: Users,
            iconBg: 'bg-[#001856]',
            iconColor: 'text-[#ffc300]',
            navigateTo: 'pessoas-alunos',
            value: metrics.totalStudents,
          },
          {
            id: 'apoiadores',
            label: 'Total de Apoiadores',
            sublabel: 'Empresas Incentivadas',
            icon: Heart,
            iconBg: 'bg-[#001856]',
            iconColor: 'text-[#ffc300]',
            navigateTo: 'financeiro-apoiadores',
            value: metrics.totalSups,
          },
          {
            id: 'doacoes',
            label: 'Total de Doações',
            sublabel: 'PIX, Boleto e Crédito',
            icon: DollarSign,
            iconBg: 'bg-[#ffc300]',
            iconColor: 'text-[#001856]',
            navigateTo: 'financeiro-doacoes',
            value: metrics.totalDonationsCount,
          },
          {
            id: 'eventos',
            label: 'Eventos na Agenda',
            sublabel: 'Concertos e Oficinas',
            icon: Calendar,
            iconBg: 'bg-[#001856]',
            iconColor: 'text-[#ffc300]',
            navigateTo: 'conteudo-eventos',
            value: metrics.scheduledEventsCount,
          },
          {
            id: 'interessados',
            label: 'Novos Interessados Cadastrados',
            sublabel: 'Via formulário "Tenho Interesse" do site público',
            icon: Users,
            iconBg: 'bg-[#ffc300]',
            iconColor: 'text-[#001856]',
            navigateTo: 'relacionamento-interesse',
            wide: true,
            ctaLabel: 'Visualizar',
            valueSuffix: 'Interessados',
            value: metrics.totalInterestsCount,
          },
        ];

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cards.map(({ value, ...def }) => (
              <StatCard key={def.id} {...def} value={value} onNavigate={onNavigate} refreshing={refreshing} />
            ))}
          </div>
        );
      })()}

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
              <InlineLoader message="Carregando eventos..." />
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
