import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Check, Heart, Droplets, ClipboardList, Share2 } from 'lucide-react';
import { usePatient } from '../../../context/PatientProvider';
import { toast } from 'react-hot-toast';

// --- DEFINIÇÃO DE TIPOS (CONTRATO DE DADOS) ---
// Isso resolve o erro "Property does not exist"
interface TestResults {
  aerobic?: {
    sixMinuteWalkTest?: { distance: number; efficiency: number };
    td2m?: { count: number };
    tsl1m?: { count: number };
    tsl5x?: { time: number };
    tug?: { time: number };
    stepTest?: any;
  };
  vascular?: {
    vascularAssessment: {
      arterial?: { cif: { qualifier: number } };
      venese?: { cif: { qualifier: number } };
    };
  };
  fatigability?: {
    exercise?: { fatigue: number; dyspnea: number };
  };
}

type Severity = 'Leve' | 'Moderada' | 'Grave' | 'Completa';
type VesselType = 'Arterial' | 'Venosa' | 'Linfática' | 'Nenhuma';

export const FunctionalDiagnosis: React.FC = () => {
  // Ajuste o acesso ao hook para garantir que o TS entenda o formato dos dados
  const { testResults, medications, patientInfo, updatePatientInfo } = usePatient() as {
    testResults: TestResults;
    medications: any;
    patientInfo: { structureAlteration?: boolean };
    updatePatientInfo: (data: any) => void;
  };

  const [aerobicCapacity, setAerobicCapacity] = useState<string>('0-4');
  const [vesselType, setVesselType] = useState<VesselType>('Arterial');
  const [vesselSeverity, setVesselSeverity] = useState<Severity>('Leve');
  const [fatigueState, setFatigueState] = useState<'Repouso' | 'Esforço'>('Repouso');
  const [hrMedication, setHrMedication] = useState<boolean>(
    !!(medications?.betablockers || medications?.antihypertensives)
  );
  const [copied, setCopied] = useState(false);

  // 1. Cálculo com proteção total contra nulos
  const maxFatigueScore = useMemo(() => {
    const fatigue = testResults?.fatigability?.exercise?.fatigue ?? 0;
    const dyspnea = testResults?.fatigability?.exercise?.dyspnea ?? 0;
    return Math.max(fatigue, dyspnea);
  }, [testResults]);

  const getFatigueLabel = (score: number): string => {
    if (score >= 10) return 'EXAUSTIVA';
    if (score >= 7) return 'GRAVE';
    if (score >= 4) return 'MODERADA';
    if (score >= 1) return 'LEVE';
    return 'NENHUMA';
  };

  // 2. Efeito de Sincronização
  useEffect(() => {
    if (!testResults) return;

    // Capacidade Aeróbica
    const eff = testResults.aerobic?.sixMinuteWalkTest?.efficiency;
    if (eff !== undefined) {
      if (eff < 5) setAerobicCapacity('0-4');
      else if (eff < 25) setAerobicCapacity('5-24');
      else if (eff < 50) setAerobicCapacity('25-49');
      else setAerobicCapacity('50-95');
    }

    // Vascular
    const vasc = testResults.vascular?.vascularAssessment;
    if (vasc) {
      const severityMap: Record<number, Severity> = { 1: 'Leve', 2: 'Moderada', 3: 'Grave', 4: 'Completa' };
      
      // Acesso seguro usando opcional
      const artQualifier = vasc.arterial?.cif?.qualifier;
      const venQualifier = vasc.venese?.cif?.qualifier;

      if (artQualifier && artQualifier !== 4) {
        setVesselType('Arterial');
        setVesselSeverity(severityMap[artQualifier] ?? 'Leve');
      } else if (venQualifier && venQualifier !== 4) {
        setVesselType('Venosa');
        setVesselSeverity(severityMap[venQualifier] ?? 'Leve');
      }
    }

    // Estado de fadiga
    if (testResults.aerobic?.sixMinuteWalkTest || testResults.aerobic?.td2m || testResults.aerobic?.stepTest) {
      setFatigueState('Esforço');
    }
  }, [testResults]);

  const generateDiagnosis = (): string => {
    const struct = patientInfo?.structureAlteration ? 'COM' : 'SEM';
    const capLevel = 
      aerobicCapacity === '0-4' ? 'COMPLETA' : 
      aerobicCapacity === '5-24' ? 'GRAVE' : 
      aerobicCapacity === '25-49' ? 'MODERADA' : 'LEVE';
    
    let text = `DIAGNÓSTICO CINÉTICO-FUNCIONAL: D05.01.4.4.1.4 - DEFICIÊNCIA FUNCIONAL CARDIOVASCULAR - ${struct} ALTERAÇÃO DE ESTRUTURA.`;
    text += ` | DEFICIÊNCIA ${capLevel} DA CAPACIDADE AERÓBICA (FAIXA DE ${aerobicCapacity}% DO PREVISTO).`;
    
    if (vesselType !== 'Nenhuma') {
      text += ` | ALTERAÇÃO DAS FUNÇÕES DOS VASOS (${vesselType.toUpperCase()}) EM GRAU ${vesselSeverity.toUpperCase()}.`;
    }

    text += ` | FADIGA ${getFatigueLabel(maxFatigueScore)} AO ${fatigueState.toUpperCase()}.`;
    text += ` | RESPOSTA CRONOTRÓPICA: ${hrMedication ? 'INFLUENCIADA POR FÁRMACOS' : 'FISIOLÓGICA'}.`;

    // Sumário com checks de segurança
    const tests: string[] = [];
    if (testResults?.aerobic?.sixMinuteWalkTest) {
      const dist = testResults.aerobic.sixMinuteWalkTest.distance ?? 0;
      const eff = testResults.aerobic.sixMinuteWalkTest.efficiency ?? 0;
      tests.push(`TC6M: ${dist}M (${eff.toFixed(1)}%)`);
    }
    if (testResults?.aerobic?.td2m?.count !== undefined) tests.push(`TD2M: ${testResults.aerobic.td2m.count} DEGRAUS`);
    if (testResults?.aerobic?.tsl1m?.count !== undefined) tests.push(`TSL1M: ${testResults.aerobic.tsl1m.count} REPETIÇÕES`);
    if (testResults?.aerobic?.tsl5x?.time !== undefined) tests.push(`TSL5X: ${testResults.aerobic.tsl5x.time}S`);
    if (testResults?.aerobic?.tug?.time !== undefined) tests.push(`TUG: ${testResults.aerobic.tug.time}S`);
    
    if (tests.length > 0) text += `\n\n[SUMÁRIO DE TESTES: ${tests.join(' | ')}]`;

    return text.toUpperCase();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateDiagnosis());
    setCopied(true);
    toast.success("Diagnóstico copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  // ... (Seu JSX permanece o mesmo) ...
  return (
      <div className="max-w-5xl mx-auto p-4 space-y-8 pb-32">
        {/* ... (Seu conteúdo do JSX) ... */}
      </div>
  );
};