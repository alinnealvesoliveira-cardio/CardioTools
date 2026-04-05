/**
 * Classificação da gravidade da limitação funcional baseada nos qualificadores da CIF (OMS, 2001).
 */

export interface CIFClassification {
  qualifier: number;
  severity: string;
  deficiencyRange: string;
  color: string;
}

export const getCIFClassification = (observed: number, predicted: number): CIFClassification | null => {
  if (!observed || !predicted || predicted <= 0) return null;

  const percentageOfPredicted = (observed / predicted) * 100;

  if (percentageOfPredicted > 95) {
    return {
      qualifier: 0,
      severity: "Nenhuma",
      deficiencyRange: "0 - 4%",
      color: "emerald"
    };
  } else if (percentageOfPredicted >= 76) {
    return {
      qualifier: 1,
      severity: "Leve",
      deficiencyRange: "5 - 24%",
      color: "blue"
    };
  } else if (percentageOfPredicted >= 51) {
    return {
      qualifier: 2,
      severity: "Moderada",
      deficiencyRange: "25 - 49%",
      color: "amber"
    };
  } else if (percentageOfPredicted >= 5) {
    return {
      qualifier: 3,
      severity: "Grave",
      deficiencyRange: "50 - 95%",
      color: "orange"
    };
  } else {
    return {
      qualifier: 4,
      severity: "Completa",
      deficiencyRange: "96 - 100%",
      color: "red"
    };
  }
};
