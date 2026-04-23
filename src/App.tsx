import React, { useState, useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, ChevronRight, Folder, Activity, Heart, 
  FileBarChart, Search, Zap 
} from 'lucide-react';

// Componentes e Contextos
import { Layout } from './components/layout/Layout';
import { Login } from './components/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PatientProvider } from './context/PatientContext';
import { CALCULATORS } from './data/registry';
import { Calculator, CategoryName } from './types';

// ==========================================
// DADOS DOS MÓDULOS (FORA DO COMPONENTE)
// ==========================================
interface ClinicalModule {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: CategoryName;
}

const CLINICAL_MODULES: ClinicalModule[] = [
  { id: 'perfil', name: 'Anamnese & Cadastro', description: 'Perfil antropométrico e sinais vitais.', icon: <Heart className="w-8 h-8 text-rose-500" />, category: 'Cadastro' },
  { id: 'capacidade', name: 'Capacidade Funcional', description: 'Testes de campo e predições.', icon: <Zap className="w-8 h-8 text-emerald-500" />, category: 'Capacidade Aeróbica' },
  { id: 'autonomico', name: 'Avaliação Autonômica', description: 'Variabilidade da FC e recuperação.', icon: <Activity className="w-8 h-8 text-sky-500" />, category: 'Avaliação Autonômica' },
  { id: 'vascular', name: 'Exame Vascular', description: 'Integridade hemodinâmica e ITB.', icon: <Folder className="w-8 h-8 text-indigo-500" />, category: 'Vascular' },
  { id: 'sintomas', name: 'Triagem de Sintomas', description: 'Angina, Claudicação e Fadiga.', icon: <Search className="w-8 h-8 text-amber-500" />, category: 'Avaliação de Sintomas' },
  { id: 'relatorio-final', name: 'Laudo Técnico CBDF', description: 'Consolidação e estratificação.', icon: <FileBarChart className="w-8 h-8 text-slate-800" />, category: 'Relatório Final' }
];

// ==========================================
// COMPONENTE LÓGICO
// ==========================================
function AppContent() {
  const { isAuthenticated } = useAuth();
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [activeCalculator, setActiveCalculator] = useState<Calculator | null>(null);

  if (!isAuthenticated) return <Login />;

  const currentModule = useMemo(() => 
    CLINICAL_MODULES.find(m => m.id === selectedModuleId),
    [selectedModuleId]
  );

  const filteredCalculators = useMemo(() => {
    if (!currentModule) return [];
    return (CALCULATORS as Calculator[]).filter(calc => calc.category === currentModule.category);
  }, [currentModule]);

  const activeCategory = useMemo(() => {
    if (activeCalculator) return activeCalculator.category as CategoryName;
    if (currentModule) return currentModule.category;
    return 'Home' as CategoryName;
  }, [activeCalculator, currentModule]);

  const ActiveCalculatorComponent = activeCalculator?.component;

  return (
    <Layout 
        // Forçamos o activeCategory a ser tratado como CategoryName
  selectedCategory={activeCategory as CategoryName} 
  
  onSelectCategory={(cat: any) => { // Aceitamos o input genérico
    if (cat === 'Home') {
      setSelectedModuleId(null);
      setActiveCalculator(null);
    } else {
      // Forçamos o TypeScript a entender que 'cat' deve ser tratado como CategoryName
      const categoryName = cat as CategoryName; 
      
      const mod = CLINICAL_MODULES.find(m => m.category === categoryName);
      if (mod) {
        setSelectedModuleId(mod.id);
        setActiveCalculator(null);
      }
    }
  }}>
      <AnimatePresence mode="wait">
        {activeCalculator ? (
          <motion.div key="calc-view" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="max-w-5xl mx-auto py-8">
            <button onClick={() => setActiveCalculator(null)} className="group flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-bold text-xs uppercase tracking-widest mb-10">
              <ChevronRight className="rotate-180" /> Voltar para {currentModule?.name}
            </button>
            {ActiveCalculatorComponent ? <ActiveCalculatorComponent /> : <div className="p-16 bg-white rounded-[40px] text-center shadow-sm">Módulo em Integração</div>}
          </motion.div>
        ) : selectedModuleId ? (
          <motion.div key="module-grid" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-6xl mx-auto">
            <button onClick={() => setSelectedModuleId(null)} className="mb-10 text-slate-400 hover:text-slate-800 font-bold text-xs uppercase tracking-widest">
              <ChevronRight className="rotate-180 inline" /> Menu Principal
            </button>
            <h2 className="text-4xl font-black text-slate-900 italic uppercase mb-12">{currentModule?.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredCalculators.map((calc) => (
                <button key={calc.id} onClick={() => setActiveCalculator(calc)} className="p-8 bg-white border border-slate-100 rounded-[32px] hover:shadow-xl transition-all text-left">
                  <h3 className="font-black text-xl mb-3">{calc.name}</h3>
                  <p className="text-sm text-slate-500">{calc.description}</p>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="home-hub" className="max-w-6xl mx-auto space-y-16">
            <header><h1 className="text-6xl font-black italic uppercase">Cardio<span className="text-emerald-500">Tools</span></h1></header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {CLINICAL_MODULES.map((module) => (
                <button key={module.id} onClick={() => setSelectedModuleId(module.id)} className="p-10 bg-white rounded-[44px] shadow-sm hover:shadow-xl transition-all text-left">
                  {module.icon}
                  <h3 className="text-2xl font-black mt-6 mb-2">{module.name}</h3>
                  <p className="text-slate-500">{module.description}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

// ==========================================
// EXPORTAÇÃO PRINCIPAL
// ==========================================
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