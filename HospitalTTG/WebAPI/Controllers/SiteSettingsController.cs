using System.Security.Claims;
using Contracts.System.DTOs;
using Contracts.System.Interfaces;
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
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<SiteSettingDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<SiteSettingDto>>>> GetAll(CancellationToken ct)
    {
        var result = await _service.GetAllAsync(ct);
        return Ok(new ApiResponse<IReadOnlyList<SiteSettingDto>>(result));
    }

    [HttpGet("{group}")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<SiteSettingDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<SiteSettingDto>>>> GetByGroup(string group, CancellationToken ct)
    {
        var result = await _service.GetByGroupAsync(group, ct);
        return Ok(new ApiResponse<IReadOnlyList<SiteSettingDto>>(result));
    }

    [HttpPut]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<SiteSettingDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<SiteSettingDto>>>> Upsert(
        UpdateSiteSettingsRequest request, CancellationToken ct)
    {
        var updatedBy = User.FindFirstValue(ClaimTypes.Name) ?? "system";
        var result = await _service.UpsertAsync(request, updatedBy, ct);
        return Ok(new ApiResponse<IReadOnlyList<SiteSettingDto>>(result, "Settings saved successfully"));
    }
}
