/**
 * Estratificação de Risco para Reabilitação Cardiovascular
 * Alinhado com as diretrizes AACVPR e SBC.
 */
export const calculateRisk = (patientInfo: any, testResults: any) => {
  // 1. Fração de Ejeção (FEVE)
  // Corrigido para 'feve' (conforme usamos no as any do relatório) ou 'ejectionFraction'
  const feve = parseInt(patientInfo?.feve || patientInfo?.ejectionFraction || '60');
  
  // 2. Capacidade Funcional (METs) 
  // O nó correto é aerobic.vsaq.met ou aerobic.dasi.estimatedMETs
  const aerobic = testResults?.aerobic;
  const METsFromTests = aerobic?.vsaq?.met || aerobic?.dasi?.estimatedMETs;
  
  // 3. Estimativa via Caminhada (6min) caso não tenha questionário
  const distance = testResults?.sixMinuteWalkTest?.distance || 0;
  const estimatedMETsFromDistance = distance > 0 ? (distance * 0.03) / 3.5 : 0; 
  
  const finalMETs = METsFromTests || estimatedMETsFromDistance || 0;

  // 4. Critérios de Instabilidade (Angina e Vascular)
  const hasAngina = testResults?.symptoms?.angina?.type && testResults.symptoms.angina.type !== 'none';
  const itbValue = parseFloat(testResults?.vascularAssessment?.arterial?.itb || '1.0');
  const hasLowITB = itbValue < 0.9;
  const hasStructuralDamage = !!patientInfo?.structureAlteration;

  // --- LÓGICA DE ESTRATIFICAÇÃO ---

  // ALTO RISCO
  if (feve < 40 || (finalMETs > 0 && finalMETs < 5) || hasAngina || hasLowITB) {
    return {
      level: 'ALTO RISCO',
      qualifier: 'Classe C/D',
      color: 'text-rose-600',
      bg: 'bg-rose-50/50',
      border: 'border-rose-200',
      desc: 'Monitorização contínua (ECG) obrigatória. Alta probabilidade de eventos.',
      status: 'critical'
    };
  }

  // RISCO MODERADO
  if ((feve >= 40 && feve <= 49) || (finalMETs >= 5 && finalMETs <= 7) || hasStructuralDamage) {
    return {
      level: 'RISCO MODERADO',
      qualifier: 'Classe B',
      color: 'text-amber-600',
      bg: 'bg-amber-50/50',
      border: 'border-amber-200',
      desc: 'Monitorização intermitente. Progressão gradual supervisionada.',
      status: 'warning'
    };
  }

  // BAIXO RISCO
  return {
    level: 'BAIXO RISCO',
    qualifier: 'Classe A',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50/50',
    border: 'border-emerald-200',
    desc: 'Supervisão padrão. Baixo risco de eventos agudos durante esforço.',
    status: 'safe'
  };
};