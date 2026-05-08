import React, { useState } from 'react';
import { Activity, Info, AlertCircle, Heart, Save, CheckCircle2, ArrowLeft, ChevronRight, LayoutDashboard } from 'lucide-react';
import { usePatient } from '../../../context/PatientProvider';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const HRV: React.FC = () => {
  const { updateTestResults } = usePatient();
  const navigate = useNavigate();
  const [vfc, setVfc] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);

  const getInterpretation = (val: number) => {
    if (val < 20) return { 
      label: "VFC Muito Baixa", 
      color: "red", 
      desc: "Indica predomínio simpático acentuado ou baixa reserva autonômica." 
    };
    if (val < 40) return { 
      label: "VFC Baixa", 
      color: "orange", 
      desc: "Sugere redução da atividade parassimpática." 
    };
    if (val <= 70) return { 
      label: "VFC Normal", 
      color: "green", 
      desc: "Valores dentro da faixa esperada para a maioria dos adultos saudáveis." 
    };
    return { 
      label: "VFC Alta", 
      color: "emerald", 
      desc: "Indica excelente tônus parassimpático e boa recuperação autonômica." 
    };
  };

  const vfcNum = parseFloat(vfc);

  const handleSave = () => {
    if (isNaN(vfcNum)) {
        toast.error("Insira um valor válido para VFC");
        return;
    }
    const interpretation = getInterpretation(vfcNum);
    
    updateTestResults('autonomic', {
      vfc: vfcNum,
      hrvInterpretation: interpretation.label
    });
    
    setIsSaved(true);
    toast.success("VFC gravada com sucesso!");
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8 pb-40"> {/* pb-40 para dar espaço à barra fixa */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Variabilidade da FC (VFC)</h1>
        <p className="text-slate-500 text-sm">Avaliação do tônus autonômico através do índice de variabilidade.</p>
      </header>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <p className="text-xs text-blue-800 leading-relaxed">
              A <strong>VFC</strong> é um marcador não invasivo que reflete a capacidade do sistema nervoso autônomo de se adaptar a diferentes estresses.
            </p>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Índice de VFC (ms)</label>
            <div className="relative">
              <input
                type="number"
                value={vfc}
                onChange={(e) => {
                  setVfc(e.target.value);
                  setIsSaved(false);
                }}
                placeholder="Ex: 45"
                className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl text-4xl font-black text-slate-800 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold">ms</div>
            </div>
          </div>
        </div>

        {vfc && !isNaN(vfcNum) && (
          <div className="pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
              {(() => {
                const interpretation = getInterpretation(vfcNum);
                return (
                  <div className={`rounded-2xl p-6 border-2 shadow-lg ${
                    interpretation.color === 'red' ? 'bg-red-50 border-red-200 text-red-700' : 
                    interpretation.color === 'orange' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                    'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-bold uppercase tracking-wider opacity-70">Interpretação</div>
                      <Heart className={`w-5 h-5 ${interpretation.color === 'red' ? 'animate-pulse' : ''}`} />
                    </div>
                    <div className="text-2xl font-black mb-2">{interpretation.label}</div>
                    <p className="text-sm font-medium opacity-90">{interpretation.desc}</p>
                  </div>
                );
              })()}

              <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
                  <AlertCircle className="w-4 h-4" />
                  Notas Clínicas
                </div>
                <ul className="space-y-3 text-[11px] text-slate-400 leading-relaxed">
                  <li className="flex gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    Fatores como estresse e sono inadequado reduzem a VFC.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BARRA DE AÇÕES FIXA */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-[999] flex flex-col gap-3">
        <div className="flex gap-3">
          {/* Botão Voltar */}
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-white/90 backdrop-blur-md text-slate-500 py-5 rounded-[24px] font-black border border-slate-200 shadow-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <ArrowLeft size={16} /> Voltar
          </button>

          {/* Botão Gravar e Avançar */}
          <button
            onClick={() => {
              handleSave();
              if (!isNaN(vfcNum)) {
                // Navega para o próximo passo lógico (ex: Sinais Vitais ou Força)
                navigate('/testes/vsaq'); 
              }
            }}
            className="flex-[2] bg-slate-900 text-white py-5 rounded-[24px] font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <div className="flex flex-col items-start text-left">
              <span className="text-[11px] uppercase tracking-widest">
                {isSaved ? 'Já Gravado' : 'Gravar e Continuar'}
              </span>
              <span className="text-[8px] text-slate-400 font-medium lowercase">próxima etapa</span>
            </div>
            <ChevronRight size={18} className="text-emerald-400" />
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