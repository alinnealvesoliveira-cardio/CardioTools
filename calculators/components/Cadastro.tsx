import React, { useState } from 'react';
import { Pill, CheckCircle2, User, Heart, Save, Activity, Loader2, ArrowRight } from 'lucide-react';
import { usePatient } from '../../context/PatientProvider';
import { supabase } from '../../lib/supabase';
import { Medications } from '../../types';
import { toast } from 'react-hot-toast';

export const Cadastro: React.FC = () => {
  const { medications, setMedications, patientInfo, updatePatientInfo, nextStep } = usePatient();
  const [isSaving, setIsSaving] = useState(false);

  const toggleMedication = (id: keyof Medications) => {
    setMedications(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updatePatientInfo({ [name]: value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('patients')
        .upsert({ 
          ...patientInfo,
          medications: medications 
        });

      if (error) throw error;

      toast.success('Dados salvos com sucesso!');
      nextStep(); 
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar dados. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const medList: { id: keyof Medications; label: string }[] = [
    { id: 'betablockers', label: 'Betabloqueadores' },
    { id: 'antihypertensives', label: 'Anti-hipertensivos' },
    { id: 'nitrates', label: 'Nitratos' },
    { id: 'diuretics', label: 'Diuréticos' },
    { id: 'ieca', label: 'IECA/BRA' },
    { id: 'statins', label: 'Estatinas' },
    { id: 'digitalis', label: 'Digitálicos' },
    { id: 'antiarrhythmics', label: 'Antiarrítmicos' },
    { id: 'bcc_dhp', label: 'BCC (DHP)' },
    { id: 'bcc_non_dhp', label: 'BCC (Não-DHP)' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-32">
      {/* Dados Pessoais */}
      <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <User className="text-rose-500" /> Informações do Paciente
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
            <input name="name" value={patientInfo.name} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          
          {/* CAMPO ADICIONADO: Sexo (Essencial para os cálculos de METs e TC6M) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sexo</label>
            <select 
              name="sex" 
              value={patientInfo.sex} 
              onChange={handleInputChange} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">Selecione...</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Idade</label>
            <input type="number" name="age" value={patientInfo.age} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Peso (kg)</label>
            <input type="number" name="weight" value={patientInfo.weight} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Altura (cm)</label>
            <input type="number" name="height" value={patientInfo.height} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">FEVE (%)</label>
            <input type="number" name="ejectionFraction" value={patientInfo.ejectionFraction} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
        </div>
      </section>

      {/* Medicamentos */}
      <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Pill className="text-emerald-500" /> Medicamentos em uso
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {medList.map((med) => (
            <button
              key={med.id}
              type="button"
              onClick={() => toggleMedication(med.id)}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                medications[med.id] 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {medications[med.id] ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300" />}
              <span className="font-medium text-sm">{med.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Botão de Salvar e Avançar Fixo */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-[999]">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full py-5 rounded-[24px] font-black shadow-2xl flex items-center justify-between px-8 transition-all active:scale-95 ${
            isSaving ? 'bg-slate-700' : 'bg-slate-900 hover:bg-emerald-700'
          } text-white disabled:opacity-50 group`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isSaving ? 'bg-slate-600' : 'bg-emerald-500/20'}`}>
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-[11px] uppercase tracking-[0.2em]">
                {isSaving ? 'Salvando...' : 'Gravar Cadastro'}
              </span>
              {!isSaving && (
                <span className="text-[9px] text-slate-400 font-medium">e iniciar avaliação física</span>
              )}
            </div>
          </div>
          
          {!isSaving && (
            <ArrowRight className="w-6 h-6 text-slate-500 group-hover:translate-x-1 transition-transform" />
          )}
        </button>
      </div>

      <div className="h-20" />
    </div>
  );
};