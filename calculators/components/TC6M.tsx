import React, { useMemo, useState } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { usePatient } from '../../context/PatientProvider';
import { Ruler } from 'lucide-react'; // Ícone para o campo de distância

export const TC6M: React.FC = () => {
  const { patientInfo, updateTestResults } = usePatient();
  // Estado local para controlar o valor da distância enquanto o usuário digita
  const [distance, setDistance] = useState<number>(0);

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

  const handleSave = (data: { 
    time: number; 
    count: number; 
    results: InterpretationResult[]; 
    cif: any; 
    hr: { pre: number; post: number } 
  }) => {
    const walkResult = {
      distance: distance, // Usamos o valor do estado local
      time: data.time,
      hr: data.hr,
      cif: data.cif ?? undefined,
      interpretation: data.results[0]?.description || ""
    };

    updateTestResults('aerobic', { 
      sixMinuteWalkTest: walkResult
    });
  };

  const interpretation = (time: number, count: number): InterpretationResult[] => {
    // Usamos a distância do estado local para o cálculo em tempo real
    const dist = distance; 
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
      onSave={handleSave}
    >
      {/* ESTE É O BLOCO QUE FALTAVA: O CAMPO PARA INSERIR A DISTÂNCIA */}
      <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-2">
          <Ruler size={14} /> Distância Percorrida (m)
        </label>
        <input
          type="number"
          value={distance || ''}
          onChange={(e) => setDistance(Number(e.target.value))}
          placeholder="Ex: 450"
          className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 text-2xl font-black text-slate-900 focus:border-indigo-500 outline-none transition-all"
        />
        <p className="mt-3 text-[11px] text-slate-500 font-medium px-2">
          Insira a distância total em metros ao final do teste para obter a interpretação.
        </p>
      </div>
    </TimedTestTemplate>
  );
};