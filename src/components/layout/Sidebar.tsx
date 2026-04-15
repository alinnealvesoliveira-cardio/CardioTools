import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity,
  ChevronLeft, 
  Home, 
  Settings, 
  Heart,
  Search,
  FolderHeart,
  UserPlus,
  FileBarChart,
  LogOut,
  Sparkles
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
    { id: 'Avaliação Autonômica', label: 'Avaliação Autonômica', icon: Heart },
    { id: 'Vascular', label: 'Integridade Vascular', icon: FolderHeart },
    { id: 'Capacidade Aeróbica', label: 'Capacidade Aeróbica', icon: Activity },
    { id: 'Avaliação de Sintomas', label: 'Sintomas', icon: Search },
    { id: 'Relatório Final', label: 'Relatório Final', icon: FileBarChart },
  ];

  return (
    <>
      {/* Overlay refinado com Blur mais intenso */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-40"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 22, stiffness: 180 }}
            className="fixed left-0 top-0 h-full w-[300px] bg-[#0F172A] text-slate-400 z-50 flex flex-col border-r border-slate-800/50 shadow-[20px_0_50px_rgba(0,0,0,0.3)]"
          >
            {/* Seção da Logo (Sincronizada com o Header) */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/50 bg-slate-900/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Activity className="w-6 h-6 text-slate-900" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-white italic uppercase tracking-tighter leading-none">
                    Cardio<span className="text-emerald-500">Tools</span>
                  </span>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">
                    v.2.0.26
                  </span>
                </div>
              </div>
              <button 
                onClick={onToggle}
                className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all active:scale-90"
              >
                <ChevronLeft size={20} />
              </button>
            </div>

            {/* Navegação Estilizada */}
            <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
              <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Módulos Clínicos</p>
              
              {menuItems.map((item) => {
                const isActive = selectedCategory === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectCategory(item.id as any);
                      onToggle(); 
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                      isActive 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]' 
                        : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-100 border border-transparent'
                    }`}
                  >
                    {/* Indicador Ativo Lateral */}
                    {isActive && (
                      <motion.div 
                        layoutId="activeIndicator"
                        className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full"
                      />
                    )}

                    <item.icon size={22} className={`${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-200'}`} />
                    
                    <span className={`text-sm tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                      {item.label}
                    </span>

                    {isActive && (
                      <Sparkles size={12} className="ml-auto text-emerald-400 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Ações de Rodapé */}
            <div className="p-4 bg-slate-900/30 border-t border-slate-800/50 space-y-2">
              <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-800/50 text-slate-500 hover:text-white transition-all group border border-transparent">
                <Settings size={20} className="group-hover:rotate-45 transition-transform" />
                <span className="text-sm font-bold tracking-tight">Configurações</span>
              </button>
              
              <button 
                onClick={logout}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all border border-transparent group"
              >
                <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-bold tracking-tight">Sair do Sistema</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};