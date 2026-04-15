import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Wind, Info, CheckCircle2, Clock, Zap, Save, ChevronLeft, BarChart3 } from 'lucide-react';
import { usePatient } from '../../../context/PatientContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const FatigabilityScales: React.FC = () => {
  const { testResults, updateTestResults } = usePatient(); 
  const navigate = useNavigate();
  const [mode, setMode] = useState<'rest' | 'exercise'>('rest');
  const [isSaved, setIsSaved] = useState(false);

  const scales = [
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

  const handleUpdateScale = (id: 'dyspnea' | 'fatigue', value: number) => {
    const currentScales = testResults.fatigabilityScales || {
      rest: { dyspnea: 0, fatigue: 0 },
      exercise: { dyspnea: 0, fatigue: 0 }
    };

    updateTestResults({
      fatigabilityScales: {
        ...currentScales,
        [mode]: {
          ...currentScales[mode],
          [id]: value
        }
      }
    });
    setIsSaved(false);
  };

  const handleSaveAll = () => {
    setIsSaved(true);
    toast.success(`Dados de ${mode === 'rest' ? 'Repouso' : 'Exercício'} salvos!`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-40">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic flex items-center gap-3">
            <BarChart3 className="text-indigo-600" /> BORG MODIFICADA
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Monitoramento de Esforço Percebido</p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-[28px] border border-slate-200 shadow-inner">
          <button
            onClick={() => { setMode('rest'); setIsSaved(false); }}
            className={`flex items-center gap-2 px-8 py-3 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all ${
              mode === 'rest' ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock size={14} /> Repouso
          </button>
          <button
            onClick={() => { setMode('exercise'); setIsSaved(false); }}
            className={`flex items-center gap-2 px-8 py-3 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all ${
              mode === 'exercise' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Zap size={14} className="text-amber-400" /> Exercício
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div 
          key={mode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="grid grid-cols-1 gap-6"
        >
          {scales.map((scale) => (
            <section key={scale.id} className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 space-y-8">
              <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-3xl ${mode === 'exercise' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    {scale.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none">{scale.name}</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{scale.subtitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-4xl font-black italic ${mode === 'exercise' ? 'text-amber-500' : 'text-indigo-600'}`}>
                    {testResults.fatigabilityScales?.[mode]?.[scale.id as 'dyspnea' | 'fatigue'] || 0}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {scale.levels.map((level) => {
                  const isSelected = (testResults.fatigabilityScales?.[mode]?.[scale.id as 'dyspnea' | 'fatigue']) === level.value;
                  return (
                    <button
                      key={level.value}
                      onClick={() => handleUpdateScale(scale.id as any, level.value)}
                      className={`relative py-5 rounded-[24px] border-2 transition-all flex flex-col items-center justify-center gap-1 group ${
                        isSelected 
                          ? 'bg-slate-900 border-slate-900 text-white scale-105 shadow-xl shadow-slate-200' 
                          : 'bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:border-slate-200'
                      }`}
                    >
                      <span className={`text-xl font-black italic ${isSelected ? 'text-white' : 'text-slate-800 group-hover:text-indigo-600'}`}>
                        {level.value}
                      </span>
                      <span className={`text-[7px] font-black uppercase tracking-tighter text-center px-1 ${isSelected ? 'text-white/50' : 'text-slate-400'}`}>
                        {level.label}
                      </span>
                      {isSelected && (
                        <motion.div layoutId={`dot-${scale.id}`} className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${level.color}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* RODAPÉ DE AÇÃO FIXO */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-50">
        <div className="bg-white/80 backdrop-blur-xl p-3 rounded-[32px] border border-white shadow-2xl flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-slate-50 text-slate-600 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
          >
            <ChevronLeft size={16} /> Voltar
          </button>
          
          <button
            onClick={handleSaveAll}
            className={`flex-[2] py-5 rounded-[24px] font-black shadow-lg flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest transition-all ${
              isSaved ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {isSaved ? <CheckCircle2 size={18} /> : <Save size={18} className="text-emerald-400" />}
            {isSaved ? 'GRAVADO' : `SALVAR ${mode.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
};