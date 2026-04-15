import React, { useState } from 'react';
import { Activity, Info, AlertCircle, Heart, Save, CheckCircle2 } from 'lucide-react';
import { usePatient } from '../../../context/PatientContext';

export const HRV: React.FC = () => {
  const { updateTestResults } = usePatient();
  const [rmssd, setRmssd] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);

  const getInterpretation = (val: number) => {
    if (val < 20) return { 
      label: "VFC Muito Baixa", 
      color: "red", 
      desc: "Indica predomínio simpático acentuado ou baixa reserva autonômica." 
    };
    if (val < 40) return { 
      label: "VFC Baixa", 
      color: "orange", 
      desc: "Sugere redução da atividade parassimpática." 
    };
    if (val <= 70) return { 
      label: "VFC Normal", 
      color: "green", 
      desc: "Valores dentro da faixa esperada para a maioria dos adultos saudáveis." 
    };
    return { 
      label: "VFC Alta", 
      color: "emerald", 
      desc: "Indica excelente tônus parassimpático e boa recuperação autonômica." 
    };
  };

  const rmssdNum = parseFloat(rmssd);

  const handleSave = () => {
    if (isNaN(rmssdNum)) return;
    const interpretation = getInterpretation(rmssdNum);
    updateTestResults({
      rmssd: rmssdNum,
      hrvInterpretation: interpretation.label
    } as any);
    setIsSaved(true);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Variabilidade da FC (VFC)</h1>
        <p className="text-slate-500 text-sm">Avaliação do tônus autonômico através do RMSSD.</p>
      </header>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <p className="text-xs text-blue-800 leading-relaxed">
              O <strong>RMSSD</strong> (Raiz quadrada da média do quadrado das diferenças sucessivas entre intervalos RR) é o principal índice no domínio do tempo para avaliar a atividade parassimpática.
            </p>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">RMSSD (ms)</label>
            <div className="relative">
              <input
                type="number"
                value={rmssd}
                onChange={(e) => {
                  setRmssd(e.target.value);
                  setIsSaved(false);
                }}
                placeholder="Ex: 45"
                className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl text-4xl font-black text-slate-800 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold">ms</div>
            </div>
          </div>
        </div>

        {rmssd && !isNaN(rmssdNum) && (
          <div className="pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
              {(() => {
                const interpretation = getInterpretation(rmssdNum);
                return (
                  <div className={`rounded-2xl p-6 border-2 shadow-lg ${
                    interpretation.color === 'red' ? 'bg-red-50 border-red-200 text-red-700' : 
                    interpretation.color === 'orange' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                    'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-bold uppercase tracking-wider opacity-70">Interpretação</div>
                      <Heart className={`w-5 h-5 ${interpretation.color === 'red' ? 'animate-pulse' : ''}`} />
                    </div>
                    <div className="text-2xl font-black mb-2">{interpretation.label}</div>
                    <p className="text-sm font-medium opacity-90">{interpretation.desc}</p>
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

              <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
                  <AlertCircle className="w-4 h-4" />
                  Notas Clínicas
                </div>
                <ul className="space-y-3 text-[11px] text-slate-400 leading-relaxed">
                  <li className="flex gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    Valores de RMSSD diminuem naturalmente com a idade.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    Fatores como estresse, sono inadequado e overtraining reduzem o RMSSD.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    A tendência longitudinal (baseline do paciente) é mais importante que um valor isolado.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
