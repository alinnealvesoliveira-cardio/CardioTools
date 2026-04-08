import { PatientInfo, TestResults, Medications } from '../types';

/**
 * Gera o Código Diagnóstico Estruturado CBDF
 */
export const generateCBDFCode = (
  patient: PatientInfo,
  results: TestResults,
  meds: Medications
): string => {
  const prefix = "D05";

  // 1. Estrutura: Retorno booleano explícito
  const structure = !!patient.structureAlteration ? "01" : "00";

  // 2. Capacidade Aeróbica: Proteção contra NaN e valores fora de escala
  const getEff = (val?: number) => (val !== undefined && !isNaN(val)) ? val : 100;
  const efficiency = Math.min(getEff(results.tc6m?.efficiency), getEff(results.vsaq?.efficiency));

  let capacityQual = "0";
  if (efficiency < 25) capacityQual = "4";
  else if (efficiency < 50) capacityQual = "3";
  else if (efficiency < 75) capacityQual = "2";
  else if (efficiency < 95) capacityQual = "1";

  // 3. Sistema Vascular: Normalização para comparação segura
  let vascQual = "0";
  const vascular = results.vascularPhysicalExam;
  if (vascular) {
    const severities = [
      (vascular.arterial.cif || "").toLowerCase(),
      (vascular.venous.cif || "").toLowerCase(),
      (vascular.lymphatic.cif || "").toLowerCase()
    ];
    
    if (severities.includes("grave")) vascQual = "4";
    else if (severities.includes("moderada")) vascQual = "3";
    else if (severities.includes("leve")) vascQual = "2";
    else if (severities.includes("normal")) vascQual = "1";
  }

  // 4. Fadiga: Garante tratamento numérico
  const fatigueLevel = Number(results.fatigabilityScales?.exercise?.fatigue) || 0;
  let fatigueQual = "0";
  if (fatigueLevel >= 9) fatigueQual = "4";
  else if (fatigueLevel >= 7) fatigueQual = "3";
  else if (fatigueLevel >= 4) fatigueQual = "2";
  else if (fatigueLevel >= 1) fatigueQual = "1";

  // 5. Resposta Cronotrópica: Verifica classes que afetam a FC
  const hasMeds = (
    meds.betablockers || 
    meds.bcc || 
    meds.antiarrhythmics || 
    meds.digitalis
  ) ? "4" : "0";

  return `${prefix}.${structure}.${capacityQual}.${vascQual}.${fatigueQual}.${hasMeds}`;
};

/**
 * Traduz o código CBDF para um laudo descritivo em português
 */
export const translateCBDFCode = (code: string): string => {
  const parts = code.split('.');
  if (parts.length < 6) return "Código de diagnóstico incompleto ou em processamento.";

  const qualifiers: Record<string, string> = {
    "0": "sem deficiência aparente",
    "1": "deficiência leve",
    "2": "deficiência moderada",
    "3": "deficiência grave",
    "4": "deficiência completa/limitação severa"
  };

  const structure = parts[1] === "01" ? "com alteração estrutural identificada" : "sem alterações estruturais relatadas";
  const capacity = qualifiers[parts[2]] || "não avaliada";
  const vascular = qualifiers[parts[3]] || "não avaliada";
  const fatigue = qualifiers[parts[4]] || "não avaliada";
  const meds = parts[5] === "4" 
    ? "presença de interferência farmacológica na resposta cronotrópica" 
    : "frequência cardíaca sem interferência medicamentosa direta";

  return `Análise Cinético-Funcional: Paciente ${structure}. Ao esforço, apresenta: capacidade aeróbica com ${capacity}, status vascular com ${vascular} e nível de fadigabilidade classificado como ${fatigue}. Nota clínica: ${meds}.`;
};