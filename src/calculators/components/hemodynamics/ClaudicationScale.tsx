import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Info, CheckCircle2, Save, AlertTriangle, Zap } from 'lucide-react';
import { usePatient } from '../../../context/PatientProvider';
import { toast } from 'react-hot-toast';

export const ClaudicationScale: React.FC = () => {
  const { updateTestResults } = usePatient();
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const CLAUDICATION_ITEMS = [
    { score: 0, label: "GRAU 0", description: "Absoluta ausência de dor ou desconforto isquêmico." },
    { score: 1, label: "GRAU 1", description: "Início de desconforto. Dor mínima ou sensação de aperto." },
    { score: 2, label: "GRAU 2", description: "Dor moderada. O paciente consegue prosseguir o esforço com foco." },
    { score: 3, label: "GRAU 3", description: "Dor intensa. Próximo ao limite funcional, mas ainda em movimento." },
    { score: 4, label: "GRAU 4", description: "Dor insuportável. Claudicação máxima que exige interrupção imediata." },
  ];

  const getInterpretation = (score: number) => {
    if (score === 0) return { 
      label: "SEM CLAUDICAÇÃO", 
      color: "bg-emerald-500", 
      light: "bg-emerald-50", 
      border: "border-emerald-200",
      desc: "Ausência de sintomas isquêmicos durante o esforço físico." 
    };
    if (score <= 2) return { 
      label: "CLAUDICAÇÃO LEVE/MODERADA", 
      color: "bg-amber-500", 
      light: "bg-amber-50", 
      border: "border-amber-200",
      desc: "Isquemia muscular presente, porém não limitante a curto prazo." 
    };
    return { 
      label: "CLAUDICAÇÃO GRAVE", 
      color: "bg-red-600", 
      light: "bg-red-50", 
      border: "border-red-200",
      desc: "Sintomatologia limitante. Indica obstrução arterial periférica significativa." 
    };
  };

  const handleSave = () => {
    if (selectedScore === null) return;
    
    updateTestResults ('symptoms', {
      claudication: {
        score: selectedScore,
        interpretation: getInterpretation(selectedScore).label,
        timestamp: new Date().toISOString()
      }
    });

    setIsSaved(true);
    toast.success("Nível de claudicação registrado!");
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8 pb-32">
      <header className="px-2 space-y-1">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase flex items-center gap-3">
          <Zap className="text-amber-500" fill="currentColor" /> Escala de Claudicação
        </h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Monitoramento de Isquemia em MMII</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SELEÇÃO DE GRAU */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <Activity size={24} />
              </div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest italic">Nível de Dor Isquêmica</h2>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {CLAUDICATION_ITEMS.map((item) => (
                <button
                  key={item.score}
                  onClick={() => {
                    setSelectedScore(item.score);
                    setIsSaved(false);
                  }}
                  className={`group relative w-full p-5 rounded-[24px] text-left transition-all border-2 flex items-center gap-5 ${
                    selectedScore === item.score
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xl translate-x-2'
                      : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all ${
                    selectedScore === item.score 
                      ? 'bg-amber-500 text-slate-900' 
                      : 'bg-white text-slate-400 shadow-sm group-hover:scale-110'
                  }`}>
                    {item.score}
                  </div>
                  <div className="flex-1">
                    <div className={`font-black text-xs uppercase tracking-widest ${selectedScore === item.score ? 'text-amber-400' : 'text-slate-800'}`}>
                      {item.label}
                    </div>
                    <div className={`text-[11px] font-medium leading-relaxed italic ${selectedScore === item.score ? 'text-slate-300' : 'text-slate-500'}`}>
                      {item.description}
                    </div>
                  </div>
                  {selectedScore === item.score && (
                    <motion.div layoutId="check" className="bg-emerald-500 p-1.5 rounded-full">
                      <CheckCircle2 size={16} className="text-white" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* INTERPRETAÇÃO E SALVAMENTO */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 space-y-6">
            <AnimatePresence mode="wait">
              {selectedScore !== null ? (
                <motion.div
                  key="interpretation"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-[44px] p-10 shadow-xl border border-slate-100 text-center space-y-2">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Score Selecionado</div>
                    <div className="text-8xl font-black text-slate-900 italic tracking-tighter italic">
                      {selectedScore}
                    </div>
                    <div className="text-[9px] font-black text-amber-600 bg-amber-50 inline-block px-4 py-1 rounded-full uppercase tracking-widest">
                      Dor Isquêmica Periférica
                    </div>
                  </div>

                  {(() => {
                    const info = getInterpretation(selectedScore);
                    return (
                      <div className={`rounded-[32px] p-8 border shadow-lg ${info.light} ${info.border}`}>
                        <div className="flex items-center gap-3 mb-4 text-slate-900">
                          <AlertTriangle size={18} className="text-amber-500" />
                          <div className="text-[10px] font-black uppercase tracking-widest">Avaliação Técnica</div>
                        </div>
                        <div className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2 italic">
                          {info.label}
                        </div>
                        <p className="text-sm font-medium text-slate-600 italic leading-relaxed">
                          "{info.desc}"
                        </p>
                      </div>
                    );
                  })()}

                  <button
                    onClick={handleSave}
                    className={`w-full py-6 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl ${
                      isSaved 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {isSaved ? <CheckCircle2 size={20} /> : <Save size={20} className="text-amber-400" />}
                    {isSaved ? 'DADO REGISTRADO' : 'SALVAR NA AVALIAÇÃO'}
                  </button>
                </motion.div>
              ) : (
                <div className="bg-slate-50 rounded-[44px] p-12 border-4 border-dashed border-slate-200 text-center flex flex-col items-center justify-center min-h-[400px]">
                   <Activity className="w-16 h-16 text-slate-200 mb-6 animate-pulse" />
                   <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] leading-relaxed">
                     Aguardando avaliação <br /> do paciente durante esforço
                   </h3>
                </div>
              )}
            </AnimatePresence>

            <div className="bg-amber-900 rounded-[32px] p-6 text-amber-100 flex gap-4 border-none">
              <Info className="shrink-0 text-amber-400" size={20} />
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Pérola Clínica</p>
                <p className="text-[11px] leading-relaxed italic font-medium">
                  Em pacientes com DAP, a claudicação Grau 3 ou 4 costuma ser o critério de interrupção do TC6M, sendo um forte preditor de funcionalidade reduzida.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};