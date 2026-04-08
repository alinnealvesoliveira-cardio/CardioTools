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
  // Todos os testes agora seguem o padrão FunctionalTestResult
  vsaq?: FunctionalTestResult;
  dasi?: FunctionalTestResult;
  tc6m?: FunctionalTestResult;
  tug?: FunctionalTestResult;
  td2m?: FunctionalTestResult;
  tsl1m?: FunctionalTestResult;
  tsl30s?: FunctionalTestResult;
  tsl5x?: FunctionalTestResult;
  
  fatigabilityScales?: {
    rest: { dyspnea: number; fatigue: number };
    exercise: { dyspnea: number; fatigue: number };
  };

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