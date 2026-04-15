import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, AlertCircle } from 'lucide-react';

interface VascularDiagnosticHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VascularDiagnosticHelp: React.FC<VascularDiagnosticHelpProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const tableData = [
    {
      sinal: 'Pulsos',
      arterial: 'Diminuídos ou Ausentes',
      venosa: 'Normais',
      linfatica: 'Normais'
    },
    {
      sinal: 'Edema',
      arterial: 'Ausente ou Leve',
      venosa: 'Melhora com Elevação',
      linfatica: 'Fixo (Não melhora)'
    },
    {
      sinal: 'Cor da Pele',
      arterial: 'Pálida / Cianótica',
      venosa: 'Ocre / Dermatite',
      linfatica: 'Espessada / Verrucosa'
    },
    {
      sinal: 'Temperatura',
      arterial: 'Fria (Isquemia)',
      venosa: 'Quente ou Normal',
      linfatica: 'Normal'
    },
    {
      sinal: 'Dor',
      arterial: 'Melhora no Repouso',
      venosa: 'Melhora em Movimento',
      linfatica: 'Peso / Desconforto'
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Overlay com Blur Profundo */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-5xl overflow-hidden border border-white/20"
        >
          {/* Header Técnico */}
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-400 shadow-lg">
                <Info size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter leading-none">
                  Diagnóstico Diferencial <span className="text-emerald-500">Vascular</span>
                </h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                  Semiologia Clínica Avançada
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all text-slate-400 active:scale-90"
            >
              <X size={24} />
            </button>
          </div>

          {/* Tabela de Dados */}
          <div className="p-8 overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">Parâmetro</th>
                  <th className="py-4 px-6 text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] text-center bg-rose-50/50 rounded-t-2xl">Arterial</th>
                  <th className="py-4 px-6 text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] text-center bg-emerald-50/50 rounded-t-2xl">Venosa</th>
                  <th className="py-4 px-6 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] text-center bg-indigo-50/50 rounded-t-2xl">Linfática</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, idx) => (
                  <tr key={idx} className="group">
                    <td className="py-5 px-6 text-xs font-black text-slate-800 uppercase tracking-tight border-b border-slate-50">
                      {row.sinal}
                    </td>
                    <td className="py-5 px-6 text-xs font-bold text-slate-600 text-center bg-rose-50/20 border-b border-white">
                      {row.arterial}
                    </td>
                    <td className="py-5 px-6 text-xs font-bold text-slate-600 text-center bg-emerald-50/20 border-b border-white">
                      {row.venosa}
                    </td>
                    <td className="py-5 px-6 text-xs font-bold text-slate-600 text-center bg-indigo-50/20 border-b border-white">
                      {row.linfatica}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Rodapé Informativo */}
          <div className="p-8 bg-slate-900 flex items-start gap-4">
            <div className="p-2 bg-rose-500/20 text-rose-500 rounded-lg shrink-0">
              <AlertCircle size={20} />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-white uppercase tracking-widest">Aviso de Conduta Profissional</p>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                Esta tabela é um suporte à decisão clínica baseada em evidências. O diagnóstico final de insuficiências vasculares 
                deve integrar o <strong>Índice Tornozelo-Braquial (ITB)</strong>, o <strong>Sinal de Stemmer</strong> e, se necessário, 
                mapeamento por Duplex-Scan.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};