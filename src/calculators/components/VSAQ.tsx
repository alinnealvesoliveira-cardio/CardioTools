import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Save, 
  Heart, 
  Info, 
  BookOpen, 
  ChevronRight,
  Activity as ActivityIcon 
} from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface VSAQItem {
  score: number;
  label: string;
  description: string;
}

const VSAQ_ITEMS: VSAQItem[] = [
  { score: 1, label: "1 MET", description: "Comer, vestir-se ou trabalhar em mesa." },
  { score: 2, label: "2 METs", description: "Caminhar em terreno plano a 3,2 km/h." },
  { score: 3, label: "3 METs", description: "Caminhar em terreno plano a 4,0 km/h ou tarefas domésticas leves." },
  { score: 4, label: "4 METs", description: "Caminhar em terreno plano a 4,8 km/h ou jardinagem leve." },
  { score: 5, label: "5 METs", description: "Caminhar em terreno plano a 5,6 km/h ou tarefas domésticas pesadas." },
  { score: 6, label: "6 METs", description: "Caminhar em terreno plano a 6,4 km/h ou pedalar a 16 km/h." },
  { score: 7, label: "7 METs", description: "Trote leve a 8,0 km/h ou jardinagem pesada." },
  { score: 8, label: "8 METs", description: "Correr a 8,8 km/h ou pedalar a 19 km/h." },
  { score: 9, label: "9 METs", description: "Correr a 9,6 km/h ou trabalho braçal pesado." },
  { score: 10, label: "10 METs", description: "Correr a 11,2 km/h ou praticar natação." },
  { score: 11, label: "11 METs", description: "Correr a 12,8 km/h." },
  { score: 12, label: "12 METs", description: "Correr a 14,4 km/h." },
  { score: 13, label: "13 METs", description: "Correr a 16,0 km/h." },
];

export const VSAQ: React.FC = () => {
  const { patientInfo, updateTestResults } = usePatient();
  const { user } = useAuth();
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Extração de dados para o Nomograma
  const weight = parseFloat(patientInfo.weight?.toString() || '0');
  const height = parseFloat(patientInfo.height?.toString() || '0') / 100;
  const age = parseInt(patientInfo.age?.toString() || '0');
  const imc = weight > 0 && height > 0 ? weight / (height * height) : 0;
  const feve = Number(patientInfo.ejectionFraction) || 60;

  // Cálculo baseado em Myers et al. (Nomograma do VSAQ)
  // Ajuste para IMC > 25 conforme diretrizes de validação
  const estimatedMETs = (selectedScore !== null && age > 0) 
    ? 4.7 + (0.97 * selectedScore) - (0.06 * age) - (imc > 25 ? (0.02 * (imc - 25)) : 0)
    : 0;

  const predictedMETs = age > 0 ? 14.7 - (0.11 * age) : 10;
  const percentage = predictedMETs > 0 ? (estimatedMETs / predictedMETs) * 100 : 0;

  const getCBDF = () => {
    if (percentage < 25 || feve < 30) return { qualifier: 4, severity: "Deficiência Completa", color: "#ef4444" };
    if (percentage < 50 || feve < 40) return { qualifier: 3, severity: "Deficiência Grave", color: "#f97316" };
    if (percentage < 75) return { qualifier: 2, severity: "Deficiência Moderada", color: "#eab308" };
    if (percentage < 95) return { qualifier: 1, severity: "Deficiência Leve", color: "#10b981" };
    return { qualifier: 0, severity: "Sem Deficiência", color: "#059669" };
  };

  const cbdf = getCBDF();

  const handleSave = async () => {
    if (selectedScore === null) {
      toast.error("Selecione uma atividade limitante");
      return;
    }
    
    updateTestResults({
      vsaq: {
        score: selectedScore,
        estimatedMETs,
        predictedMETs,
        percentage,
        interpretation: cbdf.severity,
        cif: { qualifier: cbdf.qualifier, severity: cbdf.severity }
      }
    });

    if (user) await logActivity(user.id, 'Finalizou VSAQ');
    setIsSaved(true);
    toast.success("VSAQ gravado com sucesso!");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-48">
      <header className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Questionário VSAQ</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
            Veterans Specific Activity Questionnaire + CBDF-1
          </p>
        </div>
        <div className="bg-indigo-50 px-4 py-2 rounded-2xl flex items-center gap-2">
            <Heart className="text-indigo-600 animate-pulse" size={18} />
            <span className="text-sm font-black text-indigo-700">{feve}% <span className="text-[10px] opacity-60 uppercase">FEVE</span></span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Seção de Seleção de METs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-blue-50 p-5 rounded-2xl flex gap-3 border border-blue-100 mb-4">
            <Info className="w-5 h-5 shrink-0 text-blue-500" />
            <p className="text-blue-900 text-xs leading-relaxed font-semibold">
              Instrução: Identifique a atividade que, se realizada hoje, causaria <strong>fadiga, cansaço excessivo ou falta de ar</strong>.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {VSAQ_ITEMS.map((item) => (
              <button 
                key={item.score}
                onClick={() => { setSelectedScore(item.score); setIsSaved(false); }}
                className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between text-left group ${
                  selectedScore === item.score 
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-md' 
                    : 'border-slate-50 bg-white hover:border-slate-200'
                }`}
              >
                <div>
                  <p className={`text-xs font-bold leading-tight ${selectedScore === item.score ? 'text-emerald-900' : 'text-slate-600'}`}>
                    {item.description}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-xl text-[10px] font-black transition-colors ${
                  selectedScore === item.score ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                }`}>
                  {item.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Painel Lateral de Resultados */}
        <aside className="space-y-4">
          <div className="sticky top-6 space-y-4">
            <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-8">
                <div className="text-center">
                  <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">METs pelo Nomograma</p>
                  <p className="text-7xl font-black text-emerald-400 tabular-nums">
                    {selectedScore ? estimatedMETs.toFixed(1) : '--'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2">Predito: {predictedMETs.toFixed(1)} METs</p>
                </div>

                {selectedScore && (
                  <div className="bg-white/5 border-l-4 p-5 rounded-r-2xl space-y-1" style={{ borderColor: cbdf.color }}>
                    <p className="text-[10px] uppercase font-black text-slate-400">Classificação CBDF</p>
                    <p className="text-xl font-black text-white leading-tight">.{cbdf.qualifier} — {cbdf.severity}</p>
                    <p className="text-[11px] text-slate-500 italic">{percentage.toFixed(0)}% da capacidade esperada</p>
                  </div>
                )}

                <div className="pt-6 border-t border-white/5 space-y-2">
                  <div className="flex items-center gap-1 text-slate-500 mb-1">
                    <BookOpen size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Referências</span>
                  </div>
                  <p className="text-[8px] text-slate-600 leading-tight">
                    [1] <strong>Myers J, et al.</strong> Nomogram for VSAQ. <em>Circulation</em>.
                  </p>
                  <p className="text-[8px] text-slate-600 leading-tight">
                    [2] <strong>Araújo CGS, et al.</strong> Validação Brasileira. <em>Arq Bras Cardiol</em>.
                  </p>
                </div>
              </div>
              
              <ActivityIcon size={150} className="absolute -bottom-10 -right-10 text-white/[0.02] rotate-12" />
            </div>
          </div>
        </aside>
      </div>

      {/* RODAPÉ FIXO DE NAVEGAÇÃO */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-50 space-y-3">
        <button
          onClick={handleSave}
          className={`w-full py-5 rounded-[24px] font-black shadow-2xl flex items-center justify-center gap-3 transition-all ${
            isSaved ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:scale-[1.02]'
          }`}
        >
          {isSaved ? <CheckCircle2 size={20} /> : <Save size={20} className="text-emerald-400" />}
          {isSaved ? 'VSAQ GRAVADO' : 'SALVAR CAPACIDADE METABÓLICA'}
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