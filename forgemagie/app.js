/**
 * Application principale Forgemagie Helper
 */

import { searchEquipments, getItemById, getItemImageUrl, getEffectIconUrl, formatItemEffects } from './api.js';
import { RUNES_DATA } from './runes.js';
import {
    getRunePrices,
    analyzeItem,
    simulateSpecificBrisages,
    determineFocusLine,
    calculateProfitability,
    analyzeItemStats
} from './calculator.js';

// État de l'application
let selectedItem = null;
let currentAnalysis = null;
let searchTimeout = null;

/**
 * Initialise l'application
 */
function init() {
    setupSearchListeners();
    setupCalculatorListeners();
    setupUIListeners();

    // Vérifier si les prix sont configurés
    const prices = getRunePrices();
    const hasAnyPrice = Object.values(prices).some(p => p > 0);
    if (!hasAnyPrice) {
        showNotification('Pensez à configurer les prix des runes dans les paramètres !', 'warning');
    }
}

/**
 * Configure les écouteurs pour la recherche
 */
function setupSearchListeners() {
    const searchInput = document.getElementById('itemSearch');
    const searchResults = document.getElementById('searchResults');

    // Recherche avec debounce
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();

        if (searchTimeout) clearTimeout(searchTimeout);

        if (query.length < 2) {
            searchResults.style.display = 'none';
            searchResults.innerHTML = '';
            return;
        }

        searchTimeout = setTimeout(async () => {
            try {
                searchResults.innerHTML = '<div class="loading">Recherche...</div>';
                searchResults.style.display = 'block';

                const items = await searchEquipments(query);

                if (items.length === 0) {
                    searchResults.innerHTML = '<div class="no-results">Aucun résultat</div>';
                    return;
                }

                renderSearchResults(items);
            } catch (error) {
                console.error('Erreur recherche:', error);
                searchResults.innerHTML = '<div class="error">Erreur de recherche</div>';
            }
        }, 300);
    });

    // Fermer les résultats si clic ailleurs
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper')) {
            searchResults.style.display = 'none';
        }
    });

    // Navigation clavier dans les résultats
    searchInput.addEventListener('keydown', (e) => {
        const results = searchResults.querySelectorAll('.search-result-item');
        const current = searchResults.querySelector('.search-result-item.highlighted');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!current) {
                results[0]?.classList.add('highlighted');
            } else {
                const next = current.nextElementSibling;
                if (next) {
                    current.classList.remove('highlighted');
                    next.classList.add('highlighted');
                }
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (current) {
                const prev = current.previousElementSibling;
                if (prev) {
                    current.classList.remove('highlighted');
                    prev.classList.add('highlighted');
                }
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (current) {
                current.click();
            }
        }
    });
}

/**
 * Affiche les résultats de recherche
 */
function renderSearchResults(items) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';

    for (const item of items) {
        const div = document.createElement('div');
        div.className = 'search-result-item';
        div.dataset.itemId = item.id;

        div.innerHTML = `
            <img src="${getItemImageUrl(item.iconId)}" alt="" class="result-image">
            <div class="result-info">
                <span class="result-name">${item.name.fr}</span>
                <span class="result-level">Niveau ${item.level}</span>
            </div>
        `;

        div.addEventListener('click', () => selectItem(item));
        searchResults.appendChild(div);
    }
}

/**
 * Sélectionne un item et affiche ses détails
 */
async function selectItem(item) {
    const searchInput = document.getElementById('itemSearch');
    const searchResults = document.getElementById('searchResults');

    searchInput.value = item.name.fr;
    searchResults.style.display = 'none';

    try {
        // Récupérer les détails complets
        const fullItem = await getItemById(item.id);
        selectedItem = {
            ...fullItem,
            effects: formatItemEffects(fullItem.possibleEffects || fullItem.effects)
        };

        displayItem(selectedItem);
        showCalculator();
    } catch (error) {
        console.error('Erreur chargement item:', error);
        showNotification('Erreur lors du chargement de l\'item', 'error');
    }
}

/**
 * Affiche les détails de l'item sélectionné
 */
function displayItem(item) {
    const display = document.getElementById('itemDisplay');
    display.style.display = 'block';

    document.getElementById('itemImage').src = getItemImageUrl(item.iconId);
    document.getElementById('itemImage').alt = item.name.fr;
    document.getElementById('itemName').textContent = item.name.fr;
    document.getElementById('itemLevel').textContent = `Niveau ${item.level}`;
    document.getElementById('itemType').textContent = item.type?.name?.fr || '';

    // Afficher les stats
    const statsContainer = document.getElementById('itemStats');
    statsContainer.innerHTML = '';

    if (item.effects && item.effects.length > 0) {
        for (const effect of item.effects) {
            const statDiv = document.createElement('div');
            statDiv.className = 'stat-line';

            // Ajouter l'icône de l'effet
            const iconUrl = getEffectIconUrl(effect.effectId);
            if (iconUrl) {
                const icon = document.createElement('img');
                icon.src = iconUrl;
                icon.alt = '';
                icon.className = 'stat-icon';
                statDiv.appendChild(icon);
            }

            // Ajouter le texte de la stat
            const textSpan = document.createElement('span');
            if (effect.description) {
                textSpan.textContent = effect.description;
            } else {
                // Fallback si pas de description : afficher min-max
                const valueText = effect.min === effect.max
                    ? `${effect.min}`
                    : `${effect.min} à ${effect.max}`;
                textSpan.textContent = `${valueText} (effet ${effect.effectId})`;
            }
            statDiv.appendChild(textSpan);

            statsContainer.appendChild(statDiv);
        }
    }
}

/**
 * Affiche la section de calcul
 */
function showCalculator() {
    document.getElementById('calculatorSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
}

/**
 * Configure les écouteurs du calculateur
 */
function setupCalculatorListeners() {
    // Checkbox simulation de brisage
    document.getElementById('enableBrisage').addEventListener('change', (e) => {
        const brisageInputs = document.getElementById('brisageInputs');
        brisageInputs.style.display = e.target.checked ? 'block' : 'none';
    });

    // Bouton calculer
    document.getElementById('calculateBtn').addEventListener('click', calculate);

    // Simulation personnalisée
    document.getElementById('customBrisageBtn').addEventListener('click', customSimulation);
}

/**
 * Effectue le calcul
 */
function calculate() {
    if (!selectedItem) {
        showNotification('Veuillez d\'abord sélectionner un item', 'error');
        return;
    }

    const craftPrice = parseInt(document.getElementById('craftPrice').value) || 0;
    const marginPercent = parseInt(document.getElementById('marginPercent').value) || 10;
    const enableBrisage = document.getElementById('enableBrisage').checked;

    if (craftPrice <= 0) {
        showNotification('Veuillez entrer un prix de craft valide', 'error');
        return;
    }

    const prices = getRunePrices();
    const hasAnyPrice = Object.values(prices).some(p => p > 0);
    if (!hasAnyPrice) {
        showNotification('Aucun prix de rune configuré ! Les calculs seront incorrects.', 'warning');
    }

    let currentPercent = null;
    if (enableBrisage) {
        currentPercent = parseFloat(document.getElementById('currentPercent').value);
        if (!currentPercent || currentPercent <= 0) {
            showNotification('Veuillez entrer un pourcentage valide', 'error');
            return;
        }
    }

    // Effectuer l'analyse
    currentAnalysis = analyzeItem(selectedItem, craftPrice, prices, currentPercent, marginPercent);

    if (currentAnalysis.error) {
        showNotification(currentAnalysis.error, 'error');
        return;
    }

    displayResults(enableBrisage);
}

/**
 * Affiche les résultats
 */
function displayResults(enableBrisage) {
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.style.display = 'block';

    // Afficher le focus recommandé
    displayFocusResult();

    // Afficher les pourcentages limites
    displayLimitResult();

    // Afficher les résultats de brisage si applicable
    const brisageResult = document.getElementById('brisageResult');
    if (enableBrisage && currentAnalysis.simulation) {
        brisageResult.style.display = 'block';
        displayBrisageResult();
    } else {
        brisageResult.style.display = 'none';
    }

    // Afficher le détail des lignes
    displayLinesDetail();

    // Scroll vers les résultats
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Affiche le résultat du focus
 */
function displayFocusResult() {
    const focusInfo = document.getElementById('focusInfo');
    const focus = currentAnalysis.focusLine;

    if (!focus) {
        focusInfo.innerHTML = '<p class="no-data">Aucune ligne de focus identifiée</p>';
        return;
    }

    focusInfo.innerHTML = `
        <div class="focus-highlight">
            <span class="focus-rune">${focus.runeName}</span>
            <span class="focus-value">+${focus.statValue}</span>
        </div>
        <div class="focus-details">
            <p>Poids: <strong>${focus.weight.toFixed(2)}</strong></p>
            <p>Rentabilité: <strong>${focus.profitability.toFixed(4)}</strong></p>
        </div>
    `;
}

/**
 * Affiche les pourcentages limites
 */
function displayLimitResult() {
    const limitInfo = document.getElementById('limitInfo');
    const limits = currentAnalysis.limitPercentages;

    const craftPrice = parseInt(document.getElementById('craftPrice').value) || 0;

    limitInfo.innerHTML = `
        <div class="limit-comparison">
            <div class="limit-option ${limits.useFocus ? 'recommended' : ''}">
                <h5>Avec Focus</h5>
                <span class="limit-value">${limits.withFocus === Infinity ? '∞' : limits.withFocus.toFixed(2)}%</span>
            </div>
            <div class="limit-option ${!limits.useFocus ? 'recommended' : ''}">
                <h5>Sans Focus</h5>
                <span class="limit-value">${limits.withoutFocus === Infinity ? '∞' : limits.withoutFocus.toFixed(2)}%</span>
            </div>
        </div>
        <div class="limit-recommendation">
            <p>Stratégie recommandée: <strong>${limits.recommendation}</strong></p>
            <p>% limite: <strong>${limits.bestPercentage === Infinity ? '∞' : limits.bestPercentage.toFixed(2)}%</strong></p>
            <p class="hint">Si votre item est au-dessus de ce pourcentage, le brisage est rentable pour un craft à ${formatKamas(craftPrice)}.</p>
        </div>
    `;
}

/**
 * Affiche les résultats de simulation de brisage
 */
function displayBrisageResult() {
    const brisageInfo = document.getElementById('brisageInfo');
    const sim = currentAnalysis.simulation;

    const isProfitable = sim.withMargin.totalKamas > 0;
    const statusClass = isProfitable ? 'profitable' : 'not-profitable';
    const statusText = isProfitable ? 'Rentable !' : 'Non rentable';

    brisageInfo.innerHTML = `
        <div class="brisage-status ${statusClass}">
            ${statusText}
        </div>

        <div class="brisage-summary">
            <h5>Avec marge de sécurité (${sim.marginPercentage}%)</h5>
            <div class="brisage-stats">
                <div class="brisage-stat">
                    <span class="stat-label">Brisages possibles</span>
                    <span class="stat-value">${sim.withMargin.iterations}</span>
                </div>
                <div class="brisage-stat">
                    <span class="stat-label">Gain total</span>
                    <span class="stat-value ${sim.withMargin.totalKamas >= 0 ? 'positive' : 'negative'}">
                        ${formatKamas(sim.withMargin.totalKamas)}
                    </span>
                </div>
                <div class="brisage-stat">
                    <span class="stat-label">Investissement</span>
                    <span class="stat-value">${formatKamas(sim.withMargin.investment)}</span>
                </div>
                <div class="brisage-stat">
                    <span class="stat-label">% final</span>
                    <span class="stat-value">${sim.withMargin.finalPercentage.toFixed(2)}%</span>
                </div>
                ${currentAnalysis.limitPercentages.useFocus ? `
                <div class="brisage-stat">
                    <span class="stat-label">Runes générées</span>
                    <span class="stat-value">${sim.withMargin.totalRunes.toFixed(1)}</span>
                </div>
                ` : ''}
            </div>
        </div>

        <div class="brisage-summary secondary">
            <h5>Sans marge (rentabilité max)</h5>
            <div class="brisage-stats">
                <div class="brisage-stat">
                    <span class="stat-label">Brisages possibles</span>
                    <span class="stat-value">${sim.withoutMargin.iterations}</span>
                </div>
                <div class="brisage-stat">
                    <span class="stat-label">Gain total</span>
                    <span class="stat-value ${sim.withoutMargin.totalKamas >= 0 ? 'positive' : 'negative'}">
                        ${formatKamas(sim.withoutMargin.totalKamas)}
                    </span>
                </div>
                <div class="brisage-stat">
                    <span class="stat-label">% final</span>
                    <span class="stat-value">${sim.withoutMargin.finalPercentage.toFixed(2)}%</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Simulation personnalisée avec nombre de brisages choisi
 */
function customSimulation() {
    if (!currentAnalysis) return;

    const numBrisages = parseInt(document.getElementById('customBrisageCount').value) || 1;
    const currentPercent = parseFloat(document.getElementById('currentPercent').value);
    const craftPrice = parseInt(document.getElementById('craftPrice').value) || 0;

    const prices = getRunePrices();
    const linesWithProfitability = calculateProfitability(
        analyzeItemStats(selectedItem.effects, selectedItem.level),
        prices
    );

    const profitability = currentAnalysis.limitPercentages.useFocus ?
        currentAnalysis.focusLine.profitability :
        linesWithProfitability.reduce((sum, l) => sum + (l.weight * l.ratio), 0);

    const result = simulateSpecificBrisages({
        initialPercentage: currentPercent,
        itemPrice: craftPrice,
        profitability: profitability,
        focusLine: currentAnalysis.limitPercentages.useFocus ? currentAnalysis.focusLine : null,
        lines: linesWithProfitability
    }, numBrisages);

    const resultDiv = document.getElementById('customBrisageResult');
    resultDiv.innerHTML = `
        <div class="custom-result-content">
            <p><strong>${numBrisages}</strong> brisage(s) simulé(s)</p>
            <p>Gain: <span class="${result.totalKamas >= 0 ? 'positive' : 'negative'}">${formatKamas(result.totalKamas)}</span></p>
            <p>% final: ${result.finalPercentage.toFixed(2)}%</p>
            <p>Investissement: ${formatKamas(result.investment)}</p>
            ${currentAnalysis.limitPercentages.useFocus ? `<p>Runes générées: ${result.totalRunes.toFixed(1)}</p>` : ''}
        </div>
    `;
}

/**
 * Affiche le détail des lignes de stats
 */
function displayLinesDetail() {
    const linesDetail = document.getElementById('linesDetail');
    const lines = currentAnalysis.lines;

    let html = '<table class="lines-table"><thead><tr>';
    html += '<th>Stat</th><th>Valeur</th><th>Rune</th><th>Poids</th><th>Ratio</th><th>Rentabilité</th>';
    html += '</tr></thead><tbody>';

    for (const line of lines.sort((a, b) => b.profitability - a.profitability)) {
        const isFocus = currentAnalysis.focusLine && line.runeKey === currentAnalysis.focusLine.runeKey;
        html += `<tr class="${isFocus ? 'focus-line' : ''}">`;
        html += `<td>${line.description || line.runeName}</td>`;
        html += `<td>+${line.statValue}</td>`;
        html += `<td>${line.runeName}</td>`;
        html += `<td>${line.weight.toFixed(2)}</td>`;
        html += `<td>${line.ratio.toFixed(6)}</td>`;
        html += `<td>${line.profitability.toFixed(4)}</td>`;
        html += '</tr>';
    }

    html += '</tbody></table>';
    linesDetail.innerHTML = html;
}

/**
 * Configure les écouteurs UI
 */
function setupUIListeners() {
    // Toggle détail des lignes
    document.getElementById('linesToggle').addEventListener('click', () => {
        const detail = document.getElementById('linesDetail');
        const icon = document.querySelector('#linesToggle .toggle-icon');

        if (detail.style.display === 'none') {
            detail.style.display = 'block';
            icon.textContent = '−';
        } else {
            detail.style.display = 'none';
            icon.textContent = '+';
        }
    });
}

/**
 * Formate un nombre en Kamas
 */
function formatKamas(value) {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(2) + ' M';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(1) + ' K';
    }
    return value.toFixed(0);
}

/**
 * Affiche une notification
 */
function showNotification(message, type = 'info') {
    // Créer une notification si elle n'existe pas
    let notification = document.querySelector('.notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.querySelector('.container').insertBefore(notification, document.querySelector('main'));
    }

    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', init);
