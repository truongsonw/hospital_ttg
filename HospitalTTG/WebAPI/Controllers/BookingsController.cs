using Contracts.Booking.DTOs;
using Contracts.Booking.Enums;
using Contracts.Booking.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Shared.Abstractions.Responses;

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
    [Authorize]
    [ProducesResponseType(typeof(PagedResponse<IReadOnlyList<BookingDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResponse<IReadOnlyList<BookingDto>>>> GetPaged(
        [FromQuery] BookingStatus? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var result = await _bookingService.GetPagedAsync(status, search, page, pageSize, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<BookingDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<BookingDto>>> GetById(Guid id, CancellationToken ct)
    {
        var result = await _bookingService.GetByIdAsync(id, ct);
        return Ok(new ApiResponse<BookingDto>(result));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<BookingDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<BookingDto>>> Create(CreateBookingRequest request, CancellationToken ct)
    {
        var result = await _bookingService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, new ApiResponse<BookingDto>(result));
    }

    [HttpPut("{id:guid}/status")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<BookingDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<BookingDto>>> UpdateStatus(
        Guid id, UpdateBookingStatusRequest request, CancellationToken ct)
    {
        var result = await _bookingService.UpdateStatusAsync(id, request, ct);
        return Ok(new ApiResponse<BookingDto>(result, "Booking status updated successfully"));
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id, CancellationToken ct)
    {
        await _bookingService.DeleteAsync(id, ct);
        return Ok(new ApiResponse<bool>(true, "Booking deleted successfully"));
    }
}
