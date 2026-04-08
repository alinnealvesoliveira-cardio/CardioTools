import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, HelpCircle, CheckCircle2, Thermometer, 
  Droplets, Fingerprint, Layers, Save, AlertTriangle 
} from 'lucide-react';
import { usePatient } from '../../../context/PatientContext';

type System = 'Arterial' | 'Venoso' | 'Linfático';

export const VascularPhysicalExam: React.FC = () => {
  const { patientInfo, updateTestResult } = usePatient();
  const [activeSystem, setActiveSystem] = useState<System>('Arterial');
  const [isSaved, setIsSaved] = useState(false);

  // Estados locais para o formulário
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

  // LÓGICA DE RISCO CENTRAL (Integrada com a FEVE da Anamnese)
  const getCentralRisk = () => {
    // Conversão segura para número para evitar erro de tipagem string vs number
    const feve = patientInfo.ejectionFraction !== undefined ? Number(patientInfo.ejectionFraction) : undefined;

    if (feve !== undefined && feve < 40) {
      return { level: 'Grave', label: 'FEVE Reduzida', color: 'text-red-500' };
    }
    if (feve !== undefined && feve < 50) {
      return { level: 'Moderado', label: 'FEVE Borderline', color: 'text-orange-500' };
    }
    return { level: 'Normal', label: 'FEVE Preservada', color: 'text-emerald-500' };
  };

  const getArterialCIF = () => {
    const central = getCentralRisk();
    if (central.level === 'Grave') return "Grave (Impacto por FEVE)";
    if (pulse === null) return "Não avaliado";
    if (pulse >= 2 && temp === 'Normal') return "Normal";
    return "Alterada";
  };

  const handleSave = () => {
    updateTestResult('vascularAssessment', {
      arterial: { 
        pulse: PULSE_SCALE.find(p => p.val === pulse)?.label || 'Não avaliado', 
        temp, 
        capillaryRefill: capillaryRefill ? `${capillaryRefill}s` : 'Não avaliado', 
        cif: getArterialCIF() 
      },
      venous: { 
        ceap: 'C0', 
        godet: godet !== null ? `${godet}+` : 'Ausente', 
        cif: (godet && godet > 1) ? 'Alterada' : 'Normal' 
      },
      lymphatic: { 
        stemmer: stemmer === null ? 'Não avaliado' : (stemmer ? 'Positivo' : 'Negativo'), 
        cif: stemmer ? 'Alterada' : 'Normal' 
      }
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Verificação para o alerta visual
  const currentFeve = patientInfo.ejectionFraction !== undefined ? Number(patientInfo.ejectionFraction) : undefined;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-24">
      {/* Alerta de Risco Baseado na FEVE */}
      {currentFeve !== undefined && currentFeve < 40 && (
        <div className="bg-red-50 border-2 border-red-100 p-4 rounded-3xl flex gap-4 items-center animate-pulse">
          <AlertTriangle className="text-red-500 w-6 h-6 flex-shrink-0" />
          <p className="text-red-800 text-xs font-bold uppercase tracking-tight">
            Atenção: Risco Arterial Central Elevado (FEVE {currentFeve}%)
          </p>
        </div>
      )}

      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Exame Vascular</h1>
        <p className="text-slate-500 text-sm font-medium italic">Sincronizado com Diretrizes SBC 2020</p>
      </header>

      {/* Seletor de Sistema */}
      <div className="flex p-1.5 bg-slate-100 rounded-2xl gap-1">
        {(['Arterial', 'Venoso', 'Linfático'] as System[]).map((sys) => (
          <button
            key={sys}
            onClick={() => setActiveSystem(sys)}
            className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${
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
              <motion.div key="art" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                  <h3 className="font-bold flex items-center gap-2 text-slate-800"><Activity className="w-4 h-4 text-rose-500" /> Pulsos Periféricos</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {PULSE_SCALE.map((p) => (
                      <button
                        key={p.val}
                        onClick={() => setPulse(p.val)}
                        className={`p-4 rounded-2xl text-left border-2 transition-all ${
                          pulse === p.val ? 'border-rose-500 bg-rose-50' : 'border-slate-50 bg-slate-50'
                        }`}
                      >
                        <span className="block font-black text-xl text-slate-900">{p.label}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{p.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                  <h3 className="font-bold flex items-center gap-2 text-slate-800"><Thermometer className="w-4 h-4 text-orange-500" /> Temperatura e Perfusão</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Aspecto Térmico</label>
                      <select value={temp} onChange={(e) => setTemp(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none border-none focus:ring-2 focus:ring-indigo-500">
                        <option value="Normal">Normal</option>
                        <option value="Fria">Fria / Cianótica</option>
                        <option value="Quente">Quente / Hiperemiada</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase">TEC (seg)</label>
                      <input type="number" placeholder="2" value={capillaryRefill} onChange={(e) => setCapillaryRefill(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none border-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSystem === 'Venoso' && (
              <motion.div key="ven" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                <h3 className="font-bold flex items-center gap-2 text-slate-800"><Droplets className="w-4 h-4 text-indigo-500" /> Pesquisa de Edema (Godet)</h3>
                <div className="grid grid-cols-5 gap-2">
                  {[0, 1, 2, 3, 4].map((v) => (
                    <button key={v} onClick={() => setGodet(v)} className={`p-4 rounded-xl font-black transition-all ${godet === v ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                      {v === 0 ? '0' : `${v}+`}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {activeSystem === 'Linfático' && (
              <motion.div key="lin" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                <h3 className="font-bold flex items-center gap-2 text-slate-800"><Fingerprint className="w-4 h-4 text-emerald-500" /> Sinal de Stemmer</h3>
                <div className="flex gap-4">
                  <button onClick={() => setStemmer(true)} className={`flex-1 py-4 rounded-2xl font-black border-2 transition-all ${stemmer === true ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}>POSITIVO</button>
                  <button onClick={() => setStemmer(false)} className={`flex-1 py-4 rounded-2xl font-black border-2 transition-all ${stemmer === false ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}>NEGATIVO</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Card Lateral de CIF */}
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-2xl space-y-6 sticky top-4">
            <h3 className="text-indigo-400 font-black italic tracking-tighter text-lg flex items-center gap-2">
              <Layers className="w-5 h-5" /> CIF VASCULAR
            </h3>
            
            <div className="space-y-4 border-t border-white/10 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Arterial:</span>
                <span className="text-xs font-bold text-rose-400">{getArterialCIF()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Venoso:</span>
                <span className="text-xs font-bold text-indigo-400">{(godet !== null && godet > 1) ? 'Alterado' : 'Normal'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Status FEVE:</span>
                <span className={`text-xs font-bold ${getCentralRisk().color}`}>{getCentralRisk().level}</span>
              </div>
            </div>

            <button
              onClick={handleSave}
              className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 ${
                isSaved ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-indigo-600 text-white hover:scale-[1.02] shadow-lg shadow-indigo-600/20'
              }`}
            >
              {isSaved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
              {isSaved ? 'DADOS SALVOS' : 'GRAVAR EXAME'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};