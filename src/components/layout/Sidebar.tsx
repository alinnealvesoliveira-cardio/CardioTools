import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, ChevronLeft, Home, Settings, Heart, Search, 
  FolderHeart, UserPlus, FileBarChart, LogOut, Sparkles, LucideIcon 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NavId } from '../../types'; // Importação correta no topo

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedCategory: NavId; 
  onSelectCategory: (category: NavId) => void; 
}

// Configuração dos itens fora do componente para evitar re-renderizações desnecessárias
const MENU_ITEMS: { id: NavId; label: string; icon: LucideIcon }[] = [
  { id: 'Home', label: 'Dashboard Principal', icon: Home },
  { id: 'Cadastro', label: 'Anamnese e Perfil', icon: UserPlus },
  { id: 'Avaliação Autonômica', label: 'Avaliação Autonômica', icon: Heart },
  { id: 'Vascular', label: 'Integridade Vascular', icon: FolderHeart },
  { id: 'Capacidade Aeróbica', label: 'Capacidade Aeróbica', icon: Activity },
  { id: 'Avaliação de Sintomas', label: 'Sinais e Sintomas', icon: Search },
  { id: 'Relatório Final', label: 'Relatório Final (CBDF)', icon: FileBarChart },
];

export const Sidebar = ({ isOpen, onToggle, selectedCategory, onSelectCategory }: SidebarProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogoutClick = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error("Erro ao encerrar sessão:", error);
      window.location.href = '/login';
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-[300px] bg-slate-950 text-slate-400 z-50 flex flex-col border-r border-slate-800 shadow-2xl"
          >
            {/* Branding */}
            <div className="h-24 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Activity className="w-6 h-6 text-slate-950" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-white italic uppercase tracking-tighter leading-none">
                    Cardio<span className="text-emerald-500">Tools</span>
                  </span>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1.5">
                    Premium v2.0
                  </span>
                </div>
              </div>
              <button 
                onClick={onToggle}
                className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all active:scale-90"
              >
                <ChevronLeft size={20} />
              </button>
            </div>

            {/* Navegação */}
            <nav className="flex-1 py-8 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
              <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Protocolos Clínicos</p>
              
              {MENU_ITEMS.map((item) => {
                const isActive = selectedCategory === item.id;
                const Icon = item.icon; // Componente de ícone
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectCategory(item.id);
                      onToggle(); 
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group relative ${
                      isActive 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'hover:bg-slate-900 text-slate-500 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeIndicator"
                        className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full"
                      />
                    )}

                    <Icon size={20} className={`${isActive ? 'text-emerald-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
                    
                    <span className={`text-[13px] tracking-tight ${isActive ? 'font-bold' : 'font-semibold'}`}>
                      {item.label}
                    </span>

                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto"
                      >
                        <Sparkles size={12} className="text-emerald-400 animate-pulse" />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-900/20 border-t border-slate-800 space-y-1.5">
              <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-900 text-slate-500 hover:text-white transition-all group">
                <Settings size={18} className="group-hover:rotate-45 transition-transform" />
                <span className="text-[13px] font-bold">Ajustes</span>
              </button>
              
              <button 
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 transition-all group"
              >
                <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[13px] font-bold">Encerrar Sessão</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};