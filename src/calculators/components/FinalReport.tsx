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

  const rawCode = generateCBDFCode(patientInfo, testResults, medications);
  // Remove o "Q" que estava aparecendo no início do código funcional
  const cbdfFullCode = rawCode.replace(/^Q/, '').trim();
  
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
        <p className="uppercase font-black text-slate-400 tracking-widest text-xs">Aguardando dados do paciente...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-32 print:p-0 text-slate-900">
      
      {/* HEADER */}
      <header className="flex flex-col border-b-2 border-slate-100 pb-6">
        <div className="flex items-center gap-2 text-indigo-600 mb-2">
          <Stethoscope className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">Fisioterapia Cardiovascular</span>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex-1 w-full">
            <h1 className="text-xl md:text-2xl font-black text-slate-400 tracking-tighter uppercase italic">Relatório Clínico</h1>
            <div className="mt-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Paciente</span>
              <h2 className="text-4xl md:text-7xl font-black text-indigo-950 uppercase tracking-tighter italic leading-[0.9] break-words">
                {patientInfo.name}
              </h2>
            </div>
          </div>
          <button onClick={handlePrint} className="print:hidden w-full md:w-auto bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shrink-0 shadow-lg">
            <Download className="w-4 h-4 text-emerald-400" /> Exportar
          </button>
        </div>
      </header>

      {/* RISCO E CBDF */}
      <section className="grid grid-cols-1 gap-6 break-inside-avoid">
        <div className={`p-8 rounded-[2rem] border-2 ${risk.border} ${risk.bg} flex items-center justify-between`}>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Estratificação</span>
            <h3 className={`text-3xl md:text-4xl font-black ${risk.color} tracking-tighter uppercase`}>{risk.level}</h3>
          </div>
          <ShieldCheck className={`w-12 h-12 ${risk.color} opacity-80`} />
        </div>

        <div className="bg-slate-950 rounded-[2.5rem] p-6 md:p-10 text-white shadow-2xl border-b-[12px] border-indigo-600 relative overflow-hidden">
          <div className="relative z-10 flex flex-col gap-4">
            <div className="inline-flex self-start items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Cód. Funcional (CBDF)</span>
            </div>
            <h2 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter font-mono text-indigo-100 leading-none truncate">
              {cbdfFullCode}
            </h2>
            <div className="pt-6 border-t border-white/10">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Diagnóstico</span>
              <span className="text-3xl md:text-5xl font-black italic uppercase text-white leading-tight">
                {cbdfFullCode.includes('.3') ? "Deficiência Moderada" : "Nenhuma Deficiência"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* PERFORMANCE E ESFORÇO - CORRIGIDO SEM ERROS VERMELHOS */}
      <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center gap-2 text-slate-400 border-b pb-4">
          <Timer size={16} className="text-indigo-500" />
          <h3 className="text-[10px] font-black uppercase tracking-widest">Performance e Esforço</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">DASI (METs):</span>
            <div className="text-3xl font-black text-emerald-600">
              {dasi?.estimatedMETs ? Number(dasi.estimatedMETs).toFixed(1) : '0.0'}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Sintomas em Esforço:</span>
            <div className="text-[12px] font-black text-rose-700 uppercase italic">
              {(() => {
                const ex = fatigabilityScales?.exercise;
                const d = Number(ex?.dyspnea || 0);
                const f = Number(ex?.fatigue || 0);
                if (d > 0 || f > 0) {
                  return `ESFORÇO: DISPNEIA ${d} | FADIGA ${f}`;
                }
                return "VALORES NORMAIS (BORG 0)";
              })()}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 flex gap-4 items-start break-inside-avoid">
        <Info className="w-5 h-5 text-indigo-400 shrink-0" />
        <p className="text-[9px] text-slate-500 leading-relaxed uppercase font-bold">
          Relatório gerado conforme Resolução COFFITO 555/2022.
        </p>
      </footer>
    </div>
  );
};