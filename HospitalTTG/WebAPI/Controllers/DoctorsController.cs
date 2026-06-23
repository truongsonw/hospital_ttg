using Contracts.Doctor.DTOs;
using Contracts.Doctor.Interfaces;
using Modules.Auth;
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
        [FromQuery] string? departmentSlug,
        [FromQuery] string? groupSlug,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12,
        CancellationToken ct = default)
    {
        PagedResponse<IReadOnlyList<DoctorDto>> result;
        if (!string.IsNullOrWhiteSpace(departmentSlug))
        {
            result = await _service.GetPagedByDepartmentSlugAsync(departmentSlug, search, page, pageSize, ct);
        }
        else if (!string.IsNullOrWhiteSpace(groupSlug))
        {
            result = await _service.GetPagedByGroupSlugAsync(groupSlug, search, page, pageSize, ct);
        }
        else
        {
            result = await _service.GetPagedAsync(departmentId, groupId, search, page, pageSize, ct);
        }
        return Ok(result);
    }

    [HttpGet("management")]
    [Authorize(Policy = Permissions.DoctorManage)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<DoctorDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
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

    [HttpGet("leadership")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<DoctorDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<DoctorDto>>>> GetLeadership(CancellationToken ct)
    {
        var result = await _service.GetManagementAsync(ct);
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

    [HttpGet("slug/{slug}")]
    [ProducesResponseType(typeof(ApiResponse<DoctorDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<DoctorDto>>> GetBySlug(string slug, CancellationToken ct)
    {
        var result = await _service.GetBySlugAsync(slug, ct);
        if (result == null)
            return NotFound(new ProblemDetails { Title = "Doctor not found", Detail = $"No doctor found with slug: {slug}" });
        return Ok(new ApiResponse<DoctorDto>(result));
    }

    [HttpPost]
    [Authorize(Policy = Permissions.DoctorManage)]
    [ProducesResponseType(typeof(ApiResponse<DoctorDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<DoctorDto>>> Create(CreateDoctorRequest request, CancellationToken ct)
    {
        var result = await _service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, new ApiResponse<DoctorDto>(result));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Permissions.DoctorManage)]
    [ProducesResponseType(typeof(ApiResponse<DoctorDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<DoctorDto>>> Update(Guid id, UpdateDoctorRequest request, CancellationToken ct)
    {
        var result = await _service.UpdateAsync(id, request, ct);
        return Ok(new ApiResponse<DoctorDto>(result));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Permissions.DoctorManage)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, ct);
        return Ok(new ApiResponse<bool>(true, "Doctor deleted successfully"));
    }

    [HttpPost("import")]
    [Authorize(Policy = Permissions.DoctorManage)]
    [ProducesResponseType(typeof(ApiResponse<DoctorImportResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<DoctorImportResultDto>>> Import(IFormFile file, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new ProblemDetails { Title = "File is required" });

        var allowedExtensions = new[] { ".xlsx", ".xls" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(ext))
            return BadRequest(new ProblemDetails { Title = "Only Excel files (.xlsx, .xls) are allowed" });

        var result = await _service.ImportAsync(file, ct);
        return Ok(new ApiResponse<DoctorImportResultDto>(result));
    }

    [HttpGet("export")]
    [Authorize(Policy = Permissions.DoctorManage)]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Export(CancellationToken ct)
    {
        var bytes = await _service.ExportAsync(ct);
        var fileName = $"danh-sach-bac-si-{DateTime.UtcNow:yyyyMMddHHmmss}.xlsx";
        return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }

    [HttpGet("template")]
    [Authorize(Policy = Permissions.DoctorManage)]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetTemplate(CancellationToken ct)
    {
        var bytes = await _service.GenerateTemplateAsync(ct);
        return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "bac-si-template.xlsx");
    }
}
