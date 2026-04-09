import React, { useState } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Info, BookOpen, Activity, Save, CheckCircle2, ChevronRight } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { toast } from 'react-hot-toast';

export const TD2M: React.FC = () => {
  const { patientInfo, testResults, updateTestResults } = usePatient();
  const [isSaved, setIsSaved] = useState(false);

  // Estados locais para Sintomas Pós-Teste (Padrão CardioTools)
  const [postFadiga, setPostFadiga] = useState<number | null>(null);
  const [postAngina, setPostAngina] = useState<number | null>(null);

  const age = parseInt(patientInfo.age as string) || 65;
  const sex = patientInfo.sex === 'female' ? 'F' : 'M';
  const height = parseFloat(patientInfo.height as string) || 170;
  const weight = parseFloat(patientInfo.weight as string) || 70;
  const bmi = weight / ((height / 100) ** 2);

  const calculatePredictedRikli = () => {
    if (sex === 'M') return 143.297 - (1.157 * age) - (0.334 * bmi);
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
    if (count === 0) return [{ title: "Status", label: "Aguardando", color: "slate", description: "Inicie o teste." }];
    const normative = normativeRange 
      ? (count >= normativeRange[0] ? (count > normativeRange[1] ? "Acima do Normal" : "Normal") : "Abaixo do Normal")
      : "Sem dados normativos";

    return [{
      title: "Capacidade Aeróbica (2MST)",
      label: count < lin ? "Abaixo do LIN" : normative,
      color: count < lin ? "red" : (normative === "Normal" || normative === "Acima do Normal" ? "green" : "yellow"),
      description: count < lin ? `Abaixo do Limite Inferior (${lin.toFixed(0)} passos).` : `Resultado ${normative.toLowerCase()}.`
    }];
  };

  const handleGlobalSave = (data: any) => {
    const efficiency = (data.count / predictedRikli) * 100;

    // RESOLUÇÃO DAS COBRINHAS: Garantindo que os objetos existam antes do spread (...)
    const currentScales = testResults?.fatigabilityScales || { 
      rest: { dyspnea: 0, fatigue: 0 }, 
      exercise: { dyspnea: 0, fatigue: 0 } 
    };

    const currentSymptoms = testResults?.symptoms || {
      claudication: false,
      angina: { type: 'none', description: '' }
    };

    updateTestResults({
      td2m: {
        count: data.count,
        predicted: predictedRikli,
        efficiency: efficiency,
        interpretation: interpretation(120, data.count)[0].label,
        hr: data.hr
      },
      // Salvamento seguro das escalas de fadiga
      fatigabilityScales: {
        ...currentScales,
        exercise: { 
          ...currentScales.exercise, 
          fatigue: postFadiga || 0 
        }
      },
      // Salvamento seguro dos sintomas de angina
      symptoms: {
        ...currentSymptoms,
        angina: {
          type: postAngina && postAngina > 0 ? 'stable' : 'none',
          description: postAngina ? `Angina Grau ${postAngina} no 2MST` : 'Sem dor precordial'
        }
      }
    });

    setIsSaved(true);
    toast.success("Teste de Marcha gravado!");
  };

  return (
    <div className="pb-48"> 
      <TimedTestTemplate
        title="Teste de Marcha Estacionária (2MST)"
        description="Avaliação da resistência aeróbica funcional (Senior Fitness Test)."
        timerDuration={120}
        hasCounter={true}
        counterLabel="Elevações do Joelho Direito"
        interpretation={interpretation}
        predictedValue={predictedRikli}
        onSave={handleGlobalSave}
        pearls={[
          "Marque a altura: ponto médio entre a patela e a crista ilíaca.",
          "Conte apenas as vezes que o joelho direito atinge a marca.",
          "Em cardiopatas, possui boa correlação com o Teste de Caminhada de 6 min."
        ]}
        reference="Rikli RE, Jones CJ. Senior Fitness Test Manual. 2nd ed, 2013."
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Predito</p>
              <p className="text-2xl font-black text-emerald-900">{predictedRikli.toFixed(1)}</p>
            </div>
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
              <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Corte (LIN)</p>
              <p className="text-2xl font-black text-rose-900">{lin.toFixed(0)}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-2 font-black text-slate-700 uppercase text-xs tracking-widest">
              <Activity className="text-indigo-500" size={16}/> Sintomas Pós-Esforço
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Percepção de Fadiga (Borg 0-10)</label>
              <div className="grid grid-cols-6 gap-2">
                {[0, 2, 4, 6, 8, 10].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPostFadiga(n)}
                    className={`py-3 rounded-xl font-bold transition-all ${postFadiga === n ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Graduação de Angina (0-4)</label>
              <div className="grid grid-cols-5 gap-2">
                {[0, 1, 2, 3, 4].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPostAngina(n)}
                    className={`py-3 rounded-xl font-bold transition-all ${postAngina === n ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                  >
                    {n === 0 ? 'Nenhuma' : n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </TimedTestTemplate>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-50 space-y-3">
        <button
          type="button"
          onClick={() => {
            // Dispara o clique no botão de submit interno do Template
            const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
            submitBtn?.click();
          }} 
          className={`w-full py-4 rounded-3xl font-black shadow-2xl flex items-center justify-center gap-3 transition-all ${isSaved ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:scale-[1.02]'}`}
        >
          {isSaved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5 text-emerald-400" />}
          {isSaved ? 'MARCHA GRAVADA' : 'GRAVAR RESULTADO'}
        </button>
        
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
          className="w-full bg-white text-slate-600 py-3 rounded-2xl font-bold border border-slate-200 flex items-center justify-center gap-3 text-sm shadow-sm"
        >
          PROSSEGUIR PARA FUNÇÃO DOS VASOS
          <ChevronRight className="w-4 h-4 text-indigo-500" />
        </button>
      </div>
    </div>
  );
};