/**
 * Daily Loss Limit Monitor
 * Track daily P&L and enforce loss limits to prevent revenge trading
 */

// Trade data stored in memory and localStorage
let trades = [];
let dailyLimit = 0;
let limitType = 'fixed'; // 'fixed' or 'percent'
let accountBalance = 0;

// Initialize monitor when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load saved data
    loadData();

    // Get DOM elements
    const setupForm = document.getElementById('setup-form');
    const tradeForm = document.getElementById('trade-form');
    const resetBtn = document.getElementById('reset-day-btn');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    // Setup form handler
    if (setupForm) {
        setupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveSetup();
        });
    }

    // Trade form handler
    if (tradeForm) {
        tradeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addTrade();
        });
    }

    // Reset day button
    if (resetBtn) {
        resetBtn.addEventListener('click', resetDay);
    }

    // Clear history button
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', clearHistory);
    }

    // Initialize display
    updateDisplay();
});

/**
 * Save setup configuration
 */
function saveSetup() {
    const balanceInput = document.getElementById('setup-balance');
    const limitTypeInput = document.getElementById('limit-type');
    const limitValueInput = document.getElementById('limit-value');

    accountBalance = parseFloat(balanceInput.value) || 0;
    limitType = limitTypeInput.value;
    const limitValue = parseFloat(limitValueInput.value) || 0;

    // Calculate daily limit
    if (limitType === 'fixed') {
        dailyLimit = limitValue;
    } else {
        dailyLimit = accountBalance * (limitValue / 100);
    }

    // Save to localStorage
    saveData();

    // Show success message
    showMessage('Setup saved successfully!', 'success');

    // Update display
    updateDisplay();
}

/**
 * Add a new trade
 */
function addTrade() {
    const resultInput = document.getElementById('trade-result');
    const notesInput = document.getElementById('trade-notes');

    const result = parseFloat(resultInput.value);
    if (isNaN(result) || result === 0) {
        showMessage('Please enter a valid trade result', 'danger');
        return;
    }

    const trade = {
        id: Date.now(),
        result: result,
        notes: notesInput.value || '',
        timestamp: new Date().toISOString()
    };

    trades.push(trade);

    // Save to localStorage
    saveData();

    // Reset form
    resultInput.value = '';
    notesInput.value = '';

    // Update display
    updateDisplay();

    // Show success message
    showMessage(`Trade added: ${result >= 0 ? '+' : ''}$${result.toFixed(2)}`, result >= 0 ? 'success' : 'warning');
}

/**
 * Calculate total P&L for the day
 */
function calculateTotalPL() {
    return trades.reduce((sum, trade) => sum + trade.result, 0);
}

/**
 * Calculate total losses for the day
 */
function calculateTotalLoss() {
    return trades
        .filter(trade => trade.result < 0)
        .reduce((sum, trade) => sum + Math.abs(trade.result), 0);
}

/**
 * Get status based on loss limit utilization
 */
function getStatus(lossAmount) {
    if (dailyLimit === 0) return 'normal';

    const utilization = (lossAmount / dailyLimit) * 100;

    if (utilization >= 80) return 'critical';
    if (utilization >= 50) return 'warning';
    return 'normal';
}

/**
 * Update display with current data
 */
function updateDisplay() {
    const totalPL = calculateTotalPL();
    const totalLoss = calculateTotalLoss();
    const status = getStatus(totalLoss);
    const remainingLimit = Math.max(0, dailyLimit - totalLoss);
    const utilizationPercent = dailyLimit > 0 ? Math.min(100, (totalLoss / dailyLimit) * 100) : 0;

    // Update summary
    const summaryDiv = document.getElementById('summary');
    if (summaryDiv) {
        let statusClass = 'status-normal';
        let statusText = 'NORMAL';
        let statusMessage = 'Trading within safe limits';
        let alertClass = 'alert-success';

        if (status === 'warning') {
            statusClass = 'status-warning';
            statusText = 'WARNING';
            statusMessage = '⚠️ Approaching daily loss limit. Trade with extra caution.';
            alertClass = 'alert-warning';
        } else if (status === 'critical') {
            statusClass = 'status-critical';
            statusText = 'CRITICAL';
            statusMessage = '🛑 Daily loss limit reached! Consider stopping trading for today.';
            alertClass = 'alert-danger';
        }

        summaryDiv.innerHTML = `
            <div class="result-item">
                <span class="result-label">Daily P&L:</span>
                <span class="result-value large" style="color: ${totalPL >= 0 ? 'var(--success-color)' : 'var(--danger-color)'}">
                    ${totalPL >= 0 ? '+' : ''}$${totalPL.toFixed(2)}
                </span>
            </div>

            <div class="result-item">
                <span class="result-label">Total Losses:</span>
                <span class="result-value">$${totalLoss.toFixed(2)}</span>
            </div>

            <div class="result-item">
                <span class="result-label">Daily Loss Limit:</span>
                <span class="result-value">$${dailyLimit.toFixed(2)}</span>
            </div>

            <div class="result-item">
                <span class="result-label">Remaining Limit:</span>
                <span class="result-value">$${remainingLimit.toFixed(2)}</span>
            </div>

            <div class="result-item">
                <span class="result-label">Status:</span>
                <span class="status-indicator ${statusClass}">${statusText}</span>
            </div>

            <div class="progress-container mt-20">
                <div class="progress-bar">
                    <div class="progress-fill ${status === 'warning' ? 'warning' : status === 'critical' ? 'danger' : ''}"
                         style="width: ${utilizationPercent}%">
                        ${utilizationPercent.toFixed(0)}%
                    </div>
                </div>
            </div>

            ${status !== 'normal' ? `
                <div class="alert ${alertClass} mt-20">
                    ${statusMessage}
                </div>
            ` : ''}
        `;
    }

    // Update trade history
    updateTradeHistory();

    // Update stats
    updateStats();
}

/**
 * Update trade history table
 */
function updateTradeHistory() {
    const historyDiv = document.getElementById('trade-history');
    if (!historyDiv) return;

    if (trades.length === 0) {
        historyDiv.innerHTML = '<p class="text-center" style="color: var(--text-secondary); padding: 20px;">No trades recorded today</p>';
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>Time</th>
                    <th>Result</th>
                    <th>Notes</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Show most recent trades first
    const sortedTrades = [...trades].reverse();

    sortedTrades.forEach(trade => {
        const time = new Date(trade.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const resultColor = trade.result >= 0 ? 'var(--success-color)' : 'var(--danger-color)';

        html += `
            <tr>
                <td>${time}</td>
                <td style="color: ${resultColor}; font-weight: 700;">
                    ${trade.result >= 0 ? '+' : ''}$${trade.result.toFixed(2)}
                </td>
                <td>${trade.notes || '-'}</td>
                <td>
                    <button class="btn btn-danger" style="padding: 6px 12px; font-size: 0.85rem;"
                            onclick="deleteTrade(${trade.id})">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    historyDiv.innerHTML = html;
}

/**
 * Update statistics
 */
function updateStats() {
    const statsDiv = document.getElementById('stats');
    if (!statsDiv) return;

    const totalTrades = trades.length;
    const winningTrades = trades.filter(t => t.result > 0).length;
    const losingTrades = trades.filter(t => t.result < 0).length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades * 100) : 0;

    const totalWins = trades
        .filter(t => t.result > 0)
        .reduce((sum, t) => sum + t.result, 0);

    const totalLosses = trades
        .filter(t => t.result < 0)
        .reduce((sum, t) => sum + Math.abs(t.result), 0);

    const avgWin = winningTrades > 0 ? totalWins / winningTrades : 0;
    const avgLoss = losingTrades > 0 ? totalLosses / losingTrades : 0;

    statsDiv.innerHTML = `
        <div class="grid grid-3">
            <div>
                <div class="result-label">Total Trades</div>
                <div class="result-value">${totalTrades}</div>
            </div>
            <div>
                <div class="result-label">Win Rate</div>
                <div class="result-value" style="color: ${winRate >= 50 ? 'var(--success-color)' : 'var(--danger-color)'}">
                    ${winRate.toFixed(1)}%
                </div>
            </div>
            <div>
                <div class="result-label">W/L Ratio</div>
                <div class="result-value">${winningTrades}/${losingTrades}</div>
            </div>
            <div>
                <div class="result-label">Avg Win</div>
                <div class="result-value" style="color: var(--success-color)">+$${avgWin.toFixed(2)}</div>
            </div>
            <div>
                <div class="result-label">Avg Loss</div>
                <div class="result-value" style="color: var(--danger-color)">-$${avgLoss.toFixed(2)}</div>
            </div>
            <div>
                <div class="result-label">Net P&L</div>
                <div class="result-value" style="color: ${calculateTotalPL() >= 0 ? 'var(--success-color)' : 'var(--danger-color)'}">
                    ${calculateTotalPL() >= 0 ? '+' : ''}$${calculateTotalPL().toFixed(2)}
                </div>
            </div>
        </div>
    `;
}

/**
 * Delete a trade
 */
function deleteTrade(tradeId) {
    if (confirm('Are you sure you want to delete this trade?')) {
        trades = trades.filter(t => t.id !== tradeId);
        saveData();
        updateDisplay();
        showMessage('Trade deleted', 'info');
    }
}

/**
 * Reset day - clear all trades
 */
function resetDay() {
    if (confirm('Are you sure you want to reset the day? This will clear all trades.')) {
        trades = [];
        saveData();
        updateDisplay();
        showMessage('Day reset successfully', 'success');
    }
}

/**
 * Clear all history and setup
 */
function clearHistory() {
    if (confirm('Are you sure you want to clear ALL data including setup? This cannot be undone.')) {
        trades = [];
        dailyLimit = 0;
        limitType = 'fixed';
        accountBalance = 0;
        localStorage.removeItem('monitorData');
        updateDisplay();
        showMessage('All data cleared', 'info');

        // Reset forms
        document.getElementById('setup-form').reset();
        document.getElementById('trade-form').reset();
    }
}

/**
 * Show message to user
 */
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) return;

    messageDiv.className = `alert alert-${type} fade-in`;
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

/**
 * Save data to localStorage
 */
function saveData() {
    const data = {
        trades,
        dailyLimit,
        limitType,
        accountBalance,
        date: new Date().toDateString()
    };
    localStorage.setItem('monitorData', JSON.stringify(data));
}

/**
 * Load data from localStorage
 */
function loadData() {
    const saved = localStorage.getItem('monitorData');
    if (!saved) return;

    try {
        const data = JSON.parse(saved);
        const today = new Date().toDateString();

        // Check if data is from today
        if (data.date === today) {
            trades = data.trades || [];
            dailyLimit = data.dailyLimit || 0;
            limitType = data.limitType || 'fixed';
            accountBalance = data.accountBalance || 0;

            // Restore form values
            const balanceInput = document.getElementById('setup-balance');
            const limitTypeInput = document.getElementById('limit-type');
            const limitValueInput = document.getElementById('limit-value');

            if (balanceInput && accountBalance) balanceInput.value = accountBalance;
            if (limitTypeInput && limitType) limitTypeInput.value = limitType;
            if (limitValueInput && dailyLimit) {
                if (limitType === 'fixed') {
                    limitValueInput.value = dailyLimit;
                } else {
                    limitValueInput.value = accountBalance > 0 ? (dailyLimit / accountBalance * 100).toFixed(2) : 0;
                }
            }
        } else {
            // Data is from a previous day, start fresh
            trades = [];
            saveData();
        }
    } catch (e) {
        console.error('Error loading data:', e);
    }
}

// Make deleteTrade available globally
window.deleteTrade = deleteTrade;
