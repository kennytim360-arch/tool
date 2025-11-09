/**
 * Stop Loss / Take Profit Calculator
 * Strategy tester for €250 test account
 */

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const form = document.getElementById('calculator-form');
    const accountBalance = document.getElementById('account-balance');
    const entryPrice = document.getElementById('entry-price');
    const direction = document.getElementById('direction');
    const instrumentType = document.getElementById('instrument-type');
    const riskPercent = document.getElementById('risk-percent');
    const rewardRatio = document.getElementById('reward-ratio');
    const resultBox = document.getElementById('result-box');

    // Risk preset buttons
    const riskPresetBtns = document.querySelectorAll('.risk-preset-btn');

    // Add risk preset button handlers
    riskPresetBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const risk = this.getAttribute('data-risk');
            riskPercent.value = risk;

            // Remove active class from all buttons
            riskPresetBtns.forEach(b => b.style.opacity = '0.7');
            // Add active class to clicked button
            this.style.opacity = '1';

            calculateSLTP();
        });
    });

    // Add input event listeners for real-time calculation
    const inputs = [accountBalance, entryPrice, direction, instrumentType, riskPercent, rewardRatio];
    inputs.forEach(input => {
        input.addEventListener('input', calculateSLTP);
        input.addEventListener('change', calculateSLTP);
    });

    // Form submit handler
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateSLTP();
        });
    }

    /**
     * Main calculation function
     */
    function calculateSLTP() {
        // Get input values
        const balance = parseFloat(accountBalance.value);
        const entry = parseFloat(entryPrice.value);
        const dir = direction.value;
        const instrument = instrumentType.value;
        const risk = parseFloat(riskPercent.value);
        const reward = parseFloat(rewardRatio.value);

        // Validate inputs
        if (!validateInputs(balance, entry, risk)) {
            hideResults();
            return;
        }

        // Calculate risk amount in euros
        const riskAmount = balance * (risk / 100);
        const rewardAmount = riskAmount * reward;

        // Calculate Stop Loss and Take Profit prices
        let stopLoss, takeProfit;
        const riskDecimal = risk / 100;

        if (dir === 'long') {
            // LONG position
            stopLoss = entry * (1 - riskDecimal);
            takeProfit = entry * (1 + (riskDecimal * reward));
        } else {
            // SHORT position
            stopLoss = entry * (1 + riskDecimal);
            takeProfit = entry * (1 - (riskDecimal * reward));
        }

        // Calculate distance in pips/points
        let slDistance, tpDistance, unit;

        if (instrument === 'forex') {
            // Forex: calculate in pips (1 pip = 0.0001)
            slDistance = Math.abs(entry - stopLoss) * 10000;
            tpDistance = Math.abs(takeProfit - entry) * 10000;
            unit = 'pips';
        } else {
            // Stocks/Indices/Crypto: calculate in points or dollars
            slDistance = Math.abs(entry - stopLoss);
            tpDistance = Math.abs(takeProfit - entry);
            unit = instrument === 'crypto' ? '$' : 'points';
        }

        // Calculate new balances after win/loss
        const newBalanceWin = balance + rewardAmount;
        const newBalanceLoss = balance - riskAmount;

        // Calculate survival (consecutive losses until bust)
        const consecutiveLosses = Math.floor(100 / risk);

        // Calculate win rate needed for profitability
        const winRateNeeded = (1 / (1 + reward)) * 100;

        // Display results
        displayResults({
            stopLoss,
            takeProfit,
            slDistance,
            tpDistance,
            unit,
            riskAmount,
            rewardAmount,
            newBalanceWin,
            newBalanceLoss,
            direction: dir.toUpperCase(),
            entry,
            balance,
            risk,
            reward,
            consecutiveLosses,
            winRateNeeded,
            instrument
        });
    }

    /**
     * Validate input values
     */
    function validateInputs(balance, entry, risk) {
        if (isNaN(balance) || balance <= 0) {
            return false;
        }
        if (isNaN(entry) || entry <= 0) {
            return false;
        }
        if (isNaN(risk) || risk <= 0 || risk > 100) {
            return false;
        }
        return true;
    }

    /**
     * Display calculation results
     */
    function displayResults(data) {
        resultBox.style.display = 'block';
        resultBox.className = 'result-box fade-in';

        const directionColor = data.direction === 'LONG' ? 'var(--success-color)' : 'var(--danger-color)';

        // Determine risk level color
        let riskLevelColor = 'var(--success-color)';
        let riskLevelText = 'Conservative';
        if (data.risk >= 15) {
            riskLevelColor = 'var(--danger-color)';
            riskLevelText = 'Aggressive';
        } else if (data.risk >= 10) {
            riskLevelColor = 'var(--warning-color)';
            riskLevelText = 'Balanced';
        }

        resultBox.innerHTML = `
            <h3>Stop Loss & Take Profit Levels</h3>

            <div style="background: ${directionColor}; background: linear-gradient(135deg, ${directionColor}22, ${directionColor}11);
                        border-left: 4px solid ${directionColor}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span style="font-size: 0.9rem; color: var(--text-secondary);">Trade Direction</span>
                        <div style="font-size: 1.8rem; font-weight: 700; color: ${directionColor};">
                            ${data.direction}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-size: 0.9rem; color: var(--text-secondary);">Entry Price</span>
                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary);">
                            ${data.entry.toFixed(5)}
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-2" style="margin-bottom: 20px;">
                <div style="background: #fee2e2; padding: 15px; border-radius: 8px; border-left: 4px solid var(--danger-color);">
                    <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 5px;">
                        🛑 Stop Loss
                    </div>
                    <div style="font-size: 1.8rem; font-weight: 700; color: var(--danger-color);">
                        ${data.stopLoss.toFixed(5)}
                    </div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 5px;">
                        ${data.slDistance.toFixed(data.unit === 'pips' ? 1 : 2)} ${data.unit} ${data.direction === 'LONG' ? 'below' : 'above'} entry
                    </div>
                </div>

                <div style="background: #d1fae5; padding: 15px; border-radius: 8px; border-left: 4px solid var(--success-color);">
                    <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 5px;">
                        🎯 Take Profit
                    </div>
                    <div style="font-size: 1.8rem; font-weight: 700; color: var(--success-color);">
                        ${data.takeProfit.toFixed(5)}
                    </div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 5px;">
                        ${data.tpDistance.toFixed(data.unit === 'pips' ? 1 : 2)} ${data.unit} ${data.direction === 'LONG' ? 'above' : 'below'} entry
                    </div>
                </div>
            </div>

            <div style="border-top: 2px solid var(--border-color); padding-top: 20px; margin-top: 20px;">
                <h3 style="margin-bottom: 15px;">Potential Outcomes</h3>

                <div class="result-item">
                    <span class="result-label">Risk Amount:</span>
                    <span class="result-value" style="color: var(--danger-color);">
                        -€${data.riskAmount.toFixed(2)} (${data.risk}%)
                    </span>
                </div>

                <div class="result-item">
                    <span class="result-label">Reward Amount:</span>
                    <span class="result-value" style="color: var(--success-color);">
                        +€${data.rewardAmount.toFixed(2)} (${(data.rewardAmount/data.balance*100).toFixed(1)}%)
                    </span>
                </div>

                <div class="result-item">
                    <span class="result-label">Reward Ratio:</span>
                    <span class="result-value">1:${data.reward}</span>
                </div>

                <div class="grid grid-2" style="margin-top: 20px; gap: 10px;">
                    <div style="background: #fee2e2; padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 5px;">
                            If Stop Loss Hit
                        </div>
                        <div style="font-size: 1.3rem; font-weight: 700; color: var(--danger-color);">
                            €${data.newBalanceLoss.toFixed(2)}
                        </div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 3px;">
                            -€${data.riskAmount.toFixed(2)}
                        </div>
                    </div>

                    <div style="background: #d1fae5; padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 5px;">
                            If Take Profit Hit
                        </div>
                        <div style="font-size: 1.3rem; font-weight: 700; color: var(--success-color);">
                            €${data.newBalanceWin.toFixed(2)}
                        </div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 3px;">
                            +€${data.rewardAmount.toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>

            <div style="border-top: 2px solid var(--border-color); padding-top: 20px; margin-top: 20px;">
                <h3 style="margin-bottom: 15px;">Strategy Statistics</h3>

                <div class="result-item">
                    <span class="result-label">Risk Level:</span>
                    <span class="status-indicator" style="background-color: ${riskLevelColor}22; color: ${riskLevelColor}; border: 2px solid ${riskLevelColor};">
                        ${riskLevelText}
                    </span>
                </div>

                <div class="result-item">
                    <span class="result-label">Consecutive Losses Until Bust:</span>
                    <span class="result-value">${data.consecutiveLosses} trades</span>
                </div>

                <div class="result-item">
                    <span class="result-label">Win Rate Needed for Profit:</span>
                    <span class="result-value">${data.winRateNeeded.toFixed(1)}%</span>
                </div>

                <div class="result-item">
                    <span class="result-label">Account Balance:</span>
                    <span class="result-value">€${data.balance.toFixed(2)}</span>
                </div>
            </div>

            ${data.consecutiveLosses <= 5 ? `
                <div class="alert alert-danger mt-20">
                    <strong>🚨 EXTREME RISK:</strong> With ${data.risk}% risk per trade, you can only survive
                    ${data.consecutiveLosses} consecutive losses before your account is wiped out!
                    Consider reducing your risk percentage.
                </div>
            ` : data.consecutiveLosses <= 10 ? `
                <div class="alert alert-warning mt-20">
                    <strong>⚠️ HIGH RISK:</strong> You can survive ${data.consecutiveLosses} consecutive losses.
                    This is acceptable for testing, but monitor your win rate carefully.
                </div>
            ` : ''}

            <div class="alert alert-info mt-20">
                <strong>💡 Quick Copy for Broker:</strong><br>
                ${data.direction} @ ${data.entry.toFixed(5)}<br>
                SL: ${data.stopLoss.toFixed(5)} | TP: ${data.takeProfit.toFixed(5)}<br>
                Risk: €${data.riskAmount.toFixed(2)} (${data.risk}%) | Reward: €${data.rewardAmount.toFixed(2)} (1:${data.reward})
            </div>

            <div class="alert alert-success mt-20">
                <strong>📊 Strategy Test Tracking:</strong><br>
                Use the <a href="loss-monitor.html" style="color: var(--success-color); font-weight: 700;">Daily Loss Monitor</a>
                to log this trade and track your testing progress. Record whether SL or TP was hit!
            </div>
        `;
    }

    /**
     * Hide results
     */
    function hideResults() {
        resultBox.style.display = 'none';
    }

    /**
     * Show error message
     */
    function showError(message) {
        resultBox.style.display = 'block';
        resultBox.className = 'result-box fade-in';
        resultBox.innerHTML = `
            <div class="alert alert-danger">
                <strong>⚠️ Error:</strong> ${message}
            </div>
        `;
    }

    // Load saved values from localStorage
    loadSavedValues();

    /**
     * Load saved values from localStorage
     */
    function loadSavedValues() {
        const saved = localStorage.getItem('calculatorValues');
        if (saved) {
            try {
                const values = JSON.parse(saved);
                if (values.accountBalance) accountBalance.value = values.accountBalance;
                if (values.riskPercent) riskPercent.value = values.riskPercent;
                if (values.rewardRatio) rewardRatio.value = values.rewardRatio;
                if (values.instrumentType) instrumentType.value = values.instrumentType;
            } catch (e) {
                console.error('Error loading saved values:', e);
            }
        }
    }

    /**
     * Save values to localStorage
     */
    function saveValues() {
        const values = {
            accountBalance: accountBalance.value,
            riskPercent: riskPercent.value,
            rewardRatio: rewardRatio.value,
            instrumentType: instrumentType.value
        };
        localStorage.setItem('calculatorValues', JSON.stringify(values));
    }

    // Save values on input change
    accountBalance.addEventListener('change', saveValues);
    riskPercent.addEventListener('change', saveValues);
    rewardRatio.addEventListener('change', saveValues);
    instrumentType.addEventListener('change', saveValues);
});
