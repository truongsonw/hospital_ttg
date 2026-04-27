using Contracts.Contact.DTOs;
using Contracts.Contact.Enums;
using Contracts.Contact.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Shared.Abstractions.Responses;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactsController : ControllerBase
{
    private readonly IContactService _contactService;

    public ContactsController(IContactService contactService)
    {
        _contactService = contactService;
    }

    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(PagedResponse<IReadOnlyList<ContactDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResponse<IReadOnlyList<ContactDto>>>> GetPaged(
        [FromQuery] ContactStatus? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var result = await _contactService.GetPagedAsync(status, search, page, pageSize, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<ContactDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<ContactDto>>> GetById(Guid id, CancellationToken ct)
    {
        var result = await _contactService.GetByIdAsync(id, ct);
        return Ok(new ApiResponse<ContactDto>(result));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<ContactDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<ContactDto>>> Create(CreateContactRequest request, CancellationToken ct)
    {
        var result = await _contactService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, new ApiResponse<ContactDto>(result));
    }

    [HttpPut("{id:guid}/status")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<ContactDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<ContactDto>>> UpdateStatus(
        Guid id, UpdateContactStatusRequest request, CancellationToken ct)
    {
        var result = await _contactService.UpdateStatusAsync(id, request, ct);
        return Ok(new ApiResponse<ContactDto>(result, "Contact status updated successfully"));
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id, CancellationToken ct)
    {
        await _contactService.DeleteAsync(id, ct);
        return Ok(new ApiResponse<bool>(true, "Contact deleted successfully"));
    }
}
