import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, Activity, ShieldAlert, HeartPulse } from 'lucide-react';

export const AnginaScreening: React.FC = () => {
  const [effort, setEffort] = useState<boolean | null>(null);
  const [rest, setRest] = useState<boolean | null>(null);
  const [type, setType] = useState<'Aperto' | 'Pontada' | null>(null);

  // Critério: Dor que aumenta no esforço, melhora no repouso e tem caráter opressivo (aperto)
  const isTypicalAngina = effort === true && rest === true && type === 'Aperto';
  const isAtypical = (effort === true || rest === true) && type === 'Aperto';
  const isComplete = effort !== null && rest !== null && type !== null;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic flex items-center gap-3">
            <HeartPulse className="text-rose-500" /> TRIAGEM DE DOR
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Diferenciação Rápida: Isquêmica vs. Não-Isquêmica</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 space-y-10">
            
            {/* Questão 1 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-black">1</div>
                <label className="text-sm font-black text-slate-700 uppercase tracking-tight">A dor aumenta com o esforço físico?</label>
              </div>
              <div className="flex gap-3">
                {[true, false].map((val) => (
                  <button
                    key={val ? 'yes' : 'no'}
                    onClick={() => setEffort(val)}
                    className={`flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 ${
                      effort === val 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' 
                        : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-200'
                    }`}
                  >
                    {val ? 'Sim' : 'Não'}
                  </button>
                ))}
              </div>
            </div>

            {/* Questão 2 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-black">2</div>
                <label className="text-sm font-black text-slate-700 uppercase tracking-tight">A dor melhora com o repouso ou nitrato?</label>
              </div>
              <div className="flex gap-3">
                {[true, false].map((val) => (
                  <button
                    key={val ? 'yes' : 'no'}
                    onClick={() => setRest(val)}
                    className={`flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 ${
                      rest === val 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' 
                        : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-200'
                    }`}
                  >
                    {val ? 'Sim' : 'Não'}
                  </button>
                ))}
              </div>
            </div>

            {/* Questão 3 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-black">3</div>
                <label className="text-sm font-black text-slate-700 uppercase tracking-tight">Qual o caráter/tipo da dor?</label>
              </div>
              <div className="flex gap-3">
                {(['Aperto', 'Pontada'] as const).map((val) => (
                  <button
                    key={val}
                    onClick={() => setType(val)}
                    className={`flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 ${
                      type === val 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' 
                        : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {isComplete ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {isTypicalAngina ? (
                  <div className="bg-rose-50 border-2 border-rose-100 rounded-[40px] p-8 text-center space-y-6 shadow-xl shadow-rose-100/50">
                    <div className="w-20 h-20 bg-rose-500 rounded-[30px] flex items-center justify-center mx-auto shadow-lg shadow-rose-200 rotate-3">
                      <ShieldAlert className="w-10 h-10 text-white" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-rose-900 font-black text-2xl tracking-tighter italic uppercase leading-tight">Alta Probabilidade Isquêmica</div>
                      <p className="text-rose-600 text-[10px] font-black uppercase tracking-widest">Compatível com Angina Típica</p>
                    </div>
                    <div className="bg-white/60 p-5 rounded-3xl text-[11px] text-rose-800 text-left leading-relaxed font-bold border border-rose-200/50">
                      <strong className="block mb-1 text-rose-900 uppercase">Conduta Sugerida:</strong>
                      Encaminhamento para ECG/Avaliação Médica. Contraindicado teste de esforço sem liberação.
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border-2 border-emerald-100 rounded-[40px] p-8 text-center space-y-6 shadow-xl shadow-emerald-100/50">
                    <div className="w-20 h-20 bg-emerald-500 rounded-[30px] flex items-center justify-center mx-auto shadow-lg shadow-emerald-200 -rotate-3">
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-emerald-900 font-black text-2xl tracking-tighter italic uppercase leading-tight">Baixa Probabilidade</div>
                      <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest">Provável Dor Não-Isquêmica</p>
                    </div>
                    <div className="bg-white/60 p-5 rounded-3xl text-[11px] text-emerald-800 text-left leading-relaxed font-bold border border-emerald-200/50">
                      <strong className="block mb-1 text-emerald-900 uppercase">Nota Clínica:</strong>
                      Características sugerem origem musculoesquelética ou funcional. Monitorar se houver mudança de padrão.
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="bg-slate-50 rounded-[40px] p-10 border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center min-h-[300px]">
                <Activity className="w-12 h-12 text-slate-300 mb-4 animate-pulse" />
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest leading-relaxed">
                  Aguardando respostas<br/>para processar triagem
                </p>
              </div>
            )}
          </AnimatePresence>

          <div className="bg-slate-900 rounded-[32px] p-6 shadow-xl space-y-5 relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-[0.2em]">
                <Info size={14} /> Guia Diferencial
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-white uppercase tracking-tight">Angina Típica</p>
                    <p className="text-[9px] text-slate-400 leading-snug">Opressão retroesternal que irradia para MSE/Mandíbula, desencadeada por esforço.</p>
                </div>
                <div className="h-px bg-white/5 w-full" />
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-white uppercase tracking-tight">Musculoesquelética</p>
                    <p className="text-[9px] text-slate-400 leading-snug">Pontada localizada, piora com palpação local ou movimentos específicos de tronco.</p>
                </div>
              </div>
            </div>
            <Activity className="absolute -bottom-6 -right-6 text-white/[0.03]" size={100} />
          </div>
        </div>
      </div>
    </div>
  );
};