using Contracts.System.DTOs;
using Contracts.System.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Shared.Abstractions.Responses;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/homepage")]
public class HomePageController : ControllerBase
{
    private readonly IHomePageService _service;

    public HomePageController(IHomePageService service)
    {
        _service = service;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<HomePageDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<HomePageDto>>> Get(CancellationToken ct)
    {
        var result = await _service.GetAsync(ct);
        return Ok(new ApiResponse<HomePageDto>(result));
    }
}
