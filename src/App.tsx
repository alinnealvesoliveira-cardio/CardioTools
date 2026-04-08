import { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { Category, Calculator } from './types';
import { CALCULATORS } from './data/registry';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronRight, Folder, Activity, Heart, FileBarChart } from 'lucide-react';

import { PatientProvider } from './context/PatientContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';

// Definição dos Módulos Clínicos com mapeamento de categorias
const CLINICAL_MODULES = [
  {
    id: 'perfil',
    name: 'Perfil Clínico & Sinais Vitais',
    description: 'Cadastro, anamnese, sinais vitais e exames complementares (FEVE, CATE).',
    icon: <Heart className="w-8 h-8 text-blue-500" />,
    categories: ['Cadastro'] 
  },
  {
    id: 'capacidade',
    name: 'Capacidade Aeróbica & Autonômica',
    description: 'Testes de campo, Variabilidade da FC e resposta cronotrópica ao esforço.',
    icon: <Activity className="w-8 h-8 text-emerald-500" />,
    categories: ['Avaliação Autonômica', 'Capacidade Aeróbica', 'Funcional'] 
  },
  {
    id: 'vascular',
    name: 'Avaliação Vascular',
    description: 'Avaliação da função dos vasos, status arterial, venoso e linfático.',
    icon: <Folder className="w-8 h-8 text-purple-500" />,
    categories: ['Vascular']
  },
  {
    id: 'relatorios',
    name: 'Relatórios & Fadiga',
    description: 'Escalas de fadigabilidade e consolidação do laudo final CBDF.',
    icon: <FileBarChart className="w-8 h-8 text-slate-500" />,
    categories: ['Relatório Final', 'Avaliação de Sintomas']
  }
];

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [activeCalculator, setActiveCalculator] = useState<Calculator | null>(null);

  if (!isAuthenticated) return <Login />;

  const getFilteredCalculators = () => {
    if (!selectedModule) return [];
    const module = CLINICAL_MODULES.find(m => m.id === selectedModule);
    return CALCULATORS.filter(calc => module?.categories.includes(calc.category));
  };

  const filteredCalculators = getFilteredCalculators();

  return (
    <Layout 
      selectedCategory="Home" 
      onSelectCategory={() => { setSelectedModule(null); setActiveCalculator(null); }}
    >
      <AnimatePresence mode="wait">
        
        {/* 1. TELA DA FERRAMENTA ATIVA */}
        {activeCalculator ? (
          <motion.div key="calc" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="py-8">
            <div className="max-w-4xl mx-auto px-4 mb-6">
              <button 
                onClick={() => setActiveCalculator(null)} 
                className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 text-sm transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" /> Voltar para o módulo
              </button>
            </div>
            <activeCalculator.component />
          </motion.div>
        ) : selectedModule ? (
          
          /* 2. TELA DO MÓDULO (LISTA FILTRADA) */
          <motion.div key="module-items" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 lg:p-10 space-y-8">
            <button 
              onClick={() => setSelectedModule(null)} 
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
            >
              <ChevronRight className="w-4 h-4 rotate-180" /> Voltar ao Início
            </button>
            
            <div className="border-b border-slate-200 pb-6">
               <h2 className="text-3xl font-extrabold text-slate-900">
                 {CLINICAL_MODULES.find(m => m.id === selectedModule)?.name}
               </h2>
               <p className="text-slate-500 mt-2">Selecione a avaliação específica abaixo.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCalculators.map((calc) => (
                <button 
                  key={calc.id} 
                  onClick={() => setActiveCalculator(calc)} 
                  className="p-6 bg-white border border-slate-200 rounded-2xl hover:shadow-xl hover:border-emerald-500 transition-all text-left group flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                      {calc.category}
                    </span>
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-transform group-hover:translate-x-1" />
                  </div>
                  <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 text-lg mb-2 transition-colors">
                    {calc.name}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed flex-1">
                    {calc.description}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          
          /* 3. TELA INICIAL (DASHBOARD DE MÓDULOS) */
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 lg:p-10 space-y-12">
            <header className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                Cardio<span className="text-emerald-500">Tools</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                Plataforma de precisão para fisioterapia cardiovascular. 
                Selecione um módulo clínico para iniciar.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {CLINICAL_MODULES.map((module) => (
                <motion.button
                  whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  key={module.id}
                  onClick={() => setSelectedModule(module.id)}
                  className="flex flex-col p-8 bg-white rounded-3xl border border-slate-200 shadow-sm transition-all text-left relative group overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -mr-12 -mt-12 transition-colors group-hover:bg-emerald-50" />
                  
                  <div className="mb-6 relative">{module.icon}</div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{module.name}</h3>
                  <p className="text-slate-500 text-base leading-relaxed flex-1">{module.description}</p>
                  
                  <div className="mt-8 flex items-center text-emerald-600 font-bold text-sm uppercase tracking-wider">
                    Acessar Ferramentas <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
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