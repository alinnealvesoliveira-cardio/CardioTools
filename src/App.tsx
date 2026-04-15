import React, { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { Calculator } from './types';
import { CALCULATORS } from './data/registry';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronRight, Folder, Activity, Heart, FileBarChart, Search, Zap } from 'lucide-react';

import { PatientProvider } from './context/PatientContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';

interface ClinicalModule {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  categories: string[];
}

const CLINICAL_MODULES: ClinicalModule[] = [
  {
    id: 'perfil',
    name: 'Anamnese & Cadastro',
    description: 'Perfil antropométrico, farmacológico e sinais vitais de repouso.',
    icon: <Heart className="w-8 h-8 text-rose-500" />,
    categories: ['Cadastro'] 
  },
  {
    id: 'capacidade',
    name: 'Capacidade Funcional',
    description: 'Testes de campo (TC6M, TSL, TUG) e predições aeróbicas.',
    icon: <Zap className="w-8 h-8 text-emerald-500" />,
    categories: ['Capacidade Aeróbica'] 
  },
  {
    id: 'autonomico',
    name: 'Avaliação Autonômica',
    description: 'Variabilidade da FC, resposta ortostática e recuperação vagal.',
    icon: <Activity className="w-8 h-8 text-sky-500" />,
    categories: ['Avaliação Autonômica'] 
  },
  {
    id: 'vascular',
    name: 'Exame Vascular',
    description: 'Status arterial, venoso e integridade hemodinâmica (ITB).',
    icon: <Folder className="w-8 h-8 text-indigo-500" />,
    categories: ['Vascular']
  },
  {
    id: 'sintomas',
    name: 'Triagem de Sintomas',
    description: 'Algoritmos de Angina, Claudicação e Escalas de Fadiga.',
    icon: <Search className="w-8 h-8 text-amber-500" />,
    categories: ['Avaliação de Sintomas']
  },
  {
    id: 'relatorio-final',
    name: 'Laudo Técnico CBDF',
    description: 'Consolidação de dados, estratificação de risco e desfechos.',
    icon: <FileBarChart className="w-8 h-8 text-slate-800" />,
    categories: ['Relatório Final']
  }
];

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [activeCalculator, setActiveCalculator] = useState<Calculator | null>(null);

  if (!isAuthenticated) return <Login />;

  const getFilteredCalculators = (): Calculator[] => {
    if (!selectedModule) return [];
    const currentModule = CLINICAL_MODULES.find(m => m.id === selectedModule);
    if (!currentModule) return [];
    
    return (CALCULATORS as Calculator[]).filter(calc => 
      currentModule.categories.includes(calc.category)
    );
  };

  const filteredCalculators = getFilteredCalculators();

  const handleGoHome = () => {
    setSelectedModule(null);
    setActiveCalculator(null);
  };

  // Trava de segurança: identifica o componente antes de renderizar
  const ActiveCalculatorComponent = activeCalculator?.component;

  return (
    <Layout 
      selectedCategory={selectedModule ? CLINICAL_MODULES.find(m => m.id === selectedModule)?.name || "Dashboard" : "Dashboard"} 
      onSelectCategory={handleGoHome}
    >
      <AnimatePresence mode="wait">
        
        {/* VIEW 3: CALCULADORA ATIVA (Com trava de segurança para evitar tela branca) */}
        {activeCalculator ? (
          <motion.div 
            key="calc" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            className="max-w-5xl mx-auto py-8 px-4"
          >
            <button 
              onClick={() => setActiveCalculator(null)} 
              className="group flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-bold text-xs uppercase tracking-widest mb-8 transition-all"
            >
              <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> 
              Voltar ao Módulo
            </button>
            
            {/* CORREÇÃO: Verifica se o componente existe antes de chamar */}
            {ActiveCalculatorComponent ? (
              <ActiveCalculatorComponent />
            ) : (
              <div className="p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] text-center">
                <div className="bg-amber-100 text-amber-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Módulo em Manutenção</h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                  O componente <strong>{activeCalculator.name}</strong> não pôde ser carregado. 
                  Verifique se o nome do arquivo no VS Code coincide com o import no registro.
                </p>
              </div>
            )}
          </motion.div>
        ) : selectedModule ? (
          
          /* VIEW 2: LISTA DE FERRAMENTAS DO MÓDULO */
          <motion.div 
            key="module-items" 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }} 
            className="max-w-6xl mx-auto p-6 lg:p-10"
          >
            <button 
              onClick={() => setSelectedModule(null)} 
              className="group flex items-center gap-2 text-slate-400 hover:text-slate-800 transition-colors font-bold text-xs uppercase tracking-widest mb-10"
            >
              <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> 
              Menu Principal
            </button>
            
            <div className="mb-12">
               <h2 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">
                 {CLINICAL_MODULES.find(m => m.id === selectedModule)?.name}
               </h2>
               <div className="h-1 w-20 bg-emerald-500 mt-4 rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCalculators.map((calc: Calculator) => (
                <button 
                  key={calc.id} 
                  onClick={() => setActiveCalculator(calc)} 
                  className="p-8 bg-white border border-slate-100 rounded-[32px] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.07)] hover:border-emerald-500/30 transition-all text-left group flex flex-col h-full relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-5 h-5 text-emerald-500 -rotate-45 group-hover:rotate-0 transition-transform" />
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
          
          /* VIEW 1: SELEÇÃO DE MÓDULOS (HOME) */
          <motion.div 
            key="home" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="max-w-6xl mx-auto p-6 lg:p-12 space-y-16"
          >
            <header className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Sistema Operacional Ativo</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter italic uppercase">
                Cardio<span className="text-emerald-500">Tools</span>
              </h1>
              <p className="text-xl text-slate-500 max-w-2xl leading-relaxed font-medium">
                Engenharia clínica aplicada à fisioterapia. Precisão diagnóstica baseada em evidências.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
              {CLINICAL_MODULES.map((module) => (
                <motion.button
                  whileHover={{ y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  key={module.id}
                  onClick={() => setSelectedModule(module.id)}
                  className="flex flex-col p-10 bg-white rounded-[40px] border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] transition-all text-left relative group"
                >
                  <div className="mb-8 p-4 bg-slate-50 rounded-2xl w-fit group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    {module.icon}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 italic uppercase tracking-tight">{module.name}</h3>
                  <p className="text-slate-500 text-lg leading-relaxed font-medium mb-8">{module.description}</p>
                  
                  <div className="mt-auto flex items-center text-emerald-500 font-black text-xs uppercase tracking-[0.2em]">
                    Iniciar Módulo <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-2 transition-transform" />
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