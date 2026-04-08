import React from 'react';
import { Pill, CheckCircle2, User, Ruler, Weight, Heart, AlertTriangle, Activity as ActivityIcon, Save, ChevronRight } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase'; // Certifique-se de que o caminho está correto

export const PatientRegistration: React.FC = () => {
  const { medications, setMedications, patientInfo, setPatientInfo } = usePatient();

  // Função de atualização imediata no contexto global
  const updatePatientInfo = (updates: Partial<typeof patientInfo>) => {
    setPatientInfo(prev => ({ ...prev, ...updates }));
  };

  // Função para alternar medicações
  const toggleMedication = (id: string) => {
    setMedications(prev => ({
      ...prev,
      [id]: !prev[id as keyof typeof medications]
    }));
  };

  // FUNÇÃO MESTRA: Salvar no Banco e Persistir
  const handleSaveAndNext = async () => {
    try {
      // 1. Telemetria para o Artigo: Salva no Supabase
      // Opcional: Você pode adicionar um campo 'session_id' se quiser rastrear usos únicos
      const { error } = await supabase
        .from('patients') // Nome da sua tabela no Supabase
        .upsert({
          name: patientInfo.name,
          age: patientInfo.age,
          sex: patientInfo.sex,
          weight: patientInfo.weight,
          height: patientInfo.height,
          ejection_fraction: patientInfo.ejectionFraction,
          resting_pa: patientInfo.restingPA,
          resting_fc: patientInfo.restingFC,
          resting_sao2: patientInfo.restingSaO2,
          updated_at: new Date()
        });

      if (error) throw error;

      alert("Dados sincronizados com sucesso! Prossiga para os testes.");
      
      // 2. Navegação: Aqui você pode disparar uma função para mudar a aba ativa
      // Ex: setActiveTab('funcional');
    } catch (error) {
      console.error("Erro na sincronização:", error);
      alert("Os dados foram salvos localmente, mas houve um erro ao enviar para a nuvem.");
    }
  };

  const medsList = [
    { id: 'betablockers', name: 'Betabloqueadores', examples: 'Ex: Metoprolol, Propranolol' },
    { id: 'diuretics', name: 'Diuréticos', examples: 'Ex: Furosemida, Hidroclorotiazida' },
    { id: 'ieca', name: 'Inibidores da ECA', examples: 'Ex: Enalapril, Captopril' },
    { id: 'bcc', name: 'Bloqueadores de Cálcio', examples: 'Ex: Anlodipino, Diltiazem' },
    { id: 'statins', name: 'Estatinas', examples: 'Ex: Atorvastatina, Rosuvastatina' },
    { id: 'nitrates', name: 'Nitratos', examples: 'Ex: Isossorbida' },
    { id: 'antiarrhythmics', name: 'Antiarrítmicos', examples: 'Ex: Amiodarona' },
    { id: 'digitalis', name: 'Digitálicos', examples: 'Ex: Digoxina' }
  ];

  const sisPA = parseInt(patientInfo.restingPA?.split('/')[0] || '0');
  const sao2 = Number(patientInfo.restingSaO2) || 0;
  const isUnsafe = (sisPA >= 180) || (sao2 > 0 && sao2 < 90);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-32">
      <header className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Anamnese e Perfil</h1>
          <p className="text-slate-500 text-sm">Preencha os dados básicos para habilitar os cálculos funcionais.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* COLUNA ESQUERDA */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <User className="w-5 h-5 text-indigo-500" />
              Dados do Paciente
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Nome Completo</label>
                <input
                  type="text"
                  value={patientInfo.name || ''}
                  onChange={(e) => updatePatientInfo({ name: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Idade</label>
                  <input
                    type="number"
                    value={patientInfo.age || ''}
                    onChange={(e) => updatePatientInfo({ age: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Sexo</label>
                  <select
                    value={patientInfo.sex || 'male'}
                    onChange={(e) => updatePatientInfo({ sex: e.target.value as 'male' | 'female' })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
                  >
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                    <ActivityIcon className="w-3 h-3 text-emerald-500" /> FEVE (%)
                  </label>
                  <input
                    type="number"
                    value={patientInfo.ejectionFraction || ''}
                    onChange={(e) => updatePatientInfo({ ejectionFraction: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Obstrução</label>
                  <select
                    value={patientInfo.obstructionSeverity || 'none'}
                    onChange={(e) => updatePatientInfo({ obstructionSeverity: e.target.value as any })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-500"
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

          {/* SINAIS VITAIS */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <Heart className="w-5 h-5 text-rose-500" />
              Sinais Vitais de Repouso
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">PA (mmHg)</label>
                <input
                  type="text"
                  placeholder="120/80"
                  value={patientInfo.restingPA || ''}
                  onChange={(e) => updatePatientInfo({ restingPA: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-rose-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">FC (bpm)</label>
                <input
                  type="number"
                  value={patientInfo.restingFC || ''}
                  onChange={(e) => updatePatientInfo({ restingFC: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-rose-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">SaO₂ (%)</label>
                <input
                  type="number"
                  value={patientInfo.restingSaO2 || ''}
                  onChange={(e) => updatePatientInfo({ restingSaO2: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: FARMACO */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold mb-2">
            <Pill className="w-5 h-5 text-indigo-500" />
            Perfil Farmacológico
          </div>
          <div className="grid grid-cols-1 gap-2">
            {medsList.map((med) => (
              <button
                key={med.id}
                onClick={() => toggleMedication(med.id)}
                className={`p-3 rounded-2xl border-2 transition-all text-left flex gap-3 items-center ${
                  (medications as any)[med.id] ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-slate-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${(medications as any)[med.id] ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <Pill className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-bold text-slate-900">{med.name}</h3>
                </div>
                {(medications as any)[med.id] && <CheckCircle2 className="w-4 h-4 text-indigo-500" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BOTÃO FIXO DE AÇÃO (Gravar e Próximo) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50">
        <button
          onClick={handleSaveAndNext}
          className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black shadow-2xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-all active:scale-95 border-t border-white/10"
        >
          <Save className="w-5 h-5 text-vitality-lime" />
          GRAVAR E PROSSEGUIR
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};