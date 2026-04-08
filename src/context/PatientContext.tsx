import React, { createContext, useContext, useState, useEffect } from 'react';
// Importamos as regras que acabamos de salvar no types.ts
import { PatientInfo, TestResults, Medications } from '../types';

interface PatientContextType {
  patientInfo: PatientInfo;
  setPatientInfo: (info: PatientInfo) => void;
  medications: Medications;
  setMedications: (meds: Medications) => void;
  testResults: TestResults;
  setTestResults: (results: TestResults) => void;
  resetData: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

// Valores iniciais (o "estado zero" do seu formulário)
const initialPatientInfo: PatientInfo = {
  name: '',
  age: '',
  sex: 'male',
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
  antiarrhythmics: false
};

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patientInfo, setPatientInfo] = useState<PatientInfo>(initialPatientInfo);
  const [medications, setMedications] = useState<Medications>(initialMedications);
  const [testResults, setTestResults] = useState<TestResults>({
    fatigabilityScales: {
      rest: { dyspnea: 0, fatigue: 0 },
      exercise: { dyspnea: 0, fatigue: 0 }
    }
  });

  // Função para limpar tudo e começar um novo atendimento
  const resetData = () => {
    setPatientInfo(initialPatientInfo);
    setMedications(initialMedications);
    setTestResults({
      fatigabilityScales: {
        rest: { dyspnea: 0, fatigue: 0 },
        exercise: { dyspnea: 0, fatigue: 0 }
      }
    });
  };

  return (
    <PatientContext.Provider value={{ 
      patientInfo, setPatientInfo, 
      medications, setMedications, 
      testResults, setTestResults,
      resetData 
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