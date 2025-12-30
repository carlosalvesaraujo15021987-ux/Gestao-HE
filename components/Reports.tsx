
import React, { useMemo, useState } from 'react';
import { Download, FileText, FileSpreadsheet, Printer, ListChecks, Copy, Check, Settings2, Eye, EyeOff, LayoutPanelLeft } from 'lucide-react';
import { LogisticsEntry } from '../types';
import { formatCurrency, formatHours } from '../utils/validators';

interface ReportsProps {
  data: LogisticsEntry[];
}

const Reports: React.FC<ReportsProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  
  // Available columns for customization
  const allColumns = [
    { id: 'nome', label: 'Nome', default: true },
    { id: 'empresa', label: 'Empresa', default: true },
    { id: 'filial', label: 'Filial', default: true },
    { id: 'cpf', label: 'CPF', default: false },
    { id: 'diasTrabalhados', label: 'Dias Trab.', default: true },
    { id: 'adiantamento', label: 'Adiantamento', default: true },
    { id: 'diariasMes', label: 'Diárias Mês', default: true },
    { id: 'he50', label: 'HE 50%', default: true },
    { id: 'he100', label: 'HE 100%', default: true },
    { id: 'adicionalNoturno', label: 'Adic. Noturno', default: true },
    { id: 'faltas', label: 'Faltas', default: false },
  ];

  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    allColumns.filter(c => c.default).map(c => c.id)
  );

  const totals = useMemo(() => {
    return data.reduce((acc, curr) => ({
      he50: acc.he50 + curr.he50,
      he100: acc.he100 + curr.he100,
      adNot: acc.adNot + curr.adicionalNoturno,
      faltas: acc.faltas + (curr.faltas || 0),
      adiantamento: acc.adiantamento + (curr.adiantamento || 0),
      diarias: acc.diarias + (curr.diariasMes || 0),
      colaboradores: acc.colaboradores + 1
    }), { he50: 0, he100: 0, adNot: 0, faltas: 0, adiantamento: 0, diarias: 0, colaboradores: 0 });
  }, [data]);

  const copySummaryToClipboard = () => {
    const text = `Resumo Mensal - ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
Colaboradores: ${totals.colaboradores} | Total HE: ${formatHours(totals.he50 + totals.he100)} | Adic. Noturno: ${formatHours(totals.adNot)} | Adiantamentos: ${formatCurrency(totals.adiantamento)} | Diárias: ${totals.diarias}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleColumn = (id: string) => {
    setSelectedColumns(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const exportCSV = () => {
    const headers = "Nome;Empresa;Filial;CPF;Dias;Adiantamento;Diarias;HE50;HE100;Adic.Noturno;Faltas\n";
    const csvContent = data.map(d => 
      `${d.nome};${d.empresa};${d.filial};${d.cpf};${d.diasTrabalhados};${d.adiantamento};${d.diariasMes};${d.he50};${d.he100};${d.adicionalNoturno};${d.faltas}`
    ).join('\n');
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_logistica_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const ReportCard = ({ title, description, icon: Icon, onClick, color }: any) => (
    <button 
      onClick={onClick}
      className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-left flex flex-col items-start gap-4 group"
    >
      <div className={`p-4 rounded-2xl ${color} group-hover:scale-110 transition-transform shadow-lg`}>
        <Icon size={28} className="text-white" />
      </div>
      <div>
        <h4 className="font-bold text-xl text-slate-800 mb-1">{title}</h4>
        <p className="text-slate-500 text-sm">{description}</p>
      </div>
      <div className="mt-4 flex items-center gap-2 text-blue-600 font-semibold text-sm">
        <Download size={16} />
        <span>Gerar / Baixar</span>
      </div>
    </button>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .custom-report-table { width: 100% !important; border-collapse: collapse !important; }
          .custom-report-table th, .custom-report-table td { padding: 4px 6px !important; border: 1px solid #e2e8f0 !important; font-size: 8px !important; }
        }
        .print-only { display: none; }
      `}</style>

      {/* Resumo Mensal Consolidado (Single Line View) */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform -mr-4 -mt-4">
          <ListChecks size={120} />
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
              <ListChecks size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Resumo Mensal Consolidado</h3>
              <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">Visão agregada de performance do período</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 lg:gap-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Colaboradores</span>
              <span className="text-lg font-black text-slate-800">{totals.colaboradores}</span>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Total HE (50%+100%)</span>
              <span className="text-lg font-black text-blue-600">{formatHours(totals.he50 + totals.he100)}</span>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Adiantamentos</span>
              <span className="text-lg font-black text-emerald-600">{formatCurrency(totals.adiantamento)}</span>
            </div>
          </div>

          <button 
            onClick={copySummaryToClipboard}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs transition-all ${
              copied ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-black'
            }`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'COPIADO!' : 'COPIAR RESUMO'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCard 
          title="Relatório PDF Geral" 
          description="Documento completo com todos os KPIs, gráficos e análises gerenciais por filial."
          icon={FileText}
          color="bg-red-500"
          onClick={handlePrint}
        />
        <ReportCard 
          title="Exportar Excel/CSV" 
          description="Planilha detalhada com os dados brutos de todos os motoristas para conciliação."
          icon={FileSpreadsheet}
          color="bg-emerald-500"
          onClick={exportCSV}
        />
        <ReportCard 
          title="Impressão Rápida" 
          description="Versão otimizada para impressão física e apresentação em reuniões."
          icon={Printer}
          color="bg-blue-500"
          onClick={handlePrint}
        />
      </div>

      {/* Custom Report Builder */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden no-print">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg"><Settings2 size={24} /></div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Personalizar Relatório Detalhado</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Selecione as colunas que deseja exibir no PDF customizado</p>
            </div>
          </div>
          <button 
            onClick={() => setShowCustomizer(!showCustomizer)}
            className="text-sm font-bold text-blue-600 flex items-center gap-2 px-4 py-2 hover:bg-blue-50 rounded-xl transition-all"
          >
            <LayoutPanelLeft size={18} />
            {showCustomizer ? 'OCULTAR OPÇÕES' : 'VER CONFIGURAÇÕES'}
          </button>
        </div>

        {showCustomizer && (
          <div className="p-8 animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
              {allColumns.map(col => (
                <button
                  key={col.id}
                  onClick={() => toggleColumn(col.id)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                    selectedColumns.includes(col.id) 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-slate-100 bg-slate-50 text-slate-400'
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider">{col.label}</span>
                  {selectedColumns.includes(col.id) ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setSelectedColumns(allColumns.map(c => c.id))}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest"
              >
                Selecionar Todas
              </button>
              <button 
                onClick={() => setSelectedColumns(['nome'])}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest"
              >
                Limpar Seleção
              </button>
              <button 
                onClick={handlePrint}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
              >
                <Printer size={16} /> GERAR PDF CUSTOMIZADO
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Section & Custom Report Target */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8">
        <div className="flex items-center justify-between mb-8 no-print">
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Preview do Relatório</h3>
          <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">Estrutura de Colunas Atual</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse custom-report-table">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest no-print">
              <tr>
                {allColumns.filter(c => selectedColumns.includes(c.id)).map(col => (
                  <th key={col.id} className="px-6 py-4">{col.label}</th>
                ))}
              </tr>
            </thead>
            {/* Print-only header for formal report */}
            <thead className="print-only">
              <tr className="bg-slate-100">
                <th colSpan={selectedColumns.length} className="text-center py-4">
                   <h2 className="text-xl font-black text-slate-900 uppercase">Relatório Personalizado de Jornada - LogiPro</h2>
                   <p className="text-xs font-bold text-slate-500 mt-1">EMISSÃO: {new Date().toLocaleString('pt-BR')}</p>
                </th>
              </tr>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {allColumns.filter(c => selectedColumns.includes(c.id)).map(col => (
                  <th key={col.id} className="px-6 py-4 border border-slate-200">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                  {selectedColumns.includes('nome') && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-400 no-print">
                          {d.nome.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800 text-xs">{d.nome}</span>
                      </div>
                    </td>
                  )}
                  {selectedColumns.includes('empresa') && <td className="px-6 py-4 text-xs font-medium text-slate-500">{d.empresa}</td>}
                  {selectedColumns.includes('filial') && <td className="px-6 py-4 text-xs font-bold text-blue-600">{d.filial}</td>}
                  {selectedColumns.includes('cpf') && <td className="px-6 py-4 text-xs font-mono text-slate-400">{d.cpf}</td>}
                  {selectedColumns.includes('diasTrabalhados') && <td className="px-6 py-4 text-xs text-center font-bold text-slate-600">{d.diasTrabalhados}</td>}
                  {selectedColumns.includes('adiantamento') && <td className="px-6 py-4 text-xs text-center font-bold text-emerald-600">{formatCurrency(d.adiantamento)}</td>}
                  {selectedColumns.includes('diariasMes') && <td className="px-6 py-4 text-xs text-center font-bold text-slate-600">{d.diariasMes}</td>}
                  {selectedColumns.includes('he50') && <td className="px-6 py-4 text-xs text-center font-bold text-slate-600">{formatHours(d.he50)}</td>}
                  {selectedColumns.includes('he100') && <td className="px-6 py-4 text-xs text-center font-bold text-slate-600">{formatHours(d.he100)}</td>}
                  {selectedColumns.includes('adicionalNoturno') && <td className="px-6 py-4 text-xs text-center font-bold text-purple-600">{formatHours(d.adicionalNoturno)}</td>}
                  {selectedColumns.includes('faltas') && <td className="px-6 py-4 text-xs text-center font-bold text-red-500">{d.faltas}</td>}
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={selectedColumns.length} className="py-20 text-center">
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Nenhum dado disponível</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
