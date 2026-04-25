import { Calculator } from '../types';

// ==========================================
// 1. IMPORTAÇÃO DOS COMPONENTES
// ==========================================
import { PatientRegistration } from '../calculators/components/PatientRegistration';
// Nota: Quando criar o componente de Anamnese, substitua o placeholder abaixo
// import { Anamnese } from '../calculators/components/Anamnese'; 

import { TC6M } from '../calculators/components/TC6M';
import { TD2M } from '../calculators/components/TD2M';
import { TSL1M } from '../calculators/components/TSL1M';
import { TSL30S } from '../calculators/components/TSL30S';
import { TSL5X } from '../calculators/components/TSL5X';
import { TUG } from '../calculators/components/TUG';
import { DASI } from '../calculators/components/DASI';
import { FinalReport } from '../calculators/components/FinalReport';

import { ABI } from '../calculators/components/hemodynamics/ABI';
import { HRR } from '../calculators/components/hemodynamics/HRR';
import { OrthostaticDrop } from '../calculators/components/hemodynamics/OrthostaticDrop';

import { VascularPhysicalExam } from '../calculators/components/vascular/VascularPhysicalExam';
import { HRV } from '../calculators/components/autonomic/HRV';
import { AnginaAlgorithm } from '../calculators/components/diagnosis/AnginaAlgorithm';
import { ClaudicationAlgorithm } from '../calculators/components/diagnosis/ClaudicationAlgorithm';
import { FatigabilityScales } from '../calculators/components/diagnosis/Fatigability';

// ==========================================
// 2. REGISTRO DE CALCULADORAS
// ==========================================
export const CALCULATORS: Calculator[] = [
  // --- PASSO 1: CADASTRO ---
  {
    id: 'patient-registration',
    name: 'Cadastro Inicial',
    description: 'Perfil antropométrico e farmacológico.',
    category: 'cadastro',
    component: PatientRegistration
  },

  // --- PASSO 2: ANAMNESE ---
  {
    id: 'anamnese-main',
    name: 'Anamnese Clínica',
    description: 'Histórico médico detalhado.',
    category: 'anamnese',
    component: PatientRegistration // Substitua por 'Anamnese' quando criar o arquivo
  },

  // --- PASSO 3: AUTONÔMICA ---
  {
    id: 'orthostatic',
    name: 'Hipotensão Ortostática (Delta PA)',
    description: 'Avaliação pressórica à mudança de decúbito.',
    category: 'autonomic',
    component: OrthostaticDrop
  },
  {
    id: 'hrv',
    name: 'Variabilidade da FC',
    description: 'Análise do balanço autonômico.',
    category: 'autonomic',
    component: HRV
  },

  // --- PASSO 4: AERÓBICA ---
  { id: 'tc6m', name: 'TC6M', description: 'Capacidade aeróbica.', category: 'aerobic', component: TC6M },
  { id: 'td2m', name: 'Teste de Degrau', description: 'Avaliação funcional.', category: 'aerobic', component: TD2M },
  { id: 'tsl-1m', name: 'Sentar-Levantar (1m)', description: 'Resistência MI.', category: 'aerobic', component: TSL1M },
  { id: 'tsl-30s', name: 'Sentar-Levantar (30s)', description: 'Força funcional.', category: 'aerobic', component: TSL30S },
  { id: 'tsl-5x', name: 'Sentar-Levantar (5x)', description: 'Risco de quedas.', category: 'aerobic', component: TSL5X },
  { id: 'tug', name: 'Timed Up and Go', description: 'Equilíbrio dinâmico.', category: 'aerobic', component: TUG },
  { id: 'dasi', name: 'Protocolo DASI', description: 'Status de atividade.', category: 'aerobic', component: DASI },

  // --- PASSO 5: VASCULAR ---
  { id: 'vascular-exam', name: 'Exame Físico Vascular', description: 'Pulsos e sinais tróficos.', category: 'vascular', component: VascularPhysicalExam },
  { id: 'abi', name: 'Índice Tornozelo-Braquial', description: 'Rastreio DAP.', category: 'vascular', component: ABI },

  // --- PASSO 6: FATIGABILIDADE E SINTOMAS ---
  { id: 'angina-algorithm', name: 'Algoritmo de Angina', description: 'Triagem precordial.', category: 'fatigability', component: AnginaAlgorithm },
  { id: 'claudication', name: 'Algoritmo de Claudicação', description: 'Dor em membros.', category: 'fatigability', component: ClaudicationAlgorithm },
  { id: 'fatigability', name: 'Escalas de Fadigabilidade', description: 'Percepção de esforço.', category: 'fatigability', component: FatigabilityScales },

  // --- PASSO 7: RESPOSTA DA FC ---
  {
    id: 'hrr',
    name: 'Recuperação da FC (HRR)',
    description: 'Análise da reativação vagal.',
    category: 'hr-response',
    component: HRR
  },

  // --- PASSO 8: RELATÓRIO ---
  {
    id: 'final-report',
    name: 'Relatório Final',
    description: 'Consolidação de achados.',
    category: 'final-report',
    component: FinalReport
  }
];