using Contracts.Contact.DTOs;
using Contracts.Contact.Enums;
using Shared.Abstractions.Responses;

namespace Contracts.Contact.Interfaces;

public interface IContactService
{
    Task<ContactDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<PagedResponse<IReadOnlyList<ContactDto>>> GetPagedAsync(ContactStatus? status, string? search, int page, int pageSize, CancellationToken ct = default);
    Task<ContactDto> CreateAsync(CreateContactRequest request, CancellationToken ct = default);
    Task<ContactDto> UpdateStatusAsync(Guid id, UpdateContactStatusRequest request, CancellationToken ct = default);
    Task<ContactDto> ReplyAsync(Guid id, ReplyContactRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
