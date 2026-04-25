using Contracts.Contact.DTOs;
using Contracts.Contact.Interfaces;
using Microsoft.AspNetCore.Mvc;

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
    public async Task<ActionResult<IReadOnlyList<ContactDto>>> GetAll(CancellationToken ct)
    {
        var result = await _contactService.GetAllAsync(ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ContactDto>> GetById(Guid id, CancellationToken ct)
    {
        var result = await _contactService.GetByIdAsync(id, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ContactDto>> Create(CreateContactRequest request, CancellationToken ct)
    {
        var result = await _contactService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _contactService.DeleteAsync(id, ct);
        return NoContent();
    }
}
