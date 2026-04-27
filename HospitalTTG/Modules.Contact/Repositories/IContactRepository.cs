using Contracts.Contact.Enums;
using Shared.Abstractions.Interfaces;

namespace Modules.Contact.Repositories;

public interface IContactRepository : IRepository<Entities.Contact>
{
    Task<(IReadOnlyList<Entities.Contact> Items, int Total)> GetPagedAsync(
        ContactStatus? status, string? search, int page, int pageSize, CancellationToken ct = default);
}
