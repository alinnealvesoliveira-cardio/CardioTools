import React from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Info, BookOpen, AlertCircle } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';

export const TSL1M: React.FC = () => {
  const { patientInfo, setPatientInfo, testResults, setTestResults } = usePatient();

  // Tratamento de dados com fallbacks seguros
  const age = parseInt(patientInfo.age as string) || 60;
  const sex = patientInfo.sex === 'female' ? 'F' : 'M';
  const height = parseFloat(patientInfo.height as string) || 170;
  const weight = parseFloat(patientInfo.weight as string) || 70;
  const bmi = weight / ((height / 100) ** 2);

  /**
   * CÁLCULO DO PREDITO - EQUAÇÃO BRASILEIRA
   * Referência: Furlanetto KC, et al. (2022) 
   * Fórmula: 60,6 - (0,36 x Idade) - (2,8 x sexo) - (0,31 x IMC)
   * Sexo: Masculino = 0 | Feminino = 1
   */
  const calculatePredictedFurlanetto = () => {
    const sexVal = sex === 'F' ? 1 : 0;
    const predicted = 60.6 - (0.36 * age) - (2.8 * sexVal) - (0.31 * bmi);
    return predicted > 0 ? predicted : 0;
  };

  const predictedFurlanetto = calculatePredictedFurlanetto();

  const interpretation = (_time: number, count: number): InterpretationResult[] => {
    if (count === 0) return [{ 
      title: "Resistência de MMII", 
      label: "Aguardando teste", 
      color: "slate", 
      description: "Inicie o teste e registre as repetições completas com braços cruzados." 
    }];
    
    const efficiency = (count / predictedFurlanetto) * 100;

    return [
      {
        title: "Resistência Funcional (TSL1M)",
        label: efficiency < 80 ? "Reduzida" : "Preservada",
        color: efficiency < 80 ? "red" : "green",
        description: efficiency < 80
          ? `Desempenho de ${efficiency.toFixed(0)}% do predito. Indica redução da capacidade funcional de membros inferiores.` 
          : `Desempenho de ${efficiency.toFixed(0)}% do predito. Resultado dentro da normalidade para brasileiros.`
      },
      {
        title: "Diferença Clínica (MDC)",
        label: "Referência: 1.1 rep",
        color: "slate",
        description: "Ganhos reais na reabilitação cardíaca devem ser > 1.1 repetições (Nguyen, 2025)."
      }
    ];
  };

  const handleSave = (data: any) => {
    const efficiency = (data.count / predictedFurlanetto) * 100;

    setTestResults({
      ...testResults,
      tsl1m: {
        count: data.count,
        predicted: predictedFurlanetto,
        efficiency: efficiency,
        interpretation: data.results[0].label,
        hr: data.hr
      }
    });
  };

  return (
    <TimedTestTemplate
      title="Teste de Sentar e Levantar (1 Minuto)"
      description="Avaliação da resistência muscular periférica e endurance funcional."
      timerDuration={60}
      hasCounter={true}
      counterLabel="Repetições Completas"
      interpretation={interpretation}
      predictedValue={predictedFurlanetto}
      onSave={handleSave}
      pearls={[
        "A equação de Furlanetto (2022) é validada especificamente para a população brasileira.",
        "Equação: 60,6 - (0,36 x Idade) - (2,8 x sexo) - (0,31 x IMC).",
        "MDC: 1.1 repetições é o corte para melhora clínica real em cardiopatas."
      ]}
      pitfalls={[
        "O paciente deve desencostar o glúteo da cadeira e estender o quadril totalmente.",
        "Uso dos braços invalida o teste.",
        "Ajustar altura da cadeira para aproximadamente 45cm."
      ]}
      reference="Furlanetto KC, et al. Braz J Phys Ther. 2022; Nguyen et al. 2025."
    >
      <div className="space-y-6">
        {/* Card Informativo da Referência */}
        <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex gap-3 items-start">
          <BookOpen className="text-indigo-600 shrink-0 mt-1" size={18} />
          <div>
            <h3 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Referência Técnica</h3>
            <p className="text-[11px] text-indigo-800/80 italic leading-relaxed">
              Equação de Predição Brasileira: Furlanetto KC, et al. "Reference values for the 1-minute sit-to-stand test in healthy subjects and its validity in patients with chronic diseases", 2022.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase">Idade do Paciente</label>
            <input
              type="number"
              value={patientInfo.age || ''}
              onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
              className="w-full p-3 rounded-xl border-2 border-slate-100 outline-none focus:border-indigo-500 font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase">Sexo</label>
            <div className="flex gap-2">
              {['male', 'female'].map((s) => (
                <button
                  key={s}
                  onClick={() => setPatientInfo({ ...patientInfo, sex: s as 'male' | 'female' })}
                  className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all text-xs ${
                    patientInfo.sex === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-100'
                  }`}
                >
                  {s === 'male' ? 'MASCULINO' : 'FEMININO'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resultados de Predição */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-900 rounded-2xl shadow-xl">
            <p className="text-[9px] font-bold text-indigo-400 uppercase mb-1">Predito (Furlanetto)</p>
            <p className="text-3xl font-black text-white">{predictedFurlanetto.toFixed(1)} <span className="text-xs font-normal opacity-50">REP</span></p>
          </div>
          <div className="p-4 bg-white rounded-2xl border-2 border-slate-50 flex flex-col justify-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">IMC Atual</p>
            <p className="text-xl font-black text-slate-700">{bmi.toFixed(1)} <span className="text-[10px] font-normal text-slate-400 italic">kg/m²</span></p>
          </div>
        </div>

        <div className="flex gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
          <AlertCircle className="text-amber-600 shrink-0" size={16} />
          <p className="text-[10px] text-amber-800 leading-tight">
            <strong>Nota Biomecânica:</strong> Em indivíduos com obesidade grau II ou III, a fadiga de quadríceps pode subestimar a capacidade cardiovascular real.
          </p>
        </div>
      </div>
    </TimedTestTemplate>
  );
};