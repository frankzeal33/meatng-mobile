export const toGrams = (weight: number, unit: "kg" | "g") => {
  return unit === "kg" ? weight * 1000 : weight;
};

export const formatWeight = (g: number) => {
  if (g >= 1000) {
    const kg = g / 1000;
    return Number.isInteger(kg) ? `${kg}kg` : `${kg.toFixed(1)}kg`;
  }
  return `${g}g`;
};

export const getFrequencyWeeks = (frequencyId: string): number => {
  switch (frequencyId) {
    case "weekly":
      return 1;
    case "bi-weekly":
      return 2;
    case "monthly":
      return 4;
    default:
      return 0;
  }
};

export const getFrequencyWeeksString = (weeks: number): string => {
  switch (weeks) {
    case 1:
      return "weekly";
    case 2:
      return "bi-weekly";
    case 4:
      return "monthly";
    default:
      return "unknown";
  }
};