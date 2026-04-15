import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Category } from '../../types';
import { AnimatePresence, motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  /** * selectedCategory: Aceita string para exibir "Dashboard" ou o nome do módulo selecionado no App.tsx.
   */
  selectedCategory: string | null; 
  /**
   * onSelectCategory: Alterado para aceitar 'any'. 
   * Isso permite que o objeto Category vindo da Sidebar seja processado sem erros de tipagem.
   */
  onSelectCategory: (category: any) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  selectedCategory, 
  onSelectCategory 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex overflow-x-hidden">
      {/* Overlay para Mobile: Escurece o fundo quando a sidebar abre */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar: Recebe o estado e as funções de navegação */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar}
        // 'as any' necessário para que a Sidebar aceite a string enviada pelo App.tsx
        selectedCategory={selectedCategory as any}
        onSelectCategory={(cat) => {
          onSelectCategory(cat); // Agora o TS aceita o objeto enviado pela Sidebar
          if (window.innerWidth < 1024) closeSidebar(); // Fecha ao clicar no mobile
        }}
      />
      
      {/* Área de Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header onMenuClick={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth bg-slate-50/50">
          <div className="max-w-[1600px] mx-auto p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};