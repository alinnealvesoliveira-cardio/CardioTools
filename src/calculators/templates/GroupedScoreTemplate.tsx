import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
// Importações tipadas do seu arquivo types.ts
import { ScoreGroup, ScoreOption, ScoreItem } from '../../types';

// ==========================================
// 1. TIPAGEM E CONFIGURAÇÕES
// ==========================================

export interface Interpretation {
  label: string;
  color: 'green' | 'yellow' | 'red';
  description: string;
}

const COLOR_MAP: Record<Interpretation['color'], string> = {
  green: 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-200',
  yellow: 'bg-amber-500 text-white border-amber-600 shadow-amber-200',
  red: 'bg-rose-500 text-white border-rose-600 shadow-rose-200',
};

interface GroupedScoreTemplateProps {
  title: string;
  groups: ScoreGroup[];
  interpretation: (totalScore: number) => Interpretation;
  initialScores?: Record<string, number>;
  onScoreChange?: (scores: Record<string, number>, total: number) => void;
}

// ==========================================
// 2. SUB-COMPONENTES
// ==========================================

const ScoreHeader = ({ title, progress, onReset }: { title: string; progress: number; onReset: () => void }) => (
  <header className="flex justify-between items-start px-2">
    <div className="space-y-1">
      <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">{title}</h1>
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
          <motion.div className="h-full bg-indigo-500" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{Math.round(progress)}% Concluído</span>
      </div>
    </div>
    <button onClick={onReset} className="p-3 text-slate-400 hover:text-rose-500 transition-colors" aria-label="Limpar">
      <RotateCcw size={20} />
    </button>
  </header>
);

const ScoreItemCard = ({ 
  item, 
  selectedScore, 
  onSelect 
}: { 
  item: ScoreItem; 
  selectedScore?: number; 
  onSelect: (score: number) => void; 
}) => (
  <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 space-y-6">
    <p className="font-bold text-slate-800 text-lg leading-tight tracking-tight">{item.question}</p>
    <div className="flex flex-wrap gap-2">
      {item.options.map((option: ScoreOption, idx: number) => {
        const isSelected = selectedScore === option.score;
        return (
          <button
            key={idx}
            onClick={() => onSelect(option.score)}
            className={`flex-1 min-w-[140px] text-left p-5 rounded-2xl transition-all border-2 ${
              isSelected ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-md' : 'border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-200'
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider">{option.label}</span>
              <span className={`text-xs font-black ${isSelected ? 'text-indigo-600' : 'text-slate-300'}`}>+{option.score}</span>
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

// ==========================================
// 3. COMPONENTE PRINCIPAL
// ==========================================

export const GroupedScoreTemplate: React.FC<GroupedScoreTemplateProps> = ({ title, groups, interpretation, initialScores = {}, onScoreChange }) => {
  const [scores, setScores] = useState<Record<string, number>>(initialScores);

  const totalItems = useMemo(() => groups.reduce((acc, g) => acc + g.items.length, 0), [groups]);
  
  const totalScore = useMemo(() => Object.values(scores).reduce((acc, curr) => acc + curr, 0), [scores]);
  
  const progress = useMemo(() => (Object.keys(scores).length / totalItems) * 100, [scores, totalItems]);
  const isComplete = Object.keys(scores).length === totalItems;
  
  const result = useMemo(() => interpretation(totalScore), [totalScore, interpretation]);

  useEffect(() => {
    onScoreChange?.(scores, totalScore);
  }, [scores, totalScore, onScoreChange]);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8 pb-32">
      <ScoreHeader title={title} progress={progress} onReset={() => setScores({})} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-12">
          {groups.map((group, gIdx) => (
            <section key={gIdx} className="space-y-6">
              <div className="flex items-center gap-3">
                {/* Tipagem explícita i: ScoreItem */}
                <div className={`px-2 py-0.5 rounded italic text-[10px] font-black ${group.items.every((i: ScoreItem) => scores[i.id] !== undefined) ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'}`}>
                  G{gIdx + 1}
                </div>
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">{group.title}</h2>
              </div>
              <div className="space-y-4">
                {/* Tipagem explícita item: ScoreItem */}
                {group.items.map((item: ScoreItem) => (
                  <ScoreItemCard 
                    key={item.id} 
                    item={item} 
                    selectedScore={scores[item.id]}
                    onSelect={(score) => setScores(prev => ({ ...prev, [item.id]: score }))}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="lg:col-span-4">
          <motion.div
            className={`sticky top-6 rounded-[40px] p-8 shadow-2xl transition-colors duration-500 border-b-8 ${isComplete ? COLOR_MAP[result.color] : 'bg-slate-800 text-slate-400 border-slate-700'}`}
            animate={{ scale: isComplete ? 1 : 0.98 }}
          >
            <div className="text-7xl font-black italic tracking-tighter mb-4">
              {totalScore}<span className="text-xl ml-2 opacity-50 not-italic uppercase font-bold tracking-[0.1em]">Pts</span>
            </div>
            <h3 className="text-2xl font-black italic leading-none uppercase mb-2">{isComplete ? result.label : 'Aguardando'}</h3>
            <p className="text-xs font-medium leading-relaxed opacity-90 italic">
              {isComplete ? result.description : 'Preencha todos os itens para o cálculo.'}
            </p>
          </motion.div>
        </aside>
      </div>
    </div>
  );
};