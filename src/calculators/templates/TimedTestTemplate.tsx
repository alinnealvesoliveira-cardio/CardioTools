import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Play, Square, RotateCcw, Plus, Minus, Info, AlertCircle, BookOpen, Save, CheckCircle2 } from 'lucide-react';
import { getCIFClassification } from '../../utils/cif';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../lib/supabase';
import { MedicationAlert } from '../../components/shared/MedicationAlert';

export interface InterpretationResult {
  label: string;
  color: 'green' | 'yellow' | 'red' | 'slate';
  description: string;
  title?: string;
}

interface TimedTestTemplateProps {
  title: string;
  description: string;
  timerDuration?: number; // in seconds, if null it's a stopwatch
  hasCounter?: boolean;
  counterLabel?: string;
  interpretation: (time: number, count: number) => InterpretationResult | InterpretationResult[];
  pearls?: string[];
  pitfalls?: string[];
  reference?: string;
  children?: React.ReactNode;
  predictedValue?: number | null;
  observedValueOverride?: number | null;
  invertCIFRatio?: boolean; // For tests where lower is better (like time)
  onSave?: (data: { time: number; count: number; results: InterpretationResult[]; cif: any; hr?: { pre: number; post: number } }) => void;
}

export const TimedTestTemplate: React.FC<TimedTestTemplateProps> = ({
  title,
  description,
  timerDuration,
  hasCounter,
  counterLabel = "Repetições",
  interpretation,
  pearls,
  pitfalls,
  reference,
  children,
  predictedValue,
  observedValueOverride,
  invertCIFRatio = false,
  onSave
}) => {
  const [time, setTime] = useState((timerDuration || 0) * 1000);
  const [isActive, setIsActive] = useState(false);
  const [count, setCount] = useState(0);
  const [preHR, setPreHR] = useState<string>('');
  const [postHR, setPostHR] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTime(prev => {
          if (timerDuration) {
            if (prev <= 0) {
              setIsActive(false);
              return 0;
            }
            return prev - 10;
          }
          return prev + 10;
        });
      }, 10);
      setIsSaved(false);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timerDuration]);

  const toggleTimer = () => setIsActive(!isActive);

  const reset = () => {
    setIsActive(false);
    setTime((timerDuration || 0) * 1000);
    setCount(0);
    setIsSaved(false);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const rawResults = interpretation(time / 1000, count);
  const results = Array.isArray(rawResults) ? rawResults : [rawResults];

  const observedValue = observedValueOverride !== undefined ? observedValueOverride : (hasCounter ? count : time / 1000);
  
  // For time-based tests (lower is better), we use (predicted / observed)
  // For rep-based tests (higher is better), we use (observed / predicted)
  const cifObserved = (invertCIFRatio && observedValue && observedValue > 0) 
    ? (predictedValue || 0) * ((predictedValue || 0) / observedValue)
    : observedValue;

  const cif = predictedValue && observedValue && observedValue > 0 
    ? getCIFClassification(cifObserved || 0, predictedValue) 
    : null;

  const percentageDisplay = predictedValue && observedValue && observedValue > 0
    ? (invertCIFRatio ? (predictedValue / observedValue) : (observedValue / predictedValue)) * 100
    : 0;

  const { medications } = usePatient();
  const { user } = useAuth();

  const handleSave = async () => {
    if (onSave) {
      onSave({ 
        time: time / 1000, 
        count, 
        results,
        cif,
        hr: {
          pre: parseInt(preHR) || 0,
          post: parseInt(postHR) || 0
        }
      });

      if (user) {
        await logActivity(user.id, `Finalizou Teste ${title}`);
      }
      
      setIsSaved(true);
    }
  };

  const colorClasses = {
    green: 'bg-vitality-lime/10 text-vitality-lime border-vitality-lime/20',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-vitality-risk/10 text-vitality-risk border-vitality-risk/20',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    emerald: 'bg-vitality-lime/10 text-vitality-lime border-vitality-lime/20'
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-24">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-slate-500 text-sm">{description}</p>
        </div>
        {onSave && (
          <button
            onClick={handleSave}
            disabled={isSaved || (hasCounter ? count === 0 : time === 0)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg ${
              isSaved 
                ? 'bg-vitality-lime text-slate-900 cursor-default' 
                : 'bg-vitality-graphite text-white hover:opacity-90 disabled:opacity-50'
            }`}
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Gravado
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Gravar no Relatório
              </>
            )}
          </button>
        )}
      </header>

      <MedicationAlert type="betablockers" active={medications.betablockers} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {children && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              {children}
            </div>
          )}
          {/* Timer Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-8">
            <div className="text-7xl font-mono font-bold text-slate-800 tabular-nums">
              {formatTime(time)}
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={toggleTimer}
                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all shadow-lg ${
                  isActive 
                    ? 'bg-vitality-risk text-white hover:bg-vitality-risk/90' 
                    : 'bg-vitality-lime text-slate-900 hover:bg-vitality-lime/90'
                }`}
              >
                {isActive ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                {isActive ? 'Parar' : 'Iniciar'}
              </button>
              
              <button
                onClick={reset}
                className="p-4 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all border border-slate-200"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Heart Rate Section */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-vitality-risk/10 rounded-xl text-vitality-risk">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Frequência Cardíaca (bpm)</p>
                <p className="text-sm text-slate-600">Resposta cronotrópica ao esforço.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">FC Pré-Teste</label>
                <input
                  type="number"
                  value={preHR}
                  onChange={(e) => setPreHR(e.target.value)}
                  placeholder="Repouso"
                  className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-vitality-lime focus:bg-white rounded-2xl text-lg font-bold outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">FC Pós-Teste</label>
                <input
                  type="number"
                  value={postHR}
                  onChange={(e) => setPostHR(e.target.value)}
                  placeholder="Pico"
                  className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-vitality-lime focus:bg-white rounded-2xl text-lg font-bold outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Counter Card */}
          {hasCounter && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-6">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{counterLabel}</span>
              <div className="flex items-center justify-center w-full">
                <input
                  type="number"
                  value={Number.isNaN(count) ? '' : count}
                  placeholder="0"
                  onChange={(e) => setCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="text-7xl font-black text-slate-800 tabular-nums w-full max-w-[200px] text-center bg-slate-50 rounded-2xl py-4 border-2 border-transparent focus:border-vitality-lime focus:bg-white outline-none transition-all"
                />
              </div>
              <p className="text-xs text-slate-400 italic">Digite o valor observado</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            {/* Result Cards */}
            {results.map((res, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-2xl p-6 border-2 shadow-lg ${colorClasses[res.color as keyof typeof colorClasses] || colorClasses.slate}`}
              >
                <div className="text-sm font-bold uppercase tracking-wider opacity-70 mb-2">
                  {res.title || "Interpretação"}
                </div>
                <div className="text-xl font-bold mb-2">{res.label}</div>
                <p className="text-sm opacity-90">{res.description}</p>
              </motion.div>
            ))}

            {/* CIF Classification */}
            {cif && (
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-3xl p-8 border-4 shadow-2xl transform scale-105 transition-all ${colorClasses[cif.color as keyof typeof colorClasses] || colorClasses.slate}`}
                >
                  <div className="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-3 text-center">Comprometimento Funcional (CIF/OMS)</div>
                  <div className="flex justify-between items-center mb-4 border-b border-current pb-4 opacity-80">
                    <div className="text-2xl font-black">Qualificador {cif.severity}</div>
                    <div className="text-sm font-black">{percentageDisplay.toFixed(1)}% do predito</div>
                  </div>
                  <div className="text-2xl font-black mb-2 text-center leading-tight">CIF/OMS</div>
                  <p className="text-sm font-medium opacity-80 text-center">Deficiência: {cif.deficiencyRange}</p>
                </motion.div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Cálculo do Percentual
                  </div>
                  <div className="text-xs text-slate-600 font-mono bg-white p-2 rounded-lg border border-slate-100 text-center">
                    {invertCIFRatio ? '% Predito = (Esp / Obs) × 100' : '% Predito = (Obs / Esp) × 100'}
                  </div>
                  <p className="text-[10px] text-slate-500 italic leading-tight">
                    O percentual do predito é calculado pela razão entre o valor observado e o valor esperado por equações de referência.
                  </p>
                </div>
              </div>
            )}

            {/* Clinical Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
              {pearls && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-vitality-lime font-bold text-sm">
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
                  <div className="flex items-center gap-2 text-vitality-risk font-bold text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Armadilhas
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                    {pitfalls.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              )}
            </div>

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
