import React, { useState } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Info, ShieldAlert, Award, Activity, Save, CheckCircle2, ChevronRight } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { toast } from 'react-hot-toast';

export const TSL30S: React.FC = () => {
  const { patientInfo, setPatientInfo, testResults, updateTestResults } = usePatient();
  const [isSaved, setIsSaved] = useState(false);

  // Estados locais para Sintomas Pós-Teste (Padrão CardioTools)
  const [postFadiga, setPostFadiga] = useState<number | null>(null);
  const [postAngina, setPostAngina] = useState<number | null>(null);

  const age = parseInt(patientInfo.age as string) || 65;
  const sex = patientInfo.sex === 'female' ? 'F' : 'M';

  // Alvo de Excelência (Rikli & Jones, 2013)
  const predictedValue = 18; 

  const interpretation = (_time: number, count: number): InterpretationResult[] => {
    if (count === 0) return [{ 
      title: "Força de Resistência", 
      label: "Aguardando", 
      color: "slate", 
      description: "Conte as repetições completas em 30 segundos." 
    }];
    
    const cutoff = sex === 'M' ? 12 : 11;
    
    return [
      {
        title: "Risco de Incapacidade (TSL30S)",
        label: count < cutoff ? "Risco Aumentado" : "Baixo Risco",
        color: count < cutoff ? "red" : "green",
        description: count < cutoff 
          ? `Abaixo do corte brasileiro (< ${cutoff} rep).` 
          : `Força funcional preservada.`
      }
    ];
  };

  const handleGlobalSave = (data: any) => {
    const efficiency = (data.count / predictedValue) * 100;

    // Proteção de Tipagem: Previne erro de spread em objetos nulos/undefined
    const currentScales = testResults?.fatigabilityScales || { 
      rest: { dyspnea: 0, fatigue: 0 }, 
      exercise: { dyspnea: 0, fatigue: 0 } 
    };

    const currentSymptoms = testResults?.symptoms || {
      claudication: false,
      angina: { type: 'none', description: '' }
    };

    updateTestResults({
      tsl30s: {
        count: data.count,
        predicted: predictedValue,
        efficiency: efficiency,
        interpretation: interpretation(30, data.count)[0].label,
        hr: data.hr
      },
      // Salvamento de sintomas integrados
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
          description: postAngina ? `Angina Grau ${postAngina} no TSL30S` : 'Sem dor precordial'
        }
      }
    });

    setIsSaved(true);
    toast.success("TSL 30s gravado com sucesso!");
  };

  return (
    <div className="pb-48"> 
      <TimedTestTemplate
        title="Teste de Sentar e Levantar (30 Segundos)"
        description="Rastreio de força funcional, sarcopenia e risco de incapacidade física."
        timerDuration={30}
        hasCounter={true}
        counterLabel="Repetições Completas"
        interpretation={interpretation}
        predictedValue={predictedValue}
        onSave={handleGlobalSave}
        pearls={[
          "Cortes para brasileiros: 12 (M) e 11 (F) repetições.",
          "Essencial para diagnóstico de Sarcopenia (EWGSOP2).",
          "Foca na força muscular rápida e funcionalidade."
        ]}
        reference="Furlanetto KC, et al. 2022."
      >
        <div className="space-y-6">
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3 items-start">
            <ShieldAlert className="text-amber-600 shrink-0 mt-1" size={18} />
            <p className="text-[11px] text-amber-900 leading-tight italic">
              Ideal para rastrear fragilidade em pacientes que não toleram o teste de 1 minuto.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <Award size={14} className="text-emerald-500" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Corte Mínimo</p>
              </div>
              <p className="text-2xl font-black text-slate-700">{sex === 'M' ? '12' : '11'} <span className="text-xs font-normal">rep</span></p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <div className="flex items-center gap-2 mb-1">
                <Info size={14} className="text-indigo-500" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alvo Ideal</p>
              </div>
              <p className="text-2xl font-black text-slate-700">18 <span className="text-xs font-normal">rep</span></p>
            </div>
          </div>

          {/* SEÇÃO DE SINTOMAS PÓS-ESFORÇO */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-2 font-black text-slate-700 uppercase text-xs tracking-widest">
              <Activity className="text-indigo-500" size={16}/> Sintomas Pós-Teste
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Fadiga (Borg 0-10)</label>
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
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Angina (CCS 0-4)</label>
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

      {/* RODAPÉ FIXO DE AÇÃO */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-50 space-y-3">
        <button
          type="button"
          onClick={() => (document.querySelector('button[type="submit"]') as HTMLButtonElement)?.click()} 
          className={`w-full py-4 rounded-3xl font-black shadow-2xl flex items-center justify-center gap-3 transition-all ${isSaved ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:scale-[1.02]'}`}
        >
          {isSaved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5 text-emerald-400" />}
          {isSaved ? 'DADOS GRAVADOS' : 'GRAVAR RESULTADO'}
        </button>
        
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
          className="w-full bg-white text-slate-600 py-3 rounded-2xl font-bold border border-slate-200 flex items-center justify-center gap-3 text-sm shadow-sm"
        >
          PRÓXIMO TESTE
          <ChevronRight className="w-4 h-4 text-indigo-500" />
        </button>
      </div>
    </div>
  );
};