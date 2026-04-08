import React from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Info, ShieldAlert, Award } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';

export const TSL30S: React.FC = () => {
  const { patientInfo, setPatientInfo, testResults, setTestResults } = usePatient();

  const age = parseInt(patientInfo.age as string) || 65;
  const sex = patientInfo.sex === 'female' ? 'F' : 'M';

  // Alvo de Excelência (Rikli & Jones, 2013)
  const predictedValue = 18; 

  const interpretation = (_time: number, count: number): InterpretationResult[] => {
    if (count === 0) return [{ 
      title: "Força de Resistência", 
      label: "Aguardando", 
      color: "slate", 
      description: "Inicie o teste. Conte as repetições completas em 30 segundos." 
    }];
    
    // Pontos de corte críticos brasileiros (Furlanetto et al., 2022)
    const cutoff = sex === 'M' ? 12 : 11;
    const efficiency = (count / predictedValue) * 100;
    
    return [
      {
        title: "Risco de Incapacidade (TSL30S)",
        label: count < cutoff ? "Risco Aumentado" : "Baixo Risco",
        color: count < cutoff ? "red" : "green",
        description: count < cutoff 
          ? `Desempenho abaixo do corte para brasileiros (< ${cutoff} rep). Indica fragilidade física.` 
          : `Resultado satisfatório. O paciente demonstra força funcional preservada.`
      },
      {
        title: "Nível de Excelência",
        label: `${efficiency.toFixed(0)}% do Alvo`,
        color: efficiency >= 100 ? "green" : "slate",
        description: "Comparação com o benchmark de 18 repetições para funcionalidade plena."
      }
    ];
  };

  const handleSave = (data: any) => {
    const efficiency = (data.count / predictedValue) * 100;

    setTestResults({
      ...testResults,
      tsl30s: {
        count: data.count,
        predicted: predictedValue,
        efficiency: efficiency,
        interpretation: data.results[0].label,
        hr: data.hr
      }
    });
  };

  return (
    <TimedTestTemplate
      title="Teste de Sentar e Levantar (30 Segundos)"
      description="Rastreio de força funcional, sarcopenia e risco de incapacidade física."
      timerDuration={30}
      hasCounter={true}
      counterLabel="Repetições Completas"
      interpretation={interpretation}
      predictedValue={predictedValue}
      onSave={handleSave}
      pearls={[
        "Furlanetto (2022) estabeleceu cortes para brasileiros: 12 (M) e 11 (F).",
        "Essencial para diagnóstico de Sarcopenia conforme o consenso europeu.",
        "Diferente do teste de 1 min, este foca menos na exaustão e mais na força muscular rápida."
      ]}
      reference="Rikli RE, Jones CJ. 2013; Furlanetto KC, et al. 2022."
    >
      <div className="space-y-6">
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3 items-start">
          <ShieldAlert className="text-amber-600 shrink-0 mt-1" size={18} />
          <p className="text-[11px] text-amber-900 leading-tight">
            <strong>Uso Clínico:</strong> Utilize este teste para rastrear <strong>Fragilidade</strong> em idosos ou cardiopatas que não toleram o teste de 1 minuto.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Idade</label>
            <input
              type="number"
              value={patientInfo.age || ''}
              onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
              className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sexo</label>
            <div className="flex gap-2">
              {['male', 'female'].map((s) => (
                <button
                  key={s}
                  onClick={() => setPatientInfo({ ...patientInfo, sex: s as 'male' | 'female' })}
                  className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all text-xs ${
                    patientInfo.sex === s 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}
                >
                  {s === 'male' ? 'MASC' : 'FEM'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <Award size={14} className="text-emerald-500" />
              <p className="text-[10px] font-bold text-slate-400 uppercase">Corte Crítico</p>
            </div>
            <p className="text-2xl font-black text-slate-700">{sex === 'M' ? '12' : '11'} <span className="text-xs font-normal">rep</span></p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
             <div className="flex items-center gap-2 mb-1">
              <Info size={14} className="text-indigo-500" />
              <p className="text-[10px] font-bold text-slate-400 uppercase">Alvo Ideal</p>
            </div>
            <p className="text-2xl font-black text-slate-700">18 <span className="text-xs font-normal">rep</span></p>
          </div>
        </div>
      </div>
    </TimedTestTemplate>
  );
};