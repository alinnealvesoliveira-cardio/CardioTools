import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Save, Activity, Heart, Info, BookOpen } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../lib/supabase';

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
  const { patientInfo, setPatientInfo, testResults, setTestResults } = usePatient();
  const { user } = useAuth();
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const weight = parseFloat(patientInfo.weight?.toString() || '0');
  const height = parseFloat(patientInfo.height?.toString() || '0') / 100;
  const age = parseInt(patientInfo.age?.toString() || '0');
  const imc = weight > 0 && height > 0 ? weight / (height * height) : 0;
  const feve = Number(patientInfo.ejectionFraction) || 60;

  // Cálculo baseado em Myers et al. (Nomograma do VSAQ)
  const estimatedMETs = (selectedScore !== null && age > 0) 
    ? 4.7 + (0.97 * selectedScore) - (0.06 * age) - (imc > 25 ? (0.02 * (imc - 25)) : 0)
    : null;

  const predictedMETs = age > 0 ? 14.7 - (0.11 * age) : null;
  const percentage = (estimatedMETs && predictedMETs) ? (estimatedMETs / predictedMETs) * 100 : null;

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
    if (estimatedMETs === null) return;
    
    setTestResults({
      ...testResults,
      vsaq: {
        score: selectedScore || 0,
        estimatedMETs,
        predictedMETs: predictedMETs || 0,
        percentage: percentage || 0,
        interpretation: cbdf?.severity || "Normal",
        cif: cbdf ? { qualifier: cbdf.qualifier, severity: cbdf.severity } : undefined
      }
    });

    if (user) await logActivity(user.id, 'Finalizou VSAQ');
    setIsSaved(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-20">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">VSAQ + CBDF-1</h1>
        <p className="text-slate-500 text-sm italic">Veterans Specific Activity Questionnaire - Versão Validada Brasil.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Idade</label>
              <input type="number" value={patientInfo.age || ''} 
                onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })} 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Peso (kg)</label>
              <input type="number" value={patientInfo.weight || ''} 
                onChange={(e) => setPatientInfo({ ...patientInfo, weight: e.target.value })} 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">FEVE (%)</label>
              <div className="w-full p-3 bg-emerald-50 border border-emerald-100 rounded-xl font-bold text-emerald-700">
                {feve}%
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-3 relative overflow-hidden">
             <div className="bg-slate-50 p-3 rounded-xl flex gap-3 text-slate-600 text-[10px] mb-2 border border-slate-100">
              <Info className="w-4 h-4 shrink-0 text-emerald-500" />
              <p>Selecione a atividade que causaria <strong>fadiga ou falta de ar</strong> se realizada hoje.</p>
            </div>
            
            {VSAQ_ITEMS.map((item) => (
              <button 
                key={item.score}
                onClick={() => { setSelectedScore(item.score); setIsSaved(false); }}
                className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between text-left ${selectedScore === item.score ? 'border-emerald-600 bg-emerald-50' : 'border-slate-50 bg-white hover:border-slate-200'}`}
              >
                <p className={`text-sm font-bold ${selectedScore === item.score ? 'text-emerald-900' : 'text-slate-700'}`}>{item.description}</p>
                <span className={`text-xs font-black px-3 py-1 rounded-full ${selectedScore === item.score ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="sticky top-24 space-y-4">
            {estimatedMETs && (
              <>
                <div className="bg-emerald-600 text-white p-6 rounded-3xl shadow-xl text-center space-y-4 relative">
                  <span className="absolute top-3 right-3 text-[8px] opacity-30 font-serif italic">[1]</span>
                  <div>
                    <p className="text-[10px] uppercase font-black opacity-60 mb-1">METs Estimados</p>
                    <p className="text-6xl font-black leading-none">{estimatedMETs.toFixed(1)}</p>
                  </div>
                  <button onClick={handleSave}
                    className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${isSaved ? 'bg-white text-emerald-600' : 'bg-emerald-800 text-white hover:bg-emerald-900'}`}
                  >
                    {isSaved ? <CheckCircle2 /> : <Save />} {isSaved ? 'GRAVADO' : 'SALVAR'}
                  </button>
                </div>

                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-6">
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase text-emerald-400 mb-2">Qualificador CBDF-1</p>
                    <p className="text-3xl font-black">.{cbdf?.qualifier}</p>
                    <p className="text-xs text-slate-400 mb-4">{cbdf?.severity}</p>
                  </div>

                  {/* Referências Bibliográficas Discretas */}
                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <div className="flex items-center gap-1 text-slate-500">
                      <BookOpen size={10} />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Base Científica</span>
                    </div>
                    <p className="text-[8px] text-slate-500 leading-tight">
                      [1] <strong>Myers J, et al.</strong> (1994). Nomogram for estimating capacity from the VSAQ. <em>Circulation</em>.
                    </p>
                    <p className="text-[8px] text-slate-500 leading-tight">
                      [2] <strong>Araújo CGS, et al.</strong> (2011). Validação do VSAQ em Português para a população brasileira. <em>Arquivos Brasileiros de Cardiologia</em>.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};