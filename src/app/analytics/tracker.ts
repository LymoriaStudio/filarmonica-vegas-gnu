// ─── Analytics tracker ──────────────────────────────────────────────────────
// Modelo unificado: cada interação é registrada com uma CATEGORIA (a seção /
// área do site onde ela acontece) e um RÓTULO específico (o botão/link/ação).
// Isso permite que o dashboard mostre exatamente o que está sendo medido em
// cada parte do site e gere relatórios mensais e anuais.

export type TrackedEvent = { category: string; label: string; ts: number };

export type AnalyticsData = {
  sessions: Array<{ ts: number; date: string }>;
  sectionViews: TrackedEvent[]; // category = id da seção (sobre, eventos, ...)
  interactions: TrackedEvent[]; // category = área, label = ação específica
  formOpens: TrackedEvent[]; // label = aba do formulário
  formSubmits: TrackedEvent[]; // label = aba do formulário
};

// Categorias das interações — usadas nos componentes e no dashboard.
export const CAT = {
  NAV: "Navegação (menu)",
  HERO: "Hero (banner)",
  CTA: "Chamada final (CTA)",
  EVENTS: "Eventos",
  INSTRUMENTS: "Instrumentos",
  DONATION: "Doação (Pix)",
  FOOTER: "Rodapé",
} as const;

const KEY = "adm_analytics";

function defaultData(): AnalyticsData {
  return { sessions: [], sectionViews: [], interactions: [], formOpens: [], formSubmits: [] };
}

function load(): AnalyticsData {
  try {
    const s = localStorage.getItem(KEY);
    if (!s) return defaultData();
    const p = JSON.parse(s);
    return {
      sessions: p.sessions ?? [],
      sectionViews: p.sectionViews ?? [],
      interactions: p.interactions ?? [],
      formOpens: p.formOpens ?? [],
      formSubmits: p.formSubmits ?? [],
    };
  } catch {
    return defaultData();
  }
}

function save(data: AnalyticsData) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* storage cheio */ }
}

// Mantém 13 meses de histórico (ano corrente + 1 mês) para relatórios anuais.
const RETENTION = 400 * 24 * 60 * 60 * 1000;
function prune(events: TrackedEvent[]): TrackedEvent[] {
  const cutoff = Date.now() - RETENTION;
  return events.filter(e => e.ts > cutoff);
}

function pushTo(field: "sectionViews" | "interactions" | "formOpens" | "formSubmits", category: string, label: string) {
  const data = load();
  data[field] = prune([...data[field], { category, label, ts: Date.now() }]);
  save(data);
}

// ─── API pública ──────────────────────────────────────────────────────────────

export function trackSession() {
  if (sessionStorage.getItem("adm_sess")) return;
  const data = load();
  const now = Date.now();
  data.sessions.push({ ts: now, date: new Date().toLocaleDateString("pt-BR") });
  data.sessions = data.sessions.filter(s => s.ts > now - RETENTION);
  save(data);
  sessionStorage.setItem("adm_sess", "1");
}

export function trackSection(id: string) { pushTo("sectionViews", id, id); }
export function track(category: string, label: string) { pushTo("interactions", category, label); }
export function trackFormOpen(tab: string) { pushTo("formOpens", tab, tab); }
export function trackFormSubmit(tab: string) { pushTo("formSubmits", tab, tab); }

export function getAnalytics(): AnalyticsData { return load(); }

export function clearAnalytics() {
  localStorage.removeItem(KEY);
  sessionStorage.removeItem("adm_sess");
}

// ─── Demo seed ────────────────────────────────────────────────────────────────
// Gera dados realistas espalhados pelos meses do ano corrente até hoje, para que
// os filtros mensais e o relatório anual tenham conteúdo para exibir.

export function seedDemoData() {
  const now = new Date();
  const year = now.getFullYear();
  const monthsElapsed = now.getMonth(); // 0-indexed; gera de Jan até o mês atual
  const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

  const sessions: AnalyticsData["sessions"] = [];
  const sectionViews: TrackedEvent[] = [];
  const interactions: TrackedEvent[] = [];
  const formOpens: TrackedEvent[] = [];
  const formSubmits: TrackedEvent[] = [];

  // Crescimento mensal: o site ganha tração ao longo do ano.
  const growth = [1, 1.15, 1.3, 1.5, 1.7, 1.9, 2.1, 2.3, 2.5, 2.7, 2.9, 3.1];

  const sectionIds = ["sobre", "instrumentos", "eventos", "equipe", "galeria", "depoimentos", "contato"];
  const navLabels = ["Menu: Sobre Nós", "Menu: Instrumentos", "Menu: Eventos", "Menu: Contato", "Botão 'Quero participar' (topo)", "Logo"];
  const heroLabels = ["Quero participar", "Saiba mais"];
  const ctaLabels = ["Entrar em contato", "Ver próximos eventos"];
  const eventLabels = ["Ver todos os eventos", "Card: Grande Concerto de Verão", "Card: Workshop de Trompete", "Comprar ingressos: Grande Concerto de Verão", "Reservar via WhatsApp: Serenata no Parque"];
  const instrumentLabels = ["Carrossel: Trompete", "Carrossel: Trombone", "Carrossel: Tuba", "Ver detalhes: Trompa", "Ver detalhes: Bombardino"];
  const donationLabels = ["Valor selecionado: R$ 100", "Valor selecionado: R$ 500", "Valor selecionado: R$ 1.000", "Gerar QR Code: R$ 100", "Gerar QR Code: R$ 500"];
  const footerLabels = ["Rede social: Instagram", "Rede social: Youtube", "Link: Seja um Músico", "Link: Concertos", "Link: Fale Conosco"];
  const tabs = ["interesse", "apoio", "doacao"];

  const add = (arr: TrackedEvent[], category: string, label: string, ts: number) => arr.push({ category, label, ts });

  for (let m = 0; m <= monthsElapsed; m++) {
    const factor = growth[m];
    const daysInMonth = m === monthsElapsed ? now.getDate() : new Date(year, m + 1, 0).getDate();
    const monthSessions = Math.round(rnd(120, 180) * factor);

    for (let i = 0; i < monthSessions; i++) {
      const day = rnd(1, daysInMonth);
      const d = new Date(year, m, day, rnd(8, 22), rnd(0, 59));
      const ts = d.getTime();
      sessions.push({ ts, date: d.toLocaleDateString("pt-BR") });

      // Cada sessão gera algumas visualizações de seção e interações.
      sectionIds.forEach(id => { if (Math.random() < 0.55) add(sectionViews, id, id, ts); });
      if (Math.random() < 0.4) add(interactions, CAT.NAV, navLabels[rnd(0, navLabels.length - 1)], ts);
      if (Math.random() < 0.5) add(interactions, CAT.HERO, heroLabels[rnd(0, 1)], ts);
      if (Math.random() < 0.2) add(interactions, CAT.CTA, ctaLabels[rnd(0, 1)], ts);
      if (Math.random() < 0.3) add(interactions, CAT.EVENTS, eventLabels[rnd(0, eventLabels.length - 1)], ts);
      if (Math.random() < 0.25) add(interactions, CAT.INSTRUMENTS, instrumentLabels[rnd(0, instrumentLabels.length - 1)], ts);
      if (Math.random() < 0.12) add(interactions, CAT.DONATION, donationLabels[rnd(0, donationLabels.length - 1)], ts);
      if (Math.random() < 0.18) add(interactions, CAT.FOOTER, footerLabels[rnd(0, footerLabels.length - 1)], ts);

      // Funil do formulário
      if (Math.random() < 0.22) {
        const t = Math.random() < 0.6 ? tabs[0] : Math.random() < 0.6 ? tabs[1] : tabs[2];
        add(formOpens, t, t, ts);
        if (Math.random() < 0.35) add(formSubmits, t, t, ts);
      }
    }
  }

  save({ sessions, sectionViews, interactions, formOpens, formSubmits });
}
