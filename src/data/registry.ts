import { Calculator } from '../types';

// ==========================================
// 1. IMPORTAÇÃO DOS COMPONENTES
// Caminhos ajustados conforme sua árvore de arquivos real
// ==========================================

// --- GRUPO A: Localizados em src/calculators/components/ ---
import { PatientRegistration } from '../calculators/components/PatientRegistration';
import { TC6M } from '../calculators/components/TC6M';
import { TD2M } from '../calculators/components/TD2M';
import { TSL1M } from '../calculators/components/TSL1M';
import { TSL30S } from '../calculators/components/TSL30S';
import { TSL5X } from '../calculators/components/TSL5X';
import { TUG } from '../calculators/components/TUG';
import { VSAQ } from '../calculators/components/VSAQ';
import { DASI } from '../calculators/components/DASI';
import { FinalReport } from '../calculators/components/FinalReport';

// --- GRUPO B: Hemodinâmica (src/calculators/components/hemodynamics/) ---
// Ajustado para o nome da pasta no plural e arquivos corretos
import { ABI } from '../calculators/components/hemodynamics/ABI';
import { HRR } from '../calculators/components/hemodynamics/HRR';
import { OrthostaticDrop } from '../calculators/components/hemodynamics/OrthostaticDrop';

// --- GRUPO C: Vascular (src/calculators/components/vascular/) ---
// Apenas o exame físico está aqui na sua árvore
import { VascularPhysicalExam } from '../calculators/components/vascular/VascularPhysicalExam';

// --- GRUPO D: Especialidades (Subpastas de src/calculators/components/) ---
// HRV, Angina, Claudicação e Fadigabilidade estão em subpastas
import { HRV } from '../calculators/components/autonomic/HRV';
import { AnginaAlgorithm } from '../calculators/components/diagnosis/AnginaAlgorithm';
import { ClaudicationAlgorithm } from '../calculators/components/diagnosis/ClaudicationAlgorithm';
import { FatigabilityScales } from '../calculators/components/diagnosis/Fatigability';

// ==========================================
// 2. REGISTRO DE CALCULADORAS
// ==========================================
export const CALCULATORS: Calculator[] = [
  {
    id: 'patient-registration',
    name: 'Cadastro / Anamnese Rápida',
    description: 'Perfil antropométrico, farmacológico e clínico basal.',
    category: 'anamnese',
    component: PatientRegistration
  },
  {
    id: 'tc6m',
    name: 'Caminhada de 6 Minutos (TC6M)',
    description: 'Avaliação da capacidade aeróbica e tolerância ao esforço.',
    category: 'aerobic',
    component: TC6M
  },
  {
    id: 'td2m',
    name: 'Teste de Degrau / Marcha (2 min)',
    description: 'Alternativa funcional para avaliação cardiovascular.',
    category: 'aerobic',
    component: TD2M
  },
  {
    id: 'tsl-1m',
    name: 'Sentar-Levantar (1 min)',
    description: 'Avaliação da resistência muscular de membros inferiores.',
    category: 'aerobic',
    component: TSL1M
  },
  {
    id: 'tsl-30s',
    name: 'Sentar-Levantar (30 seg)',
    description: 'Teste de força e potência funcional.',
    category: 'aerobic',
    component: TSL30S
  },
  {
    id: 'tsl-5x',
    name: 'Sentar-Levantar (5 vezes)',
    description: 'Avaliação de mobilidade e risco de quedas.',
    category: 'aerobic',
    component: TSL5X
  },
  {
    id: 'tug',
    name: 'Timed Up and Go (TUG)',
    description: 'Equilíbrio dinâmico e agilidade funcional.',
    category: 'aerobic',
    component: TUG
  },
  {
    id: 'dasi',
    name: 'Protocolo DASI',
    description: 'duke activity status index',
    category: 'aerobic',
    component: DASI
  },
  {
    id: 'hrv',
    name: 'Variabilidade da FC (VFC)',
    description: 'Análise do balanço autonômico via RMSSD e SDNN.',
    category: 'autonomic',
    component: HRV
  },
  {
    id: 'orthostatic',
    name: 'Hipotensão Ortostática',
    description: 'Resposta pressórica à mudança de decúbito.',
    category: 'autonomic',
    component: OrthostaticDrop
  },
  {
    id: 'hrr',
    name: 'Recuperação da FC (HRR)',
    description: 'Análise da reativação vagal pós-esforço.',
    category: 'autonomic',
    component: HRR
  },
  {
    id: 'angina-algorithm',
    name: 'Algoritmo de Angina',
    description: 'Triagem e classificação de dor precordial.',
    category: 'symptoms',
    component: AnginaAlgorithm
  },
  {
    id: 'claudication',
    name: 'Algoritmo de Claudicação',
    description: 'Avaliação de dor em membros inferiores.',
    category: 'symptoms',
    component: ClaudicationAlgorithm
  },
  {
    id: 'fatigability',
    name: 'Escalas de Fadigabilidade',
    description: 'Monitoramento de Borg e percepção de esforço.',
    category: 'symptoms',
    component: FatigabilityScales
  },
  {
    id: 'vascular-exam',
    name: 'Exame Físico Vascular',
    description: 'Avaliação de pulsos, edema e sinais tróficos.',
    category: 'vascular',
    component: VascularPhysicalExam
  },
  {
    id: 'abi',
    name: 'Índice Tornozelo-Braquial (ITB)',
    description: 'Rastreio de doença arterial periférica.',
    category: 'vascular',
    component: ABI
  },
  {
    id: 'final-report',
    name: 'Relatório Final',
    description: 'Consolidação de todos os achados clínicos.',
    category: 'final-report',
    component: FinalReport
  }
];