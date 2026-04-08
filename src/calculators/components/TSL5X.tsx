import React, { useState } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Info } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';

export const TSL5X: React.FC = () => {
  const { patientInfo, setPatientInfo, testResults, setTestResults } = usePatient();
  const [observedTime, setObservedTime] = useState<string>('');

  // Tratamento de dados
  const age = parseInt(patientInfo.age as string) || 65;
  const sex = patientInfo.sex === 'female' ? 'F' : 'M';
  const height = parseFloat(patientInfo.height as string) || 170;
  const weight = parseFloat(patientInfo.weight as string) || 70;

  // Alvo de Excelência (Referência para funcionalidade plena)
  const predictedCIF = 4.8; 

  const interpretation = (_time: number): InterpretationResult[] => {
    const time = parseFloat(observedTime) || _time;
    if (time === 0) return [
      { title: "Capacidade Funcional", label: "Aguardando", color: "slate", description: "Inicie o cronômetro ou insira o tempo manual." }
    ];
    
    const cardioPerf: InterpretationResult = {
      title: "Reserva Funcional (TSL5X)",
      label: time > 9.5 ? "Severamente Reduzida" : time >= 8.8 ? "Reduzida" : "Preservada",
      color: time > 9.5 ? "red" : time >= 8.8 ? "yellow" : "green",
      description: time > 9.5 
        ? "Tempo > 9.5s correlaciona-se a baixa tolerância ao esforço (TC6M < 300m)." 
        : time >= 8.8 
        ? "Tempo limítrofe (8.8s - 9.5s): sugere capacidade funcional reduzida."
        : "Tempo < 8.8s sugere boa reserva funcional cardiovascular."
    };

    const fallRisk: InterpretationResult = {
      title: "Risco de Queda / Fragilidade",
      label: time > 12 ? "Risco Aumentado" : "Baixo Risco",
      color: time > 12 ? "yellow" : "slate",
      description: "Tempos acima de 12s em idosos indicam maior risco de quedas e sarcopenia."
    };

    return [cardioPerf, fallRisk];
  };

  const handleSave = (data: any) => {
    const finalTime = data.time || parseFloat(observedTime);
    // No TSL5X, eficiência = (tempo_alvo / tempo_observado) * 100
    const efficiency = (predictedCIF / finalTime) * 100;

    setTestResults({
      ...testResults,
      tsl5x: {
        time: finalTime,
        predicted: predictedCIF,
        efficiency: efficiency,
        interpretation: data.results[0].label,
        hr: data.hr
      }
    });
  };

  return (
    <TimedTestTemplate
      title="Teste de Sentar e Levantar 5 Vezes (TSL5X)"
      description="Avaliação da força explosiva de MMII e reserva funcional aeróbica."
      interpretation={interpretation}
      predictedValue={predictedCIF}
      observedValueOverride={parseFloat(observedTime) || 0}
      invertCIFRatio={true} // Informa ao template que tempo menor é melhor
      onSave={handleSave}
      pearls={[
        "Ponto de corte de 8,8s a 9s identifica capacidade funcional reduzida em cardiopatas.",
        "MCID: Uma melhora clínica real é considerada com redução de ~2 segundos.",
        "O cronômetro deve parar quando o paciente encosta o tronco na cadeira pela 5ª vez."
      ]}
      reference="Fuentes-Abolafio IJ, et al. J Clin Med. 2022."
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-indigo-600 mb-4">
          <Info className="w-5 h-5" />
          <h3 className="font-bold">Parâmetros Biométricos</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Idade</label>
            <input
              type="number"
              value={patientInfo.age || ''}
              onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
              className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Sexo</label>
            <div className="flex gap-2">
              {['male', 'female'].map((s) => (
                <button
                  key={s}
                  onClick={() => setPatientInfo({ ...patientInfo, sex: s as 'male' | 'female' })}
                  className={`flex-1 py-2 rounded-xl font-bold border-2 transition-all ${
                    patientInfo.sex === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200'
                  }`}
                >
                  {s === 'male' ? 'M' : 'F'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Tempo de Execução (Segundos)</label>
          <input
            type="number"
            step="0.01"
            value={observedTime}
            onChange={(e) => setObservedTime(e.target.value)}
            placeholder="Insira o tempo (ex: 9.15)"
            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black text-slate-800 focus:border-indigo-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <p className="text-[10px] font-bold text-indigo-400 uppercase">Alvo Excelência</p>
            <p className="text-lg font-black text-indigo-700">{predictedCIF} s</p>
          </div>
          <div className="p-3 bg-red-50/50 rounded-xl border border-red-100">
            <p className="text-[10px] font-bold text-red-400 uppercase">Risco (Corte)</p>
            <p className="text-lg font-black text-red-700">9.5 s</p>
          </div>
        </div>
      </div>
    </TimedTestTemplate>
  );
};