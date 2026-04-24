import React from 'react';
import { AlertTriangle, Info, Zap, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Agora o tipo suporta a diferenciação clínica dos BCCs
interface MedicationAlertProps {
  type: 'betablockers' | 'bcc-dhp' | 'bcc-non-dhp' | 'digitalis';
  active: boolean;
}

export const MedicationAlert: React.FC<MedicationAlertProps> = ({ type, active }) => {
  if (!active) return null;

  const alerts = {
    betablockers: {
      title: 'Uso de Betabloqueador Detectado',
      content: 'O cronotropismo cardíaco está farmacologicamente limitado. A FC não é um indicador fidedigno de esforço.',
      instruction: 'Desconsidere FC Máxima (220-idade). Use obrigatoriamente a Escala de Borg.',
      icon: <Zap size={18} />,
      color: 'rose'
    },
    'bcc-dhp': {
      title: 'BCC Dihidropiridínico (ex: Anlodipino)',
      content: 'Potente vasodilatação periférica. Risco elevado de hipotensão pós-exercício e edema de MMII.',
      instruction: 'Monitore PA com rigor. Evite mudanças bruscas de posição após o exercício.',
      icon: <AlertTriangle size={18} />,
      color: 'amber'
    },
    'bcc-non-dhp': {
      title: 'BCC Não-Dihidropiridínico (ex: Diltiazem)',
      content: 'Efeito inotrópico e cronotrópico negativo. Pode mascarar a resposta da FC ao esforço.',
      instruction: 'Trate como Betabloqueador: Use Escala de Borg. Atenção a sinais de bradicardia.',
      icon: <ShieldAlert size={18} />,
      color: 'rose'
    },
    digitalis: {
      title: 'Uso de Digitálicos (Inotrópicos)',
      content: 'Risco de "Efeito Digitálico" (alteração no ECG) e sinais de toxicidade (bradicardia/náuseas).',
      instruction: 'Monitore sinais de toxicidade e bradicardia acentuada durante o esforço.',
      icon: <Info size={18} />,
      color: 'indigo'
    }
  };

  const alert = alerts[type];

  const colors = {
    rose: "bg-rose-50 border-rose-200 text-rose-700 shadow-rose-500/5",
    amber: "bg-amber-50 border-amber-200 text-amber-700 shadow-amber-500/5",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-indigo-500/5"
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`p-5 rounded-[28px] border-2 flex gap-4 mb-6 shadow-xl ${colors[alert.color as keyof typeof colors]}`}
      >
        <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center bg-white border border-current/10 shadow-sm`}>
          {alert.icon}
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Diretriz Clínica</span>
            <div className="h-1 w-1 rounded-full bg-current opacity-30" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Segurança</span>
          </div>
          
          <h4 className="text-sm font-black italic uppercase tracking-tight mb-1">
            {alert.title}
          </h4>
          
          <p className="text-[11px] font-bold leading-tight opacity-90 mb-2">
            {alert.content}
          </p>

          <div className="flex items-center gap-2 bg-white/50 self-start px-3 py-1.5 rounded-xl border border-current/5">
            <span className="text-[10px] font-black uppercase italic">Conduta:</span>
            <span className="text-[10px] font-medium italic">{alert.instruction}</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};