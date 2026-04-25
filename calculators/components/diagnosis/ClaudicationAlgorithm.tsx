import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Info, AlertCircle, CheckCircle2, ChevronRight, RefreshCcw, Save, ShieldAlert } from 'lucide-react';
import { usePatient } from '../../../context/PatientProvider';
import { toast } from 'react-hot-toast';
// Ajuste o caminho abaixo para onde sua função utilitária está guardada
import { getCIFClassification } from '../../../utils/cif'; 

export const ClaudicationAlgorithm: React.FC = () => {
  const { testResults, updateTestResults } = usePatient();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [isSaved, setIsSaved] = useState(false);

  const questions = [
    { id: 1, text: "Você sente dor ou desconforto nas pernas ao caminhar?", desc: "A claudicação é a dor muscular que surge no exercício e cessa no repouso." },
    { id: 2, text: "A dor começa após uma distância específica de caminhada?", desc: "A reprodutibilidade da distância (limiar isquêmico) sugere origem arterial." },
    { id: 3, text: "A dor desaparece em menos de 10 minutos quando você para?", desc: "O alívio rápido ao interromper a carga é típico da claudicação arterial." },
    { id: 4, text: "A dor ocorre mesmo quando você está parado ou sentado?", desc: "Atenção: Dor em repouso pode indicar isquemia crítica (Fontaine III/IV)." }
  ];

  // Função integrada para calcular Qualificador CIF
  const getCapacityQual = (): string => {
    const aerobic = testResults?.aerobic;
    if (!aerobic) return "8";

    const efficiencies = [
      aerobic.sixMinuteWalkTest?.efficiency,
      aerobic.stepTest?.efficiency,
      aerobic.tsl5x ? 50 : undefined,
      aerobic.dasi?.percentage
    ].filter((val): val is number => typeof val === 'number' && !isNaN(val));

    if (efficiencies.length === 0) return "8"; 
    
    const minEfficiency = Math.min(...efficiencies);
    const classification = getCIFClassification(minEfficiency, 100);
    
    return classification?.qualifier?.toString() ?? "8";
  };

  const handleAnswer = (answer: boolean) => {
    const newAnswers = { ...answers, [step]: answer };
    setAnswers(newAnswers);
    if (step < questions.length) {
      setStep(step + 1);
    } else {
      setStep(5);
    }
  };

  const getResult = () => {
    const { 1: q1, 2: q2, 3: q3, 4: q4 } = answers;

    if (q4) return { title: "Isquemia Crítica Provável", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", icon: <ShieldAlert className="w-12 h-12" />, desc: "Dor em repouso indica estágio avançado de DAP (Fontaine III ou IV). Alto risco de perda de membro.", recommendation: "ENCAMINHAMENTO URGENTE para Vascular + Realizar ITB." };
    if (q1 && q2 && q3) return { title: "Claudicação Típica", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", icon: <Activity className="w-12 h-12" />, desc: "Padrão clássico de Edimburgo positivo para Doença Arterial Periférica.", recommendation: "Confirmar com ITB e iniciar Treinamento Supervisionado." };
    if (q1 && (!q2 || !q3)) return { title: "Claudicação Atípica", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: <Info className="w-12 h-12" />, desc: "Sintomas sugestivos, mas não seguem o padrão isquêmico clássico.", recommendation: "Avaliar diagnóstico diferencial (Venoso, Neurogênico ou Ortopédico)." };

    return { title: "Probabilidade Baixa", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: <CheckCircle2 className="w-12 h-12" />, desc: "Sintomas relatados não sugerem obstrução arterial significativa no momento.", recommendation: "Investigar outras causas e monitorar sinais tróficos." };
  };

  const result = step === 5 ? getResult() : null;

  const handleSave = () => {
    if (!result) return;

    updateTestResults('fatigability', {
      rest: { dyspnea: 0, fatigue: 0 },
      exercise: { dyspnea: 0, fatigue: 0 }
    });

    updateTestResults('symptoms', {
      claudication: {
        score: answers[1] ? 1 : 0,
        interpretation: answers[1] ? "Presença de claudicação" : "Ausência de claudicação",
        timestamp: new Date().toISOString()
      },
      angina: { type: "none", description: "Not evaluated in this assessment" }
    });

    setIsSaved(true);
    toast.success("Avaliação vascular gravada!");
  };

  const reset = () => {
    setStep(1);
    setAnswers({});
    setIsSaved(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 pb-20">
      <header className="px-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">EDIMBURGO VASCULAR</h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Triagem de Doença Arterial Periférica</p>
      </header>

      <div className="bg-white rounded-[44px] p-10 shadow-sm border border-slate-100 min-h-[460px] flex flex-col justify-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          {step <= 4 ? (
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
              <div className="space-y-4">
                <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Questão {step}/4</span>
                <h2 className="text-3xl font-black text-slate-800 leading-tight tracking-tight">{questions[step - 1].text}</h2>
                <div className="flex gap-2 items-center text-slate-400 bg-slate-50 w-fit px-4 py-2 rounded-2xl">
                  <Info size={14} />
                  <p className="text-xs font-bold italic">{questions[step - 1].desc}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handleAnswer(true)} className="py-8 rounded-[32px] bg-slate-900 text-white font-black text-lg hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-200">SIM</button>
                <button onClick={() => handleAnswer(false)} className="py-8 rounded-[32px] bg-slate-50 text-slate-400 font-black text-lg hover:bg-slate-100 active:scale-95 transition-all">NÃO</button>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8">
              <div className={`mx-auto w-24 h-24 rounded-[38px] flex items-center justify-center shadow-inner ${result?.bg} ${result?.color}`}>{result?.icon}</div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">{result?.title}</h2>
                <p className="text-slate-600 text-sm font-medium px-4">{result?.desc}</p>
              </div>

              <div className={`p-6 ${result?.bg} rounded-[32px] border ${result?.border} space-y-2 text-left`}>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><ChevronRight className="w-4 h-4" /> Conduta Recomendada</div>
                <p className={`text-sm font-black ${result?.color} leading-snug`}>{result?.recommendation}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                <button onClick={reset} className="flex items-center justify-center gap-2 p-5 bg-slate-100 text-slate-600 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"><RefreshCcw size={16} /> REFAZER</button>
                <button onClick={handleSave} disabled={isSaved} className={`flex items-center justify-center gap-2 p-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest transition-all shadow-lg ${isSaved ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'}`}>
                  {isSaved ? <CheckCircle2 size={16} /> : <Save size={16} />} {isSaved ? 'GRAVADO' : 'GRAVAR'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};