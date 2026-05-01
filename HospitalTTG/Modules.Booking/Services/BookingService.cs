using Contracts.Booking.DTOs;
using Contracts.Booking.Enums;
using Contracts.Booking.Interfaces;
using Contracts.Mail.Interfaces;
using Microsoft.Extensions.Logging;
using Modules.Booking.Repositories;
using Shared.Abstractions.Exceptions;
using Shared.Abstractions.Interfaces;
using Shared.Abstractions.Responses;

namespace Modules.Booking.Services;

public class BookingService : IBookingService
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMailSender _mailSender;
    private readonly ILogger<BookingService> _logger;

    public BookingService(
        IBookingRepository bookingRepository,
        IUnitOfWork unitOfWork,
        IMailSender mailSender,
        ILogger<BookingService> logger)
    {
        _bookingRepository = bookingRepository;
        _unitOfWork = unitOfWork;
        _mailSender = mailSender;
        _logger = logger;
    }

    public async Task<BookingDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var booking = await _bookingRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Entities.Booking), id);

        return MapToDto(booking);
    }

    public async Task<PagedResponse<IReadOnlyList<BookingDto>>> GetPagedAsync(
        BookingStatus? status, string? search, int page, int pageSize, CancellationToken ct = default)
    {
        var (items, total) = await _bookingRepository.GetPagedAsync(status, search, page, pageSize, ct);
        var dtos = items.Select(MapToDto).ToList();
        return new PagedResponse<IReadOnlyList<BookingDto>>(dtos, page, pageSize, total);
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
        await NotifyBookingCreatedAsync(booking, ct);

        return MapToDto(booking);
    }

    public async Task<BookingDto> UpdateStatusAsync(Guid id, UpdateBookingStatusRequest request, CancellationToken ct = default)
    {
        var booking = await _bookingRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Entities.Booking), id);

        booking.Status = request.Status;
        booking.Note = request.Note;

        _bookingRepository.Update(booking);
        await _unitOfWork.SaveChangesAsync(ct);

        return MapToDto(booking);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var booking = await _bookingRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Entities.Booking), id);

        _bookingRepository.Delete(booking);
        await _unitOfWork.SaveChangesAsync(ct);
    }

    private static BookingDto MapToDto(Entities.Booking b) => new()
    {
        Id = b.Id,
        FullName = b.FullName,
        PhoneNumber = b.PhoneNumber,
        DateOfBirth = b.DateOfBirth,
        AppointmentDate = b.AppointmentDate,
        Symptoms = b.Symptoms,
        Status = b.Status,
        Note = b.Note,
        CreatedAt = b.CreatedAt
    };

    private async Task NotifyBookingCreatedAsync(Entities.Booking booking, CancellationToken ct)
    {
        try
        {
            await _mailSender.SendSystemNotificationAsync(
                "Hospital TTG - Có lịch khám mới",
                $"""
                Có lịch khám mới từ website.

                Họ tên: {booking.FullName}
                Số điện thoại: {booking.PhoneNumber}
                Ngày sinh: {booking.DateOfBirth:dd/MM/yyyy}
                Ngày hẹn: {booking.AppointmentDate:dd/MM/yyyy HH:mm}
                Triệu chứng: {booking.Symptoms ?? "(Không có)"}

                Mã booking: {booking.Id}
                Thời gian tạo: {booking.CreatedAt:dd/MM/yyyy HH:mm} UTC
                """,
                ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send booking notification email for booking {BookingId}", booking.Id);
        }
    }
}
