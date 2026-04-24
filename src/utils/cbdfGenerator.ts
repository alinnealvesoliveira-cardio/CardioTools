import { PatientInfo, TestResults, Medications } from '../types';
import { getCIFClassification } from './cif'; 

/**
 * Gera o código de diagnóstico conforme a estrutura COFFITO 555.
 * Estrutura: D05.EST.CAP.VAS.FAD.FC
 */
export const generateCBDFCode = (
  patient: PatientInfo,
  results: TestResults,
  meds: Medications
): string => {
  const prefix = "D05";

  // 1. ESTRUTURA (EST) - Bloco A
  const feve = Number(patient.ejectionFraction) || 60;
  const hasStructuralDamage = feve < 50 || !!patient.structureAlteration;
  const structure = hasStructuralDamage ? "01" : "00";

  // 2. CAPACIDADE AERÓBICA (CAP) - Hierarquia: results.aerobic
  const getCapacityQual = (): string => {
    const aerobic = results.aerobic;
    const efficiencies = [
      aerobic.sixMinuteWalkTest?.efficiency,
      aerobic.stepTest?.efficiency,
      aerobic.sitToStandTest?.efficiency,
      aerobic.dasi?.percentage
    ].filter((val): val is number => typeof val === 'number' && !isNaN(val));

    if (efficiencies.length === 0) return "8"; 
    
    const minEfficiency = Math.min(...efficiencies);
    const classification = getCIFClassification(minEfficiency, 100);
    
    return classification ? classification.qualifier.toString() : "8";
  };

  // 3. SISTEMA VASCULAR (VAS) - Hierarquia: results.vascular.vascularAssessment
  const getVascQual = (): string => {
    const vasc = results.vascular.vascularAssessment;
    if (!vasc) return "8";
    
    // Certifique-se de que no seu types.ts o nome seja 'venous' e não 'venese'
    const godet = parseInt(vasc.venese?.godet || "0"); 
    const isStemmerPos = vasc.lymphatic?.stemmer === 'Positivo';
    const isPulseAlt = vasc.arterial?.pulse === 'Diminuídos' || vasc.arterial?.pulse === 'Ausentes';

    if (isStemmerPos || godet >= 3) return "3"; // Grave
    if (godet > 0 || isPulseAlt) return "2";    // Moderada
    return "0"; // Nenhuma/Leve
  };

  // 4. FADIGABILIDADE (FAD) - Hierarquia: results.fatigabilityScales
  const getFadQual = (): string => {
    const borg = results.fatigability?.exercise?.fatigue || 0;
    
    if (borg >= 8) return "4"; // Completa
    if (borg >= 6) return "3"; // Grave
    if (borg >= 4) return "2"; // Moderada
    if (borg >= 2) return "1"; // Leve
    return "0"; // Nenhuma
  };

  // 5. CRONOTROPISMO / FC (FC) - Hierarquia: results.aerobic
  const getFCQual = (): string => {
    const swt = results.aerobic.sixMinuteWalkTest;
    const hrRest = swt?.restingHR || 0;
    const hrPeak = swt?.peakHR || 0;
    
    if (hrRest === 0 || hrPeak === 0) return "8"; // Não realizado
    
    const delta = hrPeak - hrRest;
    
    if (delta <= 5) return "4";  // Alteração Completa
    if (delta <= 10) return "3"; // Alteração Grave
    if (delta <= 20) return "2"; // Alteração Moderada
    if (delta <= 30) return "1"; // Alteração Leve
    return "0"; // Resposta adequada
  };

  // Montagem final do código
  return `${prefix}.${structure}.${getCapacityQual()}.${getVascQual()}.${getFadQual()}.${getFCQual()}`;
};