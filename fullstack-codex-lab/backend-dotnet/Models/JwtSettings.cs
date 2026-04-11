using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class JwtSettings
{
    [Required]
    [MinLength(32)]
    public string Secret { get; set; } = string.Empty;

    public string Issuer { get; set; } = "FullstackCodexLab";

    public string Audience { get; set; } = "FullstackCodexLab";

    [Range(1, 1440)]
    public int ExpiresInMinutes { get; set; } = 60;
}
