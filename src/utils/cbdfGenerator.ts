import { PatientInfo, TestResults, Medications } from '../types';

export const generateCBDFCode = (
  patient: PatientInfo,
  results: TestResults,
  meds: Medications
): string => {
  const prefix = "D05";
  const res = results as any; 

  // 1. Estrutura: 01 (Com alteração) ou 00 (Sem alteração)
  const structure = !!patient.structureAlteration ? "01" : "00";

  // 2. Capacidade Aeróbica (Hierarquia de Evidência)
  let capacityQual = "8"; // Padrão: Não especificado
  
  // Coletamos a eficiência de qualquer teste realizado
  const efficiencies = [
    res.tc6m?.efficiency,        // Teste de Caminhada
    res.td2m?.efficiency,        // Marcha Estacionária (Ideal para falta de espaço)
    res.tsl1m?.efficiency,       // Sentar e Levantar 1 min
    res.stepTest?.efficiency,    // Step Test
    res.vsaq?.efficiency,        // Questionário VSAQ
    res.dasi?.efficiency         // Questionário DASI (Útil na UTI/Quarto)
  ].filter(val => val !== undefined && val !== null);

  if (efficiencies.length > 0) {
    // Utilizamos o valor do teste realizado (ou o mais conservador se houver vários)
    const finalEfficiency = Math.min(...efficiencies);
    
    if (finalEfficiency < 25) capacityQual = "4";
    else if (finalEfficiency < 50) capacityQual = "3";
    else if (finalEfficiency < 75) capacityQual = "2";
    else if (finalEfficiency < 95) capacityQual = "1";
    else capacityQual = "0";
  }

  // 3. Sistema Vascular
  let vascQual = "8"; 
  const vascular = res.vascularPhysicalExam;
  if (vascular && vascular.arterial && vascular.venous) {
    const severities = [
      (vascular.arterial.cif || "").toLowerCase(),
      (vascular.venous.cif || "").toLowerCase()
    ];
    if (severities.includes("grave")) vascQual = "4";
    else if (severities.includes("moderada")) vascQual = "3";
    else if (severities.includes("leve")) vascQual = "2";
    else if (severities.includes("normal")) vascQual = "0";
  }

  // 4. Resposta da Frequência Cardíaca (Regra dos 5 pontos)
  let hrQual = "8";
  // Busca FC de repouso e pico em qualquer teste disponível
  const hrRest = res.tc6m?.restingHR || res.td2m?.restingHR || res.stepTest?.restingHR || res.hemodynamics?.restingHR;
  const hrPeak = res.tc6m?.peakHR || res.td2m?.peakHR || res.stepTest?.peakHR || res.hemodynamics?.peakHR;

  if (hrRest !== undefined && hrPeak !== undefined) {
    const deltaHR = hrPeak - hrRest;
    // Se a variação for <= 5 bpm, qualificador é 0 (Sem alteração)
    hrQual = deltaHR <= 5 ? "0" : "1"; 
  }

  // 5. Perfil Farmacológico
  const hasMeds = (meds.betablockers || meds.bcc || meds.antiarrhythmics || meds.digitalis) ? "4" : "0";

  return `${prefix}.${structure}.${capacityQual}.${vascQual}.${hrQual}.${hasMeds}`;
};

export const translateCBDFCode = (code: string): string => {
  const parts = code.split('.');
  const qualifiers: Record<string, string> = {
    "0": "sem deficiência",
    "1": "deficiência leve",
    "2": "deficiência moderada",
    "3": "deficiência grave",
    "4": "deficiência completa",
    "8": "não especificada"
  };

  return `Diagnóstico Estruturado: Paciente ${parts[1] === "01" ? 'com' : 'sem'} alteração estrutural. Capacidade aeróbica: ${qualifiers[parts[2]]}. Sistema vascular: ${qualifiers[parts[3]]}. Resposta de FC: ${parts[4] === "0" ? 'normal' : parts[4] === "8" ? 'não testada' : 'alterada'}.`;
};