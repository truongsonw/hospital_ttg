using Microsoft.EntityFrameworkCore;
using Modules.Storage.Entities;
using Shared.Infrastructure.Data;

namespace Modules.Storage.Repositories;

public class StoredFileRepository : BaseRepository<StoredFile>, IStoredFileRepository
{
    public StoredFileRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<StoredFile?> GetByStoredFileNameAsync(string storedFileName, CancellationToken ct = default)
    {
        return await DbSet.FirstOrDefaultAsync(f => f.StoredFileName == storedFileName, ct);
    }
}
