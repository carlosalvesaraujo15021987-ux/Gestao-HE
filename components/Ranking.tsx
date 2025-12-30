
import React, { useMemo } from 'react';
import { Trophy, Medal, User, MapPin, Clock, Crown, Star } from 'lucide-react';
import { LogisticsEntry } from '../types';

const Ranking: React.FC<{ data: LogisticsEntry[] }> = ({ data }) => {
  const ranking = useMemo(() => {
    return data
      .map(d => ({
        ...d,
        totalHE: d.he50 + d.he100
      }))
      .sort((a, b) => b.totalHE - a.totalHE)
      .slice(0, 20);
  }, [data]);

  const topThree = ranking.slice(0, 3);
  const theRest = ranking.slice(3);

  const PodiumCard = ({ driver, position }: { driver: any, position: number }) => {
    const configs = [
      { 
        bg: 'bg-gradient-to-b from-yellow-400 to-amber-600', 
        shadow: 'shadow-yellow-200', 
        border: 'border-yellow-200',
        text: 'text-amber-900',
        icon: <Crown className="text-white fill-white" size={32} />,
        label: '1º Lugar',
        size: 'h-72 scale-110 z-10'
      },
      { 
        bg: 'bg-gradient-to-b from-slate-300 to-slate-500', 
        shadow: 'shadow-slate-200', 
        border: 'border-slate-200',
        text: 'text-slate-900',
        icon: <Medal className="text-white fill-white" size={28} />,
        label: '2º Lugar',
        size: 'h-64'
      },
      { 
        bg: 'bg-gradient-to-b from-amber-600 to-amber-800', 
        shadow: 'shadow-amber-200', 
        border: 'border-amber-700',
        text: 'text-amber-50',
        icon: <Star className="text-white fill-white" size={24} />,
        label: '3º Lugar',
        size: 'h-60'
      }
    ];

    const config = configs[position - 1];

    return (
      <div className={`flex-1 flex flex-col items-center justify-end transition-all duration-500 hover:-translate-y-2 ${config.size}`}>
        <div className={`w-full ${config.bg} rounded-t-3xl p-6 flex flex-col items-center text-center shadow-2xl ${config.shadow} border-t-4 ${config.border} relative group`}>
          <div className="absolute -top-8 bg-white p-3 rounded-full shadow-lg border-2 border-slate-50 group-hover:scale-110 transition-transform">
             <div className={`p-2 rounded-full ${config.bg}`}>
                {config.icon}
             </div>
          </div>
          
          <div className="mt-6 space-y-1">
            <span className={`text-[10px] font-black uppercase tracking-widest opacity-80 ${config.text}`}>
              {config.label}
            </span>
            <h4 className={`text-lg font-black truncate max-w-[150px] ${config.text}`}>
              {driver.nome.split(' ')[0]}
            </h4>
            <div className="flex items-center justify-center gap-1 opacity-80">
              <MapPin size={12} className={config.text} />
              <span className={`text-[10px] font-bold ${config.text}`}>{driver.filial}</span>
            </div>
          </div>

          <div className="mt-4 bg-white/20 backdrop-blur-md rounded-2xl px-4 py-2 w-full">
            <p className={`text-xs font-bold ${config.text} opacity-70`}>Total HE</p>
            <p className={`text-xl font-black ${config.text}`}>{driver.totalHE.toFixed(1)}h</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
      {/* Visual Podium for Top 3 */}
      {ranking.length >= 3 && (
        <div className="pt-10 pb-4 hidden md:flex items-end gap-4 max-w-3xl mx-auto px-4">
          <PodiumCard driver={ranking[1]} position={2} />
          <PodiumCard driver={ranking[0]} position={1} />
          <PodiumCard driver={ranking[2]} position={3} />
        </div>
      )}

      {/* List / Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-100">
              <Trophy size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Classificação Geral</h3>
              <p className="text-xs text-slate-500 font-medium">Análise baseada no volume total de horas extras</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-slate-800">{data.length}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Motoristas</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-5">Posição</th>
                <th className="px-6 py-5">Motorista</th>
                <th className="px-6 py-5">Filial</th>
                <th className="px-6 py-5 text-center">HE 50%</th>
                <th className="px-6 py-5 text-center">HE 100%</th>
                <th className="px-6 py-5 text-right">Total HE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {ranking.map((driver, index) => {
                const isTopThree = index < 3;
                const rowColors = [
                  'bg-yellow-50/30 hover:bg-yellow-50/50',
                  'bg-slate-50/30 hover:bg-slate-50/50',
                  'bg-amber-50/30 hover:bg-amber-50/50'
                ];

                return (
                  <tr key={driver.id} className={`transition-colors ${isTopThree ? rowColors[index] : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900 ring-4 ring-yellow-100' :
                          index === 1 ? 'bg-slate-300 text-slate-800 ring-4 ring-slate-100' :
                          index === 2 ? 'bg-amber-600 text-amber-50 ring-4 ring-amber-100' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {index + 1}
                        </div>
                        {index === 0 && <Crown className="text-yellow-500 animate-pulse" size={16} />}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 ${
                          isTopThree ? 'bg-white border-white shadow-sm' : 'bg-slate-100 border-slate-50 text-slate-400'
                        }`}>
                          <User size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-bold ${isTopThree ? 'text-slate-900' : 'text-slate-700'}`}>{driver.nome}</span>
                          <span className="text-[10px] text-slate-400 font-medium">CPF: {driver.cpf}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin size={14} className="opacity-50" />
                        <span className="text-sm font-semibold">{driver.filial}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                       <span className="text-sm font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">{driver.he50.toFixed(1)}h</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                       <span className="text-sm font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">{driver.he100.toFixed(1)}h</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Clock size={16} className={isTopThree ? 'text-blue-500' : 'text-slate-300'} />
                        <span className={`text-lg font-black ${isTopThree ? 'text-blue-600' : 'text-slate-800'}`}>
                          {driver.totalHE.toFixed(1)}h
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Ranking;
