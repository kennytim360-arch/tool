/**
 * Economic Calendar Filter
 * Display high and medium impact economic events for major currencies
 */

// Economic events data
let events = [];
let filteredEvents = [];

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load events
    loadEvents();

    // Setup filter controls
    const filterImpact = document.getElementById('filter-impact');
    const filterCurrency = document.getElementById('filter-currency');
    const filterDate = document.getElementById('filter-date');
    const refreshBtn = document.getElementById('refresh-btn');
    const addEventBtn = document.getElementById('add-event-btn');

    if (filterImpact) {
        filterImpact.addEventListener('change', applyFilters);
    }

    if (filterCurrency) {
        filterCurrency.addEventListener('change', applyFilters);
    }

    if (filterDate) {
        filterDate.addEventListener('change', applyFilters);
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshEvents);
    }

    if (addEventBtn) {
        addEventBtn.addEventListener('click', showAddEventForm);
    }

    // Setup add event form
    const addEventForm = document.getElementById('add-event-form');
    if (addEventForm) {
        addEventForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addManualEvent();
        });
    }

    // Apply initial filters
    applyFilters();
});

/**
 * Load events from localStorage or use sample data
 */
function loadEvents() {
    const saved = localStorage.getItem('economicEvents');

    if (saved) {
        try {
            const data = JSON.parse(saved);
            events = data.events || [];
        } catch (e) {
            console.error('Error loading events:', e);
            events = getSampleEvents();
        }
    } else {
        events = getSampleEvents();
        saveEvents();
    }
}

/**
 * Save events to localStorage
 */
function saveEvents() {
    const data = {
        events,
        lastUpdate: new Date().toISOString()
    };
    localStorage.setItem('economicEvents', JSON.stringify(data));
}

/**
 * Get sample economic events
 */
function getSampleEvents() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return [
        {
            id: 1,
            date: formatDate(today),
            time: '08:30',
            currency: 'USD',
            event: 'Non-Farm Payrolls',
            impact: 'high',
            previous: '263K',
            forecast: '200K'
        },
        {
            id: 2,
            date: formatDate(today),
            time: '10:00',
            currency: 'USD',
            event: 'ISM Manufacturing PMI',
            impact: 'high',
            previous: '50.2',
            forecast: '49.8'
        },
        {
            id: 3,
            date: formatDate(today),
            time: '12:30',
            currency: 'EUR',
            event: 'ECB Interest Rate Decision',
            impact: 'high',
            previous: '4.50%',
            forecast: '4.25%'
        },
        {
            id: 4,
            date: formatDate(today),
            time: '14:00',
            currency: 'GBP',
            event: 'BOE Interest Rate Decision',
            impact: 'high',
            previous: '5.25%',
            forecast: '5.25%'
        },
        {
            id: 5,
            date: formatDate(today),
            time: '09:30',
            currency: 'EUR',
            event: 'German GDP',
            impact: 'medium',
            previous: '0.2%',
            forecast: '0.1%'
        },
        {
            id: 6,
            date: formatDate(tomorrow),
            time: '08:30',
            currency: 'USD',
            event: 'Initial Jobless Claims',
            impact: 'medium',
            previous: '228K',
            forecast: '230K'
        },
        {
            id: 7,
            date: formatDate(tomorrow),
            time: '10:00',
            currency: 'USD',
            event: 'Consumer Confidence',
            impact: 'medium',
            previous: '102.6',
            forecast: '103.0'
        },
        {
            id: 8,
            date: formatDate(tomorrow),
            time: '13:00',
            currency: 'JPY',
            event: 'BOJ Interest Rate Decision',
            impact: 'high',
            previous: '-0.10%',
            forecast: '-0.10%'
        },
        {
            id: 9,
            date: formatDate(tomorrow),
            time: '11:00',
            currency: 'CAD',
            event: 'GDP',
            impact: 'high',
            previous: '0.3%',
            forecast: '0.2%'
        },
        {
            id: 10,
            date: formatDate(tomorrow),
            time: '15:30',
            currency: 'AUD',
            event: 'RBA Interest Rate Decision',
            impact: 'high',
            previous: '4.35%',
            forecast: '4.35%'
        }
    ];
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Apply filters to events
 */
function applyFilters() {
    const impactFilter = document.getElementById('filter-impact').value;
    const currencyFilter = document.getElementById('filter-currency').value;
    const dateFilter = document.getElementById('filter-date').value;

    filteredEvents = events.filter(event => {
        // Impact filter
        if (impactFilter !== 'all' && event.impact !== impactFilter) {
            return false;
        }

        // Currency filter
        if (currencyFilter !== 'all' && event.currency !== currencyFilter) {
            return false;
        }

        // Date filter
        if (dateFilter !== 'all') {
            const today = formatDate(new Date());
            const tomorrow = formatDate(new Date(new Date().setDate(new Date().getDate() + 1)));

            if (dateFilter === 'today' && event.date !== today) {
                return false;
            }
            if (dateFilter === 'tomorrow' && event.date !== tomorrow) {
                return false;
            }
        }

        return true;
    });

    // Sort by date and time
    filteredEvents.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
    });

    displayEvents();
}

/**
 * Display filtered events
 */
function displayEvents() {
    const eventsContainer = document.getElementById('events-container');
    if (!eventsContainer) return;

    if (filteredEvents.length === 0) {
        eventsContainer.innerHTML = `
            <div class="alert alert-info">
                No events found matching the selected filters.
            </div>
        `;
        return;
    }

    let html = '';
    let currentDate = '';

    filteredEvents.forEach(event => {
        // Add date header if date changes
        if (event.date !== currentDate) {
            currentDate = event.date;
            const dateObj = new Date(event.date + 'T00:00:00');
            const dateLabel = getDateLabel(event.date);

            html += `
                <h3 style="margin-top: 30px; margin-bottom: 15px; color: var(--text-primary);">
                    ${dateLabel} - ${dateObj.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                    })}
                </h3>
            `;
        }

        const impactClass = event.impact === 'high' ? 'high-impact' : 'medium-impact';

        html += `
            <div class="event-item ${impactClass}">
                <div class="event-time">${event.time}</div>
                <div>
                    <span class="event-currency">${event.currency}</span>
                    <span class="event-name">${event.event}</span>
                </div>
                <div class="event-impact">
                    Impact: <strong>${event.impact.toUpperCase()}</strong>
                    ${event.forecast ? ` | Forecast: ${event.forecast}` : ''}
                    ${event.previous ? ` | Previous: ${event.previous}` : ''}
                </div>
            </div>
        `;
    });

    eventsContainer.innerHTML = html;
}

/**
 * Get date label (Today, Tomorrow, or date)
 */
function getDateLabel(dateString) {
    const today = formatDate(new Date());
    const tomorrow = formatDate(new Date(new Date().setDate(new Date().getDate() + 1)));

    if (dateString === today) return 'Today';
    if (dateString === tomorrow) return 'Tomorrow';
    return dateString;
}

/**
 * Refresh events
 */
function refreshEvents() {
    showMessage('Events refreshed', 'success');

    // In a real application, this would fetch from an API
    // For now, we'll just reload from localStorage
    loadEvents();
    applyFilters();
}

/**
 * Show add event form
 */
function showAddEventForm() {
    const formSection = document.getElementById('add-event-section');
    if (formSection) {
        formSection.style.display = formSection.style.display === 'none' ? 'block' : 'none';
    }
}

/**
 * Add manual event
 */
function addManualEvent() {
    const dateInput = document.getElementById('event-date');
    const timeInput = document.getElementById('event-time');
    const currencyInput = document.getElementById('event-currency');
    const nameInput = document.getElementById('event-name');
    const impactInput = document.getElementById('event-impact');
    const forecastInput = document.getElementById('event-forecast');
    const previousInput = document.getElementById('event-previous');

    // Validate inputs
    if (!dateInput.value || !timeInput.value || !currencyInput.value || !nameInput.value) {
        showMessage('Please fill in all required fields', 'danger');
        return;
    }

    // Create new event
    const newEvent = {
        id: Date.now(),
        date: dateInput.value,
        time: timeInput.value,
        currency: currencyInput.value,
        event: nameInput.value,
        impact: impactInput.value,
        forecast: forecastInput.value || '',
        previous: previousInput.value || ''
    };

    // Add to events array
    events.push(newEvent);

    // Save to localStorage
    saveEvents();

    // Reset form
    document.getElementById('add-event-form').reset();

    // Hide form
    document.getElementById('add-event-section').style.display = 'none';

    // Refresh display
    applyFilters();

    // Show success message
    showMessage('Event added successfully', 'success');
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
 * Set default date filters
 */
function setDefaultFilters() {
    const dateFilter = document.getElementById('filter-date');
    if (dateFilter) {
        dateFilter.value = 'today';
    }
}

// Set default filters on load
setDefaultFilters();
