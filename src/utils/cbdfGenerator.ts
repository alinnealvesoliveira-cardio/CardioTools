import { PatientInfo, TestResults, Medications } from '../types';

export const generateCBDFCode = (
  patient: PatientInfo,
  results: TestResults,
  meds: Medications
): string => {
  const prefix = "D05";
  const res = results as any; 

  // 1. ESTRUTURA (EST)
  // Verifica FEVE < 50% ou se o usuário marcou alteração estrutural
  const feveRaw = patient.ejectionFraction ? String(patient.ejectionFraction) : "50";
  const feveValue = parseInt(feveRaw) || 50; // Agora feveValue é um número real

  // CORREÇÃO: Usar feveValue (número) para comparar com 50
  const structure = (feveValue < 50 || !!(patient as any).structureAlteration) ? "01" : "00";

  // 2. CAPACIDADE AERÓBICA (CAP) - CORREÇÃO GRAVE: MAPEAMENTO DE NOMES
  let capacityQual = "8"; 
  
  // Mapeamos os nomes corretos que vêm do PatientContext/Formulários
  const efficiencies = [
    res.sixMinuteWalkTest?.efficiency,        // TC6M
    res.twoMinuteStepTest?.efficiency,        // TD2M
    res.sitToStandTest?.efficiency,           // TSL (O seu TS5X entra aqui)
    res.stepTest?.efficiency,
    res.vsaqScore ? (res.vsaqScore > 5 ? 80 : 40) : null, // Estimativa se houver score
    res.dasiScore ? (res.dasiScore > 5 ? 80 : 40) : null
  ].filter(val => val !== undefined && val !== null);

  if (efficiencies.length > 0) {
    const finalEfficiency = Math.min(...efficiencies);
    
    if (finalEfficiency < 25) capacityQual = "4";      // Completa
    else if (finalEfficiency < 50) capacityQual = "3"; // Grave
    else if (finalEfficiency < 75) capacityQual = "2"; // Moderada
    else if (finalEfficiency < 95) capacityQual = "1"; // Leve
    else capacityQual = "0";                           // Normal
  }

  // 3. SISTEMA VASCULAR (VAS) - CORREÇÃO: ACESSO AO OBJETO CORRETO
  let vascQual = "0"; // Padrão normal se avaliado
  const vasc = res.vascularAssessment;

  if (vasc) {
    // Se houver edema Godet > 0 ou Stemmer Positivo, já sobe o qualificador
    const hasEdema = vasc.venous?.godet && parseInt(vasc.venous.godet) > 0;
    const hasStemmer = vasc.lymphatic?.stemmer === 'Positivo';
    const diminishedPulses = vasc.arterial?.pulses === 'Diminuídos' || vasc.arterial?.pulses === 'Ausentes';

    if (hasEdema || hasStemmer || diminishedPulses) {
      // Lógica de gravidade simplificada para o código
      if (hasStemmer || (vasc.venous?.godet >= 3)) vascQual = "3"; 
      else vascQual = "2";
    }
  } else {
    vascQual = "8"; // Não avaliado
  }

  // 4. FADIGABILIDADE / FC (FAD) - CORREÇÃO: LÓGICA INVERTIDA
  let fadQual = "8";
  const hrRest = res.sixMinuteWalkTest?.restingHR || res.sitToStandTest?.restingHR || res.twoMinuteStepTest?.restingHR;
  const hrPeak = res.sixMinuteWalkTest?.peakHR || res.sitToStandTest?.peakHR || res.twoMinuteStepTest?.peakHR;
  const borgExercise = res.fatigabilityScales?.exercise?.fatigue || 0;

  if (hrRest && hrPeak) {
    const deltaHR = hrPeak - hrRest;
    // Se o coração NÃO sobe pelo menos 10-15 bpm no esforço (Incompetência), há alteração.
    // Se o Borg for > 3 (Moderado), também qualifica como alteração.
    if (deltaHR < 10 || borgExercise >= 3) {
      fadQual = borgExercise >= 7 ? "3" : "2"; 
    } else {
      fadQual = "0";
    }
  }

  // 5. PERFIL FARMACOLÓGICO (MED)
  // Se usa medicações que mascaram a FC ou tratam ICC, qualificador 4
  const hasStrongMeds = meds?.betablockers || meds?.antiarrhythmics || meds?.digitalis;
  const medQual = hasStrongMeds ? "4" : "0";

  return `${prefix}.${structure}.${capacityQual}.${vascQual}.${fadQual}.${medQual}`;
};