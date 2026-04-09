import React, { createContext, useContext, useState, useEffect } from 'react';
import { PatientInfo, TestResults, Medications } from '../types';

interface PatientContextType {
  patientInfo: PatientInfo;
  setPatientInfo: React.Dispatch<React.SetStateAction<PatientInfo>>;
  medications: Medications;
  setMedications: React.Dispatch<React.SetStateAction<Medications>>;
  testResults: TestResults;
  setTestResults: React.Dispatch<React.SetStateAction<TestResults>>;
  updateTestResults: (testId: keyof TestResults, data: any) => void;
  resetData: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

// Chave para o armazenamento local
const STORAGE_KEY = 'cardiotools_patient_data';

const initialPatientInfo: PatientInfo = {
  name: '',
  age: '',
  sex: 'male',
  weight: '',
  height: '',
  imc: null,
  restingPA: '', 
  restingPAS: '', 
  restingPAD: '', 
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
  hrr: null, 
  vascularAssessment: null 
};

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicialização com busca no LocalStorage
  const [patientInfo, setPatientInfo] = useState<PatientInfo>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_info`);
    return saved ? JSON.parse(saved) : initialPatientInfo;
  });

  const [medications, setMedications] = useState<Medications>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_meds`);
    return saved ? JSON.parse(saved) : initialMedications;
  });

  const [testResults, setTestResults] = useState<TestResults>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tests`);
    return saved ? JSON.parse(saved) : initialTestResults;
  });

  // Efeito para persistir dados sempre que houver mudança
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_info`, JSON.stringify(patientInfo));
    localStorage.setItem(`${STORAGE_KEY}_meds`, JSON.stringify(medications));
    localStorage.setItem(`${STORAGE_KEY}_tests`, JSON.stringify(testResults));
  }, [patientInfo, medications, testResults]);

  const updateTestResults = (testId: keyof TestResults, data: any) => {
    setTestResults(prev => ({
      ...prev,
      [testId]: data
    }));
  };

  const resetData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_info`);
    localStorage.removeItem(`${STORAGE_KEY}_meds`);
    localStorage.removeItem(`${STORAGE_KEY}_tests`);
    setPatientInfo(initialPatientInfo);
    setMedications(initialMedications);
    setTestResults(initialTestResults);
  };

  return (
    <PatientContext.Provider value={{ 
      patientInfo, setPatientInfo, 
      medications, setMedications, 
      testResults, setTestResults,
      updateTestResults,
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