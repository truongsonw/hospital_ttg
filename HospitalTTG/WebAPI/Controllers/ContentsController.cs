using Contracts.Article.DTOs;
using Contracts.Article.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Modules.Auth;
using Shared.Abstractions.Responses;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/contents")]
public class ContentsController : ControllerBase
{
    private readonly IContentService _service;

    public ContentsController(IContentService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetPaged(
        [FromQuery] string? type,
        [FromQuery] Guid? categoryId,
        [FromQuery] string? categorySlug,
        [FromQuery] byte? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        if (!string.IsNullOrEmpty(categorySlug))
        {
            var result = await _service.GetPagedAsync(type, categorySlug, status, page, pageSize, ct);
            return Ok(result);
        }
        var resultById = await _service.GetPagedAsync(type, categoryId, status, page, pageSize, ct);
        return Ok(resultById);
    }

    [HttpGet("hot")]
    public async Task<IActionResult> GetHot(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var result = await _service.GetHotAsync(page, pageSize, ct);
        return Ok(result);
    }

    [HttpGet("slug/{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken ct)
    {
        var result = await _service.GetBySlugAsync(slug, ct);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _service.GetByIdAsync(id, ct);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPost("{id:guid}/view")]
    [Authorize(Policy = Permissions.ArticleContentManage)]
    public async Task<IActionResult> IncrementView(Guid id, CancellationToken ct)
    {
        await _service.IncrementViewCountAsync(id, ct);
        return NoContent();
    }

    [HttpPost]
    [Authorize(Policy = Permissions.ArticleContentManage)]
    public async Task<IActionResult> Create(CreateContentRequest request, CancellationToken ct)
    {
        var result = await _service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Permissions.ArticleContentManage)]
    public async Task<IActionResult> Update(Guid id, UpdateContentRequest request, CancellationToken ct)
    {
        var result = await _service.UpdateAsync(id, request, ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Permissions.ArticleContentManage)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, ct);
        return NoContent();
    }
}
