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
                    Console.WriteLine($"[DEBUG] Fetching from: {url}");
                    var response = await _httpClient.GetStringAsync(url);
                    Console.WriteLine($"[DEBUG] Response length: {response.Length} chars");

                    var readings = ParseRssData(response);
                    Console.WriteLine($"[DEBUG] Parsed {readings.Count} readings");

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
                        Console.WriteLine($"[DEBUG] Sent SignalR: {reading.SensorType} = {reading.AQI}");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[ERROR] {ex.Message}");
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
                    var pubDate = DateTime.Parse(item.Element("pubDate")?.Value ?? DateTime.Now.ToString());

                    // Extract location from title
                    var title = item.Element("title")?.Value ?? "";
                    var locationMatch = Regex.Match(title, @"([^,]+,\s*[A-Z]{2})");
                    var location = locationMatch.Success ? locationMatch.Groups[1].Value : "Antelope Vly, CA";

                    Console.WriteLine($"[DEBUG] Processing description: {description.Substring(0, Math.Min(200, description.Length))}...");

                    // Parse AQI data from description HTML content
                    // Format: "Quality - AQI_VALUE AQI - Pollutant_Type"
                    var aqiMatches = Regex.Matches(description, @"(\w+)\s*-\s*(\d+)\s*AQI\s*-\s*([^<\r\n]+)");

                    Console.WriteLine($"[DEBUG] Found {aqiMatches.Count} AQI matches");

                    foreach (Match match in aqiMatches)
                    {
                        var quality = match.Groups[1].Value.Trim();
                        var aqi = int.Parse(match.Groups[2].Value);
                        var pollutantType = match.Groups[3].Value.Trim();

                        Console.WriteLine($"[DEBUG] Match: {quality} - {aqi} AQI - {pollutantType}");

                        // Map pollutant types to sensor types
                        var sensorType = MapPollutantToSensorType(pollutantType);

                        if (!string.IsNullOrEmpty(sensorType))
                        {
                            readings.Add(new SensorReading
                            {
                                Location = location,
                                SensorType = sensorType,
                                AQI = aqi,
                                Quality = quality,
                                Timestamp = pubDate,
                                Agency = "Antelope Valley AQMD"
                            });
                            Console.WriteLine($"[DEBUG] Added reading: {sensorType} = {aqi} AQI ({quality})");
                        }
                        else
                        {
                            Console.WriteLine($"[DEBUG] Unknown pollutant type: {pollutantType}");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Parsing failed: {ex.Message}");
                _logger.LogError(ex, "Error parsing RSS data");
            }

            Console.WriteLine($"[DEBUG] Total readings parsed: {readings.Count}");
            return readings;
        }

        private string MapPollutantToSensorType(string pollutantType)
        {
            pollutantType = pollutantType.ToLower();

            if (pollutantType.Contains("ozone"))
                return "Ozone";
            if (pollutantType.Contains("2.5 microns") || pollutantType.Contains("pm2.5"))
                return "PM2.5";
            if (pollutantType.Contains("10 microns") || pollutantType.Contains("pm10"))
                return "PM10";

            return ""; // Unknown type
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