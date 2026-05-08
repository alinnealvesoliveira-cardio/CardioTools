import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity as ActivityIcon, CheckCircle2, Thermometer, 
  Droplets, Fingerprint, Layers, Save, AlertTriangle, Zap,
  ArrowLeft, ChevronRight, LayoutDashboard 
} from 'lucide-react';
import { usePatient } from '../../../context/PatientProvider';
import { useNavigate } from 'react-router-dom'; // Importado
import { toast } from 'react-hot-toast';

type System = 'Arterial' | 'Venoso' | 'Linfático';

export const VascularPhysicalExam: React.FC = () => {
  const { updateTestResults } = usePatient(); 
  const navigate = useNavigate(); // Hook de navegação
  const [activeSystem, setActiveSystem] = useState<System>('Arterial');
  const [isSaved, setIsSaved] = useState(false);

  // Estados dos Achados
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
    const artQual = (pulse !== null && pulse >= 2) ? 0 : (pulse === 1 ? 1 : 3);
    const venQual = godet !== null ? (godet > 2 ? 3 : godet) : 0;
    const linQual = stemmer ? 2 : 0;

    updateTestResults('vascular',  {
      vascularAssessment: {
        arterial: { 
          pulse: PULSE_SCALE.find(p => p.val === pulse)?.label || '0', 
          temp, 
          capillaryRefill: capillaryRefill ? `${capillaryRefill}s` : '2s',
          cif: {
            qualifier: artQual,
            interpretation: artQual === 0 ? 'Normal' : 'Disfunção de Perfusão Arterial'
          }
        },
        venese: { 
          godet: godet !== null ? `${godet}+` : '0', 
          cif: {
            qualifier: venQual,
            interpretation: venQual === 0 ? 'Normal' : `Edema Periférico (Godet ${venQual}+)`
          }
        },
        lymphatic: { 
          stemmer: stemmer ? 'Positivo' : 'Negativo', 
          cif: {
            qualifier: linQual,
            interpretation: linQual === 0 ? 'Normal' : 'Linfedema (Stemmer +)'
          }
        }
      }
    });

    setIsSaved(true);
    toast.success("Achados Vasculares Gravados!");
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8 pb-48">
      <header className="px-2 space-y-1">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase flex items-center gap-3">
          <Layers className="text-indigo-500" size={32} /> Status Vascular
        </h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Exame Físico Periférico e Qualificadores CIF</p>
      </header>

      <nav className="flex p-1.5 bg-slate-100 rounded-[28px] gap-2 border border-slate-200/50 shadow-inner">
        {(['Arterial', 'Venoso', 'Linfático'] as System[]).map((sys) => (
          <button
            key={sys}
            onClick={() => { setActiveSystem(sys); setIsSaved(false); }}
            className={`flex-1 py-4 rounded-[22px] text-[10px] font-black transition-all uppercase tracking-widest ${
              activeSystem === sys 
                ? 'bg-white text-slate-900 shadow-xl scale-[1.02] ring-1 ring-slate-200' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {sys}
          </button>
        ))}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <main className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {activeSystem === 'Arterial' && (
              <motion.div 
                key="art" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 space-y-8">
                  <header className="flex justify-between items-center border-b border-slate-50 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl"><ActivityIcon size={24} /></div>
                      <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em]">Palpação de Pulsos</h3>
                    </div>
                  </header>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {PULSE_SCALE.map((p) => (
                      <button
                        key={p.val}
                        onClick={() => { setPulse(p.val); setIsSaved(false); }}
                        className={`group p-6 rounded-[32px] text-center border-2 transition-all flex flex-col items-center gap-2 ${
                          pulse === p.val 
                            ? 'border-rose-500 bg-rose-50 text-rose-900 shadow-lg' 
                            : 'border-slate-50 bg-slate-50 text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        <span className={`text-4xl font-black italic ${pulse === p.val ? 'text-rose-600' : 'text-slate-200'}`}>{p.label}</span>
                        <span className="text-[10px] font-black uppercase tracking-tighter">{p.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeSystem === 'Venoso' && (
              <motion.div 
                key="ven" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 space-y-8"
              >
                <header className="flex items-center gap-3 border-b border-slate-50 pb-6">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Droplets size={24} /></div>
                  <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em]">Graduação de Edema (Godet)</h3>
                </header>
                
                <div className="grid grid-cols-5 gap-4">
                  {[0, 1, 2, 3, 4].map((v) => (
                    <button 
                      key={v} 
                      onClick={() => { setGodet(v); setIsSaved(false); }} 
                      className={`h-24 rounded-[28px] font-black text-2xl transition-all relative overflow-hidden group ${
                        godet === v 
                          ? 'bg-indigo-600 text-white shadow-2xl scale-105' 
                          : 'bg-slate-50 text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {v === 0 ? '0' : `${v}+`}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {activeSystem === 'Linfático' && (
              <motion.div 
                key="lin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 space-y-8"
              >
                <header className="flex items-center gap-3 border-b border-slate-50 pb-6">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Fingerprint size={24} /></div>
                  <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em]">Sinal de Stemmer</h3>
                </header>
                
                <div className="flex gap-6">
                  {[
                    { val: true, label: 'Positivo', color: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
                    { val: false, label: 'Negativo', color: 'border-slate-900 bg-slate-900 text-white' }
                  ].map((btn) => (
                    <button 
                      key={String(btn.val)}
                      onClick={() => { setStemmer(btn.val); setIsSaved(false); }} 
                      className={`flex-1 p-8 rounded-[32px] font-black border-4 transition-all ${
                        stemmer === btn.val ? btn.color : 'border-slate-50 bg-slate-50 text-slate-300'
                      }`}
                    >
                      <div className="text-xl uppercase tracking-widest italic">{btn.label}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-[44px] p-8 text-white shadow-2xl relative overflow-hidden">
            <Zap className="absolute -right-8 -top-8 w-32 h-32 text-indigo-500/10 rotate-12" />
            <div className="relative z-10 space-y-6">
              <header className="flex items-center gap-2">
                <div className="w-2 h-8 bg-indigo-500 rounded-full" />
                <h3 className="text-indigo-400 font-black italic uppercase tracking-widest text-sm">Resumo</h3>
              </header>

              <div className="space-y-4">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] uppercase text-slate-500">Arterial</span>
                  <span className="font-black italic text-emerald-400">{pulse !== null ? `${pulse}+` : '---'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] uppercase text-slate-500">Venoso</span>
                  <span className="font-black italic text-rose-400">{godet !== null ? `${godet}+` : '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] uppercase text-slate-500">Linfático</span>
                  <span className="font-black italic text-slate-300">{stemmer === null ? '---' : (stemmer ? 'POS' : 'NEG')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-900 rounded-[32px] p-6 text-amber-100 flex gap-4 border-none shadow-lg">
            <AlertTriangle className="shrink-0 text-amber-400" size={20} />
            <p className="text-[11px] leading-relaxed italic font-medium">
              Achados assimétricos exigem reavaliação da carga de treino.
            </p>
          </div>
        </aside>
      </div>

      {/* BARRA DE AÇÕES FIXA - PADRÃO UNIFICADO */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-[999] flex flex-col gap-3">
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-white/90 backdrop-blur-md text-slate-500 py-5 rounded-[24px] font-black border border-slate-200 shadow-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <ArrowLeft size={16} /> Voltar
          </button>

          <button
            onClick={() => {
              handleSave();
              // Navega para o próximo teste (Ex: VFC ou HRV)
              navigate('/testes/hrv'); 
            }}
            className="flex-[2] bg-slate-900 text-white py-5 rounded-[24px] font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <div className="flex flex-col items-start text-left">
              <span className="text-[11px] uppercase tracking-widest">
                {isSaved ? 'Gravado' : 'Gravar e Avançar'}
              </span>
              <span className="text-[8px] text-slate-400 font-medium lowercase">variabilidade fc</span>
            </div>
            <ChevronRight size={18} className="text-emerald-400" />
          </button>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-2 text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em] hover:text-indigo-500 transition-colors"
        >
          <LayoutDashboard size={12} className="inline mr-1 mb-1" /> Painel Geral
        </button>
      </div>
    </div>
  );
};