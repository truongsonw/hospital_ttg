using Modules.Storage.Entities;
using Shared.Abstractions.Interfaces;

namespace Modules.Storage.Repositories;

public interface IStoredFileRepository : IRepository<StoredFile>
{
    Task<StoredFile?> GetByStoredFileNameAsync(string storedFileName, CancellationToken ct = default);
}
