
import React, { useState, useEffect } from 'react';
import { Upload, FileCheck, AlertTriangle, Loader2, Info, CheckCircle2, Files, Trash2, Calendar, XCircle, AlertOctagon } from 'lucide-react';
import { LogisticsEntry } from '../types';
import { validateCPF, parseNum } from '../utils/validators';

interface ImportDataProps {
  onDataLoaded: (data: LogisticsEntry[]) => void;
  existingData: LogisticsEntry[];
}

const ImportData: React.FC<ImportDataProps> = ({ onDataLoaded, existingData }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [importSummary, setImportSummary] = useState<{ new: number; duplicates: number } | null>(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  
  // Período de referência
  const [referencePeriod, setReferencePeriod] = useState<string>(
    new Date().toISOString().substring(0, 7) // Padrão: mês atual
  );

  // Resetar estado de confirmação após 5 segundos
  useEffect(() => {
    let timer: number;
    if (isConfirmingClear) {
      timer = window.setTimeout(() => setIsConfirmingClear(false), 5000);
    }
    return () => clearTimeout(timer);
  }, [isConfirmingClear]);

  const processText = (text: string, currentBatch: LogisticsEntry[]) => {
    try {
      const lines = text.split('\n');
      const results: LogisticsEntry[] = [];
      const errors: string[] = [];
      
      const firstLine = lines[0];
      const separator = firstLine.includes(';') ? ';' : ',';

      const existingKeys = new Set(existingData.map(d => `${d.cpf}-${d.nome.toLowerCase()}-${d.periodo}`));
      const currentBatchKeys = new Set(currentBatch.map(d => `${d.cpf}-${d.nome.toLowerCase()}-${d.periodo}`));

      let duplicatesCount = 0;
      let newCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const columns = line.split(separator).map(c => c.replace(/"/g, '').trim());
        
        if (columns.length >= 7) {
          const entry: LogisticsEntry = {
            id: Math.random().toString(36).substr(2, 9),
            nome: columns[0] || 'Desconhecido',
            adiantamento: parseNum(columns[1]),
            diariasMes: parseNum(columns[2]),
            filial: columns[3] || 'Matriz',
            empresa: columns[4] || 'Empresa',
            cpf: columns[5] || '',
            diasTrabalhados: parseInt(columns[6]) || 0,
            he50: parseNum(columns[7]),
            he100: parseNum(columns[8]),
            adicionalNoturno: parseNum(columns[9]),
            faltas: parseInt(columns[10]) || 0,
            periodo: referencePeriod 
          };

          const entryKey = `${entry.cpf}-${entry.nome.toLowerCase()}-${entry.periodo}`;

          if (existingKeys.has(entryKey) || currentBatchKeys.has(entryKey)) {
            duplicatesCount++;
            continue;
          }

          if (!validateCPF(entry.cpf)) {
            errors.push(`CPF inválido para ${entry.nome}`);
          }

          results.push(entry);
          currentBatchKeys.add(entryKey);
          newCount++;
        }
      }

      return { results, errors, newCount, duplicatesCount };
    } catch (e) {
      console.error(e);
      throw new Error("Falha ao processar o conteúdo do arquivo.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let files: FileList | null = null;
    if ('files' in e.target) {
      files = (e.target as HTMLInputElement).files;
    } else if ('dataTransfer' in e) {
      files = (e as React.DragEvent).dataTransfer.files;
    }

    if (!files || files.length === 0) return;
    
    setLoading(true);
    setError(null);
    setValidationErrors([]);
    setImportSummary(null);

    const allNewEntries: LogisticsEntry[] = [...existingData];
    let totalDuplicates = 0;
    let totalNew = 0;
    let combinedErrors: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const text = await file.text();
        const { results, errors, newCount, duplicatesCount } = processText(text, allNewEntries);
        
        allNewEntries.push(...results);
        totalNew += newCount;
        totalDuplicates += duplicatesCount;
        combinedErrors = [...combinedErrors, ...errors];
      }

      if (totalNew === 0 && totalDuplicates > 0) {
        setError(`Nenhum registro novo encontrado para o período ${referencePeriod.split('-').reverse().join('/')}.`);
      } else if (totalNew === 0) {
        setError("Nenhum dado válido encontrado nos arquivos selecionados.");
      } else {
        setValidationErrors(combinedErrors);
        setImportSummary({ new: totalNew, duplicates: totalDuplicates });
        onDataLoaded(allNewEntries);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao processar arquivos.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = () => {
    if (!isConfirmingClear) {
      setIsConfirmingClear(true);
      return;
    }
    
    // Execução da limpeza
    onDataLoaded([]);
    setImportSummary(null);
    setValidationErrors([]);
    setIsConfirmingClear(false);
    
    // Notificação visual de sucesso
    const notification = document.createElement('div');
    notification.className = 'fixed top-8 right-8 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl z-[100] animate-in slide-in-from-top-4 flex items-center gap-3 font-bold border border-white/10';
    notification.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg> Base de Dados Limpa com Sucesso!`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Central de Importação</h2>
        {existingData.length > 0 && (
          <div className="flex items-center gap-2">
            {isConfirmingClear && (
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse">
                Clique novamente para confirmar
              </span>
            )}
            <button 
              onClick={handleClearData}
              className={`flex items-center gap-2 font-bold text-sm transition-all px-4 py-2 rounded-xl ${
                isConfirmingClear 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-200 scale-105' 
                  : 'text-red-500 hover:bg-red-50'
              }`}
            >
              {isConfirmingClear ? <AlertOctagon size={16} /> : <Trash2 size={16} />}
              {isConfirmingClear ? 'CONFIRMAR LIMPEZA' : 'Limpar Base de Dados'}
            </button>
            {isConfirmingClear && (
              <button 
                onClick={() => setIsConfirmingClear(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                title="Cancelar"
              >
                <XCircle size={18} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="mb-8 flex flex-col md:flex-row items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex-1 space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={18} className="text-blue-600" />
              Período de Competência
            </h4>
            <p className="text-xs text-slate-500">Selecione o mês/ano de referência para os arquivos que deseja importar.</p>
          </div>
          <input 
            type="month" 
            value={referencePeriod}
            onChange={(e) => setReferencePeriod(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
          />
        </div>

        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileUpload(e);
          }}
          className={`border-2 border-dashed rounded-3xl p-12 transition-all cursor-pointer ${
            isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-slate-200 hover:border-blue-400'
          }`}
        >
          {loading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
              <p className="text-slate-600 font-medium">Processando planilhas de {referencePeriod.split('-').reverse().join('/')}...</p>
            </div>
          ) : (
            <>
              <div className="bg-blue-100 text-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Files size={36} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Upload de Arquivos</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                Arraste seus CSVs para o período selecionado acima. Duplicatas no mesmo período serão filtradas.
              </p>
              
              <label className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all cursor-pointer inline-flex items-center gap-2">
                Selecionar Arquivos
                <input type="file" className="hidden" accept=".csv" multiple onChange={handleFileUpload} />
              </label>
            </>
          )}
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 justify-center border border-red-100 animate-in slide-in-from-top-2">
            <AlertTriangle size={20} />
            <span className="font-bold">{error}</span>
          </div>
        )}

        {importSummary && (
          <div className="mt-6 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-left animate-in slide-in-from-bottom-2">
            <h4 className="text-emerald-800 font-bold mb-3 flex items-center gap-2">
              <CheckCircle2 size={18} /> Resumo da Competência: {referencePeriod.split('-').reverse().join('/')}
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm">
                <p className="text-xs text-emerald-600 font-bold uppercase">Novos Registros</p>
                <p className="text-2xl font-black text-emerald-800">{importSummary.new}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-400 font-bold uppercase">Já Existentes</p>
                <p className="text-2xl font-black text-slate-400">{importSummary.duplicates}</p>
              </div>
            </div>
          </div>
        )}

        {validationErrors.length > 0 && (
          <div className="mt-6 p-6 bg-amber-50 rounded-2xl border border-amber-100 text-left">
            <h4 className="text-amber-800 font-bold mb-3 flex items-center gap-2">
              <AlertTriangle size={18} /> Alertas de Validação ({validationErrors.length})
            </h4>
            <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1">
              {validationErrors.map((err, idx) => (
                <p key={idx} className="text-xs text-amber-700 font-medium">• {err}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800 p-6 rounded-2xl text-white">
          <div className="flex items-center gap-3 mb-4">
            <Info className="text-blue-400" size={24} />
            <h4 className="font-bold">Diferenciação por Período</h4>
          </div>
          <p className="text-slate-300 text-sm mb-4">
            O sistema agora suporta análises históricas. Cada importação é vinculada a um mês/ano específico.
          </p>
          <ul className="text-slate-300 text-sm space-y-2 list-disc list-inside">
            <li>Você pode ter o mesmo motorista em períodos diferentes.</li>
            <li>O Dashboard permite filtrar por estes períodos.</li>
            <li>Ideal para acompanhamento de evolução de horas extras.</li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h4 className="font-bold text-slate-800 mb-2">Instruções Técnicas</h4>
          <p className="text-xs text-slate-500 mb-4">Certifique-se de que a data selecionada no formulário corresponde aos dados do arquivo.</p>
          <code className="text-[10px] bg-slate-50 p-2 block rounded border font-mono break-all text-slate-600">
            NOME;ADIANTAMENTO;DIARIAS;FILIAL;EMPRESA;CPF;DIAS;HE50;HE100;ADICIONAL;FALTAS
          </code>
        </div>
      </div>
    </div>
  );
};

export default ImportData;
