import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Copy, Check, Info, AlertCircle, Activity, Heart, Wind, Droplets } from 'lucide-react';
import { usePatient } from '../../../context/PatientContext';

type Severity = 'Leve' | 'Moderada' | 'Grave' | 'Completa';

export const FunctionalDiagnosis: React.FC = () => {
  const { testResults, medications, patientInfo, updatePatientInfo } = usePatient();
  const [aerobicCapacity, setAerobicCapacity] = useState<string>('0-4');
  const [vesselType, setVesselType] = useState<'Arterial' | 'Venosa' | 'Linfática' | 'Nenhuma'>('Arterial');
  const [vesselSeverity, setVesselSeverity] = useState<Severity>('Leve');
  const [fatigueState, setFatigueState] = useState<'Repouso' | 'Esforço'>('Repouso');
  const [hrMedication, setHrMedication] = useState<boolean>(
    !!(medications.betablockers || medications.antihypertensives)
  );
  const [cateDone, setCateDone] = useState<boolean>(false);
  const [cateFindings, setCateFindings] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // 1. Cálculo de Fadiga baseado na escala de esforço
  const maxFatigue = Math.max(
    testResults.fatigabilityScales?.exercise.fatigue || 0,
    testResults.fatigabilityScales?.exercise.dyspnea || 0
  );
  
  let fatigue = 'Nenhuma';
  if (maxFatigue >= 10) fatigue = 'Exaustiva';
  else if (maxFatigue >= 7) fatigue = 'Grave';
  else if (maxFatigue >= 4) fatigue = 'Moderada';
  else if (maxFatigue >= 1) fatigue = 'Leve';

  // 2. Auto-população baseada nos resultados salvos
  useEffect(() => {
    // Capacidade Aeróbica (Prioridade para o TC6M)
    if (testResults.sixMinuteWalkTest) {
      const efficiency = testResults.sixMinuteWalkTest.efficiency || 0;
      if (efficiency < 5) setAerobicCapacity('0-4');
      else if (efficiency < 25) setAerobicCapacity('5-24');
      else if (efficiency < 50) setAerobicCapacity('25-49');
      else setAerobicCapacity('50-95');
    } else if (testResults.td2m?.cif) {
      const q = testResults.td2m.cif.qualifier;
      if (q === 4) setAerobicCapacity('0-4');
      else if (q === 3) setAerobicCapacity('5-24');
      else if (q === 2) setAerobicCapacity('25-49');
      else if (q === 1) setAerobicCapacity('50-95');
    }

    // Avaliação Vascular
    if (testResults.vascularAssessment) {
      const { arterial, venous, lymphatic } = testResults.vascularAssessment;
      if (arterial && arterial.cif !== '0') {
        setVesselType('Arterial');
        setVesselSeverity(arterial.cif as any);
      } else if (venous && venous.cif !== '0') {
        setVesselType('Venosa');
        setVesselSeverity(venous.cif as any);
      } else if (lymphatic && lymphatic.cif !== '0') {
        setVesselType('Linfática');
        setVesselSeverity(lymphatic.cif as any);
      }
    }

    // Estado de Fadiga
    if (testResults.sixMinuteWalkTest || testResults.stepTest) {
      setFatigueState('Esforço');
    }
  }, [testResults]);

  useEffect(() => {
    setHrMedication(!!(medications.betablockers || medications.antihypertensives));
  }, [medications]);

  const generateDiagnosis = () => {
    const structureStr = patientInfo.structureAlteration ? 'Com' : 'Sem';
    const base = `D05.01.4.4.1.4 - Deficiência Cinético-funcional Cardiovascular - ${structureStr} alteração de estrutura`;
    const capacity = ` | ${aerobicCapacity === '0-4' ? 'Completa' : aerobicCapacity === '5-24' ? 'Grave' : aerobicCapacity === '25-49' ? 'Moderada' : 'Leve'} alteração da capacidade aeróbica: (${aerobicCapacity}% do previsto)`;
    
    let vessel = '';
    if (vesselType !== 'Nenhuma') {
      vessel = ` | Com alteração das funções dos vasos - ${vesselType.toLowerCase()}-${vesselSeverity.toLowerCase()}`;
    }

    const fatigueStr = ` | ${fatigue} fadiga - ${fatigueState.toLowerCase()}`;
    const hr = ` | Com alteração da frequência cardíaca - ${hrMedication ? 'Com medicação' : 'Sem medicação'}`;
    const cate = cateDone ? ` | CATE: ${cateFindings || 'Realizado'}` : '';

    let testsSummary = '';
    const tests = [];
    if (testResults.sixMinuteWalkTest) tests.push(`TC6M: ${testResults.sixMinuteWalkTest.distance}m (${testResults.sixMinuteWalkTest.efficiency?.toFixed(1)}%)`);
    if (testResults.td2m) tests.push(`TD2M: ${testResults.td2m.count} passos`);
    if (testResults.tsl1m) tests.push(`TSL1M: ${testResults.tsl1m.count} rep`);
    if (testResults.tsl5x) tests.push(`TSL5X: ${testResults.tsl5x.time}s`);
    if (testResults.tug) tests.push(`TUG: ${testResults.tug.time}s`);
    
    if (tests.length > 0) {
      testsSummary = `\n\nTestes Realizados: ${tests.join(' | ')}`;
    }

    return `${base}${capacity}${vessel}${fatigueStr}${hr}${cate}${testsSummary}`;
  };

  const diagnosis = generateDiagnosis();

  const handleCopy = () => {
    navigator.clipboard.writeText(diagnosis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-24">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gerador de Diagnóstico Funcional</h1>
        <p className="text-slate-500 text-sm">Construa o diagnóstico cinético-funcional padronizado.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-2 text-slate-800 font-bold mb-4">
              <Heart className="w-5 h-5 text-red-500" />
              Estrutura e Capacidade
            </div>
            
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alteração de Estrutura</label>
              <div className="flex gap-2">
                {['Com', 'Sem'].map((s) => (
                  <button
                    key={s}
                    onClick={() => updatePatientInfo({ structureAlteration: s === 'Com' })}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 ${
                      (patientInfo.structureAlteration ? 'Com' : 'Sem') === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-500 border-transparent'
                    }`}
                  >
                    {s} alteração
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Capacidade Aeróbica (% do previsto)</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { range: '0-4', label: 'Completa (0-4%)' },
                  { range: '5-24', label: 'Grave (5-24%)' },
                  { range: '25-49', label: 'Moderada (25-49%)' },
                  { range: '50-95', label: 'Leve (50-95%)' },
                ].map((c) => (
                  <button
                    key={c.range}
                    onClick={() => setAerobicCapacity(c.range)}
                    className={`py-3 px-4 rounded-xl font-bold text-xs transition-all border-2 ${
                      aerobicCapacity === c.range ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-50 text-slate-500 border-transparent'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-2 text-slate-800 font-bold mb-4">
              <Droplets className="w-5 h-5 text-blue-500" />
              Função dos Vasos
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo de Alteração</label>
              <div className="flex flex-wrap gap-2">
                {['Arterial', 'Venosa', 'Linfática', 'Nenhuma'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setVesselType(v as any)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition-all border-2 ${
                      vesselType === v ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-500 border-transparent'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {vesselType !== 'Nenhuma' && (
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gravidade Vascular</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Leve', 'Moderada', 'Grave', 'Completa'] as Severity[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setVesselSeverity(s)}
                      className={`py-2 rounded-xl font-bold text-[10px] transition-all border-2 ${
                        vesselSeverity === s ? 'bg-blue-100 text-blue-900 border-blue-200' : 'bg-slate-50 text-slate-500 border-transparent'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-2 text-slate-800 font-bold mb-4">
              <Activity className="w-5 h-5 text-amber-500" />
              Fadiga e Frequência Cardíaca
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Intensidade Fadiga</label>
                <div className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-600">
                  {fatigue}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</label>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                  {['Repouso', 'Esforço'].map(s => (
                    <button
                      key={s}
                      onClick={() => setFatigueState(s as any)}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${
                        fatigueState === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hrMedication ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">Frequência Cardíaca</div>
                  <div className="text-[10px] text-slate-500">Uso de medicação cronotrópica</div>
                </div>
              </div>
              <button
                onClick={() => setHrMedication(!hrMedication)}
                className={`w-12 h-6 rounded-full transition-all relative ${hrMedication ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${hrMedication ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2 text-emerald-400">
                  <FileText className="w-4 h-4" />
                  Diagnóstico Final
                </h3>
                <button
                  onClick={handleCopy}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <p className="text-sm leading-relaxed font-mono break-words">
                  {diagnosis}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};