
import React, { useMemo } from 'react';
import { ShieldAlert, AlertCircle, CheckCircle2, Info, ArrowUpRight } from 'lucide-react';
import { LogisticsEntry } from '../types';
import { validateCPF, formatHours } from '../utils/validators';

const AuditView: React.FC<{ data: LogisticsEntry[] }> = ({ data }) => {
  const compliance = useMemo(() => {
    const alerts = {
      excessiveHE: [] as LogisticsEntry[],
      invalidCPF: [] as LogisticsEntry[],
      highAbsenteism: [] as LogisticsEntry[],
    };

    data.forEach(entry => {
      // Thresholds for audit
      if (entry.he50 + entry.he100 > 60) alerts.excessiveHE.push(entry);
      if (!validateCPF(entry.cpf)) alerts.invalidCPF.push(entry);
      if (entry.faltas >= 3) alerts.highAbsenteism.push(entry);
    });

    return alerts;
  }, [data]);

  const AuditCard = ({ title, count, description, status, icon: Icon }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${status === 'critical' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
          <Icon size={24} />
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${status === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
          {status === 'critical' ? 'Risco Alto' : 'Atenção'}
        </span>
      </div>
      <h4 className="text-2xl font-bold text-slate-800 mb-1">{count} Ocorrências</h4>
      <p className="text-sm font-semibold text-slate-700 mb-2">{title}</p>
      <p className="text-xs text-slate-500 mb-4">{description}</p>
      <div className="w-full bg-slate-50 rounded-lg p-2 flex items-center justify-between text-xs font-medium text-slate-600">
        <span>Impacto Financeiro</span>
        <span className="text-red-600">Estimado Alto</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AuditCard 
          title="Excesso de Horas Extras" 
          count={compliance.excessiveHE.length}
          description="Motoristas com mais de 60h extras no mês, ultrapassando limites de segurança."
          status="critical"
          icon={ShieldAlert}
        />
        <AuditCard 
          title="Inconsistências Cadastrais" 
          count={compliance.invalidCPF.length}
          description="CPFs inválidos ou mal formatados detectados na última importação."
          status="warning"
          icon={AlertCircle}
        />
        <AuditCard 
          title="Absenteísmo Crítico" 
          count={compliance.highAbsenteism.length}
          description="Colaboradores com 3 ou mais faltas injustificadas no período."
          status="warning"
          icon={Info}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Detalhamento de Riscos Trabalhistas</h3>
          <button className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:underline">
            Exportar para Jurídico <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Motorista / Filial</th>
                <th className="px-6 py-4">Total HE</th>
                <th className="px-6 py-4">Status CPF</th>
                <th className="px-6 py-4">Risco Estimado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {compliance.excessiveHE.slice(0, 10).map(driver => (
                <tr key={driver.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{driver.nome}</span>
                      <span className="text-xs text-slate-400">{driver.filial}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-red-600">{formatHours(driver.he50 + driver.he100)}</span>
                  </td>
                  <td className="px-6 py-4">
                    {validateCPF(driver.cpf) ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold">
                        <CheckCircle2 size={14} /> Válido
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600 text-xs font-bold">
                        <AlertCircle size={14} /> Inválido
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full" style={{ width: '85%' }}></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditView;
