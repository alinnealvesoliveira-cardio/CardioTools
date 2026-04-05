import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Lock, User, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Verificação básica da URL do Supabase para evitar erro de JSON input
      if (!isSupabaseConfigured) {
        throw new Error('Configuração pendente: Por favor, insira a sua Project URL real no arquivo src/lib/supabase.ts');
      }

      if (isSignUp) {
        if (!consent) {
          throw new Error('Você deve aceitar o Termo de Consentimento da Pesquisa (UESB) para continuar.');
        }
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              consent_uesb: true,
            }
          }
        });
        
        if (signUpError) throw signUpError;

        // Sincronização com a tabela 'profiles'
        if (signUpData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: signUpData.user.id, 
                full_name: fullName, 
                aceitou_termos: true 
              }
            ]);
          
          if (profileError) {
            console.error('Erro ao criar perfil:', profileError);
            // Não travamos o fluxo aqui pois o usuário já foi criado no Auth
          }
        }
        
        setSuccess('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar.');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 lg:p-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-vitality-lime flex items-center justify-center mx-auto mb-4 shadow-lg shadow-vitality-lime/20">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Cardio<span className="text-emerald-500">Tools</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            {isSignUp ? 'Crie sua conta profissional' : 'Acesso Restrito ao Hospital'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimatePresence mode="wait">
            {isSignUp && (
              <motion.div 
                key="signup-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-5 overflow-hidden"
              >
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Nome Completo</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800 font-medium"
                      required={isSignUp}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">E-mail</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800 font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Senha</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800 font-medium"
                required
              />
            </div>
          </div>

          {isSignUp && (
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <input 
                type="checkbox" 
                id="consent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                required
              />
              <label htmlFor="consent" className="text-xs text-slate-600 leading-relaxed font-medium">
                Aceito o <strong>Termo de Consentimento da Pesquisa (UESB)</strong>. 
                Compreendo que meus dados de uso serão utilizados anonimamente para fins acadêmicos.
              </label>
            </div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 text-sm font-medium"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-sm font-medium"
            >
              <CheckCircle2 className="w-4 h-4" />
              {success}
            </motion.div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-vitality-lime hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-vitality-lime/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processando...' : isSignUp ? 'Criar Minha Conta' : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setSuccess('');
            }}
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Cadastre-se'}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 font-medium">
            © 2026 CardioTools - Hospitalar
          </p>
        </div>
      </motion.div>
    </div>
  );
};
