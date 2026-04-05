import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, BookOpen, Activity, AlertCircle, CheckCircle2, Save } from 'lucide-react';
import { getCIFClassification } from '../../utils/cif';
import { InterpretationResult } from '../templates/TimedTestTemplate';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../lib/supabase';
import { MedicationAlert } from '../../components/shared/MedicationAlert';

interface VSAQItem {
  score: number;
  label: string;
  question: string;
  description: string;
}

const VSAQ_ITEMS: VSAQItem[] = [
  { score: 1, label: "1 MET", question: "Você se cansa ao comer, vestir-se ou trabalhar em mesa?", description: "Comer, vestir-se, trabalhar em mesa." },
  { score: 2, label: "2 METs", question: "Você se cansa ao caminhar em terreno plano a 3,2 km/h?", description: "Caminhar em terreno plano a 3,2 km/h." },
  { score: 3, label: "3 METs", question: "Você se cansa ao caminhar em terreno plano a 4,0 km/h ou fazer tarefas domésticas leves (limpar pó, lavar louça)?", description: "Caminhar em terreno plano a 4,0 km/h, tarefas domésticas leves." },
  { score: 4, label: "4 METs", question: "Você se cansa ao caminhar em terreno plano a 4,8 km/h ou fazer jardinagem leve (podar, regar)?", description: "Caminhar em terreno plano a 4,8 km/h, jardinagem leve." },
  { score: 5, label: "5 METs", question: "Você se cansa ao caminhar em terreno plano a 5,6 km/h ou fazer tarefas domésticas pesadas (lavar chão, carregar compras)?", description: "Caminhar em terreno plano a 5,6 km/h, tarefas domésticas pesadas." },
  { score: 6, label: "6 METs", question: "Você se cansa ao caminhar em terreno plano a 6,4 km/h ou pedalar a 16 km/h?", description: "Caminhar em terreno plano a 6,4 km/h, pedalar a 16 km/h." },
  { score: 7, label: "7 METs", question: "Você se cansa ao fazer um trote leve a 8,0 km/h ou jardinagem pesada (cavar, carregar terra)?", description: "Trote leve a 8,0 km/h, jardinagem pesada." },
  { score: 8, label: "8 METs", question: "Você se cansa ao correr a 8,8 km/h ou pedalar a 19 km/h?", description: "Correr a 8,8 km/h, pedalar a 19 km/h." },
  { score: 9, label: "9 METs", question: "Você se cansa ao correr a 9,6 km/h ou fazer trabalho braçal pesado?", description: "Correr a 9,6 km/h, trabalho braçal pesado." },
  { score: 10, label: "10 METs", question: "Você se cansa ao correr a 11,2 km/h ou praticar natação?", description: "Correr a 11,2 km/h, natação." },
  { score: 11, label: "11 METs", question: "Você se cansa ao correr a 12,8 km/h?", description: "Correr a 12,8 km/h." },
  { score: 12, label: "12 METs", question: "Você se cansa ao correr a 14,4 km/h?", description: "Correr a 14,4 km/h." },
  { score: 13, label: "13 METs", question: "Você se cansa ao correr a 16,0 km/h?", description: "Correr a 16,0 km/h." },
];

export const VSAQ: React.FC = () => {
  const { patientInfo, medications, updateTestResults, updatePatientInfo } = usePatient();
  const { user } = useAuth();
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [noResponses, setNoResponses] = useState<Set<number>>(new Set());
  const [isSaved, setIsSaved] = useState(false);
  const [localAge, setLocalAge] = useState(patientInfo.age || '');

  useEffect(() => {
    if (patientInfo.age) {
      setLocalAge(patientInfo.age);
    }
  }, [patientInfo.age]);

  const calculateMETs = () => {
    if (selectedScore === null) return null;
    if (!patientInfo.age) return null;
    const ageNum = parseInt(patientInfo.age);
    // Formula validada (Araújo et al., 2002): METs = 4.7 + 0.97 * (VSAQ) - 0.06 * (Idade)
    return 4.7 + (0.97 * selectedScore) - (0.06 * ageNum);
  };

  const calculatePredictedMETs = () => {
    if (!patientInfo.age) return null;
    const ageNum = parseInt(patientInfo.age);
    // Morris et al. (1993): 14.7 - (0.11 * age)
    return 14.7 - (0.11 * ageNum);
  };

  const estimatedMETs = calculateMETs();
  const predictedMETs = calculatePredictedMETs();
  const percentage = estimatedMETs && predictedMETs ? (estimatedMETs / predictedMETs) * 100 : null;
  const cif = estimatedMETs && predictedMETs ? getCIFClassification(estimatedMETs, predictedMETs) : null;

  const colorClasses = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  const getInterpretation = (mets: number) => {
    if (mets < 5) return { label: "Capacidade Funcional Muito Baixa (Grave)", color: "red", desc: "Alto risco cardiovascular e limitação funcional severa." };
    if (mets < 7) return { label: "Capacidade Funcional Baixa", color: "orange", desc: "Limitação moderada das atividades diárias." };
    if (mets < 10) return { label: "Capacidade Funcional Moderada", color: "yellow", desc: "Desempenho médio, compatível com atividades habituais." };
    return { label: "Capacidade Funcional Boa", color: "green", desc: "Baixo risco cardiovascular e bom condicionamento físico." };
  };

  const handleSave = async () => {
    if (estimatedMETs === null) return;
    const interpretation = getInterpretation(estimatedMETs);
    updateTestResults({
      vsaq: {
        score: selectedScore || 0,
        estimatedMETs: estimatedMETs,
        predictedMETs: predictedMETs || 0,
        percentage: percentage || 0,
        interpretation: interpretation.label,
        cif: cif ? {
          qualifier: cif.qualifier,
          severity: cif.severity
        } : undefined
      }
    });

    if (user) {
      await logActivity(user.id, 'Finalizou Teste VSAQ');
    }
    
    setIsSaved(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Veterans Specific Activity Questionnaire (VSAQ)</h1>
        <p className="text-slate-500 text-sm">Avalia a capacidade funcional e capacidade aeróbica (METs) baseada em atividades diárias.</p>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5" />
          <p className="text-xs text-blue-700 leading-relaxed">
            Instrução: Marque <strong>"Sim"</strong> na atividade que melhor descreve o nível de esforço em que o paciente começa a sentir cansaço ou falta de ar. O valor de MET correspondente será utilizado para o cálculo da capacidade aeróbica.
          </p>
        </div>
      </header>

      <MedicationAlert type="betablockers" active={medications.betablockers} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Inputs */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            {!patientInfo.age && (
              <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-3xl space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-500 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-amber-900">Idade não informada</p>
                    <p className="text-xs text-amber-700">A idade é necessária para calcular a Capacidade Aeróbica Estimada (METs) e o Comprometimento Funcional (CIF/OMS).</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={localAge}
                    placeholder="Digite a idade..."
                    className="flex-1 p-3 bg-white border border-amber-200 rounded-xl text-sm outline-none focus:border-amber-500 transition-all"
                    onChange={(e) => setLocalAge(e.target.value)}
                  />
                  <button
                    onClick={() => {
                      if (localAge) updatePatientInfo({ age: localAge });
                    }}
                    className="px-6 py-3 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-all shadow-sm"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            )}
            {patientInfo.age && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Idade do Paciente</p>
                    <p className="text-sm font-bold text-emerald-900">{patientInfo.age} anos</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setLocalAge(patientInfo.age);
                    updatePatientInfo({ age: '' });
                  }}
                  className="text-[10px] font-bold text-emerald-600 hover:underline uppercase tracking-widest"
                >
                  Alterar
                </button>
              </div>
            )}
            
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Responda às perguntas para identificar sua capacidade funcional máxima
              </label>
              <div className="grid grid-cols-1 gap-4">
                {VSAQ_ITEMS.map((item) => {
                  const isYes = selectedScore === item.score;
                  const isNo = noResponses.has(item.score);
                  
                  return (
                    <div
                      key={item.score}
                      className={`w-full p-6 rounded-3xl transition-all border-2 space-y-4 ${
                        isYes
                          ? 'bg-emerald-50 border-emerald-500 shadow-md'
                          : isNo
                          ? 'bg-red-50 border-red-200 opacity-60'
                          : 'bg-slate-50 border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shrink-0 text-lg ${
                          isYes ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 shadow-sm'
                        }`}>
                          {item.score}
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="text-sm font-bold text-slate-800 leading-relaxed">
                            {item.question}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">
                            {item.label}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setSelectedScore(item.score);
                            setNoResponses(prev => {
                              const next = new Set(prev);
                              next.delete(item.score);
                              return next;
                            });
                            setIsSaved(false);
                          }}
                          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                            isYes
                              ? 'bg-emerald-500 text-white shadow-lg'
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-500 hover:text-emerald-600'
                          }`}
                        >
                          {isYes && <CheckCircle2 className="w-4 h-4" />}
                          Sim
                        </button>
                        <button
                          onClick={() => {
                            if (isYes) setSelectedScore(null);
                            setNoResponses(prev => {
                              const next = new Set(prev);
                              next.add(item.score);
                              return next;
                            });
                            setIsSaved(false);
                          }}
                          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                            isNo
                              ? 'bg-red-500 text-white shadow-lg'
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-red-500 hover:text-red-600'
                          }`}
                        >
                          Não
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            {/* Result Card */}
            <AnimatePresence mode="wait">
              {selectedScore !== null ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center space-y-4">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Capacidade Funcional (VSAQ)</div>
                      <div className="text-4xl font-black text-slate-900 tabular-nums">
                        {selectedScore} METs
                      </div>
                    </div>

                    {estimatedMETs !== null ? (
                      <div className="pt-4 border-t border-slate-100">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Capacidade Aeróbica Estimada</div>
                        <div className="text-6xl font-black text-emerald-600 tabular-nums">
                          {estimatedMETs.toFixed(1)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">METs (VO₂máx estimado)</div>
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-slate-100 p-4 bg-amber-50 rounded-2xl">
                        <p className="text-[10px] text-amber-700 font-bold leading-tight">
                          Preencha a idade no Cadastro para calcular a Capacidade Aeróbica Estimada e o Comprometimento Funcional (CIF/OMS).
                        </p>
                      </div>
                    )}
                  </div>

                  {estimatedMETs !== null && (
                    <>
                      {(() => {
                        const interpretation = getInterpretation(estimatedMETs);
                        return (
                          <div className={`rounded-2xl p-6 border-2 shadow-lg ${
                            interpretation.color === 'red' ? 'bg-red-50 border-red-200 text-red-700' :
                            interpretation.color === 'orange' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                            interpretation.color === 'yellow' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                            'bg-emerald-50 border-emerald-200 text-emerald-700'
                          }`}>
                            <div className="text-sm font-bold uppercase tracking-wider opacity-70 mb-2">Interpretação</div>
                            <div className="text-xl font-bold mb-2">{interpretation.label}</div>
                            <p className="text-sm opacity-90">{interpretation.desc}</p>
                          </div>
                        );
                      })()}

                      {cif && (
                        <div className={`rounded-3xl p-8 border-4 shadow-2xl transform scale-105 transition-all ${colorClasses[cif.color as keyof typeof colorClasses] || colorClasses.slate}`}>
                          <div className="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-3 text-center">Comprometimento Funcional (CIF/OMS)</div>
                          <div className="flex justify-between items-center mb-4 border-b border-current pb-4 opacity-80">
                            <div className="text-2xl font-black">Qualificador {cif.severity}</div>
                            <div className="text-sm font-black">{percentage?.toFixed(1)}% do predito</div>
                          </div>
                          <div className="text-2xl font-black mb-2 text-center leading-tight">CIF/OMS</div>
                          <p className="text-sm font-medium opacity-80 text-center">Deficiência: {cif.deficiencyRange}</p>
                        </div>
                      )}
                    </>
                  )}

                  <button
                    onClick={handleSave}
                    disabled={isSaved || selectedScore === null}
                    className={`w-full flex items-center justify-center gap-2 p-4 rounded-2xl font-bold transition-all shadow-lg ${
                      isSaved 
                        ? 'bg-emerald-100 text-emerald-600 cursor-not-allowed'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Resultado Gravado
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Gravar no Relatório
                      </>
                    )}
                  </button>

                  {cif && (
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Cálculo do Percentual
                      </div>
                      <div className="text-xs text-slate-600 font-mono bg-white p-2 rounded-lg border border-slate-100 text-center">
                        % Predito = (Obs / Esp) × 100
                      </div>
                      <p className="text-[10px] text-slate-500 italic leading-tight">
                        O percentual do predito é calculado pela razão entre o valor observado e o valor esperado por equações de referência.
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="bg-slate-50 rounded-3xl p-8 border-2 border-dashed border-slate-200 text-center">
                  <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">Selecione uma atividade para ver o resultado.</p>
                </div>
              )}
            </AnimatePresence>

            {/* Clinical Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <Info className="w-4 h-4" />
                  Pérolas Clínicas
                </div>
                <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                  <li>O VSAQ é superior ao questionário da NYHA para prever METs.</li>
                  <li>Ajuda a definir a carga inicial em testes de esforço em esteira.</li>
                  <li>Cada MET adicional no VSAQ está associado a 12% de aumento na sobrevida.</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Uso Clínico
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  A pontuação é o valor em METs da atividade que o paciente identifica como o limite para o aparecimento de sintomas.
                </p>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 flex flex-col gap-1 italic">
              <div className="flex gap-2">
                <BookOpen className="w-3 h-3 flex-shrink-0" />
                Araújo CG, et al. Arq Bras Cardiol. 2002.
              </div>
              <div className="flex gap-2">
                <BookOpen className="w-3 h-3 flex-shrink-0" />
                Fuentes-Abolafio IJ, et al. Sci Rep 2022 (https://pmc.ncbi.nlm.nih.gov/articles/PMC9051131/).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
