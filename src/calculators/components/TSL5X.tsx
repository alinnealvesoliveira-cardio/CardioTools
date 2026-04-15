import React, { useState } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Info, BookOpen, Activity, Save, CheckCircle2, ChevronRight, AlertTriangle, LayoutDashboard } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const TSL5X: React.FC = () => {
  const { patientInfo, testResults, updateTestResults } = usePatient();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [observedTime, setObservedTime] = useState<string>('');

  const [postFadiga, setPostFadiga] = useState<number | null>(null);
  const [postAngina, setPostAngina] = useState<number | null>(null);

  const predictedValue = 9.0; 

  const interpretation = (_time: number): InterpretationResult[] => {
    const time = parseFloat(observedTime) || _time;
    if (time === 0) return [
      { title: "Força Muscular", label: "Aguardando", color: "slate", description: "Inicie o teste para avaliar a potência de MMII." }
    ];
    
    const functionalPerf: InterpretationResult = {
      title: "Reserva Funcional e Potência",
      label: time > 12 ? "Deficiência Moderada/Grave" : time > 9 ? "Deficiência Leve" : "Desempenho Preservado",
      color: time > 12 ? "red" : time > 9 ? "yellow" : "green",
      description: time > 12 
        ? "Tempo elevado (>12s): Forte preditor de fragilidade e risco de quedas em cardiopatas." 
        : "Tempo dentro da normalidade para a funcionalidade diária."
    };

    return [functionalPerf];
  };

  const handleGlobalSave = () => {
    const finalTime = parseFloat(observedTime);
    
    if (isNaN(finalTime) || finalTime <= 0) {
      toast.error("Por favor, insira um tempo válido.");
      return;
    }

    let efficiency = 100;
    if (finalTime > 15) efficiency = 20;      
    else if (finalTime > 12) efficiency = 45; 
    else if (finalTime > 9) efficiency = 70;  
    else if (finalTime > 0) efficiency = 95;  

    const currentScales = testResults?.fatigabilityScales || { 
      rest: { dyspnea: 0, fatigue: 0 }, 
      exercise: { dyspnea: 0, fatigue: 0 } 
    };

    updateTestResults({
      sitToStandTest: {
        time: finalTime,
        predicted: predictedValue,
        efficiency: efficiency,
        interpretation: interpretation(finalTime)[0].label,
        restingHR: testResults?.sitToStandTest?.restingHR || 0,
        peakHR: testResults?.sitToStandTest?.peakHR || 0
      },
      fatigabilityScales: {
        ...currentScales,
        exercise: { 
          ...currentScales.exercise, 
          fatigue: postFadiga || 0 
        }
      },
      symptoms: {
        ...testResults?.symptoms,
        angina: {
          type: postAngina && postAngina > 0 ? 'stable' : 'none',
          description: postAngina ? `Angina Grau ${postAngina} durante TSL5X` : 'Sem sintomas anginosos'
        }
      }
    });

    setIsSaved(true);
    toast.success("Dados salvos com sucesso!");
  };

  return (
    /* AJUSTE DE CSS: pb-60 para garantir que o conteúdo longo não cubra os botões */
    <div className="max-w-4xl mx-auto pb-60 relative"> 
      <TimedTestTemplate
        title="Teste de Sentar e Levantar (5 Vezes)"
        description="Avalia a potência muscular de membros inferiores e a reserva funcional."
        interpretation={interpretation}
        predictedValue={predictedValue}
        observedValueOverride={parseFloat(observedTime) || 0}
        invertCIFRatio={true} 
        onSave={handleGlobalSave}
        pearls={[
          "Ponto de corte para risco: > 12 segundos em populações clínicas.",
          "O paciente deve manter os braços cruzados sobre o peito durante todo o teste.",
          "Utilizar cadeira padrão (aprox. 43-45cm) sem apoio de braços."
        ]}
        reference="Fuentes-Abolafio IJ, et al. J Clin Med. 2022."
      >
        <div className="space-y-6 px-4">
          <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-3xl">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={16} className="text-indigo-600" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Fundamentação Científica</h3>
            </div>
            <p className="text-[11px] leading-relaxed text-indigo-900 font-medium">
              O TSL5X é um biomarcador de força explosiva. Em coronariopatas, tempos elevados estão correlacionados com menor capacidade funcional.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tempo Total Observado (s)</label>
            <input
              type="number"
              step="0.01"
              value={observedTime}
              onChange={(e) => {
                setObservedTime(e.target.value);
                setIsSaved(false);
              }}
              placeholder="0.00"
              className="w-full p-5 bg-white border-2 border-slate-100 rounded-[24px] text-3xl font-black text-slate-800 focus:border-indigo-500 outline-none shadow-sm transition-all"
            />
          </div>

          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-2 font-black text-slate-700 uppercase text-xs tracking-widest border-b pb-3">
              <Activity className="text-indigo-500" size={16}/> Resposta ao Esforço
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Fadiga de MMII (Borg)</label>
                <span className="text-[10px] font-black text-indigo-600">{postFadiga !== null ? `Nível ${postFadiga}` : 'Selecione'}</span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {[0, 2, 4, 6, 8, 10].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => { setPostFadiga(n); setIsSaved(false); }}
                    className={`py-4 rounded-2xl font-black text-xs transition-all ${postFadiga === n ? 'bg-slate-900 text-white shadow-lg scale-105' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Angina (0-4)</label>
                <span className="text-[10px] font-black text-rose-600">{postAngina !== null && postAngina > 0 ? `Grau ${postAngina}` : 'Ausente'}</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[0, 1, 2, 3, 4].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => { setPostAngina(n); setIsSaved(false); }}
                    className={`py-4 rounded-2xl font-black text-xs transition-all ${postAngina === n ? 'bg-rose-500 text-white shadow-lg scale-105' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                  >
                    {n === 0 ? 'Não' : n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </TimedTestTemplate>

      {/* RODAPÉ FIXO CORRIGIDO: Z-INDEX 999 para sobrepor as pérolas */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-[999] flex flex-col gap-3">
        <button
          type="button"
          onClick={handleGlobalSave} 
          className={`w-full py-5 rounded-[24px] font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all ${isSaved ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
        >
          {isSaved ? <CheckCircle2 className="w-6 h-6" /> : <Save className="w-6 h-6 text-emerald-400" />}
          <span className="text-[11px] uppercase tracking-widest">{isSaved ? 'RESULTADOS GRAVADOS' : 'GRAVAR RESULTADO'}</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="w-full bg-white/90 backdrop-blur-md text-slate-900 py-5 rounded-[24px] font-black border border-slate-200 shadow-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <LayoutDashboard size={16} /> Prosseguir para o Painel
        </button>
      </div>
    </div>
  );
};