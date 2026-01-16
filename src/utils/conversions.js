export const WEIGHT_UNITS = [
    { value: "g", label: "Gramos (g)" },
    { value: "kg", label: "Kilogramos (kg)" },
    { value: "lb", label: "Libras (lb)" },
    { value: "oz", label: "Onzas (oz)" },
];

export const VOLUME_UNITS = [
    { value: "ml", label: "Mililitros (ml)" },
    { value: "l", label: "Litros (l)" },
    { value: "cup", label: "Tazas (cup)" },
    { value: "tbsp", label: "Cucharadas (tbsp)" },
    { value: "tsp", label: "Cucharaditas (tsp)" },
    { value: "pza", label: "Pieza (pza)" },
];

export const ALL_UNITS = [...WEIGHT_UNITS, ...VOLUME_UNITS];

const CONVERSION_RATES = {
    // Base unit: g
    weight: {
        g: 1,
        kg: 1000,
        lb: 453.592,
        oz: 28.3495,
    },
    // Base unit: ml
    volume: {
        ml: 1,
        l: 1000,
        cup: 240, // Standard metric cup
        tbsp: 15,
        tsp: 5,
        pza: 1, // Special case, no conversion usually
    },
};

export function convertUnit(amount, fromUnit, toUnit) {
    if (fromUnit === toUnit) return amount;

    // Determine type (weight or volume)
    const isWeight = fromUnit in CONVERSION_RATES.weight;
    const isVolume = fromUnit in CONVERSION_RATES.volume;

    // Cross-type conversion (e.g., Kg to Liters) is not supported without density.
    // We'll assume direct 1-1 for simplicity or return null if incompatible types,
    // BUT for a simple app we might just stick to ensuring type consistency in UI.
    // Exception: 'pza' implies piece count, handled separately or as volume/weight depending on context?
    // Actually, let's strictly handle same-type conversions.

    if (isWeight && toUnit in CONVERSION_RATES.weight) {
        const amountInGrams = amount * CONVERSION_RATES.weight[fromUnit];
        return amountInGrams / CONVERSION_RATES.weight[toUnit];
    }

    if (isVolume && toUnit in CONVERSION_RATES.volume) {
        // Treat 'pza' as base 1 if involved, but usually pza to ml doesn't make sense unless tailored.
        if (fromUnit === 'pza' || toUnit === 'pza') return amount; // Cannot convert pza

        const amountInMl = amount * CONVERSION_RATES.volume[fromUnit];
        return amountInMl / CONVERSION_RATES.volume[toUnit];
    }

    // Fallback for incompatible or unknown
    console.warn(`Cannot convert from ${fromUnit} to ${toUnit}`);
    return amount;
}
