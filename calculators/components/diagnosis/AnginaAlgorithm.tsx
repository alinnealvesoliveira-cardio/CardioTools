import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, CheckCircle2, ShieldAlert, ChevronRight, RefreshCcw, AlertCircle } from 'lucide-react';
import { usePatient } from '../../../context/PatientProvider';
import { useNavigate } from 'react-router-dom';

type AnginaType = 'Típica' | 'Atípica' | 'Não-Cardíaca' | 'Instável';

interface Question {
  id: number;
  text: string;
  desc: string;
}

interface CcsOption {
  grade: number;
  label: string;
  text: string;
}

export const AnginaAlgorithm: React.FC = () => {
  const { testResults, updateTestResults } = usePatient();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [ccsGrade, setCcsGrade] = useState<number | null>(null);

  const questions: Question[] = [
    { id: 1, text: "A dor ou desconforto é retroesternal?", desc: "Localização clássica." },
    { id: 2, text: "A dor é descrita como aperto, peso ou opressão?", desc: "Dores isquêmicas raramente são em 'pontada'." },
    { id: 3, text: "A dor irradia para mandíbula, pescoço ou braço?", desc: "Sinal de dor referida cardíaca." },
    { id: 4, text: "A dor é desencadeada pelo esforço ou estresse?", desc: "Gatilhos de demanda." },
    { id: 5, text: "A dor cede em < 10 min com repouso ou nitrato?", desc: "Isquemia reversível." },
    { id: 6, text: "A dor ocorre em repouso ou dura > 20 min?", desc: "Risco de Síndrome Coronariana Aguda." },
    { id: 7, text: "Sente claudicação intermitente ao caminhar?", desc: "Marcador vascular periférico." }
  ];

  const ccsOptions: CcsOption[] = [
    { grade: 1, label: "Classe I", text: "Atividades habituais não causam angina." },
    { grade: 2, label: "Classe II", text: "Leve limitação em atividades comuns." },
    { grade: 3, label: "Classe III", text: "Limitação acentuada da atividade física." },
    { grade: 4, label: "Classe IV", text: "Incapacidade; angina em repouso." }
  ];

  const getFinalResult = (currentAnswers: Record<number, boolean>, grade?: number) => {
    if (currentAnswers[6]) return { title: "Angina Instável", type: "Instável" as AnginaType, color: "text-rose-600", bg: "bg-rose-50", icon: <ShieldAlert className="w-12 h-12" />, alert: "Encaminhar para Emergência imediatamente." };

    const criteria = [(currentAnswers[1] && (currentAnswers[2] || currentAnswers[3])), currentAnswers[4], currentAnswers[5]].filter(Boolean).length;

    if (criteria === 3) return { title: `Angina Típica ${grade ? `(CCS ${grade})` : ""}`, type: "Típica" as AnginaType, color: "text-orange-600", bg: "bg-orange-50", icon: <Activity className="w-12 h-12" />, alert: "Sintomas isquêmicos clássicos confirmados." };
    if (criteria === 2) return { title: "Angina Atípica", type: "Atípica" as AnginaType, color: "text-amber-600", bg: "bg-amber-50", icon: <Activity className="w-12 h-12" />, alert: "Apresentação sugestiva, mas incompleta." };
    
    return { title: "Dor Não-Cardíaca", type: "Não-Cardíaca" as AnginaType, color: "text-emerald-600", bg: "bg-emerald-50", icon: <CheckCircle2 className="w-12 h-12" />, alert: "Provável origem musculoesquelética ou gástrica." };
  };

  const saveData = (finalAnswers: Record<number, boolean>, grade?: number) => {
    const result = getFinalResult(finalAnswers, grade);
    
    // Preserva dados de claudicação existentes antes de atualizar angina
    const prevSymptoms = testResults.symptoms || {};

    updateTestResults('symptoms', {
      ...prevSymptoms,
      angina: {
        type: result.type,
        description: result.alert,
        ccsGrade: grade || 0
      }
    });
  };

  const handleAnswer = (val: boolean) => {
    const newAnswers = { ...answers, [step]: val };
    setAnswers(newAnswers);
    
    if (step === 6 && val) {
      saveData(newAnswers);
      setStep(9); // Resultado final
      return;
    }

    if (step < 7) {
      setStep(step + 1);
    } else {
      const result = getFinalResult(newAnswers);
      if (result.type === "Típica") {
        setStep(8);
      } else {
        saveData(newAnswers);
        setStep(9);
      }
    }
  };

  const currentResult = getFinalResult(answers, ccsGrade || undefined);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 pb-32">
      <AnimatePresence mode="wait">
        {step <= 7 && (
          <motion.div key="q" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">{questions[step - 1].text}</h2>
              <p className="text-slate-500">{questions[step - 1].desc}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleAnswer(true)} className="p-6 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors">Sim</button>
              <button onClick={() => handleAnswer(false)} className="p-6 bg-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-300 transition-colors">Não</button>
            </div>
          </motion.div>
        )}

        {step === 8 && (
          <motion.div key="ccs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-2xl font-bold">Classificação CCS</h2>
            <div className="grid gap-3">
              {ccsOptions.map((opt) => (
                <button key={opt.grade} onClick={() => { setCcsGrade(opt.grade); saveData(answers, opt.grade); setStep(9); }} className="p-4 border border-slate-200 rounded-xl text-left hover:border-emerald-500 transition-all">
                  <div className="font-bold text-emerald-600">{opt.label}</div>
                  <div className="text-sm text-slate-600">{opt.text}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 9 && (
          <motion.div key="res" initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={`p-8 rounded-3xl ${currentResult.bg} border border-slate-100 text-center space-y-6`}>
            <div className={`flex justify-center ${currentResult.color}`}>{currentResult.icon}</div>
            <h2 className={`text-3xl font-black ${currentResult.color}`}>{currentResult.title}</h2>
            <p className="text-slate-700">{currentResult.alert}</p>
            <button onClick={() => { setStep(1); setAnswers({}); }} className="flex items-center gap-2 mx-auto bg-slate-900 text-white px-6 py-3 rounded-full">
              <RefreshCcw size={18} /> Refazer Avaliação
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};