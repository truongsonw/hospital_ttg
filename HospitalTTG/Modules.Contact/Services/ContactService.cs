using Contracts.Contact.DTOs;
using Contracts.Contact.Enums;
using Contracts.Contact.Interfaces;
using Modules.Contact.Repositories;
using Shared.Abstractions.Exceptions;
using Shared.Abstractions.Interfaces;
using Shared.Abstractions.Responses;

namespace Modules.Contact.Services;

public class ContactService : IContactService
{
    private readonly IContactRepository _contactRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ContactService(IContactRepository contactRepository, IUnitOfWork unitOfWork)
    {
        _contactRepository = contactRepository;
        _unitOfWork = unitOfWork;
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
}
