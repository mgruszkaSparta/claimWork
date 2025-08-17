using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.Services;
using AutomotiveClaimsApi.Models;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.Configure<GoogleCloudStorageSettings>(
    builder.Configuration.GetSection("GoogleCloudStorage"));

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IEmailProcessingService, EmailProcessingService>();
builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
builder.Services.AddScoped<IGoogleCloudStorageService, GoogleCloudStorageService>();
builder.Services.AddHostedService<EmailBackgroundService>();

var host = builder.Build();
await host.RunAsync();
