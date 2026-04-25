import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, Activity, Heart, 
  FileBarChart, Search, Zap, ArrowLeft, ArrowRight, User 
} from 'lucide-react';

// Importações corrigidas
import { Layout } from './components/layout/Layout';
import { Login } from './components/Login';
import { Cadastro } from './calculators/components/Cadastro'; 
import { AuthProvider, useAuth } from './context/AuthContext';
// CORREÇÃO: O erro de "Cannot find module" ocorre porque o arquivo deve se chamar PatientProvider
import { PatientProvider, usePatient } from './context/PatientProvider'; 
import { CALCULATORS } from './data/registry';
import { CategoryName } from './types';

interface ClinicalModule {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: CategoryName;
}

const CLINICAL_MODULES: ClinicalModule[] = [
  { id: 'cadastro', name: 'Cadastro Inicial', description: 'Dados do paciente.', icon: <User className="w-8 h-8 text-rose-500" />, category: 'cadastro' },
  { id: 'anamnese', name: 'Anamnese', description: 'Histórico clínico.', icon: <Folder className="w-8 h-8 text-slate-500" />, category: 'anamnese' },
  { id: 'autonomic', name: 'Função Autonômica', description: 'Delta de Pressão Arterial.', icon: <Activity className="w-8 h-8 text-sky-500" />, category: 'autonomic' },
  { id: 'aerobic', name: 'Capacidade Aeróbica', description: 'Testes funcionais.', icon: <Zap className="w-8 h-8 text-emerald-500" />, category: 'aerobic' },
  { id: 'vascular', name: 'Exame Vascular', description: 'Integridade hemodinâmica.', icon: <Search className="w-8 h-8 text-indigo-500" />, category: 'vascular' },
  { id: 'fatigability', name: 'Fatigabilidade', description: 'Avaliação integrada.', icon: <Heart className="w-8 h-8 text-amber-500" />, category: 'fatigability' },
  { id: 'hr-response', name: 'Resposta da FC', description: 'Análise de frequência.', icon: <Activity className="w-8 h-8 text-purple-500" />, category: 'hr-response' },
  { id: 'final-report', name: 'Relatório Final', description: 'Consolidação.', icon: <FileBarChart className="w-8 h-8 text-slate-800" />, category: 'final-report' }
];

function AppContent() {
  const { isAuthenticated } = useAuth();
  const { currentStep, nextStep, prevStep, patient, setStep } = usePatient();
  const [selectedCalcId, setSelectedCalcId] = useState<string | null>(null);
  
  const currentModule = useMemo(() => CLINICAL_MODULES[currentStep - 1] || CLINICAL_MODULES[0], [currentStep]);

  useEffect(() => {
    setSelectedCalcId(null);
  }, [currentModule]);

  // CORREÇÃO: Forçamos a tipagem aqui para bater com o CategoryName
  const handleSelectCategory = (category: string) => {
    const moduleIndex = CLINICAL_MODULES.findIndex(m => m.category === (category as CategoryName));
    if (moduleIndex !== -1) {
      setStep(moduleIndex + 1);
    }
  };

  if (!isAuthenticated) return <Login />;

  const filteredCalculators = CALCULATORS.filter(calc => calc.category === currentModule.category);

  const ActiveCalcComponent = useMemo(() => {
    if (!selectedCalcId) return null;
    const calc = CALCULATORS.find(c => c.id === selectedCalcId);
    return calc ? calc.component : null;
  }, [selectedCalcId]);

  return (
    <Layout selectedCategory={currentModule.category} onSelectCategory={handleSelectCategory}>
      <div className="max-w-5xl mx-auto py-8">
        <div className="bg-slate-800 text-white p-4 rounded-xl mb-6 flex justify-between items-center shadow-lg">
          <h1 className="font-bold">Paciente: {patient?.name || "Nenhum selecionado"}</h1>
          <span className="text-sm opacity-70">Idade: {patient?.age || "--"}</span>
        </div>

        <div className="flex justify-between items-center mb-10">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Passo {currentStep} de {CLINICAL_MODULES.length}
            </p>
            <h2 className="text-3xl font-black text-slate-900 italic uppercase">{currentModule.name}</h2>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentModule.id + (selectedCalcId || '')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {currentModule.category === 'cadastro' ? (
              <Cadastro />
            ) : selectedCalcId ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <button onClick={() => setSelectedCalcId(null)} className="mb-6 flex items-center gap-2 text-indigo-600 font-bold hover:underline">
                  <ArrowLeft size={18} /> Voltar para lista
                </button>
                {ActiveCalcComponent ? <ActiveCalcComponent /> : <div className="p-4 text-red-500 font-bold">Erro: Componente não encontrado.</div>}
              </div>
            ) : (
              <>
                {filteredCalculators.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {filteredCalculators.map((calc) => (
                      <button key={calc.id} onClick={() => setSelectedCalcId(calc.id)} className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:border-emerald-500 transition-all text-left">
                        <h3 className="font-bold text-lg">{calc.name}</h3>
                        <p className="text-sm text-slate-500">{calc.description}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 text-slate-600">
                    <p>Nenhuma ferramenta específica nesta categoria.</p>
                  </div>
                )}
              </>
            )}

            {!selectedCalcId && currentStep < CLINICAL_MODULES.length && (
              <div className="flex justify-end pt-8 border-t border-slate-200">
                <button onClick={nextStep} className="px-8 py-4 bg-slate-900 text-white rounded-full font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all">
                  Continuar para {CLINICAL_MODULES[currentStep]?.name || 'Finalizar'} <ArrowRight size={20} />
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider><PatientProvider><AppContent /></PatientProvider></AuthProvider>
  );
}