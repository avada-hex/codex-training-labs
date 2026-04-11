using System.Collections.Concurrent;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Services;

public class AuthService
{
    private readonly JwtSettings _jwtSettings;
    private readonly ConcurrentDictionary<string, string> _users;

    public AuthService(IOptions<JwtSettings> jwtSettings)
    {
        _jwtSettings = jwtSettings.Value;
        _users = new ConcurrentDictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["alice"] = "Pa$$word123",
            ["bob"] = "S3cure#456"
        };
    }

    public bool ValidateUser(string userId, string password)
    {
        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(password))
        {
            return false;
        }

        userId = userId.Trim();

        return _users.TryGetValue(userId, out var storedPassword) && storedPassword == password;
    }

    public bool TryRegisterUser(string userId, string password, out string error)
    {
        error = string.Empty;

        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(password))
        {
            error = "User ID and password are required.";
            return false;
        }

        userId = userId.Trim();

        if (_users.ContainsKey(userId))
        {
            error = "User ID already exists.";
            return false;
        }

        if (_users.TryAdd(userId, password))
        {
            return true;
        }

        error = "Unable to create the user at this time.";
        return false;
    }

    public string GenerateToken(string userId)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
        var signingCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Name, userId)
        };

        var expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiresInMinutes);

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: expires,
            signingCredentials: signingCredentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
