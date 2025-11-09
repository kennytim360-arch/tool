/**
 * Position Size Calculator (All-In Trading Version)
 * Calculates maximum position size and potential profit for all-in trades
 */

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const form = document.getElementById('calculator-form');
    const accountBalance = document.getElementById('account-balance');
    const leverage = document.getElementById('leverage');
    const entryPrice = document.getElementById('entry-price');
    const exitPrice = document.getElementById('exit-price');
    const instrumentType = document.getElementById('instrument-type');
    const resultBox = document.getElementById('result-box');

    // Add input event listeners for real-time calculation
    const inputs = [accountBalance, leverage, entryPrice, exitPrice, instrumentType];
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
        const leverageValue = parseFloat(leverage.value);
        const entry = parseFloat(entryPrice.value);
        const exit = parseFloat(exitPrice.value);
        const instrument = instrumentType.value;

        // Validate inputs
        if (!validateInputs(balance, leverageValue, entry, exit)) {
            hideResults();
            return;
        }

        // Determine trade direction
        const direction = exit > entry ? 'LONG' : 'SHORT';
        const priceDiff = Math.abs(exit - entry);

        // Calculate price difference percentage
        const priceChangePercent = (priceDiff / entry) * 100;

        // Calculate buying power with leverage
        const buyingPower = balance * leverageValue;

        // Calculate position size based on instrument type
        let positionSize;
        let unit;
        let marginRequired;
        let potentialProfit;
        let potentialProfitPercent;
        let additionalInfo = '';

        switch(instrument) {
            case 'forex':
                // For Forex: Calculate in lots
                // 1 standard lot = 100,000 units
                // Position size in units = Buying Power / Entry Price
                const positionUnits = buyingPower / entry;
                positionSize = positionUnits / 100000; // Convert to standard lots
                positionSize = Math.round(positionSize * 100) / 100; // Round to 2 decimals

                // Calculate potential profit
                // For forex, pip value for 1 lot = $10 (for most pairs)
                const pips = (priceDiff / 0.0001);
                potentialProfit = positionSize * pips * 10; // $10 per pip per lot

                unit = 'lots';
                marginRequired = (positionSize * 100000 * entry) / leverageValue;
                additionalInfo = `${pips.toFixed(1)} pips target | ${positionUnits.toLocaleString()} units`;
                break;

            case 'stocks':
                // For stocks: Calculate number of shares
                positionSize = Math.floor(buyingPower / entry);
                potentialProfit = positionSize * priceDiff;

                unit = 'shares';
                marginRequired = (positionSize * entry) / leverageValue;
                additionalInfo = `Price move: $${priceDiff.toFixed(2)} per share`;
                break;

            case 'indices':
                // For indices: Similar to stocks but allow decimals
                positionSize = buyingPower / entry;
                positionSize = Math.round(positionSize * 10) / 10; // Round to 1 decimal
                potentialProfit = positionSize * priceDiff;

                unit = 'units';
                marginRequired = (positionSize * entry) / leverageValue;
                additionalInfo = `Price move: ${priceDiff.toFixed(2)} points`;
                break;

            case 'crypto':
                // For crypto: Calculate with more precision
                positionSize = buyingPower / entry;
                positionSize = Math.round(positionSize * 1000) / 1000; // Round to 3 decimals
                potentialProfit = positionSize * priceDiff;

                unit = 'units';
                marginRequired = (positionSize * entry) / leverageValue;
                additionalInfo = `Price move: $${priceDiff.toFixed(2)}`;
                break;

            default:
                showError('Invalid instrument type');
                return;
        }

        // Calculate position value
        const positionValue = instrument === 'forex'
            ? positionSize * 100000 * entry
            : positionSize * entry;

        // Calculate potential profit as percentage of account
        potentialProfitPercent = (potentialProfit / balance) * 100;

        // Calculate potential ROI
        const roi = (potentialProfit / balance) * 100;

        // Calculate risk of margin call (approximate)
        const priceMovementForMarginCall = (balance / positionSize);
        const marginCallPercent = (priceMovementForMarginCall / entry) * 100;

        // Display results
        displayResults({
            positionSize,
            unit,
            potentialProfit,
            potentialProfitPercent,
            roi,
            positionValue,
            marginRequired,
            buyingPower,
            additionalInfo,
            direction,
            priceChangePercent,
            marginCallPercent,
            leverage: leverageValue,
            balance
        });
    }

    /**
     * Validate input values
     */
    function validateInputs(balance, leverage, entry, exit) {
        if (isNaN(balance) || balance <= 0) {
            return false;
        }
        if (isNaN(leverage) || leverage <= 0) {
            return false;
        }
        if (isNaN(entry) || entry <= 0) {
            return false;
        }
        if (isNaN(exit) || exit <= 0) {
            return false;
        }
        if (entry === exit) {
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

        const profitColor = data.potentialProfit >= 0 ? 'var(--success-color)' : 'var(--danger-color)';

        resultBox.innerHTML = `
            <h3>Maximum Position Size & Profit Potential</h3>

            <div class="result-item">
                <span class="result-label">Position Size:</span>
                <span class="result-value large">${data.positionSize.toLocaleString()} ${data.unit}</span>
            </div>

            <div class="result-item">
                <span class="result-label">Trade Direction:</span>
                <span class="result-value" style="color: ${data.direction === 'LONG' ? 'var(--success-color)' : 'var(--danger-color)'}">
                    ${data.direction}
                </span>
            </div>

            <div class="result-item">
                <span class="result-label">Position Value:</span>
                <span class="result-value">$${data.positionValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>

            <div class="result-item">
                <span class="result-label">Buying Power (${data.leverage}x):</span>
                <span class="result-value">$${data.buyingPower.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>

            <div class="result-item">
                <span class="result-label">Margin Required:</span>
                <span class="result-value">$${data.marginRequired.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>

            <div style="border-top: 2px solid var(--primary-color); margin: 20px 0; padding-top: 20px;">
                <div class="result-item">
                    <span class="result-label">Potential Profit:</span>
                    <span class="result-value large" style="color: ${profitColor}">
                        $${data.potentialProfit.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </span>
                </div>

                <div class="result-item">
                    <span class="result-label">Profit % of Account:</span>
                    <span class="result-value" style="color: ${profitColor}">
                        ${data.potentialProfitPercent.toFixed(2)}%
                    </span>
                </div>

                <div class="result-item">
                    <span class="result-label">ROI on Capital:</span>
                    <span class="result-value" style="color: ${profitColor}">
                        ${data.roi.toFixed(2)}%
                    </span>
                </div>

                <div class="result-item">
                    <span class="result-label">Target Price Move:</span>
                    <span class="result-value">${data.priceChangePercent.toFixed(2)}%</span>
                </div>
            </div>

            <div class="result-item">
                <span class="result-label">Additional Info:</span>
                <span class="result-value" style="font-size: 1rem;">${data.additionalInfo}</span>
            </div>

            ${data.marginCallPercent < 5 ? `
                <div class="alert alert-danger mt-20">
                    <strong>🚨 EXTREME RISK:</strong> With this leverage, a price move of only ${data.marginCallPercent.toFixed(2)}%
                    against your position could trigger a margin call and wipe out your account!
                </div>
            ` : data.marginCallPercent < 10 ? `
                <div class="alert alert-warning mt-20">
                    <strong>⚠️ HIGH RISK:</strong> A price move of ${data.marginCallPercent.toFixed(2)}% against your position
                    could trigger a margin call. Monitor your trade closely!
                </div>
            ` : ''}

            <div class="alert alert-info mt-20">
                <strong>💡 Summary:</strong> You can buy ${data.positionSize.toLocaleString()} ${data.unit}
                using ${data.leverage}x leverage. If your target is hit, you'll make
                $${data.potentialProfit.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                (${data.roi.toFixed(2)}% ROI).
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
                if (values.leverage) leverage.value = values.leverage;
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
            leverage: leverage.value,
            instrumentType: instrumentType.value
        };
        localStorage.setItem('calculatorValues', JSON.stringify(values));
    }

    // Save values on input change
    accountBalance.addEventListener('change', saveValues);
    leverage.addEventListener('change', saveValues);
    instrumentType.addEventListener('change', saveValues);
});
