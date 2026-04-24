import React, { useState, useMemo } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Activity, LayoutDashboard, RotateCcw } from 'lucide-react';
import { usePatient } from '../../context/PatientProvider';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const TD2M: React.FC = () => {
  const { patientInfo, testResults, updateTestResults } = usePatient();
  const navigate = useNavigate();

  const [postFadiga, setPostFadiga] = useState<number | null>(null);
  const [postAngina, setPostAngina] = useState<number | null>(null);

  // Otimização: Cálculos reativos com normalização de sexo
  const { 
    predictedRikli, 
    lin, 
    normativeRange 
  } = useMemo(() => {
    const age = parseInt(patientInfo?.age?.toString() || '65');
    const height = parseFloat(patientInfo?.height?.toString() || '170');
    const weight = parseFloat(patientInfo?.weight?.toString() || '70');
    
    // Normalização robusta para evitar erro de tipagem
    const sex = (patientInfo?.sex as string);
    const isFemale = sex === 'female' || sex === 'F';
    const bmi = height > 0 ? weight / ((height / 100) ** 2) : 24.5;

    // Cálculo Rikli & Jones
    const pRikli = !isFemale 
      ? 143.297 - (1.157 * age) - (0.334 * bmi) 
      : 118.773 - (0.832 * age) - (0.472 * bmi);
    
    const epe = 6;
    const pLin = pRikli - (epe * 1.645);

    // Ranges Normativos
    const getRange = (a: number, female: boolean): [number, number] | null => {
      if (a < 60) return null;
      if (a <= 64) return !female ? [87, 115] : [75, 107];
      if (a <= 69) return !female ? [86, 116] : [73, 107];
      if (a <= 74) return !female ? [80, 110] : [68, 101];
      if (a <= 79) return !female ? [73, 109] : [68, 100];
      if (a <= 84) return !female ? [71, 103] : [60, 90];
      if (a <= 89) return !female ? [59, 91] : [55, 85];
      if (a <= 94) return !female ? [52, 86] : [44, 72];
      return null;
    };

    return { 
      predictedRikli: pRikli, 
      lin: pLin, 
      normativeRange: getRange(age, isFemale) 
    };
  }, [patientInfo]);

  const handleResetSintomas = () => {
    setPostFadiga(null);
    setPostAngina(null);
  };

  const interpretation = (_time: number, count: number): InterpretationResult[] => {
    if (count === 0) return [{ label: "Aguardando", color: "slate", description: "Inicie o teste." }];
    
    const normative = normativeRange 
      ? (count >= normativeRange[0] ? (count > normativeRange[1] ? "Acima do Normal" : "Normal") : "Abaixo do Normal")
      : "Sem dados normativos";

    return [{
      label: count < lin ? "Abaixo do LIN" : normative,
      color: count < lin ? "red" : (normative === "Normal" || normative === "Acima do Normal" ? "green" : "yellow"),
      description: count < lin 
        ? `Abaixo do Limite Inferior (${lin.toFixed(0)} passos).` 
        : `Resultado ${normative.toLowerCase()}.`
    }];
  };

  const handleGlobalSave = (data: { count: number; hr?: { pre: number; post: number } }) => {
    const efficiency = predictedRikli > 0 ? (data.count / predictedRikli) * 100 : 0;

    const currentScales = testResults?.fatigability || { 
      rest: { dyspnea: 0, fatigue: 0 }, 
      exercise: { dyspnea: 0, fatigue: 0 } 
    };

    const currentSymptoms = testResults?.symptoms || {
      claudication: false,
      angina: { type: 'none', description: '' }
    };

    updateTestResults('aerobic', {
      td2m: {
        count: data.count,
        predicted: predictedRikli,
        efficiency: efficiency,
        interpretation: interpretation(120, data.count)[0].label,
        hr: data.hr
      },
      });
      updateTestResults('fatigability', {
          ...currentScales,
        exercise: { 
          ...currentScales.exercise, 
          fatigue: postFadiga || 0 
        }
      });
      updateTestResults('symptoms', {  
          ...currentSymptoms,
        angina: {
          type: postAngina && postAngina > 0 ? 'stable' : 'none',
          description: postAngina && postAngina > 0 ? `Angina Grau ${postAngina} no TSL5X` : 'Sem sintomas anginosos'
        }
      });
      
    toast.success("Teste de Marcha gravado!");
  };

  return (
    <div className="max-w-4xl mx-auto pb-60 relative"> 
      <TimedTestTemplate
        title="2MST"
        description="Teste de Marcha Estacionária (2 Minutos)"
        timerDuration={120}
        hasCounter={true}
        counterLabel="Elevações do Joelho"
        interpretation={interpretation}
        predictedValue={predictedRikli}
        onSave={handleGlobalSave}
        reference="Rikli RE, Jones CJ. Senior Fitness Test Manual. 2nd ed, 2013."
      >
        <div className="space-y-6 px-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-emerald-50 rounded-[24px] border border-emerald-100">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Predito</p>
              <p className="text-3xl font-black text-emerald-900">{predictedRikli.toFixed(1)}</p>
            </div>
            <div className="p-5 bg-rose-50 rounded-[24px] border border-rose-100">
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Corte (LIN)</p>
              <p className="text-3xl font-black text-rose-900">{lin.toFixed(0)}</p>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 font-black text-slate-700 uppercase text-xs tracking-widest">
                <Activity className="text-indigo-500" size={18}/> Sintomas Pós-Esforço
              </div>
              <button 
                onClick={handleResetSintomas}
                className="text-[9px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest flex items-center gap-1"
              >
                <RotateCcw size={12}/> Limpar
              </button>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fadiga (Borg 0-10)</label>
              <div className="grid grid-cols-6 gap-2">
                {[0, 2, 4, 6, 8, 10].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPostFadiga(n)}
                    className={`py-4 rounded-2xl font-black transition-all ${postFadiga === n ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Angina (CCS 0-4)</label>
              <div className="grid grid-cols-5 gap-2">
                {[0, 1, 2, 3, 4].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPostAngina(n)}
                    className={`py-4 rounded-2xl font-black transition-all ${postAngina === n ? 'bg-rose-500 text-white' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                  >
                    {n === 0 ? 'Não' : n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </TimedTestTemplate>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-[999]">
        <button
          onClick={() => navigate('/dashboard')} 
          className="w-full bg-white/90 backdrop-blur-md text-slate-900 py-5 rounded-[24px] font-black border border-slate-200 shadow-xl flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest"
        >
          <LayoutDashboard size={18} /> PAINEL DE MÓDULOS
        </button>
      </div>
    </div>
  );
};