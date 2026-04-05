import React, { useState } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Info } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';

export const TD2M: React.FC = () => {
  const { patientInfo, updatePatientInfo, updateTestResults } = usePatient();

  const age = parseInt(patientInfo.age) || 65;
  const sex = patientInfo.sex === 'female' ? 'F' : 'M';
  const height = parseFloat(patientInfo.height) || 170;
  const weight = parseFloat(patientInfo.weight) || 70;

  const bmi = weight / ((height / 100) ** 2);

  const calculatePredictedRikli = () => {
    // Fórmulas de predição (Langhammer & Stanghelle, 2019; Rikli & Jones, 2013)
    if (sex === 'M') {
      return 143.297 - (1.157 * age) - (0.334 * bmi);
    } else {
      return 118.773 - (0.832 * age) - (0.472 * bmi);
    }
  };

  const predictedRikli = calculatePredictedRikli();
  const epe = 6; // Erro Padrão de Estimativa (média de 5-7 passos)
  const lin = predictedRikli - (epe * 1.645); // Limite Inferior de Normalidade
  const mcid = 14; // Diferença Mínima Clinicamente Importante

  const getNormativeRange = (age: number, sex: 'M' | 'F') => {
    if (age < 60) return null;
    if (age <= 64) return sex === 'M' ? [87, 115] : [75, 107];
    if (age <= 69) return sex === 'M' ? [86, 116] : [73, 107];
    if (age <= 74) return sex === 'M' ? [80, 110] : [68, 101];
    if (age <= 79) return sex === 'M' ? [73, 109] : [68, 100];
    if (age <= 84) return sex === 'M' ? [71, 103] : [60, 90];
    if (age <= 89) return sex === 'M' ? [59, 91] : [55, 85];
    if (age <= 94) return sex === 'M' ? [52, 86] : [44, 72];
    return null;
  };

  const normativeRange = getNormativeRange(age, sex);

  const interpretation = (_time: number, count: number): InterpretationResult[] => {
    if (count === 0) return [{ title: "Capacidade Aeróbica", label: "Aguardando contagem", color: "slate" as const, description: "Inicie o teste e conte as elevações do joelho direito." }];
    
    const normative = normativeRange 
      ? (count >= normativeRange[0] ? (count > normativeRange[1] ? "Acima do Normal" : "Normal") : "Abaixo do Normal")
      : "Sem dados normativos";

    const aerobic: InterpretationResult = {
      title: "Capacidade Aeróbica (TD2M)",
      label: count < lin ? "Abaixo do LIN" : normative,
      color: count < lin ? "red" : (normative === "Normal" || normative === "Acima do Normal" ? "green" : "yellow"),
      description: count < lin 
        ? `Desempenho abaixo do Limite Inferior de Normalidade (${lin.toFixed(0)} passos). Indica redução significativa da capacidade funcional.` 
        : normative === "Normal" 
        ? "Desempenho dentro da faixa esperada para a idade e sexo segundo Rikli & Jones (2013)."
        : normative === "Acima do Normal"
        ? "Desempenho superior à média para a faixa etária."
        : "Desempenho abaixo dos percentis normativos, mas acima do limite inferior estatístico."
    };

    const improvement: InterpretationResult = {
      title: "Análise de Melhora (MCID)",
      label: "Referência: 14 passos",
      color: "slate",
      description: "Para considerar uma melhora real pós-reabilitação em cardiopatas, o aumento deve ser ≥ 14 passos. Ganhos menores podem ser efeito de aprendizado."
    };

    return [aerobic, improvement];
  };

  const handleSave = (data: any) => {
    updateTestResults({
      td2m: {
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
      title="Teste de Marcha Estacionária de 2 Minutos (TD2M)"
      description="Avaliação da resistência aeróbica funcional através de tabelas normativas ou fórmulas de predição (Rikli & Jones, 2013)."
      timerDuration={120}
      hasCounter={true}
      counterLabel="Elevações do Joelho Direito"
      interpretation={interpretation}
      predictedValue={predictedRikli}
      onSave={handleSave}
      pearls={[
        "O TD2M pode ser realizado através de Tabelas Normativas (percentis) ou fórmulas de predição (Idade e IMC).",
        "O Erro Padrão de Estimativa (EPE) é de 5 a 7 passos, definindo a variação natural da performance.",
        "A Diferença Mínima Clinicamente Importante (MCID) é de 14 passos para pacientes cardiopatas.",
        "O Limite Inferior de Normalidade (LIN) é calculado como: Predito - (EPE x 1,645)."
      ]}
      pitfalls={[
        "Certifique-se de que o paciente atinja a altura correta do joelho (ponto médio entre patela e crista ilíaca).",
        "Interrompa se houver sinais de exaustão extrema, dor precordial ou arritmias.",
        "Ganhos < 14 passos podem ser atribuídos ao efeito de aprendizado ou erro de medida."
      ]}
      reference="Rikli RE, Jones CJ. Senior Fitness Test Manual. 2013; Langhammer & Stanghelle, 2019; Campos et al., 2023; Paker et al., 2025."
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-vitality-lime mb-4">
          <Info className="w-5 h-5" />
          <h3 className="font-bold">Contexto Clínico e Biométrico</h3>
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
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Predito (Rikli & Jones)</div>
            <div className="text-sm font-bold text-slate-700">{predictedRikli.toFixed(1)} passos</div>
          </div>
          <div className="p-2 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">LIN (EPE x 1.645)</div>
            <div className="text-sm font-bold text-slate-700">{lin.toFixed(0)} passos</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Normativo (Percentil)</div>
            <div className="text-sm font-bold text-slate-700">
              {normativeRange ? `${normativeRange[0]} - ${normativeRange[1]}` : '--'}
            </div>
          </div>
          <div className="p-2 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">MCID (Melhora Real)</div>
            <div className="text-sm font-bold text-slate-700">+14 passos</div>
          </div>
        </div>
      </div>
    </TimedTestTemplate>
  );
};
