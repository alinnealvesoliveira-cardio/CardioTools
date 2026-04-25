import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Info, CheckCircle2, HelpCircle, Save, ChevronLeft, Gauge } from 'lucide-react';
import { VascularDiagnosticHelp } from '../../../components/shared/VascularDiagnosticHelp';
import { usePatient } from '../../../context/PatientProvider';
import { useAuth } from '../../../context/AuthContext';
import { logActivity } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';

export const ABI: React.FC = () => {
  const { updateTestResults } = usePatient();
  const { user } = useAuth();
  const [ankleBP, setAnkleBP] = useState<string>('');
  const [armBP, setArmBP] = useState<string>('');
  const [showHelp, setShowHelp] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-foco ao montar o componente para agilizar a triagem
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const calculateABI = () => {
    const ankle = parseFloat(ankleBP);
    const arm = parseFloat(armBP);
    if (isNaN(ankle) || isNaN(arm) || arm === 0) return null;
    return ankle / arm;
  };

  const abi = calculateABI();

  const getInterpretation = (val: number) => {
    if (val > 1.30) return { 
      label: "Artérias Incompressíveis", 
      color: "bg-amber-500", 
      border: "border-amber-200",
      light: "bg-amber-50",
      desc: "Calcificação da camada média (comum em diabéticos ou renais crônicos)." 
    };
    if (val >= 0.91) return { 
      label: "Normal", 
      color: "bg-emerald-500", 
      border: "border-emerald-200",
      light: "bg-emerald-50",
      desc: "Fluxo arterial periférico dentro da normalidade." 
    };
    if (val >= 0.71) return { 
      label: "DAP Leve", 
      color: "bg-yellow-400", 
      border: "border-yellow-200",
      light: "bg-yellow-50",
      desc: "Doença Arterial Periférica leve. Iniciar monitoramento." 
    };
    if (val >= 0.41) return { 
      label: "DAP Moderada", 
      color: "bg-orange-500", 
      border: "border-orange-200",
      light: "bg-orange-50",
      desc: "DAP moderada. Claudicação intermitente provável." 
    };
    return { 
      label: "DAP Grave", 
      color: "bg-red-600", 
      border: "border-red-200",
      light: "bg-red-50",
      desc: "DAP grave. Risco iminente de isquemia crítica." 
    };
  };

  const handleSave = async () => {
    if (abi === null) return;
    const interpretation = getInterpretation(abi);
    
    updateTestResults('vascular', {
      abi: abi,
      abiAnkleBP: parseFloat(ankleBP),
      abiArmBP: parseFloat(armBP)
    });

    if (user) {
      await logActivity(user.id, 'Finalizou Teste ITB/ABI');
    }
    
    setIsSaved(true);
    toast.success("ITB registrado no histórico do paciente");
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
            <Gauge className="text-indigo-600" /> Índice ITB / ABI
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Screening de Doença Arterial Periférica</p>
        </div>
        
        <button
          onClick={() => setShowHelp(true)}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
        >
          <HelpCircle size={14} className="text-indigo-500" />
          Protocolo de Medida
        </button>
      </header>

      <VascularDiagnosticHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ENTRADA DE DADOS */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Activity size={24} />
              </div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest text-center">Pressões Sistólicas</h2>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                  PAS Tornozelo (mmHg)
                  <span className="text-indigo-500 italic">Numerador</span>
                </label>
                <input
                  ref={inputRef}
                  type="number"
                  inputMode="decimal"
                  value={ankleBP}
                  onChange={(e) => { setAnkleBP(e.target.value); setIsSaved(false); }}
                  placeholder="000"
                  className="w-full p-6 bg-slate-50 border-none rounded-[24px] text-4xl font-black text-slate-800 focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-200"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                  PAS Braço (mmHg)
                  <span className="text-indigo-500 italic">Denominador</span>
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={armBP}
                  onChange={(e) => { setArmBP(e.target.value); setIsSaved(false); }}
                  placeholder="000"
                  className="w-full p-6 bg-slate-50 border-none rounded-[24px] text-4xl font-black text-slate-800 focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-200"
                />
              </div>
            </div>
          </section>

          <div className="bg-indigo-900 rounded-[32px] p-8 text-white space-y-4 relative overflow-hidden">
             <div className="relative z-10">
                <div className="flex items-center gap-2 text-indigo-300 font-black text-[10px] uppercase tracking-widest mb-2">
                  <Info size={14} /> Dica Clínica
                </div>
                <p className="text-xs leading-relaxed font-medium text-indigo-100">
                  Sempre utilize a <strong>maior</strong> PAS braquial (entre os dois braços) e a <strong>maior</strong> PAS do tornozelo (Pediosa ou Tibial Posterior).
                </p>
             </div>
             <Activity className="absolute -right-4 -bottom-4 text-white/5 w-32 h-32" />
          </div>
        </div>

        {/* RESULTADO E INTERPRETAÇÃO */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {abi !== null ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6 sticky top-6"
              >
                <div className="bg-white rounded-[44px] p-10 shadow-xl border border-slate-100 text-center space-y-4">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">VALOR DO ITB</div>
                  <div className="text-8xl font-black text-slate-900 tracking-tighter tabular-nums italic">
                    {abi.toFixed(2)}
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-1 bg-slate-100 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    P. Tornozelo ÷ P. Braço
                  </div>
                </div>

                {(() => {
                  const interpretation = getInterpretation(abi);
                  return (
                    <div className={`rounded-[32px] p-8 border shadow-lg transition-colors ${interpretation.light} ${interpretation.border}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-3 h-3 rounded-full ${interpretation.color} animate-pulse`} />
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Interpretação Clínica</div>
                      </div>
                      <div className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">
                        {interpretation.label}
                      </div>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                        "{interpretation.desc}"
                      </p>
                    </div>
                  );
                })()}

                <button
                  onClick={handleSave}
                  disabled={isSaved}
                  className={`w-full flex items-center justify-center gap-3 p-6 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl ${
                    isSaved 
                      ? 'bg-emerald-500 text-white cursor-not-allowed'
                      : 'bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-1'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <CheckCircle2 size={20} />
                      RESULTADO GRAVADO
                    </>
                  ) : (
                    <>
                      <Save size={20} className="text-emerald-400" />
                      SALVAR NO RELATÓRIO
                    </>
                  )}
                </button>
              </motion.div>
            ) : (
              <div className="bg-slate-50 rounded-[44px] p-12 border-4 border-dashed border-slate-200 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <Activity className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-slate-400 font-black text-xs uppercase tracking-widest leading-relaxed">
                  Aguardando dados <br /> para cálculo do índice
                </h3>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};