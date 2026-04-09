import React from 'react';
import { Calculator } from '../types';

// 1. Importações da pasta raiz de componentes (src/calculators/components/)
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

// 2. Subpasta: Autonomic
import { HRV } from '../calculators/components/autonomic/HRV';

// 3. Subpasta: Diagnosis
import { AnginaAlgorithm } from '../calculators/components/diagnosis/AnginaAlgorithm';
import { ClaudicationAlgorithm } from '../calculators/components/diagnosis/ClaudicationAlgorithm';
import { FatigabilityScales } from '../calculators/components/diagnosis/FatigabilityScales';

// 4. Subpasta: Hemodynamics
import { ABI } from '../calculators/components/hemodynamics/ABI';
import { HRR } from '../calculators/components/hemodynamics/HRR';
import { OrthostaticDrop } from '../calculators/components/hemodynamics/OrthostaticDrop';

// 5. Subpasta: Vascular (Verifique se o arquivo interno se chama VascularAssessment ou VascularPhysicalExam)
// Pela imagem, a pasta existe, mas o componente principal costuma ser o Assessment
import { FunctionalDiagnosis } from '../calculators/components/diagnosis/FunctionalDiagnosis';

export const CALCULATORS: Calculator[] = [
  {
    id: 'patient-registration',
    name: 'Cadastro / Anamnese Rápida',
    description: 'Dados antropométricos e perfil farmacológico para base de cálculo.',
    category: 'Cadastro',
    component: PatientRegistration
  },
  {
    id: 'final-report',
    name: 'Relatório Final',
    description: 'Consolidação de todos os dados coletados e interpretação clínica.',
    category: 'Relatório Final',
    component: FinalReport
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
    description: 'Avaliação subjetiva do esforço e sintomas limitantes (Borg Modificada).',
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
    id: 'abi',
    name: 'Índice Tornozelo-Braquial (ITB)',
    description: 'Ferramenta diagnóstica para Doença Arterial Periférica (DAP).',
    category: 'Vascular',
    component: ABI
  },
  {
    id: 'hrr',
    name: 'Recuperação da FC (HRR)',
    description: 'Avaliação da reativação vagal após o esforço (1º minuto).',
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
    description: 'Avaliação de força e resistência em idosos (Rikli & Jones).',
    category: 'Capacidade Aeróbica',
    component: TSL30S
  },
  {
    id: 'tsl5x',
    name: 'Teste de Sentar e Levantar 5x',
    description: 'Avaliação de força de membros inferiores e risco de queda.',
    category: 'Capacidade Aeróbica',
    component: TSL5X
  },
  {
    id: 'td2m',
    name: 'Marcha Estacionária 2 min',
    description: 'Teste de resistência aeróbica funcional.',
    category: 'Capacidade Aeróbica',
    component: TD2M
  },
  {
    id: 'tsl1m',
    name: 'Sentar e Levantar 1 min',
    description: 'Resistência de membros inferiores e capacidade funcional.',
    category: 'Capacidade Aeróbica',
    component: TSL1M
  },
  {
    id: 'tc6m',
    name: 'Caminhada de 6 Minutos',
    description: 'Padrão-ouro para avaliação da capacidade funcional submáxima.',
    category: 'Capacidade Aeróbica',
    component: TC6M
  },
  {
    id: 'vsaq',
    name: 'VSAQ',
    description: 'Questionário de atividades específicas para estimativa de METs.',
    category: 'Capacidade Aeróbica',
    component: VSAQ
  },
  {
    id: 'dasi',
    name: 'DASI Index',
    description: 'Questionário Duke para estimativa robusta de METs (Recomendado AHA).',
    category: 'Capacidade Aeróbica',
    component: DASI
  },
  {
    id: 'tug',
    name: 'Timed Up and Go (TUG)',
    description: 'Avaliação de mobilidade funcional, equilíbrio dinâmico e risco de queda.',
    category: 'Capacidade Aeróbica',
    component: TUG
  }
];