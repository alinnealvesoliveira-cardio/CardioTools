import React, { useState } from 'react';
import { 
  ClipboardList, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  Save, 
  BookOpen, 
  ChevronRight,
  Activity as ActivityIcon 
} from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

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
  const { patientInfo, testResults, updateTestResults } = usePatient();
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [isSaved, setIsSaved] = useState(false);

  // Dados para cálculos
  const age = parseInt(patientInfo.age?.toString() || '0');
  const feve = Number(patientInfo.ejectionFraction) || 60;

  const calculateResults = () => {
    const score = DASI_QUESTIONS.reduce((acc, q) => acc + (answers[q.id] ? q.weight : 0), 0);
    const vo2 = (0.43 * score) + 9.6;
    const mets = vo2 / 3.5;
    return { score, vo2, mets };
  };

  const { score, vo2, mets } = calculateResults();
  const predictedMETs = age > 0 ? 14.7 - (0.11 * age) : 10;
  const percentage = predictedMETs > 0 ? (mets / predictedMETs) * 100 : 0;

  const getCBDF = () => {
    if (percentage < 25 || feve < 30) return { qualifier: 4, severity: "Deficiência Completa", range: "96-100%", color: "#ef4444" };
    if (percentage < 50 || feve < 40) return { qualifier: 3, severity: "Deficiência Grave", range: "50-95%", color: "#f97316" };
    if (percentage < 75) return { qualifier: 2, severity: "Deficiência Moderada", range: "25-49%", color: "#eab308" };
    if (percentage < 95) return { qualifier: 1, severity: "Deficiência Leve", range: "5-24%", color: "#10b981" };
    return { qualifier: 0, severity: "Sem Deficiência", range: "0-4%", color: "#059669" };
  };

  const cbdf = getCBDF();

  const handleSave = async () => {
    updateTestResults({
      dasi: {
        score,
        estimatedMETs: mets,
        predictedMETs: predictedMETs,
        percentage: percentage,
        interpretation: cbdf.severity,
        cif: { qualifier: cbdf.qualifier, severity: cbdf.severity }
      }
    });

    if (user) await logActivity(user.id, 'Finalizou DASI');
    setIsSaved(true);
    toast.success("Capacidade funcional gravada!");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-48">
      <div className="bg-white rounded-[32px] shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-8 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-emerald-400" /> DASI Index
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
              Duke Activity Status Index + Classificação CBDF
            </p>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Listagem de Atividades */}
          <div className="space-y-6">
            <div className="bg-indigo-50 p-4 rounded-2xl flex gap-3 border border-indigo-100">
              <Info className="w-5 h-5 shrink-0 text-indigo-500" />
              <p className="text-indigo-900 text-xs leading-relaxed font-medium">
                Marque as atividades que o paciente realiza <strong>sem restrições por sintomas</strong>.
              </p>
            </div>

            <div className="space-y-2">
              {DASI_QUESTIONS.map((q) => (
                <button
                  key={q.id}
                  onClick={() => { setAnswers(prev => ({ ...prev, [q.id]: !prev[q.id] })); setIsSaved(false); }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 ${
                    answers[q.id] 
                      ? 'border-emerald-500 bg-emerald-50/30' 
                      : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'
                  }`}
                >
                  <span className={`text-left text-xs font-bold leading-tight ${answers[q.id] ? 'text-emerald-900' : 'text-slate-600'}`}>
                    {q.text}
                  </span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    answers[q.id] ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200 bg-white'
                  }`}>
                    {answers[q.id] && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Dash de Resultados Interativo */}
          <div className="space-y-6">
            <div className="sticky top-6 space-y-4">
              <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl space-y-8 relative overflow-hidden">
                <div className="grid grid-cols-2 gap-6 relative z-10">
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">METs Estimados</p>
                    <p className="text-5xl font-black text-emerald-400 tabular-nums">{mets.toFixed(1)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">% do Predito</p>
                    <p className="text-5xl font-black text-emerald-400 tabular-nums">{percentage.toFixed(0)}%</p>
                  </div>
                </div>

                <div className="bg-white/5 border-l-4 p-6 rounded-r-2xl space-y-1 relative z-10" style={{ borderColor: cbdf.color }}>
                  <p className="text-[10px] uppercase font-black text-slate-400">Funcionalidade (CBDF-1)</p>
                  <p className="text-xl font-black text-white leading-tight">.{cbdf.qualifier} — {cbdf.severity}</p>
                  <p className="text-[11px] text-slate-500 italic">Déficit funcional de {cbdf.range}</p>
                </div>

                <div className="space-y-2 relative z-10">
                  {mets < 4 && (
                    <div className="flex items-start gap-3 text-[10px] text-orange-200 bg-orange-500/10 p-4 rounded-2xl border border-orange-500/20">
                      <AlertTriangle className="w-5 h-5 shrink-0 text-orange-400" /> 
                      <p className="leading-relaxed font-medium"><strong>Risco Perioperatório:</strong> Abaixo de 4 METs indica maior chance de eventos cardíacos maiores em cirurgias.</p>
                    </div>
                  )}
                  {score <= 23 && (
                    <div className="flex items-start gap-3 text-[10px] text-red-200 bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                      <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" /> 
                      <p className="leading-relaxed font-medium"><strong>Prognóstico:</strong> Valor preditivo de mortalidade em pacientes com IC ou DPOC.</p>
                    </div>
                  )}
                </div>
                
                {/* O alias ActivityIcon resolve a "cobrinha" aqui */}
                <ActivityIcon size={120} className="absolute -bottom-10 -right-10 text-white/[0.03] rotate-12" />
              </div>

              <div className="px-4 text-[9px] text-slate-400 leading-tight space-y-2">
                <p><strong>[1] Hlatky MA, et al. (1989).</strong> DASI Formula: (0.43 x score) + 9.6.</p>
                <p><strong>[2] Tanaka/Gulati:</strong> Predito baseado na idade (14.7 - 0.11 x idade).</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER FIXO */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-50 space-y-3">
        <button
          onClick={handleSave}
          className={`w-full py-5 rounded-[24px] font-black shadow-2xl flex items-center justify-center gap-3 transition-all ${
            isSaved ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:scale-[1.02]'
          }`}
        >
          {isSaved ? <CheckCircle2 size={20} /> : <Save size={20} className="text-emerald-400" />}
          {isSaved ? 'DADOS GRAVADOS' : 'GRAVAR CAPACIDADE METABÓLICA'}
        </button>
        
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
          className="w-full bg-white text-slate-600 py-4 rounded-[22px] font-bold border border-slate-200 flex items-center justify-center gap-3 text-sm shadow-lg hover:bg-slate-50 transition-colors"
        >
          AVALIAÇÃO DA FUNÇÃO DOS VASOS
          <ChevronRight size={18} className="text-indigo-500" />
        </button>
      </div>
    </div>
  );
};