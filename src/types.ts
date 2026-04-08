import React from 'react';

// ==========================================
// 1. TIPOS DE NAVEGAÇÃO E INTERFACE DO APP
// ==========================================

export type Category = 
  | 'Cadastro' 
  | 'Avaliação Autonômica' 
  | 'Capacidade Aeróbica' 
  | 'Funcional' 
  | 'Vascular' 
  | 'Relatório Final' 
  | 'Avaliação de Sintomas';

export interface Calculator {
  id: string;
  name: string;
  description: string;
  category: string;
  component: React.ComponentType<any>;
  reference?: string; 
}

// ==========================================
// 2. INTERFACES DE RESULTADOS DOS TESTES
// ==========================================

/** Interface genérica para testes de esforço/funcionais */
export interface FunctionalTestResult {
  distance?: number;
  count?: number;
  time?: number;
  predicted?: number;
  efficiency?: number;
  interpretation?: string;
  estimatedMETs?: number;
  hr?: {
    pre: number;
    post: number;
  };
}

/** Interface para questionários (VSAQ, DASI) */
export interface QuestionnaireResult {
  score: number;
  estimatedMETs: number;
  predictedMETs: number;
  percentage: number;
  interpretation: string;
  cif?: {
    qualifier: number;
    severity: string;
  };
}

/** Agregador de todos os resultados da avaliação */
export interface TestResults {
  // Questionários
  vsaq?: QuestionnaireResult | null;
  dasi?: QuestionnaireResult | null;

  // Testes Físicos e Funcionais
  sixMinuteWalkTest?: FunctionalTestResult | null;
  stepTest?: FunctionalTestResult | null;
  tug?: FunctionalTestResult | null;
  td2m?: FunctionalTestResult | null;
  tsl1m?: FunctionalTestResult | null;
  tsl30s?: FunctionalTestResult | null;
  tsl5x?: FunctionalTestResult | null;
  
  // Avaliação Autonômica (HRR adicionado para remover a cobrinha)
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

  // Escalas e Sintomas
  fatigabilityScales?: {
    rest: { dyspnea: number; fatigue: number };
    exercise: { dyspnea: number; fatigue: number };
  };

  // Avaliação Vascular (Consistente com seu componente de Exame Vascular)
  vascularAssessment?: {
    arterial: {
      pulse: string;
      temp: string;
      capillaryRefill: string;
      cif: string;
    };
    venous: {
      ceap?: string | string[];
      godet: string;
      cif: string;
    };
    lymphatic: {
      stemmer: string;
      cif: string;
    };
    centralRisk?: {
      cateFindings?: string;
      aorticAneurysm?: boolean;
      overallSeverity?: 'Normal' | 'Leve' | 'Moderada' | 'Grave';
    };
  } | null;
}

// ==========================================
// 3. PERFIL DO PACIENTE E MEDICAMENTOS
// ==========================================

export interface PatientInfo {
  name: string;
  age: string | number;
  sex: 'male' | 'female' | '';
  weight: string | number;
  height: string | number;
  imc: number | string | null;
  
  goals?: string;
  
  restingPA?: string;
  restingFC?: string | number;
  restingSaO2?: string | number;

  structureAlteration?: boolean;
  
  /** Fração de Ejeção do Ventrículo Esquerdo (FEVE) - SBC 2020 */
  ejectionFraction?: number | string; 
  
  obstructionSeverity?: 'none' | 'mild' | 'moderate' | 'severe';
  coronaryArteriesAffected?: '0' | '1' | '2' | '3' | 'TRONCO'; 
  
  aorticAneurysm?: boolean;
  aortaDiameter?: string; 
}

export interface Medications {
  betablockers: boolean;
  bcc: boolean;
  digitalis: boolean;
  diuretics: boolean;
  ieca: boolean;
  statins: boolean;
  nitrates: boolean;
  antiarrhythmics: boolean;
  antihypertensives: boolean;
  others: string;
}