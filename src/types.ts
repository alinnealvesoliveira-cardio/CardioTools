import React from 'react';

// ==========================================
// 1. NAVEGAÇÃO E UI
// ==========================================
export type NavId = 
  | 'Home' | 'Cadastro' | 'Anamnese' | 'Avaliação Autonômica' | 'Vascular' 
  | 'Capacidade Aeróbica' | 'Avaliação de Sintomas' | 'Fatigabilidade' | 'Relatório Final';

export type CategoryName = 
  | 'cadastro' | 'anamnese' | 'autonomic' | 'vascular' | 'aerobic' 
  | 'symptoms' | 'fatigability' | 'final-report';

export interface Calculator {
  id: string;
  name: string;
  description: string;
  category: CategoryName;
  component: React.ComponentType<any>;
}

// ==========================================
// 2. ESTRUTURAS DE SCORING (GroupedScoreTemplate)
// ==========================================
export interface ScoreOption {
  label: string;
  score: number;
}

export interface ScoreItem {
  id: string;
  question: string;
  options: ScoreOption[];
}

export interface ScoreGroup {
  title: string;
  items: ScoreItem[];
}

// ==========================================
// 3. ESTRUTURAS CIF E CLASSIFICAÇÃO (Util)
// ==========================================
export interface CIFData {
  qualifier: number | string;
  interpretation?: string; 
  severity?: string;
}

export interface CIFClassification {
  qualifier: number;
  severity: string;
  deficiencyRange: string;
  performanceRange: string;
  color: string;
  bgClass: string;
}

export interface CBDFResult {
  qualifier: number;
  severity: string;
  color: string;
  bgLight: string;
  description: string;
}

// ==========================================
// 4. ESTRUTURAS DE RESULTADOS DE TESTES
// ==========================================
export interface FunctionalTestResult {
  score?: number;
  distance?: number;
  count?: number;
  time?: number;
  predicted?: number;
  efficiency?: number;
  interpretation?: string;
  estimatedMETs?: number;
  restingHR?: number;
  peakHR?: number;
  hr?: { pre: number; post: number };
  cif?: CIFData;
}

export interface QuestionnaireResult {
  score: number;
  estimatedMETs: number;
  predictedMETs: number;
  percentage: number;
  interpretation: string;
  cif?: CIFData;
}

export interface VSAQResult {
  met: number;
  interpretation: string;
  description: string;
  cif?: CIFData | null;
}

// ==========================================
// 5. ESTRUTURAS POR CATEGORIA
// ==========================================
export interface AerobicResults {
  vsaq?: VSAQResult | null;
  dasi?: QuestionnaireResult | null;
  sixMinuteWalkTest?: FunctionalTestResult | null;
  stepTest?: FunctionalTestResult | null;
  tug?: FunctionalTestResult | null;
  td2m?: FunctionalTestResult | null;
  tsl1m?: FunctionalTestResult | null;
  tsl30s?: FunctionalTestResult | null;
  tsl5x?: FunctionalTestResult | null;
  sitToStandTest?: FunctionalTestResult | null;
}

export interface AutonomicResults {
  hrr?: { peakHR: number; recoveryHR: number; delta: number; interpretation: string } | null;
  orthostaticDrop?: {
    supine: { pas: number; pad: number };
    standing: { pas: number; pad: number };
    delta: { deltaPAS: number; deltaPAD: number };
    interpretation: string;
  } | null;
  rmssd?: number | null;
  hrvInterpretation?: string | null;
}

export interface VascularResults {
  abi?: number;
  abiAnkleBP?: number;
  abiArmBP?: number;
  vascularAssessment?: {
    arterial: { pulse: string; temp: string; capillaryRefill: string; itb?: number; cif?: CIFData };
    venese: { ceap?: string[]; godet: string; cif?: CIFData };
    lymphatic: { stemmer: string; cif?: CIFData };
  } | null;
}

export interface SymptomsResults {
  claudication?: { score: number; interpretation: string; timestamp: string };
  claudicationDetails?: { title: string; description: string };
  angina: { type: string; description: string; ccsGrade?: number };
}

export interface FatigabilityResults {
  rest: { dyspnea: number; fatigue: number };
  exercise: { dyspnea: number; fatigue: number };
}

export interface CadastroResults {
  patientInfo: PatientInfo | null;
  medications: Medications | null;
}

export interface FinalReportResults {
  summary: string;
  recommendations: string[];
  generatedAt: string;
  cifGlobal?: CIFData;
}

// ==========================================
// 6. INTERFACE PRINCIPAL
// ==========================================
export interface TestResults {
  aerobic: AerobicResults;
  autonomic: AutonomicResults;
  vascular: VascularResults;
  symptoms: SymptomsResults;
  fatigability: FatigabilityResults | null;
  cadastro: CadastroResults | null;
  'final-report': FinalReportResults | null;
}

// ==========================================
// 7. PERFIL E FARMACOLOGIA
// ==========================================
export interface PatientInfo {
  name: string;
  age: string | number;
  sex: 'male' | 'female' | '';
  weight: string | number;
  height: string | number;
  imc?: number | string | null;
  restingPAS: string | number; 
  restingPAD: string | number; 
  restingFC: string | number;
  restingSaO2: string | number;
  structureAlteration: boolean;
  ejectionFraction: string | number;
  cateResult?: string; 
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
  others: string;
}