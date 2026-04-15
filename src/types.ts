import React from 'react';

// ==========================================
// 1. INTERFACES DE NAVEGAÇÃO E TEMPLATES
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

/**
 * Interfaces para GroupedScoreTemplate
 * Define a estrutura de perguntas e opções de pontuação
 */
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


// Adicione isto ao seu types.ts
export type CategoryName = 
  | 'Home'
  | 'Cadastro' 
  | 'Avaliação Autonômica' 
  | 'Vascular' 
  | 'Capacidade Aeróbica' 
  | 'Avaliação de Sintomas' 
  | 'DASI'
  | 'Relatório Final';

// Atualize sua interface Category existente para usar o nome tipado
export interface Category {
  CategoryId: CategoryName; // Agora o ID deve ser um dos nomes acima
  name: string;
  icon: React.ElementType;
}
// ==========================================
// 2. INTERFACES DE APOIO (CIF E RESULTADOS)
// ==========================================
export interface CIFData {
  qualifier: number;
  // interpretation opcional e severity string para compatibilidade total
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
  // Suporte específico para o teste de Sentar e Levantar
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
// 3. INTERFACE PRINCIPAL DE DADOS (TEST RESULTS)
// ==========================================
export interface TestResults {
  // --- Questionários ---
  vsaq?: QuestionnaireResult | null;
  dasi?: QuestionnaireResult | null;

  // --- Testes de Capacidade Funcional ---
  sixMinuteWalkTest?: FunctionalTestResult | null;
  stepTest?: FunctionalTestResult | null;
  tug?: FunctionalTestResult | null;
  td2m?: FunctionalTestResult | null;
  tsl1m?: FunctionalTestResult | null;
  tsl30s?: FunctionalTestResult | null;
  tsl5x?: FunctionalTestResult | null;
  sitToStandTest?: FunctionalTestResult | null; 

  // --- Hemodinâmica e Avaliação Autonômica ---
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

  // Propriedade direta para compatibilidade com HRV.tsx
  rmssd?: number; 

  // --- Sintomatologia e Escalas de Dor ---
  // claudication na raiz para ClaudicationScale.tsx
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
    // Detalhes gerados pelo algoritmo de decisão clínica
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

  // --- Outras Escalas e ABI ---
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
// 4. PERFIL DO PACIENTE E CLÍNICA
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

// ==========================================
// 5. SUPORTE FARMACOLÓGICO
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