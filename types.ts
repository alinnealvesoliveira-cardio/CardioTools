import React from 'react';

// ==========================================
// 1. NAVEGAÇÃO E UI
// ==========================================
export type NavId = 
  | 'Home' | 'Cadastro' | 'Anamnese' | 'Avaliação Autonômica' | 'Vascular' 
  | 'Capacidade Aeróbica' | 'Avaliação de Sintomas' | 'Resposta da FC' | 'Relatório Final';

export type CategoryName = 
  | 'cadastro' | 'anamnese' | 'autonomic' | 'aerobic' | 'vascular' 
  | 'fatigability' | 'symptoms' | 'hr-response' | 'final-report';

export interface Calculator {
  id: string;
  name: string;
  description: string;
  category: CategoryName;
  component: React.ComponentType<any>;
}
// ==========================================
// 2. TIPAGEM DE TEMPLATES (Adicione isso aqui)
// ==========================================
export interface ScoreOption {
  label: string;
  score: number; // O componente usa 'score', então precisa ser 'score' aqui
}

export interface ScoreItem {
  id: string;
  question: string; // O componente usa 'item.question'
  options: ScoreOption[];
}

export interface ScoreGroup {
  title: string;
  items: ScoreItem[]; // O componente percorre 'group.items'
}
// ==========================================
// 3. ESTRUTURAS CIF E AUXILIARES
// ==========================================
export interface CIFData {
  qualifier: number | string;
  interpretation?: string; 
  severity?: string;
}

// ==========================================
// 4. INTERFACES DE RESULTADOS (MODULARES)
// ==========================================

// --- Interfaces Genéricas de Apoio ---
export interface DasiResults {
  percentage: number;
  estimatedMETs?: number;
  interpretation?: string;
  score?: number;
  predictedMETs?: number;
  cif?: CIFData; // Certifique-se de que CIFData está importado ou definido neste arquivo
}

// Interface "Coringa" para a maioria dos testes funcionais
export interface FunctionalTestResult {
  value?: number;      // Valor genérico
  count?: number;      // Usado para TD2M, TSL, etc
  time?: number;       // Usado para SitToStand, TUG
  predicted?: number;
  efficiency?: number;
  percentage?: number;
  classification?: string;
  timestamp?: string;
  hr?: { pre: number; post: number };
  cif?: CIFData;
  interpretation?: string;
}

export interface SixMinuteWalkResult {
  distance: number;
  time: number;
  hr?: { pre: number; post: number };
  cif?: CIFData;
  interpretation?: string;
  efficiency?: number; // Adicione esta linha
}

// --- Cadastro ---
export interface CadastroResults {
  patientInfo: PatientInfo | null;
  medications: Medications | null;
}

// --- Autonômica ---
export interface AutonomicResults {
  orthostaticDrop: {
    supine: { pas: number; pad: number };
    standing: { pas: number; pad: number };
    delta: { deltaPAS: number; deltaPAD: number };
    interpretation?: string;
  } | null;
  vfc?: number; 
  hrvInterpretation?: string;
}

// --- Aeróbica ---
export interface AerobicResults {
  sixMinuteWalkTest?: SixMinuteWalkResult | null;
  td2m?: FunctionalTestResult | null;
  tsl1m?: FunctionalTestResult | null;
  tsl30s?: FunctionalTestResult | null;
  tsl5x?: FunctionalTestResult | null;
  tug?: FunctionalTestResult | null;
  sitToStandTest?: FunctionalTestResult | null; 
  restingHR?: number;
  peakHR?: number;
  stepTest?: FunctionalTestResult | null;
  vsaq?: { 
    score?: number; 
    classification?: string;
    met?: number;            // Novo
    interpretation?: string; // Novo
    description?: string;    // Novo
  } | null;
  
  dasi?: DasiResults 
   | null;
}

// --- Vascular ---
export interface VascularResults {
  abi?: number;
  abiAnkleBP?: number;
  abiArmBP?: number;
  vascularAssessment?: {
    arterial: { pulse: string; temp: string; capillaryRefill: string; itb?: number; cif?: CIFData };
    venese: { ceap?: string[]; godet: string; cif?: CIFData };
    lymphatic?: { stemmer: string; cif?: CIFData }; 
  } | null;
}

// --- Fatigabilidade e Sintomas ---
export interface FatigabilityResults {
  rest: { dyspnea?: number; fatigue?: number };
  exercise: { dyspnea?: number; fatigue?: number };
}

export interface SymptomResults {
  claudication?: { score?: number; interpretation?: string; timestamp?: string };
  angina?: { type?: string; description?: string; ccsGrade?: number };
}

// --- Resposta da Frequência Cardíaca ---
export interface HRResponseResults {
  restingHR: number;
  peakHR: number;
  recoveryHR: number;
  delta: number;
  interpretation: string;
}

// ==========================================
// 5. INTERFACE PRINCIPAL (O CONTRATO)
// ==========================================
// Certifique-se de que as chaves aqui batem com o updateTestResults('chave', ...)
export interface TestResults {
  cadastro: CadastroResults | null;
  anamnese: any | null;
  autonomic: AutonomicResults | null;
  aerobic: AerobicResults | null;
  vascular: VascularResults | null;
  fatigability: FatigabilityResults | null;
  symptoms: SymptomResults | null;
  'hr-response': HRResponseResults | null;
  'final-report': any | null;
}

// ==========================================
// 6. PERFIL E FARMACOLOGIA
// ==========================================
export interface PatientInfo {
  name: string;
  age: string | number;
  sex: 'male' | 'female' | '';
  weight: string | number;
  height: string | number;
  restingPAS: string | number; 
  restingPAD: string | number; 
  restingSaO2: string | number;
  ejectionFraction: string | number;
  imc?: string | number | null;
  restingFC?: string | number | null;
  structureAlteration?: boolean;
  cateResult?: string | null; 
}

export interface Medications {
  betablockers: boolean;
  bcc_dhp: boolean; 
  bcc_non_dhp: boolean; 
  digitalis: boolean; 
  nitrates: boolean;
  antihypertensives: boolean;
  diuretics: boolean;
  ieca: boolean;
  statins: boolean;
  antiarrhythmics: boolean;
  others?: string;
}