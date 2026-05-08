import React, { useState, useMemo } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Info, ShieldAlert, Award, Activity, LayoutDashboard, RotateCcw, ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react';
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

  // Memoização do Sexo para aplicar Cut-offs corretamente
  const sex = useMemo(() => {
    const s = (patientInfo?.sex as string || '').toUpperCase();
    return (s.startsWith('F')) ? 'F' : 'M';
  }, [patientInfo]);

  const predictedValue = 18; // Alvo ideal genérico para adultos

  const interpretation = (_time: number, count: number): InterpretationResult[] => {
    if (count === 0) return [{ 
      label: "Pendente", 
      color: "slate", 
      description: "Realize o máximo de repetições em 30 segundos." 
    }];
    
    // Pontos de corte para sarcopenia/fragilidade (Padrão ouro clínico)
    const cutoff = sex === 'M' ? 12 : 11;
    
    return [{
      label: count < cutoff ? "Risco de Fragilidade" : "Força Preservada",
      color: count < cutoff ? "red" : "green",
      description: count < cutoff 
        ? `Desempenho abaixo do ponto de corte para independência (< ${cutoff} rep).` 
        : `Potência funcional adequada para o perfil do paciente.`
    }];
  };

  const handleGlobalSave = (data: { 
    time: number; 
    count: number; 
    results: InterpretationResult[]; 
    cif: CIFData | null; 
    hr: { pre: number; post: number }; 
  }) => {
    if (data.count <= 0) {
      toast.error("Registre as repetições antes de salvar.");
      return;
    }

    const efficiency = (data.count / predictedValue) * 100;

    // Sincronização centralizada no nó 'aerobic' para o relatório unificado
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

    // Atualiza Fadiga no módulo de fatigabilidade
    if (postFadiga !== null) {
      updateTestResults('fatigability', {
        exercise: { fatigue: postFadiga, dyspnea: 0 }
      });
    }

    // Atualiza Angina no módulo de sintomas
    if (postAngina !== null && postAngina > 0) {
      updateTestResults('symptoms', {  
        angina: {
          type: 'stable',
          description: `Grau ${postAngina} no TSL 30s`
        }
      });
    }
    
    setIsSaved(true);
    toast.success("TSL 30s Sincronizado!");
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto pb-64 relative"> 
      {/* Oculta o botão padrão do template para usar a barra fixa personalizada */}
      <style>{`#template-save-button { display: none !important; }`}</style>

      <TimedTestTemplate
        title="TSL 30s"
        description="Avaliação de Força Funcional (30 segundos)"
        timerDuration={30}
        hasCounter={true}
        counterLabel="Repetições"
        interpretation={interpretation}
        predictedValue={predictedValue}
        onSave={handleGlobalSave}
      >
        <div className="space-y-6 px-4">
          {/* Card Alerta EWGSOP2 */}
          <div className="bg-amber-50 p-6 rounded-[32px] border border-amber-100 flex gap-4 items-start shadow-sm">
            <ShieldAlert className="text-amber-600 shrink-0" size={24} />
            <p className="text-[11px] text-amber-900 leading-relaxed italic font-medium">
              **Rastreio de Sarcopenia:** Este teste é um preditor direto de perda de independência em cardiopatas e idosos.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Award size={14} className="text-emerald-500" /> Corte ({sex})
              </p>
              <p className="text-4xl font-black text-slate-800">{sex === 'M' ? '12' : '11'}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">repetições mínimas</p>
            </div>
            <div className="p-6 bg-slate-900 rounded-[32px] shadow-xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Info size={14} className="text-indigo-400" /> Alvo Ideal
              </p>
              <p className="text-4xl font-black text-white italic">18+</p>
            </div>
          </div>

          {/* Escalas de Sintomas por Toque Único */}
          <div className="bg-slate-50 rounded-[40px] p-8 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Activity size={14} className="text-indigo-500"/> Monitoramento Pós-Teste
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

      {/* BARRA DE AÇÕES FIXA - UNIFICADA */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-[999] flex flex-col gap-3">
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-white/90 backdrop-blur-md text-slate-500 py-5 rounded-[24px] font-black border border-slate-200 shadow-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <ArrowLeft size={16} /> Voltar
          </button>

          <button
            onClick={() => document.getElementById('save-test-button')?.click()}
            className={`flex-[2] py-5 rounded-[24px] font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all ${
              isSaved ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'
            }`}
          >
            <div className="flex flex-col items-start text-left">
              <span className="text-[11px] uppercase tracking-widest">{isSaved ? 'Sincronizado' : 'Salvar TSL 30s'}</span>
              <span className="text-[8px] text-slate-400 font-medium lowercase italic">finalizar diagnóstico funcional</span>
            </div>
            {isSaved ? <CheckCircle2 size={18} className="text-white" /> : <ChevronRight size={18} className="text-emerald-400" />}
          </button>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-2 text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em] hover:text-indigo-500 transition-colors"
        >
          <LayoutDashboard size={12} className="inline mr-1 mb-1" /> Ir para o Painel Geral
        </button>
      </div>
    </div>
  );
};