class ModernAirNowDashboard {
    constructor() {
        this.initializeCharts();
    }

    initializeCharts() {
        this.initializeLineChart();
        this.initializeDoughnutCharts();
    }

    initializeLineChart() {
        const ctx = document.getElementById('lineChart').getContext('2d');
        this.lineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({ length: 20 }, (_, i) => `11:18:${35 + i}`),
                datasets: [
                    {
                        label: 'PM2.5',
                        data: Array.from({ length: 20 }, () => 17 + Math.random() * 2 - 1),
                        borderColor: '#8b5cf6',
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                    },
                    {
                        label: 'Ozone',
                        data: Array.from({ length: 20 }, () => 37 + Math.random() * 2 - 1),
                        borderColor: '#06b6d4',
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                    },
                    {
                        label: 'PM10',
                        data: Array.from({ length: 20 }, () => 3 + Math.random() * 1 - 0.5),
                        borderColor: '#10b981',
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6,
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
                            font: { size: 12, weight: '600' },
                            usePointStyle: true,
                            pointStyle: 'circle',
                            padding: 20
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#e5e7eb',
                        borderWidth: 1,
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#6b7280',
                            maxTicksLimit: 8,
                            font: { size: 11 }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        }
                    },
                    y: {
                        ticks: {
                            color: '#6b7280',
                            font: { size: 11 }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    initializeDoughnutCharts() {
        // PM2.5 Doughnut
        const pm25Ctx = document.getElementById('pm25Chart').getContext('2d');
        new Chart(pm25Ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [17, 83],
                    backgroundColor: ['#8b5cf6', 'rgba(0, 0, 0, 0.05)'],
                    borderWidth: 0,
                    cutout: '80%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            }
        });

        // Ozone Doughnut
        const ozoneCtx = document.getElementById('ozoneChart').getContext('2d');
        new Chart(ozoneCtx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [37, 63],
                    backgroundColor: ['#06b6d4', 'rgba(0, 0, 0, 0.05)'],
                    borderWidth: 0,
                    cutout: '80%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            }
        });

        // PM10 Doughnut
        const pm10Ctx = document.getElementById('pm10Chart').getContext('2d');
        new Chart(pm10Ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [3, 97],
                    backgroundColor: ['#10b981', 'rgba(0, 0, 0, 0.05)'],
                    borderWidth: 0,
                    cutout: '80%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            }
        });
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    new ModernAirNowDashboard();
});