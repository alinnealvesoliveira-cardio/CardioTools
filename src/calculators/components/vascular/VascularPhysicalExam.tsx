import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, HelpCircle, CheckCircle2, Thermometer, 
  Droplets, Fingerprint, Layers, Save, Clock, AlertTriangle 
} from 'lucide-react';
import { usePatient } from '../../../context/PatientContext';
import { MedicationAlert } from '../../../components/shared/MedicationAlert';
import { VascularDiagnosticHelp } from '../../../components/shared/VascularDiagnosticHelp';

type System = 'Arterial' | 'Venoso' | 'Linfático';

export const VascularPhysicalExam: React.FC = () => {
  const { patientInfo, medications, updateTestResult } = usePatient();
  const [activeSystem, setActiveSystem] = useState<System>('Arterial');
  const [showHelp, setShowHelp] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Estados do Exame Físico
  const [pulse, setPulse] = useState<number | null>(null);
  const [temp, setTemp] = useState<string>('Normal');
  const [capillaryRefill, setCapillaryRefill] = useState<string>('');
  const [ceap, setCeap] = useState<string[]>(['C0']);
  const [godet, setGodet] = useState<number | null>(null);
  const [stemmer, setStemmer] = useState<boolean | null>(null);

  React.useEffect(() => { setIsSaved(false); }, [pulse, temp, capillaryRefill, ceap, godet, stemmer]);

  const PULSE_SCALE = [
    { val: 0, label: "0", desc: "Ausente" },
    { val: 1, label: "1+", desc: "Diminuído" },
    { val: 2, label: "2+", desc: "Normal" },
    { val: 3, label: "3+", desc: "Aumentado" },
  ];

  // --- LÓGICA DE RISCO CENTRAL (CATE / AORTA) ---
  const getCentralRisk = () => {
    const hasHighObstr = patientInfo.coronaryArteriesAffected === '3' || patientInfo.coronaryArteriesAffected === 'TRONCO';
    const hasAneurysm = patientInfo.aorticAneurysm;
    
    if (hasHighObstr || hasAneurysm) {
      return { 
        level: 'Grave', 
        label: hasHighObstr ? 'Obstrução Coronariana Grave' : 'Aneurisma de Aorta',
        color: 'text-red-500' 
      };
    }
    return { level: 'Normal', label: 'Sem intercorrências centrais', color: 'text-slate-400' };
  };

  const getArterialCIF = () => {
    const central = getCentralRisk();
    if (central.level === 'Grave') return { severity: "Grave (Central)" };
    
    if (pulse === null) return null;
    const refill = parseFloat(capillaryRefill);
    if (pulse >= 2 && temp === 'Normal' && (refill <= 3 || isNaN(refill))) return { severity: "Normal" };
    if (pulse === 1) return { severity: "Leve" };
    return { severity: "Grave" };
  };

  const getVenousCIF = () => {
    const maxCeapLevel = Math.max(...ceap.map(c => parseInt(c.replace('C', '')) || 0));
    if (maxCeapLevel === 0 && !godet) return { severity: "Normal" };
    if (maxCeapLevel <= 2 && (godet || 0) <= 1) return { severity: "Leve" };
    if (maxCeapLevel <= 4) return { severity: "Moderada" };
    return { severity: "Grave" };
  };

  const handleSave = () => {
    updateTestResult('vascularAssessment', {
      arterial: { 
        pulse: PULSE_SCALE.find(p => p.val === pulse)?.label || 'Não avaliado', 
        temp, 
        capillaryRefill: capillaryRefill ? `${capillaryRefill}s` : 'Não avaliado', 
        cif: getArterialCIF()?.severity || 'Não avaliado' 
      },
      venous: { ceap, godet: godet ? `${godet}+` : 'Ausente', cif: getVenousCIF()?.severity || 'Não avaliado' },
      lymphatic: { stemmer: stemmer === null ? 'Não avaliado' : (stemmer ? 'Positivo' : 'Negativo'), cif: 'Normal' },
      centralRisk: {
        cateFindings: patientInfo.coronaryArteriesAffected || 'Não informado',
        aorticAneurysm: !!patientInfo.aorticAneurysm,
        overallSeverity: getCentralRisk().level as any
      }
    });
    setIsSaved(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-24">
      {/* Alerta de Risco Central - SEMPRE VISÍVEL SE HOUVER GRAVIDADE */}
      {getCentralRisk().level === 'Grave' && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
          className="bg-red-50 border-2 border-red-200 p-4 rounded-2xl flex items-center gap-4"
        >
          <div className="bg-red-500 p-2 rounded-lg text-white">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-red-700">Alerta de Risco Cardiovascular Central</h4>
            <p className="text-red-600 text-xs font-medium">
              Paciente com {getCentralRisk().label}. Classificação CIF Arterial elevada para Grave.
            </p>
          </div>
        </motion.div>
      )}

      <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900">Exame Físico Vascular</h1>
          <p className="text-slate-500 text-sm">Sincronizado com achados de CATE e Aorta.</p>
        </div>
        <button onClick={() => setShowHelp(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm">
          <HelpCircle className="w-4 h-4" /> Ajuda Diagnóstica
        </button>
      </header>

      <MedicationAlert type="bcc" active={medications.bcc} />
      <VascularDiagnosticHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />

      <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
        {(['Arterial', 'Venoso', 'Linfático'] as System[]).map((sys) => (
          <button key={sys} onClick={() => setActiveSystem(sys)} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeSystem === sys ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{sys}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeSystem === 'Arterial' && (
              <motion.div key="art" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                  <h2 className="flex items-center gap-2 text-slate-800 font-bold"><Activity className="w-5 h-5 text-rose-500" /> Pulsos Periféricos</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {PULSE_SCALE.map((p) => (
                      <button key={p.val} onClick={() => setPulse(p.val)} className={`p-4 rounded-2xl text-left border-2 transition-all ${pulse === p.val ? 'border-rose-500 bg-rose-50' : 'border-transparent bg-slate-50'}`}>
                        <span className="block font-black text-lg">{p.label}</span>
                        <span className="text-xs text-slate-500">{p.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Outros campos Arteriais aqui (Temperatura, Enchimento) - omitidos para brevidade */}
              </motion.div>
            )}
            {/* ... Sessões de Venoso e Linfático permanecem iguais ... */}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-6 sticky top-8">
            <h3 className="font-bold text-indigo-400 flex items-center gap-2 italic">CIF / OMS</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                <span className="opacity-60">Status Central:</span>
                <span className={`font-bold ${getCentralRisk().color}`}>{getCentralRisk().level}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                <span className="opacity-60">Arterial (Global):</span>
                <span className="font-bold text-rose-400">{getArterialCIF()?.severity || '---'}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                <span className="opacity-60">Venoso:</span>
                <span className="font-bold text-indigo-400">{getVenousCIF()?.severity || '---'}</span>
              </div>
            </div>
            <button onClick={handleSave} className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 ${isSaved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}>
              {isSaved ? <><CheckCircle2 className="w-5 h-5" /> Salvo</> : <><Save className="w-5 h-5" /> Salvar Exame</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};