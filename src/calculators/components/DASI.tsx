import React, { useState } from 'react';
import { 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  Save, 
  Activity as ActivityIcon,
  LayoutDashboard
} from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { logActivity } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

const DASI_QUESTIONS = [
  { id: 1, text: "Cuidar de si mesmo (comer, vestir-se, banhar-se)?", weight: 2.75 },
  { id: 2, text: "Andar dentro de casa?", weight: 1.75 },
  { id: 3, text: "Andar um quarteirão ou dois em terreno plano?", weight: 2.75 },
  { id: 4, text: "Subir um lance de escadas ou subir uma ladeira?", weight: 5.50 },
  { id: 5, text: "Correr uma curta distância?", weight: 8.00 },
  { id: 6, text: "Fazer trabalhos leves em casa (limpar pó, lavar louça)?", weight: 2.70 },
  { id: 7, text: "Fazer trabalhos moderados em casa (aspirador, carregar compras)?", weight: 3.50 },
  { id: 8, text: "Fazer trabalhos pesados em casa (esfregar chão, mover móveis)?", weight: 8.00 },
  { id: 9, text: "Fazer trabalhos de quintal (rastelar, podar, cortar grama)?", weight: 4.50 },
  { id: 11, text: "Atividades recreativas moderadas (dança, boliche)?", weight: 6.00 },
  { id: 12, text: "Esportes extenuantes (natação, corrida, tênis)?", weight: 7.50 }
];

export const DASI: React.FC = () => {
  const { patientInfo, updateTestResults } = usePatient();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [isSaved, setIsSaved] = useState(false);

  // --- SAFEGUARDS ---
  const age = parseInt(patientInfo?.age?.toString() || '65');
  const feve = Number(patientInfo?.ejectionFraction) || 60;

  const calculateResults = () => {
    const score = DASI_QUESTIONS.reduce((acc, q) => acc + (answers[q.id] ? q.weight : 0), 0);
    const vo2 = (0.43 * score) + 9.6;
    const mets = vo2 / 3.5;
    return { score, vo2, mets };
  };

  const { score, vo2, mets } = calculateResults();
  
  // Predito Gulati para Mulheres ou Tanaka para Homens (Simplificado para 14.7 - 0.11 * idade)
  const predictedMETs = age > 0 ? (14.7 - (0.11 * age)) : 10;
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
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-64 relative">
      <div className="bg-white rounded-[40px] shadow-sm overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter italic flex items-center gap-3">
              DASI
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
              Duke Activity Status Index
            </p>
          </div>
          <div className="bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/20">
             <span className="text-emerald-400 font-black text-xs uppercase tracking-widest">Capacidade Funcional</span>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Listagem de Atividades */}
          <div className="space-y-6">
            <div className="bg-indigo-50 p-5 rounded-3xl flex gap-3 border border-indigo-100">
              <Info className="w-5 h-5 shrink-0 text-indigo-500" />
              <p className="text-indigo-900 text-[11px] leading-tight font-bold uppercase">
                Marque apenas as atividades que o paciente realiza sem sintomas limitantes.
              </p>
            </div>

            <div className="space-y-2">
              {DASI_QUESTIONS.map((q) => (
                <button
                  key={q.id}
                  onClick={() => { setAnswers(prev => ({ ...prev, [q.id]: !prev[q.id] })); setIsSaved(false); }}
                  className={`w-full flex items-center justify-between p-5 rounded-[24px] border-2 transition-all active:scale-[0.98] ${
                    answers[q.id] 
                      ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                      : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'
                  }`}
                >
                  <span className={`text-left text-xs font-black tracking-tight leading-tight pr-4 ${answers[q.id] ? 'text-indigo-900' : 'text-slate-600'}`}>
                    {q.text}
                  </span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    answers[q.id] ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 bg-white'
                  }`}>
                    {answers[q.id] && <CheckCircle2 size={14} />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Resultados */}
          <div className="space-y-6">
            <div className="sticky top-6 space-y-4">
              <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl space-y-8 relative overflow-hidden">
                <div className="grid grid-cols-2 gap-6 relative z-10">
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">METs Estimados</p>
                    <p className="text-5xl font-black text-emerald-400 italic">{mets.toFixed(1)}</p>
                  </div>
                  <div className="text-center border-l border-white/10">
                    <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">% do Predito</p>
                    <p className="text-5xl font-black text-emerald-400">{percentage.toFixed(0)}<span className="text-xl">%</span></p>
                  </div>
                </div>

                <div className="bg-white/5 border-l-4 p-6 rounded-r-2xl space-y-1 relative z-10" style={{ borderColor: cbdf.color }}>
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Status Funcional (CBDF)</p>
                  <p className="text-xl font-black text-white leading-tight">.{cbdf.qualifier} — {cbdf.severity}</p>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tighter">Impacto Funcional de {cbdf.range}</p>
                </div>

                <div className="space-y-3 relative z-10">
                  {mets < 4 && (
                    <div className="flex items-start gap-3 text-[10px] text-orange-200 bg-orange-500/10 p-4 rounded-2xl border border-orange-500/20 font-bold uppercase">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-orange-400" /> 
                      Risco Perioperatório Elevado (&lt; 4 METs)
                    </div>
                  )}
                  {score <= 23 && (
                    <div className="flex items-start gap-3 text-[10px] text-red-200 bg-red-500/10 p-4 rounded-2xl border border-red-500/20 font-bold uppercase">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" /> 
                      Prognóstico Reservado (Score &le; 23)
                    </div>
                  )}
                </div>
                
                <ActivityIcon size={140} className="absolute -bottom-10 -right-10 text-white/[0.03] rotate-12" />
              </div>

              <div className="px-6 py-4 bg-slate-50 rounded-[24px] border border-slate-100">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Fórmulas Clínicas</p>
                <p className="text-[9px] text-slate-500 leading-tight italic">
                  VO2 = (0.43 x Score) + 9.6. MET = VO2 / 3.5. Predito ajustado por idade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-[999] space-y-3">
        <button
          onClick={handleSave}
          className={`w-full py-5 rounded-[24px] font-black shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 ${
            isSaved ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'
          }`}
        >
          {isSaved ? <CheckCircle2 size={24} /> : <Save size={24} className="text-emerald-400" />}
          <span className="text-[11px] uppercase tracking-widest">{isSaved ? 'DASI SALVO' : 'GRAVAR CAPACIDADE FUNCIONAL'}</span>
        </button>
        
        <button
          onClick={() => navigate('/dashboard')} 
          className="w-full bg-white/90 backdrop-blur-md text-slate-900 py-5 rounded-[24px] font-black border border-slate-200 shadow-xl flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest"
        >
          <LayoutDashboard size={18} /> PAINEL DE MÓDULOS
        </button>
      </div>
    </div>
  );
};