using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class User
{
    [Required]
    [MinLength(3)]
    public string UserId { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;
}
