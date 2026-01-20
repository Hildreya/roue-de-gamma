/**
 * Gestion de la page de paramètres des prix des runes
 */

import { RUNES_DATA, getSortedRuneKeys } from './runes.js';
import { getRunePrices, saveRunePrices } from './calculator.js';

// État local des prix
let currentPrices = {};

/**
 * Initialise la page
 */
function init() {
    currentPrices = getRunePrices();
    renderRuneList();
    setupEventListeners();
}

/**
 * Affiche la liste des runes triées alphabétiquement
 */
function renderRuneList() {
    const container = document.getElementById('runeCategories');
    container.innerHTML = '';

    const sortedKeys = getSortedRuneKeys();

    // Séparer les runes normales de la rune Chasse
    const normalKeys = sortedKeys.filter(k => k !== 'chasse');
    const hasChasse = sortedKeys.includes('chasse');

    // Section principale (runes alphabétiques)
    const mainSection = document.createElement('div');
    mainSection.className = 'rune-category';

    const mainHeader = document.createElement('h2');
    mainHeader.className = 'category-header';
    mainHeader.textContent = 'Prix des Runes (ordre alphabétique)';
    mainSection.appendChild(mainHeader);

    const grid = document.createElement('div');
    grid.className = 'rune-grid';

    for (const runeKey of normalKeys) {
        const rune = RUNES_DATA[runeKey];
        if (!rune) continue;

        const runeItem = createRuneInput(runeKey, rune);
        grid.appendChild(runeItem);
    }

    mainSection.appendChild(grid);
    container.appendChild(mainSection);

    // Section Chasse (à part)
    if (hasChasse) {
        const chasseSection = document.createElement('div');
        chasseSection.className = 'rune-category chasse-section';

        const chasseHeader = document.createElement('h2');
        chasseHeader.className = 'category-header';
        chasseHeader.textContent = 'Rune Spéciale';
        chasseSection.appendChild(chasseHeader);

        const chasseGrid = document.createElement('div');
        chasseGrid.className = 'rune-grid';

        const chasseRune = RUNES_DATA['chasse'];
        if (chasseRune) {
            chasseGrid.appendChild(createRuneInput('chasse', chasseRune));
        }

        chasseSection.appendChild(chasseGrid);
        container.appendChild(chasseSection);
    }
}

/**
 * Crée un élément input pour une rune
 */
function createRuneInput(runeKey, rune) {
    const runeItem = document.createElement('div');
    runeItem.className = 'rune-item';

    runeItem.innerHTML = `
        <label for="price_${runeKey}">
            <span class="rune-name">${rune.shortName}</span>
            <span class="rune-fullname">${rune.name}</span>
        </label>
        <div class="input-wrapper">
            <input
                type="number"
                id="price_${runeKey}"
                data-rune="${runeKey}"
                value="${currentPrices[runeKey] || 0}"
                min="0"
                step="100"
                placeholder="0"
            >
            <span class="unit">K</span>
        </div>
    `;

    return runeItem;
}

/**
 * Configure les écouteurs d'événements
 */
function setupEventListeners() {
    // Mise à jour des prix en temps réel
    document.getElementById('runeCategories').addEventListener('input', (e) => {
        if (e.target.dataset.rune) {
            currentPrices[e.target.dataset.rune] = parseInt(e.target.value) || 0;
        }
    });

    // Bouton Sauvegarder
    document.getElementById('saveBtn').addEventListener('click', () => {
        saveRunePrices(currentPrices);
        showNotification('Prix sauvegardés !', 'success');
    });

    // Bouton Exporter
    document.getElementById('exportBtn').addEventListener('click', exportPrices);

    // Bouton Importer
    document.getElementById('importInput').addEventListener('change', importPrices);

    // Bouton Réinitialiser
    document.getElementById('resetBtn').addEventListener('click', () => {
        if (confirm('Voulez-vous vraiment remettre tous les prix à 0 ?')) {
            for (const runeKey of Object.keys(RUNES_DATA)) {
                currentPrices[runeKey] = 0;
            }
            saveRunePrices(currentPrices);
            renderRuneList();
            showNotification('Prix réinitialisés', 'info');
        }
    });
}

/**
 * Exporte les prix en fichier JSON
 */
function exportPrices() {
    const dataStr = JSON.stringify(currentPrices, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'prix-runes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Fichier exporté !', 'success');
}

/**
 * Importe les prix depuis un fichier JSON
 */
function importPrices(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const imported = JSON.parse(event.target.result);

            // Valider et merger avec les prix existants
            for (const [key, value] of Object.entries(imported)) {
                if (RUNES_DATA[key] && typeof value === 'number') {
                    currentPrices[key] = value;
                }
            }

            saveRunePrices(currentPrices);
            renderRuneList();
            showNotification('Prix importés !', 'success');
        } catch (err) {
            showNotification('Erreur: fichier JSON invalide', 'error');
        }
    };
    reader.readAsText(file);

    // Reset l'input pour permettre de réimporter le même fichier
    e.target.value = '';
}

/**
 * Affiche une notification temporaire
 */
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Lancer l'initialisation au chargement
document.addEventListener('DOMContentLoaded', init);
