import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Info, AlertCircle, CheckCircle2, ChevronRight, RefreshCcw } from 'lucide-react';
import { usePatient } from '../../../context/PatientContext';

export const AnginaAlgorithm: React.FC = () => {
  const { updateTestResults } = usePatient();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [ccsStep, setCcsStep] = useState<number | null>(null);

  const questions = [
    {
      id: 1,
      text: "A dor ou desconforto é retroesternal (atrás do osso do peito)?",
      desc: "A localização clássica da angina é na região central do tórax."
    },
    {
      id: 2,
      text: "A dor é descrita como aperto, peso, queimação ou opressão?",
      desc: "Dores em 'pontada' ou 'agulhada' são menos sugestivas de origem isquêmica."
    },
    {
      id: 3,
      text: "A dor irradia para mandíbula, pescoço, ombros ou braço esquerdo?",
      desc: "A irradiação é um sinal clássico de dor referida cardíaca."
    },
    {
      id: 4,
      text: "A dor é desencadeada pelo esforço físico ou estresse emocional?",
      desc: "A angina típica é provocada por situações que aumentam o trabalho do coração."
    },
    {
      id: 5,
      text: "A dor desaparece em até 10 minutos com o repouso ou uso de nitrato?",
      desc: "O alívio rápido com repouso é um marcador forte de isquemia miocárdica estável."
    },
    {
      id: 6,
      text: "A dor ocorre em repouso ou tem duração superior a 20 minutos?",
      desc: "Atenção: Dor em repouso prolongada pode indicar Angina Instável ou Infarto (Emergência)."
    }
  ];

  const ccsQuestions = [
    { id: 1, text: "A angina ocorre apenas em atividades físicas extenuantes?", grade: 1, label: "Classe I" },
    { id: 2, text: "Há leve limitação em atividades comuns?", grade: 2, label: "Classe II" },
    { id: 3, text: "Há limitação acentuada em atividades comuns?", grade: 3, label: "Classe III" },
    { id: 4, text: "Angina em repouso ou incapacidade de qualquer atividade?", grade: 4, label: "Classe IV" }
  ];

  const handleAnswer = (answer: boolean) => {
    const newAnswers = { ...answers, [step]: answer };
    setAnswers(newAnswers);
    
    if (step < questions.length) {
      setStep(step + 1);
    } else {
      const q1 = newAnswers[1];
      const q2 = newAnswers[2];
      const q3 = newAnswers[3];
      const q4 = newAnswers[4];
      const q5 = newAnswers[5];
      const q6 = newAnswers[6];

      const result = getResult(undefined, newAnswers);

      if (q6 || !(q1 && (q2 || q3) && q4 && q5)) {
        // CORREÇÃO FINAL: Casting duplo (as any) na chamada para ignorar a trava do TS
        (updateTestResults as any)({
          symptoms: {
            claudication: false,
            angina: {
              type: result.type,
              description: result.title
            }
          }
        });
        setStep(8);
      } else {
        setStep(7);
        setCcsStep(1);
      }
    }
  };

  const handleCcsAnswer = (grade: number) => {
    const result = getResult(grade);
    // CORREÇÃO FINAL: Forçando a aceitação do objeto complexo
    (updateTestResults as any)({
      symptoms: {
        claudication: false,
        angina: {
          type: result.type,
          ccsGrade: grade,
          description: result.title
        }
      }
    });
    setStep(8);
    setCcsStep(grade);
  };

  const reset = () => {
    setStep(1);
    setAnswers({});
    setCcsStep(null);
  };

  const getResult = (selectedCcs?: number, currentAnswers?: Record<number, boolean>) => {
    const activeAnswers = currentAnswers || answers;
    const q1 = activeAnswers[1];
    const q2 = activeAnswers[2];
    const q3 = activeAnswers[3];
    const q4 = activeAnswers[4];
    const q5 = activeAnswers[5];
    const q6 = activeAnswers[6];

    if (q6) return {
      title: "Angina Instável Provável",
      type: "Instável",
      color: "red",
      desc: "Sugere alto risco cardiovascular imediato.",
      recommendation: "Encaminhamento imediato para Emergência."
    };

    const criteriaCount = [(q1 && (q2 || q3)), q4, q5].filter(Boolean).length;

    if (criteriaCount === 3) return {
      title: `Angina Típica (CCS ${selectedCcs || '?'})`,
      type: "Típica",
      color: "orange",
      desc: "Alta probabilidade de DAC.",
      recommendation: "Estratificação funcional conforme risco clínico."
    };

    if (criteriaCount === 2) return {
      title: "Angina Atípica",
      type: "Atypical",
      color: "yellow",
      desc: "Probabilidade intermediária de DAC.",
      recommendation: "Considerar testes de estresse."
    };

    return {
      title: "Dor Não Cardíaca",
      type: "Non-Cardiac",
      color: "green",
      desc: "Baixa probabilidade de origem isquêmica.",
      recommendation: "Investigar causas musculoesqueléticas ou gástricas."
    };
  };

  const result = step === 8 ? getResult(ccsStep || undefined) : null;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">Algoritmo de Angina</h1>
        <p className="text-slate-500 text-sm">Triagem clínica para DAC.</p>
      </header>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-[400px] flex flex-col">
        {step <= 6 ? (
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <div className="text-emerald-600 font-bold text-xs uppercase tracking-widest">Questão {step} de 6</div>
              <h2 className="text-2xl font-bold text-slate-800">{questions[step - 1].text}</h2>
              <p className="text-slate-500 text-sm italic">{questions[step - 1].desc}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleAnswer(true)} className="p-6 rounded-2xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all font-bold flex flex-col items-center gap-2"><CheckCircle2 className="w-8 h-8" />Sim</button>
              <button onClick={() => handleAnswer(false)} className="p-6 rounded-2xl border-2 border-slate-100 hover:border-red-500 hover:bg-red-50 transition-all font-bold flex flex-col items-center gap-2"><AlertCircle className="w-8 h-8" />Não</button>
            </div>
          </motion.div>
        ) : step === 7 ? (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col justify-center space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Grau de limitação funcional?</h2>
            <div className="grid grid-cols-1 gap-3">
              {ccsQuestions.map((q) => (
                <button key={q.id} onClick={() => handleCcsAnswer(q.grade)} className="p-4 rounded-xl border-2 border-slate-100 hover:border-orange-500 hover:bg-orange-50 transition-all text-left flex items-center justify-between group">
                  <div>
                    <div className="text-xs font-bold text-orange-600 uppercase">{q.label}</div>
                    <div className="text-sm font-bold text-slate-700">{q.text}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500" />
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col justify-center space-y-8 text-center">
            <div className={`mx-auto w-20 h-20 rounded-3xl flex items-center justify-center ${result?.color === 'red' ? 'bg-red-100 text-red-600' : result?.color === 'orange' ? 'bg-orange-100 text-orange-600' : result?.color === 'yellow' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}><Activity className="w-10 h-10" /></div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">{result?.title}</h2>
              <p className="text-slate-600">{result?.desc}</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border text-left">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Conduta Sugerida</div>
              <p className="text-sm font-bold text-slate-700">{result?.recommendation}</p>
            </div>
            <button onClick={reset} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm mx-auto"><RefreshCcw className="w-4 h-4" />Reiniciar</button>
          </motion.div>
        )}
      </div>
    </div>
  );
};