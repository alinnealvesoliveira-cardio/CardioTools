import React, { useState } from 'react';
import { ClipboardList, Info, AlertTriangle, CheckCircle2, Save, BookOpen } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../lib/supabase';

const DASI_QUESTIONS = [
  { id: 1, text: "Cuidar de si mesmo (comer, vestir-se, banhar-se ou usar o banheiro)?", weight: 2.75 },
  { id: 2, text: "Andar dentro de casa?", weight: 1.75 },
  { id: 3, text: "Andar um quarteirão ou dois em terreno plano?", weight: 2.75 },
  { id: 4, text: "Subir um lance de escadas ou subir uma ladeira?", weight: 5.50 },
  { id: 5, text: "Correr uma curta distância?", weight: 8.00 },
  { id: 6, text: "Fazer trabalhos leves em casa (limpar pó, lavar louça)?", weight: 2.70 },
  { id: 7, text: "Fazer trabalhos moderados em casa (passar aspirador, carregar compras)?", weight: 3.50 },
  { id: 8, text: "Fazer trabalhos pesados em casa (esfregar o chão, carregar móveis)?", weight: 8.00 },
  { id: 9, text: "Fazer trabalhos de quintal/jardim (rastelar, podar, cortar grama)?", weight: 4.50 },
  { id: 11, text: "Participar de atividades recreativas moderadas (dança, boliche, tênis dupla)?", weight: 6.00 },
  { id: 12, text: "Participar de esportes extenuantes (natação, corrida, tênis individual)?", weight: 7.50 }
];

export const DASI: React.FC = () => {
  const { patientInfo, testResults, setTestResults } = usePatient();
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [isSaved, setIsSaved] = useState(false);

  // Dados do paciente para cálculos
  const age = parseInt(patientInfo.age?.toString() || '0');
  const feve = Number(patientInfo.ejectionFraction) || 60;

  const calculateResults = () => {
    const score = DASI_QUESTIONS.reduce((acc, q) => acc + (answers[q.id] ? q.weight : 0), 0);
    const vo2 = (0.43 * score) + 9.6;
    const mets = vo2 / 3.5;
    return { score, vo2, mets };
  };

  const { score, vo2, mets } = calculateResults();
  
  // Predito Tanaka/Gulati modificado para METs
  const predictedMETs = age > 0 ? 14.7 - (0.11 * age) : null;
  const percentage = predictedMETs ? (mets / predictedMETs) * 100 : null;

  // Lógica de Classificação CBDF-1 (Cruzamento METs + FEVE)
  const getCBDF = () => {
    if (!percentage) return null;
    if (percentage < 25 || feve < 30) return { qualifier: 4, severity: "Deficiência Completa", range: "96-100%" };
    if (percentage < 50 || feve < 40) return { qualifier: 3, severity: "Deficiência Grave", range: "50-95%" };
    if (percentage < 75) return { qualifier: 2, severity: "Deficiência Moderada", range: "25-49%" };
    if (percentage < 95) return { qualifier: 1, severity: "Deficiência Leve", range: "5-24%" };
    return { qualifier: 0, severity: "Sem Deficiência", range: "0-4%" };
  };

  const cbdf = getCBDF();

  const handleSave = async () => {
    setTestResults({
      ...testResults,
      dasi: {
        score,
        estimatedMETs: mets,
        predictedMETs: predictedMETs || 0,
        percentage: percentage || 0,
        interpretation: cbdf?.severity || "Normal",
        cif: cbdf ? { qualifier: cbdf.qualifier, severity: cbdf.severity } : undefined
      }
    });

    if (user) await logActivity(user.id, 'Finalizou DASI');
    setIsSaved(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-20">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-emerald-600 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <ClipboardList className="w-8 h-8" /> DASI Index + CBDF-1
            </h2>
            <p className="text-emerald-50 text-xs mt-1 font-medium italic">Hlatky et al., 1989 | AHA/ACC Guidelines</p>
          </div>
          {mets > 0 && (
            <button 
              onClick={handleSave}
              className={`px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                isSaved ? 'bg-white text-emerald-600' : 'bg-emerald-800 text-white hover:bg-emerald-900'
              }`}
            >
              {isSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
              {isSaved ? 'SALVO' : 'SALVAR'}
            </button>
          )}
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-2xl flex gap-3 text-slate-600 text-[11px] border border-slate-100">
              <Info className="w-4 h-4 shrink-0 text-emerald-500" />
              <p>Instruções: Marque as atividades realizadas <strong>sem sintomas limitantes</strong>.</p>
            </div>

            <div className="space-y-2">
              {DASI_QUESTIONS.map((q) => (
                <button
                  key={q.id}
                  onClick={() => { setAnswers(prev => ({ ...prev, [q.id]: !prev[q.id] })); setIsSaved(false); }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                    answers[q.id] ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-50 bg-white hover:border-slate-200'
                  }`}
                >
                  <span className={`text-left text-xs font-bold ${answers[q.id] ? 'text-emerald-900' : 'text-slate-600'}`}>
                    {q.text}
                  </span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    answers[q.id] ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200'
                  }`}>
                    {answers[q.id] && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center relative">
                  <span className="absolute top-2 right-2 text-[8px] text-slate-500 font-serif italic">[1]</span>
                  <p className="text-[10px] uppercase font-bold text-slate-400">METs</p>
                  <p className="text-4xl font-black text-emerald-400">{mets.toFixed(1)}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center relative">
                  <span className="absolute top-2 right-2 text-[8px] text-slate-500 font-serif italic">[2]</span>
                  <p className="text-[10px] uppercase font-bold text-slate-400">% do Predito</p>
                  <p className="text-4xl font-black text-emerald-400">{percentage?.toFixed(0)}%</p>
                </div>
              </div>

              {cbdf && (
                <div className="bg-emerald-500/10 border-l-4 border-emerald-500 p-4 rounded-r-2xl relative">
                   <span className="absolute top-2 right-2 text-[8px] text-emerald-500/50 font-serif italic">[3]</span>
                  <p className="text-[10px] uppercase font-bold text-emerald-400">Qualificador CBDF-1</p>
                  <p className="text-xl font-black text-white">.{cbdf.qualifier} — {cbdf.severity}</p>
                  <p className="text-[10px] text-emerald-200/60 mt-1 italic">Comprometimento: {cbdf.range}</p>
                </div>
              )}

              <div className="space-y-2">
                {score <= 34 && (
                  <div className="flex items-start gap-2 text-[10px] text-orange-200 bg-orange-950/40 p-3 rounded-xl border border-orange-500/20">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-orange-400" /> 
                    <span>DASI ≤ 34: Necessidade de teste cardiopulmonar ou risco aumentado em cirurgias (METs &lt; 4).</span>
                  </div>
                )}
                {score <= 23 && (
                  <div className="flex items-start gap-2 text-[10px] text-red-200 bg-red-950/40 p-3 rounded-xl border border-red-500/20">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" /> 
                    <span>DASI ≤ 23: Preditivo de mortalidade em 36 meses na IC e DPOC.</span>
                  </div>
                )}
              </div>

              {/* Seção de Referências Bibliográficas */}
              <div className="pt-4 border-t border-white/5 space-y-1">
                <div className="flex items-center gap-1 text-slate-500 mb-1">
                  <BookOpen size={10} />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Referências Científicas</span>
                </div>
                <p className="text-[8px] text-slate-500 leading-tight">
                  [1] <strong>Hlatky MA, et al.</strong> (1989). J Am Coll Cardiol. Fórm.: (0.43 x Score) + 9.6.
                </p>
                <p className="text-[8px] text-slate-500 leading-tight">
                  [2] <strong>AHA/ACC Guideline</strong> (2014). Perioperative Cardiovascular Evaluation.
                </p>
                <p className="text-[8px] text-slate-500 leading-tight">
                  [3] <strong>CBDF-1/OMS.</strong> Classificação Brasileira de Deficiências em Cardiologia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};