import { Calculator } from '../types';
import { TSL5X } from '../calculators/components/TSL5X';
import { TSL30S } from '../calculators/components/TSL30S';
import { TD2M } from '../calculators/components/TD2M';
import { TSL1M } from '../calculators/components/TSL1M';
import { TC6M } from '../calculators/components/TC6M';
import { VSAQ } from '../calculators/components/VSAQ';
import { DASI } from '../calculators/components/DASI';
import { TUG } from '../calculators/components/TUG';
import { HRR } from '../calculators/components/hemodynamics/HRR';
import { ABI } from '../calculators/components/hemodynamics/ABI';
import { OrthostaticDrop } from '../calculators/components/hemodynamics/OrthostaticDrop';
import { VascularPhysicalExam } from '../calculators/components/vascular/VascularPhysicalExam';
import { AnginaAlgorithm } from '../calculators/components/diagnosis/AnginaAlgorithm';
import { ClaudicationAlgorithm } from '../calculators/components/diagnosis/ClaudicationAlgorithm';
import { FatigabilityScales } from '../calculators/components/diagnosis/FatigabilityScales';
import { HRV } from '../calculators/components/autonomic/HRV';
import { PatientRegistration } from '../calculators/components/PatientRegistration';
import { FinalReport } from '../calculators/components/FinalReport';

export const CALCULATORS: Calculator[] = [
  {
    id: 'patient-registration',
    name: 'Cadastro / Anamnese Rápida',
    description: 'Dados antropométricos e perfil farmacológico para base de cálculo.',
    category: 'Cadastro',
    component: PatientRegistration as React.ComponentType<any>,
    reference: 'CardioTools - Diretrizes de Reabilitação Cardiovascular.'
  },
  {
    id: 'final-report',
    name: 'Relatório Final',
    description: 'Consolidação de todos os dados coletados e interpretação clínica.',
    category: 'Relatório Final',
    component: FinalReport as React.ComponentType<any>,
    reference: 'CardioTools - Consolidação de Dados.'
  },
  {
    id: 'hrv',
    name: 'Variabilidade da FC (VFC)',
    description: 'Avaliação do tônus autonômico através do RMSSD.',
    category: 'Avaliação Autonômica',
    component: HRV as React.ComponentType<any>,
    reference: 'Shaffer F, Ginsberg JP. Front Public Health. 2017.'
  },
  {
    id: 'angina-algorithm',
    name: 'Algoritmo de Angina',
    description: 'Triagem clínica para Doença Arterial Coronariana (DAC).',
    category: 'Sintomas',
    component: AnginaAlgorithm as React.ComponentType<any>,
    reference: 'Diamond GA. Circulation. 1983.'
  },
  {
    id: 'claudication-algorithm',
    name: 'Algoritmo de Claudicação',
    description: 'Triagem clínica para Doença Arterial Periférica (DAP).',
    category: 'Sintomas',
    component: ClaudicationAlgorithm as React.ComponentType<any>,
    reference: 'Edinburgh Claudication Questionnaire.'
  },
  {
    id: 'fatigability-scales',
    name: 'Escalas de Fadigabilidade',
    description: 'Avaliação subjetiva do esforço e sintomas limitantes (Borg Modificada).',
    category: 'Avaliação de Sintomas',
    component: FatigabilityScales as React.ComponentType<any>,
    reference: 'Borg GA. Psychophysical bases of perceived exertion. Med Sci Sports Exerc. 1982.'
  },
  {
    id: 'vascular-exam',
    name: 'Exame Físico Vascular',
    description: 'Avaliação de pulsos, temperatura, CEAP, Godet e sinal de Stemmer.',
    category: 'Vascular',
    component: VascularPhysicalExam as React.ComponentType<any>,
    reference: 'Bates - Propedêutica Médica.'
  },
  {
    id: 'abi',
    name: 'Índice Tornozelo-Braquial (ITB)',
    description: 'Ferramenta diagnóstica para Doença Arterial Periférica (DAP).',
    category: 'Vascular',
    component: ABI as React.ComponentType<any>,
    reference: 'Aboyans V, et al. Eur Heart J. 2018.'
  },
  {
    id: 'hrr',
    name: 'Recuperação da FC (HRR)',
    description: 'Avaliação da reativação vagal após o esforço (1º minuto).',
    category: 'Avaliação Autonômica',
    component: HRR as React.ComponentType<any>,
    reference: 'Cole CR, et al. N Engl J Med. 1999.'
  },
  {
    id: 'orthostatic',
    name: 'Hipotensão Ortostática',
    description: 'Avaliação da resposta pressórica à mudança de decúbito.',
    category: 'Avaliação Autonômica',
    component: OrthostaticDrop as React.ComponentType<any>,
    reference: 'Freeman R, et al. Clin Auton Res. 2011.'
  },
  {
    id: 'tsl30s',
    name: 'Sentar e Levantar 30s',
    description: 'Avaliação de força e resistência em idosos (Rikli & Jones).',
    category: 'Capacidade Aeróbica',
    component: TSL30S as React.ComponentType<any>,
    reference: 'Rikli RE, Jones CJ. Senior Fitness Test Manual. 2013.'
  },
  {
    id: 'tsl5x',
    name: 'Teste de Sentar e Levantar 5x',
    description: 'Avaliação de força de membros inferiores e risco de queda.',
    category: 'Capacidade Aeróbica',
    component: TSL5X as React.ComponentType<any>,
    reference: 'Bohannon RW. Arch Phys Med Rehabil. 2006.'
  },
  {
    id: 'td2m',
    name: 'Marcha Estacionária 2 min',
    description: 'Teste de resistência aeróbica funcional.',
    category: 'Capacidade Aeróbica',
    component: TD2M as React.ComponentType<any>,
    reference: 'Rikli RE, Jones CJ. Senior Fitness Test Manual. 2001.'
  },
  {
    id: 'tsl1m',
    name: 'Sentar e Levantar 1 min',
    description: 'Resistência de membros inferiores e capacidade funcional.',
    category: 'Capacidade Aeróbica',
    component: TSL1M as React.ComponentType<any>,
    reference: 'Strassmann A, et al. PLoS One. 2013.'
  },
  {
    id: 'tc6m',
    name: 'Caminhada de 6 Minutos',
    description: 'Padrão-ouro para avaliação da capacidade funcional submáxima.',
    category: 'Capacidade Aeróbica',
    component: TC6M as React.ComponentType<any>,
    reference: 'ATS Statement. Am J Respir Crit Care Med. 2002.'
  },
  {
    id: 'vsaq',
    name: 'VSAQ',
    description: 'Questionário de atividades específicas para estimativa de METs.',
    category: 'Capacidade Aeróbica',
    component: VSAQ as React.ComponentType<any>,
    reference: 'Myers J, et al. J Cardiopulm Rehabil. 1994.'
  },
  {
    id: 'dasi',
    name: 'DASI Index',
    description: 'Questionário Duke para estimativa robusta de METs (Recomendado AHA).',
    category: 'Capacidade Aeróbica',
    component: DASI as React.ComponentType<any>,
    reference: 'Hlatky MA, et al. Am J Cardiol. 1989.'
  },
  {
    id: 'tug',
    name: 'Timed Up and Go (TUG)',
    description: 'Avaliação de mobilidade funcional, equilíbrio dinâmico e risco de queda.',
    category: 'Capacidade Aeróbica',
    component: TUG as React.ComponentType<any>,
    reference: 'Podsiadlo D, Richardson S. J Am Geriatr Soc. 1991; Furlanetto KC, et al. Arch Phys Med Rehabil. 2022; Kamiya K, et al. J Card Fail. 2016 (https://doi.org/10.1016/j.cardfail.2015.09.018).'
  }
];