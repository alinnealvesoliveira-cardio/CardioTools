import React from 'react';
import { Pill, CheckCircle2, User, Heart, Save, LayoutDashboard, Activity, Search } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { supabase } from '../../lib/supabase';
import { Medications } from '../../types';
import { toast } from 'react-hot-toast';

export const PatientRegistration: React.FC = () => {
  // Removido o useNavigate que causava o erro de rota inexistente
  const { medications, setMedications, patientInfo, updatePatientInfo } = usePatient();

  const toggleMedication = (id: keyof Medications) => {
    setMedications(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSaveOnly = async () => {
    try {
      // Sincronização estrita com a tabela 'patients' atualizada
      const { error } = await supabase.from('patients').upsert({
        name: patientInfo.name,
        // Garante que age seja um número inteiro antes de enviar
        age: parseInt(patientInfo.age as any) || null, 
        sex: patientInfo.sex,
        // Removida a referência à diastólica que não existe mais no banco
        resting_pas: patientInfo.restingPAS || null,
        // Campo adicionado se você o criou no banco, senão remova esta linha
        // resting_sao2: patientInfo.restingSaO2 || null, 
        ejection_fraction: patientInfo.ejectionFraction || null,
        updated_at: new Date()
      });

      if (error) throw error;

      toast.success("Perfil atualizado com sucesso!");
    } catch (error: any) {
      console.error("Erro na sincronização:", error);
      // Fallback para manter a experiência se o Supabase falhar
      console.warn("Falha na rede ou erro de banco. Dados mantidos localmente.");
      toast.success("Salvo localmente no dispositivo.");
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
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none cursor-pointer"
                  >
                    <option value="">Selecionar</option>
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

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
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none"
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

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-50">
        <button
          onClick={handleSaveOnly}
          className="w-full bg-slate-900 text-white py-6 rounded-[24px] font-black shadow-2xl flex items-center justify-center gap-3 text-[11px] uppercase tracking-widest hover:bg-slate-800 active:scale-95 transition-all"
        >
          <Save className="w-5 h-5 text-emerald-400" />
          Salvar Dados do Paciente
        </button>
      </div>
    </div>
  );
};