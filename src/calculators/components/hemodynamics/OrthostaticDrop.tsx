import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Info, CheckCircle2, Save, 
  ArrowDown, ArrowUp, AlertTriangle, Zap 
} from 'lucide-react';

import { usePatient } from '../../../context/PatientContext';
import { MedicationAlert } from '../../../components/shared/MedicationAlert';
import { toast } from 'react-hot-toast';

export const OrthostaticDrop: React.FC = () => {
  const { medications, updateTestResults } = usePatient();
  const [supinePAS, setSupinePAS] = useState<string>('');
  const [supinePAD, setSupinePAD] = useState<string>('');
  const [standingPAS, setStandingPAS] = useState<string>('');
  const [standingPAD, setStandingPAD] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const calculateDelta = () => {
    const sPAS = parseInt(supinePAS);
    const sPAD = parseInt(supinePAD);
    const stPAS = parseInt(standingPAS);
    const stPAD = parseInt(standingPAD);

    if (isNaN(sPAS) || isNaN(stPAS)) return null;

    return { 
      deltaPAS: sPAS - stPAS, 
      deltaPAD: isNaN(sPAD) || isNaN(stPAD) ? 0 : sPAD - stPAD 
    };
  };

  const delta = calculateDelta();

  const getInterpretation = (dPAS: number, dPAD: number) => {
    const isHypotension = dPAS >= 20 || dPAD >= 10;
    if (isHypotension) return { 
      label: "HIPOTENSÃO ORTOSTÁTICA", 
      color: "text-rose-500", 
      bgColor: "bg-rose-50",
      border: "border-rose-200",
      icon: <AlertTriangle className="text-rose-500" />,
      desc: "Queda crítica de PAS ≥ 20 mmHg ou PAD ≥ 10 mmHg. Risco elevado de síncope e queda." 
    };
    return { 
      label: "RESPOSTA NORMAL", 
      color: "text-emerald-500", 
      bgColor: "bg-emerald-50",
      border: "border-emerald-200",
      icon: <CheckCircle2 className="text-emerald-500" />,
      desc: "Mecanismos barorreflexos preservados. Variação de pressão dentro dos limites fisiológicos." 
    };
  };

  const handleSave = () => {
    if (delta === null) return;
    const interpretation = getInterpretation(delta.deltaPAS, delta.deltaPAD);
    
    updateTestResults({
      orthostaticDrop: {
        supine: { pas: parseInt(supinePAS), pad: parseInt(supinePAD) },
        standing: { pas: parseInt(standingPAS), pad: parseInt(standingPAD) },
        delta: delta,
        interpretation: interpretation.label
      }
    });

    setIsSaved(true);
    toast.success("Teste de inclinação registrado");
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8 pb-32">
      <header className="px-2 space-y-1">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase flex items-center gap-3">
          <ArrowDown className="text-rose-500" size={32} /> Orthostatic Drop
        </h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Avaliação de Tolerância Ortostática</p>
      </header>

      <div className="px-2">
        <MedicationAlert type="bcc" active={medications.bcc} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          {/* SEÇÃO SUPINO */}
          <section className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <ArrowUp size={24} />
              </div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest italic">Posição Supina (Repouso)</h2>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">PAS <span className="text-slate-300">mmHg</span></label>
                <input
                  ref={inputRef}
                  type="number"
                  inputMode="numeric"
                  value={supinePAS}
                  onChange={(e) => { setSupinePAS(e.target.value); setIsSaved(false); }}
                  placeholder="000"
                  className="w-full p-6 bg-slate-50 border-none rounded-[24px] text-4xl font-black text-slate-800 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">PAD <span className="text-slate-300">mmHg</span></label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={supinePAD}
                  onChange={(e) => { setSupinePAD(e.target.value); setIsSaved(false); }}
                  placeholder="000"
                  className="w-full p-6 bg-slate-50 border-none rounded-[24px] text-4xl font-black text-slate-800 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* SEÇÃO ORTOSTATISMO */}
          <section className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                <ArrowDown size={24} />
              </div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest italic">Ortostatismo (1-3 min)</h2>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">PAS <span className="text-slate-300">mmHg</span></label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={standingPAS}
                  onChange={(e) => { setStandingPAS(e.target.value); setIsSaved(false); }}
                  placeholder="000"
                  className="w-full p-6 bg-slate-50 border-none rounded-[24px] text-4xl font-black text-slate-800 focus:ring-4 focus:ring-rose-100 outline-none transition-all"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">PAD <span className="text-slate-300">mmHg</span></label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={standingPAD}
                  onChange={(e) => { setStandingPAD(e.target.value); setIsSaved(false); }}
                  placeholder="000"
                  className="w-full p-6 bg-slate-50 border-none rounded-[24px] text-4xl font-black text-slate-800 focus:ring-4 focus:ring-rose-100 outline-none transition-all"
                />
              </div>
            </div>
          </section>
        </div>

        {/* COLUNA DE RESULTADO */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {delta !== null ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 sticky top-6"
              >
                <div className="bg-slate-900 rounded-[44px] p-10 shadow-2xl text-center space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Δ PAS</div>
                      <div className={`text-6xl font-black tabular-nums italic ${delta.deltaPAS >= 20 ? 'text-rose-500' : 'text-emerald-400'}`}>
                        {delta.deltaPAS}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Δ PAD</div>
                      <div className={`text-6xl font-black tabular-nums italic ${delta.deltaPAD >= 10 ? 'text-rose-500' : 'text-emerald-400'}`}>
                        {delta.deltaPAD}
                      </div>
                    </div>
                  </div>
                  
                  {(() => {
                    const info = getInterpretation(delta.deltaPAS, delta.deltaPAD);
                    return (
                      <div className={`rounded-[32px] p-6 border ${info.border} ${info.bgColor} text-left`}>
                        <div className="flex items-center gap-2 mb-2 font-black text-xs uppercase italic tracking-tighter">
                          {info.icon}
                          <span className={info.color}>{info.label}</span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-600 leading-relaxed italic">
                          "{info.desc}"
                        </p>
                      </div>
                    );
                  })()}

                  <button
                    onClick={handleSave}
                    disabled={isSaved}
                    className={`w-full flex items-center justify-center gap-3 p-6 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] transition-all ${
                      isSaved 
                        ? 'bg-emerald-500 text-white cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 active:scale-95'
                    }`}
                  >
                    {isSaved ? <><CheckCircle2 size={20} /> RESULTADO GRAVADO</> : <><Save size={20} className="text-emerald-400" /> SALVAR NO RELATÓRIO</>}
                  </button>
                </div>

                {/* PÉROLAS CLÍNICAS */}
                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-4">
                   <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest italic">
                     <Zap size={14} fill="currentColor" /> Protocolo de Medida
                   </div>
                   <ul className="text-[11px] text-slate-500 space-y-3 font-medium italic leading-relaxed">
                     <li className="flex gap-2">
                       <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0" />
                       Meça a PA após 5 minutos em repouso supino.
                     </li>
                     <li className="flex gap-2">
                       <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0" />
                       Repita a medida no 1º e 3º minuto de ortostatismo.
                     </li>
                     <li className="flex gap-2 text-rose-500">
                       <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 shrink-0" />
                       Interrompa o teste se houver pré-síncope ou instabilidade.
                     </li>
                   </ul>
                </div>
              </motion.div>
            ) : (
              <div className="bg-slate-50 rounded-[44px] p-12 border-4 border-dashed border-slate-200 text-center flex flex-col items-center justify-center min-h-[400px]">
                <Activity className="w-16 h-16 text-slate-200 mb-6 animate-pulse" />
                <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] leading-relaxed italic">
                  Aguardando pressões <br /> Supina e em Ortostatismo
                </h3>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};