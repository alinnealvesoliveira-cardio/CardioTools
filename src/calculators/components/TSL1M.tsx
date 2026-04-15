import React, { useState } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Info, BookOpen, Activity, Save, CheckCircle2, ChevronRight, LayoutDashboard } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const TSL1M: React.FC = () => {
  const { patientInfo, testResults, updateTestResults } = usePatient();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  // Estados locais para Sintomas Pós-Teste
  const [postFadiga, setPostFadiga] = useState<number | null>(null);
  const [postAngina, setPostAngina] = useState<number | null>(null);

  const age = parseInt(patientInfo.age as string) || 60;
  const sex = patientInfo.sex === 'female' ? 'F' : 'M';
  const height = parseFloat(patientInfo.height as string) || 170;
  const weight = parseFloat(patientInfo.weight as string) || 70;
  const bmi = weight / ((height / 100) ** 2);

  // CÁLCULO DO PREDITO - EQUAÇÃO BRASILEIRA (Furlanetto KC, et al. 2022)
  const calculatePredictedFurlanetto = () => {
    const sexVal = sex === 'F' ? 1 : 0;
    const predicted = 60.6 - (0.36 * age) - (2.8 * sexVal) - (0.31 * bmi);
    return predicted > 0 ? predicted : 0;
  };

  const predictedFurlanetto = calculatePredictedFurlanetto();

  const interpretation = (_time: number, count: number): InterpretationResult[] => {
    if (count === 0) return [{ 
      title: "Resistência de MMII", 
      label: "Aguardando", 
      color: "slate", 
      description: "Inicie o teste e registre as repetições." 
    }];
    
    const efficiency = (count / predictedFurlanetto) * 100;

    return [
      {
        title: "Resistência Funcional (TSL1M)",
        label: efficiency < 80 ? "Reduzida" : "Preservada",
        color: efficiency < 80 ? "red" : "green",
        description: `Desempenho de ${efficiency.toFixed(0)}% do predito.`
      },
      {
        title: "Diferença Clínica (MDC)",
        label: "1.1 rep",
        color: "slate",
        description: "Melhora mínima real para cardiopatas."
      }
    ];
  };

  const handleGlobalSave = (data: any) => {
    const efficiency = (data.count / predictedFurlanetto) * 100;

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
    /* AJUSTE DE CSS: pb-60 evita que os botões fixos cubram o conteúdo final */
    <div className="max-w-4xl mx-auto pb-60 relative"> 
      <TimedTestTemplate
        title="Teste de Sentar e Levantar (1 Minuto)"
        description="Avaliação da resistência muscular periférica e endurance funcional."
        timerDuration={60}
        hasCounter={true}
        counterLabel="Repetições Completas"
        interpretation={interpretation}
        predictedValue={predictedFurlanetto}
        onSave={handleGlobalSave}
        pearls={[
          "Equação de Furlanetto (2022) validada para brasileiros.",
          "MDC: 1.1 repetições para melhora clínica em cardiopatas.",
          "O uso dos braços invalida o teste."
        ]}
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
                    className={`py-4 rounded-2xl font-black transition-all active:scale-95 ${postFadiga === n ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
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
                    className={`py-4 rounded-2xl font-black transition-all active:scale-95 ${postAngina === n ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                  >
                    {n === 0 ? 'Não' : n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </TimedTestTemplate>

      {/* RODAPÉ FIXO CORRIGIDO: Z-INDEX 999 para garantir interatividade */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-[999] flex flex-col gap-3">
        <button
          type="button"
          onClick={() => (document.querySelector('button[type="submit"]') as HTMLButtonElement)?.click()} 
          className={`w-full py-5 rounded-[24px] font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all ${isSaved ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
        >
          {isSaved ? <CheckCircle2 className="w-6 h-6" /> : <Save className="w-6 h-6 text-emerald-400" />}
          <span className="text-[11px] uppercase tracking-widest">{isSaved ? 'TESTE GRAVADO' : 'GRAVAR RESULTADO'}</span>
        </button>
        
        <button
          type="button"
          onClick={() => navigate('/dashboard')} 
          className="w-full bg-white/90 backdrop-blur-md text-slate-900 py-5 rounded-[24px] font-black border border-slate-200 shadow-xl flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest active:scale-95 transition-all"
        >
          <LayoutDashboard size={18} /> PAINEL DE MÓDULOS
        </button>
      </div>
    </div>
  );
};