export interface CBDFResult {
  qualifier: number;
  severity: string;
  color: string;
  bgLight: string;
  description: string;
}

/**
 * Converte a eficiência (%) na classificação CBDF-1
 * Nota: A CBDF/CIF utiliza o qualificador para mensurar a DEFICIÊNCIA (o que falta).
 * Se o paciente tem 80% de eficiência, ele tem 20% de deficiência (Leve).
 */
export const getCBDFClassification = (efficiency: number): CBDFResult => {
  // val = Nível de Deficiência (100 - Eficiência)
  const efficiencyClamped = Math.max(0, Math.min(efficiency, 100));
  const deficit = 100 - efficiencyClamped;

  // Escala de Gravidade COFFITO / CIF
  if (deficit <= 4) {
    return { 
      qualifier: 0, 
      severity: 'Sem Deficiência', 
      color: '#059669', // Emerald 600
      bgLight: '#ecfdf5',
      description: 'Capacidade funcional preservada. Nenhuma barreira detectada.' 
    };
  }
  if (deficit <= 24) {
    return { 
      qualifier: 1, 
      severity: 'Deficiência Leve', 
      color: '#84cc16', // Lime 500
      bgLight: '#f7fee7',
      description: 'Comprometimento funcional leve (5-24% de perda).' 
    };
  }
  if (deficit <= 49) {
    return { 
      qualifier: 2, 
      severity: 'Deficiência Moderada', 
      color: '#eab308', // Amber 500
      bgLight: '#fffbeb',
      description: 'Comprometimento funcional moderado (25-49% de perda).' 
    };
  }
  if (deficit <= 95) {
    return { 
      qualifier: 3, 
      severity: 'Deficiência Grave', 
      color: '#f97316', // Orange 500
      bgLight: '#fff7ed',
      description: 'Comprometimento funcional grave (50-95% de perda).' 
    };
  }
  return { 
    qualifier: 4, 
    severity: 'Deficiência Completa', 
    color: '#ef4444', // Red 500
    bgLight: '#fef2f2',
    description: 'Comprometimento funcional total ou quase total (> 95% de perda).' 
  };
};