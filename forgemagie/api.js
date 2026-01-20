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
            // L'API utilise diceNum comme valeur min et diceSide pour calculer le max
            // max = diceNum + diceSide (si diceSide > 0)
            let min, max;

            if (effect.diceNum !== undefined) {
                min = effect.diceNum;
                max = effect.diceSide > 0 ? effect.diceNum + effect.diceSide : effect.diceNum;
            } else {
                min = effect.from || 0;
                max = effect.to || effect.from || 0;
            }

            return {
                effectId: effect.effectId,
                min: min,
                max: max,
                characteristic: effect.characteristic,
                description: effect.description?.fr || ""
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
    formatItemEffects,
    getItemTypes,
    API_BASE_URL,
    EQUIPMENT_TYPE_IDS
};
