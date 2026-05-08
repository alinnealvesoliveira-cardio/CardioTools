import { PatientInfo, TestResults, Medications } from '../types';
import { getCIFClassification } from './cif'; 

export const generateCBDFCode = (
  patient: PatientInfo,
  results: TestResults,
  meds: Medications
): string => {
  const prefix = "D05";

  // 1. ESTRUTURA (EST) - Baseado em FEVE e alterações estruturais
  const feve = Number((patient as any).feve || patient.ejectionFraction) || 60;
  const hasStructuralDamage = feve < 50 || !!patient.structureAlteration;
  const structure = hasStructuralDamage ? "01" : "00";

  // 2. CAPACIDADE AERÓBICA (CAP) - Incluindo VSAQ
  const getCapacityQual = (): string => {
    const aerobic = results.aerobic;
    if (!aerobic) return "8";

    // Criamos uma lista de eficiências baseada nos testes realizados
    const efficiencies = [
      aerobic?.sixMinuteWalkTest?.efficiency,
      aerobic?.stepTest?.efficiency,
      aerobic?.dasi?.percentage,
      // Para o VSAQ, calculamos a eficiência baseada em um teto de 13 METs
      aerobic?.vsaq?.met ? (aerobic.vsaq.met / 13) * 100 : undefined
    ].filter((val): val is number => typeof val === 'number' && !isNaN(val));

    if (efficiencies.length === 0) return "8"; 
    
    // Pegamos a menor eficiência (pior desempenho) para classificar a deficiência
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

  // 4. FADIGABILIDADE (FAD) - Baseado na escala de Borg no esforço
  const getFadQual = (): string => {
    const fatigue = results['fatigability']?.exercise?.fatigue || 0;
    
    if (fatigue >= 8) return "4";
    if (fatigue >= 6) return "3";
    if (fatigue >= 4) return "2";
    if (fatigue >= 2) return "1";
    return "0";
  };

  // 5. CRONOTROPISMO / FC (FC) - Captura dinâmica de qualquer teste realizado
  const getFCQual = (): string => {
    const aerobic = results.aerobic;
    const fatigability = results.fatigability;

    // Tenta pegar FC de repouso e pico de qualquer teste disponível
    const hrRest = aerobic?.sixMinuteWalkTest?.hr?.pre || 
                   aerobic?.tsl30s?.hr?.pre || 
                   aerobic?.tug?.hr?.pre || 
                   (fatigability as any)?.rest?.hr || 0;

    const hrPeak = aerobic?.sixMinuteWalkTest?.hr?.post || 
                   aerobic?.tsl30s?.hr?.post || 
                   aerobic?.tug?.hr?.post || 
                   (fatigability as any)?.exercise?.hr || 0;
    
    if (hrRest === 0 || hrPeak === 0) return "8";
    
    const delta = hrPeak - hrRest;
    
    // Classificação do Cronotropismo (Resolução COFFITO)
    if (delta <= 5) return "4";  // Deficiência completa (Incompetência cronotrópica grave)
    if (delta <= 10) return "3"; // Deficiência grave
    if (delta <= 20) return "2"; // Deficiência moderada
    if (delta <= 30) return "1"; // Deficiência leve
    return "0"; // Sem deficiência
  };

  // Retorno no formato: D05.EST.CAP.VAS.FAD.FC
  return `${prefix}.${structure}.${getCapacityQual()}.${getVascQual()}.${getFadQual()}.${getFCQual()}`;
};