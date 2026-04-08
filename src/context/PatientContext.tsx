import React, { createContext, useContext, useState } from 'react';
import { PatientInfo, TestResults, Medications } from '../types';

interface PatientContextType {
  patientInfo: PatientInfo;
  setPatientInfo: (info: PatientInfo) => void;
  medications: Medications;
  setMedications: (meds: Medications) => void;
  testResults: TestResults;
  setTestResults: (results: TestResults) => void;
  updateTestResult: (testId: keyof TestResults, data: any) => void;
  resetData: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

const initialPatientInfo: PatientInfo = {
  name: '',
  age: '',
  sex: '',
  weight: '',
  height: '',
  imc: null,
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
  }
};

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patientInfo, setPatientInfo] = useState<PatientInfo>(initialPatientInfo);
  const [medications, setMedications] = useState<Medications>(initialMedications);
  const [testResults, setTestResults] = useState<TestResults>(initialTestResults);

  // Lógica para atualizar apenas um teste específico mantendo os outros
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