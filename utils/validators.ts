
export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleanCPF)) return false;
  
  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

  return true;
};

export const parseNum = (val: string | number): number => {
  if (typeof val === 'number') return val;
  if (!val || val === 'R$ -' || val === '-') return 0;
  
  let s = val.toString().replace('R$', '').trim();
  
  // Detecta formato: 1.234,56 (BRL) vs 1,234.56 (US)
  const hasComma = s.includes(',');
  const hasDot = s.includes('.');
  
  if (hasComma && hasDot) {
    // Se tem ambos, o último é o decimal
    const commaPos = s.lastIndexOf(',');
    const dotPos = s.lastIndexOf('.');
    if (commaPos > dotPos) {
      // BRL: 1.234,56
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      // US: 1,234.56
      s = s.replace(/,/g, '');
    }
  } else if (hasComma) {
    // Apenas vírgula: 1234,56 -> decimal
    s = s.replace(',', '.');
  } else if (hasDot) {
    // Apenas ponto: pode ser 1.500 (milhar) ou 1.50 (decimal)
    // Se houver mais de 3 dígitos após o ponto, ou exatamente 3 e o valor for alto, 
    // tratamos como milhar no contexto BRL. Caso contrário, decimal.
    const parts = s.split('.');
    if (parts[parts.length - 1].length !== 2) {
      // Se não terminar em 2 dígitos (centavos), costuma ser milhar em sistemas BR
      // Mas para horas extras (ex: 1.5), é decimal. 
      // Regra de ouro: se o valor absoluto for < 100 e tiver ponto, é decimal (horas).
      const temp = parseFloat(s);
      if (temp > 100) s = s.replace(/\./g, '');
    }
  }

  const num = parseFloat(s);
  return isNaN(num) ? 0 : num;
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    maximumFractionDigits: 2 
  }).format(value);
};

export const formatHours = (value: number): string => {
  return `${value.toFixed(1)}h`;
};
