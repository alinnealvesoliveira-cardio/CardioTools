import { PatientInfo, TestResults, Medications } from '../types';

export const generateCBDFCode = (
  patient: PatientInfo,
  results: TestResults,
  meds: Medications
): string => {
  const prefix = "D05";

  // 1. ESTRUTURA (EST)
  const feve = Number(patient.ejectionFraction) || 60;
  const hasStructuralDamage = feve < 50 || !!patient.structureAlteration;
  const structure = hasStructuralDamage ? "01" : "00";

  // 2. CAPACIDADE AERÓBICA (CAP)
  const getCapacityQual = (): string => {
    const efficiencies = [
      results.sixMinuteWalkTest?.efficiency,
      results.stepTest?.efficiency,
      results.sitToStandTest?.efficiency,
      results.dasi?.percentage
    ].filter((val): val is number => typeof val === 'number' && !isNaN(val));

    if (efficiencies.length === 0) return "8"; 
    
    const minEfficiency = Math.min(...efficiencies);
    if (minEfficiency < 25) return "4";
    if (minEfficiency < 50) return "3";
    if (minEfficiency < 75) return "2";
    if (minEfficiency < 95) return "1";
    return "0";
  };

  // 3. SISTEMA VASCULAR (VAS)
  const getVascQual = (): string => {
    if (!results.vascularAssessment) return "8";
    
    const { venous, lymphatic, arterial } = results.vascularAssessment;

    const godet = parseInt(venous?.godet || "0"); 
    const isStemmerPos = lymphatic?.stemmer === 'Positivo';
    // Ajustado para 'pulse' (singular), conforme seu types.ts
    const isPulseAlt = arterial?.pulse === 'Diminuídos' || arterial?.pulse === 'Ausentes';

    if (isStemmerPos || godet >= 3) return "3";
    if (godet > 0 || isPulseAlt) return "2";
    return "0";
  };

  // 4. FADIGABILIDADE / CRONOTROPISMO (FAD)
  const getFadQual = (): string => {
    const borgExercise = results.fatigabilityScales?.exercise?.fatigue || 0;
    const hrRest = results.sixMinuteWalkTest?.restingHR || results.sitToStandTest?.restingHR;
    const hrPeak = results.sixMinuteWalkTest?.peakHR || results.sitToStandTest?.peakHR;

    const hasChronotropicIncompetence = (hrRest && hrPeak) ? (hrPeak - hrRest) < 15 : false;

    if (hasChronotropicIncompetence || borgExercise >= 7) return "3";
    if (borgExercise >= 4) return "2";
    if (borgExercise >= 2) return "1";
    return "0";
  };

  // 5. PERFIL FARMACOLÓGICO (MED)
  const medQual = (meds?.betablockers || meds?.antiarrhythmics || meds?.digitalis || meds?.diuretics) ? "4" : "0";

  return `${prefix}.${structure}.${getCapacityQual()}.${getVascQual()}.${getFadQual()}.${medQual}`;
};