import React, { useMemo } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { usePatient } from '../../context/PatientProvider';
import { FunctionalTestResult } from '../../types'; // Importando a interface correta

export const TC6M: React.FC = () => {
  const { patientInfo, updateTestResults } = usePatient();

  const age = parseInt(patientInfo?.age?.toString() || '0');
  const height = parseFloat(patientInfo?.height?.toString() || '0');
  const weight = parseFloat(patientInfo?.weight?.toString() || '0');
  const sex = patientInfo?.sex as string;
  const isDataValid = age > 0 && height > 0 && weight > 0;

  const predictedValue = useMemo(() => {
    if (!isDataValid) return 0;
    const isFemale = sex === 'female' || sex === 'F';
    if (!isFemale) {
      return 894.21 - (5.07 * age) + (1.2 * height) - (1.2 * weight);
    } else {
      const imc = weight / ((height / 100) ** 2);
      return 614.08 - (4.48 * age) + (1.1 * height) - (2.5 * imc);
    }
  }, [age, height, weight, sex, isDataValid]);

  // A função agora mapeia corretamente para a interface FunctionalTestResult
  const handleSave = (data: { 
    time: number; 
    count: number; 
    results: InterpretationResult[]; 
    cif: any; 
    hr: { pre: number; post: number } 
  }) => {
    updateTestResults('aerobic', { 
      sixMinuteWalkTest: { 
        distance: data.count,       // Mapeando count para distance (conforme types.ts)
        time: data.time,
        hr: data.hr,                // Mapeando hr
        cif: data.cif ?? undefined, // Mapeando cif
        interpretation: data.results[0]?.description || "" // Mapeando interpretation
      } as FunctionalTestResult
    });
  };

  const interpretation = (time: number, count: number): InterpretationResult[] => {
    const dist = count; 
    const perc = predictedValue > 0 ? (dist / predictedValue) * 100 : 0;

    if (perc >= 80) {
      return [{ label: 'Normal', color: 'green', description: `Desempenho de ${perc.toFixed(1)}% do predito (Britto et al., 2013).` }];
    } else if (perc >= 50) {
      return [{ label: 'Reduzido', color: 'yellow', description: `Capacidade funcional moderadamente reduzida (${perc.toFixed(1)}% do esperado).` }];
    } else {
      return [{ label: 'Muito Reduzido', color: 'red', description: `Limitação severa. Desempenho abaixo de 50% do esperado.` }];
    }
  };

  if (!isDataValid) {
    return (
      <div className="p-8 bg-amber-50 border border-amber-200 rounded-3xl text-amber-800 text-center">
        <h3 className="font-bold text-lg mb-2">Dados incompletos</h3>
        <p>Por favor, verifique se Idade, Peso e Altura estão preenchidos no cadastro.</p>
      </div>
    );
  }

  return (
    <TimedTestTemplate
      title="TC6M"
      description="Teste de Caminhada de 6 Minutos (Britto)"
      timerDuration={360} 
      hasCounter={true}
      counterLabel="Distância Total (Metros)"
      predictedValue={predictedValue}
      interpretation={interpretation}
      onSave={handleSave} // Utilizando onSave corretamente
    />
  );
};