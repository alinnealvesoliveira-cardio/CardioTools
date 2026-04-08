import React, { createContext, useContext, useState } from 'react';
import { PatientInfo, TestResults, Medications } from '../types';

interface PatientContextType {
  patientInfo: PatientInfo;
  setPatientInfo: React.Dispatch<React.SetStateAction<PatientInfo>>;
  medications: Medications;
  setMedications: React.Dispatch<React.SetStateAction<Medications>>;
  testResults: TestResults;
  setTestResults: React.Dispatch<React.SetStateAction<TestResults>>;
  /** * Função para atualizar um teste específico. 
   * O nome deve ser 'updateTestResults' (plural) para sumir as cobrinhas nos componentes.
   */
  updateTestResults: (testId: keyof TestResults, data: any) => void;
  resetData: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

// Valores iniciais conforme diretrizes SBC
const initialPatientInfo: PatientInfo = {
  name: '',
  age: '',
  sex: 'male',
  weight: '',
  height: '',
  imc: null,
  restingPA: '',
  restingFC: '',
  restingSaO2: '',
  goals: '',
  structureAlteration: false,
  ejectionFraction: undefined,
  obstructionSeverity: 'none'
};

const initialMedications: Medications = {
  betablockers: false,
  bcc: false,
  digitalis: false,
  diuretics: false,
  ieca: false,
  statins: false,
  nitrates: false,
  antiarrhythmics: false,
  antihypertensives: false,
  others: ''
};

const initialTestResults: TestResults = {
  fatigabilityScales: {
    rest: { dyspnea: 0, fatigue: 0 },
    exercise: { dyspnea: 0, fatigue: 0 }
  },
  sixMinuteWalkTest: null,
  tsl1m: null,
  tsl30s: null,
  tsl5x: null,
  tug: null,
  stepTest: null,
  vfc: null,
  hrr: null, // Certifique-se que você adicionou hrr no seu arquivo types.ts
  vascularAssessment: null 
};

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patientInfo, setPatientInfo] = useState<PatientInfo>(initialPatientInfo);
  const [medications, setMedications] = useState<Medications>(initialMedications);
  const [testResults, setTestResults] = useState<TestResults>(initialTestResults);

  /**
   * Implementação da função de atualização.
   * Ela usa o spread operator (...) para manter os resultados anteriores e atualizar apenas o novo.
   */
  const updateTestResults = (testId: keyof TestResults, data: any) => {
    setTestResults(prev => ({
      ...prev,
      [testId]: data
    }));
  };

  const resetData = () => {
    setPatientInfo(initialPatientInfo);
    setMedications(initialMedications);
    setTestResults(initialTestResults);
  };

  return (
    <PatientContext.Provider value={{ 
      patientInfo, setPatientInfo, 
      medications, setMedications, 
      testResults, setTestResults,
      updateTestResults, // Nome sincronizado com a Interface
      resetData 
    }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient deve ser usado dentro de um PatientProvider');
  }
  return context;
};