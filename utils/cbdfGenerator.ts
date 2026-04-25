import { PatientInfo, TestResults, Medications } from '../types';
import { getCIFClassification } from './cif'; 

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
    const aerobic = results.aerobic;
    if (!aerobic) return "8";

    const efficiencies = [
      aerobic?.sixMinuteWalkTest?.efficiency,
      aerobic?.stepTest?.efficiency,
      // Acesso seguro ao tsl5x: se existir, assume 50, se não, undefined
      aerobic?.tsl5x ? 50 : undefined, 
      aerobic?.dasi?.percentage
    ].filter((val): val is number => typeof val === 'number' && !isNaN(val));

    if (efficiencies.length === 0) return "8"; 
    
    const minEfficiency = Math.min(...efficiencies);
    const classification = getCIFClassification(minEfficiency, 100);
    
    return classification ? classification.qualifier.toString() : "8";
  };

  // 3. SISTEMA VASCULAR (VAS)
  const getVascQual = (): string => {
    const vasc = results.vascular?.vascularAssessment;
    if (!vasc) return "8";
    
    const godet = parseInt(vasc.venese?.godet || "0"); 
    const isStemmerPos = vasc.lymphatic?.stemmer === 'Positivo';
    const isPulseAlt = vasc.arterial?.pulse === 'Diminuídos' || vasc.arterial?.pulse === 'Ausentes';

    if (isStemmerPos || godet >= 3) return "3"; 
    if (godet > 0 || isPulseAlt) return "2";    
    return "0"; 
  };

  // 4. FADIGABILIDADE (FAD)
  const getFadQual = (): string => {
    // Acessando via 'fatigability'
    const fatigue = results['fatigability']?.exercise?.fatigue || 0;
    
    if (fatigue >= 8) return "4";
    if (fatigue >= 6) return "3";
    if (fatigue >= 4) return "2";
    if (fatigue >= 2) return "1";
    return "0";
  };

  // 5. CRONOTROPISMO / FC (FC)
  const getFCQual = (): string => {
    // Nota: Verifique se esses campos existem no seu types.ts em AerobicResults
    // Se não existirem, você precisará adicioná-los.
    const swt = results.aerobic?.sixMinuteWalkTest;
    const hrRest = (swt as any)?.restingHR || 0;
    const hrPeak = (swt as any)?.peakHR || 0;
    
    if (hrRest === 0 || hrPeak === 0) return "8";
    
    const delta = hrPeak - hrRest;
    
    if (delta <= 5) return "4";
    if (delta <= 10) return "3";
    if (delta <= 20) return "2";
    if (delta <= 30) return "1";
    return "0";
  };

  return `${prefix}.${structure}.${getCapacityQual()}.${getVascQual()}.${getFadQual()}.${getFCQual()}`;
};