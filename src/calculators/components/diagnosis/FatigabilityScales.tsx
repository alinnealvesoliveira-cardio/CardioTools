import React, { useState } from 'react';
import { Activity, Wind, Info, CheckCircle2, Clock, Zap, Save, ChevronLeft } from 'lucide-react'; // Adicionado ChevronLeft
import { usePatient } from '../../../context/PatientContext';
import { toast } from 'react-hot-toast';

export const FatigabilityScales: React.FC = () => {
  // 1. Verifique se no seu Context o nome é 'updateTestResults' ou 'updateTestResult'
  const { testResults, updateTestResults } = usePatient(); 
  const [mode, setMode] = useState<'rest' | 'exercise'>('rest');
  const [isSaved, setIsSaved] = useState(false);

  const scales = [
    {
      id: 'dyspnea',
      name: 'Escala de Dispneia (Borg Modificada)',
      description: 'Percepção subjetiva de falta de ar.',
      icon: <Wind className="w-5 h-5 text-blue-500" />,
      levels: [
        { value: 0, label: 'Nada', color: 'bg-emerald-500' },
        { value: 0.5, label: 'Muito, muito leve', color: 'bg-emerald-400' },
        { value: 1, label: 'Muito leve', color: 'bg-emerald-300' },
        { value: 2, label: 'Leve', color: 'bg-yellow-300' },
        { value: 3, label: 'Moderada', color: 'bg-yellow-400' },
        { value: 4, label: 'Um pouco intensa', color: 'bg-orange-300' },
        { value: 5, label: 'Intensa', color: 'bg-orange-400' },
        { value: 6, label: 'Muito intensa', color: 'bg-orange-500' },
        { value: 7, label: 'Muito intensa', color: 'bg-red-400' },
        { value: 8, label: 'Muito intensa', color: 'bg-red-500' },
        { value: 9, label: 'Muito, muito intensa', color: 'bg-red-600' },
        { value: 10, label: 'Máxima', color: 'bg-slate-900' },
      ]
    },
    {
      id: 'fatigue',
      name: 'Escala de Fadiga Muscular',
      description: 'Percepção subjetiva de cansaço nos membros inferiores.',
      icon: <Activity className="w-5 h-5 text-amber-500" />,
      levels: [
        { value: 0, label: 'Nada', color: 'bg-emerald-500' },
        { value: 1, label: 'Muito leve', color: 'bg-emerald-300' },
        { value: 2, label: 'Leve', color: 'bg-yellow-300' },
        { value: 3, label: 'Moderada', color: 'bg-yellow-400' },
        { value: 4, label: 'Um pouco intensa', color: 'bg-orange-300' },
        { value: 5, label: 'Intensa', color: 'bg-orange-400' },
        { value: 6, label: 'Muito intensa', color: 'bg-orange-500' },
        { value: 7, label: 'Muito intensa', color: 'bg-red-400' },
        { value: 8, label: 'Muito intensa', color: 'bg-red-500' },
        { value: 9, label: 'Muito, muito intensa', color: 'bg-red-600' },
        { value: 10, label: 'Máxima', color: 'bg-slate-900' },
      ]
    }
  ];

  const handleUpdateScale = (id: 'dyspnea' | 'fatigue', value: number) => {
    // PROTEÇÃO: Garante que o objeto existe antes de fazer o spread
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
    toast.success(`Dados de ${mode === 'rest' ? 'Repouso' : 'Exercício'} gravados!`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-40"> {/* pb-40 para não cobrir botões */}
      <header className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Fadigabilidade</h1>
            <p className="text-slate-500 text-sm font-medium">Avaliação subjetiva (Borg Modificada).</p>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-[20px] border border-slate-200 w-fit">
            <button
              onClick={() => { setMode('rest'); setIsSaved(false); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-[14px] text-xs font-black uppercase transition-all ${
                mode === 'rest' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              Repouso
            </button>
            <button
              onClick={() => { setMode('exercise'); setIsSaved(false); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-[14px] text-xs font-black uppercase transition-all ${
                mode === 'exercise' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Zap className="w-4 h-4" />
              Exercício
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {scales.map((scale) => (
          <section key={scale.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-50 rounded-2xl text-slate-800">
                {scale.icon}
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">{scale.name}</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{scale.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {scale.levels.map((level) => {
                const isSelected = (testResults.fatigabilityScales?.[mode]?.[scale.id as 'dyspnea' | 'fatigue']) === level.value;
                return (
                  <button
                    key={level.value}
                    onClick={() => handleUpdateScale(scale.id as any, level.value)}
                    className={`relative py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                      isSelected 
                        ? 'border-slate-900 bg-slate-900 text-white scale-105 z-10' 
                        : 'border-slate-50 bg-slate-50 text-slate-600 hover:border-slate-200'
                    }`}
                  >
                    <span className="text-base font-black">{level.value}</span>
                    <span className={`text-[7px] font-black uppercase text-center px-1 leading-none ${isSelected ? 'text-white/60' : 'text-slate-400'}`}>
                      {level.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        {/* INTERPRETAÇÃO (REDUZIDA) */}
        <div className="bg-slate-50 rounded-[32px] p-6 border border-slate-100">
           <div className="flex items-center gap-2 mb-4">
             <Info className="w-4 h-4 text-slate-400" />
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dica de Interpretação</h3>
           </div>
           <p className="text-xs text-slate-500 leading-relaxed font-medium">
             Dispneia alta ({'>'}4) com fadiga baixa indica limitação **central**. Fadiga alta com dispneia baixa indica limitação **periférica**.
           </p>
        </div>
      </div>

      {/* BOTÕES DE AÇÃO FIXOS (PADRÃO VASCULAR) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-50 flex gap-3">
        <button
          onClick={() => window.history.back()}
          className="flex-1 bg-white text-slate-900 py-5 rounded-[24px] font-black border border-slate-200 shadow-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <ChevronLeft size={16} /> Voltar
        </button>
        
        <button
          onClick={handleSaveAll}
          className={`flex-[2] py-5 rounded-[24px] font-black shadow-2xl flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest transition-all ${
            isSaved ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'
          }`}
        >
          <Save className={`w-5 h-5 ${isSaved ? 'text-white' : 'text-emerald-400'}`} />
          {isSaved ? 'Gravado!' : 'Salvar Borg'}
        </button>
      </div>
    </div>
  );
};