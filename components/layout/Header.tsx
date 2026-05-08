import React from 'react';
import { Search, Menu, Bell, User, LogOut, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { logout } = useAuth();

  const handleLogoutClick = async () => {
    try {
      // Limpeza profunda de resíduos de sessão
      localStorage.clear();
      sessionStorage.clear();
      await logout(); 
      window.location.href = '/login';
    } catch (error) {
      console.error("Erro crítico ao sair:", error);
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  return (
    <header className="h-20 border-b border-slate-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50 px-6 flex items-center justify-between">
      <div className="flex items-center gap-6">
        {/* Lado Esquerdo: Menu e Logo */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="p-2.5 hover:bg-slate-100 rounded-xl transition-all active:scale-90"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6 text-slate-700" />
          </button>
          
          <div className="flex items-center gap-2.5 group cursor-default">
            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/10 group-hover:rotate-6 transition-transform duration-300">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">
                Cardio<span className="text-emerald-500">Tools</span>
              </span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mt-1">
                Clinical Engine
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Busca Inteligente */}
        <div className="hidden md:flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl w-64 lg:w-96 border border-slate-100 focus-within:border-emerald-500 focus-within:bg-white focus-within:shadow-xl focus-within:shadow-emerald-500/5 transition-all duration-300">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar escala, teste ou paciente..." 
            className="bg-transparent border-none outline-none text-sm w-full text-slate-700 font-medium placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Lado Direito: Ações */}
      <div className="flex items-center gap-3">
        {/* Notificações */}
        <button className="p-2.5 hover:bg-slate-50 rounded-xl relative group transition-colors">
          <Bell className="w-5 h-5 text-slate-500 group-hover:text-emerald-600 transition-colors" />
          <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
        </button>

        <div className="h-8 w-[1px] bg-slate-100 mx-1 hidden sm:block" />

        {/* Logout */}
        <button 
          onClick={handleLogoutClick}
          className="flex items-center gap-2 px-3 py-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 transition-all group"
          title="Sair do Sistema"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest">Sair</span>
        </button>

        {/* Perfil do Usuário */}
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-emerald-400 border border-slate-700 shadow-md cursor-pointer hover:scale-105 hover:border-emerald-500 transition-all">
          <User className="w-5 h-5" />
        </div>
      </div>
    </header>
  );
};