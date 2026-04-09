import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity as ActivityIcon, CheckCircle2, Thermometer, 
  Droplets, Fingerprint, Layers, Save, AlertTriangle, ChevronRight 
} from 'lucide-react';
import { usePatient } from '../../../context/PatientContext';
import { toast } from 'react-hot-toast';

type System = 'Arterial' | 'Venoso' | 'Linfático';

export const VascularPhysicalExam: React.FC = () => {
  const { patientInfo, updateTestResults } = usePatient(); 
  const [activeSystem, setActiveSystem] = useState<System>('Arterial');
  const [isSaved, setIsSaved] = useState(false);

  // Estados
  const [pulse, setPulse] = useState<number | null>(null);
  const [temp, setTemp] = useState<string>('Normal');
  const [capillaryRefill, setCapillaryRefill] = useState<string>('');
  const [godet, setGodet] = useState<number | null>(null);
  const [stemmer, setStemmer] = useState<boolean | null>(null);

  const PULSE_SCALE = [
    { val: 0, label: "0", desc: "Ausente" },
    { val: 1, label: "1+", desc: "Diminuído" },
    { val: 2, label: "2+", desc: "Normal" },
    { val: 3, label: "3+", desc: "Aumentado" },
  ];

  const handleSave = () => {
    // Lógica de qualificação para a CIF
    const artQual = (pulse !== null && pulse >= 2) ? 0 : 2;
    const venQual = godet !== null ? godet : 0;
    const linQual = stemmer ? 2 : 0;

    updateTestResults({
      vascularAssessment: {
        arterial: { 
          pulse: PULSE_SCALE.find(p => p.val === pulse)?.label || '0', 
          temp, 
          capillaryRefill: capillaryRefill ? `${capillaryRefill}s` : '2s',
          // A estrutura correta que o TS exige: objeto cif com qualifier e interpretation
          cif: {
            qualifier: artQual,
            interpretation: artQual === 0 ? 'Normal' : 'Alterada'
          }
        },
        venous: { 
          godet: godet !== null ? `${godet}+` : '0', 
          cif: {
            qualifier: venQual,
            interpretation: venQual === 0 ? 'Normal' : `Edema ${venQual}+`
          }
        },
        lymphatic: { 
          stemmer: stemmer ? 'Positivo' : 'Negativo', 
          cif: {
            qualifier: linQual,
            interpretation: linQual === 0 ? 'Normal' : 'Sinal de Stemmer Positivo'
          }
        }
      }
    });

    setIsSaved(true);
    toast.success("Exame Vascular Gravado!");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-48 font-sans">
      <header className="px-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Exame Vascular</h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Avaliação Funcional Cardiovascular</p>
      </header>

      {/* Tabs de Seleção */}
      <div className="flex p-1.5 bg-slate-100 rounded-[24px] gap-1">
        {(['Arterial', 'Venoso', 'Linfático'] as System[]).map((sys) => (
          <button
            key={sys}
            onClick={() => { setActiveSystem(sys); setIsSaved(false); }}
            className={`flex-1 py-4 rounded-[18px] text-[10px] font-black transition-all ${
              activeSystem === sys ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'
            }`}
          >
            {sys.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeSystem === 'Arterial' && (
              <motion.div key="art" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 space-y-6">
                  <h3 className="font-black flex items-center gap-2 text-slate-800 uppercase text-xs tracking-widest">
                    <ActivityIcon className="w-5 h-5 text-rose-500" /> Pulsos e Perfusão
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {PULSE_SCALE.map((p) => (
                      <button
                        key={p.val}
                        onClick={() => { setPulse(p.val); setIsSaved(false); }}
                        className={`p-5 rounded-[22px] text-left border-2 transition-all ${
                          pulse === p.val ? 'border-rose-500 bg-rose-50' : 'border-slate-50 bg-slate-50'
                        }`}
                      >
                        <span className="block font-black text-2xl text-slate-900">{p.label}</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase">{p.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeSystem === 'Venoso' && (
              <motion.div key="ven" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 space-y-6">
                <h3 className="font-black flex items-center gap-2 text-slate-800 uppercase text-xs tracking-widest">
                  <Droplets className="w-5 h-5 text-indigo-500" /> Edema (Godet)
                </h3>
                <div className="grid grid-cols-5 gap-3">
                  {[0, 1, 2, 3, 4].map((v) => (
                    <button 
                      key={v} 
                      onClick={() => { setGodet(v); setIsSaved(false); }} 
                      className={`py-6 rounded-2xl font-black text-lg transition-all ${
                        godet === v ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-slate-50 text-slate-400'
                      }`}
                    >
                      {v === 0 ? '0' : `${v}+`}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {activeSystem === 'Linfático' && (
              <motion.div key="lin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 space-y-6">
                <h3 className="font-black flex items-center gap-2 text-slate-800 uppercase text-xs tracking-widest">
                  <Fingerprint className="w-5 h-5 text-emerald-500" /> Sinal de Stemmer
                </h3>
                <div className="flex gap-4">
                  <button 
                    onClick={() => { setStemmer(true); setIsSaved(false); }} 
                    className={`flex-1 py-6 rounded-[24px] font-black border-2 transition-all ${
                      stemmer === true ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-50 text-slate-400'
                    }`}
                  >
                    POSITIVO
                  </button>
                  <button 
                    onClick={() => { setStemmer(false); setIsSaved(false); }} 
                    className={`flex-1 py-6 rounded-[24px] font-black border-2 transition-all ${
                      stemmer === false ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-50 text-slate-400'
                    }`}
                  >
                    NEGATIVO
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Card de Resumo Lateral */}
        <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl space-y-8 self-start sticky top-6 overflow-hidden">
          <div className="relative z-10 space-y-6">
            <h3 className="text-indigo-400 font-black italic text-lg flex items-center gap-2">
              <Layers className="w-5 h-5" /> CIF VASCULAR
            </h3>
            <div className="space-y-4 border-t border-white/10 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase font-black">Arterial</span>
                <span className={`text-xs font-bold ${pulse === null ? 'text-slate-600' : (pulse >= 2 ? 'text-emerald-400' : 'text-rose-400')}`}>
                  {pulse !== null ? PULSE_SCALE.find(p => p.val === pulse)?.label : '---'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase font-black">Venoso</span>
                <span className={`text-xs font-bold ${godet === null ? 'text-slate-600' : (godet > 0 ? 'text-rose-400' : 'text-emerald-400')}`}>
                  {godet !== null ? `${godet}+` : '---'}
                </span>
              </div>
            </div>
          </div>
          <ActivityIcon size={160} className="absolute -bottom-16 -right-16 text-white/[0.03] rotate-12" />
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-50 space-y-3">
        <button
          onClick={handleSave}
          className={`w-full py-5 rounded-[24px] font-black shadow-2xl flex items-center justify-center gap-3 transition-all ${
            isSaved ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:scale-[1.02]'
          }`}
        >
          {isSaved ? <CheckCircle2 size={20} /> : <Save size={20} className="text-emerald-400" />}
          {isSaved ? 'GRAVADO COM SUCESSO' : 'SALVAR EXAME VASCULAR'}
        </button>
      </div>
    </div>
  );
};