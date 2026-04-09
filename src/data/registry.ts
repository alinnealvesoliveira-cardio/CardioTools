import React from 'react';
import { Calculator } from '../types';

// 1. Importações da pasta raiz de componentes
import { TSL5X } from '../calculators/components/TSL5X';
import { TSL30S } from '../calculators/components/TSL30S';
import { TD2M } from '../calculators/components/TD2M';
import { TSL1M } from '../calculators/components/TSL1M';
import { TC6M } from '../calculators/components/TC6M';
import { VSAQ } from '../calculators/components/VSAQ';
import { TUG } from '../calculators/components/TUG';
import { DASI } from '../calculators/components/DASI';
import { PatientRegistration } from '../calculators/components/PatientRegistration';
import { FinalReport } from '../calculators/components/FinalReport';

// 2. Subpastas específicas
import { HRV } from '../calculators/components/autonomic/HRV';
import { AnginaAlgorithm } from '../calculators/components/diagnosis/AnginaAlgorithm';
import { ClaudicationAlgorithm } from '../calculators/components/diagnosis/ClaudicationAlgorithm';
import { FatigabilityScales } from '../calculators/components/diagnosis/FatigabilityScales';
import { FunctionalDiagnosis } from '../calculators/components/diagnosis/FunctionalDiagnosis';
import { ABI } from '../calculators/components/hemodynamics/ABI';
import { HRR } from '../calculators/components/hemodynamics/HRR';
import { OrthostaticDrop } from '../calculators/components/hemodynamics/OrthostaticDrop';

// AQUI ESTÁ O QUE TINHA SUMIDO:
import { VascularPhysicalExam } from '../calculators/components/vascular/VascularPhysicalExam';

export const CALCULATORS: Calculator[] = [
  {
    id: 'patient-registration',
    name: 'Cadastro / Anamnese Rápida',
    description: 'Dados antropométricos e perfil farmacológico para base de cálculo.',
    category: 'Cadastro',
    component: PatientRegistration
  },
  {
    id: 'hrv',
    name: 'Variabilidade da FC (VFC)',
    description: 'Avaliação do tônus autonômico através do RMSSD.',
    category: 'Avaliação Autonômica',
    component: HRV
  },
  {
    id: 'angina-algorithm',
    name: 'Algoritmo de Angina',
    description: 'Triagem clínica para Doença Arterial Coronariana (DAC).',
    category: 'Sintomas',
    component: AnginaAlgorithm
  },
  {
    id: 'claudication-algorithm',
    name: 'Algoritmo de Claudicação',
    description: 'Triagem clínica para Doença Arterial Periférica (DAP).',
    category: 'Sintomas',
    component: ClaudicationAlgorithm
  },
  {
    id: 'fatigability-scales',
    name: 'Escalas de Fadigabilidade',
    description: 'Avaliação subjetiva do esforço (Borg Modificada).',
    category: 'Avaliação de Sintomas',
    component: FatigabilityScales
  },
  {
    id: 'functional-diagnosis',
    name: 'Diagnóstico Funcional',
    description: 'Classificação baseada na CBDF e funcionalidade.',
    category: 'Diagnóstico',
    component: FunctionalDiagnosis
  },
  {
    id: 'vascular-exam', // REATIVADO
    name: 'Avaliação Vascular Completa',
    description: 'Exame físico, Pulsos, CEAP e Edema.',
    category: 'Vascular',
    component: VascularPhysicalExam
  },
  {
    id: 'abi',
    name: 'Índice Tornozelo-Braquial (ITB)',
    description: 'Ferramenta diagnóstica para Doença Arterial Periférica (DAP).',
    category: 'Vascular',
    component: ABI
  },
  {
    id: 'hrr',
    name: 'Recuperação da FC (HRR)',
    description: 'Avaliação da reativação vagal após o esforço.',
    category: 'Avaliação Autonômica',
    component: HRR
  },
  {
    id: 'orthostatic',
    name: 'Hipotensão Ortostática',
    description: 'Avaliação da resposta pressórica à mudança de decúbito.',
    category: 'Avaliação Autonômica',
    component: OrthostaticDrop
  },
  {
    id: 'tsl30s',
    name: 'Sentar e Levantar 30s',
    category: 'Capacidade Aeróbica',
    component: TSL30S,
    description: 'Resistência de membros inferiores.'
  },
  {
    id: 'tsl5x',
    name: 'Teste de Sentar e Levantar 5x',
    category: 'Capacidade Aeróbica',
    component: TSL5X,
    description: 'Força de membros inferiores.'
  },
  {
    id: 'td2m',
    name: 'Marcha Estacionária 2 min',
    category: 'Capacidade Aeróbica',
    component: TD2M,
    description: 'Teste de resistência funcional.'
  },
  {
    id: 'tsl1m',
    name: 'Sentar e Levantar 1 min',
    category: 'Capacidade Aeróbica',
    component: TSL1M,
    description: 'Capacidade funcional.'
  },
  {
    id: 'tc6m',
    name: 'Caminhada de 6 Minutos',
    category: 'Capacidade Aeróbica',
    component: TC6M,
    description: 'Padrão-ouro submáximo.'
  },
  {
    id: 'vsaq',
    name: 'VSAQ',
    category: 'Capacidade Aeróbica',
    component: VSAQ,
    description: 'Estimativa de METs por atividades.'
  },
  {
    id: 'dasi',
    name: 'DASI Index',
    category: 'Capacidade Aeróbica',
    component: DASI,
    description: 'Estimativa de METs (AHA).'
  },
  {
    id: 'tug',
    name: 'Timed Up and Go (TUG)',
    category: 'Capacidade Aeróbica',
    component: TUG,
    description: 'Mobilidade e risco de queda.'
  },
  {
    id: 'final-report',
    name: 'Relatório Final',
    description: 'Consolidação de todos os dados e interpretação.',
    category: 'Relatório Final',
    component: FinalReport
  }
];