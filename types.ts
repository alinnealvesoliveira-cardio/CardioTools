import React from 'react';

// ==========================================
// 1. NAVEGAÇÃO (Fonte Única da Verdade)
// ==========================================
// Use estes IDs em todo o projeto: Sidebar, Roteamento, State
export type AppRoute = 
  | 'home' 
  | 'cadastro' 
  | 'anamnese' 
  | 'autonomic' 
  | 'vascular' 
  | 'aerobic' 
  | 'fatigability' 
  | 'symptoms' 
  | 'hr-response' 
  | 'final-report';

export type NavId = AppRoute;
export type CategoryName = AppRoute;

// ==========================================
// 2. INTERFACES DE RESULTADOS (MODULARES)
// ==========================================

export interface CIFData {
  qualifier: number | string;
  interpretation?: string; 
  severity?: string;
}

export interface DasiResults {
  percentage: number;
  estimatedMETs?: number;
  interpretation?: string;
  score?: number;
  predictedMETs?: number;
  cif?: CIFData;
}

export interface FunctionalTestResult {
  value?: number;
  count?: number;
  time?: number;
  predicted?: number;
  efficiency?: number;
  percentage?: number;
  classification?: string;
  timestamp?: string;
  hr?: { pre: number; post: number };
  cif?: CIFData;
  interpretation?: string;
}

export interface SixMinuteWalkResult extends FunctionalTestResult {
  distance: number;
}

// --- Grupos de Resultados ---
export interface CadastroResults {
  patientInfo: PatientInfo | null;
  medications: Medications | null;
}

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
    met?: number;
    interpretation?: string;
    description?: string;
  } | null;
  dasi?: DasiResults | null;
}

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

export interface FatigabilityResults {
  rest: { dyspnea?: number; fatigue?: number };
  exercise: { dyspnea?: number; fatigue?: number };
}

export interface SymptomResults {
  claudication?: { score?: number; interpretation?: string; timestamp?: string };
  angina?: { type?: string; description?: string; ccsGrade?: number };
}

export interface HRResponseResults {
  restingHR: number;
  peakHR: number;
  recoveryHR: number;
  delta: number;
  interpretation: string;
}

// ==========================================
// 3. INTERFACE PRINCIPAL (O CONTRATO)
// ==========================================
export interface TestResults {
  home: null; // Dashboard não armazena resultados de teste
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
// 4. MODELOS DE DADOS
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