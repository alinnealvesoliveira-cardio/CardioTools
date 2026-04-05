import React from 'react';

export type Category = 
  | 'Cadastro' 
  | 'Avaliação Autonômica' 
  | 'Integridade Vascular' 
  | 'Capacidade Aeróbica' 
  | 'Sintomas'
  | 'Relatório Final';

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
  age: string;
  sex: 'male' | 'female';
  weight: string;
  height: string;
  imc: number | null;
  goals: string;
  structureAlteration: boolean;
}

export interface TestResults {
  hrr?: {
    peakHR: number;
    recoveryHR: number;
    delta: number;
    interpretation: string;
  };
  orthostaticDrop?: {
    supine: { pas: number; pad: number };
    standing: { pas: number; pad: number };
    delta: { pas: number; pad: number };
    interpretation: string;
  };
  hrv?: {
    rmssd: number;
    interpretation: string;
  };
    vsaq?: {
      score: number;
      estimatedMETs: number;
      predictedMETs: number;
      percentage: number;
      interpretation: string;
      cif?: { qualifier: number; severity: string };
    };
    tsl30s?: {
      count: number;
      interpretation: string;
      cif?: { qualifier: number; severity: string };
      hr?: { pre: number; post: number };
    };
    tsl5x?: {
      time: number;
      interpretation: string;
      cif?: { qualifier: number; severity: string };
      hr?: { pre: number; post: number };
    };
    td2m?: {
      count: number;
      interpretation: string;
      cif?: { qualifier: number; severity: string };
      hr?: { pre: number; post: number };
    };
    tsl1m?: {
      count: number;
      interpretation: string;
      cif?: { qualifier: number; severity: string };
      hr?: { pre: number; post: number };
    };
    tug?: {
      time: number;
      interpretation: string;
      cif?: { qualifier: number; severity: string };
      hr?: { pre: number; post: number };
    };
    abi?: {
    right: { value: number; interpretation: string; ankleBP?: number; armBP?: number };
    left: { value: number; interpretation: string; ankleBP?: number; armBP?: number };
  };
  tc6m?: {
    distance: number;
    predicted: number;
    efficiency: number;
    fatigability: {
      limitingFactor: string;
      dyspneaDelta: number;
      fatigueDelta: number;
    };
    hr?: { pre: number; post: number };
  };
  vascularImpairment?: {
    arterial?: { qualifier: number; severity: string };
    venous?: { qualifier: number; severity: string };
    lymphatic?: { qualifier: number; severity: string };
  };
  fatigabilityScales?: {
    rest?: { dyspnea: number; fatigue: number };
    exercise?: { dyspnea: number; fatigue: number };
  };
  symptoms?: {
    claudication: boolean;
    claudicationDetails?: {
      title: string;
      description: string;
    };
    angina?: {
      type: 'Típica' | 'Atípica' | 'Não Cardíaca' | 'Instável';
      ccsGrade?: 1 | 2 | 3 | 4;
      description: string;
    };
  };
}

export interface Calculator {
  id: string;
  name: string;
  description: string;
  category: Category;
  component: React.ComponentType;
  reference?: string;
}

export interface ScoreItem {
  id: string;
  question: string;
  options: {
    label: string;
    score: number;
    description?: string;
  }[];
}

export interface ScoreGroup {
  title: string;
  items: ScoreItem[];
}
