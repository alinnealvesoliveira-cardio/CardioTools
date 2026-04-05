import React, { useState } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Info } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';

type Sex = 'M' | 'F';

export const TUG: React.FC = () => {
  const { patientInfo, updatePatientInfo, updateTestResults } = usePatient();

  const age = parseInt(patientInfo.age) || 65;
  const sex = patientInfo.sex === 'female' ? 'F' : 'M';
  const height = parseFloat(patientInfo.height) || 170;
  const weight = parseFloat(patientInfo.weight) || 70;
  const [observedTime, setObservedTime] = useState<string>('');

  const calculatePredictedFurlanetto = () => {
    // Equação de Furlanetto et al. (2022) - Tabela 4
    const sexVal = sex === 'M' ? 1 : 0;
    return 11.5 - (0.04 * height) + (0.02 * weight) + (0.04 * age) - (0.6 * sexVal);
  };

  const predictedFurlanetto = calculatePredictedFurlanetto();
  
  // Alvo de Excelência (Referência para CIF/OMS)
  // Ajustado para 7.0s para que tempos > 10.8s (Maior Risco IC)
  // caiam em zonas de deficiência mais severas na escala universal.
  const predictedCIF = 7.0;

  const interpretation = (_time: number, _count: number): InterpretationResult[] => {
    const time = parseFloat(observedTime);
    if (!time || time === 0) return [
      { title: "Mobilidade Funcional", label: "Aguardando", color: "slate", description: "Insira o tempo final do teste." }
    ];
    
    const mobility: InterpretationResult = {
      title: "Mobilidade Funcional",
      label: time < 10 ? "Independente" : time < 20 ? "Risco de Queda" : "Alto Risco de Queda",
      color: time < 10 ? "green" : time < 20 ? "yellow" : "red",
      description: time < 10 
        ? "Indivíduo independente, sem alterações de equilíbrio ou mobilidade." 
        : time < 20 
        ? "Indivíduo com mobilidade limitada e risco aumentado de quedas."
        : "Indivíduo com dependência funcional e alto risco de quedas."
    };

    const heartFailure: InterpretationResult = {
      title: "Capacidade Aeróbica (Prognóstico IC)",
      label: time < 10.8 ? "Menor Risco" : "Maior Risco",
      color: time < 10.8 ? "green" : "red",
      description: time < 10.8
        ? "Tempo < 10.8s está associado a melhor prognóstico em pacientes com IC."
        : "Tempo ≥ 10.8s é preditor independente de mortalidade e hospitalização por IC."
    };

    return [mobility, heartFailure];
  };

  const handleSave = (data: any) => {
    updateTestResults({
      tug: {
        time: data.time,
        interpretation: data.results[0].label,
        cif: data.cif ? {
          qualifier: data.cif.qualifier,
          severity: data.cif.severity
        } : undefined,
        hr: data.hr
      }
    });
  };

  return (
    <TimedTestTemplate
      title="Timed Up and Go (TUG)"
      description="Avalia a mobilidade funcional, equilíbrio dinâmico e risco de quedas."
      interpretation={interpretation}
      predictedValue={predictedCIF}
      observedValueOverride={parseFloat(observedTime) || 0}
      invertCIFRatio={true}
      onSave={handleSave}
      pearls={[
        "O teste inicia com o paciente sentado, levanta, caminha 3 metros, gira, volta e senta.",
        "O tempo é cronometrado desde o sinal de 'já' até o paciente sentar novamente.",
        "Pode ser realizado com o calçado habitual e dispositivo de auxílio à marcha.",
        "Em pacientes com Insuficiência Cardíaca, o TUG é um forte preditor de eventos adversos."
      ]}
      pitfalls={[
        "Não incentive o paciente a correr; ele deve caminhar em passo rápido e seguro.",
        "Certifique-se de que a cadeira esteja encostada na parede para evitar deslizamentos."
      ]}
      reference="Podsiadlo D, Richardson S. J Am Geriatr Soc. 1991; Furlanetto KC, et al. Arch Phys Med Rehabil. 2022; Kamiya K, et al. J Card Fail. 2016 (https://doi.org/10.1016/j.cardfail.2015.09.018)."
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-vitality-lime mb-4">
          <Info className="w-5 h-5" />
          <h3 className="font-bold">Perfil do Paciente (Contexto Clínico)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Idade (anos)</label>
            <input
              type="number"
              value={Number.isNaN(parseInt(patientInfo.age)) ? '' : patientInfo.age}
              onChange={(e) => updatePatientInfo({ age: e.target.value })}
              placeholder="Ex: 65"
              className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-vitality-lime outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Sexo</label>
            <div className="flex gap-4">
              {(['M', 'F'] as Sex[]).map((s) => (
                <button
                  key={s}
                  onClick={() => updatePatientInfo({ sex: s === 'M' ? 'male' : 'female' })}
                  className={`flex-1 py-2 rounded-xl font-bold transition-all border-2 ${
                    sex === s 
                      ? 'bg-vitality-lime text-slate-900 border-vitality-lime' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-vitality-lime/30'
                  }`}
                >
                  {s === 'M' ? 'Masculino' : 'Feminino'}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Altura (cm)</label>
            <input
              type="number"
              value={Number.isNaN(height) ? '' : height}
              onChange={(e) => updatePatientInfo({ height: e.target.value })}
              className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-vitality-lime outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Peso (kg)</label>
            <input
              type="number"
              value={Number.isNaN(weight) ? '' : weight}
              onChange={(e) => updatePatientInfo({ weight: e.target.value })}
              className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-vitality-lime outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tempo Observado (segundos)</label>
          <input
            type="number"
            step="0.01"
            value={observedTime}
            onChange={(e) => setObservedTime(e.target.value)}
            placeholder="Ex: 8.5"
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-bold text-slate-800 focus:border-vitality-lime outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Predito (Furlanetto)</div>
            <div className="text-sm font-bold text-slate-700">{predictedFurlanetto.toFixed(1)} s</div>
          </div>
          <div className="p-2 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Alvo Clínico</div>
            <div className="text-sm font-bold text-slate-700">10.8 s</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Média Ref.</div>
            <div className="text-sm font-bold text-slate-700">8.2 ± 1.8 s</div>
          </div>
        </div>
      </div>
    </TimedTestTemplate>
  );
};
