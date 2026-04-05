import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Info, AlertCircle, CheckCircle2, ChevronRight, RefreshCcw, Save } from 'lucide-react';
import { usePatient } from '../../../context/PatientContext';

export const ClaudicationAlgorithm: React.FC = () => {
  const { updateTestResults } = usePatient();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [isSaved, setIsSaved] = useState(false);

  const questions = [
    {
      id: 1,
      text: "Você sente dor ou desconforto nas pernas ao caminhar?",
      desc: "A claudicação intermitente é a dor muscular que ocorre durante o exercício e alivia com o repouso."
    },
    {
      id: 2,
      text: "A dor começa após uma distância específica de caminhada?",
      desc: "A reprodutibilidade da distância é uma característica clássica da claudicação arterial."
    },
    {
      id: 3,
      text: "A dor desaparece rapidamente (em menos de 10 minutos) quando você para de caminhar?",
      desc: "O alívio rápido com o repouso em pé sugere origem arterial."
    },
    {
      id: 4,
      text: "A dor ocorre mesmo quando você está parado ou sentado?",
      desc: "Dor em repouso pode indicar isquemia crítica (estágio avançado)."
    }
  ];

  const handleAnswer = (answer: boolean) => {
    setAnswers({ ...answers, [step]: answer });
    if (step < questions.length) {
      setStep(step + 1);
    } else {
      setStep(5); // Result step
    }
  };

  const reset = () => {
    setStep(1);
    setAnswers({});
    setIsSaved(false);
  };

  const getResult = () => {
    const q1 = answers[1];
    const q2 = answers[2];
    const q3 = answers[3];
    const q4 = answers[4];

    if (q4) return {
      title: "Isquemia Crítica Provável",
      color: "red",
      desc: "A presença de dor em repouso sugere doença arterial periférica avançada (Fontaine III ou IV). Requer avaliação vascular urgente.",
      recommendation: "Encaminhar para cirurgia vascular e realizar ITB imediatamente."
    };

    if (q1 && q2 && q3) return {
      title: "Claudicação Intermitente Típica",
      color: "orange",
      desc: "O padrão de dor induzida pelo exercício e aliviada pelo repouso é altamente sugestivo de Doença Arterial Periférica (DAP).",
      recommendation: "Realizar ITB para confirmação e iniciar protocolo de caminhada supervisionada."
    };

    if (q1 && (!q2 || !q3)) return {
      title: "Claudicação Atípica ou Outras Causas",
      color: "yellow",
      desc: "Os sintomas não seguem o padrão clássico. Pode ser de origem venosa, neurogênica (estenose de canal) ou osteoarticular.",
      recommendation: "Avaliar sinais de insuficiência venosa ou compressão radicular."
    };

    return {
      title: "Baixa Probabilidade de Claudicação Arterial",
      color: "green",
      desc: "Os sintomas relatados não sugerem obstrução arterial significativa no momento.",
      recommendation: "Monitorar sintomas e avaliar outras causas de dor em membros inferiores."
    };
  };

  const handleSave = () => {
    const result = getResult();
    updateTestResults({
      symptoms: {
        claudication: true,
        claudicationDetails: {
          title: result.title,
          description: result.desc
        }
      }
    });
    setIsSaved(true);
  };

  const result = step === 5 ? getResult() : null;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">Algoritmo de Claudicação</h1>
        <p className="text-slate-500 text-sm">Triagem clínica para Doença Arterial Periférica (DAP).</p>
      </header>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-[400px] flex flex-col">
        {step <= 4 ? (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col justify-center space-y-8"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest">
                Questão {step} de 4
              </div>
              <h2 className="text-2xl font-bold text-slate-800 leading-tight">
                {questions[step - 1].text}
              </h2>
              <p className="text-slate-500 text-sm italic">
                {questions[step - 1].desc}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleAnswer(true)}
                className="p-6 rounded-2xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all font-bold text-slate-700 flex flex-col items-center gap-2 group"
              >
                <CheckCircle2 className="w-8 h-8 text-slate-200 group-hover:text-emerald-500 transition-colors" />
                Sim
              </button>
              <button
                onClick={() => handleAnswer(false)}
                className="p-6 rounded-2xl border-2 border-slate-100 hover:border-red-500 hover:bg-red-50 transition-all font-bold text-slate-700 flex flex-col items-center gap-2 group"
              >
                <AlertCircle className="w-8 h-8 text-slate-200 group-hover:text-red-500 transition-colors" />
                Não
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col justify-center space-y-8 text-center"
          >
            <div className={`mx-auto w-20 h-20 rounded-3xl flex items-center justify-center ${
              result?.color === 'red' ? 'bg-red-100 text-red-600' :
              result?.color === 'orange' ? 'bg-orange-100 text-orange-600' :
              result?.color === 'yellow' ? 'bg-amber-100 text-amber-600' :
              'bg-emerald-100 text-emerald-600'
            }`}>
              <Activity className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">{result?.title}</h2>
              <p className="text-slate-600 leading-relaxed">{result?.desc}</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <ChevronRight className="w-4 h-4" />
                Conduta Sugerida
              </div>
              <p className="text-sm font-bold text-slate-700">{result?.recommendation}</p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={reset}
                className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
              >
                <RefreshCcw className="w-4 h-4" />
                Reiniciar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaved}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                  isSaved 
                    ? 'bg-emerald-100 text-emerald-600 cursor-not-allowed'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Gravado
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Gravar Resultado
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex gap-4">
        <Info className="w-6 h-6 text-emerald-600 flex-shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-emerald-900">Nota sobre o Questionário de Edimburgo</p>
          <p className="text-xs text-emerald-700 leading-relaxed">
            Este algoritmo é baseado nos critérios do Questionário de Edimburgo para Claudicação Intermitente, 
            que possui sensibilidade de 80-90% e especificidade acima de 95% para DAP.
          </p>
        </div>
      </div>
    </div>
  );
};
