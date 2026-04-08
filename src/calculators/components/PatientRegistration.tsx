import React from 'react';
import { Pill, Info, CheckCircle2, User, Ruler, Weight, Activity, Heart, AlertTriangle, Activity as ActivityIcon } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { motion, AnimatePresence } from 'framer-motion';

export const PatientRegistration: React.FC = () => {
  // Ajustado para os nomes corretos do seu Contexto
  const { medications, setMedications, patientInfo, setPatientInfo } = usePatient();

  // Funções auxiliares para evitar erros de tipagem e manter dados anteriores
  const updatePatientInfo = (updates: Partial<typeof patientInfo>) => {
    setPatientInfo({ ...patientInfo, ...updates });
  };

  const updateMedications = (updates: Partial<typeof medications>) => {
    setMedications({ ...medications, ...updates });
  };

  const medsList = [
    { id: 'betablockers', name: 'Betabloqueadores', examples: 'Exemplo: Metoprolol, Propranolol', description: 'Atenua a resposta da FC/PA ao esforço.', alert: 'Fadiga precoce, bradicardia.', color: 'blue' },
    { id: 'diuretics', name: 'Diuréticos', examples: 'Exemplo: Furosemida, Hidroclorotiazida', description: 'Reduz o volume plasmático.', alert: 'Risco de hipotensão e câimbras.', color: 'blue' },
    { id: 'ieca', name: 'Inibidores da ECA (IECA)', examples: 'Exemplo: Enalapril, Captopril', description: 'Vasodilatação.', alert: 'Hipotensão pós-esforço.', color: 'blue' },
    { id: 'bcc', name: 'Bloqueadores de Canais de Cálcio', examples: 'Exemplo: Anlodipino, Diltiazem', description: 'Reduzem a FC e contratilidade.', alert: 'Bradicardia, edema.', color: 'blue' },
    { id: 'statins', name: 'Estatinas', examples: 'Exemplo: Atorvastatina, Rosuvastatina', description: 'Redução do colesterol.', alert: 'Mialgia e fraqueza muscular.', color: 'amber' },
    { id: 'nitrates', name: 'Nitratos', examples: 'Exemplo: Isossorbida', description: 'Vasodilatadores potentes.', alert: 'Hipotensão e cefaleia.', color: 'blue' },
    { id: 'antiarrhythmics', name: 'Antiarrítmicos', examples: 'Exemplo: Amiodarona', description: 'Canais iônicos.', alert: 'Risco de pró-arritmia no esforço.', color: 'amber' },
    { id: 'digitalis', name: 'Digitálicos', examples: 'Exemplo: Digoxina', description: 'Comuns em IC/FA.', alert: 'Efeito digitálico no ECG.', color: 'amber' }
  ];

  // Lógica de Alerta de Segurança
  const sisPA = parseInt(patientInfo.restingPA?.split('/')[0] || '0');
  const sao2 = parseInt(patientInfo.restingSaO2?.toString() || '100');
  const isUnsafe = (sisPA >= 180 && sisPA !== 0) || (sao2 < 90 && sao2 !== 0);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-24">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Cadastro / Anamnese Rápida</h1>
        <p className="text-slate-500 text-sm">Dados antropométricos, vitais e perfil farmacológico.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LADO ESQUERDO: Dados Físicos e Vitais */}
        <div className="space-y-6">
          
          {/* Dados Antropométricos */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-2 text-slate-800 font-bold mb-4">
              <User className="w-5 h-5 text-indigo-500" />
              Dados Antropométricos
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nome Completo</label>
                <input
                  type="text"
                  value={patientInfo.name}
                  onChange={(e) => updatePatientInfo({ name: e.target.value })}
                  placeholder="Ex: João da Silva"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Idade</label>
                  <input
                    type="number"
                    value={patientInfo.age}
                    onChange={(e) => updatePatientInfo({ age: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sexo</label>
                  <select
                    value={patientInfo.sex}
                    onChange={(e) => updatePatientInfo({ sex: e.target.value as 'male' | 'female' })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
                  >
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Weight className="w-3 h-3" /> Peso (kg)
                  </label>
                  <input
                    type="number"
                    value={patientInfo.weight}
                    onChange={(e) => updatePatientInfo({ weight: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Ruler className="w-3 h-3" /> Altura (cm)
                  </label>
                  <input
                    type="number"
                    value={patientInfo.height}
                    onChange={(e) => updatePatientInfo({ height: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* NOVOS CAMPOS: FEVE e Severidade da Obstrução */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 mt-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <ActivityIcon className="w-3 h-3 text-emerald-500" /> FEVE (%)
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 55"
                    value={patientInfo.ejectionFraction || ''}
                    onChange={(e) => updatePatientInfo({ ejectionFraction: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Obstrução</label>
                  <select
                    value={patientInfo.obstructionSeverity || 'none'}
                    onChange={(e) => updatePatientInfo({ obstructionSeverity: e.target.value as any })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="none">Nenhuma</option>
                    <option value="mild">Leve</option>
                    <option value="moderate">Moderada</option>
                    <option value="severe">Grave</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Sinais Vitais de Repouso */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-2 text-slate-800 font-bold mb-4">
              <Heart className="w-5 h-5 text-rose-500" />
              Sinais Vitais (Repouso)
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">PA (mmHg)</label>
                  <input
                    type="text"
                    placeholder="120/80"
                    value={patientInfo.restingPA || ''}
                    onChange={(e) => updatePatientInfo({ restingPA: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-rose-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">FC (bpm)</label>
                  <input
                    type="number"
                    value={patientInfo.restingFC || ''}
                    onChange={(e) => updatePatientInfo({ restingFC: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-rose-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">SaO₂ (%)</label>
                  <input
                    type="number"
                    value={patientInfo.restingSaO2 || ''}
                    onChange={(e) => updatePatientInfo({ restingSaO2: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* ALERTA DE SEGURANÇA DINÂMICO */}
              <AnimatePresence>
                {isUnsafe && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl flex gap-3 items-start"
                  >
                    <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-black text-rose-800 uppercase">Risco Clínico Detectado</p>
                      <p className="text-[10px] text-rose-700 leading-tight">
                        Valores fora da zona de segurança para esforço físico. 
                        <strong> Priorize questionários (VSAQ/DASI)</strong> para estimativa funcional.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: Farmacologia */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold mb-2">
            <Pill className="w-5 h-5 text-indigo-500" />
            Perfil Farmacológico
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {medsList.map((med) => (
              <button
                key={med.id}
                onClick={() => updateMedications({ [med.id]: !medications[med.id as keyof typeof medications] })}
                className={`group p-4 rounded-2xl border-2 transition-all text-left flex gap-4 items-start ${
                  medications[med.id as keyof typeof medications]
                    ? 'bg-white border-slate-900 shadow-md'
                    : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  medications[med.id as keyof typeof medications] ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'
                }`}>
                  <Pill className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-slate-900">{med.name}</h3>
                    {medications[med.id as keyof typeof medications] && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium italic truncate max-w-[200px]">{med.examples}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};