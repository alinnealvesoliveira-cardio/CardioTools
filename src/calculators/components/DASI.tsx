import React, { useState } from 'react';
import { ClipboardList, Calculator, Info, AlertTriangle } from 'lucide-react';

const DASI_QUESTIONS = [
  { id: 1, text: "Cuidar de si mesmo (comer, vestir-se, banhar-se ou usar o banheiro)?", weight: 2.75 },
  { id: 2, text: "Andar dentro de casa?", weight: 1.75 },
  { id: 3, text: "Andar um quarteirão ou dois em terreno plano?", weight: 2.75 },
  { id: 4, text: "Subir um lance de escadas ou subir uma ladeira?", weight: 5.50 },
  { id: 5, text: "Correr uma curta distância?", weight: 8.00 },
  { id: 6, text: "Fazer trabalhos leves em casa (limpar pó, lavar louça)?", weight: 2.70 },
  { id: 7, text: "Fazer trabalhos moderados em casa (passar aspirador, carregar compras)?", weight: 3.50 },
  { id: 8, text: "Fazer trabalhos pesados em casa (esfregar o chão, carregar móveis)?", weight: 8.00 },
  { id: 9, text: "Fazer trabalhos de quintal/jardim (ancinho, cortar grama)?", weight: 4.50 },
  // Questão 10 omitida conforme solicitado
  { id: 11, text: "Participar de atividades recreativas moderadas (dança, boliche, tênis dupla)?", weight: 6.00 },
  { id: 12, text: "Participar de esportes extenuantes (natação, corrida, tênis individual)?", weight: 7.50 }
];

export const DASI: React.FC = () => {
  const [answers, setAnswers] = useState<Record<number, boolean>>({});

  const calculateResults = () => {
    const score = DASI_QUESTIONS.reduce((acc, q) => acc + (answers[q.id] ? q.weight : 0), 0);
    const vo2 = (0.43 * score) + 9.6;
    const mets = vo2 / 3.5;
    return { score, vo2, mets };
  };

  const { score, vo2, mets } = calculateResults();

  const getInterpretation = () => {
    if (score > 34) return { label: "Adequada", risk: "Baixo Risco", color: "text-green-600", bg: "bg-green-50" };
    if (score >= 25) return { label: "Limítrofe", risk: "Risco Moderado", color: "text-yellow-600", bg: "bg-yellow-50" };
    if (score > 8) return { label: "Reduzida", risk: "Alto Risco", color: "text-orange-600", bg: "bg-orange-50" };
    return { label: "Muito Reduzida", risk: "Muito Alto Risco", color: "text-red-600", bg: "bg-red-50" };
  };

  const interp = getInterpretation();

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-vitality-lime p-6">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-8 h-8" /> DASI Index
          </h2>
          <p className="text-slate-800 text-sm mt-1 font-medium">Duke Activity Status Index (Versão Omitida Item 10)</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl flex gap-3 text-slate-600 text-xs border border-slate-100 italic">
            <Info className="w-4 h-4 shrink-0 text-vitality-lime" />
            <p>Instruções: Marque SIM para atividades realizadas SEM sintomas limitantes (dispneia, cansaço, dor precordial ou tontura).</p>
          </div>

          <div className="space-y-2">
            {DASI_QUESTIONS.map((q) => (
              <button
                key={q.id}
                onClick={() => setAnswers(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                  answers[q.id] ? 'border-vitality-lime bg-lime-50/30' : 'border-slate-50 bg-white'
                }`}
              >
                <span className="text-left text-sm font-semibold text-slate-700">{q.text}</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  answers[q.id] ? 'bg-vitality-lime border-vitality-lime' : 'border-slate-200'
                }`}>
                  {answers[q.id] && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
            ))}
          </div>

          {/* RESULTADOS FINAIS */}
          <div className="mt-8 bg-slate-900 rounded-3xl p-6 text-white border-b-8 border-vitality-lime">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] uppercase font-bold text-slate-400">Escore DASI</p>
                <p className="text-3xl font-black text-vitality-lime">{score.toFixed(1)}</p>
                <p className="text-[10px] text-slate-500">Máx: 52.95</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] uppercase font-bold text-slate-400">METs Estimados</p>
                <p className="text-3xl font-black text-vitality-lime">{mets.toFixed(1)}</p>
                <p className="text-[10px] text-slate-500">VO2: {vo2.toFixed(1)}</p>
              </div>
            </div>

            {/* INTERPRETAÇÃO CLÍNICA */}
            <div className={`${interp.bg} ${interp.color} p-4 rounded-2xl border-l-4 border-current`}>
              <p className="text-[10px] uppercase font-bold opacity-70">Capacidade Funcional / Risco</p>
              <p className="text-lg font-black">{interp.label} — {interp.risk}</p>
            </div>

            {/* ALERTAS DE PONTOS DE CORTE */}
            <div className="mt-4 space-y-2">
               {score <= 34 && (
                 <div className="flex items-center gap-2 text-[11px] text-orange-200 bg-orange-950/30 p-2 rounded-lg">
                   <AlertTriangle className="w-3 h-3" /> 
                   <span>Atenção: DASI ≤ 34 sugere necessidade de teste cardiopulmonar.</span>
                 </div>
               )}
               {score <= 23 && (
                 <div className="flex items-center gap-2 text-[11px] text-red-200 bg-red-950/30 p-2 rounded-lg">
                   <AlertTriangle className="w-3 h-3" /> 
                   <span>IC: DASI ≤ 23 é preditor de mortalidade (36 meses).</span>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};