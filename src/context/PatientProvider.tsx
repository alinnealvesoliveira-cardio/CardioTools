import React, { createContext, useContext, useState, useCallback } from 'react';
import { PatientInfo, TestResults, Medications, CategoryName } from '../types';

interface PatientContextType {
  patientInfo: PatientInfo;
  updatePatientInfo: (updates: Partial<PatientInfo>) => void;
  medications: Medications;
  setMedications: React.Dispatch<React.SetStateAction<Medications>>;
  testResults: TestResults;
  // A tipagem da atualização agora força a categoria a ser uma das válidas
  updateTestResults: <K extends CategoryName>(category: K, updates: Partial<NonNullable<TestResults[K]>>) => void;
  resetData: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

const STORAGE_KEY = 'cardiotools_v2_data';

const initialTestResults: TestResults = {
  aerobic: { sixMinuteWalkTest: null, stepTest: null, tug: null, td2m: null, tsl1m: null, tsl30s: null, tsl5x: null, sitToStandTest: null, dasi: null, vsaq: null },
  autonomic: { hrr: null, orthostaticDrop: null, rmssd: null, hrvInterpretation: null },
  vascular: { abi: undefined, abiAnkleBP: undefined, abiArmBP: undefined, vascularAssessment: null },
  symptoms: { angina: { type: '', description: '' } },
  fatigability: null,
  cadastro: null,
  'final-report': null
};

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patientInfo, setPatientInfo] = useState<PatientInfo>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_info`);
    return saved ? JSON.parse(saved) : { 
      name: '', age: '', sex: 'male', weight: '', height: '', 
      restingPAS: '', restingPAD: '', restingFC: '', restingSaO2: '', 
      structureAlteration: false, ejectionFraction: '' 
    };
  });

  const [medications, setMedications] = useState<Medications>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_meds`);
    return saved ? JSON.parse(saved) : { 
      betablockers: false, bcc_dhp: false, bcc_non_dhp: false, digitalis: false, 
      diuretics: false, ieca: false, statins: false, nitrates: false, 
      antiarrhythmics: false, antihypertensives: false, others: '' 
    };
  });

  const [testResults, setTestResults] = useState<TestResults>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tests`);
    return saved ? { ...initialTestResults, ...JSON.parse(saved) } : initialTestResults;
  });

  const [currentStep, setCurrentStep] = useState(1);

  React.useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_info`, JSON.stringify(patientInfo));
    localStorage.setItem(`${STORAGE_KEY}_meds`, JSON.stringify(medications));
    localStorage.setItem(`${STORAGE_KEY}_tests`, JSON.stringify(testResults));
  }, [patientInfo, medications, testResults]);

  const updatePatientInfo = useCallback((updates: Partial<PatientInfo>) => {
    setPatientInfo(prev => ({ ...prev, ...updates }));
  }, []);

  // CORREÇÃO: Tratamento de Nulos na atualização
  const updateTestResults = useCallback(<K extends CategoryName>(category: K, updates: Partial<NonNullable<TestResults[K]>>) => {
    setTestResults(prev => {
      const currentCategoryData = prev[category] || {}; // Se for null, vira objeto vazio
      return {
        ...prev,
        [category]: {
          ...(currentCategoryData as object),
          ...updates
        }
      };
    });
  }, []);

  const nextStep = useCallback(() => setCurrentStep(prev => prev + 1), []);
  const prevStep = useCallback(() => setCurrentStep(prev => Math.max(1, prev - 1)), []);

  const resetData = useCallback(() => {
    if (window.confirm("Isso apagará todos os dados. Deseja continuar?")) {
      localStorage.clear();
      window.location.reload(); 
    }
  }, []);

  return (
    <PatientContext.Provider value={{ 
      patientInfo, updatePatientInfo,
      medications, setMedications, 
      testResults, updateTestResults,
      resetData,
      currentStep, setCurrentStep, nextStep, prevStep
    }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) throw new Error('usePatient deve ser usado dentro de um PatientProvider');
  return context;
};