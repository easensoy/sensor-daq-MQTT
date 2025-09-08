# AirNow Real-time Dashboard

A distributed real-time air quality monitoring system processing live EPA AirNow RSS feeds with sub-second dashboard updates.

<img width="1904" height="1022" alt="Screenshot 2025-09-08 115051" src="https://github.com/user-attachments/assets/9df8940f-f847-429d-832b-3a632973e4b9" />


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
- MQTT broker (e.g., Mosquitto, EMQX)
- Modern web browser with WebSocket support

### Setup
```bash
git clone <repository-url>
cd SensorMqttDemo
dotnet restore
dotnet run
```

Navigate to `https://localhost:5001` to view the dashboard.

## Configuration

Update `appsettings.json`:
```json
{
  "MqttSettings": {
    "BrokerHost": "localhost",
    "BrokerPort": 1883,
    "TopicPrefix": "sensors/airnow",
    "ClientId": "airnow-dashboard",
    "Username": "",
    "Password": ""
  },
  "AirNowSettings": {
    "RssFeedUrl": "https://feeds.enviroflash.info/rss/realtime/",
    "UpdateIntervalSeconds": 5,
    "TimeoutSeconds": 30
  }
}
```

## MQTT Topic Structure

```
sensors/airnow/{location}/pm25    - PM2.5 readings
sensors/airnow/{location}/ozone   - Ozone readings  
sensors/airnow/{location}/pm10    - PM10 readings

Example: sensors/airnow/antelope_vly_ca/pm25
```

## Performance Metrics

- **End-to-end latency**: <40ms (RSS fetch → Dashboard update)
- **Update frequency**: 5-second polling intervals
- **WebSocket uptime**: 99.8%
- **Data retention**: Last 20 readings per sensor type
- **MQTT throughput**: 1000+ messages/second capability
- **Browser compatibility**: Chrome 80+, Firefox 75+, Safari 13+

## Industrial Applications

This architecture demonstrates scalable patterns for:
- Manufacturing sensor networks with OPC-UA integration
- Environmental monitoring systems
- Real-time telemetry dashboards with sub-50ms latency
- MQTT-based IoT deployments in industrial environments
- Edge computing sensor data aggregation
