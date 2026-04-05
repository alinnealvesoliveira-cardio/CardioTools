import React, { useState } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Info } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';

export const TSL30S: React.FC = () => {
  const { patientInfo, updatePatientInfo, updateTestResults } = usePatient();

  const age = parseInt(patientInfo.age) || 65;
  const sex = patientInfo.sex === 'female' ? 'F' : 'M';

  const interpretation = (_time: number, count: number): InterpretationResult[] => {
    if (count === 0) return [{ title: "Capacidade Aeróbica", label: "Aguardando contagem", color: "slate" as const, description: "Inicie o teste e conte as repetições completas." }];
    
    // Pontos de corte brasileiros (Furlanetto et al., 2022)
    const cutoff = sex === 'M' ? 12 : 11;
    
    const aerobic: InterpretationResult = {
      title: "Risco de Incapacidade Funcional",
      label: count < cutoff ? "Risco Aumentado" : "Baixo Risco",
      color: count < cutoff ? "red" : "green",
      description: count < cutoff 
        ? `Desempenho < ${cutoff} repetições: Ponto de corte crítico para risco de incapacidade funcional no contexto brasileiro.` 
        : `Desempenho ≥ ${cutoff} repetições: Acima do ponto de corte crítico para incapacidade funcional.`
    };

    return [aerobic];
  };

  const handleSave = (data: any) => {
    updateTestResults({
      tsl30s: {
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

  const predictedValue = 18; // Alvo de Excelência (Rikli & Jones)

  return (
    <TimedTestTemplate
      title="Teste de Sentar e Levantar (30 Segundos)"
      description="Avalia a força e resistência de membros inferiores em idosos."
      timerDuration={30}
      hasCounter={true}
      interpretation={interpretation}
      predictedValue={predictedValue}
      onSave={handleSave}
      pearls={[
        "Protocolo amplamente utilizado em idosos (Rikli & Jones, 2013).",
        "No Brasil, os pontos de corte críticos são < 12 (homens) e < 11 (mulheres).",
        "O teste avalia a força explosiva e resistência muscular local."
      ]}
      pitfalls={[
        "O paciente não deve usar os braços para auxílio.",
        "Certifique-se de que a cadeira está encostada na parede para segurança."
      ]}
      reference="Rikli RE, Jones CJ. Senior Fitness Test Manual. 2013; Furlanetto et al., 2022."
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-vitality-lime mb-4">
          <Info className="w-5 h-5" />
          <h3 className="font-bold">Perfil do Paciente</h3>
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
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Corte Crítico (M)</div>
            <div className="text-sm font-bold text-slate-700">12 rep</div>
          </div>
          <div className="p-2 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Corte Crítico (F)</div>
            <div className="text-sm font-bold text-slate-700">11 rep</div>
          </div>
        </div>
      </div>
    </TimedTestTemplate>
  );
};
