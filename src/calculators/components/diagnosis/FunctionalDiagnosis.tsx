import React, { useState, useEffect } from 'react';
import { FileText, Copy, Check, Heart, Droplets, ClipboardList, Share2 } from 'lucide-react';
import { usePatient } from '../../../context/PatientContext';
import { toast } from 'react-hot-toast';

type Severity = 'Leve' | 'Moderada' | 'Grave' | 'Completa';
type VesselType = 'Arterial' | 'Venosa' | 'Linfática' | 'Nenhuma';

export const FunctionalDiagnosis: React.FC = () => {
  const { testResults, medications, patientInfo, updatePatientInfo } = usePatient();
  
  const [aerobicCapacity, setAerobicCapacity] = useState<string>('0-4');
  const [vesselType, setVesselType] = useState<VesselType>('Arterial');
  const [vesselSeverity, setVesselSeverity] = useState<Severity>('Leve');
  const [fatigueState, setFatigueState] = useState<'Repouso' | 'Esforço'>('Repouso');
  const [hrMedication, setHrMedication] = useState<boolean>(
    !!(medications.betablockers || medications.antihypertensives)
  );
  const [copied, setCopied] = useState(false);

  // 1. Lógica de Intensidade de Fadiga (Maior valor de Borg registrado)
  const maxFatigueScore = Math.max(
    testResults?.fatigabilityScales?.exercise?.fatigue ?? 0,
    testResults?.fatigabilityScales?.exercise?.dyspnea ?? 0
  );
  
  const getFatigueLabel = (score: number) => {
    if (score >= 10) return 'EXAUSTIVA';
    if (score >= 7) return 'GRAVE';
    if (score >= 4) return 'MODERADA';
    if (score >= 1) return 'LEVE';
    return 'NENHUMA';
  };

  // 2. Agregador Universal de Testes
  useEffect(() => {
    // Capacidade Aeróbica
    if (testResults?.sixMinuteWalkTest) {
      const eff = testResults.sixMinuteWalkTest.efficiency ?? 0;
      if (eff < 5) setAerobicCapacity('0-4');
      else if (eff < 25) setAerobicCapacity('5-24');
      else if (eff < 50) setAerobicCapacity('25-49');
      else setAerobicCapacity('50-95');
    } else if (testResults?.td2m?.cif?.qualifier) {
      const mapping: Record<number, string> = { 4: '0-4', 3: '5-24', 2: '25-49', 1: '50-95' };
      setAerobicCapacity(mapping[testResults.td2m.cif.qualifier] ?? '50-95');
    } else if (testResults?.tsl1m?.cif?.qualifier) {
      const mapping: Record<number, string> = { 4: '0-4', 3: '5-24', 2: '25-49', 1: '50-95' };
      setAerobicCapacity(mapping[testResults.tsl1m.cif.qualifier] ?? '50-95');
    }

    // Sincronização Vascular
    const vasc = testResults?.vascularAssessment;
    if (vasc) {
      const severityMap: Record<number, Severity> = { 1: 'Leve', 2: 'Moderada', 3: 'Grave', 4: 'Completa' };
      
      if (vasc.arterial?.cif && vasc.arterial.cif.qualifier !== 4) {
        setVesselType('Arterial');
        setVesselSeverity(severityMap[vasc.arterial.cif.qualifier] ?? 'Leve');
      } else if (vasc.venous?.cif && vasc.venous.cif.qualifier !== 4) {
        setVesselType('Venosa');
        setVesselSeverity(severityMap[vasc.venous.cif.qualifier] ?? 'Leve');
      }
    }

    if (testResults?.sixMinuteWalkTest || testResults?.td2m || testResults?.stepTest) {
      setFatigueState('Esforço');
    }
  }, [testResults]);

  const generateDiagnosis = () => {
    const struct = patientInfo.structureAlteration ? 'COM' : 'SEM';
    const capLevel = 
      aerobicCapacity === '0-4' ? 'COMPLETA' : 
      aerobicCapacity === '5-24' ? 'GRAVE' : 
      aerobicCapacity === '25-49' ? 'MODERADA' : 'LEVE';
    
    let text = `DIAGNÓSTICO CINÉTICO-FUNCIONAL: D05.01.4.4.1.4 - DEFICIÊNCIA FUNCIONAL CARDIOVASCULAR - ${struct} ALTERAÇÃO DE ESTRUTURA.`;
    text += ` | DEFICIÊNCIA ${capLevel} DA CAPACIDADE AERÓBICA (FAIXA DE ${aerobicCapacity}% DO PREVISTO).`;
    
    if (vesselType !== 'Nenhuma') {
      text += ` | ALTERAÇÃO DAS FUNÇÕES DOS VASOS (${vesselType.toUpperCase()}) EM GRAU ${vesselSeverity.toUpperCase()}.`;
    }

    text += ` | FADIGA ${getFatigueLabel(maxFatigueScore)} AO ${fatigueState.toUpperCase()}.`;
    text += ` | RESPOSTA CRONOTRÓPICA: ${hrMedication ? 'INFLUENCIADA POR FÁRMACOS' : 'FISIOLÓGICA'}.`;

    const testsPerformed: string[] = [];
    if (testResults?.sixMinuteWalkTest) testsPerformed.push(`TC6M: ${testResults.sixMinuteWalkTest.distance}M (${testResults.sixMinuteWalkTest.efficiency?.toFixed(1)}%)`);
    if (testResults?.td2m) testsPerformed.push(`TD2M: ${testResults.td2m.count} DEGRAUS`);
    if (testResults?.tsl1m) testsPerformed.push(`TSL1M: ${testResults.tsl1m.count} REPETIÇÕES`);
    if (testResults?.tsl5x) testsPerformed.push(`TSL5X: ${testResults.tsl5x.time}S`);
    if (testResults?.tug) testsPerformed.push(`TUG: ${testResults.tug.time}S`);
    if (testResults?.stepTest) testsPerformed.push(`STEP TEST: ${testResults.stepTest.time}S`);

    if (testsPerformed.length > 0) {
      text += `\n\n[SUMÁRIO DE TESTES: ${testsPerformed.join(' | ')}]`;
    }

    return text.toUpperCase();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateDiagnosis());
    setCopied(true);
    toast.success("Diagnóstico copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8 pb-32">
      {/* ... (Header e seções mantêm o mesmo visual, mas agora com estados seguros) */}
      <header className="px-2">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase flex items-center gap-3">
          <FileText className="text-indigo-600" size={32} /> Laudo Final
        </h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Consolidação de Dados Cinético-Funcionais</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 space-y-8">
            {/* ... (Conteúdo interno das seções segue igual, apenas garantindo que os selects usem os estados tipados) */}
            <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
              <div className="p-3 bg-red-50 text-red-500 rounded-2xl"><Heart size={24} /></div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Capacidade Aeróbica</h2>
            </div>
            {/* ... restante do JSX ... */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Alteração de Estrutura</label>
                <div className="flex bg-slate-100 p-1 rounded-2xl">
                  {[true, false].map((val) => (
                    <button
                      key={val ? 'sim' : 'nao'}
                      onClick={() => updatePatientInfo({ structureAlteration: val })}
                      className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${
                        patientInfo.structureAlteration === val ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
                      }`}
                    >
                      {val ? 'Com Alteração' : 'Sem Alteração'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Nível de Deficiência</label>
                <select 
                  value={aerobicCapacity}
                  onChange={(e) => setAerobicCapacity(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl p-3 font-black text-[10px] uppercase text-slate-600 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="0-4">Completa (0-4%)</option>
                  <option value="5-24">Grave (5-24%)</option>
                  <option value="25-49">Moderada (25-49%)</option>
                  <option value="50-95">Leve (50-95%)</option>
                </select>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
              <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl"><Droplets size={24} /></div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Funções Vasculares</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Comprometimento</label>
                <div className="flex flex-wrap gap-2">
                  {(['Arterial', 'Venosa', 'Linfática', 'Nenhuma'] as VesselType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setVesselType(type)}
                      className={`px-4 py-2 rounded-xl font-black text-[9px] uppercase transition-all ${
                        vesselType === type ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              {/* ... (restante dos inputs mantêm a mesma lógica) ... */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Uso de Beta-bloqueador</label>
                <button
                  onClick={() => setHrMedication(!hrMedication)}
                  className={`w-full py-3 rounded-2xl font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 ${
                    hrMedication ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-50 text-slate-400'
                  }`}
                >
                  {hrMedication ? <Check size={14} /> : null}
                  {hrMedication ? 'Medicação Ativa' : 'Sem Influência'}
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* ... (Coluna do laudo permanece igual) ... */}
        <div className="lg:col-span-5">
           <div className="sticky top-6">
             <div className="bg-slate-900 rounded-[44px] p-10 text-white shadow-2xl space-y-8">
               <div className="flex items-center justify-between">
                 <h3 className="text-xl font-black italic tracking-tighter">DIAGNÓSTICO E CIF</h3>
                 <ClipboardList className="text-slate-600" size={24} />
               </div>
               <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 min-h-[250px] relative group">
                 <p className="text-[11px] leading-relaxed font-mono text-slate-300 break-words uppercase">
                   {generateDiagnosis()}
                 </p>
               </div>
               <button
                 onClick={handleCopy}
                 className={`w-full py-6 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl ${
                   copied ? 'bg-emerald-500 scale-95' : 'bg-indigo-600 hover:bg-indigo-500'
                 }`}
               >
                 {copied ? <Check size={20} /> : <Share2 size={20} />}
                 {copied ? 'CONCLUÍDO' : 'COPIAR PARA O PRONTUÁRIO'}
               </button>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};