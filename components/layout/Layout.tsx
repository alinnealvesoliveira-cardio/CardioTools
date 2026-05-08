import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AnimatePresence, motion } from 'framer-motion';
import { CategoryName } from '../../types';

/**
 * Mapeamentos corrigidos para evitar erros de Case Sensitivity.
 * O TypeScript espera 'home' em minúsculo para rotas/IDs.
 */
const navToCategoryMap: Record<string, any> = {
  'home': 'Home',
  'cadastro': 'cadastro',
  'anamnese': 'anamnese',
  'autonomic': 'autonomic',
  'vascular': 'vascular',
  'aerobic': 'aerobic',
  'fatigability': 'fatigability',
  'hr-response': 'hr-response',
  'final-report': 'final-report'
};

const categoryToNavMap: Record<string, any> = {
  'Home': 'home',
  'cadastro': 'cadastro',
  'anamnese': 'anamnese',
  'autonomic': 'autonomic',
  'vascular': 'vascular',
  'aerobic': 'aerobic',
  'fatigability': 'fatigability',
  'hr-response': 'hr-response',
  'final-report': 'final-report'
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

  const handleMenuSelect = (id: string) => {
    // Normaliza para minúsculo antes de buscar no mapa
    const mappedCategory = navToCategoryMap[id.toLowerCase()] || 'Home';
    onSelectCategory(mappedCategory);
    closeSidebar();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        // Usamos o mapeamento para garantir que a Sidebar receba o ID correto
        selectedCategory={(categoryToNavMap[selectedCategory] || 'home') as any} 
        onSelectCategory={handleMenuSelect as any} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen relative">
        <Header onMenuClick={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth relative bg-white md:bg-slate-50/50">
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
          
          <footer className="mt-auto py-8 text-center border-t border-slate-200/60 mx-4 md:mx-10 shrink-0">
            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              CardioTools • Sistema de Apoio à Decisão Clínica em Fisioterapia Cardiovascular
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};