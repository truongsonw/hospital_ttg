using Contracts.Contact.DTOs;

namespace Contracts.Contact.Interfaces;

public interface IContactService
{
    Task<ContactDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<ContactDto>> GetAllAsync(CancellationToken ct = default);
    Task<ContactDto> CreateAsync(CreateContactRequest request, CancellationToken ct = default);
    // Task<ContactDto> UpdateStatusAsync(Guid id, ContactStatus status, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
