import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Category } from '../../types';
import { AnimatePresence, motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  /** * selectedCategory: Identifica o módulo ativo para estilização na Sidebar.
   */
  selectedCategory: Category | 'Home' | null; 
  /**
   * onSelectCategory: Callback para trocar o módulo renderizado no App.tsx.
   */
  onSelectCategory: (category: Category | 'Home') => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  selectedCategory, 
  onSelectCategory 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Fecha a sidebar automaticamente se a tela for redimensionada para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) closeSidebar();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar - Fixa ou Drawer dependendo do viewport */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          onSelectCategory(cat);
          closeSidebar();
        }}
      />
      
      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen relative">
        {/* Header - Sempre visível no topo */}
        <Header onMenuClick={toggleSidebar} />
        
        {/* Área de Scroll do Conteúdo */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={String(selectedCategory || 'home')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-10 pb-24"
            >
              {children}
            </motion.div>
          </AnimatePresence>
          
          {/* Footer discreto dentro do scroll */}
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