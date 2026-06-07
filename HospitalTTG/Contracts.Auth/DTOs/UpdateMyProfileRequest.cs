namespace Contracts.Auth.DTOs;

public class UpdateMyProfileRequest
{
    public required string FullName { get; set; }
    public required string Email { get; set; }
}
