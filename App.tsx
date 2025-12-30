
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  Trophy, 
  FileUp, 
  FileText, 
  Settings, 
  Menu, 
  X,
  Truck,
  BrainCircuit,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Image as ImageIcon,
  Trash2,
  Upload,
  Coins
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Ranking from './components/Ranking';
import ImportData from './components/ImportData';
import Reports from './components/Reports';
import AIAnalyst from './components/AIAnalyst';
import AuditView from './components/AuditView';
import FinancialReport from './components/FinancialReport';
import { LogisticsEntry, ViewType, BranchFinancialConfig } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [data, setData] = useState<LogisticsEntry[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [financialConfigs, setFinancialConfigs] = useState<BranchFinancialConfig[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('logistics_data');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading data", e);
      }
    }
    const savedLogo = localStorage.getItem('custom_logo');
    if (savedLogo) setCustomLogo(savedLogo);

    const savedConfigs = localStorage.getItem('financial_configs');
    if (savedConfigs) setFinancialConfigs(JSON.parse(savedConfigs));
  }, []);

  const handleDataUpdate = (newData: LogisticsEntry[]) => {
    setData(newData);
    localStorage.setItem('logistics_data', JSON.stringify(newData));
    setActiveView('dashboard');
  };

  const handleConfigsUpdate = (configs: BranchFinancialConfig[]) => {
    setFinancialConfigs(configs);
    localStorage.setItem('financial_configs', JSON.stringify(configs));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCustomLogo(base64);
        localStorage.setItem('custom_logo', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setCustomLogo(null);
    localStorage.removeItem('custom_logo');
  };

  const availablePeriods = useMemo(() => {
    const periods = Array.from(new Set(data.map(d => d.periodo))).sort().reverse();
    return periods;
  }, [data]);

  const filteredData = useMemo(() => {
    if (selectedPeriod === 'all') return data;
    return data.filter(d => d.periodo === selectedPeriod);
  }, [data, selectedPeriod]);

  const NavItem = ({ view, icon: Icon, label }: { view: ViewType, icon: any, label: string }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        activeView === view 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <Icon size={20} />
      <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'w-auto opacity-100 ml-0' : 'w-0 opacity-0 -ml-4 md:hidden'}`}>
        {label}
      </span>
      {activeView === view && isSidebarOpen && <ChevronRight size={16} className="ml-auto" />}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } hidden md:flex flex-col`}
      >
        <div className="p-6 flex items-center gap-3 border-b border-slate-100 overflow-hidden">
          {customLogo ? (
            <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-white flex items-center justify-center">
              <img src={customLogo} alt="Custom Logo" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-100 shrink-0">
              <Truck size={24} />
            </div>
          )}
          {isSidebarOpen && <span className="font-bold text-xl text-slate-800 tracking-tight truncate">LogiPro</span>}
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="financial" icon={Coins} label="Custos Operacionais" />
          <NavItem view="audit" icon={ShieldCheck} label="Auditoria" />
          <NavItem view="ranking" icon={Trophy} label="Ranking HE" />
          <NavItem view="reports" icon={FileText} label="Relatórios" />
          <NavItem view="ai-analyst" icon={BrainCircuit} label="Analista IA" />
          <div className="pt-4 mt-4 border-t border-slate-100">
            <NavItem view="import" icon={FileUp} label="Importar Dados" />
            <NavItem view="settings" icon={Settings} label="Configurações" />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:text-red-600 transition-colors group">
            <LogOut size={20} className="group-hover:rotate-180 transition-transform duration-300" />
            {isSidebarOpen && <span className="font-medium">Sair</span>}
          </button>
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-xl font-bold text-slate-800">
              {activeView === 'dashboard' && 'Visão Geral Logística'}
              {activeView === 'financial' && 'Relatório Financeiro de Jornada'}
              {activeView === 'audit' && 'Compliance e Auditoria'}
              {activeView === 'ranking' && 'Performance de Jornada'}
              {activeView === 'import' && 'Gestão de Insumos'}
              {activeView === 'reports' && 'Inteligência de Dados'}
              {activeView === 'ai-analyst' && 'Gemini AI Advisor'}
              {activeView === 'settings' && 'Configurações do Sistema'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {data.length > 0 && availablePeriods.length > 0 && activeView !== 'import' && (
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                <Calendar size={16} className="text-slate-500 ml-2" />
                <select 
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-slate-700 outline-none pr-2 cursor-pointer"
                >
                  <option value="all">Todos os Períodos</option>
                  {availablePeriods.map(p => (
                    <option key={p} value={p}>{p.split('-').reverse().join('/')}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold border-2 border-white shadow-md">
              OP
            </div>
          </div>
        </header>

        <div className="p-6 pb-24 md:pb-6">
          <div className="max-w-7xl mx-auto">
            {activeView === 'dashboard' && <Dashboard data={filteredData} configs={financialConfigs} />}
            {activeView === 'financial' && <FinancialReport data={filteredData} configs={financialConfigs} onConfigsUpdate={handleConfigsUpdate} />}
            {activeView === 'audit' && <AuditView data={filteredData} />}
            {activeView === 'ranking' && <Ranking data={filteredData} />}
            {activeView === 'import' && <ImportData onDataLoaded={handleDataUpdate} existingData={data} />}
            {activeView === 'reports' && <Reports data={filteredData} />}
            {activeView === 'ai-analyst' && <AIAnalyst data={filteredData} />}
            {activeView === 'settings' && (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col items-center gap-6 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div className="w-24 h-24 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                    {customLogo ? (
                      <>
                        <img src={customLogo} alt="Preview" className="w-full h-full object-contain p-2" />
                        <button onClick={removeLogo} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={24} />
                        </button>
                      </>
                    ) : (
                      <ImageIcon size={32} className="text-slate-300" />
                    )}
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-bold text-slate-800">Logotipo da Empresa</h3>
                    <p className="text-xs text-slate-500">Personalize o sistema com a marca da sua transportadora.</p>
                  </div>
                  <label className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer hover:bg-blue-700 transition-all flex items-center gap-2">
                    <Upload size={16} /> Fazer Upload
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
