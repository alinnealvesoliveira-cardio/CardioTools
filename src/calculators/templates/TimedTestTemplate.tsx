import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, RotateCcw, Save, CheckCircle2, Heart, Activity } from 'lucide-react';
import { getCIFClassification } from '../../utils/cif';
import { usePatient } from '../../context/PatientProvider';
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
  predictedValue?: number | null;
  observedValueOverride?: number | null;
  invertCIFRatio?: boolean;
  children?: React.ReactNode;
  onSave?: (data: {
    time: number;
    count: number;
    results: InterpretationResult[];
    cif: CIFData | null;
    hr: { pre: number; post: number };
  }) => void;
}

export const TimedTestTemplate: React.FC<TimedTestTemplateProps> = ({
  title,
  description,
  timerDuration = 0,
  hasCounter = false,
  counterLabel = "Repetições",
  interpretation,
  predictedValue = 0,
  observedValueOverride,
  invertCIFRatio = false,
  children,
  onSave
}) => {
  const [time, setTime] = useState(timerDuration * 1000);
  const [isActive, setIsActive] = useState(false);
  const [count, setCount] = useState(0);
  const [preHR, setPreHR] = useState('');
  const [postHR, setPostHR] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  
  // Utiliza ReturnType para evitar conflitos com o namespace NodeJS global
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const { medications } = usePatient();
  const { user } = useAuth();

  useEffect(() => {
    if (isActive) {
      const startTime = Date.now() - (timerDuration > 0 ? ((timerDuration * 1000) - time) : time);
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (timerDuration > 0) {
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
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, timerDuration]);

  const reset = () => {
    setIsActive(false);
    setTime(timerDuration * 1000);
    setCount(0);
    setIsSaved(false);
  };

  const rawResults = interpretation(time / 1000, count);
  const results = Array.isArray(rawResults) ? rawResults : [rawResults];
  const observedValue = Number(observedValueOverride ?? (hasCounter ? count : time / 1000));
  
  const cifObserved = (invertCIFRatio && observedValue > 0 && predictedValue && predictedValue > 0) 
    ? (predictedValue * (predictedValue / observedValue))
    : observedValue;

  const cifResult = (predictedValue && predictedValue > 0 && observedValue >= 0) 
    ? getCIFClassification(cifObserved, predictedValue) 
    : null;

  // Transformação segura para o tipo CIFData
  const cif: CIFData | null = cifResult ? {
  qualifier: cifResult.qualifier, // Mapeia o número (0, 1, 2, 3, 4)
  severity: cifResult.severity,   // Mapeia a string (ex: "Deficiência Leve")
  // Criamos uma interpretação concatenada, já que o objeto original não tem esse campo único
  interpretation: `${cifResult.severity} (Performance: ${cifResult.performanceRange})`
} : null;

  const handleSave = useCallback(async () => {
    if (onSave) {
      onSave({ 
        time: time / 1000, 
        count, 
        results,
        cif,
        hr: { pre: Number(preHR) || 0, post: Number(postHR) || 0 }
      });
      if (user) await logActivity(user.id, `Realizou teste: ${title}`);
      setIsSaved(true);
    }
  }, [onSave, time, count, results, cif, preHR, postHR, user, title]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8 pb-32 font-sans">
        <header className="flex justify-between items-center border-b pb-6">
            <div>
                <h1 className="text-4xl font-black uppercase text-slate-900">{title}</h1>
                <p className="text-slate-500 text-sm">{description}</p>
            </div>
            <button 
                onClick={handleSave} 
                disabled={isSaved} 
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors ${
                    isSaved ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
            >
                {isSaved ? <><CheckCircle2 size={18} /> Salvo</> : <><Save size={18} /> Salvar</>}
            </button>
        </header>

        <MedicationAlert type="betablockers" active={medications?.betablockers ?? false} />

        <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-6">
            <div className="text-7xl font-mono font-black tabular-nums">
                {formatTime(time)}
            </div>
            <div className="flex gap-4">
                <button 
                    onClick={() => setIsActive(!isActive)} 
                    className={`px-8 py-4 rounded-2xl font-black transition-all ${
                        isActive ? 'bg-rose-600 text-white' : 'bg-indigo-600 text-white'
                    }`}
                >
                    {isActive ? "Parar" : "Iniciar"}
                </button>
                <button onClick={reset} className="px-6 py-4 bg-slate-100 rounded-2xl text-slate-600 hover:bg-slate-200">
                    <RotateCcw size={20} />
                </button>
            </div>
        </div>
        
        {children}
    </div>
  );
};