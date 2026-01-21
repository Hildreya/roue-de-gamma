/**
 * Module de calcul forgemagie/brisage
 * Implémente les formules du document de référence
 */

import { RUNES_DATA, EFFECT_TO_RUNE } from './runes.js';

/**
 * Récupère les prix des runes depuis le localStorage
 * @returns {Object} - Les prix des runes (clé: runeKey, valeur: prix en kamas)
 */
function getRunePrices() {
    const stored = localStorage.getItem('runePrices');
    if (stored) {
        return JSON.parse(stored);
    }
    // Prix par défaut (à 0 si non configurés)
    const defaultPrices = {};
    for (const runeKey of Object.keys(RUNES_DATA)) {
        defaultPrices[runeKey] = 0;
    }
    return defaultPrices;
}

/**
 * Sauvegarde les prix des runes dans le localStorage
 * @param {Object} prices - Les prix des runes
 */
function saveRunePrices(prices) {
    localStorage.setItem('runePrices', JSON.stringify(prices));
}

/**
 * Calcule le ratio d'une rune (prix / densité)
 * @param {string} runeKey - La clé de la rune
 * @param {Object} prices - Les prix des runes
 * @returns {number} - Le ratio (0 si densité = 0)
 */
function calculateRatio(runeKey, prices) {
    const rune = RUNES_DATA[runeKey];
    const price = prices[runeKey] || 0;
    if (rune.density === 0) return 0;
    return price / rune.density;
}

/**
 * Trouve la rune associée à un effet d'item
 * Utilise d'abord l'effectId, puis le characteristicId comme fallback
 * @param {number} effectId - L'ID de l'effet
 * @param {number} characteristicId - L'ID de la caractéristique (optionnel)
 * @returns {string|null} - La clé de la rune ou null si non trouvée
 */
function findRuneForEffect(effectId, characteristicId = null) {
    // D'abord essayer par effectId
    const runeKeys = EFFECT_TO_RUNE[effectId];
    if (runeKeys && runeKeys.length > 0) {
        return runeKeys[0];
    }

    // Sinon, essayer par characteristicId
    if (characteristicId !== null) {
        for (const [runeKey, runeData] of Object.entries(RUNES_DATA)) {
            if (runeData.characteristicId === characteristicId) {
                return runeKey;
            }
        }
    }

    return null;
}

/**
 * Calcule le poids d'une ligne de statistique
 * Formule: poids = (quantité_stat × densité_rune × niveau_item × 3) / (200 × effet_rune) + 1
 *
 * @param {number} statValue - La valeur de la statistique (max)
 * @param {string} runeKey - La clé de la rune associée
 * @param {number} itemLevel - Le niveau de l'item
 * @returns {number} - Le poids de la ligne
 */
function calculateStatWeight(statValue, runeKey, itemLevel) {
    const rune = RUNES_DATA[runeKey];
    if (!rune) return 1;

    const weight = (statValue * rune.density * itemLevel * 3) / (200 * rune.effect) + 1;
    return weight;
}

/**
 * Analyse les statistiques d'un item et calcule les poids de chaque ligne
 * @param {Array} effects - Les effets de l'item (formatés)
 * @param {number} itemLevel - Le niveau de l'item
 * @returns {Array} - Les lignes de stats avec leurs poids et runes associées
 */
function analyzeItemStats(effects, itemLevel) {
    const lines = [];

    for (const effect of effects) {
        // Trouver la rune correspondante à cet effet (par effectId ou characteristicId)
        const runeKey = findRuneForEffect(effect.effectId, effect.characteristic);
        if (!runeKey) continue;

        const rune = RUNES_DATA[runeKey];

        // Calculer la valeur moyenne du jet : (min + max) / 2
        const minValue = effect.min || 0;
        const maxValue = effect.max || effect.min || 0;
        const statValue = (minValue + maxValue) / 2;

        if (statValue <= 0) continue;

        const weight = calculateStatWeight(statValue, runeKey, itemLevel);

        lines.push({
            effectId: effect.effectId,
            runeKey: runeKey,
            runeName: rune.name,
            statValue: statValue,       // Moyenne utilisée pour les calculs
            minValue: minValue,         // Valeur min du jet
            maxValue: maxValue,         // Valeur max du jet
            weight: weight,
            density: rune.density,
            effect: rune.effect,
            description: effect.description
        });
    }

    return lines;
}

/**
 * Calcule la rentabilité de chaque ligne de statistique
 * Formule: rentabilité_i = ratio_i × [poids_i + 0.5 × (somme_poids - poids_i)]
 *
 * @param {Array} lines - Les lignes de stats avec leurs poids
 * @param {Object} prices - Les prix des runes
 * @returns {Array} - Les lignes avec leur rentabilité calculée
 */
function calculateProfitability(lines, prices) {
    const totalWeight = lines.reduce((sum, line) => sum + line.weight, 0);

    return lines.map(line => {
        const ratio = calculateRatio(line.runeKey, prices);
        const profitability = ratio * (line.weight + 0.5 * (totalWeight - line.weight));

        return {
            ...line,
            ratio: ratio,
            profitability: profitability
        };
    });
}

/**
 * Détermine la ligne de focus (celle avec la plus grande rentabilité)
 * @param {Array} linesWithProfitability - Les lignes avec leur rentabilité
 * @returns {Object|null} - La ligne de focus ou null si aucune ligne
 */
function determineFocusLine(linesWithProfitability) {
    if (linesWithProfitability.length === 0) return null;

    return linesWithProfitability.reduce((best, current) =>
        current.profitability > best.profitability ? current : best
    );
}

/**
 * Calcule le pourcentage limite de rentabilité AVEC focus
 * Formule: pourcentage_limite = (prix_item × 100) / rentabilité_focus
 *
 * @param {number} itemPrice - Le prix du craft de l'item
 * @param {number} focusProfitability - La rentabilité de la ligne de focus
 * @returns {number} - Le pourcentage limite
 */
function calculateLimitPercentageWithFocus(itemPrice, focusProfitability) {
    if (focusProfitability === 0) return Infinity;
    return (itemPrice * 100) / focusProfitability;
}

/**
 * Calcule le pourcentage limite de rentabilité SANS focus
 * Formule: rentabilité_sans_focus = somme(poids_x × ratio_x)
 *          pourcentage_limite = (prix_item × 100) / rentabilité_sans_focus
 *
 * @param {number} itemPrice - Le prix du craft de l'item
 * @param {Array} linesWithProfitability - Les lignes avec leur rentabilité
 * @returns {number} - Le pourcentage limite
 */
function calculateLimitPercentageWithoutFocus(itemPrice, linesWithProfitability) {
    const profitabilityWithoutFocus = linesWithProfitability.reduce(
        (sum, line) => sum + (line.weight * line.ratio), 0
    );

    if (profitabilityWithoutFocus === 0) return Infinity;
    return (itemPrice * 100) / profitabilityWithoutFocus;
}

/**
 * Calcule les pourcentages limites et détermine la meilleure stratégie
 * @param {number} itemPrice - Le prix du craft de l'item
 * @param {Array} linesWithProfitability - Les lignes avec leur rentabilité
 * @param {Object} focusLine - La ligne de focus
 * @returns {Object} - Les résultats des calculs de pourcentage limite
 */
function calculateLimitPercentages(itemPrice, linesWithProfitability, focusLine) {
    const withFocus = focusLine ?
        calculateLimitPercentageWithFocus(itemPrice, focusLine.profitability) :
        Infinity;

    const withoutFocus = calculateLimitPercentageWithoutFocus(itemPrice, linesWithProfitability);

    const useFocus = withFocus <= withoutFocus;

    return {
        withFocus: withFocus,
        withoutFocus: withoutFocus,
        bestPercentage: Math.min(withFocus, withoutFocus),
        useFocus: useFocus,
        recommendation: useFocus ? "Avec Focus" : "Sans Focus"
    };
}

/**
 * Simule les brisages successifs et calcule la rentabilité
 *
 * Formule de dégradation du pourcentage:
 * pourcentage_{i+1} = pourcentage_i - (2.76 × 10^-5 × pourcentage_i²)
 *
 * @param {Object} params - Paramètres de simulation
 * @param {number} params.initialPercentage - Pourcentage initial de l'item
 * @param {number} params.itemPrice - Prix du craft
 * @param {number} params.limitPercentage - Pourcentage limite de rentabilité
 * @param {number} params.profitability - Rentabilité (avec ou sans focus)
 * @param {number} params.marginPercentage - Marge de sécurité (défaut: 10%)
 * @param {Object} params.focusLine - Ligne de focus (optionnel)
 * @param {Array} params.lines - Toutes les lignes de stats
 * @param {number} params.maxIterations - Nombre max d'itérations (sécurité)
 * @returns {Object} - Résultats de la simulation
 */
function simulateBrisages(params) {
    const {
        initialPercentage,
        itemPrice,
        limitPercentage,
        profitability,
        marginPercentage = 10,
        focusLine = null,
        lines = [],
        maxIterations = 1000
    } = params;

    // Seuils d'arrêt
    const thresholdWithMargin = limitPercentage * (1 + marginPercentage / 100);
    const thresholdWithoutMargin = limitPercentage;

    // Variables de simulation
    let currentPercentage = initialPercentage;
    let totalKamas = 0;
    let totalRunes = 0;
    let iterations = 0;

    // Résultats avec marge
    let resultWithMargin = null;
    // Résultats sans marge (rentabilité max)
    let resultWithoutMargin = null;

    // Calcul du poids total des non-focus (pour le calcul des runes générées)
    const nonFocusWeight = focusLine ?
        lines.filter(l => l.runeKey !== focusLine.runeKey).reduce((sum, l) => sum + l.weight, 0) :
        0;

    const history = [];

    while (currentPercentage >= thresholdWithoutMargin && iterations < maxIterations) {
        // Calculer le nouveau pourcentage après brisage
        const newPercentage = currentPercentage - (9.52e-5 * currentPercentage * currentPercentage);

        // Calculer les kamas générés par ce brisage
        const kamasGenerated = (profitability * newPercentage / 100) - itemPrice;
        totalKamas += kamasGenerated;

        // Calculer les runes générées (si focus)
        if (focusLine) {
            const runesGenerated = (newPercentage * (focusLine.weight + 0.5 * nonFocusWeight)) /
                (100 * focusLine.density);
            totalRunes += runesGenerated;
        }

        iterations++;

        history.push({
            iteration: iterations,
            percentage: newPercentage,
            kamasThisTurn: kamasGenerated,
            totalKamas: totalKamas,
            totalRunes: totalRunes
        });

        // Vérifier si on a atteint le seuil avec marge
        if (!resultWithMargin && newPercentage < thresholdWithMargin) {
            resultWithMargin = {
                iterations: iterations - 1,
                finalPercentage: currentPercentage,
                totalKamas: totalKamas - kamasGenerated,
                totalRunes: totalRunes - (focusLine ?
                    (newPercentage * (focusLine.weight + 0.5 * nonFocusWeight)) / (100 * focusLine.density) : 0),
                investment: (iterations - 1) * itemPrice
            };
        }

        currentPercentage = newPercentage;
    }

    // Résultat final sans marge
    resultWithoutMargin = {
        iterations: iterations,
        finalPercentage: currentPercentage,
        totalKamas: totalKamas,
        totalRunes: totalRunes,
        investment: iterations * itemPrice
    };

    return {
        withMargin: resultWithMargin || resultWithoutMargin,
        withoutMargin: resultWithoutMargin,
        history: history,
        isProfitable: totalKamas > 0,
        marginPercentage: marginPercentage
    };
}

/**
 * Simule un nombre spécifique de brisages
 * @param {Object} params - Mêmes paramètres que simulateBrisages
 * @param {number} numBrisages - Nombre de brisages à simuler
 * @returns {Object} - Résultats de la simulation
 */
function simulateSpecificBrisages(params, numBrisages) {
    const {
        initialPercentage,
        itemPrice,
        profitability,
        focusLine = null,
        lines = []
    } = params;

    let currentPercentage = initialPercentage;
    let totalKamas = 0;
    let totalRunes = 0;

    const nonFocusWeight = focusLine ?
        lines.filter(l => l.runeKey !== focusLine.runeKey).reduce((sum, l) => sum + l.weight, 0) :
        0;

    const history = [];

    for (let i = 0; i < numBrisages; i++) {
        const newPercentage = currentPercentage - (9.52e-5 * currentPercentage * currentPercentage);
        const kamasGenerated = (profitability * newPercentage / 100) - itemPrice;
        totalKamas += kamasGenerated;

        if (focusLine) {
            const runesGenerated = (newPercentage * (focusLine.weight + 0.5 * nonFocusWeight)) /
                (100 * focusLine.density);
            totalRunes += runesGenerated;
        }

        history.push({
            iteration: i + 1,
            percentage: newPercentage,
            kamasThisTurn: kamasGenerated,
            totalKamas: totalKamas,
            totalRunes: totalRunes
        });

        currentPercentage = newPercentage;
    }

    return {
        iterations: numBrisages,
        finalPercentage: currentPercentage,
        totalKamas: totalKamas,
        totalRunes: totalRunes,
        investment: numBrisages * itemPrice,
        history: history,
        isProfitable: totalKamas > 0
    };
}

/**
 * Effectue l'analyse complète d'un item pour le brisage
 * @param {Object} item - L'item avec ses effets et niveau
 * @param {number} craftPrice - Le prix du craft
 * @param {Object} prices - Les prix des runes
 * @param {number} currentPercentage - Le pourcentage actuel (optionnel)
 * @param {number} marginPercentage - La marge de sécurité (optionnel)
 * @returns {Object} - Analyse complète
 */
function analyzeItem(item, craftPrice, prices, currentPercentage = null, marginPercentage = 10) {
    // 1. Analyser les stats de l'item
    const lines = analyzeItemStats(item.effects, item.level);

    if (lines.length === 0) {
        return {
            error: "Aucune statistique forgemaguable trouvée sur cet item",
            lines: [],
            focusLine: null,
            limitPercentages: null,
            simulation: null
        };
    }

    // 2. Calculer la rentabilité de chaque ligne
    const linesWithProfitability = calculateProfitability(lines, prices);

    // 3. Déterminer la ligne de focus
    const focusLine = determineFocusLine(linesWithProfitability);

    // 4. Calculer les pourcentages limites
    const limitPercentages = calculateLimitPercentages(craftPrice, linesWithProfitability, focusLine);

    // 5. Si un pourcentage actuel est fourni, simuler les brisages
    let simulation = null;
    if (currentPercentage !== null) {
        const profitability = limitPercentages.useFocus ?
            focusLine.profitability :
            linesWithProfitability.reduce((sum, l) => sum + (l.weight * l.ratio), 0);

        simulation = simulateBrisages({
            initialPercentage: currentPercentage,
            itemPrice: craftPrice,
            limitPercentage: limitPercentages.bestPercentage,
            profitability: profitability,
            marginPercentage: marginPercentage,
            focusLine: limitPercentages.useFocus ? focusLine : null,
            lines: linesWithProfitability
        });
    }

    return {
        lines: linesWithProfitability,
        focusLine: focusLine,
        limitPercentages: limitPercentages,
        simulation: simulation,
        craftPrice: craftPrice
    };
}

export {
    getRunePrices,
    saveRunePrices,
    calculateRatio,
    findRuneForEffect,
    calculateStatWeight,
    analyzeItemStats,
    calculateProfitability,
    determineFocusLine,
    calculateLimitPercentages,
    simulateBrisages,
    simulateSpecificBrisages,
    analyzeItem
};
