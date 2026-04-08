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
  reference?: string; // <--- ADICIONE ESTA LINHA COM A INTERROGAÇÃO
}

// ==========================================
// 2. INTERFACES DE RESULTADOS DOS TESTES
// ==========================================

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

export interface TestResults {
  vsaq?: QuestionnaireResult | null;
  dasi?: QuestionnaireResult | null;

  // Testes Físicos integrados
  sixMinuteWalkTest?: FunctionalTestResult | null;
  stepTest?: FunctionalTestResult | null;
  tug?: FunctionalTestResult | null;
  td2m?: FunctionalTestResult | null;
  tsl1m?: FunctionalTestResult | null;
  tsl30s?: FunctionalTestResult | null;
  tsl5x?: FunctionalTestResult | null;
  
  vfc?: any;

  fatigabilityScales?: {
    rest: { dyspnea: number; fatigue: number };
    exercise: { dyspnea: number; fatigue: number };
  };

  vascularAssessment?: {
    arterial: {
      pulse: string;
      temp: string;
      capillaryRefill: string;
      cif: string;
    };
    venous: {
      ceap: string | string[]; // Ajustado para aceitar string formatada ou array
      godet: string;
      cif: string;
    };
    lymphatic: {
      stemmer: string;
      cif: string;
    };
    centralRisk?: {
      cateFindings: string;
      aorticAneurysm: boolean;
      overallSeverity: 'Normal' | 'Leve' | 'Moderada' | 'Grave';
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
  
  /** * Fração de Ejeção do Ventrículo Esquerdo (FEVE) - SBC 2020
   * A tipagem 'undefined' é crucial para evitar erros de comparação no componente Vascular.
   */
  ejectionFraction?: number | string | undefined; 
  
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