import React, { useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, Folder, Activity, Heart, 
  FileBarChart, Search, Zap, ArrowLeft, ArrowRight 
} from 'lucide-react';

// Componentes e Contextos
import { Layout } from './components/layout/Layout';
import { Login } from './components/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PatientProvider, usePatient } from './context/PatientProvider';
import { toast } from 'react-hot-toast';
import { CALCULATORS } from './data/registry';
import { Calculator, CategoryName } from './types';

// ==========================================
// DADOS DOS MÓDULOS
// ==========================================
interface ClinicalModule {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: CategoryName;
}

const CLINICAL_MODULES: ClinicalModule[] = [
  { id: 'perfil', name: 'Anamnese & Cadastro', description: 'Perfil antropométrico e sinais vitais.', icon: <Heart className="w-8 h-8 text-rose-500" />, category: 'cadastro' },
  { id: 'capacidade', name: 'Capacidade Funcional', description: 'Testes de campo e predições.', icon: <Zap className="w-8 h-8 text-emerald-500" />, category: 'aerobic' },
  { id: 'vascular', name: 'Exame Vascular', description: 'Integridade hemodinâmica e ITB.', icon: <Folder className="w-8 h-8 text-indigo-500" />, category: 'vascular' },
  { id: 'sintomas', name: 'Triagem de Sintomas', description: 'Angina, Claudicação e Fadiga.', icon: <Search className="w-8 h-8 text-amber-500" />, category: 'symptoms' },
  { id: 'autonomico', name: 'Avaliação Autonômica', description: 'Variabilidade da FC e recuperação.', icon: <Activity className="w-8 h-5 text-sky-500" />, category: 'autonomic' },
  { id: 'relatorio-final', name: 'Laudo Técnico CBDF', description: 'Consolidação e estratificação.', icon: <FileBarChart className="w-8 h-8 text-slate-800" />, category: 'final-report' }
];

// ==========================================
// COMPONENTE LÓGICO
// ==========================================
function AppContent() {
  const { isAuthenticated } = useAuth();
  const { currentStep, nextStep, prevStep } = usePatient();
  
  // O módulo atual baseado no step (1 = Anamnese, etc)
  const currentModule = useMemo(() => CLINICAL_MODULES[currentStep - 1], [currentStep]);

  if (!isAuthenticated) return <Login />;

  const filteredCalculators = (CALCULATORS as Calculator[]).filter(calc => calc.category === currentModule?.category);

  return (
    <Layout 
      selectedCategory={currentModule?.category || 'Cadastro'} 
      onSelectCategory={() => {}} // O fluxo agora é controlado pelo Wizard
    >
      <div className="max-w-5xl mx-auto py-8">
        
        {/* Header do Wizard */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Passo {currentStep} de {CLINICAL_MODULES.length}</p>
            <h2 className="text-4xl font-black text-slate-900 italic uppercase">{currentModule?.name}</h2>
          </div>
          {currentStep > 1 && (
            <button onClick={prevStep} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold">
              <ArrowLeft size={16} /> Voltar
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={currentStep}
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Grid de Ferramentas do Passo Atual */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {filteredCalculators.map((calc) => (
                <div key={calc.id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all">
                  <h3 className="font-bold text-lg mb-2">{calc.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">{calc.description}</p>
                  {/* Aqui você pode renderizar o componente da calculadora ou um botão para abrir */}
                  <div className="text-xs font-bold text-emerald-600">Disponível</div>
                </div>
              ))}
              {filteredCalculators.length === 0 && (
                <div className="col-span-3 p-12 bg-slate-50 rounded-3xl text-center text-slate-500">
                  Nenhum teste específico configurado para esta etapa.
                </div>
              )}
            </div>

            {/* Rodapé do Wizard */}
            <div className="flex justify-end pt-8 border-t border-slate-200">
              {currentStep < CLINICAL_MODULES.length ? (
                <button 
                  onClick={nextStep}
                  className="px-8 py-4 bg-slate-900 text-white rounded-full font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all"
                >
                  Salvar e Continuar <ArrowRight size={20} />
                </button>
              ) : (
                <button className="px-8 py-4 bg-emerald-600 text-white rounded-full font-bold">
                  Finalizar Relatório
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
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