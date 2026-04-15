import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Info, AlertCircle, CheckCircle2, ChevronRight, RefreshCcw, ShieldAlert, LayoutDashboard } from 'lucide-react';
import { usePatient } from '../../../context/PatientContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const AnginaAlgorithm: React.FC = () => {
  const { updateTestResults } = usePatient();
  const navigate = useNavigate();
  
  // Estados do componente
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [ccsGrade, setCcsGrade] = useState<number | null>(null);

  // Função para reiniciar o teste (Corrige a cobrinha no botão Refazer)
  const reset = () => {
    setStep(1);
    setAnswers({});
    setCcsGrade(null);
  };

  const questions = [
    { id: 1, text: "A dor ou desconforto é retroesternal (atrás do osso do peito)?", desc: "Localização clássica da angina." },
    { id: 2, text: "A dor é descrita como aperto, peso, queimação ou opressão?", desc: "Dores isquêmicas raramente são em 'pontada'." },
    { id: 3, text: "A dor irradia para mandíbula, pescoço ou braço esquerdo?", desc: "Sinal clássico de dor referida cardíaca." },
    { id: 4, text: "A dor é desencadeada pelo esforço físico ou estresse?", desc: "Angina estável tem gatilhos claros de demanda." },
    { id: 5, text: "A dor desaparece em até 10 minutos com repouso ou nitrato?", desc: "Marcador de isquemia miocárdica reversível." },
    { id: 6, text: "A dor ocorre em repouso ou dura mais de 20 minutos?", desc: "Atenção: Pode indicar Síndrome Coronariana Aguda." },
    { id: 7, text: "Sente dor/fadiga nas pernas ao caminhar que para ao descansar?", desc: "Isso define a Claudicação Intermitente (Vascular)." }
  ];

  const ccsOptions = [
    { grade: 1, label: "Classe I", text: "Atividades habituais não causam angina." },
    { grade: 2, label: "Classe II", text: "Leve limitação em atividades comuns." },
    { grade: 3, label: "Classe III", text: "Limitação acentuada da atividade física." },
    { grade: 4, label: "Classe IV", text: "Incapacidade; angina em repouso." }
  ];

  const getFinalResult = (currentAnswers: Record<number, boolean>, selectedCcs?: number) => {
    const q1 = currentAnswers[1], q2 = currentAnswers[2], q3 = currentAnswers[3], 
          q4 = currentAnswers[4], q5 = currentAnswers[5], q6 = currentAnswers[6];

    if (q6) return { title: "Angina Instável", type: "Instável", color: "text-rose-600", bg: "bg-rose-50", icon: <ShieldAlert className="w-12 h-12" />, alert: "Encaminhar para Emergência se dor persistir." };

    const criteria = [(q1 && (q2 || q3)), q4, q5].filter(Boolean).length;

    if (criteria === 3) return { title: `Angina Típica ${selectedCcs ? `(CCS ${selectedCcs})` : ""}`, type: "Típica", color: "text-orange-600", bg: "bg-orange-50", icon: <Activity className="w-12 h-12" />, alert: "Sintomas isquêmicos clássicos confirmados." };
    if (criteria === 2) return { title: "Angina Atípica", type: "Atípica", color: "text-amber-600", bg: "bg-amber-50", icon: <Activity className="w-12 h-12" />, alert: "Apresentação sugestiva, mas incompleta." };
    
    return { title: "Dor Não-Cardíaca", type: "Não-Cardíaca", color: "text-emerald-600", bg: "bg-emerald-50", icon: <CheckCircle2 className="w-12 h-12" />, alert: "Provável origem musculoesquelética ou gástrica." };
  };

  const handleAnswer = (val: boolean) => {
    const newAnswers = { ...answers, [step]: val };
    setAnswers(newAnswers);
    if (step < 7) setStep(step + 1);
    else {
      const result = getFinalResult(newAnswers);
      if (result.type === "Típica" && !newAnswers[6]) setStep(8);
      else saveData(newAnswers);
    }
  };

  const saveData = (finalAnswers: Record<number, boolean>, grade?: number) => {
    const result = getFinalResult(finalAnswers, grade);
    updateTestResults({
      symptoms: {
        claudication: finalAnswers[7],
        angina: { type: result.type, description: result.title, ...(grade && { ccsGrade: grade }) }
      }
    });
    setStep(9);
    if (grade) setCcsGrade(grade);
    toast.success("Sintomas registrados!");
  };

  const currentResult = getFinalResult(answers, ccsGrade || undefined);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 pb-32">
      <header className="flex justify-between items-end px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">DIAMOND-FORRESTER</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Triagem de Isquemia Miocárdica e Vascular</p>
        </div>
        {step <= 7 && <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full uppercase tracking-widest">Step {step}/7</span>}
      </header>

      <div className="bg-white rounded-[44px] p-10 shadow-sm border border-slate-100 relative overflow-hidden min-h-[420px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {step <= 7 && (
            <motion.div key="q" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-slate-800 leading-[1.1] tracking-tight">{questions[step - 1].text}</h2>
                <div className="flex items-center gap-2 text-indigo-500 bg-indigo-50 w-fit px-4 py-2 rounded-2xl">
                  <Info size={16} />
                  <p className="text-xs font-bold uppercase tracking-tight">{questions[step - 1].desc}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handleAnswer(true)} className="py-8 rounded-[32px] bg-slate-900 text-white font-black text-lg hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-200">SIM</button>
                <button onClick={() => handleAnswer(false)} className="py-8 rounded-[32px] bg-slate-50 text-slate-400 font-black text-lg hover:bg-slate-100 active:scale-95 transition-all">NÃO</button>
              </div>
            </motion.div>
          )}

          {step === 8 && (
            <motion.div key="ccs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="text-center space-y-2 mb-4">
                <h2 className="text-2xl font-black text-slate-900 uppercase">Severidade (CCS)</h2>
                <p className="text-slate-500 text-sm">Qual o nível de limitação física da angina?</p>
              </div>
              <div className="grid gap-3">
                {ccsOptions.map((opt: any) => ( // Adicionado :any para evitar erro de tipo no map
                  <button key={opt.grade} onClick={() => saveData(answers, opt.grade)} className="p-5 rounded-[24px] border-2 border-slate-50 hover:border-orange-400 hover:bg-orange-50/50 text-left group transition-all flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{opt.label}</span>
                      <p className="text-sm font-bold text-slate-800">{opt.text}</p>
                    </div>
                    <ChevronRight size={20} className="text-slate-300 group-hover:text-orange-500 transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 9 && (
            <motion.div key="res" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8">
              <div className={`mx-auto w-24 h-24 rounded-[38px] flex items-center justify-center shadow-inner ${currentResult.bg} ${currentResult.color}`}>
                {currentResult.icon}
              </div>
              <div className="space-y-4">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">{currentResult.title}</h2>
                    <p className={`text-xs font-bold uppercase tracking-widest mt-2 ${currentResult.color}`}>{currentResult.alert}</p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-2">
                   {answers[7] && (
                     <span className="bg-rose-500 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-rose-100 italic">
                       <AlertCircle size={14} /> Claudicação Positiva
                     </span>
                   )}
                   {answers[6] && (
                     <span className="bg-slate-900 text-emerald-400 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl italic border border-white/10">
                       <ShieldAlert size={14} /> Emergência Sugerida
                     </span>
                   )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                <button onClick={reset} className="flex items-center justify-center gap-2 p-5 bg-slate-100 text-slate-600 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">
                    <RefreshCcw size={16} /> Refazer
                </button>
                <button onClick={() => navigate('/dashboard')} className="flex items-center justify-center gap-2 p-5 bg-indigo-600 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                    <LayoutDashboard size={16} /> Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="px-6 py-4 bg-slate-50 rounded-[28px] border border-slate-100">
        <p className="text-[9px] text-slate-400 leading-relaxed font-bold uppercase tracking-tight italic">
          Ref: Diamond GA, Forrester JS. Analysis of probability as an aid in the clinical diagnosis of coronary-artery disease. N Engl J Med. 1979.
        </p>
      </footer>
    </div>
  );
};