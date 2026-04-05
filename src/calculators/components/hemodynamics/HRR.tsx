import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Info, AlertCircle, CheckCircle2, Save } from 'lucide-react';

import { usePatient } from '../../../context/PatientContext';
import { useAuth } from '../../../context/AuthContext';
import { logActivity } from '../../../lib/supabase';
import { MedicationAlert } from '../../../components/shared/MedicationAlert';

export const HRR: React.FC = () => {
  const { medications, updateTestResults } = usePatient();
  const { user } = useAuth();
  const [peakHR, setPeakHR] = useState<string>('');
  const [recoveryHR, setRecoveryHR] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);

  const calculateHRR = () => {
    const peak = parseInt(peakHR);
    const recovery = parseInt(recoveryHR);
    if (isNaN(peak) || isNaN(recovery)) return null;
    return peak - recovery;
  };

  const hrr = calculateHRR();

  const getInterpretation = (val: number) => {
    if (val < 12) return { 
      label: "Recuperação Anormal", 
      color: "red", 
      desc: "HRR < 12 bpm no 1º minuto pós-esforço está associado a maior risco de mortalidade cardiovascular e disfunção autonômica." 
    };
    return { 
      label: "Recuperação Normal", 
      color: "green", 
      desc: "HRR ≥ 12 bpm no 1º minuto indica boa modulação vagal e menor risco cardiovascular." 
    };
  };

  const handleSave = async () => {
    if (hrr === null) return;
    const interpretation = getInterpretation(hrr);
    updateTestResults({
      hrr: {
        peakHR: parseInt(peakHR),
        recoveryHR: parseInt(recoveryHR),
        delta: hrr,
        interpretation: interpretation.label
      }
    });

    if (user) {
      await logActivity(user.id, 'Finalizou Teste HRR');
    }
    
    setIsSaved(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-vitality-graphite tracking-tight">Recuperação da Frequência Cardíaca (HRR)</h1>
        <p className="text-slate-500 text-sm">Avaliação da reativação vagal após o esforço físico (1º minuto).</p>
      </header>

      <MedicationAlert type="betablockers" active={medications.betablockers} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">FC de Pico (bpm)</label>
                <input
                  type="number"
                  value={peakHR}
                  onChange={(e) => {
                    setPeakHR(e.target.value);
                    setIsSaved(false);
                  }}
                  placeholder="Ex: 150"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-bold text-slate-800 focus:border-vitality-lime outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">FC após 1 minuto de repouso (bpm)</label>
                <input
                  type="number"
                  value={recoveryHR}
                  onChange={(e) => {
                    setRecoveryHR(e.target.value);
                    setIsSaved(false);
                  }}
                  placeholder="Ex: 130"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-bold text-slate-800 focus:border-vitality-lime outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {hrr !== null ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center space-y-2">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Delta HRR (1 min)</div>
                <div className={`text-6xl font-black tabular-nums ${hrr < 12 ? 'text-vitality-risk' : 'text-vitality-lime'}`}>
                  {hrr}
                </div>
                <div className="text-xs text-slate-400">batimentos por minuto</div>
              </div>

              {(() => {
                const interpretation = getInterpretation(hrr);
                return (
                  <div className="space-y-4">
                    <div className={`rounded-2xl p-6 border-2 shadow-lg ${
                      interpretation.color === 'red' ? 'bg-vitality-risk/10 border-vitality-risk/20 text-vitality-risk' : 'bg-vitality-lime/10 border-vitality-lime/20 text-vitality-lime'
                    }`}>
                      <div className="text-sm font-bold uppercase tracking-wider opacity-70 mb-2">Interpretação</div>
                      <div className="text-xl font-bold mb-2">{interpretation.label}</div>
                      <p className="text-sm opacity-90">{interpretation.desc}</p>
                    </div>
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
              <p className="text-slate-400 font-medium">Insira os valores de FC para ver o resultado.</p>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-vitality-lime font-bold text-sm">
                <Info className="w-4 h-4" />
                Pérolas Clínicas
              </div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                <li>HRR reflete a reativação parassimpática imediata.</li>
                <li>Ponto de corte de 12 bpm é o mais utilizado na literatura (Cole et al., 1999).</li>
                <li>Em testes de degrau ou caminhada, valores baixos também são preditores de risco.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
