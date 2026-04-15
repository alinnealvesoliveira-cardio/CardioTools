import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca sessão inicial de forma assíncrona
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Erro ao recuperar sessão:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listener em tempo real para mudanças de estado (login/logout/token expired)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Erro ao encerrar sessão:", error);
    } finally {
      setLoading(false);
    }
  };

  // useMemo evita que o app inteiro re-renderize sem necessidade
  const value = useMemo(() => ({
    isAuthenticated: !!user,
    user,
    loading,
    logout
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {/* Ocultamos os filhos apenas no carregamento inicial 
          para garantir que o App saiba quem é o usuário antes de montar as telas 
      */}
      {!loading ? children : (
        <div className="h-screen w-screen bg-slate-50 flex items-center justify-center">
           <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
                Autenticando CardioTools...
              </p>
           </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};