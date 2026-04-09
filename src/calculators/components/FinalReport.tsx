import React from 'react';
import { 
  FileText, Download, User, Activity, Zap, 
  ShieldCheck, Stethoscope, Info 
} from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../lib/supabase';
import { getCBDFClassification } from '../../utils/cbdf';
import { generateCBDFCode } from '../../utils/cbdfGenerator';

export const FinalReport: React.FC = () => {
  const { patientInfo, medications, testResults } = usePatient();
  const { user } = useAuth(); 

  // Gera o código completo baseado em toda a anamnese e testes
  const cbdfFullCode = generateCBDFCode(patientInfo, testResults, medications);
  const codeParts = cbdfFullCode.split('.');

  // Função para traduzir o código em texto descritivo
  const getInterpretationText = (partIndex: number, value: string) => {
    const val = parseInt(value);
    if (partIndex === 1) return val > 0 ? "Alteração Estrutural Cardíaca" : "Estrutura Preservada";
    if (partIndex === 2) {
      if (val === 0) return "Capacidade Aeróbica Normal";
      if (val === 1) return "Comprometimento Leve";
      if (val === 2) return "Comprometimento Moderado";
      if (val === 3) return "Comprometimento Grave";
      if (val === 4) return "Comprometimento Completo";
    }
    if (partIndex === 3) return val > 0 ? "Disfunção Vascular/Periférica" : "Integridade Vascular";
    return "";
  };

  const handlePrint = async () => {
    if (user) {
      await logActivity(user.id, 'Gerou PDF do Relatório Final');
    }
    window.print();
  };

  const hasData = !!(patientInfo?.name || (testResults && Object.keys(testResults).length > 0));

  const TestCard = ({ title, testData, badgeColor = "bg-slate-600" }: { title: string, testData: any, badgeColor?: string }) => {
    if (!testData) return null;
    
    const efficiencyValue = typeof testData.efficiency === 'number' ? testData.efficiency : 0;
    const cbdf = getCBDFClassification(efficiencyValue);

    return (
      <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4 break-inside-avoid transition-all hover:border-vitality-lime/30">
        <div className="flex justify-between items-start">
          <span className={`px-3 py-1 ${badgeColor} text-white text-[9px] font-black rounded-full uppercase tracking-widest`}>
            {title}
          </span>
          <div className="text-right">
            <div className="text-2xl font-black text-slate-900 leading-none">
              {testData.distance || testData.count || testData.time || testData.score || '--'}
              <span className="text-[10px] ml-1 text-slate-400 font-bold uppercase">
                {testData.distance ? 'm' : testData.count ? 'rep' : testData.time ? 's' : 'pts'}
              </span>
            </div>
            <div className="text-[11px] font-black text-slate-500 mt-1">
              {efficiencyValue.toFixed(1)}% do predito
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-slate-50 rounded-2xl border-l-4" style={{ borderLeftColor: cbdf.color }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Classificação CBDF</span>
            <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: cbdf.color }} />
          </div>
          <div className="text-[12px] font-black text-slate-800 leading-tight">
            {cbdf.severity} <span className="text-slate-400 font-medium">(Qualificador {cbdf.qualifier})</span>
          </div>
        </div>
      </div>
    );
  };

  if (!hasData) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center space-y-6">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-slate-200">
          <FileText className="w-10 h-10 text-slate-200" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Relatório em Branco</h2>
          <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
            Realize os testes para gerar o diagnóstico funcional.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-32 print:p-0 print:space-y-6 text-slate-900">
      <header className="flex items-end justify-between border-b-2 border-slate-100 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-500 mb-1">
            <Stethoscope className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Prontuário de Fisioterapia</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Diagnóstico Funcional</h1>
          <p className="text-slate-400 text-xs font-bold italic uppercase tracking-widest">Baseado na Resolução COFFITO 555/2022</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs hover:bg-emerald-500 hover:text-black transition-all shadow-xl print:hidden uppercase tracking-widest"
        >
          <Download className="w-4 h-4" /> Exportar PDF
        </button>
      </header>

      {/* Seção do Código CBDF */}
      <section className="bg-slate-950 rounded-[3rem] p-10 text-white shadow-2xl border-b-[12px] border-emerald-500 break-inside-avoid relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/10">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/80">Código Oficial CBDF</span>
            </div>
            <h2 className="text-6xl font-black tracking-tighter text-white font-mono">{cbdfFullCode}</h2>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-xl grid grid-cols-4 gap-6 min-w-full lg:min-w-[400px]">
            {[
              { label: 'Estrutura', val: codeParts[1] || '0', col: 'text-white' },
              { label: 'Capacidade', val: codeParts[2] || '0', col: 'text-emerald-400' },
              { label: 'Vascular', val: codeParts[3] || '0', col: 'text-blue-400' },
              { label: 'Meds', val: codeParts[5] || '0', col: 'text-rose-400' }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-[8px] font-black text-slate-500 uppercase mb-2 tracking-widest">{item.label}</div>
                <div className={`text-3xl font-black ${item.col}`}>{item.val}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NOVA SEÇÃO: Interpretação Descritiva */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 break-inside-avoid">
        <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-4 flex items-center gap-2">
            <Info className="w-3 h-3" /> Resumo do Diagnóstico
          </h3>
          <ul className="space-y-3">
            <li className="flex justify-between text-sm">
              <span className="font-bold text-slate-600">Sist. Cardiovascular:</span>
              <span className="font-black text-slate-900">{getInterpretationText(1, codeParts[1])}</span>
            </li>
            <li className="flex justify-between text-sm">
              <span className="font-bold text-slate-600">Funcionalidade:</span>
              <span className="font-black text-slate-900">{getInterpretationText(2, codeParts[2])}</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-3 h-3" /> Status do Exame
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Paciente apresenta {codeParts[1] === '0' ? 'ausência de' : 'presença de'} alterações estruturais 
            com impacto {getInterpretationText(2, codeParts[2]).toLowerCase()} na capacidade de exercício.
          </p>
        </div>
      </section>

      {/* Identificação e Resultados dos Testes */}
      <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-8 break-inside-avoid">
        <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
          <div className="w-14 h-14 bg-slate-900 text-emerald-400 rounded-2xl flex items-center justify-center shadow-lg">
            <User className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{patientInfo?.name || 'Paciente'}</h2>
            <div className="flex gap-4 mt-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avaliado em: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Idade</div>
            <div className="text-xl font-black text-slate-800">{patientInfo?.age || '--'} <span className="text-xs text-slate-400">anos</span></div>
          </div>
          <div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fraç. Ejeção</div>
            <div className="text-xl font-black text-slate-800">{patientInfo?.ejectionFraction || '--'} <span className="text-xs text-slate-400">%</span></div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TestCard title="Caminhada 6 Min" testData={testResults?.sixMinuteWalkTest} badgeColor="bg-blue-600" />
        <TestCard title="Levantar e Ir (TUG)" testData={testResults?.tug} badgeColor="bg-orange-500" />
      </section>

      <footer className="hidden print:block text-center pt-12 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 uppercase tracking-[0.4em] font-black italic">
            Gerado via Vitality CardioTools - Prontuário em Conformidade com a CBDF
        </p>
      </footer>
    </div>
  );
};