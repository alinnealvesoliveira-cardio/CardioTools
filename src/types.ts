import React from 'react';

// ==========================================
// 1. TIPOS DE NAVEGAÇÃO E CATEGORIAS
// ==========================================

export type CategoryName = 
  | 'Home'
  | 'Cadastro' 
  | 'Avaliação Autonômica' 
  | 'Vascular' 
  | 'Capacidade Aeróbica' 
  | 'Avaliação de Sintomas' 
  | 'DASI'
  | 'Relatório Final';

export interface Category {
  id: CategoryName; // Unificado: usando o tipo de string restrito
  name: string;
  icon: React.ElementType;
}

export interface Calculator {
  id: string;
  name: string;
  description: string;
  category: string; // Pode ser CategoryName se desejar maior rigor
  component: React.ComponentType<any>;
}

// ==========================================
// 2. TEMPLATES DE PONTUAÇÃO
// ==========================================

export interface ScoreOption {
  label: string;
  score: number;
  description?: string;
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
// 3. INTERFACES DE RESULTADOS E DADOS
// ==========================================

export interface CIFData {
  qualifier: number;
  interpretation?: string; 
  severity?: string;
}

export interface FunctionalTestResult {
  distance?: number;
  count?: number;
  time?: number;
  predicted?: number;
  efficiency?: number;
  interpretation?: string;
  estimatedMETs?: number;
  restingHR?: number;
  peakHR?: number;
  hr?: {
    pre: number;
    post: number;
  };
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

// ==========================================
// 4. INTERFACE PRINCIPAL DE TESTES (TEST RESULTS)
// ==========================================

export interface TestResults {
  vsaq?: QuestionnaireResult | null;
  dasi?: QuestionnaireResult | null;

  sixMinuteWalkTest?: FunctionalTestResult | null;
  stepTest?: FunctionalTestResult | null;
  tug?: FunctionalTestResult | null;
  td2m?: FunctionalTestResult | null;
  tsl1m?: FunctionalTestResult | null;
  tsl30s?: FunctionalTestResult | null;
  tsl5x?: FunctionalTestResult | null;
  sitToStandTest?: FunctionalTestResult | null; 

  hrr?: {
    peakHR: number;
    recoveryHR: number;
    delta: number;
    interpretation: string;
  } | null;

  orthostaticDrop?: {
    supine: { pas: number; pad: number };
    standing: { pas: number; pad: number };
    delta: { deltaPAS: number; deltaPAD: number };
    interpretation: string;
  } | null;
  
  vfc?: {
    sdnn?: number;
    rmssd?: number; 
    interpretation?: string;
  } | null;

  rmssd?: number; 

  claudication?: boolean | {
    score: number;
    interpretation: string;
    timestamp: string;
  };

  symptoms?: {
    claudication?: boolean | {
      score: number;
      interpretation: string;
      timestamp: string;
    };
    claudicationDetails?: { 
      title: string;
      description: string;
    };
    angina: {
      type: string; 
      description: string;
      ccsGrade?: number | undefined;
    };
  };

  fatigabilityScales?: {
    rest: { dyspnea: number; fatigue: number };
    exercise: { dyspnea: number; fatigue: number };
  } | null;

  abi?: number;            
  abiAnkleBP?: number;     
  abiArmBP?: number;       

  vascularAssessment?: {
    arterial: { 
      pulse: string; 
      temp: string; 
      capillaryRefill: string; 
      itb?: number;
      cif?: CIFData; 
    };
    venous: { 
      ceap?: string[]; 
      godet: string; 
      cif?: CIFData; 
    };
    lymphatic: { 
      stemmer: string; 
      cif?: CIFData; 
    };
  } | null;
}

// ==========================================
// 5. PERFIL E FARMACOLOGIA
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
  bcc: boolean; 
  digitalis: boolean; 
  nitrates: boolean;
  antihypertensives: boolean;
  diuretics: boolean;
  ieca: boolean;
  statins: boolean;
  antiarrhythmics: boolean;
  others: string;
}