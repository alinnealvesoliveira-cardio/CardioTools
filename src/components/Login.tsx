import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Lock, User, Mail, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

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
      if (!isSupabaseConfigured) {
        throw new Error('Configuração pendente: Insira a Project URL no arquivo supabase.ts');
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

        if (signUpData.user) {
          await supabase.from('profiles').insert([
            { 
              id: signUpData.user.id, 
              full_name: fullName, 
              aceitou_termos: true 
            }
          ]);
        }
        
        setSuccess('Cadastro realizado! Verifique seu e-mail para confirmar o acesso.');
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-[440px] w-full bg-white rounded-[48px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-slate-100 p-10 lg:p-12 relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-[28px] bg-slate-900 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/20 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Activity className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
            Cardio<span className="text-emerald-500">Tools</span>
          </h1>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="h-[1px] w-4 bg-slate-200" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              {isSignUp ? 'Professional Registration' : 'Clinical Access Only'}
            </p>
            <span className="h-[1px] w-4 bg-slate-200" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {isSignUp && (
              <motion.div 
                key="signup-fields"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nome Completo"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-4 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 ring-emerald-500/5 transition-all text-sm font-bold placeholder:text-slate-300"
                    required={isSignUp}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail profissional"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-4 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 ring-emerald-500/5 transition-all text-sm font-bold placeholder:text-slate-300"
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha de acesso"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-4 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 ring-emerald-500/5 transition-all text-sm font-bold placeholder:text-slate-300"
              required
            />
          </div>

          {isSignUp && (
            <div className="p-5 bg-slate-50 rounded-[24px] border border-slate-100 flex gap-4 mt-2">
              <input 
                type="checkbox" 
                id="consent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 w-5 h-5 rounded-lg border-slate-200 text-emerald-500 focus:ring-0 transition-all cursor-pointer"
                required
              />
              <label htmlFor="consent" className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-tight">
                Eu aceito o <span className="text-emerald-600">Termo de Consentimento da UESB</span>. Meus dados serão usados para pesquisa acadêmica anonimizada.
              </label>
            </div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-3 text-rose-600 bg-rose-50 p-4 rounded-2xl border border-rose-100 text-[11px] font-black uppercase tracking-wider"
            >
              <AlertCircle size={16} /> {error}
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-[11px] font-black uppercase tracking-wider"
            >
              <CheckCircle2 size={16} /> {success}
            </motion.div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black italic uppercase tracking-[0.15em] py-5 rounded-2xl shadow-2xl shadow-slate-900/20 transition-all active:scale-[0.97] disabled:opacity-50 text-xs flex items-center justify-center gap-3"
          >
            {loading ? 'Sincronizando...' : (
              <>
                {isSignUp ? 'Finalizar Cadastro' : 'Iniciar Sessão Clínica'}
                <ShieldCheck size={18} className="text-emerald-400" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setSuccess('');
            }}
            className="text-[10px] font-black text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-[0.2em]"
          >
            {isSignUp ? 'Já possui credenciais? Entrar' : 'Solicitar acesso profissional'}
          </button>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-50 text-center">
          <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.4em]">
            © 2026 CardioTools — UESB Research Lab
          </p>
        </div>
      </motion.div>
    </div>
  );
};