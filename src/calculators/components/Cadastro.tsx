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
      // Exemplo de salvamento no Supabase (ajuste a tabela 'patients' conforme seu banco)
      const { error } = await supabase
        .from('patients')
        .upsert({ 
          ...patientInfo,
          medications: medications 
        });

      if (error) throw error;

      toast.success('Dados salvos com sucesso!');
      nextStep(); // Avança para o próximo passo após salvar
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
    <div className="space-y-8 animate-in fade-in duration-500">
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

      {/* Botão de Salvar */}
      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-4 bg-slate-900 text-white rounded-full font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          {isSaving ? 'Salvando...' : 'Salvar Cadastro e Continuar'}
          {!isSaving && <ArrowRight size={20} />}
        </button>
      </div>
    </div>
  );
};