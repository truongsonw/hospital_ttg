using Contracts.System.DTOs;
using Contracts.System.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Shared.Abstractions.Responses;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/system/stats")]
[Authorize(Roles = "Admin")]
public class DashboardStatsController : ControllerBase
{
    private readonly IDashboardStatsService _service;

    public DashboardStatsController(IDashboardStatsService service)
    {
        _service = service;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<DashboardStatsDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<DashboardStatsDto>>> Get(CancellationToken ct)
    {
        var result = await _service.GetAsync(ct);
        return Ok(new ApiResponse<DashboardStatsDto>(result));
    }
}
