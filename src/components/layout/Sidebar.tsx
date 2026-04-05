import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity,
  ChevronLeft, 
  Home, 
  Settings, 
  HelpCircle, 
  Wind,
  Zap,
  Info,
  UserPlus,
  FileBarChart,
  LogOut
} from 'lucide-react';
import { Category } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedCategory: Category | 'Home' | null;
  onSelectCategory: (cat: Category | 'Home') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onToggle, 
  selectedCategory, 
  onSelectCategory 
}) => {
  const { logout } = useAuth();
  const menuItems = [
    { id: 'Home', label: 'Dashboard', icon: Home },
    { id: 'Cadastro', label: 'Cadastro / Anamnese', icon: UserPlus },
    { id: 'Avaliação Autonômica', label: 'Avaliação Autonômica', icon: Activity },
    { id: 'Integridade Vascular', label: 'Integridade Vascular', icon: Zap },
    { id: 'Capacidade Aeróbica', label: 'Capacidade Aeróbica', icon: Wind },
    { id: 'Sintomas', label: 'Sintomas', icon: Info },
    { id: 'Relatório Final', label: 'Relatório Final', icon: FileBarChart },
  ];

  return (
    <>
      {/* Mobile/Desktop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-[280px] bg-vitality-graphite text-slate-300 z-50 flex flex-col border-r border-slate-800 shadow-2xl"
          >
            {/* Logo Section */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-vitality-lime flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white text-lg tracking-tight">
                  CardioTools
                </span>
              </div>
              <button 
                onClick={onToggle}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectCategory(item.id as any);
                    onToggle(); // Close on select
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group relative ${
                    selectedCategory === item.id 
                      ? 'bg-vitality-lime/10 text-vitality-lime' 
                      : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
                  }`}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${selectedCategory === item.id ? 'text-vitality-lime' : ''}`} />
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                </button>
              ))}
            </nav>

            {/* Footer Actions */}
            <div className="p-3 border-t border-slate-800 space-y-2">
              <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-slate-400 transition-all">
                <Settings className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">Configurações</span>
              </button>
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">Sair do Sistema</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};
