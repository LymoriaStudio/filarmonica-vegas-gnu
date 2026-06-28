import { useState, useRef } from "react";
import { Link } from "react-router";
import {
  LayoutDashboard, Image, BarChart2, Users, Calendar, Music,
  MessageSquare, Phone, ChevronLeft, Plus, Trash2, Pencil, Save,
  X, Star, RotateCcw, CheckCircle, TrendingUp, MousePointerClick,
  Eye, FileText, Trash, Upload, Download, ClipboardList, GraduationCap,
  AlertTriangle, CheckCircle2,
} from "lucide-react";
import {
  useSiteData,
  type StatItem, type EventItem, type InstrumentItem,
  type TestimonialItem, type TeamMember, type HeroSlide,
} from "../context/SiteDataContext";
import { getAnalytics, clearAnalytics, seedDemoData, CAT, type AnalyticsData, type TrackedEvent } from "../analytics/tracker";

// ─── Shared helpers ────────────────────────────────────────────────────────────

const INPUT = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#001856] focus:ring-1 focus:ring-[#001856]";
const LABEL = "block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider";
const BTN_PRIMARY = "flex items-center gap-2 bg-[#001856] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#002070] transition-colors";
const BTN_GOLD = "flex items-center gap-2 bg-[#ffc300] text-[#001856] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-400 transition-colors";
const BTN_DANGER = "flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors";
const BTN_GHOST = "flex items-center gap-2 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors";

function Field({ label, value, onChange, type = "text", rows }: { label: string; value: string | number; onChange: (v: string) => void; type?: string; rows?: number }) {
  const cls = INPUT + " " + (rows ? "resize-none" : "");
  return (
    <div>
      <label className={LABEL}>{label}</label>
      {rows ? (
        <textarea className={cls} value={value} onChange={e => onChange(e.target.value)} rows={rows} />
      ) : (
        <input className={cls} type={type} value={value} onChange={e => onChange(e.target.value)} />
      )}
    </div>
  );
}

function ImageUpload({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onChange(ev.target?.result as string);
    reader.readAsDataURL(file);
  };
  return (
    <div>
      {label && <label className={LABEL}>{label}</label>}
      <div
        onClick={() => inputRef.current?.click()}
        className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#001856] hover:bg-blue-50/30 transition-colors"
      >
        {value ? (
          <>
            <img src={value} alt="preview" className="w-full max-h-40 object-cover rounded-lg" />
            <span className="text-xs text-gray-400 mt-1">Clique para trocar a imagem</span>
          </>
        ) : (
          <>
            <Upload size={22} className="text-gray-300" />
            <span className="text-sm text-gray-400 font-medium">Clique para enviar uma imagem</span>
            <span className="text-xs text-gray-300">JPG, PNG, WEBP</span>
          </>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white border border-gray-100 rounded-xl shadow-sm ${className}`}>{children}</div>;
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-[#001856]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>{title}</h2>
      {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}

function SaveBanner({ onSave }: { onSave: () => void }) {
  const [saved, setSaved] = useState(false);
  const handle = () => { onSave(); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <button onClick={handle} className={saved ? "flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold" : BTN_GOLD}>
      {saved ? <><CheckCircle size={16} /> Salvo!</> : <><Save size={16} /> Salvar alterações</>}
    </button>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

const SECTION_LABELS: Record<string, string> = {
  sobre: "Sobre nós", equipe: "Equipe", galeria: "Galeria",
  instrumentos: "Instrumentos", eventos: "Eventos", depoimentos: "Depoimentos", contato: "Contato",
};
const TABS = [
  { key: "interesse", label: "Tenho interesse", desc: "Pais e alunos interessados em participar", color: "#001856" },
  { key: "apoio", label: "Quero apoiar", desc: "Empresas e parceiros patrocinadores", color: "#ffc300" },
  { key: "doacao", label: "Doação direta", desc: "Pessoas que querem contribuir via Pix", color: "#3b82f6" },
];

const MONTHS_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// Ordem e ícones das categorias de interação exibidas no dashboard.
const CATEGORY_ORDER = [CAT.NAV, CAT.HERO, CAT.CTA, CAT.EVENTS, CAT.INSTRUMENTS, CAT.DONATION, CAT.FOOTER];
const CATEGORY_HELP: Record<string, string> = {
  [CAT.NAV]: "Cliques nos itens do menu, logo e botão 'Quero participar' do topo",
  [CAT.HERO]: "Botões do banner principal",
  [CAT.CTA]: "Botões da chamada final, antes do rodapé",
  [CAT.EVENTS]: "Cliques em cards de eventos, ingressos e reservas por WhatsApp",
  [CAT.INSTRUMENTS]: "Cliques nos instrumentos do carrossel e na página de detalhes",
  [CAT.DONATION]: "Seleção de valores e geração do QR Code Pix",
  [CAT.FOOTER]: "Redes sociais e links rápidos do rodapé",
};

function countBy(events: TrackedEvent[]): { label: string; count: number }[] {
  const m: Record<string, number> = {};
  events.forEach(e => { m[e.label] = (m[e.label] ?? 0) + 1; });
  return Object.entries(m).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

function HBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
      <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: `${Math.max(2, (value / Math.max(1, max)) * 100)}%`, backgroundColor: color }} />
    </div>
  );
}

type TrafficLight = "green" | "yellow" | "red" | "none";
const TL_COLORS: Record<TrafficLight, string> = { green: "#22c55e", yellow: "#f59e0b", red: "#ef4444", none: "#d1d5db" };
const TL_ICONS: Record<TrafficLight, React.ReactNode> = {
  green: <CheckCircle2 size={12} />, yellow: <AlertTriangle size={12} />, red: <AlertTriangle size={12} />, none: null,
};

function KPICard({ label, value, sub, icon, color, light = "none" }: { label: string; value: number | string; sub?: string; icon: React.ReactNode; color: string; light?: TrafficLight }) {
  return (
    <Card className="p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color }}>
        <span style={{ color: color === "#ffc300" ? "#001856" : "#ffc300" }}>{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400 truncate">{label}</p>
        <p className="text-xl font-bold text-[#001856]">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
      {light !== "none" && (
        <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full" style={{ backgroundColor: TL_COLORS[light] + "20", color: TL_COLORS[light] }}>
          {TL_ICONS[light]}
        </div>
      )}
    </Card>
  );
}

function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function Dashboard() {
  const { resetAll } = useSiteData();
  const [analytics, setAnalytics] = useState<AnalyticsData>(() => {
    const data = getAnalytics();
    // Re-semeia se não houver dados ou se for o formato antigo (sem interações detalhadas).
    if (data.sessions.length === 0 || data.interactions.length === 0) { seedDemoData(); return getAnalytics(); }
    return data;
  });
  const refresh = () => setAnalytics(getAnalytics());

  // ── Filtro de período: ano + mês (ou ano inteiro) ──
  const allTs = [
    ...analytics.sessions.map(s => s.ts),
    ...analytics.interactions.map(e => e.ts),
    ...analytics.sectionViews.map(e => e.ts),
  ];
  const availableYears = Array.from(new Set(allTs.map(ts => new Date(ts).getFullYear())))
    .sort((a, b) => b - a);
  const defaultYear = availableYears[0] ?? new Date().getFullYear();
  const [year, setYear] = useState<number>(defaultYear);
  const [month, setMonth] = useState<number | "all">("all"); // 0-11 ou "all"

  const inPeriod = (ts: number) => {
    const d = new Date(ts);
    if (d.getFullYear() !== year) return false;
    return month === "all" || d.getMonth() === month;
  };
  const filt = <T extends { ts: number }>(evts: T[]) => evts.filter(e => inPeriod(e.ts));

  const sessions = filt(analytics.sessions);
  const sectionViews = filt(analytics.sectionViews);
  const interactions = filt(analytics.interactions);
  const formOpens = filt(analytics.formOpens);
  const formSubmits = filt(analytics.formSubmits);

  // ── KPIs macro ──
  const totalSessions = sessions.length;
  const totalViews = sectionViews.length;
  const totalClicks = interactions.length;
  const totalSubmits = formSubmits.length;
  const conversionRate = totalSessions > 0 ? ((totalSubmits / totalSessions) * 100).toFixed(1) : "0.0";
  const clickRate = totalSessions > 0 ? ((totalClicks / totalSessions) * 100).toFixed(1) : "0.0";

  const periodLabel = month === "all" ? `${year}` : `${MONTHS_PT[month]}/${year}`;

  // ── Gráfico de acessos no tempo ──
  // Mês selecionado → por dia; ano inteiro → por mês.
  const timeSeries = month === "all"
    ? MONTHS_PT.map((label, m) => ({
        label,
        count: sessions.filter(s => new Date(s.ts).getMonth() === m).length,
      }))
    : Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, i) => ({
        label: String(i + 1),
        count: sessions.filter(s => new Date(s.ts).getDate() === i + 1).length,
      }));
  const maxTime = Math.max(1, ...timeSeries.map(d => d.count));

  // ── Seções visualizadas ──
  const sectionData = countBy(sectionViews)
    .map(d => ({ name: SECTION_LABELS[d.label] ?? d.label, count: d.count }));
  const maxSection = Math.max(1, ...sectionData.map(d => d.count));

  // ── Interações agrupadas por categoria (seção/área) ──
  const byCategory = CATEGORY_ORDER.map(cat => {
    const evts = interactions.filter(e => e.category === cat);
    return { category: cat, total: evts.length, items: countBy(evts) };
  }).filter(c => c.total > 0);

  // ── Funil do formulário por aba ──
  const opensByTab = countBy(formOpens);
  const submitsByTab = countBy(formSubmits);
  const tabCount = (arr: { label: string; count: number }[], key: string) => arr.find(x => x.label === key)?.count ?? 0;

  // ── Relatório anual (matriz mês a mês do ano selecionado) ──
  const monthlyCount = (evts: { ts: number }[], m: number) =>
    evts.filter(e => { const d = new Date(e.ts); return d.getFullYear() === year && d.getMonth() === m; }).length;

  const reportRows: { label: string; monthly: number[] }[] = [
    { label: "Sessões (visitantes)", monthly: MONTHS_PT.map((_, m) => monthlyCount(analytics.sessions, m)) },
    { label: "Visualizações de seções", monthly: MONTHS_PT.map((_, m) => monthlyCount(analytics.sectionViews, m)) },
    ...CATEGORY_ORDER.map(cat => ({
      label: cat,
      monthly: MONTHS_PT.map((_, m) => monthlyCount(analytics.interactions.filter(e => e.category === cat), m)),
    })),
    { label: "Formulários abertos", monthly: MONTHS_PT.map((_, m) => monthlyCount(analytics.formOpens, m)) },
    { label: "Formulários enviados", monthly: MONTHS_PT.map((_, m) => monthlyCount(analytics.formSubmits, m)) },
  ];

  const exportAnnual = () => {
    const header = ["Métrica", ...MONTHS_PT, "Total"];
    const rows = reportRows.map(r => [r.label, ...r.monthly.map(String), String(r.monthly.reduce((a, b) => a + b, 0))]);
    downloadCSV(`relatorio-anual-${year}.csv`, [header, ...rows]);
  };

  const exportPeriod = () => {
    const rows: string[][] = [
      ["Relatório", periodLabel],
      ["", ""],
      ["Métrica", "Valor"],
      ["Sessões", String(totalSessions)],
      ["Visualizações de seções", String(totalViews)],
      ["Total de cliques/interações", String(totalClicks)],
      ["CTR (%)", clickRate],
      ["Formulários enviados", String(totalSubmits)],
      ["Taxa de conversão (%)", conversionRate],
      ["", ""],
      ["Seção visualizada", "Visualizações"],
      ...sectionData.map(d => [d.name, String(d.count)]),
      ["", ""],
      ...byCategory.flatMap(c => [
        [c.category, "Cliques"],
        ...c.items.map(it => [`  ${it.label}`, String(it.count)]),
        ["", ""],
      ]),
      ["Aba do formulário", "Aberturas", "Envios"],
      ...TABS.map(t => [t.label, String(tabCount(opensByTab, t.key)), String(tabCount(submitsByTab, t.key))]),
    ];
    downloadCSV(`relatorio-${periodLabel.replace("/", "-")}.csv`, rows);
  };

  return (
    <div>
      {/* Header + controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <SectionHeader title="Dashboard Analytics" subtitle={`Mostrando dados de: ${periodLabel}`} />
        <div className="flex flex-wrap items-center gap-2">
          {availableYears.length > 1 && (
            <select value={year} onChange={e => setYear(Number(e.target.value))}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700">
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          )}
          <button onClick={() => { seedDemoData(); refresh(); }} className={BTN_GHOST} title="Carregar dados fictícios de exemplo">
            <BarChart2 size={14} /> Demo
          </button>
          <button onClick={() => { if (confirm("Limpar todos os dados de analytics?")) { clearAnalytics(); refresh(); } }}
            className="flex items-center gap-1.5 border border-red-200 text-red-500 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors">
            <Trash size={13} /> Limpar
          </button>
        </div>
      </div>

      {/* ── FILTRO POR MÊS (unificado, controla todo o painel) ── */}
      <Card className="p-3 mb-6">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mr-2">Filtrar período</span>
          <button onClick={() => setMonth("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${month === "all" ? "bg-[#001856] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
            Ano inteiro
          </button>
          {MONTHS_PT.map((m, i) => (
            <button key={m} onClick={() => setMonth(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${month === i ? "bg-[#ffc300] text-[#001856]" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              {m}
            </button>
          ))}
        </div>
      </Card>

      {/* ── MACRO KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KPICard label="Sessões (visitantes)" value={totalSessions} sub={periodLabel} icon={<TrendingUp size={18} />} color="#001856"
          light={totalSessions >= 100 ? "green" : totalSessions >= 40 ? "yellow" : "red"} />
        <KPICard label="Visualizações de seções" value={totalViews} sub="seções vistas no scroll" icon={<Eye size={18} />} color="#ffc300"
          light={totalViews >= 300 ? "green" : totalViews >= 120 ? "yellow" : "red"} />
        <KPICard label="Cliques / interações" value={totalClicks} sub={`CTR ${clickRate}%`} icon={<MousePointerClick size={18} />} color="#001856"
          light={Number(clickRate) >= 30 ? "green" : Number(clickRate) >= 15 ? "yellow" : "red"} />
        <KPICard label="Formulários enviados" value={totalSubmits} sub={`Conversão ${conversionRate}%`} icon={<FileText size={18} />} color="#ffc300"
          light={Number(conversionRate) >= 5 ? "green" : Number(conversionRate) >= 2 ? "yellow" : "red"} />
      </div>

      {/* ── ACESSOS NO TEMPO ── */}
      <Card className="p-5 mb-5">
        <h3 className="font-bold text-[#001856] mb-4 flex items-center gap-2">
          <TrendingUp size={15} className="text-[#ffc300]" />
          {month === "all" ? `Acessos por mês — ${year}` : `Acessos por dia — ${MONTHS_PT[month]}/${year}`}
        </h3>
        {totalSessions === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Nenhum acesso neste período. Use "Demo" para ver um exemplo.</p>
        ) : (
          <div className="flex items-end gap-1 h-40">
            {timeSeries.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                {d.count > 0 && <span className="text-xs font-bold text-[#001856] opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5">{d.count}</span>}
                <div className="w-full rounded-t bg-[#001856] hover:bg-[#ffc300] transition-colors cursor-default" style={{ height: `${Math.max(3, (d.count / maxTime) * 120)}px` }} />
                {(month === "all" || i === 0 || i === Math.floor(timeSeries.length / 2) || i === timeSeries.length - 1) && (
                  <span className="text-xs text-gray-400 mt-1 whitespace-nowrap">{d.label}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── SEÇÕES VISUALIZADAS ── */}
      <Card className="p-5 mb-5">
        <h3 className="font-bold text-[#001856] mb-1 flex items-center gap-2"><Eye size={15} className="text-[#ffc300]" /> Seções do site mais vistas</h3>
        <p className="text-xs text-gray-400 mb-4">Quantas vezes cada seção apareceu na tela do visitante (scroll)</p>
        {sectionData.length === 0 ? <p className="text-sm text-gray-400 py-4">Sem dados neste período.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5">
            {sectionData.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-24 text-right flex-shrink-0">{d.name}</span>
                <HBar value={d.count} max={maxSection} color="#ffc300" />
                <span className="text-xs font-bold text-[#001856] w-10 text-right flex-shrink-0">{d.count}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── INTERAÇÕES POR SEÇÃO/ÁREA ── */}
      <div className="mb-2">
        <h3 className="font-bold text-[#001856] mb-1 flex items-center gap-2"><MousePointerClick size={15} className="text-[#ffc300]" /> Cliques por área do site</h3>
        <p className="text-xs text-gray-400 mb-4">Cada botão e link rastreável, agrupado pela seção onde aparece</p>
      </div>
      {byCategory.length === 0 ? (
        <Card className="p-8 text-center text-gray-400 text-sm mb-5">Nenhum clique registrado neste período.</Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
          {byCategory.map(c => {
            const maxItem = Math.max(1, ...c.items.map(it => it.count));
            return (
              <Card key={c.category} className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-[#001856]">{c.category}</span>
                  <span className="text-xs font-bold text-white bg-[#001856] rounded-full px-2.5 py-0.5">{c.total}</span>
                </div>
                <p className="text-xs text-gray-400 mb-4">{CATEGORY_HELP[c.category]}</p>
                <div className="flex flex-col gap-2.5">
                  {c.items.map((it, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-gray-600 flex-1 min-w-0 truncate" title={it.label}>{it.label}</span>
                      <div className="w-20 flex-shrink-0"><HBar value={it.count} max={maxItem} color="#001856" /></div>
                      <span className="text-xs font-bold text-[#001856] w-8 text-right flex-shrink-0">{it.count}</span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── FORMULÁRIO DE CONTATO ── */}
      <div className="mb-4">
        <h3 className="font-bold text-[#001856] mb-1 flex items-center gap-2"><FileText size={15} className="text-[#ffc300]" /> Funil do formulário de contato</h3>
        <p className="text-xs text-gray-400">Abertura, envios e taxa de conversão de cada aba — referente a {periodLabel}.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {TABS.map(tab => {
          const opens = tabCount(opensByTab, tab.key);
          const submits = tabCount(submitsByTab, tab.key);
          const conv = opens > 0 ? ((submits / opens) * 100).toFixed(0) : "0";
          return (
            <Card key={tab.key} className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: tab.color }} />
                <span className="font-bold text-sm text-[#001856]">{tab.label}</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">{tab.desc}</p>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-xs text-gray-500">Aberturas</span>
                  <span className="text-sm font-bold text-[#001856]">{opens}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-xs text-gray-500">Formulários enviados</span>
                  <span className="text-sm font-bold text-[#001856]">{submits}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-gray-500">Taxa de conversão</span>
                  <span className="text-sm font-bold" style={{ color: tab.color }}>{conv}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${conv}%`, backgroundColor: tab.color }} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── RELATÓRIO ANUAL ── */}
      <Card className="p-5 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-[#001856] mb-1 flex items-center gap-2"><BarChart2 size={15} className="text-[#ffc300]" /> Relatório anual — {year}</h3>
            <p className="text-xs text-gray-400">Consolidado mês a mês de todas as métricas. Ideal para prestação de contas.</p>
          </div>
          <button onClick={exportAnnual} className={BTN_PRIMARY}><Download size={15} /> Exportar relatório anual (CSV)</button>
        </div>
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-gray-400">
                <th className="text-left font-semibold py-2 pr-3 sticky left-0 bg-white">Métrica</th>
                {MONTHS_PT.map((m, i) => (
                  <th key={m} className={`px-2 py-2 text-center font-semibold ${month === i ? "text-[#001856]" : ""}`}>{m}</th>
                ))}
                <th className="px-2 py-2 text-center font-bold text-[#001856]">Total</th>
              </tr>
            </thead>
            <tbody>
              {reportRows.map((r, ri) => {
                const total = r.monthly.reduce((a, b) => a + b, 0);
                return (
                  <tr key={ri} className="border-t border-gray-100">
                    <td className="text-left text-gray-600 py-2 pr-3 whitespace-nowrap sticky left-0 bg-white font-medium">{r.label}</td>
                    {r.monthly.map((v, mi) => (
                      <td key={mi} className={`px-2 py-2 text-center tabular-nums ${month === mi ? "bg-[#ffc300]/10 font-bold text-[#001856]" : "text-gray-500"} ${v === 0 ? "opacity-40" : ""}`}>{v}</td>
                    ))}
                    <td className="px-2 py-2 text-center font-bold text-[#001856] tabular-nums">{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── GERENCIAMENTO ── */}
      <Card className="p-5">
        <h3 className="font-bold text-[#001856] mb-2">Exportar e gerenciar</h3>
        <p className="text-sm text-gray-400 mb-4">Os dados são armazenados no navegador (localStorage).</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={exportPeriod} className={BTN_GOLD}>
            <Download size={15} /> Exportar período atual ({periodLabel})
          </button>
          <button onClick={() => { if (confirm("Restaurar todos os conteúdos do site para o padrão original?")) resetAll(); }}
            className="flex items-center gap-2 border border-red-200 text-red-500 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors">
            <RotateCcw size={15} /> Restaurar conteúdo padrão
          </button>
        </div>
      </Card>
    </div>
  );
}

function HeroEditor() {
  const { heroSlides, setHeroSlides } = useSiteData();
  const [slides, setSlides] = useState<HeroSlide[]>(heroSlides);
  const update = (i: number, field: keyof HeroSlide, v: string) => {
    const next = slides.map((s, idx) => idx === i ? { ...s, [field]: v } : s);
    setSlides(next);
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SectionHeader title="Banners do Hero" subtitle="Edite os 4 slides do carrossel principal" />
        <SaveBanner onSave={() => setHeroSlides(slides)} />
      </div>
      <div className="flex flex-col gap-4">
        {slides.map((slide, i) => (
          <Card key={slide.id} className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-7 h-7 rounded-full bg-[#001856] text-[#ffc300] flex items-center justify-center text-xs font-bold">{i + 1}</span>
              <span className="font-semibold text-[#001856] text-sm">Banner {i + 1}</span>
            </div>
            {slide.image && (
              <div className="w-full h-32 rounded-lg overflow-hidden mb-4 bg-gray-100">
                <img src={slide.image} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="grid grid-cols-1 gap-3">
              <ImageUpload label="Imagem de fundo" value={slide.image} onChange={v => update(i, "image", v)} />
              <Field label="Título (use \\n para quebra de linha)" value={slide.title} onChange={v => update(i, "title", v)} />
              <Field label="Subtítulo" value={slide.subtitle} onChange={v => update(i, "subtitle", v)} rows={3} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StatsEditor() {
  const { stats, setStats } = useSiteData();
  const [items, setItems] = useState<StatItem[]>(stats);
  const update = (i: number, field: keyof StatItem, v: string | number | null) => {
    setItems(items.map((s, idx) => idx === i ? { ...s, [field]: v } : s));
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SectionHeader title="Métricas & Estatísticas" subtitle="Os 4 cards de números na seção 'Música que transforma'" />
        <SaveBanner onSave={() => setStats(items)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((stat, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: i % 2 === 0 ? "#ffc300" : "#001856", color: i % 2 === 0 ? "#001856" : "#ffc300" }}>
                {stat.displayText ? "T" : `${stat.prefix}${stat.value}${stat.suffix}`}
              </div>
              <span className="font-semibold text-[#001856] text-sm">{stat.label}</span>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className={LABEL}>Tipo de exibição</label>
                <select className={INPUT} value={stat.displayText !== null ? "text" : "number"} onChange={e => update(i, "displayText", e.target.value === "text" ? stat.label : null)}>
                  <option value="number">Número animado</option>
                  <option value="text">Texto fixo em destaque</option>
                </select>
              </div>
              {stat.displayText !== null ? (
                <Field label="Texto em destaque" value={stat.displayText} onChange={v => update(i, "displayText", v)} />
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <Field label="Prefixo" value={stat.prefix} onChange={v => update(i, "prefix", v)} />
                  <Field label="Valor" value={stat.value} onChange={v => update(i, "value", Number(v))} type="number" />
                  <Field label="Sufixo" value={stat.suffix} onChange={v => update(i, "suffix", v)} />
                </div>
              )}
              <Field label="Rótulo (label)" value={stat.label} onChange={v => update(i, "label", v)} />
              <Field label="Descrição" value={stat.desc} onChange={v => update(i, "desc", v)} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EventsEditor() {
  const { events, setEvents } = useSiteData();
  const [items, setItems] = useState<EventItem[]>(events);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<EventItem>>({});

  const openEdit = (ev: EventItem) => { setEditId(ev.id); setForm({ ...ev }); };
  const openNew = () => { setEditId(-1); setForm({ title: "", date: "", time: "", location: "", address: "", theme: "", description: "", longDescription: "", category: "Concerto", featured: false, image: "", ticketsUrl: "", whatsapp: "", price: "" }); };
  const save = () => {
    if (editId === -1) {
      const newItem = { ...form, id: Date.now() } as EventItem;
      const next = [...items, newItem];
      setItems(next); setEvents(next);
    } else {
      const next = items.map(e => e.id === editId ? { ...e, ...form } : e);
      setItems(next); setEvents(next);
    }
    setEditId(null); setForm({});
  };
  const remove = (id: number) => { const next = items.filter(e => e.id !== id); setItems(next); setEvents(next); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SectionHeader title="Eventos" subtitle="Gerencie a programação exibida no site" />
        <button onClick={openNew} className={BTN_GOLD}><Plus size={16} /> Novo evento</button>
      </div>

      {editId !== null && (
        <Card className="p-5 mb-4 border-[#001856]/20">
          <h3 className="font-bold text-[#001856] mb-4">{editId === -1 ? "Novo evento" : "Editar evento"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Título" value={form.title ?? ""} onChange={v => setForm(f => ({ ...f, title: v }))} />
            <Field label="Categoria" value={form.category ?? ""} onChange={v => setForm(f => ({ ...f, category: v }))} />
            <Field label="Tema" value={form.theme ?? ""} onChange={v => setForm(f => ({ ...f, theme: v }))} />
            <Field label="Preço / Ingresso" value={form.price ?? ""} onChange={v => setForm(f => ({ ...f, price: v }))} />
            <Field label="Data" value={form.date ?? ""} onChange={v => setForm(f => ({ ...f, date: v }))} />
            <Field label="Horário" value={form.time ?? ""} onChange={v => setForm(f => ({ ...f, time: v }))} />
            <Field label="Local" value={form.location ?? ""} onChange={v => setForm(f => ({ ...f, location: v }))} />
            <Field label="Endereço completo" value={form.address ?? ""} onChange={v => setForm(f => ({ ...f, address: v }))} />
            <div className="sm:col-span-2"><Field label="Descrição curta" value={form.description ?? ""} onChange={v => setForm(f => ({ ...f, description: v }))} rows={2} /></div>
            <div className="sm:col-span-2"><Field label="Descrição completa (página de eventos)" value={form.longDescription ?? ""} onChange={v => setForm(f => ({ ...f, longDescription: v }))} rows={4} /></div>
            <div className="sm:col-span-2"><ImageUpload label="Imagem de capa" value={form.image ?? ""} onChange={v => setForm(f => ({ ...f, image: v }))} /></div>
            <div>
              <label className={LABEL}>Link Sympla (ingressos)</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm flex-shrink-0">sympla.com.br/</span>
                <input className={INPUT} value={form.ticketsUrl ?? ""} onChange={e => setForm(f => ({ ...f, ticketsUrl: e.target.value }))} placeholder="URL completa do evento" />
              </div>
            </div>
            <div>
              <label className={LABEL}>Número WhatsApp (com DDI, sem símbolos)</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm flex-shrink-0">+</span>
                <input className={INPUT} value={form.whatsapp ?? ""} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="5519999999999" />
              </div>
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <input type="checkbox" id="featured" checked={!!form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="w-4 h-4 accent-[#ffc300]" />
              <label htmlFor="featured" className="text-sm text-gray-600 font-medium">Marcar como destaque</label>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} className={BTN_PRIMARY}><Save size={15} /> Salvar</button>
            <button onClick={() => { setEditId(null); setForm({}); }} className={BTN_GHOST}><X size={15} /> Cancelar</button>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {items.map(ev => (
          <Card key={ev.id} className="p-4 flex items-center gap-4">
            <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: ev.featured ? "#ffc300" : "#001856" }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-[#001856] text-sm truncate">{ev.title}</span>
                {ev.featured && <Star size={13} className="text-[#ffc300] flex-shrink-0" fill="#ffc300" />}
              </div>
              <p className="text-xs text-gray-400">{ev.date} · {ev.time} · {ev.location}</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500 flex-shrink-0">{ev.category}</span>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => openEdit(ev)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"><Pencil size={15} /></button>
              <button onClick={() => remove(ev.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={15} /></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function InstrumentsEditor() {
  const { instruments, setInstruments } = useSiteData();
  const [items, setItems] = useState<InstrumentItem[]>(instruments);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<InstrumentItem>>({});

  const openEdit = (inst: InstrumentItem, i: number) => { setEditIdx(i); setForm({ ...inst }); };
  const openNew = () => { setEditIdx(-1); setForm({ slug: "", name: "", description: "", longDescription: "", image: "", gallery: ["", "", ""], videoUrl: "", color: "#ffc300" }); };
  const save = () => {
    const item = { ...form, slug: (form.slug || form.name || "").toLowerCase().replace(/\s+/g, "-") } as InstrumentItem;
    let next: InstrumentItem[];
    if (editIdx === -1) next = [...items, item];
    else next = items.map((inst, i) => i === editIdx ? { ...inst, ...item } : inst);
    setItems(next); setInstruments(next); setEditIdx(null); setForm({});
  };
  const remove = (i: number) => { const next = items.filter((_, idx) => idx !== i); setItems(next); setInstruments(next); };
  const setGallery = (idx: number, v: string) => setForm(f => { const g = [...(f.gallery ?? ["", "", ""])]; g[idx] = v; return { ...f, gallery: g }; });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SectionHeader title="Instrumentos" subtitle="Instrumentos exibidos no carrossel e na página dedicada" />
        <button onClick={openNew} className={BTN_GOLD}><Plus size={16} /> Novo instrumento</button>
      </div>

      {editIdx !== null && (
        <Card className="p-5 mb-4">
          <h3 className="font-bold text-[#001856] mb-4">{editIdx === -1 ? "Novo instrumento" : "Editar instrumento"}</h3>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nome" value={form.name ?? ""} onChange={v => setForm(f => ({ ...f, name: v }))} />
              <div>
                <label className={LABEL}>Cor de destaque</label>
                <div className="flex gap-2 mt-1">
                  {["#ffc300", "#001856"].map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))} className="w-8 h-8 rounded-full border-2 transition-all" style={{ backgroundColor: c, borderColor: form.color === c ? "#000" : "transparent" }} />
                  ))}
                </div>
              </div>
            </div>
            <Field label="Descrição curta (carrossel)" value={form.description ?? ""} onChange={v => setForm(f => ({ ...f, description: v }))} rows={2} />
            <Field label="Descrição completa (página de detalhes)" value={form.longDescription ?? ""} onChange={v => setForm(f => ({ ...f, longDescription: v }))} rows={5} />

            <ImageUpload label="Imagem principal" value={form.image ?? ""} onChange={v => setForm(f => ({ ...f, image: v }))} />

            <div>
              <label className={LABEL}>Galeria de fotos (3 imagens — seção "Músicos em ação")</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                {[0, 1, 2].map(i => (
                  <div key={i}>
                    <ImageUpload label={`Foto ${i + 1}`} value={(form.gallery ?? ["", "", ""])[i] ?? ""} onChange={v => setGallery(i, v)} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className={LABEL}>Vídeo de demonstração (URL embed do YouTube)</label>
              <Field label="" value={form.videoUrl ?? ""} onChange={v => setForm(f => ({ ...f, videoUrl: v }))} />
              <p className="text-xs text-gray-400 mt-1">Exemplo: https://www.youtube.com/embed/XXXXXXXXXXX</p>
              {form.videoUrl && (
                <div className="aspect-video mt-2 rounded-lg overflow-hidden bg-black">
                  <iframe src={form.videoUrl} className="w-full h-full" allowFullScreen title="preview" />
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} className={BTN_PRIMARY}><Save size={15} /> Salvar</button>
            <button onClick={() => { setEditIdx(null); setForm({}); }} className={BTN_GHOST}><X size={15} /> Cancelar</button>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {items.map((inst, i) => (
          <Card key={i} className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
              {inst.image && <img src={inst.image} alt={inst.name} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#001856] text-sm">{inst.name}</p>
              <p className="text-xs text-gray-400 truncate">{inst.description}</p>
            </div>
            <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: inst.color }} />
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => openEdit(inst, i)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"><Pencil size={15} /></button>
              <button onClick={() => remove(i)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={15} /></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TeamEditor() {
  const { team, setTeam } = useSiteData();
  const [items, setItems] = useState<TeamMember[]>(team);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<TeamMember>>({});

  const openEdit = (m: TeamMember, i: number) => { setEditIdx(i); setForm({ ...m }); };
  const openNew = () => { setEditIdx(-1); setForm({ name: "", role: "", short: "", full: "", imageUrl: "", objectPosition: "center 15%" }); };
  const save = () => {
    let next: TeamMember[];
    if (editIdx === -1) next = [...items, form as TeamMember];
    else next = items.map((m, i) => i === editIdx ? { ...m, ...form } : m);
    setItems(next); setTeam(next); setEditIdx(null); setForm({});
  };
  const remove = (i: number) => { const next = items.filter((_, idx) => idx !== i); setItems(next); setTeam(next); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SectionHeader title="Equipe" subtitle="Integrantes exibidos na seção 'Sobre nós'" />
        <button onClick={openNew} className={BTN_GOLD}><Plus size={16} /> Novo membro</button>
      </div>

      {editIdx !== null && (
        <Card className="p-5 mb-4">
          <h3 className="font-bold text-[#001856] mb-4">{editIdx === -1 ? "Novo membro" : "Editar membro"}</h3>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Nome" value={form.name ?? ""} onChange={v => setForm(f => ({ ...f, name: v }))} />
              <Field label="Cargo / Função" value={form.role ?? ""} onChange={v => setForm(f => ({ ...f, role: v }))} />
            </div>
            <Field label="Resumo curto" value={form.short ?? ""} onChange={v => setForm(f => ({ ...f, short: v }))} rows={2} />
            <Field label="Biografia completa" value={form.full ?? ""} onChange={v => setForm(f => ({ ...f, full: v }))} rows={4} />
            <ImageUpload label="Foto (deixe vazio para usar a foto padrão)" value={form.imageUrl ?? ""} onChange={v => setForm(f => ({ ...f, imageUrl: v }))} />
            <Field label="Posicionamento da foto (ex: center 15%)" value={form.objectPosition ?? "center 15%"} onChange={v => setForm(f => ({ ...f, objectPosition: v }))} />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} className={BTN_PRIMARY}><Save size={15} /> Salvar</button>
            <button onClick={() => { setEditIdx(null); setForm({}); }} className={BTN_GHOST}><X size={15} /> Cancelar</button>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {items.map((m, i) => (
          <Card key={i} className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#001856] flex items-center justify-center flex-shrink-0">
              <span className="text-[#ffc300] text-xs font-bold">{m.name.split(" ").map(w => w[0]).slice(0, 2).join("")}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#001856] text-sm">{m.name}</p>
              <p className="text-xs text-gray-400 truncate">{m.role}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => openEdit(m, i)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"><Pencil size={15} /></button>
              <button onClick={() => remove(i)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={15} /></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TestimonialsEditor() {
  const { testimonials, setTestimonials } = useSiteData();
  const [items, setItems] = useState<TestimonialItem[]>(testimonials);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<TestimonialItem>>({});

  const openEdit = (t: TestimonialItem) => { setEditId(t.id); setForm({ ...t }); };
  const openNew = () => { setEditId(-1); setForm({ name: "", category: "Aluno", tag: "", text: "", initials: "" }); };
  const save = () => {
    let next: TestimonialItem[];
    if (editId === -1) next = [...items, { ...form, id: Date.now() } as TestimonialItem];
    else next = items.map(t => t.id === editId ? { ...t, ...form } : t);
    setItems(next); setTestimonials(next); setEditId(null); setForm({});
  };
  const remove = (id: number) => { const next = items.filter(t => t.id !== id); setItems(next); setTestimonials(next); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SectionHeader title="Depoimentos" subtitle="Relatos de alunos e famílias exibidos no carrossel" />
        <button onClick={openNew} className={BTN_GOLD}><Plus size={16} /> Novo depoimento</button>
      </div>

      {editId !== null && (
        <Card className="p-5 mb-4">
          <h3 className="font-bold text-[#001856] mb-4">{editId === -1 ? "Novo depoimento" : "Editar depoimento"}</h3>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Nome" value={form.name ?? ""} onChange={v => setForm(f => ({ ...f, name: v, initials: v.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() }))} />
              <div>
                <label className={LABEL}>Categoria</label>
                <select className={INPUT} value={form.category ?? "Aluno"} onChange={e => setForm(f => ({ ...f, category: e.target.value as "Aluno" | "Pai / Mãe" }))}>
                  <option value="Aluno">Aluno</option>
                  <option value="Pai / Mãe">Pai / Mãe</option>
                </select>
              </div>
              <Field label="Tag temática" value={form.tag ?? ""} onChange={v => setForm(f => ({ ...f, tag: v }))} />
            </div>
            <Field label="Depoimento" value={form.text ?? ""} onChange={v => setForm(f => ({ ...f, text: v }))} rows={4} />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} className={BTN_PRIMARY}><Save size={15} /> Salvar</button>
            <button onClick={() => { setEditId(null); setForm({}); }} className={BTN_GHOST}><X size={15} /> Cancelar</button>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {items.map(t => (
          <Card key={t.id} className="p-4 flex items-start gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${t.category === "Aluno" ? "bg-[#ffc300]" : "bg-[#001856]"}`}>
              <span className={`text-xs font-bold ${t.category === "Aluno" ? "text-[#001856]" : "text-[#ffc300]"}`}>{t.initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-[#001856] text-sm">{t.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${t.category === "Aluno" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>{t.category}</span>
              </div>
              <p className="text-xs text-gray-400 truncate">{t.text}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => openEdit(t)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"><Pencil size={15} /></button>
              <button onClick={() => remove(t.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={15} /></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ContactEditor() {
  const { contact, setContact } = useSiteData();
  const [form, setForm] = useState(contact);
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SectionHeader title="Informações de Contato" subtitle="Dados exibidos no rodapé e na seção de contato" />
        <SaveBanner onSave={() => setContact(form)} />
      </div>
      <Card className="p-5">
        <div className="flex flex-col gap-4">
          <Field label="E-mail" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
          <Field label="Telefone / WhatsApp" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
          <Field label="Endereço completo" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} />
        </div>
      </Card>
    </div>
  );
}

// ─── Inscrições ───────────────────────────────────────────────────────────────

type Registration = { id: number; event: string; name: string; phone: string; email: string; guests: number; status: "confirmado" | "pendente" | "cancelado"; date: string };
const REG_KEY = "adm_registrations";
const STATUS_COLORS = { confirmado: "bg-green-100 text-green-700", pendente: "bg-yellow-100 text-yellow-700", cancelado: "bg-red-100 text-red-500" };

function loadRegs(): Registration[] { try { return JSON.parse(localStorage.getItem(REG_KEY) ?? "[]"); } catch { return []; } }
function saveRegs(r: Registration[]) { localStorage.setItem(REG_KEY, JSON.stringify(r)); }

const DEMO_REGS: Registration[] = [
  { id: 1, event: "Grande Concerto de Verão", name: "Ana Paula Ferreira", phone: "(19) 99823-1145", email: "ana.ferreira@gmail.com", guests: 3, status: "confirmado", date: "02/06/2026" },
  { id: 2, event: "Grande Concerto de Verão", name: "Ricardo Monteiro", phone: "(19) 98734-5521", email: "ricardo.m@hotmail.com", guests: 2, status: "confirmado", date: "03/06/2026" },
  { id: 3, event: "Grande Concerto de Verão", name: "Família Albuquerque", phone: "(19) 99101-8832", email: "albuquerque.sp@gmail.com", guests: 5, status: "pendente", date: "04/06/2026" },
  { id: 4, event: "Workshop de Trompete", name: "Lucas Henrique Costa", phone: "(19) 99456-7712", email: "lucas.costa@gmail.com", guests: 1, status: "confirmado", date: "05/06/2026" },
  { id: 5, event: "Workshop de Trompete", name: "Camila Rocha Silva", phone: "(19) 98891-3340", email: "camila.rocha@gmail.com", guests: 1, status: "confirmado", date: "06/06/2026" },
  { id: 6, event: "Serenata no Parque", name: "Joana Cristina Neves", phone: "(19) 99234-6677", email: "joana.neves@outlook.com", guests: 4, status: "pendente", date: "07/06/2026" },
  { id: 7, event: "Serenata no Parque", name: "Bruno Takahashi", phone: "(11) 98562-0091", email: "bruno.t@gmail.com", guests: 2, status: "cancelado", date: "08/06/2026" },
  { id: 8, event: "Temporada de Inverno 2026", name: "Márcia Oliveira Santos", phone: "(19) 99712-4453", email: "marcia.santos@gmail.com", guests: 2, status: "confirmado", date: "10/06/2026" },
];

function InscricoesEditor() {
  const { events } = useSiteData();
  const [items, setItems] = useState<Registration[]>(() => {
    const r = loadRegs();
    if (r.length === 0) { saveRegs(DEMO_REGS); return DEMO_REGS; }
    return r;
  });
  const [form, setForm] = useState<Partial<Registration>>({});
  const [editing, setEditing] = useState<number | null>(null);

  const openNew = () => { setEditing(-1); setForm({ event: events[0]?.title ?? "", name: "", phone: "", email: "", guests: 1, status: "pendente", date: new Date().toLocaleDateString("pt-BR") }); };
  const save = () => {
    let next: Registration[];
    if (editing === -1) next = [...items, { ...form, id: Date.now() } as Registration];
    else next = items.map(r => r.id === editing ? { ...r, ...form } : r);
    setItems(next); saveRegs(next); setEditing(null); setForm({});
  };
  const remove = (id: number) => { const next = items.filter(r => r.id !== id); setItems(next); saveRegs(next); };
  const changeStatus = (id: number, status: Registration["status"]) => {
    const next = items.map(r => r.id === id ? { ...r, status } : r);
    setItems(next); saveRegs(next);
  };

  const [eventFilter, setEventFilter] = useState<string>("todos");
  const [statusFilter, setStatusFilter] = useState<"todos" | Registration["status"]>("todos");

  const eventNames = ["todos", ...Array.from(new Set(items.map(r => r.event)))];
  const filteredItems = items
    .filter(r => eventFilter === "todos" || r.event === eventFilter)
    .filter(r => statusFilter === "todos" || r.status === statusFilter);

  const confirmed = items.filter(r => r.status === "confirmado").length;
  const pending = items.filter(r => r.status === "pendente").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SectionHeader title="Inscrições em Eventos" subtitle="Gerencie RSVPs e confirmações de presença" />
        <div className="flex gap-2">
          <button onClick={() => downloadCSV("inscricoes.csv", [["Evento","Nome","Telefone","E-mail","Acompanhantes","Status","Data"], ...items.map(r => [r.event, r.name, r.phone, r.email, String(r.guests), r.status, r.date])])} className={BTN_GHOST}><Download size={14} /> CSV</button>
          <button onClick={openNew} className={BTN_GOLD}><Plus size={16} /> Nova inscrição</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <Card className="p-4 text-center"><p className="text-xs text-gray-400">Total inscritos</p><p className="text-2xl font-bold text-[#001856]">{items.length}</p></Card>
        <Card className="p-4 text-center"><p className="text-xs text-gray-400">Confirmados</p><p className="text-2xl font-bold text-green-600">{confirmed}</p></Card>
        <Card className="p-4 text-center"><p className="text-xs text-gray-400">Pendentes</p><p className="text-2xl font-bold text-yellow-600">{pending}</p></Card>
      </div>

      {editing !== null && (
        <Card className="p-5 mb-4">
          <h3 className="font-bold text-[#001856] mb-4">{editing === -1 ? "Nova inscrição" : "Editar inscrição"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className={LABEL}>Evento</label>
              <select className={INPUT} value={form.event ?? ""} onChange={e => setForm(f => ({ ...f, event: e.target.value }))}>
                {events.map(ev => <option key={ev.id} value={ev.title}>{ev.title}</option>)}
              </select>
            </div>
            <Field label="Nome completo" value={form.name ?? ""} onChange={v => setForm(f => ({ ...f, name: v }))} />
            <Field label="Telefone / WhatsApp" value={form.phone ?? ""} onChange={v => setForm(f => ({ ...f, phone: v }))} />
            <Field label="E-mail" value={form.email ?? ""} onChange={v => setForm(f => ({ ...f, email: v }))} />
            <Field label="Nº de acompanhantes" value={form.guests ?? 1} onChange={v => setForm(f => ({ ...f, guests: Number(v) }))} type="number" />
            <div>
              <label className={LABEL}>Status</label>
              <select className={INPUT} value={form.status ?? "pendente"} onChange={e => setForm(f => ({ ...f, status: e.target.value as Registration["status"] }))}>
                <option value="pendente">Pendente</option>
                <option value="confirmado">Confirmado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <Field label="Data da inscrição" value={form.date ?? ""} onChange={v => setForm(f => ({ ...f, date: v }))} />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} className={BTN_PRIMARY}><Save size={15} /> Salvar</button>
            <button onClick={() => { setEditing(null); setForm({}); }} className={BTN_GHOST}><X size={15} /> Cancelar</button>
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Evento</span>
          <div className="flex flex-wrap gap-2">
            {eventNames.map(ev => {
              const count = ev === "todos" ? items.length : items.filter(r => r.event === ev).length;
              return (
                <button key={ev} onClick={() => setEventFilter(ev)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${eventFilter === ev ? "bg-[#001856] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {ev === "todos" ? "Todos os eventos" : ev} ({count})
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Status</span>
          <div className="flex gap-2 flex-wrap">
            {(["todos", "confirmado", "pendente", "cancelado"] as const).map(s => {
              const count = s === "todos" ? items.length : items.filter(r => r.status === s).length;
              return (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${statusFilter === s ? "bg-[#ffc300] text-[#001856]" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {s === "todos" ? "Todos" : s.charAt(0).toUpperCase() + s.slice(1)} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <Card className="p-8 text-center text-gray-400 text-sm">Nenhuma inscrição encontrada para este filtro.</Card>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredItems.map(r => (
            <Card key={r.id} className="p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-[#001856] text-sm">{r.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                </div>
                <p className="text-xs text-gray-400">{r.event} · {r.phone} · {r.guests} acompanhante(s) · {r.date}</p>
              </div>
              <select className="text-xs border border-gray-200 rounded-lg px-2 py-1" value={r.status} onChange={e => changeStatus(r.id, e.target.value as Registration["status"])}>
                <option value="pendente">Pendente</option>
                <option value="confirmado">Confirmado</option>
                <option value="cancelado">Cancelado</option>
              </select>
              <button onClick={() => { setEditing(r.id); setForm({ ...r }); }} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"><Pencil size={14} /></button>
              <button onClick={() => remove(r.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Alunos ───────────────────────────────────────────────────────────────────

type Student = { id: number; name: string; age: number; instrument: string; turma: string; guardian: string; phone: string; email: string; enrollDate: string; status: "ativo" | "inativo" | "em_espera" };
const STU_KEY = "adm_students";
const STU_STATUS_COLORS = { ativo: "bg-green-100 text-green-700", inativo: "bg-gray-100 text-gray-500", em_espera: "bg-yellow-100 text-yellow-700" };
const STU_STATUS_LABELS = { ativo: "Ativo", inativo: "Inativo", em_espera: "Lista de espera" };
const INSTRUMENTS_LIST = ["Trompete", "Trombone", "Trompa", "Bombardino", "Tuba", "Percussão", "A definir"];

function loadStudents(): Student[] { try { return JSON.parse(localStorage.getItem(STU_KEY) ?? "[]"); } catch { return []; } }
function saveStudents(s: Student[]) { localStorage.setItem(STU_KEY, JSON.stringify(s)); }

const DEMO_STUDENTS: Student[] = [
  { id: 1,  name: "Lara Araújo França",         age: 12, instrument: "Trompete",   turma: "Turma A", guardian: "Patrícia França",     phone: "(19) 99812-3344", email: "patricia.franca@gmail.com",   enrollDate: "10/03/2024", status: "ativo" },
  { id: 2,  name: "Emanuely Lisboa Giunco",     age: 13, instrument: "Trombone",   turma: "Turma A", guardian: "Fernanda Giunco",     phone: "(19) 99623-1190", email: "fernanda.giunco@gmail.com",   enrollDate: "15/03/2024", status: "ativo" },
  { id: 3,  name: "Tainã A. Cipolin",           age: 11, instrument: "Trompa",     turma: "Turma A", guardian: "Roberto Cipolin",     phone: "(19) 98734-5566", email: "roberto.cipolin@hotmail.com", enrollDate: "20/03/2024", status: "ativo" },
  { id: 4,  name: "Mirella Neves Duarte Galvão",age: 14, instrument: "Bombardino", turma: "Turma B", guardian: "Claudia Galvão",      phone: "(19) 99456-7821", email: "claudia.galvao@gmail.com",    enrollDate: "22/03/2024", status: "ativo" },
  { id: 5,  name: "Fellipe Alves Tandin",       age: 13, instrument: "Tuba",       turma: "Turma B", guardian: "Marcos Tandin",       phone: "(19) 99234-5678", email: "marcos.tandin@gmail.com",     enrollDate: "01/04/2024", status: "ativo" },
  { id: 6,  name: "Arthur Dias Pereira",        age: 10, instrument: "Trompete",   turma: "Turma B", guardian: "Renata Dias",         phone: "(19) 98891-2233", email: "renata.dias@outlook.com",     enrollDate: "05/04/2024", status: "ativo" },
  { id: 7,  name: "Vinicius Souza Lima",        age: 12, instrument: "Trombone",   turma: "Turma A", guardian: "Leandro Souza",       phone: "(19) 99712-8890", email: "leandro.souza@gmail.com",     enrollDate: "10/04/2024", status: "ativo" },
  { id: 8,  name: "Giovana Martins Alves",      age: 11, instrument: "Trompa",     turma: "Turma B", guardian: "Simone Alves",        phone: "(19) 99123-6654", email: "simone.alves@gmail.com",      enrollDate: "15/04/2024", status: "ativo" },
  { id: 9,  name: "Pedro Henrique Barbosa",     age: 13, instrument: "Trompete",   turma: "Turma A", guardian: "Carlos Barbosa",      phone: "(19) 98567-3312", email: "carlos.barbosa@gmail.com",    enrollDate: "20/04/2024", status: "inativo" },
  { id: 10, name: "Sofia Pereira Ramos",        age: 10, instrument: "A definir",  turma: "—",       guardian: "Ana Ramos",           phone: "(19) 99345-1122", email: "ana.ramos@hotmail.com",       enrollDate: "01/06/2026", status: "em_espera" },
  { id: 11, name: "Gabriel Nakamura Ito",       age: 11, instrument: "A definir",  turma: "—",       guardian: "Kenji Ito",           phone: "(11) 98821-7743", email: "kenji.ito@gmail.com",         enrollDate: "03/06/2026", status: "em_espera" },
  { id: 12, name: "Isabela Correia Mota",       age: 12, instrument: "A definir",  turma: "—",       guardian: "Priscila Mota",       phone: "(19) 99678-4490", email: "priscila.mota@gmail.com",     enrollDate: "08/06/2026", status: "em_espera" },
];

function AlunosEditor() {
  const [items, setItems] = useState<Student[]>(() => {
    const s = loadStudents();
    if (s.length === 0) { saveStudents(DEMO_STUDENTS); return DEMO_STUDENTS; }
    return s;
  });
  const [form, setForm] = useState<Partial<Student>>({});
  const [editing, setEditing] = useState<number | null>(null);
  const [filter, setFilter] = useState<"todos" | Student["status"]>("todos");
  const [turmaFilter, setTurmaFilter] = useState<string>("todas");
  const turmas = ["todas", ...Array.from(new Set(items.map(s => s.turma).filter(t => t && t !== "—")))].sort();

  const openNew = () => { setEditing(-1); setForm({ name: "", age: 10, instrument: "Trompete", turma: "Turma A", guardian: "", phone: "", email: "", enrollDate: new Date().toLocaleDateString("pt-BR"), status: "em_espera" }); };
  const save = () => {
    let next: Student[];
    if (editing === -1) next = [...items, { ...form, id: Date.now() } as Student];
    else next = items.map(s => s.id === editing ? { ...s, ...form } : s);
    setItems(next); saveStudents(next); setEditing(null); setForm({});
  };
  const remove = (id: number) => { const next = items.filter(s => s.id !== id); setItems(next); saveStudents(next); };

  const ativos = items.filter(s => s.status === "ativo").length;
  const espera = items.filter(s => s.status === "em_espera").length;
  const filtered = items
    .filter(s => filter === "todos" || s.status === filter)
    .filter(s => turmaFilter === "todas" || s.turma === turmaFilter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SectionHeader title="Alunos Matriculados" subtitle="Cadastro de alunos, responsáveis e instrumentos" />
        <div className="flex gap-2">
          <button onClick={() => downloadCSV("alunos.csv", [["Nome","Idade","Instrumento","Turma","Responsável","Telefone","E-mail","Matrícula","Status"], ...items.map(s => [s.name, String(s.age), s.instrument, s.turma, s.guardian, s.phone, s.email, s.enrollDate, STU_STATUS_LABELS[s.status]])])} className={BTN_GHOST}><Download size={14} /> CSV</button>
          <button onClick={openNew} className={BTN_GOLD}><Plus size={16} /> Novo aluno</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <Card className="p-4 text-center"><p className="text-xs text-gray-400">Total cadastrados</p><p className="text-2xl font-bold text-[#001856]">{items.length}</p></Card>
        <Card className="p-4 text-center"><p className="text-xs text-gray-400">Alunos ativos</p><p className="text-2xl font-bold text-green-600">{ativos}</p></Card>
        <Card className="p-4 text-center"><p className="text-xs text-gray-400">Lista de espera</p><p className="text-2xl font-bold text-yellow-600">{espera}</p></Card>
      </div>

      {editing !== null && (
        <Card className="p-5 mb-4">
          <h3 className="font-bold text-[#001856] mb-4">{editing === -1 ? "Novo aluno" : "Editar aluno"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nome do aluno" value={form.name ?? ""} onChange={v => setForm(f => ({ ...f, name: v }))} />
            <Field label="Idade" value={form.age ?? 10} onChange={v => setForm(f => ({ ...f, age: Number(v) }))} type="number" />
            <div>
              <label className={LABEL}>Instrumento</label>
              <select className={INPUT} value={form.instrument ?? "Trompete"} onChange={e => setForm(f => ({ ...f, instrument: e.target.value }))}>
                {INSTRUMENTS_LIST.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Turma</label>
              <input className={INPUT} list="turmas-list" value={form.turma ?? ""} onChange={e => setForm(f => ({ ...f, turma: e.target.value }))} placeholder="Ex: Turma A" />
              <datalist id="turmas-list">
                {turmas.filter(t => t !== "todas").map(t => <option key={t} value={t} />)}
                <option value="Turma A" /><option value="Turma B" />
              </datalist>
            </div>
            <div>
              <label className={LABEL}>Status</label>
              <select className={INPUT} value={form.status ?? "em_espera"} onChange={e => setForm(f => ({ ...f, status: e.target.value as Student["status"] }))}>
                <option value="em_espera">Lista de espera</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
            <Field label="Nome do responsável" value={form.guardian ?? ""} onChange={v => setForm(f => ({ ...f, guardian: v }))} />
            <Field label="Telefone / WhatsApp do responsável" value={form.phone ?? ""} onChange={v => setForm(f => ({ ...f, phone: v }))} />
            <Field label="E-mail do responsável" value={form.email ?? ""} onChange={v => setForm(f => ({ ...f, email: v }))} />
            <Field label="Data de matrícula" value={form.enrollDate ?? ""} onChange={v => setForm(f => ({ ...f, enrollDate: v }))} />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} className={BTN_PRIMARY}><Save size={15} /> Salvar</button>
            <button onClick={() => { setEditing(null); setForm({}); }} className={BTN_GHOST}><X size={15} /> Cancelar</button>
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Status</span>
          <div className="flex gap-2 flex-wrap">
            {(["todos", "ativo", "em_espera", "inativo"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === f ? "bg-[#001856] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                {f === "todos" ? "Todos" : STU_STATUS_LABELS[f]} ({f === "todos" ? items.length : items.filter(s => s.status === f).length})
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Turma</span>
          <div className="flex gap-2 flex-wrap">
            {turmas.map(t => (
              <button key={t} onClick={() => setTurmaFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${turmaFilter === t ? "bg-[#ffc300] text-[#001856]" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                {t === "todas" ? "Todas" : t} {t !== "todas" && `(${items.filter(s => s.turma === t).length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center text-gray-400 text-sm">Nenhum aluno encontrado. Adicione a partir dos formulários de inscrição recebidos.</Card>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(s => (
            <Card key={s.id} className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#001856] flex items-center justify-center flex-shrink-0">
                <span className="text-[#ffc300] text-xs font-bold">{s.name.split(" ").map(w => w[0]).slice(0, 2).join("")}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-[#001856] text-sm">{s.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STU_STATUS_COLORS[s.status]}`}>{STU_STATUS_LABELS[s.status]}</span>
                </div>
                <p className="text-xs text-gray-400">{s.age} anos · {s.instrument} · <span className="font-semibold text-[#001856]">{s.turma}</span> · Resp: {s.guardian} · {s.phone}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => { setEditing(s.id); setForm({ ...s }); }} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"><Pencil size={14} /></button>
                <button onClick={() => remove(s.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "analytics" },
  { id: "inscricoes", label: "Inscrições", icon: ClipboardList, group: "gestao" },
  { id: "alunos", label: "Alunos", icon: GraduationCap, group: "gestao" },
  { id: "hero", label: "Banners / Hero", icon: Image, group: "conteudo" },
  { id: "stats", label: "Métricas", icon: BarChart2, group: "conteudo" },
  { id: "team", label: "Equipe", icon: Users, group: "conteudo" },
  { id: "events", label: "Eventos", icon: Calendar, group: "conteudo" },
  { id: "instruments", label: "Instrumentos", icon: Music, group: "conteudo" },
  { id: "testimonials", label: "Depoimentos", icon: MessageSquare, group: "conteudo" },
  { id: "contact", label: "Contato", icon: Phone, group: "conteudo" },
] as const;

type NavId = typeof NAV[number]["id"];

// ─── Main AdminPage ────────────────────────────────────────────────────────────

export function AdminPage() {
  const [active, setActive] = useState<NavId>("dashboard");

  const sections: Record<NavId, React.ReactNode> = {
    dashboard: <Dashboard />,
    inscricoes: <InscricoesEditor />,
    alunos: <AlunosEditor />,
    hero: <HeroEditor />,
    stats: <StatsEditor />,
    team: <TeamEditor />,
    events: <EventsEditor />,
    instruments: <InstrumentsEditor />,
    testimonials: <TestimonialsEditor />,
    contact: <ContactEditor />,
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#001856] flex flex-col flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/10">
          <p className="text-[#ffc300] uppercase tracking-widest text-xs font-bold mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Painel</p>
          <h1 className="text-white font-bold text-base leading-tight" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>Filarmônica<br />de Metais</h1>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3">
          {(["analytics", "gestao", "conteudo"] as const).map(group => {
            const items = NAV.filter(n => n.group === group);
            const groupLabel = { analytics: "Analytics", gestao: "Gestão", conteudo: "Conteúdo do site" }[group];
            return (
              <div key={group} className="mb-3">
                <p className="text-white/30 text-xs font-bold uppercase tracking-widest px-3 mb-1">{groupLabel}</p>
                {items.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setActive(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all text-left ${active === id ? "bg-[#ffc300] text-[#001856]" : "text-white/60 hover:text-white hover:bg-white/10"}`}
                    style={{ fontFamily: "'Inter', sans-serif" }}>
                    <Icon size={17} />{label}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>

        {/* Back to site */}
        <div className="px-3 py-4 border-t border-white/10">
          <Link
            to="/"
            className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors px-3 py-2"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <ChevronLeft size={16} /> Voltar ao site
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 p-8 overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Filarmônica de Metais</p>
            <h2 className="text-2xl font-bold text-[#001856]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
              {NAV.find(n => n.id === active)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-700 font-semibold">Alterações salvas localmente</span>
          </div>
        </div>

        {sections[active]}
      </main>
    </div>
  );
}
