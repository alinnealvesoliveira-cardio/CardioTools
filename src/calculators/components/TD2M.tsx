import React from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Info, BookOpen } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';

export const TD2M: React.FC = () => {
  const { patientInfo, setPatientInfo, testResults, setTestResults } = usePatient();

  const age = parseInt(patientInfo.age as string) || 65;
  const sex = patientInfo.sex === 'female' ? 'F' : 'M';
  const height = parseFloat(patientInfo.height as string) || 170;
  const weight = parseFloat(patientInfo.weight as string) || 70;
  const bmi = weight / ((height / 100) ** 2);

  // Fórmulas de predição Rikli & Jones (Senior Fitness Test)
  const calculatePredictedRikli = () => {
    if (sex === 'M') {
      return 143.297 - (1.157 * age) - (0.334 * bmi);
    }
    return 118.773 - (0.832 * age) - (0.472 * bmi);
  };

  const predictedRikli = calculatePredictedRikli();
  const epe = 6; 
  const lin = predictedRikli - (epe * 1.645); 

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
    if (count === 0) return [{ 
        title: "Capacidade Aeróbica", 
        label: "Aguardando contagem", 
        color: "slate", 
        description: "Inicie o cronômetro e registre as elevações do joelho direito." 
    }];
    
    const normative = normativeRange 
      ? (count >= normativeRange[0] ? (count > normativeRange[1] ? "Acima do Normal" : "Normal") : "Abaixo do Normal")
      : "Sem dados normativos";

    return [
      {
        title: "Capacidade Aeróbica (2MST)",
        label: count < lin ? "Abaixo do LIN" : normative,
        color: count < lin ? "red" : (normative === "Normal" || normative === "Acima do Normal" ? "green" : "yellow"),
        description: count < lin 
          ? `Desempenho abaixo do Limite Inferior esperado (${lin.toFixed(0)} passos).` 
          : `Resultado classificado como ${normative.toLowerCase()} para a faixa etária.`
      },
      {
        title: "Análise de Melhora (MCID)",
        label: "± 14 passos",
        color: "slate",
        description: "Variação mínima clinicamente importante para caracterizar mudança real."
      }
    ];
  };

  const handleSave = (data: any) => {
    const efficiency = (data.count / predictedRikli) * 100;

    setTestResults({
      ...testResults,
      td2m: {
        count: data.count,
        predicted: predictedRikli,
        efficiency: efficiency,
        interpretation: data.results[0].label,
        hr: data.hr
      }
    });
  };

  return (
    <TimedTestTemplate
      title="Teste de Marcha Estacionária (2MST)"
      description="Avaliação da resistência aeróbica funcional (Senior Fitness Test)."
      timerDuration={120}
      hasCounter={true}
      counterLabel="Elevações do Joelho Direito"
      interpretation={interpretation}
      predictedValue={predictedRikli}
      onSave={handleSave}
      pearls={[
        "Marque a altura: ponto médio entre a patela e a crista ilíaca.",
        "Conte apenas as vezes que o joelho direito atinge a marca.",
        "Indicado para pacientes com restrição de espaço ou risco de queda em marcha.",
        "Em cardiopatas, possui boa correlação com o Teste de Caminhada de 6 min."
      ]}
      reference="Rikli RE, Jones CJ. Senior Fitness Test Manual. 2nd ed, 2013."
    >
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <BookOpen className="w-5 h-5" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Validação em Cardiopatas</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed italic">
            "The 2-minute step test as a substitute for the 6-minute walk test in patients with heart failure." 
            (Wegrzynowska-Teodorczyk et al., 2016)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase">Idade (anos)</label>
            <input
              type="number"
              value={patientInfo.age || ''}
              onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
              className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase">Sexo</label>
            <div className="flex gap-2">
              {['male', 'female'].map((s) => (
                <button
                  key={s}
                  onClick={() => setPatientInfo({ ...patientInfo, sex: s as 'male' | 'female' })}
                  className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all text-xs ${
                    patientInfo.sex === s 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-200'
                  }`}
                >
                  {s === 'male' ? 'MASCULINO' : 'FEMININO'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <p className="text-[9px] font-black text-emerald-600 uppercase">Predito (Rikli & Jones)</p>
            <p className="text-2xl font-black text-emerald-900">{predictedRikli.toFixed(1)}</p>
          </div>
          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
            <p className="text-[9px] font-black text-rose-600 uppercase">Corte Mínimo (LIN)</p>
            <p className="text-2xl font-black text-rose-900">{lin.toFixed(0)}</p>
          </div>
        </div>
      </div>
    </TimedTestTemplate>
  );
};