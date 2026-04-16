import React from 'react';
import { 
  Download, Stethoscope, ShieldCheck, Activity, Timer, Waves, Info, Pill, AlertCircle
} from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../lib/supabase';
import { generateCBDFCode } from '../../utils/cbdfGenerator';
import { calculateRisk } from '../../utils/riskStratification';

export const FinalReport: React.FC = () => {
  const { patientInfo, medications, testResults } = usePatient();
  const { user } = useAuth(); 

  const cbdfFullCode = generateCBDFCode(patientInfo, testResults, medications);
  const risk = calculateRisk(patientInfo, testResults);

  const vascular = (testResults?.vascularAssessment || {}) as any;
  const dasi = (testResults?.dasi || {}) as any;
  const fatigabilityScales = testResults?.fatigabilityScales;
  const sitToStand = (testResults?.sitToStandTest || {}) as any;

  const handlePrint = async () => {
    if (user) await logActivity(user.id, 'Gerou PDF do Relatório Final');
    window.print();
  };

  if (!patientInfo?.name) {
    return (
      <div className="p-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
        <p className="uppercase font-black text-slate-400 tracking-widest text-xs">Aguardando dados do paciente para consolidar relatório...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-32 print:p-0 text-slate-900">
      {/* HEADER - AJUSTADO PARA NÃO QUEBRAR COM NOMES GIGANTES */}
      <header className="flex flex-col border-b-2 border-slate-100 pb-6">
        <div className="flex items-center gap-2 text-indigo-600 mb-2">
          <Stethoscope className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">Fisioterapia Cardiovascular Especializada</span>
        </div>
        
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-black text-slate-400 tracking-tighter uppercase italic leading-none">Relatório Clínico</h1>
            <div className="mt-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Paciente</span>
              <h2 className="text-6xl md:text-7xl font-black text-indigo-950 uppercase tracking-tighter italic leading-[0.9] break-words">
                {patientInfo.name}
              </h2>
            </div>
          </div>
          <button onClick={handlePrint} className="print:hidden bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-slate-800 transition-all shrink-0 shadow-lg shadow-slate-200">
            <Download className="w-4 h-4 text-emerald-400" /> Exportar
          </button>
        </div>
      </header>

      {/* RISCO E MEDICAMENTOS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 break-inside-avoid">
        <div className={`md:col-span-2 p-8 rounded-[2.5rem] border-2 ${risk.border} ${risk.bg} flex items-center justify-between`}>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Estratificação (AACVPR)</span>
            <h3 className={`text-4xl font-black ${risk.color} tracking-tighter`}>{risk.level}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase italic mt-1">{risk.desc}</p>
          </div>
          <ShieldCheck className={`w-14 h-14 ${risk.color} opacity-80`} />
        </div>
        
        <div className="bg-indigo-50 rounded-[2.5rem] p-8 border border-indigo-100">
          <div className="flex items-center gap-2 mb-2">
            <Pill className="w-4 h-4 text-indigo-500" />
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Fármacos</span>
          </div>
          <div className="text-[11px] font-black text-slate-700 uppercase leading-tight italic whitespace-pre-line">
            {medications?.betablockers ? '• Betabloqueador' : ''}
            {medications?.others ? `\n• ${medications.others}` : (!medications?.betablockers ? 'Nenhum' : '')}
          </div>
        </div>
      </section>

      {/* CORE: CBDF COM LAYOUT À PROVA DE ERROS */}
      <section className="bg-slate-950 rounded-[3.5rem] p-10 text-white shadow-2xl border-b-[12px] border-indigo-600 break-inside-avoid relative overflow-hidden">
        <div className="relative z-10 flex flex-col gap-6">
          <div className="inline-flex self-start items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full">
            <Activity className="w-3 h-3 text-emerald-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Cód. Funcional (CBDF)</span>
          </div>
          
          <div>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter font-mono text-indigo-100 leading-none">
              {cbdfFullCode}
            </h2>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Diagnóstico Funcional</span>
              <span className="text-3xl md:text-4xl font-black italic tracking-tight uppercase text-white">
                Deficiência Moderada
              </span>
            </div>
            {sitToStand?.percentPredicted && (
              <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/5">
                <span className="text-2xl font-black text-emerald-400">{sitToStand.percentPredicted}%</span>
                <span className="text-[8px] block font-black text-white/50 uppercase tracking-tighter leading-none">do Predito</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* DETALHAMENTO */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 break-inside-avoid">
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-slate-400 border-b border-slate-50 pb-3">
            <Timer size={16} className="text-indigo-500" />
            <h3 className="text-[10px] font-black uppercase tracking-widest">Performance</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-dashed border-slate-100 pb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">DASI (METs):</span>
              <span className="text-lg font-black text-emerald-600">
                {dasi?.estimatedMETs ? dasi.estimatedMETs.toFixed(1) : '0.0'} METs
              </span>
            </div>
            <div className="pb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Sintomas (Borg):</span>
              <p className="text-[12px] font-black text-rose-700 uppercase italic leading-tight">
                {(() => {
                  if (!fatigabilityScales) return "SEM INTERCORRÊNCIAS";
                  const { rest, exercise } = fatigabilityScales;
                  if (exercise?.dyspnea > 0 || exercise?.fatigue > 0) {
                    return `ESFORÇO: DISPNEIA ${exercise.dyspnea} | FADIGA ${exercise.fatigue}`;
                  }
                  return "VALORES NORMAIS (BORG 0)";
                })()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-slate-400 border-b border-slate-50 pb-3">
            <Waves size={16} className="text-blue-500" />
            <h3 className="text-[10px] font-black uppercase tracking-widest">Vascular</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between border-b border-dashed border-slate-100 pb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Enchimento:</span>
              <span className="text-[11px] font-black uppercase">{vascular?.arterial?.capillaryRefill || '--'} seg</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-slate-100 pb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Pele:</span>
              <span className="text-[11px] font-black uppercase">{vascular?.arterial?.skinColor || 'Normal'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Stemmer:</span>
              <span className={`text-[11px] font-black uppercase ${vascular?.lymphatic?.stemmer === 'Positivo' ? 'text-rose-500' : 'text-emerald-500'}`}>
                {vascular?.lymphatic?.stemmer || 'Negativo'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 flex gap-4 items-start">
        <Info className="w-5 h-5 text-indigo-400 shrink-0" />
        <p className="text-[9px] text-slate-500 leading-relaxed uppercase font-bold">
          Relatório gerado conforme Resolução COFFITO 555/2022. O código CBDF reflete o estado funcional no momento da avaliação.
        </p>
      </footer>
    </div>
  );
};