import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { PatientInfo, TestResults, Medications, AppRoute } from '../types';

// 1. Constantes de Estado Inicial
const INITIAL_PATIENT: PatientInfo = {
  name: '',
  age: '',
  sex: 'male',
  weight: '',
  height: '',
  restingPAS: '',
  restingPAD: '',
  restingSaO2: '',
  ejectionFraction: ''
};

const INITIAL_MEDICATIONS: Medications = {
  betablockers: false,
  antihypertensives: false,
  nitrates: false,
  diuretics: false,
  ieca: false,
  statins: false,
  digitalis: false,
  antiarrhythmics: false,
  bcc_dhp: false,
  bcc_non_dhp: false
};

// Garantindo que todos os campos da interface TestResults estejam aqui
const INITIAL_RESULTS: TestResults = {
  home: null,
  cadastro: null,
  anamnese: null,
  autonomic: null,
  aerobic: null,
  vascular: null,
  fatigability: null,
  symptoms: null,
  'hr-response': null,
  'final-report': null
};

// 2. Definição do Tipo do Contexto
interface PatientContextType {
  patient: PatientInfo; 
  patientInfo: PatientInfo; 
  updatePatientInfo: (updates: Partial<PatientInfo>) => void;
  medications: Medications;
  setMedications: React.Dispatch<React.SetStateAction<Medications>>;
  testResults: TestResults;
  // Usamos keyof TestResults para garantir que só aceite chaves válidas (os IDs do AppRoute)
  updateTestResults: <K extends keyof TestResults>(category: K, updates: Partial<NonNullable<TestResults[K]>>) => void;
  resetData: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  setStep: (step: number) => void; 
  nextStep: () => void;
  prevStep: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patientInfo, setPatientInfo] = useState<PatientInfo>(() => {
    const saved = localStorage.getItem('cardiotools_v2_info');
    return saved ? JSON.parse(saved) : INITIAL_PATIENT;
  });

  const [medications, setMedications] = useState<Medications>(() => {
    const saved = localStorage.getItem('cardiotools_v2_meds');
    return saved ? JSON.parse(saved) : INITIAL_MEDICATIONS;
  });

  const [testResults, setTestResults] = useState<TestResults>(INITIAL_RESULTS);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    localStorage.setItem('cardiotools_v2_info', JSON.stringify(patientInfo));
    localStorage.setItem('cardiotools_v2_meds', JSON.stringify(medications));
  }, [patientInfo, medications]);

  const updatePatientInfo = useCallback((updates: Partial<PatientInfo>) => {
    setPatientInfo(prev => ({ ...prev, ...updates }));
  }, []);

  const updateTestResults = useCallback(<K extends keyof TestResults>(
    category: K, 
    updates: Partial<NonNullable<TestResults[K]>>
  ) => {
    setTestResults(prev => ({
      ...prev,
      [category]: { ...prev[category], ...updates }
    }));
  }, []);

  const nextStep = useCallback(() => setCurrentStep(prev => prev + 1), []);
  const prevStep = useCallback(() => setCurrentStep(prev => Math.max(1, prev - 1)), []);
  
  const setStep = useCallback((step: number) => setCurrentStep(step), []);

  const resetData = useCallback(() => {
    setPatientInfo(INITIAL_PATIENT);
    setMedications(INITIAL_MEDICATIONS);
    setTestResults(INITIAL_RESULTS);
    setCurrentStep(1);
    localStorage.clear();
  }, []);

  return (
    <PatientContext.Provider value={{ 
      patient: patientInfo,
      patientInfo, 
      updatePatientInfo,
      medications, 
      setMedications, 
      testResults, 
      updateTestResults,
      resetData, 
      currentStep, 
      setCurrentStep,
      setStep,
      nextStep, 
      prevStep 
    }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = (): PatientContextType => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient deve ser usado dentro de um PatientProvider');
  }
  return context;
};