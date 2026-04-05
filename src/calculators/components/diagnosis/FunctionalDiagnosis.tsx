import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Copy, Check, Info, AlertCircle, Activity, Heart, Wind, Droplets } from 'lucide-react';
import { usePatient } from '../../../context/PatientContext';

type Severity = 'Leve' | 'Moderada' | 'Grave' | 'Completa';

export const FunctionalDiagnosis: React.FC = () => {
  const { testResults, medications, patientInfo, updatePatientInfo, updateTestResults } = usePatient();
  const [aerobicCapacity, setAerobicCapacity] = useState<string>('0-4');
  const [vesselType, setVesselType] = useState<'Arterial' | 'Venosa' | 'Linfática' | 'Nenhuma'>('Arterial');
  const [vesselSeverity, setVesselSeverity] = useState<Severity>('Leve');
  const [fatigueState, setFatigueState] = useState<'Repouso' | 'Esforço'>('Repouso');
  const [hrMedication, setHrMedication] = useState<boolean>(medications.betablockers || medications.bcc || medications.digitalis);
  const [cateDone, setCateDone] = useState<boolean>(false);
  const [cateFindings, setCateFindings] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const maxFatigue = Math.max(testResults.fatigabilityScales?.dyspnea || 0, testResults.fatigabilityScales?.fatigue || 0);
  let fatigue = 'Nenhuma';
  if (maxFatigue >= 10) fatigue = 'Exaustiva';
  else if (maxFatigue >= 7) fatigue = 'Grave';
  else if (maxFatigue >= 4) fatigue = 'Moderada';
  else if (maxFatigue >= 1) fatigue = 'Leve';

  // Auto-populate based on saved tests
  useEffect(() => {
    // 1. Aerobic Capacity
    // Check TC6M first as it's the gold standard
    if (testResults.tc6m) {
      const efficiency = testResults.tc6m.efficiency;
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

    // 2. Vascular
    if (testResults.vascularImpairment) {
      if (testResults.vascularImpairment.arterial) {
        setVesselType('Arterial');
        setVesselSeverity(testResults.vascularImpairment.arterial.severity as Severity);
      } else if (testResults.vascularImpairment.venous) {
        setVesselType('Venosa');
        setVesselSeverity(testResults.vascularImpairment.venous.severity as Severity);
      } else if (testResults.vascularImpairment.lymphatic) {
        setVesselType('Linfática');
        setVesselSeverity(testResults.vascularImpairment.lymphatic.severity as Severity);
      }
    }

    // 3. Fatigue
    if (testResults.tc6m?.fatigability) {
      setFatigueState('Esforço');
    }
  }, [testResults]);

  useEffect(() => {
    setHrMedication(medications.betablockers || medications.bcc || medications.digitalis);
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

    // Summary of tests
    let testsSummary = '';
    const tests = [];
    if (testResults.tc6m) tests.push(`TC6M: ${testResults.tc6m.distance}m (${testResults.tc6m.efficiency.toFixed(1)}%)`);
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
          {/* Estrutura e Capacidade */}
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

          {/* Função dos Vasos */}
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
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gravidade da Alteração Vascular</label>
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

          {/* Fadiga e FC */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-2 text-slate-800 font-bold mb-4">
              <Activity className="w-5 h-5 text-amber-500" />
              Fadiga e Frequência Cardíaca
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Intensidade Fadiga (Calculada)</label>
                <div className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-600">
                  {fatigue}
                </div>
                <p className="text-[10px] text-slate-400">Baseado nas Escalas de Fadigabilidade</p>
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

          {/* CATE */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Wind className="w-5 h-5 text-slate-400" />
                CATE (Cateterismo)
              </div>
              <button
                onClick={() => setCateDone(!cateDone)}
                className={`px-4 py-1 rounded-full text-[10px] font-bold transition-all ${
                  cateDone ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {cateDone ? 'Realizado' : 'Não Realizado'}
              </button>
            </div>

            {cateDone && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Achados do CATE</label>
                <textarea
                  value={cateFindings}
                  onChange={(e) => setCateFindings(e.target.value)}
                  placeholder="Ex: Obstrução 70% DA, 50% Cx..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:border-emerald-500 outline-none transition-all min-h-[100px]"
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* Result Sidebar */}
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
                  title="Copiar Diagnóstico"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <p className="text-sm leading-relaxed font-mono break-words">
                  {diagnosis}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] text-emerald-400/60 uppercase font-bold tracking-widest">
                  <Info className="w-3 h-3" />
                  Dica de Uso
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed">
                  Este diagnóstico segue o modelo cinético-funcional cardiovascular. 
                  Copie e cole diretamente no prontuário do paciente.
                </p>
              </div>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 space-y-4">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                <AlertCircle className="w-4 h-4" />
                Interpretação da Capacidade
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px]">
                  <span className="text-emerald-800 font-bold">0-4%</span>
                  <span className="text-emerald-600">Completa</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-emerald-800 font-bold">5-24%</span>
                  <span className="text-emerald-600">Grave</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-emerald-800 font-bold">25-49%</span>
                  <span className="text-emerald-600">Moderada</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-emerald-800 font-bold">50-95%</span>
                  <span className="text-emerald-600">Leve</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
