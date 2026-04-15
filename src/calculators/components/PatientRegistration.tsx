import React from 'react';
import { Pill, CheckCircle2, User, Heart, Save, LayoutDashboard, Activity, Search, ChevronLeft } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Medications } from '../../types';
import { toast } from 'react-hot-toast';

export const PatientRegistration: React.FC = () => {
  const { medications, setMedications, patientInfo, updatePatientInfo } = usePatient();
  const navigate = useNavigate();

  const toggleMedication = (id: keyof Medications) => {
    setMedications(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSaveOnly = async () => {
    try {
      // Sincronização com Supabase (Persistência Externa)
      await supabase.from('patients').upsert({
        name: patientInfo.name,
        age: patientInfo.age,
        sex: patientInfo.sex,
        resting_pas: patientInfo.restingPAS || null,
        ejection_fraction: patientInfo.ejectionFraction || null,
        updated_at: new Date()
      });
      toast.success("Perfil atualizado com sucesso!");
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (error) {
      // Garantia de funcionamento offline via Contexto
      console.warn("Falha na rede. Dados mantidos localmente.");
      toast.success("Salvo localmente no dispositivo.");
      setTimeout(() => navigate('/dashboard'), 800);
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
        <p className="text-slate-500 text-sm font-medium italic">Configuração inicial e estratificação de risco cardiovascular.</p>
      </header>

      {isUnsafe && (
        <div className="bg-rose-50 border-2 border-rose-200 p-5 rounded-[28px] flex items-center gap-4 text-rose-700 animate-pulse">
          <div className="bg-rose-500 p-2 rounded-full text-white">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest">Alerta de Segurança</p>
            <p className="text-[11px] font-bold opacity-80">Parâmetros hemodinâmicos fora da zona de segurança para esforço.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* SEÇÃO: IDENTIFICAÇÃO */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-2 text-slate-800 font-black uppercase text-xs tracking-widest">
              <User className="w-4 h-4 text-indigo-500" /> Identificação Básica
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Nome Completo</label>
                <input
                  type="text"
                  value={patientInfo.name || ''}
                  onChange={(e) => updatePatientInfo({ name: e.target.value })}
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                  placeholder="Nome do paciente"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Idade</label>
                  <input
                    type="number"
                    value={patientInfo.age || ''}
                    onChange={(e) => updatePatientInfo({ age: e.target.value })}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none"
                    placeholder="Anos"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Sexo Biológico</label>
                  <select
                    value={patientInfo.sex || ''}
                    onChange={(e) => updatePatientInfo({ sex: e.target.value as 'male' | 'female' })}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Selecionar</option>
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO: IMAGEM E FUNÇÃO (CRÍTICO PARA CBDF) */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-5">
            <div className="flex items-center gap-2 text-slate-800 font-black uppercase text-xs tracking-widest">
              <Search className="w-4 h-4 text-emerald-500" /> Exames Complementares
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1 text-center block">Achados de CATE / Coronariografia</label>
              <select
                value={patientInfo.cateResult || ''}
                onChange={(e) => updatePatientInfo({ cateResult: e.target.value })}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none"
              >
                <option value="">Não informado</option>
                <option value="none">Livre de Obstruções</option>
                <option value="lesion < 50%">Lesões Não Obstrutivas (&lt;50%)</option>
                <option value="lesion > 50%">Lesão Obstrutiva (&gt;50%)</option>
                <option value="multiart">Doença Multiarterial</option>
                <option value="stent">Paciente com Stent Coronariano</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">FEVE (%)</label>
                <input
                  type="number"
                  placeholder="Ex: 55"
                  value={patientInfo.ejectionFraction || ''}
                  onChange={(e) => updatePatientInfo({ ejectionFraction: e.target.value })}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div className="space-y-2 flex flex-col justify-end">
                 <button
                  type="button"
                  onClick={() => updatePatientInfo({ structureAlteration: !patientInfo.structureAlteration })}
                  className={`w-full py-4 rounded-2xl text-[9px] font-black transition-all border-2 ${patientInfo.structureAlteration ? 'bg-rose-50 border-rose-500 text-rose-600 shadow-sm' : 'bg-white border-slate-100 text-slate-400'}`}
                >
                  DANO ESTRUTURAL? {patientInfo.structureAlteration ? 'SIM' : 'NÃO'}
                </button>
              </div>
            </div>
          </div>

          {/* SEÇÃO: VITAIS REPOUSO */}
          <div className="bg-slate-900 rounded-[32px] p-6 shadow-xl space-y-4">
             <div className="flex items-center gap-2 text-white font-black uppercase text-xs tracking-widest">
              <Activity className="w-4 h-4 text-indigo-400" /> Hemodinâmica de Repouso
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-[8px] font-black text-slate-400 uppercase ml-1">PAS (mmHg)</label>
                 <input
                    type="number"
                    value={patientInfo.restingPAS || ''}
                    onChange={(e) => updatePatientInfo({ restingPAS: e.target.value })}
                    className="w-full p-4 bg-slate-800 border-none rounded-2xl text-sm font-bold text-white outline-none"
                    placeholder="Sistólica"
                  />
               </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase ml-1">SaO2 (%)</label>
                  <input
                    type="number"
                    value={patientInfo.restingSaO2 || ''}
                    onChange={(e) => updatePatientInfo({ restingSaO2: e.target.value })}
                    className="w-full p-4 bg-slate-800 border-none rounded-2xl text-sm font-bold text-white outline-none"
                    placeholder="Saturação"
                  />
                </div>
            </div>
          </div>
        </div>

        {/* COLUNA: MEDICAMENTOS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-black uppercase text-xs tracking-widest px-2">
            <Pill className="w-4 h-4 text-indigo-500" /> Suporte Farmacológico
          </div>
          <div className="grid grid-cols-1 gap-2">
            {medsList.map((med) => (
              <button
                key={med.id}
                onClick={() => toggleMedication(med.id)}
                className={`p-4 rounded-2xl border-2 transition-all text-left flex gap-3 items-center active:scale-[0.98] ${medications[med.id] ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'bg-white border-slate-100'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${medications[med.id] ? 'bg-indigo-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                  <Pill className="w-5 h-5" />
                </div>
                <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{med.name}</h3>
                {medications[med.id] && <CheckCircle2 className="w-5 h-5 text-indigo-600 ml-auto" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BOTÕES DE NAVEGAÇÃO FIXOS */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-50 flex gap-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex-1 bg-white text-slate-900 py-5 rounded-[24px] font-black border border-slate-200 shadow-2xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <LayoutDashboard size={16} /> Painel
        </button>
        
        <button
          onClick={handleSaveOnly}
          className="flex-[2] bg-slate-900 text-white py-5 rounded-[24px] font-black shadow-2xl flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest hover:bg-slate-800 active:scale-95 transition-all"
        >
          <Save className="w-5 h-5 text-emerald-400" />
          Gravar e Prosseguir
        </button>
      </div>
    </div>
  );
};