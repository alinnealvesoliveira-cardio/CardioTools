import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Info, BookOpen, AlertCircle, CheckCircle2, 
  RotateCcw, ChevronRight, Hash 
} from 'lucide-react';
import { ScoreGroup } from '../../types';

interface GroupedScoreTemplateProps {
  title: string;
  groups: ScoreGroup[];
  interpretation: (totalScore: number) => {
    label: string;
    color: 'green' | 'yellow' | 'red';
    description: string;
  };
  pearls?: string[];
  pitfalls?: string[];
  reference?: string;
}

export const GroupedScoreTemplate: React.FC<GroupedScoreTemplateProps> = ({
  title,
  groups,
  interpretation,
  pearls,
  pitfalls,
  reference
}) => {
  const [scores, setScores] = useState<Record<string, number>>({});

  // Cálculo de progresso
  const totalItems = useMemo(() => groups.reduce((acc, g) => acc + g.items.length, 0), [groups]);
  const answeredItems = Object.keys(scores).length;
  const isComplete = answeredItems === totalItems;

  const totalScore = useMemo(() => {
    return Object.values(scores).reduce((acc: number, curr: number) => acc + curr, 0);
  }, [scores]);

  const result = interpretation(totalScore);

  const handleSelect = (itemId: string, score: number) => {
    setScores(prev => ({ ...prev, [itemId]: score }));
  };

  const reset = () => setScores({});

  const colorClasses = {
    green: 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-200',
    yellow: 'bg-amber-500 text-white border-amber-600 shadow-amber-200',
    red: 'bg-rose-500 text-white border-rose-600 shadow-rose-200'
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8 pb-32">
      <header className="flex justify-between items-start px-2">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase italic">
            {title}
          </h1>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${(answeredItems / totalItems) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {answeredItems}/{totalItems} Itens Respondidos
            </span>
          </div>
        </div>
        <button 
          onClick={reset}
          className="p-3 text-slate-400 hover:text-rose-500 transition-colors"
          title="Resetar Score"
        >
          <RotateCcw size={20} />
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-12">
          {groups.map((group, gIdx) => (
            <section key={gIdx} className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded italic">
                  G{gIdx + 1}
                </span>
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">
                  {group.title}
                </h2>
              </div>
              
              <div className="space-y-4">
                {group.items.map((item) => (
                  <div key={item.id} className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 space-y-6">
                    <p className="font-bold text-slate-800 text-lg leading-tight tracking-tight">
                      {item.question}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.options.map((option, oIdx) => {
                        const isSelected = scores[item.id] === option.score;
                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelect(item.id, option.score)}
                            className={`flex-1 min-w-[140px] text-left p-5 rounded-2xl transition-all border-2 relative overflow-hidden ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-md'
                                : 'border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-200'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[10px] font-black uppercase tracking-wider">
                                {option.label}
                              </span>
                              <span className={`text-xs font-black ${isSelected ? 'text-indigo-600' : 'text-slate-300'}`}>
                                +{option.score}
                              </span>
                            </div>
                            {option.description && (
                              <p className="text-[11px] leading-snug font-medium opacity-70 italic">
                                {option.description}
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-6 space-y-6">
            {/* Resultado de Impacto */}
            <motion.div
              initial={false}
              animate={isComplete ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0.8 }}
              className={`rounded-[40px] p-8 shadow-2xl transition-colors duration-500 border-b-8 ${
                isComplete ? colorClasses[result.color] : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <Hash className="opacity-50" size={24} />
                {isComplete && <CheckCircle2 className="animate-pulse" size={24} />}
              </div>
              
              <div className="text-7xl font-black italic tracking-tighter mb-4">
                {totalScore}
                <span className="text-xl ml-2 opacity-50 not-italic uppercase font-bold tracking-[0.1em]">Pts</span>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black italic leading-none uppercase">
                  {isComplete ? result.label : 'Aguardando Dados'}
                </h3>
                <p className="text-xs font-medium leading-relaxed opacity-90 italic">
                  {isComplete ? result.description : 'Preencha todos os critérios para obter a interpretação clínica.'}
                </p>
              </div>
            </motion.div>

            {/* Info Médica */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 space-y-8">
              {pearls && (
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest italic">
                    <Info size={14} fill="currentColor" className="text-white ring-1 ring-indigo-600 rounded-full" />
                    Pérolas Clínicas
                  </h4>
                  <ul className="space-y-3">
                    {pearls.map((p, i) => (
                      <li key={i} className="text-[11px] text-slate-500 font-medium leading-relaxed flex gap-2">
                        <ChevronRight size={12} className="shrink-0 text-slate-300 mt-0.5" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {reference && (
                <div className="pt-6 border-t border-slate-50">
                   <div className="flex gap-2 text-[9px] text-slate-400 italic leading-snug">
                    <BookOpen size={12} className="shrink-0" />
                    <span>REF: {reference}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};