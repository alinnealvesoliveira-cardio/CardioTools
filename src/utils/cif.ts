/**
 * Classificação da gravidade da limitação funcional baseada nos qualificadores da CIF (OMS, 2001).
 * Traduz a performance alcançada em magnitude de deficiência.
 */

export interface CIFClassification {
  qualifier: number;
  severity: string;
  deficiencyRange: string;
  performanceRange: string;
  color: string;
  bgClass: string;
}

export const getCIFClassification = (observed: number, predicted: number): CIFClassification | null => {
  if (!observed || !predicted || predicted <= 0) return null;

  // Calcula a performance em relação ao esperado
  const performancePct = (observed / predicted) * 100;
  
  // A CIF foca na DEFICIÊNCIA (o que falta para 100%)
  // Ex: Se fez 80% do previsto, a deficiência é de 20% (Qualificador 1)

  if (performancePct >= 96) {
    return {
      qualifier: 0,
      severity: "Nenhuma Deficiência",
      deficiencyRange: "0 - 4%",
      performanceRange: "≥ 96%",
      color: "#10b981", // Emerald
      bgClass: "bg-emerald-50 text-emerald-700 border-emerald-100"
    };
  } 
  
  if (performancePct >= 76) {
    return {
      qualifier: 1,
      severity: "Deficiência Leve",
      deficiencyRange: "5 - 24%",
      performanceRange: "76 - 95%",
      color: "#0ea5e9", // Sky/Blue
      bgClass: "bg-sky-50 text-sky-700 border-sky-100"
    };
  } 
  
  if (performancePct >= 51) {
    return {
      qualifier: 2,
      severity: "Deficiência Moderada",
      deficiencyRange: "25 - 49%",
      performanceRange: "51 - 75%",
      color: "#f59e0b", // Amber
      bgClass: "bg-amber-50 text-amber-700 border-amber-100"
    };
  } 
  
  if (performancePct >= 5) {
    return {
      qualifier: 3,
      severity: "Deficiência Grave",
      deficiencyRange: "50 - 95%",
      performanceRange: "5 - 50%",
      color: "#f97316", // Orange
      bgClass: "bg-orange-50 text-orange-700 border-orange-100"
    };
  } 

  return {
    qualifier: 4,
    severity: "Deficiência Completa",
    deficiencyRange: "96 - 100%",
    performanceRange: "< 5%",
    color: "#ef4444", // Red
    bgClass: "bg-red-50 text-red-700 border-red-100"
  };
};