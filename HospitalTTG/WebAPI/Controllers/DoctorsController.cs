using Contracts.Doctor.DTOs;
using Contracts.Doctor.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Shared.Abstractions.Responses;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DoctorsController : ControllerBase
{
    private readonly IDoctorService _service;

    public DoctorsController(IDoctorService service) => _service = service;

    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<IReadOnlyList<DoctorDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResponse<IReadOnlyList<DoctorDto>>>> GetPaged(
        [FromQuery] Guid? departmentId,
        [FromQuery] Guid? groupId,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12,
        CancellationToken ct = default)
    {
        var result = await _service.GetPagedAsync(departmentId, groupId, search, page, pageSize, ct);
        return Ok(result);
    }

    [HttpGet("management")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<DoctorDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<DoctorDto>>>> GetManagement(CancellationToken ct)
    {
        var result = await _service.GetManagementAsync(ct);
        return Ok(new ApiResponse<IReadOnlyList<DoctorDto>>(result));
    }

    [HttpGet("featured")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<DoctorDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<DoctorDto>>>> GetFeatured(
        [FromQuery] int limit = 4, CancellationToken ct = default)
    {
        var result = await _service.GetFeaturedAsync(limit, ct);
        return Ok(new ApiResponse<IReadOnlyList<DoctorDto>>(result));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<DoctorDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<DoctorDto>>> GetById(Guid id, CancellationToken ct)
    {
        var result = await _service.GetByIdAsync(id, ct);
        return Ok(new ApiResponse<DoctorDto>(result));
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<DoctorDto>), StatusCodes.Status201Created)]
    public async Task<ActionResult<ApiResponse<DoctorDto>>> Create(CreateDoctorRequest request, CancellationToken ct)
    {
        var result = await _service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, new ApiResponse<DoctorDto>(result));
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<DoctorDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<DoctorDto>>> Update(Guid id, UpdateDoctorRequest request, CancellationToken ct)
    {
        var result = await _service.UpdateAsync(id, request, ct);
        return Ok(new ApiResponse<DoctorDto>(result));
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, ct);
        return Ok(new ApiResponse<bool>(true, "Doctor deleted successfully"));
    }
}
