import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Info, AlertCircle, CheckCircle2, Thermometer, Droplets, Fingerprint, Layers, HelpCircle, X } from 'lucide-react';
import { usePatient } from '../../hooks/usePatient';
import { MedicationAlert } from '../../components/shared/MedicationAlert';
import { VascularDiagnosticHelp } from '../../components/shared/VascularDiagnosticHelp';

type System = 'Arterial' | 'Venoso' | 'Linfático';

export const VascularPhysicalExam: React.FC = () => {
  const { patientInfo, medications, testResults, updateTestResults } = usePatient();
  const [activeSystem, setActiveSystem] = useState<System>('Arterial');
  const [showHelp, setShowHelp] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Arterial State
  const [pulse, setPulse] = useState<number | null>(null);
  const [temp, setTemp] = useState<string>('Normal');
  const [capillaryRefill, setCapillaryRefill] = useState<string>('');

  // Venous State
  const [ceap, setCeap] = useState<string>('C0');
  const [godet, setGodet] = useState<number | null>(null);

  // Lymphatic State
  const [stemmer, setStemmer] = useState<boolean | null>(null);

  React.useEffect(() => {
    setIsSaved(false);
  }, [pulse, temp, capillaryRefill, ceap, godet, stemmer]);

  const handleSave = () => {
    updateTestResults({
      vascularImpairment: {
        arterial: arterialCIF ? { qualifier: arterialCIF.qualifier, severity: arterialCIF.severity } : undefined,
        venous: venousCIF ? { qualifier: venousCIF.qualifier, severity: venousCIF.severity } : undefined,
        lymphatic: lymphaticCIF ? { qualifier: lymphaticCIF.qualifier, severity: lymphaticCIF.severity } : undefined
      }
    });
    setIsSaved(true);
  };

  const getArterialCIF = () => {
    if (pulse === null) return null;
    const refill = parseFloat(capillaryRefill);
    
    if (pulse >= 2 && temp === 'Normal' && (refill <= 3 || isNaN(refill))) 
      return { qualifier: 0, severity: "Normal", color: "vitality-lime" };
    if (pulse === 1 && temp === 'Normal') 
      return { qualifier: 1, severity: "Leve", color: "blue-500" };
    if (pulse === 1 && temp === 'Fria (Isquemia)') 
      return { qualifier: 2, severity: "Moderada", color: "amber-500" };
    if (pulse === 0 && temp === 'Fria (Isquemia)') 
      return { qualifier: 3, severity: "Grave", color: "orange-500" };
    if (pulse === 0 && refill > 5) 
      return { qualifier: 4, severity: "Completa", color: "vitality-risk" };
    
    return { qualifier: 1, severity: "Leve", color: "blue-500" };
  };

  const getVenousCIF = () => {
    if (ceap === 'C0' && (godet === null || godet === 0)) 
      return { qualifier: 0, severity: "Normal", color: "vitality-lime" };
    if (ceap === 'C1' || ceap === 'C2') 
      return { qualifier: 1, severity: "Leve", color: "blue-500" };
    if (ceap === 'C3' || ceap === 'C4' || godet === 2) 
      return { qualifier: 2, severity: "Moderada", color: "amber-500" };
    if (ceap === 'C5' || godet === 3) 
      return { qualifier: 3, severity: "Grave", color: "orange-500" };
    if (ceap === 'C6' || godet === 4) 
      return { qualifier: 4, severity: "Completa", color: "vitality-risk" };
    
    return { qualifier: 1, severity: "Leve", color: "blue-500" };
  };

  const getLymphaticCIF = () => {
    if (stemmer === null) return null;
    if (stemmer === false) 
      return { qualifier: 0, severity: "Normal", color: "vitality-lime" };
    if (stemmer === true) 
      return { qualifier: 2, severity: "Moderada", color: "amber-500" };
    return null;
  };

  const arterialCIF = getArterialCIF();
  const venousCIF = getVenousCIF();
  const lymphaticCIF = getLymphaticCIF();

  const currentCIF = activeSystem === 'Arterial' ? arterialCIF : 
                    activeSystem === 'Venoso' ? venousCIF : 
                    lymphaticCIF;

  const PULSE_SCALE = [
    { val: 0, label: "0", desc: "Ausente (não palpável)" },
    { val: 1, label: "1+", desc: "Diminuído (fraco, filiforme)" },
    { val: 2, label: "2+", desc: "Normal (esperado)" },
    { val: 3, label: "3+", desc: "Aumentado (cheio)" },
    { val: 4, label: "4+", desc: "Forte (em martelo d'água)" },
  ];

  const GODET_SCALE = [
    { val: 1, label: "1+", depth: "2mm", desc: "Depressão leve, desaparece rápido.", color: "bg-vitality-lime/20" },
    { val: 2, label: "2+", depth: "4mm", desc: "Depressão moderada, desaparece em 10-15s.", color: "bg-vitality-lime/40" },
    { val: 3, label: "3+", depth: "6mm", desc: "Depressão profunda, dura mais de 1 min.", color: "bg-vitality-lime/60" },
    { val: 4, label: "4+", depth: "8mm", desc: "Depressão muito profunda, dura 2-5 min.", color: "bg-vitality-lime/80" },
  ];

  const CEAP_SCALE = [
    { id: 'C0', label: 'C0', desc: 'Sem sinais visíveis ou palpáveis de doença venosa.' },
    { id: 'C1', label: 'C1', desc: 'Telangiectasias ou veias reticulares.' },
    { id: 'C2', label: 'C2', desc: 'Veias varicosas (varizes).' },
    { id: 'C3', label: 'C3', desc: 'Edema.' },
    { id: 'C4', label: 'C4', desc: 'Alterações tróficas (hiperpigmentação, eczema).' },
    { id: 'C5', label: 'C5', desc: 'Úlcera venosa cicatrizada.' },
    { id: 'C6', label: 'C6', desc: 'Úlcera venosa ativa.' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Exame Físico Vascular</h1>
          <p className="text-slate-500 text-sm">Avaliação sistemática dos sistemas arterial, venoso e linfático.</p>
        </div>
        <button
          onClick={() => setShowHelp(true)}
          className="flex items-center gap-2 px-4 py-2 bg-vitality-lime/10 text-vitality-lime rounded-xl font-bold text-sm hover:bg-vitality-lime/20 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          Ajuda Diagnóstica
        </button>
      </header>

      <MedicationAlert type="bcc" active={medications.bcc} />

      <VascularDiagnosticHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
        {(['Arterial', 'Venoso', 'Linfático'] as System[]).map((sys) => (
          <button
            key={sys}
            onClick={() => setActiveSystem(sys)}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              activeSystem === sys ? 'bg-white text-vitality-lime shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {sys}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeSystem === 'Arterial' && (
              <motion.div
                key="arterial"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Pulso */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <Activity className="w-5 h-5 text-vitality-risk" />
                    Palpação de Pulsos (Escala de 0 a 4+)
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {PULSE_SCALE.map((p) => (
                      <button
                        key={p.val}
                        onClick={() => setPulse(p.val)}
                        className={`p-4 rounded-2xl text-left border-2 transition-all flex items-center gap-4 ${
                          pulse === p.val ? 'bg-vitality-risk/10 border-vitality-risk/20 text-vitality-risk' : 'bg-slate-50 border-transparent text-slate-600'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${pulse === p.val ? 'bg-vitality-risk text-white' : 'bg-white text-slate-400'}`}>
                          {p.label}
                        </div>
                        <div>
                          <div className="font-bold text-sm">{p.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Temperatura */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <Thermometer className="w-5 h-5 text-vitality-lime" />
                    Temperatura da Pele
                  </div>
                  <div className="flex gap-2">
                    {['Normal', 'Fria (Isquemia)', 'Quente (Inflamação)'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTemp(t)}
                        className={`flex-1 p-4 rounded-2xl border-2 font-bold text-sm transition-all ${
                          temp === t ? 'bg-vitality-lime/10 border-vitality-lime/20 text-vitality-lime' : 'bg-slate-50 border-transparent text-slate-500'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Enchimento Capilar */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <Fingerprint className="w-5 h-5 text-vitality-lime" />
                    Enchimento Capilar
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tempo (segundos)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={capillaryRefill}
                        onChange={(e) => setCapillaryRefill(e.target.value)}
                        placeholder="Ex: 2.5"
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-bold text-slate-800 focus:border-vitality-lime outline-none transition-all"
                      />
                    </div>
                    {capillaryRefill && (
                      <div className={`p-4 rounded-2xl flex items-center gap-3 ${parseFloat(capillaryRefill) > 3 ? 'bg-vitality-risk/10 text-vitality-risk border border-vitality-risk/20' : 'bg-vitality-lime/10 text-vitality-lime border border-vitality-lime/20'}`}>
                        {parseFloat(capillaryRefill) > 3 ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                        <span className="font-bold text-sm">
                          {parseFloat(capillaryRefill) > 3 ? 'Enchimento Lentificado (> 3s)' : 'Enchimento Normal (≤ 3s)'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeSystem === 'Venoso' && (
              <motion.div
                key="venous"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* CEAP */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <Layers className="w-5 h-5 text-vitality-lime" />
                    Classificação CEAP (Clínica)
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {CEAP_SCALE.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setCeap(c.id)}
                        className={`p-4 rounded-2xl text-left border-2 transition-all flex items-center gap-4 ${
                          ceap === c.id ? 'bg-vitality-lime/10 border-vitality-lime/20 text-slate-900' : 'bg-slate-50 border-transparent text-slate-600'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${ceap === c.id ? 'bg-vitality-lime text-white' : 'bg-white text-slate-400'}`}>
                          {c.label}
                        </div>
                        <div className="text-sm font-bold">{c.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Godet */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <Fingerprint className="w-5 h-5 text-vitality-lime" />
                    Sinal de Godet (Cacifo)
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {GODET_SCALE.map((g) => (
                      <button
                        key={g.val}
                        onClick={() => setGodet(g.val)}
                        className={`p-4 rounded-2xl text-left border-2 transition-all flex items-center gap-4 ${
                          godet === g.val ? 'bg-vitality-lime/10 border-vitality-lime/20 text-slate-900' : 'bg-slate-50 border-transparent text-slate-600'
                        }`}
                      >
                        <div className="relative w-12 h-12 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                          <div 
                            className={`absolute bottom-0 left-0 right-0 ${g.color} transition-all duration-500`}
                            style={{ height: `${g.val * 25}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center font-black text-xs mix-blend-overlay">
                            {g.depth}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-sm">{g.label} - {g.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeSystem === 'Linfático' && (
              <motion.div
                key="lymphatic"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                      <Droplets className="w-5 h-5 text-vitality-risk" />
                      Sinal de Stemmer
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Incapacidade de pinçar a pele na base do segundo dedo do pé ou da mão. 
                      É um sinal patognomônico de linfedema.
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setStemmer(true)}
                        className={`flex-1 p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                          stemmer === true ? 'bg-vitality-risk/10 border-vitality-risk/20 text-vitality-risk' : 'bg-slate-50 border-transparent text-slate-400'
                        }`}
                      >
                        <CheckCircle2 className={`w-8 h-8 ${stemmer === true ? 'text-vitality-risk' : 'opacity-20'}`} />
                        <span className="font-bold">Positivo</span>
                        <span className="text-[10px] text-center opacity-70">Pele não pode ser pinçada</span>
                      </button>
                      <button
                        onClick={() => setStemmer(false)}
                        className={`flex-1 p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                          stemmer === false ? 'bg-vitality-lime/10 border-vitality-lime/20 text-vitality-lime' : 'bg-slate-50 border-transparent text-slate-400'
                        }`}
                      >
                        <CheckCircle2 className={`w-8 h-8 ${stemmer === false ? 'text-vitality-lime' : 'opacity-20'}`} />
                        <span className="font-bold">Negativo</span>
                        <span className="text-[10px] text-center opacity-70">Pele pinçada normalmente</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            {/* Summary Card */}
            <div className="bg-vitality-graphite rounded-3xl p-6 text-white shadow-xl space-y-4 border-4 border-vitality-lime/20">
              <h3 className="font-bold flex items-center gap-2 text-vitality-lime">
                <Activity className="w-4 h-4" />
                Resumo do Exame
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="opacity-60">Sistema</span>
                  <span className="font-bold">{activeSystem}</span>
                </div>
                {activeSystem === 'Arterial' && (
                  <>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="opacity-60">Pulso</span>
                      <span className="font-bold">{pulse !== null ? `${pulse}+` : '---'}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="opacity-60">Pele</span>
                      <span className="font-bold">{temp}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="opacity-60">Enchimento</span>
                      <span className="font-bold">{capillaryRefill ? `${capillaryRefill}s` : '---'}</span>
                    </div>
                  </>
                )}
                {activeSystem === 'Venoso' && (
                  <>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="opacity-60">CEAP</span>
                      <span className="font-bold">{ceap}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="opacity-60">Godet</span>
                      <span className="font-bold">{godet !== null ? `${godet}+` : '---'}</span>
                    </div>
                  </>
                )}
                {activeSystem === 'Linfático' && (
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="opacity-60">Stemmer</span>
                    <span className="font-bold">{stemmer === null ? '---' : stemmer ? 'Positivo' : 'Negativo'}</span>
                  </div>
                )}
              </div>

              {currentCIF && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`mt-4 p-4 rounded-2xl border-2 text-center space-y-1 ${
                    currentCIF.qualifier === 0 ? 'bg-vitality-lime/20 border-vitality-lime/30 text-white' :
                    currentCIF.qualifier === 1 ? 'bg-blue-500/20 border-blue-500/30 text-white' :
                    currentCIF.qualifier === 2 ? 'bg-amber-500/20 border-amber-500/30 text-white' :
                    currentCIF.qualifier === 3 ? 'bg-orange-500/20 border-orange-500/30 text-white' :
                    'bg-vitality-risk/20 border-vitality-risk/30 text-white'
                  }`}
                >
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Comprometimento Funcional (CIF/OMS)</div>
                  <div className="text-lg font-black">CIF/OMS</div>
                  <div className="text-[10px] font-bold opacity-60">Qualificador {currentCIF.severity}</div>
                </motion.div>
              )}

              {/* CIF/OMS Summary Table */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <Layers className="w-5 h-5 text-vitality-lime" />
                  Quadro de Comprometimento (CIF/OMS)
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Arterial', cif: arterialCIF },
                    { label: 'Venoso', cif: venousCIF },
                    { label: 'Linfático', cif: lymphaticCIF }
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase text-center">{item.label}</div>
                      <div className={`p-3 rounded-xl border-2 text-center ${
                        item.cif ? (
                          item.cif.qualifier === 0 ? 'bg-vitality-lime/10 border-vitality-lime/20 text-vitality-lime' :
                          item.cif.qualifier === 1 ? 'bg-blue-50 border-blue-200 text-blue-600' :
                          item.cif.qualifier === 2 ? 'bg-amber-50 border-amber-200 text-amber-600' :
                          item.cif.qualifier === 3 ? 'bg-orange-50 border-orange-200 text-orange-600' :
                          'bg-red-50 border-red-200 text-red-600'
                        ) : 'bg-slate-50 border-transparent text-slate-300'
                      }`}>
                        <div className="text-xs font-black">{item.cif?.severity || '---'}</div>
                        <div className="text-[8px] opacity-60">{item.cif ? `${item.cif.severity}` : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={isSaved}
                className={`w-full py-4 rounded-2xl font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                  isSaved 
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                    : 'bg-vitality-lime text-slate-900 shadow-vitality-lime/20 hover:opacity-90'
                }`}
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Resultados Salvos
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4" />
                    Salvar Resultados
                  </>
                )}
              </button>
            </div>

            {/* Clinical Pearls */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 text-vitality-lime font-bold text-sm">
                <Info className="w-4 h-4" />
                Guia Visual & Clínico
              </div>
              <div className="space-y-4">
                {activeSystem === 'Arterial' && (
                  <div className="text-[10px] text-slate-500 leading-relaxed space-y-2">
                    <p><strong>Pele Fria:</strong> Sugere insuficiência arterial aguda ou crônica agudizada.</p>
                    <p><strong>Pulsos:</strong> Avaliar pedioso, tibial posterior, poplíteo e femoral.</p>
                  </div>
                )}
                {activeSystem === 'Venoso' && (
                  <div className="text-[10px] text-slate-500 leading-relaxed space-y-2">
                    <p><strong>Hiperpigmentação:</strong> Dermatite de estase (deposição de hemossiderina).</p>
                    <p><strong>Godet:</strong> Avaliar em região maleolar e pré-tibial.</p>
                  </div>
                )}
                {activeSystem === 'Linfático' && (
                  <div className="text-[10px] text-slate-500 leading-relaxed space-y-2">
                    <p><strong>Stemmer:</strong> Se positivo, confirma linfedema. Se negativo, não exclui (falso negativo em fases iniciais).</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
