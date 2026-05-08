import React, { useState } from 'react';
import { TimedTestTemplate, InterpretationResult } from '../templates/TimedTestTemplate';
import { Activity, Save, CheckCircle2, LayoutDashboard, ArrowLeft, ChevronRight, Info } from 'lucide-react';
import { usePatient } from '../../context/PatientProvider';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Definição das atividades VSAQ com seus respectivos valores de METs
const VSAQ_ACTIVITIES = [
  { met: 1, label: "Atividades sedentárias (sentar, ler, TV)" },
  { met: 2, label: "Caminhar dentro de casa em ritmo lento" },
  { met: 3, label: "Caminhar 2 quarteirões no plano (4-5 km/h)" },
  { met: 5, label: "Atividades domésticas pesadas ou golfe" },
  { met: 7, label: "Subir um lance de escadas sem parar" },
  { met: 9, label: "Trabalho manual pesado ou corrida leve" },
  { met: 11, label: "Esportes competitivos ou corrida rápida" },
  { met: 13, label: "Esforço extenuante / Nível atlético" },
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
        label: met < 5 ? "Capacidade Reduzida" : met < 8 ? "Capacidade Moderada" : "Excelente Capacidade",
        color: met < 5 ? "red" : met < 8 ? "yellow" : "green",
        description: `Capacidade funcional estimada em ${met} METs. ${
          met < 5 ? "Indica maior risco cardiovascular e fragilidade." : "Bom prognóstico funcional."
        }`
      }
    ];
  };

  const handleGlobalSave = () => {
    const resultData = interpretation(selectedMet)[0];

    // Atualização alinhada com a interface VSAQResult (sem timestamp para evitar erro de tipo)
    updateTestResults('aerobic', {
      vsaq: {
        met: Number(selectedMet),
        interpretation: resultData.label,
        description: resultData.description
      }
    });

    setIsSaved(true);
    toast.success("VSAQ gravado com sucesso!");
    // Pequeno delay para o usuário ver o feedback de sucesso antes de sair
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto pb-64 relative">
      {/* Oculta o botão padrão do template para usar a barra de ações fixa do App */}
      <style>{`#template-save-button { display: none !important; }`}</style>

      <TimedTestTemplate
        title="VSAQ"
        description="Estimativa de Capacidade Funcional (METs)"
        timerDuration={0}
        hasCounter={false}
        predictedValue={null}
        interpretation={() => interpretation(selectedMet)}
        onSave={handleGlobalSave}
      >
        <div className="space-y-6 px-4">
          {/* Card de Instrução Clínica */}
          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[32px] flex gap-4 shadow-sm">
            <Info className="text-indigo-600 shrink-0" size={24} />
            <div className="space-y-1">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Protocolo VSAQ</h4>
              <p className="text-[11px] text-indigo-900 leading-relaxed font-medium italic">
                Identifique a atividade mais intensa que o paciente realiza rotineiramente sem sintomas limitantes (dor ou dispneia).
              </p>
            </div>
          </div>

          {/* Seletor de Atividades */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Níveis de Intensidade</label>
            <div className="grid gap-3">
              {VSAQ_ACTIVITIES.map((activity) => (
                <button
                  key={activity.met}
                  type="button"
                  onClick={() => { setSelectedMet(activity.met); setIsSaved(false); }}
                  className={`w-full p-5 rounded-[24px] flex items-center justify-between border-2 transition-all ${
                    selectedMet === activity.met 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-[1.02]' 
                      : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col gap-1 text-left">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${selectedMet === activity.met ? 'text-indigo-400' : 'text-slate-400'}`}>
                      Nível de Esforço
                    </span>
                    <span className="font-bold text-sm leading-tight">{activity.label}</span>
                  </div>
                  
                  <div className={`flex flex-col items-center min-w-[75px] py-2 rounded-2xl ${
                    selectedMet === activity.met ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-800'
                  }`}>
                    <span className="text-xl font-black">{activity.met}</span>
                    <span className="text-[8px] font-black uppercase opacity-60">METs</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </TimedTestTemplate>

      {/* BARRA DE AÇÕES FIXA - PADRÃO DA SUÍTE DE TESTES */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-[999] flex flex-col gap-3">
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-white/90 backdrop-blur-md text-slate-500 py-5 rounded-[24px] font-black border border-slate-200 shadow-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <ArrowLeft size={16} /> Voltar
          </button>

          <button
            onClick={handleGlobalSave}
            className={`flex-[2] py-5 rounded-[24px] font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all ${
              isSaved ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'
            }`}
          >
            <div className="flex flex-col items-start text-left">
              <span className="text-[11px] uppercase tracking-widest">{isSaved ? 'Sincronizado' : 'Gravar VSAQ'}</span>
              <span className="text-[8px] text-slate-400 font-medium lowercase italic">finalizar estimativa de vo2</span>
            </div>
            {isSaved ? <CheckCircle2 size={18} /> : <ChevronRight size={18} className="text-emerald-400" />}
          </button>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-2 text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em] hover:text-indigo-500 transition-colors"
        >
          <LayoutDashboard size={12} className="inline mr-1 mb-1" /> Ir para Dashboard
        </button>
      </div>
    </div>
  );
};