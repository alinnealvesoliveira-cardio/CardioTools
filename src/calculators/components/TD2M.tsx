import React from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Info } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';

export const TD2M: React.FC = () => {
  const { patientInfo, setPatientInfo, testResults, setTestResults } = usePatient();

  // Tratamento de dados biométricos com fallbacks seguros
  const age = parseInt(patientInfo.age as string) || 65;
  const sex = patientInfo.sex === 'female' ? 'F' : 'M';
  const height = parseFloat(patientInfo.height as string) || 170;
  const weight = parseFloat(patientInfo.weight as string) || 70;
  const bmi = weight / ((height / 100) ** 2);

  // Fórmulas de predição baseadas em Rikli & Jones (2013)
  const calculatePredictedRikli = () => {
    if (sex === 'M') {
      return 143.297 - (1.157 * age) - (0.334 * bmi);
    }
    return 118.773 - (0.832 * age) - (0.472 * bmi);
  };

  const predictedRikli = calculatePredictedRikli();
  const epe = 6; // Erro Padrão de Estimativa (passos)
  const lin = predictedRikli - (epe * 1.645); // Limite Inferior de Normalidade (p < 0.05)

  // Tabelas Normativas (Percentil 50)
  const getNormativeRange = (age: number, sex: 'M' | 'F'): [number, number] | null => {
    if (age < 60) return null;
    if (age <= 64) return sex === 'M' ? [87, 115] : [75, 107];
    if (age <= 69) return sex === 'M' ? [86, 116] : [73, 107];
    if (age <= 74) return sex === 'M' ? [80, 110] : [68, 101];
    if (age <= 79) return sex === 'M' ? [73, 109] : [68, 100];
    if (age <= 84) return sex === 'M' ? [71, 103] : [60, 90];
    if (age <= 89) return sex === 'M' ? [59, 91] : [55, 85];
    if (age <= 94) return sex === 'M' ? [52, 86] : [44, 72];
    return null;
  };

  const normativeRange = getNormativeRange(age, sex);

  const interpretation = (_time: number, count: number): InterpretationResult[] => {
    if (count === 0) {
      return [{ 
        title: "Capacidade Aeróbica", 
        label: "Aguardando contagem", 
        color: "slate", 
        description: "Inicie o cronômetro e registre as elevações do joelho direito." 
      }];
    }
    
    const normative = normativeRange 
      ? (count >= normativeRange[0] ? (count > normativeRange[1] ? "Acima do Normal" : "Normal") : "Abaixo do Normal")
      : "Sem dados normativos";

    return [
      {
        title: "Capacidade Aeróbica (TD2M)",
        label: count < lin ? "Abaixo do LIN" : normative,
        color: count < lin ? "red" : (normative === "Normal" || normative === "Acima do Normal" ? "green" : "yellow"),
        description: count < lin 
          ? `Desempenho abaixo do Limite Inferior esperado (${lin.toFixed(0)} passos).` 
          : `Resultado classificado como ${normative.toLowerCase()} para a faixa etária.`
      },
      {
        title: "Análise de Melhora (MCID)",
        label: "Referência: 14 passos",
        color: "slate",
        description: "Um ganho ≥ 14 passos é necessário para caracterizar melhora clínica real."
      }
    ];
  };

  const handleSave = (data: any) => {
    // Cálculo da eficiência funcional para integração com a CBDF-1
    const efficiency = (data.count / predictedRikli) * 100;

    setTestResults({
      ...testResults,
      td2m: {
        count: data.count,
        predicted: predictedRikli,
        efficiency: efficiency, // Campo obrigatório para evitar erro de tipagem (cobrinha)
        interpretation: data.results[0].label,
        hr: data.hr
      }
    });
  };

  return (
    <TimedTestTemplate
      title="Teste de Marcha Estacionária (TD2M)"
      description="Avaliação da resistência aeróbica funcional através da marcha estacionária por 2 minutos."
      timerDuration={120}
      hasCounter={true}
      counterLabel="Elevações do Joelho Direito"
      interpretation={interpretation}
      predictedValue={predictedRikli}
      onSave={handleSave}
      pearls={[
        "Altura correta: ponto médio entre a patela e a crista ilíaca.",
        "Apenas a elevação do joelho direito é contabilizada.",
        "O LIN (Limite Inferior) define o corte estatístico de normalidade."
      ]}
      reference="Rikli RE, Jones CJ. Senior Fitness Test Manual. 2013."
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-indigo-600 mb-4">
          <Info className="w-5 h-5" />
          <h3 className="font-bold">Dados Biométricos do Paciente</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Idade (anos)</label>
            <input
              type="number"
              value={patientInfo.age || ''}
              onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
              className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Sexo</label>
            <div className="flex gap-4">
              {[
                { val: 'male', label: 'Masc' },
                { val: 'female', label: 'Fem' }
              ].map((s) => (
                <button
                  key={s.val}
                  onClick={() => setPatientInfo({ ...patientInfo, sex: s.val as 'male' | 'female' })}
                  className={`flex-1 py-2 rounded-xl font-bold border-2 transition-all ${
                    patientInfo.sex === s.val 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {s.label}
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
              className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Peso (kg)</label>
            <input
              type="number"
              value={patientInfo.weight || ''}
              onChange={(e) => setPatientInfo({ ...patientInfo, weight: e.target.value })}
              className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Predito (Rikli & Jones)</p>
            <p className="text-xl font-black text-slate-700">{predictedRikli.toFixed(1)} <span className="text-xs font-normal">passos</span></p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LIN (Corte Mínimo)</p>
            <p className="text-xl font-black text-slate-700">{lin.toFixed(0)} <span className="text-xs font-normal">passos</span></p>
          </div>
        </div>
      </div>
    </TimedTestTemplate>
  );
};