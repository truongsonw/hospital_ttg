using System.Security.Claims;
using Contracts.Auth.DTOs;
using Contracts.Auth.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Shared.Abstractions.Responses;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<TokenResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<TokenResponse>>> Login(LoginRequest request, CancellationToken ct)
    {
        var result = await _authService.LoginAsync(request, ct);
        return Ok(new ApiResponse<TokenResponse>(result, "Login successful"));
    }

    [HttpPost("register")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<UserDto>>> Register(RegisterRequest request, CancellationToken ct)
    {
        var result = await _authService.RegisterAsync(request, ct);
        return Created($"api/auth/users/{result.Id}", new ApiResponse<UserDto>(result, "User registered successfully"));
    }

    [HttpPost("refresh")]
    [ProducesResponseType(typeof(ApiResponse<TokenResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<TokenResponse>>> RefreshToken([FromBody] string refreshToken, CancellationToken ct)
    {
        var result = await _authService.RefreshTokenAsync(refreshToken, ct);
        return Ok(new ApiResponse<TokenResponse>(result, "Token refreshed successfully"));
    }

    [Authorize]
    [HttpPost("logout")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<object>>> Logout(CancellationToken ct)
    {
        await _authService.LogoutAsync(GetCurrentUserId(), ct);
        return Ok(new ApiResponse<object>("Logged out successfully"));
    }

    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetCurrentUser(CancellationToken ct)
    {
        var result = await _authService.GetCurrentUserAsync(GetCurrentUserId(), ct);
        return Ok(new ApiResponse<UserDto>(result));
    }

    [Authorize]
    [HttpPut("change-password")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<object>>> ChangePassword(ChangePasswordRequest request, CancellationToken ct)
    {
        await _authService.ChangePasswordAsync(GetCurrentUserId(), request, ct);
        return Ok(new ApiResponse<object>("Password changed successfully"));
    }

    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
