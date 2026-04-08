import React from 'react';
import { FileText, Download, User, Activity, Zap, Wind, Info, Clock, Heart, ShieldCheck } from 'lucide-react';
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

  const handlePrint = async () => {
    if (user) {
      await logActivity(user.id, 'Gerou PDF do Relatório Final');
    }
    window.print();
  };

  const hasData = !!(patientInfo?.name || Object.keys(testResults || {}).length > 2);

  const TestCard = ({ title, testData, badgeColor = "bg-slate-600" }: { title: string, testData: any, badgeColor?: string }) => {
    if (!testData) return null;
    const efficiencyValue = typeof testData.efficiency === 'number' ? testData.efficiency : 0;
    const cbdf = getCBDFClassification(efficiencyValue);

    return (
      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 break-inside-avoid">
        <div className="flex justify-between items-start">
          <span className={`px-3 py-1 ${badgeColor} text-white text-[10px] font-black rounded-full uppercase tracking-widest`}>
            {title}
          </span>
          <div className="text-right">
            <div className="text-2xl font-black text-slate-900">
              {testData.distance || testData.count || testData.time || testData.score || '--'}
              <span className="text-xs ml-1 text-slate-500">
                {testData.distance ? 'm' : testData.count ? 'rep' : testData.time ? 's' : 'pts'}
              </span>
            </div>
            <div className="text-sm font-black text-slate-700">
              {efficiencyValue.toFixed(1)}% do predito
            </div>
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

      {/* 1. CARIMBO DIAGNÓSTICO CBDF */}
      <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl border-b-8 border-vitality-lime break-inside-avoid relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldCheck className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-vitality-lime font-black text-[10px] uppercase tracking-[0.3em]">
              <Activity className="w-4 h-4" /> Diagnóstico Cinético-Funcional
            </div>
            <h2 className="text-5xl font-black tracking-tighter text-white font-mono">{cbdfFullCode}</h2>
            <p className="text-slate-400 text-xs font-medium max-w-sm leading-relaxed">
              Codificação baseada na CBDF para deficiências do sistema cardiovascular e respiratório.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md grid grid-cols-4 gap-4 min-w-[300px]">
            <div className="text-center">
              <div className="text-xs font-bold text-slate-500 uppercase mb-1">Estrutura</div>
              <div className="text-xl font-black text-white">{codeParts[1] || '0'}</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-slate-500 uppercase mb-1">Capac.</div>
              <div className="text-xl font-black text-vitality-lime">{codeParts[2] || '0'}</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-slate-500 uppercase mb-1">Vasc.</div>
              <div className="text-xl font-black text-blue-400">{codeParts[3] || '0'}</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-slate-500 uppercase mb-1">Meds.</div>
              <div className="text-xl font-black text-rose-400">{codeParts[5] || '0'}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 print:gap-6">
        {/* Perfil do Paciente */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6 break-inside-avoid">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-3 bg-slate-800 text-white rounded-2xl"><User className="w-6 h-6" /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{patientInfo?.name || 'Paciente não identificado'}</h2>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Perfil Biométrico e Clínico</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Idade</div>
              <div className="text-lg font-bold text-slate-800">{patientInfo?.age || '--'} anos</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">FEVE (SBC)</div>
              <div className="text-lg font-bold text-slate-800">{patientInfo?.ejectionFraction || '--'} %</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Peso / Altura</div>
              <div className="text-lg font-bold text-slate-800">{patientInfo?.weight}kg / {patientInfo?.height}cm</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">IMC</div>
              <div className="text-lg font-bold text-slate-800">
                {typeof patientInfo?.imc === 'number' ? patientInfo.imc.toFixed(1) : '--'} kg/m²
              </div>
            </div>
          </div>
        </section>

        {/* Capacidade Funcional */}
        <section className="bg-white rounded-3xl p-8 shadow-md border-2 border-vitality-lime/20 space-y-6 break-inside-avoid">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-3 bg-vitality-lime text-slate-900 rounded-2xl"><Wind className="w-6 h-6" /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Capacidade Funcional</h2>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Análise de Desempenho Físico</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TestCard title="TC6M" testData={testResults?.sixMinuteWalkTest} badgeColor="bg-blue-600" />
            <TestCard title="VSAQ" testData={testResults?.vsaq} badgeColor="bg-emerald-600" />
            <TestCard title="DASI" testData={testResults?.dasi} badgeColor="bg-teal-600" />
            <TestCard title="TUG" testData={testResults?.tug} badgeColor="bg-orange-600" />
            <TestCard title="TSL 1 MIN" testData={testResults?.tsl1m} badgeColor="bg-purple-600" />
            <TestCard title="TSL 30 SEG" testData={testResults?.tsl30s} badgeColor="bg-pink-600" />
          </div>
        </section>

        {/* Status Vascular */}
        {testResults?.vascularAssessment && (
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6 break-inside-avoid">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><ShieldCheck className="w-6 h-6" /></div>
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Status Vascular</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Arterial */}
              <div className="p-5 bg-rose-50/50 rounded-3xl border border-rose-100">
                <div className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-3">Arterial</div>
                <div className="space-y-1 text-xs">
                  <p className="flex justify-between">Pulsos: <span className="font-bold">{testResults.vascularAssessment.arterial?.pulse || '--'}</span></p>
                  <p className="flex justify-between">Temp: <span className="font-bold">{testResults.vascularAssessment.arterial?.temp || '--'}</span></p>
                  <p className="flex justify-between">TEC: <span className="font-bold">{testResults.vascularAssessment.arterial?.capillaryRefill || '--'}</span></p>
                  {testResults.vascularAssessment.arterial?.cif && (
                    <p className="mt-2 pt-2 border-t border-rose-200 font-black text-rose-700">{testResults.vascularAssessment.arterial.cif}</p>
                  )}
                </div>
              </div>

              {/* Venoso - CORRIGIDO */}
              <div className="p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">Venoso</div>
                <div className="space-y-1 text-xs">
                  <p className="flex justify-between">Godet: <span className="font-bold">{testResults.vascularAssessment.venous?.godet || '--'}</span></p>
                  {Array.isArray(testResults.vascularAssessment.venous?.ceap) && testResults.vascularAssessment.venous.ceap.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {testResults.vascularAssessment.venous.ceap.map((c: string) => (
                        <span key={c} className="px-1.5 py-0.5 bg-indigo-600 text-white text-[8px] font-bold rounded">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                  {testResults.vascularAssessment.venous?.cif && (
                    <p className="mt-2 pt-2 border-t border-indigo-200 font-black text-indigo-700">
                      {testResults.vascularAssessment.venous.cif}
                    </p>
                  )}
                </div>
              </div>

              {/* Linfático */}
              <div className="p-5 bg-amber-50/50 rounded-3xl border border-amber-100">
                <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3">Linfático</div>
                <div className="space-y-1 text-xs">
                  <p className="flex justify-between">Stemmer: <span className="font-bold">{testResults.vascularAssessment.lymphatic?.stemmer || '--'}</span></p>
                  {testResults.vascularAssessment.lymphatic?.cif && (
                    <p className="mt-2 pt-2 border-t border-amber-200 font-black text-amber-700">{testResults.vascularAssessment.lymphatic.cif}</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Fadigabilidade */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6 break-inside-avoid">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl"><Activity className="w-6 h-6" /></div>
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Fadigabilidade (Escala de Borg)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Clock className="w-4 h-4" /> Pré-Esforço</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <div className="text-[8px] font-bold text-slate-400 uppercase">Dispneia</div>
                  <div className="text-xl font-black">{testResults.fatigabilityScales?.rest?.dyspnea ?? 0}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <div className="text-[8px] font-bold text-slate-400 uppercase">Fadiga</div>
                  <div className="text-xl font-black">{testResults.fatigabilityScales?.rest?.fatigue ?? 0}</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest"><Zap className="w-4 h-4" /> Pico do Esforço</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-vitality-lime/10 rounded-2xl border border-vitality-lime/20 text-center">
                  <div className="text-[8px] font-bold text-emerald-700 uppercase">Dispneia</div>
                  <div className="text-xl font-black">{testResults.fatigabilityScales?.exercise?.dyspnea ?? 0}</div>
                </div>
                <div className="p-4 bg-vitality-lime/10 rounded-2xl border border-vitality-lime/20 text-center">
                  <div className="text-[8px] font-bold text-emerald-700 uppercase">Fadiga</div>
                  <div className="text-xl font-black">{testResults.fatigabilityScales?.exercise?.fatigue ?? 0}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Resposta Cronotrópica */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6 break-inside-avoid">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-2xl"><Heart className="w-6 h-6" /></div>
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Resposta Cronotrópica</h2>
          </div>
          <div className="p-6 bg-slate-900 rounded-3xl text-white">
            <div className="flex items-center gap-2 text-vitality-lime font-bold text-xs uppercase tracking-widest mb-3">
              <Info className="w-4 h-4" /> Contexto Farmacológico
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              {medications?.betablockers ? 
                "Uso de betabloqueador confirmado. Resposta da Frequência Cardíaca atenuada é esperada. O controle de intensidade deve priorizar a Escala de Borg." :
                "Nenhuma medicação com efeito cronotrópico negativo relatada. Resposta cardíaca deve apresentar linearidade metabólica."
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