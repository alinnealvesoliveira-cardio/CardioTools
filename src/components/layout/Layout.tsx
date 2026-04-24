import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AnimatePresence, motion } from 'framer-motion';
import { CategoryName, NavId } from '../../types';

// 1. Tradução: UI (NavId) -> Dados (CategoryName)
const navToCategoryMap: Record<NavId, CategoryName | 'Home'> = {
  'Home': 'Home',
  'Cadastro': 'cadastro',
  'Anamnese': 'anamnese', // Adicionado aqui
  'Avaliação Autonômica': 'autonomic',
  'Vascular': 'vascular',
  'Capacidade Aeróbica': 'aerobic',
  'Avaliação de Sintomas': 'symptoms',
  'Relatório Final': 'final-report',
  'Fatigabilidade': 'fatigability',
};

// 2. Tradução: Dados (CategoryName) -> UI (NavId)
const categoryToNavMap: Record<CategoryName | 'Home', NavId> = {
  'Home': 'Home',
  'cadastro': 'Cadastro',
  'anamnese': 'Anamnese', // Adicionado aqui
  'autonomic': 'Avaliação Autonômica',
  'vascular': 'Vascular',
  'aerobic': 'Capacidade Aeróbica',
  'symptoms': 'Avaliação de Sintomas',
  'final-report': 'Relatório Final',
  'fatigability': 'Fatigabilidade',
};

const getNavIdFromCategory = (category: CategoryName | 'Home'): NavId => {
  return categoryToNavMap[category] || 'Home';
};

interface LayoutProps {
  children: React.ReactNode;
  selectedCategory: CategoryName | 'Home';
  onSelectCategory: (category: CategoryName | 'Home') => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  selectedCategory, 
  onSelectCategory 
}) => {

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) closeSidebar();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMenuSelect = (id: NavId) => {
    // Usamos o mapa para converter o ID clicado na categoria de dados
    const mappedCategory = navToCategoryMap[id];
    onSelectCategory(mappedCategory);
    closeSidebar();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        // Usamos o mapa inverso para garantir que a Sidebar receba um NavId válido
        selectedCategory={categoryToNavMap[selectedCategory] || 'Home'} 
        onSelectCategory={handleMenuSelect}
      />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen relative">
        <Header onMenuClick={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-10 pb-24"
            >
              {children}
            </motion.div>
          </AnimatePresence>
          
          <footer className="mt-auto py-8 text-center border-t border-slate-200/60 mx-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              Sistema de Apoio à Decisão Clínica em Fisioterapia Cardiovascular
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};