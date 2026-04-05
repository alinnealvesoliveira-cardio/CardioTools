import React from 'react';
import { Pill, Info, CheckCircle2, User, Ruler, Weight, Activity } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { motion } from 'framer-motion';

export const PatientRegistration: React.FC = () => {
  const { medications, updateMedications, patientInfo, updatePatientInfo } = usePatient();

  const medsList = [
    {
      id: 'betablockers',
      name: 'Betabloqueadores',
      examples: 'Exemplo: Metoprolol, Propranolol, Atenolol, Carvedilol',
      description: 'Atenua a resposta da FC e PA ao esforço.',
      alert: 'Fadiga precoce, intolerância ao esforço (FC), hipotensão postural e broncoespasmo em asmáticos.',
      color: 'blue'
    },
    {
      id: 'diuretics',
      name: 'Diuréticos',
      examples: 'Exemplo: Hidroclorotiazida, Furosemida, Espironolactona',
      description: 'Reduz o volume plasmático (pré-carga).',
      alert: 'Risco de desidratação e hipotensão (especialmente pós-exercício), Câimbras musculares, risco de arritmias (distúrbios eletrolíticos).',
      color: 'blue'
    },
    {
      id: 'ieca',
      name: 'Inibidores da ECA (IECA)',
      examples: 'Exemplo: Enalapril, Captopril, Ramipril',
      description: 'Vasodilatação (redução da pós-carga).',
      alert: 'Hipotensão (tontura) no início do exercício ou na recuperação (pós-esforço). Tosse seca (pode ser incômoda durante o exercício).',
      color: 'blue'
    },
    {
      id: 'bcc',
      name: 'Bloqueadores de Canais de Cálcio (BCC)',
      examples: 'Exemplo: Verapamil, Diltiazem, Anlodipino',
      description: 'Reduzem a FC e a contratilidade (Não Di-hidro).',
      alert: 'Bradicardia, fadiga precoce e intolerância ao esforço. Anlodipino pode causar edema maleolar e taquicardia reflexa.',
      color: 'blue'
    },
    {
      id: 'statins',
      name: 'Estatinas',
      examples: 'Exemplo: Sinvastatina, Atorvastatina, Rosuvastatina',
      description: 'Redução do colesterol via fígado.',
      alert: 'Mialgia (dor muscular) e fraqueza. Pode ser confundido com fadiga muscular do exercício.',
      color: 'amber'
    },
    {
      id: 'nitrates',
      name: 'Nitratos',
      examples: 'Exemplo: Isossorbida, Nitroglicerina',
      description: 'Vasodilatação (principalmente venosa).',
      alert: 'Hipotensão e tontura, Cefaleia, Taquicardia reflexa.',
      color: 'blue'
    },
    {
      id: 'antiarrhythmics',
      name: 'Antiarrítmicos',
      examples: 'Exemplo: Amiodarona, Sotalol',
      description: 'Canais iônicos cardíacos.',
      alert: 'Risco de pró-arritmia (exercício pode gerar arritmias), prolongamento do QT e fotossensibilidade.',
      color: 'amber'
    },
    {
      id: 'digitalis',
      name: 'Digitálicos',
      examples: 'Exemplo: Digoxina',
      description: 'Comuns em pacientes com IC ou Fibrilação Atrial.',
      alert: 'Alerta de Monitorização: Risco de "Efeito Digitálico" no ECG (depressão do segmento ST em colher). Fique atento a sinais de intoxicação (náuseas, visão turva e bradicardia acentuada).',
      color: 'amber'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-24">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Cadastro / Anamnese Rápida</h1>
        <p className="text-slate-500 text-sm">Dados antropométricos e perfil farmacológico para base de cálculo.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Patient Info */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-2 text-slate-800 font-bold mb-4">
            <User className="w-5 h-5 text-vitality-lime" />
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
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-vitality-lime transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Idade</label>
                <div className="relative">
                  <input
                    type="number"
                    value={patientInfo.age}
                    onChange={(e) => updatePatientInfo({ age: e.target.value })}
                    placeholder="Anos"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-vitality-lime transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sexo</label>
                <select
                  value={patientInfo.sex}
                  onChange={(e) => updatePatientInfo({ sex: e.target.value as 'male' | 'female' })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-vitality-lime transition-all"
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
                  placeholder="Ex: 70"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-vitality-lime transition-all"
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
                  placeholder="Ex: 170"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-vitality-lime transition-all"
                />
              </div>
            </div>
          </div>

          {patientInfo.imc && (
            <div className="mt-6 p-4 bg-vitality-lime/10 rounded-2xl border border-vitality-lime/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-vitality-lime text-white rounded-lg">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-vitality-lime uppercase tracking-wider">IMC Calculado</div>
                  <div className="text-xl font-black text-slate-900">{patientInfo.imc.toFixed(1)} kg/m²</div>
                </div>
              </div>
              <div className="text-[10px] font-bold text-vitality-lime bg-white px-3 py-1 rounded-full border border-vitality-lime/20">
                {patientInfo.imc < 18.5 ? 'Abaixo do Peso' :
                 patientInfo.imc < 25 ? 'Normal' :
                 patientInfo.imc < 30 ? 'Sobrepeso' : 'Obesidade'}
              </div>
            </div>
          )}
        </div>

        {/* Pharmacology */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold mb-2">
            <Pill className="w-5 h-5 text-vitality-lime" />
            Perfil Farmacológico
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {medsList.map((med) => (
              <button
                key={med.id}
                onClick={() => updateMedications({ [med.id]: !medications[med.id as keyof typeof medications] })}
                className={`group p-4 rounded-2xl border-2 transition-all text-left flex gap-4 items-start ${
                  medications[med.id as keyof typeof medications]
                    ? 'bg-white border-slate-900 shadow-lg'
                    : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  medications[med.id as keyof typeof medications]
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
                }`}>
                  <Pill className="w-5 h-5" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-slate-900">{med.name}</h3>
                    {medications[med.id as keyof typeof medications] && (
                      <CheckCircle2 className="w-4 h-4 text-vitality-lime" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium italic truncate max-w-[200px]">{med.examples}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-vitality-graphite rounded-3xl p-6 text-white space-y-3">
            <div className="flex items-center gap-2 text-vitality-lime font-bold text-[10px] uppercase tracking-widest">
              <Info className="w-3 h-3" />
              Impacto Clínico
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Os dados inseridos aqui alimentam as condicionais de todo o aplicativo. 
              Alertas automáticos serão exibidos nos testes funcionais e avaliações vasculares 
              sempre que houver interferência na interpretação clínica.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
