import React, { useState } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Activity, Save, CheckCircle2, LayoutDashboard } from 'lucide-react';
import { usePatient } from '../../context/PatientProvider';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Definição das atividades VSAQ com seus respectivos valores de METs
const VSAQ_ACTIVITIES = [
  { met: 1, label: "Sentar-se ou realizar atividades sedentárias" },
  { met: 2, label: "Caminhar dentro de casa" },
  { met: 3, label: "Caminhar 2 quarteirões no plano" },
  { met: 5, label: "Atividades domésticas moderadas ou golfe" },
  { met: 7, label: "Subir um lance de escadas" },
  { met: 9, label: "Trabalho manual pesado ou levantamento de peso" },
  { met: 11, label: "Correr ou jogging recreativo" },
];

export const VSAQ: React.FC = () => {
  const { updateTestResults } = usePatient();
  const navigate = useNavigate();
  const [selectedMet, setSelectedMet] = useState<number>(1);
  const [isSaved, setIsSaved] = useState(false);

  // Função de interpretação dinâmica baseada no MET selecionado
  const interpretation = (met: number): InterpretationResult[] => {
    return [
      {
        label: met < 5 ? "Capacidade Funcional Reduzida" : met < 8 ? "Capacidade Funcional Moderada" : "Boa Capacidade Funcional",
        color: met < 5 ? "red" : met < 8 ? "yellow" : "green",
        description: `Capacidade estimada em ${met} METs. ${
          met < 5 ? "Atenção ao risco cardiovascular." : "Nível de esforço dentro da normalidade."
        }`
      }
    ];
  };

  const handleGlobalSave = () => {
    const resultData = interpretation(selectedMet)[0];

    // Atualização alinhada com a interface VSAQResult (types.ts)
    updateTestResults('aerobic', {
      vsaq: {
        met: selectedMet, // Corrigido para 'met'
        interpretation: resultData.label,
        description: resultData.description
      }
    });

    setIsSaved(true);
    toast.success("VSAQ gravado com sucesso!");
  };

  return (
    <div className="max-w-4xl mx-auto pb-60 relative">
      <TimedTestTemplate
        title="VSAQ"
        description="Questionário de Atividade Física (Estimativa de METs)"
        timerDuration={0}
        hasCounter={false}
        predictedValue={null}
        interpretation={() => interpretation(selectedMet)}
        onSave={handleGlobalSave}
      >
        <div className="space-y-6 px-4">
          <div className="bg-indigo-50 p-5 rounded-3xl border border-indigo-100">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-700 mb-2">Instrução</h3>
            <p className="text-[11px] text-indigo-900 leading-relaxed font-medium">
              Selecione a atividade **mais extenuante** que o paciente consegue realizar sem apresentar sintomas limitantes.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Atividades Estimadas</label>
            <div className="grid gap-2">
              {VSAQ_ACTIVITIES.map((activity) => (
                <button
                  key={activity.met}
                  type="button"
                  onClick={() => { setSelectedMet(activity.met); setIsSaved(false); }}
                  className={`w-full p-5 rounded-2xl flex items-center justify-between border-2 transition-all text-left ${
                    selectedMet === activity.met 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                      : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200'
                  }`}
                >
                  <span className="font-medium text-sm">{activity.label}</span>
                  <span className={`font-black text-xs px-3 py-1 rounded-full ${
                    selectedMet === activity.met ? 'bg-white/20' : 'bg-slate-100'
                  }`}>
                    {activity.met} METs
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </TimedTestTemplate>

      {/* Botões de Ação */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-[999] flex flex-col gap-3">
        <button
          onClick={handleGlobalSave}
          className={`w-full py-5 rounded-[24px] font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all ${isSaved ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'}`}
        >
          {isSaved ? <CheckCircle2 className="w-6 h-6" /> : <Save className="w-6 h-6 text-emerald-400" />}
          <span className="text-[11px] uppercase tracking-widest">{isSaved ? 'SALVO' : 'GRAVAR RESULTADO'}</span>
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-white/90 backdrop-blur-md text-slate-900 py-5 rounded-[24px] font-black border border-slate-200 shadow-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <LayoutDashboard size={16} /> Voltar ao Painel
        </button>
      </div>
    </div>
  );
};