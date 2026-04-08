import React, { useState, useEffect } from 'react';
import { Play, Square, RotateCcw, Heart, Activity, Save, CheckCircle2, BookOpen, Info } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../lib/supabase';
import { getCBDFClassification } from '../../utils/cbdf';
import { toast } from 'react-hot-toast';

export const TC6M: React.FC = () => {
  const { patientInfo, updateTestResult } = usePatient();
  const { user } = useAuth();

  const [time, setTime] = useState(360);
  const [isActive, setIsActive] = useState(false);
  const [distance, setDistance] = useState<string>('');
  const [preHR, setPreHR] = useState<string>(patientInfo.restingFC?.toString() || '');
  const [postHR, setPostHR] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  
  const [borgData, setBorgData] = useState({
    min0: { dyspnea: 0, fatigue: 0 },
    min3: { dyspnea: 0, fatigue: 0 },
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

  /**
   * CÁLCULO DA DISTÂNCIA PREDITA - EQUAÇÃO DE BRITTO ET AL. (2013)
   * Referência: Referência brasileira para o teste de caminhada de seis minutos.
   */
  const calculatePredicted = () => {
    const age = Number(patientInfo.age);
    const height = Number(patientInfo.height);
    const weight = Number(patientInfo.weight);
    
    if (!age || !height || !weight) return 0;

    const imc = weight / ((height / 100) ** 2);
    const sexVal = patientInfo.sex === 'male' ? 1 : 0;
    
    // Equação de Britto (2013): 890,46 – (6,11 x idade) + (0,0345 x idade²) + (48,87 x sexo) – (4,87 x IMC)
    // Sexo: Masculino = 1, Feminino = 0
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

    updateTestResult('sixMinuteWalkTest', {
      distance: observed,
      predicted: predicted,
      efficiency: percentage,
      hr: { 
        pre: parseInt(preHR) || 0, 
        post: parseInt(postHR) || 0 
      }
    });

    updateTestResult('fatigabilityScales', {
      rest: { 
        dyspnea: Number(borgData.min0.dyspnea), 
        fatigue: Number(borgData.min0.fatigue) 
      },
      exercise: { 
        dyspnea: Number(borgData.min6.dyspnea), 
        fatigue: Number(borgData.min6.fatigue) 
      }
    });

    if (user) await logActivity(user.id, 'Salvou TC6M');
    setIsSaved(true);
    toast.success("Resultado enviado para o Relatório Final!");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-24 text-slate-900">
      <header className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">Teste de Caminhada (TC6M)</h1>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Protocolo: Britto et al. (2013)</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!observed || isSaved}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
            isSaved ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-lg shadow-slate-200'
          }`}
        >
          {isSaved ? <CheckCircle2 size={20} /> : <Save size={20} />} {isSaved ? 'GRAVADO' : 'SALVAR RESULTADO'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center gap-6">
            <div className="text-8xl font-mono font-bold text-indigo-600 tracking-tighter">{formatTime(time)}</div>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsActive(!isActive)} 
                className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all ${isActive ? 'bg-rose-500 text-white shadow-rose-200 shadow-lg' : 'bg-emerald-500 text-white shadow-emerald-200 shadow-lg'}`}
              >
                {isActive ? <Square fill="currentColor" size={20} /> : <Play fill="currentColor" size={20} />} {isActive ? 'PARAR' : 'INICIAR'}
              </button>
              <button onClick={() => {setIsActive(false); setTime(360);}} className="p-4 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors text-slate-600"><RotateCcw size={24}/></button>
            </div>
            
            <div className="w-full max-w-xs space-y-2 text-center pt-6 border-t border-slate-100">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Distância Total (metros)</label>
              <input 
                type="number" 
                value={distance} 
                onChange={(e) => { setDistance(e.target.value); setIsSaved(false); }} 
                placeholder="000"
                className="w-full text-center text-6xl font-black p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none transition-all placeholder:opacity-20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 font-bold mb-4 text-slate-700 uppercase text-[10px] tracking-widest"><Heart className="text-rose-500" size={14}/> Frequência Cardíaca</div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">FC Pré</label>
                    <input type="number" value={preHR} onChange={(e) => setPreHR(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 ring-indigo-500/10" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">FC Pós</label>
                    <input type="number" value={postHR} onChange={(e) => setPostHR(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 ring-indigo-500/10" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 font-bold mb-4 text-slate-700 uppercase text-[10px] tracking-widest"><Activity className="text-indigo-500" size={14}/> Escala de Borg (Modificada)</div>
              <div className="grid grid-cols-3 gap-2">
                {[0, 3, 6].map(m => (
                  <div key={m} className="p-2 bg-slate-50 rounded-xl text-center border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400">{m}' MIN</span>
                    <div className="space-y-1 mt-1">
                      <input 
                        type="number" 
                        placeholder="D" 
                        title="Dispneia"
                        value={(borgData as any)[`min${m}`].dyspnea}
                        onChange={(e) => setBorgData({...borgData, [`min${m}`]: {...(borgData as any)[`min${m}`], dyspnea: Number(e.target.value)}})}
                        className="w-full p-1 text-center rounded-lg border-none bg-white shadow-sm text-xs font-bold" 
                      />
                      <input 
                        type="number" 
                        placeholder="F" 
                        title="Fadiga"
                        value={(borgData as any)[`min${m}`].fatigue}
                        onChange={(e) => setBorgData({...borgData, [`min${m}`]: {...(borgData as any)[`min${m}`], fatigue: Number(e.target.value)}})}
                        className="w-full p-1 text-center rounded-lg border-none bg-white shadow-sm text-xs font-bold" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Activity size={80} />
            </div>
            
            <div className="text-center pb-4 border-b border-white/10">
              <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">Resultado Predito</p>
              <h3 className="text-5xl font-black italic">{predicted.toFixed(0)}m</h3>
              <p className="text-[10px] text-slate-400 mt-2 flex items-center justify-center gap-1"><BookOpen size={10}/> Equação de Britto (2013)</p>
            </div>

            {observed > 0 && (
              <div className="p-4 rounded-2xl border-l-4 shadow-inner bg-white/5" style={{ borderLeftColor: cbdf.color }}>
                <p className="text-[10px] font-black uppercase mb-1" style={{ color: cbdf.color }}>Classificação CBDF-1</p>
                <h4 className="text-xl font-black leading-tight">{cbdf.severity}</h4>
                <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold">Qualificador .{cbdf.qualifier}</span>
                    <p className="text-[10px] text-slate-400 italic">Eficiência: {percentage.toFixed(1)}%</p>
                </div>
              </div>
            )}

            {/* Rodapé Bibliográfico */}
            <div className="pt-4 border-t border-white/5 space-y-2">
                <div className="flex items-center gap-1 text-slate-500">
                    <BookOpen size={10} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Referências</span>
                </div>
                <p className="text-[8px] text-slate-500 leading-tight">
                    [1] <strong>Britto RR, et al.</strong> Reference values for the six-minute walk test based on representative sample of Brazilian population. <em>Braz J Phys Ther.</em> 2013.
                </p>
            </div>
          </div>

          <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex gap-3">
              <Info className="text-indigo-600 shrink-0" size={18} />
              <p className="text-[10px] text-indigo-800 leading-relaxed font-medium">
                  <strong>Nota clínica:</strong> A equação de Britto et al. considera idade, sexo e IMC, sendo a mais adequada para predizer a capacidade funcional em brasileiros.
              </p>
          </div>
        </div>
      </div>
    </div>
  );
};