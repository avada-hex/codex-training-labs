using System.Linq;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly JwtSettings _jwtSettings;

    public AuthController(AuthService authService, IOptions<JwtSettings> jwtSettings)
    {
        _authService = authService;
        _jwtSettings = jwtSettings.Value;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] User user)
    {
        if (!ModelState.IsValid)
        {
            return BuildInvalidModelStateResponse();
        }

        if (!_authService.ValidateUser(user.UserId, user.Password))
        {
            return Unauthorized(BuildErrorResponse("Invalid user ID or password."));
        }

        var token = _authService.GenerateToken(user.UserId);

        return Ok(BuildAuthResponse("Signed in successfully.", user.UserId, token));
    }

    [HttpPost("register")]
    public IActionResult Register([FromBody] User user)
    {
        if (!ModelState.IsValid)
        {
            return BuildInvalidModelStateResponse();
        }

        if (!_authService.TryRegisterUser(user.UserId, user.Password, out var error))
        {
            return Conflict(BuildErrorResponse(error));
        }

        var token = _authService.GenerateToken(user.UserId);

        return Created(string.Empty, BuildAuthResponse("Account created and authenticated.", user.UserId, token));
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        var userId = User.Identity?.Name;

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(BuildErrorResponse("Unable to read the authenticated user."));
        }

        return Ok(new
        {
            success = true,
            message = "Profile loaded.",
            user = new
            {
                userId
            }
        });
    }

    private IActionResult BuildInvalidModelStateResponse()
    {
        var message = ModelState.Values
            .SelectMany(v => v.Errors)
            .Select(e => e.ErrorMessage)
            .FirstOrDefault() ?? "Invalid request payload.";

        return BadRequest(BuildErrorResponse(message));
    }

    private object BuildErrorResponse(string error, string? details = null) =>
        new
        {
            success = false,
            error,
            details
        };

    private object BuildAuthResponse(string message, string userId, string token) =>
        new
        {
            success = true,
            message,
            token,
            expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiresInMinutes).ToString("O"),
            user = new
            {
                userId
            }
        };
}
