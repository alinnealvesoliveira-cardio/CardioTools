export interface CBDFResult {
  qualifier: number;
  severity: string;
  color: string;
  description: string;
}

/**
 * Converte a eficiência (%) na classificação CBDF-1
 * Baseado na escala de gravidade da CIF/OMS
 */
export const getCBDFClassification = (efficiency: number): CBDFResult => {
  if (efficiency >= 96) {
    return { 
      qualifier: 0, 
      severity: 'Preservada', 
      color: '#22c55e', // Verde (Normal)
      description: 'Nenhuma deficiência funcional detectada (96-100%).' 
    };
  }
  if (efficiency >= 75) {
    return { 
      qualifier: 1, 
      severity: 'Leve', 
      color: '#a8e630', // Vitality Lime
      description: 'Deficiência funcional leve (75-95%).' 
    };
  }
  if (efficiency >= 50) {
    return { 
      qualifier: 2, 
      severity: 'Moderada', 
      color: '#eab308', // Amarelo
      description: 'Deficiência funcional moderada (50-74%).' 
    };
  }
  if (efficiency >= 5) {
    return { 
      qualifier: 3, 
      severity: 'Grave', 
      color: '#f97316', // Laranja
      description: 'Deficiência funcional grave (5-49%).' 
    };
  }
  return { 
    qualifier: 4, 
    severity: 'Completa', 
    color: '#ef4444', // Vermelho
    description: 'Deficiência funcional completa ou total (< 5%).' 
  };
};