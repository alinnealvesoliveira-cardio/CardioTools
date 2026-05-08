import React, { useState, useMemo } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Activity, LayoutDashboard, RotateCcw, Save, CheckCircle2, BookOpen, ArrowLeft, ChevronRight, Clock } from 'lucide-react';
import { usePatient } from '../../context/PatientProvider';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FunctionalTestResult, CIFData } from '../../types';

export const TSL5X: React.FC = () => {
  const { testResults, updateTestResults } = usePatient();
  const navigate = useNavigate();
  
  const [isSaved, setIsSaved] = useState(false);
  const [observedTime, setObservedTime] = useState<string>('');
  const [postFadiga, setPostFadiga] = useState<number | null>(null);
  const [postAngina, setPostAngina] = useState<number | null>(null);

  // Valor normativo de referência (Segundos)
  const predictedValue = 9.0; 

  const interpretation = (time: number): InterpretationResult[] => {
    const t = time || parseFloat(observedTime);
    if (!t || t === 0) return [
      { label: "Aguardando", color: "slate", description: "Inicie o teste para avaliar a potência de MMII." }
    ];
    
    return [
      {
        label: t > 12 ? "Deficiência Moderada/Grave" : t > 9 ? "Deficiência Leve" : "Desempenho Preservado",
        color: t > 12 ? "red" : t > 9 ? "yellow" : "green",
        description: t > 12 
          ? "Tempo elevado (>12s): Forte preditor de fragilidade e risco de quedas em cardiopatas." 
          : "Tempo dentro da normalidade para a funcionalidade diária."
      }
    ];
  };

  const handleGlobalSave = (data?: any) => {
    // Se vier do template (cronômetro), usa data.time, senão usa o estado local
    const finalTime = data?.time || parseFloat(observedTime);
    
    if (!finalTime || finalTime <= 0) {
      toast.error("Por favor, insira ou registre um tempo válido.");
      return;
    }

    // Lógica de Eficiência Reversa (Tempo menor = Eficiência maior)
    let efficiency = 100;
    if (finalTime > 15) efficiency = 20;      
    else if (finalTime > 12) efficiency = 45; 
    else if (finalTime > 9) efficiency = 70;  
    else if (finalTime > 0) efficiency = 95;  

    // Sincronização com o nó 'aerobic' para o relatório final
    updateTestResults('aerobic', {
      tsl5x: {
        time: finalTime,
        predicted: predictedValue,
        efficiency: efficiency,
        interpretation: interpretation(finalTime)[0].label,
        hr: data?.hr || { pre: 0, post: 0 }
      } as FunctionalTestResult
    });

    // Sincronização de sintomas
    if (postFadiga !== null) {
      updateTestResults('fatigability', {
        exercise: { fatigue: postFadiga, dyspnea: 0 }
      });
    }

    if (postAngina !== null && postAngina > 0) {
      updateTestResults('symptoms', {  
        angina: {
          type: 'stable',
          description: `Grau ${postAngina} no TSL5X`
        }
      });
    }

    setIsSaved(true);
    toast.success("TSL 5x Sincronizado!");
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto pb-64 relative"> 
      <style>{`#template-save-button { display: none !important; }`}</style>

      <TimedTestTemplate
        title="TSL 5x"
        description="Potência de MMII e Risco de Quedas"
        timerDuration={0} // Livre
        interpretation={interpretation}
        predictedValue={predictedValue}
        onSave={handleGlobalSave}
      >
        <div className="space-y-6 px-4">
          {/* Card Informativo Técnico */}
          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[32px] flex gap-4">
            <BookOpen size={24} className="text-indigo-600 shrink-0" />
            <p className="text-[11px] leading-relaxed text-indigo-900 font-medium italic">
              O TSL5X é um marcador de **independência funcional**. Tempos acima de **12 segundos** correlacionam-se com maior risco de hospitalização em cardiopatas.
            </p>
          </div>

          {/* Input Manual de Tempo */}
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">
              <Clock size={16} className="text-indigo-500"/> Tempo de Execução
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={observedTime}
                onChange={(e) => {
                  setObservedTime(e.target.value);
                  setIsSaved(false);
                }}
                placeholder="0.00"
                className="w-full bg-transparent text-7xl font-black text-slate-900 outline-none placeholder:text-slate-100"
              />
              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 font-black text-2xl italic">seg</span>
            </div>
          </div>

          {/* Escalas de Sintomas */}
          <div className="bg-slate-50 rounded-[40px] p-8 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Activity size={14} className="text-indigo-500"/> Sintomas Pós-Teste
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
              <p className="text-[10px] font-black text-slate-400 uppercase ml-1">Angina (CCS 0-4)</p>
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

      {/* BARRA DE AÇÕES FIXA - PADRÃO DA SUÍTE */}
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
              const internalBtn = document.getElementById('save-test-button');
              if (internalBtn) internalBtn.click();
              else handleGlobalSave();
            }}
            className={`flex-[2] py-5 rounded-[24px] font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all ${
              isSaved ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'
            }`}
          >
            <div className="flex flex-col items-start text-left">
              <span className="text-[11px] uppercase tracking-widest">{isSaved ? 'Sincronizado' : 'Salvar TSL 5x'}</span>
              <span className="text-[8px] text-slate-400 font-medium lowercase">enviar diagnóstico funcional</span>
            </div>
            {isSaved ? <CheckCircle2 size={18} className="text-white" /> : <ChevronRight size={18} className="text-emerald-400" />}
          </button>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-2 text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em] hover:text-indigo-500 transition-colors"
        >
          <LayoutDashboard size={12} className="inline mr-1 mb-1" /> Dashboard Principal
        </button>
      </div>
    </div>
  );
};