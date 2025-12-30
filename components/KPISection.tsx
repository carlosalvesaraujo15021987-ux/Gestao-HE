
import React from 'react';
import { TrendingUp, Clock, AlertCircle, Calendar, Coins, Info, Calculator } from 'lucide-react';
import { formatCurrency } from '../utils/validators';

interface KPICardProps {
  label: string;
  value: string | number;
  icon: any;
  color: string;
  trend?: string;
  isPositive?: boolean;
  subtitle?: string;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, icon: Icon, color, trend, isPositive, subtitle }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1 relative group">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
        <Icon size={24} />
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {trend}
        </span>
      )}
    </div>
    <div className="space-y-1">
      <h3 className="text-slate-500 text-sm font-medium flex items-center gap-1.5">
        {label}
        {subtitle && (
          <div className="relative inline-block">
            <Info size={12} className="text-slate-300 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl font-bold uppercase tracking-wider">
              {subtitle}
            </div>
          </div>
        )}
      </h3>
      <p className="text-xl font-bold text-slate-800 tracking-tight">{value}</p>
    </div>
  </div>
);

const KPISection: React.FC<{ stats: any }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      <KPICard 
        label="Budget Operacional" 
        value={formatCurrency(stats.totalCost)} 
        icon={Coins} 
        color="bg-emerald-500" 
        subtitle={`HE: ${formatCurrency(stats.costHE)} | Diárias: ${formatCurrency(stats.costDiarias)}`}
      />
      <KPICard 
        label="Custo Total HE" 
        value={formatCurrency(stats.costOnlyHE)} 
        icon={Calculator} 
        color="bg-blue-600" 
        subtitle="Custo consolidado de HE 50% e 100%"
      />
      <KPICard 
        label="Total HE 50%" 
        value={`${stats.totalHE50.toFixed(1)}h`} 
        icon={Clock} 
        color="bg-blue-500" 
      />
      <KPICard 
        label="Total HE 100%" 
        value={`${stats.totalHE100.toFixed(1)}h`} 
        icon={TrendingUp} 
        color="bg-orange-500" 
      />
      <KPICard 
        label="Adicional Noturno" 
        value={`${stats.totalAdicional.toFixed(1)}h`} 
        icon={Clock} 
        color="bg-purple-500" 
      />
      <KPICard 
        label="Faltas Acumuladas" 
        value={stats.totalFaltas} 
        icon={AlertCircle} 
        color="bg-red-500" 
      />
    </div>
  );
};

export default KPISection;
