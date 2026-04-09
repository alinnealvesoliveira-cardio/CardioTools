import React from 'react';
import { Pill, CheckCircle2, User, Heart, Activity as ActivityIcon, Save, ChevronRight } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { supabase } from '../../lib/supabase';

export const PatientRegistration: React.FC = () => {
  const { medications, setMedications, patientInfo, setPatientInfo } = usePatient();

  const updatePatientInfo = (updates: Partial<typeof patientInfo>) => {
    setPatientInfo(prev => ({ ...prev, ...updates }));
  };

  const toggleMedication = (id: string) => {
    setMedications(prev => ({
      ...prev,
      [id]: !prev[id as keyof typeof medications]
    }));
  };

  const handleSaveAndNext = async () => {
    try {
      // Sincronização com Supabase usando os campos separados
      const { error } = await supabase
        .from('patients')
        .upsert({
          name: patientInfo.name,
          age: patientInfo.age,
          sex: patientInfo.sex,
          weight: patientInfo.weight,
          height: patientInfo.height,
          ejection_fraction: patientInfo.ejectionFraction,
          // Agora enviamos PAS e PAD separadamente ou formatados
          resting_pas: patientInfo.restingPAS,
          resting_pad: patientInfo.restingPAD,
          resting_fc: patientInfo.restingFC,
          resting_sao2: patientInfo.restingSaO2,
          updated_at: new Date()
        });

      if (error) throw error;
      alert("Dados sincronizados com sucesso! Prossiga para os testes.");
    } catch (error) {
      console.error("Erro na sincronização:", error);
      alert("Os dados foram salvos localmente, mas houve um erro ao enviar para a nuvem.");
    }
  };

  const medsList = [
    { id: 'betablockers', name: 'Betabloqueadores' },
    { id: 'diuretics', name: 'Diuréticos' },
    { id: 'ieca', name: 'Inibidores da ECA' },
    { id: 'bcc', name: 'Bloqueadores de Cálcio' },
    { id: 'statins', name: 'Estatinas' },
    { id: 'nitrates', name: 'Nitratos' },
    { id: 'antiarrhythmics', name: 'Antiarrítmicos' },
    { id: 'digitalis', name: 'Digitálicos' }
  ];

  // Lógica de Segurança Atualizada para Opção 1
  const sisPA = Number(patientInfo.restingPAS) || 0;
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

      {isUnsafe && (
        <div className="bg-rose-50 border-2 border-rose-200 p-4 rounded-2xl flex items-center gap-3 text-rose-700 animate-pulse">
          <Heart className="w-6 h-6 flex-shrink-0" />
          <p className="text-xs font-black uppercase">Atenção: Parâmetros vitais fora da zona de segurança para esforço físico.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
            </div>
          </div>

          {/* SINAIS VITAIS - OPÇÃO 1 SELECIONADA */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <Heart className="w-5 h-5 text-rose-500" />
              Sinais Vitais de Repouso
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pressão Arterial (mmHg)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Sist"
                    value={patientInfo.restingPAS || ''}
                    onChange={(e) => updatePatientInfo({ restingPAS: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-center outline-none focus:border-rose-500"
                  />
                  <span className="text-slate-300 font-bold">/</span>
                  <input
                    type="number"
                    placeholder="Diast"
                    value={patientInfo.restingPAD || ''}
                    onChange={(e) => updatePatientInfo({ restingPAD: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-center outline-none focus:border-rose-500"
                  />
                </div>
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