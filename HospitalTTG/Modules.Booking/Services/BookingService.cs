using Contracts.Booking.DTOs;
using Contracts.Booking.Interfaces;
using Modules.Booking.Entities;
using Modules.Booking.Repositories;
using Shared.Abstractions.Exceptions;
using Shared.Abstractions.Interfaces;

namespace Modules.Booking.Services;

public class BookingService : IBookingService
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IUnitOfWork _unitOfWork;

    public BookingService(IBookingRepository bookingRepository, IUnitOfWork unitOfWork)
    {
        _bookingRepository = bookingRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<BookingDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var booking = await _bookingRepository.GetByIdAsync(id, ct);
        if (booking == null)
            throw new NotFoundException(nameof(Entities.Booking), id);

        return MapToDto(booking);
    }

    public async Task<IReadOnlyList<BookingDto>> GetAllAsync(CancellationToken ct = default)
    {
        var bookings = await _bookingRepository.GetAllAsync(ct);
        return bookings.Select(MapToDto).ToList();
    }

    public async Task<BookingDto> CreateAsync(CreateBookingRequest request, CancellationToken ct = default)
    {
        var booking = new Entities.Booking
        {
            FullName = request.FullName,
            PhoneNumber = request.PhoneNumber,
            DateOfBirth = request.DateOfBirth,
            AppointmentDate = request.AppointmentDate,
            Symptoms = request.Symptoms
        };

        await _bookingRepository.AddAsync(booking, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return MapToDto(booking);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var booking = await _bookingRepository.GetByIdAsync(id, ct);
        if (booking == null)
            throw new NotFoundException(nameof(Entities.Booking), id);

        _bookingRepository.Delete(booking);
        await _unitOfWork.SaveChangesAsync(ct);
    }

    private static BookingDto MapToDto(Entities.Booking booking)
    {
        return new BookingDto
        {
            Id = booking.Id,
            FullName = booking.FullName,
            PhoneNumber = booking.PhoneNumber,
            DateOfBirth = booking.DateOfBirth,
            AppointmentDate = booking.AppointmentDate,
            Symptoms = booking.Symptoms,
            Status = booking.Status,
            CreatedAt = booking.CreatedAt
        };
    }
}
