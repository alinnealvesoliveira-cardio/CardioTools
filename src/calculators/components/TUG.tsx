import React, { useState } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Info } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';

export const TUG: React.FC = () => {
  const { patientInfo, setPatientInfo, testResults, setTestResults } = usePatient();
  const [observedTime, setObservedTime] = useState<string>('');

  const age = parseInt(patientInfo.age as string) || 65;
  const sex = patientInfo.sex === 'female' ? 'F' : 'M';
  const height = parseFloat(patientInfo.height as string) || 170;
  const weight = parseFloat(patientInfo.weight as string) || 70;

  const calculatePredictedFurlanetto = () => {
    const sexVal = sex === 'M' ? 1 : 0;
    return 11.5 - (0.04 * height) + (0.02 * weight) + (0.04 * age) - (0.6 * sexVal);
  };

  const predictedFurlanetto = calculatePredictedFurlanetto();
  const predictedCIF = 7.0; // Alvo de Excelência

  const interpretation = (_time: number): InterpretationResult[] => {
    const time = parseFloat(observedTime) || _time;
    if (!time || time === 0) return [
      { title: "Mobilidade Funcional", label: "Aguardando", color: "slate", description: "Insira o tempo final do teste." }
    ];
    
    return [
      {
        title: "Risco de Queda",
        label: time < 10 ? "Independente" : time < 20 ? "Risco Moderado" : "Alto Risco",
        color: time < 10 ? "green" : time < 20 ? "yellow" : "red",
        description: time < 10 
          ? "Mobilidade preservada e baixo risco de quedas." 
          : "Necessita de atenção ao equilíbrio e força."
      },
      {
        title: "Prognóstico Cardiovascular",
        label: time < 10.8 ? "Menor Risco" : "Maior Risco",
        color: time < 10.8 ? "green" : "red",
        description: time >= 10.8 ? "Tempo associado a maior risco de eventos em cardiopatas." : "Bom prognóstico funcional."
      }
    ];
  };

  const handleSave = (data: any) => {
    const finalTime = data.time || parseFloat(observedTime);
    // Eficiência inversa para tempo: (Alvo / Real) * 100
    const efficiency = (predictedCIF / finalTime) * 100;

    setTestResults({
      ...testResults,
      tug: {
        time: finalTime,
        predicted: predictedCIF,
        efficiency: efficiency,
        interpretation: data.results[0].label,
        hr: data.hr
      }
    });
  };

  return (
    <TimedTestTemplate
      title="Timed Up and Go (TUG)"
      description="Avalia mobilidade funcional, equilíbrio dinâmico e prognóstico clínico."
      interpretation={interpretation}
      predictedValue={predictedCIF}
      observedValueOverride={parseFloat(observedTime) || 0}
      invertCIFRatio={true}
      onSave={handleSave}
      pearls={[
        "Forte preditor de eventos adversos e hospitalização na Insuficiência Cardíaca.",
        "O tempo de 10.8s é um divisor de águas prognóstico em cardiopatas.",
        "Avalia a transição sentado-para-em-pé, marcha e mudança de direção."
      ]}
      reference="Podsiadlo D, et al. 1991; Kamiya K, et al. 2016."
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-indigo-600 mb-4">
          <Info className="w-5 h-5" />
          <h3 className="font-bold">Ajuste Biométrico</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Idade</label>
            <input
              type="number"
              value={patientInfo.age || ''}
              onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
              className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Sexo</label>
            <div className="flex gap-2">
              {['male', 'female'].map((s) => (
                <button
                  key={s}
                  onClick={() => setPatientInfo({ ...patientInfo, sex: s as 'male' | 'female' })}
                  className={`flex-1 py-2 rounded-xl font-bold border-2 transition-all ${
                    patientInfo.sex === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200'
                  }`}
                >
                  {s === 'male' ? 'M' : 'F'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Tempo TUG (Segundos)</label>
          <input
            type="number"
            step="0.01"
            value={observedTime}
            onChange={(e) => setObservedTime(e.target.value)}
            placeholder="Ex: 9.5"
            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black text-slate-800 focus:border-indigo-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Predito (Furlanetto)</p>
            <p className="text-lg font-black text-slate-700">{predictedFurlanetto.toFixed(1)} s</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Corte Prognóstico</p>
            <p className="text-lg font-black text-red-600">10.8 s</p>
          </div>
        </div>
      </div>
    </TimedTestTemplate>
  );
};