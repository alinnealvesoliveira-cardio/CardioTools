import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Medications, PatientInfo, TestResults } from '../types';

interface PatientContextType {
  medications: Medications;
  patientInfo: PatientInfo;
  testResults: TestResults;
  updateMedications: (newMeds: Partial<Medications>) => void;
  updatePatientInfo: (newInfo: Partial<PatientInfo>) => void;
  updateTestResults: (newResults: Partial<TestResults>) => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [medications, setMedications] = useState<Medications>({
    betablockers: false,
    bcc: false,
    digitalis: false,
    diuretics: false,
    ieca: false,
    statins: false,
    nitrates: false,
    antiarrhythmics: false,
  });

  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    name: '',
    age: '',
    sex: 'male',
    weight: '',
    height: '',
    imc: null,
    goals: '',
    structureAlteration: false,
  });

  const [testResults, setTestResults] = useState<TestResults>({
    fatigabilityScales: {
      rest: { dyspnea: 0, fatigue: 0 },
      exercise: { dyspnea: 0, fatigue: 0 },
    }
  });

  const updateMedications = (newMeds: Partial<Medications>) => {
    setMedications(prev => ({ ...prev, ...newMeds }));
  };

  const updatePatientInfo = (newInfo: Partial<PatientInfo>) => {
    setPatientInfo(prev => {
      const updated = { ...prev, ...newInfo };
      // Auto-calculate IMC
      const w = parseFloat(updated.weight);
      const h = parseFloat(updated.height) / 100;
      if (w && h) {
        updated.imc = w / (h * h);
      } else {
        updated.imc = null;
      }
      return updated;
    });
  };

  const updateTestResults = (newResults: Partial<TestResults>) => {
    setTestResults(prev => ({ ...prev, ...newResults }));
  };

  return (
    <PatientContext.Provider value={{ 
      medications, 
      patientInfo, 
      testResults,
      updateMedications, 
      updatePatientInfo,
      updateTestResults
    }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};

// For backward compatibility during refactoring
export const useMedications = usePatient;
