
import React, { useState, useMemo, useEffect } from 'react';
import { Coins, Calculator, TrendingUp, Save, Building2, Wallet, Edit3, CheckCircle, Sparkles, Wand2 } from 'lucide-react';
import { LogisticsEntry, BranchFinancialConfig } from '../types';
import { formatCurrency } from '../utils/validators';

interface FinancialReportProps {
  data: LogisticsEntry[];
  configs: BranchFinancialConfig[];
  onConfigsUpdate: (configs: BranchFinancialConfig[]) => void;
}

const DEFAULT_SALARIES: Record<string, number> = {
  "CONTAGEM": 2332.81,
  "GUARULHOS": 2631.88,
  "MATRIZ": 2398.50,
  "CUIABÁ": 2055.66,
  "RIBEIRAO PRETO": 2430.50,
  "GRAVATAI": 2350.55,
  "EMBU": 2631.88,
  "PAULINIA AJUDANTES": 2269.42,
  "CARRETEIROS": 3023.50,
  "CARRETEIROS GUARULHOS": 3106.26,
  "APARECIDA DE GOIANIA": 2100.00,
  "PAULÍNIA": 1641.99,
  "VIANA": 2334.49
};

const FinancialReport: React.FC<FinancialReportProps> = ({ data, configs, onConfigsUpdate }) => {
  const branches = useMemo(() => Array.from(new Set(data.map(d => d.filial))).sort(), [data]);
  
  const [editingConfigs, setEditingConfigs] = useState<Record<string, BranchFinancialConfig>>(() => {
    const initial: Record<string, BranchFinancialConfig> = {};
    branches.forEach(b => {
      const existing = configs.find(c => c.filial === b);
      if (existing) {
        initial[b] = existing;
      } else {
        const salary = DEFAULT_SALARIES[b] || 2000;
        const baseHour = salary / 220;
        initial[b] = {
          filial: b,
          salarioBase: salary,
          valorHe50: Number((baseHour * 1.5).toFixed(2)),
          valorHe100: Number((baseHour * 2.0).toFixed(2)),
          valorAdNot: Number((baseHour * 0.2).toFixed(2)),
          valorDiaria: Number((salary / 30).toFixed(2))
        };
      }
    });
    return initial;
  });

  const [lastAutoCalculatedBranch, setLastAutoCalculatedBranch] = useState<string | null>(null);

  const applyAutomaticSuggestion = (branch: string, salary: number) => {
    setEditingConfigs(prev => {
      const currentConfig = prev[branch];
      const baseHour = salary / 220;
      const newConfig = { 
        ...currentConfig, 
        salarioBase: salary,
        valorHe50: Number((baseHour * 1.5).toFixed(2)),
        valorHe100: Number((baseHour * 2.0).toFixed(2)),
        valorAdNot: Number((baseHour * 0.2).toFixed(2)),
        valorDiaria: Number((salary / 30).toFixed(2))
      };
      
      setLastAutoCalculatedBranch(branch);
      setTimeout(() => setLastAutoCalculatedBranch(null), 1000);
      
      return { ...prev, [branch]: newConfig };
    });
  };

  const updateField = (branch: string, field: keyof BranchFinancialConfig, value: number) => {
    setEditingConfigs(prev => {
      const currentConfig = prev[branch];
      const newConfig = { ...currentConfig, [field]: value };
      
      // Auto-recalcula ao alterar o salário base diretamente
      if (field === 'salarioBase') {
        const baseHour = value / 220;
        newConfig.valorHe50 = Number((baseHour * 1.5).toFixed(2));
        newConfig.valorHe100 = Number((baseHour * 2.0).toFixed(2));
        newConfig.valorAdNot = Number((baseHour * 0.2).toFixed(2));
        newConfig.valorDiaria = Number((value / 30).toFixed(2));
        
        setLastAutoCalculatedBranch(branch);
        setTimeout(() => setLastAutoCalculatedBranch(null), 1000);
      }
      
      return { ...prev, [branch]: newConfig };
    });
  };

  const handleSave = () => {
    onConfigsUpdate(Object.values(editingConfigs));
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl z-[100] animate-in slide-in-from-bottom-4 flex items-center gap-3 font-bold';
    notification.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Parâmetros Salariais Atualizados!`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const financialResults = useMemo(() => {
    const results = branches.map(b => {
      const config = editingConfigs[b] || { salarioBase: 0, valorHe50: 0, valorHe100: 0, valorAdNot: 0, valorDiaria: 0 };
      const branchData = data.filter(d => d.filial === b);
      
      const totalHe50 = branchData.reduce((acc, curr) => acc + curr.he50, 0);
      const totalHe100 = branchData.reduce((acc, curr) => acc + curr.he100, 0);
      const totalAdNot = branchData.reduce((acc, curr) => acc + curr.adicionalNoturno, 0);
      const totalDiarias = branchData.reduce((acc, curr) => acc + curr.diariasMes, 0);

      const costHe50 = totalHe50 * config.valorHe50;
      const costHe100 = totalHe100 * config.valorHe100;
      const costAdNot = totalAdNot * config.valorAdNot;
      const costDiarias = totalDiarias > 100 ? totalDiarias : (totalDiarias * config.valorDiaria);

      return {
        filial: b,
        totalCost: costHe50 + costHe100 + costAdNot + costDiarias,
        costHe50,
        costHe100,
        costAdNot,
        costDiarias,
        he50: totalHe50,
        he100: totalHe100,
        adNot: totalAdNot,
        diarias: totalDiarias
      };
    });

    return results.sort((a, b) => b.totalCost - a.totalCost);
  }, [data, editingConfigs, branches]);

  const totalGlobalCost = financialResults.reduce((acc, curr) => acc + curr.totalCost, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Coins size={80} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 opacity-80 mb-3">
              <div className="p-2 bg-white/10 rounded-lg"><Coins size={20} /></div>
              <span className="text-xs font-black uppercase tracking-[0.2em]">Budget Operacional</span>
            </div>
            <p className="text-4xl font-black tracking-tight">{formatCurrency(totalGlobalCost)}</p>
            <div className="mt-6 flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl w-fit border border-white/10">
              <TrendingUp size={16} />
              <span className="text-xs font-bold">Cálculo baseado em {branches.length} filiais</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Ticket Médio p/ Filial</p>
          <div className="flex items-baseline gap-2">
             <p className="text-3xl font-black text-slate-800">{formatCurrency(totalGlobalCost / (branches.length || 1))}</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Volume Total Horas</p>
          <p className="text-3xl font-black text-blue-600">
            {(data.reduce((acc, curr) => acc + curr.he50 + curr.he100, 0)).toFixed(1)}<span className="text-lg ml-1 text-slate-400">h</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-100"><Edit3 size={24} /></div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Parametrização Salarial</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Configure o Salário Base e os encargos de cada filial operacional.</p>
                </div>
              </div>
              <button 
                onClick={handleSave}
                className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95"
              >
                <Save size={20} /> SALVAR ALTERAÇÕES
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[1200px]">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-5">Filial Operacional</th>
                    <th className="px-8 py-5">Salário Base (R$)</th>
                    <th className="px-8 py-5">Valor HE 50%</th>
                    <th className="px-8 py-5">Valor HE 100%</th>
                    <th className="px-8 py-5">Adicional Noturno</th>
                    <th className="px-8 py-5">Valor Diária</th>
                    <th className="px-8 py-5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {branches.map(branch => {
                    const cfg = editingConfigs[branch];
                    const isAnimating = lastAutoCalculatedBranch === branch;

                    return (
                      <tr key={branch} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                              <Building2 size={18} />
                            </div>
                            <span className="font-bold text-slate-800 tracking-tight">{branch}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="relative max-w-[150px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">R$</span>
                            <input 
                              type="number" 
                              value={cfg.salarioBase}
                              onChange={(e) => updateField(branch, 'salarioBase', parseFloat(e.target.value) || 0)}
                              className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-sm font-black text-slate-700 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm"
                            />
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className={`relative max-w-[120px] transition-all duration-500 ${isAnimating ? 'scale-105' : ''}`}>
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">R$</span>
                            <input 
                              type="number" 
                              value={cfg.valorHe50}
                              onChange={(e) => updateField(branch, 'valorHe50', parseFloat(e.target.value) || 0)}
                              className={`w-full border rounded-xl pl-8 pr-3 py-2 text-sm font-black outline-none focus:ring-4 transition-all shadow-sm ${
                                isAnimating ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-slate-200 text-blue-600 focus:ring-blue-100 focus:border-blue-400'
                              }`}
                            />
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className={`relative max-w-[120px] transition-all duration-500 ${isAnimating ? 'scale-105' : ''}`}>
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">R$</span>
                            <input 
                              type="number" 
                              value={cfg.valorHe100}
                              onChange={(e) => updateField(branch, 'valorHe100', parseFloat(e.target.value) || 0)}
                              className={`w-full border rounded-xl pl-8 pr-3 py-2 text-sm font-black outline-none focus:ring-4 transition-all shadow-sm ${
                                isAnimating ? 'bg-orange-50 border-orange-400 text-orange-700' : 'bg-white border-slate-200 text-orange-600 focus:ring-orange-100 focus:border-orange-400'
                              }`}
                            />
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className={`relative max-w-[120px] transition-all duration-500 ${isAnimating ? 'scale-105' : ''}`}>
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">R$</span>
                            <input 
                              type="number" 
                              value={cfg.valorAdNot}
                              onChange={(e) => updateField(branch, 'valorAdNot', parseFloat(e.target.value) || 0)}
                              className={`w-full border rounded-xl pl-8 pr-3 py-2 text-sm font-black outline-none focus:ring-4 transition-all shadow-sm ${
                                isAnimating ? 'bg-purple-50 border-purple-400 text-purple-700' : 'bg-white border-slate-200 text-purple-600 focus:ring-purple-100 focus:border-purple-400'
                              }`}
                            />
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className={`relative max-w-[120px] transition-all duration-500 ${isAnimating ? 'scale-105' : ''}`}>
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">R$</span>
                            <input 
                              type="number" 
                              value={cfg.valorDiaria}
                              onChange={(e) => updateField(branch, 'valorDiaria', parseFloat(e.target.value) || 0)}
                              className={`w-full border rounded-xl pl-8 pr-3 py-2 text-sm font-black outline-none focus:ring-4 transition-all shadow-sm ${
                                isAnimating ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-white border-slate-200 text-emerald-600 focus:ring-emerald-100 focus:border-emerald-400'
                              }`}
                            />
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button 
                            onClick={() => applyAutomaticSuggestion(branch, cfg.salarioBase)}
                            className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100 flex items-center gap-2 font-bold text-xs"
                            title="Recalcular parâmetros com base no Salário Base (220h)"
                          >
                            <Wand2 size={16} />
                            <span className="hidden xl:inline uppercase tracking-widest">Sugerir</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-12">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center gap-4 bg-slate-50/30">
              <div className="p-4 bg-emerald-100 text-emerald-600 rounded-3xl"><Wallet size={24} /></div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Projeção Financeira de Encargos</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Estimativa de custos baseada no volume de horas e diárias do período</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-5">Filial</th>
                    <th className="px-8 py-5 text-center">Horas Extras Acumuladas</th>
                    <th className="px-8 py-5 text-center">Adicional Noturno</th>
                    <th className="px-8 py-5 text-center">Qtd. Diárias</th>
                    <th className="px-8 py-5 text-center">Custo Total Diárias</th>
                    <th className="px-8 py-5 text-right">Custo Total Projetado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {financialResults.map(result => (
                    <tr key={result.filial} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-6">
                        <span className="font-black text-slate-800">{result.filial}</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-bold text-slate-700">{(result.he50 + result.he100).toFixed(1)}h</span>
                          <div className="flex gap-1 mt-1">
                             <div className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded font-bold">{result.he50.toFixed(1)}h (50%)</div>
                             <div className="px-1.5 py-0.5 bg-orange-50 text-orange-600 text-[10px] rounded font-bold">{result.he100.toFixed(1)}h (100%)</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-sm font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">{result.adNot.toFixed(1)}h</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-sm font-bold text-slate-600">{result.diarias} Diárias</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-sm font-black text-emerald-600">{formatCurrency(result.costDiarias)}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-lg font-black text-slate-900">{formatCurrency(result.totalCost)}</span>
                          <div className="w-32 bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div 
                              className="bg-blue-600 h-full rounded-full transition-all duration-1000" 
                              style={{ width: `${(result.totalCost / (totalGlobalCost || 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReport;
