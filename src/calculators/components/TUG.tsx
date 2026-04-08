import React, { useState } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Info, AlertCircle, Activity, ShieldCheck } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';

export const TUG: React.FC = () => {
  const { patientInfo, setPatientInfo, testResults, setTestResults } = usePatient();
  const [observedTime, setObservedTime] = useState<string>('');

  const age = parseInt(patientInfo.age as string) || 65;
  const sex = patientInfo.sex === 'female' ? 'F' : 'M';
  const height = parseFloat(patientInfo.height as string) || 170;
  const weight = parseFloat(patientInfo.weight as string) || 70;

  // Equação de Predição Brasileira (Furlanetto et al.)
  const calculatePredictedFurlanetto = () => {
    const sexVal = sex === 'M' ? 1 : 0;
    return 11.5 - (0.04 * height) + (0.02 * weight) + (0.04 * age) - (0.6 * sexVal);
  };

  const predictedFurlanetto = calculatePredictedFurlanetto();
  const benchmarkCardio = 10.8; // Corte prognóstico para cardiopatas (Kamiya et al.)

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
          : "Atenção: déficit de equilíbrio dinâmico detectado."
      },
      {
        title: "Domínio Avaliado",
        label: "Neuro-Motor",
        color: "slate",
        description: "Nota: Este teste avalia agilidade e equilíbrio, não capacidade aeróbica."
      }
    ];
  };

  const handleSave = (data: any) => {
    const finalTime = data.time || parseFloat(observedTime);
    const efficiency = (predictedFurlanetto / finalTime) * 100;

    setTestResults({
      ...testResults,
      tug: {
        time: finalTime,
        predicted: predictedFurlanetto,
        efficiency: efficiency,
        interpretation: data.results[0].label,
        hr: data.hr
      }
    });
  };

  return (
    <TimedTestTemplate
      title="Timed Up and Go (TUG)"
      description="Avaliação de mobilidade funcional e equilíbrio dinâmico."
      interpretation={interpretation}
      predictedValue={predictedFurlanetto}
      observedValueOverride={parseFloat(observedTime) || 0}
      invertCIFRatio={true}
      onSave={handleSave}
      pearls={[
        "Forte preditor de eventos adversos na Insuficiência Cardíaca (Kamiya et al., 2016).",
        "Corte de 10.8s: Acima disso, o risco de reinternação em cardiopatas aumenta.",
        "Diferente do TC6M, o TUG foca em transição de postura e mudança de direção."
      ]}
      reference="Furlanetto KC, et al. 2022; Kamiya K, et al. 2016."
    >
      <div className="space-y-6">
        {/* Alerta de Escopo do Teste */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={16} className="text-blue-600" />
            <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Aviso ao Avaliador</span>
          </div>
          <p className="text-[11px] text-blue-700 leading-tight">
            Este teste avalia <strong>equilíbrio dinâmico</strong> e <strong>mobilidade</strong>. 
            Não deve ser usado isoladamente para inferir capacidade aeróbica ou endurance cardiovascular.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase">Idade</label>
            <input
              type="number"
              value={patientInfo.age || ''}
              onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
              className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none font-bold"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase">Sexo</label>
            <div className="flex gap-2">
              {['male', 'female'].map((s) => (
                <button
                  key={s}
                  onClick={() => setPatientInfo({ ...patientInfo, sex: s as 'male' | 'female' })}
                  className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all text-xs ${
                    patientInfo.sex === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-100'
                  }`}
                >
                  {s === 'male' ? 'MASC' : 'FEM'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            Tempo Final (Segundos)
          </label>
          <input
            type="number"
            step="0.01"
            value={observedTime}
            onChange={(e) => setObservedTime(e.target.value)}
            placeholder="Ex: 9.12"
            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black text-slate-800 focus:border-indigo-500 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white border-2 border-slate-50 rounded-2xl shadow-sm">
            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Predito (Furlanetto)</p>
            <p className="text-xl font-black text-slate-700">{predictedFurlanetto.toFixed(1)} s</p>
          </div>
          <div className="p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl">
            <div className="flex items-center gap-1 mb-1">
                <ShieldCheck size={12} className="text-rose-600" />
                <p className="text-[9px] font-bold text-rose-600 uppercase">Corte IC</p>
            </div>
            <p className="text-xl font-black text-rose-700">10.8 s</p>
          </div>
        </div>
      </div>
    </TimedTestTemplate>
  );
};