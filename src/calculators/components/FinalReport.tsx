import React from 'react';
import { 
  FileText, Download, User, Activity, Zap, Wind, 
  Info, Clock, Heart, ShieldCheck 
} from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../lib/supabase';
import { getCBDFClassification } from '../../utils/cbdf.ts';
import { generateCBDFCode, translateCBDFCode } from '../../utils/cbdfGenerator';
import { FunctionalTestResult } from '../../types';

export const FinalReport: React.FC = () => {
  const { patientInfo, medications, testResults } = usePatient();
  const { user } = useAuth();

  // Geração do Código Diagnóstico Estruturado e Tradução
  const cbdfFullCode = generateCBDFCode(patientInfo, testResults, medications);
  const codeParts = cbdfFullCode.split('.');
  const diagnosisTranslation = translateCBDFCode(cbdfFullCode);

  const handlePrint = async () => {
    if (user) {
      await logActivity(user.id, 'Gerou PDF do Relatório Final');
    }
    window.print();
  };

  const hasData = Object.keys(testResults).length > 1 || (patientInfo.name && patientInfo.name !== '');

  // Componente interno para Renderizar o Card de Teste CBDF com Tipagem Segura
  const TestCard = ({ 
    title, 
    testData, 
    badgeColor = "bg-slate-600" 
  }: { 
    title: string, 
    testData?: FunctionalTestResult, 
    badgeColor?: string 
  }) => {
    if (!testData || testData.efficiency === undefined) return null;
    const cbdf = getCBDFClassification(testData.efficiency);

    return (
      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 break-inside-avoid">
        <div className="flex justify-between items-start">
          <span className={`px-3 py-1 ${badgeColor} text-white text-[10px] font-black rounded-full uppercase tracking-widest`}>
            {title}
          </span>
          <div className="text-right">
            <div className="text-2xl font-black text-slate-900">
              {testData.distance || testData.count || testData.time || testData.estimatedMETs?.toFixed(1) || '--'}
              <span className="text-xs ml-1 text-slate-500">
                {testData.distance ? 'm' : testData.count ? 'rep' : testData.time ? 's' : 'METs'}
              </span>
            </div>
            <div className="text-sm font-black text-slate-700">{testData.efficiency?.toFixed(1)}% do predito</div>
          </div>
        </div>
        
        <div className="p-4 bg-white rounded-2xl border-l-4 shadow-sm" style={{ borderLeftColor: cbdf.color }}>
          <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Comprometimento (CBDF-1)</div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-slate-800">{cbdf.severity} (Qualificador {cbdf.qualifier})</span>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cbdf.color }} />
          </div>
          <p className="text-[9px] text-slate-500 mt-1 leading-tight">{cbdf.description}</p>
        </div>
      </div>
    );
  };

  if (!hasData) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center space-y-6">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
          <FileText className="w-10 h-10 text-slate-300" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-800">Nenhum dado coletado</h2>
          <p className="text-slate-500">Realize os testes e preencha o cadastro para gerar o relatório consolidado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-24 print:p-0 print:space-y-6 text-slate-900">
      <header className="flex items-center justify-between print:mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Relatório Final</h1>
          <p className="text-slate-500 text-sm italic">Fisioterapia Vascular e Cardiorrespiratória</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-vitality-lime text-slate-900 px-6 py-3 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg print:hidden"
        >
          <Download className="w-5 h-5" />
          Imprimir / PDF
        </button>
      </header>

      {/* 1. CARIMBO DIAGNÓSTICO CBDF COM TRADUÇÃO */}
      <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl border-b-8 border-vitality-lime break-inside-avoid relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldCheck className="w-32 h-32" />
        </div>
        
        <div className="relative z-10 flex flex-col gap-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-vitality-lime font-black text-[10px] uppercase tracking-[0.3em]">
                <Activity className="w-4 h-4" /> Diagnóstico Cinético-Funcional
              </div>
              <h2 className="text-5xl font-black tracking-tighter text-white font-mono">
                {cbdfFullCode}
              </h2>
            </div>
            
            <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md grid grid-cols-4 gap-4 min-w-[300px]">
              <div className="text-center">
                <div className="text-xs font-bold text-slate-500 uppercase mb-1">Estrutura</div>
                <div className="text-xl font-black text-white">{codeParts[1]}</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-slate-500 uppercase mb-1">Capac.</div>
                <div className="text-xl font-black text-vitality-lime">{codeParts[2]}</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-slate-500 uppercase mb-1">Vasc.</div>
                <div className="text-xl font-black text-blue-400">{codeParts[3]}</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-slate-500 uppercase mb-1">Meds.</div>
                <div className="text-xl font-black text-rose-400">{codeParts[5]}</div>
              </div>
            </div>
          </div>

          {/* Tradução por Extenso (Novo campo de segurança) */}
          <div className="p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
            <p className="text-slate-300 text-sm leading-relaxed italic">
              <span className="text-vitality-lime font-bold not-italic mr-2">Conclusão:</span>
              {diagnosisTranslation}
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 print:gap-6">
        {/* Identificação do Paciente */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6 break-inside-avoid">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-3 bg-slate-800 text-white rounded-2xl"><User className="w-6 h-6" /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{patientInfo.name || 'Paciente não identificado'}</h2>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Perfil Biométrico e Clínico</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Idade</div>
              <div className="text-lg font-bold text-slate-800">{patientInfo.age || '--'} anos</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Sexo</div>
              <div className="text-lg font-bold text-slate-800">{patientInfo.sex === 'male' ? 'Masculino' : 'Feminino'}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Peso / Altura</div>
              <div className="text-lg font-bold text-slate-800">{patientInfo.weight}kg / {patientInfo.height}cm</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">IMC</div>
              <div className="text-lg font-bold text-slate-800">{patientInfo.imc?.toFixed(1)} kg/m²</div>
            </div>
          </div>
        </section>

        {/* 2. Capacidade Funcional */}
        <section className="bg-white rounded-3xl p-8 shadow-md border-2 border-vitality-lime/20 space-y-6 break-inside-avoid">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-3 bg-vitality-lime text-slate-900 rounded-2xl"><Wind className="w-6 h-6" /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Capacidade Funcional (CBDF-1)</h2>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide text-vitality-lime-dark">Análise de Desempenho Físico</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TestCard title="TC6M" testData={testResults.tc6m} badgeColor="bg-blue-600" />
            <TestCard title="VSAQ" testData={testResults.vsaq} badgeColor="bg-emerald-600" />
            <TestCard title="TD2M" testData={testResults.td2m} badgeColor="bg-indigo-600" />
            <TestCard title="TUG" testData={testResults.tug} badgeColor="bg-orange-600" />
            <TestCard title="TSL 1 MIN" testData={testResults.tsl1m} badgeColor="bg-purple-600" />
            <TestCard title="TSL 30 SEG" testData={testResults.tsl30s} badgeColor="bg-pink-600" />
          </div>
        </section>

        {/* 3. Exame Físico Vascular */}
        {testResults.vascularPhysicalExam && (
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6 break-inside-avoid">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><ShieldCheck className="w-6 h-6" /></div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Status Vascular</h2>
                <p className="text-xs text-slate-400 font-medium uppercase">Exame Físico e Classificação de Gravidade</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Arterial */}
              <div className="p-5 bg-rose-50/50 rounded-3xl border border-rose-100 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Arterial</div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-600 flex justify-between">Pulsos: <span className="font-bold text-slate-900">{testResults.vascularPhysicalExam.arterial.pulse}</span></p>
                    <p className="text-xs text-slate-600 flex justify-between">Temperatura: <span className="font-bold text-slate-900">{testResults.vascularPhysicalExam.arterial.temp}</span></p>
                    <p className="text-xs text-slate-600 flex justify-between">T.E.C: <span className="font-bold text-slate-900">{testResults.vascularPhysicalExam.arterial.capillaryRefill}</span></p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-rose-200">
                  <div className="text-[9px] font-bold text-rose-400 uppercase">Classificação CIF</div>
                  <div className="text-xs font-black text-rose-700 uppercase">{testResults.vascularPhysicalExam.arterial.cif}</div>
                </div>
              </div>

              {/* Venoso */}
              <div className="p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Venoso</div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-600 flex justify-between">Godet: <span className="font-bold text-slate-900">{testResults.vascularPhysicalExam.venous.godet}</span></p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {testResults.vascularPhysicalExam.venous.ceap.map((c: string) => (
                        <span key={c} className="px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-bold rounded-md">{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-indigo-200">
                  <div className="text-[9px] font-bold text-indigo-400 uppercase">Classificação CIF</div>
                  <div className="text-xs font-black text-indigo-700 uppercase">{testResults.vascularPhysicalExam.venous.cif}</div>
                </div>
              </div>

              {/* Linfático */}
              <div className="p-5 bg-amber-50/50 rounded-3xl border border-amber-100 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Linfático</div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-600 flex justify-between">Stemmer: <span className="font-bold text-slate-900">{testResults.vascularPhysicalExam.lymphatic.stemmer}</span></p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-amber-200">
                  <div className="text-[9px] font-bold text-amber-400 uppercase">Classificação CIF</div>
                  <div className="text-xs font-black text-amber-700 uppercase">{testResults.vascularPhysicalExam.lymphatic.cif}</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4. Fadigabilidade e Sintomas */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6 break-inside-avoid">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl"><Activity className="w-6 h-6" /></div>
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Fadigabilidade (Escala de Borg)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Clock className="w-4 h-4" /> Pré-Esforço</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-[8px] font-bold text-slate-400 uppercase mb-1">Dispneia</div>
                  <div className="text-xl font-black text-slate-900">{testResults.fatigabilityScales?.rest?.dyspnea ?? 0}<span className="text-xs text-slate-400 ml-1">/10</span></div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-[8px] font-bold text-slate-400 uppercase mb-1">Fadiga</div>
                  <div className="text-xl font-black text-slate-900">{testResults.fatigabilityScales?.rest?.fatigue ?? 0}<span className="text-xs text-slate-400 ml-1">/10</span></div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-vitality-lime-dark uppercase tracking-widest"><Zap className="w-4 h-4" /> Pico do Esforço</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-vitality-lime/5 rounded-2xl border border-vitality-lime/20">
                  <div className="text-[8px] font-bold text-vitality-lime-dark uppercase mb-1">Dispneia</div>
                  <div className="text-xl font-black text-slate-900">{testResults.fatigabilityScales?.exercise?.dyspnea ?? 0}<span className="text-xs text-slate-400 ml-1">/10</span></div>
                </div>
                <div className="p-4 bg-vitality-lime/5 rounded-2xl border border-vitality-lime/20">
                  <div className="text-[8px] font-bold text-vitality-lime-dark uppercase mb-1">Fadiga</div>
                  <div className="text-xl font-black text-slate-900">{testResults.fatigabilityScales?.exercise?.fatigue ?? 0}<span className="text-xs text-slate-400 ml-1">/10</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Resposta Cronotrópica (Refatorada para múltiplos medicamentos) */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6 break-inside-avoid">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-2xl"><Heart className="w-6 h-6" /></div>
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Resposta Cronotrópica</h2>
          </div>
          <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4">
            <div className="flex items-center gap-2 text-vitality-lime font-bold text-xs uppercase tracking-widest">
              <Info className="w-4 h-4" /> Contexto Farmacológico
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              {medications.betablockers || medications.bcc || medications.digitalis || medications.antiarrhythmics ? 
                "Uso de medicação com efeito cronotrópico negativo confirmado (Betabloqueador, BCC, Antiarrítmicos ou Digitalis). A resposta da Frequência Cardíaca atenuada é esperada. O controle de intensidade do exercício DEVE priorizar a Percepção Subjetiva de Esforço (Escala de Borg)." :
                "Nenhuma medicação com efeito cronotrópico negativo foi relatada. A resposta da Frequência Cardíaca deve apresentar linearidade metabólica durante o esforço."
              }
            </p>
          </div>
        </section>
      </div>

      <footer className="hidden print:block text-center pt-8 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold italic">
            Vitality App | Diagnóstico Fisioterapêutico de Alta Precisão
        </p>
      </footer>
    </div>
  );
};