import React, { useState } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Info, AlertCircle, Activity, ShieldCheck, Save, CheckCircle2, ChevronRight } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { toast } from 'react-hot-toast';

export const TUG: React.FC = () => {
  const { patientInfo, setPatientInfo, testResults, updateTestResults } = usePatient();
  const [isSaved, setIsSaved] = useState(false);
  const [observedTime, setObservedTime] = useState<string>('');

  // Estados locais para Sintomas Pós-Teste (Padrão CardioTools)
  const [postFadiga, setPostFadiga] = useState<number | null>(null);
  const [postAngina, setPostAngina] = useState<number | null>(null);

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
  const benchmarkCardio = 10.8; 

  const interpretation = (_time: number): InterpretationResult[] => {
    const time = parseFloat(observedTime) || _time;
    if (!time || time === 0) return [
      { title: "Mobilidade Funcional", label: "Aguardando", color: "slate", description: "Insira o tempo final." }
    ];
    
    return [
      {
        title: "Risco de Queda",
        label: time < 10 ? "Independente" : time < 20 ? "Risco Moderado" : "Alto Risco",
        color: time < 10 ? "green" : time < 20 ? "yellow" : "red",
        description: time < 10 ? "Baixo risco de quedas." : "Déficit de equilíbrio dinâmico."
      }
    ];
  };

  const handleGlobalSave = (data: any) => {
    const finalTime = data.time || parseFloat(observedTime);
    const efficiency = (predictedFurlanetto / finalTime) * 100;

    // Proteção de Tipagem (Evita as "cobrinhas vermelhas")
    const currentScales = testResults?.fatigabilityScales || { 
      rest: { dyspnea: 0, fatigue: 0 }, 
      exercise: { dyspnea: 0, fatigue: 0 } 
    };

    const currentSymptoms = testResults?.symptoms || {
      claudication: false,
      angina: { type: 'none', description: '' }
    };

    updateTestResults({
      tug: {
        time: finalTime,
        predicted: predictedFurlanetto,
        efficiency: efficiency,
        interpretation: interpretation(finalTime)[0].label,
        hr: data.hr
      },
      // Salvamento unificado
      fatigabilityScales: {
        ...currentScales,
        exercise: { 
          ...currentScales.exercise, 
          fatigue: postFadiga || 0 
        }
      },
      symptoms: {
        ...currentSymptoms,
        angina: {
          type: postAngina && postAngina > 0 ? 'stable' : 'none',
          description: postAngina ? `Angina Grau ${postAngina} no TUG` : 'Sem dor precordial'
        }
      }
    });

    setIsSaved(true);
    toast.success("TUG gravado com sucesso!");
  };

  return (
    <div className="pb-48"> 
      <TimedTestTemplate
        title="Timed Up and Go (TUG)"
        description="Avaliação de mobilidade funcional e equilíbrio dinâmico."
        interpretation={interpretation}
        predictedValue={predictedFurlanetto}
        observedValueOverride={parseFloat(observedTime) || 0}
        invertCIFRatio={true}
        onSave={handleGlobalSave}
        pearls={[
          "Corte de 10.8s: Acima disso, o risco de reinternação na IC aumenta.",
          "Forte preditor de eventos adversos na Insuficiência Cardíaca.",
          "Avalia transição de postura, marcha e mudança de direção."
        ]}
        reference="Furlanetto KC, et al. 2022; Kamiya K, et al. 2016."
      >
        <div className="space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
            <div className="flex items-center gap-2 mb-1">
              <Activity size={16} className="text-blue-600" />
              <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Fisioterapia Motora</span>
            </div>
            <p className="text-[11px] text-blue-700 leading-tight">
              Este teste avalia <strong>equilíbrio dinâmico</strong>. Use-o para rastreio de fragilidade.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Tempo Manual (opcional)</label>
            <input
              type="number"
              step="0.01"
              value={observedTime}
              onChange={(e) => setObservedTime(e.target.value)}
              placeholder="0.00 s"
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black text-slate-800 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white border-2 border-slate-50 rounded-2xl">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Predito (Furlanetto)</p>
              <p className="text-xl font-black text-slate-700">{predictedFurlanetto.toFixed(1)} s</p>
            </div>
            <div className="p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl">
              <div className="flex items-center gap-1 mb-1">
                  <ShieldCheck size={12} className="text-rose-600" />
                  <p className="text-[9px] font-bold text-rose-600 uppercase tracking-tighter">Corte Prognóstico</p>
              </div>
              <p className="text-xl font-black text-rose-700">10.8 s</p>
            </div>
          </div>

          {/* SINTOMAS PÓS-ESFORÇO */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-2 font-black text-slate-700 uppercase text-xs tracking-widest">
              <Activity className="text-indigo-500" size={16}/> Sintomas Pós-Esforço
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Fadiga (Borg 0-10)</label>
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
              <label className="text-[10px] font-bold text-slate-400 uppercase">Angina (0-4)</label>
              <div className="grid grid-cols-5 gap-2">
                {[0, 1, 2, 3, 4].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPostAngina(n)}
                    className={`py-3 rounded-xl font-bold transition-all ${postAngina === n ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                  >
                    {n === 0 ? 'Não' : n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </TimedTestTemplate>

      {/* RODAPÉ FIXO */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-50 space-y-3">
        <button
          type="button"
          onClick={() => (document.querySelector('button[type="submit"]') as HTMLButtonElement)?.click()} 
          className={`w-full py-4 rounded-3xl font-black shadow-2xl flex items-center justify-center gap-3 transition-all ${isSaved ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:scale-[1.02]'}`}
        >
          {isSaved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5 text-emerald-400" />}
          {isSaved ? 'TUG GRAVADO' : 'GRAVAR RESULTADO'}
        </button>
        
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
          className="w-full bg-white text-slate-600 py-3 rounded-2xl font-bold border border-slate-200 flex items-center justify-center gap-3 text-sm shadow-sm"
        >
          PROSSEGUIR
          <ChevronRight className="w-4 h-4 text-indigo-500" />
        </button>
      </div>
    </div>
  );
};