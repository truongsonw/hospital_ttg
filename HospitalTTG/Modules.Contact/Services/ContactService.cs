using Contracts.Contact.DTOs;
using Contracts.Contact.Interfaces;
using Modules.Contact.Entities;
using Modules.Contact.Repositories;
using Shared.Abstractions.Exceptions;
using Shared.Abstractions.Interfaces;

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
        var contact = await _contactRepository.GetByIdAsync(id, ct);
        if (contact == null)
            throw new NotFoundException(nameof(Entities.Contact), id);

        return MapToDto(contact);
    }

    public async Task<IReadOnlyList<ContactDto>> GetAllAsync(CancellationToken ct = default)
    {
        var contacts = await _contactRepository.GetAllAsync(ct);
        return contacts.Select(MapToDto).ToList();
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

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var contact = await _contactRepository.GetByIdAsync(id, ct);
        if (contact == null)
            throw new NotFoundException(nameof(Entities.Contact), id);

        _contactRepository.Delete(contact);
        await _unitOfWork.SaveChangesAsync(ct);
    }

    private static ContactDto MapToDto(Entities.Contact contact)
    {
        return new ContactDto
        {
            Id = contact.Id,
            FullName = contact.FullName,
            Email = contact.Email,
            Subject = contact.Subject,
            Content = contact.Content,
            Status = contact.Status,
            CreatedAt = contact.CreatedAt
        };
    }
}
