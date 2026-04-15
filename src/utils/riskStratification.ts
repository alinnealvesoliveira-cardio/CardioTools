/**
 * Estratificação de Risco para Reabilitação Cardiovascular
 * Baseado nas diretrizes AACVPR e SBC.
 */
export const calculateRisk = (patientInfo: any, testResults: any) => {
  // 1. Fração de Ejeção (FEVE) - Critério hemodinâmico crítico
  const feve = patientInfo?.ejectionFraction ? parseInt(patientInfo.ejectionFraction) : 60;
  
  // 2. Estimativa de METs via TC6M (Fórmula de Troosters et al.)
  // VO2 (ml/kg/min) = (0.02 * distância) + (baseada em idade/peso/sexo)
  // Simplificação clínica para METs:
  const distance = testResults?.sixMinuteWalkTest?.distance || 0;
  const estimatedMETs = distance > 0 ? (distance * 0.03) / 3.5 : 0; 

  // 3. Critérios de Instabilidade e Sintomas
  const hasAngina = testResults?.symptoms?.angina?.type !== 'none';
  const hasIschemia = testResults?.vascularAssessment?.itb < 0.9;
  
  // --- LÓGICA DE ESTRATIFICAÇÃO ---

  // ALTO RISCO (High Risk)
  // FEVE < 40%, Capacidade Funcional baixa, ou presença de isquemia/sintomas
  if (feve < 40 || (estimatedMETs > 0 && estimatedMETs < 5) || hasAngina || hasIschemia) {
    return {
      level: 'ALTO RISCO',
      qualifier: 'Classe C/D',
      color: '#e11d48', // Rose 600
      bg: 'bg-rose-50/50',
      border: 'border-rose-100',
      text: 'text-rose-700',
      desc: 'Monitorização contínua de ECG necessária. Supervisão médica direta e limitação estrita de carga.',
      iconColor: 'text-rose-500'
    };
  }

  // RISCO MODERADO (Intermediate Risk)
  // FEVE 40-49% ou METs entre 5 e 7
  if ((feve >= 40 && feve <= 49) || (estimatedMETs >= 5 && estimatedMETs <= 7)) {
    return {
      level: 'RISCO MODERADO',
      qualifier: 'Classe B',
      color: '#d97706', // Amber 600
      bg: 'bg-amber-50/50',
      border: 'border-amber-100',
      text: 'text-amber-700',
      desc: 'Monitorização intermitente recomendada. Progressão cautelosa de intensidade conforme sintomas.',
      iconColor: 'text-amber-500'
    };
  }

  // BAIXO RISCO (Low Risk)
  // FEVE > 50%, boa capacidade funcional, sem sintomas complicadores
  return {
    level: 'BAIXO RISCO',
    qualifier: 'Classe A',
    color: '#059669', // Emerald 600
    bg: 'bg-emerald-50/50',
    border: 'border-emerald-100',
    text: 'text-emerald-700',
    desc: 'Supervisão padrão. Monitorização de ECG conforme protocolo institucional. Progressão livre.',
    iconColor: 'text-emerald-500'
  };
};