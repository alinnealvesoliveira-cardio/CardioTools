import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Info, AlertCircle, CheckCircle2, Save } from 'lucide-react';

import { usePatient } from '../../../context/PatientContext';
import { MedicationAlert } from '../../../components/shared/MedicationAlert';

export const OrthostaticDrop: React.FC = () => {
  const { medications, updateTestResults } = usePatient();
  const [supinePAS, setSupinePAS] = useState<string>('');
  const [supinePAD, setSupinePAD] = useState<string>('');
  const [standingPAS, setStandingPAS] = useState<string>('');
  const [standingPAD, setStandingPAD] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);

  const calculateDelta = () => {
    const sPAS = parseInt(supinePAS);
    const sPAD = parseInt(supinePAD);
    const stPAS = parseInt(standingPAS);
    const stPAD = parseInt(standingPAD);

    if (isNaN(sPAS) || isNaN(stPAS)) return null;

    const deltaPAS = sPAS - stPAS;
    const deltaPAD = isNaN(sPAD) || isNaN(stPAD) ? null : sPAD - stPAD;

    return { deltaPAS, deltaPAD };
  };

  const delta = calculateDelta();

  const getInterpretation = (dPAS: number, dPAD: number | null) => {
    const isHypotension = dPAS >= 20 || (dPAD !== null && dPAD >= 10);
    if (isHypotension) return { 
      label: "Hipotensão Ortostática", 
      color: "red", 
      desc: "Queda de PAS ≥ 20 mmHg ou PAD ≥ 10 mmHg ao levantar. Indica falha nos mecanismos compensatórios de pressão arterial." 
    };
    return { 
      label: "Normal", 
      color: "green", 
      desc: "Variação de pressão dentro dos limites normais ao ortostatismo." 
    };
  };

  const handleSave = () => {
    if (delta === null) return;
    const interpretation = getInterpretation(delta.deltaPAS, delta.deltaPAD);
    updateTestResults({
      orthostaticDrop: {
        supine: { pas: parseInt(supinePAS), pad: parseInt(supinePAD) },
        standing: { pas: parseInt(standingPAS), pad: parseInt(standingPAD) },
        delta: { pas: delta.deltaPAS, pad: delta.deltaPAD || 0 },
        interpretation: interpretation.label
      }
    });
    setIsSaved(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-vitality-graphite tracking-tight">Hipotensão Ortostática (Orthostatic Drop)</h1>
        <p className="text-slate-500 text-sm">Avaliação da resposta pressórica à mudança de decúbito (supino para ortostatismo).</p>
      </header>

      <MedicationAlert type="bcc" active={medications.bcc} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">PAS Supino (mmHg)</label>
                <input
                  type="number"
                  value={supinePAS}
                  onChange={(e) => {
                    setSupinePAS(e.target.value);
                    setIsSaved(false);
                  }}
                  placeholder="Ex: 120"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-bold text-slate-800 focus:border-vitality-lime outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">PAD Supino (mmHg)</label>
                <input
                  type="number"
                  value={supinePAD}
                  onChange={(e) => {
                    setSupinePAD(e.target.value);
                    setIsSaved(false);
                  }}
                  placeholder="Ex: 80"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-bold text-slate-800 focus:border-vitality-lime outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">PAS Ortostatismo (mmHg)</label>
                <input
                  type="number"
                  value={standingPAS}
                  onChange={(e) => {
                    setStandingPAS(e.target.value);
                    setIsSaved(false);
                  }}
                  placeholder="Ex: 105"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-bold text-slate-800 focus:border-vitality-lime outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">PAD Ortostatismo (mmHg)</label>
                <input
                  type="number"
                  value={standingPAD}
                  onChange={(e) => {
                    setStandingPAD(e.target.value);
                    setIsSaved(false);
                  }}
                  placeholder="Ex: 75"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-bold text-slate-800 focus:border-vitality-lime outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {delta !== null ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center space-y-2">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Delta PAS</div>
                <div className={`text-6xl font-black tabular-nums ${delta.deltaPAS >= 20 ? 'text-vitality-risk' : 'text-vitality-lime'}`}>
                  {delta.deltaPAS}
                </div>
                <div className="text-xs text-slate-400">mmHg de queda</div>
              </div>

              {(() => {
                const interpretation = getInterpretation(delta.deltaPAS, delta.deltaPAD);
                return (
                  <div className={`rounded-2xl p-6 border-2 shadow-lg ${
                    interpretation.color === 'red' ? 'bg-vitality-risk/10 border-vitality-risk/20 text-vitality-risk' : 'bg-vitality-lime/10 border-vitality-lime/20 text-vitality-lime'
                  }`}>
                    <div className="text-sm font-bold uppercase tracking-wider opacity-70 mb-2">Interpretação</div>
                    <div className="text-xl font-bold mb-2">{interpretation.label}</div>
                    <p className="text-sm opacity-90">{interpretation.desc}</p>
                  </div>
                );
              })()}

              <button
                onClick={handleSave}
                disabled={isSaved}
                className={`w-full flex items-center justify-center gap-2 p-4 rounded-2xl font-bold transition-all shadow-lg ${
                  isSaved 
                    ? 'bg-emerald-100 text-emerald-600 cursor-not-allowed'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Resultado Gravado
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Gravar no Relatório
                  </>
                )}
              </button>
            </motion.div>
          ) : (
            <div className="bg-slate-50 rounded-3xl p-8 border-2 border-dashed border-slate-200 text-center">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">Insira os valores de pressão para ver o resultado.</p>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-vitality-lime font-bold text-sm">
                <Info className="w-4 h-4" />
                Pérolas Clínicas
              </div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                <li>Meça a PA após 5 minutos em supino e no 1º e 3º minuto em pé.</li>
                <li>A queda de pressão pode ser acompanhada de tontura ou síncope.</li>
                <li>Comum em idosos, diabéticos e pacientes em uso de anti-hipertensivos.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
