import React from 'react';
import { 
  FileText, Download, User, Activity, Zap, 
  ShieldCheck, Stethoscope, Info, Wind, Heart, Waves
} from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../lib/supabase';
import { getCBDFClassification } from '../../utils/cbdf';
import { generateCBDFCode } from '../../utils/cbdfGenerator';

export const FinalReport: React.FC = () => {
  const { patientInfo, medications, testResults } = usePatient();
  const { user } = useAuth(); 

  const cbdfFullCode = generateCBDFCode(patientInfo, testResults, medications);
  const codeParts = cbdfFullCode.split('.');

  const getInterpretationText = (partIndex: number, value: string) => {
    const val = parseInt(value);
    if (partIndex === 1) return val > 0 ? "Alteração Estrutural Cardíaca" : "Estrutura Preservada";
    if (partIndex === 2) {
      const labels = ["Normal", "Comprometimento Leve", "Moderado", "Grave", "Completo"];
      return labels[val] || "Não avaliado";
    }
    return "";
  };

  const handlePrint = async () => {
    if (user) await logActivity(user.id, 'Gerou PDF do Relatório Final');
    window.print();
  };

  const hasData = !!(patientInfo?.name || (testResults && Object.keys(testResults).length > 0));

  if (!hasData) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center space-y-6">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-slate-200">
          <FileText className="w-10 h-10 text-slate-200" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Relatório em Branco</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-32 print:p-0 print:space-y-6 text-slate-900">
      {/* HEADER PROFISSIONAL */}
      <header className="flex items-end justify-between border-b-2 border-slate-100 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Stethoscope className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Prontuário de Fisioterapia Cardiovascular</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Relatório Final</h1>
          <p className="text-slate-400 text-[10px] font-black italic uppercase tracking-widest">Resolução COFFITO 555/2022 - CBDF</p>
        </div>
        <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs hover:bg-indigo-600 transition-all shadow-xl print:hidden uppercase tracking-widest">
          <Download className="w-4 h-4 text-emerald-400" /> Exportar PDF
        </button>
      </header>

      {/* BLOCK 1: IDENTIFICAÇÃO E ESTRUTURA */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 break-inside-avoid">
        <div className="md:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex items-center gap-6">
          <div className="w-16 h-16 bg-slate-900 text-emerald-400 rounded-3xl flex items-center justify-center shadow-lg shrink-0">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase leading-none mb-2">{patientInfo?.name || 'Paciente'}</h2>
            <div className="flex gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
               <span>Idade: {patientInfo?.age || '--'} anos</span>
               <span>Sexo: {patientInfo?.sex === 'male' ? 'Masc' : 'Fem'}</span>
            </div>
          </div>
        </div>
        <div className="bg-rose-50 rounded-[2.5rem] p-8 border border-rose-100 flex flex-col justify-center">
          <div className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">FEVE (%)</div>
          <div className="text-4xl font-black text-rose-600 leading-none">{patientInfo?.ejectionFraction || '--'}<span className="text-lg">%</span></div>
        </div>
      </section>

      {/* BLOCK 2: O CÓDIGO CBDF */}
      <section className="bg-slate-950 rounded-[3rem] p-10 text-white shadow-2xl border-b-[12px] border-indigo-500 relative overflow-hidden break-inside-avoid">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/10 mb-4">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span className="text-[9px] font-black uppercase tracking-widest">Código Diagnóstico</span>
            </div>
            <h2 className="text-7xl font-black tracking-tighter font-mono">{cbdfFullCode}</h2>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-xl grid grid-cols-4 gap-6 w-full lg:w-auto">
            {[
              { label: 'EST', val: codeParts[1], col: 'text-white' },
              { label: 'CAP', val: codeParts[2], col: 'text-emerald-400' },
              { label: 'VAS', val: codeParts[3], col: 'text-blue-400' },
              { label: 'MED', val: codeParts[5], col: 'text-rose-400' }
            ].map((item, i) => (
              <div key={i} className="text-center px-2">
                <div className="text-[8px] font-black text-slate-500 uppercase mb-1 tracking-widest">{item.label}</div>
                <div className={`text-2xl font-black ${item.col}`}>{item.val || '0'}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOCK 3: SINTOMAS (BORG) E VASCULAR */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 break-inside-avoid">
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-slate-400">
            <Wind size={16} />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Resposta de Borg</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl">
              <span className="text-[8px] font-black text-slate-400 uppercase">Dispneia (Esforço)</span>
              <div className="text-2xl font-black text-slate-900">{testResults.fatigabilityScales?.exercise?.dyspnea || 0}</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <span className="text-[8px] font-black text-slate-400 uppercase">Fadiga (Esforço)</span>
              <div className="text-2xl font-black text-slate-900">{testResults.fatigabilityScales?.exercise?.fatigue || 0}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-slate-400">
            <Waves size={16} />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Status Vascular e Linfático</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-bold border-b border-slate-50 pb-2">
              <span className="text-slate-400 uppercase tracking-tighter">Pulsos Periféricos:</span>
              <span className="text-slate-700 uppercase">
                {(testResults.vascularAssessment as any)?.arterial?.pulses || 'Não Avaliado'}
              </span>
            </div>
            
            <div className="flex justify-between text-xs font-bold border-b border-slate-50 pb-2">
              <span className="text-slate-400 uppercase tracking-tighter">Edema (Godet):</span>
              <span className="text-slate-700 font-black">
                {(testResults.vascularAssessment as any)?.venous?.godet ? `${(testResults.vascularAssessment as any).venous.godet}+` : '0+'}
              </span>
            </div>
            
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-400 uppercase tracking-tighter">Sinal de Stemmer:</span>
              <span className={`font-black ${
                (testResults.vascularAssessment as any)?.lymphatic?.stemmer === 'Positivo' 
                  ? 'text-rose-500' 
                  : 'text-emerald-500'
              }`}>
                {(testResults.vascularAssessment as any)?.lymphatic?.stemmer?.toUpperCase() || 'NEGATIVO'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER DO RELATÓRIO */}
      <footer className="pt-12 border-t border-slate-100 text-center space-y-4">
        <div className="flex justify-center gap-12 mb-8">
           <div className="text-center">
             <div className="w-48 border-b-2 border-slate-900 mb-2 mx-auto"></div>
             <p className="text-[9px] font-black uppercase text-slate-500 tracking-tighter tracking-widest">Assinatura do Profissional</p>
           </div>
        </div>
        <p className="text-[8px] text-slate-400 uppercase tracking-[0.5em] font-black">
          Vitality CardioTools v3.0 - Software de Suporte à Decisão Clínica
        </p>
      </footer>
    </div>
  );
};