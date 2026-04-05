import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Wind, Info, AlertCircle, CheckCircle2, Clock, Zap, Save } from 'lucide-react';
import { usePatient } from '../../../context/PatientContext';

export const FatigabilityScales: React.FC = () => {
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
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-24">
      <header className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Escalas de Fadigabilidade</h1>
            <p className="text-slate-500 text-sm">Avaliação subjetiva do esforço e sintomas limitantes.</p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-fit">
            <button
              onClick={() => setMode('rest')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'rest' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              Repouso
            </button>
            <button
              onClick={() => setMode('exercise')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'exercise' 
                  ? 'bg-vitality-lime text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Zap className="w-4 h-4" />
              Exercício
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {scales.map((scale) => (
          <section key={scale.id} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-50 rounded-2xl">
                {scale.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{scale.name}</h2>
                <p className="text-xs text-slate-500">{scale.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {scale.levels.map((level) => {
                const isSelected = (testResults.fatigabilityScales?.[mode]?.[scale.id as 'dyspnea' | 'fatigue'] || 0) === level.value;
                return (
                  <button
                    key={level.value}
                    onClick={() => handleUpdateScale(scale.id as any, level.value)}
                    className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${
                      isSelected 
                        ? 'border-slate-900 bg-slate-900 text-white shadow-lg scale-105 z-10' 
                        : 'border-slate-50 bg-slate-50 text-slate-600 hover:border-slate-200'
                    }`}
                  >
                    <div className="text-lg font-black">{level.value}</div>
                    <div className={`text-[8px] font-bold uppercase text-center leading-tight ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                      {level.label}
                    </div>
                    {!isSelected && (
                      <div className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${level.color}`} />
                    )}
                    {isSelected && (
                      <CheckCircle2 className="absolute top-2 right-2 w-3 h-3 text-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        <div className="flex justify-center pt-4">
          <button
            onClick={() => {
              // The data is already saved in the context via handleUpdateScale,
              // but we provide this button for explicit feedback as requested.
              setIsSaved(true);
              setTimeout(() => setIsSaved(false), 3000);
            }}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all shadow-lg ${
              isSaved 
                ? 'bg-emerald-500 text-white' 
                : 'bg-vitality-graphite text-white hover:opacity-90'
            }`}
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Escalas Salvas no Relatório
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar no Relatório Final
              </>
            )}
          </button>
        </div>

        <div className="bg-vitality-graphite rounded-3xl p-8 text-white space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-vitality-lime text-slate-900 rounded-xl">
              <Info className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Interpretação Clínica</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
                <Wind className="w-4 h-4" />
                Limitação Central
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Valores elevados de dispneia (Borg &gt; 4) com fadiga muscular baixa sugerem 
                limitação de origem cardiopulmonar ou ineficiência ventilatória.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest">
                <Activity className="w-4 h-4" />
                Limitação Periférica
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Valores elevados de fadiga muscular com dispneia controlada sugerem 
                descondicionamento periférico ou limitação por Doença Arterial Periférica (DAP).
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
              <AlertCircle className="w-5 h-5 text-vitality-lime shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-300 leading-relaxed">
                <strong>Nota Técnica:</strong> Estas escalas devem ser aplicadas preferencialmente 
                no pico do esforço durante os testes funcionais (TC6M, TD2M, TSL) para capturar a 
                "assinatura do esforço" do paciente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
