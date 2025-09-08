// Industrial AirNow Dashboard

class AirNowDashboard {
    constructor() {
        this.connection = null;
        this.lineChart = null;
        this.barChart = null;
        this.sensorData = {
            'PM2.5': { value: 0, quality: '', data: [] },
            'Ozone': { value: 0, quality: '', data: [] },
            'PM10': { value: 0, quality: '', data: [] }
        };
        this.maxDataPoints = 20;
        this.initializeConnection();
        this.initializeCharts();
    }

    initializeConnection() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("/sensorHub")
            .withAutomaticReconnect([0, 2000, 10000, 30000])
            .build();

        this.setupConnectionHandlers();
        this.startConnection();
    }

    setupConnectionHandlers() {
        // Data received handler
        this.connection.on("SensorDataUpdate", (sensorType, aqi, quality, location, agency) => {
            console.log(`?? Data: ${sensorType} = ${aqi} AQI (${quality})`);
            this.updateSensorData(sensorType, aqi, quality, location, agency);
        });

        // Connection state handlers
        this.connection.onclose(() => {
            this.updateConnectionStatus(false);
            console.log('?? SignalR Disconnected');
        });

        this.connection.onreconnecting(() => {
            this.updateConnectionStatus(false, 'Reconnecting...');
            console.log('?? SignalR Reconnecting...');
        });

        this.connection.onreconnected(() => {
            this.updateConnectionStatus(true);
            console.log('?? SignalR Reconnected');
        });
    }

    async startConnection() {
        try {
            await this.connection.start();
            this.updateConnectionStatus(true);
            console.log('?? SignalR Connected');
        } catch (err) {
            this.updateConnectionStatus(false);
            console.error('?? SignalR Connection Error:', err.toString());
            setTimeout(() => this.startConnection(), 5000);
        }
    }

    initializeCharts() {
        this.createLineChart();
        this.createBarChart();
    }

    createLineChart() {
        const ctx = document.getElementById('lineChart').getContext('2d');

        this.lineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'PM2.5',
                        data: [],
                        borderColor: '#dc2626',
                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
                        borderWidth: 2,
                        tension: 0.1,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        fill: true
                    },
                    {
                        label: 'Ozone',
                        data: [],
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        borderWidth: 2,
                        tension: 0.1,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        fill: true
                    },
                    {
                        label: 'PM10',
                        data: [],
                        borderColor: '#16a34a',
                        backgroundColor: 'rgba(22, 163, 74, 0.1)',
                        borderWidth: 2,
                        tension: 0.1,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#374151',
                            font: { size: 12, weight: 'bold' },
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#e5e7eb',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#6b7280',
                            maxTicksLimit: 10
                        },
                        grid: {
                            color: '#f3f4f6',
                            drawBorder: false
                        }
                    },
                    y: {
                        ticks: {
                            color: '#6b7280',
                            callback: function (value) {
                                return value + ' AQI';
                            }
                        },
                        grid: {
                            color: '#f3f4f6',
                            drawBorder: false
                        },
                        title: {
                            display: true,
                            text: 'Air Quality Index',
                            color: '#374151',
                            font: { size: 12, weight: 'bold' }
                        },
                        beginAtZero: true
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    createBarChart() {
        const ctx = document.getElementById('barChart').getContext('2d');

        this.barChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['PM2.5', 'Ozone', 'PM10'],
                datasets: [{
                    label: 'Current AQI',
                    data: [0, 0, 0],
                    backgroundColor: ['#dc2626', '#2563eb', '#16a34a'],
                    borderColor: ['#b91c1c', '#1d4ed8', '#15803d'],
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#e5e7eb',
                        borderWidth: 1,
                        callbacks: {
                            label: function (context) {
                                const sensorType = context.label;
                                const aqi = context.parsed.y;
                                const quality = dashboard.getAQIQuality(aqi);
                                return `${sensorType}: ${aqi} AQI (${quality})`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#6b7280',
                            font: { size: 12, weight: 'bold' }
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        ticks: {
                            color: '#6b7280',
                            callback: function (value) {
                                return value + ' AQI';
                            }
                        },
                        grid: {
                            color: '#f3f4f6',
                            drawBorder: false
                        },
                        title: {
                            display: true,
                            text: 'Air Quality Index',
                            color: '#374151',
                            font: { size: 12, weight: 'bold' }
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateSensorData(sensorType, aqi, quality, location, agency) {
        // Update stored data
        this.sensorData[sensorType] = { value: aqi, quality: quality };

        // Update UI cards
        this.updateSensorCard(sensorType, aqi, quality);

        // Update charts
        this.updateCharts();

        // Update location info
        document.getElementById('location').textContent = location;
        document.getElementById('agency').textContent = agency;

        // Update timestamp
        document.getElementById('lastUpdate').textContent = `Last update: ${new Date().toLocaleTimeString()}`;
    }

    updateSensorCard(sensorType, aqi, quality) {
        const prefix = sensorType.toLowerCase().replace('.', '');

        // Update values
        document.getElementById(`${prefix}-value`).textContent = aqi;
        const qualityElement = document.getElementById(`${prefix}-quality`);
        qualityElement.textContent = quality;

        // Update status dot
        const dot = document.getElementById(`${prefix}-dot`);
        const dotClass = this.getAQIDotClass(aqi);
        dot.className = `status-dot ${dotClass}`;

        // Update quality color
        const qualityClass = this.getAQIClass(aqi);
        qualityElement.className = `text-xs mt-1 font-medium ${qualityClass}`;
    }

    updateCharts() {
        const now = new Date().toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        // Update line chart
        this.lineChart.data.labels.push(now);
        if (this.lineChart.data.labels.length > this.maxDataPoints) {
            this.lineChart.data.labels.shift();
        }

        this.lineChart.data.datasets.forEach((dataset, index) => {
            const sensorTypes = ['PM2.5', 'Ozone', 'PM10'];
            const sensorType = sensorTypes[index];
            const value = this.sensorData[sensorType].value;

            dataset.data.push(value);
            if (dataset.data.length > this.maxDataPoints) {
                dataset.data.shift();
            }
        });
        this.lineChart.update('none');

        // Update bar chart with dynamic colors
        const currentData = [
            this.sensorData['PM2.5'].value,
            this.sensorData['Ozone'].value,
            this.sensorData['PM10'].value
        ];

        this.barChart.data.datasets[0].data = currentData;
        this.barChart.data.datasets[0].backgroundColor = currentData.map(aqi => this.getAQIColor(aqi));
        this.barChart.update('active');
    }

    updateConnectionStatus(isConnected, customText = null) {
        const statusElement = document.getElementById('connectionStatus');
        if (isConnected) {
            statusElement.textContent = 'Connected';
            statusElement.className = 'px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 connected';
        } else {
            statusElement.textContent = customText || 'Disconnected';
            statusElement.className = 'px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800 disconnected';
        }
    }

    getAQIColor(aqi) {
        if (aqi <= 50) return '#16a34a';      // Good - Green
        if (aqi <= 100) return '#ca8a04';     // Moderate - Yellow
        if (aqi <= 150) return '#ea580c';     // Unhealthy for Sensitive - Orange
        if (aqi <= 200) return '#dc2626';     // Unhealthy - Red
        if (aqi <= 300) return '#9333ea';     // Very Unhealthy - Purple
        return '#991b1b';                     // Hazardous - Maroon
    }

    getAQIClass(aqi) {
        if (aqi <= 50) return 'aqi-good';
        if (aqi <= 100) return 'aqi-moderate';
        if (aqi <= 150) return 'aqi-unhealthy-sensitive';
        if (aqi <= 200) return 'aqi-unhealthy';
        if (aqi <= 300) return 'aqi-very-unhealthy';
        return 'aqi-hazardous';
    }

    getAQIDotClass(aqi) {
        if (aqi <= 50) return 'good';
        if (aqi <= 100) return 'moderate';
        if (aqi <= 150) return 'unhealthy-sensitive';
        if (aqi <= 200) return 'unhealthy';
        if (aqi <= 300) return 'very-unhealthy';
        return 'hazardous';
    }

    getAQIQuality(aqi) {
        if (aqi <= 50) return 'Good';
        if (aqi <= 100) return 'Moderate';
        if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
        if (aqi <= 200) return 'Unhealthy';
        if (aqi <= 300) return 'Very Unhealthy';
        return 'Hazardous';
    }
}

// Initialize dashboard when DOM is loaded
let dashboard;
document.addEventListener('DOMContentLoaded', function () {
    console.log('?? Initializing Industrial AirNow Dashboard');
    dashboard = new AirNowDashboard();

    // Add loading state to cards initially
    document.querySelectorAll('.sensor-card').forEach(card => {
        card.classList.add('loading');
    });

    // Remove loading state after connection
    setTimeout(() => {
        document.querySelectorAll('.sensor-card').forEach(card => {
            card.classList.remove('loading');
        });
    }, 2000);
});