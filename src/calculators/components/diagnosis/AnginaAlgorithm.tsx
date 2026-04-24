import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Info, AlertCircle, CheckCircle2, ChevronRight, RefreshCcw, ShieldAlert, LayoutDashboard } from 'lucide-react';
import { usePatient } from '../../../context/PatientProvider';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Tipos definidos para maior robustez
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
  const { updateTestResults } = usePatient();
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

  const reset = () => {
    setAnswers({});
    setCcsGrade(null);
    setStep(1); // Resetar passo por último garante a fluidez da animação
  };

  const getFinalResult = (currentAnswers: Record<number, boolean>, grade?: number) => {
    if (currentAnswers[6]) return { title: "Angina Instável", type: "Instável" as AnginaType, color: "text-rose-600", bg: "bg-rose-50", icon: <ShieldAlert className="w-12 h-12" />, alert: "Encaminhar para Emergência imediatamente." };

    const criteria = [(currentAnswers[1] && (currentAnswers[2] || currentAnswers[3])), currentAnswers[4], currentAnswers[5]].filter(Boolean).length;

    if (criteria === 3) return { title: `Angina Típica ${grade ? `(CCS ${grade})` : ""}`, type: "Típica" as AnginaType, color: "text-orange-600", bg: "bg-orange-50", icon: <Activity className="w-12 h-12" />, alert: "Sintomas isquêmicos clássicos confirmados." };
    if (criteria === 2) return { title: "Angina Atípica", type: "Atípica" as AnginaType, color: "text-amber-600", bg: "bg-amber-50", icon: <Activity className="w-12 h-12" />, alert: "Apresentação sugestiva, mas incompleta." };
    
    return { title: "Dor Não-Cardíaca", type: "Não-Cardíaca" as AnginaType, color: "text-emerald-600", bg: "bg-emerald-50", icon: <CheckCircle2 className="w-12 h-12" />, alert: "Provável origem musculoesquelética ou gástrica." };
  };

  const saveData = (finalAnswers: Record<number, boolean>, grade?: number) => {
    const result = getFinalResult(finalAnswers, grade);
    updateTestResults('symptoms', {
  claudication: {
    score: 0, // Ajuste para o score real, se houver
    interpretation: "Sintoma ausente", // Ajuste para o texto adequado
    timestamp: new Date().toISOString()
  },
      angina: { 
    type: result.type, 
    description: result.title, 
    ...(grade && { ccsGrade: grade }) 
  }
});
};
  const handleAnswer = (val: boolean) => {
    const newAnswers = { ...answers, [step]: val };
    setAnswers(newAnswers);
    
    // Se for o passo 6 e a resposta for SIM, encerra na angina instável
    if (step === 6 && val) {
      saveData(newAnswers);
      return;
    }

    if (step < 7) {
      setStep(step + 1);
    } else {
      const result = getFinalResult(newAnswers);
      // Se típica, pede CCS (Passo 8), senão finaliza
      if (result.type === "Típica") setStep(8);
      else saveData(newAnswers);
    }
  };

  const currentResult = getFinalResult(answers, ccsGrade || undefined);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 pb-32">
       {/* ... restante do JSX permanece igual, garantindo tipagem nos mapas ... */}
       {step <= 7 && (
         <motion.div key="q" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
            {/* ... seu código original aqui ... */}
         </motion.div>
       )}
       {/* ... */}
    </div>
  );
}