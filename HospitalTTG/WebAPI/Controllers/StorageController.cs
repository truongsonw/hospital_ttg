using Contracts.Storage.DTOs;
using Contracts.Storage.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Modules.Auth;
using Shared.Abstractions.Responses;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StorageController : ControllerBase
{
    private readonly IStorageService _storageService;

    public StorageController(IStorageService storageService)
    {
        _storageService = storageService;
    }

    [HttpGet]
    [Authorize(Policy = Permissions.StorageManage)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<FileDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<FileDto>>>> GetAll(CancellationToken ct)
    {
        var result = await _storageService.GetAllAsync(ct);
        return Ok(new ApiResponse<IReadOnlyList<FileDto>>(result));
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = Permissions.StorageManage)]
    [ProducesResponseType(typeof(ApiResponse<FileDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<FileDto>>> GetById(Guid id, CancellationToken ct)
    {
        var result = await _storageService.GetByIdAsync(id, ct);
        return Ok(new ApiResponse<FileDto>(result));
    }

    [HttpPost]
    [Authorize(Policy = Permissions.StorageManage)]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ApiResponse<FileDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<FileDto>>> Upload(IFormFile file, CancellationToken ct)
    {
        var result = await _storageService.UploadAsync(file, ct);
        return Created($"api/storage/{result.Id}", new ApiResponse<FileDto>(result));
    }

    [HttpGet("{id:guid}/download")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Download(Guid id, bool inline = false, CancellationToken ct = default)
    {
        var (stream, contentType, fileName) = await _storageService.DownloadAsync(id, ct);

        if (inline)
        {
            Response.Headers.Append("Content-Disposition", $"inline; filename=\"{Uri.EscapeDataString(fileName)}\"; filename*=UTF-8''{Uri.EscapeDataString(fileName)}");
            return File(stream, contentType);
        }

        return File(stream, contentType, fileName);
    }

    [HttpGet("{id:guid}/view")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ViewInline(Guid id, CancellationToken ct)
    {
        var (stream, contentType, fileName) = await _storageService.DownloadAsync(id, ct);
        Response.Headers.Append("Content-Disposition", $"inline; filename=\"{Uri.EscapeDataString(fileName)}\"; filename*=UTF-8''{Uri.EscapeDataString(fileName)}");
        return File(stream, contentType);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Permissions.StorageManage)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id, CancellationToken ct)
    {
        await _storageService.DeleteAsync(id, ct);
        return Ok(new ApiResponse<bool>(true));
    }
}
