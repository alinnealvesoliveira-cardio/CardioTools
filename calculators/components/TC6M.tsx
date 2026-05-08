import React, { useMemo, useState, useRef } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { usePatient } from '../../context/PatientProvider';
import { Ruler, ArrowLeft, ChevronRight, LayoutDashboard, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const TC6M: React.FC = () => {
  const { patientInfo, updateTestResults } = usePatient();
  const navigate = useNavigate();
  
  // Referência para disparar o clique no botão de salvar do Template
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  const [distance, setDistance] = useState<number>(0);
  const [isSaved, setIsSaved] = useState(false);

  // Memoização dos dados biométricos
  const { age, height, weight, sex, isDataValid } = useMemo(() => {
    const a = parseInt(patientInfo?.age?.toString() || '0');
    const h = parseFloat(patientInfo?.height?.toString() || '0');
    const w = parseFloat(patientInfo?.weight?.toString() || '0');
    const s = patientInfo?.sex as string;
    return { age: a, height: h, weight: w, sex: s, isDataValid: a > 0 && h > 0 && w > 0 };
  }, [patientInfo]);

  // Equação de Britto et al. (2013)
  const predictedValue = useMemo(() => {
    if (!isDataValid) return 0;
    const isFemale = sex?.toLowerCase().startsWith('f');
    if (!isFemale) {
      return 894.21 - (5.07 * age) + (1.2 * height) - (1.2 * weight);
    } else {
      const imc = weight / ((height / 100) ** 2);
      return 614.08 - (4.48 * age) + (1.1 * height) - (2.5 * imc);
    }
  }, [age, height, weight, sex, isDataValid]);

  const handleSave = (data: { 
    time: number; 
    results: InterpretationResult[]; 
    hr: { pre: number; post: number } 
  }) => {
    if (distance <= 0) {
      toast.error("Insira a distância percorrida antes de salvar.");
      return;
    }

    updateTestResults('aerobic', { 
      sixMinuteWalkTest: {
        distance: distance,
        time: data.time,
        hr: data.hr,
        interpretation: data.results[0]?.description || ""
      }
    });

    setIsSaved(true);
    toast.success("TC6M Sincronizado!");
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  const interpretation = (time: number): InterpretationResult[] => {
    const perc = predictedValue > 0 ? (distance / predictedValue) * 100 : 0;
    if (perc >= 80) return [{ label: 'Normal', color: 'green', description: `Desempenho de ${perc.toFixed(1)}% do predito.` }];
    if (perc >= 50) return [{ label: 'Reduzido', color: 'yellow', description: `Capacidade funcional moderadamente reduzida (${perc.toFixed(1)}%).` }];
    return [{ label: 'Muito Reduzido', color: 'red', description: `Limitação severa (<50% do esperado).` }];
  };

  if (!isDataValid) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-rose-50 border border-rose-100 rounded-[32px] text-center space-y-4 shadow-sm">
        <AlertCircle className="mx-auto text-rose-500" size={40} />
        <h3 className="font-black text-rose-900 uppercase text-xs tracking-widest">Biometria Incompleta</h3>
        <p className="text-xs text-rose-700 leading-relaxed italic">O cálculo de Britto (2013) exige Idade, Peso e Altura preenchidos no prontuário.</p>
        <button onClick={() => navigate(-1)} className="pt-2 text-[10px] font-black uppercase text-rose-600 underline">Voltar e Corrigir</button>
      </div>
    );
  }

  return (
    <div className="pb-48">
      {/* Ocultamos o botão de salvar padrão do Template para usar o nosso fixo na barra */}
      <style>{`#template-save-button { display: none !important; }`}</style>
      
      <TimedTestTemplate
        title="TC6M"
        description="Capacidade Funcional Aeróbica"
        timerDuration={360}
        predictedValue={predictedValue}
        interpretation={interpretation}
        onSave={handleSave}
        // Passamos uma Ref ou ID para o botão interno se o Template permitir
      >
        <div className="mt-6 p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between px-2">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <Ruler size={14} className="text-indigo-500" /> Distância Total
             </label>
             {distance > 0 && (
               <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-tighter italic">
                 {((distance / predictedValue) * 100).toFixed(1)}% do esperado
               </span>
             )}
          </div>

          <div className="relative">
            <input
              type="number"
              value={distance || ''}
              onChange={(e) => {
                setDistance(Number(e.target.value));
                setIsSaved(false);
              }}
              placeholder="000"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-[32px] p-8 text-6xl font-black text-slate-900 focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-200"
            />
            <span className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 font-black text-2xl italic tracking-tighter">metros</span>
          </div>
        </div>
      </TimedTestTemplate>

      {/* BARRA DE AÇÕES FIXA - O GATILHO ÚNICO */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-[999] flex flex-col gap-3">
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-white/90 backdrop-blur-md text-slate-500 py-5 rounded-[24px] font-black border border-slate-200 shadow-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <ArrowLeft size={16} /> Voltar
          </button>

          <button
            onClick={() => {
              // Simulamos o clique no botão de salvar que está dentro do Template
              const internalBtn = document.getElementById('save-test-button');
              if (internalBtn) {
                internalBtn.click();
              } else {
                toast.error("Inicie e pare o teste antes de salvar.");
              }
            }}
            disabled={distance === 0}
            className={`flex-[2] py-5 rounded-[24px] font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all ${
              distance > 0 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <div className="flex flex-col items-start text-left">
              <span className="text-[11px] uppercase tracking-widest">
                {isSaved ? 'Concluído' : 'Finalizar Teste'}
              </span>
              <span className="text-[8px] text-slate-400 font-medium lowercase italic">
                {isSaved ? 'dados salvos' : 'sincronizar resultados'}
              </span>
            </div>
            {isSaved ? <CheckCircle2 size={18} className="text-emerald-400" /> : <ChevronRight size={18} className="text-emerald-400" />}
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