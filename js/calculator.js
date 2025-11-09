/**
 * Position Size Calculator
 * Calculates optimal position size based on account balance, risk percentage, and stop loss
 */

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const form = document.getElementById('calculator-form');
    const accountBalance = document.getElementById('account-balance');
    const riskPercent = document.getElementById('risk-percent');
    const entryPrice = document.getElementById('entry-price');
    const stopLoss = document.getElementById('stop-loss');
    const instrumentType = document.getElementById('instrument-type');
    const resultBox = document.getElementById('result-box');

    // Add input event listeners for real-time calculation
    const inputs = [accountBalance, riskPercent, entryPrice, stopLoss, instrumentType];
    inputs.forEach(input => {
        input.addEventListener('input', calculatePositionSize);
        input.addEventListener('change', calculatePositionSize);
    });

    // Form submit handler
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            calculatePositionSize();
        });
    }

    /**
     * Main calculation function
     */
    function calculatePositionSize() {
        // Get input values
        const balance = parseFloat(accountBalance.value);
        const risk = parseFloat(riskPercent.value);
        const entry = parseFloat(entryPrice.value);
        const stop = parseFloat(stopLoss.value);
        const instrument = instrumentType.value;

        // Validate inputs
        if (!validateInputs(balance, risk, entry, stop)) {
            hideResults();
            return;
        }

        // Calculate risk amount
        const riskAmount = balance * (risk / 100);

        // Calculate price difference (stop loss distance)
        const priceDiff = Math.abs(entry - stop);

        // Validate price difference
        if (priceDiff === 0) {
            showError('Entry price and stop loss cannot be the same');
            return;
        }

        // Calculate position size based on instrument type
        let positionSize;
        let unit;
        let additionalInfo = '';

        switch(instrument) {
            case 'forex':
                // Standard lot = 100,000 units
                // Position Size = Risk Amount / (Stop Loss in Pips × Pip Value)
                // Assuming 1 pip = 0.0001 for most pairs
                const pips = priceDiff / 0.0001;
                const pipValue = 10; // $10 per pip for standard lot
                positionSize = riskAmount / (pips * pipValue) * 100; // Convert to lots
                positionSize = Math.max(0.01, Math.round(positionSize * 100) / 100);
                unit = 'lots';
                additionalInfo = `Stop Loss Distance: ${pips.toFixed(1)} pips`;
                break;

            case 'stocks':
                // Position Size = Risk Amount / Price Difference
                positionSize = riskAmount / priceDiff;
                positionSize = Math.max(1, Math.round(positionSize));
                unit = 'shares';
                additionalInfo = `Price Distance: $${priceDiff.toFixed(2)}`;
                break;

            case 'indices':
                // Similar to stocks but can have fractional units
                positionSize = riskAmount / priceDiff;
                positionSize = Math.max(0.1, Math.round(positionSize * 10) / 10);
                unit = 'units';
                additionalInfo = `Price Distance: ${priceDiff.toFixed(2)} points`;
                break;

            case 'crypto':
                // Crypto can have very small or very large values
                positionSize = riskAmount / priceDiff;
                positionSize = Math.max(0.001, Math.round(positionSize * 1000) / 1000);
                unit = 'units';
                additionalInfo = `Price Distance: $${priceDiff.toFixed(2)}`;
                break;

            default:
                showError('Invalid instrument type');
                return;
        }

        // Calculate total position value
        const positionValue = instrument === 'forex'
            ? positionSize * 100000 * entry
            : positionSize * entry;

        // Display results
        displayResults({
            positionSize,
            unit,
            riskAmount,
            riskPercent: risk,
            positionValue,
            additionalInfo,
            direction: entry > stop ? 'LONG' : 'SHORT'
        });
    }

    /**
     * Validate input values
     */
    function validateInputs(balance, risk, entry, stop) {
        if (isNaN(balance) || balance <= 0) {
            return false;
        }
        if (isNaN(risk) || risk <= 0 || risk > 100) {
            return false;
        }
        if (isNaN(entry) || entry <= 0) {
            return false;
        }
        if (isNaN(stop) || stop <= 0) {
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

        resultBox.innerHTML = `
            <h3>Recommended Position Size</h3>

            <div class="result-item">
                <span class="result-label">Position Size:</span>
                <span class="result-value large">${data.positionSize} ${data.unit}</span>
            </div>

            <div class="result-item">
                <span class="result-label">Trade Direction:</span>
                <span class="result-value">${data.direction}</span>
            </div>

            <div class="result-item">
                <span class="result-label">Risk Amount:</span>
                <span class="result-value">$${data.riskAmount.toFixed(2)} (${data.riskPercent}%)</span>
            </div>

            <div class="result-item">
                <span class="result-label">Position Value:</span>
                <span class="result-value">$${data.positionValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>

            <div class="result-item">
                <span class="result-label">Additional Info:</span>
                <span class="result-value">${data.additionalInfo}</span>
            </div>

            <div class="alert alert-info mt-20">
                <strong>💡 Tip:</strong> This position size ensures you only risk ${data.riskPercent}% of your account balance if your stop loss is hit.
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
            instrumentType: instrumentType.value
        };
        localStorage.setItem('calculatorValues', JSON.stringify(values));
    }

    // Save values on input change
    accountBalance.addEventListener('change', saveValues);
    riskPercent.addEventListener('change', saveValues);
    instrumentType.addEventListener('change', saveValues);
});
