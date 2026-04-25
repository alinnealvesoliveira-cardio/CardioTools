import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { PatientInfo, TestResults, Medications } from '../types';

interface PatientContextType {
  patient: PatientInfo; 
  patientInfo: PatientInfo; 
  updatePatientInfo: (updates: Partial<PatientInfo>) => void;
  medications: Medications;
  setMedications: React.Dispatch<React.SetStateAction<Medications>>;
  testResults: TestResults;
  updateTestResults: <K extends keyof TestResults>(category: K, updates: Partial<NonNullable<TestResults[K]>>) => void;
  resetData: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patientInfo, setPatientInfo] = useState<PatientInfo>(() => {
    const saved = localStorage.getItem('cardiotools_v2_info');
    return saved ? JSON.parse(saved) : { name: '', age: '', sex: 'male' };
  });

  const [medications, setMedications] = useState<Medications>(() => {
    const saved = localStorage.getItem('cardiotools_v2_meds');
    return saved ? JSON.parse(saved) : { betablockers: false };
  });

  const [testResults, setTestResults] = useState<TestResults>({} as TestResults);
  const [currentStep, setCurrentStep] = useState(1);

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

  return (
    <PatientContext.Provider value={{ 
      patient: patientInfo,
      patientInfo, 
      updatePatientInfo,
      medications, 
      setMedications, 
      testResults, 
      updateTestResults,
      resetData: () => {}, 
      currentStep, 
      setCurrentStep, 
      nextStep: () => {}, 
      prevStep: () => {}
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