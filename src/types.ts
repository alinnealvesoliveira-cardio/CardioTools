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
  category: Category;
  description: string;
  component: React.ComponentType;
}

// ==========================================
// 2. INTERFACES DE RESULTADOS DOS TESTES
// ==========================================

export interface FunctionalTestResult {
  distance?: number;
  count?: number;
  time?: number;
  predicted: number;
  efficiency: number;
  interpretation: string;
  estimatedMETs?: number;
  hr?: {
    pre: number;
    post: number;
  };
}

export interface TestResults {
  // Testes Funcionais e de Capacidade
  vsaq?: FunctionalTestResult;
  dasi?: FunctionalTestResult;
  tc6m?: FunctionalTestResult;
  tug?: FunctionalTestResult;
  td2m?: FunctionalTestResult;
  tsl1m?: FunctionalTestResult;
  tsl30s?: FunctionalTestResult;
  tsl5x?: FunctionalTestResult;
  
  // Escalas de Borg / Fadiga
  fatigabilityScales?: {
    rest: { dyspnea: number; fatigue: number };
    exercise: { dyspnea: number; fatigue: number };
  };

  // Avaliação Vascular (Exame Físico)
  vascularPhysicalExam?: {
    arterial: {
      pulse: string;
      temp: string;
      capillaryRefill: string;
      cif: string;
    };
    venous: {
      ceap: string[];
      godet: string;
      cif: string;
    };
    lymphatic: {
      stemmer: string;
      cif: string;
    };
  };
}

// ==========================================
// 3. PERFIL DO PACIENTE E MEDICAMENTOS
// ==========================================

export interface PatientInfo {
  name: string;
  age: string;
  sex: 'male' | 'female' | '';
  weight: string;
  height: string;
  imc: number | null;
  goals?: string;
  structureAlteration?: boolean;
  ejectionFraction?: number;
  obstructionSeverity?: 'none' | 'mild' | 'moderate' | 'severe';
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