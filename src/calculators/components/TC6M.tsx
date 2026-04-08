import React, { useState, useEffect } from 'react';
import { Play, Square, RotateCcw, Heart, Activity, Save, CheckCircle2 } from 'lucide-react';
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
  const [preHR, setPreHR] = useState<string>(patientInfo.restingFC || '');
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

  const calculatePredicted = () => {
    const age = Number(patientInfo.age);
    const height = Number(patientInfo.height);
    const weight = Number(patientInfo.weight);
    if (!age || !height || !weight) return 0;

    const imc = weight / ((height / 100) ** 2);
    const sexVal = patientInfo.sex === 'male' ? 1 : 0;
    
    // Equação de Britto (Brasileira)
    return 890.46 - (6.11 * age) + (0.0345 * (age ** 2)) + (48.87 * sexVal) - (4.87 * imc);
  };

  const predicted = calculatePredicted();
  const observed = parseFloat(distance);
  const percentage = (predicted > 0 && observed > 0) ? (observed / predicted) * 100 : 0;
  
  // Usa a função global que criamos no utils/cbdf.ts
  const cbdf = getCBDFClassification(percentage);

  const handleSave = async () => {
    if (!observed) {
      toast.error("Insira a distância percorrida");
      return;
    }

    // ATENÇÃO: Usando updateTestResult para garantir que grave no Relatório Final
    updateTestResult('tc6m', {
      distance: observed,
      predicted: predicted,
      efficiency: percentage,
      hr: { 
        pre: parseInt(preHR) || 0, 
        post: parseInt(postHR) || 0 
      }
    });

    // Atualiza escalas de fadigabilidade globalmente
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
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Paciente: {patientInfo.name || '---'}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!observed || isSaved}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
            isSaved ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-indigo-600'
          }`}
        >
          {isSaved ? <CheckCircle2 size={20} /> : <Save size={20} />} {isSaved ? 'SALVO' : 'SALVAR RESULTADO'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center gap-6">
            <div className="text-8xl font-mono font-bold text-indigo-600">{formatTime(time)}</div>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsActive(!isActive)} 
                className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all ${isActive ? 'bg-rose-500 text-white shadow-rose-200 shadow-lg' : 'bg-emerald-500 text-white shadow-emerald-200 shadow-lg'}`}
              >
                {isActive ? <Square fill="currentColor" /> : <Play fill="currentColor" />} {isActive ? 'PARAR' : 'INICIAR'}
              </button>
              <button onClick={() => {setIsActive(false); setTime(360);}} className="p-4 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors"><RotateCcw /></button>
            </div>
            
            <div className="w-full max-w-xs space-y-2 text-center pt-6 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Distância Total (metros)</label>
              <input 
                type="number" 
                value={distance} 
                onChange={(e) => { setDistance(e.target.value); setIsSaved(false); }} 
                placeholder="000"
                className="w-full text-center text-6xl font-black p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 font-bold mb-4 text-slate-700"><Heart className="text-rose-500" size={18}/> Frequência Cardíaca</div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">FC Pré (Repouso)</label>
                  <input type="number" value={preHR} onChange={(e) => setPreHR(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">FC Pós (Pico)</label>
                  <input type="number" value={postHR} onChange={(e) => setPostHR(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 font-bold mb-4 text-slate-700"><Activity className="text-indigo-500" size={18}/> Escala de Borg Manual</div>
              <div className="grid grid-cols-3 gap-2">
                {[0, 3, 6].map(m => (
                  <div key={m} className="p-2 bg-slate-50 rounded-xl text-center">
                    <span className="text-[9px] font-bold text-slate-400">{m}' MIN</span>
                    <input 
                      type="number" 
                      placeholder="D" 
                      value={(borgData as any)[`min${m}`].dyspnea}
                      onChange={(e) => setBorgData({...borgData, [`min${m}`]: {...(borgData as any)[`min${m}`], dyspnea: Number(e.target.value)}})}
                      className="w-full mt-1 p-1 text-center rounded-lg border text-xs font-bold" 
                    />
                    <input 
                      type="number" 
                      placeholder="F" 
                      value={(borgData as any)[`min${m}`].fatigue}
                      onChange={(e) => setBorgData({...borgData, [`min${m}`]: {...(borgData as any)[`min${m}`], fatigue: Number(e.target.value)}})}
                      className="w-full mt-1 p-1 text-center rounded-lg border text-xs font-bold" 
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-6">
            <div className="text-center pb-4 border-b border-white/10">
              <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">Resultado Predito</p>
              <h3 className="text-4xl font-black">{predicted.toFixed(0)}m</h3>
              <p className="text-[10px] text-slate-400 italic">Equação de Britto (2013)</p>
            </div>

            {observed > 0 && (
              <div className="p-4 rounded-2xl border-l-4 shadow-inner" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderLeftColor: cbdf.color }}>
                <p className="text-[10px] font-black uppercase mb-1" style={{ color: cbdf.color }}>Classificação CBDF-1</p>
                <h4 className="text-xl font-black">{cbdf.severity} (Qualificador {cbdf.qualifier})</h4>
                <p className="text-[10px] text-slate-400 mt-1">Eficiência: {percentage.toFixed(1)}% do esperado.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};