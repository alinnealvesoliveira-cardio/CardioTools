import React, { useState } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Activity, ShieldCheck, Save, CheckCircle2, LayoutDashboard } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const TUG: React.FC = () => {
  const { patientInfo, testResults, updateTestResults } = usePatient();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [observedTime, setObservedTime] = useState<string>('');

  // Estados locais para Sintomas Pós-Teste
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
    if (!finalTime) {
      toast.error("Registre o tempo do teste");
      return;
    }

    const efficiency = (predictedFurlanetto / finalTime) * 100;

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
    <div className="max-w-4xl mx-auto pb-60 relative"> 
      <TimedTestTemplate
        title="Timed Up and Go (TUG)"
        description="Avaliação de mobilidade funcional e equilíbrio dinâmico."
        interpretation={interpretation}
        predictedValue={predictedFurlanetto}
        observedValueOverride={parseFloat(observedTime) || 0}
        invertCIFRatio={true} // TUG: Menor tempo é melhor eficiência
        onSave={handleGlobalSave}
        pearls={[
          "Corte de 10.8s: Acima disso, o risco de reinternação na IC aumenta.",
          "Forte preditor de eventos adversos na Insuficiência Cardíaca.",
          "Avalia transição de postura, marcha e mudança de direção."
        ]}
        reference="Furlanetto KC, et al. 2022; Kamiya K, et al. 2016."
      >
        <div className="space-y-6 px-4">
          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-5 rounded-r-[24px]">
            <div className="flex items-center gap-2 mb-1">
              <Activity size={18} className="text-indigo-600" />
              <span className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">Rastreio de Fragilidade</span>
            </div>
            <p className="text-[11px] text-indigo-700 leading-relaxed">
              O paciente deve levantar-se da cadeira, caminhar 3 metros, girar, voltar e sentar novamente.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-center block">Tempo Manual (s)</label>
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
              <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Predito (Brasil)</p>
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
            <div className="flex items-center gap-2 font-black text-slate-700 uppercase text-xs tracking-widest border-b pb-3">
              <Activity className="text-indigo-500" size={18}/> Sintomas Pós-Esforço
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fadiga (Borg 0-10)</label>
              <div className="grid grid-cols-6 gap-2">
                {[0, 2, 4, 6, 8, 10].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => { setPostFadiga(n); setIsSaved(false); }}
                    className={`py-4 rounded-2xl font-black transition-all active:scale-95 ${postFadiga === n ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
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
                    className={`py-4 rounded-2xl font-black transition-all active:scale-95 ${postAngina === n ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                  >
                    {n === 0 ? 'Não' : n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </TimedTestTemplate>

      {/* RODAPÉ FIXO CORRIGIDO: Z-INDEX 999 */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-[999] flex flex-col gap-3">
        <button
          type="button"
          onClick={() => (document.querySelector('button[type="submit"]') as HTMLButtonElement)?.click()} 
          className={`w-full py-5 rounded-[24px] font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all ${isSaved ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
        >
          {isSaved ? <CheckCircle2 size={24} /> : <Save size={24} className="text-emerald-400" />}
          <span className="text-[11px] uppercase tracking-widest">{isSaved ? 'TUG GRAVADO' : 'GRAVAR RESULTADO'}</span>
        </button>
        
        <button
          type="button"
          onClick={() => navigate('/dashboard')} 
          className="w-full bg-white/90 backdrop-blur-md text-slate-900 py-5 rounded-[24px] font-black border border-slate-200 shadow-xl flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest active:scale-95 transition-all"
        >
          <LayoutDashboard size={18} /> PAINEL DE MÓDULOS
        </button>
      </div>
    </div>
  );
};