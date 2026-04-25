import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Wind, BarChart3, Clock, Zap } from 'lucide-react';
import { usePatient } from '../../../context/PatientProvider';
import { FatigabilityResults } from '../../../types'; // Importe a interface do types.ts

// Tipos locais para configuração da UI
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
  const [mode, setMode] = useState<'rest' | 'exercise'>('rest');

  // Estado padrão caso não exista nada salvo
  const defaultState: FatigabilityResults = {
    rest: { dyspnea: 0, fatigue: 0 },
    exercise: { dyspnea: 0, fatigue: 0 }
  };

  const data = testResults.fatigability || defaultState;

  const handleUpdateScale = (id: ScaleID, value: number) => {
    // Atualização direta e imutável
    updateTestResults('fatigability', {
      ...data,
      [mode]: {
        ...data[mode],
        [id]: value
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-40">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic flex items-center gap-3">
          <BarChart3 className="text-emerald-600" /> BORG MODIFICADA
        </h1>
        
        {/* Toggle Mode */}
        <div className="flex bg-slate-200/50 p-2 rounded-[32px] border-2 border-slate-100">
          {(['rest', 'exercise'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex items-center gap-3 px-10 py-4 rounded-[26px] font-black uppercase tracking-widest transition-all ${
                mode === m ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500'
              }`}
            >
              {m === 'rest' ? <Clock size={16} /> : <Zap size={16} />}
              {m === 'rest' ? 'Repouso' : 'Esforço'}
            </button>
          ))}
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div key={mode} className="grid grid-cols-1 gap-6">
          {SCALES.map((scale) => {
            // Acesso direto e seguro
            const currentValue = data[mode][scale.id] ?? 0;

            return (
              <section key={scale.id} className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 space-y-8">
                <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-3xl bg-emerald-50 text-emerald-600">{scale.icon}</div>
                    <h2 className="text-lg font-black text-slate-800 uppercase">{scale.name}</h2>
                  </div>
                  <div className="text-5xl font-black italic text-slate-900">{currentValue}</div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {scale.levels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => handleUpdateScale(scale.id, level.value)}
                      className={`py-6 rounded-[24px] border-2 transition-all flex flex-col items-center justify-center ${
                        currentValue === level.value 
                          ? 'bg-slate-900 border-slate-900 text-white' 
                          : 'bg-slate-50 border-transparent hover:border-slate-200'
                      }`}
                    >
                      <span className="text-2xl font-black italic">{level.value}</span>
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};