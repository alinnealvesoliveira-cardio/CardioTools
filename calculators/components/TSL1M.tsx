import React, { useState, useMemo } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Activity, LayoutDashboard, RotateCcw, ArrowLeft, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { usePatient } from '../../context/PatientProvider';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FunctionalTestResult, CIFData } from '../../types';

export const TSL1M: React.FC = () => {
  const { patientInfo, testResults, updateTestResults } = usePatient();
  const navigate = useNavigate();

  const [postFadiga, setPostFadiga] = useState<number | null>(null);
  const [postAngina, setPostAngina] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const age = parseInt(patientInfo?.age?.toString() || '0');
  const height = parseFloat(patientInfo?.height?.toString() || '0');
  const weight = parseFloat(patientInfo?.weight?.toString() || '0');
  const isDataValid = age > 0 && height > 0 && weight > 0;

  // Equação de Predição: Furlanetto et al.
  const { predictedFurlanetto, bmi } = useMemo(() => {
    if (!isDataValid) return { predictedFurlanetto: 0, bmi: 0 };

    const sex = (patientInfo?.sex as string || '').toUpperCase();
    const isFemale = sex === 'FEMALE' || sex === 'F' || sex === 'FEMININO';
    const sexVal = isFemale ? 1 : 0;
    const bmiVal = weight / ((height / 100) ** 2);

    // Fórmula: 60.6 - (0.36 * idade) - (2.8 * sexo[F=1, M=0]) - (0.31 * IMC)
    const pred = 60.6 - (0.36 * age) - (2.8 * sexVal) - (0.31 * bmiVal);
    
    return { 
      predictedFurlanetto: pred > 0 ? pred : 15, 
      bmi: bmiVal 
    };
  }, [patientInfo, age, height, weight, isDataValid]);

  const interpretation = (_time: number, count: number): InterpretationResult[] => {
    if (count === 0) return [{ label: "Pendente", color: "slate", description: "Realize as repetições." }];
    
    const efficiency = (count / predictedFurlanetto) * 100;

    return [{
      label: efficiency < 80 ? "Abaixo do Esperado" : "Preservada",
      color: efficiency < 80 ? "red" : "green",
      description: `O paciente atingiu ${efficiency.toFixed(0)}% da capacidade de resistência predita para MMII.`
    }];
  };

  const handleGlobalSave = (data: { 
    time: number; 
    count: number; 
    results: InterpretationResult[]; 
    cif: CIFData | null; 
    hr: { pre: number; post: number }; 
  }) => {
    const efficiency = (data.count / predictedFurlanetto) * 100;

    // REGRA DE NEGÓCIO: Salva no nó 'aerobic' para centralizar o diagnóstico funcional
    updateTestResults('aerobic', {
      tsl1m: {
        count: data.count,
        predicted: predictedFurlanetto,
        efficiency: efficiency,
        interpretation: data.results[0]?.label || "Realizado",
        hr: data.hr,
        cif: data.cif ?? undefined
      } as FunctionalTestResult
    });

    // Sincroniza sintomas com os módulos de fadiga e angina
    if (postFadiga !== null) {
      updateTestResults('fatigability', {
        exercise: { fatigue: postFadiga, dyspnea: 0 }
      });
    }

    if (postAngina !== null && postAngina > 0) {
      updateTestResults('symptoms', {  
        angina: {
          type: 'stable',
          description: `Grau ${postAngina} no TSL1M`
        }
      });
    }
      
    setIsSaved(true);
    toast.success("TSL 1' registrado!");
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  if (!isDataValid) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-rose-50 border border-rose-100 rounded-[32px] text-center space-y-4">
        <AlertCircle className="mx-auto text-rose-500" size={40} />
        <h3 className="font-black text-rose-900 uppercase text-xs">Dados Biométricos Faltando</h3>
        <p className="text-xs text-rose-700 italic text-pretty">Precisamos de Idade, Peso e Altura para aplicar a equação de Furlanetto.</p>
        <button onClick={() => navigate(-1)} className="text-[10px] font-black uppercase text-rose-600 underline">Voltar</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-64 relative"> 
      <style>{`#template-save-button { display: none !important; }`}</style>
      
      <TimedTestTemplate
        title="TSL 1 Minuto"
        description="Resistência de Membros Inferiores"
        timerDuration={60}
        hasCounter={true} // O TSL usa o contador do template para as repetições
        counterLabel="Repetições"
        predictedValue={predictedFurlanetto}
        interpretation={interpretation}
        onSave={handleGlobalSave}
      >
        <div className="space-y-6 px-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-slate-900 rounded-[32px] shadow-xl text-white">
              <p className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">Predito (Furlanetto)</p>
              <p className="text-4xl font-black text-indigo-400 italic">{predictedFurlanetto.toFixed(0)}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">repetições</p>
            </div>
            <div className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-center">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">IMC</p>
              <p className="text-2xl font-black text-slate-700">{bmi.toFixed(1)} <span className="text-[10px] text-slate-300 italic">kg/m²</span></p>
            </div>
          </div>

          {/* ESCALA DE SINTOMAS - BORG E ANGINA */}
          <div className="bg-slate-50 rounded-[40px] p-8 space-y-8">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Activity size={14} className="text-indigo-500"/> Borg / Angina Pós-Esforço
              </span>
              <button onClick={() => {setPostFadiga(null); setPostAngina(null);}} className="text-slate-400 hover:text-slate-600">
                <RotateCcw size={14}/>
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase ml-1">Fadiga MMII (0-10)</p>
              <div className="flex justify-between gap-2">
                {[0, 2, 4, 6, 8, 10].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPostFadiga(n)}
                    className={`flex-1 py-4 rounded-2xl font-black transition-all ${postFadiga === n ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase ml-1">Angina (0-4)</p>
              <div className="flex justify-between gap-2">
                {[0, 1, 2, 3, 4].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPostAngina(n)}
                    className={`flex-1 py-4 rounded-2xl font-black transition-all ${postAngina === n ? 'bg-rose-500 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}
                  >
                    {n === 0 ? 'Não' : n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </TimedTestTemplate>

      {/* BARRA DE AÇÕES FIXA - PADRÃO APP */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-[999] flex flex-col gap-3">
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-white/90 backdrop-blur-md text-slate-500 py-5 rounded-[24px] font-black border border-slate-200 shadow-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95"
          >
            <ArrowLeft size={16} /> Voltar
          </button>

          <button
            onClick={() => document.getElementById('save-test-button')?.click()}
            className={`flex-[2] py-5 rounded-[24px] font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all bg-slate-900 text-white`}
          >
            <div className="flex flex-col items-start text-left">
              <span className="text-[11px] uppercase tracking-widest">{isSaved ? 'Teste Gravado' : 'Finalizar TSL'}</span>
              <span className="text-[8px] text-slate-400 font-medium lowercase">concluir achados aeróbicos</span>
            </div>
            {isSaved ? <CheckCircle2 size={18} className="text-emerald-400" /> : <ChevronRight size={18} className="text-emerald-400" />}
          </button>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-2 text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em] hover:text-indigo-500 transition-colors"
        >
          <LayoutDashboard size={12} className="inline mr-1 mb-1" /> Dashboard Principal
        </button>
      </div>
    </div>
  );
};