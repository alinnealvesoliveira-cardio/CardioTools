import React from 'react';

export type Category = 
  | 'autonomic' 
  | 'diagnosis' 
  | 'hemodynamics' 
  | 'vascular' 
  | 'functional' 
  | 'clinical'
  | 'assessment'
  | 'registration' 
  | 'final-report' 
  | 'symptoms' 
  | 'aerobic-capacity';

export interface Calculator {
  id: string;
  name: string;
  description: string; 
  category: Category;
  path?: string; 
  component: React.ComponentType<any>; 
  reference?: string; 
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
}

export interface PatientInfo {
  name: string;
  age: number | string;
  sex: 'male' | 'female';
  weight: number | string;
  height: number | string;
  imc: number | null;
  goals: string;
  structureAlteration: boolean;
  restingPA?: string;
  restingFC?: string;
  restingSaO2?: string;
  ejectionFraction?: number;
  obstructionSeverity?: 'none' | 'mild' | 'moderate' | 'severe';
}

// Interface padronizada para os testes funcionais que usam METs e CIF
export interface FunctionalTestResult {
  score: number;
  estimatedMETs: number;
  predictedMETs: number;
  percentage: number;
  interpretation: string;
  cif?: { 
    qualifier: number; 
    severity: string 
  };
}
export interface TestResults {
  vsaq?: FunctionalTestResult;
  dasi?: FunctionalTestResult;
  tug?: {
    time: number;
    predicted: number;
    efficiency: number;
    interpretation: string;
    hr?: any;
  };
  td2m?: {
    count: number;
    predicted: number;
    efficiency: number;
    interpretation: string;
    hr?: any;
  };
  tc6m?: {
    distance: number;
    predicted: number;
    efficiency: number;
    hr: { 
      pre: number; 
      post: number; 
    };
  };
  tsl1m?: {
    count: number;
    predicted: number;
    efficiency: number;
    interpretation: string;
    hr?: any;
  };
  tsl5x?: {
    time: number;
    predicted: number;
    efficiency: number;
    interpretation: string;
    hr?: any;
  };
  tsl30s?: {
    count: number;
    predicted: number;
    efficiency: number;
    interpretation: string;
    hr?: any;
  };
  fatigabilityScales?: {
    rest: { 
      dyspnea: number; 
      fatigue: number 
    };
    exercise: { 
      dyspnea: number; 
      fatigue: number 
    };
  };
}