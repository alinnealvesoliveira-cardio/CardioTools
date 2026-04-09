import React from 'react';

// ==========================================
// 1. INTERFACES DE NAVEGAÇÃO (Limpa erros no App.tsx)
// ==========================================
export interface Calculator {
  id: string;
  name: string;
  description: string; // ADICIONADO: Para resolver as cobrinhas no registry.ts
  category: string;
  component: React.ComponentType<any>;
}

export interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
}

// ==========================================
// 2. INTERFACES DE APOIO AOS TESTES
// ==========================================
export interface FunctionalTestResult {
  distance?: number;
  count?: number;
  time?: number;
  predicted?: number;
  efficiency?: number;
  interpretation?: string;
  estimatedMETs?: number;
  hr?: { pre: number; post: number; };
  // Essencial para o cálculo de capacidade aeróbica no Diagnóstico Funcional
  cif?: { qualifier: number; severity: string; };
}

export interface QuestionnaireResult {
  score: number;
  estimatedMETs: number;
  predictedMETs: number;
  percentage: number;
  interpretation: string;
  cif?: { qualifier: number; severity: string; };
}

// ==========================================
// 3. INTERFACE PRINCIPAL (TESTES)
// ==========================================
export interface TestResults {
  vsaq?: QuestionnaireResult | null;
  dasi?: QuestionnaireResult | null;

  // Sincronizado com os componentes de teste (TC6M, TD2M, etc)
  sixMinuteWalkTest?: FunctionalTestResult | null;
  stepTest?: FunctionalTestResult | null;
  tug?: FunctionalTestResult | null;
  td2m?: FunctionalTestResult | null;
  tsl1m?: FunctionalTestResult | null;
  tsl30s?: FunctionalTestResult | null;
  tsl5x?: FunctionalTestResult | null;
  
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

  // Estrutura que resolve as cobrinhas no AnginaAlgorithm
  symptoms?: {
    claudication?: boolean;
    angina?: {
      type: string;
      description: string;
      ccsGrade?: number;
    };
  } | null;

  fatigabilityScales?: {
    rest: { dyspnea: number; fatigue: number };
    exercise: { dyspnea: number; fatigue: number };
  };

  vascularAssessment?: {
    arterial: { pulse: string; temp: string; capillaryRefill: string; cif: string; };
    venous: { ceap: string[]; godet: string; cif: string; };
    lymphatic: { stemmer: string; cif: string; };
  } | null;
}

// ==========================================
// 4. PERFIL DO PACIENTE (Limpa erros no PatientRegistration.tsx)
// ==========================================
export interface PatientInfo {
  name: string;
  age: string | number;
  sex: 'male' | 'female' | '';
  weight: string | number;
  height: string | number;
  imc?: number | string | null;
  // Campos vitais essenciais
  restingPAS?: string | number; 
  restingPAD?: string | number; 
  restingFC?: string | number;
  restingSaO2?: string | number;
  structureAlteration?: boolean;
  ejectionFraction?: string | number;
}

// ==========================================
// 5. MEDICAMENTOS (Limpa erros no FunctionalDiagnosis.tsx)
// ==========================================
export interface Medications {
  betablockers: boolean;
  bcc: boolean; // Bloqueadores de Canal de Cálcio
  digitalis: boolean; // Digitálicos
  nitrates: boolean;
  antihypertensives: boolean;
  diuretics: boolean;
  ieca: boolean;
  statins: boolean;
  antiarrhythmics: boolean;
  others: string;
}