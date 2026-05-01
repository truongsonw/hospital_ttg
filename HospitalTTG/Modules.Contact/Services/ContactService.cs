using System.Net.Mail;
using Contracts.Contact.DTOs;
using Contracts.Contact.Enums;
using Contracts.Contact.Interfaces;
using Contracts.Mail.DTOs;
using Contracts.Mail.Interfaces;
using Microsoft.Extensions.Logging;
using Modules.Contact.Repositories;
using Shared.Abstractions.Exceptions;
using Shared.Abstractions.Interfaces;
using Shared.Abstractions.Responses;

namespace Modules.Contact.Services;

public class ContactService : IContactService
{
    private const int ReplySubjectMaxLength = 200;
    private const int ReplyBodyMaxLength = 10000;

    private readonly IContactRepository _contactRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMailSender _mailSender;
    private readonly ILogger<ContactService> _logger;

    public ContactService(
        IContactRepository contactRepository,
        IUnitOfWork unitOfWork,
        IMailSender mailSender,
        ILogger<ContactService> logger)
    {
        _contactRepository = contactRepository;
        _unitOfWork = unitOfWork;
        _mailSender = mailSender;
        _logger = logger;
    }

    public async Task<ContactDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var contact = await _contactRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Entities.Contact), id);

        return MapToDto(contact);
    }

    public async Task<PagedResponse<IReadOnlyList<ContactDto>>> GetPagedAsync(
        ContactStatus? status, string? search, int page, int pageSize, CancellationToken ct = default)
    {
        var (items, total) = await _contactRepository.GetPagedAsync(status, search, page, pageSize, ct);
        var dtos = items.Select(MapToDto).ToList();
        return new PagedResponse<IReadOnlyList<ContactDto>>(dtos, page, pageSize, total);
    }

    public async Task<ContactDto> CreateAsync(CreateContactRequest request, CancellationToken ct = default)
    {
        var contact = new Entities.Contact
        {
            FullName = request.FullName,
            Email = request.Email,
            Subject = request.Subject,
            Content = request.Content
        };

        await _contactRepository.AddAsync(contact, ct);
        await _unitOfWork.SaveChangesAsync(ct);
        await NotifyContactCreatedAsync(contact, ct);

        return MapToDto(contact);
    }

    public async Task<ContactDto> UpdateStatusAsync(Guid id, UpdateContactStatusRequest request, CancellationToken ct = default)
    {
        var contact = await _contactRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Entities.Contact), id);

        contact.Status = request.Status;

        _contactRepository.Update(contact);
        await _unitOfWork.SaveChangesAsync(ct);

        return MapToDto(contact);
    }

    public async Task<ContactDto> ReplyAsync(Guid id, ReplyContactRequest request, CancellationToken ct = default)
    {
        ValidateReplyRequest(request);

        var contact = await _contactRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Entities.Contact), id);

        if (!IsValidEmail(contact.Email))
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                [nameof(contact.Email)] = ["Contact email is invalid."]
            });
        }

        await _mailSender.SendAsync(new SendMailRequest
        {
            To = contact.Email.Trim(),
            ToName = contact.FullName,
            Subject = request.Subject.Trim(),
            Body = request.Body.Trim()
        }, ct);

        contact.Status = ContactStatus.Replied;

        _contactRepository.Update(contact);
        await _unitOfWork.SaveChangesAsync(ct);

        return MapToDto(contact);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var contact = await _contactRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Entities.Contact), id);

        _contactRepository.Delete(contact);
        await _unitOfWork.SaveChangesAsync(ct);
    }

    private static ContactDto MapToDto(Entities.Contact c) => new()
    {
        Id = c.Id,
        FullName = c.FullName,
        Email = c.Email,
        Subject = c.Subject,
        Content = c.Content,
        Status = c.Status,
        CreatedAt = c.CreatedAt
    };

    private static void ValidateReplyRequest(ReplyContactRequest request)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(request.Subject))
            errors[nameof(request.Subject)] = ["Subject is required."];
        else if (request.Subject.Length > ReplySubjectMaxLength)
            errors[nameof(request.Subject)] = [$"Subject must be at most {ReplySubjectMaxLength} characters."];

        if (string.IsNullOrWhiteSpace(request.Body))
            errors[nameof(request.Body)] = ["Body is required."];
        else if (request.Body.Length > ReplyBodyMaxLength)
            errors[nameof(request.Body)] = [$"Body must be at most {ReplyBodyMaxLength} characters."];

        if (errors.Count > 0)
            throw new ValidationException(errors);
    }

    private static bool IsValidEmail(string email)
    {
        try
        {
            var address = new MailAddress(email.Trim());
            return string.Equals(address.Address, email.Trim(), StringComparison.OrdinalIgnoreCase);
        }
        catch
        {
            return false;
        }
    }

    private async Task NotifyContactCreatedAsync(Entities.Contact contact, CancellationToken ct)
    {
        try
        {
            await _mailSender.SendSystemNotificationAsync(
                "Hospital TTG - Có liên hệ mới",
                $"""
                Có liên hệ mới từ website.

                Họ tên: {contact.FullName}
                Email: {contact.Email}
                Chủ đề: {contact.Subject}

                Nội dung:
                {contact.Content}

                Mã liên hệ: {contact.Id}
                Thời gian tạo: {contact.CreatedAt:dd/MM/yyyy HH:mm} UTC
                """,
                ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send contact notification email for contact {ContactId}", contact.Id);
        }
    }
}
