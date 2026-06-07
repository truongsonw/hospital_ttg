using Contracts.Article.DTOs;
using Contracts.Article.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Modules.Auth;
using Shared.Abstractions.Responses;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/content-medias")]
public class ContentMediasController : ControllerBase
{
    private readonly IContentMediaService _service;

    public ContentMediasController(IContentMediaService service)
    {
        _service = service;
    }

    [HttpGet("by-content/{contentId:guid}")]
    public async Task<IActionResult> GetByContentId(Guid contentId, CancellationToken ct)
    {
        var result = await _service.GetByContentIdAsync(contentId, ct);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = Permissions.ArticleMediaManage)]
    public async Task<IActionResult> Create(CreateContentMediaRequest request, CancellationToken ct)
    {
        var result = await _service.CreateAsync(request, ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Permissions.ArticleMediaManage)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, ct);
        return NoContent();
    }
}
