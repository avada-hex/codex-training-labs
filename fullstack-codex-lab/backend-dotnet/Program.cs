using System.Text;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

const string JwtSecretPlaceholder =
    "<REPLACE_WITH_STRONG_FULLSTACK_CODEX_JWT_SECRET_ENV_VAR>";

var builder = WebApplication.CreateBuilder(args);

var envSecret = Environment.GetEnvironmentVariable("FULLSTACK_CODEX_JWT_SECRET");
if (!string.IsNullOrWhiteSpace(envSecret))
{
    builder.Configuration["JwtSettings:Secret"] = envSecret.Trim();
}

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

builder.Services.AddOptions<JwtSettings>()
    .Bind(builder.Configuration.GetSection("JwtSettings"))
    .ValidateDataAnnotations();

builder.Services.AddScoped<AuthService>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var jwtSettingsSection = builder.Configuration.GetSection("JwtSettings");
var secret = jwtSettingsSection["Secret"]?.Trim();
var issuer = jwtSettingsSection["Issuer"] ?? "FullstackCodexLab";
var audience = jwtSettingsSection["Audience"] ?? "FullstackCodexLab";

if (string.IsNullOrWhiteSpace(secret) || secret == JwtSecretPlaceholder)
{
    throw new InvalidOperationException(
        "Provide a secure JwtSettings:Secret (for example via the FULLSTACK_CODEX_JWT_SECRET environment "
        + "variable) before starting the application.");
}

var key = Encoding.UTF8.GetBytes(secret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var feature = context.Features.Get<IExceptionHandlerFeature>();
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        if (feature?.Error != null)
        {
            logger.LogError(
                feature.Error,
                "Unhandled exception while processing {Path}",
                context.Request.Path);
        }

        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";

        await context.Response.WriteAsJsonAsync(new
        {
            success = false,
            error = "An unexpected error occurred while processing your request.",
            details = app.Environment.IsDevelopment() ? feature?.Error?.Message : null,
            traceId = context.TraceIdentifier
        });
    });
});

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
