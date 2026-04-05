import React, { useState } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Info } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';

export const TSL1M: React.FC = () => {
  const { patientInfo, updatePatientInfo, updateTestResults } = usePatient();

  const age = parseInt(patientInfo.age) || 60;
  const sex = patientInfo.sex === 'female' ? 'F' : 'M';
  const height = parseFloat(patientInfo.height) || 170;
  const weight = parseFloat(patientInfo.weight) || 70;

  const bmi = weight / ((height / 100) ** 2);

  const calculatePredictedFurlanetto = () => {
    // TSL1pred = 60,6 - (0,36 x Idade) - (2,8 x sexo) - (0,31 x IMC)
    // Sexo: 0 Homem e 1 Mulher
    const sexVal = sex === 'M' ? 0 : 1;
    return 60.6 - (0.36 * age) - (2.8 * sexVal) - (0.31 * bmi);
  };

  const predictedFurlanetto = calculatePredictedFurlanetto();
  const mdc = 1.1; // MDC para pacientes com IC (Nguyen et al., 2025)

  const interpretation = (_time: number, count: number): InterpretationResult[] => {
    if (count === 0) return [{ title: "Capacidade Aeróbica", label: "Aguardando contagem", color: "slate" as const, description: "Inicie o teste e conte as repetições completas." }];
    
    const aerobic: InterpretationResult = {
      title: "Capacidade Aeróbica (TSL1M)",
      label: count < (predictedFurlanetto * 0.8) ? "Reduzida" : "Preservada",
      color: count < (predictedFurlanetto * 0.8) ? "red" : "green",
      description: count < (predictedFurlanetto * 0.8)
        ? "Desempenho abaixo do esperado para a idade e IMC." 
        : "Desempenho compatível com o predito para adultos saudáveis."
    };

    const clinicalNote: InterpretationResult = {
      title: "Nota Clínica (VO2)",
      label: "Estimativa Conflitante",
      color: "slate",
      description: "A estimativa do VO2 pico a partir do TSL é conflitante devido a variáveis biomecânicas. Optou-se por não converter em VO2 predito (Fuentes-Abolafio 2022)."
    };

    return [aerobic, clinicalNote];
  };

  const handleSave = (data: any) => {
    updateTestResults({
      tsl1m: {
        count: data.count,
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
      title="Teste de Sentar e Levantar (1 Minuto)"
      description="Avalia a resistência de membros inferiores e capacidade funcional."
      timerDuration={60}
      hasCounter={true}
      interpretation={interpretation}
      predictedValue={predictedFurlanetto}
      onSave={handleSave}
      pearls={[
        "TSL1pred = 60,6 - (0,36 x Idade) - (2,8 x sexo) - (0,31 x IMC).",
        "A MDC para pacientes com Insuficiência Cardíaca é de 1,1 repetição.",
        "O desempenho sofre forte influência biomecânica (sobrepeso/obesidade).",
        "Ganhos reais na reabilitação devem superar a MDC e considerar o erro de medida."
      ]}
      pitfalls={[
        "Não converter o resultado em VO2 predito (falta de poder estatístico conclusivo).",
        "O paciente não deve usar os braços para apoio.",
        "A fadiga muscular local pode limitar o teste antes da reserva cardiovascular."
      ]}
      reference="Furlanetto KC, et al. Arch Phys Med Rehabil. 2022; Nguyen et al. 2025; Fuentes-Abolafio et al. 2022b."
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-vitality-lime mb-4">
          <Info className="w-5 h-5" />
          <h3 className="font-bold">Dados do Paciente (para Predição)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Idade (anos)</label>
            <input
              type="number"
              value={Number.isNaN(parseInt(patientInfo.age)) ? '' : patientInfo.age}
              onChange={(e) => updatePatientInfo({ age: e.target.value })}
              placeholder="Ex: 60"
              className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-vitality-lime outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Sexo</label>
            <div className="flex gap-4">
              {['M', 'F'].map((s) => (
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

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Predito (Furlanetto)</div>
            <div className="text-sm font-bold text-slate-700">{predictedFurlanetto.toFixed(1)} rep</div>
          </div>
          <div className="p-2 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">MDC (IC)</div>
            <div className="text-sm font-bold text-slate-700">{mdc} rep</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">IMC</div>
            <div className="text-sm font-bold text-slate-700">{bmi.toFixed(1)} kg/m²</div>
          </div>
          <div className="p-2 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">EPE</div>
            <div className="text-sm font-bold text-slate-700">~1 rep</div>
          </div>
        </div>
      </div>
    </TimedTestTemplate>
  );
};
