import React, { useState } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Info, BookOpen, AlertTriangle } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';

export const TSL5X: React.FC = () => {
  const { patientInfo, setPatientInfo, testResults, setTestResults } = usePatient();
  const [observedTime, setObservedTime] = useState<string>('');

  // Tratamento de dados
  const age = parseInt(patientInfo.age as string) || 65;
  const sex = patientInfo.sex === 'female' ? 'F' : 'M';

  /**
   * Ponto de Corte de Excelência (Benchmark funcional)
   * Referência: Fuentes-Abolafio et al. (2022) - Journal of Clinical Medicine.
   * Em cardiopatas, tempos < 9s indicam boa reserva, enquanto > 12s indicam alto risco.
   */
  const predictedValue = 9.0; 

  const interpretation = (_time: number): InterpretationResult[] => {
    const time = parseFloat(observedTime) || _time;
    if (time === 0) return [
      { title: "Força Explosiva", label: "Aguardando", color: "slate", description: "Inicie o cronômetro para avaliar a potência de MMII." }
    ];
    
    const functionalPerf: InterpretationResult = {
      title: "Reserva Funcional (TSL5X)",
      label: time > 12 ? "Severamente Reduzida" : time > 9 ? "Reduzida" : "Preservada",
      color: time > 12 ? "red" : time > 9 ? "yellow" : "green",
      description: time > 12 
        ? "Forte preditor de baixa tolerância ao exercício e fragilidade física." 
        : time > 9 
        ? "Sugere déficit de força muscular periférica. Alvo terapêutico indicado."
        : "Excelente potência de membros inferiores para a faixa etária."
    };

    const clinica: InterpretationResult = {
      title: "Risco Clínico",
      label: time > 15 ? "Alto Risco de Quedas" : "Risco Controlado",
      color: time > 15 ? "red" : "slate",
      description: "Tempos > 15s são marcadores clássicos de sarcopenia e instabilidade."
    };

    return [functionalPerf, clinica];
  };

  const handleSave = (data: any) => {
    const finalTime = data.time || parseFloat(observedTime);
    // Eficiência inversa: tempo menor gera eficiência maior
    const efficiency = (predictedValue / finalTime) * 100;

    setTestResults({
      ...testResults,
      tsl5x: {
        time: finalTime,
        predicted: predictedValue,
        efficiency: efficiency,
        interpretation: data.results[0].label,
        hr: data.hr
      }
    });
  };

  return (
    <TimedTestTemplate
      title="Teste de Sentar e Levantar (5 Vezes)"
      description="Avaliação rápida de força explosiva e potência muscular de membros inferiores."
      interpretation={interpretation}
      predictedValue={predictedValue}
      observedValueOverride={parseFloat(observedTime) || 0}
      invertCIFRatio={true} 
      onSave={handleSave}
      pearls={[
        "Cardiopatas: Tempos > 12s correlacionam-se com menor VO2 de pico.",
        "Execução: Braços cruzados no peito e extensão total de joelhos e quadril.",
        "Vantagem: Teste rápido, realizável em consultório e com alto valor prognóstico."
      ]}
      reference="Fuentes-Abolafio IJ, et al. J Clin Med. 2022."
    >
      <div className="space-y-6">
        {/* Card de Referência Bibliográfica */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
                <BookOpen size={16} className="text-indigo-400" />
                <h3 className="text-[10px] font-black uppercase tracking-widest">Evidência Científica</h3>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300 italic">
                "Functional Capacity and Muscle Strength in Patients with Coronary Artery Disease: The Role of the 5-Sit-to-Stand Test."
                <br/><strong>— Fuentes-Abolafio et al., 2022.</strong>
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase">Idade</label>
            <input
              type="number"
              value={patientInfo.age || ''}
              onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
              className="w-full p-3 rounded-xl border-2 border-slate-100 font-bold outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase">Sexo</label>
            <div className="flex gap-2">
              {['male', 'female'].map((s) => (
                <button
                  key={s}
                  onClick={() => setPatientInfo({ ...patientInfo, sex: s as 'male' | 'female' })}
                  className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all text-xs ${
                    patientInfo.sex === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-400 border-transparent'
                  }`}
                >
                  {s === 'male' ? 'MASC' : 'FEM'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
            <AlertTriangle className="text-amber-600 shrink-0" size={18} />
            <p className="text-[10px] text-amber-900 leading-tight">
                <strong>Nota:</strong> Embora prático, o TSL5X avalia potência. Se o objetivo for endurance aeróbica, priorize o TC6M ou o TSL de 1 minuto.
            </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Tempo de Execução Manual</label>
          <input
            type="number"
            step="0.01"
            value={observedTime}
            onChange={(e) => setObservedTime(e.target.value)}
            placeholder="Segundos (ex: 10.5)"
            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black text-slate-800 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
      </div>
    </TimedTestTemplate>
  );
};