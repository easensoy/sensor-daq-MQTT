using SensorMqttDemo.Services;
using SensorMqttDemo.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add HttpClient for RSS fetching
builder.Services.AddHttpClient<SensorDataService>();

// Add SignalR BEFORE background service
builder.Services.AddSignalR();

// Register background service
builder.Services.AddHostedService<SensorDataService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Serve static files (for dashboard)
app.UseStaticFiles();

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// Map SignalR hub
app.MapHub<SensorHub>("/sensorHub");

// Default route to dashboard
app.MapGet("/", () => Results.Redirect("/index.html"));

Console.WriteLine("Starting sensor data fetching...");
app.Run();