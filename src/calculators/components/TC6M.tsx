import React, { useMemo } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { usePatient } from '../../context/PatientProvider';

export const TC6M: React.FC = () => {
  const { patientInfo } = usePatient();

  // Otimização: Recalcula apenas se as informações do paciente mudarem
  const predictedValue = useMemo(() => {
    const age = parseInt(patientInfo?.age?.toString() || '65');
    const height = parseFloat(patientInfo?.height?.toString() || '170');
    const weight = parseFloat(patientInfo?.weight?.toString() || '70');
    
    // Convertemos para 'string' (as string) para ignorar o erro de tipagem que 
    // impede a comparação com 'F' caso o tipo estrito não o permita
    const sex = (patientInfo?.sex as string);
    const isFemale = sex === 'female' || sex === 'F';

    if (!isFemale) {
      // Equação Britto (Homens): 894,21 – (5,07 × idade) + (1,2 × altura) – (1,2 × peso)
      return 894.21 - (5.07 * age) + (1.2 * height) - (1.2 * weight);
    } else {
      // Equação Britto (Mulheres): 614,08 – (4,48 × idade) + (1,1 × altura) – (2,5 × IMC)
      const imc = weight / ((height / 100) ** 2);
      return 614.08 - (4.48 * age) + (1.1 * height) - (2.5 * imc);
    }
  }, [patientInfo]);

  const interpretation = (time: number, count: number): InterpretationResult[] => {
    const dist = count; 
    const perc = predictedValue > 0 ? (dist / predictedValue) * 100 : 0;

    const results: InterpretationResult[] = [];

    if (perc >= 80) {
      results.push({ 
        label: 'Normal', 
        color: 'green', 
        description: `Desempenho de ${perc.toFixed(1)}% do predito (Britto et al., 2013).` 
      });
    } else if (perc >= 50) {
      results.push({ 
        label: 'Reduzido', 
        color: 'yellow', 
        description: `Capacidade funcional moderadamente reduzida (${perc.toFixed(1)}% do esperado).` 
      });
    } else {
      results.push({ 
        label: 'Muito Reduzido', 
        color: 'red', 
        description: `Limitação severa. Desempenho abaixo de 50% do esperado.` 
      });
    }

    return results;
  };

  return (
    <TimedTestTemplate
      title="TC6M"
      description="Teste de Caminhada de 6 Minutos (Britto)"
      timerDuration={360} 
      hasCounter={true}
      counterLabel="Distância Total (Metros)"
      predictedValue={predictedValue}
      interpretation={interpretation}
      reference="Britto RR, et al. Reference equations for the six-minute walk test based on representative sample of Brazilian adults. 2013."
    />
  );
};