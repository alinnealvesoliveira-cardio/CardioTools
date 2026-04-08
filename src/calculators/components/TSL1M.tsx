import React from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Info } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';

export const TSL1M: React.FC = () => {
  const { patientInfo, setPatientInfo, testResults, setTestResults } = usePatient();

  // Tratamento de dados com fallbacks
  const age = parseInt(patientInfo.age as string) || 60;
  const sex = patientInfo.sex === 'female' ? 'F' : 'M';
  const height = parseFloat(patientInfo.height as string) || 170;
  const weight = parseFloat(patientInfo.weight as string) || 70;
  const bmi = weight / ((height / 100) ** 2);

  const calculatePredictedFurlanetto = () => {
    // TSL1pred = 60,6 - (0,36 x Idade) - (2,8 x sexo) - (0,31 x IMC)
    // Sexo: 0 Homem e 1 Mulher
    const sexVal = sex === 'M' ? 0 : 1;
    return 60.6 - (0.36 * age) - (2.8 * sexVal) - (0.31 * bmi);
  };

  const predictedFurlanetto = calculatePredictedFurlanetto();
  const mdc = 1.1; // Mudança mínima detectável (Nguyen et al., 2025)

  const interpretation = (_time: number, count: number): InterpretationResult[] => {
    if (count === 0) return [{ 
      title: "Capacidade Aeróbica", 
      label: "Aguardando contagem", 
      color: "slate", 
      description: "Inicie o teste e conte as repetições completas." 
    }];
    
    const efficiency = (count / predictedFurlanetto) * 100;

    return [
      {
        title: "Resistência Funcional (TSL1M)",
        label: efficiency < 80 ? "Reduzida" : "Preservada",
        color: efficiency < 80 ? "red" : "green",
        description: efficiency < 80
          ? `Desempenho de ${efficiency.toFixed(0)}% do predito (abaixo do esperado).` 
          : `Desempenho de ${efficiency.toFixed(0)}% do predito (compatível com o esperado).`
      },
      {
        title: "Nota Clínica (VO2)",
        label: "Limitação Biomecânica",
        color: "slate",
        description: "A estimativa de VO2 via TSL é imprecisa em obesos. Use METs do DASI para maior acurácia."
      }
    ];
  };

  const handleSave = (data: any) => {
    const efficiency = (data.count / predictedFurlanetto) * 100;

    setTestResults({
      ...testResults,
      tsl1m: {
        count: data.count,
        predicted: predictedFurlanetto,
        efficiency: efficiency,
        interpretation: data.results[0].label,
        hr: data.hr
      }
    });
  };

  return (
    <TimedTestTemplate
      title="Teste de Sentar e Levantar (1 Minuto)"
      description="Avalia a resistência de membros inferiores e a capacidade funcional aeróbica."
      timerDuration={60}
      hasCounter={true}
      counterLabel="Repetições Completas"
      interpretation={interpretation}
      predictedValue={predictedFurlanetto}
      onSave={handleSave}
      pearls={[
        "Fórmula: 60,6 - (0,36 x Idade) - (2,8 x sexo) - (0,31 x IMC).",
        "MDC: Em pacientes com IC, ganhos reais são acima de 1,1 repetição.",
        "O teste avalia tanto potência muscular quanto endurance cardiovascular."
      ]}
      pitfalls={[
        "Não utilizar os braços para auxílio na subida.",
        "A fadiga de quadríceps costuma aparecer antes da dispneia.",
        "Ajustar a altura da cadeira (padrão 43-47cm)."
      ]}
      reference="Furlanetto KC, et al. 2022; Nguyen et al. 2025."
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-indigo-600 mb-4">
          <Info className="w-5 h-5" />
          <h3 className="font-bold">Ajuste de Variáveis Biométricas</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Idade</label>
            <input
              type="number"
              value={patientInfo.age || ''}
              onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
              className="w-full p-3 rounded-xl border-2 border-slate-100 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Sexo</label>
            <div className="flex gap-4">
              {['male', 'female'].map((s) => (
                <button
                  key={s}
                  onClick={() => setPatientInfo({ ...patientInfo, sex: s as 'male' | 'female' })}
                  className={`flex-1 py-2 rounded-xl font-bold border-2 transition-all ${
                    patientInfo.sex === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {s === 'male' ? 'Masc' : 'Fem'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Altura (cm)</label>
            <input
              type="number"
              value={patientInfo.height || ''}
              onChange={(e) => setPatientInfo({ ...patientInfo, height: e.target.value })}
              className="w-full p-3 rounded-xl border-2 border-slate-100 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Peso (kg)</label>
            <input
              type="number"
              value={patientInfo.weight || ''}
              onChange={(e) => setPatientInfo({ ...patientInfo, weight: e.target.value })}
              className="w-full p-3 rounded-xl border-2 border-slate-100 outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Predito (Furlanetto)</p>
            <p className="text-lg font-black text-slate-700">{predictedFurlanetto.toFixed(1)} <span className="text-xs">rep</span></p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase">IMC do Paciente</p>
            <p className="text-lg font-black text-slate-700">{bmi.toFixed(1)} <span className="text-xs">kg/m²</span></p>
          </div>
        </div>
      </div>
    </TimedTestTemplate>
  );
};