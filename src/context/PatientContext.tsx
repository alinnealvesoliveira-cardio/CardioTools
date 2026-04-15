import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PatientInfo, TestResults, Medications } from '../types';

interface PatientContextType {
  patientInfo: PatientInfo;
  setPatientInfo: React.Dispatch<React.SetStateAction<PatientInfo>>;
  updatePatientInfo: (updates: Partial<PatientInfo>) => void;
  medications: Medications;
  setMedications: React.Dispatch<React.SetStateAction<Medications>>;
  testResults: TestResults;
  setTestResults: React.Dispatch<React.SetStateAction<TestResults>>;
  updateTestResults: (updates: Partial<TestResults>) => void;
  resetData: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

const STORAGE_KEY = 'cardiotools_v2_data';

const initialPatientInfo: PatientInfo = {
  name: '',
  age: '',
  sex: 'male',
  weight: '',
  height: '',
  restingPAS: '', 
  restingPAD: '', 
  restingFC: '',
  restingSaO2: '',
  structureAlteration: false,
  ejectionFraction: '',
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
  td2m: null,
  stepTest: null,
  vascularAssessment: null,
  hrr: null,
  symptoms: {
    claudication: false,
    angina: {
      type: 'none',
      description: ''
    }
  }
};

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado inicial carregado do LocalStorage para persistência
  const [patientInfo, setPatientInfo] = useState<PatientInfo>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_info`);
    return saved ? { ...initialPatientInfo, ...JSON.parse(saved) } : initialPatientInfo;
  });

  const [medications, setMedications] = useState<Medications>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_meds`);
    return saved ? { ...initialMedications, ...JSON.parse(saved) } : initialMedications;
  });

  const [testResults, setTestResults] = useState<TestResults>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tests`);
    return saved ? { ...initialTestResults, ...JSON.parse(saved) } : initialTestResults;
  });

  // Efeito de Persistência Auto-save
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_info`, JSON.stringify(patientInfo));
    localStorage.setItem(`${STORAGE_KEY}_meds`, JSON.stringify(medications));
    localStorage.setItem(`${STORAGE_KEY}_tests`, JSON.stringify(testResults));
  }, [patientInfo, medications, testResults]);

  // Funções de atualização usando useCallback para evitar re-renders infinitos em sub-componentes
  const updatePatientInfo = useCallback((updates: Partial<PatientInfo>) => {
    setPatientInfo(prev => ({ ...prev, ...updates }));
  }, []);

  const updateTestResults = useCallback((updates: Partial<TestResults>) => {
    setTestResults(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  const resetData = useCallback(() => {
    if (window.confirm("Isso apagará todos os dados da avaliação atual. Deseja continuar?")) {
      localStorage.removeItem(`${STORAGE_KEY}_info`);
      localStorage.removeItem(`${STORAGE_KEY}_meds`);
      localStorage.removeItem(`${STORAGE_KEY}_tests`);
      setPatientInfo(initialPatientInfo);
      setMedications(initialMedications);
      setTestResults(initialTestResults);
    }
  }, []);

  return (
    <PatientContext.Provider value={{ 
      patientInfo, setPatientInfo, updatePatientInfo,
      medications, setMedications, 
      testResults, setTestResults, updateTestResults,
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