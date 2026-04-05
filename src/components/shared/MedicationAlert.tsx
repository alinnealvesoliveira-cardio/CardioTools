import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface MedicationAlertProps {
  type: 'betablockers' | 'bcc' | 'digitalis';
  active: boolean;
}

export const MedicationAlert: React.FC<MedicationAlertProps> = ({ type, active }) => {
  if (!active) return null;

  const alerts = {
    betablockers: {
      title: 'Paciente em uso de Betabloqueador',
      content: 'O cronotropismo cardíaco está farmacologicamente limitado. No esforço: Desconsidere a FC Máxima teórica (220-idade). Utilize exclusivamente a Escala de Borg para guiar a intensidade. No HRR (Recuperação): O índice de recuperação pode estar subestimado. Avalie a tolerância clínica e a estabilidade da PA em conjunto.',
      color: 'risk'
    },
    bcc: {
      title: 'Paciente em uso de BCC',
      content: 'Paciente em uso de BCC (Ex: Anlodipino, Nifedipino, Verapamil, Diltiazem). Vascular: Podem causar edema periférico (vasodilatação pré-capilar). Diferencie de insuficiência venosa ou cardíaca. Hemodinâmica: Verapamil e Diltiazem têm efeito cronotrópico negativo (reduzem a FC). Anlodipino pode causar taquicardia reflexa. Ortostatismo: Risco aumentado de hipotensão ortostática devido à vasodilatação.',
      color: 'risk'
    },
    digitalis: {
      title: 'Paciente em uso de Digitálicos',
      content: 'Risco de "Efeito Digitálico" no ECG (depressão do segmento ST em colher). Fique atento a sinais de intoxicação (náuseas, visão turva e bradicardia acentuada) durante os testes funcionais.',
      color: 'risk'
    }
  };

  const alert = alerts[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl border flex gap-3 mb-4 bg-vitality-risk/10 border-vitality-risk/20 text-vitality-risk"
    >
      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
      <div className="text-[11px] leading-relaxed">
        <span className="font-bold block mb-1">⚠️ Alerta Clínico (CardioTools):</span>
        {alert.content}
      </div>
    </motion.div>
  );
};
