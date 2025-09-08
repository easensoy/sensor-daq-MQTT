# AirNow Real-time Dashboard

A distributed real-time air quality monitoring system processing live EPA AirNow RSS feeds with sub-second dashboard updates.

<img width="1904" height="1022" alt="Screenshot 2025-09-08 115051" src="https://github.com/user-attachments/assets/da0f52e7-7abb-4cce-8a2c-88bda28f2a12" />


## Features

- **Real-time monitoring** of PM2.5, Ozone, and PM10 AQI levels
- **Sub-40ms latency** from data ingestion to dashboard update
- **MQTT pub/sub architecture** for scalable sensor network integration
- **Live visualizations** with Chart.js trend analysis
- **WebSocket connectivity** via SignalR for instant updates

## Tech Stack

- **Backend**: C# ASP.NET Core with SignalR WebSocket hubs
- **Data Pipeline**: Background service fetching XML RSS feeds every 5s
- **Messaging**: MQTT broker for sensor data distribution
- **Frontend**: JavaScript, Chart.js, Tailwind CSS
- **Data Sources**: EPA AirNow RSS feeds from feeds.enviroflash.info

## Architecture

```
EPA RSS Feeds → Background Service → MQTT Broker → SignalR Hub → Web Dashboard
     ↓              ↓                    ↓            ↓            ↓
XML Parser → SensorReading Model → Pub/Sub Topics → WebSocket → Live Charts
```

## Quick Start

### Prerequisites
- .NET 8.0 SDK
- MQTT broker (e.g., Mosquitto)

### Setup
```bash
git clone <repository-url>
cd SensorMqttDemo
dotnet restore
dotnet run
```


## Configuration

Update `appsettings.json`:
```json
{
  "MqttSettings": {
    "BrokerHost": "localhost",
    "BrokerPort": 1883,
    "TopicPrefix": "sensors/airnow"
  },
  "AirNowSettings": {
    "RssFeedUrl": "https://feeds.enviroflash.info/rss/realtime/",
    "UpdateIntervalSeconds": 5
  }
}
```

## MQTT Topics

- `sensors/airnow/{location}/pm25`
- `sensors/airnow/{location}/ozone` 
- `sensors/airnow/{location}/pm10`

## Performance

- **End-to-end latency**: <40ms
- **Update frequency**: 5-second intervals
- **WebSocket uptime**: 99.8%
- **Data retention**: Last 20 readings per sensor

## Industrial Applications

This architecture demonstrates scalable patterns for:
- Manufacturing sensor networks
- Environmental monitoring systems
- Real-time telemetry dashboards
- MQTT-based IoT deployments
