import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Info, AlertCircle, CheckCircle2, ChevronRight, RefreshCcw, ShieldAlert } from 'lucide-react';
import { usePatient } from '../../../context/PatientContext';
import { toast } from 'react-hot-toast';

export const AnginaAlgorithm: React.FC = () => {
  const { updateTestResults } = usePatient();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [ccsGrade, setCcsGrade] = useState<number | null>(null);

  const questions = [
    {
      id: 1,
      text: "A dor ou desconforto é retroesternal (atrás do osso do peito)?",
      desc: "Localização clássica da angina."
    },
    {
      id: 2,
      text: "A dor é descrita como aperto, peso, queimação ou opressão?",
      desc: "Dores isquêmicas raramente são em 'pontada'."
    },
    {
      id: 3,
      text: "A dor irradia para mandíbula, pescoço ou braço esquerdo?",
      desc: "Sinal clássico de dor referida cardíaca."
    },
    {
      id: 4,
      text: "A dor é desencadeada pelo esforço físico ou estresse?",
      desc: "Angina estável tem gatilhos claros de demanda metabólica."
    },
    {
      id: 5,
      text: "A dor desaparece em até 10 minutos com repouso ou nitrato?",
      desc: "Marcador de isquemia miocárdica reversível."
    },
    {
      id: 6,
      text: "A dor ocorre em repouso ou dura mais de 20 minutos?",
      desc: "Atenção: Pode indicar Síndrome Coronariana Aguda."
    },
    {
      id: 7,
      text: "Sente dor ou fadiga nas pernas ao caminhar que para ao descansar?",
      desc: "Isso define a Claudicação Intermitente (Vascular)."
    }
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

    if (q6) return { title: "Angina Instável", type: "Instável", color: "text-red-600", bg: "bg-red-50", icon: <ShieldAlert className="w-10 h-10" /> };

    const criteria = [(q1 && (q2 || q3)), q4, q5].filter(Boolean).length;

    if (criteria === 3) return { title: `Angina Típica ${selectedCcs ? `(CCS ${selectedCcs})` : ""}`, type: "Típica", color: "text-orange-600", bg: "bg-orange-50", icon: <Activity className="w-10 h-10" /> };
    if (criteria === 2) return { title: "Angina Atípica", type: "Atípica", color: "text-amber-600", bg: "bg-amber-50", icon: <Activity className="w-10 h-10" /> };
    
    return { title: "Dor Não-Cardíaca", type: "Não-Cardíaca", color: "text-emerald-600", bg: "bg-emerald-50", icon: <CheckCircle2 className="w-10 h-10" /> };
  };

  const handleAnswer = (val: boolean) => {
    const newAnswers = { ...answers, [step]: val };
    setAnswers(newAnswers);

    if (step < 7) {
      setStep(step + 1);
    } else {
      const result = getFinalResult(newAnswers);
      // Se for Típica, vai para CCS. Senão, salva direto.
      if (result.type === "Típica" && !newAnswers[6]) {
        setStep(8); // Passo da CCS
      } else {
        saveData(newAnswers);
      }
    }
  };

  const saveData = (finalAnswers: Record<number, boolean>, grade?: number) => {
    const result = getFinalResult(finalAnswers, grade);
    
    updateTestResults({
      symptoms: {
        claudication: finalAnswers[7], // Agora integrando a resposta da Q7
        angina: {
          type: result.type,
          description: result.title,
          ...(grade && { ccsGrade: grade })
        }
      }
    });

    setStep(9); // Resultado final
    if (grade) setCcsGrade(grade);
    toast.success("Avaliação de sintomas concluída!");
  };

  const reset = () => {
    setStep(1);
    setAnswers({});
    setCcsGrade(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 min-h-[500px]">
      <header className="flex justify-between items-end px-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Angina & Claudicação</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Triagem de Sintomas Isquêmicos</p>
        </div>
        {step <= 7 && <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">Passo {step}/7</span>}
      </header>

      <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {step <= 7 && (
            <motion.div key="q" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-slate-800 leading-tight">{questions[step - 1].text}</h2>
                <p className="text-slate-400 text-sm flex items-center gap-2 italic">
                  <Info size={14} className="text-indigo-400" /> {questions[step - 1].desc}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handleAnswer(true)} className="py-6 rounded-3xl bg-slate-900 text-white font-black hover:scale-[1.02] transition-all">SIM</button>
                <button onClick={() => handleAnswer(false)} className="py-6 rounded-3xl bg-slate-50 text-slate-400 font-black hover:bg-slate-100 transition-all">NÃO</button>
              </div>
            </motion.div>
          )}

          {step === 8 && (
            <motion.div key="ccs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-xl font-black text-slate-800">Classificação CCS</h2>
              <div className="grid gap-3">
                {ccsOptions.map((opt) => (
                  <button key={opt.grade} onClick={() => saveData(answers, opt.grade)} className="p-4 rounded-2xl border-2 border-slate-50 hover:border-orange-200 hover:bg-orange-50 text-left group transition-all">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-orange-600 uppercase">{opt.label}</span>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-orange-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">{opt.text}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 9 && (
            <motion.div key="res" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8 py-4">
              <div className={`mx-auto w-24 h-24 rounded-[32px] flex items-center justify-center ${getFinalResult(answers, ccsGrade || undefined).bg} ${getFinalResult(answers, ccsGrade || undefined).color}`}>
                {getFinalResult(answers, ccsGrade || undefined).icon}
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{getFinalResult(answers, ccsGrade || undefined).title}</h2>
                <div className="flex justify-center gap-2">
                   {answers[7] && <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">+ Claudicação Positiva</span>}
                </div>
              </div>
              <button onClick={reset} className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-slate-800 transition-all">
                <RefreshCcw size={14} /> REFAZER TRIAGEM
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};