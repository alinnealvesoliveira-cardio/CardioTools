import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Info, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
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

  const totalScore = useMemo(() => {
    return Object.values(scores).reduce((acc: number, curr: number) => acc + curr, 0);
  }, [scores]);

  const result = interpretation(totalScore);

  const handleSelect = (itemId: string, score: number) => {
    setScores(prev => ({ ...prev, [itemId]: score }));
  };

  const colorClasses = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200'
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {groups.map((group, gIdx) => (
            <section key={gIdx} className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">{group.title}</h2>
              <div className="space-y-6">
                {group.items.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
                    <p className="font-medium text-slate-800">{item.question}</p>
                    <div className="grid grid-cols-1 gap-2">
                      {item.options.map((option, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleSelect(item.id, option.score)}
                          className={`text-left p-3 rounded-xl transition-all border ${
                            scores[item.id] === option.score
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{option.label}</span>
                            <span className="text-xs font-bold px-2 py-1 rounded-lg bg-black/10">
                              {option.score} pts
                            </span>
                          </div>
                          {option.description && (
                            <p className={`text-xs mt-1 ${scores[item.id] === option.score ? 'text-emerald-50' : 'text-slate-400'}`}>
                              {option.description}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            {/* Result Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl p-6 border-2 shadow-lg ${colorClasses[result.color]}`}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold uppercase tracking-wider opacity-70">Resultado Total</span>
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-5xl font-black mb-2">{totalScore}</div>
              <div className="text-xl font-bold mb-2">{result.label}</div>
              <p className="text-sm opacity-90">{result.description}</p>
            </motion.div>

            {/* Pearls & Pitfalls */}
            {(pearls || pitfalls) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
                {pearls && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                      <Info className="w-4 h-4" />
                      Pérolas Clínicas
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                      {pearls.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                )}
                {pitfalls && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
                      <AlertCircle className="w-4 h-4" />
                      Armadilhas
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                      {pitfalls.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Reference */}
            {reference && (
              <div className="text-[10px] text-slate-400 flex gap-2 italic">
                <BookOpen className="w-3 h-3 flex-shrink-0" />
                {reference}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
