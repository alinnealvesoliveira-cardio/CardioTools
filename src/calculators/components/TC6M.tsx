import React from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { usePatient } from '../../context/PatientContext';

export const TC6M: React.FC = () => {
  const { patientInfo } = usePatient();

  // Cálculo do predito baseado em Britto et al. (2013) - Referência Brasileira
  const calculatePredicted = (): number => {
    // Garantindo que os valores sejam números para evitar erros de build
    const age = parseInt(patientInfo?.age as any) || 0;
    const height = 170; // Idealmente buscar do perfil do paciente
    const weight = 70;  // Idealmente buscar do perfil do paciente
    const isMale = (patientInfo as any)?.sex === 'M';

    if (isMale) {
      // Equação Britto (Homens): 894,21 – (5,07 × idade) + (1,2 × altura) – (1,2 × peso)
      return 894.21 - (5.07 * age) + (1.2 * height) - (1.2 * weight);
    }
    // Equação Britto (Mulheres): 614,08 – (4,48 × idade) + (1,1 × altura) – (2,5 × IMC)
    // Usando peso simplificado aqui, mas o ideal é calcular o IMC (Peso/Alt²)
    const imc = weight / ((height / 100) ** 2);
    return 614.08 - (4.48 * age) + (1.1 * height) - (2.5 * imc);
  };

  const interpretation = (time: number, count: number): InterpretationResult[] => {
    const dist = count; 
    const pred = calculatePredicted();
    const perc = pred > 0 ? (dist / pred) * 100 : 0;

    const results: InterpretationResult[] = [];

    if (perc >= 80) {
      results.push({ 
        label: 'Normal', 
        color: 'green', 
        description: `Desempenho de ${perc.toFixed(1)}% do predito (Britto, 2013).` 
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
      predictedValue={calculatePredicted()}
      interpretation={interpretation}
      reference="Britto RR, et al. Reference equations for the six-minute walk test based on representative sample of Brazilian adults. Revision. 2013."
    />
  );
};