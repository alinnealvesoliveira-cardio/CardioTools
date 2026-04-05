import { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { Category, Calculator } from './types';
import { CALCULATORS } from './data/registry';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronRight } from 'lucide-react';

import { PatientProvider } from './context/PatientContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Home' | null>('Home');
  const [activeCalculator, setActiveCalculator] = useState<Calculator | null>(null);

  if (!isAuthenticated) {
    return <Login />;
  }

  const filteredCalculators = selectedCategory === 'Home' 
    ? CALCULATORS 
    : CALCULATORS.filter(c => c.category === selectedCategory);

  const handleSelectCategory = (cat: Category | 'Home') => {
    setSelectedCategory(cat);
    setActiveCalculator(null);
  };

  const handleSelectCalculator = (calc: Calculator) => {
    setActiveCalculator(calc);
  };

  return (
    <Layout 
      selectedCategory={selectedCategory} 
      onSelectCategory={handleSelectCategory}
    >
      <AnimatePresence mode="wait">
        {activeCalculator ? (
          <motion.div
            key={activeCalculator.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="py-8"
          >
            <div className="max-w-4xl mx-auto px-4 mb-6">
              <button 
                onClick={() => setActiveCalculator(null)}
                className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 text-sm transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Voltar para lista
              </button>
            </div>
            <activeCalculator.component />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 lg:p-10 space-y-10"
          >
            {/* Hero Section */}
            {selectedCategory === 'Home' && (
              <section className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                  Cardio<span className="text-emerald-500">Tools</span>
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl">
                  Ferramentas de precisão para fisioterapeutas. Escalas validadas, 
                  cálculos biomecânicos e interpretações clínicas em um só lugar.
                </p>
              </section>
            )}

            {/* Category Title */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">
                {selectedCategory === 'Home' ? 'Todas as Ferramentas' : selectedCategory}
              </h2>
              <span className="text-sm font-medium text-slate-400">
                {filteredCalculators.length} {filteredCalculators.length === 1 ? 'ferramenta' : 'ferramentas'}
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCalculators.map((calc) => (
                <motion.button
                  whileHover={{ y: -4 }}
                  key={calc.id}
                  onClick={() => handleSelectCalculator(calc)}
                  className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all text-left flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-emerald-100">
                      {calc.category}
                    </span>
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                    {calc.name}
                  </h3>
                  <p className="text-sm text-slate-500 flex-1">
                    {calc.description}
                  </p>
                </motion.button>
              ))}
            </div>

            {filteredCalculators.length === 0 && (
              <div className="text-center py-20 space-y-4">
                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-400 font-medium">Nenhuma calculadora encontrada nesta categoria.</p>
              </div>
            )}
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

function Search({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  );
}

