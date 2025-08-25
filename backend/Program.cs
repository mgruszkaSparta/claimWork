using Microsoft.EntityFrameworkCore;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.Services;
using AutomotiveClaimsApi.Models;
using AutomotiveClaimsApi.Services.EventSearch;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews(options =>
{
    var policy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
    options.Filters.Add(new AuthorizeFilter(policy));
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS to allow configured origins with credentials
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:3000" };
builder.Services.AddCors(options =>
{
    options.AddPolicy("ConfiguredOrigins", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// Add Entity Framework with database provider selected from configuration
var dbProvider = builder.Configuration.GetValue<string>("DatabaseProvider")?.ToLowerInvariant();
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    if (dbProvider == "postgres" || dbProvider == "postgresql")
    {
        options.UseNpgsql(builder.Configuration.GetConnectionString("PostgresConnection"));
    }
    else
    {
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
    }
});

// Add Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 6;
    options.Lockout.MaxFailedAccessAttempts = 5;
})
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = 401;
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = 403;
        return Task.CompletedTask;
    };
});

// Configure SMTP settings
builder.Services.Configure<SmtpSettings>(
    builder.Configuration.GetSection("SmtpSettings"));

// Configure Google Cloud Storage settings
builder.Services.Configure<GoogleCloudStorageSettings>(
    builder.Configuration.GetSection("GoogleCloudStorage"));

// Conditionally register Google Cloud Storage service
var cloudSettings = builder.Configuration
    .GetSection("GoogleCloudStorage")
    .Get<GoogleCloudStorageSettings>() ?? new GoogleCloudStorageSettings();
if (cloudSettings.Enabled)
{
    builder.Services.AddScoped<IGoogleCloudStorageService, GoogleCloudStorageService>();
}

// Add services
var notificationSettings = builder.Configuration.GetSection("ClaimNotifications").Get<ClaimNotificationSettings>() ?? new ClaimNotificationSettings();
builder.Services.AddSingleton(notificationSettings);
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IDocumentService, DocumentService>();
builder.Services.AddScoped<IRiskTypeService, RiskTypeService>();
builder.Services.AddScoped<IDamageTypeService, DamageTypeService>();
builder.Services.AddScoped<ICaseHandlerService, CaseHandlerService>();
builder.Services.AddEventDocumentStore(builder.Configuration);

// Add background services
builder.Services.AddHostedService<EmailBackgroundService>();
builder.Services.AddHostedService<AppealReminderService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("ConfiguredOrigins");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapGet("/api", () => Results.Ok(new { status = "Automotive Claims API is running" }));

// Ensure database is created and seed default roles/users
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<ApplicationDbContext>();
    await context.Database.EnsureCreatedAsync();

    var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();

    var roles = new[] { "Admin", "User" };
    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole(role));
        }
    }

    var admin = await userManager.FindByNameAsync("admin");
    if (admin == null)
    {
        admin = new ApplicationUser { UserName = "admin", Email = "admin@example.com" };
        await userManager.CreateAsync(admin, "Admin123!");
        await userManager.AddToRoleAsync(admin, "Admin");
    }
}

app.Run();

public partial class Program { }
