import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, Activity } from 'lucide-react';

export const AnginaScreening: React.FC = () => {
  const [effort, setEffort] = useState<boolean | null>(null);
  const [rest, setRest] = useState<boolean | null>(null);
  const [type, setType] = useState<'Aperto' | 'Pontada' | null>(null);

  const isAngina = effort === true && rest === true && type === 'Aperto';

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Angina x Dor Torácica</h1>
        <p className="text-slate-500 text-sm">Triagem rápida para diferenciação de dor isquêmica.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-8">
            {/* Question 1 */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700">1. A dor aumenta com o esforço físico?</label>
              <div className="flex gap-2">
                {[true, false].map((val) => (
                  <button
                    key={val ? 'yes' : 'no'}
                    onClick={() => setEffort(val)}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 ${
                      effort === val ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-500 border-transparent hover:border-slate-200'
                    }`}
                  >
                    {val ? 'Sim' : 'Não'}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2 */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700">2. A dor melhora com o repouso?</label>
              <div className="flex gap-2">
                {[true, false].map((val) => (
                  <button
                    key={val ? 'yes' : 'no'}
                    onClick={() => setRest(val)}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 ${
                      rest === val ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-500 border-transparent hover:border-slate-200'
                    }`}
                  >
                    {val ? 'Sim' : 'Não'}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 3 */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700">3. Qual o tipo da dor?</label>
              <div className="flex gap-2">
                {(['Aperto', 'Pontada'] as const).map((val) => (
                  <button
                    key={val}
                    onClick={() => setType(val)}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 ${
                      type === val ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-500 border-transparent hover:border-slate-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {effort !== null && rest !== null && type !== null ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              {isAngina ? (
                <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 text-center space-y-4 shadow-xl shadow-red-100">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <AlertTriangle className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-red-900 font-black text-xl uppercase tracking-tighter">ALERTA: Risco Isquêmico</div>
                    <p className="text-red-700 text-xs font-medium">Compatível com Angina Típica.</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-xl text-[10px] text-red-800 text-left leading-relaxed">
                    <strong>Conduta:</strong> Encaminhamento imediato para avaliação médica. Evitar esforços físicos até liberação.
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-8 text-center space-y-4 shadow-xl shadow-emerald-100">
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-emerald-900 font-black text-xl uppercase tracking-tighter">Baixa Probabilidade</div>
                    <p className="text-emerald-700 text-xs font-medium">Provável dor não-isquêmica.</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-xl text-[10px] text-emerald-800 text-left leading-relaxed">
                    <strong>Nota:</strong> Embora os critérios típicos não tenham sido preenchidos, mantenha monitoramento de sinais vitais.
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="bg-slate-50 rounded-3xl p-8 border-2 border-dashed border-slate-200 text-center">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">Responda às 3 perguntas para ver a triagem.</p>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <Info className="w-4 h-4" />
                Diferencial
              </div>
              <ul className="text-[10px] text-slate-600 space-y-2">
                <li><strong>Angina Típica:</strong> Aperto/Peso, irradiação para braço/mandíbula, induzida por esforço.</li>
                <li><strong>Dor Musculoesquelética:</strong> Pontada, piora com palpação ou movimento de tronco.</li>
                <li><strong>Dor Pleural:</strong> Piora com inspiração profunda ou tosse.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
