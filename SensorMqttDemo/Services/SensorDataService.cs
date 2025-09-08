using SensorMqttDemo.Models;
using SensorMqttDemo.Hubs;
using Microsoft.AspNetCore.SignalR;
using System.ServiceModel.Syndication;
using System.Text.RegularExpressions;
using System.Xml.Linq;

namespace SensorMqttDemo.Services
{
    public class SensorDataService : BackgroundService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<SensorDataService> _logger;
        private readonly IHubContext<SensorHub> _hubContext;
        private readonly string[] _rssUrls =
        {
            "https://feeds.enviroflash.info/rss/realtime/382.xml" // Antelope Valley
        };

        public SensorDataService(HttpClient httpClient, ILogger<SensorDataService> logger, IHubContext<SensorHub> hubContext)
        {
            _httpClient = httpClient;
            _logger = logger;
            _hubContext = hubContext;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await FetchAndProcessData();
                    await Task.Delay(5000, stoppingToken); // Every 5 seconds for dashboard
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error fetching sensor data");
                    await Task.Delay(5000, stoppingToken);
                }
            }
        }

        private async Task FetchAndProcessData()
        {
            foreach (var url in _rssUrls)
            {
                try
                {
                    var response = await _httpClient.GetStringAsync(url);
                    var readings = ParseRssData(response);

                    foreach (var reading in readings)
                    {
                        Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] {reading.SensorType} = {reading.AQI} AQI ({reading.Quality})");

                        // Send to SignalR clients
                        await _hubContext.Clients.All.SendAsync("SensorDataUpdate",
                            reading.SensorType,
                            reading.AQI,
                            reading.Quality,
                            reading.Location,
                            reading.Agency);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error processing URL: {url}");
                }
            }
        }

        private List<SensorReading> ParseRssData(string xmlContent)
        {
            var readings = new List<SensorReading>();

            try
            {
                var doc = XDocument.Parse(xmlContent);
                var items = doc.Descendants("item");

                foreach (var item in items)
                {
                    var description = item.Element("description")?.Value ?? "";
                    var title = item.Element("title")?.Value ?? "";
                    var pubDate = DateTime.Parse(item.Element("pubDate")?.Value ?? DateTime.Now.ToString());

                    // Extract location from description
                    var locationMatch = Regex.Match(description, @"([^,]+,\s*[A-Z]{2})");
                    var location = locationMatch.Success ? locationMatch.Groups[1].Value : "Unknown";

                    // Extract AQI from title (format: "PM2.5 AQI of 25 for Antelope Vly, CA")
                    var aqiMatch = Regex.Match(title, @"(\w+(?:\.\d+)?)\s+AQI\s+of\s+(\d+)");
                    if (aqiMatch.Success)
                    {
                        var sensorType = aqiMatch.Groups[1].Value;
                        var aqi = int.Parse(aqiMatch.Groups[2].Value);
                        var quality = GetAQIQuality(aqi);

                        readings.Add(new SensorReading
                        {
                            Location = location,
                            SensorType = sensorType,
                            AQI = aqi,
                            Quality = quality,
                            Timestamp = pubDate,
                            Agency = "Antelope Valley AQMD"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error parsing RSS data");
            }

            return readings;
        }

        private string GetAQIQuality(int aqi)
        {
            return aqi switch
            {
                <= 50 => "Good",
                <= 100 => "Moderate",
                <= 150 => "Unhealthy for Sensitive Groups",
                <= 200 => "Unhealthy",
                <= 300 => "Very Unhealthy",
                _ => "Hazardous"
            };
        }
    }
}