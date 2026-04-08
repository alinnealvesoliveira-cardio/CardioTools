import React from 'react';
import { FileText, Download, User, Activity, Zap, Wind, AlertCircle, Info, Clock, Heart } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../lib/supabase';
import { getCBDFClassification } from '../../utils/cbdf';

export const FinalReport: React.FC = () => {
  const { patientInfo, medications, testResults } = usePatient();
  const { user } = useAuth();

  const handlePrint = async () => {
    if (user) {
      await logActivity(user.id, 'Gerou PDF do Relatório Final');
    }
    window.print();
  };

  const hasData = Object.keys(testResults).length > 0 || (patientInfo.age && patientInfo.age !== '');

  // Componente interno para Renderizar o Card de Teste CBDF (Padronizado)
  const TestCard = ({ title, testData, badgeColor = "bg-slate-600" }: { title: string, testData: any, badgeColor?: string }) => {
    if (!testData) return null;
    const cbdf = getCBDFClassification(testData.efficiency);

    return (
      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
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
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-24 print:p-0">
      <header className="flex items-center justify-between print:mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Relatório Final</h1>
          <p className="text-slate-500 text-sm">Consolidação de dados e interpretação funcional CBDF-1.</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-vitality-lime text-slate-900 px-6 py-3 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg print:hidden"
        >
          <Download className="w-5 h-5" />
          Imprimir / PDF
        </button>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Identificação do Paciente */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-3 bg-slate-800 text-white rounded-2xl"><User className="w-6 h-6" /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{patientInfo.name || 'Paciente sem nome'}</h2>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Perfil Biométrico</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Idade</div>
              <div className="text-lg font-bold text-slate-800">{patientInfo.age || '--'} anos</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Sexo</div>
              <div className="text-lg font-bold text-slate-800">{patientInfo.sex === 'male' ? 'Masc' : 'Fem'}</div>
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

        {/* 1. Capacidade Funcional (CBDF-1) */}
        <section className="bg-white rounded-3xl p-8 shadow-md border-2 border-vitality-lime/20 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-3 bg-vitality-lime text-slate-900 rounded-2xl"><Wind className="w-6 h-6" /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Capacidade Funcional (CBDF-1)</h2>
              <p className="text-xs text-slate-400 font-medium uppercase">Análise Baseada no Desempenho Esperado</p>
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

        {/* 2. Fadigabilidade e Sintomas */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl"><Activity className="w-6 h-6" /></div>
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Fadigabilidade e Sintomas (Borg)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Clock className="w-4 h-4" /> Repouso</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-[8px] font-bold text-slate-400 uppercase mb-1">Dispneia</div>
                  <div className="text-xl font-black text-slate-900">{testResults.fatigabilityScales?.rest?.dyspnea ?? 0}/10</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-[8px] font-bold text-slate-400 uppercase mb-1">Fadiga</div>
                  <div className="text-xl font-black text-slate-900">{testResults.fatigabilityScales?.rest?.fatigue ?? 0}/10</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-vitality-lime uppercase tracking-widest"><Zap className="w-4 h-4" /> Pico do Esforço</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-vitality-lime/5 rounded-2xl border border-vitality-lime/10">
                  <div className="text-[8px] font-bold text-vitality-lime uppercase mb-1">Dispneia</div>
                  <div className="text-xl font-black text-slate-900">{testResults.fatigabilityScales?.exercise?.dyspnea ?? 0}/10</div>
                </div>
                <div className="p-4 bg-vitality-lime/5 rounded-2xl border border-vitality-lime/10">
                  <div className="text-[8px] font-bold text-vitality-lime uppercase mb-1">Fadiga</div>
                  <div className="text-xl font-black text-slate-900">{testResults.fatigabilityScales?.exercise?.fatigue ?? 0}/10</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Resposta Cronotrópica */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-2xl"><Heart className="w-6 h-6" /></div>
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Resposta Cronotrópica</h2>
          </div>
          <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4">
            <div className="flex items-center gap-2 text-vitality-lime font-bold text-xs uppercase tracking-widest">
              <Info className="w-4 h-4" /> Contexto Clínico
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              {medications.betablockers ? 
                "Uso de betabloqueador confirmado. Resposta da FC atenuada é esperada. O controle de intensidade deve priorizar a Percepção de Esforço (Borg)." :
                "Sem medicações cronotrópicas negativas relatadas. A resposta da FC deve seguir a linearidade metabólica esperada."
              }
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};