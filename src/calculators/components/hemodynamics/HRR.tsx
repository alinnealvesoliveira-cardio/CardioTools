import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Info, CheckCircle2, Save, 
  Heart, ArrowDownCircle, InfoIcon 
} from 'lucide-react';

import { usePatient } from '../../../context/PatientContext';
import { useAuth } from '../../../context/AuthContext';
import { logActivity } from '../../../lib/supabase';
import { MedicationAlert } from '../../../components/shared/MedicationAlert';

export const HRR: React.FC = () => {
  const { medications, updateTestResults } = usePatient();
  const { user } = useAuth();
  
  const [peakHR, setPeakHR] = useState<string>('');
  const [recoveryHR, setRecoveryHR] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);

  const calculateHRR = () => {
    const peak = parseInt(peakHR);
    const recovery = parseInt(recoveryHR);
    if (!peak || !recovery) return null;
    return peak - recovery;
  };

  const hrr = calculateHRR();

  const getInterpretation = (val: number) => {
    if (val < 12) return { 
      label: "Recuperação Anormal", 
      color: "text-rose-500", 
      bgColor: "bg-rose-50",
      borderColor: "border-rose-100",
      desc: "HRR < 12 bpm no 1º minuto indica maior risco cardiovascular e disfunção autonômica." 
    };
    return { 
      label: "Recuperação Normal", 
      color: "text-emerald-500", 
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
      desc: "HRR ≥ 12 bpm no 1º minuto indica boa reativação vagal e proteção cardiovascular." 
    };
  };

  const handleSave = async () => {
    if (hrr === null) return;
    const interpretation = getInterpretation(hrr);
    
    updateTestResults('hrr', {
      peakHR: parseInt(peakHR),
      recoveryHR: parseInt(recoveryHR),
      delta: hrr,
      interpretation: interpretation.label
    });

    if (user) await logActivity(user.id, 'Finalizou Teste HRR');
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6 pb-24">
      <header className="space-y-1">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Frequência Cardíaca de Recuperação</h1>
        <p className="text-slate-500 text-sm font-medium">Análise da reativação vagal (1º minuto pós-esforço).</p>
      </header>

      <MedicationAlert type="betablockers" active={medications.betablockers} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna de Inputs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                  <Heart className="w-4 h-4 text-rose-500" /> FC Pico (BPM)
                </label>
                <input
                  type="number"
                  value={peakHR}
                  onChange={(e) => { setPeakHR(e.target.value); setIsSaved(false); }}
                  placeholder="000"
                  className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-2xl text-4xl font-black text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-200"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                  <ArrowDownCircle className="w-4 h-4 text-indigo-500" /> FC 1 min (BPM)
                </label>
                <input
                  type="number"
                  value={recoveryHR}
                  onChange={(e) => { setRecoveryHR(e.target.value); setIsSaved(false); }}
                  placeholder="000"
                  className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-2xl text-4xl font-black text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-200"
                />
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 flex gap-3 items-start">
              <InfoIcon className="w-5 h-5 text-slate-400 mt-0.5" />
              <p className="text-xs text-slate-500 leading-relaxed">
                O <strong>Delta HRR</strong> é a diferença entre a FC máxima atingida e a FC medida exatamente 60 segundos após a interrupção do exercício em pé ou sentado.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100">
             <h4 className="text-xs font-black text-slate-900 uppercase mb-4 flex items-center gap-2">
               <Info className="w-4 h-4 text-indigo-500" /> Pérolas Clínicas
             </h4>
             <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Reflete a reativação parassimpática imediata.",
                  "Ponto de corte clássico: 12 bpm (Cole et al., 1999).",
                  "Valores baixos predizem risco mesmo em testes submáximos.",
                  "O uso de betabloqueadores pode atenuar a FC de pico."
                ].map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-600 flex gap-2">
                    <span className="text-indigo-500">•</span> {item}
                  </li>
                ))}
             </ul>
          </div>
        </div>

        {/* Coluna de Resultado e Gravação */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {hrr !== null ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4 sticky top-4"
              >
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl text-center space-y-4">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Delta HRR</span>
                  <div className="text-7xl font-black tabular-nums tracking-tighter">
                    {hrr}
                    <span className="text-lg text-slate-500 ml-2">bpm</span>
                  </div>
                  
                  {(() => {
                    const info = getInterpretation(hrr);
                    return (
                      <div className={`mt-6 p-4 rounded-2xl border ${info.bgColor} ${info.borderColor} ${info.color}`}>
                        <div className="text-sm font-black uppercase mb-1">{info.label}</div>
                        <p className="text-[10px] leading-relaxed font-medium opacity-80">{info.desc}</p>
                      </div>
                    );
                  })()}

                  <button
                    onClick={handleSave}
                    disabled={isSaved}
                    className={`w-full mt-6 flex items-center justify-center gap-2 p-5 rounded-2xl font-black transition-all ${
                      isSaved 
                        ? 'bg-emerald-500 text-white cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/30 active:scale-95'
                    }`}
                  >
                    {isSaved ? (
                      <><CheckCircle2 className="w-5 h-5" /> GRAVADO</>
                    ) : (
                      <><Save className="w-5 h-5" /> GRAVAR NO RELATÓRIO</>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-slate-50 rounded-[2.5rem] p-12 border-4 border-dashed border-slate-200 text-center space-y-4 sticky top-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Activity className="w-8 h-8 text-slate-300 animate-pulse" />
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Aguardando Dados...</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};