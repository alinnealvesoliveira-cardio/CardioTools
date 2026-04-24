import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Wind, BarChart3, Clock, Zap, Save, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { usePatient } from '../../../context/PatientProvider';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

type ScaleID = 'dyspnea' | 'fatigue';

interface ScaleLevel {
  value: number;
  label: string;
  color: string;
}

interface ScaleDefinition {
  id: ScaleID;
  name: string;
  subtitle: string;
  description: string;
  icon: React.JSX.Element;
  levels: ScaleLevel[];
}

interface FatigabilityData {
  dyspnea: number;
  fatigue: number;
}

interface FatigabilityState {
  rest: FatigabilityData;
  exercise: FatigabilityData;
}

const SCALES: ScaleDefinition[] = [
  {
    id: 'dyspnea',
    name: 'Escala de Dispneia',
    subtitle: 'Borg Modificada',
    description: 'Percepção subjetiva de falta de ar.',
    icon: <Wind className="w-5 h-5" />,
    levels: [
      { value: 0, label: 'Nada', color: 'bg-emerald-500' },
      { value: 0.5, label: 'Muito leve', color: 'bg-emerald-400' },
      { value: 1, label: 'Muito leve', color: 'bg-emerald-300' },
      { value: 2, label: 'Leve', color: 'bg-yellow-300' },
      { value: 3, label: 'Moderada', color: 'bg-yellow-400' },
      { value: 4, label: 'Intensa +', color: 'bg-orange-300' },
      { value: 5, label: 'Intensa', color: 'bg-orange-400' },
      { value: 6, label: 'Muito +', color: 'bg-orange-500' },
      { value: 7, label: 'Muito +', color: 'bg-red-400' },
      { value: 8, label: 'Muito +', color: 'bg-red-500' },
      { value: 9, label: 'Extrema', color: 'bg-red-600' },
      { value: 10, label: 'Máxima', color: 'bg-slate-900' },
    ]
  },
  {
    id: 'fatigue',
    name: 'Fadiga Muscular',
    subtitle: 'Membros Inferiores',
    description: 'Percepção subjetiva de cansaço em MMII.',
    icon: <Activity className="w-5 h-5" />,
    levels: [
      { value: 0, label: 'Nada', color: 'bg-emerald-500' },
      { value: 1, label: 'Muito leve', color: 'bg-emerald-300' },
      { value: 2, label: 'Leve', color: 'bg-yellow-300' },
      { value: 3, label: 'Moderada', color: 'bg-yellow-400' },
      { value: 4, label: 'Intensa +', color: 'bg-orange-300' },
      { value: 5, label: 'Intensa', color: 'bg-orange-400' },
      { value: 6, label: 'Muito +', color: 'bg-orange-500' },
      { value: 7, label: 'Muito +', color: 'bg-red-400' },
      { value: 8, label: 'Muito +', color: 'bg-red-500' },
      { value: 9, label: 'Extrema', color: 'bg-red-600' },
      { value: 10, label: 'Máxima', color: 'bg-slate-900' },
    ]
  }
];

export const FatigabilityScales: React.FC = () => {
  const { testResults, updateTestResults } = usePatient(); 
  const navigate = useNavigate();
  const [mode, setMode] = useState<'rest' | 'exercise'>('rest');
  const [isSaved, setIsSaved] = useState(false);

  const handleUpdateScale = (id: ScaleID, value: number) => {
    const currentScales: FatigabilityState = testResults.fatigability || {
      rest: { dyspnea: 0, fatigue: 0 },
      exercise: { dyspnea: 0, fatigue: 0 }
    };

    updateTestResults('fatigability', {
              ...currentScales,
        [mode]: {
          ...currentScales[mode],
          [id]: value
        }
      
    });
    setIsSaved(false);
  };

  const handleSaveAll = () => {
    setIsSaved(true);
    toast.success(`Dados de ${mode === 'rest' ? 'Repouso' : 'Esforço'} salvos!`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-40">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic flex items-center gap-3">
            <BarChart3 className="text-emerald-600" /> BORG MODIFICADA
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Monitoramento de Esforço Percebido</p>
        </div>

        <div className="flex bg-slate-200/50 p-2 rounded-[32px] border-2 border-slate-100 shadow-inner">
          {(['rest', 'exercise'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setIsSaved(false); }}
              className={`flex items-center gap-3 px-10 py-4 rounded-[26px] text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                mode === m 
                  ? (m === 'rest' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/40 scale-105 animate-pulse' : 'bg-orange-500 text-white shadow-xl shadow-orange-500/40 scale-105 animate-pulse')
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {m === 'rest' ? <Clock size={16} /> : <Zap size={16} />} 
              {m === 'rest' ? 'Repouso' : 'Esforço'}
            </button>
          ))}
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 gap-6">
          {SCALES.map((scale) => (
            <section key={scale.id} className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 space-y-8">
              <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-3xl ${mode === 'exercise' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {scale.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none">
                      {scale.name} <span className="text-[10px] text-slate-400 ml-2 italic">({mode === 'rest' ? 'Repouso' : 'Esforço'})</span>
                    </h2>
                  </div>
                </div>
                <div className="text-5xl font-black italic text-slate-900">
                  {testResults.fatigability?.[mode]?.[scale.id] ?? 0}
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {scale.levels.map((level) => {
                  const currentValue = testResults.fatigability?.[mode]?.[scale.id] ?? 0;
                  const isSelected = currentValue === level.value;
                  return (
                    <button
                      key={level.value}
                      onClick={() => handleUpdateScale(scale.id, level.value)}
                      className={`relative py-6 rounded-[24px] border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                        isSelected ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-transparent hover:bg-white'
                      }`}
                    >
                      <span className="text-2xl font-black italic">{level.value}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};