import React, { createContext, useContext, useState } from 'react';
import { PatientInfo, TestResults, Medications } from '../types';

interface PatientContextType {
  patientInfo: PatientInfo;
  setPatientInfo: React.Dispatch<React.SetStateAction<PatientInfo>>;
  medications: Medications;
  setMedications: React.Dispatch<React.SetStateAction<Medications>>;
  testResults: TestResults;
  setTestResults: (results: TestResults) => void;
  updateTestResult: (testId: keyof TestResults, data: any) => void;
  resetData: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

// Informações básicas atualizadas com referências clínicas da SBC
const initialPatientInfo: PatientInfo = {
  name: '',
  age: '',
  sex: '', 
  weight: '',
  height: '',
  imc: null,
  restingPA: '',      
  restingFC: '',      
  restingSaO2: '',    
  goals: '',
  structureAlteration: false,
  /** * Fração de Ejeção do Ventrículo Esquerdo (FEVE)
   * Referência: Diretriz Brasileira de Reabilitação Cardiovascular – SBC, 2020.
   * Corte Crítico: < 40% (Alto Risco)
   */
  ejectionFraction: '', // Alterado para string vazia para facilitar o controle do input
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
  // Adicionei os novos testes que criamos para que o contexto os reconheça
  sixMinuteWalkTest: null,
  tsl1m: null,          // Teste de Sentar e Levantar 1 min
  tsl30s: null,         // Teste de Sentar e Levantar 30 seg
  tsl5x: null,          // Teste de Sentar e Levantar 5 vezes
  tug: null,            // Timed Up and Go
  stepTest: null,
  vfc: null,
  vascularAssessment: null 
};

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patientInfo, setPatientInfo] = useState<PatientInfo>(initialPatientInfo);
  const [medications, setMedications] = useState<Medications>(initialMedications);
  const [testResults, setTestResults] = useState<TestResults>(initialTestResults);

  const updateTestResult = (testId: keyof TestResults, data: any) => {
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
      updateTestResult,
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