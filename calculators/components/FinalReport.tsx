import React, { useMemo, useState } from 'react';
import { 
  Download, Stethoscope, Heart, Pill, FileText, AlertCircle, ShieldCheck, Activity 
} from 'lucide-react';
import { usePatient } from '../../context/PatientProvider';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../lib/supabase';
import { generateCBDFCode } from '../../utils/cbdfGenerator';
import { calculateRisk } from '../../utils/riskStratification';

export const FinalReport: React.FC = () => {
  const { patientInfo, medications, testResults } = usePatient();
  const { user } = useAuth(); 
  const [observations, setObservations] = useState('');

  const reportData = useMemo(() => {
    const pInfo = patientInfo || {};
    const tRes = testResults || {};
    
    // CORREÇÃO DO ERRO DE TIPO: 
    // Passamos o objeto 'medications' diretamente, garantindo que seja do tipo esperado pelas funções
    const medsData = medications || {} as any;

    const rawCode = generateCBDFCode(pInfo, tRes, medsData);
    const risk = calculateRisk(pInfo, tRes);
    
    const aerobic = tRes?.aerobic;
    const fatigability = tRes?.fatigability;
    let selectedTest: any = null;

    if (aerobic?.dasi) {
      selectedTest = { 
        name: 'DASI', val: aerobic.dasi.estimatedMETs, unit: 'METs', 
        hr: { pre: (fatigability as any)?.rest?.hr || 0, post: (fatigability as any)?.exercise?.hr || 0 } 
      };
    } else if (aerobic?.tug) {
      selectedTest = { name: 'TUG', val: aerobic.tug.time, unit: 'seg', hr: aerobic.tug.hr };
    } else if (aerobic?.tsl30s) {
      selectedTest = { name: 'TSL 30s', val: aerobic.tsl30s.count, unit: 'rep', hr: aerobic.tsl30s.hr };
    } else if (aerobic?.vsaq) {
      selectedTest = { 
        name: 'VSAQ', val: aerobic.vsaq.met, unit: 'METs', 
        hr: { pre: (fatigability as any)?.rest?.hr || 0, post: (fatigability as any)?.exercise?.hr || 0 } 
      };
    }

    return { rawCode, risk, selectedTest };
  }, [patientInfo, testResults, medications]);

  const { rawCode, risk, selectedTest } = reportData;
  const cbdfFullCode = rawCode.replace(/^Q/, '').trim();

  // Transformar o objeto de medicações numa lista legível para o relatório
  const activeMeds = useMemo(() => {
    if (!medications) return [];
    return Object.entries(medications)
      .filter(([_, value]) => value === true)
      .map(([key]) => key.replace(/_/g, ' '));
  }, [medications]);

  const handlePrint = async () => {
    if (user) await logActivity(user.id, `Gerou PDF: ${patientInfo?.name}`);
    window.print();
  };

  if (!patientInfo?.name) {
    return (
      <div className="p-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
        <p className="uppercase font-black text-slate-400 tracking-widest text-xs">Aguardando dados...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-32 print:p-0 text-slate-900 bg-white">
      <style type="text/css" media="print">
        {`@page { size: portrait; margin: 12mm; } .print-hidden { display: none !important; }`}
      </style>

      {/* HEADER */}
      <header className="border-b-4 border-slate-900 pb-6">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600">
              <Stethoscope size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Relatório de Avaliação Física</span>
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none">{patientInfo.name}</h1>
            <div className="flex gap-4 text-[11px] font-bold text-slate-500 uppercase pt-2">
              <span>{patientInfo.age} anos</span>
              <span>•</span>
              <span>{String(patientInfo.sex).toUpperCase().startsWith('M') ? 'Masculino' : 'Feminino'}</span>
              <span>•</span>
              <span>FEVE: {(patientInfo as any).feve || '--'}%</span>
            </div>
          </div>
          <button onClick={handlePrint} className="print-hidden bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 active:scale-95 transition-all shadow-xl">
            <Download size={16} className="text-emerald-400" /> Gerar PDF
          </button>
        </div>

        {/* LISTA DE MEDICAÇÕES ATIVAS */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 mr-2">
            <Pill size={14} className="text-slate-400" />
            <span className="text-[9px] font-black text-slate-400 uppercase">Suporte Farmacológico:</span>
          </div>
          {activeMeds.length > 0 ? activeMeds.map((med, i) => (
            <span key={i} className="bg-slate-100 px-3 py-1 rounded-full text-[9px] font-bold text-slate-600 uppercase border border-slate-200">
              {med}
            </span>
          )) : <span className="text-[9px] italic text-slate-400">Sem medicações registadas</span>}
        </div>
      </header>

      {/* ESTRATIFICAÇÃO DE RISCO */}
      <section className={`p-8 rounded-[2.5rem] border-2 flex items-center justify-between ${risk?.border || 'border-slate-100'} ${risk?.bg || 'bg-slate-50'}`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Heart size={16} className={risk?.color || 'text-slate-400'} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Risco Cardiovascular</span>
          </div>
          <h3 className={`text-4xl font-black uppercase tracking-tighter ${risk?.color || 'text-slate-900'}`}>
            {risk?.level || 'Não Estratificado'}
          </h3>
          <p className="text-[10px] font-bold text-slate-500 mt-1 italic uppercase tracking-tighter">
            FEVE: {(patientInfo as any).feve || '0'}% | Sintomas Anginosos
          </p>
        </div>
        <ShieldCheck size={48} className={`${risk?.color || 'text-slate-200'} opacity-40`} />
      </section>

      {/* DIAGNÓSTICO CBDF */}
      <section className="bg-slate-950 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 text-white">
          <Activity size={120} />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div>
            <span className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-2 block">Cód. Diagnóstico (CBDF)</span>
            <h2 className="text-7xl font-mono font-black tracking-tighter text-indigo-50">{cbdfFullCode || 'D05.2'}</h2>
          </div>
          
          <div className="pt-6 border-t border-white/10 text-sm leading-relaxed font-medium text-slate-300 italic">
            <strong className="text-white uppercase tracking-widest text-xs block mb-3 not-italic">Parecer Cinético-Funcional:</strong>
            D05.2 - Deficiência cinético-funcional cardiovascular, com alteração na estrutura e função nos vasos. 
            Impacto na capacidade aeróbica estimada em <span className="text-indigo-300 font-black">
              {selectedTest ? `${selectedTest.val} ${selectedTest.unit} (${selectedTest.name})` : '---'}
            </span>. 
            
            {testResults?.fatigability?.exercise?.fatigue ? 
              ` Presença de fadigabilidade ao esforço (Borg: ${testResults.fatigability.exercise.fatigue}).` : 
              ' Fadigabilidade controlada.'
            }

            {selectedTest?.hr?.pre > 0 && selectedTest?.hr?.post > 0 && (
              ` Resposta cronotrópica: de ${selectedTest.hr.pre} bpm para ${selectedTest.hr.post} bpm.`
            )}
            
            {activeMeds.length > 0 && ` Paciente sob uso de medicamentos que podem modular a resposta cardiovascular.`}
          </div>
        </div>
      </section>

      {/* OBSERVAÇÕES */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 ml-4">
          <FileText size={14} className="text-slate-400" />
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observações Clínicas</h3>
        </div>
        <textarea 
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Notas sobre estabilidade hemodinâmica ou conduta..."
          className="w-full p-8 rounded-[2.5rem] border-2 border-slate-100 focus:border-indigo-500 outline-none text-sm font-medium text-slate-700 bg-slate-50/50 print:hidden"
          rows={3}
        />
        <p className="hidden print:block text-sm text-slate-700 italic border-l-4 border-slate-200 pl-4">
          {observations || "Sem observações adicionais."}
        </p>
      </section>

      {/* RODAPÉ */}
      <footer className="pt-12 flex justify-between items-end">
        <div className="text-[9px] text-slate-400 font-bold uppercase">
          Gerado em: {new Date().toLocaleDateString('pt-PT')} | Resolução COFFITO 555/2022
        </div>
        <div className="flex flex-col items-center">
          <div className="w-64 border-b-2 border-slate-900 mb-2"></div>
          <span className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Fisioterapeuta Responsável</span>
        </div>
      </footer>
    </div>
  );
};