import React, { createContext, useContext, useState, useEffect } from 'react';
import { PatientInfo, TestResults, Medications } from '../types';

interface PatientContextType {
  patientInfo: PatientInfo;
  setPatientInfo: React.Dispatch<React.SetStateAction<PatientInfo>>;
  updatePatientInfo: (updates: Partial<PatientInfo>) => void; // Adicionado para limpar erros no registro
  medications: Medications;
  setMedications: React.Dispatch<React.SetStateAction<Medications>>;
  testResults: TestResults;
  setTestResults: React.Dispatch<React.SetStateAction<TestResults>>;
  updateTestResults: (updates: Partial<TestResults>) => void; // Melhorado para aceitar atualizações parciais
  resetData: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

const STORAGE_KEY = 'cardiotools_patient_data';

// Sincronizado com os campos que você usa no formulário
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

// Sincronizado com os nomes oficiais: sixMinuteWalkTest, td2m, etc.
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

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_info`, JSON.stringify(patientInfo));
    localStorage.setItem(`${STORAGE_KEY}_meds`, JSON.stringify(medications));
    localStorage.setItem(`${STORAGE_KEY}_tests`, JSON.stringify(testResults));
  }, [patientInfo, medications, testResults]);

  // Função utilitária para facilitar atualizações
  const updatePatientInfo = (updates: Partial<PatientInfo>) => {
    setPatientInfo(prev => ({ ...prev, ...updates }));
  };

  // Melhorado para lidar com objetos complexos como 'symptoms'
  const updateTestResults = (updates: Partial<TestResults>) => {
    setTestResults(prev => ({
      ...prev,
      ...updates
    }));
  };

  const resetData = () => {
    localStorage.clear();
    setPatientInfo(initialPatientInfo);
    setMedications(initialMedications);
    setTestResults(initialTestResults);
  };

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