import { PatientInfo, TestResults, Medications } from '../types';

/**
 * Gera o código da Classificação Brasileira de Diagnóstico Fisioterapêutico (CBDF)
 * Baseado na Resolução COFFITO 555/2022.
 * Estrutura: PREFIXO.ESTRUTURA.CAPACIDADE.VASCULAR.FADIGABILIDADE.MEDICAÇÃO
 */
export const generateCBDFCode = (
  patient: PatientInfo,
  results: TestResults,
  meds: Medications
): string => {
  const prefix = "D05"; // Domínio Cardiovascular
  const res = results as any; 

  // 1. ESTRUTURA (EST)
  // Define se há dano estrutural cardíaco prévio (FEVE reduzida ou marcador de lesão)
  const feveValue = parseInt(patient.ejectionFraction?.toString() || "60");
  const hasStructuralDamage = feveValue < 50 || !!(patient as any).structureAlteration;
  const structure = hasStructuralDamage ? "01" : "00";

  // 2. CAPACIDADE AERÓBICA (CAP)
  // Analisa todos os testes realizados e seleciona o maior nível de deficiência
  let capacityQual = "8"; // Padrão: Não testado
  
  const efficiencies = [
    res.sixMinuteWalkTest?.efficiency,
    res.twoMinuteStepTest?.efficiency,
    res.sitToStandTest?.efficiency,
    res.stepTest?.efficiency,
    res.dasi?.percentage // Adicionado o DASI que finalizamos
  ].filter(val => val !== undefined && val !== null && !isNaN(val));

  if (efficiencies.length > 0) {
    const minEfficiency = Math.min(...efficiencies);
    
    if (minEfficiency < 25) capacityQual = "4";      // Deficiência Completa
    else if (minEfficiency < 50) capacityQual = "3"; // Deficiência Grave
    else if (minEfficiency < 75) capacityQual = "2"; // Deficiência Moderada
    else if (minEfficiency < 95) capacityQual = "1"; // Deficiência Leve
    else capacityQual = "0";                         // Sem Deficiência
  }

  // 3. SISTEMA VASCULAR (VAS)
  let vascQual = "8"; 
  const vasc = res.vascularAssessment;

  if (vasc) {
    const godet = parseInt(vasc.venous?.godet || "0");
    const isStemmerPos = vasc.lymphatic?.stemmer === 'Positivo';
    const isPulseAlt = vasc.arterial?.pulses === 'Diminuídos' || vasc.arterial?.pulses === 'Ausentes';

    if (isStemmerPos || godet >= 3) vascQual = "3";
    else if (godet > 0 || isPulseAlt) vascQual = "2";
    else vascQual = "0";
  }

  // 4. FADIGABILIDADE / CRONOTROPISMO (FAD)
  let fadQual = "8";
  // Busca dados de FC peak e rest de qualquer teste disponível
  const hrRest = res.sixMinuteWalkTest?.restingHR || res.sitToStandTest?.restingHR;
  const hrPeak = res.sixMinuteWalkTest?.peakHR || res.sitToStandTest?.peakHR;
  const borgExercise = res.fatigabilityScales?.exercise?.fatigue || 0;

  if (hrRest && hrPeak) {
    const chronotropicIncompetence = (hrPeak - hrRest) < 15;
    
    if (chronotropicIncompetence || borgExercise >= 7) fadQual = "3";
    else if (borgExercise >= 4) fadQual = "2";
    else if (borgExercise >= 2) fadQual = "1";
    else fadQual = "0";
  }

  // 5. PERFIL FARMACOLÓGICO (MED)
  // Medicamentos que alteram a resposta hemodinâmica ou indicam falência de bomba
  const isMedicated = meds?.betablockers || meds?.antiarrhythmics || meds?.digitalis || meds?.diuretics;
  const medQual = isMedicated ? "4" : "0";

  // Retorno no formato: D05.EST.CAP.VAS.FAD.MED
  return `${prefix}.${structure}.${capacityQual}.${vascQual}.${fadQual}.${medQual}`;
};