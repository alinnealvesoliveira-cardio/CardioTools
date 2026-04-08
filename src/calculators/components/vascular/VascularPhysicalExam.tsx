import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Info, AlertCircle, CheckCircle2, Thermometer, Droplets, Fingerprint, Layers, HelpCircle, Save, Clock } from 'lucide-react';
import { usePatient } from '../../../context/PatientContext';
import { MedicationAlert } from '../../../components/shared/MedicationAlert';
import { VascularDiagnosticHelp } from '../../../components/shared/VascularDiagnosticHelp';

type System = 'Arterial' | 'Venoso' | 'Linfático';

export const VascularPhysicalExam: React.FC = () => {
  const { medications, updateTestResult } = usePatient();
  const [activeSystem, setActiveSystem] = useState<System>('Arterial');
  const [showHelp, setShowHelp] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Arterial State
  const [pulse, setPulse] = useState<number | null>(null);
  const [temp, setTemp] = useState<string>('Normal');
  const [capillaryRefill, setCapillaryRefill] = useState<string>('');

  // Venous State
  const [ceap, setCeap] = useState<string[]>(['C0']);
  const [godet, setGodet] = useState<number | null>(null);

  // Lymphatic State
  const [stemmer, setStemmer] = useState<boolean | null>(null);

  // Reseta o estado de salvo ao mudar qualquer valor
  React.useEffect(() => {
    setIsSaved(false);
  }, [pulse, temp, capillaryRefill, ceap, godet, stemmer]);

  const PULSE_SCALE = [
    { val: 0, label: "0", desc: "Ausente" },
    { val: 1, label: "1+", desc: "Diminuído" },
    { val: 2, label: "2+", desc: "Normal" },
    { val: 3, label: "3+", desc: "Aumentado" },
  ];

  const GODET_SCALE = [
    { val: 1, label: "1+", depth: "2mm", desc: "Leve" },
    { val: 2, label: "2+", depth: "4mm", desc: "Moderado" },
    { val: 3, label: "3+", depth: "6mm", desc: "Profundo" },
    { val: 4, label: "4+", depth: "8mm", desc: "Muito profundo" },
  ];

  const CEAP_OPTIONS = [
    { id: 'C0', label: 'C0', desc: 'Sem sinais' },
    { id: 'C1', label: 'C1', desc: 'Telangiectasias' },
    { id: 'C2', label: 'C2', desc: 'Varizes' },
    { id: 'C3', label: 'C3', desc: 'Edema' },
    { id: 'C4', label: 'C4', desc: 'Tróficas' },
    { id: 'C5', label: 'C5', desc: 'Úlcera Cicatrizada' },
    { id: 'C6', label: 'C6', desc: 'Úlcera Ativa' },
  ];

  const getArterialCIF = () => {
    if (pulse === null) return null;
    const refill = parseFloat(capillaryRefill);
    if (pulse >= 2 && temp === 'Normal' && (refill <= 3 || isNaN(refill))) return { severity: "Normal" };
    if (pulse === 1) return { severity: "Leve" };
    if (pulse === 0) return { severity: "Grave" };
    return { severity: "Leve" };
  };

  const getVenousCIF = () => {
    const maxCeapLevel = Math.max(...ceap.map(c => parseInt(c.replace('C', '')) || 0));
    if (maxCeapLevel === 0 && !godet) return { severity: "Normal" };
    if (maxCeapLevel <= 2 && (godet || 0) <= 1) return { severity: "Leve" };
    if (maxCeapLevel <= 4) return { severity: "Moderada" };
    return { severity: "Grave" };
  };

  const getLymphaticCIF = () => {
    if (stemmer === null) return null;
    return stemmer ? { severity: "Moderada" } : { severity: "Normal" };
  };

  const handleSave = () => {
    updateTestResult('vascularPhysicalExam', {
      arterial: { 
        pulse: PULSE_SCALE.find(p => p.val === pulse)?.label || 'Não avaliado', 
        temp, 
        capillaryRefill: capillaryRefill ? `${capillaryRefill}s` : 'Não avaliado', 
        cif: getArterialCIF()?.severity || 'Não avaliado' 
      },
      venous: { 
        ceap, 
        godet: godet ? `${godet}+` : 'Ausente', 
        cif: getVenousCIF()?.severity || 'Não avaliado' 
      },
      lymphatic: { 
        stemmer: stemmer === null ? 'Não avaliado' : (stemmer ? 'Positivo' : 'Negativo'), 
        cif: getLymphaticCIF()?.severity || 'Não avaliado' 
      }
    });
    setIsSaved(true);
  };

  const toggleCEAP = (id: string) => {
    if (id === 'C0') {
      setCeap(['C0']);
    } else {
      const filtered = ceap.filter(item => item !== 'C0');
      if (filtered.includes(id)) {
        const next = filtered.filter(item => item !== id);
        setCeap(next.length === 0 ? ['C0'] : next);
      } else {
        setCeap([...filtered, id].sort());
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-24">
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Exame Físico Vascular</h1>
          <p className="text-slate-500 text-sm">Avaliação sistemática arterial, venosa e linfática.</p>
        </div>
        <button
          onClick={() => setShowHelp(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          Ajuda Diagnóstica
        </button>
      </header>

      <MedicationAlert type="bcc" active={medications.bcc} />
      <VascularDiagnosticHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />

      <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
        {(['Arterial', 'Venoso', 'Linfático'] as System[]).map((sys) => (
          <button
            key={sys}
            onClick={() => setActiveSystem(sys)}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              activeSystem === sys ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {sys}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeSystem === 'Arterial' && (
              <motion.div key="art" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                  <h2 className="flex items-center gap-2 text-slate-800 font-bold"><Activity className="w-5 h-5 text-rose-500" /> Pulsos</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {PULSE_SCALE.map((p) => (
                      <button key={p.val} onClick={() => setPulse(p.val)} className={`p-4 rounded-2xl text-left border-2 transition-all ${pulse === p.val ? 'border-rose-500 bg-rose-50' : 'border-transparent bg-slate-50'}`}>
                        <span className="block font-black text-lg">{p.label}</span>
                        <span className="text-xs text-slate-500">{p.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                  <h2 className="flex items-center gap-2 text-slate-800 font-bold"><Clock className="w-5 h-5 text-blue-500" /> Enchimento Capilar</h2>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={capillaryRefill} 
                      onChange={(e) => setCapillaryRefill(e.target.value)}
                      placeholder="Ex: 2"
                      className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">segundos</span>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                  <h2 className="flex items-center gap-2 text-slate-800 font-bold"><Thermometer className="w-5 h-5 text-orange-500" /> Temperatura</h2>
                  <div className="flex gap-2">
                    {['Normal', 'Fria (Isquemia)', 'Quente'].map((t) => (
                      <button key={t} onClick={() => setTemp(t)} className={`flex-1 p-3 rounded-xl border-2 text-xs font-bold ${temp === t ? 'border-orange-500 bg-orange-50' : 'border-transparent bg-slate-50'}`}>{t}</button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeSystem === 'Venoso' && (
              <motion.div key="ven" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                  <h2 className="flex items-center gap-2 text-slate-800 font-bold"><Layers className="w-5 h-5 text-indigo-500" /> CEAP (Múltipla Escolha)</h2>
                  <div className="grid grid-cols-1 gap-2">
                    {CEAP_OPTIONS.map((c) => {
                      const isSelected = ceap.includes(c.id);
                      return (
                        <button key={c.id} onClick={() => toggleCEAP(c.id)} className={`p-4 rounded-2xl text-left border-2 transition-all flex items-center gap-3 ${isSelected ? 'border-indigo-600 bg-indigo-50' : 'border-transparent bg-slate-50'}`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${isSelected ? 'bg-indigo-600 text-white' : 'bg-white'}`}>{c.label}</div>
                          <span className="text-sm font-medium">{c.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                  <h2 className="flex items-center gap-2 text-slate-800 font-bold"><Fingerprint className="w-5 h-5 text-indigo-400" /> Edema (Godet)</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {GODET_SCALE.map((g) => (
                      <button key={g.val} onClick={() => setGodet(g.val)} className={`p-4 rounded-2xl text-left border-2 transition-all ${godet === g.val ? 'border-indigo-400 bg-indigo-50' : 'border-transparent bg-slate-50'}`}>
                        <span className="block font-black">{g.label}</span>
                        <span className="text-[10px] text-slate-500">{g.desc} ({g.depth})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeSystem === 'Linfático' && (
              <motion.div key="lin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-3xl p-8 border border-slate-100 space-y-6 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-amber-50 rounded-full text-amber-600"><Droplets className="w-12 h-12" /></div>
                  <h2 className="text-xl font-bold">Sinal de Stemmer</h2>
                  <p className="text-sm text-slate-500">Incapacidade de pinçar a pele na base do 2º dedo.</p>
                  <div className="flex gap-4 w-full">
                    <button onClick={() => setStemmer(true)} className={`flex-1 p-4 rounded-2xl border-2 font-bold ${stemmer === true ? 'border-amber-500 bg-amber-50 text-amber-700' : 'bg-slate-50 border-transparent'}`}>Positivo</button>
                    <button onClick={() => setStemmer(false)} className={`flex-1 p-4 rounded-2xl border-2 font-bold ${stemmer === false ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'bg-slate-50 border-transparent'}`}>Negativo</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-6 sticky top-8">
            <h3 className="font-bold text-indigo-400 flex items-center gap-2 italic">CIF / OMS</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                <span className="opacity-60">Arterial:</span>
                <span className="font-bold text-rose-400">{getArterialCIF()?.severity || '---'}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                <span className="opacity-60">Venoso:</span>
                <span className="font-bold text-indigo-400">{getVenousCIF()?.severity || '---'}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                <span className="opacity-60">Linfático:</span>
                <span className="font-bold text-amber-400">{getLymphaticCIF()?.severity || '---'}</span>
              </div>
            </div>

            <button
              onClick={handleSave}
              className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 ${
                isSaved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'
              }`}
            >
              {isSaved ? <><CheckCircle2 className="w-5 h-5" /> Salvo</> : <><Save className="w-5 h-5" /> Salvar Exame</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};