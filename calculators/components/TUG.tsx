import React, { useState, useMemo } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Activity, ShieldCheck, LayoutDashboard, RotateCcw, ArrowLeft, CheckCircle2, ChevronRight, Clock } from 'lucide-react';
import { usePatient } from '../../context/PatientProvider';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FunctionalTestResult } from '../../types';

export const TUG: React.FC = () => {
  const { patientInfo, testResults, updateTestResults } = usePatient();
  const navigate = useNavigate();
  
  const [isSaved, setIsSaved] = useState(false);
  const [observedTime, setObservedTime] = useState<string>('');
  const [postFadiga, setPostFadiga] = useState<number | null>(null);
  const [postAngina, setPostAngina] = useState<number | null>(null);

  const age = parseInt(patientInfo?.age?.toString() || '0');
  const height = parseFloat(patientInfo?.height?.toString() || '0');
  const weight = parseFloat(patientInfo?.weight?.toString() || '0');
  const isDataValid = age > 0 && height > 0 && weight > 0;

  // Predito Brasileiro (Furlanetto et al., 2022)
  const predictedTUG = useMemo(() => {
    if (!isDataValid) return 0;
    const s = (patientInfo?.sex as string || '').toUpperCase();
    const sexVal = (s === 'FEMALE' || s === 'F' || s === 'FEMININO') ? 0 : 1; 
    
    // Equação: 11.5 - (0.04 * altura) + (0.02 * peso) + (0.04 * idade) - (0.6 * sexo[M=1, F=0])
    const pred = 11.5 - (0.04 * height) + (0.02 * weight) + (0.04 * age) - (0.6 * sexVal);
    return pred > 0 ? pred : 9.5;
  }, [patientInfo, age, height, weight, isDataValid]);

  const interpretation = (timeValue?: number): InterpretationResult[] => {
    const t = timeValue || parseFloat(observedTime) || 0;
    if (t === 0) return [{ label: "Aguardando", color: "slate", description: "Inicie o teste ou insira o tempo." }];
    
    return [{
      label: t < 10.8 ? "Mobilidade Preservada" : t < 20 ? "Risco Moderado" : "Alto Risco / Dependente",
      color: t < 10.8 ? "green" : t < 20 ? "yellow" : "red",
      description: t < 10.8 
        ? "Desempenho normal. Baixo risco de quedas e boa mobilidade." 
        : "Tempo elevado associado a maior risco de reinternação e eventos em cardiopatas."
    }];
  };

  const handleGlobalSave = (data?: any) => {
    const finalTime = data?.time || parseFloat(observedTime);
    
    if (!finalTime || finalTime <= 0) {
      toast.error("Por favor, registre um tempo válido.");
      return;
    }

    // Eficiência: (Predito / Alcançado) * 100. Se t < predito, eficiência > 100% (excelente).
    const efficiency = (predictedTUG / finalTime) * 100;

    // Atualização no nó 'aerobic' para centralizar o diagnóstico funcional
    updateTestResults('aerobic', {
      tug: {
        time: finalTime,
        predicted: predictedTUG,
        efficiency: efficiency,
        interpretation: interpretation(finalTime)[0].label,
        hr: data?.hr || { pre: 0, post: 0 }
      } as FunctionalTestResult
    });

    // Sincronização de Fadiga e Angina
    if (postFadiga !== null) {
      updateTestResults('fatigability', { exercise: { fatigue: postFadiga, dyspnea: 0 } });
    }

    if (postAngina !== null && postAngina > 0) {
      updateTestResults('symptoms', {  
        angina: { type: 'stable', description: `Grau ${postAngina} no TUG` }
      });
    }

    setIsSaved(true);
    toast.success("TUG Sincronizado!");
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  if (!isDataValid) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-amber-50 border border-amber-200 rounded-[32px] text-center space-y-4">
        <ShieldCheck className="mx-auto text-amber-500" size={40} />
        <h3 className="font-black text-amber-900 uppercase text-xs">Dados Antropométricos Faltando</h3>
        <p className="text-xs text-amber-700 italic">Precisamos de idade, peso e altura para calcular o predito brasileiro do TUG.</p>
        <button onClick={() => navigate(-1)} className="text-[10px] font-black uppercase text-amber-600 underline">Voltar</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-64 relative"> 
      <style>{`#template-save-button { display: none !important; }`}</style>

      <TimedTestTemplate
        title="TUG Test"
        description="Timed Up and Go (Mobilidade Funcional)"
        timerDuration={0} // Cronômetro livre
        interpretation={interpretation}
        predictedValue={predictedTUG}
        onSave={handleGlobalSave}
      >
        <div className="space-y-6 px-4">
          {/* Card de Referência Técnica */}
          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[32px] flex gap-4">
            <div className="bg-indigo-500 p-2 rounded-2xl shrink-0 h-fit">
              <Clock className="text-white" size={20} />
            </div>
            <p className="text-[11px] leading-relaxed text-indigo-900 font-medium italic">
              O paciente deve levantar, caminhar 3m, girar e sentar. <br/>
              <strong>Corte Clínico:</strong> 10.8s (Furlanetto et al.)
            </p>
          </div>

          {/* Input Manual / Display de Tempo */}
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 text-center">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tempo Observado</label>
            <input
              type="number"
              step="0.01"
              value={observedTime}
              onChange={(e) => { setObservedTime(e.target.value); setIsSaved(false); }}
              placeholder="0.00"
              className="w-full bg-transparent text-6xl font-black text-slate-900 text-center outline-none placeholder:text-slate-100"
            />
            <p className="text-[10px] font-bold text-slate-300 uppercase mt-2 italic">segundos</p>
          </div>

          {/* Grid de Valores de Referência */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-slate-900 rounded-[32px] shadow-xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Predito (BR)</p>
              <p className="text-3xl font-black text-white italic">{predictedTUG.toFixed(1)} <span className="text-xs">s</span></p>
            </div>
            <div className="p-6 bg-rose-50 border border-rose-100 rounded-[32px]">
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <ShieldCheck size={12}/> Corte IC
              </p>
              <p className="text-3xl font-black text-rose-600 italic">10.8 <span className="text-xs">s</span></p>
            </div>
          </div>

          {/* Escalas de Sintomas */}
          <div className="bg-slate-50 rounded-[40px] p-8 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Activity size={14} className="text-indigo-500"/> Sintomas Pós-Esforço
              </span>
              <button onClick={() => {setPostFadiga(null); setPostAngina(null);}} className="text-slate-400">
                <RotateCcw size={14}/>
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase ml-1">Fadiga (Borg 0-10)</p>
              <div className="flex justify-between gap-2">
                {[0, 2, 4, 6, 8, 10].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => { setPostFadiga(n); setIsSaved(false); }}
                    className={`flex-1 py-4 rounded-2xl font-black transition-all ${postFadiga === n ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase ml-1">Angina (0-4)</p>
              <div className="flex justify-between gap-2">
                {[0, 1, 2, 3, 4].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => { setPostAngina(n); setIsSaved(false); }}
                    className={`flex-1 py-4 rounded-2xl font-black transition-all ${postAngina === n ? 'bg-rose-500 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}
                  >
                    {n === 0 ? 'Não' : n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </TimedTestTemplate>

      {/* BARRA DE AÇÕES FIXA */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-[999] flex flex-col gap-3">
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-white/90 backdrop-blur-md text-slate-500 py-5 rounded-[24px] font-black border border-slate-200 shadow-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} /> Voltar
          </button>

          <button
            onClick={() => {
              const btn = document.getElementById('save-test-button');
              btn ? btn.click() : handleGlobalSave();
            }}
            className={`flex-[2] py-5 rounded-[24px] font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all ${
              isSaved ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'
            }`}
          >
            <div className="flex flex-col items-start text-left">
              <span className="text-[11px] uppercase tracking-widest">{isSaved ? 'Sincronizado' : 'Finalizar TUG'}</span>
              <span className="text-[8px] text-slate-400 font-medium lowercase italic">enviar para relatório final</span>
            </div>
            {isSaved ? <CheckCircle2 size={18} /> : <ChevronRight size={18} className="text-emerald-400" />}
          </button>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-2 text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em] hover:text-indigo-500 transition-colors"
        >
          <LayoutDashboard size={12} className="inline mr-1 mb-1" /> Ir para Dashboard
        </button>
      </div>
    </div>
  );
};