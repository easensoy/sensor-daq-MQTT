using SensorMqttDemo.Models;

namespace SensorMqttDemo.Models
{
    /// <summary>
    /// Represents air quality sensor data from AirNow RSS feeds
    /// </summary>
    public class SensorReading
    {
        // Geographic location of the sensor (e.g., "Antelope Vly, CA")
        public string Location { get; set; } = string.Empty;

        // Type of pollutant measured (PM2.5, Ozone, PM10)
        public string SensorType { get; set; } = string.Empty;

        // Air Quality Index value (0-500 scale)
        public int AQI { get; set; }

        // Human-readable quality level (Good, Moderate, Unhealthy, etc.)
        public string Quality { get; set; } = string.Empty;

        // When the reading was taken
        public DateTime Timestamp { get; set; }

        // Monitoring agency (e.g., "Antelope Valley AQMD")
        public string Agency { get; set; } = string.Empty;
    }

    /// <summary>
    /// MQTT message wrapper containing sensor data and metadata
    /// </summary>
}
public class SensorMessage
{
    // MQTT topic path (e.g., "sensors/airnow/antelope_vly/pm25")
    public string Topic { get; set; } = string.Empty;

    // The actual sensor reading data
    public SensorReading Data { get; set; } = new();

    // When this message was published to MQTT
    public DateTime PublishedAt { get; set; }
}
