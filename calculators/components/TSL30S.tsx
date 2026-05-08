import React, { useState, useMemo } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Info, ShieldAlert, Award, Activity, Save, CheckCircle2, LayoutDashboard, RotateCcw } from 'lucide-react';
import { usePatient } from '../../context/PatientProvider';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FunctionalTestResult, CIFData } from '../../types';

export const TSL30S: React.FC = () => {
  const { patientInfo, testResults, updateTestResults } = usePatient();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const [postFadiga, setPostFadiga] = useState<number | null>(null);
  const [postAngina, setPostAngina] = useState<number | null>(null);

  const sex = useMemo(() => {
    const s = (patientInfo?.sex as string || '').toUpperCase();
    return (s === 'FEMALE' || s === 'F') ? 'F' : 'M';
  }, [patientInfo]);

  const predictedValue = 18;

  const handleResetSintomas = () => {
    setPostFadiga(null);
    setPostAngina(null);
    setIsSaved(false);
  };

  const interpretation = (_time: number, count: number): InterpretationResult[] => {
    if (count === 0) return [{ 
      label: "Aguardando", 
      color: "slate", 
      description: "Conte as repetições completas em 30 segundos." 
    }];
    
    const cutoff = sex === 'M' ? 12 : 11;
    
    return [{
      label: count < cutoff ? "Risco Aumentado" : "Baixo Risco",
      color: count < cutoff ? "red" : "green",
      description: count < cutoff 
        ? `Abaixo do ponto de corte brasileiro (< ${cutoff} rep).` 
        : `Força funcional preservada para a idade.`
    }];
  };

  const handleGlobalSave = (data: { 
    time: number; 
    count: number; 
    results: InterpretationResult[]; 
    cif: CIFData | null; 
    hr: { pre: number; post: number }; 
  }) => {
    const efficiency = predictedValue > 0 ? (data.count / predictedValue) * 100 : 0;

    const currentScales = testResults?.fatigability || { 
      rest: { dyspnea: 0, fatigue: 0 }, 
      exercise: { dyspnea: 0, fatigue: 0 } 
    };

    const currentSymptoms = testResults?.symptoms || {
      claudication: false,
      angina: { type: 'none', description: '' }
    };

    updateTestResults('aerobic', {
      tsl30s: {
        count: data.count,
        predicted: predictedValue,
        efficiency: efficiency,
        interpretation: data.results[0]?.label || "Realizado",
        hr: data.hr,
        cif: data.cif ?? undefined
      } as FunctionalTestResult
    });

    updateTestResults('fatigability', {
      ...currentScales,
      exercise: { 
        ...currentScales.exercise, 
        fatigue: postFadiga || 0 
      }
    });

    updateTestResults('symptoms', {  
      ...currentSymptoms,
      angina: {
        type: postAngina && postAngina > 0 ? 'stable' : 'none',
        description: postAngina && postAngina > 0 ? `Angina Grau ${postAngina} no TSL30S` : 'Sem sintomas anginosos'
      },
      claudication: {
    score: (Number.isFinite(postFadiga)) ? 1 : 0, // Substitua 'algumaCondicao' pela lógica do seu teste
    interpretation: (Number.isFinite(postFadiga)) ? "Presença de claudicação" : "Ausência de claudicação",
    timestamp: new Date().toISOString()
  }
});
    
    setIsSaved(true);
    toast.success("TSL 30s gravado com sucesso!");
  };

  return (
    <div className="max-w-4xl mx-auto pb-60 relative"> 
      <TimedTestTemplate
        title="TSL 30s"
        description="Teste de Sentar e Levantar (30 Segundos)"
        timerDuration={30}
        hasCounter={true}
        counterLabel="Repetições Completas"
        interpretation={interpretation}
        predictedValue={predictedValue}
        onSave={handleGlobalSave}
              >
        <div className="space-y-6 px-4">
          <div className="bg-amber-50 p-5 rounded-3xl border border-amber-100 flex gap-3 items-start shadow-sm">
            <ShieldAlert className="text-amber-600 shrink-0 mt-1" size={20} />
            <p className="text-[11px] text-amber-900 leading-tight italic font-medium">
              Utilizado para rastrear fragilidade e sarcopenia (EWGSOP2) em pacientes com baixa tolerância ao esforço.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-white rounded-[24px] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Award size={14} className="text-emerald-500" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Corte Mínimo</p>
              </div>
              <p className="text-3xl font-black text-slate-800">{sex === 'M' ? '12' : '11'} <span className="text-xs font-bold text-slate-400">rep</span></p>
            </div>
            <div className="p-5 bg-white rounded-[24px] border border-slate-100 shadow-sm">
               <div className="flex items-center gap-2 mb-1">
                <Info size={14} className="text-indigo-500" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alvo Ideal</p>
              </div>
              <p className="text-3xl font-black text-slate-800">18 <span className="text-xs font-bold text-slate-400">rep</span></p>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 font-black text-slate-700 uppercase text-xs tracking-widest">
                <Activity className="text-indigo-500" size={18}/> Sintomas
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
        {/* O template gerencia o salvamento; mantive o botão abaixo apenas para navegação */}
        <button
          onClick={() => navigate('/dashboard')} 
          className="w-full bg-white/90 backdrop-blur-md text-slate-900 py-5 rounded-[24px] font-black border border-slate-200 shadow-xl flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest active:scale-95 transition-all"
        >
          <LayoutDashboard size={18} /> PAINEL DE MÓDULOS
        </button>
      </div>
    </div>
  );
};