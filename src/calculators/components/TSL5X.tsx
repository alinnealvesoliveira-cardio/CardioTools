import React, { useState } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Info, BookOpen, Activity, Save, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { toast } from 'react-hot-toast';

export const TSL5X: React.FC = () => {
  const { patientInfo, setPatientInfo, testResults, updateTestResults } = usePatient();
  const [isSaved, setIsSaved] = useState(false);
  const [observedTime, setObservedTime] = useState<string>('');

  // Estados locais para Sintomas Pós-Teste (Padrão CardioTools)
  const [postFadiga, setPostFadiga] = useState<number | null>(null);
  const [postAngina, setPostAngina] = useState<number | null>(null);

  const age = parseInt(patientInfo.age as string) || 65;
  const sex = patientInfo.sex === 'female' ? 'F' : 'M';

  // Referência de Excelência: < 9s (Fuentes-Abolafio et al., 2022)
  const predictedValue = 9.0; 

  const interpretation = (_time: number): InterpretationResult[] => {
    const time = parseFloat(observedTime) || _time;
    if (time === 0) return [
      { title: "Força Explosiva", label: "Aguardando", color: "slate", description: "Inicie o cronômetro." }
    ];
    
    const functionalPerf: InterpretationResult = {
      title: "Reserva Funcional (TSL5X)",
      label: time > 12 ? "Severamente Reduzida" : time > 9 ? "Reduzida" : "Preservada",
      color: time > 12 ? "red" : time > 9 ? "yellow" : "green",
      description: time > 12 ? "Preditor de fragilidade física." : "Resultado conforme esperado."
    };

    return [functionalPerf];
  };

  const handleGlobalSave = (data: any) => {
    const finalTime = data.time || parseFloat(observedTime);
    const efficiency = (predictedValue / finalTime) * 100;

    // Proteção de Tipagem (Evita as "cobrinhas vermelhas")
    const currentScales = testResults?.fatigabilityScales || { 
      rest: { dyspnea: 0, fatigue: 0 }, 
      exercise: { dyspnea: 0, fatigue: 0 } 
    };

    const currentSymptoms = testResults?.symptoms || {
      claudication: false,
      angina: { type: 'none', description: '' }
    };

    updateTestResults({
      tsl5x: {
        time: finalTime,
        predicted: predictedValue,
        efficiency: efficiency,
        interpretation: interpretation(finalTime)[0].label,
        hr: data.hr
      },
      // Salvamento unificado de fadiga (Borg)
      fatigabilityScales: {
        ...currentScales,
        exercise: { 
          ...currentScales.exercise, 
          fatigue: postFadiga || 0 
        }
      },
      // Salvamento unificado de Angina
      symptoms: {
        ...currentSymptoms,
        angina: {
          type: postAngina && postAngina > 0 ? 'stable' : 'none',
          description: postAngina ? `Angina Grau ${postAngina} no TSL5X` : 'Sem dor precordial'
        }
      }
    });

    setIsSaved(true);
    toast.success("TSL 5 Vezes gravado!");
  };

  return (
    <div className="pb-48"> 
      <TimedTestTemplate
        title="Teste de Sentar e Levantar (5 Vezes)"
        description="Avaliação rápida de força explosiva e potência muscular de MMII."
        interpretation={interpretation}
        predictedValue={predictedValue}
        observedValueOverride={parseFloat(observedTime) || 0}
        invertCIFRatio={true} 
        onSave={handleGlobalSave}
        pearls={[
          "Cardiopatas: Tempos > 12s sugerem baixa reserva funcional.",
          "Braços cruzados no peito são obrigatórios.",
          "Teste focado em potência muscular (explosão)."
        ]}
        reference="Fuentes-Abolafio IJ, et al. J Clin Med. 2022."
      >
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={16} className="text-indigo-400" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Evidência Clínica</h3>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300 italic">
              "Tempos acima de 12 segundos indicam risco aumentado em pacientes coronariopatas."
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tempo Manual (opcional)</label>
            <input
              type="number"
              step="0.01"
              value={observedTime}
              onChange={(e) => setObservedTime(e.target.value)}
              placeholder="0.00"
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black text-slate-800 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          {/* SINTOMAS PÓS-ESFORÇO */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-2 font-black text-slate-700 uppercase text-xs tracking-widest">
              <Activity className="text-indigo-500" size={16}/> Sintomas Pós-Esforço
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Fadiga (Borg 0-10)</label>
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
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Angina (0-4)</label>
              <div className="grid grid-cols-5 gap-2">
                {[0, 1, 2, 3, 4].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPostAngina(n)}
                    className={`py-3 rounded-xl font-bold transition-all ${postAngina === n ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                  >
                    {n === 0 ? 'Não' : n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </TimedTestTemplate>

      {/* RODAPÉ FIXO */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-50 space-y-3">
        <button
          type="button"
          onClick={() => (document.querySelector('button[type="submit"]') as HTMLButtonElement)?.click()} 
          className={`w-full py-4 rounded-3xl font-black shadow-2xl flex items-center justify-center gap-3 transition-all ${isSaved ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:scale-[1.02]'}`}
        >
          {isSaved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5 text-emerald-400" />}
          {isSaved ? 'POTÊNCIA GRAVADA' : 'GRAVAR RESULTADO'}
        </button>
        
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
          className="w-full bg-white text-slate-600 py-3 rounded-2xl font-bold border border-slate-200 flex items-center justify-center gap-3 text-sm shadow-sm"
        >
          PROSSEGUIR
          <ChevronRight className="w-4 h-4 text-indigo-500" />
        </button>
      </div>
    </div>
  );
};