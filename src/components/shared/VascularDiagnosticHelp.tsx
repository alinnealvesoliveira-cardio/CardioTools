import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
      linfatica: 'Não melhora com Elevação'
    },
    {
      sinal: 'Cor da Pele',
      arterial: 'Pálida/Cianótica',
      venosa: 'Escurecida (Dermatite)',
      linfatica: 'Normal ou Espessada'
    },
    {
      sinal: 'Temperatura',
      arterial: 'Fria',
      venosa: 'Quente ou Normal',
      linfatica: 'Normal'
    },
    {
      sinal: 'Dor',
      arterial: 'Melhora no Repouso',
      venosa: 'Melhora com Caminhada',
      linfatica: 'Sensação de Peso'
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-vitality-lime/10 text-vitality-lime rounded-xl">
                <Info className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Ajuda Diagnóstica Vascular</h2>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Diferenciação Clínica</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          <div className="p-6 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Sinal</th>
                  <th className="py-4 px-4 text-xs font-black text-vitality-risk uppercase tracking-widest bg-vitality-risk/5">Arterial (ITB &lt; 0.9)</th>
                  <th className="py-4 px-4 text-xs font-black text-vitality-lime uppercase tracking-widest bg-vitality-lime/5">Venosa (Insuficiência)</th>
                  <th className="py-4 px-4 text-xs font-black text-vitality-graphite uppercase tracking-widest bg-vitality-graphite/5">Linfática (Linfedema)</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 text-sm font-bold text-slate-700">{row.sinal}</td>
                    <td className="py-4 px-4 text-sm text-slate-600 font-medium bg-vitality-risk/5">{row.arterial}</td>
                    <td className="py-4 px-4 text-sm text-slate-600 font-medium bg-vitality-lime/5">{row.venosa}</td>
                    <td className="py-4 px-4 text-sm text-slate-600 font-medium bg-vitality-graphite/5">{row.linfatica}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-vitality-risk flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong>Nota Clínica:</strong> Esta tabela é um guia simplificado. O diagnóstico definitivo deve considerar a história clínica completa, 
              o exame físico detalhado e exames complementares (Doppler, ITB, etc.). O sinal de Stemmer positivo é altamente sugestivo de linfedema.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
