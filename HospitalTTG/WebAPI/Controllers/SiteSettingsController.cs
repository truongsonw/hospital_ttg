using System.Security.Claims;
using Contracts.System.DTOs;
using Contracts.System.Interfaces;
using Modules.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Shared.Abstractions.Responses;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/site-settings")]
public class SiteSettingsController : ControllerBase
{
    private readonly ISiteSettingService _service;

    public SiteSettingsController(ISiteSettingService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Policy = Permissions.SiteSettingsManage)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<SiteSettingDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<SiteSettingDto>>>> GetAll(CancellationToken ct)
    {
        var result = await _service.GetAllAsync(ct);
        return Ok(new ApiResponse<IReadOnlyList<SiteSettingDto>>(result));
    }

    [HttpGet("public")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<SiteSettingDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<SiteSettingDto>>>> GetPublic(CancellationToken ct)
    {
        var result = await _service.GetPublicAsync(ct);
        return Ok(new ApiResponse<IReadOnlyList<SiteSettingDto>>(result));
    }

    [HttpGet("{group}")]
    [Authorize(Policy = Permissions.SiteSettingsManage)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<SiteSettingDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<SiteSettingDto>>>> GetByGroup(string group, CancellationToken ct)
    {
        var result = await _service.GetByGroupAsync(group, ct);
        return Ok(new ApiResponse<IReadOnlyList<SiteSettingDto>>(result));
    }

    [HttpPut]
    [Authorize(Policy = Permissions.SiteSettingsManage)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<SiteSettingDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<SiteSettingDto>>>> Upsert(
        UpdateSiteSettingsRequest request, CancellationToken ct)
    {
        var updatedBy = User.FindFirstValue(ClaimTypes.Name) ?? "system";
        var result = await _service.UpsertAsync(request, updatedBy, ct);
        return Ok(new ApiResponse<IReadOnlyList<SiteSettingDto>>(result, "Settings saved successfully"));
    }
}
