import React, { useState } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Info, BookOpen, Activity, Save, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { toast } from 'react-hot-toast';

export const TSL1M: React.FC = () => {
  const { patientInfo, setPatientInfo, testResults, updateTestResults } = usePatient();
  const [isSaved, setIsSaved] = useState(false);

  // Estados locais para Sintomas Pós-Teste (Padrão CardioTools)
  const [postFadiga, setPostFadiga] = useState<number | null>(null);
  const [postAngina, setPostAngina] = useState<number | null>(null);

  // Tratamento de dados com fallbacks seguros
  const age = parseInt(patientInfo.age as string) || 60;
  const sex = patientInfo.sex === 'female' ? 'F' : 'M';
  const height = parseFloat(patientInfo.height as string) || 170;
  const weight = parseFloat(patientInfo.weight as string) || 70;
  const bmi = weight / ((height / 100) ** 2);

  /**
   * CÁLCULO DO PREDITO - EQUAÇÃO BRASILEIRA (Furlanetto KC, et al. 2022)
   */
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

    // Proteção contra 'undefined' (Garante que as cobrinhas vermelhas sumam)
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
      // Integrando Borg de Fadiga de MMII no salvamento global
      fatigabilityScales: {
        ...currentScales,
        exercise: { 
          ...currentScales.exercise, 
          fatigue: postFadiga || 0 
        }
      },
      // Integrando Angina no salvamento global
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
    <div className="pb-48"> 
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
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900 rounded-2xl shadow-xl">
              <p className="text-[9px] font-bold text-indigo-400 uppercase mb-1">Predito (Furlanetto)</p>
              <p className="text-3xl font-black text-white">{predictedFurlanetto.toFixed(1)} <span className="text-xs font-normal opacity-50">REP</span></p>
            </div>
            <div className="p-4 bg-white rounded-2xl border-2 border-slate-50 flex flex-col justify-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">IMC Atual</p>
              <p className="text-xl font-black text-slate-700">{bmi.toFixed(1)} <span className="text-[10px] font-normal text-slate-400 italic">kg/m²</span></p>
            </div>
          </div>

          {/* SINTOMAS PÓS-ESFORÇO */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-2 font-black text-slate-700 uppercase text-xs tracking-widest">
              <Activity className="text-indigo-500" size={16}/> Sintomas Pós-Esforço
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Fadiga de Membros Inferiores (Borg 0-10)</label>
              <div className="grid grid-cols-6 gap-2">
                {[0, 2, 4, 6, 8, 10].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPostFadiga(n)}
                    className={`py-3 rounded-xl font-bold transition-all ${postFadiga === n ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Graduação de Angina (0-4)</label>
              <div className="grid grid-cols-5 gap-2">
                {[0, 1, 2, 3, 4].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPostAngina(n)}
                    className={`py-3 rounded-xl font-bold transition-all ${postAngina === n ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                  >
                    {n === 0 ? 'Nenhuma' : n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </TimedTestTemplate>

      {/* RODAPÉ FIXO DE AÇÃO */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-50 space-y-3">
        <button
          type="button"
          onClick={() => (document.querySelector('button[type="submit"]') as HTMLButtonElement)?.click()} 
          className={`w-full py-4 rounded-3xl font-black shadow-2xl flex items-center justify-center gap-3 transition-all ${isSaved ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:scale-[1.02]'}`}
        >
          {isSaved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5 text-emerald-400" />}
          {isSaved ? 'TESTE GRAVADO' : 'GRAVAR RESULTADO'}
        </button>
        
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
          className="w-full bg-white text-slate-600 py-3 rounded-2xl font-bold border border-slate-200 flex items-center justify-center gap-3 text-sm shadow-sm"
        >
          PROSSEGUIR PARA PRÓXIMO TESTE
          <ChevronRight className="w-4 h-4 text-indigo-500" />
        </button>
      </div>
    </div>
  );
};