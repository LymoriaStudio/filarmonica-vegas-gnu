/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  DollarSign, Users, FileClock, Plus, Calendar, Coins, TrendingUp, Award, 
  Trash2, Edit, Check, X, Download, Star, CheckCircle, AlertCircle, FileSpreadsheet, Play
} from 'lucide-react';
import { DirectDonation, Supporter } from '../../validations/types';
import { ImageUploader } from './MiniWidgets';

interface FinanceiroERPProps {
  donations: DirectDonation[];
  setDonations: React.Dispatch<React.SetStateAction<DirectDonation[]>>;
  supporters: Supporter[];
  setSupporters: React.Dispatch<React.SetStateAction<Supporter[]>>;
  addAuditLog: (action: string, module: string, details: string) => void;
}

export default function FinanceiroERP({
  donations,
  setDonations,
  supporters,
  setSupporters,
  addAuditLog
}: FinanceiroERPProps) {
  const [subTab, setSubTab] = useState<'doacoes' | 'apoiadores' | 'relatorios'>('doacoes');

  // Modals state
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [activeDonation, setActiveDonation] = useState<Partial<DirectDonation> | null>(null);

  const [supporterModalOpen, setSupporterModalOpen] = useState(false);
  const [activeSupporter, setActiveSupporter] = useState<Partial<Supporter> | null>(null);

  const [exportCsvLines, setExportCsvLines] = useState<string | null>(null);


  // ==========================================
  // CONFIRM / CANCEL ACTIONS FOR DONATIONS
  // ==========================================
  const handleOpenDonationModal = () => {
    setActiveDonation({
      id: '',
      donorName: '',
      amount: 100,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      paymentMethod: 'pix',
      status: 'pending'
    });
    setDonationModalOpen(true);
  };

  const handleSaveDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDonation) return;

    const newDon = {
      ...activeDonation,
      id: `don-${Date.now()}`
    } as DirectDonation;

    setDonations(prev => [newDon, ...prev]);
    addAuditLog('Inseriu Doação', 'Financeiro', `Lançou doação manual de R$ ${newDon.amount} para ${newDon.donorName}`);
    setDonationModalOpen(false);
  };

  const handleConfirmDonation = (id: string, name: string, value: number) => {
    setDonations(prev => prev.map(d => d.id === id ? { ...d, status: 'confirmed' } : d));
    addAuditLog('Confirmou Lançamento', 'Financeiro', `Confirmou doação de R$ ${value} enviada por ${name}`);
    alert(`Sucesso! Boleto/PIX de R$ ${value.toLocaleString()} confirmado no ERP.`);
  };

  const handleCancelDonation = (id: string, name: string, value: number) => {
    setDonations(prev => prev.map(d => d.id === id ? { ...d, status: 'cancelled' } : d));
    addAuditLog('Cancelou Lançamento', 'Financeiro', `Estornou/Cancelou doação lançada de R$ ${value} de ${name}`);
  };

  const handleExportDonationCsv = () => {
    let csv = 'ID,Doador,Valor,Data,Metodo,Status\n';
    donations.forEach(d => {
      csv += `"${d.id}","${d.donorName}",${d.amount},"${d.date}","${d.paymentMethod}","${d.status}"\n`;
    });
    setExportCsvLines(csv);
    addAuditLog('Exportou Doações', 'Financeiro', 'Emitiu planilha CSV de receitas brutas');
  };


  // ==========================================
  // SUPPORTERS (SPONSORS MECENATO)
  // ==========================================
  const handleOpenSupporterModal = (sup: Partial<Supporter> | null) => {
    setActiveSupporter(sup || {
      id: '',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&h=80&q=80',
      name: '',
      siteUrl: 'https://example.com',
      description: '',
      category: '',
      sponsorshipLevel: 'silver',
      highlightedOnHome: false
    });
    setSupporterModalOpen(true);
  };

  const handleSaveSupporter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSupporter) return;

    if (activeSupporter.id) {
      setSupporters(prev => prev.map(s => s.id === activeSupporter.id ? (activeSupporter as Supporter) : s));
      addAuditLog('Editou Patrocinador', 'Financeiro', `Propagou mudanças do apoiador: ${activeSupporter.name}`);
    } else {
      const newSup = { ...activeSupporter, id: `sup-${Date.now()}` } as Supporter;
      setSupporters(prev => [...prev, newSup]);
      addAuditLog('Criou Patrocinador', 'Financeiro', `Declarou mecenas oficial: ${newSup.name}`);
    }
    setSupporterModalOpen(false);
  };

  const handleDeleteSupporter = (id: string, name: string) => {
    setSupporters(prev => prev.filter(s => s.id !== id));
    addAuditLog('Removeu Apoiador', 'Financeiro', `Demitou patrocinador do quadro de mecenato: ${name}`);
  };


  // ==========================================
  // COMPUTE LIVE REPORTS AND CALCULATIONS
  // ==========================================
  const reportTotals = useMemo(() => {
    // Confirmed ones
    const confirmedList = donations.filter(d => d.status === 'confirmed');

    // Total Arrecadado
    const grandTotal = confirmedList.reduce((sum, d) => sum + d.amount, 0);

    // Diário (assume today 2026-06-02)
    const dailyTotal = confirmedList
      .filter(d => d.date.startsWith('2026-06-02'))
      .reduce((sum, d) => sum + d.amount, 0);

    // Mensal (assume June 2026)
    const monthlyTotal = confirmedList
      .filter(d => d.date.includes('-06-'))
      .reduce((sum, d) => sum + d.amount, 0);

    // Anual (all 2026)
    const annualTotal = confirmedList
      .filter(d => d.date.includes('2026-'))
      .reduce((sum, d) => sum + d.amount, 0);

    // Giver ranking calculation
    const rankingMap: Record<string, number> = {};
    confirmedList.forEach(d => {
      rankingMap[d.donorName] = (rankingMap[d.donorName] || 0) + d.amount;
    });

    const rankingSorted = Object.entries(rankingMap)
      .map(([name, sum]) => ({ name, totalGived: sum }))
      .sort((a, b) => b.totalGived - a.totalGived)
      .slice(0, 10); // top 10

    return {
      grandTotal,
      dailyTotal,
      monthlyTotal,
      annualTotal,
      rankingSorted
    };
  }, [donations]);

  return (
    <div className="space-y-6 p-6 animate-fade-in select-none">
      
      {/* Upper header */}
      <div className="pb-4 border-b border-neutral-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-neutral-100 tracking-tight flex items-center">
            <DollarSign className="mr-2 text-emerald-400" size={20} />
            Tesouraria & Captação Tributária (Financeiro)
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Lance doações diretas via PIX, gere planilhas fiscais consolidadas e modifique os níveis de incentivos das empresas parceiras.
          </p>
        </div>

        {/* Sub Navigation controls swappers */}
        <div className="flex bg-neutral-900 border border-neutral-800 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setSubTab('doacoes')}
            className={`p-1.5 px-3 rounded-md font-semibold cursor-pointer transition-all ${subTab === 'doacoes' ? 'bg-[#0B4DA2] text-white shadow' : 'text-neutral-400'}`}
          >
            Lançamentos Gerais
          </button>
          <button
            type="button"
            onClick={() => setSubTab('apoiadores')}
            className={`p-1.5 px-3 rounded-md font-semibold cursor-pointer transition-all ${subTab === 'apoiadores' ? 'bg-[#0B4DA2] text-white shadow' : 'text-neutral-400'}`}
          >
            Patrocinadores Jurídicos
          </button>
          <button
            type="button"
            onClick={() => setSubTab('relatorios')}
            className={`p-1.5 px-3 rounded-md font-semibold cursor-pointer transition-all ${subTab === 'relatorios' ? 'bg-[#0B4DA2] text-white shadow' : 'text-neutral-400'}`}
          >
            Relatórios Fiscais
          </button>
        </div>
      </div>

      {/* ==========================================================
          SUBTAB 1: DIRECT DONATIONS AUDIT REGISTRY
          ========================================================== */}
      {subTab === 'doacoes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-neutral-900/50 border border-neutral-800 p-4 rounded-xl">
            <div>
              <h3 className="text-xs font-mono font-bold text-[#F2C94C] uppercase tracking-wider">Aportes e Despesas Coletivas</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">Clique em Confirmar doação para creditar o montante no saldo orquestral geral.</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleExportDonationCsv}
                className="p-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 rounded text-xs font-semibold cursor-pointer flex items-center"
              >
                <Download size={13} className="mr-1.5" /> Planilha de Receitas
              </button>
              <button
                type="button"
                onClick={handleOpenDonationModal}
                className="p-2 px-3 bg-[#0B4DA2] hover:bg-blue-750 text-white text-xs font-semibold rounded cursor-pointer"
              >
                + Lançar Doação Direta
              </button>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-950/70 border-b border-neutral-800 text-neutral-500 font-mono uppercase tracking-wider text-[10px]">
                  <th className="p-3 pl-4">Identificador</th>
                  <th className="p-3">Remetente / CPF / CNPJ</th>
                  <th className="p-3">Valor de Entrada</th>
                  <th className="p-3">Meio Disparo</th>
                  <th className="p-3">Data Lançamento</th>
                  <th className="p-3">Status Caixa</th>
                  <th className="p-3 text-right pr-4">Ação Ouvinte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850">
                {donations.map((don) => (
                  <tr key={don.id} className="hover:bg-neutral-950/40 transition-all font-mono">
                    <td className="p-3 pl-4 text-neutral-500 text-[10px]">{don.id}</td>
                    <td className="p-3">
                      <span className="block font-sans font-bold text-neutral-200">{don.donorName}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-emerald-400 font-bold text-sm">R$ {don.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </td>
                    <td className="p-3 font-semibold uppercase text-[#F2C94C] text-[10px]">{don.paymentMethod.replace('_', ' ')}</td>
                    <td className="p-3 text-neutral-400">{don.date}</td>
                    <td className="p-3">
                      <span className={`inline-block p-1 px-2.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        don.status === 'confirmed' ? 'bg-emerald-950 text-emerald-450' :
                        don.status === 'pending' ? 'bg-amber-955 text-amber-500' :
                        'bg-neutral-800 text-neutral-500'
                      }`}>
                        {don.status === 'confirmed' && 'CONFIRMADA'}
                        {don.status === 'pending' && 'PENDENTE'}
                        {don.status === 'cancelled' && 'CANCELADA'}
                      </span>
                    </td>
                    <td className="p-3 text-right pr-4 space-x-1.5 whitespace-nowrap">
                      {don.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleConfirmDonation(don.id, don.donorName, don.amount)}
                          className="p-1 px-2 bg-emerald-950 hover:bg-emerald-920 rounded text-emerald-400 font-sans font-bold text-[10px] uppercase cursor-pointer"
                        >
                          Confirmar
                        </button>
                      )}
                      {don.status !== 'cancelled' && (
                        <button
                          type="button"
                          title="Estornar caixa"
                          onClick={() => handleCancelDonation(don.id, don.donorName, don.amount)}
                          className="p-1 px-2 bg-neutral-800 hover:bg-rose-950 text-neutral-400 hover:text-rose-200 rounded text-[10px] font-sans"
                        >
                          Anular Lançamento
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================================
          SUBTAB 2: CORPORATE SPONSORS (SUPPORTERS CRM)
          ========================================================== */}
      {subTab === 'apoiadores' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
            <div>
              <h3 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">Quadro Institucional de Apoio</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">Estipule hierarquias de patrocínio corporativo e configure o site público em tempo de execução.</p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenSupporterModal(null)}
              className="p-2 px-3 bg-[#0B4DA2] text-white text-xs font-semibold rounded cursor-pointer"
            >
              + Adicionar Novo Patrocinador
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supporters.map((sup) => (
              <div key={sup.id} className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
                <div className="p-4 bg-neutral-950 border-b border-neutral-850 text-center flex flex-col items-center">
                  <img 
                    src={sup.logo} 
                    alt={sup.name} 
                    referrerPolicy="no-referrer"
                    className="w-20 h-10 object-contain rounded mb-3 bg-white/5 p-1 border border-neutral-800" 
                  />
                  <h4 className="text-xs font-bold text-neutral-100 font-sans">{sup.name}</h4>
                  <span className={`inline-block p-1 px-3 mt-2 rounded text-[8.5px] font-extrabold uppercase font-mono tracking-widest ${
                    sup.sponsorshipLevel === 'diamond' ? 'bg-sky-950 text-sky-455 border border-sky-800' :
                    sup.sponsorshipLevel === 'gold' ? 'bg-amber-955 text-[#F2C94C] border border-[#F2C94C]/20' :
                    sup.sponsorshipLevel === 'silver' ? 'bg-neutral-800 text-neutral-300' :
                    'bg-amber-900/20 text-orange-400'
                  }`}>
                    Patrocínio: {sup.sponsorshipLevel}
                  </span>
                </div>

                <div className="p-4 flex-1 bg-neutral-900/35 text-[11px] text-neutral-400 leading-snug">
                  <p className="min-h-12">"{sup.description}"</p>
                  <div className="mt-3 pt-2.5 border-t border-neutral-850 flex items-center justify-between font-mono text-[9.5px]">
                    <span className="text-neutral-500">Categoria: {sup.category}</span>
                    <a href={sup.siteUrl} target="_blank" rel="noreferrer" className="text-[#F2C94C] hover:underline flex items-center">
                      Site Corporativo
                    </a>
                  </div>
                </div>

                <div className="p-2 px-4 bg-neutral-950 border-t border-neutral-850 flex justify-between items-center text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSupporters(prev => prev.map(s => s.id === sup.id ? { ...s, highlightedOnHome: !s.highlightedOnHome } : s));
                    }}
                    className={`p-1 px-2 rounded font-mono text-[9.5px] uppercase font-bold tracking-wider ${sup.highlightedOnHome ? 'bg-emerald-950 text-emerald-400' : 'bg-neutral-900 text-neutral-600'}`}
                  >
                    {sup.highlightedOnHome ? 'Home: Destaque' : 'Ativar Destaque'}
                  </button>

                  <div className="flex space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenSupporterModal(sup)}
                      className="text-[#F2C94C] hover:text-amber-200 transition-all font-mono font-bold text-[10px]"
                    >
                      EDITAR
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSupporter(sup.id, sup.name)}
                      className="text-rose-450 hover:text-rose-320 transition-all font-mono font-bold text-[10px]"
                    >
                      EXCLUIR
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================================
          SUBTAB 3: REPORTS AND FISCAL EXCEL AGGREGATES
          ========================================================== */}
      {subTab === 'relatorios' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl relative overflow-hidden">
              <span className="text-[10px] font-mono text-neutral-500 uppercase font-bold block mb-1">Entrada Diária</span>
              <div className="text-xl font-bold font-mono text-white">R$ {reportTotals.dailyTotal.toLocaleString()}</div>
              <p className="text-[9px] text-neutral-550 mt-1">Somas do dia corrente</p>
            </div>
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl relative overflow-hidden">
              <span className="text-[10px] font-mono text-neutral-500 uppercase font-bold block mb-1">Média Mensal</span>
              <div className="text-xl font-bold font-mono text-[#F2C94C]">R$ {reportTotals.monthlyTotal.toLocaleString()}</div>
              <p className="text-[9px] text-neutral-550 mt-1">Mês de referência: Junho</p>
            </div>
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl relative overflow-hidden">
              <span className="text-[10px] font-mono text-neutral-500 uppercase font-bold block mb-1">Incentivado Tributário Anual</span>
              <div className="text-xl font-bold font-mono text-[#0B4DA2]">R$ {reportTotals.annualTotal.toLocaleString()}</div>
              <p className="text-[9px] text-neutral-550 mt-1">Balanço fiscal 2026</p>
            </div>
            <div className="p-4 bg-neutral-900/40 border border-emerald-990/30 rounded-xl relative overflow-hidden bg-emerald-950/5">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block mb-1">Acumulado Bruto Caixa</span>
              <div className="text-xl font-bold font-mono text-emerald-350">R$ {reportTotals.grandTotal.toLocaleString()}</div>
              <p className="text-[9px] text-neutral-550 mt-1">Total confirmado depósitos</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Live aggregated donor rankings calculated via standard group-by */}
            <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-neutral-850">
                <Award size={15} className="text-amber-500" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-200">Ranking dos Maiores Doadores (Mecenato Individual)</h3>
              </div>
              
              <div className="space-y-2.5">
                {reportTotals.rankingSorted.length === 0 ? (
                  <div className="text-center text-xs p-6 text-neutral-500 font-serif italic">Nenhuma doação creditada na conta orquestral.</div>
                ) : (
                  reportTotals.rankingSorted.map((giver, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-neutral-950 border border-neutral-900 hover:border-neutral-800 text-xs">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <span className="w-5 h-5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono font-extrabold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-sans font-bold text-[#E5E5E5] truncate">{giver.name}</span>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold">R$ {giver.totalGived.toLocaleString('pt-BR')}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Fiscal and Law Rouanet support blocks */}
            <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-neutral-850">
                <FileClock size={15} className="text-sky-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-200">Certidões e Isenção de Imposto Corporativo</h3>
              </div>

              <div className="text-xs text-neutral-400 leading-relaxed space-y-3.5">
                <p>Nossa instituição orquestral é regulada sob a classificação de <strong>Entidade de Utilidade Pública Sem Fins Lucrativos</strong> e portadora do Certificado Atribuição Rouanet expedido pelo Ministério da Cultura.</p>
                <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-855 font-mono text-[10px] text-amber-500/80">
                  <div className="flex justify-between">
                    <span>CNPJ Associativo:</span> <span className="text-neutral-300">12.345.678/0001-90</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Selo PRONAC Rouanet ID:</span> <span className="text-neutral-300">#2415-MT-SUL</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Isenção ICMS Estadual:</span> <span className="text-emerald-400 font-bold">CONCEDIDA</span>
                  </div>
                </div>

                <button
                  onClick={() => alert('Parabéns! Extrato detalhado no padrão e-Doc do Imposto de Renda consolidado na pasta Biblioteca.')}
                  className="w-full p-2 bg-gradient-to-r from-neutral-800 to-neutral-850 hover:from-neutral-750 hover:to-neutral-800 text-neutral-300 text-[10.5px] font-mono leading-none rounded border border-neutral-750 transition-all cursor-pointer"
                >
                  Exportar e-Doc Geral Fisco 2026 (.pdf)
                </button>
              </div>
            </div>

          </div>
        </div>
      )}


      {/* ==========================================
          MODALS FOR CREATING OR UPDATING DONATIONS / SPONSORS
          ========================================== */}
      
      {/* Modal 1: Donation creation */}
      {donationModalOpen && activeDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <form 
            onSubmit={handleSaveDonation}
            className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl space-y-4"
          >
            <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-amber-500 uppercase tracking-widest">Lançamento de Doação Recebida</span>
              <button type="button" onClick={() => setDonationModalOpen(false)} className="text-neutral-400">Fechar</button>
            </div>

            <div className="p-4 space-y-3.5">
              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Doador / Benfeitor</label>
                <input 
                  type="text" 
                  required
                  value={activeDonation.donorName || ''}
                  onChange={(e) => setActiveDonation({ ...activeDonation, donorName: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded focus:outline-none"
                  placeholder="Nome completo ou empresa..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Valor de Entrada R$</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={activeDonation.amount || 0}
                    onChange={(e) => setActiveDonation({ ...activeDonation, amount: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded focus:outline-none font-mono font-bold text-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Método Envio</label>
                  <select
                    value={activeDonation.paymentMethod || 'pix'}
                    onChange={(e) => setActiveDonation({ ...activeDonation, paymentMethod: e.target.value as any })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-400 p-2 text-xs rounded"
                  >
                    <option value="pix">PIX Instantâneo</option>
                    <option value="credit_card">Cartão de Crédito</option>
                    <option value="bank_slip">Boleto Bancário</option>
                    <option value="transfer">TED / Transferência</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Data / Hora Compensação</label>
                <input 
                  type="text" 
                  value={activeDonation.date || ''}
                  onChange={(e) => setActiveDonation({ ...activeDonation, date: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded font-mono"
                />
              </div>
            </div>

            <div className="bg-neutral-950 p-3 border-t border-neutral-800 flex justify-end space-x-2">
              <button 
                type="button" 
                onClick={() => setDonationModalOpen(false)} 
                className="text-xs text-neutral-400 px-3 py-1 bg-neutral-900 rounded"
              >
                Voltar
              </button>
              <button 
                type="submit" 
                className="text-xs text-white px-5 py-1 bg-emerald-700 font-bold rounded"
              >
                Creditas no Saldo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal 2: Creator supporters */}
      {supporterModalOpen && activeSupporter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <form 
            onSubmit={handleSaveSupporter}
            className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl space-y-4"
          >
            <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-amber-500 uppercase tracking-widest">
                {activeSupporter.id ? 'Alterar Apoiador Oficial' : 'Adicionar Novo Patrocinador'}
              </span>
              <button type="button" onClick={() => setSupporterModalOpen(false)} className="text-neutral-400">Fechar</button>
            </div>

            <div className="p-4 space-y-3.5 max-h-[420px] overflow-y-auto">
              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Nome Fantasia da Empresa</label>
                <input 
                  type="text" 
                  required
                  value={activeSupporter.name || ''}
                  onChange={(e) => setActiveSupporter({ ...activeSupporter, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Link URL do Site Oficial</label>
                <input 
                  type="text" 
                  value={activeSupporter.siteUrl || ''}
                  onChange={(e) => setActiveSupporter({ ...activeSupporter, siteUrl: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-820 text-neutral-105 p-2 text-xs rounded focus:outline-none font-mono"
                  placeholder="https://suaempresa.com.br"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Texto Institucional de Apoio</label>
                <textarea 
                  value={activeSupporter.description || ''}
                  onChange={(e) => setActiveSupporter({ ...activeSupporter, description: e.target.value })}
                  rows={2}
                  className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Nível de Patrocínio</label>
                  <select
                    value={activeSupporter.sponsorshipLevel || 'silver'}
                    onChange={(e) => setActiveSupporter({ ...activeSupporter, sponsorshipLevel: e.target.value as any })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-400 p-2 text-xs rounded"
                  >
                    <option value="diamond">Diamante (Principal)</option>
                    <option value="gold">Ouro (Frequente)</option>
                    <option value="silver">Prata (Incentivado)</option>
                    <option value="bronze">Bronze (Eventual)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Segmento / Categoria</label>
                  <input 
                    type="text" 
                    value={activeSupporter.category || ''}
                    onChange={(e) => setActiveSupporter({ ...activeSupporter, category: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-820 text-neutral-100 p-2 text-xs rounded"
                    placeholder="Ex: Fabricação de Metais"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="homeshow"
                    checked={activeSupporter.highlightedOnHome || false}
                    onChange={(e) => setActiveSupporter({ ...activeSupporter, highlightedOnHome: e.checked })}
                    className="w-4 h-4 bg-neutral-950 border border-neutral-800"
                  />
                  <label htmlFor="homeshow" className="text-[10px] font-mono uppercase text-neutral-400">Mostrar na Homepage</label>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-2">Upload Logotipo</label>
                  <ImageUploader 
                    onUploadSuccess={(url) => setActiveSupporter({ ...activeSupporter, logo: url })} 
                  />
                </div>
              </div>

            </div>

            <div className="bg-neutral-950 p-3 border-t border-neutral-800 flex justify-end space-x-2">
              <button type="button" onClick={() => setSupporterModalOpen(false)} className="text-xs text-neutral-400 px-3 py-1 bg-neutral-900 rounded">Cancelar</button>
              <button type="submit" className="text-xs text-white px-5 py-1 bg-[#0B4DA2] rounded">Salvar Mecenas</button>
            </div>
          </form>
        </div>
      )}


      {/* Modal 3: CSV viewer */}
      {exportCsvLines && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-fade-in">
          <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-emerald-400 flex items-center">
                <FileSpreadsheet size={14} className="mr-2" />
                DOAÇÕES EXPORTADAS (CÉLULAS CSV)
              </span>
              <button onClick={() => setExportCsvLines(null)} className="text-neutral-400">Fechar</button>
            </div>
            
            <div className="p-4 bg-neutral-950 font-mono text-[10px] text-neutral-450 overflow-auto max-h-72">
              <pre>{exportCsvLines}</pre>
            </div>

            <div className="p-3 bg-neutral-900 border-t border-neutral-800 text-right">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(exportCsvLines);
                  alert('Linhas CSV copiadas com sucesso!');
                  setExportCsvLines(null);
                }}
                className="p-1 px-4 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-mono font-semibold text-xs transition-all cursor-pointer"
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
