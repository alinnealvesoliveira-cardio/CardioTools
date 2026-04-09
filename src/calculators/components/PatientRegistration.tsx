import React from 'react';
import { Pill, CheckCircle2, User, Heart, Save, LayoutDashboard, Activity } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { supabase } from '../../lib/supabase';
import { Medications } from '../../types';
import { toast } from 'react-hot-toast';

export const PatientRegistration: React.FC = () => {
  const { medications, setMedications, patientInfo, updatePatientInfo } = usePatient();

  const toggleMedication = (id: keyof Medications) => {
    setMedications(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSaveOnly = async () => {
    try {
      // Sincronização básica com Supabase
      await supabase.from('patients').upsert({
        name: patientInfo.name,
        age: patientInfo.age,
        sex: patientInfo.sex,
        resting_pas: patientInfo.restingPAS || null,
        ejection_fraction: patientInfo.ejectionFraction || null,
        updated_at: new Date()
      });
      toast.success("Dados salvos com sucesso!");
    } catch (error) {
      console.warn("Salvamento local garantido pelo Contexto.");
      toast.success("Salvo localmente.");
    }
  };

  const medsList: { id: keyof Medications; name: string }[] = [
    { id: 'betablockers', name: 'Betabloqueadores' },
    { id: 'antihypertensives', name: 'Anti-hipertensivos' },
    { id: 'nitrates', name: 'Nitratos' },
    { id: 'diuretics', name: 'Diuréticos' },
    { id: 'ieca', name: 'IECA / BRA' },
    { id: 'statins', name: 'Estatinas' },
    { id: 'digitalis', name: 'Digitálicos' },
    { id: 'antiarrhythmics', name: 'Antiarrítmicos' }
  ];

  const sisPA = Number(patientInfo.restingPAS) || 0;
  const sao2 = Number(patientInfo.restingSaO2) || 0;
  const isUnsafe = (sisPA >= 180) || (sao2 > 0 && sao2 < 90);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-40">
      <header className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Anamnese e Perfil</h1>
        <p className="text-slate-500 text-sm font-medium">Configuração inicial do paciente e estratificação de risco.</p>
      </header>

      {isUnsafe && (
        <div className="bg-rose-50 border-2 border-rose-200 p-4 rounded-[24px] flex items-center gap-3 text-rose-700 animate-pulse">
          <Heart className="w-6 h-6 flex-shrink-0" />
          <p className="text-xs font-black uppercase">Alerta de Segurança: Parâmetros vitais fora da zona de normalidade.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* SEÇÃO: DADOS PESSOAIS */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-2 text-slate-800 font-black uppercase text-xs tracking-widest">
              <User className="w-4 h-4 text-indigo-500" />
              Identificação
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nome do Paciente</label>
                <input
                  type="text"
                  value={patientInfo.name || ''}
                  onChange={(e) => updatePatientInfo({ name: e.target.value })}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="Nome completo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Idade</label>
                  <input
                    type="number"
                    value={patientInfo.age || ''}
                    onChange={(e) => updatePatientInfo({ age: e.target.value })}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Sexo</label>
                  <select
                    value={patientInfo.sex || ''}
                    onChange={(e) => updatePatientInfo({ sex: e.target.value as 'male' | 'female' })}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none appearance-none"
                  >
                    <option value="">Selecionar</option>
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO: VITAIS E FEVE */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-2 text-slate-800 font-black uppercase text-xs tracking-widest">
              <Activity className="w-4 h-4 text-rose-500" />
              Dados Hemodinâmicos e FEVE
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Pressão Arterial (Repouso)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number" placeholder="SIS"
                    value={patientInfo.restingPAS || ''}
                    onChange={(e) => updatePatientInfo({ restingPAS: e.target.value })}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-center outline-none"
                  />
                  <span className="text-slate-300 font-bold">/</span>
                  <input
                    type="number" placeholder="DIA"
                    value={patientInfo.restingPAD || ''}
                    onChange={(e) => updatePatientInfo({ restingPAD: e.target.value })}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-center outline-none"
                  />
                </div>
              </div>

              {/* CAMPO FEVE ADICIONADO */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">FEVE (%)</label>
                <input
                  type="number"
                  placeholder="Ex: 55"
                  value={patientInfo.ejectionFraction || ''}
                  onChange={(e) => updatePatientInfo({ ejectionFraction: e.target.value })}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">SaO2 (%)</label>
                <input
                  type="number"
                  placeholder="98"
                  value={patientInfo.restingSaO2 || ''}
                  onChange={(e) => updatePatientInfo({ restingSaO2: e.target.value })}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none"
                />
              </div>
            </div>

            {/* PERGUNTA ESTRUTURAL CORRIGIDA */}
            <div className="mt-4 p-5 bg-slate-50 rounded-[24px] border border-dashed border-slate-200">
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-4 text-center tracking-tight">
                Alteração estrutural cardiovascular em exames complementares?
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => updatePatientInfo({ structureAlteration: true })}
                  className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${patientInfo.structureAlteration === true ? 'bg-rose-500 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}
                > SIM </button>
                <button
                  onClick={() => updatePatientInfo({ structureAlteration: false })}
                  className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${patientInfo.structureAlteration === false ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}
                > NÃO </button>
              </div>
            </div>
          </div>
        </div>

        {/* SEÇÃO: MEDICAMENTOS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-black uppercase text-xs tracking-widest mb-2">
            <Pill className="w-4 h-4 text-indigo-500" />
            Perfil Farmacológico
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2">
            {medsList.map((med) => (
              <button
                key={med.id}
                onClick={() => toggleMedication(med.id)}
                className={`p-4 rounded-2xl border-2 transition-all text-left flex gap-3 items-center ${medications[med.id] ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-slate-100 hover:border-slate-200'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${medications[med.id] ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <Pill className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-tight">{med.name}</h3>
                {medications[med.id] && <CheckCircle2 className="w-5 h-5 text-indigo-500 ml-auto" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BOTÕES DE AÇÃO PADRONIZADOS */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-50 flex gap-3">
        <button
          onClick={() => window.history.back()}
          className="flex-1 bg-white text-slate-900 py-5 rounded-[24px] font-black border border-slate-200 shadow-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <LayoutDashboard size={16} /> Painel
        </button>
        
        <button
          onClick={handleSaveOnly}
          className="flex-[2] bg-slate-900 text-white py-5 rounded-[24px] font-black shadow-2xl flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-colors"
        >
          <Save className="w-5 h-5 text-emerald-400" />
          Gravar Registro
        </button>
      </div>
    </div>
  );
};