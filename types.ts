
export interface LogisticsEntry {
  id: string;
  nome: string;
  adiantamento: number;
  diariasMes: number;
  filial: string;
  empresa: string;
  cpf: string;
  diasTrabalhados: number;
  he50: number;
  he100: number;
  adicionalNoturno: number;
  faltas: number;
  periodo: string; // Format: YYYY-MM
}

export interface BranchFinancialConfig {
  filial: string;
  salarioBase: number;
  valorHe50: number;
  valorHe100: number;
  valorAdNot: number;
  valorDiaria: number;
}

export type ViewType = 'dashboard' | 'ranking' | 'audit' | 'import' | 'reports' | 'ai-analyst' | 'settings' | 'financial';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
