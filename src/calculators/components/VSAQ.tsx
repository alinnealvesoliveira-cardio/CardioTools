import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, BookOpen, Activity, AlertCircle, CheckCircle2, Save, Scale, Ruler } from 'lucide-react';
import { getCIFClassification } from '../../utils/cif';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../lib/supabase';
import { MedicationAlert } from '../../components/shared/MedicationAlert';

interface VSAQItem {
  score: number;
  label: string;
  question: string;
  description: string;
}

const VSAQ_ITEMS: VSAQItem[] = [
  { score: 1, label: "1 MET", question: "Você se cansa ao comer, vestir-se ou trabalhar em mesa?", description: "Comer, vestir-se, trabalhar em mesa." },
  { score: 2, label: "2 METs", question: "Você se cansa ao caminhar em terreno plano a 3,2 km/h?", description: "Caminhar em terreno plano a 3,2 km/h." },
  { score: 3, label: "3 METs", question: "Você se cansa ao caminhar em terreno plano a 4,0 km/h ou fazer tarefas domésticas leves?", description: "Caminhar em terreno plano a 4,0 km/h, tarefas domésticas leves." },
  { score: 4, label: "4 METs", question: "Você se cansa ao caminhar em terreno plano a 4,8 km/h ou fazer jardinagem leve?", description: "Caminhar em terreno plano a 4,8 km/h, jardinagem leve." },
  { score: 5, label: "5 METs", question: "Você se cansa ao caminhar em terreno plano a 5,6 km/h ou fazer tarefas domésticas pesadas?", description: "Caminhar em terreno plano a 5,6 km/h, tarefas domésticas pesadas." },
  { score: 6, label: "6 METs", question: "Você se cansa ao caminhar em terreno plano a 6,4 km/h ou pedalar a 16 km/h?", description: "Caminhar em terreno plano a 6,4 km/h, pedalar a 16 km/h." },
  { score: 7, label: "7 METs", question: "Você se cansa ao fazer um trote leve a 8,0 km/h ou jardinagem pesada?", description: "Trote leve a 8,0 km/h, jardinagem pesada." },
  { score: 8, label: "8 METs", question: "Você se cansa ao correr a 8,8 km/h ou pedalar a 19 km/h?", description: "Correr a 8,8 km/h, pedalar a 19 km/h." },
  { score: 9, label: "9 METs", question: "Você se cansa ao correr a 9,6 km/h ou fazer trabalho braçal pesado?", description: "Correr a 9,6 km/h, trabalho braçal pesado." },
  { score: 10, label: "10 METs", question: "Você se cansa ao correr a 11,2 km/h ou praticar natação?", description: "Correr a 11,2 km/h, natação." },
  { score: 11, label: "11 METs", question: "Você se cansa ao correr a 12,8 km/h?", description: "Correr a 12,8 km/h." },
  { score: 12, label: "12 METs", question: "Você se cansa ao correr a 14,4 km/h?", description: "Correr a 14,4 km/h." },
  { score: 13, label: "13 METs", question: "Você se cansa ao correr a 16,0 km/h?", description: "Correr a 16,0 km/h." },
];

export const VSAQ: React.FC = () => {
  const { patientInfo, medications, updateTestResults, updatePatientInfo } = usePatient();
  const { user } = useAuth();
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [noResponses, setNoResponses] = useState<Set<number>>(new Set());
  const [isSaved, setIsSaved] = useState(false);

  // Sincronização de dados antropométricos
  const weight = parseFloat(patientInfo.weight?.toString() || '0');
  const height = parseFloat(patientInfo.height?.toString() || '0') / 100;
  const age = parseInt(patientInfo.age?.toString() || '0');
  const imc = weight > 0 && height > 0 ? weight / (height * height) : 0;

  const calculateMETs = () => {
    if (selectedScore === null || age === 0) return null;
    
    // Equação Ajustada: Myers + Fator de Correção por IMC (quando disponível)
    let result = 4.7 + (0.97 * selectedScore) - (0.06 * age);
    
    // Se o IMC for alto (> 25), aplicamos um ajuste de precisão
    if (imc > 25) {
      result = result - (0.02 * (imc - 25));
    }
    
    return result;
  };

  const calculatePredictedMETs = () => {
    if (age === 0) return null;
    return 14.7 - (0.11 * age);
  };

  const estimatedMETs = calculateMETs();
  const predictedMETs = calculatePredictedMETs();
  const percentage = estimatedMETs && predictedMETs ? (estimatedMETs / predictedMETs) * 100 : null;
  const cif = estimatedMETs && predictedMETs ? getCIFClassification(estimatedMETs, predictedMETs) : null;

  const handleSave = async () => {
    if (estimatedMETs === null) return;
    updateTestResults({
      vsaq: {
        score: selectedScore || 0,
        estimatedMETs: estimatedMETs,
        predictedMETs: predictedMETs || 0,
        percentage: percentage || 0,
        interpretation: estimatedMETs < 5 ? "Muito Baixa" : estimatedMETs < 7 ? "Baixa" : "Normal",
        cif: cif ? { qualifier: cif.qualifier, severity: cif.severity } : undefined
      }
    });
    if (user) await logActivity(user.id, 'Finalizou VSAQ');
    setIsSaved(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">VSAQ + Antropometria</h1>
        <p className="text-slate-500 text-sm">Cálculo de METs corrigido por Idade e composição corporal.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* PAINEL DE DADOS - Peso, Altura e Idade */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Activity className="w-3 h-3" /> Idade
              </label>
              <input 
                type="number" 
                value={patientInfo.age || ''} 
                onChange={(e) => updatePatientInfo({ age: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 ring-indigo-500/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Scale className="w-3 h-3" /> Peso (kg)
              </label>
              <input 
                type="number" 
                value={patientInfo.weight || ''} 
                onChange={(e) => updatePatientInfo({ weight: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 ring-indigo-500/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Ruler className="w-3 h-3" /> Altura (cm)
              </label>
              <input 
                type="number" 
                value={patientInfo.height || ''} 
                onChange={(e) => updatePatientInfo({ height: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 ring-indigo-500/20"
              />
            </div>
          </div>

          {/* LISTA DE QUESTÕES */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
            {VSAQ_ITEMS.map((item) => (
              <div key={item.score} className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${selectedScore === item.score ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-50 bg-white'}`}>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">{item.question}</p>
                  <p className="text-[10px] text-indigo-500 font-bold tracking-widest uppercase">{item.label}</p>
                </div>
                <button 
                  onClick={() => { setSelectedScore(item.score); setIsSaved(false); }}
                  className={`px-6 py-2 rounded-xl font-bold text-xs transition-all ${selectedScore === item.score ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  SIM
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SIDEBAR DE RESULTADOS */}
        <div className="space-y-6">
          <div className="sticky top-24 space-y-4">
            {imc > 0 && (
              <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl border-b-4 border-indigo-500">
                <p className="text-[10px] uppercase font-bold text-slate-400 text-center mb-1">IMC Calculado</p>
                <p className="text-3xl font-black text-center text-indigo-400">{imc.toFixed(1)}</p>
              </div>
            )}

            {estimatedMETs && (
              <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 space-y-4">
                <div className="text-center">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">METs Corrigidos</p>
                  <p className="text-5xl font-black text-indigo-600">{estimatedMETs.toFixed(1)}</p>
                </div>
                <button 
                  onClick={handleSave}
                  disabled={isSaved}
                  className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${isSaved ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'}`}
                >
                  {isSaved ? <><CheckCircle2 /> GRAVADO</> : <><Save /> SALVAR NO RELATÓRIO</>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};