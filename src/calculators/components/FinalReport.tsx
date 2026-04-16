import React from 'react';
import { 
  Download, User, Activity, ShieldCheck, Stethoscope, Waves, Timer, AlertCircle, Info, Pill
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
  const codeParts = cbdfFullCode.split('.');
  const risk = calculateRisk(patientInfo, testResults);

  const vascular = (testResults?.vascularAssessment || {}) as any;
  const sitToStand = (testResults?.sitToStandTest || {}) as any;
  const fatigability = (testResults?.fatigabilityScales?.exercise || {}) as any;
  const dasi = (testResults?.dasi || {}) as any;

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
      {/* HEADER - NOME DO PACIENTE AUMENTADO */}
      <header className="flex items-end justify-between border-b-2 border-slate-100 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Stethoscope className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Fisioterapia Cardiovascular Especializada</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Relatório Clínico</h1>
          <div className="flex flex-col mt-2">
            <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Paciente:</span>
            <span className="text-3xl font-black text-indigo-900 uppercase tracking-tight">{patientInfo.name}</span>
          </div>
        </div>
        <button onClick={handlePrint} className="print:hidden bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200">
          <Download className="w-4 h-4 text-emerald-400" /> Exportar Relatório
        </button>
      </header>

      {/* MEDICAMENTOS E RISCO */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 break-inside-avoid">
        <div className={`md:col-span-2 p-8 rounded-[2.5rem] border-2 ${risk.border} ${risk.bg} flex items-center justify-between`}>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Estratificação (AACVPR)</span>
            <h3 className={`text-4xl font-black ${risk.color} tracking-tighter`}>{risk.level}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase italic mt-1">{risk.desc}</p>
          </div>
          <ShieldCheck className={`w-14 h-14 ${risk.color} opacity-80`} />
        </div>
        
        {/* SEÇÃO DE MEDICAMENTOS ADICIONADA */}
        <div className="bg-indigo-50 rounded-[2.5rem] p-8 border border-indigo-100 flex flex-col">
  <div className="flex items-center gap-2 mb-2">
    <Pill className="w-4 h-4 text-indigo-500" />
    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Uso de Fármacos</span>
  </div>
  <div className="text-[11px] font-black text-slate-700 uppercase leading-tight italic">
    {medications?.betablockers ? '• Betabloqueador em uso' : ''}
    {medications?.others ? `\n• ${medications.others}` : (!medications?.betablockers ? 'Nenhum relatado' : '')}
  </div>
</div>
      </section>

      {/* CORE: DIAGNÓSTICO CBDF */}
      <section className="bg-slate-950 rounded-[3rem] p-10 text-white shadow-2xl border-b-[12px] border-indigo-600 break-inside-avoid relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full mb-6">
            <Activity className="w-3 h-3 text-emerald-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Cód. Funcional Fisioterapêutico (CBDF)</span>
          </div>
          <h2 className="text-6xl md:text-7xl font-black tracking-tighter font-mono text-indigo-100">{cbdfFullCode}</h2>
        </div>
      </section>

      {/* DETALHAMENTO DAS CAPACIDADES */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 break-inside-avoid">
        {/* Capacidade Aeróbica + DASI + Fatigabilidade */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-slate-400 border-b border-slate-50 pb-3">
            <Timer size={16} className="text-indigo-500" />
            <h3 className="text-[10px] font-black uppercase tracking-widest">Capacidade e Performance</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-dashed border-slate-100 pb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">DASI (METs Estimados):</span>
              <span className="text-lg font-black text-emerald-600">{dasi?.estimatedMETs?.toFixed(1) || '0.0'} METs</span>
            </div>
            <div className="border-b border-dashed border-slate-100 pb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Fatigabilidade / Sintomas:</span>
              <p className="text-[11px] font-black text-rose-600 uppercase italic">
                {fatigability?.symptoms || 'Sem intercorrências relatadas'} (Borg: {fatigability?.fatigue || '0'})
              </p>
            </div>
          </div>
        </div>

        {/* Sistema Vascular + Enchimento Capilar */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-slate-400 border-b border-slate-50 pb-3">
            <Waves size={16} className="text-blue-500" />
            <h3 className="text-[10px] font-black uppercase tracking-widest">Avaliação Vascular</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-dashed border-slate-100 pb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Tempo de Enchimento Capilar:</span>
              <span className="text-[11px] font-black text-slate-700 uppercase">{vascular?.arterial?.capillaryRefill || 'Não avaliado'} seg</span>
            </div>
            <div className="flex justify-between items-end border-b border-dashed border-slate-100 pb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Coloração da Pele:</span>
              <span className="text-[11px] font-black text-slate-700 uppercase">{vascular?.arterial?.skinColor || 'Normal'}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Sinal de Stemmer:</span>
              <span className={`text-[11px] font-black uppercase ${vascular?.lymphatic?.stemmer === 'Positivo' ? 'text-rose-500' : 'text-emerald-500'}`}>
                {vascular?.lymphatic?.stemmer || 'Negativo'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* NOTA DE RODAPÉ */}
      <footer className="space-y-4">
        <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 flex gap-4 items-start">
          <Info className="w-5 h-5 text-indigo-400 shrink-0" />
          <p className="text-[9px] text-slate-500 leading-relaxed">
            <strong>Nota Clínica:</strong> Este relatório é gerado com base nos critérios da Resolução COFFITO 555/2022. O código CBDF reflete o estado funcional.
          </p>
        </div>
      </footer>
    </div>
  );
};