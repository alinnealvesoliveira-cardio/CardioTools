import React, { useState, useMemo } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Activity, ShieldCheck, Save, CheckCircle2, LayoutDashboard, RotateCcw } from 'lucide-react';
import { usePatient } from '../../context/PatientProvider';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const TUG: React.FC = () => {
  const { patientInfo, testResults, updateTestResults } = usePatient();
  const navigate = useNavigate();
  
  const [isSaved, setIsSaved] = useState(false);
  const [observedTime, setObservedTime] = useState<string>('');
  const [postFadiga, setPostFadiga] = useState<number | null>(null);
  const [postAngina, setPostAngina] = useState<number | null>(null);

  // Otimização: Cálculos reativos
  const { predictedFurlanetto } = useMemo(() => {
    const age = parseInt(patientInfo?.age?.toString() || '65');
    const height = parseFloat(patientInfo?.height?.toString() || '170');
    const weight = parseFloat(patientInfo?.weight?.toString() || '70');
    const s = (patientInfo?.sex as string || '').toUpperCase();
    const sexVal = (s === 'FEMALE' || s === 'F') ? 0 : 1; // Ajustado para a lógica da fórmula: M=1, F=0
    
    const pred = 11.5 - (0.04 * height) + (0.02 * weight) + (0.04 * age) - (0.6 * sexVal);
    
    return { predictedFurlanetto: pred > 0 ? pred : 9.5 };
  }, [patientInfo]);

  const handleResetSintomas = () => {
    setPostFadiga(null);
    setPostAngina(null);
    setIsSaved(false);
  };

  const interpretation = (_time: number): InterpretationResult[] => {
    const time = parseFloat(observedTime) || 0;
    if (time === 0) return [
      { label: "Aguardando", color: "slate", description: "Insira o tempo final para análise." }
    ];
    
    return [
      {
        label: time < 10.8 ? "Mobilidade Preservada" : time < 20 ? "Risco Moderado" : "Alto Risco / Dependente",
        color: time < 10.8 ? "green" : time < 20 ? "yellow" : "red",
        description: time < 10.8 
          ? "Baixo risco de quedas e boa mobilidade funcional." 
          : "Tempo elevado associado a maior risco de reinternação em cardiopatas."
      }
    ];
  };

  const handleGlobalSave = () => {
    const finalTime = parseFloat(observedTime);
    
    if (isNaN(finalTime) || finalTime <= 0) {
      toast.error("Por favor, insira um tempo válido.");
      return;
    }

    const efficiency = finalTime > 0 ? (predictedFurlanetto / finalTime) * 100 : 0;

    const currentScales = testResults?.fatigability || { 
      rest: { dyspnea: 0, fatigue: 0 }, 
      exercise: { dyspnea: 0, fatigue: 0 } 
    };

    updateTestResults('aerobic',  {
      tug: {
        time: finalTime,
        predicted: predictedFurlanetto,
        efficiency: efficiency,
        interpretation: interpretation(finalTime)[0].label,
        hr: { pre: 0, post: 0 } 
      },
      });
      updateTestResults('fatigability', {
          ...currentScales,
        exercise: { 
          ...currentScales.exercise, 
          fatigue: postFadiga || 0 
        }
      });
      updateTestResults('symptoms', {  
                angina: {
          type: postAngina && postAngina > 0 ? 'stable' : 'none',
          description: postAngina && postAngina > 0 ? `Angina Grau ${postAngina} no TSL5X` : 'Sem sintomas anginosos'
        }
      });


    setIsSaved(true);
    toast.success("TUG gravado com sucesso!");
  };

  return (
    <div className="max-w-4xl mx-auto pb-60 relative"> 
      <TimedTestTemplate
        title="TUG Test"
        description="Mobilidade Funcional e Equilíbrio Dinâmico"
        interpretation={interpretation}
        predictedValue={predictedFurlanetto}
        observedValueOverride={parseFloat(observedTime) || 0}
        invertCIFRatio={true} 
        timerDuration={0}
        onSave={handleGlobalSave}
        reference="Furlanetto KC, et al. 2022; Kamiya K, et al. 2016."
      >
        <div className="space-y-6 px-4">
          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-5 rounded-r-[24px]">
            <p className="text-[11px] text-indigo-700 leading-relaxed font-medium">
              Levantar da cadeira, caminhar 3 metros, girar e sentar novamente. 
              <strong> Corte clínico: 10.8s </strong> (Risco de reinternação na IC).
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">Tempo Total (Segundos)</label>
            <input
              type="number"
              step="0.01"
              value={observedTime}
              onChange={(e) => { setObservedTime(e.target.value); setIsSaved(false); }}
              placeholder="0.00"
              className="w-full p-6 bg-white border-2 border-slate-100 rounded-[24px] text-5xl font-black text-slate-800 text-center focus:border-indigo-500 shadow-inner outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-white border border-slate-100 rounded-[24px] shadow-sm">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Predito Brasileiro</p>
              <p className="text-2xl font-black text-slate-700">{predictedFurlanetto.toFixed(1)} <span className="text-xs font-bold opacity-30">s</span></p>
            </div>
            <div className="p-5 bg-rose-50 border border-rose-100 rounded-[24px] shadow-sm">
              <div className="flex items-center gap-1 mb-1">
                <ShieldCheck size={14} className="text-rose-600" />
                <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Corte de Risco</p>
              </div>
              <p className="text-2xl font-black text-rose-700">10.8 <span className="text-xs font-bold opacity-40 uppercase">s</span></p>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 font-black text-slate-700 uppercase text-xs tracking-widest">
                <Activity className="text-indigo-500" size={18}/> Sintomas Pós-Esforço
              </div>
              <button 
                onClick={handleResetSintomas}
                className="text-[9px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest flex items-center gap-1"
              >
                <RotateCcw size={12}/> Limpar
              </button>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fadiga (Borg)</label>
              <div className="grid grid-cols-6 gap-2">
                {[0, 2, 4, 6, 8, 10].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => { setPostFadiga(n); setIsSaved(false); }}
                    className={`py-4 rounded-2xl font-black transition-all ${postFadiga === n ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Angina (CCS 0-4)</label>
              <div className="grid grid-cols-5 gap-2">
                {[0, 1, 2, 3, 4].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => { setPostAngina(n); setIsSaved(false); }}
                    className={`py-4 rounded-2xl font-black text-xs transition-all ${postAngina === n ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                  >
                    {n === 0 ? 'Não' : n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </TimedTestTemplate>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-[999] flex flex-col gap-3">
        <button
          onClick={handleGlobalSave} 
          className={`w-full py-5 rounded-[24px] font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all ${isSaved ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'}`}
        >
          {isSaved ? <CheckCircle2 size={24} /> : <Save size={24} className="text-emerald-400" />}
          <span className="text-[11px] uppercase tracking-widest">{isSaved ? 'TUG GRAVADO' : 'GRAVAR RESULTADO'}</span>
        </button>
        
        <button
          onClick={() => navigate('/dashboard')} 
          className="w-full bg-white/90 backdrop-blur-md text-slate-900 py-5 rounded-[24px] font-black border border-slate-200 shadow-xl flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest"
        >
          <LayoutDashboard size={18} /> PAINEL DE MÓDULOS
        </button>
      </div>
    </div>
  );
};