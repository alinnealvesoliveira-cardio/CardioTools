import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Square, RotateCcw, 
  BookOpen, Save, CheckCircle2, Heart, Activity 
} from 'lucide-react';

import { getCIFClassification } from '../../utils/cif';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../lib/supabase';
import { MedicationAlert } from '../../components/shared/MedicationAlert';
import { CIFData } from '../../types';

export interface InterpretationResult {
  label: string;
  color: 'green' | 'yellow' | 'red' | 'slate';
  description: string;
  title?: string;
}

interface TimedTestTemplateProps {
  title: string;
  description: string;
  timerDuration?: number; 
  hasCounter?: boolean;
  counterLabel?: string;
  interpretation: (time: number, count: number) => InterpretationResult | InterpretationResult[];
  pearls?: string[];
  pitfalls?: string[];
  reference?: string;
  children?: React.ReactNode;
  predictedValue?: number | null;
  observedValueOverride?: number | null;
  invertCIFRatio?: boolean; 
  onSave?: (data: { 
    time: number; 
    count: number; 
    results: InterpretationResult[]; 
    cif: CIFData | null; 
    hr?: { pre: number; post: number } 
  }) => void;
}

export const TimedTestTemplate: React.FC<TimedTestTemplateProps> = ({
  title,
  description,
  timerDuration,
  hasCounter,
  counterLabel = "Repetições",
  interpretation,
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
  const [preHR, setPreHR] = useState('');
  const [postHR, setPostHR] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  
  // Ref para o intervalo
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive) {
      const startTime = Date.now() - (timerDuration ? ((timerDuration * 1000) - time) : time);
      
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        
        if (timerDuration) {
          const remaining = (timerDuration * 1000) - elapsed;
          if (remaining <= 0) {
            setTime(0);
            setIsActive(false);
          } else {
            setTime(remaining);
          }
        } else {
          setTime(elapsed);
        }
      }, 10);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive]);

  const toggleTimer = () => {
    setIsActive(!isActive);
    setIsSaved(false);
  };

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

  const observedValue: number = Number(observedValueOverride ?? (hasCounter ? count : time / 1000));
  const pred: number = predictedValue ?? 0;

  const cifObserved = (invertCIFRatio && observedValue > 0 && pred > 0) 
    ? (pred * (pred / observedValue))
    : observedValue;

  const cifResult = (pred > 0 && observedValue >= 0) 
    ? getCIFClassification(cifObserved, pred) 
    : null;

  const cif: CIFData | null = cifResult ? {
    qualifier: (cifResult as any).severity || 0,
    interpretation: (cifResult as any).description || (cifResult as any).interpretation || "",
    severity: String((cifResult as any).severity || 0)
  } : null;

  const percentageDisplay = (pred > 0 && observedValue > 0)
    ? (invertCIFRatio ? (pred / observedValue) : (observedValue / pred)) * 100
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
        hr: { pre: parseInt(preHR) || 0, post: parseInt(postHR) || 0 }
      });
      if (user) await logActivity(user.id, `Realizou teste: ${title}`);
      setIsSaved(true);
    }
  };

  const colorClasses = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8 pb-32 font-sans">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">{title}</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{description}</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaved || (hasCounter ? count === 0 : time === 0)}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black transition-all shadow-xl uppercase text-xs tracking-widest ${
            isSaved ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:scale-105 active:scale-95 disabled:opacity-30'
          }`}
        >
          {isSaved ? <><CheckCircle2 size={18} /> Gravado</> : <><Save size={18} /> Salvar</>}
        </button>
      </header>

      <MedicationAlert type="betablockers" active={medications.betablockers} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-white rounded-[44px] p-10 shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-10 relative overflow-hidden">
            <div className="text-8xl font-black text-slate-900 tabular-nums tracking-tighter italic">
              {formatTime(time)}
            </div>
            <div className="flex gap-4 w-full max-w-md">
              <button
                onClick={toggleTimer}
                className={`flex-1 flex items-center justify-center gap-3 py-6 rounded-[28px] font-black uppercase tracking-widest transition-all shadow-2xl ${
                  isActive ? 'bg-rose-500 text-white' : 'bg-indigo-600 text-white'
                }`}
              >
                {isActive ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                {isActive ? 'Parar' : 'Iniciar'}
              </button>
              <button onClick={reset} className="px-8 rounded-[28px] bg-slate-100 text-slate-400 border border-slate-200">
                <RotateCcw size={24} />
              </button>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 space-y-6">
               <div className="flex items-center gap-3">
                <Heart className="text-rose-500" size={20} />
                <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-widest">FC (BPM)</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" value={preHR} onChange={(e) => setPreHR(e.target.value)} placeholder="PRÉ" className="w-full p-4 bg-slate-50 rounded-xl text-center font-bold" />
                <input type="number" value={postHR} onChange={(e) => setPostHR(e.target.value)} placeholder="PÓS" className="w-full p-4 bg-slate-50 rounded-xl text-center font-bold" />
              </div>
            </div>
            {hasCounter && (
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 space-y-6">
                <div className="flex items-center gap-3">
                  <Activity className="text-indigo-500" size={20} />
                  <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-widest">{counterLabel}</h3>
                </div>
                <input type="number" value={count || ''} onChange={(e) => setCount(Math.max(0, parseInt(e.target.value) || 0))} className="w-full p-4 bg-slate-900 text-white rounded-xl text-center font-black text-2xl" />
              </div>
            )}
          </section>
          {children}
        </div>

        <aside className="lg:col-span-4 space-y-6">
          {results.map((res, idx) => (
            <div key={idx} className={`rounded-[32px] p-8 border-2 ${colorClasses[res.color]}`}>
              <h4 className="text-xl font-black uppercase mb-2">{res.label}</h4>
              <p className="text-xs italic opacity-80">{res.description}</p>
            </div>
          ))}
          {cif && (
            <div className="bg-slate-900 rounded-[40px] p-8 text-white">
              <div className="flex justify-between items-end border-b border-white/10 pb-4 mb-4">
                <span className="text-4xl font-black italic">Q{cif.qualifier}</span>
                <span className="text-xs font-bold text-slate-400">{percentageDisplay.toFixed(1)}% do Predito</span>
              </div>
              <p className="text-sm font-bold italic">{cif.interpretation}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};