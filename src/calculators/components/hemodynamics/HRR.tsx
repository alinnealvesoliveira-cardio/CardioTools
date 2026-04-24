import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Info, CheckCircle2, Save, 
  Heart, ArrowDownCircle, InfoIcon, Zap
} from 'lucide-react';

import { usePatient } from '../../../context/PatientProvider';
import { useAuth } from '../../../context/AuthContext';
import { logActivity } from '../../../lib/supabase';
import { MedicationAlert } from '../../../components/shared/MedicationAlert';
import { toast } from 'react-hot-toast';

export const HRR: React.FC = () => {
  const { medications, updateTestResults } = usePatient();
  const { user } = useAuth();
  
  const [peakHR, setPeakHR] = useState<string>('');
  const [recoveryHR, setRecoveryHR] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Foco automático para agilizar a entrada de dados
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const calculateHRR = () => {
    const peak = parseInt(peakHR);
    const recovery = parseInt(recoveryHR);
    if (!peak || !recovery) return null;
    return peak - recovery;
  };

  const hrr = calculateHRR();

  const getInterpretation = (val: number) => {
    if (val < 12) return { 
      label: "RECUPERAÇÃO ANORMAL", 
      color: "text-rose-400", 
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/20",
      desc: "Delta < 12 bpm sugere disfunção autonômica e maior risco cardiovascular (reativação vagal lenta)." 
    };
    return { 
      label: "RECUPERAÇÃO NORMAL", 
      color: "text-emerald-400", 
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      desc: "Delta ≥ 12 bpm indica boa modulação parassimpática e proteção cardiovascular." 
    };
  };

  const handleSave = async () => {
    if (hrr === null) return;
    const interpretation = getInterpretation(hrr);
    
    // Sincroniza com o Contexto do Paciente
    updateTestResults('autonomic', {
      hrr: {
        peakHR: parseInt(peakHR),
        recoveryHR: parseInt(recoveryHR),
        delta: hrr,
        interpretation: interpretation.label
      }
    });

    // Log de atividade no Supabase
    if (user) await logActivity(user.id, 'Calculou Recuperação de FC (HRR)');
    
    setIsSaved(true);
    toast.success("HRR registrado com sucesso!");
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8 pb-32">
      <header className="px-2 space-y-1">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase flex items-center gap-3">
          <Activity className="text-rose-500" size={32} /> Recuperação de FC
        </h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Análise de Reativação Vagal (1 min pós-esforço)</p>
      </header>

      {/* Alerta de Medicação: Vital para HRR pois Beta-bloq achata a curva */}
      <div className="px-2">
        <MedicationAlert type="betablockers" active={medications.betablockers} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          {/* INPUTS DE FREQUÊNCIA */}
          <section className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
              <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl">
                <Heart size={24} />
              </div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest italic">Dados do Monitoramento</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex justify-between">
                  FC Pico (BPM)
                  <span className="text-rose-500">Máxima</span>
                </label>
                <input
                  ref={inputRef}
                  type="number"
                  inputMode="numeric"
                  value={peakHR}
                  onChange={(e) => { setPeakHR(e.target.value); setIsSaved(false); }}
                  placeholder="000"
                  className="w-full p-6 bg-slate-50 border-none rounded-[24px] text-5xl font-black text-slate-800 focus:ring-4 focus:ring-rose-100 outline-none transition-all placeholder:text-slate-200"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex justify-between">
                  FC 1 MIN (BPM)
                  <span className="text-indigo-500">Recuperação</span>
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={recoveryHR}
                  onChange={(e) => { setRecoveryHR(e.target.value); setIsSaved(false); }}
                  placeholder="000"
                  className="w-full p-6 bg-slate-50 border-none rounded-[24px] text-5xl font-black text-slate-800 focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-200"
                />
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 flex gap-3 items-center border border-slate-100">
              <InfoIcon className="w-5 h-5 text-indigo-400 shrink-0" />
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium italic">
                O <strong>Delta HRR</strong> é a queda da FC 60s após o esforço. Valores abaixo de 12 bpm estão associados a maior mortalidade independente da medicação.
              </p>
            </div>
          </section>

          {/* PÉROLAS CLÍNICAS */}
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
             <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
               <Zap className="w-4 h-4 text-amber-500" fill="currentColor" /> Consenso de Reabilitação
             </h4>
             <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  "Reflete a eficácia da reativação parassimpática.",
                  "Ponto de corte padrão: 12 bpm (Cole et al).",
                  "Válido mesmo para testes de caminhada (TC6M).",
                  "Indica 'fuga vagal' quando o valor é muito baixo."
                ].map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-600 flex gap-3 font-medium italic">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
             </ul>
          </div>
        </div>

        {/* PAINEL DE RESULTADO (DIREITA) */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {hrr !== null ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6 sticky top-6"
              >
                <div className="bg-slate-900 rounded-[44px] p-10 text-white shadow-2xl text-center space-y-4">
                  <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">DELTA DE RECUPERAÇÃO</div>
                  <div className="text-8xl font-black tabular-nums tracking-tighter italic">
                    {hrr}
                    <span className="text-2xl text-slate-500 ml-2 not-italic">BPM</span>
                  </div>
                  
                  {(() => {
                    const info = getInterpretation(hrr);
                    return (
                      <div className={`mt-8 p-6 rounded-[28px] border ${info.borderColor} ${info.bgColor} ${info.color}`}>
                        <div className="text-sm font-black uppercase tracking-widest mb-2 italic">{info.label}</div>
                        <p className="text-[11px] leading-relaxed font-medium opacity-90 italic">{info.desc}</p>
                      </div>
                    );
                  })()}

                  <button
                    onClick={handleSave}
                    disabled={isSaved}
                    className={`w-full mt-8 flex items-center justify-center gap-3 p-6 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl ${
                      isSaved 
                        ? 'bg-emerald-500 text-white cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95'
                    }`}
                  >
                    {isSaved ? (
                      <><CheckCircle2 size={20} /> DADO GRAVADO</>
                    ) : (
                      <><Save size={20} className="text-emerald-400" /> SALVAR NO RELATÓRIO</>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-slate-50 rounded-[44px] p-12 border-4 border-dashed border-slate-200 text-center flex flex-col items-center justify-center min-h-[450px]">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                  <Activity className="w-10 h-10 text-slate-200 animate-pulse" />
                </div>
                <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] leading-relaxed">
                  Aguardando FC Pico <br /> e FC de Recuperação
                </h3>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};