import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Info, AlertCircle, CheckCircle2, HelpCircle, X, Save } from 'lucide-react';
import { VascularDiagnosticHelp } from '../../../components/shared/VascularDiagnosticHelp';
import { usePatient } from '../../../context/PatientContext';
import { useAuth } from '../../../context/AuthContext';
import { logActivity } from '../../../lib/supabase';

export const ABI: React.FC = () => {
  const { updateTestResults } = usePatient();
  const { user } = useAuth();
  const [ankleBP, setAnkleBP] = useState<string>('');
  const [armBP, setArmBP] = useState<string>('');
  const [showHelp, setShowHelp] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const calculateABI = () => {
    const ankle = parseFloat(ankleBP);
    const arm = parseFloat(armBP);
    if (isNaN(ankle) || isNaN(arm) || arm === 0) return null;
    return ankle / arm;
  };

  const abi = calculateABI();

  const getInterpretation = (val: number) => {
    if (val > 1.30) return { 
      label: "Artérias Não Compressíveis", 
      color: "yellow", 
      desc: `Valor ${val.toFixed(2)}: Sugere calcificação da camada média arterial (comum em diabéticos ou renais crônicos).` 
    };
    if (val >= 0.91) return { 
      label: "Normal", 
      color: "green", 
      desc: `Valor ${val.toFixed(2)}: Considerado normal.` 
    };
    if (val >= 0.71) return { 
      label: "DAP Leve", 
      color: "yellow", 
      desc: `Valor ${val.toFixed(2)}: Doença Arterial Periférica leve.` 
    };
    if (val >= 0.41) return { 
      label: "DAP Moderada", 
      color: "orange", 
      desc: `Valor ${val.toFixed(2)}: Doença Arterial Periférica moderada.` 
    };
    return { 
      label: "DAP Grave", 
      color: "red", 
      desc: `Valor ${val.toFixed(2)}: Doença Arterial Periférica grave, com risco de isquemia crítica.` 
    };
  };

  const handleSave = async () => {
    if (abi === null) return;
    const interpretation = getInterpretation(abi);
    updateTestResults({
      abi: {
        value: abi,
        interpretation: interpretation.label,
        ankleBP: parseFloat(ankleBP),
        armBP: parseFloat(armBP)
      }
    });

    if (user) {
      await logActivity(user.id, 'Finalizou Teste ITB/ABI');
    }
    
    setIsSaved(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Índice Tornozelo-Braquial (ITB/ABI)</h1>
          <p className="text-slate-500 text-sm">Ferramenta diagnóstica para Doença Arterial Periférica (DAP).</p>
        </div>
        <button
          onClick={() => setShowHelp(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          Ajuda Diagnóstica
        </button>
      </header>

      <VascularDiagnosticHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">PAS Tornozelo (mmHg)</label>
                <input
                  type="number"
                  value={ankleBP}
                  onChange={(e) => {
                    setAnkleBP(e.target.value);
                    setIsSaved(false);
                  }}
                  placeholder="Ex: 110"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-bold text-slate-800 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">PAS Braço (mmHg)</label>
                <input
                  type="number"
                  value={armBP}
                  onChange={(e) => {
                    setArmBP(e.target.value);
                    setIsSaved(false);
                  }}
                  placeholder="Ex: 120"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-bold text-slate-800 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {abi !== null ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center space-y-2">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Índice ITB</div>
                <div className="text-6xl font-black text-emerald-600 tabular-nums">
                  {abi.toFixed(2)}
                </div>
                <div className="text-xs text-slate-400">Razão PAS Tornozelo / PAS Braço</div>
              </div>

              {(() => {
                const interpretation = getInterpretation(abi);
                return (
                  <div className={`rounded-2xl p-6 border-2 shadow-lg ${
                    interpretation.color === 'red' ? 'bg-red-50 border-red-200 text-red-700' : 
                    interpretation.color === 'orange' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                    interpretation.color === 'yellow' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                    'bg-emerald-50 border-emerald-200 text-emerald-700'
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
              <p className="text-slate-400 font-medium">Insira as pressões para ver o resultado.</p>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <Info className="w-4 h-4" />
                Pérolas Clínicas
              </div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                <li>Utilize a maior PAS braquial (direita ou esquerda) como denominador.</li>
                <li>Utilize a maior PAS do tornozelo (pediosa ou tibial posterior) como numerador.</li>
                <li>ITB &lt; 0.90 tem alta sensibilidade para diagnóstico de DAP.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
