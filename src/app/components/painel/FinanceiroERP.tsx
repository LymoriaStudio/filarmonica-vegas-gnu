/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign, FileClock, Plus, Award, Trash2, Download, FileSpreadsheet
} from 'lucide-react';
import { Supporter } from '../../validations/types';
import { ImageUploader } from './MiniWidgets';
import {
  getDoacoes,
  createDoacao,
  updateDoacao,
  Doacao,
} from '../../services/doacoesService';

// ── Mapper banco → view ────────────────────────────────────────────────────
function toDoacaoView(d: Doacao) {
  return {
    id: d.id ?? '',
    donorName: d.donor_name ?? 'Anônimo',
    amount: Number(d.amount),
    date: d.date ? new Date(d.date).toLocaleString('pt-BR') : '',
    status: d.status ?? 'pendente',
  };
}
type DoacaoView = ReturnType<typeof toDoacaoView>;

interface FinanceiroERPProps {
  supporters: Supporter[];
  setSupporters: React.Dispatch<React.SetStateAction<Supporter[]>>;
  addAuditLog: (action: string, module: string, details: string) => void;
  activeTab?: string;
}

export default function FinanceiroERP({
  supporters,
  setSupporters,
  addAuditLog,
  activeTab,
}: FinanceiroERPProps) {
  const initialSubTab = activeTab === 'financeiro-apoiadores' ? 'apoiadores' : activeTab === 'financeiro-relatorios' ? 'relatorios' : 'doacoes';
  const [subTab, setSubTab] = useState<'doacoes' | 'apoiadores' | 'relatorios'>(initialSubTab as any);

  // ── Doações ───────────────────────────────────────────────────────────────
  const [doacoes, setDoacoes] = useState<DoacaoView[]>([]);
  const [loadingDoacoes, setLoadingDoacoes] = useState(false);
  const [errorDoacoes, setErrorDoacoes] = useState<string | null>(null);

  // Modal nova doação
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [activeDonation, setActiveDonation] = useState<{ donorName: string; amount: number } | null>(null);
  const [savingDonation, setSavingDonation] = useState(false);

  // Modal apoiador
  const [supporterModalOpen, setSupporterModalOpen] = useState(false);
  const [activeSupporter, setActiveSupporter] = useState<Partial<Supporter> | null>(null);

  // CSV export
  const [exportCsvLines, setExportCsvLines] = useState<string | null>(null);

  // ── GET doações ao entrar na aba ──────────────────────────────────────────
  useEffect(() => {
    if (subTab !== 'doacoes' && subTab !== 'relatorios') return;
    setLoadingDoacoes(true);
    setErrorDoacoes(null);
    getDoacoes()
      .then((data) => setDoacoes(data.map(toDoacaoView)))
      .catch((err) => setErrorDoacoes('Erro ao carregar doações: ' + err.message))
      .finally(() => setLoadingDoacoes(false));
  }, [subTab]);

  // ── POST nova doação ───────────────────────────────────────────────────────
  const handleSaveDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDonation) return;
    setSavingDonation(true);
    try {
      const saved = await createDoacao({
        donor_name: activeDonation.donorName || null,
        amount: activeDonation.amount,
      });
      setDoacoes((prev) => [toDoacaoView(saved), ...prev]);
      addAuditLog('Inseriu Doação', 'Financeiro', `Lançou doação de R$ ${activeDonation.amount} para ${activeDonation.donorName || 'Anônimo'}`);
      setDonationModalOpen(false);
      setActiveDonation(null);
    } catch (err: any) {
      alert('Erro ao salvar doação: ' + err.message);
    } finally {
      setSavingDonation(false);
    }
  };

  // ── PUT confirmar ─────────────────────────────────────────────────────────
  const handleConfirmDonation = async (id: string, name: string, value: number) => {
    try {
      await updateDoacao(id, { status: 'confirmado' });
      setDoacoes((prev) => prev.map((d) => d.id === id ? { ...d, status: 'confirmado' } : d));
      addAuditLog('Confirmou Lançamento', 'Financeiro', `Confirmou doação de R$ ${value} de ${name}`);
      alert(`PIX de R$ ${value.toLocaleString()} confirmado!`);
    } catch (err: any) {
      alert('Erro ao confirmar: ' + err.message);
    }
  };

  // ── PUT cancelar ──────────────────────────────────────────────────────────
  const handleCancelDonation = async (id: string, name: string, value: number) => {
    try {
      await updateDoacao(id, { status: 'cancelado' });
      setDoacoes((prev) => prev.map((d) => d.id === id ? { ...d, status: 'cancelado' } : d));
      addAuditLog('Cancelou Lançamento', 'Financeiro', `Estornou doação de R$ ${value} de ${name}`);
    } catch (err: any) {
      alert('Erro ao cancelar: ' + err.message);
    }
  };

  // ── CSV ───────────────────────────────────────────────────────────────────
  const handleExportCsv = () => {
    let csv = 'ID,Doador,Valor,Data,Status\n';
    doacoes.forEach((d) => {
      csv += `"${d.id}","${d.donorName}",${d.amount},"${d.date}","${d.status}"\n`;
    });
    setExportCsvLines(csv);
    addAuditLog('Exportou Doações', 'Financeiro', 'Emitiu planilha CSV de receitas');
  };

  // ── Apoiadores ────────────────────────────────────────────────────────────
  const handleOpenSupporterModal = (sup: Partial<Supporter> | null) => {
    setActiveSupporter(sup || {
      id: '', logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&h=80&q=80',
      name: '', siteUrl: 'https://example.com', description: '',
      category: '', sponsorshipLevel: 'silver', highlightedOnHome: false,
    });
    setSupporterModalOpen(true);
  };

  const handleSaveSupporter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSupporter) return;
    if (activeSupporter.id) {
      setSupporters((prev) => prev.map((s) => s.id === activeSupporter.id ? (activeSupporter as Supporter) : s));
      addAuditLog('Editou Patrocinador', 'Financeiro', `Editou apoiador: ${activeSupporter.name}`);
    } else {
      const newSup = { ...activeSupporter, id: `sup-${Date.now()}` } as Supporter;
      setSupporters((prev) => [...prev, newSup]);
      addAuditLog('Criou Patrocinador', 'Financeiro', `Adicionou mecenas: ${newSup.name}`);
    }
    setSupporterModalOpen(false);
  };

  const handleDeleteSupporter = (id: string, name: string) => {
    setSupporters((prev) => prev.filter((s) => s.id !== id));
    addAuditLog('Removeu Apoiador', 'Financeiro', `Removeu patrocinador: ${name}`);
  };

  // ── Relatórios ────────────────────────────────────────────────────────────
  const reportTotals = useMemo(() => {
    const confirmed = doacoes.filter((d) => d.status === 'confirmada');
    const grandTotal = confirmed.reduce((s, d) => s + d.amount, 0);

    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisYear = String(now.getFullYear());
    const today = now.toLocaleDateString('pt-BR');

    const dailyTotal = confirmed.filter((d) => d.date.startsWith(today)).reduce((s, d) => s + d.amount, 0);
    const monthlyTotal = confirmed.filter((d) => d.date.includes(`/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`)).reduce((s, d) => s + d.amount, 0);
    const annualTotal = confirmed.filter((d) => d.date.includes(`/${now.getFullYear()}`)).reduce((s, d) => s + d.amount, 0);

    const rankMap: Record<string, number> = {};
    confirmed.forEach((d) => { rankMap[d.donorName] = (rankMap[d.donorName] || 0) + d.amount; });
    const rankingSorted = Object.entries(rankMap)
      .map(([name, total]) => ({ name, totalGived: total }))
      .sort((a, b) => b.totalGived - a.totalGived)
      .slice(0, 10);

    return { grandTotal, dailyTotal, monthlyTotal, annualTotal, rankingSorted };
  }, [doacoes]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-6 animate-fade-in select-none">

      {/* Header */}
      <div className="pb-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-[#001856] tracking-tight flex items-center">
            <DollarSign className="mr-2 text-emerald-400" size={20} />
            Tesouraria & Captação Tributária (Financeiro)
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Lance doações diretas via PIX, gere planilhas fiscais consolidadas e gerencie patrocinadores.
          </p>
        </div>

       { /*<div className="flex bg-gray-100 border border-gray-200 p-0.5 rounded-lg text-xs">
          {(['doacoes', 'apoiadores', 'relatorios'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSubTab(t)}
              className={`p-1.5 px-3 rounded-md font-semibold cursor-pointer transition-all ${subTab === t ? 'bg-[#001856] text-white shadow' : 'text-gray-400'}`}
            >
              {t === 'doacoes' ? 'Lançamentos Gerais' : t === 'apoiadores' ? 'Patrocinadores Jurídicos' : 'Relatórios Fiscais'}
            </button>
          ))}
        </div> */}
      </div>

      {/* ================================================================
          SUBTAB 1 — DOAÇÕES (dados reais do Supabase)
          ================================================================ */}
      {subTab === 'doacoes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white border border-gray-200 p-4 rounded-xl">
            <div>
              <h3 className="text-xs font-mono font-bold text-[#ffc300] uppercase tracking-wider">Aportes e Despesas Coletivas</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Confirme doações para creditar o montante no saldo orquestral.</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleExportCsv}
                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-xs font-semibold cursor-pointer flex items-center"
              >
                <Download size={13} className="mr-1.5" /> Planilha de Receitas
              </button>
              <button
                type="button"
                onClick={() => { setActiveDonation({ donorName: '', amount: 100 }); setDonationModalOpen(true); }}
                className="p-2 px-3 bg-[#001856] hover:bg-blue-700 text-white text-xs font-semibold rounded cursor-pointer"
              >
                + Lançar Doação Direta
              </button>
            </div>
          </div>

          {loadingDoacoes && <p className="text-gray-400 text-sm text-center py-8">Carregando doações...</p>}
          {errorDoacoes && <p className="text-red-400 text-sm text-center py-8">{errorDoacoes}</p>}
          {!loadingDoacoes && !errorDoacoes && doacoes.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8 border border-dashed border-gray-200 rounded-xl">Nenhuma doação registrada ainda.</p>
          )}

          {doacoes.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200 text-gray-400 font-mono uppercase tracking-wider text-[10px]">
                    <th className="p-3 pl-4">Identificador</th>
                    <th className="p-3">Doador</th>
                    <th className="p-3">Valor</th>
                    <th className="p-3">Data</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right pr-4">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {doacoes.map((don) => (
                    <tr key={don.id} className="hover:bg-gray-100 transition-all font-mono">
                      <td className="p-3 pl-4 text-gray-400 text-[10px]">{don.id.slice(0, 8)}…</td>
                      <td className="p-3">
                        <span className="block font-sans font-bold text-gray-800">{don.donorName}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-emerald-400 font-bold text-sm">
                          R$ {don.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="p-3 text-gray-400">{don.date}</td>
                      <td className="p-3">
                        <span className={`inline-block p-1 px-2.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          don.status === 'confirmado' ? 'bg-emerald-950 text-emerald-400'
                          : don.status === 'pendente' ? 'bg-amber-900/30 text-amber-500'
                          : 'bg-gray-100 text-gray-400'
                        }`}>
                          {don.status === 'confirmado' ? 'CONFIRMADA' : don.status === 'pendente' ? 'PENDENTE' : 'CANCELADA'}
                        </span>
                      </td>
                      <td className="p-3 text-right pr-4 space-x-1.5 whitespace-nowrap">
                        {don.status === 'pendente' && (
                          <button
                            type="button"
                            onClick={() => handleConfirmDonation(don.id, don.donorName, don.amount)}
                            className="p-1 px-2 bg-emerald-950 hover:bg-emerald-900 rounded text-emerald-400 font-sans font-bold text-[10px] uppercase cursor-pointer"
                          >
                            Confirmar
                          </button>
                        )}
                        {don.status !== 'cancelado' && (
                          <button
                            type="button"
                            onClick={() => handleCancelDonation(don.id, don.donorName, don.amount)}
                            className="p-1 px-2 bg-gray-100 hover:bg-rose-950 text-gray-400 hover:text-rose-200 rounded text-[10px] font-sans cursor-pointer"
                          >
                            Anular
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================================================================
          SUBTAB 2 — APOIADORES (local, inalterado)
          ================================================================ */}
      {subTab === 'apoiadores' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white border border-gray-200 p-4 rounded-xl">
            <div>
              <h3 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">Quadro Institucional de Apoio</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Estipule hierarquias de patrocínio corporativo e configure o site público.</p>
            </div>
            <button type="button" onClick={() => handleOpenSupporterModal(null)} className="p-2 px-3 bg-[#001856] text-white text-xs font-semibold rounded cursor-pointer">
              + Adicionar Novo Patrocinador
            </button>
          </div>

          {supporters.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8 border border-dashed border-gray-200 rounded-xl">Nenhum patrocinador cadastrado ainda.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supporters.map((sup) => (
              <div key={sup.id} className="rounded-xl overflow-hidden bg-white border border-gray-200 flex flex-col justify-between">
                <div className="p-4 bg-gray-50 border-b border-gray-100 text-center flex flex-col items-center">
                  <img src={sup.logo} alt={sup.name} referrerPolicy="no-referrer" className="w-20 h-10 object-contain rounded mb-3 bg-white/5 p-1 border border-gray-200" />
                  <h4 className="text-xs font-bold text-[#001856] font-sans">{sup.name}</h4>
                  <span className={`inline-block p-1 px-3 mt-2 rounded text-[8.5px] font-extrabold uppercase font-mono tracking-widest ${
                    sup.sponsorshipLevel === 'diamond' ? 'bg-sky-950 text-sky-400 border border-sky-800'
                    : sup.sponsorshipLevel === 'gold' ? 'bg-amber-900/30 text-[#ffc300] border border-[#ffc300]/20'
                    : sup.sponsorshipLevel === 'silver' ? 'bg-gray-100 text-gray-600'
                    : 'bg-amber-900/20 text-orange-400'
                  }`}>
                    Patrocínio: {sup.sponsorshipLevel}
                  </span>
                </div>

                <div className="p-4 flex-1 bg-white text-[11px] text-gray-400 leading-snug">
                  <p className="min-h-12">"{sup.description}"</p>
                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between font-mono text-[9.5px]">
                    <span className="text-gray-400">Categoria: {sup.category}</span>
                    <a href={sup.siteUrl} target="_blank" rel="noreferrer" className="text-[#ffc300] hover:underline">Site Corporativo</a>
                  </div>
                </div>

                <div className="p-2 px-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs">
                  <button
                    type="button"
                    onClick={() => setSupporters((prev) => prev.map((s) => s.id === sup.id ? { ...s, highlightedOnHome: !s.highlightedOnHome } : s))}
                    className={`p-1 px-2 rounded font-mono text-[9.5px] uppercase font-bold tracking-wider ${sup.highlightedOnHome ? 'bg-emerald-950 text-emerald-400' : 'bg-white text-gray-500'}`}
                  >
                    {sup.highlightedOnHome ? 'Home: Destaque' : 'Ativar Destaque'}
                  </button>
                  <div className="flex space-x-1.5">
                    <button type="button" onClick={() => handleOpenSupporterModal(sup)} className="text-[#ffc300] hover:text-amber-200 font-mono font-bold text-[10px]">EDITAR</button>
                    <button type="button" onClick={() => handleDeleteSupporter(sup.id, sup.name)} className="text-rose-400 hover:text-rose-300 font-mono font-bold text-[10px]">EXCLUIR</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================
          SUBTAB 3 — RELATÓRIOS
          ================================================================ */}
      {subTab === 'relatorios' && (
        <div className="space-y-6">
          {loadingDoacoes && <p className="text-gray-400 text-sm text-center py-8">Carregando dados...</p>}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Entrada Diária', value: reportTotals.dailyTotal, color: 'text-[#001856]', sub: 'Somas do dia corrente' },
              { label: 'Média Mensal', value: reportTotals.monthlyTotal, color: 'text-[#ffc300]', sub: 'Mês atual' },
              { label: 'Incentivado Anual', value: reportTotals.annualTotal, color: 'text-[#001856]', sub: 'Balanço fiscal ano corrente' },
              { label: 'Acumulado Bruto', value: reportTotals.grandTotal, color: 'text-emerald-400', sub: 'Total confirmado' },
            ].map((item) => (
              <div key={item.label} className="p-4 bg-white border border-gray-200 rounded-xl">
                <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block mb-1">{item.label}</span>
                <div className={`text-xl font-bold font-mono ${item.color}`}>R$ {item.value.toLocaleString('pt-BR')}</div>
                <p className="text-[9px] text-gray-400 mt-1">{item.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-white border border-gray-200 space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                <Award size={15} className="text-amber-500" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-800">Ranking dos Maiores Doadores</h3>
              </div>
              <div className="space-y-2.5">
                {reportTotals.rankingSorted.length === 0 ? (
                  <p className="text-center text-xs p-6 text-gray-400 italic">Nenhuma doação confirmada ainda.</p>
                ) : (
                  reportTotals.rankingSorted.map((g, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-gray-50 border border-gray-100 text-xs">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-5 h-5 rounded bg-white border border-gray-200 text-gray-400 font-mono font-extrabold flex items-center justify-center text-[10px]">{idx + 1}</span>
                        <span className="font-sans font-bold text-gray-800">{g.name}</span>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold">R$ {g.totalGived.toLocaleString('pt-BR')}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-gray-200 space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                <FileClock size={15} className="text-sky-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-800">Certidões e Isenção de Imposto</h3>
              </div>
              <div className="text-xs text-gray-400 leading-relaxed space-y-3.5">
                <p>Nossa instituição é regulada como <strong>Entidade de Utilidade Pública Sem Fins Lucrativos</strong> e portadora do Certificado Rouanet expedido pelo Ministério da Cultura.</p>
                <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200 font-mono text-[10px] text-amber-500/80 space-y-1">
                  <div className="flex justify-between"><span>CNPJ Associativo:</span><span className="text-gray-600">12.345.678/0001-90</span></div>
                  <div className="flex justify-between"><span>Selo PRONAC Rouanet:</span><span className="text-gray-600">#2415-MT-SUL</span></div>
                  <div className="flex justify-between"><span>Isenção ICMS:</span><span className="text-emerald-400 font-bold">CONCEDIDA</span></div>
                </div>
                <button onClick={() => alert('Extrato consolidado na pasta Biblioteca.')} className="w-full p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10.5px] font-mono rounded border border-gray-200 transition-all cursor-pointer">
                  Exportar e-Doc Fisco (.pdf)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          MODAL: NOVA DOAÇÃO
          ================================================================ */}
      {donationModalOpen && activeDonation !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <form onSubmit={handleSaveDonation} className="w-full max-w-md bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-amber-500 uppercase tracking-widest">Lançamento de Doação Recebida</span>
              <button type="button" onClick={() => setDonationModalOpen(false)} className="text-gray-400">Fechar</button>
            </div>

            <div className="p-4 space-y-3.5">
              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Doador / Benfeitor</label>
                <input
                  type="text"
                  value={activeDonation.donorName}
                  onChange={(e) => setActiveDonation({ ...activeDonation, donorName: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 text-[#001856] p-2 text-xs rounded focus:outline-none"
                  placeholder="Nome completo ou empresa (opcional)"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Valor de Entrada R$</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={activeDonation.amount}
                  onChange={(e) => setActiveDonation({ ...activeDonation, amount: Number(e.target.value) })}
                  className="w-full bg-gray-50 border border-gray-200 text-emerald-400 p-2 text-xs rounded focus:outline-none font-mono font-bold"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-3 border-t border-gray-200 flex justify-end space-x-2">
              <button type="button" onClick={() => setDonationModalOpen(false)} className="text-xs text-gray-400 px-3 py-1 bg-white rounded">Voltar</button>
              <button type="submit" disabled={savingDonation} className="text-xs text-white px-5 py-1 bg-emerald-700 font-bold rounded disabled:opacity-60">
                {savingDonation ? 'Salvando...' : 'Creditar no Saldo'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================================================================
          MODAL: APOIADOR
          ================================================================ */}
      {supporterModalOpen && activeSupporter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <form onSubmit={handleSaveSupporter} className="w-full max-w-lg bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-amber-500 uppercase tracking-widest">
                {activeSupporter.id ? 'Alterar Apoiador' : 'Adicionar Patrocinador'}
              </span>
              <button type="button" onClick={() => setSupporterModalOpen(false)} className="text-gray-400">Fechar</button>
            </div>

            <div className="p-4 space-y-3.5 max-h-[420px] overflow-y-auto">
              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Nome Fantasia</label>
                <input type="text" required value={activeSupporter.name || ''} onChange={(e) => setActiveSupporter({ ...activeSupporter, name: e.target.value })} className="w-full bg-gray-50 border border-gray-200 text-[#001856] p-2 text-xs rounded focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">URL do Site</label>
                <input type="text" value={activeSupporter.siteUrl || ''} onChange={(e) => setActiveSupporter({ ...activeSupporter, siteUrl: e.target.value })} className="w-full bg-gray-50 border border-gray-200 text-[#001856] p-2 text-xs rounded focus:outline-none font-mono" placeholder="https://suaempresa.com.br" />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Texto Institucional</label>
                <textarea value={activeSupporter.description || ''} onChange={(e) => setActiveSupporter({ ...activeSupporter, description: e.target.value })} rows={2} className="w-full bg-gray-50 border border-gray-200 text-[#001856] p-2 text-xs rounded focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Nível de Patrocínio</label>
                  <select value={activeSupporter.sponsorshipLevel || 'silver'} onChange={(e) => setActiveSupporter({ ...activeSupporter, sponsorshipLevel: e.target.value as any })} className="w-full bg-gray-50 border border-gray-200 text-gray-400 p-2 text-xs rounded">
                    <option value="diamond">Diamante</option>
                    <option value="gold">Ouro</option>
                    <option value="silver">Prata</option>
                    <option value="bronze">Bronze</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Segmento</label>
                  <input type="text" value={activeSupporter.category || ''} onChange={(e) => setActiveSupporter({ ...activeSupporter, category: e.target.value })} className="w-full bg-gray-50 border border-gray-200 text-[#001856] p-2 text-xs rounded" placeholder="Ex: Indústria" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="homeshow" checked={activeSupporter.highlightedOnHome || false} onChange={(e) => setActiveSupporter({ ...activeSupporter, highlightedOnHome: e.target.checked })} className="w-4 h-4 bg-gray-50 border border-gray-200" />
                <label htmlFor="homeshow" className="text-[10px] font-mono uppercase text-gray-400">Mostrar na Homepage</label>
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-2">Upload Logotipo</label>
                <ImageUploader onUploadSuccess={(url) => setActiveSupporter({ ...activeSupporter, logo: url })} />
              </div>
            </div>

            <div className="bg-gray-50 p-3 border-t border-gray-200 flex justify-end space-x-2">
              <button type="button" onClick={() => setSupporterModalOpen(false)} className="text-xs text-gray-400 px-3 py-1 bg-white rounded">Cancelar</button>
              <button type="submit" className="text-xs text-white px-5 py-1 bg-[#001856] rounded">Salvar Mecenas</button>
            </div>
          </form>
        </div>
      )}

      {/* ================================================================
          MODAL: CSV EXPORT
          ================================================================ */}
      {exportCsvLines && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-fade-in">
          <div className="w-full max-w-xl bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-emerald-400 flex items-center">
                <FileSpreadsheet size={14} className="mr-2" /> DOAÇÕES EXPORTADAS (CSV)
              </span>
              <button onClick={() => setExportCsvLines(null)} className="text-gray-400">Fechar</button>
            </div>
            <div className="p-4 bg-gray-50 font-mono text-[10px] text-gray-400 overflow-auto max-h-72">
              <pre>{exportCsvLines}</pre>
            </div>
            <div className="p-3 bg-white border-t border-gray-200 text-right">
              <button
                onClick={() => { navigator.clipboard.writeText(exportCsvLines); alert('Linhas CSV copiadas!'); setExportCsvLines(null); }}
                className="p-1 px-4 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-mono font-semibold text-xs cursor-pointer"
              >
                Copiar Linhas CSV
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
