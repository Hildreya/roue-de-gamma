/**
 * Module API DofusDB
 * Wrapper pour les appels à l'API DofusDB avec le header Referer requis
 */

const API_BASE_URL = "https://api.dofusdb.fr";
const APP_NAME = "Roue de Gamma";

/**
 * Effectue une requête vers l'API DofusDB
 * @param {string} endpoint - L'endpoint à appeler (ex: "/items")
 * @param {Object} params - Les paramètres de la requête
 * @returns {Promise<Object>} - La réponse JSON de l'API
 */
async function fetchAPI(endpoint, params = {}) {
    const url = new URL(`${API_BASE_URL}${endpoint}`);

    // Ajouter les paramètres à l'URL
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value);
    }

    const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
            "Referer": APP_NAME
        }
    });

    if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

// TypeIds des équipements forgemaguables
// 1=Amulette, 2=Arc, 3=Baguette, 4=Bâton, 5=Dague, 6=Épée, 7=Marteau, 8=Pelle,
// 9=Anneau, 10=Ceinture, 11=Bottes, 16=Chapeau, 17=Cape, 19=Hache, 21=Pioche,
// 22=Faux, 23=Dofus, 82=Bouclier, 102=Prysmaradite, 103=Faulchon, 114=Sertisseur,
// 115=Arc Explosif, 189=Trophées
const EQUIPMENT_TYPE_IDS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 16, 17, 19, 21, 22, 23, 82, 102, 103, 114, 115, 189]);

/**
 * Recherche des équipements uniquement (armes, armures, accessoires)
 * Utilise slug.fr pour la recherche (insensible à la casse)
 * @param {string} query - Le texte à rechercher
 * @param {number} limit - Nombre max de résultats
 * @returns {Promise<Array>} - Liste des équipements correspondants
 */
async function searchEquipments(query, limit = 15) {
    if (!query || query.length < 2) {
        return [];
    }

    // Convertir la requête en format slug (minuscules, remplacer espaces par tirets)
    const slugQuery = query.toLowerCase().replace(/\s+/g, '-');

    // Recherche par slug.fr - on demande plus de résultats car on filtre après
    const response = await fetchAPI("/items", {
        "slug.fr[$regex]": slugQuery,
        "$limit": limit * 3 // Demander plus pour compenser le filtrage
    });

    // Filtrer côté client pour ne garder que les équipements forgemaguables
    const items = (response.data || [])
        .filter(item => EQUIPMENT_TYPE_IDS.has(item.typeId))
        .slice(0, limit);

    return items;
}

/**
 * Récupère les détails complets d'un item par son ID
 * @param {number} itemId - L'ID de l'item
 * @returns {Promise<Object>} - Les données complètes de l'item
 */
async function getItemById(itemId) {
    const response = await fetchAPI(`/items/${itemId}`);
    return response;
}

/**
 * Récupère l'URL de l'image d'un item
 * @param {number} iconId - L'ID de l'icône
 * @returns {string} - L'URL de l'image
 */
function getItemImageUrl(iconId) {
    return `${API_BASE_URL}/img/items/${iconId}.png`;
}

/**
 * Mapping des effectIds vers les icônes d'effets
 * Basé sur les icônes de DofusDB (https://dofusdb.fr)
 */
const EFFECT_ICONS = {
    // Stats primaires
    111: "pa",
    128: "pm",
    117: "po",
    182: "invocation",
    125: "pv",
    118: "terre",      // Force
    126: "feu",        // Intelligence
    123: "eau",        // Chance
    119: "air",        // Agilité
    124: "sagesse",
    138: "puissance",
    115: "critique",
    // Stats secondaires
    753: "tacle",
    752: "fuite",
    410: "retraitPA",
    160: "esquivePA",
    412: "retraitPM",
    161: "esquivePM",
    174: "initiative",
    178: "soin",
    176: "pp",
    158: "pod",
    // Dommages
    112: "dommages",
    430: "neutre",     // Do Neutre
    422: "terre",      // Do Terre
    424: "feu",        // Do Feu
    426: "eau",        // Do Eau
    428: "air",        // Do Air
    418: "dmgCritique",
    414: "dmgPoussee",
    // Résistances élémentaires fixes
    244: "neutre",
    240: "terre",
    243: "feu",
    241: "eau",
    242: "air",
    // % Résistances élémentaires
    214: "neutre",
    210: "terre",
    213: "feu",
    211: "eau",
    212: "air",
    // Autres
    220: "dommages",   // Renvoie Do
    225: "dommages",   // Do Pièges
    226: "dommages",   // % Do Pièges
    416: "dmgPoussee", // Rés Poussée
    420: "dmgCritique", // Rés Critique
    756: "esquivePA",  // Rés PA (même icône que esquive PA)
    757: "esquivePM",  // Rés PM (même icône que esquive PM)
    1171: "dommages",  // % Do Mêlée
    1172: "dommages",  // % Do Distance
    1173: "dommages",  // % Do Armes
    1174: "dommages",  // % Do Sorts
    2800: "dommages"   // Chasse
};

/**
 * Récupère l'URL de l'icône d'un effet
 * @param {number} effectId - L'ID de l'effet
 * @returns {string|null} - L'URL de l'icône ou null si non trouvée
 */
function getEffectIconUrl(effectId) {
    const iconName = EFFECT_ICONS[effectId];
    if (!iconName) return null;
    return `https://dofusdb.fr/icons/effects/${iconName}.png`;
}

/**
 * Mapping des effectIds vers les noms de stats pour l'affichage
 * Basé sur l'API DofusDB https://api.dofusdb.fr/effects/{id}
 */
const EFFECT_NAMES = {
    // Stats de base
    111: "PA",
    112: "Dommages",
    115: "Critique",
    117: "Portée",
    118: "Force",
    119: "Agilité",
    123: "Chance",
    124: "Sagesse",
    125: "Vitalité",
    126: "Intelligence",
    128: "PM",
    138: "Puissance",
    158: "Pods",
    160: "Esquive PA",
    161: "Esquive PM",
    174: "Initiative",
    176: "Prospection",
    178: "Soins",
    182: "Invocations",
    // % Résistances élémentaires
    210: "% Résistance Terre",
    211: "% Résistance Eau",
    212: "% Résistance Air",
    213: "% Résistance Feu",
    214: "% Résistance Neutre",
    // Renvoie dommages
    220: "Renvoie Dommages",
    // Pièges
    225: "Dommages Pièges",
    226: "% Dommages Pièges",
    // Résistances fixes élémentaires
    240: "Résistance Terre",
    241: "Résistance Eau",
    242: "Résistance Air",
    243: "Résistance Feu",
    244: "Résistance Neutre",
    // Retrait PA/PM
    410: "Retrait PA",
    412: "Retrait PM",
    // Dommages Poussée
    414: "Dommages Poussée",
    // Résistance Poussée
    416: "Résistance Poussée",
    // Dommages Critiques
    418: "Dommages Critiques",
    // Résistance Critique
    420: "Résistance Critique",
    // Dommages élémentaires
    422: "Dommages Terre",
    424: "Dommages Feu",
    426: "Dommages Eau",
    428: "Dommages Air",
    430: "Dommages Neutre",
    // Tacle / Fuite
    752: "Fuite",
    753: "Tacle",
    // Résistance PA/PM
    756: "Résistance PA",
    757: "Résistance PM",
    // % Dommages spéciaux
    1171: "% Dommages Mêlée",
    1172: "% Dommages Distance",
    1173: "% Dommages Armes",
    1174: "% Dommages Sorts",
    // Chasse
    2800: "Chasse"
};

/**
 * Formate les effets d'un item pour l'affichage
 * L'API DofusDB utilise diceNum (min) et diceSide (valeur ajoutée pour max)
 * @param {Array} effects - Les effets de l'item depuis l'API
 * @returns {Array} - Les effets formatés avec min/max et description
 */
function formatItemEffects(effects) {
    if (!effects || !Array.isArray(effects)) {
        return [];
    }

    return effects
        .filter(effect => {
            // Filtrer les effets qui ont des valeurs de stats
            const hasValues = effect.diceNum !== undefined ||
                              effect.from !== undefined ||
                              effect.to !== undefined;
            return hasValues;
        })
        .map(effect => {
            // L'API utilise diceNum comme valeur min et diceSide comme valeur max
            // Si diceSide = 0, c'est une valeur fixe (min = max = diceNum)
            let min, max;

            if (effect.diceNum !== undefined) {
                min = effect.diceNum;
                max = effect.diceSide > 0 ? effect.diceSide : effect.diceNum;
            } else {
                min = effect.from || 0;
                max = effect.to || effect.from || 0;
            }

            // Générer la description si elle n'existe pas
            let description = effect.description?.fr || "";
            if (!description && EFFECT_NAMES[effect.effectId]) {
                const statName = EFFECT_NAMES[effect.effectId];
                if (min === max) {
                    description = `${min} ${statName}`;
                } else {
                    description = `${min} à ${max} ${statName}`;
                }
            }

            return {
                effectId: effect.effectId,
                min: min,
                max: max,
                characteristic: effect.characteristic,
                description: description
            };
        })
        .filter(effect => effect.max > 0); // Ne garder que les effets avec des valeurs positives
}

/**
 * Récupère les types d'items (pour filtrage)
 * @returns {Promise<Array>} - Liste des types d'items
 */
async function getItemTypes() {
    const response = await fetchAPI("/item-types", {
        "$limit": 200
    });
    return response.data || [];
}

export {
    fetchAPI,
    searchEquipments,
    getItemById,
    getItemImageUrl,
    getEffectIconUrl,
    formatItemEffects,
    getItemTypes,
    API_BASE_URL,
    EQUIPMENT_TYPE_IDS
};
