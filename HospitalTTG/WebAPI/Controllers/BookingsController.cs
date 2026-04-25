using Contracts.Booking.DTOs;
using Contracts.Booking.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public BookingsController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<BookingDto>>> GetAll(CancellationToken ct)
    {
        var result = await _bookingService.GetAllAsync(ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<BookingDto>> GetById(Guid id, CancellationToken ct)
    {
        var result = await _bookingService.GetByIdAsync(id, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<BookingDto>> Create(CreateBookingRequest request, CancellationToken ct)
    {
        var result = await _bookingService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _bookingService.DeleteAsync(id, ct);
        return NoContent();
    }
}
