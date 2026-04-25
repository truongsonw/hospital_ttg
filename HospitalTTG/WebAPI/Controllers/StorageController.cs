using Contracts.Storage.DTOs;
using Contracts.Storage.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.Abstractions.Responses;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StorageController : ControllerBase
{
    private readonly IStorageService _storageService;

    public StorageController(IStorageService storageService)
    {
        _storageService = storageService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<FileDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<FileDto>>>> GetAll(CancellationToken ct)
    {
        var result = await _storageService.GetAllAsync(ct);
        return Ok(new ApiResponse<IReadOnlyList<FileDto>>(result));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<FileDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<FileDto>>> GetById(Guid id, CancellationToken ct)
    {
        var result = await _storageService.GetByIdAsync(id, ct);
        return Ok(new ApiResponse<FileDto>(result));
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ApiResponse<FileDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<FileDto>>> Upload(IFormFile file, CancellationToken ct)
    {
        var result = await _storageService.UploadAsync(file, ct);
        return Created($"api/storage/{result.Id}", new ApiResponse<FileDto>(result));
    }

    [HttpGet("{id:guid}/download")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Download(Guid id, CancellationToken ct)
    {
        var (stream, contentType, fileName) = await _storageService.DownloadAsync(id, ct);
        return File(stream, contentType, fileName);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id, CancellationToken ct)
    {
        await _storageService.DeleteAsync(id, ct);
        return Ok(new ApiResponse<bool>(true));
    }
}
