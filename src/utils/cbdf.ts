export interface CBDFResult {
  qualifier: number;
  severity: string;
  color: string;
  bgLight: string;
  description: string;
}

/**
 * Converte a eficiência (%) na classificação CBDF-1
 * Baseado na escala de gravidade da CIF/OMS (Diretriz CBDF)
 */
export const getCBDFClassification = (efficiency: number): CBDFResult => {
  // Garantir que o valor não ultrapasse 100 ou seja menor que 0
  const val = Math.max(0, Math.min(efficiency, 100));

  if (val >= 96) {
    return { 
      qualifier: 0, 
      severity: 'Preservada', 
      color: '#10b981', // Emerald 500
      bgLight: '#ecfdf5',
      description: 'Nenhuma deficiência funcional detectada (96-100%).' 
    };
  }
  if (val >= 75) {
    return { 
      qualifier: 1, 
      severity: 'Deficiência Leve', 
      color: '#84cc16', // Lime 500
      bgLight: '#f7fee7',
      description: 'Comprometimento funcional leve, com baixo impacto nas atividades (75-95%).' 
    };
  }
  if (val >= 50) {
    return { 
      qualifier: 2, 
      severity: 'Deficiência Moderada', 
      color: '#eab308', // Amber 500
      bgLight: '#fffbeb',
      description: 'Comprometimento funcional moderado, limitação perceptível (50-74%).' 
    };
  }
  if (val >= 5) {
    return { 
      qualifier: 3, 
      severity: 'Deficiência Grave', 
      color: '#f97316', // Orange 500
      bgLight: '#fff7ed',
      description: 'Comprometimento funcional grave, limitação importante da independência (5-49%).' 
    };
  }
  return { 
    qualifier: 4, 
    severity: 'Deficiência Completa', 
    color: '#ef4444', // Red 500
    bgLight: '#fef2f2',
    description: 'Comprometimento funcional total ou quase total (< 5%).' 
  };
};