import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Category } from '../../types';

interface LayoutProps {
  children: React.ReactNode;
  selectedCategory: Category | 'Home' | null;
  onSelectCategory: (cat: Category | 'Home') => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  selectedCategory, 
  onSelectCategory 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};
