/**
 * Données des runes de forgemagie Dofus
 *
 * Chaque rune possède :
 * - name: nom affiché
 * - shortName: nom court (pour les inputs)
 * - density: densité de la rune (poids FM)
 * - effect: effet de la rune (valeur de stat par rune)
 * - characteristicId: ID de la caractéristique dans l'API DofusDB
 * - effectIds: IDs des effets associés dans l'API (pour matcher les stats des items)
 */

const RUNES_DATA = {
    age: {
        name: "Agilité",
        shortName: "Age",
        density: 1,
        effect: 1,
        characteristicId: 14,
        effectIds: [119]
    },
    cha: {
        name: "Chance",
        shortName: "Cha",
        density: 1,
        effect: 1,
        characteristicId: 13,
        effectIds: [123]
    },
    cri: {
        name: "Critique",
        shortName: "Cri",
        density: 10,
        effect: 1,
        characteristicId: 18,
        effectIds: [115]
    },
    do: {
        name: "Dommages",
        shortName: "Do",
        density: 20,
        effect: 1,
        characteristicId: 16,
        effectIds: [112]
    },
    do_air: {
        name: "Dommages Air",
        shortName: "Do Air",
        density: 5,
        effect: 1,
        characteristicId: 91,
        effectIds: [428]
    },
    do_cri: {
        name: "Dommages Critiques",
        shortName: "Do Cri",
        density: 5,
        effect: 1,
        characteristicId: null,
        effectIds: [418]
    },
    do_eau: {
        name: "Dommages Eau",
        shortName: "Do Eau",
        density: 5,
        effect: 1,
        characteristicId: 90,
        effectIds: [426]
    },
    do_feu: {
        name: "Dommages Feu",
        shortName: "Do Feu",
        density: 5,
        effect: 1,
        characteristicId: 89,
        effectIds: [424]
    },
    do_neutre: {
        name: "Dommages Neutre",
        shortName: "Do Neutre",
        density: 5,
        effect: 1,
        characteristicId: 87,
        effectIds: [430]
    },
    do_per_ar: {
        name: "% Dommages Armes",
        shortName: "% Do Armes",
        density: 2,
        effect: 1,
        characteristicId: null,
        effectIds: [1173]
    },
    do_per_di: {
        name: "% Dommages Distance",
        shortName: "% Do Dist",
        density: 2,
        effect: 1,
        characteristicId: null,
        effectIds: [1172]
    },
    do_per_me: {
        name: "% Dommages Mêlée",
        shortName: "% Do Mêlée",
        density: 2,
        effect: 1,
        characteristicId: null,
        effectIds: [1171]
    },
    do_per_so: {
        name: "% Dommages Sorts",
        shortName: "% Do Sorts",
        density: 2,
        effect: 1,
        characteristicId: null,
        effectIds: [1174]
    },
    do_pi: {
        name: "Dommages Pièges",
        shortName: "Do Pi",
        density: 2,
        effect: 1,
        characteristicId: null,
        effectIds: [225]
    },
    do_pou: {
        name: "Dommages Poussée",
        shortName: "Do Pou",
        density: 5,
        effect: 1,
        characteristicId: null,
        effectIds: [414]
    },
    do_ren: {
        name: "Renvoie Dommages",
        shortName: "Renv Do",
        density: 2,
        effect: 1,
        characteristicId: null,
        effectIds: [220]
    },
    do_terre: {
        name: "Dommages Terre",
        shortName: "Do Terre",
        density: 5,
        effect: 1,
        characteristicId: 88,
        effectIds: [422]
    },
    fo: {
        name: "Force",
        shortName: "Fo",
        density: 1,
        effect: 1,
        characteristicId: 10,
        effectIds: [118]
    },
    fui: {
        name: "Fuite",
        shortName: "Fui",
        density: 4,
        effect: 1,
        characteristicId: null,
        effectIds: [752]
    },
    ga_pa: {
        name: "PA",
        shortName: "Pa",
        density: 100,
        effect: 1,
        characteristicId: 1,
        effectIds: [111]
    },
    ga_pme: {
        name: "PM",
        shortName: "Pme",
        density: 90,
        effect: 1,
        characteristicId: 23,
        effectIds: [128]
    },
    ine: {
        name: "Intelligence",
        shortName: "Ine",
        density: 1,
        effect: 1,
        characteristicId: 15,
        effectIds: [126]
    },
    ini: {
        name: "Initiative",
        shortName: "Ini",
        density: 0.1,
        effect: 10,
        characteristicId: 44,
        effectIds: [174]
    },
    invo: {
        name: "Invocations",
        shortName: "Invo",
        density: 30,
        effect: 1,
        characteristicId: 26,
        effectIds: [182]
    },
    per_pi: {
        name: "% Dommages Pièges",
        shortName: "% Pi",
        density: 2,
        effect: 1,
        characteristicId: null,
        effectIds: [226]
    },
    po: {
        name: "Portée",
        shortName: "Po",
        density: 51,
        effect: 1,
        characteristicId: 19,
        effectIds: [117]
    },
    pod: {
        name: "Pods",
        shortName: "Pod",
        density: 0.25,
        effect: 10,
        characteristicId: null,
        effectIds: [158]
    },
    prospe: {
        name: "Prospection",
        shortName: "Prosp",
        density: 3,
        effect: 1,
        characteristicId: 48,
        effectIds: [176]
    },
    pui: {
        name: "Puissance",
        shortName: "Pui",
        density: 2,
        effect: 1,
        characteristicId: null,
        effectIds: [138]
    },
    re_air: {
        name: "Résistance Air",
        shortName: "Rés Air",
        density: 2,
        effect: 1,
        characteristicId: null,
        effectIds: [242]
    },
    re_cri: {
        name: "Résistance Critique",
        shortName: "Rés Cri",
        density: 2,
        effect: 1,
        characteristicId: null,
        effectIds: [420]
    },
    re_eau: {
        name: "Résistance Eau",
        shortName: "Rés Eau",
        density: 2,
        effect: 1,
        characteristicId: null,
        effectIds: [241]
    },
    re_feu: {
        name: "Résistance Feu",
        shortName: "Rés Feu",
        density: 2,
        effect: 1,
        characteristicId: null,
        effectIds: [243]
    },
    re_neutre: {
        name: "Résistance Neutre",
        shortName: "Rés Neutre",
        density: 2,
        effect: 1,
        characteristicId: null,
        effectIds: [244]
    },
    re_pa: {
        name: "Esquive PA",
        shortName: "Esq PA",
        density: 7,
        effect: 1,
        characteristicId: 27,
        effectIds: [160]
    },
    re_per_air: {
        name: "% Résistance Air",
        shortName: "% Rés Air",
        density: 6,
        effect: 1,
        characteristicId: 34,
        effectIds: [212]
    },
    re_per_di: {
        name: "% Résistance Distance",
        shortName: "% Rés Dist",
        density: 2,
        effect: 1,
        characteristicId: null,
        effectIds: [420]
    },
    re_per_eau: {
        name: "% Résistance Eau",
        shortName: "% Rés Eau",
        density: 6,
        effect: 1,
        characteristicId: 37,
        effectIds: [211]
    },
    re_per_feu: {
        name: "% Résistance Feu",
        shortName: "% Rés Feu",
        density: 6,
        effect: 1,
        characteristicId: 35,
        effectIds: [213]
    },
    re_per_me: {
        name: "% Résistance Mêlée",
        shortName: "% Rés Mêlée",
        density: 2,
        effect: 1,
        characteristicId: null,
        effectIds: [418]
    },
    re_per_neutre: {
        name: "% Résistance Neutre",
        shortName: "% Rés Neutre",
        density: 6,
        effect: 1,
        characteristicId: 33,
        effectIds: [214]
    },
    re_per_terre: {
        name: "% Résistance Terre",
        shortName: "% Rés Terre",
        density: 6,
        effect: 1,
        characteristicId: 36,
        effectIds: [210]
    },
    re_pm: {
        name: "Esquive PM",
        shortName: "Esq PM",
        density: 7,
        effect: 1,
        characteristicId: 28,
        effectIds: [161]
    },
    re_pou: {
        name: "Résistance Poussée",
        shortName: "Rés Pou",
        density: 2,
        effect: 1,
        characteristicId: null,
        effectIds: [416]
    },
    re_terre: {
        name: "Résistance Terre",
        shortName: "Rés Terre",
        density: 2,
        effect: 1,
        characteristicId: null,
        effectIds: [240]
    },
    ret_pa: {
        name: "Retrait PA",
        shortName: "Ret PA",
        density: 7,
        effect: 1,
        characteristicId: null,
        effectIds: [410]
    },
    ret_pm: {
        name: "Retrait PM",
        shortName: "Ret PM",
        density: 7,
        effect: 1,
        characteristicId: null,
        effectIds: [412]
    },
    sa: {
        name: "Sagesse",
        shortName: "Sa",
        density: 3,
        effect: 1,
        characteristicId: 12,
        effectIds: [124]
    },
    so: {
        name: "Soins",
        shortName: "So",
        density: 10,
        effect: 1,
        characteristicId: 49,
        effectIds: [178]
    },
    tac: {
        name: "Tacle",
        shortName: "Tac",
        density: 4,
        effect: 1,
        characteristicId: null,
        effectIds: [753]
    },
    vi: {
        name: "Vitalité",
        shortName: "Vi",
        density: 1,
        effect: 3,
        characteristicId: 11,
        effectIds: [125]
    },
    // Rune spéciale (à part)
    chasse: {
        name: "Chasse",
        shortName: "Chasse",
        density: 5,
        effect: 1,
        characteristicId: null,
        effectIds: [2800]
    }
};

// Mapping des effectIds vers les clés de runes pour retrouver facilement la rune associée à un effet
const EFFECT_TO_RUNE = {};
for (const [runeKey, runeData] of Object.entries(RUNES_DATA)) {
    for (const effectId of runeData.effectIds) {
        if (!EFFECT_TO_RUNE[effectId]) {
            EFFECT_TO_RUNE[effectId] = [];
        }
        EFFECT_TO_RUNE[effectId].push(runeKey);
    }
}

/**
 * Retourne les clés des runes triées par ordre alphabétique de la clé (id)
 * avec quelques exceptions :
 * - ret_pa et ret_pm entre pui et re_air
 * - chasse toujours à la fin
 */
function getSortedRuneKeys() {
    const specialKeys = ['chasse', 'ret_pa', 'ret_pm'];
    const keys = Object.keys(RUNES_DATA).filter(k => !specialKeys.includes(k));
    keys.sort((a, b) => a.localeCompare(b));

    // Insérer ret_pa et ret_pm après pui et avant re_air
    const reAirIndex = keys.indexOf('re_air');
    if (reAirIndex !== -1) {
        keys.splice(reAirIndex, 0, 'ret_pa', 'ret_pm');
    } else {
        // Fallback si re_air n'existe pas
        keys.push('ret_pa', 'ret_pm');
    }

    // Rune spéciale à la fin
    keys.push('chasse');
    return keys;
}

export { RUNES_DATA, EFFECT_TO_RUNE, getSortedRuneKeys };
