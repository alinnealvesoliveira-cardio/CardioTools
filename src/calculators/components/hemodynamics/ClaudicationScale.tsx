import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Info, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ClaudicationScale: React.FC = () => {
  const [selectedScore, setSelectedScore] = useState<number | null>(null);

  const CLAUDICATION_ITEMS = [
    { score: 0, label: "Grau 0", description: "Sem dor ou desconforto." },
    { score: 1, label: "Grau 1", description: "Desconforto ou dor mínima (claudicação leve)." },
    { score: 2, label: "Grau 2", description: "Dor moderada, mas o paciente consegue continuar caminhando." },
    { score: 3, label: "Grau 3", description: "Dor intensa, o paciente precisa parar de caminhar." },
    { score: 4, label: "Grau 4", description: "Dor insuportável (claudicação máxima)." },
  ];

  const getInterpretation = (score: number) => {
    if (score === 0) return { label: "Sem Claudicação", color: "green", desc: "Ausência de sintomas isquêmicos durante o esforço." };
    if (score <= 2) return { label: "Claudicação Leve a Moderada", color: "yellow", desc: "Sintomas isquêmicos presentes, mas toleráveis." };
    return { label: "Claudicação Grave", color: "red", desc: "Sintomas isquêmicos limitantes, indicando doença arterial periférica obstrutiva importante." };
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Escala de Claudicação Intermitente</h1>
        <p className="text-slate-500 text-sm">Avaliação subjetiva da dor isquêmica em membros inferiores durante o esforço.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Selecione o grau de dor relatado</label>
            <div className="grid grid-cols-1 gap-2">
              {CLAUDICATION_ITEMS.map((item) => (
                <button
                  key={item.score}
                  onClick={() => setSelectedScore(item.score)}
                  className={`w-full p-4 rounded-2xl text-left transition-all border-2 flex items-center gap-4 ${
                    selectedScore === item.score
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-md'
                      : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                    selectedScore === item.score ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 shadow-sm'
                  }`}>
                    {item.score}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm">{item.label}</div>
                    <div className="text-xs opacity-70">{item.description}</div>
                  </div>
                  {selectedScore === item.score && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {selectedScore !== null ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center space-y-2">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Grau de Claudicação</div>
                <div className="text-6xl font-black text-emerald-600 tabular-nums">
                  {selectedScore}
                </div>
                <div className="text-xs text-slate-400">Escala de Dor Isquêmica</div>
              </div>

              {(() => {
                const interpretation = getInterpretation(selectedScore);
                return (
                  <div className={`rounded-2xl p-6 border-2 shadow-lg ${
                    interpretation.color === 'red' ? 'bg-red-50 border-red-200 text-red-700' : 
                    interpretation.color === 'yellow' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                    'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}>
                    <div className="text-sm font-bold uppercase tracking-wider opacity-70 mb-2">Interpretação</div>
                    <div className="text-xl font-bold mb-2">{interpretation.label}</div>
                    <p className="text-sm opacity-90">{interpretation.desc}</p>
                  </div>
                );
              })()}
            </motion.div>
          ) : (
            <div className="bg-slate-50 rounded-3xl p-8 border-2 border-dashed border-slate-200 text-center">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">Selecione um grau para ver o resultado.</p>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <Info className="w-4 h-4" />
                Pérolas Clínicas
              </div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                <li>A claudicação é o sintoma clássico da Doença Arterial Periférica (DAP).</li>
                <li>Geralmente ocorre em panturrilhas, mas pode ser em coxas ou glúteos.</li>
                <li>O teste de caminhada (TC6M) é ideal para induzir e graduar a claudicação.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
