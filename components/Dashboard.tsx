
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  Area,
  AreaChart,
  ReferenceLine,
  Label
} from 'recharts';
import { 
  Filter, 
  Building2, 
  MapPin, 
  RotateCcw, 
  ChevronDown, 
  Truck, 
  Package, 
  Zap, 
  Globe, 
  Check,
  PieChart as PieIcon,
  Navigation,
  Box,
  FileText,
  Download,
  Image as ImageIcon,
  TrendingUp,
  Activity
} from 'lucide-react';
import { toPng } from 'html-to-image';
import KPISection from './KPISection';
import { LogisticsEntry, BranchFinancialConfig } from '../types';

interface DashboardProps {
  data: LogisticsEntry[];
  configs: BranchFinancialConfig[];
}

const COLORS = ['#3b82f6', '#f97316', '#a855f7', '#10b981', '#ef4444', '#6366f1', '#14b8a6', '#f43f5e', '#8b5cf6'];

const Dashboard: React.FC<DashboardProps> = ({ data, configs }) => {
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const companyRef = useRef<HTMLDivElement>(null);
  const branchRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (companyRef.current && !companyRef.current.contains(event.target as Node)) setIsCompanyOpen(false);
      if (branchRef.current && !branchRef.current.contains(event.target as Node)) setIsBranchOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedBranch('all');
  }, [selectedCompany]);

  const companies = useMemo(() => Array.from(new Set(data.map(d => d.empresa))).sort(), [data]);
  const branches = useMemo(() => {
    const filteredByCompany = selectedCompany === 'all' ? data : data.filter(d => d.empresa === selectedCompany);
    return Array.from(new Set(filteredByCompany.map(d => d.filial))).sort();
  }, [data, selectedCompany]);

  const filteredData = useMemo(() => {
    return data.filter(entry => {
      const matchCompany = selectedCompany === 'all' || entry.empresa === selectedCompany;
      const matchBranch = selectedBranch === 'all' || entry.filial === selectedBranch;
      return matchCompany && matchBranch;
    });
  }, [data, selectedCompany, selectedBranch]);

  const stats = useMemo(() => {
    const totalHE50 = filteredData.reduce((acc, curr) => acc + curr.he50, 0);
    const totalHE100 = filteredData.reduce((acc, curr) => acc + curr.he100, 0);
    const totalAdicional = filteredData.reduce((acc, curr) => acc + curr.adicionalNoturno, 0);
    const totalFaltas = filteredData.reduce((acc, curr) => acc + (curr.faltas || 0), 0);
    const totalDias = filteredData.reduce((acc, curr) => acc + curr.diasTrabalhados, 0);

    let costHE = 0;
    let costOnlyHE = 0;
    let costDiarias = 0;

    filteredData.forEach(curr => {
      const config = configs.find(c => c.filial === curr.filial);
      if (!config) return;

      const he50Cost = curr.he50 * config.valorHe50;
      const he100Cost = curr.he100 * config.valorHe100;
      const adNotCost = curr.adicionalNoturno * config.valorAdNot;

      costHE += he50Cost + he100Cost + adNotCost;
      costOnlyHE += he50Cost + he100Cost;
      
      if (curr.diariasMes > 100) {
        costDiarias += curr.diariasMes;
      } else {
        costDiarias += (curr.diariasMes * (config.valorDiaria || 0));
      }
    });

    const totalCost = costHE + costDiarias;

    const branchMap = new Map();
    filteredData.forEach(entry => {
      if (!branchMap.has(entry.filial)) branchMap.set(entry.filial, { name: entry.filial, he: 0, faltas: 0 });
      const branch = branchMap.get(entry.filial);
      branch.he += (entry.he50 + entry.he100);
      branch.faltas += entry.faltas;
    });

    const branchData = Array.from(branchMap.values()).sort((a, b) => b.he - a.he);
    const totalHEOverall = branchData.reduce((acc, curr) => acc + curr.he, 0);
    const averageHE = branchData.length > 0 ? totalHEOverall / branchData.length : 0;
    
    const branchDistributionData = branchData.map(b => ({
      name: b.name,
      value: totalHEOverall > 0 ? Number(((b.he / totalHEOverall) * 100).toFixed(1)) : 0
    })).filter(b => b.value > 0);

    const periodMap = new Map();
    filteredData.forEach(entry => {
      if (!periodMap.has(entry.periodo)) periodMap.set(entry.periodo, { periodo: entry.periodo, display: entry.periodo.split('-').reverse().join('/'), he: 0 });
      const p = periodMap.get(entry.periodo);
      p.he += (entry.he50 + entry.he100);
    });
    const periodData = Array.from(periodMap.values()).sort((a, b) => a.periodo.localeCompare(b.periodo));

    const pieData = [
      { name: 'HE 50%', value: totalHE50 },
      { name: 'HE 100%', value: totalHE100 },
      { name: 'Adic. Noturno', value: totalAdicional },
    ];

    return { 
      totalHE50, 
      totalHE100, 
      totalAdicional, 
      totalFaltas, 
      totalDias, 
      totalCost,
      costHE,
      costOnlyHE,
      costDiarias,
      branchData, 
      pieData, 
      periodData, 
      branchDistributionData,
      totalHEOverall,
      averageHE
    };
  }, [filteredData, configs]);

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportChartAsPng = async () => {
    if (chartRef.current === null) return;
    
    setIsExporting(true);
    try {
      const dataUrl = await toPng(chartRef.current, { cacheBust: true, backgroundColor: '#ffffff', padding: 20 });
      const link = document.createElement('a');
      link.download = `evolucao-jornada-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Erro ao exportar o gráfico:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const getCompanyConfig = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('log')) return { icon: <Package size={16} />, color: 'text-blue-500', bg: 'bg-blue-50' };
    if (lower.includes('trans')) return { icon: <Truck size={16} />, color: 'text-emerald-500', bg: 'bg-emerald-50' };
    if (lower.includes('exp')) return { icon: <Zap size={16} />, color: 'text-amber-500', bg: 'bg-amber-50' };
    return { icon: <Building2 size={16} />, color: 'text-slate-500', bg: 'bg-slate-50' };
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const totalHE = stats.totalHEOverall;
      return (
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200 p-5 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-200 min-w-[220px] z-[100]">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><Navigation size={14} /></div>
            <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">{label}</p>
          </div>
          <div className="space-y-3">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>{entry.name}</span>
                  <span className="text-blue-600 font-black">
                    {(totalHE > 0 ? ((entry.value / totalHE) * 100).toFixed(1) : "0.0")}% do total
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black bg-gradient-to-r from-blue-700 to-indigo-900 bg-clip-text text-transparent">
                    {entry.value.toFixed(1)}
                  </span>
                  <span className="text-sm font-bold text-slate-400">horas</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 printable-content">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .printable-content { padding: 0 !important; margin: 0 !important; background: white !important; }
          .bg-white { border: none !important; box-shadow: none !important; }
          .rounded-3xl, .rounded-2xl { border-radius: 0 !important; }
          body { background: white !important; }
        }
      `}</style>

      {/* Filters Bar */}
      <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center gap-4 no-print">
        <div className="flex items-center gap-2 text-slate-500 font-bold text-sm px-2 border-r border-slate-200 mr-2 shrink-0">
          <Filter size={18} />
          <span className="uppercase tracking-wider">Filtros</span>
        </div>

        <div className="flex-1 min-w-[200px] relative" ref={companyRef}>
          <button onClick={() => { setIsCompanyOpen(!isCompanyOpen); setIsBranchOpen(false); }} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 flex items-center justify-between hover:bg-slate-50 transition-all shadow-sm">
            <div className="flex items-center gap-3">
              <div className={selectedCompany === 'all' ? 'text-slate-400' : getCompanyConfig(selectedCompany).color}>
                {selectedCompany === 'all' ? <Building2 size={18} /> : getCompanyConfig(selectedCompany).icon}
              </div>
              <span className="truncate">{selectedCompany === 'all' ? 'Todas as Empresas' : selectedCompany}</span>
            </div>
            <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isCompanyOpen ? 'rotate-180' : ''}`} />
          </button>
          {isCompanyOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                <button onClick={() => { setSelectedCompany('all'); setIsCompanyOpen(false); }} className={`w-full px-4 py-3 text-sm flex items-center justify-between ${selectedCompany === 'all' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-3 font-bold"><Building2 size={16} /><span>Todas as Empresas</span></div>
                </button>
                {companies.map(company => (
                  <button key={company} onClick={() => { setSelectedCompany(company); setIsCompanyOpen(false); }} className={`w-full px-4 py-3 text-sm flex items-center justify-between ${selectedCompany === company ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-3 font-bold">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getCompanyConfig(company).bg}`}>{getCompanyConfig(company).icon}</div>
                      <span>{company}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-[200px] relative" ref={branchRef}>
          <button onClick={() => { setIsBranchOpen(!isBranchOpen); setIsCompanyOpen(false); }} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 flex items-center justify-between hover:bg-slate-50 transition-all shadow-sm">
            <div className="flex items-center gap-3">
              <div className="text-blue-500"><MapPin size={18} /></div>
              <span className="truncate">{selectedBranch === 'all' ? 'Todas as Filiais' : selectedBranch}</span>
            </div>
            <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isBranchOpen ? 'rotate-180' : ''}`} />
          </button>
          {isBranchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                <button onClick={() => { setSelectedBranch('all'); setIsBranchOpen(false); }} className={`w-full px-4 py-3 text-sm flex items-center justify-between ${selectedBranch === 'all' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-3 font-bold"><MapPin size={16} /><span>Todas as Filiais</span></div>
                </button>
                {branches.map(branch => (
                  <button key={branch} onClick={() => { setSelectedBranch(branch); setIsBranchOpen(false); }} className={`w-full px-4 py-3 text-sm flex items-center justify-between ${selectedBranch === branch ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-3 font-bold"><Navigation size={16} /><span>{branch}</span></div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={handleExportPDF}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-slate-200 group no-print shrink-0"
        >
          <FileText size={18} className="group-hover:scale-110 transition-transform" />
          <span>Exportar PDF</span>
        </button>

        {(selectedCompany !== 'all' || selectedBranch !== 'all') && (
          <button onClick={() => { setSelectedCompany('all'); setSelectedBranch('all'); }} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100 no-print">
            <RotateCcw size={20} />
          </button>
        )}
      </div>

      <div className="hidden print:block mb-8 text-center">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-widest">Relatório Analítico de Jornada</h1>
        <div className="mt-2 flex items-center justify-center gap-4 text-sm font-bold text-slate-500 uppercase tracking-wider">
           <span>Empresa: {selectedCompany === 'all' ? 'Consolidado' : selectedCompany}</span>
           <span>•</span>
           <span>Filial: {selectedBranch === 'all' ? 'Todas' : selectedBranch}</span>
        </div>
      </div>

      <KPISection stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div 
          ref={chartRef}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 lg:col-span-2 overflow-hidden relative break-inside-avoid"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><TrendingUp size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Evolução de Jornada</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Histórico Mensal de Horas Extras</p>
              </div>
            </div>
            <button 
              onClick={handleExportChartAsPng}
              disabled={isExporting}
              className="no-print p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all group flex items-center gap-2"
              title="Exportar Gráfico como PNG"
            >
              <ImageIcon size={18} className={isExporting ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
              <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">PNG</span>
            </button>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.periodData}>
                <defs>
                  <linearGradient id="colorHe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="display" fontSize={11} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 600}} dy={10} />
                <YAxis fontSize={11} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 600}} dx={-10} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="he" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorHe)" name="Total HE" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 break-inside-avoid relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100"><Activity size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Volume por Filial</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Comparativo de Produtividade</p>
              </div>
            </div>
            <div className="flex flex-col items-end no-print">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Média Operacional</span>
              <span className="text-sm font-black text-blue-600">{stats.averageHE.toFixed(1)}h</span>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.branchData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1e40af" />
                  </linearGradient>
                  <linearGradient id="barHoverGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  fontSize={10} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontWeight: 700}}
                  dy={10}
                />
                <YAxis 
                  fontSize={10} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontWeight: 600}} 
                  dx={-10}
                />
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{fill: '#f8fafc', radius: 12}}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle"
                  content={(props) => (
                    <div className="flex justify-end gap-4 mb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest no-print">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                        <span>Volume HE</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-0.5 bg-red-400 border-t border-dashed border-red-500" />
                        <span>Média</span>
                      </div>
                    </div>
                  )}
                />
                <ReferenceLine 
                  y={stats.averageHE} 
                  stroke="#f87171" 
                  strokeDasharray="5 5" 
                  strokeWidth={2}
                >
                  <Label 
                    value="MÉDIA" 
                    position="right" 
                    fill="#ef4444" 
                    fontSize={10} 
                    fontWeight={900} 
                    className="no-print"
                  />
                </ReferenceLine>
                <Bar 
                  dataKey="he" 
                  fill="url(#barGradient)" 
                  activeBar={{ fill: 'url(#barHoverGradient)', stroke: '#3b82f6', strokeWidth: 2 }}
                  radius={[12, 12, 4, 4]} 
                  barSize={36} 
                  name="Horas Extras" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 break-inside-avoid">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><PieIcon size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Distribuição de Encargos</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Composição da Folha de Jornada</p>
              </div>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={stats.pieData} 
                  cx="50%" 
                  cy="45%" 
                  innerRadius={80} 
                  outerRadius={110} 
                  paddingAngle={8} 
                  dataKey="value" 
                  stroke="none"
                  animationBegin={200}
                  animationDuration={1500}
                >
                  {stats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={60} 
                  content={(props) => (
                    <div className="flex flex-wrap justify-center gap-4 mt-8 no-print">
                      {props.payload?.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl transition-all hover:border-slate-300 group">
                          <div className="w-2.5 h-2.5 rounded-full shadow-sm group-hover:scale-125 transition-transform" style={{ backgroundColor: entry.color }} />
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">{entry.value}</span>
                            <span className="text-xs font-black text-slate-700">{stats.pieData[index].value.toFixed(1)}h</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
