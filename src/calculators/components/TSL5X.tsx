import React, { useState } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Info } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';

type Sex = 'M' | 'F';

export const TSL5X: React.FC = () => {
  const { patientInfo, updatePatientInfo, updateTestResults } = usePatient();

  const age = parseInt(patientInfo.age) || 65;
  const sex = patientInfo.sex === 'female' ? 'F' : 'M';
  const height = parseFloat(patientInfo.height) || 170;
  const weight = parseFloat(patientInfo.weight) || 70;
  const [observedTime, setObservedTime] = useState<string>('');

  const calculatePredictedFurlanetto = () => {
    // Equação de Furlanetto et al. (2022) - Tabela 4
    const sexVal = sex === 'M' ? 1 : 0;
    return 15.8 - (0.05 * height) + (0.03 * weight) + (0.08 * age) - (0.6 * sexVal);
  };

  const predictedFurlanetto = calculatePredictedFurlanetto();
  
  // Alvo de Excelência (Referência para CIF/OMS)
  // Ajustado para 4.8s para que o ponto de corte de 9.5s (Severo) 
  // corresponda a < 50% da função na escala universal da CIF/OMS.
  const predictedCIF = 4.8; 

  const interpretation = (_time: number): InterpretationResult[] => {
    const time = parseFloat(observedTime) || _time;
    if (time === 0) return [
      { title: "Capacidade Aeróbica", label: "Aguardando", color: "slate", description: "Inicie o teste ou insira o tempo." }
    ];
    
    const cardioPerf: InterpretationResult = {
      title: "Capacidade Aeróbica (TSL5X)",
      label: time > 9.5 ? "Severamente Reduzida" : time >= 8.8 ? "Reduzida" : "Preservada",
      color: time > 9.5 ? "red" : time >= 8.8 ? "yellow" : "green",
      description: time > 9.5 
        ? "Tempo > 9.5s: Correlaciona-se a distâncias < 300m no TC6M (Capacidade severamente reduzida)." 
        : time >= 8.8 
        ? "Tempo entre 8.8s e 9s: Identifica indivíduos com capacidade funcional reduzida (TC6M < 400m)."
        : "Tempo < 8.8s: Sugere capacidade funcional preservada (TC6M > 400m)."
    };

    const fallRisk: InterpretationResult = {
      title: "Risco de Queda / Fragilidade",
      label: time > 12 ? "Risco Aumentado" : "Baixo Risco",
      color: time > 12 ? "yellow" : "slate",
      description: "Em idosos, tempos > 12-15s identificam risco de quedas e fragilidade. Em cardiopatas, o teste é mais sensível para reserva funcional."
    };

    return [cardioPerf, fallRisk];
  };

  const handleSave = (data: any) => {
    updateTestResults({
      tsl5x: {
        time: data.time || parseFloat(observedTime),
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
      title="Teste de Sentar e Levantar 5 Vezes (TSL5X)"
      description="Avaliação da força explosiva, equilíbrio dinâmico e reserva funcional (Fuentes 2022)."
      interpretation={interpretation}
      predictedValue={predictedCIF}
      observedValueOverride={parseFloat(observedTime) || 0}
      invertCIFRatio={true}
      onSave={handleSave}
      pearls={[
        "Em cardiopatas, o ponto de corte de 8,8s a 9s identifica capacidade funcional reduzida.",
        "Tempo > 9,5s correlaciona-se com distância < 300m no TC6M.",
        "Uma redução de ~2 segundos no tempo de execução é aceita como MCID.",
        "O erro padrão de medida para essa população flutua entre 0,5 e 1,0 segundo."
      ]}
      pitfalls={[
        "Tempos > 12-15s em idosos indicam fragilidade, mas em cardiopatas o teste é mais sensível.",
        "Fatores biomecânicos influenciam o tempo independentemente da reserva cardiovascular.",
        "Ganhos discretos (< 2s) exigem cautela na interpretação devido ao erro de medida."
      ]}
      reference="Fuentes-Abolafio IJ, et al. J Clin Med. 2022; Albalwi & Alharbi, 2023; Fuentes-Abolafio et al., 2022c."
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
              value={patientInfo.height || ''}
              onChange={(e) => updatePatientInfo({ height: e.target.value })}
              className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-vitality-lime outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Peso (kg)</label>
            <input
              type="number"
              value={patientInfo.weight || ''}
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
            placeholder="Ex: 8.85"
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-bold text-slate-800 focus:border-vitality-lime outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Alvo Clínico (Fuentes)</div>
            <div className="text-sm font-bold text-slate-700">8.8 s</div>
          </div>
          <div className="p-2 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">MCID</div>
            <div className="text-sm font-bold text-slate-700">-2.0 s</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Erro Padrão</div>
            <div className="text-sm font-bold text-slate-700">0.5 - 1.0 s</div>
          </div>
          <div className="p-2 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Corte Severo</div>
            <div className="text-sm font-bold text-slate-700">9.5 s</div>
          </div>
        </div>
      </div>
    </TimedTestTemplate>
  );
};
