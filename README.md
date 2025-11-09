# CFD Trading Toolkit

![Version](https://img.shields.io/badge/version-1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

A comprehensive, lightweight trading toolkit designed for CFD day traders focused on risk management, trading discipline, and market awareness. Built with vanilla JavaScript for maximum compatibility and offline functionality.

## 🎯 Overview

This toolkit provides three essential tools that every disciplined trader needs:

1. **Position Size Calculator** - Prevent over-leveraging with precise position sizing
2. **Daily Loss Limit Monitor** - Maintain emotional discipline and prevent revenge trading
3. **Economic Calendar Filter** - Stay aware of high-impact market events

## ✨ Features

### Position Size Calculator
- ✅ Real-time position size calculations
- ✅ Support for Forex, Stocks, Indices, and Crypto
- ✅ Risk percentage-based calculations
- ✅ Automatic direction detection (Long/Short)
- ✅ Position value and risk amount display
- ✅ Saves your preferences in browser

### Daily Loss Limit Monitor
- ✅ Real-time P&L tracking
- ✅ Customizable loss limits (fixed $ or %)
- ✅ Color-coded status alerts (Normal/Warning/Critical)
- ✅ Trade history with timestamps
- ✅ Win rate and performance statistics
- ✅ Auto-resets daily, persists through browser refresh

### Economic Calendar Filter
- ✅ Display high and medium impact events
- ✅ Focus on major currencies (USD, EUR, GBP, JPY, etc.)
- ✅ Filter by impact level, currency, and date
- ✅ Manual event entry capability
- ✅ Sample events included for demo
- ✅ Impact level guide and trading tips

## 📁 Project Structure

```
trading-tools/
├── index.html                  # Main dashboard
├── position-calculator.html    # Position size calculator tool
├── loss-monitor.html          # Daily loss limit monitor tool
├── economic-calendar.html     # Economic calendar filter tool
├── README.md                  # This file
├── css/
│   └── style.css             # Global styles (responsive, mobile-friendly)
├── js/
│   ├── calculator.js         # Position calculator logic
│   ├── monitor.js           # Loss monitor logic
│   └── calendar.js          # Economic calendar logic
└── data/
    └── economic-events.json  # Sample economic events data
```

## 🚀 Quick Start

### Method 1: Local File (Recommended for Offline Use)

1. **Download or clone this repository**
   ```bash
   git clone <repository-url>
   cd trading-tools
   ```

2. **Open in your browser**
   - Simply double-click `index.html`
   - Or open it in your preferred browser:
     ```bash
     # macOS
     open index.html

     # Linux
     xdg-open index.html

     # Windows
     start index.html
     ```

3. **That's it!** No installation, no dependencies, no setup required.

### Method 2: Local Web Server (Optional)

If you prefer running a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (install http-server globally first)
npx http-server -p 8000
```

Then open `http://localhost:8000` in your browser.

## 📖 How to Use

### Position Size Calculator

1. Navigate to the Position Calculator
2. Enter your **Account Balance**
3. Set your **Risk Percentage** (recommended: 1-2%)
4. Enter your planned **Entry Price**
5. Enter your **Stop Loss Price**
6. Select your **Instrument Type**
7. The calculator will automatically compute your optimal position size

**Example:**
- Account Balance: $10,000
- Risk Per Trade: 1% ($100)
- Entry Price: 1.2500 (EUR/USD)
- Stop Loss: 1.2450 (50 pips)
- Result: **0.20 lots** (20,000 units)

### Daily Loss Limit Monitor

1. Navigate to the Loss Monitor
2. **Setup Your Limits:**
   - Enter your account balance
   - Choose limit type (Fixed $ or Percentage)
   - Set your daily loss limit (recommended: 2-5% of balance)
   - Click "Save Setup"

3. **Record Each Trade:**
   - Enter trade result (negative for losses, positive for wins)
   - Add optional notes about the trade
   - Click "Add Trade"

4. **Monitor Your Status:**
   - **GREEN (Normal)**: < 50% of daily limit used
   - **YELLOW (Warning)**: 50-80% of daily limit used
   - **RED (Critical)**: ≥ 80% of daily limit - STOP TRADING

5. **Daily Reset:**
   - Data automatically resets for new trading days
   - Or manually reset using "Reset Day" button

### Economic Calendar Filter

1. Navigate to the Economic Calendar
2. **Filter Events:**
   - Select impact level (High/Medium/All)
   - Choose specific currency or all
   - Select date range (Today/Tomorrow/Both)

3. **Add Manual Events:**
   - Click "Add Manual Event"
   - Fill in event details
   - Submit to add to calendar

4. **Trading Tips:**
   - Avoid trading 15 minutes before/after high-impact events
   - Tighten stops during major announcements
   - Expect wider spreads and increased volatility

## 💾 Data Storage

All tools use **localStorage** to persist data:

- **Position Calculator**: Saves your account balance, risk %, and instrument type
- **Loss Monitor**: Saves setup, trades, and daily limits (auto-resets daily)
- **Economic Calendar**: Saves manually added events

**Privacy Note:** All data stays in your browser. Nothing is sent to any server.

## 🎨 Customization

### Changing Colors

Edit `css/style.css` and modify the CSS variables:

```css
:root {
    --primary-color: #2563eb;    /* Main brand color */
    --success-color: #10b981;    /* Green for wins */
    --warning-color: #f59e0b;    /* Yellow for warnings */
    --danger-color: #ef4444;     /* Red for alerts */
}
```

### Adding API Integration

To integrate real economic calendar APIs (e.g., Forex Factory, Investing.com):

1. Edit `js/calendar.js`
2. Modify the `loadEvents()` function:

```javascript
async function loadEvents() {
    try {
        const response = await fetch('YOUR_API_ENDPOINT');
        const data = await response.json();
        events = data.events;
        saveEvents();
    } catch (error) {
        console.error('API error:', error);
        events = getSampleEvents(); // Fallback to sample data
    }
}
```

### Modifying Calculation Logic

Edit the instrument-specific calculations in `js/calculator.js`:

```javascript
case 'forex':
    // Customize forex calculation
    const pips = priceDiff / 0.0001;
    const pipValue = 10;
    positionSize = riskAmount / (pips * pipValue) * 100;
    break;
```

## 📱 Mobile Support

All tools are fully responsive and work on:
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Tablets (iPad, Android tablets)
- Mobile phones (iPhone, Android)

## ⚠️ Risk Disclaimer

**IMPORTANT:** Trading CFDs involves significant risk of loss. This toolkit is provided for educational purposes and to assist with risk management. Always:

- Never risk more than you can afford to lose
- Use stop losses on every trade
- Follow your trading plan strictly
- Consider seeking advice from a licensed financial advisor

## 🔧 Troubleshooting

### Calculator not showing results?
- Check that all required fields are filled
- Ensure entry price and stop loss are different values
- Verify numbers are positive and valid

### Loss monitor not saving data?
- Check that browser localStorage is enabled
- Try clearing browser cache and reloading
- Ensure you clicked "Save Setup" before adding trades

### Economic calendar showing no events?
- Check your filter settings
- Try clicking "Refresh Events"
- Add manual events if needed

## 🛠️ Technical Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern responsive design with CSS Grid and Flexbox
- **Vanilla JavaScript** - No frameworks, no dependencies
- **localStorage API** - Client-side data persistence

## 📊 Browser Compatibility

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Opera: ✅ Fully supported
- IE11: ⚠️ Limited support (localStorage works, some CSS may differ)

## 🤝 Contributing

This is a personal trading toolkit, but if you'd like to suggest improvements:

1. Identify the issue or enhancement
2. Create a detailed description
3. Submit via your preferred method

## 📝 Future Enhancements

Potential features for future versions:

- [ ] Trade journal with chart annotations
- [ ] Correlation matrix for currency pairs
- [ ] Pip calculator and currency converter
- [ ] Risk/reward ratio calculator
- [ ] Multiple timeframe analysis tool
- [ ] API integration for live economic events
- [ ] Export data to CSV
- [ ] Dark mode toggle

## 📄 License

MIT License - Feel free to use, modify, and distribute.

## 👤 Author

Built for CFD day traders who value:
- Risk management over big wins
- Discipline over emotion
- Consistency over perfection

---

## 🎓 Trading Tips

### Position Sizing
> "Risk management is the difference between a profitable career and a blown account."

- Always risk 1-2% per trade
- Never increase risk after losses
- Account for spread and slippage
- Use the calculator BEFORE entering trades

### Loss Limits
> "The best traders protect capital first, make profits second."

- Set daily limits and stick to them
- Take breaks after hitting 50% of limit
- STOP trading at 80% of limit
- Reset mentally before next session

### Economic Events
> "Don't be in the market when the market is making up its mind."

- Avoid trading 15 mins before/after high-impact news
- Close or tighten stops during major events
- NFP, FOMC, ECB are the highest impact events
- Volatility = opportunity for pros, danger for amateurs

---

**Happy Trading! 🚀**

*Remember: The goal is not to be right, but to make money. Protect your capital, follow your rules, and success will follow.*
