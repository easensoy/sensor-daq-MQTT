using SensorMqttDemo.Models;
using System.Net.WebSockets;
using System.Runtime.CompilerServices;
using System.ServiceModel.Syndication;
using System.Text.RegularExpressions;
using System.Xml;
using System.Xml.Linq;

namespace SensorMqttDemo.Services
{
    public class SensorDataService : BackgroundService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<SensorDataService> _logger;
        private readonly string[] _rssUrls =
        {
            "https://feeds.enviroflash.info/rss/realtime/382.xml" // Antelope Valley
        };

        public SensorDataService(HttpClient httpClient, ILogger<SensorDataService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested) {
                try
                {
                    await FetchAndProcessData();
                    await Task.Delay(1000, stoppingToken); // Every 1 second
                }
                catch (Exception ex) {
                    _logger.LogError(ex, "Error fetching sensor data");
                    await Task.Delay(5000, stoppingToken); // Wait 5 seconds on error
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

            var doc = XDocument.Parse(xmlContent);
            var items = doc.Descendants("item");

            foreach (var item in items)
            {
                var description = item.Element("description")?.Value ?? "";
                var location = ExtractLocation(description);
                var pubDate = DateTime.Parse(item.Element("pubDate")?.Value ?? DateTime.Now.ToString());

                var aqiMatches = Regex.Matches(description, @"(\w+)\s*-\s*(\d+)\s*AQI\s*-\s*([^<\n]+)");

                foreach (Match match in aqiMatches)
                {
                    var quality = match.Groups[1].Value;
                    var aqi = int.Parse(match.Groups[2].Value);
                    var pollutant = match.Groups[3].Value.Trim();

                    var sensorType = pollutant switch
                    {
                        var p when p.Contains("2.5 microns") => "PM2.5",
                        var p when p.Contains("10 microns") => "PM10",
                        var p when p.Contains("Ozone") => "Ozone",
                        _ => pollutant
                    };

                    readings.Add(new SensorReading
                    {
                        Location = location,
                        SensorType = sensorType,
                        AQI = aqi,
                        Quality = quality,
                        Timestamp = pubDate,
                        Agency = ExtractAgency(description)
                    });
                }
            }
            return readings;
        }

        private string ExtractLocation(string description)
        {
            var match = Regex.Match(description, @"<b>Location:</b>\s*([^<]+)");
            return match.Success ? match.Groups[1].Value.Trim() : "Unknown";
        }

        private string ExtractAgency(string description)
        {
            var match = Regex.Match(description, @"<b>Agency:</b>\s*([^<]+)");
            return match.Success ? match.Groups[1].Value.Trim() : "Unknown";
        }
    }
}