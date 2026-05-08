import React, { useMemo } from 'react';
import { 
  Download, Stethoscope, ShieldCheck, Activity, Timer, Info, AlertCircle
} from 'lucide-react';
import { usePatient } from '../../context/PatientProvider';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../lib/supabase';
import { generateCBDFCode } from '../../utils/cbdfGenerator';
import { calculateRisk } from '../../utils/riskStratification';

export const FinalReport: React.FC = () => {
  const { patientInfo, medications, testResults } = usePatient();
  const { user } = useAuth(); 

  // Memoização para evitar re-cálculos desnecessários
  const reportData = useMemo(() => {
    const rawCode = generateCBDFCode(patientInfo, testResults, medications);
    const risk = calculateRisk(patientInfo, testResults);
    return { rawCode, risk };
  }, [patientInfo, testResults, medications]);

  const { rawCode, risk } = reportData;
  const cbdfFullCode = rawCode.replace(/^Q/, '').trim();
  
  // Extração segura de dados
  const dasi = testResults?.aerobic?.dasi; 
  const exercise = testResults?.['fatigability']?.exercise;

  const handlePrint = async () => {
    if (user) await logActivity(user.id, 'Gerou PDF do Relatório Final');
    window.print();
  };

  if (!patientInfo?.name) {
    return (
      <div className="p-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
        <p className="uppercase font-black text-slate-400 tracking-widest text-xs">Aguardando dados do paciente...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-32 print:p-0 text-slate-900">
      {/* Estilos para impressão */}
      <style type="text/css" media="print">
        {`
          @page { size: auto; margin: 15mm; }
          .print-hidden { display: none !important; }
        `}
      </style>

      {/* HEADER */}
      <header className="flex flex-col border-b-2 border-slate-100 pb-6">
        <div className="flex items-center gap-2 text-indigo-600 mb-2 print:hidden">
          <Stethoscope className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">Fisioterapia Cardiovascular</span>
        </div>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h1 className="text-xl font-black text-slate-400 tracking-tighter uppercase italic">Relatório Clínico</h1>
            <h2 className="text-4xl md:text-6xl font-black text-indigo-950 uppercase tracking-tighter italic leading-[0.9] break-words">
              {patientInfo.name}
            </h2>
          </div>
          <button 
            onClick={handlePrint} 
            className="print-hidden bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-lg"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Exportar
          </button>
        </div>
      </header>

      {/* RISCO E CBDF */}
      <section className="grid grid-cols-1 gap-6">
        <div className={`p-8 rounded-[2rem] border-2 ${risk.border} ${risk.bg} flex items-center justify-between`}>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Estratificação</span>
            <h3 className={`text-3xl font-black ${risk.color} tracking-tighter uppercase`}>{risk.level}</h3>
          </div>
          <ShieldCheck className={`w-12 h-12 ${risk.color} opacity-80`} />
        </div>

        <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl border-b-[8px] border-indigo-600 relative overflow-hidden">
          <div className="relative z-10 flex flex-col gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">Cód. Funcional (CBDF)</span>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter font-mono text-indigo-100 leading-none">
              {cbdfFullCode}
            </h2>
            <div className="pt-4 mt-4 border-t border-white/10">
               <span className="text-xl md:text-3xl font-black italic uppercase text-white">
                 {testResults?.aerobic?.dasi?.interpretation || "Avaliação em progresso"}
               </span>
            </div>
          </div>
        </div>
      </section>

      {/* PERFORMANCE E ESFORÇO */}
      <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b pb-4">
          <Timer size={14} className="text-indigo-500" /> Performance Física
        </h3>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase">Capacidade Estimada (METs)</span>
            <div className="text-3xl font-black text-emerald-600">
              {dasi?.estimatedMETs ? Number(dasi.estimatedMETs).toFixed(1) : '---'}
            </div>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase">Sintomas (Borg)</span>
            <div className="text-sm font-black text-rose-700 uppercase italic mt-1">
              {exercise?.dyspnea || exercise?.fatigue 
                ? `D: ${exercise.dyspnea || 0} | F: ${exercise.fatigue || 0}`
                : "Sem sintomas relatados"}
            </div>
          </div>
        </div>
      </section>

      <footer className="print:fixed print:bottom-0 print:w-full bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
        <p className="text-[9px] text-slate-500 font-bold uppercase text-center">
          Relatório gerado automaticamente conforme Resolução COFFITO 555/2022.
        </p>
      </footer>
    </div>
  );
};