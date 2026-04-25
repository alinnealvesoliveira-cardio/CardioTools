/**
 * Estratificação de Risco para Reabilitação Cardiovascular
 * Baseado nas diretrizes AACVPR, SBC e AHA.
 */
export const calculateRisk = (patientInfo: any, testResults: any) => {
  // 1. Fração de Ejeção (FEVE)
  const feve = patientInfo?.ejectionFraction ? parseInt(patientInfo.ejectionFraction) : 60;
  
  // 2. Capacidade Funcional (METs) 
  // Prioridade: DASI/VSAQ (mais precisos para METs) > Estimativa por distância
  const METsFromTests = testResults?.dasi?.estimatedMETs || testResults?.vsaq?.estimatedMETs;
  
  const distance = testResults?.sixMinuteWalkTest?.distance || 0;
  const estimatedMETsFromDistance = distance > 0 ? (distance * 0.03) / 3.5 : 0; 
  
  const finalMETs = METsFromTests || estimatedMETsFromDistance || 0;

  // 3. Critérios de Instabilidade
  const hasAngina = testResults?.symptoms?.angina?.type && testResults.symptoms.angina.type !== 'none';
  const hasLowITB = testResults?.vascularAssessment?.arterial?.itb && parseFloat(testResults.vascularAssessment.arterial.itb) < 0.9;
  const hasStructuralDamage = !!patientInfo?.structureAlteration;

  // --- LÓGICA DE ESTRATIFICAÇÃO (AACVPR / SBC) ---

  // ALTO RISCO (High Risk)
  // Critérios: FEVE < 40%, METs < 5, Angina ou Isquemia detectada
  if (feve < 40 || (finalMETs > 0 && finalMETs < 5) || hasAngina || hasLowITB) {
    return {
      level: 'ALTO RISCO',
      qualifier: 'Classe C/D',
      color: 'text-rose-600',
      bg: 'bg-rose-50/50',
      border: 'border-rose-200',
      desc: 'Monitorização contínua (ECG) obrigatória. Alta probabilidade de eventos. Supervisão direta.',
      status: 'critical'
    };
  }

  // RISCO MODERADO (Intermediate Risk)
  // Critérios: FEVE 40-49%, METs 5-7 ou Dano Estrutural sem sintomas agudos
  if ((feve >= 40 && feve <= 49) || (finalMETs >= 5 && finalMETs <= 7) || hasStructuralDamage) {
    return {
      level: 'RISCO MODERADO',
      qualifier: 'Classe B',
      color: 'text-amber-600',
      bg: 'bg-amber-50/50',
      border: 'border-amber-200',
      desc: 'Monitorização intermitente. Progressão gradual. Sinais vitais a cada troca de fase.',
      status: 'warning'
    };
  }

  // BAIXO RISCO (Low Risk)
  // Critérios: FEVE >= 50% e METs > 7
  return {
    level: 'BAIXO RISCO',
    qualifier: 'Classe A',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50/50',
    border: 'border-emerald-200',
    desc: 'Supervisão padrão. Progressão conforme protocolo clínico. Baixo risco de eventos agudos.',
    status: 'safe'
  };
};