// AirNow Dashboard JavaScript

// WebSocket connection using SignalR
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/sensorHub")
    .build();

// Chart contexts
const lineCtx = document.getElementById('lineChart').getContext('2d');
const barCtx = document.getElementById('barChart').getContext('2d');

// Chart configuration
const chartColors = {
    pm25: '#ef4444',
    ozone: '#3b82f6',
    pm10: '#10b981'
};

// Line chart for trends
const lineChart = new Chart(lineCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'PM2.5',
                data: [],
                borderColor: chartColors.pm25,
                backgroundColor: `${chartColors.pm25}20`,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 6
            },
            {
                label: 'Ozone',
                data: [],
                borderColor: chartColors.ozone,
                backgroundColor: `${chartColors.ozone}20`,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 6
            },
            {
                label: 'PM10',
                data: [],
                borderColor: chartColors.pm10,
                backgroundColor: `${chartColors.pm10}20`,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 6
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: '#ffffff' }
            }
        },
        scales: {
            x: {
                ticks: { color: '#9ca3af' },
                grid: { color: '#374151' }
            },
            y: {
                ticks: { color: '#9ca3af' },
                grid: { color: '#374151' },
                title: {
                    display: true,
                    text: 'AQI',
                    color: '#ffffff'
                }
            }
        },
        elements: {
            line: {
                borderWidth: 2
            }
        }
    }
});

// Bar chart for current values
const barChart = new Chart(barCtx, {
    type: 'bar',
    data: {
        labels: ['PM2.5', 'Ozone', 'PM10'],
        datasets: [{
            label: 'Current AQI',
            data: [0, 0, 0],
            backgroundColor: [chartColors.pm25, chartColors.ozone, chartColors.pm10],
            borderColor: ['#dc2626', '#2563eb', '#059669'],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: '#ffffff' }
            }
        },
        scales: {
            x: {
                ticks: { color: '#9ca3af' },
                grid: { color: '#374151' }
            },
            y: {
                ticks: { color: '#9ca3af' },
                grid: { color: '#374151' },
                title: {
                    display: true,
                    text: 'AQI',
                    color: '#ffffff'
                },
                beginAtZero: true
            }
        }
    }
});

// Data storage
let sensorData = {
    'PM2.5': { value: 0, quality: '', timestamps: [], values: [] },
    'Ozone': { value: 0, quality: '', timestamps: [], values: [] },
    'PM10': { value: 0, quality: '', timestamps: [], values: [] }
};

// AQI color and quality mapping
function getAQIColor(aqi) {
    if (aqi <= 50) return '#10b981'; // Good - Green
    if (aqi <= 100) return '#f59e0b'; // Moderate - Yellow
    if (aqi <= 150) return '#f97316'; // Unhealthy for Sensitive - Orange
    if (aqi <= 200) return '#ef4444'; // Unhealthy - Red
    if (aqi <= 300) return '#8b5cf6'; // Very Unhealthy - Purple
    return '#991b1b'; // Hazardous - Maroon
}

function getAQIClass(aqi) {
    if (aqi <= 50) return 'aqi-good';
    if (aqi <= 100) return 'aqi-moderate';
    if (aqi <= 150) return 'aqi-unhealthy-sensitive';
    if (aqi <= 200) return 'aqi-unhealthy';
    if (aqi <= 300) return 'aqi-very-unhealthy';
    return 'aqi-hazardous';
}

// Update UI elements
function updateSensorCard(sensorType, aqi, quality) {
    const prefix = sensorType.toLowerCase().replace('.', '');

    // Update values
    document.getElementById(`${prefix}-value`).textContent = aqi;
    const qualityElement = document.getElementById(`${prefix}-quality`);
    qualityElement.textContent = quality;

    // Update colors
    const dot = document.getElementById(`${prefix}-dot`);
    dot.style.backgroundColor = getAQIColor(aqi);
    dot.style.boxShadow = `0 0 15px ${getAQIColor(aqi)}40`;

    // Add quality color class
    qualityElement.className = `text-sm mt-1 ${getAQIClass(aqi)}`;
}

// Update charts with animation
function updateCharts() {
    const now = new Date().toLocaleTimeString();

    // Update line chart
    lineChart.data.labels.push(now);
    if (lineChart.data.labels.length > 20) {
        lineChart.data.labels.shift();
    }

    lineChart.data.datasets.forEach((dataset, index) => {
        const sensorTypes = ['PM2.5', 'Ozone', 'PM10'];
        const sensorType = sensorTypes[index];
        dataset.data.push(sensorData[sensorType].value);
        if (dataset.data.length > 20) {
            dataset.data.shift();
        }
    });
    lineChart.update('active');

    // Update bar chart with new colors based on AQI levels
    const currentData = [
        sensorData['PM2.5'].value,
        sensorData['Ozone'].value,
        sensorData['PM10'].value
    ];

    barChart.data.datasets[0].data = currentData;
    barChart.data.datasets[0].backgroundColor = currentData.map(aqi => getAQIColor(aqi));
    barChart.update('active');
}

// Connection status management
function updateConnectionStatus(isConnected) {
    const statusElement = document.getElementById('connectionStatus');
    if (isConnected) {
        statusElement.textContent = 'Connected';
        statusElement.className = 'px-3 py-1 rounded-full text-sm bg-green-600 connected';
    } else {
        statusElement.textContent = 'Disconnected';
        statusElement.className = 'px-3 py-1 rounded-full text-sm bg-red-600 disconnected';
    }
}

// SignalR event handlers
connection.on("SensorDataUpdate", function (sensorType, aqi, quality, location, agency) {
    console.log(`Received: ${sensorType} = ${aqi} AQI (${quality})`);

    // Update data
    sensorData[sensorType] = { value: aqi, quality: quality };

    // Update UI
    updateSensorCard(sensorType, aqi, quality);
    updateCharts();

    // Update location info
    document.getElementById('location').textContent = location;
    document.getElementById('agency').textContent = agency;

    // Update timestamp
    document.getElementById('lastUpdate').textContent = `Last update: ${new Date().toLocaleTimeString()}`;
});

// Connection event handlers
connection.onclose(function () {
    updateConnectionStatus(false);
    console.log('SignalR Disconnected');
});

connection.onreconnecting(function () {
    updateConnectionStatus(false);
    console.log('SignalR Reconnecting...');
});

connection.onreconnected(function () {
    updateConnectionStatus(true);
    console.log('SignalR Reconnected');
});

// Start connection
connection.start().then(function () {
    updateConnectionStatus(true);
    console.log('SignalR Connected');
}).catch(function (err) {
    updateConnectionStatus(false);
    console.error('SignalR Connection Error: ', err.toString());

    // Retry connection after 5 seconds
    setTimeout(() => {
        connection.start();
    }, 5000);
});

// Auto-retry connection on failure
setInterval(() => {
    if (connection.state === signalR.HubConnectionState.Disconnected) {
        connection.start().catch(console.error);
    }
}, 10000);

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function () {
    console.log('Dashboard initialized');

    // Add loading state to cards initially
    document.querySelectorAll('.sensor-card').forEach(card => {
        card.classList.add('loading');
    });

    // Remove loading state after connection
    connection.start().then(() => {
        setTimeout(() => {
            document.querySelectorAll('.sensor-card').forEach(card => {
                card.classList.remove('loading');
            });
        }, 1000);
    });
});