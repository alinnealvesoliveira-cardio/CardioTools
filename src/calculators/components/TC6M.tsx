import React, { useState, useEffect } from 'react';
import { Play, Square, RotateCcw, Heart, Activity, Save, CheckCircle2, BookOpen, Info, ChevronRight } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../lib/supabase';
import { getCBDFClassification } from '../../utils/cbdf';
import { toast } from 'react-hot-toast';

export const TC6M: React.FC = () => {
  const { patientInfo, testResults, updateTestResults } = usePatient();
  const { user } = useAuth();

  const [time, setTime] = useState(360);
  const [isActive, setIsActive] = useState(false);
  const [distance, setDistance] = useState<string>('');
  const [preHR, setPreHR] = useState<string>(patientInfo.restingFC?.toString() || '');
  const [postHR, setPostHR] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  
  // Estados para Sintomas Pós-Teste (Padrão CardioTools)
  const [postFadiga, setPostFadiga] = useState<number | null>(null);
  const [postAngina, setPostAngina] = useState<number | null>(null);

  const [borgData, setBorgData] = useState({
    min0: { dyspnea: 0, fatigue: 0 },
    min6: { dyspnea: 0, fatigue: 0 }
  });

  useEffect(() => {
    let interval: any;
    if (isActive && time > 0) {
      interval = setInterval(() => setTime(t => t - 1), 1000);
    } else {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, time]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const calculatePredicted = () => {
    const age = Number(patientInfo.age);
    const height = Number(patientInfo.height);
    const weight = Number(patientInfo.weight);
    if (!age || !height || !weight) return 0;
    const imc = weight / ((height / 100) ** 2);
    const sexVal = patientInfo.sex === 'male' ? 1 : 0;
    return 890.46 - (6.11 * age) + (0.0345 * (age ** 2)) + (48.87 * sexVal) - (4.87 * imc);
  };

  const predicted = calculatePredicted();
  const observed = parseFloat(distance);
  const percentage = (predicted > 0 && observed > 0) ? (observed / predicted) * 100 : 0;
  const cbdf = getCBDFClassification(percentage);

  const handleSave = async () => {
    if (!observed) {
      toast.error("Insira a distância percorrida");
      return;
    }

    // RESOLUÇÃO DAS "COBRINHAS": Fallbacks seguros para spread e propriedades
    const currentScales = testResults?.fatigabilityScales || { 
      rest: { dyspnea: 0, fatigue: 0 }, 
      exercise: { dyspnea: 0, fatigue: 0 } 
    };

    const currentSymptoms = testResults?.symptoms || { 
      claudication: false, 
      angina: { type: 'none', description: '' } 
    };

    updateTestResults({
      sixMinuteWalkTest: {
        distance: observed,
        predicted: predicted,
        efficiency: percentage,
        hr: { 
          pre: parseInt(preHR) || 0, 
          post: parseInt(postHR) || 0 
        }
      },
      // Salvamento robusto de escalas
      fatigabilityScales: {
        rest: { 
          dyspnea: Number(borgData.min0.dyspnea), 
          fatigue: Number(borgData.min0.fatigue) 
        },
        exercise: { 
          dyspnea: Number(borgData.min6.dyspnea) || currentScales.exercise.dyspnea, 
          fatigue: postFadiga !== null ? postFadiga : currentScales.exercise.fatigue 
        }
      },
      // Salvamento robusto de sintomas
      symptoms: {
        ...currentSymptoms,
        angina: {
          type: postAngina && postAngina > 0 ? 'stable' : 'none',
          description: postAngina ? `Angina Grau ${postAngina} no TC6M` : 'Sem dor precordial'
        }
      }
    });

    if (user) await logActivity(user.id, 'Salvou TC6M');
    setIsSaved(true);
    toast.success("TC6M gravado com sucesso!");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-48 text-slate-900">
      <header className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">Teste de Caminhada</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Protocolo: Britto (2013)</p>
        </div>
        <div className="bg-indigo-50 px-4 py-2 rounded-2xl flex items-center gap-2">
            <Heart className="text-indigo-600 animate-pulse" size={18} />
            <span className="text-sm font-black text-indigo-700">{preHR || '--'} <span className="text-[10px] opacity-60">BPM REPOUSO</span></span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 flex flex-col items-center gap-6">
            <div className="text-9xl font-mono font-bold text-slate-900 tracking-tighter tabular-nums">{formatTime(time)}</div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setIsActive(!isActive)} 
                className={`px-10 py-5 rounded-3xl font-black text-sm flex items-center gap-3 transition-all ${isActive ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'}`}
              >
                {isActive ? <Square fill="currentColor" size={18} /> : <Play fill="currentColor" size={18} />} 
                {isActive ? 'INTERROMPER' : 'INICIAR 6 MINUTOS'}
              </button>
              <button onClick={() => {setIsActive(false); setTime(360);}} className="p-5 bg-slate-100 rounded-3xl text-slate-400 hover:bg-slate-200 transition-colors"><RotateCcw size={24}/></button>
            </div>
            
            <div className="w-full max-w-xs space-y-2 text-center pt-8 border-t border-slate-50">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Distância Percorrida (m)</label>
              <input 
                type="number" 
                value={distance} 
                onChange={(e) => { setDistance(e.target.value); setIsSaved(false); }} 
                className="w-full text-center text-7xl font-black bg-transparent outline-none placeholder:text-slate-100"
                placeholder="000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-2 shadow-sm">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">FC Pós-Teste</label>
                <input 
                    type="number" 
                    value={postHR} 
                    onChange={(e) => setPostHR(e.target.value)}
                    className="text-4xl font-black w-full outline-none text-indigo-600 bg-transparent"
                    placeholder="--"
                />
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col justify-center shadow-sm">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recuperação (1 min)</label>
                <p className="text-4xl font-black text-slate-200">--</p>
              </div>
          </div>

          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 space-y-8">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Activity size={16} className="text-indigo-500" /> Sintomas Imediatos
            </h3>
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Fadiga (Borg 0-10)</label>
                <div className="grid grid-cols-6 gap-2">
                  {[0, 2, 4, 6, 8, 10].map(n => (
                    <button key={n} onClick={() => setPostFadiga(n)} className={`py-4 rounded-2xl font-black transition-all ${postFadiga === n ? 'bg-indigo-600 text-white shadow-xl' : 'bg-slate-50 text-slate-400'}`}>{n}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Angina (0-4)</label>
                <div className="grid grid-cols-5 gap-2">
                  {[0, 1, 2, 3, 4].map(n => (
                    <button key={n} onClick={() => setPostAngina(n)} className={`py-4 rounded-2xl font-black transition-all ${postAngina === n ? 'bg-rose-500 text-white shadow-xl' : 'bg-slate-50 text-slate-400'}`}>{n === 0 ? 'Não' : n}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-6">
                <div>
                    <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">Distância Predita</p>
                    <h3 className="text-5xl font-black italic">{predicted.toFixed(0)}m</h3>
                </div>
                {observed > 0 && (
                <div className="pt-6 border-t border-white/10 space-y-2">
                    <p className="text-[10px] font-black uppercase text-slate-400">Classificação CBDF</p>
                    <h4 className="text-2xl font-black leading-tight" style={{ color: cbdf.color }}>{cbdf.severity}</h4>
                    <p className="text-4xl font-black opacity-30">{percentage.toFixed(1)}%</p>
                </div>
                )}
            </div>
            <div className="absolute -bottom-10 -right-10 text-white/[0.03] scale-150"><Activity size={200}/></div>
          </div>

          <div className="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100">
              <h4 className="text-[10px] font-black text-indigo-900 uppercase mb-3 flex items-center gap-2">
                  <BookOpen size={14} /> Nota de Referência
              </h4>
              <p className="text-[11px] text-indigo-800 leading-relaxed italic">
                A equação de Britto et al. (2013) é o padrão para a população brasileira adulta.
              </p>
          </div>
        </aside>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-50 space-y-3">
        <button
          onClick={handleSave}
          className={`w-full py-5 rounded-[24px] font-black shadow-2xl flex items-center justify-center gap-3 transition-all ${isSaved ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:scale-[1.02]'}`}
        >
          {isSaved ? <CheckCircle2 size={20} /> : <Save size={20} className="text-emerald-400" />}
          {isSaved ? 'TC6M GRAVADO' : 'GRAVAR RESULTADO'}
        </button>
        <button className="w-full bg-white text-slate-600 py-3 rounded-2xl font-bold border border-slate-200 flex items-center justify-center gap-3 text-sm shadow-sm transition-all hover:bg-slate-50">
          PROSSEGUIR PARA VASOS <ChevronRight size={16} className="text-indigo-500" />
        </button>
      </div>
    </div>
  );
};