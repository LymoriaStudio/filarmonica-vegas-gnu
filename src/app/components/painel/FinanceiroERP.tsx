/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { InlineLoader } from '../../components/InlineLoader';

import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign, FileClock, Plus, Award, Trash2, Download,
  Pencil, X, CheckCircle, Clock,
} from 'lucide-react';
import { Supporter } from '../../validations/types';
import { ImageUploader } from './MiniWidgets';
import { Drawer, DrawerSection, DrawerField, DrawerInput, DrawerTextarea, DrawerSelect } from './Drawer';
import {
  getDoacoes,
  createDoacao,
  updateDoacao,
  deleteDoacao,
  Doacao,
} from '../../services/doacoesService';

// ── Mapper banco → view ────────────────────────────────────────────────────
function toDoacaoView(d: Doacao) {
  return {
    id: d.id ?? '',
    donorName: d.donor_name ?? 'Anônimo',
    donorType: (d.donor_type ?? 'fisica') as 'fisica' | 'juridica',
    donorCpf: d.donor_cpf ?? '',
    donorEmail: d.donor_email ?? '',
    amount: Number(d.amount),
    date: d.date ? new Date(d.date).toLocaleDateString('pt-BR') : '',
    status: d.status ?? 'pendente',
  };
}
type DoacaoView = ReturnType<typeof toDoacaoView>;

function initials(name: string) {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return 'A';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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
  const [filterType, setFilterType] = useState<'all' | 'fisica' | 'juridica'>('all');

  // Modal nova/editar doação
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [activeDonation, setActiveDonation] = useState<{
    id?: string;
    donorName: string;
    donorType: 'fisica' | 'juridica';
    donorCpf: string;
    donorEmail: string;
    amount: number | '';
    status: 'confirmado' | 'pendente';
  } | null>(null);
  const [savingDonation, setSavingDonation] = useState(false);

  // Modal apoiador
  const [supporterModalOpen, setSupporterModalOpen] = useState(false);
  const [activeSupporter, setActiveSupporter] = useState<Partial<Supporter> | null>(null);


  // ── GET doações ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (subTab !== 'doacoes' && subTab !== 'relatorios') return;
    setLoadingDoacoes(true);
    setErrorDoacoes(null);
    getDoacoes()
      .then((data) => setDoacoes(data.map(toDoacaoView)))
      .catch((err) => setErrorDoacoes('Erro ao carregar doações: ' + err.message))
      .finally(() => setLoadingDoacoes(false));
  }, [subTab]);

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const fisica = doacoes.filter((d) => d.donorType === 'fisica');
    const juridica = doacoes.filter((d) => d.donorType === 'juridica');
    const confirmados = doacoes.filter((d) => d.status === 'confirmado' && d.amount > 0);
    const pendentes = doacoes.filter((d) => d.status !== 'confirmado' && d.amount > 0);
    const volumeConfirmado = confirmados.reduce((s, d) => s + d.amount, 0);
    const volumePendente = pendentes.reduce((s, d) => s + d.amount, 0);
    return { total: doacoes.length, fisica: fisica.length, juridica: juridica.length, volumeConfirmado, volumePendente };
  }, [doacoes]);

  // ── Lista filtrada ────────────────────────────────────────────────────────
  const filteredDoacoes = useMemo(() =>
    filterType === 'all' ? doacoes : doacoes.filter((d) => d.donorType === filterType),
    [doacoes, filterType]
  );

  // ── POST / PUT ────────────────────────────────────────────────────────────
  const handleSaveDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDonation) return;
    setSavingDonation(true);
    try {
      const payload = {
        donor_name: activeDonation.donorName || null,
        donor_type: activeDonation.donorType,
        donor_cpf: activeDonation.donorCpf || null,
        donor_email: activeDonation.donorEmail || null,
        amount: Number(activeDonation.amount) || 0,
        status: activeDonation.status,
      };
      if (activeDonation.id) {
        await updateDoacao(activeDonation.id, payload);
        setDoacoes((prev) => prev.map((d) =>
          d.id === activeDonation.id
            ? { ...d, ...payload, donorName: payload.donor_name ?? 'Anônimo', donorType: payload.donor_type, donorCpf: payload.donor_cpf ?? '', donorEmail: payload.donor_email ?? '', amount: payload.amount, status: payload.status }
            : d
        ));
        addAuditLog('Editou Doação', 'Financeiro', `Editou doação de ${activeDonation.donorName}`);
      } else {
        const saved = await createDoacao(payload);
        setDoacoes((prev) => [toDoacaoView(saved), ...prev]);
        addAuditLog('Inseriu Doação', 'Financeiro', `Lançou doação de R$ ${payload.amount} de ${payload.donor_name ?? 'Anônimo'}`);
      }
      setDonationModalOpen(false);
      setActiveDonation(null);
    } catch (err: any) {
      alert('Erro ao salvar doação: ' + err.message);
    } finally {
      setSavingDonation(false);
    }
  };

  const handleDeleteDonation = async (id: string, name: string) => {
    if (!confirm(`Excluir doação de ${name}?`)) return;
    try {
      await deleteDoacao(id);
      setDoacoes((prev) => prev.filter((d) => d.id !== id));
      addAuditLog('Excluiu Doação', 'Financeiro', `Removeu doação de ${name}`);
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const openNewDonation = () => {
    setActiveDonation({ donorName: '', donorType: 'fisica', donorCpf: '', donorEmail: '', amount: '', status: 'pendente' });
    setDonationModalOpen(true);
  };

  const openEditDonation = (d: DoacaoView) => {
    setActiveDonation({ id: d.id, donorName: d.donorName, donorType: d.donorType, donorCpf: d.donorCpf, donorEmail: d.donorEmail, amount: d.amount, status: (d.status as 'confirmado' | 'pendente') ?? 'pendente' });
    setDonationModalOpen(true);
  };

  const handleToggleConfirm = async (d: DoacaoView) => {
    const newStatus = d.status === 'confirmado' ? 'pendente' : 'confirmado';
    try {
      await updateDoacao(d.id, {
        donor_name: d.donorName,
        donor_type: d.donorType,
        donor_cpf: d.donorCpf,
        donor_email: d.donorEmail,
        amount: d.amount,
        status: newStatus,
      });
      setDoacoes((prev) => prev.map((x) => x.id === d.id ? { ...x, status: newStatus } : x));
      addAuditLog(
        newStatus === 'confirmado' ? 'Confirmou Doação' : 'Reverteu Doação',
        'Financeiro',
        `${newStatus === 'confirmado' ? 'Confirmou' : 'Reverteu para pendente'} doação de R$ ${d.amount} de ${d.donorName}`
      );
    } catch (err: any) {
      alert('Erro ao atualizar status: ' + err.message);
    }
  };

  // ── CSV download direto ───────────────────────────────────────────────────
  const handleExportCsv = () => {
    const BOM = '﻿'; // BOM para Excel reconhecer UTF-8
    let csv = 'ID,Doador,Tipo,CPF/CNPJ,E-mail,Valor (R$),Data,Status\n';
    doacoes.forEach((d) => {
      csv += `"${d.id}","${d.donorName}","${d.donorType === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}","${d.donorCpf}","${d.donorEmail}",${d.amount},"${d.date}","${d.status}"\n`;
    });
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `doacoes_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
    const today = now.toLocaleDateString('pt-BR');
    const dailyTotal = confirmed.filter((d) => d.date === today).reduce((s, d) => s + d.amount, 0);
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
          <h2 className="text-xl font-bold text-[#001856] tracking-tight flex items-center gap-2">
            <DollarSign className="text-emerald-500" size={20} />
            Doações Diretas
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Registros de doações via Pix — para envio à contabilidade
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            <Download size={13} /> CSV Contabilidade
          </button>
          <button
            type="button"
            onClick={openNewDonation}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#ffc300] hover:bg-yellow-400 text-[#001856] rounded-lg text-xs font-bold cursor-pointer transition-colors"
          >
            <Plus size={13} /> Nova doação
          </button>
        </div>
      </div>

      {/* ================================================================
          SUBTAB — DOAÇÕES
          ================================================================ */}
      {subTab === 'doacoes' && (
        <div className="space-y-5">

          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-1">
              <span className="text-xs text-gray-400">Total de doações</span>
              <span className="text-3xl font-bold text-[#001856]">{kpis.total}</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-1">
              <span className="text-xs text-[#001856] font-semibold">Pessoa Física / Jurídica</span>
              <span className="text-3xl font-bold text-[#001856]">
                {kpis.fisica} <span className="text-gray-300">/</span> {kpis.juridica}
              </span>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3">
              <span className="text-xs text-gray-400">Volume declarado (R$)</span>
              <div className="flex items-end gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-2xl font-bold text-emerald-500">
                    R$ {kpis.volumeConfirmado.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wide">Confirmado</span>
                </div>
                <span className="text-gray-200 text-2xl font-light mb-4">/</span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-2xl font-bold text-amber-500">
                    R$ {kpis.volumePendente.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-[10px] font-semibold text-amber-500 uppercase tracking-wide">Pendente</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filtro por tipo */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">TIPO</span>
            {([
              { key: 'all', label: `Todos (${kpis.total})` },
              { key: 'fisica', label: `Pessoa Física (${kpis.fisica})` },
              { key: 'juridica', label: `Pessoa Jurídica (${kpis.juridica})` },
            ] as const).map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilterType(f.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filterType === f.key
                    ? 'bg-[#001856] text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Estado loading / erro / vazio */}
          {loadingDoacoes && <InlineLoader message="Carregando doações..." />}
          {errorDoacoes && <p className="text-red-400 text-sm text-center py-10">{errorDoacoes}</p>}
          {!loadingDoacoes && !errorDoacoes && filteredDoacoes.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-10 border border-dashed border-gray-200 rounded-2xl">
              Nenhuma doação registrada ainda.
            </p>
          )}

          {/* Lista de cards */}
          <div className="space-y-3">
            {filteredDoacoes.map((don) => {
              const isPF = don.donorType === 'fisica';
              return (
                <div
                  key={don.id}
                  className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-4"
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                    isPF ? 'bg-[#001856] text-white' : 'bg-[#ffc300] text-[#001856]'
                  }`}>
                    {isPF ? 'PF' : 'PJ'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[#001856] text-sm">{don.donorName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isPF
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {isPF ? 'Pessoa Física' : 'Pessoa Jurídica'}
                      </span>
                      <span className="text-emerald-500 font-bold text-sm">
                        {don.amount === 0
                          ? 'A definir'
                          : `R$ ${don.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 flex flex-wrap gap-x-2">
                      {don.donorCpf && <span>{don.donorCpf}</span>}
                      {don.donorEmail && <span>· {don.donorEmail}</span>}
                      {don.date && <span>· {don.date}</span>}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Botão de confirmação */}
                    <button
                      type="button"
                      onClick={() => handleToggleConfirm(don)}
                      title={don.status === 'confirmado' ? 'Reverter para pendente' : 'Confirmar doação'}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        don.status === 'confirmado'
                          ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                      }`}
                    >
                      {don.status === 'confirmado'
                        ? <><CheckCircle size={13} /> Confirmado</>
                        : <><Clock size={13} /> Pendente</>}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditDonation(don)}
                      className="p-2 rounded-lg text-gray-400 hover:text-[#001856] hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDonation(don.id, don.donorName)}
                      className="p-2 rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================
          SUBTAB — APOIADORES
          ================================================================ */}
      {subTab === 'apoiadores' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white border border-gray-200 p-4 rounded-xl">
            <div>
              <h3 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">Quadro Institucional de Apoio</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Estipule hierarquias de patrocínio corporativo e configure o site público.</p>
            </div>
            <button type="button" onClick={() => handleOpenSupporterModal(null)} className="flex items-center gap-1.5 px-4 py-2 bg-[#ffc300] hover:bg-yellow-400 text-[#001856] rounded-lg text-xs font-bold cursor-pointer transition-colors">
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
          SUBTAB — RELATÓRIOS
          ================================================================ */}
      {subTab === 'relatorios' && (
        <div className="space-y-6">
          {loadingDoacoes && <InlineLoader message="Carregando dados..." />}
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
          DRAWER: NOVA / EDITAR DOAÇÃO
          ================================================================ */}
      <Drawer
        open={donationModalOpen && activeDonation !== null}
        onClose={() => setDonationModalOpen(false)}
        title={activeDonation?.id ? 'Editar doação' : 'Nova doação'}
        description="Preencha os dados do doador e o valor da doação via Pix."
        icon={DollarSign}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-500"
        onSubmit={handleSaveDonation}
        submitLabel={savingDonation ? 'Salvando...' : 'Salvar'}
        submitting={savingDonation}
      >
        {activeDonation && (
          <>
            <DrawerSection title="Tipo de doador">
              <div className="grid grid-cols-2 gap-2">
                {(['fisica', 'juridica'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setActiveDonation({ ...activeDonation, donorType: t })}
                    className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all cursor-pointer ${
                      activeDonation.donorType === t
                        ? 'bg-[#001856] border-[#001856] text-white'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {t === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                  </button>
                ))}
              </div>
            </DrawerSection>

            <DrawerSection title="Dados do doador">
              <DrawerField label="Nome completo" required>
                <DrawerInput
                  type="text"
                  value={activeDonation.donorName}
                  onChange={(e) => setActiveDonation({ ...activeDonation, donorName: e.target.value })}
                  placeholder="Nome do doador"
                />
              </DrawerField>

              <DrawerField label={activeDonation.donorType === 'fisica' ? 'CPF' : 'CNPJ'} required>
                <DrawerInput
                  type="text"
                  value={activeDonation.donorCpf}
                  onChange={(e) => setActiveDonation({ ...activeDonation, donorCpf: e.target.value })}
                  placeholder={activeDonation.donorType === 'fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
                />
              </DrawerField>

              <DrawerField label="E-mail">
                <DrawerInput
                  type="email"
                  value={activeDonation.donorEmail}
                  onChange={(e) => setActiveDonation({ ...activeDonation, donorEmail: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </DrawerField>
            </DrawerSection>

            <DrawerSection title="Valor">
              <DrawerField label="Valor (R$)" required>
                <DrawerInput
                  type="number"
                  required
                  min="0"
                  value={activeDonation.amount}
                  onChange={(e) => setActiveDonation({ ...activeDonation, amount: e.target.value === '' ? '' : Number(e.target.value) })}
                  placeholder="0"
                />
              </DrawerField>
            </DrawerSection>

            <DrawerSection title="Status">
              <DrawerField label="Status da doação">
                <DrawerSelect
                  value={activeDonation.status}
                  onChange={(e) => setActiveDonation({ ...activeDonation, status: e.target.value as 'confirmado' | 'pendente' })}
                >
                  <option value="confirmado">Confirmada</option>
                  <option value="pendente">Pendente</option>
                </DrawerSelect>
              </DrawerField>
            </DrawerSection>
          </>
        )}
      </Drawer>

      {/* ================================================================
          DRAWER: APOIADOR
          ================================================================ */}
      <Drawer
        open={supporterModalOpen && !!activeSupporter}
        onClose={() => setSupporterModalOpen(false)}
        title={activeSupporter?.id ? 'Alterar Apoiador' : 'Adicionar Patrocinador'}
        description="Configure o patrocínio corporativo e as informações exibidas no site público."
        icon={Award}
        iconBg="bg-amber-50"
        iconColor="text-amber-500"
        onSubmit={handleSaveSupporter}
        submitLabel="Salvar Mecenas"
      >
        {activeSupporter && (
          <>
            <DrawerSection title="Identificação">
              <DrawerField label="Nome Fantasia" required>
                <DrawerInput
                  type="text"
                  required
                  value={activeSupporter.name || ''}
                  onChange={(e) => setActiveSupporter({ ...activeSupporter, name: e.target.value })}
                />
              </DrawerField>
              <DrawerField label="URL do Site">
                <DrawerInput
                  type="text"
                  value={activeSupporter.siteUrl || ''}
                  onChange={(e) => setActiveSupporter({ ...activeSupporter, siteUrl: e.target.value })}
                  placeholder="https://suaempresa.com.br"
                />
              </DrawerField>
              <DrawerField label="Texto Institucional">
                <DrawerTextarea
                  value={activeSupporter.description || ''}
                  onChange={(e) => setActiveSupporter({ ...activeSupporter, description: e.target.value })}
                  rows={3}
                />
              </DrawerField>
            </DrawerSection>

            <DrawerSection title="Classificação">
              <div className="grid grid-cols-2 gap-4">
                <DrawerField label="Nível de Patrocínio" required>
                  <DrawerSelect
                    value={activeSupporter.sponsorshipLevel || 'silver'}
                    onChange={(e) => setActiveSupporter({ ...activeSupporter, sponsorshipLevel: e.target.value as any })}
                  >
                    <option value="diamond">Diamante</option>
                    <option value="gold">Ouro</option>
                    <option value="silver">Prata</option>
                    <option value="bronze">Bronze</option>
                  </DrawerSelect>
                </DrawerField>
                <DrawerField label="Segmento">
                  <DrawerInput
                    type="text"
                    value={activeSupporter.category || ''}
                    onChange={(e) => setActiveSupporter({ ...activeSupporter, category: e.target.value })}
                    placeholder="Ex: Indústria"
                  />
                </DrawerField>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="homeshow"
                  checked={activeSupporter.highlightedOnHome || false}
                  onChange={(e) => setActiveSupporter({ ...activeSupporter, highlightedOnHome: e.target.checked })}
                  className="w-4 h-4 border border-gray-200 rounded"
                />
                <label htmlFor="homeshow" className="text-xs font-semibold text-gray-700">Mostrar na Homepage</label>
              </div>
            </DrawerSection>

            <DrawerSection title="Logotipo">
              <ImageUploader onUploadSuccess={(url) => setActiveSupporter({ ...activeSupporter, logo: url })} />
            </DrawerSection>
          </>
        )}
      </Drawer>


    </div>
  );
}
