import React from 'react';
import { FileText, Download, User, Activity, Zap, Wind, AlertCircle, CheckCircle2, Info, Clock, Heart } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../lib/supabase';
import { motion } from 'motion/react';

export const FinalReport: React.FC = () => {
  const { patientInfo, medications, testResults, updatePatientInfo } = usePatient();
  const { user } = useAuth();

  const handlePrint = async () => {
    if (user) {
      await logActivity(user.id, 'Gerou PDF do Relatório Final');
    }
    window.print();
  };

  const hasData = Object.keys(testResults).length > 0 || patientInfo.age !== '';

  const HRDisplay = ({ hr }: { hr?: { pre: number; post: number } }) => {
    if (!hr || (hr.pre === 0 && hr.post === 0)) return null;
    return (
      <div className="flex items-center gap-3 pt-2 border-t border-slate-200/50 mt-2">
        <div className="flex flex-col">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">FC Pré</span>
          <span className="text-xs font-bold text-slate-700">{hr.pre} bpm</span>
        </div>
        <div className="w-px h-6 bg-slate-200" />
        <div className="flex flex-col">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">FC Pós</span>
          <span className="text-xs font-bold text-slate-700">{hr.post} bpm</span>
        </div>
        <div className="w-px h-6 bg-slate-200" />
        <div className="flex flex-col">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Delta</span>
          <span className="text-xs font-bold text-emerald-600">+{hr.post - hr.pre} bpm</span>
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
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-24">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Relatório Final</h1>
          <p className="text-slate-500 text-sm">Consolidação de dados e interpretação clínica.</p>
        </div>
        <div className="flex items-center gap-4 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-vitality-lime text-slate-900 px-6 py-3 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-vitality-lime/20"
          >
            <Download className="w-5 h-5" />
            Imprimir / PDF
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 print:block">
        {/* Patient Header */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-3 bg-vitality-graphite text-white rounded-2xl">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{patientInfo.name || 'Paciente sem nome'}</h2>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Identificação do Paciente</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Idade</div>
              <div className="text-lg font-bold text-slate-800">{patientInfo.age || '--'} anos</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sexo</div>
              <div className="text-lg font-bold text-slate-800">{patientInfo.sex === 'male' ? 'Masculino' : 'Feminino'}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Peso / Altura</div>
              <div className="text-lg font-bold text-slate-800">{patientInfo.weight || '--'}kg / {patientInfo.height || '--'}cm</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">IMC</div>
              <div className="text-lg font-bold text-slate-800">{patientInfo.imc?.toFixed(1) || '--'} kg/m²</div>
            </div>
          </div>
        </section>

        {/* 1. Capacidade Aeróbica & Funcional (CIF/OMS) - PRIMARY EMPHASIS */}
        <section className="bg-white rounded-3xl p-8 shadow-md border-2 border-vitality-lime/20 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-3 bg-vitality-lime text-slate-900 rounded-2xl">
              <Wind className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Capacidade Aeróbica & Funcional (CIF/OMS)</h2>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Classificação Internacional de Funcionalidade</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testResults.tc6m && (
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">TC6M</span>
                  <div className="text-right">
                    <div className="text-2xl font-black text-slate-900">{testResults.tc6m.distance}m</div>
                    <div className="text-sm font-black text-slate-700">{testResults.tc6m.efficiency.toFixed(1)}% do predito</div>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Comprometimento Funcional</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-800">Qualificador {testResults.tc6m.efficiency < 25 ? '4 (Completo)' : testResults.tc6m.efficiency < 50 ? '3 (Grave)' : testResults.tc6m.efficiency < 75 ? '2 (Moderado)' : testResults.tc6m.efficiency < 95 ? '1 (Leve)' : '0 (Nenhum)'}</span>
                    <div className={`w-3 h-3 rounded-full ${testResults.tc6m.efficiency < 50 ? 'bg-vitality-risk' : testResults.tc6m.efficiency < 75 ? 'bg-amber-400' : 'bg-vitality-lime'}`} />
                  </div>
                </div>
              </div>
            )}

            {testResults.vsaq && (
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">VSAQ</span>
                  <div className="text-right">
                    <div className="text-2xl font-black text-slate-900">{testResults.vsaq.estimatedMETs.toFixed(1)} METs</div>
                    <div className="text-sm font-black text-slate-700">{testResults.vsaq.percentage.toFixed(1)}% do predito</div>
                  </div>
                </div>
                {testResults.vsaq.cif && (
                  <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Comprometimento Funcional</div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-slate-800">Qualificador {testResults.vsaq.cif.severity}</span>
                      <div className={`w-3 h-3 rounded-full ${testResults.vsaq.cif.qualifier >= 3 ? 'bg-vitality-risk' : testResults.vsaq.cif.qualifier >= 2 ? 'bg-amber-400' : 'bg-vitality-lime'}`} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {testResults.td2m && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">TD2M</span>
                  <span className="text-sm font-black text-slate-900">{testResults.td2m.count} passos</span>
                </div>
                <div className="text-[10px] font-bold text-slate-600">{testResults.td2m.interpretation}</div>
                {testResults.td2m.cif && <div className="text-[10px] text-slate-400">CIF: {testResults.td2m.cif.severity}</div>}
              </div>
            )}

            {testResults.tsl1m && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">TSL 1 MIN</span>
                  <span className="text-sm font-black text-slate-900">{testResults.tsl1m.count} rep</span>
                </div>
                <div className="text-[10px] font-bold text-slate-600">{testResults.tsl1m.interpretation}</div>
                {testResults.tsl1m.cif && <div className="text-[10px] text-slate-400">CIF: {testResults.tsl1m.cif.severity}</div>}
              </div>
            )}
          </div>
        </section>

        {/* 2. Integridade e Função Vascular */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-3 bg-vitality-risk text-white rounded-2xl">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Integridade e Função Vascular</h2>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Avaliação de Fluxo e Comprometimento</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testResults.vascularImpairment && (
              <div className="p-6 bg-blue-50 rounded-3xl border-2 border-blue-100 space-y-4">
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Comprometimento Vascular (CIF)</div>
                <div className="grid grid-cols-3 gap-4">
                  {testResults.vascularImpairment.arterial && (
                    <div className="text-center">
                      <div className="text-[8px] font-bold text-blue-400 uppercase">Arterial</div>
                      <div className="text-lg font-black text-blue-900">{testResults.vascularImpairment.arterial.severity}</div>
                    </div>
                  )}
                  {testResults.vascularImpairment.venous && (
                    <div className="text-center">
                      <div className="text-[8px] font-bold text-blue-400 uppercase">Venoso</div>
                      <div className="text-lg font-black text-blue-900">{testResults.vascularImpairment.venous.severity}</div>
                    </div>
                  )}
                  {testResults.vascularImpairment.lymphatic && (
                    <div className="text-center">
                      <div className="text-[8px] font-bold text-blue-400 uppercase">Linfático</div>
                      <div className="text-lg font-black text-blue-900">{testResults.vascularImpairment.lymphatic.severity}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {testResults.abi && (
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Índice Tornozelo-Braquial (ITB)</div>
                <div className="flex justify-between items-center">
                  <div className="text-center flex-1">
                    <div className="text-[8px] font-bold text-slate-400 uppercase">Direito</div>
                    <div className="text-xl font-black text-slate-900">{testResults.abi.right.value.toFixed(2)}</div>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div className="text-center flex-1">
                    <div className="text-[8px] font-bold text-slate-400 uppercase">Esquerdo</div>
                    <div className="text-xl font-black text-slate-900">{testResults.abi.left.value.toFixed(2)}</div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 text-center font-bold">{testResults.abi.right.interpretation}</p>
              </div>
            )}
          </div>
        </section>

        {/* 3. Fadigabilidade e Sintomas */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Fadigabilidade e Sintomas</h2>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Percepção Subjetiva de Esforço (Borg)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <Clock className="w-4 h-4" />
                Repouso
              </div>
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
              <div className="flex items-center gap-2 text-[10px] font-bold text-vitality-lime uppercase tracking-widest">
                <Zap className="w-4 h-4" />
                Exercício (Pico)
              </div>
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

          {testResults.fatigabilityScales?.exercise && (
            <div className="p-4 bg-slate-900 rounded-2xl text-white">
              <div className="text-[10px] font-bold text-vitality-lime uppercase mb-2">Assinatura do Esforço</div>
              <p className="text-xs text-slate-300">
                {testResults.fatigabilityScales.exercise.dyspnea > testResults.fatigabilityScales.exercise.fatigue ? 
                  "Limitação de origem central (cardiopulmonar) predominante." :
                  testResults.fatigabilityScales.exercise.fatigue > testResults.fatigabilityScales.exercise.dyspnea ?
                  "Limitação periférica (muscular/vascular) predominante." :
                  "Resposta equilibrada entre sintomas centrais e periféricos."
                }
              </p>
            </div>
          )}
        </section>

        {/* 4. Resposta Cronotrópica & Perfil Autonômico - FINAL ANALYSIS */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-3 bg-vitality-risk/10 text-vitality-risk rounded-2xl">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Resposta Cronotrópica & Perfil Autonômico</h2>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Interação com Terapia Medicamentosa</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Medication Context */}
            <div className="space-y-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contexto Medicamentoso</div>
              <div className="flex flex-wrap gap-2">
                {medications.betablockers && (
                  <div className="px-3 py-2 bg-red-50 border border-red-100 rounded-xl">
                    <div className="text-[8px] font-bold text-red-400 uppercase">Betabloqueador</div>
                    <div className="text-xs font-bold text-red-700 italic">Resposta da FC atenuada</div>
                  </div>
                )}
                {medications.bcc && <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg">BCC</span>}
                {medications.digitalis && <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg">Digitálico</span>}
                {!medications.betablockers && !medications.bcc && !medications.digitalis && (
                  <span className="text-xs text-slate-400 italic">Sem medicações cronotrópicas negativas relatadas.</span>
                )}
              </div>
            </div>

            {/* HR Response Summary */}
            <div className="space-y-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resumo da Resposta (Pico)</div>
              <div className="space-y-2">
                {testResults.tc6m?.hr && (
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500">TC6M (Δ FC)</span>
                    <span className="text-xs font-black text-slate-800">+{testResults.tc6m.hr.post - testResults.tc6m.hr.pre} bpm</span>
                  </div>
                )}
                {testResults.hrr && (
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500">Recuperação (1 min)</span>
                    <span className={`text-xs font-black ${testResults.hrr.delta < 12 ? 'text-vitality-risk' : 'text-emerald-600'}`}>{testResults.hrr.delta} bpm</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Clinical Interpretation of HR Response */}
          <div className="p-6 bg-vitality-graphite rounded-3xl text-white space-y-3">
            <div className="flex items-center gap-2 text-vitality-lime font-bold text-xs uppercase tracking-widest">
              <Info className="w-4 h-4" />
              Análise Cronotrópica
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {medications.betablockers ? 
                "Paciente em uso de betabloqueador. A resposta cronotrópica atenuada durante o esforço é esperada e reflete a eficácia da terapia. A prescrição do exercício deve basear-se na Escala de Borg ou FC de reserva ajustada." :
                "Ausência de bloqueio adrenérgico relatado. A resposta da frequência cardíaca deve ser avaliada quanto à competência cronotrópica (atingir >80% da FC máxima predita) e eficiência autonômica."
              }
            </p>
            {testResults.hrr && testResults.hrr.delta < 12 && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl mt-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-[10px] text-red-200">
                  <strong>Atenção:</strong> Recuperação da FC &lt; 12 bpm sugere disfunção autonômica e risco cardiovascular aumentado.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
