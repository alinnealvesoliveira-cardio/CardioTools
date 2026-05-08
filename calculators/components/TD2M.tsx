import React, { useState, useMemo, useRef } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Activity, LayoutDashboard, RotateCcw, Footprints, ArrowLeft, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { usePatient } from '../../context/PatientProvider';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const TD2M: React.FC = () => {
  const { patientInfo, updateTestResults } = usePatient();
  const navigate = useNavigate();

  // Estados locais
  const [steps, setSteps] = useState<number>(0);
  const [postFadiga, setPostFadiga] = useState<number | null>(null);
  const [postAngina, setPostAngina] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const age = parseInt(patientInfo?.age?.toString() || '0');
  const height = parseFloat(patientInfo?.height?.toString() || '0');
  const weight = parseFloat(patientInfo?.weight?.toString() || '0');
  const isDataValid = age > 0 && height > 0 && weight > 0;

  // Cálculos de Predito (Rikli & Jones) e LIN
  const { predictedRikli, lin, normativeRange } = useMemo(() => {
    if (!isDataValid) return { predictedRikli: 0, lin: 0, normativeRange: null };

    const sex = (patientInfo?.sex as string);
    const isFemale = sex?.toLowerCase().startsWith('f');
    const bmi = weight / ((height / 100) ** 2);

    const pRikli = !isFemale 
      ? 143.297 - (1.157 * age) - (0.334 * bmi) 
      : 118.773 - (0.832 * age) - (0.472 * bmi);
    
    const pLin = pRikli - (6 * 1.645); // EPE aproximado de 6

    const getRange = (a: number, female: boolean): [number, number] | null => {
      if (a < 60) return null;
      if (a <= 64) return !female ? [87, 115] : [75, 107];
      if (a <= 69) return !female ? [86, 116] : [73, 107];
      if (a <= 74) return !female ? [80, 110] : [68, 101];
      if (a <= 79) return !female ? [73, 109] : [68, 100];
      if (a <= 84) return !female ? [71, 103] : [60, 90];
      if (a <= 89) return !female ? [59, 91] : [55, 85];
      if (a <= 94) return !female ? [52, 86] : [44, 72];
      return null;
    };

    return { predictedRikli: pRikli, lin: pLin, normativeRange: getRange(age, isFemale) };
  }, [patientInfo, age, height, weight, isDataValid]);

  const interpretation = (): InterpretationResult[] => {
    if (steps === 0) return [{ label: "Pendente", color: "slate", description: "Insira as elevações." }];
    
    const normative = normativeRange 
      ? (steps >= normativeRange[0] ? (steps > normativeRange[1] ? "Acima do Normal" : "Normal") : "Abaixo do Normal")
      : "Realizado";

    return [{
      label: steps < lin ? "Abaixo do LIN" : normative,
      color: steps < lin ? "red" : (normative === "Normal" || normative === "Acima do Normal" ? "green" : "yellow"),
      description: steps < lin 
        ? `Desempenho abaixo do Limite Inferior (${lin.toFixed(0)} passos).` 
        : `Capacidade funcional dentro da normalidade normativa.`
    }];
  };

  const handleGlobalSave = (data: any) => {
    if (steps <= 0) {
      toast.error("Insira o total de elevações.");
      return;
    }

    // REGRA DE OURO: Atualiza o nó 'aerobic' para que o relatório final pegue este teste
    updateTestResults('aerobic', {
      td2m: {
        count: steps,
        predicted: predictedRikli,
        efficiency: (steps / predictedRikli) * 100,
        interpretation: interpretation()[0].label,
        hr: data.hr,
        cif: data.cif
      }
    });

    // Atualiza fadiga se houver
    if (postFadiga !== null) {
      updateTestResults('fatigability', {
        exercise: { fatigue: postFadiga, dyspnea: 0 }
      });
    }

    setIsSaved(true);
    toast.success("TD2M salvo!");
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  if (!isDataValid) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-rose-50 border border-rose-100 rounded-[32px] text-center space-y-4 shadow-sm">
        <AlertCircle className="mx-auto text-rose-500" size={40} />
        <h3 className="font-black text-rose-900 uppercase text-xs tracking-widest">Biometria Necessária</h3>
        <p className="text-xs text-rose-700 leading-relaxed italic">O TD2M exige Idade, Peso e Altura para calcular o predito de Rikli & Jones.</p>
        <button onClick={() => navigate(-1)} className="pt-2 text-[10px] font-black uppercase text-rose-600 underline">Voltar</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-64 relative"> 
      <style>{`#template-save-button { display: none !important; }`}</style>
      
      <TimedTestTemplate
        title="2MST"
        description="Marcha Estacionária (Rikli & Jones)"
        timerDuration={120}
        predictedValue={predictedRikli}
        interpretation={interpretation}
        onSave={handleGlobalSave}
      >
        <div className="space-y-6 px-4">
          {/* INPUT GIGANTE DE PASSOS */}
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">
              <Footprints size={16} className="text-indigo-500"/> Elevações (Joelho Direito)
            </label>
            <div className="relative">
              <input
                type="number"
                value={steps || ''}
                onChange={(e) => { setSteps(Number(e.target.value)); setIsSaved(false); }}
                placeholder="00"
                className="w-full bg-transparent text-7xl font-black text-slate-900 outline-none placeholder:text-slate-100"
              />
              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 font-black text-2xl italic tracking-tighter">passos</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-slate-900 rounded-[32px] text-white">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">LIN (Corte)</p>
              <p className="text-4xl font-black text-emerald-400 italic">{lin.toFixed(0)}</p>
            </div>
            <div className="p-6 bg-white rounded-[32px] border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Média Esperada</p>
              <p className="text-4xl font-black text-slate-900 italic">{predictedRikli.toFixed(0)}</p>
            </div>
          </div>

          {/* ESCALAS DE SINTOMAS - COMPACTAS */}
          <div className="bg-slate-50 rounded-[32px] p-8 space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fadiga (Borg 0-10)</label>
              <div className="flex justify-between gap-2">
                {[0, 2, 4, 6, 8, 10].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPostFadiga(n)}
                    className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all ${postFadiga === n ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Dor/Angina (CCS)</label>
              <div className="flex justify-between gap-2">
                {[0, 1, 2, 3, 4].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPostAngina(n)}
                    className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all ${postAngina === n ? 'bg-rose-500 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}
                  >
                    {n === 0 ? 'Não' : n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </TimedTestTemplate>

      {/* BARRA DE AÇÕES FIXA UNIFICADA */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-[999] flex flex-col gap-3">
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-white/90 backdrop-blur-md text-slate-500 py-5 rounded-[24px] font-black border border-slate-200 shadow-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <ArrowLeft size={16} /> Voltar
          </button>

          <button
            onClick={() => document.getElementById('save-test-button')?.click()}
            disabled={steps === 0}
            className={`flex-[2] py-5 rounded-[24px] font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all ${
              steps > 0 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <div className="flex flex-col items-start text-left">
              <span className="text-[11px] uppercase tracking-widest">{isSaved ? 'Gravado' : 'Finalizar Teste'}</span>
              <span className="text-[8px] text-slate-400 font-medium lowercase italic">salvar e ir para o painel</span>
            </div>
            {isSaved ? <CheckCircle2 size={18} className="text-emerald-400" /> : <ChevronRight size={18} className="text-emerald-400" />}
          </button>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-2 text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em] hover:text-indigo-500 transition-colors"
        >
          <LayoutDashboard size={12} className="inline mr-1 mb-1" /> Ir para o Painel Geral
        </button>
      </div>
    </div>
  );
};