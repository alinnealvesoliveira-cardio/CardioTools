import React, { useState, useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, Folder, Activity, Heart, 
  FileBarChart, Search, Zap, ArrowLeft, ArrowRight 
} from 'lucide-react';

import { Layout } from './components/layout/Layout';
import { Login } from './components/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PatientProvider, usePatient } from './context/PatientProvider';
import { CALCULATORS } from './data/registry';
import { Calculator, CategoryName } from './types';

// ==========================================
// MÓDULOS E CATEGORIAS
// ==========================================
interface ClinicalModule {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: CategoryName | 'anamnese';
}

const CLINICAL_MODULES: ClinicalModule[] = [
  { id: 'perfil', name: 'Anamnese & Cadastro', description: 'Perfil antropométrico.', icon: <Heart className="w-8 h-8 text-rose-500" />, category: 'anamnese' },
  { id: 'capacidade', name: 'Capacidade Funcional', description: 'Testes de campo.', icon: <Zap className="w-8 h-8 text-emerald-500" />, category: 'aerobic' },
  { id: 'vascular', name: 'Exame Vascular', description: 'Integridade hemodinâmica.', icon: <Folder className="w-8 h-8 text-indigo-500" />, category: 'vascular' },
  { id: 'sintomas', name: 'Triagem de Sintomas', description: 'Angina e Claudicação.', icon: <Search className="w-8 h-8 text-amber-500" />, category: 'symptoms' },
  { id: 'autonomico', name: 'Avaliação Autonômica', description: 'Variabilidade FC.', icon: <Activity className="w-8 h-5 text-sky-500" />, category: 'autonomic' },
  { id: 'relatorio-final', name: 'Laudo Técnico', description: 'Consolidação.', icon: <FileBarChart className="w-8 h-8 text-slate-800" />, category: 'final-report' }
];

function AppContent() {
  const { isAuthenticated } = useAuth();
  const { currentStep, nextStep, prevStep, patient } = usePatient(); // Adicionado 'patient' aqui
  
  // Estado para controlar qual ferramenta foi aberta
  const [selectedCalcId, setSelectedCalcId] = useState<string | null>(null);
  
  const currentModule = useMemo(() => CLINICAL_MODULES[currentStep - 1], [currentStep]);

  if (!isAuthenticated) return <Login />;

  const filteredCalculators = (CALCULATORS as Calculator[]).filter(calc => calc.category === currentModule?.category);

  return (
    <Layout 
      selectedCategory={currentModule?.category === 'anamnese' ? 'cadastro' : currentModule?.category || 'cadastro'} 
      onSelectCategory={() => {}} 
    >
      <div className="max-w-5xl mx-auto py-8">
        
        {/* CABEÇALHO DO PACIENTE (Agora visível!) */}
        <div className="bg-slate-800 text-white p-4 rounded-xl mb-6 flex justify-between items-center">
          <h1 className="font-bold">Paciente: {patient?.name || "Nenhum selecionado"}</h1>
          <span className="text-sm opacity-70">Idade: {patient?.age || "--"} | Sexo: {patient?.sex || "--"}</span>
        </div>

        <div className="flex justify-between items-center mb-10">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Passo {currentStep} de {CLINICAL_MODULES.length}</p>
            <h2 className="text-4xl font-black text-slate-900 italic uppercase">{currentModule?.name}</h2>
          </div>
          {currentStep > 1 && !selectedCalcId && (
            <button onClick={prevStep} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold">
              <ArrowLeft size={16} /> Voltar Módulo
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={selectedCalcId || currentStep}>
            
            {/* LÓGICA DE NAVEGAÇÃO: SE SELECIONOU ALGO, MOSTRA A FERRAMENTA. SENÃO, MOSTRA A LISTA */}
            {selectedCalcId ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <button 
                  onClick={() => setSelectedCalcId(null)} 
                  className="mb-6 flex items-center gap-2 text-indigo-600 font-bold hover:underline"
                >
                  <ArrowLeft size={18} /> Voltar para lista de testes
                </button>
                <h3 className="text-2xl font-bold mb-4">Executando: {selectedCalcId}</h3>
                <p>Aqui aparecerá o formulário do teste...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {filteredCalculators.map((calc) => (
                  <button 
                    key={calc.id} 
                    onClick={() => setSelectedCalcId(calc.id)} // CLIQUE ATIVADO!
                    className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-lg hover:border-emerald-500 transition-all text-left w-full"
                  >
                    <h3 className="font-bold text-lg mb-2">{calc.name}</h3>
                    <p className="text-sm text-slate-500 mb-4">{calc.description}</p>
                    <div className="text-xs font-bold text-emerald-600 uppercase">Clique para iniciar</div>
                  </button>
                ))}
              </div>
            )}

            {!selectedCalcId && (
              <div className="flex justify-end pt-8 border-t border-slate-200">
                <button 
                  onClick={nextStep}
                  className="px-8 py-4 bg-slate-900 text-white rounded-full font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all"
                >
                  Salvar e Continuar <ArrowRight size={20} />
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
    <BrowserRouter>
      <AuthProvider>
        <PatientProvider>
          <AppContent />
        </PatientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}