import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, ChevronLeft, Home, Heart, Search, 
  FolderHeart, UserPlus, FileBarChart, LogOut, LucideIcon, FileText 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NavId } from '../../types';

interface SidebarItem {
  id: NavId | 'Home';
  label: string;
  icon: LucideIcon;
  section: 'Geral' | 'Paciente' | 'Avaliação' | 'Relatório';
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedCategory: NavId | 'Home'; // Tipagem estrita
  onSelectCategory: (id: NavId | 'Home') => void;
}

const MENU_ITEMS: SidebarItem[] = [
  { id: 'Home', label: 'Dashboard', icon: Home, section: 'Geral' },
  { id: 'cadastro', label: 'Cadastro do Paciente', icon: UserPlus, section: 'Paciente' },
  { id: 'anamnese', label: 'Anamnese Detalhada', icon: FileText, section: 'Paciente' },
  { id: 'autonomic', label: 'Avaliação Autonômica', icon: Heart, section: 'Avaliação' },
  { id: 'vascular', label: 'Integridade Vascular', icon: FolderHeart, section: 'Avaliação' },
  { id: 'aerobic', label: 'Capacidade Aeróbica', icon: Activity, section: 'Avaliação' },
  { id: 'fatigability', label: 'Sinais e Sintomas', icon: Search, section: 'Avaliação' },
  { id: 'hr-response', label: 'Resposta da FC', icon: Activity, section: 'Avaliação' },
  { id: 'final-report', label: 'Relatório Final', icon: FileBarChart, section: 'Relatório' },
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
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[60]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-[300px] bg-slate-950 text-slate-400 z-[70] flex flex-col border-r border-slate-800 shadow-2xl"
          >
            {/* Branding */}
            <div className="h-24 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Activity className="w-6 h-6 text-slate-950" />
                </div>
                <span className="text-xl font-black text-white italic uppercase tracking-tighter">
                  Cardio<span className="text-emerald-500">Tools</span>
                </span>
              </div>
              <button 
                onClick={onToggle} 
                className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all active:scale-90"
              >
                <ChevronLeft size={20} />
              </button>
            </div>

            {/* Navegação Agrupada */}
            <nav className="flex-1 py-6 px-4 space-y-6 overflow-y-auto custom-scrollbar">
              {['Geral', 'Paciente', 'Avaliação', 'Relatório'].map((sectionName) => {
                const itemsInSection = MENU_ITEMS.filter(item => item.section === sectionName);
                if (itemsInSection.length === 0) return null;

                return (
                  <div key={sectionName} className="space-y-1">
                    <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/30"></span>
                      {sectionName}
                    </p>
                    
                    {itemsInSection.map((item) => {
                      const isActive = selectedCategory === item.id;
                      const Icon = item.icon;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => { onSelectCategory(item.id); onToggle(); }}
                          className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all group relative ${
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
                          <Icon 
                            size={18} 
                            className={`${isActive ? 'text-emerald-400' : 'text-slate-600 group-hover:text-slate-400'} transition-colors`} 
                          />
                          <span className="text-[13px] font-bold tracking-tight uppercase italic">
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-900/40 border-t border-slate-800 shrink-0">
              <button 
                onClick={handleLogoutClick} 
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all group"
              >
                <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
                <span className="text-[11px] font-black uppercase tracking-widest">Encerrar Sessão</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};