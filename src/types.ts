import React from 'react';

// ==========================================
// 1. INTERFACES DE NAVEGAÇÃO
// ==========================================
export interface Calculator {
  id: string;
  name: string;
  description: string; 
  category: string;
  component: React.ComponentType<any>;
}

export interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
}

// ==========================================
// 2. INTERFACES DE APOIO (CIF E RESULTADOS)
// ==========================================
export interface CIFData {
  qualifier: number;
  interpretation: string;
}

export interface FunctionalTestResult {
  distance?: number;
  count?: number;
  time?: number;
  predicted?: number;
  efficiency?: number;
  interpretation?: string;
  estimatedMETs?: number;
  hr?: { pre: number; post: number; };
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
// 3. INTERFACE PRINCIPAL (TESTES)
// ==========================================
export interface TestResults {
  vsaq?: QuestionnaireResult | null;
  dasi?: QuestionnaireResult | null;

  // Testes Funcionais
  sixMinuteWalkTest?: FunctionalTestResult | null;
  stepTest?: FunctionalTestResult | null;
  tug?: FunctionalTestResult | null;
  td2m?: FunctionalTestResult | null;
  tsl1m?: FunctionalTestResult | null;
  tsl30s?: FunctionalTestResult | null;
  tsl5x?: FunctionalTestResult | null;
  
  // Frequência Cardíaca e VFC
  hrr?: {
    peakHR: number;
    recoveryHR: number;
    delta: number;
    interpretation: string;
  } | null;
  
  vfc?: {
    sdnn?: number;
    rmssd?: number;
    interpretation?: string;
  } | null;

  // Sintomas e Angina
  symptoms?: {
    claudication?: boolean;
    angina?: {
      type: string;
      description: string;
      ccsGrade?: number;
    };
  } | null;

  // Escalas de Borg
  fatigabilityScales?: {
    rest: { dyspnea: number; fatigue: number };
    exercise: { dyspnea: number; fatigue: number };
  };

  // Avaliação Vascular (ESTRUTURA CORRIGIDA)
  vascularAssessment?: {
    arterial: { 
      pulse: string; 
      temp: string; 
      capillaryRefill: string; 
      cif: CIFData; 
    };
    venous: { 
      ceap?: string[]; 
      godet: string; 
      cif: CIFData; 
    };
    lymphatic: { 
      stemmer: string; 
      cif: CIFData; 
    };
  } | null;
}

// ==========================================
// 4. PERFIL DO PACIENTE
// ==========================================
export interface PatientInfo {
  name: string;
  age: string | number;
  sex: 'male' | 'female' | '';
  weight: string | number;
  height: string | number;
  imc?: number | string | null;
  restingPAS?: string | number; 
  restingPAD?: string | number; 
  restingFC?: string | number;
  restingSaO2?: string | number;
  structureAlteration?: boolean;
  ejectionFraction?: string | number;
}

// ==========================================
// 5. MEDICAMENTOS
// ==========================================
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