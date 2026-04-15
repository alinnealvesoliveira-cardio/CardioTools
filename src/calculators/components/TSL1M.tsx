import React, { useState } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Activity, Save, CheckCircle2, LayoutDashboard } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const TSL1M: React.FC = () => {
  const { patientInfo, testResults, updateTestResults } = usePatient();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const [postFadiga, setPostFadiga] = useState<number | null>(null);
  const [postAngina, setPostAngina] = useState<number | null>(null);

  // --- SAFEGUARDS CONTRA TELA BRANCA ---
  const age = parseInt(patientInfo?.age as string) || 60;
  const sex = (patientInfo as any)?.sex === 'female' || (patientInfo as any)?.sex === 'F' ? 'F' : 'M';
  const height = parseFloat(patientInfo?.height as string) || 170;
  const weight = parseFloat(patientInfo?.weight as string) || 70;
  
  // Proteção contra divisão por zero no IMC
  const bmi = height > 0 ? weight / ((height / 100) ** 2) : 24.2;

  // CÁLCULO DO PREDITO - EQUAÇÃO BRASILEIRA (Furlanetto KC, et al. 2022)
  const calculatePredictedFurlanetto = (): number => {
    const sexVal = sex === 'F' ? 1 : 0;
    const predicted = 60.6 - (0.36 * age) - (2.8 * sexVal) - (0.31 * bmi);
    return predicted > 0 ? predicted : 15; // Fallback seguro para 15 repetições
  };

  const predictedFurlanetto = calculatePredictedFurlanetto();

  const interpretation = (_time: number, count: number): InterpretationResult[] => {
    if (count === 0) return [{ 
      label: "Aguardando", 
      color: "slate", 
      description: "Inicie o teste e registre as repetições." 
    }];
    
    const efficiency = (count / predictedFurlanetto) * 100;

    return [
      {
        label: efficiency < 80 ? "Reduzida" : "Preservada",
        color: efficiency < 80 ? "red" : "green",
        description: `Desempenho de ${efficiency.toFixed(0)}% do predito.`
      }
    ];
  };

  const handleGlobalSave = (data: any) => {
    const efficiency = predictedFurlanetto > 0 ? (data.count / predictedFurlanetto) * 100 : 0;

    const currentScales = testResults?.fatigabilityScales || { 
      rest: { dyspnea: 0, fatigue: 0 }, 
      exercise: { dyspnea: 0, fatigue: 0 } 
    };

    const currentSymptoms = testResults?.symptoms || {
      claudication: false,
      angina: { type: 'none', description: '' }
    };

    updateTestResults({
      tsl1m: {
        count: data.count,
        predicted: predictedFurlanetto,
        efficiency: efficiency,
        interpretation: interpretation(60, data.count)[0].label,
        hr: data.hr
      },
      fatigabilityScales: {
        ...currentScales,
        exercise: { 
          ...currentScales.exercise, 
          fatigue: postFadiga || 0 
        }
      },
      symptoms: {
        ...currentSymptoms,
        angina: {
          type: postAngina && postAngina > 0 ? 'stable' : 'none',
          description: postAngina ? `Angina Grau ${postAngina} no TSL1M` : 'Sem dor precordial'
        }
      }
    });

    setIsSaved(true);
    toast.success("TSL 1 Minuto gravado!");
  };

  return (
    <div className="max-w-4xl mx-auto pb-60 relative"> 
      <TimedTestTemplate
        title="TSL 1 Minuto"
        description="Teste de Sentar e Levantar (Resistência de MMII)"
        timerDuration={60}
        hasCounter={true}
        counterLabel="Repetições Completas"
        interpretation={interpretation}
        predictedValue={predictedFurlanetto}
        onSave={handleGlobalSave}
        reference="Furlanetto KC, et al. Braz J Phys Ther. 2022."
      >
        <div className="space-y-6 px-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-slate-900 rounded-[24px] shadow-xl border border-slate-800">
              <p className="text-[10px] font-black text-indigo-400 uppercase mb-1 tracking-widest">Predito (Furlanetto)</p>
              <p className="text-3xl font-black text-white">{predictedFurlanetto.toFixed(1)} <span className="text-xs font-bold opacity-40 uppercase">rep</span></p>
            </div>
            <div className="p-5 bg-white rounded-[24px] border border-slate-100 shadow-sm flex flex-col justify-center">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">IMC Calculado</p>
              <p className="text-xl font-black text-slate-700">{bmi.toFixed(1)} <span className="text-[10px] font-bold text-slate-300 italic uppercase">kg/m²</span></p>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-2 font-black text-slate-700 uppercase text-xs tracking-widest border-b pb-3">
              <Activity className="text-indigo-500" size={18}/> Sintomas Pós-Esforço
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fadiga de MMII (Borg)</label>
              <div className="grid grid-cols-6 gap-2">
                {[0, 2, 4, 6, 8, 10].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => { setPostFadiga(n); setIsSaved(false); }}
                    className={`py-4 rounded-2xl font-black transition-all ${postFadiga === n ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Graduação de Angina (0-4)</label>
              <div className="grid grid-cols-5 gap-2">
                {[0, 1, 2, 3, 4].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => { setPostAngina(n); setIsSaved(false); }}
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

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-[999] flex flex-col gap-3">
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