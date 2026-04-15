import React, { useState, useMemo } from 'react';
import { Layout } from './components/layout/Layout';
import { Calculator, CategoryName } from './types';
import { CALCULATORS } from './data/registry';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ChevronRight, 
  Folder, 
  Activity, 
  Heart, 
  FileBarChart, 
  Search, 
  Zap 
} from 'lucide-react';

import { PatientProvider } from './context/PatientContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';

// ==========================================
// CONFIGURAÇÃO DOS MÓDULOS CLÍNICOS
// ==========================================
interface ClinicalModule {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: CategoryName;
}

const CLINICAL_MODULES: ClinicalModule[] = [
  {
    id: 'perfil',
    name: 'Anamnese & Cadastro',
    description: 'Perfil antropométrico, farmacológico e sinais vitais de repouso.',
    icon: <Heart className="w-8 h-8 text-rose-500" />,
    category: 'Cadastro'
  },
  {
    id: 'capacidade',
    name: 'Capacidade Funcional',
    description: 'Testes de campo (TC6M, TSL, TUG) e predições aeróbicas.',
    icon: <Zap className="w-8 h-8 text-emerald-500" />,
    category: 'Capacidade Aeróbica'
  },
  {
    id: 'autonomico',
    name: 'Avaliação Autonômica',
    description: 'Variabilidade da FC, resposta ortostática e recuperação vagal.',
    icon: <Activity className="w-8 h-8 text-sky-500" />,
    category: 'Avaliação Autonômica'
  },
  {
    id: 'vascular',
    name: 'Exame Vascular',
    description: 'Status arterial, venoso e integridade hemodinâmica (ITB).',
    icon: <Folder className="w-8 h-8 text-indigo-500" />,
    category: 'Vascular'
  },
  {
    id: 'sintomas',
    name: 'Triagem de Sintomas',
    description: 'Algoritmos de Angina, Claudicação e Escalas de Fadiga.',
    icon: <Search className="w-8 h-8 text-amber-500" />,
    category: 'Avaliação de Sintomas'
  },
  {
    id: 'relatorio-final',
    name: 'Laudo Técnico CBDF',
    description: 'Consolidação de dados, estratificação de risco e desfechos.',
    icon: <FileBarChart className="w-8 h-8 text-slate-800" />,
    category: 'Relatório Final'
  }
];

// ==========================================
// COMPONENTE PRINCIPAL DE CONTEÚDO
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
    return (CALCULATORS as Calculator[]).filter(
      calc => calc.category === currentModule.category
    );
  }, [currentModule]);

  const handleGoHome = () => {
    setSelectedModuleId(null);
    setActiveCalculator(null);
  };

  const activeCategory = useMemo(() => {
  if (activeCalculator) return activeCalculator.category as CategoryName;
  if (currentModule) return currentModule.category;
  return 'Home' as CategoryName;
}, [activeCalculator, currentModule]);

  const ActiveCalculatorComponent = activeCalculator?.component;

  return (
    <Layout 
  selectedCategory={activeCategory as any} 
  onSelectCategory={(cat: any) => { // Use any aqui se o Layout estiver reclamando da tipagem
    if (cat === 'Home') {
      handleGoHome();
    } else {
      const mod = CLINICAL_MODULES.find(m => m.category === cat);
      if (mod) {
        setSelectedModuleId(mod.id);
        setActiveCalculator(null);
      }
    }
  }}
>      <AnimatePresence mode="wait">
        {activeCalculator ? (
          <motion.div 
            key={`calc-${activeCalculator.id}`}
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -15 }} 
            className="max-w-5xl mx-auto py-4 md:py-8"
          >
            <button 
              onClick={() => setActiveCalculator(null)} 
              className="group flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-bold text-xs uppercase tracking-widest mb-10 transition-all"
            >
              <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> 
              Voltar para {currentModule?.name}
            </button>
            
            {ActiveCalculatorComponent ? (
              <ActiveCalculatorComponent />
            ) : (
              <div className="p-16 bg-white border border-slate-200 rounded-[40px] text-center shadow-sm">
                <Activity className="w-12 h-12 text-amber-400 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-slate-900 mb-2">Módulo em Integração</h3>
                <p className="text-slate-500 max-w-sm mx-auto font-medium">
                  A ferramenta <strong>{activeCalculator.name}</strong> está sendo migrada.
                </p>
              </div>
            )}
          </motion.div>
        ) : selectedModuleId ? (
          <motion.div 
            key="module-grid" 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }} 
            className="max-w-6xl mx-auto"
          >
            <button 
              onClick={handleGoHome} 
              className="group flex items-center gap-2 text-slate-400 hover:text-slate-800 transition-colors font-bold text-xs uppercase tracking-widest mb-10"
            >
              <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> 
              Menu Principal
            </button>
            
            <div className="mb-12">
               <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight italic uppercase">
                 {currentModule?.name}
               </h2>
               <div className="h-1.5 w-24 bg-emerald-500 mt-6 rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCalculators.map((calc) => (
                <button 
                  key={calc.id} 
                  onClick={() => setActiveCalculator(calc)} 
                  className="p-8 bg-white border border-slate-100 rounded-[32px] hover:shadow-2xl hover:shadow-emerald-900/5 hover:border-emerald-500/30 transition-all text-left group flex flex-col h-full relative"
                >
                  <div className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                    <ArrowRight className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-4 block">
                    {calc.category}
                  </span>
                  <h3 className="font-black text-slate-900 group-hover:text-emerald-600 text-xl mb-3 transition-colors">
                    {calc.name}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    {calc.description}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="home-hub" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="max-w-6xl mx-auto space-y-16"
          >
            <header className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                  Ambiente Clínico Seguro
                </span>
              </div>
              <h1 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-tighter italic uppercase">
                Cardio<span className="text-emerald-500">Tools</span>
              </h1>
              <p className="text-xl text-slate-500 max-w-2xl leading-relaxed font-medium">
                Sistemas de suporte à decisão baseados nas diretrizes da SBC e CBDF.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {CLINICAL_MODULES.map((module) => (
                <motion.button
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  key={module.id}
                  onClick={() => setSelectedModuleId(module.id)}
                  className="flex flex-col p-10 bg-white rounded-[44px] border border-slate-100 shadow-sm hover:shadow-xl transition-all text-left group relative overflow-hidden"
                >
                  <div className="mb-8 p-4 bg-slate-50 rounded-2xl w-fit group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    {module.icon}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 italic uppercase tracking-tight">
                    {module.name}
                  </h3>
                  <p className="text-slate-500 text-lg leading-relaxed font-medium mb-8">
                    {module.description}
                  </p>
                  <div className="mt-auto flex items-center text-emerald-500 font-black text-xs uppercase tracking-[0.2em]">
                    Abrir Módulo <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PatientProvider>
        <AppContent />
      </PatientProvider>
    </AuthProvider>
  );
}