import React from 'react';
import { 
  FileText, Download, User, Activity, ShieldCheck, Stethoscope, Wind, Waves, BookOpen, Timer, BarChart3
} from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../lib/supabase';
import { generateCBDFCode } from '../../utils/cbdfGenerator';
import { calculateRisk } from '../../utils/riskStratification';

export const FinalReport: React.FC = () => {
  const { patientInfo, medications, testResults } = usePatient();
  const { user } = useAuth(); 

  // Geramos o código e garantimos que os dados de CATE e Medicamentos influenciem o final
  const cbdfFullCode = generateCBDFCode(patientInfo, testResults, medications);
  const codeParts = cbdfFullCode.split('.');
  const risk = calculateRisk(patientInfo, testResults);

  // Acessores seguros para evitar os erros das imagens (usando cast 'as any' para contornar tipagem incompleta)
  const vascular = (testResults?.vascularAssessment || {}) as any;
  const sitToStand = (testResults?.sitToStandTest || {}) as any;
  const fatigability = (testResults?.fatigabilityScales?.exercise || {}) as any;

  const handlePrint = async () => {
    if (user) await logActivity(user.id, 'Gerou PDF do Relatório Final');
    window.print();
  };

  if (!patientInfo?.name) return <div className="p-10 text-center uppercase font-black">Aguardando dados do paciente...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-32 print:p-0 text-slate-900">
      {/* HEADER */}
      <header className="flex items-end justify-between border-b-2 border-slate-100 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Stethoscope className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Prontuário de Fisioterapia Cardiovascular</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Relatório Final</h1>
          <p className="text-slate-400 text-[10px] font-black italic uppercase tracking-widest">Resolução COFFITO 555/2022 - CBDF</p>
        </div>
        <button onClick={handlePrint} className="print:hidden bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-400" /> Exportar PDF
        </button>
      </header>

      {/* BLOCO DE RISCO E CATE */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 break-inside-avoid">
        <div className={`md:col-span-2 p-8 rounded-[2.5rem] border-2 ${risk.border} ${risk.bg} flex items-center justify-between`}>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400">Estratificação (AACVPR)</span>
            <h3 className={`text-3xl font-black ${risk.color}`}>{risk.level}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase italic">{risk.desc}</p>
          </div>
          <ShieldCheck className={`w-12 h-12 ${risk.color}`} />
        </div>
        <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-200">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Obstrução (CATE)</span>
          <div className="text-xl font-black text-slate-800 uppercase leading-tight">
            {patientInfo?.cateResult || 'Não Informado'}
          </div>
        </div>
      </section>

      {/* DIAGNÓSTICO CBDF CORRIGIDO */}
      <section className="bg-slate-950 rounded-[3rem] p-10 text-white shadow-2xl border-b-[12px] border-indigo-500 break-inside-avoid">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full mb-4">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span className="text-[9px] font-black uppercase tracking-widest">Código Diagnóstico Atualizado</span>
            </div>
            <h2 className="text-6xl md:text-7xl font-black tracking-tighter font-mono">{cbdfFullCode}</h2>
            <p className="mt-4 text-slate-400 text-[10px] uppercase font-bold">
              *Qualificadores: EST: {codeParts[1]} | CAP: {codeParts[2]} | VAS: {codeParts[3]} | FAD: {codeParts[4]} | MED: {codeParts[5]}
            </p>
          </div>
        </div>
      </section>

      {/* DETALHAMENTO CLÍNICO (AQUI CORRIGIMOS AS PROPRIEDADES) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 break-inside-avoid">
        {/* Capacidade Aeróbica/Funcional */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-400 border-b pb-2">
            <Timer size={16} className="text-indigo-500" />
            <h3 className="text-[10px] font-black uppercase tracking-widest">Capacidade Funcional</h3>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase">Teste (TSL/5X):</span>
            <span className="text-lg font-black text-indigo-600">{sitToStand?.reps || '0'} Reps</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase">Fadiga (Borg):</span>
            <span className="text-lg font-black text-rose-500">{fatigability?.fatigue || '0'} (Leve)</span>
          </div>
        </div>

        {/* Vascular - CORREÇÃO DAS CHAVES DAS IMAGENS */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-400 border-b pb-2">
            <Waves size={16} className="text-blue-500" />
            <h3 className="text-[10px] font-black uppercase tracking-widest">Avaliação Vascular</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-400 uppercase">Pulsos Periféricos:</span>
              <span className="text-slate-900 uppercase">{vascular?.arterial?.pulses || 'Presentes'}</span>
            </div>
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-400 uppercase">Edema (Godet):</span>
              <span className="text-slate-900">{vascular?.venous?.godet || '0'}+</span>
            </div>
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-400 uppercase">Stemmer:</span>
              <span className={vascular?.lymphatic?.stemmer === 'Positivo' ? 'text-rose-500' : 'text-emerald-500'}>
                {vascular?.lymphatic?.stemmer || 'NEGATIVO'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* REFERÊNCIAS */}
      <section className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-[8px] text-slate-500 italic">
        <strong>Referências:</strong> Britto RR (2013) | Bhat AG (2021) | Resolução COFFITO 555/2022 (CBDF).
      </section>
    </div>
  );
};