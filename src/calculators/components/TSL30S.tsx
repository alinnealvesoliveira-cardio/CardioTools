import React from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Info } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';

export const TSL30S: React.FC = () => {
  const { patientInfo, setPatientInfo, testResults, setTestResults } = usePatient();

  const age = parseInt(patientInfo.age as string) || 65;
  const sex = patientInfo.sex === 'female' ? 'F' : 'M';

  // Alvo de Excelência (Rikli & Jones) - Referência para cálculo de eficiência
  const predictedValue = 18; 

  const interpretation = (_time: number, count: number): InterpretationResult[] => {
    if (count === 0) return [{ 
      title: "Capacidade Funcional", 
      label: "Aguardando", 
      color: "slate", 
      description: "Inicie o teste e registre as repetições." 
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
          ? `Abaixo do corte crítico nacional (${cutoff} rep). Indica risco de perda de autonomia.` 
          : `Desempenho satisfatório (≥ ${cutoff} rep). Baixo risco de incapacidade funcional.`
      },
      {
        title: "Eficiência Funcional",
        label: `${efficiency.toFixed(0)}% do Alvo`,
        color: "slate",
        description: "Comparação com o alvo de excelência de 18 repetições."
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
      description="Avaliação da força de membros inferiores e risco de incapacidade funcional."
      timerDuration={30}
      hasCounter={true}
      counterLabel="Repetições Completas"
      interpretation={interpretation}
      predictedValue={predictedValue}
      onSave={handleSave}
      pearls={[
        "Protocolo Rikli & Jones (2013) para rastreio de sarcopenia e fragilidade.",
        "Corte Crítico Nacional: < 12 (Homens) e < 11 (Mulheres).",
        "Resultados abaixo do corte exigem intervenção de força muscular."
      ]}
      pitfalls={[
        "Não permitir que o paciente impulsione o corpo com os braços.",
        "A contagem só é válida se o paciente completar a extensão de quadril/joelho."
      ]}
      reference="Rikli RE, Jones CJ. 2013; Furlanetto et al., 2022."
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-indigo-600 mb-4">
          <Info className="w-5 h-5" />
          <h3 className="font-bold">Perfil Biométrico</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Idade (anos)</label>
            <input
              type="number"
              value={patientInfo.age || ''}
              onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
              className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Sexo</label>
            <div className="flex gap-4">
              {['male', 'female'].map((s) => (
                <button
                  key={s}
                  onClick={() => setPatientInfo({ ...patientInfo, sex: s as 'male' | 'female' })}
                  className={`flex-1 py-2 rounded-xl font-bold transition-all border-2 ${
                    patientInfo.sex === s 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {s === 'male' ? 'Masc' : 'Fem'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Corte Crítico</p>
            <p className="text-lg font-black text-slate-700">{sex === 'M' ? '12' : '11'} <span className="text-xs">rep</span></p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alvo Excelência</p>
            <p className="text-lg font-black text-slate-700">18 <span className="text-xs">rep</span></p>
          </div>
        </div>
      </div>
    </TimedTestTemplate>
  );
};