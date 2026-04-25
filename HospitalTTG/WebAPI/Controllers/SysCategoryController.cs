using Contracts.System.DTOs;
using Contracts.System.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Shared.Abstractions.Responses;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SysCategoryController : ControllerBase
{
    private readonly ISysCategoryService _sysCategoryService;

    public SysCategoryController(ISysCategoryService sysCategoryService)
    {
        _sysCategoryService = sysCategoryService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<SysCategoryDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<SysCategoryDto>>>> GetAll(CancellationToken ct)
    {
        var result = await _sysCategoryService.GetAllAsync(ct);
        return Ok(new ApiResponse<IReadOnlyList<SysCategoryDto>>(result));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<SysCategoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<SysCategoryDto>>> GetById(Guid id, CancellationToken ct)
    {
        var result = await _sysCategoryService.GetByIdAsync(id, ct);
        return Ok(new ApiResponse<SysCategoryDto>(result));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<SysCategoryDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<SysCategoryDto>>> Create(CreateSysCategoryRequest request, CancellationToken ct)
    {
        var result = await _sysCategoryService.CreateAsync(request, ct);
        return Created($"api/SysCategory/{result.Id}", new ApiResponse<SysCategoryDto>(result, "Category created successfully"));
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<SysCategoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<SysCategoryDto>>> Update(Guid id, UpdateSysCategoryRequest request, CancellationToken ct)
    {
        var result = await _sysCategoryService.UpdateAsync(id, request, ct);
        return Ok(new ApiResponse<SysCategoryDto>(result, "Category updated successfully"));
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id, CancellationToken ct)
    {
        await _sysCategoryService.DeleteAsync(id, ct);
        return Ok(new ApiResponse<bool>(true, "Category deleted successfully"));
    }
}
